# Etapa 1: Build da aplicação (TypeScript + Prisma)
FROM node:22-alpine AS builder

WORKDIR /app

# Copia somente arquivos essenciais para instalar dependências
COPY package.json pnpm-lock.yaml ./

# Habilita pnpm e instala dependências
RUN corepack enable && pnpm install --frozen-lockfile

# Copia código e arquivos restantes
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Gera Prisma Client e transpila TypeScript
RUN npx prisma generate
RUN pnpm run build


# Etapa 2: Produção leve com Puppeteer + Chrome + OpenSSL
FROM node:22-slim

WORKDIR /app

# Instala dependências do sistema para Puppeteer + OpenSSL
RUN apt-get update && apt-get install -y \
    openssl \
    chromium \
    ca-certificates \
    fonts-liberation \
    google-chrome-stable \
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
 && apt-get clean && rm -rf /var/lib/apt/lists/*

 RUN apt install chromium-browser -y

# Define o path do Chrome que Puppeteer vai usar
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Instala pnpm e dependências de produção
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod --scripts-prepend-node-path=auto


RUN echo "enable-scripts=true" >> .npmrc && pnpm install --frozen-lockfile --prod


# Copia o build da aplicação e o Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]