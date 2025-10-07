# Scripts de Teste MCP

Scripts para testar o servidor MCP Patrimônio via HTTP.

## 🚀 Scripts Disponíveis

### 🎯 `test_all_features.sh` (Completo - Recomendado)
Script completo que testa **todos os recursos** do servidor MCP de uma só vez.

**Uso:**
```bash
# Teste local
./scripts/test_all_features.sh

# Teste em produção
MCP_BASE_URL=http://localhost:3000 ./scripts/test_all_features.sh

# Teste remoto
MCP_BASE_URL=https://seu-servidor.com:3000 ./scripts/test_all_features.sh
```

**Recursos:**
- ✅ Testa todas as 11 tools disponíveis
- ✅ Health check e info do servidor
- ✅ Contador de testes (passou/falhou)
- ✅ Formatação com cores
- ✅ Exit code para CI/CD
- ✅ Extração automática de dados

**Testes inclusos:**
1. Health Check
2. Server Info
3. Tool: info
4. Tool: neviim_get_version
5. Tool: neviim_get_estatisticas
6. Tool: neviim_get_patrimonio
7. Tool: neviim_get_patrimonio_por_id
8. Tool: neviim_get_patrimonios_por_setor
9. Tool: neviim_get_patrimonios_por_usuario
10. Tool: neviim_create_patrimonio
11. Tool: neviim_update_patrimonio

### ✅ `test_mcp_simple.sh` (Individual)
Script simples e direto para testar qualquer tool individualmente.

**Uso:**
```bash
# Testar tool sem argumentos
./scripts/test_mcp_simple.sh neviim_get_version

# Testar tool com argumentos
./scripts/test_mcp_simple.sh neviim_get_estatisticas '{}'

# Testar busca por ID (use ObjectId válido)
./scripts/test_mcp_simple.sh neviim_get_patrimonio_por_id '{"id":"68cafa3f80b7ee746b3548c7"}'
```

### 📋 `test_patrimonio.sh`
Testa busca de patrimônio por ObjectId com formatação detalhada.

**Uso:**
```bash
# Com ObjectId padrão
./scripts/test_patrimonio.sh

# Com ObjectId específico
./scripts/test_patrimonio.sh 68cafa3f80b7ee746b3548c7
```

### 📊 `test_get_version.sh`
Testa a tool `neviim_get_version` (obtém versão da API de patrimônio).

**Uso:**
```bash
./scripts/test_get_version.sh
```

### 🔧 `test_mcp_native.sh`
Script de teste para compatibilidade com versões anteriores.

**Uso:**
```bash
./scripts/test_mcp_native.sh
```

### 📋 `test_list_patrimonios.sh`
Script auxiliar para testes de listagem.

## 📝 Exemplos de Uso

### 0. Teste Completo (Recomendado)
```bash
./scripts/test_all_features.sh
```

**Saída esperada:**
```
==========================================
  Teste Completo - MCP Patrimônio Server
==========================================

Base URL: http://localhost:3000
Timestamp: 2025-10-07 15:19:21

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. HEALTH CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Servidor está rodando
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMO DOS TESTES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Total de testes: 8
  Passou: 8
  Falhou: 0

✓ Todos os testes passaram com sucesso!
```

### 1. Obter Versão
```bash
./scripts/test_mcp_simple.sh neviim_get_version
```

**Resposta esperada (SSE):**
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

## 🔄 Integração CI/CD

O script `test_all_features.sh` retorna exit code apropriado para integração CI/CD:
- `0` - Todos os testes passaram
- `1` - Algum teste falhou

### Exemplo GitHub Actions

```yaml
name: Test MCP Server

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker compose build

      - name: Start server
        run: docker compose up -d

      - name: Wait for server
        run: sleep 10

      - name: Run tests
        run: ./scripts/test_all_features.sh
        env:
          MCP_BASE_URL: http://localhost:3000

      - name: Stop server
        run: docker compose down
```

### Exemplo GitLab CI

```yaml
test_mcp:
  stage: test
  script:
    - docker compose up -d
    - sleep 10
    - ./scripts/test_all_features.sh
  after_script:
    - docker compose down
```

## 📊 Métricas de Teste

O script `test_all_features.sh` exibe métricas úteis:
- Total de testes executados
- Testes que passaram
- Testes que falharam
- Tempo de execução
- Dados extraídos (estatísticas, IDs, etc.)

## 📖 Mais Informações

- Documentação completa: [REMOTE_ACCESS.md](../REMOTE_ACCESS.md)
- Guia rápido: [QUICK_START.md](../QUICK_START.md)
- Documentação principal: [README.md](../README.md)
