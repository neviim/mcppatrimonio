# Acesso Remoto ao MCP Patrimônio

Este documento descreve como configurar e usar o servidor MCP Patrimônio via conexões remotas seguras usando o transporte **Streamable HTTP**.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Segurança](#segurança)
- [Uso](#uso)
- [Endpoints da API](#endpoints-da-api)
- [Exemplos](#exemplos)
- [Troubleshooting](#troubleshooting)

## 🎯 Visão Geral

O servidor MCP Patrimônio suporta dois modos de transporte:

1. **STDIO** (padrão): Comunicação via stdin/stdout - ideal para uso local
2. **HTTP** (remoto): Comunicação via HTTP com streaming - ideal para acesso remoto

O modo HTTP utiliza o protocolo **Streamable HTTP** do MCP, que permite conexões bidirecionais seguras via HTTP com suporte a streaming de mensagens.

## ⚙️ Configuração

### Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```bash
# Modo de transporte: "stdio" ou "http"
TRANSPORT_MODE=http

# Configurações do servidor HTTP
HTTP_HOST=0.0.0.0
HTTP_PORT=3000

# Segurança: API Keys (separadas por vírgula)
API_KEYS=your-secret-key-1,your-secret-key-2

# CORS
ENABLE_CORS=true
CORS_ORIGINS=https://example.com,https://app.example.com
```

### Gerando API Keys Seguras

Use um dos métodos abaixo para gerar API keys fortes:

```bash
# Usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Usando OpenSSL
openssl rand -hex 32

# Usando uuidgen (multiple times)
uuidv4
```

### Exemplo de `.env` Completo

```bash
# API do Sistema de Patrimônio
PATRIMONIO_BASE_URL=https://api.patrimonio.example.com
PATRIMONIO_TOKEN=your-patrimonio-api-token

# Ambiente
NODE_ENV=production
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# Transporte HTTP
TRANSPORT_MODE=http
HTTP_HOST=0.0.0.0
HTTP_PORT=3000
API_KEYS=e5f5c9a8b7d6e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8
ENABLE_CORS=true
CORS_ORIGINS=*
```

## 🔒 Segurança

### Autenticação

Todas as requisições aos endpoints MCP devem incluir um header `Authorization`:

```
Authorization: Bearer <sua-api-key>
```

### Recomendações de Segurança

1. **Use HTTPS em produção**: Configure um proxy reverso (nginx/traefik) com SSL/TLS
2. **API Keys fortes**: Use keys com no mínimo 32 caracteres aleatórios
3. **Restrinja CORS**: Em produção, especifique domínios explícitos no `CORS_ORIGINS`
4. **Rate Limiting**: Configure limites apropriados para sua carga esperada
5. **Firewall**: Restrinja acesso à porta HTTP apenas de IPs confiáveis
6. **Rotação de Keys**: Implemente rotação periódica das API keys

### Exemplo de Configuração Nginx com SSL

```nginx
server {
    listen 443 ssl http2;
    server_name mcp.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Importante para streaming
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }
}
```

## 🚀 Uso

### Iniciar em Modo HTTP

#### Docker Compose

```bash
# Configure .env com TRANSPORT_MODE=http
docker compose up -d

# Verifique os logs
docker compose logs -f mcppatrimonio
```

#### Local

```bash
# Configure .env com TRANSPORT_MODE=http
npm run build
npm start
```

### Verificar Status

```bash
curl http://localhost:3000/health
```

## 📡 Endpoints da API

### Públicos (sem autenticação)

#### GET /health
Verifica o status do servidor.

```bash
curl http://localhost:3000/health
```

Resposta:
```json
{
  "status": "ok",
  "service": "MCP Patrimonio Server",
  "timestamp": "2025-10-07T12:00:00.000Z",
  "transport": "streamable-http"
}
```

#### GET /info
Obtém informações sobre o servidor.

```bash
curl http://localhost:3000/info
```

### Protegidos (requer autenticação)

#### POST /mcp/session
Cria uma nova sessão MCP e estabelece conexão streaming.

```bash
curl -X POST http://localhost:3000/mcp/session \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json"
```

#### POST /mcp/message/:sessionId
Envia uma mensagem JSON-RPC para uma sessão existente.

```bash
curl -X POST http://localhost:3000/mcp/message/session-id-here \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_patrimonio",
      "arguments": {}
    }
  }'
```

#### GET /mcp/sessions
Lista todas as sessões ativas.

```bash
curl http://localhost:3000/mcp/sessions \
  -H "Authorization: Bearer your-api-key"
```

#### DELETE /mcp/session/:sessionId
Fecha uma sessão específica.

```bash
curl -X DELETE http://localhost:3000/mcp/session/session-id-here \
  -H "Authorization: Bearer your-api-key"
```

## 💡 Exemplos

### Exemplo em Python

```python
import requests
import json

API_KEY = "your-api-key"
BASE_URL = "http://localhost:3000"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# Criar sessão
response = requests.post(f"{BASE_URL}/mcp/session", headers=headers)
print(f"Session created: {response.status_code}")

# Listar sessões
response = requests.get(f"{BASE_URL}/mcp/sessions", headers=headers)
sessions = response.json()
print(f"Active sessions: {sessions['count']}")
```

### Exemplo em Node.js

```javascript
const axios = require('axios');

const API_KEY = 'your-api-key';
const BASE_URL = 'http://localhost:3000';

const headers = {
  'Authorization': `Bearer ${API_KEY}`,
  'Content-Type': 'application/json'
};

// Criar sessão
async function createSession() {
  const response = await axios.post(
    `${BASE_URL}/mcp/session`,
    {},
    { headers }
  );
  console.log('Session created:', response.status);
}

// Listar sessões
async function listSessions() {
  const response = await axios.get(
    `${BASE_URL}/mcp/sessions`,
    { headers }
  );
  console.log('Active sessions:', response.data.count);
}

createSession();
listSessions();
```

### Exemplo com cURL - Workflow Completo

```bash
# 1. Verificar saúde do servidor
curl http://localhost:3000/health

# 2. Criar sessão (captura o response para pegar session ID)
SESSION_RESPONSE=$(curl -X POST http://localhost:3000/mcp/session \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json")

# 3. Enviar comando para listar patrimônios
curl -X POST http://localhost:3000/mcp/message/SESSION_ID \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_patrimonio",
      "arguments": {}
    }
  }'

# 4. Listar sessões ativas
curl http://localhost:3000/mcp/sessions \
  -H "Authorization: Bearer your-api-key"

# 5. Fechar sessão
curl -X DELETE http://localhost:3000/mcp/session/SESSION_ID \
  -H "Authorization: Bearer your-api-key"
```

## 🔧 Troubleshooting

### Erro: "Missing Authorization header"
- **Causa**: Requisição sem header Authorization
- **Solução**: Adicione o header `Authorization: Bearer <api-key>`

### Erro: "Invalid API key"
- **Causa**: API key incorreta ou não configurada
- **Solução**: Verifique se a API key está correta e configurada no `.env`

### Erro: "Session not found"
- **Causa**: Session ID inválido ou sessão expirada
- **Solução**: Crie uma nova sessão usando POST /mcp/session

### Servidor não inicia em modo HTTP
- **Causa**: Porta já em uso ou configuração incorreta
- **Solução**:
  - Verifique se a porta está disponível: `netstat -an | findstr :3000`
  - Verifique as variáveis de ambiente no `.env`
  - Revise os logs: `docker compose logs -f`

### CORS Error no Browser
- **Causa**: Origem não autorizada
- **Solução**: Adicione o domínio ao `CORS_ORIGINS` no `.env`

### Timeout em requisições longas
- **Causa**: Proxy ou firewall interrompendo conexão
- **Solução**: Configure timeouts maiores no proxy (nginx/traefik)

## 📚 Recursos Adicionais

- [Documentação MCP](https://modelcontextprotocol.io)
- [Especificação Streamable HTTP](https://spec.modelcontextprotocol.io/specification/transports/)
- [README Principal](./README.md)

## 🆘 Suporte

Para problemas ou dúvidas:
1. Revise este documento
2. Verifique os logs do servidor
3. Consulte a documentação do MCP
4. Abra uma issue no repositório
