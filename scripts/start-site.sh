#!/usr/bin/env bash
# start-site.sh — Railway startCommand (runtime)
# Tenta migrations do Pedido antes do servidor; falha de migration NÃO derruba o site.
set -euo pipefail

echo "[start-site] Iniciando site-usegravity..."

export ORGANIZACAO_DATABASE_URL="${ORGANIZACAO_DATABASE_URL:-${SERVICOS_PLATAFORMA_DATABASE_URL:-${TENANT_DATABASE_URL:-}}}"
if [ -z "${ORGANIZACAO_DATABASE_URL:-}" ]; then
  echo "[start-site] AVISO CRITICO: ORGANIZACAO_DATABASE_URL ausente — api-cockpit/GABI/migrations plataforma desativados."
  echo "[start-site] Railway → site-usegravity → Variables → ORGANIZACAO_DATABASE_URL = DATABASE_URL do Postgres gravity-servicos-prod"
fi

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

# Configurador — migrations (histórico de testes em tabela teste; best-effort no boot)
export CONFIGURADOR_DATABASE_URL="${CONFIGURADOR_DATABASE_URL:-${DATABASE_URL:-}}"
if [ -n "${CONFIGURADOR_DATABASE_URL:-}" ]; then
  echo "[start-site] Aplicando migrations Configurador..."
  if CONFIGURADOR_DATABASE_URL="$CONFIGURADOR_DATABASE_URL" \
    npx prisma migrate deploy --schema=configurador/prisma/schema.prisma; then
    echo "[start-site] Migrations Configurador concluídas."
  else
    echo "[start-site] ERRO: migrations Configurador falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] Admin /testes-gerais pode não persistir histórico até migrate deploy passar."
  fi
  echo "[start-site] Garantindo org Gravity interna (convite SUPER_ADMIN)..."
  if CONFIGURADOR_DATABASE_URL="$CONFIGURADOR_DATABASE_URL" \
    npx tsx scripts/ativamente/garantir-org-gravity-configurador.ts; then
    echo "[start-site] Org Gravity interna OK."
  else
    echo "[start-site] AVISO: garantir-org-gravity falhou — convite SUPER_ADMIN pode retornar 503."
  fi
else
  echo "[start-site] AVISO: CONFIGURADOR_DATABASE_URL ausente — migrations Configurador ignoradas."
fi

# Organização (servicos-plataforma) — api-cockpit, gabi, historico, notificacoes, etc.
if [ -n "${ORGANIZACAO_DATABASE_URL:-}" ]; then
  echo "[start-site] Compondo schema servicos-plataforma..."
  npx tsx scripts/ativamente/compose-plataforma-schema.ts
  echo "[start-site] Aplicando migrations servicos-plataforma (api-cockpit, gabi, ...)..."
  if ORGANIZACAO_DATABASE_URL="$ORGANIZACAO_DATABASE_URL" \
    npx prisma migrate deploy --schema=servicos-global/servicos-plataforma/prisma/schema.prisma; then
    echo "[start-site] Migrations servicos-plataforma concluídas."
  else
    echo "[start-site] ERRO: migrations servicos-plataforma falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] Admin API Cockpit (tokens/webhooks/consumo) pode retornar 500 até migrate deploy passar."
  fi
  if [ -n "${CONFIGURADOR_DATABASE_URL:-}" ]; then
    echo "[start-site] Aplicando migrations tenant_* (gabi, atividades, ...)..."
    if DATABASE_URL="$ORGANIZACAO_DATABASE_URL" CONFIGURADOR_DATABASE_URL="$CONFIGURADOR_DATABASE_URL" \
      npx tsx scripts/ativamente/migrate-all-tenants.ts --product=tenant; then
      echo "[start-site] Migrations tenant_* (servicos-plataforma) concluídas."
    else
      echo "[start-site] ERRO: migrate-all-tenants (tenant) falhou — GABI pode retornar 503 até schemas atualizados."
    fi
  else
    echo "[start-site] AVISO: CONFIGURADOR_DATABASE_URL ausente — migrate-all-tenants (tenant) ignorado; GABI pode falhar."
  fi
  echo "[start-site] Aplicando DDL GABI (gabi_conversa) em cada schema tenant_*..."
  if ORGANIZACAO_DATABASE_URL="$ORGANIZACAO_DATABASE_URL" CONFIGURADOR_DATABASE_URL="${CONFIGURADOR_DATABASE_URL:-}" \
    npx tsx scripts/ativamente/aplicar-migration-gabi-organizacao.ts; then
    echo "[start-site] DDL GABI em tenant_* concluído."
  else
    echo "[start-site] ERRO: DDL GABI em tenant_* falhou — primeira mensagem Gabi aplica DDL lazy; ver logs."
  fi
else
  echo "[start-site] AVISO: ORGANIZACAO_DATABASE_URL ausente — migrations servicos-plataforma ignoradas."
  echo "[start-site] Sidecars api-cockpit/GABI e Admin API Cockpit ficarão degradados até configurar a variável."
fi

# Storage persistente de prints EMT (montar volume Railway em EMT_ARTIFACTS_DIR)
export EMT_ARTIFACTS_DIR="${EMT_ARTIFACTS_DIR:-/app/data/emt-artifacts}"
mkdir -p "$EMT_ARTIFACTS_DIR"
echo "[start-site] EMT artifacts dir: $EMT_ARTIFACTS_DIR"

# Storage persistente de anexos do Pedido (montar volume Railway em PEDIDO_ANEXOS_UPLOAD_DIR se necessário)
export PEDIDO_ANEXOS_UPLOAD_DIR="${PEDIDO_ANEXOS_UPLOAD_DIR:-/app/data/pedido-anexos}"
mkdir -p "$PEDIDO_ANEXOS_UPLOAD_DIR"
echo "[start-site] Pedido anexos upload dir: $PEDIDO_ANEXOS_UPLOAD_DIR"

# Smart Read — Prisma Client (pasta gitignored; gerar no runtime garante sidecar 8033)
echo "[start-site] Gerando Prisma Client Smart Read..."
node servicos-global/produto/smart-read/prisma/compose-schema.js
npx prisma generate --schema=servicos-global/produto/smart-read/prisma/schema.prisma
if [ ! -f "servicos-global/produto/smart-read/server/src/generated/client/index.js" ]; then
  echo "[start-site] ERRO CRITICO: Prisma Client Smart Read ausente apos generate — sidecar 8033 nao sobe."
  exit 1
fi

if [ -z "${SMART_READ_DATABASE_URL:-}" ]; then
  echo "[start-site] AVISO: SMART_READ_DATABASE_URL ausente — sidecar Smart Read sobe sem painéis/progresso (503 nas rotas de banco)."
  echo "[start-site] Railway → site-usegravity → Variables → SMART_READ_DATABASE_URL"
  echo "[start-site] Valor: DATABASE_URL do PostgreSQL gravity-smart-read-producao."
else
  echo "[start-site] Aplicando migrations Smart Read..."
  if DATABASE_URL="$SMART_READ_DATABASE_URL" \
    npx prisma migrate deploy --schema=servicos-global/produto/smart-read/prisma/schema.prisma; then
    echo "[start-site] Migrations Smart Read concluídas."
  else
    echo "[start-site] ERRO: migrations Smart Read falharam — servidor sobe mesmo assim (ver logs acima)."
    echo "[start-site] Sidecar Smart Read pode falhar até corrigir migrations ou SMART_READ_DATABASE_URL."
  fi
fi

if [ -z "${SMART_READ_LEGADO_URL:-}" ] || [ -z "${SMART_READ_LEGADO_CHAVE_GRAVITY:-}" ]; then
  echo "[start-site] AVISO: SMART_READ_LEGADO_URL ou SMART_READ_LEGADO_CHAVE_GRAVITY ausente — listagem/upload Smart Read falham."
  echo "[start-site] Railway → site-usegravity → Variables → SMART_READ_LEGADO_* + SMART_READ_ID_COMPANY_LEGADO_PADRAO"
elif [ -z "${SMART_READ_ID_COMPANY_LEGADO_PADRAO:-}" ] && [ -z "${SMART_READ_DE_PARA_ORGANIZACAO:-}" ]; then
  echo "[start-site] AVISO: SMART_READ_ID_COMPANY_LEGADO_PADRAO ausente — orgs com assinatura ATIVA precisam de company id legado."
else
  echo "[start-site] Smart Read legado configurado (sidecar 8033)."
fi

echo "[start-site] Subindo Configurador + sidecars..."
exec node servicos-global/configurador/dist/server.mjs
