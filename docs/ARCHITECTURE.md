# Arquitetura - MCP Patrimônio

Documentação técnica da arquitetura do servidor MCP Patrimônio para gestão de patrimônio.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Componentes](#arquitetura-de-componentes)
- [Fluxo de Dados](#fluxo-de-dados)
- [Camadas da Aplicação](#camadas-da-aplicação)
- [Padrões de Design](#padrões-de-design)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Decisões Técnicas](#decisões-técnicas)

## 🎯 Visão Geral

O MCP Patrimônio segue uma arquitetura em camadas com separação clara de responsabilidades:

```
┌─────────────────────────────────────────┐
│         Cliente MCP (Claude)            │
└─────────────┬───────────────────────────┘
              │ stdio (JSON-RPC)
┌─────────────▼───────────────────────────┐
│         MCP Server Layer                │
│  - Comunicação stdio                    │
│  - Registro de ferramentas              │
│  - Gerenciamento de conexão             │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Handler Layer                   │
│  - ToolHandler                          │
│  - ResourceHandler                      │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Tool Layer                      │
│  - BaseTool (abstração)                 │
│  - Ferramentas específicas              │
│  - Validação com Zod                    │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│         Service Layer                   │
│  - PatrimonioService                    │
│  - EstatisticasService                  │
│  - VersionService                       │
└─────────────┬───────────────────────────┘
              │ HTTP (undici)
┌─────────────▼───────────────────────────┐
│         API Externa                     │
└─────────────────────────────────────────┘
```

## 🏗️ Arquitetura de Componentes

### 1. Core Layer (`src/core/`)

#### MCPServer (`MCPServer.ts`)

**Responsabilidade**: Gerenciar o servidor MCP principal.

```typescript
class NeviimMCPServer {
  - mcpServer: McpServer
  - toolHandler: ToolHandler
  - resourceHandler: ResourceHandler
  - transport: StdioServerTransport
  - isConnected: boolean

  + registerTool(tool): void
  + registerTools(tools): void
  + connect(): Promise<void>
  + disconnect(): Promise<void>
}
```

**Características**:
- Singleton pattern para instância única
- Gerenciamento de lifecycle (connect/disconnect)
- Delegação de responsabilidades aos handlers

#### Types (`types.ts`)

**Responsabilidade**: Definições de tipos TypeScript compartilhados.

**Tipos Principais**:
- `MCPToolResult`: Formato de resposta MCP
- `Patrimonio`: Schema de patrimônio
- `Estatisticas`: Schema de estatísticas
- `RequestContext`: Contexto de requisições

---

### 2. Handler Layer (`src/handlers/`)

#### ToolHandler (`ToolHandler.ts`)

**Responsabilidade**: Gerenciar registro e execução de ferramentas.

```typescript
class ToolHandler {
  - mcpServer: McpServer
  - tools: Map<string, BaseTool>

  + registerTool(tool): void
  + registerTools(tools): void
  + handleToolCall(name, args): Promise<MCPToolResult>
}
```

**Funcionalidades**:
- Registro dinâmico de ferramentas
- Roteamento de chamadas
- Criação de contexto de execução

#### ResourceHandler (`ResourceHandler.ts`)

**Responsabilidade**: Gerenciar recursos MCP (futuro).

**Status**: Implementado mas não utilizado atualmente. Preparado para expansão futura com recursos estáticos.

---

### 3. Tool Layer (`src/tools/`)

#### BaseTool (`BaseTool.ts`)

**Responsabilidade**: Classe abstrata base para todas as ferramentas.

```typescript
abstract class BaseTool<TInput> {
  abstract name: string
  abstract title: string
  abstract description: string
  abstract inputSchema: z.ZodType<TInput>

  + getDefinition(): MCPToolDefinition
  + execute(params, context): Promise<MCPToolResult>
  # executeInternal(params, context): Promise<MCPToolResult>
  # success(data): MCPToolResult
  # error(message): MCPToolResult
}
```

**Padrão**: Template Method Pattern
- `execute()`: Orquestra validação e tratamento de erros
- `executeInternal()`: Implementação específica (abstract)

**Lifecycle de Execução**:
```
1. Validação de entrada (Zod)
2. Log de início
3. executeInternal() → implementação específica
4. Log de sucesso
5. Retorno padronizado
[Se erro]: Catch → handleToolError → resposta de erro
```

#### Ferramentas Específicas

Cada ferramenta herda de `BaseTool` e implementa:

**Estrutura**:
```typescript
class XxxTool extends BaseTool<XxxParams> {
  readonly name = "neviim_xxx"
  readonly title = "Título"
  readonly description = "Descrição"
  readonly inputSchema = z.object({ ... })

  protected async executeInternal(params, context) {
    const service = new PatrimonioService(...)
    const data = await service.method(...)
    return this.success(data)
  }
}
```

**Ferramentas Implementadas**:
1. `InfoTool` - Informações do servidor
2. `GetPatrimonioTool` - Busca por número
3. `GetPatrimoniosPorSetorTool` - Busca por setor
4. `GetPatrimoniosPorUsuarioTool` - Busca por usuário
5. `GetPatrimonioPorIdTool` - Busca por ID
6. `UpdatePatrimonioTool` - Atualização
7. `CreatePatrimonioTool` - Criação
8. `GetEstatisticasTool` - Estatísticas
9. `GetVersionTool` - Versão

---

### 4. Service Layer (`src/services/`)

#### PatrimonioService (`patrimonioService.ts`)

**Responsabilidade**: Comunicação com API de patrimônio.

```typescript
class PatrimonioService {
  - baseUrl: string
  - token: string

  - request<T>(endpoint, options): Promise<T>
  + fetchPatrimonio(numero): Promise<Patrimonio>
  + fetchPatrimoniosPorSetor(setor): Promise<Patrimonio[]>
  + fetchPatrimoniosPorUsuario(usuario): Promise<Patrimonio[]>
  + fetchPatrimonioPorId(id): Promise<Patrimonio>
  + updatePatrimonio(id, data): Promise<Patrimonio>
  + createPatrimonio(data): Promise<Patrimonio>
}
```

**Características**:
- Encapsulamento de lógica HTTP
- Tratamento de erros HTTP (404, 401, etc)
- Timeout configurável
- Headers automáticos (Authorization, Content-Type)

#### EstatisticasService (`estatisticasService.ts`)

**Responsabilidade**: Buscar estatísticas agregadas.

```typescript
class EstatisticasService {
  - baseUrl: string
  - token: string

  + fetchEstatisticas(): Promise<Estatisticas>
}
```

#### VersionService (`versionService.ts`)

**Responsabilidade**: Obter informações de versão.

```typescript
class VersionService {
  - baseUrl: string
  - token: string

  + fetchVersion(): Promise<VersionInfo>
}
```

---

### 5. Middleware Layer (`src/middleware/`)

#### Validator (`validator.ts`)

**Responsabilidade**: Validação de dados com Zod.

**Funções**:
```typescript
// Valida dados contra schema Zod
validateWithSchema<T>(schema, data): ValidationResult<T>

// Schemas comuns reutilizáveis
commonSchemas = {
  patrimonioNumero: z.string().min(1),
  patrimonioData: z.object({ ... }),
  setor: z.string().min(1),
  usuario: z.string().min(1),
  id: z.string().min(1)
}
```

**Características**:
- Validação type-safe
- Mensagens de erro descritivas
- Schemas reutilizáveis

#### ErrorHandler (`errorHandler.ts`)

**Responsabilidade**: Tratamento centralizado de erros.

**Classes de Erro**:
```typescript
class ValidationError extends Error
class ExternalError extends Error
class NotFoundError extends Error
```

**Função Principal**:
```typescript
handleToolError(error, toolName): MCPToolResult
```

**Tratamentos**:
- `ValidationError` → Mensagem de validação
- `NotFoundError` → "Recurso não encontrado"
- `ExternalError` → Mensagem da API
- Erro genérico → "Erro interno"

---

### 6. Utility Layer (`src/utils/`)

#### Logger (`logger.ts`)

**Responsabilidade**: Sistema de logging estruturado.

```typescript
class Logger {
  - level: LogLevel

  + debug(message, context?): void
  + info(message, context?): void
  + warn(message, context?): void
  + error(message, error?): void
}
```

**Características**:
- Níveis configuráveis (debug, info, warn, error)
- Formatação consistente
- Context opcional para metadados

**Formato**:
```
[LEVEL] Message - Context
```

#### Security (`security.ts`)

**Responsabilidade**: Utilitários de segurança.

**Funções**:
```typescript
// Sanitiza strings para logs (remove tokens, senhas)
sanitizeForLog(obj): any

// Valida URL
isValidUrl(url): boolean

// Valida token format
isValidToken(token): boolean
```

---

### 7. Configuration Layer (`src/config/`)

#### Environment (`env.ts`)

**Responsabilidade**: Carregamento e validação de variáveis de ambiente.

```typescript
const envSchema = z.object({
  PATRIMONIO_BASE_URL: z.string().url(),
  PATRIMONIO_TOKEN: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive(),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().positive()
})

export const env = envSchema.parse(process.env)
```

**Características**:
- Validação automática no startup
- Tipos TypeScript gerados
- Falha rápida se configuração inválida

#### Constants (`constants.ts`)

**Responsabilidade**: Constantes da aplicação.

```typescript
export const APP_NAME = "neviim"
export const APP_VERSION = "0.2.0"
export const HTTP_TIMEOUT = 30000
export const CACHE_TTL = 300000
// etc...
```

---

## 🔄 Fluxo de Dados

### Fluxo de Requisição (Read)

```
1. Claude envia requisição MCP via stdio
   ↓
2. MCPServer recebe via StdioTransport
   ↓
3. ToolHandler roteia para ferramenta correta
   ↓
4. BaseTool.execute() valida parâmetros
   ↓
5. Tool.executeInternal() processa
   ↓
6. Service faz requisição HTTP à API
   ↓
7. Service retorna dados tipados
   ↓
8. Tool formata resposta MCP
   ↓
9. MCPServer envia resposta via stdio
   ↓
10. Claude recebe e processa
```

### Fluxo de Requisição (Write)

```
1. Claude envia comando de criação/atualização
   ↓
2-5. [Igual ao fluxo de leitura]
   ↓
6. Service faz POST/PUT à API
   ↓
7. API valida e persiste dados
   ↓
8. Service retorna recurso criado/atualizado
   ↓
9-10. [Igual ao fluxo de leitura]
```

### Fluxo de Erro

```
1. Erro ocorre em qualquer camada
   ↓
2. Throw de exceção tipada
   ↓
3. Catch em BaseTool.execute()
   ↓
4. handleToolError() processa
   ↓
5. Retorna MCPToolResult com isError: true
   ↓
6. Cliente recebe mensagem de erro formatada
```

---

## 📐 Padrões de Design

### 1. Template Method Pattern

**Usado em**: `BaseTool`

**Propósito**: Definir skeleton de execução, permitindo subclasses customizarem passos específicos.

```typescript
// Template method
async execute(params, context) {
  // 1. Validação (fixo)
  // 2. Log início (fixo)
  // 3. executeInternal (customizável)
  // 4. Log sucesso (fixo)
  // 5. Tratamento de erro (fixo)
}

// Hook para customização
abstract executeInternal(params, context)
```

### 2. Strategy Pattern

**Usado em**: Services

**Propósito**: Encapsular diferentes estratégias de comunicação com API.

```typescript
// Estratégia pode ser trocada sem alterar tools
new PatrimonioService(baseUrl, token)
new EstatisticasService(baseUrl, token)
```

### 3. Dependency Injection

**Usado em**: Tool → Service

**Propósito**: Desacoplar ferramentas de implementações específicas.

```typescript
// Tool não conhece detalhes HTTP
const service = new PatrimonioService(env.BASE_URL, env.TOKEN)
const data = await service.fetchPatrimonio(numero)
```

### 4. Factory Pattern

**Usado em**: Context creation

**Propósito**: Criar objetos de contexto de forma consistente.

```typescript
const context: ToolExecutionContext = {
  server: this.mcpServer,
  logEntry: async (level, message, ctx) => {
    logger[level](message, ctx)
  }
}
```

### 5. Singleton Pattern

**Usado em**: Logger, MCPServer

**Propósito**: Garantir instância única.

```typescript
// Logger exportado é singleton
export const logger = new Logger(env.LOG_LEVEL)
```

---

## 📁 Estrutura de Pastas

```
mcppatrimonio/
├── src/
│   ├── config/              # Configurações
│   │   ├── env.ts          # Variáveis de ambiente
│   │   └── constants.ts    # Constantes
│   │
│   ├── core/               # Núcleo do sistema
│   │   ├── MCPServer.ts    # Servidor MCP principal
│   │   └── types.ts        # Definições de tipos
│   │
│   ├── handlers/           # Handlers de requisições
│   │   ├── ToolHandler.ts  # Handler de ferramentas
│   │   └── ResourceHandler.ts # Handler de recursos
│   │
│   ├── middleware/         # Middleware de processamento
│   │   ├── validator.ts    # Validação Zod
│   │   └── errorHandler.ts # Tratamento de erros
│   │
│   ├── services/           # Camada de serviços
│   │   ├── patrimonioService.ts
│   │   ├── estatisticasService.ts
│   │   └── versionService.ts
│   │
│   ├── tools/              # Ferramentas MCP
│   │   ├── BaseTool.ts     # Base abstrata
│   │   ├── InfoTool.ts
│   │   ├── GetPatrimonioTool.ts
│   │   ├── GetPatrimoniosPorSetorTool.ts
│   │   ├── GetPatrimoniosPorUsuarioTool.ts
│   │   ├── GetPatrimonioPorIdTool.ts
│   │   ├── UpdatePatrimonioTool.ts
│   │   ├── CreatePatrimonioTool.ts
│   │   ├── GetEstatisticasTool.ts
│   │   ├── GetVersionTool.ts
│   │   └── index.ts        # Exports
│   │
│   ├── utils/              # Utilitários
│   │   ├── logger.ts       # Sistema de logging
│   │   └── security.ts     # Funções de segurança
│   │
│   └── index.ts            # Entry point
│
├── tests/                  # Testes
│   ├── unit/              # Testes unitários
│   ├── integration/       # Testes de integração
│   └── fixtures/          # Dados de teste
│
├── dist/                   # Build output (JS)
├── docs/                   # Documentação
├── .env                    # Configuração local
├── .env.example           # Exemplo de configuração
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Convenções de Nomenclatura

**Arquivos**:
- `PascalCase.ts` para classes (`MCPServer.ts`)
- `camelCase.ts` para utilitários (`logger.ts`)
- `UPPERCASE.md` para docs (`README.md`)

**Classes**:
- `PascalCase` para classes (`PatrimonioService`)
- Sufixo descritivo (`XxxTool`, `XxxService`, `XxxHandler`)

**Interfaces**:
- `PascalCase` para interfaces públicas (`Patrimonio`)
- Prefixo `I` para interfaces complexas (opcional)

**Variáveis**:
- `camelCase` para variáveis e funções
- `UPPER_SNAKE_CASE` para constantes

---

## 🧠 Decisões Técnicas

### 1. Por que TypeScript?

**Decisão**: Usar TypeScript em vez de JavaScript puro.

**Razões**:
- ✅ Type safety em toda aplicação
- ✅ Melhor IDE support e autocomplete
- ✅ Detecção de erros em compile-time
- ✅ Documentação através de tipos
- ✅ Refatoração mais segura

### 2. Por que Zod?

**Decisão**: Usar Zod para validação em vez de alternativas (Joi, Yup).

**Razões**:
- ✅ Integração perfeita com TypeScript
- ✅ Type inference automática
- ✅ Zero overhead em runtime
- ✅ API fluente e intuitiva
- ✅ Mensagens de erro claras

### 3. Por que undici?

**Decisão**: Usar undici para HTTP em vez de axios ou node-fetch.

**Razões**:
- ✅ Performance superior
- ✅ Suporte nativo no Node.js moderno
- ✅ API moderna (fetch-like)
- ✅ Menor tamanho de bundle
- ✅ Manutenção ativa

### 4. Por que Vitest?

**Decisão**: Usar Vitest em vez de Jest.

**Razões**:
- ✅ Mais rápido (Vite-powered)
- ✅ ESM nativo
- ✅ Compatible com Jest API
- ✅ UI de testes incluída
- ✅ Coverage integrado

### 5. Por que Arquitetura em Camadas?

**Decisão**: Separar em camadas Tool → Service → API.

**Razões**:
- ✅ Separação de responsabilidades
- ✅ Testabilidade (mock de camadas)
- ✅ Manutenibilidade
- ✅ Reutilização de código
- ✅ Facilita extensões

### 6. Por que BaseTool Abstrata?

**Decisão**: Criar classe base abstrata em vez de interface.

**Razões**:
- ✅ Reutilização de lógica comum (validação, erro)
- ✅ Template method pattern
- ✅ Consistência entre ferramentas
- ✅ Menos código duplicado
- ✅ Manutenção centralizada

### 7. Por que Services Separados?

**Decisão**: `PatrimonioService`, `EstatisticasService` separados.

**Razões**:
- ✅ Single Responsibility Principle
- ✅ Facilita testes isolados
- ✅ Permite evolução independente
- ✅ Clareza de propósito

### 8. Por que Stdio Transport?

**Decisão**: Usar stdio em vez de HTTP ou WebSocket.

**Razões**:
- ✅ Padrão do MCP
- ✅ Simplicidade (sem portas, CORS, etc)
- ✅ Segurança (processo local)
- ✅ Performance (sem overhead de rede)

---

## 🔐 Segurança

### Princípios Aplicados

1. **Least Privilege**: Token com permissões mínimas necessárias
2. **Input Validation**: Validação rigorosa com Zod
3. **Error Handling**: Não vaza informações sensíveis
4. **Logging**: Sanitização de dados sensíveis

### Medidas Implementadas

```typescript
// 1. Validação de entrada
validateWithSchema(schema, data)

// 2. Sanitização de logs
sanitizeForLog(data) // Remove tokens

// 3. Timeout de requisições
signal: AbortSignal.timeout(HTTP_TIMEOUT)

// 4. Headers seguros
Authorization: Bearer ${token} // Não logado
```

---

## 📊 Performance

### Otimizações Implementadas

1. **HTTP Client**: undici (alto desempenho)
2. **Lazy Loading**: Services criados sob demanda
3. **Timeout**: 30s padrão, configurável
4. **Streaming**: stdio para baixa latência

### Métricas Esperadas

- **Tempo de startup**: < 1s
- **Latência de ferramenta**: < 100ms (+ API)
- **Memória**: ~50MB em repouso

---

## 🧪 Testabilidade

### Estratégias

1. **Unit Tests**: Cada camada isoladamente
2. **Integration Tests**: Fluxos end-to-end
3. **Mocking**: Services mockados para tests de Tools

### Exemplo de Mock

```typescript
// Mock de service
const mockService = {
  fetchPatrimonio: vi.fn().mockResolvedValue({
    id: '1',
    numero: 'PAT-001',
    // ...
  })
}

// Test de tool
const tool = new GetPatrimonioTool()
const result = await tool.execute({ numero: 'PAT-001' }, context)
```

---

## 🔮 Extensibilidade

### Adicionar Nova Ferramenta

1. Criar `src/tools/MinhaFerramentaTool.ts`
2. Estender `BaseTool`
3. Implementar `executeInternal()`
4. Export em `src/tools/index.ts`
5. Registrar em `src/index.ts`

### Adicionar Novo Service

1. Criar `src/services/meuService.ts`
2. Implementar métodos HTTP
3. Usar em ferramentas

### Adicionar Middleware

1. Criar função em `src/middleware/`
2. Aplicar em `BaseTool.execute()` ou handlers

---

## 📚 Referências

- [Model Context Protocol Spec](https://modelcontextprotocol.io/)
- [Zod Documentation](https://zod.dev/)
- [undici Documentation](https://undici.nodejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Documentação de Arquitetura Completa**

Para uso prático, veja [EXAMPLES.md](EXAMPLES.md)
Para referência de API, veja [API.md](API.md)
