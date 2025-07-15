# Etapa 1: Build da aplicação
FROM node:22-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
COPY package.json pnpm-lock.yaml ./

# Ativa o corepack e instala dependências
RUN corepack enable && pnpm install --frozen-lockfile

# Copia o restante dos arquivos
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Gera o Prisma Client e builda a aplicação
RUN npx prisma generate
RUN pnpm run build

---

# Etapa 2: Produção com Chromium e OpenSSL
FROM node:22-slim

WORKDIR /app

# Instala dependências do sistema para Puppeteer, Chrome e Prisma
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libu2f-udev \
    xdg-utils \
    wget \
    openssl \
    chromium \
 && apt-get clean \
 && rm -rf /var/lib/apt/lists/*

# Define o path para o Chromium instalado via apt
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Habilita pnpm com scripts liberados
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN echo "enable-scripts=true" >> .npmrc

# Copia arquivos necessários e instala dependências de produção
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --scripts-prepend-node-path=auto

# Copia build e Prisma Client da etapa anterior
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]
