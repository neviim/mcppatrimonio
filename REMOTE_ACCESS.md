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

#### POST /mcp
Endpoint principal do MCP para comunicação via Streamable HTTP.

**Importante**: Este endpoint usa Server-Sent Events (SSE) para streaming de respostas.

```bash
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "neviim_get_version",
      "arguments": {}
    }
  }'
```

Resposta (via SSE):
```
event: message
data: {"result":{"content":[{"type":"text","text":"{\"version\":\"0.1.9\",\"build_timestamp\":\"2025-09-26T18:05:36Z\"}"}]},"jsonrpc":"2.0","id":1}
```

#### GET /mcp/sessions
Lista todas as sessões ativas (mantido para compatibilidade, mas modo atual é stateless).

```bash
curl http://localhost:3000/mcp/sessions \
  -H "Authorization: Bearer your-api-key"
```


## 💡 Exemplos

### Tools Disponíveis

- `info` - Informações do servidor
- `neviim_get_patrimonio` - Lista patrimônios por número
- `neviim_get_patrimonio_por_id` - Busca patrimônio por ID (ObjectId do MongoDB)
- `neviim_get_patrimonios_por_setor` - Lista patrimônios por setor
- `neviim_get_patrimonios_por_usuario` - Lista patrimônios por usuário
- `neviim_create_patrimonio` - Criar novo patrimônio
- `neviim_update_patrimonio` - Atualizar patrimônio
- `neviim_get_estatisticas` - Estatísticas do sistema
- `neviim_get_version` - Versão da API de patrimônio

### Exemplo com cURL

```bash
# 1. Verificar saúde do servidor
curl http://localhost:3000/health

# 2. Obter versão da API de patrimônio
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "neviim_get_version",
      "arguments": {}
    }
  }'

# 3. Buscar estatísticas
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "neviim_get_estatisticas",
      "arguments": {}
    }
  }'
```

### Resposta Esperada

As respostas vêm no formato Server-Sent Events (SSE):

```
event: message
data: {"result":{"content":[{"type":"text","text":"{\"version\":\"0.1.9\",\"build_timestamp\":\"2025-09-26T18:05:36Z\"}"}]},"jsonrpc":"2.0","id":1}
```

Para processar SSE em código, use bibliotecas apropriadas:
- **Python**: `sseclient-py` ou `requests` com streaming
- **Node.js**: `eventsource` ou `axios` com `responseType: 'stream'`
- **Bash**: Use `curl -N` para não bufferizar

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
