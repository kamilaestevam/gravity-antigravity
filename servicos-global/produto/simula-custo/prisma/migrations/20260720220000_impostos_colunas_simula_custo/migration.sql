-- Impostos por coluna em simula_custo (remove tributo_simula_custo genérico)

ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "base_calculo_ii_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "valor_ii_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "base_calculo_ipi_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "valor_ipi_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "base_calculo_pis_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "valor_pis_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "base_calculo_cofins_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "valor_cofins_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "base_calculo_icms_simula_custo" DECIMAL(15,2);
ALTER TABLE "simula_custo" ADD COLUMN IF NOT EXISTS "valor_icms_simula_custo" DECIMAL(15,2);

-- Backfill a partir da tabela legada (se existir dado)
UPDATE "simula_custo" sc SET
  "base_calculo_ii_simula_custo" = t."base_calculo_tributo_simula_custo",
  "valor_ii_simula_custo" = t."valor_tributo_simula_custo"
FROM "tributo_simula_custo" t
WHERE t."id_simula_custo" = sc."id_simula_custo" AND t."tipo_tributo_simula_custo" = 'II';

UPDATE "simula_custo" sc SET
  "base_calculo_ipi_simula_custo" = t."base_calculo_tributo_simula_custo",
  "valor_ipi_simula_custo" = t."valor_tributo_simula_custo"
FROM "tributo_simula_custo" t
WHERE t."id_simula_custo" = sc."id_simula_custo" AND t."tipo_tributo_simula_custo" = 'IPI';

UPDATE "simula_custo" sc SET
  "base_calculo_pis_simula_custo" = t."base_calculo_tributo_simula_custo",
  "valor_pis_simula_custo" = t."valor_tributo_simula_custo"
FROM "tributo_simula_custo" t
WHERE t."id_simula_custo" = sc."id_simula_custo" AND t."tipo_tributo_simula_custo" = 'PIS';

UPDATE "simula_custo" sc SET
  "base_calculo_cofins_simula_custo" = t."base_calculo_tributo_simula_custo",
  "valor_cofins_simula_custo" = t."valor_tributo_simula_custo"
FROM "tributo_simula_custo" t
WHERE t."id_simula_custo" = sc."id_simula_custo" AND t."tipo_tributo_simula_custo" = 'COFINS';

UPDATE "simula_custo" sc SET
  "base_calculo_icms_simula_custo" = t."base_calculo_tributo_simula_custo",
  "valor_icms_simula_custo" = t."valor_tributo_simula_custo"
FROM "tributo_simula_custo" t
WHERE t."id_simula_custo" = sc."id_simula_custo" AND t."tipo_tributo_simula_custo" = 'ICMS';

-- ICMS legado (entrada/saída) → valor_icms quando ainda vazio
UPDATE "simula_custo"
SET "valor_icms_simula_custo" = COALESCE("icms_entrada_simula_custo", "icms_saida_simula_custo")
WHERE "valor_icms_simula_custo" IS NULL
  AND ("icms_entrada_simula_custo" IS NOT NULL OR "icms_saida_simula_custo" IS NOT NULL);

ALTER TABLE "simula_custo" DROP COLUMN IF EXISTS "icms_entrada_simula_custo";
ALTER TABLE "simula_custo" DROP COLUMN IF EXISTS "icms_saida_simula_custo";

DROP TABLE IF EXISTS "tributo_simula_custo";

DROP TYPE IF EXISTS "TipoTributoSimulaCusto";
