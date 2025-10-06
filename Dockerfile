# Multi-stage build para otimizar tamanho da imagem

# Stage 1: Build
FROM node:22.15.0-alpine AS builder

# Instalar dependências necessárias para build
RUN apk add --no-cache python3 make g++

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.json ./

# Instalar dependências (incluindo devDependencies para build)
# --ignore-scripts previne execução de "prepare" antes de copiar src/
# Tenta npm ci primeiro, se falhar usa npm install
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copiar código fonte
COPY src ./src

# Build do TypeScript
RUN npm run build

# Remover devDependencies
RUN npm prune --production

# Stage 2: Production
FROM node:22.15.0-alpine AS production

# Adicionar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas o necessário do stage de build
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production \
    LOG_LEVEL=info

# Mudar para usuário não-root
USER nodejs

# Expor porta (apenas para documentação, MCP usa stdio)
# EXPOSE 3000

# Labels para metadados
LABEL maintainer="aipfLab Jads" \
      version="0.2.0" \
      description="Servidor MCP para gestão de patrimônio" \
      org.opencontainers.image.source="https://github.com/seu-usuario/mcppatrimonio"

# Health check (verifica se o processo está rodando)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "process.exit(0)" || exit 1

# Comando de inicialização
CMD ["node", "dist/index.js"]
