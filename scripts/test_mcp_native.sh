#!/bin/bash

# Script para testar o endpoint MCP nativo
# Uso: ./test_mcp_native.sh [ID_PATRIMONIO]

API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"
PATRIMONIO_ID="${1:-3577}"

echo "======================================="
echo "Teste MCP Nativo - Streamable HTTP"
echo "======================================="
echo ""

# Testar busca de patrimônio
echo "🔍 Buscando patrimônio ID: $PATRIMONIO_ID"
echo ""

curl -X POST $BASE_URL/mcp \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"tools/call\",
    \"params\": {
      \"name\": \"neviim_get_patrimonio_por_id\",
      \"arguments\": {
        \"id\": \"$PATRIMONIO_ID\"
      }
    }
  }"

echo ""
echo ""
echo "======================================="
