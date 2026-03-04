# ---------- Etapa 1: Build ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas os arquivos de dependência primeiro (melhora cache)
COPY package.json package-lock.json* ./

RUN npm install

# Copia o restante do projeto
COPY . .

# Gera build de produção
RUN npm run build


# ---------- Etapa 2: Runtime ----------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o necessário do build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["npm", "start"]