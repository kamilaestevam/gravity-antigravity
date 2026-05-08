-- Manual migration — 2026-05-04
-- Cria model ProdutoGravityFaturaDocumento + enum TipoDocumentoFaturaProdutoGravity
-- (anexos: boleto, NF-e, recibo, PDF, outro). Soft-delete via data_exclusao_*.

BEGIN;

-- 1) Enum
CREATE TYPE "TipoDocumentoFaturaProdutoGravity" AS ENUM (
  'BOLETO', 'NFE', 'RECIBO', 'PDF_GENERICO', 'OUTRO'
);

-- 2) Tabela
CREATE TABLE "fatura_documento_produto_gravity" (
  "id_documento_fatura_produto_gravity"               TEXT NOT NULL,
  "id_organizacao"                                    TEXT NOT NULL,
  "id_fatura_produto_gravity"                         TEXT NOT NULL,
  "tipo_documento_fatura_produto_gravity"             "TipoDocumentoFaturaProdutoGravity" NOT NULL,
  "nome_documento_fatura_produto_gravity"             TEXT NOT NULL,
  "url_documento_fatura_produto_gravity"              TEXT NOT NULL,
  "tamanho_documento_fatura_produto_gravity"          INTEGER,
  "mime_documento_fatura_produto_gravity"             TEXT,
  "id_usuario_anexou_documento_fatura_produto_gravity" TEXT,
  "data_criacao_documento_fatura_produto_gravity"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_documento_fatura_produto_gravity" TIMESTAMP(3) NOT NULL,
  "data_exclusao_documento_fatura_produto_gravity"    TIMESTAMP(3),
  CONSTRAINT "fatura_documento_produto_gravity_pkey" PRIMARY KEY ("id_documento_fatura_produto_gravity")
);

-- 3) Índices (REGRA — id_organizacao + 2 compostos)
CREATE INDEX "fdpg_org_idx"         ON "fatura_documento_produto_gravity"("id_organizacao");
CREATE INDEX "fdpg_org_fatura_idx"  ON "fatura_documento_produto_gravity"("id_organizacao", "id_fatura_produto_gravity");
CREATE INDEX "fdpg_org_usuario_idx" ON "fatura_documento_produto_gravity"("id_organizacao", "id_usuario_anexou_documento_fatura_produto_gravity");

-- 4) Foreign keys
ALTER TABLE "fatura_documento_produto_gravity"
  ADD CONSTRAINT "fatura_documento_produto_gravity_id_fatura_fkey"
  FOREIGN KEY ("id_fatura_produto_gravity") REFERENCES "fatura_produto_gravity"("id_fatura_produto_gravity")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "fatura_documento_produto_gravity"
  ADD CONSTRAINT "fatura_documento_produto_gravity_id_organizacao_fkey"
  FOREIGN KEY ("id_organizacao") REFERENCES "organizacao"("id_organizacao")
  ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
