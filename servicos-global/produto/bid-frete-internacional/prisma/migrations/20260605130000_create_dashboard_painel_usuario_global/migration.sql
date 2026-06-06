-- Migration: create_dashboard_painel_usuario_global
-- Painéis salvos do Dashboard (widgets, layout) por usuário — compartilhado cross-produto via prefixo bid_frete_.

CREATE TABLE "dashboard_painel_usuario_global" (
    "id_dashboard_painel_usuario_global"               TEXT NOT NULL,
    "id_organizacao"                                   TEXT NOT NULL,
    "id_usuario"                                       TEXT NOT NULL,
    "nome_dashboard_painel_usuario_global"             TEXT NOT NULL,
    "ordem_dashboard_painel_usuario_global"            INTEGER NOT NULL DEFAULT 0,
    "visivel_dashboard_painel_usuario_global"          BOOLEAN NOT NULL DEFAULT true,
    "widgets_json_dashboard_painel_usuario_global"     TEXT NOT NULL DEFAULT '[]',
    "data_criacao_dashboard_painel_usuario_global"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_dashboard_painel_usuario_global" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_painel_usuario_global_pkey" PRIMARY KEY ("id_dashboard_painel_usuario_global")
);

CREATE INDEX "dashboard_painel_usuario_global_id_organizacao_idx"
    ON "dashboard_painel_usuario_global"("id_organizacao");

CREATE INDEX "dashboard_painel_usuario_global_id_organizacao_id_usuario_idx"
    ON "dashboard_painel_usuario_global"("id_organizacao", "id_usuario");
