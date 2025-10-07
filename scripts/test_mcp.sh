  #!/bin/bash

  API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
  BASE_URL="http://localhost:3000"

  echo "1. Verificando servidor..."
  curl -s $BASE_URL/health | jq

  echo -e "\n2. Listando sessões ativas..."
  SESSIONS=$(curl -s $BASE_URL/mcp/sessions \
    -H "Authorization: Bearer $API_KEY")
  echo $SESSIONS | jq .

  echo -e "\n3. Criando nova sessão em background..."
  curl -X POST $BASE_URL/mcp/session \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    --no-buffer &

  SESSION_PID=$!
  sleep 2

  echo -e "\n4. Obtendo session ID..."
  SESSION_ID=$(curl -s $BASE_URL/mcp/sessions \
    -H "Authorization: Bearer $API_KEY" | jq -r '.sessions[0].sessionId')

  echo "Session ID: $SESSION_ID"

  echo -e "\n5. Buscando patrimônio 3577..."
  curl -X POST $BASE_URL/mcp/message/$SESSION_ID \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
      "jsonrpc": "2.0",
      "id": 1,
      "method": "tools/call",
      "params": {
        "name": "neviim_get_patrimonio_por_id",
        "arguments": {
          "id": "3577"
        }
      }
    }' | jq .

  sleep 1

  echo -e "\n6. Fechando sessão..."
  curl -X DELETE $BASE_URL/mcp/session/$SESSION_ID \
    -H "Authorization: Bearer $API_KEY" | jq .

  kill $SESSION_PID 2>/dev/null