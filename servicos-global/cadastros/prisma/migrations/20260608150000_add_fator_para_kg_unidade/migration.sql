-- AlterTable: fator de conversão para KG (SSOT cadastros.unidade — Pedido persiste peso em KG)
ALTER TABLE "unidade" ADD COLUMN "fator_para_kg_unidade" DOUBLE PRECISION;

UPDATE "unidade" SET "fator_para_kg_unidade" = 0.001 WHERE "codigo_unidade" = 'G';
UPDATE "unidade" SET "fator_para_kg_unidade" = 1     WHERE "codigo_unidade" = 'KG';
UPDATE "unidade" SET "fator_para_kg_unidade" = 1000  WHERE "codigo_unidade" = 'TON';
