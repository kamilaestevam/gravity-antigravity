-- Migration: add pedido_casas_decimais_config
-- Tabela de configuração de casas decimais por tenant
-- Um registro por tenant (UNIQUE tenant_id)

CREATE TABLE "pedido_casas_decimais_config" (
    "id"                                  TEXT NOT NULL,
    "tenant_id"                           TEXT NOT NULL,
    "product_id"                          TEXT,
    "valor_total_pedido"                  INTEGER NOT NULL DEFAULT 2,
    "quantidade_total_inicial_pedido"     INTEGER NOT NULL DEFAULT 2,
    "quantidade_pronta_pedido_total"      INTEGER NOT NULL DEFAULT 2,
    "saldo_itens_do_pedido"              INTEGER NOT NULL DEFAULT 2,
    "quantidade_transferida_total"        INTEGER NOT NULL DEFAULT 2,
    "quantidade_cancelada_total_pedido"   INTEGER NOT NULL DEFAULT 2,
    "peso_liquido_total_pedido"           INTEGER NOT NULL DEFAULT 3,
    "peso_bruto_total_pedido"             INTEGER NOT NULL DEFAULT 3,
    "cubagem_total_pedido"                INTEGER NOT NULL DEFAULT 3,
    "created_at"                          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"                          TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pedido_casas_decimais_config_pkey" PRIMARY KEY ("id")
);

-- Índices obrigatórios (agent-policy)
CREATE UNIQUE INDEX "pedido_casas_decimais_config_tenant_id_key"
    ON "pedido_casas_decimais_config"("tenant_id");

CREATE INDEX "pedido_casas_decimais_config_tenant_id_idx"
    ON "pedido_casas_decimais_config"("tenant_id");

CREATE INDEX "pedido_casas_decimais_config_tenant_id_product_id_idx"
    ON "pedido_casas_decimais_config"("tenant_id", "product_id");
