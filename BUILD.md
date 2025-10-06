# Guia de Build - MCP Patrimônio

Instruções para fazer build do projeto localmente e com Docker.

## 📋 Índice

- [Build Local (Node.js)](#build-local-nodejs)
- [Build Docker](#build-docker)
- [Troubleshooting](#troubleshooting)
- [Verificação](#verificação)

## 🔧 Build Local (Node.js)

### Pré-requisitos

- Node.js 22.15.0 instalado
- npm 10.0.0 ou superior

### Passos

```bash
# 1. Verificar versão do Node.js
node --version
# Deve mostrar: v22.15.0

# 2. Instalar dependências
npm install

# 3. Build do TypeScript
npm run build

# 4. Verificar build
ls dist/
# Deve listar: index.js e todas as pastas compiladas
```

### Scripts Disponíveis

```bash
# Build normal
npm run build

# Build com watch (recompila ao salvar)
npm run build:watch

# Limpar build anterior
npm run clean

# Build completo (clean + build)
npm run prebuild && npm run build

# Type check sem build
npm run typecheck
```

### Verificar Build

```bash
# Executar o servidor compilado
npm start

# Ou diretamente
node dist/index.js
```

## 🐳 Build Docker

### Pré-requisitos

1. **Docker Desktop instalado e rodando**
   - Windows/macOS: Abra Docker Desktop
   - Linux: `sudo systemctl start docker`

2. **Verificar Docker**:
   ```bash
   docker --version
   docker compose version
   ```

### Método 1: Script Automatizado (Recomendado)

**Windows**:
```powershell
.\scripts\docker-build.bat
```

**Linux/macOS**:
```bash
chmod +x scripts/docker-build.sh
./scripts/docker-build.sh
```

### Método 2: Comando Manual

```bash
# 1. Verificar se Docker está rodando
docker info

# 2. Build da imagem
docker compose build

# 3. Ou build sem cache
docker compose build --no-cache
```

### Build com Variações

```bash
# Build apenas (sem iniciar)
docker compose build

# Build e iniciar
docker compose up -d --build

# Build para plataforma específica
docker buildx build --platform linux/amd64 -t mcppatrimonio:latest .

# Build multi-plataforma (AMD64 + ARM64)
docker buildx build --platform linux/amd64,linux/arm64 -t mcppatrimonio:latest .
```

### Verificar Imagem Criada

```bash
# Listar imagens
docker images | grep mcppatrimonio

# Saída esperada:
# mcppatrimonio   latest   abc123def456   2 minutes ago   150MB

# Inspecionar imagem
docker inspect mcppatrimonio:latest

# Ver camadas da imagem
docker history mcppatrimonio:latest
```

## ❌ Troubleshooting

### Erro: "Docker não está rodando"

**Problema**:
```
error during connect: Head "http://...": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**Solução**:
1. Abra Docker Desktop
2. Aguarde até aparecer "Docker Desktop is running"
3. Tente novamente

**Verificar**:
```bash
docker info
```

### Erro: "tsconfig.test.json not found"

**Problema**:
```
failed to compute cache key: "/tsconfig.test.json": not found
```

**Solução**:
Este erro foi corrigido. Se ainda ocorrer:

1. Verifique se o Dockerfile está atualizado:
   ```bash
   git pull
   ```

2. Ou edite `Dockerfile` removendo a linha:
   ```dockerfile
   # REMOVER esta linha se existir:
   COPY tsconfig.test.json ./
   ```

### Erro: "npm ci failed"

**Problema**:
```
ERROR [builder 4/10] RUN npm ci
```

**Solução**:

1. Limpar cache do Docker:
   ```bash
   docker builder prune -a
   ```

2. Build sem cache:
   ```bash
   docker compose build --no-cache
   ```

3. Verificar package-lock.json:
   ```bash
   rm package-lock.json
   npm install
   git add package-lock.json
   git commit -m "fix: atualiza package-lock.json"
   ```

### Erro: "COPY failed"

**Problema**:
```
ERROR [builder 6/10] COPY src ./src
```

**Solução**:

Verifique se a pasta `src/` existe:
```bash
ls -la src/
```

Se não existir, algo está errado com o repositório.

### Erro: "Permission denied"

**Problema** (Linux):
```
permission denied while trying to connect to the Docker daemon socket
```

**Solução**:
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Fazer logout e login novamente
# Ou reiniciar serviço
sudo systemctl restart docker
```

### Build muito lento

**Problema**: Build demora muito tempo

**Solução**:

1. **Usar cache**:
   ```bash
   # Não use --no-cache a menos que necessário
   docker compose build
   ```

2. **Aumentar recursos do Docker**:
   - Docker Desktop → Settings → Resources
   - Aumentar CPU e RAM

3. **Limpar recursos antigos**:
   ```bash
   docker system prune -a
   ```

### Imagem muito grande

**Problema**: Imagem com mais de 300MB

**Solução**:

A imagem deve ter ~150MB. Se estiver maior:

1. Verificar se usa multi-stage build:
   ```bash
   grep "FROM.*AS" Dockerfile
   # Deve mostrar 2 linhas (builder e production)
   ```

2. Rebuild sem cache:
   ```bash
   docker compose build --no-cache
   ```

3. Verificar tamanho:
   ```bash
   docker images mcppatrimonio:latest --format "{{.Size}}"
   ```

## ✅ Verificação

### Verificar Build Local

```bash
# 1. Build existe
test -d dist && echo "✅ Dist existe" || echo "❌ Dist não existe"

# 2. Index.js existe
test -f dist/index.js && echo "✅ index.js existe" || echo "❌ index.js não existe"

# 3. Type check passa
npm run typecheck
echo $?  # Deve ser 0

# 4. Servidor inicia
timeout 5 npm start || echo "✅ Servidor iniciou"
```

### Verificar Build Docker

```bash
# 1. Imagem existe
docker images mcppatrimonio:latest | grep mcppatrimonio && echo "✅ Imagem existe"

# 2. Testar container
docker run --rm -it \
  -e PATRIMONIO_BASE_URL=https://test.com \
  -e PATRIMONIO_TOKEN=test \
  mcppatrimonio:latest node --version

# Deve mostrar: v22.15.0

# 3. Verificar entrypoint
docker run --rm mcppatrimonio:latest node -e "console.log('OK')"
# Deve mostrar: OK

# 4. Health check
docker inspect mcppatrimonio:latest --format='{{.Config.Healthcheck}}'
```

### Checklist Completo

- [ ] Node.js 22.15.0 instalado
- [ ] npm install executado sem erros
- [ ] npm run build executado sem erros
- [ ] dist/ existe e contém index.js
- [ ] npm run typecheck passa
- [ ] Docker Desktop rodando
- [ ] docker compose build executado sem erros
- [ ] Imagem mcppatrimonio:latest existe
- [ ] Tamanho da imagem ~150MB
- [ ] Container inicia sem erros

## 🚀 Próximos Passos

Após build bem-sucedido:

### Build Local
```bash
# Executar em desenvolvimento
npm run dev

# Executar testes
npm test

# Executar em produção
npm start
```

### Build Docker
```bash
# Iniciar container
docker compose up -d

# Ver logs
docker compose logs -f

# Verificar status
docker compose ps

# Parar
docker compose down
```

## 📚 Recursos

- [Documentação Docker](docs/DOCKER.md)
- [Guia de Instalação](docs/INSTALLATION.md)
- [Guia de Deploy](DEPLOY.md)

---

**Build Completo!** 🎉

Seu projeto está compilado e pronto para uso.
