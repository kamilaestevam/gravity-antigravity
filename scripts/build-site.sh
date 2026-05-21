#!/bin/bash
# build-site.sh — Full build pipeline for site-usegravity (Railway)
#
# This script runs as the Custom Build Command on Railway.
# It handles: npm ci, prisma generate, vite build, and tsx loader creation.
set -e

echo "[build-site] Starting full build pipeline..."

# 1. Install all dependencies (including devDependencies for build tools)
npm ci --include=dev

# 2. Generate Prisma clients for all databases
npx prisma generate --schema=configurador/prisma/schema.prisma
npx prisma generate --schema=servicos-global/servicos-plataforma/prisma/schema.prisma
npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma
npx prisma generate --schema=servicos-global/produto/pedido/prisma/schema.prisma

# 2b. Pedido's schema outputs to pedido/node_modules/.prisma/client/ but
#     @prisma/client at root does require('.prisma/client') from root.
#     Other services use custom output="../generated" so root is free.
mkdir -p node_modules/.prisma
cp -r servicos-global/produto/pedido/node_modules/.prisma/client node_modules/.prisma/client

# 3. Build Vite frontend
cd servicos-global/configurador
npx vite build
cd ../..

# 4. Fix Vite nested index.html
# When root=monorepoRoot, Vite preserves the input path structure in outDir.
# Move index.html from nested path to dist root where Express expects it.
mv servicos-global/configurador/dist/servicos-global/configurador/index.html servicos-global/configurador/dist/index.html
rm -rf servicos-global/configurador/dist/servicos-global

# 5. Create tsx loader for the server
bash scripts/build-esm.sh servicos-global/configurador/server/index.ts servicos-global/configurador/dist/server.mjs

echo "[build-site] Build pipeline complete!"
