#!/bin/bash
# Script para build da imagem Docker

set -e

echo "🐳 MCP Patrimônio - Docker Build Script"
echo "========================================"
echo ""

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Erro: Docker não está rodando!"
    echo ""
    echo "Por favor, inicie o Docker Desktop e tente novamente."
    echo ""
    echo "Windows: Abra Docker Desktop"
    echo "Linux: sudo systemctl start docker"
    echo "macOS: Abra Docker Desktop"
    exit 1
fi

echo "✅ Docker está rodando"
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "⚠️  Aviso: Arquivo .env não encontrado"
    echo "Copiando .env.example para .env..."
    cp .env.example .env
    echo "✅ Arquivo .env criado"
    echo ""
    echo "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações:"
    echo "   - PATRIMONIO_BASE_URL"
    echo "   - PATRIMONIO_TOKEN"
    echo ""
    read -p "Pressione ENTER para continuar após editar .env..."
fi

echo "🔨 Iniciando build da imagem Docker..."
echo ""

# Build da imagem
docker compose build --no-cache

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build concluído com sucesso!"
    echo ""
    echo "📦 Imagem criada: mcppatrimonio:latest"
    echo ""
    echo "Próximos passos:"
    echo "  1. Iniciar container: docker compose up -d"
    echo "  2. Ver logs: docker compose logs -f"
    echo "  3. Verificar status: docker compose ps"
    echo ""
else
    echo ""
    echo "❌ Erro no build!"
    echo ""
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
