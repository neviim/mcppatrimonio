# Guia de Contribuição - MCP Patrimônio

Obrigado pelo interesse em contribuir com o MCP Patrimônio! Este guia fornece informações sobre como contribuir de forma efetiva.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Processo de Desenvolvimento](#processo-de-desenvolvimento)
- [Padrões de Código](#padrões-de-código)
- [Commits e Pull Requests](#commits-e-pull-requests)
- [Testes](#testes)
- [Documentação](#documentação)

## 🤝 Código de Conduta

### Nossos Valores

- **Respeito**: Trate todos com respeito e consideração
- **Colaboração**: Trabalhe de forma construtiva com a comunidade
- **Inclusão**: Seja acolhedor com contribuidores de todos os níveis
- **Qualidade**: Comprometa-se com código de alta qualidade

### Comportamento Esperado

✅ Comunicação respeitosa e profissional
✅ Feedback construtivo
✅ Foco em resolver problemas
✅ Abertura para aprender e ensinar

### Comportamento Inaceitável

❌ Linguagem ofensiva ou discriminatória
❌ Assédio de qualquer tipo
❌ Trolling ou comentários depreciativos
❌ Spam ou promoção não solicitada

## 🎯 Como Contribuir

### Tipos de Contribuição

1. **Reportar Bugs**
2. **Sugerir Features**
3. **Melhorar Documentação**
4. **Corrigir Bugs**
5. **Implementar Features**
6. **Revisar Pull Requests**

### Antes de Começar

1. **Verifique Issues Existentes**: Alguém já reportou/sugeriu isso?
2. **Discuta Grandes Mudanças**: Abra uma issue antes de implementar features grandes
3. **Leia a Documentação**: Familiarize-se com arquitetura e padrões

## 🔧 Processo de Desenvolvimento

### 1. Preparar Ambiente

```bash
# Fork o repositório no GitHub

# Clone seu fork
git clone https://github.com/SEU_USUARIO/mcppatrimonio.git
cd mcppatrimonio

# Adicione o repositório upstream
git remote add upstream https://github.com/REPO_ORIGINAL/mcppatrimonio.git

# Instale dependências
npm install

# Configure .env
cp .env.example .env
# Edite .env com suas configurações
```

### 2. Criar Branch

```bash
# Atualize seu main
git checkout main
git pull upstream main

# Crie branch descritiva
git checkout -b feature/nome-da-feature
# ou
git checkout -b fix/nome-do-bug
```

**Convenções de Nomenclatura de Branch**:
- `feature/`: Novas funcionalidades
- `fix/`: Correções de bugs
- `docs/`: Mudanças em documentação
- `refactor/`: Refatorações
- `test/`: Adição/correção de testes

### 3. Desenvolver

```bash
# Desenvolva sua feature/fix

# Execute testes frequentemente
npm test

# Verifique tipos
npm run typecheck

# Execute em modo desenvolvimento
npm run dev
```

### 4. Testar

```bash
# Execute todos os testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em watch mode
npm run test:watch
```

### 5. Commitar

```bash
# Adicione arquivos
git add .

# Commit com mensagem descritiva
git commit -m "feat: adiciona suporte para filtros avançados"
```

### 6. Push e Pull Request

```bash
# Push para seu fork
git push origin feature/nome-da-feature

# Abra Pull Request no GitHub
# Preencha o template de PR
```

## 📝 Padrões de Código

### TypeScript

**Estilo**:
```typescript
// ✅ Bom: Tipos explícitos
function fetchData(id: string): Promise<Patrimonio> {
  return patrimonioService.fetch(id);
}

// ❌ Ruim: Sem tipos
function fetchData(id) {
  return patrimonioService.fetch(id);
}
```

**Interfaces vs Types**:
```typescript
// ✅ Use interface para objetos públicos
interface Patrimonio {
  id: string;
  numero: string;
}

// ✅ Use type para unions, helpers
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
```

### Nomenclatura

**Variáveis e Funções**:
```typescript
// ✅ camelCase, descritivo
const patrimonioData = await fetchPatrimonio();
function calculateTotalValue(items: Patrimonio[]): number { }

// ❌ Evite abreviações obscuras
const pd = await fetch(); // O que é pd?
```

**Classes**:
```typescript
// ✅ PascalCase, substantivos
class PatrimonioService { }
class GetPatrimonioTool extends BaseTool { }

// ❌ Evite nomes genéricos
class Manager { }
class Helper { }
```

**Constantes**:
```typescript
// ✅ UPPER_SNAKE_CASE para constantes verdadeiras
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 30000;

// ✅ camelCase para valores configuráveis
const defaultConfig = { ... };
```

### Organização de Código

**Ordem em Arquivos**:
```typescript
// 1. Imports
import { z } from 'zod';
import { BaseTool } from './BaseTool.js';

// 2. Types/Interfaces
interface MyParams {
  id: string;
}

// 3. Constantes
const DEFAULT_VALUE = 100;

// 4. Classe/Função principal
export class MyTool extends BaseTool<MyParams> {
  // 4.1. Propriedades públicas
  readonly name = "my_tool";

  // 4.2. Propriedades privadas
  private cache = new Map();

  // 4.3. Constructor
  constructor() { }

  // 4.4. Métodos públicos
  public execute() { }

  // 4.5. Métodos protegidos
  protected executeInternal() { }

  // 4.6. Métodos privados
  private helper() { }
}

// 5. Exports auxiliares
export function helperFunction() { }
```

### Comentários

**JSDoc para APIs Públicas**:
```typescript
/**
 * Busca patrimônio pelo número
 * @param numero - Número do patrimônio (ex: PAT-001)
 * @returns Promise com dados do patrimônio
 * @throws {NotFoundError} Se patrimônio não existir
 */
async function fetchPatrimonio(numero: string): Promise<Patrimonio> {
  // Implementação
}
```

**Comentários Inline**:
```typescript
// ✅ Explique o "porquê", não o "o quê"
// Usamos timeout maior aqui pois a API de estatísticas é lenta
const timeout = 60000;

// ❌ Evite comentários óbvios
// Incrementa contador
counter++;
```

### Error Handling

```typescript
// ✅ Use erros tipados
throw new NotFoundError(`Patrimônio ${id} não encontrado`);

// ✅ Catch específico
try {
  await operation();
} catch (error) {
  if (error instanceof NotFoundError) {
    // Trata 404
  } else if (error instanceof ValidationError) {
    // Trata validação
  } else {
    // Trata outros
  }
}

// ❌ Evite catch genérico silencioso
try {
  await operation();
} catch (e) {
  // Nada...
}
```

### Async/Await

```typescript
// ✅ Use async/await
async function fetchData() {
  const data = await service.fetch();
  return process(data);
}

// ❌ Evite misturar callbacks e promises
function fetchData(callback) {
  service.fetch().then(data => {
    callback(null, data);
  });
}
```

## 💬 Commits e Pull Requests

### Mensagens de Commit

**Formato**: Conventional Commits

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos**:
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação (não muda lógica)
- `refactor`: Refatoração
- `test`: Testes
- `chore`: Tarefas de build, configs, etc

**Exemplos**:
```bash
# Feature
git commit -m "feat(tools): adiciona GetPatrimoniosPorLocacaoTool"

# Fix
git commit -m "fix(service): corrige timeout em requisições lentas"

# Docs
git commit -m "docs(api): atualiza exemplos de uso"

# Breaking change
git commit -m "feat(api): muda formato de resposta de estatísticas

BREAKING CHANGE: campo 'total' agora é 'totalGeral'"
```

### Pull Requests

**Título**: Mesmo formato de commit
```
feat(tools): adiciona suporte para filtros avançados
```

**Descrição**: Use o template

```markdown
## Descrição
Adiciona suporte para filtrar patrimônios por múltiplos critérios

## Tipo de Mudança
- [ ] Bug fix (mudança que corrige um issue)
- [x] Nova feature (mudança que adiciona funcionalidade)
- [ ] Breaking change (mudança que quebra compatibilidade)

## Como Foi Testado
- [ ] Testes unitários
- [x] Testes de integração
- [x] Teste manual com Claude Desktop

## Checklist
- [x] Código segue os padrões do projeto
- [x] Comentários em código complexo
- [x] Documentação atualizada
- [x] Sem warnings de TypeScript
- [x] Testes passando
- [x] Coverage mantido/aumentado
```

**Tamanho**:
- ✅ PRs pequenos e focados (< 400 linhas)
- ❌ PRs grandes e abrangentes

**Se PR é grande**, divida em múltiplos PRs menores.

## 🧪 Testes

### Estrutura de Testes

```
tests/
├── unit/              # Testes unitários
│   ├── tools/        # Testes de tools
│   ├── services/     # Testes de services
│   └── middleware/   # Testes de middleware
├── integration/      # Testes de integração
└── fixtures/         # Dados de teste
```

### Escrever Testes

**Teste Unitário de Tool**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { GetPatrimonioTool } from '../src/tools/GetPatrimonioTool';

describe('GetPatrimonioTool', () => {
  it('deve retornar patrimônio quando número válido', async () => {
    const tool = new GetPatrimonioTool();
    const context = createMockContext();

    const result = await tool.execute(
      { numero: 'PAT-001' },
      context
    );

    expect(result.isError).toBe(false);
    expect(JSON.parse(result.content[0].text)).toHaveProperty('id');
  });

  it('deve retornar erro quando número inválido', async () => {
    const tool = new GetPatrimonioTool();
    const context = createMockContext();

    const result = await tool.execute(
      { numero: '' },
      context
    );

    expect(result.isError).toBe(true);
  });
});
```

**Teste de Service com Mock**:
```typescript
import { describe, it, expect, vi } from 'vitest';
import { PatrimonioService } from '../src/services/patrimonioService';

// Mock do undici
vi.mock('undici', () => ({
  fetch: vi.fn()
}));

describe('PatrimonioService', () => {
  it('deve fazer requisição com headers corretos', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', numero: 'PAT-001' })
    });

    const service = new PatrimonioService('http://api.test', 'token123');
    await service.fetchPatrimonio('PAT-001');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/patrimonio/PAT-001'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token123'
        })
      })
    );
  });
});
```

### Coverage

- Mantenha coverage > 80%
- Novas features devem ter testes

```bash
npm run test:coverage
```

## 📚 Documentação

### Quando Documentar

**Sempre**:
- APIs públicas (funções, classes, métodos)
- Decisões arquiteturais complexas
- Comportamentos não-óbvios

**Opcional**:
- Código auto-explicativo
- Funções privadas simples

### Onde Documentar

1. **JSDoc**: No código, para APIs
2. **README.md**: Visão geral, instalação
3. **docs/API.md**: Referência de API
4. **docs/EXAMPLES.md**: Exemplos de uso
5. **docs/ARCHITECTURE.md**: Arquitetura

### Atualizar Documentação

Ao fazer mudanças, verifique se precisa atualizar:

- [ ] README.md (se API pública mudou)
- [ ] docs/API.md (se ferramentas mudaram)
- [ ] docs/EXAMPLES.md (se comportamento mudou)
- [ ] JSDoc (se assinatura mudou)
- [ ] CHANGELOG.md (sempre!)

## 🔍 Review de Código

### Como Revisor

**Foque em**:
- ✅ Lógica está correta?
- ✅ Código segue padrões?
- ✅ Testes cobrem cenários?
- ✅ Documentação está atualizada?
- ✅ Performance é adequada?
- ✅ Segurança está ok?

**Feedback Construtivo**:
```
// ✅ Bom feedback
"Esta função pode ser simplificada usando map() em vez de forEach().
Exemplo: items.map(i => i.value)"

// ❌ Feedback ruim
"Este código está ruim. Reescreva."
```

**Aprove se**:
- Tudo ok, ou apenas pequenos nits
- Mudanças sugeridas são opcionais

**Request Changes se**:
- Bugs críticos
- Falta de testes
- Breaking changes não documentadas

### Como Autor

**Responda a Feedback**:
- Seja receptivo
- Explique decisões se necessário
- Faça mudanças sugeridas ou argumente

**Atualize PR**:
```bash
# Faça mudanças
git add .
git commit -m "refactor: aplica sugestões do review"
git push origin feature/nome-da-feature
```

## 🚀 Checklist de Contribuição

Antes de submeter PR, verifique:

- [ ] Código compila sem erros (`npm run build`)
- [ ] Testes passam (`npm test`)
- [ ] Coverage adequado (`npm run test:coverage`)
- [ ] Sem warnings de TypeScript (`npm run typecheck`)
- [ ] Código formatado (se houver linter configurado)
- [ ] Commits seguem convenções
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] .env.example atualizado (se novas variáveis)
- [ ] PR tem descrição clara
- [ ] Screenshots/GIFs se mudança visual

## 📞 Obtendo Ajuda

**Stuck?** Não hesite em pedir ajuda!

- **Issues**: Abra uma issue com suas dúvidas
- **Discussions**: Use GitHub Discussions para perguntas gerais
- **Email**: [Mantenedores do projeto]

## 🎉 Reconhecimento

Contribuidores serão listados em:
- `CONTRIBUTORS.md`
- Releases notes
- Agradecimentos especiais para contribuições significativas

---

**Obrigado por contribuir com MCP Patrimônio!** 🚀

Suas contribuições ajudam a tornar este projeto melhor para todos.
