-- Entidade BID (conjunto opcional de pedidos de cotação) + FK na cotação + workspace na proposta

-- Enum status do BID
CREATE TYPE "bid_frete_internacional_status_bid" AS ENUM (
  'RASCUNHO',
  'EM_ANDAMENTO',
  'PARCIALMENTE_CONCLUIDO',
  'CONCLUIDO',
  'CANCELADO'
);

-- Tabela principal BID
CREATE TABLE "bid_frete_internacional" (
  "id_bid_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "id_produto_gravity" TEXT,
  "id_usuario" TEXT NOT NULL,
  "id_workspace" TEXT,
  "numero_bid_bid_frete_internacional" TEXT NOT NULL,
  "referencia_interna_bid_bid_frete_internacional" TEXT,
  "status_bid_bid_frete_internacional" "bid_frete_internacional_status_bid" NOT NULL DEFAULT 'RASCUNHO',
  "tipo_operacao_bid_bid_frete_internacional" "bid_frete_internacional_tipo_operacao",
  "modais_bid_bid_frete_internacional" JSONB,
  "modalidade_bid_bid_frete_internacional" "bid_frete_internacional_modalidade_carga",
  "origens_bid_bid_frete_internacional" JSONB,
  "destinos_bid_bid_frete_internacional" JSONB,
  "data_criacao_bid_bid_frete_internacional" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_bid_bid_frete_internacional" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bid_frete_internacional_pkey" PRIMARY KEY ("id_bid_bid_frete_internacional")
);

CREATE INDEX "bid_frete_internacional_id_organizacao_idx" ON "bid_frete_internacional"("id_organizacao");
CREATE INDEX "bid_frete_internacional_id_organizacao_id_produto_gravity_idx" ON "bid_frete_internacional"("id_organizacao", "id_produto_gravity");
CREATE INDEX "bid_frete_internacional_id_organizacao_id_usuario_idx" ON "bid_frete_internacional"("id_organizacao", "id_usuario");
CREATE INDEX "bid_frete_internacional_id_organizacao_id_workspace_idx" ON "bid_frete_internacional"("id_organizacao", "id_workspace");
CREATE INDEX "bid_frete_internacional_id_organizacao_status_bid_bid_frete_internacional_idx" ON "bid_frete_internacional"("id_organizacao", "status_bid_bid_frete_internacional");
CREATE INDEX "bid_frete_internacional_numero_bid_bid_frete_internacional_idx" ON "bid_frete_internacional"("numero_bid_bid_frete_internacional");

-- Config de status do BID
CREATE TABLE "status_bid_config_bid_frete_internacional" (
  "id_status_bid_config_bid_frete_internacional" TEXT NOT NULL,
  "id_organizacao" TEXT NOT NULL,
  "nome_status_bid_config_bid_frete_internacional" TEXT NOT NULL,
  "rotulo_status_bid_config_bid_frete_internacional" TEXT NOT NULL,
  "cor_status_bid_config_bid_frete_internacional" TEXT NOT NULL,
  "icone_status_bid_config_bid_frete_internacional" TEXT,
  "ordem_status_bid_config_bid_frete_internacional" INTEGER NOT NULL DEFAULT 0,
  "padrao_status_bid_config_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false,
  "gerenciado_sistema_status_bid_config_bid_frete_internacional" BOOLEAN NOT NULL DEFAULT false,

  CONSTRAINT "status_bid_config_bid_frete_internacional_pkey" PRIMARY KEY ("id_status_bid_config_bid_frete_internacional")
);

CREATE UNIQUE INDEX "status_bid_config_bid_frete_internacional_id_organizacao_nome_status_bid_config_bid_frete_internacional_key"
  ON "status_bid_config_bid_frete_internacional"("id_organizacao", "nome_status_bid_config_bid_frete_internacional");
CREATE INDEX "status_bid_config_bfi_id_org_idx" ON "status_bid_config_bid_frete_internacional"("id_organizacao");
CREATE INDEX "status_bid_config_bfi_id_org_ordem_idx" ON "status_bid_config_bid_frete_internacional"("id_organizacao", "ordem_status_bid_config_bid_frete_internacional");

-- FK na cotação
ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN "id_bid_bid_frete_internacional" TEXT;

CREATE INDEX "cotacao_bid_frete_internacional_id_organizacao_id_bid_bid_frete_internacional_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "id_bid_bid_frete_internacional");

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD CONSTRAINT "cotacao_bid_frete_internacional_id_bid_bid_frete_internacional_fkey"
  FOREIGN KEY ("id_bid_bid_frete_internacional") REFERENCES "bid_frete_internacional"("id_bid_bid_frete_internacional")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Workspace snapshot na proposta
ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN "id_workspace" TEXT;

CREATE INDEX "proposta_bid_frete_internacional_id_organizacao_id_workspace_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_workspace");

-- Backfill id_workspace em propostas existentes a partir da cotação
UPDATE "proposta_bid_frete_internacional" p
SET "id_workspace" = c."id_workspace"
FROM "cotacao_bid_frete_internacional" c
WHERE p."id_cotacao_bid_frete_internacional" = c."id_cotacao_bid_frete_internacional"
  AND p."id_workspace" IS NULL
  AND c."id_workspace" IS NOT NULL;

-- Migração legado: referencia_interna compartilhada (2+ cotações) → registro BID
DO $$
DECLARE
  grp RECORD;
  new_bid_id TEXT;
  seq_num INT := 0;
BEGIN
  FOR grp IN
    SELECT
      c."id_organizacao",
      c."referencia_interna_cotacao_bid_frete_internacional" AS ref,
      MIN(c."id_usuario") AS id_usuario,
      MIN(c."id_workspace") AS id_workspace,
      MIN(c."tipo_operacao_cotacao_bid_frete_internacional") AS tipo_op,
      MIN(c."modalidade_cotacao_bid_frete_internacional") AS modalidade,
      COUNT(*) AS qtd
    FROM "cotacao_bid_frete_internacional" c
    WHERE c."referencia_interna_cotacao_bid_frete_internacional" IS NOT NULL
      AND TRIM(c."referencia_interna_cotacao_bid_frete_internacional") <> ''
    GROUP BY c."id_organizacao", c."referencia_interna_cotacao_bid_frete_internacional"
    HAVING COUNT(*) >= 2
  LOOP
    seq_num := seq_num + 1;
    new_bid_id := 'c' || substr(md5(random()::text || grp.ref || clock_timestamp()::text || seq_num::text), 1, 24);

    INSERT INTO "bid_frete_internacional" (
      "id_bid_bid_frete_internacional",
      "id_organizacao",
      "id_produto_gravity",
      "id_usuario",
      "id_workspace",
      "numero_bid_bid_frete_internacional",
      "referencia_interna_bid_bid_frete_internacional",
      "status_bid_bid_frete_internacional",
      "tipo_operacao_bid_bid_frete_internacional",
      "modalidade_bid_bid_frete_internacional",
      "data_atualizacao_bid_bid_frete_internacional"
    ) VALUES (
      new_bid_id,
      grp."id_organizacao",
      'bid-frete-internacional',
      grp."id_usuario",
      grp."id_workspace",
      'BID-MIG-' || grp.ref,
      grp.ref,
      'EM_ANDAMENTO',
      grp.tipo_op,
      grp.modalidade,
      CURRENT_TIMESTAMP
    );

    UPDATE "cotacao_bid_frete_internacional"
    SET "id_bid_bid_frete_internacional" = new_bid_id
    WHERE "id_organizacao" = grp."id_organizacao"
      AND "referencia_interna_cotacao_bid_frete_internacional" = grp.ref;
  END LOOP;
END $$;
