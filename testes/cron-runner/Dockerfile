FROM mcr.microsoft.com/playwright:v1.44.0-jammy

WORKDIR /app

# Copia apenas o necessário para o cron-runner
COPY package.json package-lock.json ./
RUN npm ci --production

COPY testes/ ./testes/
COPY tsconfig.json ./

# Compila o runner
RUN npx tsx testes/cron-runner/index.ts --dry-run || true

CMD ["npx", "tsx", "testes/cron-runner/index.ts"]
