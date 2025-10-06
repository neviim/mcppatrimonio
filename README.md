# MCP Patrimônio - Servidor de Gestão de Patrimônio

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![Node](https://img.shields.io/badge/node-22.15.0-green.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.3.0-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)

Servidor MCP (Model Context Protocol) para gestão de patrimônio desenvolvido para o homeLab Jads. Este projeto fornece uma interface padronizada para interagir com sistemas de controle de patrimônio através do protocolo MCP.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Ferramentas Disponíveis](#ferramentas-disponíveis)
- [Exemplos de Uso](#exemplos-de-uso)
- [Arquitetura](#arquitetura)
- [Desenvolvimento](#desenvolvimento)
- [Testes](#testes)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

## 🎯 Visão Geral

O MCP Patrimônio é um servidor que implementa o Model Context Protocol para fornecer acesso estruturado a dados de patrimônio. Ele atua como uma camada intermediária entre aplicações cliente (como assistentes de IA) e APIs de gestão de patrimônio.

### O que é MCP?

O Model Context Protocol (MCP) é um protocolo padronizado para comunicação entre modelos de IA e ferramentas externas. Ele permite que assistentes de IA executem ações e consultem dados de forma estruturada e segura.

## ✨ Características

- 🔧 **9 Ferramentas MCP**: Conjunto completo de operações CRUD para patrimônio
- 🔐 **Autenticação Bearer Token**: Segurança via token de autenticação
- ✅ **Validação com Zod**: Validação robusta de entrada e saída
- 📊 **Estatísticas**: Análise agregada de dados de patrimônio
- 🚀 **TypeScript**: Desenvolvimento type-safe
- 📝 **Logging Estruturado**: Sistema de logs com diferentes níveis
- ⚡ **Rate Limiting**: Controle de taxa de requisições
- 🧪 **Testes Completos**: Suite de testes com Vitest
- 🔄 **Arquitetura Modular**: Fácil extensão e manutenção

## 📦 Pré-requisitos

- Node.js >= 22.15.0 (versão LTS recomendada para produção)
- npm >= 10.0.0
- Acesso a uma API de patrimônio compatível
- Token de autenticação da API

## 🚀 Instalação

### Instalação Local

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd mcppatrimonio

# Instale as dependências
npm install

# Build do projeto
npm run build
```

### Instalação via Docker (Recomendado para Produção)

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd mcppatrimonio

# Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações

# Build e execute com Docker Compose
docker compose up -d

# Verifique os logs
docker compose logs -f
```

**Veja o [Guia Docker Completo](docs/DOCKER.md)** para instruções detalhadas.

### Instalação via npm (quando publicado)

```bash
npm install -g mcppatrimonio
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:

```bash
cp .env.example .env
```

Configure as seguintes variáveis:

```env
# URL base da API de patrimônio
PATRIMONIO_BASE_URL=https://api.example.com

# Token de autenticação da API
PATRIMONIO_TOKEN=seu_token_aqui

# Ambiente de execução
NODE_ENV=development

# Nível de log (debug, info, warn, error)
LOG_LEVEL=info

# Rate Limiting - Janela de tempo em ms (padrão: 60000)
RATE_LIMIT_WINDOW_MS=60000

# Rate Limiting - Máximo de requisições por janela (padrão: 100)
RATE_LIMIT_MAX_REQUESTS=100
```

### 2. Configuração do Cliente MCP

Para usar com Claude Desktop ou outro cliente MCP, adicione ao arquivo de configuração:

**Claude Desktop (Windows)**
Caminho: `%APPDATA%\Claude\claude_desktop_config.json`

**Claude Desktop (macOS)**
Caminho: `~/Library/Application Support/Claude/claude_desktop_config.json`

#### Opção A: Instalação Local (Node.js)

```json
{
  "mcpServers": {
    "Patrimonio": {
      "command": "node",
      "args": [
        "C:\\caminho\\completo\\para\\mcppatrimonio\\dist\\index.js"
      ],
      "env": {
        "PATRIMONIO_BASE_URL": "https://api.example.com",
        "PATRIMONIO_TOKEN": "seu_token_aqui",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

#### Opção B: Docker (Recomendado para Produção)

```json
{
  "mcpServers": {
    "Patrimonio": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "--env-file",
        "C:\\caminho\\completo\\para\\mcppatrimonio\\.env",
        "mcppatrimonio:latest"
      ]
    }
  }
}
```

**Nota**: Para Docker, certifique-se de que a imagem foi construída com `docker compose build` ou `docker build -t mcppatrimonio:latest .`

## 🛠️ Ferramentas Disponíveis

O servidor disponibiliza 9 ferramentas MCP:

### 1. neviim_info
Retorna informações sobre o servidor MCP.

**Parâmetros**: Nenhum

**Retorno**: Informações do servidor, versão, descrição

### 2. neviim_get_patrimonio
Obtém informações de um patrimônio específico pelo número.

**Parâmetros**:
- `numero` (string): Número do patrimônio

**Retorno**: Objeto Patrimonio completo

### 3. neviim_get_patrimonios_por_setor
Lista todos os patrimônios de um setor específico.

**Parâmetros**:
- `setor` (string): Nome do setor

**Retorno**: Array de objetos Patrimonio

### 4. neviim_get_patrimonios_por_usuario
Lista todos os patrimônios associados a um usuário.

**Parâmetros**:
- `usuario` (string): Nome do usuário

**Retorno**: Array de objetos Patrimonio

### 5. neviim_get_patrimonio_por_id
Obtém um patrimônio pelo ID único.

**Parâmetros**:
- `id` (string): ID do patrimônio

**Retorno**: Objeto Patrimonio

### 6. neviim_update_patrimonio
Atualiza os dados de um patrimônio existente.

**Parâmetros**:
- `id` (string): ID do patrimônio
- `data` (object): Dados a serem atualizados

**Retorno**: Objeto Patrimonio atualizado

### 7. neviim_create_patrimonio
Cria um novo registro de patrimônio.

**Parâmetros**:
- `data` (object): Dados do novo patrimônio

**Retorno**: Objeto Patrimonio criado

### 8. neviim_get_estatisticas
Retorna estatísticas agregadas sobre os patrimônios.

**Parâmetros**: Nenhum

**Retorno**: Estatísticas (total, por setor, por tipo, por locação)

### 9. neviim_get_version
Retorna informações de versão do sistema.

**Parâmetros**: Nenhum

**Retorno**: Versão do servidor e timestamp

## 📚 Exemplos de Uso

### Exemplo 1: Consultar Patrimônio pelo Número

```typescript
// Via Claude Desktop ou cliente MCP
// Use a ferramenta: neviim_get_patrimonio

{
  "numero": "PAT-001"
}

// Resposta:
{
  "id": "abc123",
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

### Exemplo 2: Listar Patrimônios por Setor

```typescript
// Use a ferramenta: neviim_get_patrimonios_por_setor

{
  "setor": "TI"
}

// Resposta: Array com todos os patrimônios do setor TI
```

### Exemplo 3: Criar Novo Patrimônio

```typescript
// Use a ferramenta: neviim_create_patrimonio

{
  "data": {
    "numero": "PAT-123",
    "setor": "RH",
    "usuario": "Maria Santos",
    "tipoEquipamento": "Desktop",
    "locacao": "Sala 205",
    "descricao": "HP EliteDesk 800 G6",
    "valor": 2800.00,
    "dataAquisicao": "2024-10-06"
  }
}

// Resposta: Objeto do patrimônio criado com ID
```

### Exemplo 4: Atualizar Patrimônio

```typescript
// Use a ferramenta: neviim_update_patrimonio

{
  "id": "abc123",
  "data": {
    "usuario": "Pedro Costa",
    "locacao": "Sala 102"
  }
}

// Resposta: Objeto do patrimônio atualizado
```

### Exemplo 5: Obter Estatísticas

```typescript
// Use a ferramenta: neviim_get_estatisticas

{}

// Resposta:
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
    "Sala 201": 12
  },
  "valorTotal": 425000.00
}
```

## 🏗️ Arquitetura

### Estrutura de Pastas

```
mcppatrimonio/
├── src/
│   ├── config/          # Configurações (env, constantes)
│   ├── core/            # Núcleo (MCPServer, types)
│   ├── handlers/        # Handlers (Tool, Resource)
│   ├── middleware/      # Middleware (validator, errorHandler)
│   ├── services/        # Services (patrimonio, estatisticas, version)
│   ├── tools/           # Ferramentas MCP
│   ├── utils/           # Utilitários (logger, security)
│   └── index.ts         # Entry point
├── tests/               # Testes
├── dist/                # Build output
├── .env.example         # Exemplo de configuração
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### Fluxo de Dados

```
Cliente MCP (Claude)
      ↓
MCP Server (stdio)
      ↓
Tool Handler
      ↓
BaseTool (validação)
      ↓
Service Layer
      ↓
API Externa (HTTP)
```

### Componentes Principais

#### 1. MCPServer (`src/core/MCPServer.ts`)
Gerencia o servidor MCP, conexão stdio e registro de ferramentas.

#### 2. BaseTool (`src/tools/BaseTool.ts`)
Classe abstrata base para todas as ferramentas, fornecendo:
- Validação automática com Zod
- Tratamento de erros padronizado
- Logging estruturado
- Helpers para respostas

#### 3. Services (`src/services/`)
Camada de serviço que encapsula a comunicação com APIs externas:
- `PatrimonioService`: Operações CRUD de patrimônio
- `EstatisticasService`: Agregação de estatísticas
- `VersionService`: Informações de versão

#### 4. Middleware (`src/middleware/`)
- `validator.ts`: Validação com Zod schemas
- `errorHandler.ts`: Tratamento centralizado de erros

## 🧪 Testes

O projeto usa Vitest para testes.

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com UI
npm run test:ui

# Cobertura de testes
npm run test:coverage
```

## 🔧 Desenvolvimento

### Scripts Disponíveis

```bash
# Build do projeto
npm run build

# Build em modo watch
npm run build:watch

# Limpar build
npm run clean

# Iniciar servidor
npm start

# Desenvolvimento (build + start)
npm run dev

# Desenvolvimento com watch
npm run dev:watch

# Type checking
npm run typecheck

# Linter (a configurar)
npm run lint
```

### Criar Nova Ferramenta

1. Crie um arquivo em `src/tools/MinhaFerramentaTool.ts`:

```typescript
import { z } from "zod";
import { BaseTool } from "./BaseTool.js";
import type { MCPToolResult, ToolExecutionContext } from "../core/types.js";

interface MinhaFerramentaParams {
  parametro: string;
}

export class MinhaFerramentaTool extends BaseTool<MinhaFerramentaParams> {
  readonly name = "neviim_minha_ferramenta";
  readonly title = "Minha Ferramenta";
  readonly description = "Descrição da ferramenta";
  readonly inputSchema = z.object({
    parametro: z.string(),
  });

  protected async executeInternal(
    params: MinhaFerramentaParams,
    context: ToolExecutionContext
  ): Promise<MCPToolResult> {
    // Implementação
    const resultado = { /* ... */ };
    return this.success(resultado);
  }
}
```

2. Export em `src/tools/index.ts`
3. Registre em `src/index.ts`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Minha nova feature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use TypeScript
- Siga os padrões ESLint (quando configurado)
- Adicione testes para novas funcionalidades
- Documente APIs públicas com JSDoc
- Use commits semânticos

## 📄 Licença

ISC License - homeLab Jads

## 🙋 Suporte

Para questões e suporte, abra uma issue no repositório do projeto.

## 📦 Deploy em Produção

### Docker (Recomendado)

O projeto está totalmente configurado para Docker:

```bash
# Build da imagem
docker compose build

# Iniciar em produção
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f
```

**Recursos Docker**:
- ✅ Multi-stage build otimizado
- ✅ Imagem Alpine (~150MB)
- ✅ Usuário não-root
- ✅ Health checks configurados
- ✅ Resource limits
- ✅ Auto-restart

**Documentação completa**: [docs/DOCKER.md](docs/DOCKER.md)

### Kubernetes

Exemplo de deployment em Kubernetes disponível em `docs/DOCKER.md`.

## 🔗 Links Úteis

- [Model Context Protocol - Documentação](https://modelcontextprotocol.io/)
- [Anthropic Claude](https://www.anthropic.com/claude)
- [Zod - TypeScript Schema Validation](https://zod.dev/)
- [Vitest - Testing Framework](https://vitest.dev/)
- [Docker Documentation](https://docs.docker.com/)

## 📖 Documentação Adicional

- [Guia de Instalação Completo](docs/INSTALLATION.md)
- [Referência da API](docs/API.md)
- [Exemplos de Uso](docs/EXAMPLES.md)
- [Arquitetura do Sistema](docs/ARCHITECTURE.md)
- [Guia Docker](docs/DOCKER.md)
- [Como Contribuir](CONTRIBUTING.md)

---