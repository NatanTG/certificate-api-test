# Multi-stage build para otimizar tamanho da imagem
FROM node:20-alpine AS dependencies

# Instalar dependências do sistema necessárias para node-forge e bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl-dev

# Criar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências de produção
RUN npm ci --only=production && npm cache clean --force

# Gerar cliente Prisma
RUN npx prisma generate

# Stage de build
FROM node:20-alpine AS builder

# Instalar dependências do sistema
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    openssl-dev

WORKDIR /app

# Copiar arquivos de dependências e instalar todas as dependências
COPY package*.json ./
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Remover devDependencies
RUN npm prune --production

# Stage de produção
FROM node:20-alpine AS production

# Instalar apenas as dependências mínimas do sistema
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar aplicação built e dependências
COPY --from=dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --chown=nestjs:nodejs prisma ./prisma/

# Criar diretórios necessários
RUN mkdir -p uploads temp logs && \
    chown -R nestjs:nodejs uploads temp logs

# Expor porta
EXPOSE 3000

# Usar usuário não-root
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Usar dumb-init para handling de signals
ENTRYPOINT ["dumb-init", "--"]

# Comando padrão
CMD ["node", "dist/main.js"]