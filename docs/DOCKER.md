# Guia Docker - MCP Patrimônio

Documentação completa para executar o MCP Patrimônio em containers Docker para produção.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Configuração](#configuração)
- [Build da Imagem](#build-da-imagem)
- [Executando o Container](#executando-o-container)
- [Docker Compose](#docker-compose)
- [Monitoramento e Logs](#monitoramento-e-logs)
- [Integração com Claude Desktop](#integração-com-claude-desktop)
- [Troubleshooting](#troubleshooting)
- [Produção](#produção)

## 🎯 Visão Geral

O MCP Patrimônio pode ser executado em containers Docker, oferecendo:

- ✅ **Isolamento**: Ambiente isolado e reproduzível
- ✅ **Portabilidade**: Roda em qualquer sistema com Docker
- ✅ **Escalabilidade**: Fácil deploy em múltiplos ambientes
- ✅ **Segurança**: Execução com usuário não-root
- ✅ **Eficiência**: Imagem otimizada com multi-stage build

### Arquitetura Docker

```
┌─────────────────────────────────────┐
│     Docker Host (Linux/Win/Mac)    │
│  ┌───────────────────────────────┐ │
│  │  Container: mcppatrimonio-server  │ │
│  │  ┌─────────────────────────┐  │ │
│  │  │  Node.js 22.15.0 Alpine │  │ │
│  │  │  MCP Server             │  │ │
│  │  │  Port: stdio            │  │ │
│  │  └─────────────────────────┘  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
         ↕ stdio/network
┌─────────────────────────────────────┐
│      Cliente MCP (Claude)           │
└─────────────────────────────────────┘
```

## 🔧 Pré-requisitos

### Requisitos Mínimos

- **Docker**: >= 20.10.0
- **Docker Compose**: >= 2.0.0 (opcional, mas recomendado)
- **Sistema Operacional**: Linux, macOS, Windows 10+ com WSL2
- **RAM**: 512 MB disponível para o container
- **CPU**: 1 core

### Verificar Instalação

```bash
# Verificar Docker
docker --version
# Saída esperada: Docker version 20.10.x ou superior

# Verificar Docker Compose
docker compose version
# Saída esperada: Docker Compose version v2.x.x

# Testar Docker
docker run hello-world
```

### Instalar Docker

**Linux (Ubuntu/Debian)**:
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

**macOS**:
- Baixe [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)

**Windows**:
- Baixe [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- Habilite WSL2

## ⚡ Instalação Rápida

### Método 1: Docker Compose (Recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/mcppatrimonio.git
cd mcppatrimonio

# 2. Configure variáveis de ambiente
cp .env.example .env
nano .env  # Edite com suas configurações

# 3. Build e inicie
docker compose up -d

# 4. Verifique status
docker compose ps
docker compose logs -f
```

### Método 2: Docker CLI

```bash
# 1. Build da imagem
docker build -t mcppatrimonio:latest .

# 2. Execute o container
docker run -d \
  --name mcppatrimonio-server \
  -e PATRIMONIO_BASE_URL=https://api.example.com \
  -e PATRIMONIO_TOKEN=seu_token_aqui \
  -e NODE_ENV=production \
  -e LOG_LEVEL=info \
  --restart unless-stopped \
  mcppatrimonio:latest

# 3. Verifique logs
docker logs -f mcppatrimonio-server
```

## ⚙️ Configuração

### Variáveis de Ambiente

Crie arquivo `.env` na raiz do projeto:

```env
# Configuração da API (OBRIGATÓRIO)
PATRIMONIO_BASE_URL=https://api.example.com
PATRIMONIO_TOKEN=seu_token_secreto_aqui

# Ambiente (OBRIGATÓRIO)
NODE_ENV=production

# Logging (opcional)
LOG_LEVEL=info

# Rate Limiting (opcional)
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Arquivo docker-compose.yml

O arquivo `docker-compose.yml` já está configurado no projeto:

```yaml
version: '3.8'

services:
  mcppatrimonio:
    build:
      context: .
      dockerfile: Dockerfile
    image: mcppatrimonio:latest
    container_name: mcppatrimonio-server
    restart: unless-stopped

    env_file:
      - .env

    environment:
      NODE_ENV: production

    stdin_open: true
    tty: true

    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
```

## 🏗️ Build da Imagem

### Build Básico

```bash
# Build com tag latest
docker build -t mcppatrimonio:latest .

# Build com tag específica
docker build -t mcppatrimonio:0.2.0 .

# Build com argumentos
docker build \
  --build-arg NODE_VERSION=18 \
  -t mcppatrimonio:latest .
```

### Build Multi-arquitetura

Para suportar ARM64 e AMD64:

```bash
# Criar builder multi-plataforma
docker buildx create --name multiarch --use

# Build para múltiplas arquiteturas
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t mcppatrimonio:latest \
  --push \
  .
```

### Verificar Imagem

```bash
# Listar imagens
docker images | grep mcppatrimonio

# Inspecionar imagem
docker inspect mcppatrimonio:latest

# Verificar tamanho
docker images mcppatrimonio:latest --format "{{.Size}}"
# Esperado: ~150-200MB
```

## 🚀 Executando o Container

### Execução Básica

```bash
# Iniciar container
docker compose up -d

# Ou com Docker CLI
docker run -d \
  --name mcppatrimonio-server \
  --env-file .env \
  --restart unless-stopped \
  mcppatrimonio:latest
```

### Execução em Foreground (Debug)

```bash
# Ver logs em tempo real
docker compose up

# Ou com Docker CLI
docker run -it --rm \
  --name mcppatrimonio-server \
  --env-file .env \
  mcppatrimonio:latest
```

### Execução com Volumes (Logs Persistentes)

```bash
docker run -d \
  --name mcppatrimonio-server \
  --env-file .env \
  -v $(pwd)/logs:/app/logs \
  --restart unless-stopped \
  mcppatrimonio:latest
```

### Comandos de Gerenciamento

```bash
# Iniciar container parado
docker compose start
# ou
docker start mcppatrimonio-server

# Parar container
docker compose stop
# ou
docker stop mcppatrimonio-server

# Reiniciar container
docker compose restart
# ou
docker restart mcppatrimonio-server

# Remover container
docker compose down
# ou
docker rm -f mcppatrimonio-server
```

## 🐳 Docker Compose

### Comandos Principais

```bash
# Build e iniciar serviços
docker compose up -d

# Rebuild forçado
docker compose up -d --build

# Ver logs
docker compose logs -f

# Ver logs de um serviço específico
docker compose logs -f mcppatrimonio

# Ver status dos serviços
docker compose ps

# Parar todos os serviços
docker compose down

# Parar e remover volumes
docker compose down -v
```

### Configurações Avançadas

**docker-compose.override.yml** (para desenvolvimento):

```yaml
version: '3.8'

services:
  mcppatrimonio:
    volumes:
      - ./src:/app/src:ro
    environment:
      NODE_ENV: development
      LOG_LEVEL: debug
```

Uso:
```bash
# Docker Compose usa automaticamente override
docker compose up -d
```

## 📊 Monitoramento e Logs

### Visualizar Logs

```bash
# Logs em tempo real
docker compose logs -f

# Últimas 100 linhas
docker compose logs --tail 100

# Logs com timestamp
docker compose logs -f -t

# Logs desde tempo específico
docker compose logs --since 30m

# Filtrar por nível
docker logs mcppatrimonio-server 2>&1 | grep ERROR
```

### Health Check

```bash
# Verificar status de saúde
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'

# Ver últimos health checks
docker inspect mcppatrimonio-server --format='{{json .State.Health}}' | jq
```

### Estatísticas de Recursos

```bash
# Stats em tempo real
docker stats mcppatrimonio-server

# Stats únicos
docker stats --no-stream mcppatrimonio-server

# Uso de memória
docker exec mcppatrimonio-server sh -c "ps aux | head -n 10"
```

### Executar Comandos no Container

```bash
# Shell interativo
docker exec -it mcppatrimonio-server sh

# Executar comando específico
docker exec mcppatrimonio-server node --version

# Ver variáveis de ambiente
docker exec mcppatrimonio-server env

# Ver processos rodando
docker exec mcppatrimonio-server ps aux
```

## 🔗 Integração com Claude Desktop

### Método 1: Docker com Stdio (Recomendado)

**Configuração do Claude Desktop** (`claude_desktop_config.json`):

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

**Windows**:
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

**macOS/Linux**:
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

### Método 2: Container em Background + Script Wrapper

**1. Iniciar container em background**:
```bash
docker compose up -d
```

**2. Criar script wrapper** (`mcp-docker.sh`):
```bash
#!/bin/bash
docker exec -i mcppatrimonio-server node dist/index.js
```

**3. Configurar Claude Desktop**:
```json
{
  "mcpServers": {
    "Patrimonio": {
      "command": "/caminho/para/mcp-docker.sh"
    }
  }
}
```

## 🐛 Troubleshooting

### Container não inicia

**Problema**: Container para imediatamente após iniciar.

**Solução**:
```bash
# Ver logs de erro
docker logs mcppatrimonio-server

# Verificar variáveis de ambiente
docker inspect mcppatrimonio-server --format='{{.Config.Env}}'

# Testar em foreground
docker compose up
```

### Erro de variáveis de ambiente

**Problema**: `PATRIMONIO_BASE_URL is required`

**Solução**:
```bash
# Verificar se .env existe e está correto
cat .env

# Testar com variáveis diretas
docker run -it --rm \
  -e PATRIMONIO_BASE_URL=https://api.test \
  -e PATRIMONIO_TOKEN=test123 \
  mcppatrimonio:latest
```

### Erro de memória

**Problema**: Container crashando por falta de memória.

**Solução**:
```bash
# Aumentar limite de memória
docker run -d \
  --name mcppatrimonio-server \
  --env-file .env \
  --memory=1g \
  --memory-swap=1g \
  mcppatrimonio:latest
```

### Erro de conectividade com API

**Problema**: Container não consegue acessar API externa.

**Solução**:
```bash
# Testar conectividade DNS
docker exec mcppatrimonio-server ping api.example.com

# Testar com curl
docker exec mcppatrimonio-server curl -v https://api.example.com

# Verificar network
docker network inspect bridge
```

### Imagem muito grande

**Problema**: Imagem Docker > 500MB

**Solução**:
```bash
# Rebuild com otimizações
docker build --no-cache -t mcppatrimonio:latest .

# Remover layers desnecessárias
docker image prune -a
```

### Logs não aparecem

**Problema**: `docker logs` não mostra saída.

**Solução**:
```bash
# Verificar se stdout/stderr estão redirecionados
docker inspect mcppatrimonio-server --format='{{.Config.Tty}}'

# Executar com -t flag
docker run -it --rm --env-file .env mcppatrimonio:latest
```

## 🔐 Produção

### Boas Práticas

1. **Secrets Management**:
```bash
# Use Docker secrets em vez de variáveis de ambiente
echo "meu_token_secreto" | docker secret create patrimonio_token -

docker service create \
  --name mcppatrimonio \
  --secret patrimonio_token \
  mcppatrimonio:latest
```

2. **Health Checks**:
```yaml
healthcheck:
  test: ["CMD", "node", "-e", "process.exit(0)"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 5s
```

3. **Resource Limits**:
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

4. **Logging**:
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

5. **Security**:
```bash
# Executar com usuário não-root (já configurado no Dockerfile)
# Scan de vulnerabilidades
docker scan mcppatrimonio:latest

# Usar registry privado
docker tag mcppatrimonio:latest registry.example.com/mcppatrimonio:latest
docker push registry.example.com/mcppatrimonio:latest
```

### Deploy em Produção

**Docker Swarm**:
```bash
# Inicializar swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml mcppatrimonio

# Ver services
docker service ls

# Escalar
docker service scale mcppatrimonio_mcppatrimonio=3
```

**Kubernetes**:
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcppatrimonio
spec:
  replicas: 2
  selector:
    matchLabels:
      app: mcppatrimonio
  template:
    metadata:
      labels:
        app: mcppatrimonio
    spec:
      containers:
      - name: mcppatrimonio
        image: mcppatrimonio:latest
        env:
        - name: PATRIMONIO_BASE_URL
          valueFrom:
            secretKeyRef:
              name: mcppatrimonio-secrets
              key: base-url
        - name: PATRIMONIO_TOKEN
          valueFrom:
            secretKeyRef:
              name: mcppatrimonio-secrets
              key: token
        resources:
          limits:
            cpu: "1"
            memory: "512Mi"
          requests:
            cpu: "500m"
            memory: "256Mi"
```

### Backup e Restore

```bash
# Backup da imagem
docker save mcppatrimonio:latest | gzip > mcppatrimonio-backup.tar.gz

# Restore da imagem
docker load < mcppatrimonio-backup.tar.gz

# Backup de volumes (se houver)
docker run --rm -v mcppatrimonio-data:/data -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz /data
```

### Monitoramento em Produção

**Prometheus + Grafana**:
```yaml
# docker-compose.yml
services:
  mcppatrimonio:
    # ... configuração existente ...

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### CI/CD

**GitHub Actions** (`.github/workflows/docker.yml`):
```yaml
name: Docker Build and Push

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t mcppatrimonio:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push mcppatrimonio:${{ github.sha }}
```

## 📚 Comandos Úteis Resumidos

```bash
# Build e execução
docker compose up -d --build

# Ver logs
docker compose logs -f

# Status
docker compose ps

# Parar
docker compose down

# Rebuild completo
docker compose down && docker compose up -d --build

# Limpar tudo
docker compose down -v
docker system prune -a

# Health check
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'

# Stats
docker stats mcppatrimonio-server --no-stream

# Shell no container
docker exec -it mcppatrimonio-server sh
```

---

**Documentação Docker Completa**

Para instalação local, veja [INSTALLATION.md](INSTALLATION.md)
Para referência de API, veja [API.md](API.md)
