# Configuração QWEN Desktop

Guia para configurar o MCP Patrimônio no QWEN Desktop.

## ⚠️ Problema Comum: HTTP 401 Unauthorized

**Erro:**
```
Error: Error POSTing to endpoint (HTTP 401): {"error":"Unauthorized","message":"Missing Authorization header"}
```

**Causa:** O QWEN Desktop pode não estar enviando o header `Authorization` corretamente.

## ✅ Soluções

### Solução 1: Verificar Configuração (Recomendado)

Verifique se o arquivo de configuração do QWEN Desktop está correto:

**Localização do arquivo:**
- Windows: `%APPDATA%\QWEN\qwen_desktop_config.json`
- macOS: `~/Library/Application Support/QWEN/qwen_desktop_config.json`
- Linux: `~/.config/qwen/qwen_desktop_config.json`

**Configuração correta:**

```json
{
  "mcpServers": {
    "mcppatrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp",
        "headers": {
          "Authorization": "Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
        }
      }
    }
  }
}
```

**⚠️ Importante:**
- Certifique-se de que `headers` está dentro de `transport`
- Use `Bearer` seguido de espaço e depois a API key
- Verifique se a API key está correta no `.env`

### Solução 2: Usar Servidor sem Autenticação (Apenas Desenvolvimento)

Se você está em ambiente de desenvolvimento local, pode desabilitar a autenticação:

**1. Edite o arquivo `.env`:**

```bash
# Modo de transporte
TRANSPORT_MODE=http

# Servidor HTTP
HTTP_HOST=0.0.0.0
HTTP_PORT=3000

# Desabilitar autenticação (APENAS DESENVOLVIMENTO!)
API_KEYS=

# CORS
ENABLE_CORS=true
CORS_ORIGINS=*
```

**2. Reinicie o servidor:**

```bash
docker compose down
docker compose up -d
```

**3. Configure o QWEN Desktop sem header:**

```json
{
  "mcpServers": {
    "mcppatrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp"
      }
    }
  }
}
```

**⚠️ ATENÇÃO:** Esta configuração é **INSEGURA** e deve ser usada **APENAS** em desenvolvimento local. Nunca use em produção!

### Solução 3: Verificar se QWEN Desktop Suporta Headers Customizados

Algumas versões antigas de clientes MCP podem não suportar headers customizados. Neste caso:

**1. Verifique a versão do QWEN Desktop:**
```bash
# No terminal do QWEN Desktop (se disponível)
qwen --version
```

**2. Atualize para a versão mais recente:**
- Visite o site oficial do QWEN Desktop
- Baixe a versão mais recente
- Reinstale o aplicativo

### Solução 4: Usar Proxy de Autenticação

Se o QWEN Desktop não suporta headers customizados, você pode usar um proxy:

**1. Instale nginx ou use node-http-proxy:**

```bash
npm install -g http-proxy-cli
```

**2. Crie um proxy que adiciona o header:**

```bash
# Proxy na porta 3001 que adiciona auth e redireciona para 3000
http-proxy-cli --port 3001 --target http://localhost:3000 \
  --headers "Authorization: Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
```

**3. Configure QWEN Desktop para usar o proxy:**

```json
{
  "mcpServers": {
    "mcppatrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3001/mcp"
      }
    }
  }
}
```

## 🔍 Diagnóstico

### Verificar se o servidor está recebendo requisições:

```bash
# Ver logs do Docker
docker compose logs -f mcppatrimonio

# Procurar por linhas de log com 401
docker compose logs mcppatrimonio | grep 401
```

### Testar manualmente com cURL:

```bash
# Sem autenticação (deve retornar 401)
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"neviim_get_version","arguments":{}}}'

# Com autenticação (deve funcionar)
curl -X POST http://localhost:3000/mcp \
  -H "Authorization: Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"neviim_get_version","arguments":{}}}'
```

## 📝 Configurações Completas por Cliente

### Claude Desktop

```json
{
  "mcpServers": {
    "Patrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp",
        "headers": {
          "Authorization": "Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
        }
      }
    }
  }
}
```

### QWEN Desktop

```json
{
  "mcpServers": {
    "mcppatrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp",
        "headers": {
          "Authorization": "Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
        }
      }
    }
  }
}
```

### Continue Desktop (se aplicável)

```json
{
  "mcpServers": {
    "mcppatrimonio": {
      "transport": {
        "type": "http",
        "url": "http://localhost:3000/mcp",
        "headers": {
          "Authorization": "Bearer e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
        }
      }
    }
  }
}
```

## 🔧 Troubleshooting Avançado

### Verificar se API Key está correta:

```bash
# No servidor, verificar .env
docker compose exec mcppatrimonio-server cat /app/.env | grep API_KEYS

# Deve mostrar:
# API_KEYS=e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789
```

### Verificar logs do servidor em tempo real:

```bash
docker compose logs -f mcppatrimonio
```

### Testar endpoint de health (não requer auth):

```bash
curl http://localhost:3000/health
```

Deve retornar:
```json
{
  "status": "ok",
  "service": "MCP Patrimonio Server",
  "timestamp": "2025-10-07T...",
  "transport": "streamable-http"
}
```

## 🆘 Suporte

Se nenhuma solução funcionou:

1. Verifique a versão do QWEN Desktop
2. Verifique os logs do servidor: `docker compose logs mcppatrimonio`
3. Teste com cURL para confirmar que o servidor está funcionando
4. Abra uma issue no repositório com:
   - Versão do QWEN Desktop
   - Configuração usada (sem a API key completa!)
   - Logs do servidor
   - Output do teste com cURL

## 📚 Documentações Relacionadas

- [REMOTE_ACCESS.md](./REMOTE_ACCESS.md) - Documentação completa de acesso remoto
- [QUICK_START.md](./QUICK_START.md) - Guia rápido de inicialização
- [scripts/README.md](./scripts/README.md) - Scripts de teste
