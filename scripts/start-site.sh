#!/usr/bin/env bash
# start-site.sh — Railway startCommand (runtime)
# Tenta migrations do Pedido antes do servidor; falha de migration NÃO derruba o site.
set -euo pipefail

echo "[start-site] Iniciando site-usegravity..."

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

echo "[start-site] Subindo Configurador + sidecars..."
exec node servicos-global/configurador/dist/server.mjs
