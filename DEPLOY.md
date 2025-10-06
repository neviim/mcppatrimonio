# Guia de Deploy em Produção - MCP Patrimônio

Guia completo para deploy do MCP Patrimônio em ambiente de produção.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos de Produção](#pré-requisitos-de-produção)
- [Deploy com Docker](#deploy-com-docker)
- [Deploy com Docker Swarm](#deploy-com-docker-swarm)
- [Deploy com Kubernetes](#deploy-com-kubernetes)
- [Configuração de Segurança](#configuração-de-segurança)
- [Monitoramento](#monitoramento)
- [Backup e Recuperação](#backup-e-recuperação)
- [CI/CD](#cicd)

## 🎯 Visão Geral

Este guia cobre deploy em diferentes ambientes de produção:

- ✅ **Docker Standalone**: Para servidores únicos
- ✅ **Docker Swarm**: Para clusters pequenos/médios
- ✅ **Kubernetes**: Para clusters grandes e alta disponibilidade
- ✅ **VM Tradicional**: Deploy direto no sistema operacional

## 📦 Pré-requisitos de Produção

### Infraestrutura

- **CPU**: 2+ cores recomendado
- **RAM**: 1GB+ disponível
- **Disco**: 10GB+ livre
- **Rede**: Acesso à API de patrimônio
- **DNS**: (Opcional) Domínio configurado

### Software

- **Node.js**: 22.15.0 (para deploy local)
- **Docker**: 20.10+
- **Docker Compose**: 2.0+ (se usar)
- **Git**: Para deploy via CI/CD
- **Certbot**: Se usar HTTPS (opcional)

### Credenciais

- Token de autenticação da API
- Acesso SSH ao servidor (se remoto)
- Credenciais de registry Docker (se usar privado)

## 🐳 Deploy com Docker

### Opção 1: Docker Compose (Recomendado)

**1. Preparar Servidor**

```bash
# Conectar ao servidor
ssh usuario@servidor.exemplo.com

# Criar diretório
mkdir -p /opt/mcppatrimonio
cd /opt/mcppatrimonio

# Clonar repositório (ou copiar arquivos)
git clone https://github.com/seu-usuario/mcppatrimonio.git .
```

**2. Configurar Ambiente**

```bash
# Copiar e editar .env
cp .env.example .env
nano .env
```

**Configuração `.env` para produção**:
```env
# API Configuration
PATRIMONIO_BASE_URL=https://api.producao.com
PATRIMONIO_TOKEN=token_producao_secreto

# Environment
NODE_ENV=production

# Logging
LOG_LEVEL=warn  # Use warn ou error em produção

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

**3. Deploy**

```bash
# Build da imagem
docker compose build

# Iniciar em produção
docker compose up -d

# Verificar status
docker compose ps
docker compose logs -f
```

**4. Configurar Auto-start**

```bash
# Criar serviço systemd
sudo nano /etc/systemd/system/mcppatrimonio.service
```

```ini
[Unit]
Description=MCP Patrimônio Docker Container
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/mcppatrimonio
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
# Habilitar serviço
sudo systemctl enable mcppatrimonio
sudo systemctl start mcppatrimonio

# Verificar status
sudo systemctl status mcppatrimonio
```

### Opção 2: Docker CLI

```bash
# Build
docker build -t mcppatrimonio:latest .

# Run com restart policy
docker run -d \
  --name mcppatrimonio-server \
  --restart unless-stopped \
  --env-file /opt/mcppatrimonio/.env \
  --memory="512m" \
  --cpus="1.0" \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  mcppatrimonio:latest
```

## 🐝 Deploy com Docker Swarm

Para clusters de múltiplos servidores.

### 1. Inicializar Swarm

**No servidor manager**:
```bash
docker swarm init --advertise-addr 192.168.1.10
```

**Nos workers**:
```bash
# Use o comando fornecido pelo init
docker swarm join --token <token> 192.168.1.10:2377
```

### 2. Criar Stack File

**docker-stack.yml**:
```yaml
version: '3.8'

services:
  mcppatrimonio:
    image: mcppatrimonio:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        max_attempts: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    environment:
      NODE_ENV: production
      LOG_LEVEL: warn
    secrets:
      - patrimonio_token
    networks:
      - mcppatrimonio-network

secrets:
  patrimonio_token:
    external: true

networks:
  mcppatrimonio-network:
    driver: overlay
```

### 3. Deploy Stack

```bash
# Criar secret
echo "seu_token_secreto" | docker secret create patrimonio_token -

# Deploy stack
docker stack deploy -c docker-stack.yml mcppatrimonio

# Verificar services
docker service ls
docker service ps mcppatrimonio_mcppatrimonio

# Ver logs
docker service logs -f mcppatrimonio_mcppatrimonio
```

### 4. Escalar

```bash
# Escalar para 5 réplicas
docker service scale mcppatrimonio_mcppatrimonio=5

# Ver distribuição
docker service ps mcppatrimonio_mcppatrimonio
```

## ☸️ Deploy com Kubernetes

Para ambientes corporativos e alta disponibilidade.

### 1. Criar Namespace

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: mcppatrimonio
```

```bash
kubectl apply -f namespace.yaml
```

### 2. Criar Secrets

```bash
# Criar secret com token
kubectl create secret generic mcppatrimonio-secrets \
  --from-literal=base-url=https://api.producao.com \
  --from-literal=token=seu_token_secreto \
  -n mcppatrimonio
```

### 3. Criar ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: mcppatrimonio-config
  namespace: mcppatrimonio
data:
  NODE_ENV: "production"
  LOG_LEVEL: "warn"
  RATE_LIMIT_WINDOW_MS: "60000"
  RATE_LIMIT_MAX_REQUESTS: "100"
```

```bash
kubectl apply -f configmap.yaml
```

### 4. Criar Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mcppatrimonio
  namespace: mcppatrimonio
  labels:
    app: mcppatrimonio
spec:
  replicas: 3
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
        imagePullPolicy: Always
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
        envFrom:
        - configMapRef:
            name: mcppatrimonio-config
        resources:
          limits:
            cpu: "1000m"
            memory: "512Mi"
          requests:
            cpu: "500m"
            memory: "256Mi"
        livenessProbe:
          exec:
            command:
            - node
            - -e
            - "process.exit(0)"
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          exec:
            command:
            - node
            - -e
            - "process.exit(0)"
          initialDelaySeconds: 5
          periodSeconds: 10
```

```bash
kubectl apply -f deployment.yaml
```

### 5. Criar HorizontalPodAutoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: mcppatrimonio-hpa
  namespace: mcppatrimonio
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: mcppatrimonio
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

```bash
kubectl apply -f hpa.yaml
```

### 6. Verificar Deploy

```bash
# Ver pods
kubectl get pods -n mcppatrimonio

# Ver logs
kubectl logs -f deployment/mcppatrimonio -n mcppatrimonio

# Ver eventos
kubectl get events -n mcppatrimonio --sort-by='.lastTimestamp'

# Describir deployment
kubectl describe deployment mcppatrimonio -n mcppatrimonio
```

## 🔐 Configuração de Segurança

### 1. Secrets Management

**Docker Secrets**:
```bash
# Criar secrets
echo "token_secreto" | docker secret create patrimonio_token -

# Usar no service
docker service create \
  --secret patrimonio_token \
  --env PATRIMONIO_TOKEN_FILE=/run/secrets/patrimonio_token \
  mcppatrimonio:latest
```

**Vault (HashiCorp)**:
```bash
# Armazenar secret no Vault
vault kv put secret/mcppatrimonio \
  token=seu_token_secreto \
  base_url=https://api.producao.com

# Usar no deployment
vault agent -config=vault-agent.hcl
```

### 2. Network Security

**Firewall**:
```bash
# Permitir apenas tráfego necessário
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 2377/tcp  # Docker Swarm
sudo ufw allow 7946/tcp  # Docker Swarm
sudo ufw enable
```

**Docker Network Isolation**:
```yaml
networks:
  mcppatrimonio-network:
    driver: overlay
    internal: true  # Sem acesso externo direto
```

### 3. HTTPS/TLS

**Nginx Reverse Proxy com Let's Encrypt**:
```nginx
# /etc/nginx/sites-available/mcppatrimonio
server {
    listen 443 ssl http2;
    server_name mcp.exemplo.com;

    ssl_certificate /etc/letsencrypt/live/mcp.exemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mcp.exemplo.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 4. Scanning de Vulnerabilidades

```bash
# Scan da imagem Docker
docker scan mcppatrimonio:latest

# Trivy
trivy image mcppatrimonio:latest

# Anchore
anchore-cli image add mcppatrimonio:latest
anchore-cli image vuln mcppatrimonio:latest all
```

## 📊 Monitoramento

### 1. Prometheus + Grafana

**docker-compose-monitoring.yml**:
```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - monitoring

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    networks:
      - monitoring

volumes:
  prometheus-data:
  grafana-data:

networks:
  monitoring:
```

**prometheus.yml**:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'mcppatrimonio'
    static_configs:
      - targets: ['mcppatrimonio-server:8080']

  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 2. Logs Centralizados (ELK Stack)

```yaml
# docker-compose-elk.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    ports:
      - "5601:5601"
```

### 3. Alertas

**Alertmanager**:
```yaml
# alertmanager.yml
route:
  receiver: 'email'

receivers:
  - name: 'email'
    email_configs:
      - to: 'admin@exemplo.com'
        from: 'alertas@exemplo.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alertas@exemplo.com'
        auth_password: 'senha'
```

## 💾 Backup e Recuperação

### 1. Backup Automático

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backup/mcppatrimonio"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup da imagem Docker
docker save mcppatrimonio:latest | gzip > "$BACKUP_DIR/mcppatrimonio-$DATE.tar.gz"

# Backup do .env
cp /opt/mcppatrimonio/.env "$BACKUP_DIR/env-$DATE.backup"

# Backup de volumes (se houver)
docker run --rm \
  -v mcppatrimonio-data:/data \
  -v $BACKUP_DIR:/backup \
  alpine tar czf /backup/volumes-$DATE.tar.gz /data

# Limpar backups antigos (manter últimos 7 dias)
find "$BACKUP_DIR" -type f -mtime +7 -delete

echo "Backup concluído: $DATE"
```

**Agendar com cron**:
```bash
# Editar crontab
crontab -e

# Executar backup diariamente às 2h da manhã
0 2 * * * /opt/mcppatrimonio/backup.sh >> /var/log/mcppatrimonio-backup.log 2>&1
```

### 2. Recuperação

```bash
# Restaurar imagem
docker load < mcppatrimonio-20231006_020000.tar.gz

# Restaurar .env
cp env-20231006_020000.backup /opt/mcppatrimonio/.env

# Restaurar volumes
docker run --rm \
  -v mcppatrimonio-data:/data \
  -v /backup:/backup \
  alpine sh -c "cd / && tar xzf /backup/volumes-20231006_020000.tar.gz"

# Reiniciar serviço
docker compose up -d
```

## 🚀 CI/CD

### GitHub Actions

**.github/workflows/deploy.yml**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: |
            mcppatrimonio:latest
            mcppatrimonio:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /opt/mcppatrimonio
            docker compose pull
            docker compose up -d
            docker image prune -f
```

### GitLab CI

**.gitlab-ci.yml**:
```yaml
stages:
  - build
  - deploy

build:
  stage: build
  script:
    - docker build -t mcppatrimonio:$CI_COMMIT_SHA .
    - docker tag mcppatrimonio:$CI_COMMIT_SHA mcppatrimonio:latest
    - docker push mcppatrimonio:$CI_COMMIT_SHA
    - docker push mcppatrimonio:latest

deploy:
  stage: deploy
  script:
    - ssh user@server "cd /opt/mcppatrimonio && docker compose pull && docker compose up -d"
  only:
    - main
```

## 📋 Checklist de Deploy

- [ ] Servidor preparado e acessível
- [ ] Docker instalado e configurado
- [ ] Variáveis de ambiente configuradas em `.env`
- [ ] Token de API válido e testado
- [ ] Firewall configurado
- [ ] Imagem Docker construída
- [ ] Container iniciado e rodando
- [ ] Health checks passando
- [ ] Logs sendo gerados corretamente
- [ ] Monitoramento configurado
- [ ] Alertas configurados
- [ ] Backup automático agendado
- [ ] Documentação atualizada
- [ ] Equipe notificada

## 🔍 Validação Pós-Deploy

```bash
# 1. Verificar container rodando
docker ps | grep mcppatrimonio

# 2. Verificar health
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'

# 3. Verificar logs
docker logs --tail 100 mcppatrimonio-server

# 4. Verificar recursos
docker stats mcppatrimonio-server --no-stream

# 5. Teste funcional (se possível)
# Testar com cliente MCP

# 6. Verificar alertas
# Checar Prometheus/Grafana

# 7. Documentar versão deployada
echo "$(date) - Deploy v$(docker inspect mcppatrimonio:latest --format='{{.Config.Labels.version}}')" >> /var/log/mcppatrimonio-deploys.log
```

## 📞 Suporte em Produção

### Logs de Produção

```bash
# Logs em tempo real
docker compose logs -f --tail 100

# Filtrar por nível
docker logs mcppatrimonio-server | grep '\[ERROR\]'

# Exportar logs
docker logs mcppatrimonio-server > logs-$(date +%Y%m%d).txt
```

### Troubleshooting Produção

Veja [docs/DOCKER.md#troubleshooting](docs/DOCKER.md#troubleshooting) para problemas comuns.

---

**Deploy em Produção Completo!** 🚀

O servidor MCP Patrimônio está pronto para uso em ambiente de produção.
