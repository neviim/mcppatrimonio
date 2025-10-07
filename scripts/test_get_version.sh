#!/bin/bash

# Script para testar get_version via HTTP (não requer parâmetros)

API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"

echo "======================================="
echo "Teste - Get Version (sem parâmetros)"
echo "======================================="
echo ""

curl -X POST $BASE_URL/mcp \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "neviim_get_version",
      "arguments": {}
    }
  }'

echo ""
echo ""
echo "======================================="
