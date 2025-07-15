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
 && apt-get clean && rm -rf /var/lib/apt/lists/*

 RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
      --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# RUN npm init -y &&  \
#     npm i puppeteer \
#     # Add user so we don't need --no-sandbox.
#     # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
#     && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
#     && mkdir -p /home/pptruser/Downloads \
#     && chown -R pptruser:pptruser /home/pptruser \
#     && chown -R pptruser:pptruser /node_modules \
#     && chown -R pptruser:pptruser /package.json \
#     && chown -R pptruser:pptruser /package-lock.json

# Run everything after as non-privileged user.
# USER pptruser

# Define o path do Chrome que Puppeteer vai usar

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