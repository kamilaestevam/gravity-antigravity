-- Migration: create_conversao_leitura_pedido_smart_read
-- Linhagem DE/PARA leitura Smart Read → Pedido (TASK-000408).

CREATE TABLE "conversao_leitura_pedido_smart_read" (
    "id_conversao_leitura_pedido_smart_read" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "id_produto_gravity" TEXT NOT NULL DEFAULT 'smart-read',
    "id_usuario" TEXT NOT NULL,
    "id_workspace" TEXT,
    "id_leitura_legado_conversao_leitura_pedido" TEXT NOT NULL,
    "id_snapshot_leitura_smart_read" TEXT,
    "id_pedido" TEXT NOT NULL,
    "ids_pedido_item_conversao_leitura_pedido" JSONB NOT NULL,
    "status_conversao_leitura_pedido_smart_read" TEXT NOT NULL,
    "detalhe_mapeamento_conversao_leitura_pedido" JSONB NOT NULL,
    "data_conversao_leitura_pedido_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_criacao_conversao_leitura_pedido_smart_read" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_conversao_leitura_pedido" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversao_leitura_pedido_smart_read_pkey" PRIMARY KEY ("id_conversao_leitura_pedido_smart_read")
);

CREATE UNIQUE INDEX "conversao_leitura_pedido_smart_read_id_organizacao_id_leitura_key"
    ON "conversao_leitura_pedido_smart_read"(
        "id_organizacao",
        "id_leitura_legado_conversao_leitura_pedido"
    );

CREATE INDEX "conversao_leitura_pedido_smart_read_id_organizacao_idx"
    ON "conversao_leitura_pedido_smart_read"("id_organizacao");

CREATE INDEX "conversao_leitura_pedido_smart_read_id_organizacao_id_produto_gravity_idx"
    ON "conversao_leitura_pedido_smart_read"("id_organizacao", "id_produto_gravity");

CREATE INDEX "conversao_leitura_pedido_smart_read_id_organizacao_id_usuario_idx"
    ON "conversao_leitura_pedido_smart_read"("id_organizacao", "id_usuario");

CREATE INDEX "conversao_leitura_pedido_smart_read_id_organizacao_id_pedido_idx"
    ON "conversao_leitura_pedido_smart_read"("id_organizacao", "id_pedido");
