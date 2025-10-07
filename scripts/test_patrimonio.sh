#!/bin/bash

# Script para testar busca de patrimônio via HTTP
# Uso: ./test_patrimonio.sh [ID_PATRIMONIO]

# Configuração
API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"
PATRIMONIO_ID="${1:-3577}"

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

# 2. Listar sessões ativas
echo "2️⃣  Verificando sessões ativas..."
SESSIONS=$(curl -s $BASE_URL/mcp/sessions \
  -H "Authorization: Bearer $API_KEY")
echo "$SESSIONS" | jq -C '.'
echo ""

# 3. Criar nova sessão em background
echo "3️⃣  Criando nova sessão MCP..."
curl -N -X POST $BASE_URL/mcp/session \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" 2>/dev/null | while IFS= read -r line; do
    echo "📡 $line"
done &

SESSION_PID=$!
sleep 3

# 4. Obter session ID
echo ""
echo "4️⃣  Obtendo ID da sessão..."
SESSION_ID=$(curl -s $BASE_URL/mcp/sessions \
  -H "Authorization: Bearer $API_KEY" | jq -r '.sessions[0].sessionId')

if [ -z "$SESSION_ID" ] || [ "$SESSION_ID" = "null" ]; then
  echo "❌ Não foi possível obter o session ID"
  kill $SESSION_PID 2>/dev/null
  exit 1
fi

echo "✅ Session ID: $SESSION_ID"
echo ""

# 5. Buscar patrimônio
echo "5️⃣  Buscando patrimônio ID: $PATRIMONIO_ID..."
RESPONSE=$(curl -s -X POST $BASE_URL/mcp/message/$SESSION_ID \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
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
  }")

echo "📤 Mensagem enviada:"
echo "$RESPONSE" | jq -C '.'
echo ""

# Aguardar resposta no stream
echo "⏳ Aguardando resposta no stream (5 segundos)..."
sleep 5
echo ""

# 6. Fechar sessão
echo "6️⃣  Fechando sessão..."
CLOSE_RESPONSE=$(curl -s -X DELETE $BASE_URL/mcp/session/$SESSION_ID \
  -H "Authorization: Bearer $API_KEY")
echo "$CLOSE_RESPONSE" | jq -C '.'

# Matar processo do stream
kill $SESSION_PID 2>/dev/null

echo ""
echo "==================================="
echo "✅ Teste concluído!"
echo "==================================="
echo ""
echo "💡 Dica: A resposta do patrimônio aparece no stream da sessão (item 3️⃣)"
echo ""
