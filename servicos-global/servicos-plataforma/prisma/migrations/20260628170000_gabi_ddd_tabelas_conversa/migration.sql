-- GABI DDD — alinha tabelas legadas (GabiConversation / conversa_completa_gabi)
-- com os nomes canônicos usados pelo Prisma (gabi_conversa, gabi_mensagem, gabi_log_uso).
-- Idempotente: seguro em public e em cada schema tenant_* via migrate-all-tenants.
-- IMPORTANTE: to_regclass usa current_schema() para não confundir tabelas em public
-- com o schema tenant_* (search_path inclui public).

-- ---------------------------------------------------------------------------
-- gabi_conversa
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass(format('%I.gabi_conversa', current_schema())) IS NOT NULL THEN
    NULL;
  ELSIF to_regclass(format('%I.conversa_completa_gabi', current_schema())) IS NOT NULL THEN
    ALTER TABLE "conversa_completa_gabi" RENAME TO "gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "id" TO "id_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "product_id" TO "id_produto_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "user_id" TO "id_usuario_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "title" TO "titulo_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "created_at" TO "data_criacao_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "updated_at" TO "data_atualizacao_gabi_conversa";
  ELSIF to_regclass(format('%I.%I', current_schema(), 'GabiConversation')) IS NOT NULL THEN
    ALTER TABLE "GabiConversation" RENAME TO "gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "id" TO "id_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "product_id" TO "id_produto_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "user_id" TO "id_usuario_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "title" TO "titulo_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "created_at" TO "data_criacao_gabi_conversa";
    ALTER TABLE "gabi_conversa" RENAME COLUMN "updated_at" TO "data_atualizacao_gabi_conversa";
  ELSE
    CREATE TABLE "gabi_conversa" (
      "id_gabi_conversa" TEXT NOT NULL,
      "id_organizacao_gabi_conversa" TEXT NOT NULL,
      "id_produto_gabi_conversa" TEXT,
      "id_usuario_gabi_conversa" TEXT,
      "titulo_gabi_conversa" TEXT,
      "data_criacao_gabi_conversa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "data_atualizacao_gabi_conversa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "gabi_conversa_pkey" PRIMARY KEY ("id_gabi_conversa")
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "gco_org_idx"
  ON "gabi_conversa" ("id_organizacao_gabi_conversa");
CREATE INDEX IF NOT EXISTS "gco_org_prd_idx"
  ON "gabi_conversa" ("id_organizacao_gabi_conversa", "id_produto_gabi_conversa");
CREATE INDEX IF NOT EXISTS "gco_org_usr_idx"
  ON "gabi_conversa" ("id_organizacao_gabi_conversa", "id_usuario_gabi_conversa");

-- ---------------------------------------------------------------------------
-- gabi_mensagem
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass(format('%I.gabi_mensagem', current_schema())) IS NOT NULL THEN
    NULL;
  ELSIF to_regclass(format('%I.mensagem_individual_gabiai', current_schema())) IS NOT NULL THEN
    ALTER TABLE "mensagem_individual_gabiai" RENAME TO "gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "id" TO "id_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "product_id" TO "id_produto_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "user_id" TO "id_usuario_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "conversation_id" TO "id_conversa_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "role" TO "papel_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "content" TO "conteudo_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "attachments" TO "anexos_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "created_at" TO "data_criacao_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "updated_at" TO "data_atualizacao_gabi_mensagem";
  ELSIF to_regclass(format('%I.%I', current_schema(), 'GabiMessage')) IS NOT NULL THEN
    ALTER TABLE "GabiMessage" RENAME TO "gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "id" TO "id_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "product_id" TO "id_produto_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "user_id" TO "id_usuario_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "conversation_id" TO "id_conversa_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "role" TO "papel_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "content" TO "conteudo_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "attachments" TO "anexos_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "created_at" TO "data_criacao_gabi_mensagem";
    ALTER TABLE "gabi_mensagem" RENAME COLUMN "updated_at" TO "data_atualizacao_gabi_mensagem";
  ELSE
    CREATE TABLE "gabi_mensagem" (
      "id_gabi_mensagem" TEXT NOT NULL,
      "id_organizacao_gabi_mensagem" TEXT NOT NULL,
      "id_produto_gabi_mensagem" TEXT,
      "id_usuario_gabi_mensagem" TEXT,
      "id_conversa_gabi_mensagem" TEXT NOT NULL,
      "papel_gabi_mensagem" TEXT NOT NULL,
      "conteudo_gabi_mensagem" TEXT NOT NULL,
      "anexos_gabi_mensagem" TEXT,
      "data_criacao_gabi_mensagem" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "data_atualizacao_gabi_mensagem" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "gabi_mensagem_pkey" PRIMARY KEY ("id_gabi_mensagem")
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE c.conname = 'gabi_mensagem_id_conversa_gabi_mensagem_fkey'
      AND n.nspname = current_schema()
  ) THEN
    ALTER TABLE "gabi_mensagem"
      ADD CONSTRAINT "gabi_mensagem_id_conversa_gabi_mensagem_fkey"
      FOREIGN KEY ("id_conversa_gabi_mensagem")
      REFERENCES "gabi_conversa"("id_gabi_conversa")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "gme_org_idx"
  ON "gabi_mensagem" ("id_organizacao_gabi_mensagem");
CREATE INDEX IF NOT EXISTS "gme_org_prd_idx"
  ON "gabi_mensagem" ("id_organizacao_gabi_mensagem", "id_produto_gabi_mensagem");
CREATE INDEX IF NOT EXISTS "gme_org_usr_idx"
  ON "gabi_mensagem" ("id_organizacao_gabi_mensagem", "id_usuario_gabi_mensagem");
CREATE INDEX IF NOT EXISTS "gme_cnv_idx"
  ON "gabi_mensagem" ("id_conversa_gabi_mensagem");

-- ---------------------------------------------------------------------------
-- gabi_log_uso (limite monetário MTD)
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF to_regclass(format('%I.gabi_log_uso', current_schema())) IS NOT NULL THEN
    NULL;
  ELSIF to_regclass(format('%I.gabiai_log_uso', current_schema())) IS NOT NULL THEN
    ALTER TABLE "gabiai_log_uso" RENAME TO "gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "id" TO "id_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "product_id" TO "id_produto_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "user_id" TO "id_usuario_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "action_taken" TO "acao_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "conversation_snapshot" TO "snapshot_conversa_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "actor_type" TO "tipo_ator_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "triggered_by" TO "disparado_por_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "model_used" TO "modelo_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "tokens_input" TO "tokens_input_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "tokens_output" TO "tokens_output_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "cost_usd" TO "custo_usd_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "created_at" TO "data_criacao_gabi_log_uso";
  ELSIF to_regclass(format('%I.%I', current_schema(), 'GabiUsageLog')) IS NOT NULL THEN
    ALTER TABLE "GabiUsageLog" RENAME TO "gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "id" TO "id_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "tenant_id" TO "id_organizacao_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "product_id" TO "id_produto_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "user_id" TO "id_usuario_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "action_taken" TO "acao_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "conversation_snapshot" TO "snapshot_conversa_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "actor_type" TO "tipo_ator_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "triggered_by" TO "disparado_por_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" RENAME COLUMN "created_at" TO "data_criacao_gabi_log_uso";
    ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "modelo_gabi_log_uso" TEXT;
    ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "tokens_input_gabi_log_uso" INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "tokens_output_gabi_log_uso" INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "custo_usd_gabi_log_uso" DOUBLE PRECISION NOT NULL DEFAULT 0;
  ELSE
    CREATE TABLE "gabi_log_uso" (
      "id_gabi_log_uso" TEXT NOT NULL,
      "id_organizacao_gabi_log_uso" TEXT NOT NULL,
      "id_produto_gabi_log_uso" TEXT,
      "id_usuario_gabi_log_uso" TEXT,
      "acao_gabi_log_uso" TEXT NOT NULL,
      "snapshot_conversa_gabi_log_uso" TEXT NOT NULL,
      "tipo_ator_gabi_log_uso" TEXT NOT NULL DEFAULT 'gabi',
      "disparado_por_gabi_log_uso" TEXT NOT NULL,
      "modelo_gabi_log_uso" TEXT,
      "tokens_input_gabi_log_uso" INTEGER NOT NULL DEFAULT 0,
      "tokens_output_gabi_log_uso" INTEGER NOT NULL DEFAULT 0,
      "custo_usd_gabi_log_uso" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "tools_chamadas_gabi_log_uso" JSONB,
      "data_criacao_gabi_log_uso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "gabi_log_uso_pkey" PRIMARY KEY ("id_gabi_log_uso")
    );
  END IF;
END $$;

ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "tools_chamadas_gabi_log_uso" JSONB;
ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "modelo_gabi_log_uso" TEXT;
ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "tokens_input_gabi_log_uso" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "tokens_output_gabi_log_uso" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "gabi_log_uso" ADD COLUMN IF NOT EXISTS "custo_usd_gabi_log_uso" DOUBLE PRECISION NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS "glu_org_idx"
  ON "gabi_log_uso" ("id_organizacao_gabi_log_uso");
CREATE INDEX IF NOT EXISTS "glu_org_prd_idx"
  ON "gabi_log_uso" ("id_organizacao_gabi_log_uso", "id_produto_gabi_log_uso");
CREATE INDEX IF NOT EXISTS "glu_org_usr_idx"
  ON "gabi_log_uso" ("id_organizacao_gabi_log_uso", "id_usuario_gabi_log_uso");

-- ---------------------------------------------------------------------------
-- gabi_memoria_usuario (agente v2 — opcional no primeiro turno, mas evita 500)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "gabi_memoria_usuario" (
  "id_gabi_memoria_usuario" TEXT NOT NULL,
  "id_organizacao_gabi_memoria_usuario" TEXT NOT NULL,
  "id_usuario_gabi_memoria_usuario" TEXT NOT NULL,
  "tipo_gabi_memoria_usuario" TEXT NOT NULL,
  "chave_gabi_memoria_usuario" TEXT NOT NULL,
  "valor_gabi_memoria_usuario" TEXT NOT NULL,
  "confianca_gabi_memoria_usuario" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "origem_gabi_memoria_usuario" TEXT NOT NULL DEFAULT 'inferido',
  "ativo_gabi_memoria_usuario" BOOLEAN NOT NULL DEFAULT true,
  "data_criacao_gabi_memoria_usuario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_gabi_memoria_usuario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_ultimo_uso_gabi_memoria_usuario" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gabi_memoria_usuario_pkey" PRIMARY KEY ("id_gabi_memoria_usuario")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gmu_unq_org_usr_tipo_chave"
  ON "gabi_memoria_usuario" (
    "id_organizacao_gabi_memoria_usuario",
    "id_usuario_gabi_memoria_usuario",
    "tipo_gabi_memoria_usuario",
    "chave_gabi_memoria_usuario"
  );
CREATE INDEX IF NOT EXISTS "gmu_org_idx"
  ON "gabi_memoria_usuario" ("id_organizacao_gabi_memoria_usuario");
CREATE INDEX IF NOT EXISTS "gmu_org_usr_idx"
  ON "gabi_memoria_usuario" (
    "id_organizacao_gabi_memoria_usuario",
    "id_usuario_gabi_memoria_usuario"
  );
