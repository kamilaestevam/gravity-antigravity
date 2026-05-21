FROM node:22-slim

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy everything (monorepo)
COPY . .

# Install all dependencies including devDependencies (needed for build tools + tsx)
RUN npm ci --include=dev

# Build workspace packages required by sidecars (symlink resolves to packages/)
RUN cd packages/resolver-organizacao && npx tsup

# Generate Prisma clients
RUN npx prisma generate --schema=configurador/prisma/schema.prisma
RUN npx prisma generate --schema=servicos-global/servicos-plataforma/prisma/schema.prisma
RUN npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma
RUN npx prisma generate --schema=servicos-global/produto/pedido/prisma/schema.prisma

# Pedido uses default Prisma output (node_modules/.prisma/client) — copy to root
RUN mkdir -p node_modules/.prisma \
    && cp -r servicos-global/produto/pedido/node_modules/.prisma/client node_modules/.prisma/client

# Vite embeds VITE_* env vars at build time — Railway passes them as build args
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build Vite frontend
RUN cd servicos-global/configurador && npx vite build && cd ../..

# Fix Vite nested index.html (root=monorepoRoot preserves input path structure)
RUN mv servicos-global/configurador/dist/servicos-global/configurador/index.html servicos-global/configurador/dist/index.html \
    && rm -rf servicos-global/configurador/dist/servicos-global

# Create tsx loader
RUN bash scripts/build-esm.sh servicos-global/configurador/server/index.ts servicos-global/configurador/dist/server.mjs

EXPOSE 8005

CMD ["node", "servicos-global/configurador/dist/server.mjs"]
