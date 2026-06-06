#!/usr/bin/env bash
# start-site.sh — Railway startCommand (runtime)
# Tenta migrations do Pedido antes do servidor; falha de migration NÃO derruba o site.
set -euo pipefail

echo "[start-site] Iniciando site-usegravity..."

if [ -n "${BID_FRETE_INTERNATIONAL_DATABASE_URL:-}" ]; then
  echo "[start-site] Aplicando migrations BID Frete Internacional (gravity-bid-frete-internacional-producao)..."
  if npx tsx scripts/ativamente/aplicar-migrations-bid-frete-internacional.ts; then
    echo "[start-site] Migrations BID Frete Internacional concluídas."
  else
    echo "[start-site] ERRO: migrations BID Frete Internacional falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] /bid-frete pode falhar até corrigir o banco ou BID_FRETE_INTERNATIONAL_DATABASE_URL."
  fi
else
  echo "[start-site] AVISO: BID_FRETE_INTERNATIONAL_DATABASE_URL ausente — migrations BID ignoradas."
  echo "[start-site] Sidecar BID Frete Internacional (8023) ficará desativado até configurar a variável."
  echo "[start-site] Railway → site-usegravity → Variables → BID_FRETE_INTERNATIONAL_DATABASE_URL"
  echo "[start-site] Valor: DATABASE_URL do PostgreSQL gravity-bid-frete-internacional-producao."
fi

if [ -z "${PEDIDO_DATABASE_URL:-}" ]; then
  echo "[start-site] AVISO: PEDIDO_DATABASE_URL ausente — migrations Pedido ignoradas."
  echo "[start-site] Sidecar Pedido ficará desativado até configurar a variável em Railway."
  echo "[start-site] Railway → site-usegravity → Variables → PEDIDO_DATABASE_URL"
  echo "[start-site] Valor: DATABASE_URL do PostgreSQL gravity-pedido-producao."
else
  export CONFIGURADOR_DATABASE_URL="${CONFIGURADOR_DATABASE_URL:-${DATABASE_URL:-}}"

  echo "[start-site] Aplicando migrations do Pedido (public + tenant_*)..."
  if npx tsx scripts/ativamente/aplicar-migrations-pedido.ts; then
    echo "[start-site] Migrations Pedido concluídas."
  else
    echo "[start-site] ERRO: migrations Pedido falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] Smart Import / sidecar Pedido podem falhar até corrigir migrations ou variáveis."
  fi
fi

if [ -z "${PROCESSO_DATABASE_URL:-}" ]; then
  echo "[start-site] AVISO: PROCESSO_DATABASE_URL ausente — migrations Processo ignoradas."
  echo "[start-site] Sidecar Processo ficará desativado até configurar a variável em Railway."
  echo "[start-site] Railway → site-usegravity → Variables → PROCESSO_DATABASE_URL"
  echo "[start-site] Valor: Reference → DATABASE_URL do PostgreSQL gravity-processo-producao."
else
  echo "[start-site] Aplicando migrations do Processo..."
  node servicos-global/produto/processo/server/scripts/compose-schema.js
  if DATABASE_URL="$PROCESSO_DATABASE_URL" \
    npx prisma migrate deploy --schema=servicos-global/produto/processo/prisma/schema.prisma; then
    echo "[start-site] Migrations Processo concluídas."
  else
    echo "[start-site] ERRO: migrations Processo falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] Sidecar Processo pode falhar até corrigir migrations ou variáveis."
  fi
fi

echo "[start-site] Subindo Configurador + sidecars..."
exec node servicos-global/configurador/dist/server.mjs
