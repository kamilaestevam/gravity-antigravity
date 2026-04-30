-- Migration: align_produto_gravity_workspace_slug_to_id
-- Converte product_key (slug) → id_produto_gravity (FK por ID, REGRA 4).
-- Aplica DDD pleno + REGRA 3 (id_organizacao literal) + REGRA 4 (id_workspace, id_produto_gravity literais).
-- 6 rows convertidas via lookup em produto_gravity.
-- Aplicada manualmente em transação em 2026-04-30.

-- 1. ADD nova coluna id_produto_gravity (nullable inicialmente)
ALTER TABLE "produto_gravity_workspace" ADD COLUMN "id_produto_gravity" TEXT;

-- 2. UPDATE: converte slug → CUID via lookup em produto_gravity
UPDATE "produto_gravity_workspace" pgw
SET "id_produto_gravity" = pg."id_produto_gravity"
FROM "produto_gravity" pg
WHERE pgw."product_key" = pg."slug_produto_gravity";

-- 3. SET NOT NULL após backfill
ALTER TABLE "produto_gravity_workspace" ALTER COLUMN "id_produto_gravity" SET NOT NULL;

-- 4. DROP índices antigos que dependiam de product_key
DROP INDEX "produto_gravity_workspace_company_id_product_key_key";
DROP INDEX "produto_gravity_workspace_company_id_is_active_idx";

-- 5. DROP coluna product_key (slug não é mais necessário)
ALTER TABLE "produto_gravity_workspace" DROP COLUMN "product_key";

-- 6. RENAME COLUMNs
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "id"          TO "id_produto_gravity_workspace";
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "tenant_id"   TO "id_organizacao";
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "company_id"  TO "id_workspace";
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "is_active"   TO "ativo_produto_gravity_workspace";
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "created_at"  TO "data_criacao_produto_gravity_workspace";
ALTER TABLE "produto_gravity_workspace" RENAME COLUMN "updated_at"  TO "data_atualizacao_produto_gravity_workspace";

-- 7. RENAME índices restantes
ALTER INDEX "produto_gravity_workspace_tenant_id_idx"  RENAME TO "pgw_org_idx";
ALTER INDEX "produto_gravity_workspace_company_id_idx" RENAME TO "pgw_ws_idx";

-- 8. RENAME FK constraints
ALTER TABLE "produto_gravity_workspace" RENAME CONSTRAINT "produto_gravity_workspace_tenant_id_fkey"  TO "pgw_org_fkey";
ALTER TABLE "produto_gravity_workspace" RENAME CONSTRAINT "produto_gravity_workspace_company_id_fkey" TO "pgw_ws_fkey";

-- 9. CREATE FK nova: id_produto_gravity → produto_gravity
ALTER TABLE "produto_gravity_workspace"
  ADD CONSTRAINT "pgw_produto_fkey"
  FOREIGN KEY ("id_produto_gravity")
  REFERENCES "produto_gravity"("id_produto_gravity")
  ON UPDATE CASCADE ON DELETE CASCADE;

-- 10. CREATE UNIQUE: 1 ativação por (workspace, produto)
CREATE UNIQUE INDEX "pgw_ws_produto_unq"
  ON "produto_gravity_workspace" ("id_workspace", "id_produto_gravity");

-- 11. CREATE INDEX: filtro por workspace + ativo
CREATE INDEX "pgw_ws_ativo_idx"
  ON "produto_gravity_workspace" ("id_workspace", "ativo_produto_gravity_workspace");
