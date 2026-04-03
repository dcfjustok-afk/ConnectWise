# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

# ---- Production Stage ----
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# 仅安装生产依赖
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 复制构建产物
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "dist/main.js"]
