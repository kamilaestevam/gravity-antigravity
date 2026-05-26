#!/usr/bin/env bash
# start-site.sh — Railway startCommand (runtime)
# OBRIGATÓRIO: falha o deploy se migrations do Pedido não rodarem.
set -euo pipefail

echo "[start-site] Iniciando site-usegravity..."

if [ -z "${PEDIDO_DATABASE_URL:-}" ]; then
  echo "[start-site] ERRO FATAL: PEDIDO_DATABASE_URL ausente no serviço site-usegravity."
  echo "[start-site] Railway → site-usegravity → Variables → adicionar PEDIDO_DATABASE_URL"
  echo "[start-site] Valor: DATABASE_URL do serviço PostgreSQL gravity-pedido-producao (ou teste)."
  exit 1
fi

export CONFIGURADOR_DATABASE_URL="${CONFIGURADOR_DATABASE_URL:-${DATABASE_URL:-}}"

echo "[start-site] Aplicando migrations do Pedido (public + tenant_*)..."
npx tsx scripts/ativamente/aplicar-migrations-pedido.ts

echo "[start-site] Subindo Configurador + sidecars..."
exec node servicos-global/configurador/dist/server.mjs
