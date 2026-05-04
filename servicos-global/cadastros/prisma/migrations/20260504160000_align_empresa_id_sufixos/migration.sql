-- Alinha tabela `empresa` ao schema.prisma (Onda 38 — sufixos `_empresa`).
--
-- Drift detectado: schema.prisma tem campos `id_organizacao_empresa`,
-- `id_produto_empresa`, `id_usuario_empresa`, mas o banco só tem
-- `id_organizacao` (legado pré-Onda 38). Resultado: prisma.empresa.findMany()
-- joga `P2022 The column 'empresa.id_organizacao_empresa' does not exist`.
--
-- Esta migration:
--   1. Renomeia `id_organizacao` → `id_organizacao_empresa`
--   2. Adiciona `id_produto_empresa` (nullable)
--   3. Adiciona `id_usuario_empresa` (nullable)
--
-- Sem perda de dado. Idempotente via guards `IF EXISTS` / `IF NOT EXISTS`.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresa' AND column_name = 'id_organizacao'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'empresa' AND column_name = 'id_organizacao_empresa'
  ) THEN
    ALTER TABLE "empresa" RENAME COLUMN "id_organizacao" TO "id_organizacao_empresa";
  END IF;
END $$;

ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "id_produto_empresa" TEXT;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "id_usuario_empresa" TEXT;
