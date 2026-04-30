-- Migration: align_fatura_produtos_gravity
-- Renomeia 12 colunas para alinhar ao schema DDD (sufixo _fatura_produtos_gravity).
-- Inclui: troca _servicos_ → _produtos_, adiciona prefixo nome_ em organizacao,
-- e converte campos legados (id, tenant_id, created_at, updated_at).
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).
-- Índices NÃO renomeados (mantidos com nomes legados por decisão do dono);
-- schema usa map: explícito para casar com nomes do banco.

ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "id"                                          TO "id_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "tenant_id"                                   TO "id_organizacao_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "numero_fatura_servicos_gravity"              TO "numero_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "status_fatura_servicos_gravity"              TO "status_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "organizacao_fatura_servicos_gravity"         TO "nome_organizacao_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "email_organizacao_fatura_servicos_gravity"   TO "email_organizacao_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "valor_total_fatura_servicos_gravity"         TO "valor_total_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "moeda_fatura_servicos_gravity"               TO "moeda_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "competencia_fatura_servicos_gravity"         TO "competencia_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "data_fatura_servicos_gravity"                TO "data_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "created_at"                                  TO "data_criacao_fatura_produtos_gravity";
ALTER TABLE "fatura_produtos_gravity" RENAME COLUMN "updated_at"                                  TO "data_atualizacao_fatura_produtos_gravity";
