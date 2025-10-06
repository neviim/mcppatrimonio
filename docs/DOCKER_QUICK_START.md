# Docker Quick Start - MCP Patrimônio

Guia rápido para executar o MCP Patrimônio em Docker em 5 minutos.

## ⚠️ Pré-requisitos

1. **Docker instalado e rodando**
   ```bash
   docker --version
   # Deve mostrar: Docker version 20.10.x ou superior
   ```

2. **Docker Desktop rodando** (Windows/Mac)
   - Abra Docker Desktop e aguarde inicializar completamente

3. **Variáveis de ambiente configuradas**
   - Você precisará do `PATRIMONIO_BASE_URL` e `PATRIMONIO_TOKEN`

## 🚀 Início Rápido (3 comandos)

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env e configure PATRIMONIO_BASE_URL e PATRIMONIO_TOKEN

# 2. Build e execute
docker compose up -d

# 3. Verifique os logs
docker compose logs -f
```

**Pronto!** O servidor está rodando em Docker.

## 📝 Passo a Passo Detalhado

### 1. Clone o Projeto (se ainda não fez)

```bash
git clone <url-do-repositorio>
cd mcppatrimonio
```

### 2. Configure Variáveis de Ambiente

**Windows (PowerShell)**:
```powershell
Copy-Item .env.example .env
notepad .env
```

**macOS/Linux**:
```bash
cp .env.example .env
nano .env
```

**Edite o arquivo `.env`**:
```env
PATRIMONIO_BASE_URL=https://api.example.com  # Sua URL da API
PATRIMONIO_TOKEN=seu_token_secreto_aqui      # Seu token
NODE_ENV=production
LOG_LEVEL=info
```

### 3. Build da Imagem Docker

```bash
docker compose build
```

**Saída esperada**:
```
[+] Building 45.2s (16/16) FINISHED
 => [internal] load build definition from Dockerfile
 => [internal] load .dockerignore
 => [builder 1/6] FROM docker.io/library/node:18-alpine
 => [builder 2/6] RUN apk add --no-cache python3 make g++
 => [builder 3/6] COPY package*.json ./
 => [builder 4/6] RUN npm ci
 => [builder 5/6] COPY src ./src
 => [builder 6/6] RUN npm run build
 => [production 1/3] RUN addgroup -g 1001 -S nodejs
 => [production 2/3] COPY --from=builder /app/node_modules ./node_modules
 => [production 3/3] COPY --from=builder /app/dist ./dist
 => exporting to image
 => => naming to docker.io/library/mcppatrimonio:latest
```

### 4. Iniciar o Container

```bash
docker compose up -d
```

**Saída esperada**:
```
[+] Running 2/2
 ✔ Network mcppatrimonio-network    Created
 ✔ Container mcppatrimonio-server   Started
```

### 5. Verificar Status

```bash
docker compose ps
```

**Saída esperada**:
```
NAME                 IMAGE               STATUS              PORTS
mcppatrimonio-server     mcppatrimonio:latest    Up 10 seconds
```

### 6. Ver Logs

```bash
docker compose logs -f
```

**Saída esperada**:
```
mcppatrimonio-server  | Starting MCP Patrimônio Server...
mcppatrimonio-server  | Configuration:
mcppatrimonio-server  |   Base URL: https://api.example.com
mcppatrimonio-server  |   Token: seu_token... (hidden)
mcppatrimonio-server  |   Node Env: production
mcppatrimonio-server  |   Log Level: info
mcppatrimonio-server  | Starting server...
mcppatrimonio-server  | [INFO] Starting Patrimonio MCP Server...
mcppatrimonio-server  | [INFO] Environment: production
mcppatrimonio-server  | [INFO] Registered 9 tools
mcppatrimonio-server  | [INFO] Patrimonio MCP Server is running
```

## ✅ Verificações

### Health Check

```bash
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'
```

**Deve retornar**: `healthy`

### Uso de Recursos

```bash
docker stats mcppatrimonio-server --no-stream
```

**Exemplo de saída**:
```
CONTAINER          CPU %     MEM USAGE / LIMIT     MEM %     NET I/O
mcppatrimonio-server   0.02%     45.5MiB / 512MiB      8.89%     0B / 0B
```

### Logs de Erro

```bash
docker compose logs | grep ERROR
```

**Não deve ter saída** (ou muito pouca)

## 🔧 Comandos Úteis

### Parar o Container

```bash
docker compose stop
```

### Reiniciar o Container

```bash
docker compose restart
```

### Ver Logs Específicos

```bash
# Últimas 100 linhas
docker compose logs --tail 100

# Logs desde 10 minutos atrás
docker compose logs --since 10m

# Apenas erros
docker compose logs | grep -i error
```

### Entrar no Container

```bash
docker exec -it mcppatrimonio-server sh
```

### Remover Tudo

```bash
# Parar e remover container
docker compose down

# Remover também a imagem
docker compose down --rmi all

# Remover tudo (incluindo volumes)
docker compose down -v --rmi all
```

## 🔌 Integração com Claude Desktop

### Método 1: Container On-Demand (Recomendado)

Edite `claude_desktop_config.json`:

**Windows** (`%APPDATA%\Claude\claude_desktop_config.json`):
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

**macOS/Linux** (`~/Library/Application Support/Claude/claude_desktop_config.json`):
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
        "/home/usuario/mcppatrimonio/.env",
        "mcppatrimonio:latest"
      ]
    }
  }
}
```

### Método 2: Container Persistente

1. **Inicie o container**:
   ```bash
   docker compose up -d
   ```

2. **Crie script wrapper** (`mcp-docker.sh` ou `mcp-docker.bat`):

   **Windows** (`mcp-docker.bat`):
   ```batch
   @echo off
   docker exec -i mcppatrimonio-server node dist/index.js
   ```

   **macOS/Linux** (`mcp-docker.sh`):
   ```bash
   #!/bin/bash
   docker exec -i mcppatrimonio-server node dist/index.js
   ```

   Torne executável (macOS/Linux):
   ```bash
   chmod +x mcp-docker.sh
   ```

3. **Configure Claude Desktop**:
   ```json
   {
     "mcpServers": {
       "Patrimonio": {
         "command": "C:\\caminho\\para\\mcp-docker.bat"
       }
     }
   }
   ```

4. **Reinicie Claude Desktop**

5. **Teste**:
   Abra Claude e pergunte:
   ```
   Use a ferramenta neviim_info para mostrar informações do servidor
   ```

## ❌ Solução de Problemas

### Docker não está rodando

**Erro**:
```
Cannot connect to the Docker daemon
```

**Solução**:
- Windows/Mac: Abra Docker Desktop e aguarde inicializar
- Linux: `sudo systemctl start docker`

### Container não inicia

**Erro**: Container para imediatamente

**Solução**:
```bash
# Ver logs de erro
docker compose logs

# Verificar variáveis
docker compose config

# Testar em foreground
docker compose up
```

### Erro de variável de ambiente

**Erro**: `PATRIMONIO_BASE_URL is required`

**Solução**:
```bash
# Verificar .env
cat .env

# Testar variáveis diretamente
docker run -it --rm \
  -e PATRIMONIO_BASE_URL=https://api.test \
  -e PATRIMONIO_TOKEN=test \
  mcppatrimonio:latest
```

### Porta já em uso

**Erro**: `port is already allocated`

**Solução**:
```bash
# Listar containers rodando
docker ps

# Parar container conflitante
docker stop <container_id>
```

### Imagem não encontrada

**Erro**: `image mcppatrimonio:latest not found`

**Solução**:
```bash
# Build da imagem
docker compose build
```

### Erro de permissão

**Erro**: `permission denied`

**Solução (Linux)**:
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
```

### Claude não encontra o servidor

**Problema**: Claude Desktop não lista o servidor MCP

**Solução**:
1. Verifique se a imagem foi construída:
   ```bash
   docker images | grep mcppatrimonio
   ```

2. Teste o comando manualmente:
   ```bash
   docker run -i --rm --env-file .env mcppatrimonio:latest
   ```

3. Verifique o caminho do `.env` no config do Claude

4. Reinicie Claude Desktop completamente

5. Verifique logs do Claude:
   - Windows: `%APPDATA%\Claude\logs\`
   - macOS: `~/Library/Logs/Claude/`

## 📊 Monitoramento

### Ver uso de recursos em tempo real

```bash
docker stats mcppatrimonio-server
```

### Configurar alertas (exemplo com script)

```bash
#!/bin/bash
# monitor.sh

while true; do
  MEM=$(docker stats mcppatrimonio-server --no-stream --format "{{.MemPerc}}" | sed 's/%//')
  if (( $(echo "$MEM > 90" | bc -l) )); then
    echo "⚠️  ALERTA: Uso de memória alto: ${MEM}%"
    # Enviar notificação (email, slack, etc)
  fi
  sleep 60
done
```

### Logs estruturados

```bash
# JSON logs
docker logs mcppatrimonio-server --since 1h -f | jq '.'

# Filtrar por nível
docker logs mcppatrimonio-server | grep '\[INFO\]'
docker logs mcppatrimonio-server | grep '\[ERROR\]'
```

## 🔄 Atualização

### Atualizar para nova versão

```bash
# 1. Parar container
docker compose down

# 2. Atualizar código (git pull, etc)
git pull

# 3. Rebuild
docker compose build

# 4. Reiniciar
docker compose up -d

# 5. Verificar
docker compose logs -f
```

### Backup antes de atualizar

```bash
# Backup da imagem atual
docker save mcppatrimonio:latest | gzip > backup-$(date +%Y%m%d).tar.gz

# Backup do .env
cp .env .env.backup
```

## 📚 Próximos Passos

- ✅ Configurado e rodando em Docker
- 📖 Leia a [documentação completa do Docker](DOCKER.md)
- 🔒 Configure secrets para produção
- 📊 Configure monitoramento avançado
- 🚀 Deploy em Kubernetes (se necessário)

## 🆘 Precisa de Ajuda?

- [Documentação Docker Completa](DOCKER.md)
- [Troubleshooting Geral](INSTALLATION.md#troubleshooting)
- [Abrir Issue no GitHub](https://github.com/seu-usuario/mcppatrimonio/issues)

---

**Quick Start Completo!** 🎉

Seu servidor MCP Patrimônio está rodando em Docker.
