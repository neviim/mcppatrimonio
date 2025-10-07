# Scripts de Teste MCP

Scripts para testar o servidor MCP Patrimônio via HTTP.

## 🚀 Scripts Disponíveis

### ✅ `test_mcp_simple.sh` (Recomendado)
Script simples e direto para testar qualquer tool.

**Uso:**
```bash
# Testar tool sem argumentos
./scripts/test_mcp_simple.sh neviim_get_version

# Testar tool com argumentos
./scripts/test_mcp_simple.sh neviim_get_estatisticas '{}'

# Testar busca por ID (use ObjectId válido)
./scripts/test_mcp_simple.sh neviim_get_patrimonio_por_id '{"id":"507f1f77bcf86cd799439011"}'
```

### 📋 `test_get_version.sh`
Testa a tool `neviim_get_version` (obtém versão da API de patrimônio).

**Uso:**
```bash
./scripts/test_get_version.sh
```

### 📊 `test_list_patrimonios.sh`
Testa a tool `neviim_get_patrimonio` (requer parâmetro `numero`).

**Nota**: Este script precisa ser atualizado com um número de patrimônio válido.

### 🔧 `test_mcp_native.sh`
Versão genérica para testar com patrimônio ID 3577.

**Uso:**
```bash
./scripts/test_mcp_native.sh 3577
```

### ⚠️ `test_patrimonio.sh` e `test_mcp.sh` (Deprecated)
Scripts antigos que usam API de sessões (não funcional). Use `test_mcp_simple.sh` ao invés.

## 📝 Exemplos de Uso

### 1. Obter Versão
```bash
./scripts/test_mcp_simple.sh neviim_get_version
```

**Resposta esperada:**
```
event: message
data: {"result":{"content":[{"type":"text","text":"{\"version\":\"0.1.9\",\"build_timestamp\":\"2025-09-26T18:05:36Z\"}"}]},"jsonrpc":"2.0","id":1}
```

### 2. Obter Estatísticas
```bash
./scripts/test_mcp_simple.sh neviim_get_estatisticas '{}'
```

### 3. Buscar Patrimônio por Número
```bash
./scripts/test_mcp_simple.sh neviim_get_patrimonio '{"numero":"12345"}'
```

### 4. Buscar Patrimônio por Setor
```bash
./scripts/test_mcp_simple.sh neviim_get_patrimonios_por_setor '{"setor":"TI"}'
```

## 🔑 Configuração

Todos os scripts usam a API Key configurada em `.env.example`:
```bash
API_KEY="e96ba5d6448d3839eda27f78f49a4f3c7c84053cb0c22f1dd8b734983def2789"
BASE_URL="http://localhost:3000"
```

Para usar uma API Key diferente, edite a variável no início de cada script.

## 🛠️ Tools Disponíveis

- `info` - Informações do servidor
- `neviim_get_patrimonio` - Lista patrimônios por número
- `neviim_get_patrimonio_por_id` - Busca por ID (ObjectId MongoDB)
- `neviim_get_patrimonios_por_setor` - Lista por setor
- `neviim_get_patrimonios_por_usuario` - Lista por usuário
- `neviim_create_patrimonio` - Criar patrimônio
- `neviim_update_patrimonio` - Atualizar patrimônio
- `neviim_get_estatisticas` - Estatísticas
- `neviim_get_version` - Versão da API

## 📖 Mais Informações

- Documentação completa: [REMOTE_ACCESS.md](../REMOTE_ACCESS.md)
- Guia rápido: [QUICK_START.md](../QUICK_START.md)
