-- Migration: add_teste_favorito_usuario
-- Cria a tabela teste_favorito_usuario — persiste no Postgres as combinações
-- salvas no modal "Rodar Testes" do Admin (produto + ambiente + tipos + planos),
-- vinculadas ao usuário dono via id_usuario. Substitui a persistência localStorage.
-- Aprovado pelo Coordenador em 2026-06-11.

CREATE TABLE "teste_favorito_usuario" (
    "id_teste_favorito_usuario"               TEXT NOT NULL,
    "id_organizacao_teste_favorito_usuario"   TEXT NOT NULL DEFAULT 'platform',
    "id_usuario"                              TEXT NOT NULL,
    "produto_teste_favorito_usuario"          TEXT NOT NULL,
    "ambiente_teste_favorito_usuario"         TEXT NOT NULL DEFAULT 'Local',
    "tipos_teste_favorito_usuario"            TEXT[],
    "planos_ids_teste_favorito_usuario"       TEXT[],
    "planos_resumo_teste_favorito_usuario"    JSONB,
    "data_criacao_teste_favorito_usuario"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_teste_favorito_usuario" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teste_favorito_usuario_pkey" PRIMARY KEY ("id_teste_favorito_usuario")
);

CREATE INDEX "tfu_usuario_idx" ON "teste_favorito_usuario"("id_usuario");
CREATE INDEX "tfu_org_idx" ON "teste_favorito_usuario"("id_organizacao_teste_favorito_usuario");

ALTER TABLE "teste_favorito_usuario"
    ADD CONSTRAINT "teste_favorito_usuario_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;
