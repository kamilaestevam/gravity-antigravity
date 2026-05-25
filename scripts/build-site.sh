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
npx tsx scripts/ativamente/compose-cadastros-schema.ts
npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma
npx tsx scripts/ativamente/compose-pedido-schema.ts
npx prisma generate --schema=servicos-global/produto/pedido/prisma/schema.prisma

# 2a. Cadastros — migrations (tabela empresa, fornecedor, catálogos globais)
if [ -n "$CADASTROS_DATABASE_URL" ]; then
  echo "[build-site] Applying Cadastros migrations..."
  npx prisma migrate deploy --schema=servicos-global/cadastros/prisma/schema.prisma
else
  echo "[build-site] CADASTROS_DATABASE_URL ausente — skip Cadastros migrations"
fi

# 2b. Pedido — migrations (public template + schemas tenant_*)
if [ -n "$PEDIDO_DATABASE_URL" ]; then
  echo "[build-site] Applying Pedido migrations..."
  CONFIGURADOR_DATABASE_URL="${CONFIGURADOR_DATABASE_URL:-$DATABASE_URL}" \
    npx tsx scripts/ativamente/aplicar-migrations-pedido.ts
else
  echo "[build-site] PEDIDO_DATABASE_URL ausente — skip Pedido migrations (roda no startup do servidor)"
fi

# 2c. Pedido's schema outputs to pedido/node_modules/.prisma/client/ but
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
DIST_NESTED="servicos-global/configurador/dist/servicos-global/configurador/index.html"
DIST_ROOT="servicos-global/configurador/dist/index.html"
if [ -f "$DIST_NESTED" ]; then
  mv "$DIST_NESTED" "$DIST_ROOT"
  rm -rf servicos-global/configurador/dist/servicos-global
elif [ -f "$DIST_ROOT" ]; then
  echo "[build-site] index.html already at dist root"
else
  echo "[build-site] ERROR: index.html not found after vite build"
  ls -la servicos-global/configurador/dist/ || true
  exit 1
fi

# 5. Build all backend servers
# Configurador — tsx loader (cross-service imports + custom Prisma paths)
bash scripts/build-esm.sh servicos-global/configurador/server/index.ts servicos-global/configurador/dist/server.mjs

# Pedido — esbuild bundle (clean dependency graph)
bash scripts/build-esm.sh servicos-global/produto/pedido/server/src/index.ts servicos-global/produto/pedido/dist/server.mjs

# Cadastros — tsx loader (cross-service imports + custom Prisma paths)
bash scripts/build-esm.sh servicos-global/cadastros/server/src/index.ts servicos-global/cadastros/dist/server.mjs

echo "[build-site] Build pipeline complete!"
