-- Corrige índices da taxa de fechamento: nomes >63 bytes colidem após truncamento (Prisma + PostgreSQL).

DO $$
DECLARE
  idx RECORD;
BEGIN
  FOR idx IN
    SELECT indexname
    FROM pg_indexes
    WHERE schemaname = current_schema()
      AND tablename = 'taxa_fechamento_plataforma_bid_frete_internacional'
      AND indexname NOT LIKE '%_pkey'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS %I', idx.indexname);
  END LOOP;
END $$;

CREATE INDEX "taxa_fech_bfi_id_org_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao");

CREATE INDEX "taxa_fech_bfi_id_org_prod_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_produto_gravity");

CREATE INDEX "taxa_fech_bfi_id_org_user_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_usuario");

CREATE INDEX "taxa_fech_bfi_id_org_cotacao_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "id_cotacao_bid_frete_internacional");

CREATE INDEX "taxa_fech_bfi_id_org_status_idx"
  ON "taxa_fechamento_plataforma_bid_frete_internacional"("id_organizacao", "status_cobranca_taxa_fechamento_plataforma_bid_frete_internacional");
