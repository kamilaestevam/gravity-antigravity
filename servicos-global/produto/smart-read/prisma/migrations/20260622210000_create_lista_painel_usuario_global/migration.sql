-- Migration: create_lista_painel_usuario_global
-- Painéis salvos da Lista do Smart Read (colunas, filtros, ordem, largura) por usuário/produto.
-- Mesmo padrão de Pedido/BID Frete; discriminado por id_produto_gravity = 'smart-read'.

CREATE TABLE "lista_painel_usuario_global" (
    "id_lista_painel_usuario_global"               TEXT NOT NULL,
    "id_organizacao"                                TEXT NOT NULL,
    "id_usuario"                                    TEXT NOT NULL,
    "id_produto_gravity"                            TEXT NOT NULL,
    "nome_lista_painel_usuario_global"              TEXT NOT NULL,
    "ordem_lista_painel_usuario_global"             INTEGER NOT NULL DEFAULT 0,
    "visivel_lista_painel_usuario_global"           BOOLEAN NOT NULL DEFAULT true,
    "config_json_lista_painel_usuario_global"       TEXT NOT NULL DEFAULT '{}',
    "data_criacao_lista_painel_usuario_global"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_lista_painel_usuario_global"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lista_painel_usuario_global_pkey" PRIMARY KEY ("id_lista_painel_usuario_global")
);

CREATE INDEX "lista_painel_usuario_global_id_organizacao_idx"
    ON "lista_painel_usuario_global"("id_organizacao");

CREATE INDEX "lista_painel_usuario_global_id_organizacao_id_usuario_idx"
    ON "lista_painel_usuario_global"("id_organizacao", "id_usuario");

CREATE INDEX "lista_painel_usuario_global_id_organizacao_id_usuario_id_produto_gravity_idx"
    ON "lista_painel_usuario_global"("id_organizacao", "id_usuario", "id_produto_gravity");
