# Etapa 1: Build (compilar TypeScript e gerar Prisma Client)
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

RUN corepack enable && pnpm install --frozen-lockfile

RUN npx prisma generate
RUN pnpm run build

# Etapa 2: Imagem final para produção
FROM node:lts-slim

WORKDIR /app

# Instala pnpm corretamente
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
RUN npx puppeteer browsers install chrome

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/server.js"]