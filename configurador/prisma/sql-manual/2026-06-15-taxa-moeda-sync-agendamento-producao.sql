-- Manual: taxa_moeda_sync_agendamento — gravity-configurador-producao
-- Rodar no Railway → gravity-configurador-producao → Postgres (postgres-volume) → Query
-- Idempotente (IF NOT EXISTS + ON CONFLICT DO NOTHING)

CREATE TABLE IF NOT EXISTS "taxa_moeda_sync_agendamento" (
  "id_taxa_moeda_sync_agendamento"               TEXT NOT NULL,
  "ativo_taxa_moeda_sync_agendamento"           BOOLEAN NOT NULL DEFAULT false,
  "frequencia_taxa_moeda_sync_agendamento"      TEXT NOT NULL DEFAULT 'Manual',
  "hora_taxa_moeda_sync_agendamento"            INTEGER NOT NULL DEFAULT 0,
  "minuto_taxa_moeda_sync_agendamento"          INTEGER NOT NULL DEFAULT 0,
  "alertas_taxa_moeda_sync_agendamento"         JSONB NOT NULL DEFAULT '[]',
  "ultima_execucao_taxa_moeda_sync_agendamento" TIMESTAMP(3),
  "data_criacao_taxa_moeda_sync_agendamento"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_atualizacao_taxa_moeda_sync_agendamento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "taxa_moeda_sync_agendamento_pkey" PRIMARY KEY ("id_taxa_moeda_sync_agendamento")
);

CREATE INDEX IF NOT EXISTS "tmsa_ativo_idx"
  ON "taxa_moeda_sync_agendamento" ("ativo_taxa_moeda_sync_agendamento");

INSERT INTO "taxa_moeda_sync_agendamento" (
  "id_taxa_moeda_sync_agendamento",
  "ativo_taxa_moeda_sync_agendamento",
  "frequencia_taxa_moeda_sync_agendamento",
  "hora_taxa_moeda_sync_agendamento",
  "minuto_taxa_moeda_sync_agendamento",
  "alertas_taxa_moeda_sync_agendamento",
  "ultima_execucao_taxa_moeda_sync_agendamento",
  "data_criacao_taxa_moeda_sync_agendamento",
  "data_atualizacao_taxa_moeda_sync_agendamento"
) VALUES
  ('ptax',  true, 'Diario',  10, 3, '[]'::jsonb, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('focus', true, 'Semanal', 22, 0, '[]'::jsonb, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id_taxa_moeda_sync_agendamento") DO NOTHING;

-- Verificação:
-- SELECT * FROM taxa_moeda_sync_agendamento ORDER BY id_taxa_moeda_sync_agendamento;
