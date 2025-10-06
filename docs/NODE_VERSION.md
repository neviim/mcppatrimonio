# Node.js Version Management - MCP Patrimônio

Guia para gerenciar a versão do Node.js no projeto MCP Patrimônio.

## 📋 Versão em Produção

**Node.js v22.15.0** é a versão oficial para produção do MCP Patrimônio.

### Por que Node.js 22.15.0?

- ✅ **Performance**: Melhorias significativas no V8 engine
- ✅ **Segurança**: Patches de segurança mais recentes
- ✅ **Features Modernas**: Suporte completo para ECMAScript 2024
- ✅ **Estabilidade**: Versão LTS com suporte de longo prazo
- ✅ **Compatibilidade**: Total compatibilidade com dependências do projeto

## 🔧 Instalação do Node.js 22.15.0

### Usando NVM (Recomendado)

**Linux/macOS**:
```bash
# Instalar NVM (se não tiver)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Recarregar shell
source ~/.bashrc  # ou ~/.zshrc

# Instalar Node.js 22.15.0
nvm install 22.15.0

# Usar como padrão
nvm alias default 22.15.0

# Verificar
node --version
# Deve mostrar: v22.15.0
```

**Windows (nvm-windows)**:
```powershell
# Baixe e instale de: https://github.com/coreybutler/nvm-windows/releases

# Após instalação:
nvm install 22.15.0
nvm use 22.15.0

# Verificar
node --version
# Deve mostrar: v22.15.0
```

### Instalação Direta

**Download Oficial**:
1. Acesse https://nodejs.org/dist/v22.15.0/
2. Baixe o instalador para seu sistema operacional:
   - Windows: `node-v22.15.0-x64.msi`
   - macOS: `node-v22.15.0.pkg`
   - Linux: `node-v22.15.0-linux-x64.tar.gz`
3. Execute o instalador

**Verificação**:
```bash
node --version
# Saída: v22.15.0

npm --version
# Saída: 10.x.x
```

## 📁 Arquivos de Configuração de Versão

### .nvmrc

Usado pelo NVM para definir versão automaticamente:

```
22.15.0
```

**Uso**:
```bash
# Na raiz do projeto
cd mcppatrimonio

# NVM carrega automaticamente
nvm use

# Ou manualmente
nvm use 22.15.0
```

### .node-version

Usado por outras ferramentas de versionamento (nodenv, asdf):

```
22.15.0
```

**Uso com asdf**:
```bash
# Instalar plugin Node.js
asdf plugin add nodejs

# Instalar versão
asdf install nodejs 22.15.0

# Usar no projeto
cd mcppatrimonio
asdf local nodejs 22.15.0
```

### package.json

Define requisitos de versão:

```json
{
  "engines": {
    "node": ">=22.15.0",
    "npm": ">=10.0.0"
  }
}
```

## 🐳 Node.js no Docker

### Dockerfile

O projeto usa Node.js 22.15.0 Alpine no Docker:

```dockerfile
# Build stage
FROM node:22.15.0-alpine AS builder

# Production stage
FROM node:22.15.0-alpine AS production
```

**Benefícios da imagem Alpine**:
- ✅ Tamanho reduzido (~50MB vs ~350MB)
- ✅ Segurança (menos vetores de ataque)
- ✅ Performance (menos overhead)

### Verificar Versão no Container

```bash
# Ver versão Node.js no container
docker exec mcppatrimonio-server node --version
# Saída: v22.15.0

# Ver versão npm
docker exec mcppatrimonio-server npm --version
# Saída: 10.x.x
```

## 🔄 Migração de Versões

### De Node.js 18 para 22.15.0

Se você estava usando Node.js 18:

**1. Backup**:
```bash
# Backup de node_modules
mv node_modules node_modules.bak

# Backup de package-lock.json
cp package-lock.json package-lock.json.bak
```

**2. Instalar Node.js 22.15.0**:
```bash
nvm install 22.15.0
nvm use 22.15.0
```

**3. Reinstalar Dependências**:
```bash
# Limpar cache
npm cache clean --force

# Remover arquivos antigos
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

**4. Testar**:
```bash
# Type check
npm run typecheck

# Testes
npm test

# Build
npm run build

# Executar
npm start
```

### Breaking Changes

Node.js 22 é compatível com Node.js 18, mas algumas mudanças:

**Melhorias**:
- ✅ Fetch API nativa (já usado via undici)
- ✅ Performance do V8 melhorada
- ✅ Suporte a ES Modules otimizado
- ✅ Novas APIs de teste nativas

**Sem Breaking Changes** para o MCP Patrimônio:
- ✅ Todas as dependências compatíveis
- ✅ Código TypeScript compatível
- ✅ APIs usadas estão estáveis

## 🧪 Testes de Compatibilidade

### Teste Local

```bash
# Verificar versão
node --version

# Instalar dependências
npm install

# Type check
npm run typecheck

# Testes unitários
npm test

# Build
npm run build

# Executar
npm start
```

### Teste Docker

```bash
# Build da imagem
docker compose build

# Executar
docker compose up -d

# Verificar versão no container
docker exec mcppatrimonio-server node --version

# Ver logs
docker compose logs -f

# Testar saúde
docker inspect mcppatrimonio-server --format='{{.State.Health.Status}}'
```

## 📊 Comparação de Versões

| Feature | Node.js 18 | Node.js 22.15.0 |
|---------|-----------|-----------------|
| V8 Engine | 10.2 | 12.4 |
| Performance | Baseline | +15% |
| Fetch API | Experimental | Estável |
| Test Runner | Experimental | Estável |
| ES Modules | Estável | Otimizado |
| Segurança | LTS | LTS + patches |
| Suporte até | 2025-04-30 | 2027-04-30 |

## 🔐 Segurança

### Verificar Vulnerabilidades

```bash
# Audit de dependências
npm audit

# Fix automático
npm audit fix

# Ver detalhes
npm audit --json
```

### Atualizar Node.js

```bash
# Com NVM
nvm install 22.15.0
nvm alias default 22.15.0

# Verificar
node --version
```

## 🚀 CI/CD

### GitHub Actions

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [22.15.0]
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### GitLab CI

```yaml
image: node:22.15.0-alpine

stages:
  - test
  - build

test:
  stage: test
  script:
    - npm ci
    - npm test

build:
  stage: build
  script:
    - npm run build
```

## 🆘 Troubleshooting

### Versão Incorreta

**Problema**: `node --version` mostra versão diferente

**Solução**:
```bash
# Com NVM
nvm use 22.15.0

# Verificar
node --version

# Definir como padrão
nvm alias default 22.15.0
```

### Erro de Engines

**Problema**: `npm install` falha com erro de engines

**Solução**:
```bash
# Verificar versão atual
node --version

# Se < 22.15.0, atualizar
nvm install 22.15.0
nvm use 22.15.0

# Reinstalar
npm install
```

### Incompatibilidade de Dependências

**Problema**: Dependências não instalam

**Solução**:
```bash
# Limpar tudo
rm -rf node_modules package-lock.json
npm cache clean --force

# Reinstalar com versão correta
nvm use 22.15.0
npm install
```

## 📚 Recursos

- [Node.js 22 Release Notes](https://nodejs.org/en/blog/release/v22.15.0)
- [Node.js LTS Schedule](https://nodejs.org/en/about/releases/)
- [NVM Repository](https://github.com/nvm-sh/nvm)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 🔄 Atualização Futura

Para atualizar para versões futuras do Node.js:

1. Verificar [Node.js Releases](https://nodejs.org/en/about/releases/)
2. Testar em ambiente de desenvolvimento
3. Atualizar `.nvmrc` e `.node-version`
4. Atualizar `package.json` engines
5. Atualizar `Dockerfile`
6. Atualizar documentação
7. Testar CI/CD
8. Deploy gradual em produção

---

**Documentação de Versão do Node.js Completa**

Versão oficial: **Node.js v22.15.0**
