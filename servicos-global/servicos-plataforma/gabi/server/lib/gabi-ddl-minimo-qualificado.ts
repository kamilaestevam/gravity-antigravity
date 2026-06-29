// CREATE TABLE schema-qualificado — não depende de search_path nem migration.sql no disco.

import type { Client } from 'pg'

/** Garante tabelas mínimas do chat GABI no schema tenant_* (idempotente). */
export async function aplicarDdlGabiMinimoQualificado(
  client: Client,
  schemaName: string,
): Promise<void> {
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)

  await client.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."gabi_conversa" (
      "id_gabi_conversa" TEXT NOT NULL,
      "id_organizacao_gabi_conversa" TEXT NOT NULL,
      "id_produto_gabi_conversa" TEXT,
      "id_usuario_gabi_conversa" TEXT,
      "titulo_gabi_conversa" TEXT,
      "data_criacao_gabi_conversa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "data_atualizacao_gabi_conversa" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "gabi_conversa_pkey" PRIMARY KEY ("id_gabi_conversa")
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."gabi_mensagem" (
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
    )
  `)

  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_namespace n ON n.oid = c.connamespace
        WHERE c.conname = 'gabi_mensagem_id_conversa_gabi_mensagem_fkey'
          AND n.nspname = '${schemaName}'
      ) THEN
        ALTER TABLE "${schemaName}"."gabi_mensagem"
          ADD CONSTRAINT "gabi_mensagem_id_conversa_gabi_mensagem_fkey"
          FOREIGN KEY ("id_conversa_gabi_mensagem")
          REFERENCES "${schemaName}"."gabi_conversa"("id_gabi_conversa")
          ON DELETE CASCADE ON UPDATE CASCADE;
      END IF;
    END $$
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."gabi_memoria_usuario" (
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
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS "${schemaName}"."gabi_log_uso" (
      "id_gabi_log_uso" TEXT NOT NULL,
      "id_organizacao_gabi_log_uso" TEXT NOT NULL,
      "id_produto_gabi_log_uso" TEXT,
      "id_usuario_gabi_log_uso" TEXT,
      "acao_gabi_log_uso" TEXT NOT NULL,
      "snapshot_conversa_gabi_log_uso" TEXT NOT NULL DEFAULT '',
      "tipo_ator_gabi_log_uso" TEXT NOT NULL DEFAULT 'gabi',
      "disparado_por_gabi_log_uso" TEXT NOT NULL DEFAULT '',
      "modelo_gabi_log_uso" TEXT,
      "tokens_input_gabi_log_uso" INTEGER NOT NULL DEFAULT 0,
      "tokens_output_gabi_log_uso" INTEGER NOT NULL DEFAULT 0,
      "custo_usd_gabi_log_uso" DOUBLE PRECISION NOT NULL DEFAULT 0,
      "tools_chamadas_gabi_log_uso" JSONB,
      "data_criacao_gabi_log_uso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "gabi_log_uso_pkey" PRIMARY KEY ("id_gabi_log_uso")
    )
  `)

  await client.query(`
    CREATE INDEX IF NOT EXISTS "gco_org_idx"
      ON "${schemaName}"."gabi_conversa" ("id_organizacao_gabi_conversa")
  `)
  await client.query(`
    CREATE INDEX IF NOT EXISTS "gme_cnv_idx"
      ON "${schemaName}"."gabi_mensagem" ("id_conversa_gabi_mensagem")
  `)
}
