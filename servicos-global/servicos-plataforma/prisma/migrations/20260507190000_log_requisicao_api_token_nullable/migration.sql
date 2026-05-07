-- Migration: id_api_token em log_requisicao_api passa a ser nullable
--
-- Razão: chamadas internas (S2S) entre serviços não usam api_token —
-- autenticam via x-chave-interna-servico. Mas continuam gerando log.
-- Forçar id_api_token NOT NULL excluiria todo o tráfego interno do log.
--
-- Coordenador autorizou em 2026-05-07 (Fase 1B — antes de ativar persistencia
-- via prisma.logRequisicaoApi.createMany no monitoramento-api.ts).

ALTER TABLE "log_requisicao_api" ALTER COLUMN "id_api_token" DROP NOT NULL;
