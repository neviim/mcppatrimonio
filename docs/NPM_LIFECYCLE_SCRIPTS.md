# NPM Lifecycle Scripts - MCP Patrimônio

Explicação sobre lifecycle scripts do npm e seu impacto no Docker build.

## 🎯 O Problema

### Script `prepare` no package.json

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

Este script é executado **automaticamente** pelo npm em vários momentos, incluindo:
- ✅ Após `npm install`
- ✅ Após `npm ci`
- ✅ Antes de `npm publish`
- ✅ Antes de criar um git dependency

## ⚠️ Impacto no Docker Build

### Ordem de Execução Normal (SEM --ignore-scripts)

```dockerfile
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci  # ← Aqui o problema acontece!
COPY src ./src
RUN npm run build
```

**O que acontece**:

1. ✅ Arquivos copiados: `package.json`, `package-lock.json`, `tsconfig.json`
2. 🔄 `npm ci` inicia
3. 📦 Dependências instaladas
4. ⚡ **npm dispara automaticamente**: `npm run prepare`
5. 🔨 `prepare` executa: `npm run build`
6. 📝 `build` executa: `tsc`
7. ❌ **TypeScript falha**: `error TS18003: No inputs were found in config file`
   - Motivo: `tsconfig.json` procura por arquivos em `src/`
   - Mas `src/` **ainda não foi copiado**!
8. 💥 Build do Docker falha

### Ordem de Execução Corrigida (COM --ignore-scripts)

```dockerfile
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci --ignore-scripts  # ← Scripts desabilitados!
COPY src ./src
RUN npm run build  # ← Build explícito APÓS copiar src/
```

**O que acontece**:

1. ✅ Arquivos copiados: `package.json`, `package-lock.json`, `tsconfig.json`
2. 🔄 `npm ci --ignore-scripts` inicia
3. 📦 Dependências instaladas
4. ⏭️ **Scripts lifecycle ignorados** (incluindo `prepare`)
5. ✅ `npm ci` completa com sucesso
6. ✅ `src/` é copiado
7. 🔨 `npm run build` executado **explicitamente**
8. ✅ TypeScript compila com sucesso (agora `src/` existe)
9. ✅ Build do Docker completa

## 📚 Lifecycle Scripts do NPM

### Scripts Executados Automaticamente

| Script | Quando Executa |
|--------|----------------|
| `preinstall` | Antes de instalar dependências |
| `install`, `postinstall` | Após instalar dependências |
| `prepublish` | Antes de publicar pacote |
| `preprepare` | Antes de `prepare` |
| `prepare` | **Após instalar, antes de empacotar** |
| `postprepare` | Após `prepare` |
| `prepack` | Antes de criar tarball |
| `postpack` | Após criar tarball |

### Scripts Executados Manualmente

| Script | Como Executar |
|--------|---------------|
| `build` | `npm run build` |
| `start` | `npm start` |
| `test` | `npm test` |
| `dev` | `npm run dev` |
| (qualquer outro) | `npm run <nome>` |

## 🔧 Quando Usar `--ignore-scripts`

### ✅ Recomendado em Docker

```dockerfile
# Sempre use --ignore-scripts em Dockerfiles
RUN npm ci --ignore-scripts
RUN npm install --ignore-scripts
```

**Razões**:
- ✅ Controle explícito sobre quando scripts são executados
- ✅ Evita execução prematura de builds
- ✅ Mais previsível e debugável
- ✅ Mais seguro (evita scripts maliciosos em dependências)

### ❌ Não Recomendado em Desenvolvimento Local

```bash
# Em desenvolvimento, scripts são úteis
npm install  # Sem --ignore-scripts
```

**Razões**:
- ✅ `prepare` garante que código está buildado após clone
- ✅ `postinstall` pode configurar ambiente
- ✅ Hooks úteis para desenvolvimento

## 🛠️ Alternativas ao Script `prepare`

### Opção 1: Manter `prepare` (Atual)

```json
{
  "scripts": {
    "prepare": "npm run build"
  }
}
```

**Prós**:
- ✅ Garante código buildado após `git clone` + `npm install`
- ✅ Útil para desenvolvimento

**Contras**:
- ❌ Requer `--ignore-scripts` no Docker
- ❌ Pode confundir novos desenvolvedores

### Opção 2: Remover `prepare`

```json
{
  "scripts": {
    "build": "tsc"
    // "prepare" removido
  }
}
```

**Prós**:
- ✅ Docker build mais simples (não precisa `--ignore-scripts`)
- ✅ Mais explícito

**Contras**:
- ❌ Desenvolvedores precisam lembrar de executar `npm run build`
- ❌ Pode causar erros se esquecerem de buildar

### Opção 3: `prepare` condicional

```json
{
  "scripts": {
    "prepare": "[ \"$NODE_ENV\" = \"production\" ] || npm run build"
  }
}
```

**Prós**:
- ✅ Não executa em produção (Docker)
- ✅ Executa em desenvolvimento

**Contras**:
- ❌ Complexo
- ❌ Depende de variável de ambiente

## ✅ Solução Atual no MCP Patrimônio

**Mantemos** `"prepare": "npm run build"` para desenvolvimento.

**Usamos** `--ignore-scripts` no Dockerfile para produção.

### No Dockerfile

```dockerfile
# Instalar dependências SEM executar scripts
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copiar código fonte
COPY src ./src

# Build EXPLÍCITO após código estar disponível
RUN npm run build
```

### Em Desenvolvimento Local

```bash
# Clone do repositório
git clone <repo>
cd mcppatrimonio

# Install (prepare executa automaticamente)
npm install
# → Dependências instaladas
# → prepare dispara npm run build
# → Código compilado automaticamente

# Pronto para usar
npm start
```

## 🐛 Debug de Lifecycle Scripts

### Ver quais scripts serão executados

```bash
npm run --dry-run
```

### Ver ordem de execução

```bash
npm install --loglevel=silly 2>&1 | grep "lifecycle"
```

### Desabilitar todos os scripts

```bash
npm install --ignore-scripts
```

### Verificar se um script existe

```bash
npm run prepare --if-present
```

## 📖 Recursos

- [npm lifecycle scripts (oficial)](https://docs.npmjs.com/cli/v9/using-npm/scripts#life-cycle-scripts)
- [npm install](https://docs.npmjs.com/cli/v9/commands/npm-install)
- [npm ci](https://docs.npmjs.com/cli/v9/commands/npm-ci)

## 🎯 Resumo

### Problema
- `prepare` executa durante `npm install` no Docker
- Tenta buildar **antes** de `src/` ser copiado
- Causa erro `TS18003`

### Solução
- Usar `--ignore-scripts` no Docker
- Build explícito após copiar código
- Manter `prepare` para desenvolvimento local

### Resultado
- ✅ Docker build funciona
- ✅ Desenvolvimento local continua conveniente
- ✅ Controle total sobre execução de scripts

---

**Documentação de NPM Lifecycle Scripts**

Para troubleshooting Docker, veja [DOCKER_TROUBLESHOOTING.md](../DOCKER_TROUBLESHOOTING.md)
