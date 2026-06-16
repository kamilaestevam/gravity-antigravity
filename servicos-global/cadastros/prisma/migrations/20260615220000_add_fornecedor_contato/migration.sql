-- Tabela filha: múltiplos contatos por parceiro COMEX (Cadastros)
CREATE TYPE "TipoCanalFornecedorContato" AS ENUM ('EMAIL', 'WHATSAPP', 'TELEFONE');

CREATE TABLE "fornecedor_contato" (
    "id_fornecedor_contato" TEXT NOT NULL,
    "id_fornecedor" TEXT NOT NULL,
    "id_organizacao_cadastro_fornecedor_contato" TEXT NOT NULL,
    "tipo_canal_fornecedor_contato" "TipoCanalFornecedorContato" NOT NULL,
    "valor_fornecedor_contato" TEXT NOT NULL,
    "principal_fornecedor_contato" BOOLEAN NOT NULL DEFAULT false,
    "ordem_fornecedor_contato" INTEGER NOT NULL DEFAULT 0,
    "criado_em_fornecedor_contato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em_fornecedor_contato" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_contato_pkey" PRIMARY KEY ("id_fornecedor_contato")
);

CREATE UNIQUE INDEX "forn_contato_unq_forn_canal_valor" ON "fornecedor_contato"("id_fornecedor", "tipo_canal_fornecedor_contato", "valor_fornecedor_contato");
CREATE INDEX "forn_contato_org_idx" ON "fornecedor_contato"("id_organizacao_cadastro_fornecedor_contato");
CREATE INDEX "forn_contato_org_forn_idx" ON "fornecedor_contato"("id_organizacao_cadastro_fornecedor_contato", "id_fornecedor");
CREATE INDEX "forn_contato_forn_idx" ON "fornecedor_contato"("id_fornecedor");

ALTER TABLE "fornecedor_contato" ADD CONSTRAINT "fornecedor_contato_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedor"("id_fornecedor") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill a partir das colunas escalares (legado → contatos)
INSERT INTO "fornecedor_contato" (
    "id_fornecedor_contato",
    "id_fornecedor",
    "id_organizacao_cadastro_fornecedor_contato",
    "tipo_canal_fornecedor_contato",
    "valor_fornecedor_contato",
    "principal_fornecedor_contato",
    "ordem_fornecedor_contato",
    "atualizado_em_fornecedor_contato"
)
SELECT gen_random_uuid()::text, f."id_fornecedor", f."id_organizacao_cadastro_fornecedor", 'EMAIL'::"TipoCanalFornecedorContato", trim(f."email_fornecedor"), true, 0, CURRENT_TIMESTAMP
FROM "fornecedor" f
WHERE f."email_fornecedor" IS NOT NULL AND trim(f."email_fornecedor") <> '';

INSERT INTO "fornecedor_contato" (
    "id_fornecedor_contato",
    "id_fornecedor",
    "id_organizacao_cadastro_fornecedor_contato",
    "tipo_canal_fornecedor_contato",
    "valor_fornecedor_contato",
    "principal_fornecedor_contato",
    "ordem_fornecedor_contato",
    "atualizado_em_fornecedor_contato"
)
SELECT gen_random_uuid()::text, f."id_fornecedor", f."id_organizacao_cadastro_fornecedor", 'TELEFONE'::"TipoCanalFornecedorContato", trim(f."telefone_fornecedor"), true, 0, CURRENT_TIMESTAMP
FROM "fornecedor" f
WHERE f."telefone_fornecedor" IS NOT NULL AND trim(f."telefone_fornecedor") <> '';

INSERT INTO "fornecedor_contato" (
    "id_fornecedor_contato",
    "id_fornecedor",
    "id_organizacao_cadastro_fornecedor_contato",
    "tipo_canal_fornecedor_contato",
    "valor_fornecedor_contato",
    "principal_fornecedor_contato",
    "ordem_fornecedor_contato",
    "atualizado_em_fornecedor_contato"
)
SELECT gen_random_uuid()::text, f."id_fornecedor", f."id_organizacao_cadastro_fornecedor", 'WHATSAPP'::"TipoCanalFornecedorContato", trim(f."whatsapp_fornecedor"), true, 0, CURRENT_TIMESTAMP
FROM "fornecedor" f
WHERE f."whatsapp_fornecedor" IS NOT NULL AND trim(f."whatsapp_fornecedor") <> '';
