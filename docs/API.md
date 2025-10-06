# Documentação da API - MCP Patrimônio

Esta documentação detalha todas as ferramentas (tools) disponíveis no servidor MCP Patrimônio para gestão de patrimônio.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Estrutura de Resposta](#estrutura-de-resposta)
- [Tratamento de Erros](#tratamento-de-erros)
- [Ferramentas Disponíveis](#ferramentas-disponíveis)
  - [neviim_info](#neviim_info)
  - [neviim_get_patrimonio](#neviim_get_patrimonio)
  - [neviim_get_patrimonios_por_setor](#neviim_get_patrimonios_por_setor)
  - [neviim_get_patrimonios_por_usuario](#neviim_get_patrimonios_por_usuario)
  - [neviim_get_patrimonio_por_id](#neviim_get_patrimonio_por_id)
  - [neviim_update_patrimonio](#neviim_update_patrimonio)
  - [neviim_create_patrimonio](#neviim_create_patrimonio)
  - [neviim_get_estatisticas](#neviim_get_estatisticas)
  - [neviim_get_version](#neviim_get_version)
- [Schemas de Dados](#schemas-de-dados)
- [Rate Limiting](#rate-limiting)

## 🎯 Visão Geral

O servidor MCP Patrimônio expõe 9 ferramentas que permitem operações completas de CRUD (Create, Read, Update, Delete) para gestão de patrimônio, além de funcionalidades de consulta e estatísticas.

### Características das Ferramentas

- ✅ **Validação automática**: Todos os parâmetros são validados com Zod
- 🔒 **Autenticação**: Bearer token automático via variáveis de ambiente
- 📝 **Logging**: Todas as operações são logadas
- ⚡ **Rate Limiting**: Controle de taxa configurável
- 🛡️ **Tratamento de erros**: Erros padronizados e descritivos

## 📤 Estrutura de Resposta

### Resposta de Sucesso

```json
{
  "content": [
    {
      "type": "text",
      "text": "<JSON com os dados>"
    }
  ],
  "isError": false
}
```

O campo `text` contém JSON formatado com os dados da resposta.

### Resposta de Erro

```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro: <mensagem descritiva>"
    }
  ],
  "isError": true
}
```

## 🚨 Tratamento de Erros

### Tipos de Erro

#### 1. Erros de Validação
Ocorrem quando os parâmetros de entrada não atendem ao schema.

**Exemplo**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro de validação: numero: Campo obrigatório"
    }
  ],
  "isError": true
}
```

#### 2. Erros de Autenticação (401)
Token inválido ou expirado.

```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro: HTTP 401 Unauthorized"
    }
  ],
  "isError": true
}
```

#### 3. Erros de Not Found (404)
Recurso não encontrado.

```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro: Recurso não encontrado"
    }
  ],
  "isError": true
}
```

#### 4. Erros de API Externa
Problemas na comunicação com a API.

```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro: Falha na comunicação com a API: timeout"
    }
  ],
  "isError": true
}
```

## 🛠️ Ferramentas Disponíveis

---

### neviim_info

Retorna informações sobre o servidor MCP Patrimônio.

#### Parâmetros
Nenhum parâmetro necessário.

#### Schema de Entrada
```typescript
{}
```

#### Schema de Saída
```typescript
{
  name: string;        // Nome do servidor
  version: string;     // Versão
  description: string; // Descrição
  tools: number;       // Número de ferramentas disponíveis
}
```

#### Exemplo de Uso

**Entrada**:
```json
{}
```

**Saída**:
```json
{
  "name": "neviim",
  "version": "0.2.0",
  "description": "Servidor MCP para gestão de patrimônio - homeLab Jads",
  "tools": 9
}
```

#### Códigos de Status
- ✅ Sucesso: Sempre retorna sucesso

---

### neviim_get_patrimonio

Obtém informações detalhadas de um patrimônio específico pelo número.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| numero | string | ✅ Sim | Número identificador do patrimônio |

#### Schema de Entrada
```typescript
{
  numero: string; // min: 1 caractere
}
```

#### Schema de Saída
```typescript
{
  id: string;
  numero: string;
  setor: string;
  usuario: string;
  tipoEquipamento: string;
  locacao: string;
  descricao?: string;
  valor?: number;
  dataAquisicao?: string;
}
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "numero": "PAT-001"
}
```

**Saída**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "numero": "PAT-001",
  "setor": "TI",
  "usuario": "João Silva",
  "tipoEquipamento": "Notebook",
  "locacao": "Sala 101",
  "descricao": "Dell Latitude 5520 - 16GB RAM, 512GB SSD",
  "valor": 3500.00,
  "dataAquisicao": "2024-01-15"
}
```

#### Erros Possíveis
- ❌ **Validação**: numero vazio ou não fornecido
- ❌ **404**: Patrimônio não encontrado
- ❌ **401**: Token inválido
- ❌ **500**: Erro na API

---

### neviim_get_patrimonios_por_setor

Lista todos os patrimônios de um setor específico.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| setor | string | ✅ Sim | Nome do setor |

#### Schema de Entrada
```typescript
{
  setor: string; // min: 1 caractere
}
```

#### Schema de Saída
```typescript
Patrimonio[] // Array de objetos Patrimonio
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "setor": "TI"
}
```

**Saída**:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "numero": "PAT-001",
    "setor": "TI",
    "usuario": "João Silva",
    "tipoEquipamento": "Notebook",
    "locacao": "Sala 101",
    "descricao": "Dell Latitude 5520",
    "valor": 3500.00,
    "dataAquisicao": "2024-01-15"
  },
  {
    "id": "507f1f77bcf86cd799439012",
    "numero": "PAT-002",
    "setor": "TI",
    "usuario": "Maria Santos",
    "tipoEquipamento": "Desktop",
    "locacao": "Sala 102",
    "descricao": "HP EliteDesk 800",
    "valor": 2800.00,
    "dataAquisicao": "2024-02-20"
  }
]
```

#### Erros Possíveis
- ❌ **Validação**: setor vazio
- ❌ **404**: Setor não encontrado
- ❌ **401**: Token inválido

---

### neviim_get_patrimonios_por_usuario

Lista todos os patrimônios associados a um usuário específico.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| usuario | string | ✅ Sim | Nome do usuário |

#### Schema de Entrada
```typescript
{
  usuario: string; // min: 1 caractere
}
```

#### Schema de Saída
```typescript
Patrimonio[] // Array de objetos Patrimonio
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "usuario": "João Silva"
}
```

**Saída**:
```json
[
  {
    "id": "507f1f77bcf86cd799439011",
    "numero": "PAT-001",
    "setor": "TI",
    "usuario": "João Silva",
    "tipoEquipamento": "Notebook",
    "locacao": "Sala 101",
    "valor": 3500.00
  },
  {
    "id": "507f1f77bcf86cd799439013",
    "numero": "PAT-015",
    "setor": "TI",
    "usuario": "João Silva",
    "tipoEquipamento": "Monitor",
    "locacao": "Sala 101",
    "valor": 800.00
  }
]
```

#### Erros Possíveis
- ❌ **Validação**: usuario vazio
- ❌ **404**: Usuário não encontrado ou sem patrimônios
- ❌ **401**: Token inválido

---

### neviim_get_patrimonio_por_id

Obtém um patrimônio específico pelo ID único.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| id | string | ✅ Sim | ID único do patrimônio |

#### Schema de Entrada
```typescript
{
  id: string; // min: 1 caractere
}
```

#### Schema de Saída
```typescript
Patrimonio
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "id": "507f1f77bcf86cd799439011"
}
```

**Saída**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "numero": "PAT-001",
  "setor": "TI",
  "usuario": "João Silva",
  "tipoEquipamento": "Notebook",
  "locacao": "Sala 101",
  "descricao": "Dell Latitude 5520",
  "valor": 3500.00,
  "dataAquisicao": "2024-01-15"
}
```

#### Erros Possíveis
- ❌ **Validação**: id vazio ou inválido
- ❌ **404**: ID não encontrado
- ❌ **401**: Token inválido

---

### neviim_update_patrimonio

Atualiza os dados de um patrimônio existente.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| id | string | ✅ Sim | ID do patrimônio a atualizar |
| data | object | ✅ Sim | Dados a serem atualizados |

#### Schema de Entrada
```typescript
{
  id: string;
  data: {
    numero?: string;
    setor?: string;
    usuario?: string;
    tipoEquipamento?: string;
    locacao?: string;
    descricao?: string;
    valor?: number;
    dataAquisicao?: string;
    [key: string]: any;
  }
}
```

#### Schema de Saída
```typescript
Patrimonio // Patrimônio atualizado
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "data": {
    "usuario": "Pedro Costa",
    "locacao": "Sala 103",
    "valor": 3200.00
  }
}
```

**Saída**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "numero": "PAT-001",
  "setor": "TI",
  "usuario": "Pedro Costa",
  "tipoEquipamento": "Notebook",
  "locacao": "Sala 103",
  "descricao": "Dell Latitude 5520",
  "valor": 3200.00,
  "dataAquisicao": "2024-01-15"
}
```

#### Erros Possíveis
- ❌ **Validação**: id vazio, data vazio ou inválido
- ❌ **404**: ID não encontrado
- ❌ **401**: Token inválido
- ❌ **400**: Dados inválidos

---

### neviim_create_patrimonio

Cria um novo registro de patrimônio.

#### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| data | object | ✅ Sim | Dados do novo patrimônio |

#### Schema de Entrada
```typescript
{
  data: {
    numero: string;          // Obrigatório
    setor: string;           // Obrigatório
    usuario: string;         // Obrigatório
    tipoEquipamento: string; // Obrigatório
    locacao: string;         // Obrigatório
    descricao?: string;
    valor?: number;
    dataAquisicao?: string;
    [key: string]: any;
  }
}
```

#### Schema de Saída
```typescript
Patrimonio // Patrimônio criado com ID
```

#### Exemplo de Uso

**Entrada**:
```json
{
  "data": {
    "numero": "PAT-050",
    "setor": "RH",
    "usuario": "Ana Paula",
    "tipoEquipamento": "Desktop",
    "locacao": "Sala 205",
    "descricao": "HP EliteDesk 800 G6 - 8GB RAM, 256GB SSD",
    "valor": 2500.00,
    "dataAquisicao": "2024-10-06"
  }
}
```

**Saída**:
```json
{
  "id": "507f1f77bcf86cd799439099",
  "numero": "PAT-050",
  "setor": "RH",
  "usuario": "Ana Paula",
  "tipoEquipamento": "Desktop",
  "locacao": "Sala 205",
  "descricao": "HP EliteDesk 800 G6 - 8GB RAM, 256GB SSD",
  "valor": 2500.00,
  "dataAquisicao": "2024-10-06"
}
```

#### Erros Possíveis
- ❌ **Validação**: Campos obrigatórios ausentes
- ❌ **400**: Dados inválidos (ex: numero duplicado)
- ❌ **401**: Token inválido

---

### neviim_get_estatisticas

Retorna estatísticas agregadas sobre os patrimônios cadastrados.

#### Parâmetros
Nenhum parâmetro necessário.

#### Schema de Entrada
```typescript
{}
```

#### Schema de Saída
```typescript
{
  total: number;
  porSetor: {
    [setor: string]: number;
  };
  porTipoEquipamento: {
    [tipo: string]: number;
  };
  porLocacao: {
    [locacao: string]: number;
  };
  valorTotal?: number;
}
```

#### Exemplo de Uso

**Entrada**:
```json
{}
```

**Saída**:
```json
{
  "total": 150,
  "porSetor": {
    "TI": 45,
    "RH": 20,
    "Financeiro": 35,
    "Operações": 50
  },
  "porTipoEquipamento": {
    "Notebook": 60,
    "Desktop": 50,
    "Monitor": 40
  },
  "porLocacao": {
    "Sala 101": 10,
    "Sala 102": 8,
    "Sala 103": 12,
    "Sala 201": 15,
    "Sala 202": 10
  },
  "valorTotal": 425000.00
}
```

#### Erros Possíveis
- ❌ **401**: Token inválido
- ❌ **500**: Erro ao calcular estatísticas

---

### neviim_get_version

Retorna informações de versão do sistema.

#### Parâmetros
Nenhum parâmetro necessário.

#### Schema de Entrada
```typescript
{}
```

#### Schema de Saída
```typescript
{
  version: string;
  buildTimestamp: string;
  environment?: string;
}
```

#### Exemplo de Uso

**Entrada**:
```json
{}
```

**Saída**:
```json
{
  "version": "0.2.0",
  "buildTimestamp": "2024-10-06T12:00:00Z",
  "environment": "production"
}
```

#### Erros Possíveis
- ❌ **401**: Token inválido (se a API exigir autenticação)
- ❌ **500**: Erro ao obter versão

---

## 📊 Schemas de Dados

### Patrimonio

```typescript
interface Patrimonio {
  id: string;              // Identificador único
  numero: string;          // Número do patrimônio (ex: PAT-001)
  setor: string;           // Setor responsável
  usuario: string;         // Usuário alocado
  tipoEquipamento: string; // Tipo do equipamento
  locacao: string;         // Local físico
  descricao?: string;      // Descrição detalhada
  valor?: number;          // Valor monetário
  dataAquisicao?: string;  // Data de aquisição (ISO 8601)
  [key: string]: any;      // Campos adicionais customizados
}
```

### Estatisticas

```typescript
interface Estatisticas {
  total: number;                           // Total de patrimônios
  porSetor: Record<string, number>;        // Contagem por setor
  porTipoEquipamento: Record<string, number>; // Contagem por tipo
  porLocacao: Record<string, number>;      // Contagem por locação
  valorTotal?: number;                     // Valor total (opcional)
}
```

### ValidationError

```typescript
interface ValidationError {
  field: string;    // Campo com erro
  message: string;  // Mensagem do erro
  value?: any;      // Valor fornecido
}
```

## ⚡ Rate Limiting

O servidor implementa rate limiting para proteger contra abuso.

### Configuração Padrão

- **Janela de tempo**: 60 segundos (60000ms)
- **Máximo de requisições**: 100 por janela

### Configurar Rate Limit

No arquivo `.env`:

```env
# Janela de 30 segundos
RATE_LIMIT_WINDOW_MS=30000

# Máximo de 50 requisições
RATE_LIMIT_MAX_REQUESTS=50
```

### Comportamento

Se o limite for excedido:
- A ferramenta retorna um erro
- O contador reseta após a janela de tempo

### Resposta de Rate Limit

```json
{
  "content": [
    {
      "type": "text",
      "text": "Erro: Taxa de requisições excedida. Tente novamente em alguns segundos."
    }
  ],
  "isError": true
}
```

## 🔒 Autenticação

### Método

Todas as ferramentas usam autenticação Bearer Token.

### Configuração

O token é configurado via variável de ambiente:

```env
PATRIMONIO_TOKEN=seu_token_secreto_aqui
```

### Header HTTP

O servidor adiciona automaticamente:

```
Authorization: Bearer <seu_token>
```

### Renovação de Token

Se o token expirar:
1. Obtenha novo token da API
2. Atualize em `.env`
3. Reinicie o servidor MCP

## 📝 Logs

### Níveis de Log

Configure em `.env`:

```env
LOG_LEVEL=debug  # debug | info | warn | error
```

### Formato dos Logs

```
[LEVEL] Message - Context
```

**Exemplo**:
```
[INFO] Executing tool: neviim_get_patrimonio - {"params":{"numero":"PAT-001"}}
[INFO] Tool neviim_get_patrimonio executed successfully
```

### Logs de Erro

```
[ERROR] Error executing tool neviim_get_patrimonio - {
  "error": "HTTP 404 Not Found",
  "url": "https://api.example.com/api/v1/patrimonios/patrimonio/PAT-999"
}
```

## 🧪 Testando as Ferramentas

### Teste via Claude Desktop

```
Use a ferramenta neviim_get_patrimonio com numero "PAT-001"
```

### Teste via Cliente MCP Customizado

```javascript
const result = await client.callTool('neviim_get_patrimonio', {
  numero: 'PAT-001'
});
console.log(result);
```

### Teste de Integração

Veja `tests/integration/` para exemplos de testes completos.

## 🔗 Endpoints da API Backend

As ferramentas fazem requisições para estes endpoints:

| Ferramenta | Método | Endpoint |
|------------|--------|----------|
| get_patrimonio | GET | `/api/v1/patrimonios/patrimonio/:numero` |
| get_patrimonios_por_setor | GET | `/api/v1/patrimonios/setor/:setor` |
| get_patrimonios_por_usuario | GET | `/api/v1/patrimonios/usuario/:usuario` |
| get_patrimonio_por_id | GET | `/api/v1/patrimonios/:id` |
| update_patrimonio | PUT | `/api/v1/patrimonios/:id` |
| create_patrimonio | POST | `/api/v1/patrimonios/` |
| get_estatisticas | GET | `/api/v1/estatisticas` |
| get_version | GET | `/version` |

---

**Documentação completa da API MCP Patrimônio**

Para exemplos práticos, veja [EXAMPLES.md](EXAMPLES.md)
