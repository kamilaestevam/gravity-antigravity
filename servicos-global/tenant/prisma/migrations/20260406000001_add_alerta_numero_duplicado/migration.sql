-- Cria tabela configuracao_pedido se ainda não existir
-- (foi adicionada ao schema após a migration init)
CREATE TABLE IF NOT EXISTS "configuracao_pedido" (
  "id"                               TEXT NOT NULL,
  "tenant_id"                        TEXT NOT NULL,
  "company_id"                       TEXT,
  "duplicar_numero_auto"             BOOLEAN NOT NULL DEFAULT false,
  "duplicar_copiar_datas"            BOOLEAN NOT NULL DEFAULT false,
  "duplicar_status_inicial"          TEXT NOT NULL DEFAULT 'copiar',
  "excluir_status_permitidos"        TEXT[] NOT NULL DEFAULT ARRAY['rascunho','aberto','em_andamento','aprovado','transferencia','consolidado','cancelado'],
  "excluir_pedido_sem_item_permitido" BOOLEAN NOT NULL DEFAULT true,
  "excluir_confirmar_com_preview"    BOOLEAN NOT NULL DEFAULT true,
  "alerta_numero_duplicado"          BOOLEAN NOT NULL DEFAULT true,
  "updated_at"                       TIMESTAMP(3) NOT NULL,
  CONSTRAINT "configuracao_pedido_pkey" PRIMARY KEY ("id")
);

-- Adiciona a coluna alerta_numero_duplicado se a tabela já existia (idempotente)
ALTER TABLE "configuracao_pedido" ADD COLUMN IF NOT EXISTS "alerta_numero_duplicado" BOOLEAN NOT NULL DEFAULT true;

-- Índices
CREATE UNIQUE INDEX IF NOT EXISTS "configuracao_pedido_tenant_id_key" ON "configuracao_pedido"("tenant_id");
CREATE INDEX IF NOT EXISTS "configuracao_pedido_tenant_id_idx" ON "configuracao_pedido"("tenant_id");
CREATE INDEX IF NOT EXISTS "configuracao_pedido_tenant_id_company_id_idx" ON "configuracao_pedido"("tenant_id","company_id");
