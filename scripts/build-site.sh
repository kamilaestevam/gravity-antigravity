#!/bin/bash
# build-site.sh — Full build pipeline for site-usegravity (Railway)
#
# This script runs as the Custom Build Command on Railway.
# It handles: npm ci, prisma generate, vite build, and tsx loader creation.
set -e

echo "[build-site] Starting full build pipeline..."

# 1. Install all dependencies (including devDependencies for build tools)
npm ci --include=dev

# 2. Generate Prisma clients for all 3 databases
npx prisma generate --schema=configurador/prisma/schema.prisma
npx prisma generate --schema=servicos-global/servicos-plataforma/prisma/schema.prisma
npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma

# 3. Build Vite frontend
cd servicos-global/configurador
npx vite build
cd ../..

# 4. Create tsx loader for the server
bash scripts/build-esm.sh servicos-global/configurador/server/index.ts servicos-global/configurador/dist/server.mjs

echo "[build-site] Build pipeline complete!"
