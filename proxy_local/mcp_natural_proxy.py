from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
import re
import logging

app = FastAPI(title="MCP Proxy com Suporte a Linguagem Natural")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração do MCP
MCP_URL = "http://10.10.0.22:3000/mcp/session"
BEARER_TOKEN = "e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"

# Configurar logging
logging.basicConfig(level=logging.INFO)

class Intent:
    def __init__(self, method: str, params: dict):
        self.method = method
        self.params = params

def parse_natural_query(query: str) -> Intent:
    """
    Converte perguntas em intenções estruturadas.
    Você pode expandir isso conforme os métodos do seu MCP.
    """
    query = query.strip().lower()

    # Exemplo 1: "patrimônio 123", "id 456", "qual o patrimônio com id 789?"
    id_match = re.search(r'\b(?:id|patrimônio|código)\s*(?:[:\-]?\s*)?(\d+)', query)
    if id_match:
        return Intent("patrimonio.buscarPorId", {"id": int(id_match.group(1))})

    # Exemplo 2: "listar todos os patrimônios"
    if any(word in query for word in ["listar", "todos", "tudo", "mostrar tudo"]):
        return Intent("patrimonio.listar", {})

    # Exemplo 3: "patrimônio computador", "equipamento laboratório"
    term_match = re.search(r'\b(patrimônio|item|equipamento|bem)\s+(.+)', query)
    if term_match:
        term = term_match.group(2).strip()
        if term and len(term) > 2:
            return Intent("patrimonio.buscarPorTermo", {"termo": term})

    # Se não reconhecer, usar um método genérico (ou falhar)
    raise ValueError("Não foi possível entender a intenção da pergunta. Tente algo como: 'patrimônio 123' ou 'listar patrimônios'.")

@app.post("/ask")
async def ask_mcp(query: str):
    """
    Endpoint para perguntas em linguagem natural.
    Exemplo de uso:
      POST /ask
      Body: "Qual o patrimônio com ID 123?"
    """
    try:
        intent = parse_natural_query(query)
        logging.info(f"Intenção detectada: {intent.method} com params {intent.params}")

        async with httpx.AsyncClient(timeout=30.0) as client:
            mcp_response = await client.post(
                MCP_URL,
                json={
                    "jsonrpc": "2.0",
                    "method": intent.method,
                    "params": intent.params,
                    "id": "qwen-natural-proxy-1"
                },
                headers={
                    "Authorization": f"Bearer {BEARER_TOKEN}",
                    "Content-Type": "application/json"
                }
            )
            mcp_response.raise_for_status()
            data = mcp_response.json()

            if "result" in data:
                result = data["result"]
                # Aqui você pode formatar melhor a resposta para o usuário
                return {
                    "success": True,
                    "answer": format_answer(result, intent.method, intent.params)
                }
            elif "error" in data:
                error_msg = data["error"].get("message", "Erro desconhecido do servidor MCP")
                return {"success": False, "answer": f"Erro no sistema de patrimônio: {error_msg}"}
            else:
                return {"success": False, "answer": "Resposta inesperada do servidor MCP."}

    except ValueError as ve:
        return {"success": False, "answer": str(ve)}
    except Exception as e:
        logging.error(f"Erro no proxy: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

def format_answer(result, method: str, params: dict) -> str:
    """Formata a resposta do MCP em texto amigável."""
    if method == "patrimonio.buscarPorId":
        if not result:
            return f"Patrimônio com ID {params['id']} não encontrado."
        nome = result.get("nome", "Sem nome")
        descricao = result.get("descricao", "Sem descrição")
        local = result.get("local", "Local não informado")
        return f"Patrimônio ID {params['id']}: {nome}. {descricao}. Local: {local}."

    elif method == "patrimonio.listar":
        if not result or not isinstance(result, list):
            return "Nenhum patrimônio encontrado."
        count = len(result)
        exemplos = ", ".join([f"{item.get('id', '?')} - {item.get('nome', 'Sem nome')}" for item in result[:3]])
        return f"Encontrados {count} patrimônios. Exemplos: {exemplos}."

    elif method == "patrimonio.buscarPorTermo":
        if not result or not isinstance(result, list):
            return f"Nenhum patrimônio encontrado com o termo '{params['termo']}'."
        count = len(result)
        exemplos = ", ".join([f"{item.get('id', '?')} - {item.get('nome', 'Sem nome')}" for item in result[:3]])
        return f"Encontrados {count} patrimônios com o termo '{params['termo']}'. Exemplos: {exemplos}."

    else:
        return str(result)