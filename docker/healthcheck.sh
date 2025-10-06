#!/bin/sh
# Health check script para Docker container

# Verifica se o processo Node.js está rodando
if ! pgrep -f "node.*index.js" > /dev/null; then
    echo "ERROR: Node.js process not running"
    exit 1
fi

# Verifica uso de memória (opcional - alerta se > 90%)
MEMORY_USAGE=$(awk '/MemAvailable/ {printf "%.0f", 100-($2/1024/1024)}' /proc/meminfo 2>/dev/null || echo "0")
if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo "WARNING: High memory usage: ${MEMORY_USAGE}%"
fi

# Verifica se há erros recentes nos logs (últimos 10 segundos)
# Esta checagem é opcional e pode ser ajustada conforme necessário
ERROR_COUNT=$(grep -c "ERROR" /proc/1/fd/1 2>/dev/null || echo "0")
if [ "$ERROR_COUNT" -gt 10 ]; then
    echo "WARNING: High error count in logs: $ERROR_COUNT"
fi

echo "Health check passed"
exit 0
