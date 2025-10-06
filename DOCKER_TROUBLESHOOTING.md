# Docker Troubleshooting - MCP Patrimônio

Guia de solução de problemas específicos do Docker.

## ❌ Erro: npm ci failed

### Sintoma
```
=> ERROR [builder 6/9] RUN npm ci
npm error The `npm ci` command can only install with an existing package-lock.json
```

### Causa Raiz
O arquivo `package-lock.json` não está sendo copiado para dentro do container Docker.

### Diagnóstico

**1. Verificar se Docker Desktop está rodando:**
```bash
docker info
```

Se mostrar erro, abra o Docker Desktop e aguarde inicializar.

**2. Verificar se package-lock.json existe:**
```bash
ls -la package-lock.json
```

Deve mostrar o arquivo com tamanho ~130KB.

**3. Verificar .dockerignore:**
```bash
grep "package-lock.json" .dockerignore
```

**NÃO deve aparecer nada** (se aparecer, o arquivo está sendo ignorado).

### Soluções

#### Solução 1: Usar Fallback no Dockerfile (Recomendado)

O Dockerfile já foi atualizado com fallback automático:

```dockerfile
RUN npm ci || npm install
```

Se `npm ci` falhar, usa `npm install` automaticamente.

**Execute:**
```bash
docker compose build --no-cache
```

#### Solução 2: Usar Dockerfile Alternativo

Use o Dockerfile que sempre usa `npm install`:

```bash
# Build com Dockerfile alternativo
docker compose -f docker-compose.alternative.yml build

# Ou com docker build direto
docker build -f Dockerfile.alternative -t mcppatrimonio:latest .
```

#### Solução 3: Limpar Cache do Docker

```bash
# Limpar build cache
docker builder prune -a

# Rebuild
docker compose build --no-cache
```

#### Solução 4: Verificar Build Context

Teste se os arquivos estão sendo copiados:

```bash
# Build com debug
docker build --no-cache --progress=plain . 2>&1 | grep "package"
```

Deve mostrar que `package.json` e `package-lock.json` foram copiados.

#### Solução 5: Reconstruir package-lock.json

Se o arquivo estiver corrompido:

```bash
# Backup do atual
cp package-lock.json package-lock.json.bak

# Remover
rm package-lock.json

# Regenerar
npm install

# Verificar
ls -la package-lock.json

# Rebuild Docker
docker compose build --no-cache
```

## ❌ Docker Desktop não está rodando

### Sintoma
```
error during connect: open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified
```

### Solução

**Windows:**
1. Abra o menu Iniciar
2. Procure "Docker Desktop"
3. Clique para abrir
4. Aguarde o ícone na bandeja do sistema ficar verde
5. Tente novamente

**Verificar:**
```bash
docker version
```

Deve mostrar versão do Client e Server.

## ❌ Build muito lento

### Sintoma
Build demora mais de 10 minutos.

### Soluções

**1. Usar cache (não use --no-cache):**
```bash
docker compose build
```

**2. Aumentar recursos do Docker Desktop:**
- Abra Docker Desktop
- Settings → Resources
- Aumentar CPU para 4 cores
- Aumentar RAM para 4GB
- Apply & Restart

**3. Usar BuildKit (mais rápido):**
```bash
# Habilitar BuildKit
export DOCKER_BUILDKIT=1

# Build
docker compose build
```

**4. Limpar recursos antigos:**
```bash
docker system prune -a
```

## ❌ Imagem muito grande

### Sintoma
Imagem com mais de 300MB.

### Diagnóstico
```bash
docker images mcppatrimonio:latest --format "{{.Size}}"
```

Deve ser ~150-200MB.

### Solução

**1. Verificar multi-stage build:**
```bash
grep "FROM.*AS" Dockerfile
```

Deve mostrar 2 linhas (builder e production).

**2. Rebuild sem cache:**
```bash
docker compose build --no-cache
```

**3. Verificar camadas:**
```bash
docker history mcppatrimonio:latest
```

## ❌ Container não inicia

### Sintoma
Container inicia e para imediatamente.

### Diagnóstico

**1. Ver logs:**
```bash
docker compose logs
```

**2. Ver motivo da parada:**
```bash
docker inspect mcppatrimonio-server --format='{{.State.Status}}'
docker inspect mcppatrimonio-server --format='{{.State.Error}}'
```

### Soluções Comuns

**Variáveis de ambiente faltando:**
```bash
# Verificar .env
cat .env

# Deve ter:
# PATRIMONIO_BASE_URL=...
# PATRIMONIO_TOKEN=...
```

**Erro no código:**
```bash
# Testar build local primeiro
npm run build
npm start
```

## ❌ Erro de permissão (Linux)

### Sintoma
```
permission denied while trying to connect to the Docker daemon socket
```

### Solução
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Logout e login novamente
# Ou
newgrp docker

# Verificar
docker ps
```

## ❌ Port already in use

### Sintoma
```
Error starting userland proxy: listen tcp 0.0.0.0:3000: bind: address already in use
```

### Solução

**1. Encontrar processo usando a porta:**
```bash
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000
```

**2. Matar processo:**
```bash
# Windows
taskkill /PID <pid> /F

# Linux/macOS
kill -9 <pid>
```

**3. Ou mudar porta no docker-compose.yml** (se aplicável)

## ❌ Out of disk space

### Sintoma
```
no space left on device
```

### Solução

**1. Limpar imagens não usadas:**
```bash
docker image prune -a
```

**2. Limpar containers parados:**
```bash
docker container prune
```

**3. Limpar tudo:**
```bash
docker system prune -a --volumes
```

**4. Ver uso de espaço:**
```bash
docker system df
```

## ✅ Build Bem-Sucedido

Se o build funcionar, você verá:

```
=> [builder 1/9] FROM docker.io/library/node:22.15.0-alpine
=> [builder 2/9] RUN apk add --no-cache python3 make g++
=> [builder 3/9] WORKDIR /app
=> [builder 4/9] COPY package.json ./
=> [builder 5/9] COPY package-lock.json ./
=> [builder 6/9] COPY tsconfig.json ./
=> [builder 7/9] RUN npm ci || npm install
=> [builder 8/9] COPY src ./src
=> [builder 9/9] RUN npm run build
=> [production 1/3] RUN addgroup -g 1001 -S nodejs
=> [production 2/3] COPY --from=builder /app/node_modules ./node_modules
=> [production 3/3] COPY --from=builder /app/dist ./dist
=> exporting to image
=> => naming to docker.io/library/mcppatrimonio:latest
```

## 📞 Ainda com Problemas?

**1. Coletar informações:**
```bash
docker version
docker info
node --version
ls -la package*.json
cat .dockerignore | head -20
```

**2. Build com debug completo:**
```bash
docker compose build --no-cache --progress=plain > build.log 2>&1
```

**3. Compartilhar:**
- Arquivo `build.log`
- Saída de `docker version`
- Sistema operacional

## 🔧 Comandos Úteis de Debug

```bash
# Ver todos os containers (rodando e parados)
docker ps -a

# Ver todas as imagens
docker images

# Limpar tudo e começar do zero
docker compose down -v
docker system prune -a
docker compose build --no-cache

# Entrar em container rodando
docker exec -it mcppatrimonio-server sh

# Ver logs em tempo real
docker compose logs -f

# Ver uso de recursos
docker stats mcppatrimonio-server

# Inspecionar container
docker inspect mcppatrimonio-server

# Inspecionar imagem
docker inspect mcppatrimonio:latest
```

---

**Documentação de Troubleshooting Docker**

Para guia de build, veja [BUILD.md](BUILD.md)
