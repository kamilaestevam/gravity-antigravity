-- Manual migration — 2026-05-03
-- Padroniza ProdutoGravityFatura para singular (alinha ao padrão `_produto_gravity`
-- usado pelos demais 6 models do Configurador) e cria ProdutoGravityFaturaItem.
--
-- Aplicado via `prisma db execute` (não `migrate dev`) para evitar arrastar drift
-- pré-existente em `seguranca`/`servico_gravity`/`teste` — drift fica como item
-- separado para entrega futura, conforme parecer do Coordenador.
--
-- Pré-condições verificadas:
--   * fatura_produtos_gravity está vazia (0 rows em produção, 2026-05-03)
--   * zero consumidores TS de FaturaStatusGravity ou _produtos_gravity
--   * schema.prisma já editado e validado (npx prisma validate)

BEGIN;

-- 1) Drop do legado (tabela e enum estavam vazios — nunca foram populados)
DROP TABLE IF EXISTS "fatura_produtos_gravity";
DROP TYPE IF EXISTS "FaturaStatusGravity";

-- 2) Novo enum (mesmo conjunto de valores, nome simétrico a StatusAssinaturaProdutoGravity)
CREATE TYPE "StatusFaturaProdutoGravity" AS ENUM (
  'DRAFT', 'OPEN', 'PAID', 'VOID', 'OVERDUE', 'UNCOLLECTIBLE'
);

-- 3) Tabela fatura (singular) — 13 colunas alinhadas ao DDD
CREATE TABLE "fatura_produto_gravity" (
  "id_fatura_produto_gravity"               TEXT NOT NULL,
  "id_organizacao"                          TEXT NOT NULL,
  "numero_fatura_produto_gravity"           TEXT NOT NULL,
  "status_fatura_produto_gravity"           "StatusFaturaProdutoGravity" NOT NULL DEFAULT 'DRAFT',
  "nome_organizacao_fatura_produto_gravity" TEXT NOT NULL,
  "email_organizacao_fatura_produto_gravity" TEXT,
  "valor_total_fatura_produto_gravity"      DECIMAL(18,2) NOT NULL,
  "moeda_fatura_produto_gravity"            TEXT NOT NULL DEFAULT 'brl',
  "competencia_fatura_produto_gravity"      TEXT,
  "data_fatura_produto_gravity"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_criacao_fatura_produto_gravity"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_fatura_produto_gravity" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fatura_produto_gravity_pkey" PRIMARY KEY ("id_fatura_produto_gravity")
);

-- 4) Tabela item de fatura (NOVA — composição de uma fatura)
CREATE TABLE "fatura_item_produto_gravity" (
  "id_fatura_item_produto_gravity"             TEXT NOT NULL,
  "id_organizacao"                             TEXT NOT NULL,
  "id_fatura_produto_gravity"                  TEXT NOT NULL,
  "id_produto_gravity"                         TEXT,
  "descricao_fatura_item_produto_gravity"      TEXT NOT NULL,
  "quantidade_fatura_item_produto_gravity"     DECIMAL(18,4) NOT NULL DEFAULT 1,
  "valor_unitario_fatura_item_produto_gravity" DECIMAL(18,2) NOT NULL,
  "valor_total_fatura_item_produto_gravity"    DECIMAL(18,2) NOT NULL,
  "moeda_fatura_item_produto_gravity"          TEXT NOT NULL DEFAULT 'brl',
  "data_criacao_fatura_item_produto_gravity"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_fatura_item_produto_gravity" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fatura_item_produto_gravity_pkey" PRIMARY KEY ("id_fatura_item_produto_gravity")
);

-- 5) Índices obrigatórios (REGRA — todo model tem id_organizacao + 2 compostos)
CREATE INDEX "fpg_org_idx"        ON "fatura_produto_gravity"("id_organizacao");
CREATE INDEX "fpg_org_status_idx" ON "fatura_produto_gravity"("id_organizacao", "status_fatura_produto_gravity");
CREATE INDEX "fpg_org_data_idx"   ON "fatura_produto_gravity"("id_organizacao", "data_fatura_produto_gravity");

CREATE INDEX "fipg_org_idx"         ON "fatura_item_produto_gravity"("id_organizacao");
CREATE INDEX "fipg_org_fatura_idx"  ON "fatura_item_produto_gravity"("id_organizacao", "id_fatura_produto_gravity");
CREATE INDEX "fipg_org_produto_idx" ON "fatura_item_produto_gravity"("id_organizacao", "id_produto_gravity");

-- 6) Foreign keys
ALTER TABLE "fatura_produto_gravity"
  ADD CONSTRAINT "fatura_produto_gravity_id_organizacao_fkey"
  FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fatura_item_produto_gravity"
  ADD CONSTRAINT "fatura_item_produto_gravity_id_fatura_produto_gravity_fkey"
  FOREIGN KEY ("id_fatura_produto_gravity") REFERENCES "fatura_produto_gravity"("id_fatura_produto_gravity")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fatura_item_produto_gravity"
  ADD CONSTRAINT "fatura_item_produto_gravity_id_produto_gravity_fkey"
  FOREIGN KEY ("id_produto_gravity") REFERENCES "produto_gravity"("id_produto_gravity")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "fatura_item_produto_gravity"
  ADD CONSTRAINT "fatura_item_produto_gravity_id_organizacao_fkey"
  FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
