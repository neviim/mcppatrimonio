from flask import Flask, request, Response
import requests

# --- Configuração Local e Remota ---

# Configuração LOCAL (onde este proxy irá rodar)
LOCAL_HOST = '0.0.0.0'  # Ouve em todas as interfaces de rede (ou use 'localhost')
LOCAL_PORT = 5000       # Porta que você usará para acessar o proxy

# Configuração REMOTA (o servidor de destino)
MCP_URL = "http://10.10.0.22:3000/mcp/session"
BEARER_TOKEN = "e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"

# --- Lógica do Proxy ---

app = Flask(__name__)

# Esta rota "catch-all" captura qualquer requisição feita ao proxy
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])
def proxy_request(path):
    """
    Recebe a requisição original, a encaminha para o MCP_URL
    e retorna a resposta do servidor remoto.
    """
    # 1. Monta a URL de destino completa
    remote_url = f"{MCP_URL}/{path}"

    # 2. Prepara os cabeçalhos (headers) para a requisição remota
    headers = {key: value for key, value in request.headers}
    headers['Authorization'] = f'Bearer {BEARER_TOKEN}'
    
    # O cabeçalho 'Host' deve ser o do servidor remoto
    headers['Host'] = '10.10.0.22'

    print(f"[*] Redirecionando: {request.method} {path} -> {remote_url}")

    try:
        # 3. Faz a requisição para o servidor remoto
        resp = requests.request(
            method=request.method,
            url=remote_url,
            headers=headers,
            data=request.get_data(),
            params=request.args,
            stream=True,  # Importante para lidar com grandes respostas
            timeout=30    # Timeout de 30 segundos
        )

        # 4. Retorna a resposta do servidor remoto para o cliente original
        # Cria uma resposta Flask, copiando o conteúdo, status e headers da resposta remota.
        response = Response(
            resp.iter_content(chunk_size=1024),
            status=resp.status_code,
            content_type=resp.headers.get('Content-Type')
        )
        
        # Copia outros headers importantes da resposta
        for key, value in resp.headers.items():
            if key.lower() not in ['content-encoding', 'transfer-encoding', 'connection']:
                response.headers[key] = value

        return response

    except requests.exceptions.RequestException as e:
        print(f"[!] Erro ao conectar ao servidor remoto: {e}")
        return "Erro de Gateway do Proxy", 502


if __name__ == '__main__':
    print(f"[*] Iniciando proxy local em http://{LOCAL_HOST}:{LOCAL_PORT}")
    print(f"[*] Redirecionando para: {MCP_URL}")
    app.run(host=LOCAL_HOST, port=LOCAL_PORT)