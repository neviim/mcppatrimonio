# Testes - MCP Patrimônio

Estrutura de testes reorganizada para o projeto MCP Patrimônio.

## 📁 Estrutura

```
tests/
├── unit/                    # Testes unitários
│   ├── services/           # Testes dos serviços
│   │   ├── patrimonioService.test.ts
│   │   ├── estatisticasService.test.ts
│   │   └── versionService.test.ts
│   └── tools/              # Testes das ferramentas MCP
│       ├── GetPatrimonioTool.test.ts
│       └── InfoTool.test.ts
├── integration/            # Testes de integração
│   └── mcp-server.test.ts
└── helpers/                # Utilitários para testes
    ├── setup.ts           # Configuração global
    └── mocks.ts           # Mocks e fixtures

```

## 🚀 Executando os Testes

### Todos os testes
```bash
npm test
```

### Modo watch
```bash
npm run test:watch
```

### Com UI interativa
```bash
npm run test:ui
```

### Cobertura de código
```bash
npm run test:coverage
```

## 📝 Convenções

### Organização
- **Testes unitários**: testam componentes isolados (services, tools)
- **Testes de integração**: testam fluxos completos do servidor MCP
- **Helpers**: utilitários compartilhados (setup, mocks, fixtures)

### Nomenclatura
- Arquivos de teste: `*.test.ts`
- Describe blocks: nome da classe/módulo sendo testado
- It blocks: descrevem o comportamento esperado em português

### Estrutura de testes
```typescript
describe("NomeDoModulo", () => {
  beforeEach(() => {
    // Setup antes de cada teste
  });

  describe("metodoOuFuncionalidade", () => {
    it("deve fazer algo esperado", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## 🎯 Cobertura

Metas de cobertura:
- Linhas: 70%
- Funções: 70%
- Branches: 70%
- Statements: 70%

## 🛠️ Mocks e Fixtures

Utilize os helpers em `tests/helpers/mocks.ts` para:
- Dados de teste padronizados
- Respostas HTTP mockadas
- Logger mockado

Exemplo:
```typescript
import { mockPatrimonio, createMockResponse } from "../helpers/mocks.js";
```

## 📦 Dependências de Teste

- **vitest**: Framework de testes
- **@vitest/ui**: Interface web para testes
- Configuração: `vitest.config.ts`
