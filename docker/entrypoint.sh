#!/bin/sh
# Entrypoint script para container Docker

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "${GREEN}Starting MCP Neviim Server...${NC}"

# Validar variáveis de ambiente obrigatórias
if [ -z "$PATRIMONIO_BASE_URL" ]; then
    echo "${RED}ERROR: PATRIMONIO_BASE_URL not set${NC}"
    exit 1
fi

if [ -z "$PATRIMONIO_TOKEN" ]; then
    echo "${RED}ERROR: PATRIMONIO_TOKEN not set${NC}"
    exit 1
fi

# Validar formato da URL
if ! echo "$PATRIMONIO_BASE_URL" | grep -qE '^https?://'; then
    echo "${RED}ERROR: PATRIMONIO_BASE_URL must start with http:// or https://${NC}"
    exit 1
fi

# Exibir configuração (sem revelar token)
echo "${GREEN}Configuration:${NC}"
echo "  Base URL: $PATRIMONIO_BASE_URL"
echo "  Token: ${PATRIMONIO_TOKEN:0:10}... (hidden)"
echo "  Node Env: ${NODE_ENV:-production}"
echo "  Log Level: ${LOG_LEVEL:-info}"

# Verificar conectividade com a API (opcional)
if command -v curl > /dev/null 2>&1; then
    echo "${YELLOW}Testing API connectivity...${NC}"
    if curl -s -f -m 5 -o /dev/null "$PATRIMONIO_BASE_URL/version" 2>/dev/null; then
        echo "${GREEN}✓ API is reachable${NC}"
    else
        echo "${YELLOW}⚠ Warning: Could not reach API (server will try anyway)${NC}"
    fi
fi

# Executar o comando passado (por padrão: node dist/index.js)
echo "${GREEN}Starting server...${NC}"
exec "$@"
