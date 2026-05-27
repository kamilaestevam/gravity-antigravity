#!/usr/bin/env bash
# generate-prisma-clients-ci.sh
#
# Gera os Prisma Clients com query engines para o SO do runner (Linux em CI).
# Os binários libquery_engine-* estão no .gitignore — sem este passo, Vitest
# falha com PrismaClientInitializationError em ubuntu-latest.
#
# Espelha a seção "Generate Prisma clients" de scripts/build-site.sh (Railway).

set -euo pipefail

echo "[generate-prisma-ci] Gerando Prisma Clients..."

npx prisma generate --schema=configurador/prisma/schema.prisma
npx prisma generate --schema=servicos-global/servicos-plataforma/prisma/schema.prisma

npx tsx scripts/ativamente/compose-cadastros-schema.ts
npx prisma generate --schema=servicos-global/cadastros/prisma/schema.prisma

npx tsx scripts/ativamente/compose-pedido-schema.ts
npx prisma generate --schema=servicos-global/produto/pedido/prisma/schema.prisma

# Pedido gera em pedido/node_modules/.prisma/client; @prisma/client na raiz
# resolve node_modules/.prisma/client (mesmo ajuste do build-site.sh).
mkdir -p node_modules/.prisma
cp -r servicos-global/produto/pedido/node_modules/.prisma/client node_modules/.prisma/client

# Produtos com schema commitado (sem compose centralizado no monorepo).
if [ -f servicos-global/produto/processo/prisma/schema.prisma ]; then
  npx prisma generate --schema=servicos-global/produto/processo/prisma/schema.prisma
fi

if [ -f servicos-global/produto/bid-frete-internacional/prisma/schema.prisma ]; then
  npx prisma generate --schema=servicos-global/produto/bid-frete-internacional/prisma/schema.prisma
fi

echo "[generate-prisma-ci] Prisma Clients gerados com sucesso."
