# Quick Start - MCP Patrimônio

Comece a usar o MCP Patrimônio em 5 minutos.

## ⚡ Início Rápido

### Pré-requisito
✅ Docker Desktop instalado e **RODANDO**

### 3 Comandos

```bash
# 1. Configure variáveis
cp .env.example .env
# Edite .env com PATRIMONIO_BASE_URL e PATRIMONIO_TOKEN

# 2. Build e inicie
docker compose up -d

# 3. Verifique logs
docker compose logs -f
```

**Pronto!** 🎉

## 🐛 Se Der Erro

### Erro: Docker não está rodando
```
✋ SOLUÇÃO: Abra o Docker Desktop e aguarde inicializar
```

### Erro: npm ci failed ou TS18003
```bash
# SOLUÇÃO JÁ APLICADA: Dockerfile usa --ignore-scripts
# Se ainda der erro, rebuild sem cache:
docker compose build --no-cache

# Ou use o Dockerfile alternativo:
docker compose -f docker-compose.alternative.yml build
docker compose -f docker-compose.alternative.yml up -d
```

### Erro: Qualquer outro
```bash
# Rebuild completo sem cache
docker compose build --no-cache
docker compose up -d
```

## 📚 Documentação Completa

- **Problemas Docker?** → [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
- **Build local?** → [BUILD.md](BUILD.md)
- **Produção?** → [DEPLOY.md](DEPLOY.md)
- **Guia completo?** → [README.md](README.md)

## 🔧 Comandos Úteis

```bash
# Ver status
docker compose ps

# Ver logs
docker compose logs -f

# Parar
docker compose down

# Reiniciar
docker compose restart

# Rebuild
docker compose up -d --build

# Entrar no container
docker exec -it mcppatrimonio-server sh
```

## ⚙️ Integração com Claude Desktop

Edite `claude_desktop_config.json`:

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "Patrimonio": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "C:\\caminho\\completo\\para\\mcppatrimonio\\.env",
        "mcppatrimonio:latest"
      ]
    }
  }
}
```

Substitua `C:\\caminho\\completo\\para\\mcppatrimonio` pelo caminho real.

Reinicie Claude Desktop.

## ✅ Verificar se Está Funcionando

```bash
# 1. Container está rodando?
docker ps | grep mcppatrimonio
# Deve mostrar: mcppatrimonio-server ... Up

# 2. Sem erros nos logs?
docker compose logs | grep ERROR
# Não deve mostrar nada (ou muito pouco)

# 3. Health check OK?
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'
# Deve mostrar: healthy
```

## 🆘 Precisa de Ajuda?

1. Veja [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
2. Veja logs: `docker compose logs`
3. Abra uma issue no GitHub

---

**Quick Start Completo!** 🚀
