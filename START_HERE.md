# 🚀 START HERE - MCP Patrimônio

## ⚡ Execução Imediata (3 Passos)

### ✅ Passo 1: Abrir Docker Desktop
**IMPORTANTE**: Docker Desktop precisa estar RODANDO!

- Windows: Abra o Docker Desktop e aguarde o ícone ficar verde
- Verifique: `docker version` deve mostrar versão do Client e Server

### ✅ Passo 2: Configurar Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas credenciais
notepad .env  # Windows
# ou
nano .env     # Linux/macOS
```

**Configure**:
```env
PATRIMONIO_BASE_URL=https://sua-api.com
PATRIMONIO_TOKEN=seu_token_secreto
```

### ✅ Passo 3: Build e Execute

```bash
docker compose build
docker compose up -d
```

**Pronto!** 🎉 Servidor rodando.

---

## 🔍 Verificar se Está Funcionando

```bash
# 1. Container rodando?
docker ps | grep mcppatrimonio

# 2. Logs OK?
docker compose logs -f

# 3. Health check?
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'
# Deve mostrar: healthy
```

---

## 🐛 Se Der Erro

### "Docker não está rodando"
```
✋ Abra o Docker Desktop e aguarde inicializar
```

### "npm ci failed" ou "TS18003"
```bash
# JÁ CORRIGIDO! Mas se ainda der erro:
docker compose build --no-cache
```

### Qualquer outro erro
```bash
# Veja a solução completa
cat SOLUTION_SUMMARY.md

# Ou troubleshooting
cat DOCKER_TROUBLESHOOTING.md
```

---

## 📚 Documentação

- **Primeiro uso?** → [QUICK_START.md](QUICK_START.md)
- **Problemas?** → [DOCKER_TROUBLESHOOTING.md](DOCKER_TROUBLESHOOTING.md)
- **Entender build?** → [BUILD.md](BUILD.md)
- **Detalhes técnicos?** → [SOLUTION_SUMMARY.md](SOLUTION_SUMMARY.md)
- **Visão geral?** → [README.md](README.md)

---

## ⚙️ Integração com Claude Desktop

Após build bem-sucedido, integre com Claude:

**1. Localize o arquivo de config:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

**2. Adicione:**
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
        "C:\\Users\\SeuUsuario\\mcppatrimonio\\.env",
        "mcppatrimonio:latest"
      ]
    }
  }
}
```

**3. Substitua** `C:\\Users\\SeuUsuario\\mcppatrimonio` pelo caminho real.

**4. Reinicie** Claude Desktop.

**5. Teste:**
```
Use a ferramenta neviim_info para mostrar informações do servidor
```

---

## 🎯 Comandos Úteis

```bash
# Ver status
docker compose ps

# Ver logs em tempo real
docker compose logs -f

# Parar servidor
docker compose down

# Reiniciar
docker compose restart

# Rebuild
docker compose up -d --build

# Entrar no container
docker exec -it mcppatrimonio-server sh

# Ver versão do Node.js no container
docker exec mcppatrimonio-server node --version
```

---

## ✅ Checklist

- [ ] Docker Desktop instalado e rodando
- [ ] `.env` configurado com URL e TOKEN
- [ ] `docker compose build` executado sem erros
- [ ] Container rodando (`docker ps`)
- [ ] Logs sem erros (`docker compose logs`)
- [ ] Health check "healthy"
- [ ] Claude Desktop configurado (opcional)

---

**Tudo configurado!** 🚀

Próximo passo: [Explorar a documentação completa](README.md)
