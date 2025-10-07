#!/bin/bash

# Script simples para testar o servidor MCP via HTTP
# Uso: ./test_mcp_simple.sh [TOOL_NAME] [ARGUMENTS_JSON]

API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"
TOOL_NAME="${1:-neviim_get_version}"
ARGUMENTS="${2}"

# Se nenhum argumento fornecido, usa objeto vazio
if [ -z "$ARGUMENTS" ]; then
  ARGUMENTS='{}'
fi

echo "======================================="
echo "Teste MCP - Streamable HTTP (Simplificado)"
echo "======================================="
echo ""
echo "🔧 Tool: $TOOL_NAME"
echo "📦 Arguments: $ARGUMENTS"
echo ""

# Cria o JSON usando cat << EOF para evitar problemas de escape
PAYLOAD=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "$TOOL_NAME",
    "arguments": $ARGUMENTS
  }
}
EOF
)

curl -X POST $BASE_URL/mcp \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "$PAYLOAD"

echo ""
echo ""
echo "======================================="
