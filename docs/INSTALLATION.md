# Guia de Instalação - MCP Patrimônio

Este guia fornece instruções detalhadas para instalar e configurar o servidor MCP Patrimônio em diferentes ambientes.

## 📋 Índice

- [Requisitos do Sistema](#requisitos-do-sistema)
- [Instalação Local](#instalação-local)
- [Instalação para Desenvolvimento](#instalação-para-desenvolvimento)
- [Configuração com Claude Desktop](#configuração-com-claude-desktop)
- [Configuração com Outros Clientes MCP](#configuração-com-outros-clientes-mcp)
- [Verificação da Instalação](#verificação-da-instalação)
- [Solução de Problemas](#solução-de-problemas)

## 🖥️ Requisitos do Sistema

### Requisitos Mínimos

- **Node.js**: >= 22.15.0 (versão LTS recomendada para produção)
- **npm**: >= 10.0.0 (ou yarn >= 1.22.0)
- **Sistema Operacional**: Windows 10+, macOS 10.15+, ou Linux (Ubuntu 20.04+)
- **RAM**: 512 MB disponível
- **Espaço em Disco**: 100 MB

### Requisitos de API

- URL da API de patrimônio acessível
- Token de autenticação válido
- Conectividade de rede para API

### Verificar Node.js

```bash
node --version
# Saída esperada: v22.15.0 ou superior

npm --version
# Saída esperada: 10.x.x ou superior
```

Se não tiver Node.js instalado, baixe de: https://nodejs.org/

## 🚀 Instalação Local

### Passo 1: Clonar o Repositório

```bash
# Clone via HTTPS
git clone https://github.com/seu-usuario/mcppatrimonio.git

# OU via SSH
git clone git@github.com:seu-usuario/mcppatrimonio.git

# Entre no diretório
cd mcppatrimonio
```

### Passo 2: Instalar Dependências

```bash
npm install
```

Este comando instalará todas as dependências necessárias:
- `@modelcontextprotocol/sdk`: SDK do MCP
- `dotenv`: Gerenciamento de variáveis de ambiente
- `undici`: Cliente HTTP de alta performance
- `zod`: Validação de schemas

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar o arquivo .env
# Windows: notepad .env
# macOS/Linux: nano .env
```

Configure as variáveis obrigatórias:

```env
PATRIMONIO_BASE_URL=https://sua-api.com
PATRIMONIO_TOKEN=seu_token_secreto_aqui
NODE_ENV=production
LOG_LEVEL=info
```

### Passo 4: Build do Projeto

```bash
npm run build
```

Este comando:
- Compila TypeScript para JavaScript
- Gera arquivos na pasta `dist/`
- Valida tipos e sintaxe

### Passo 5: Testar a Instalação

```bash
# Executar o servidor diretamente
npm start

# Ou usando node
node dist/index.js
```

Se tudo estiver correto, você verá:
```
[INFO] Starting Patrimonio MCP Server...
[INFO] Environment: production
[INFO] Log Level: info
[INFO] MCP Server initialized: neviim v0.2.0
[INFO] Registered 9 tools
[INFO] MCP Server connected successfully
[INFO] Patrimonio MCP Server is running
```

## 🔧 Instalação para Desenvolvimento

### Setup Completo de Dev

```bash
# 1. Clone e entre no diretório
git clone https://github.com/seu-usuario/mcppatrimonio.git
cd mcppatrimonio

# 2. Instale dependências
npm install

# 3. Configure ambiente de desenvolvimento
cp .env.example .env
# Edite .env e configure NODE_ENV=development

# 4. Instale ferramentas de desenvolvimento (opcional)
npm install -g nodemon typescript

# 5. Execute em modo desenvolvimento
npm run dev:watch
```

### Scripts de Desenvolvimento

```bash
# Build com watch (recompila automaticamente)
npm run build:watch

# Servidor com auto-reload
npm run dev:watch

# Testes em watch mode
npm run test:watch

# Testes com interface UI
npm run test:ui

# Type checking sem build
npm run typecheck
```

### Estrutura de Pastas Após Build

```
mcppatrimonio/
├── node_modules/      # Dependências instaladas
├── dist/              # Código compilado (JS)
│   ├── config/
│   ├── core/
│   ├── handlers/
│   ├── middleware/
│   ├── services/
│   ├── tools/
│   ├── utils/
│   └── index.js       # Entry point compilado
├── src/               # Código fonte (TS)
├── tests/             # Testes
├── .env               # Suas configurações (não commitado)
└── .env.example       # Exemplo de configurações
```

## 🖱️ Configuração com Claude Desktop

### Windows

#### Passo 1: Localizar Arquivo de Configuração

O arquivo de configuração está em:
```
%APPDATA%\Claude\claude_desktop_config.json
```

Caminho completo típico:
```
C:\Users\SeuUsuario\AppData\Roaming\Claude\claude_desktop_config.json
```

#### Passo 2: Editar Configuração

Abra o arquivo com um editor de texto e adicione:

```json
{
  "mcpServers": {
    "neviim": {
      "command": "node",
      "args": [
        "C:\\Users\\SeuUsuario\\Developer\\mcppatrimonio\\dist\\index.js"
      ],
      "env": {
        "PATRIMONIO_BASE_URL": "https://sua-api.com",
        "PATRIMONIO_TOKEN": "seu_token_aqui",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

**⚠️ Importante no Windows**:
- Use barras invertidas duplas (`\\`) nos caminhos
- Ou use barras normais (`/`)
- Substitua `SeuUsuario` pelo seu nome de usuário real

#### Passo 3: Reiniciar Claude Desktop

1. Feche completamente o Claude Desktop
2. Abra novamente
3. O servidor MCP será iniciado automaticamente

### macOS

#### Passo 1: Localizar Arquivo de Configuração

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

#### Passo 2: Editar Configuração

```bash
# Abrir com editor de texto
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Adicione:

```json
{
  "mcpServers": {
    "neviim": {
      "command": "node",
      "args": [
        "/Users/seuusuario/Developer/mcppatrimonio/dist/index.js"
      ],
      "env": {
        "PATRIMONIO_BASE_URL": "https://sua-api.com",
        "PATRIMONIO_TOKEN": "seu_token_aqui",
        "NODE_ENV": "production",
        "LOG_LEVEL": "info"
      }
    }
  }
}
```

#### Passo 3: Reiniciar Claude Desktop

```bash
# Fechar Claude Desktop
killall "Claude"

# Reabrir Claude Desktop
open -a "Claude"
```

### Linux

#### Passo 1: Localizar Arquivo de Configuração

```bash
~/.config/Claude/claude_desktop_config.json
```

#### Passo 2: Editar Configuração

```bash
nano ~/.config/Claude/claude_desktop_config.json
```

Adicione a mesma configuração do macOS.

### Verificar Integração com Claude

1. Abra Claude Desktop
2. Inicie uma nova conversa
3. Digite: "Quais ferramentas MCP estão disponíveis?"
4. Você deverá ver as 9 ferramentas do Neviim listadas

Ou tente diretamente:
```
Use a ferramenta neviim_info para me mostrar informações do servidor
```

## 🔌 Configuração com Outros Clientes MCP

### Cliente MCP Genérico (Stdio)

O servidor usa transporte stdio, então pode ser integrado com qualquer cliente MCP:

```javascript
// Exemplo em Node.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/caminho/para/mcppatrimonio/dist/index.js'],
  env: {
    PATRIMONIO_BASE_URL: 'https://sua-api.com',
    PATRIMONIO_TOKEN: 'seu_token',
  },
});

const client = new Client({
  name: 'meu-cliente',
  version: '1.0.0',
}, {
  capabilities: {},
});

await client.connect(transport);
```

### Docker (Opcional)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

```bash
# Build
docker build -t mcppatrimonio .

# Run
docker run -it \
  -e PATRIMONIO_BASE_URL=https://sua-api.com \
  -e PATRIMONIO_TOKEN=seu_token \
  mcppatrimonio
```

## ✅ Verificação da Instalação

### Teste 1: Servidor Inicia

```bash
cd mcppatrimonio
npm start
```

**Sucesso se**: Logs aparecem sem erros e servidor fica rodando

### Teste 2: Ferramentas Registradas

Verifique nos logs:
```
[INFO] Registered 9 tools
```

### Teste 3: Conexão com API

Com o servidor rodando, teste via cliente MCP ou Claude:
```
neviim_get_version
```

Deve retornar informações de versão.

### Teste 4: Autenticação

```
neviim_get_estatisticas
```

Se retornar dados ou erro 401/403, a comunicação está funcionando.

### Script de Verificação

Crie `verify-install.js`:

```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function verify() {
  try {
    // Verifica Node.js
    const { stdout: nodeVersion } = await execAsync('node --version');
    console.log('✅ Node.js:', nodeVersion.trim());

    // Verifica se dist existe
    const { stdout: distCheck } = await execAsync('ls dist/index.js');
    console.log('✅ Build exists');

    // Verifica .env
    const { stdout: envCheck } = await execAsync('test -f .env && echo "exists"');
    console.log('✅ .env file exists');

    console.log('\n✅ Instalação verificada com sucesso!');
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
  }
}

verify();
```

Execute:
```bash
node verify-install.js
```

## 🔧 Solução de Problemas

### Problema: "Cannot find module"

**Causa**: Build não foi executado ou está desatualizado

**Solução**:
```bash
npm run clean
npm run build
```

### Problema: "PATRIMONIO_BASE_URL is required"

**Causa**: Arquivo .env não configurado

**Solução**:
```bash
cp .env.example .env
# Edite .env e configure as variáveis
```

### Problema: "Unauthorized" ou "401"

**Causa**: Token inválido ou expirado

**Solução**:
- Verifique se o token em `.env` está correto
- Verifique se o token não expirou
- Teste o token diretamente na API:
  ```bash
  curl -H "Authorization: Bearer SEU_TOKEN" https://sua-api.com/api/v1/patrimonios
  ```

### Problema: "Connection timeout"

**Causa**: API inacessível ou timeout muito curto

**Solução**:
- Verifique conectividade de rede
- Teste acesso direto à API
- Aumente o timeout em `src/config/constants.ts`:
  ```typescript
  export const HTTP_TIMEOUT = 60000; // 60 segundos
  ```

### Problema: Claude Desktop não vê o servidor

**Causa**: Configuração incorreta do caminho ou formato JSON inválido

**Solução**:
1. Valide o JSON: https://jsonlint.com/
2. Verifique caminho absoluto correto:
   ```bash
   # Windows
   echo %cd%\dist\index.js

   # macOS/Linux
   pwd
   # Concatene com /dist/index.js
   ```
3. Reinicie Claude completamente
4. Verifique logs do Claude em:
   - Windows: `%APPDATA%\Claude\logs\`
   - macOS: `~/Library/Logs/Claude/`

### Problema: "Port already in use"

**Causa**: Servidor stdio não usa portas, mas pode haver conflito de processo

**Solução**:
```bash
# Encontre processos Node.js rodando
# Windows
tasklist | findstr node

# macOS/Linux
ps aux | grep node

# Mate o processo específico
# Windows
taskkill /PID <pid> /F

# macOS/Linux
kill -9 <pid>
```

### Problema: Erros de TypeScript durante build

**Causa**: Versão incompatível ou dependências corrompidas

**Solução**:
```bash
# Limpe tudo
rm -rf node_modules dist package-lock.json

# Reinstale
npm install
npm run build
```

### Logs de Diagnóstico

Para debug detalhado, configure em `.env`:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

Os logs mostrarão:
- Requisições HTTP completas
- Parâmetros de entrada/saída
- Stack traces de erros

### Obter Ajuda

Se o problema persistir:

1. Verifique as issues no GitHub
2. Colete informações:
   ```bash
   node --version
   npm --version
   cat .env (sem revelar tokens)
   npm list
   ```
3. Abra uma issue com todas as informações

## 📚 Próximos Passos

Após instalação bem-sucedida:

1. Leia [API.md](API.md) para entender as ferramentas
2. Veja [EXAMPLES.md](EXAMPLES.md) para casos de uso
3. Configure Rate Limiting conforme necessário
4. Customize o logging para seu ambiente
5. Configure monitoramento (se produção)

---

**Instalação concluída!** 🎉

O servidor MCP Patrimônio está pronto para uso.
