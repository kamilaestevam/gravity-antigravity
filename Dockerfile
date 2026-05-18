FROM node:22-slim

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install all dependencies including devDependencies (needed for build tools + tsx)
RUN npm ci --include=dev

# Generate Prisma clients
RUN npx prisma generate --schema=configurador/prisma/schema.prisma
RUN npx prisma generate --schema=servicos-global/servicos-plataforma/prisma/schema.prisma
RUN npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma

# Build Vite frontend
RUN cd servicos-global/configurador && npx vite build && cd ../..

# Create tsx loader
RUN bash scripts/build-esm.sh servicos-global/configurador/server/index.ts servicos-global/configurador/dist/server.mjs

EXPOSE 8005

CMD ["node", "servicos-global/configurador/dist/server.mjs"]
