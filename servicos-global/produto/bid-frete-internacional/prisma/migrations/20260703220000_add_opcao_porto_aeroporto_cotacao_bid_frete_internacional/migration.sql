-- Colunas opcao porto/aeroporto (wizard Nova Cotacao TASK-000405) — faltavam em prod apesar de _prisma_migrations OK

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional" JSONB;

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional" JSONB;
