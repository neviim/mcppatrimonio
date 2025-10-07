#!/bin/bash

# Script completo para testar todos os recursos do MCP Patrimônio
# Uso: ./scripts/test_all_features.sh

# Configuração
API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="${MCP_BASE_URL:-http://localhost:3000}"

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Contador de testes
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para fazer requisição MCP
call_mcp_tool() {
  local tool_name=$1
  local arguments=$2

  PAYLOAD=$(cat <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "$tool_name",
    "arguments": $arguments
  }
}
EOF
)

  curl -s -X POST $BASE_URL/mcp \
    -H "Authorization: Bearer $API_KEY" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    -d "$PAYLOAD" | grep "^data: " | sed 's/^data: //'
}

# Função para verificar se retornou sucesso
check_result() {
  local response=$1
  local test_name=$2

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  if echo "$response" | jq -e '.result' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} $test_name"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}✗${NC} $test_name"
    ERROR=$(echo "$response" | jq -r '.error.message // "Unknown error"')
    echo -e "  ${YELLOW}Erro:${NC} $ERROR"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Função para exibir dados extraídos
show_data() {
  local response=$1
  local data=$(echo "$response" | jq -r '.result.content[0].text' 2>/dev/null)
  if [ -n "$data" ] && [ "$data" != "null" ]; then
    echo "$data" | jq -C '.' 2>/dev/null || echo "$data"
  fi
}

# Banner
echo ""
echo "=========================================="
echo "  Teste Completo - MCP Patrimônio Server"
echo "=========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ==========================================
# 1. HEALTH CHECK
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}1. HEALTH CHECK${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

HEALTH=$(curl -s $BASE_URL/health)
if [ $? -eq 0 ] && echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null 2>&1; then
  echo -e "${GREEN}✓${NC} Servidor está rodando"
  echo "$HEALTH" | jq -C '.'
else
  echo -e "${RED}✗${NC} Servidor não está acessível"
  exit 1
fi
echo ""

# ==========================================
# 2. SERVER INFO
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}2. SERVER INFO${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

INFO=$(curl -s $BASE_URL/info)
echo "$INFO" | jq -C '.'
echo ""

# ==========================================
# 3. INFO TOOL
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}3. TOOL: info${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(call_mcp_tool "info" "{}")
check_result "$RESPONSE" "info - Informações do servidor MCP"
show_data "$RESPONSE"
echo ""

# ==========================================
# 4. GET VERSION
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}4. TOOL: neviim_get_version${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(call_mcp_tool "neviim_get_version" "{}")
check_result "$RESPONSE" "neviim_get_version - Versão da API"
show_data "$RESPONSE"
echo ""

# ==========================================
# 5. GET ESTATÍSTICAS
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}5. TOOL: neviim_get_estatisticas${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(call_mcp_tool "neviim_get_estatisticas" "{}")
if check_result "$RESPONSE" "neviim_get_estatisticas - Estatísticas do sistema"; then
  DATA=$(show_data "$RESPONSE")
  echo "$DATA"

  # Extrai alguns dados para usar em testes futuros
  TOTAL_PATRIMONIOS=$(echo "$DATA" | jq -r '.total_patrimonios' 2>/dev/null)
  PRIMEIRO_SETOR=$(echo "$DATA" | jq -r '.setores.detalhes[0].setor' 2>/dev/null)

  echo ""
  echo -e "${YELLOW}📊 Resumo:${NC}"
  echo "  - Total de patrimônios: $TOTAL_PATRIMONIOS"
  echo "  - Primeiro setor: $PRIMEIRO_SETOR"
fi
echo ""

# ==========================================
# 6. GET PATRIMONIO POR NUMERO
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}6. TOOL: neviim_get_patrimonio${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(call_mcp_tool "neviim_get_patrimonio" '{"numero":"3577"}')
if check_result "$RESPONSE" "neviim_get_patrimonio - Buscar por número 3577"; then
  show_data "$RESPONSE"
fi
echo ""

# ==========================================
# 7. GET PATRIMONIO POR ID
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}7. TOOL: neviim_get_patrimonio_por_id${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

OBJECTID="68cafa3f80b7ee746b3548c7"
RESPONSE=$(call_mcp_tool "neviim_get_patrimonio_por_id" "{\"id\":\"$OBJECTID\"}")
if check_result "$RESPONSE" "neviim_get_patrimonio_por_id - Buscar por ObjectId"; then
  show_data "$RESPONSE"
fi
echo ""

# ==========================================
# 8. GET PATRIMONIOS POR SETOR
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}8. TOOL: neviim_get_patrimonios_por_setor${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ -n "$PRIMEIRO_SETOR" ] && [ "$PRIMEIRO_SETOR" != "null" ]; then
  RESPONSE=$(call_mcp_tool "neviim_get_patrimonios_por_setor" "{\"setor\":\"$PRIMEIRO_SETOR\"}")
  if check_result "$RESPONSE" "neviim_get_patrimonios_por_setor - Buscar setor: $PRIMEIRO_SETOR"; then
    DATA=$(show_data "$RESPONSE")
    echo "$DATA" | jq -C '. | length' 2>/dev/null | xargs -I {} echo -e "${YELLOW}Total encontrado:${NC} {} patrimônios"
    echo "$DATA" | jq -C '.[0:3]' 2>/dev/null  # Mostra apenas os 3 primeiros
  fi
else
  echo -e "${YELLOW}⚠${NC}  Teste pulado - setor não disponível"
fi
echo ""

# ==========================================
# 9. GET PATRIMONIOS POR USUARIO
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}9. TOOL: neviim_get_patrimonios_por_usuario${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(call_mcp_tool "neviim_get_patrimonios_por_usuario" '{"usuario":"phelena"}')
if check_result "$RESPONSE" "neviim_get_patrimonios_por_usuario - Buscar usuário: phelena"; then
  DATA=$(show_data "$RESPONSE")
  echo "$DATA" | jq -C '. | length' 2>/dev/null | xargs -I {} echo -e "${YELLOW}Total encontrado:${NC} {} patrimônios"
  echo "$DATA" | jq -C '.[0:2]' 2>/dev/null  # Mostra apenas os 2 primeiros
fi
echo ""

# ==========================================
# 10. CREATE PATRIMONIO (Teste - não persiste)
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}10. TOOL: neviim_create_patrimonio${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

NEW_PATRIMONIO=$(cat <<'EOF'
{
  "Patrimonio": "TEST-9999",
  "Setor": "TI AIPF",
  "Usuario": "teste",
  "Nome": "Teste Automatizado",
  "Gestor": "Gestor Teste",
  "Local": "AIPF",
  "Tipo de equipamento": "Notebook",
  "Locacao": "Sala Teste"
}
EOF
)

RESPONSE=$(call_mcp_tool "neviim_create_patrimonio" "{\"data\":$NEW_PATRIMONIO}")
if check_result "$RESPONSE" "neviim_create_patrimonio - Criar patrimônio de teste"; then
  show_data "$RESPONSE"
  echo -e "${YELLOW}⚠ Nota:${NC} Patrimônio de teste criado (pode ser removido posteriormente)"
fi
echo ""

# ==========================================
# 11. UPDATE PATRIMONIO (Teste)
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}11. TOOL: neviim_update_patrimonio${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

UPDATE_DATA=$(cat <<'EOF'
{
  "Observações": "Atualizado via teste automatizado"
}
EOF
)

RESPONSE=$(call_mcp_tool "neviim_update_patrimonio" "{\"id\":\"$OBJECTID\",\"data\":$UPDATE_DATA}")
check_result "$RESPONSE" "neviim_update_patrimonio - Atualizar patrimônio"
if [ $? -eq 0 ]; then
  show_data "$RESPONSE"
  echo -e "${YELLOW}⚠ Nota:${NC} Patrimônio atualizado (reversão pode ser necessária)"
fi
echo ""

# ==========================================
# RESUMO FINAL
# ==========================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 RESUMO DOS TESTES${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Total de testes: $TOTAL_TESTS"
echo -e "  ${GREEN}Passou: $PASSED_TESTS${NC}"
echo -e "  ${RED}Falhou: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "${GREEN}✓ Todos os testes passaram com sucesso!${NC}"
  EXIT_CODE=0
else
  echo -e "${RED}✗ Alguns testes falharam. Verifique os erros acima.${NC}"
  EXIT_CODE=1
fi

echo ""
echo "=========================================="
echo "  Teste finalizado"
echo "=========================================="
echo ""

exit $EXIT_CODE
