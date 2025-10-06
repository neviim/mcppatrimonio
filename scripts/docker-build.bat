@echo off
REM Script para build da imagem Docker no Windows

echo.
echo 🐳 MCP Patrimônio - Docker Build Script
echo ========================================
echo.

REM Verificar se Docker está rodando
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Erro: Docker não está rodando!
    echo.
    echo Por favor, inicie o Docker Desktop e tente novamente.
    echo.
    pause
    exit /b 1
)

echo ✅ Docker está rodando
echo.

REM Verificar se .env existe
if not exist .env (
    echo ⚠️  Aviso: Arquivo .env não encontrado
    echo Copiando .env.example para .env...
    copy .env.example .env
    echo ✅ Arquivo .env criado
    echo.
    echo ⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações:
    echo    - PATRIMONIO_BASE_URL
    echo    - PATRIMONIO_TOKEN
    echo.
    pause
)

echo 🔨 Iniciando build da imagem Docker...
echo.

REM Build da imagem
docker compose build --no-cache

if errorlevel 1 (
    echo.
    echo ❌ Erro no build!
    echo.
    echo Verifique os logs acima para mais detalhes.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Build concluído com sucesso!
    echo.
    echo 📦 Imagem criada: mcppatrimonio:latest
    echo.
    echo Próximos passos:
    echo   1. Iniciar container: docker compose up -d
    echo   2. Ver logs: docker compose logs -f
    echo   3. Verificar status: docker compose ps
    echo.
    pause
)
