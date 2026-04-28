-- FASE 07 DDD / Onda 3 Pedido — rename de colunas fisicas da tabela "preferencia_coluna_pedido"
-- (model Prisma: PedidoPreferenciaUsuario)
-- Fonte: planilha_geral_gravity (20).xlsx, aba "1.ddd_campos" (Produto Gravity = Pedido)
-- Estrategia: ALTER TABLE RENAME COLUMN — preserva dados (zero backfill).
-- Escopo: 7 colunas + 3 indices reconstruidos (2 regulares + 1 unique composto).

-- 1) Rename colunas (7)
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "id"               TO "id_pedido_preferencia_usuario";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "tenant_id"        TO "id_organizacao";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "company_id"       TO "id_workspace";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "user_id"          TO "id_usuario";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "colunas_visiveis" TO "colunas_visiveis_pedido_preferencia_usuario";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "colunas_largura"  TO "colunas_largura_pedido_preferencia_usuario";
ALTER TABLE "preferencia_coluna_pedido" RENAME COLUMN "updated_at"       TO "data_atualizacao_pedido_preferencia_usuario";

-- 2) Reconstruir indices (2 regulares + 1 unique composto) com nomes auto-gerados pelo Prisma
DROP INDEX IF EXISTS "preferencia_coluna_pedido_tenant_id_idx";
DROP INDEX IF EXISTS "preferencia_coluna_pedido_tenant_id_user_id_idx";
DROP INDEX IF EXISTS "preferencia_coluna_pedido_tenant_id_user_id_key";

CREATE INDEX "preferencia_coluna_pedido_id_organizacao_idx"
    ON "preferencia_coluna_pedido"("id_organizacao");
CREATE INDEX "preferencia_coluna_pedido_id_organizacao_id_usuario_idx"
    ON "preferencia_coluna_pedido"("id_organizacao", "id_usuario");
CREATE UNIQUE INDEX "preferencia_coluna_pedido_id_organizacao_id_usuario_key"
    ON "preferencia_coluna_pedido"("id_organizacao", "id_usuario");
