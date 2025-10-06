# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.2.0] - 2025-10-06

### Adicionado
- 🐳 **Suporte completo para Docker**
  - Dockerfile otimizado com multi-stage build
  - docker-compose.yml para orquestração
  - Imagem Alpine Linux (~150MB)
  - Health checks configurados
  - Resource limits

- 📚 **Documentação Completa**
  - README.md principal com visão geral
  - docs/INSTALLATION.md - Guia de instalação
  - docs/DOCKER.md - Guia Docker completo
  - docs/DOCKER_QUICK_START.md - Quick start Docker
  - docs/API.md - Referência da API
  - docs/EXAMPLES.md - Exemplos de uso
  - docs/ARCHITECTURE.md - Arquitetura do sistema
  - docs/NODE_VERSION.md - Gerenciamento de versão Node.js
  - BUILD.md - Guia de build
  - DEPLOY.md - Guia de deploy em produção
  - CONTRIBUTING.md - Guia de contribuição

- 🔧 **Scripts de Automação**
  - scripts/docker-build.sh (Linux/macOS)
  - scripts/docker-build.bat (Windows)
  - docker/healthcheck.sh
  - docker/entrypoint.sh

- ⚙️ **Arquivos de Configuração**
  - .nvmrc - Controle de versão Node.js
  - .node-version - Compatibilidade com ferramentas
  - .dockerignore - Otimização de build Docker

- 🛠️ **9 Ferramentas MCP**
  - neviim_info - Informações do servidor
  - neviim_get_patrimonio - Buscar por número
  - neviim_get_patrimonios_por_setor - Listar por setor
  - neviim_get_patrimonios_por_usuario - Listar por usuário
  - neviim_get_patrimonio_por_id - Buscar por ID
  - neviim_update_patrimonio - Atualizar patrimônio
  - neviim_create_patrimonio - Criar patrimônio
  - neviim_get_estatisticas - Estatísticas agregadas
  - neviim_get_version - Versão do sistema

### Alterado
- ⬆️ **Atualizado Node.js para v22.15.0**
  - Migrado de Node.js 18 para 22.15.0
  - Atualizado @types/node para ^22.15.0
  - Engines em package.json atualizados

- 🏷️ **Renomeação do Projeto**
  - Nome alterado de "mcpneviim" para "mcppatrimonio"
  - Nome de exibição: "MCP Patrimônio"
  - Binário: mcppatrimonio
  - Imagem Docker: mcppatrimonio:latest
  - Container: mcppatrimonio-server
  - Network: mcppatrimonio-network

- 📝 **Melhorias na Documentação**
  - Exemplos de uso atualizados
  - Badges adicionados ao README
  - Links entre documentos
  - Troubleshooting expandido

### Corrigido
- 🐛 **Dockerfile**
  - Removida cópia de tsconfig.test.json (desnecessário)
  - COPY explícito de package.json e package-lock.json

- 🐛 **.dockerignore**
  - Removido package-lock.json da lista de exclusão
  - Mantém npm ci funcionando corretamente

### Segurança
- 🔒 **Usuário Não-Root no Docker**
  - Container executa como usuário nodejs (uid 1001)
  - Melhor isolamento de segurança

- 🔒 **Validação de Entrada**
  - Schemas Zod para todas as ferramentas
  - Validação automática de parâmetros

## [0.1.0] - 2025-10-03

### Adicionado
- 🎉 Versão inicial do projeto
- ⚙️ Configuração básica TypeScript
- 🧪 Setup de testes com Vitest
- 📦 Dependências principais:
  - @modelcontextprotocol/sdk
  - dotenv
  - undici
  - zod
- 🏗️ Arquitetura em camadas
- 🔧 Ferramentas básicas MCP

---

## Tipos de Mudanças

- **Adicionado** - para novas funcionalidades
- **Alterado** - para mudanças em funcionalidades existentes
- **Descontinuado** - para funcionalidades que serão removidas
- **Removido** - para funcionalidades removidas
- **Corrigido** - para correções de bugs
- **Segurança** - para correções de vulnerabilidades

## Links

- [0.2.0] - 2025-10-06
- [0.1.0] - 2025-10-03
