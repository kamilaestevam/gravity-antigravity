#!/bin/bash
# build-site.sh — Full build pipeline for site-usegravity (Railway)
#
# This script runs as the Custom Build Command on Railway.
# It handles: npm ci, prisma generate, vite build, and tsx loader creation.
set -e

echo "[build-site] Starting full build pipeline..."

# 0. Remove stale Vite cache directories that can cause EBUSY lock errors
#    during npm ci when a previous build left them in a busy state.
echo "[build-site] Cleaning stale .vite cache directories..."
find . -name ".vite" -type d -exec rm -rf {} + 2>/dev/null || true

# 1. Install all dependencies (including devDependencies for build tools)
#    --force bypasses file-lock conflicts that surface in Railway's build env.
npm ci --include=dev --force

# 1b. Build workspace packages required by sidecars
echo "[build-site] Building @gravity/resolver-organizacao..."
cd packages/resolver-organizacao && npx tsup && cd ../..
# Ensure dist is available even if npm used copy instead of symlink
cp -r packages/resolver-organizacao/dist node_modules/@gravity/resolver-organizacao/dist

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
