#!/bin/bash

# Script para testar busca de patrimônio via HTTP
# Uso: ./test_patrimonio.sh [ID_PATRIMONIO]

# Configuração
API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"
PATRIMONIO_ID="${1:-68cafa3f80b7ee746b3548c7}"

echo "==================================="
echo "Teste MCP Patrimônio - HTTP Mode"
echo "==================================="
echo ""

# 1. Verificar servidor
echo "1️⃣  Verificando servidor..."
HEALTH=$(curl -s $BASE_URL/health)
if [ $? -eq 0 ]; then
  echo "✅ Servidor está rodando"
  echo "$HEALTH" | jq -C '.'
else
  echo "❌ Servidor não está acessível em $BASE_URL"
  exit 1
fi
echo ""

# 2. Buscar patrimônio por ID
echo "2️⃣  Buscando patrimônio ID: $PATRIMONIO_ID..."
echo ""

# Cria o payload JSON
PAYLOAD=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "neviim_get_patrimonio_por_id",
    "arguments": {
      "id": "$PATRIMONIO_ID"
    }
  }
}
EOF
)

# Faz a requisição
RESPONSE=$(curl -s -X POST $BASE_URL/mcp \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "$PAYLOAD")

echo "📥 Resposta recebida:"
echo ""

# Extrai apenas a linha de dados do SSE
DATA_LINE=$(echo "$RESPONSE" | grep "^data: " | sed 's/^data: //')

if [ -n "$DATA_LINE" ]; then
  # Formata o JSON
  echo "$DATA_LINE" | jq -C '.'

  echo ""
  echo "📋 Dados do patrimônio:"
  echo ""

  # Extrai e exibe o conteúdo do text
  PATRIMONIO_DATA=$(echo "$DATA_LINE" | jq -r '.result.content[0].text' 2>/dev/null)

  if [ -n "$PATRIMONIO_DATA" ] && [ "$PATRIMONIO_DATA" != "null" ]; then
    echo "$PATRIMONIO_DATA" | jq -C '.'
  else
    # Se houver erro, mostra
    ERROR_MSG=$(echo "$DATA_LINE" | jq -r '.result.content[0].text // .error.message' 2>/dev/null)
    echo "⚠️  $ERROR_MSG"
  fi
else
  echo "❌ Nenhuma resposta recebida do servidor"
fi

echo ""
echo "==================================="
echo "✅ Teste concluído!"
echo "==================================="
echo ""
echo "💡 Dicas:"
echo "   - Use um ObjectId válido do MongoDB como parâmetro"
echo "   - Exemplo: ./test_patrimonio.sh 68cafa3f80b7ee746b3548c7"
echo "   - Para listar IDs disponíveis, use: ./test_mcp_simple.sh neviim_get_estatisticas"
echo ""
