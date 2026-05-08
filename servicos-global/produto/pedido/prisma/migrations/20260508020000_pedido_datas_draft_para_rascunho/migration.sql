-- Migration: pedido_datas_draft_para_rascunho
--
-- Renomeia 18 colunas de data da tabela "pedido" trocando o termo inglês 'draft'
-- pelo termo PT-BR canônico 'rascunho' (skill ddd-nomenclatura, princípio
-- fundamental: nomeação em PT-BR sem acentos).
--
-- Contexto:
--   - As 18 colunas representam o ciclo do documento em duas versões:
--     "rascunho" (versão para revisão) e "original" (versão final).
--   - Hoje o atlas DDD declara o conceito como "Rascunho" mas o nome físico
--     da coluna ainda é "draft" — atlas e banco discordavam.
--   - A palavra "original" (versão definitiva) é mantida — é PT-BR válido.
--   - As palavras "invoice" e "proforma" também ficam — são termos de comércio
--     internacional consolidados em PT-BR técnico (decisão Coordenador, ver
--     análise do Débito 3 — opção 3A escolhida sobre 3B).
--
-- Operação:
--   18 ALTER TABLE ... RENAME COLUMN.
--   RENAME COLUMN é instantâneo no Postgres (apenas atualiza catálogo, sem
--   reescrita de dados, sem lock longo). 18 renames seguidos rodam em < 1s.
--
-- Quebra de retrocompatibilidade:
--   Toda rota / SDK / código que faz SELECT, INSERT, UPDATE, ORDER BY ou
--   WHERE em qualquer dessas 18 colunas precisa ser atualizado JUNTO
--   (Mandamento 07 — sincronia de contratos).
--
-- Auditoria de impacto realizada: 84 referências em 12 arquivos de código
-- + atlas DDD + knowledge base + docs FASE 06B + script Python +
-- teste-carga. Todos foram atualizados no mesmo PR.

BEGIN;

-- ─── Bloco 1: Datas Rascunho do Pedido (recebimento + aprovação) ─────────────
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_draft_pedido"     TO "data_previsao_recebimento_rascunho_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_draft_pedido"  TO "data_confirmacao_recebimento_rascunho_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_draft_pedido"         TO "data_meta_recebimento_rascunho_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_draft_pedido"       TO "data_previsao_aprovacao_rascunho_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_draft_pedido"    TO "data_confirmacao_aprovacao_rascunho_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_draft_pedido"           TO "data_meta_aprovacao_rascunho_pedido";

-- ─── Bloco 2: Datas Rascunho da Proforma ─────────────────────────────────────
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_draft_proforma_pedido"    TO "data_previsao_recebimento_rascunho_proforma_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_draft_proforma_pedido" TO "data_confirmacao_recebimento_rascunho_proforma_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_draft_proforma_pedido"        TO "data_meta_recebimento_rascunho_proforma_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_draft_proforma_pedido"      TO "data_previsao_aprovacao_rascunho_proforma_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_draft_proforma_pedido"   TO "data_confirmacao_aprovacao_rascunho_proforma_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_draft_proforma_pedido"          TO "data_meta_aprovacao_rascunho_proforma_pedido";

-- ─── Bloco 3: Datas Rascunho da Invoice ──────────────────────────────────────
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_draft_invoice_pedido"     TO "data_previsao_recebimento_rascunho_invoice_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_draft_invoice_pedido"  TO "data_confirmacao_recebimento_rascunho_invoice_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_draft_invoice_pedido"         TO "data_meta_recebimento_rascunho_invoice_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_draft_invoice_pedido"       TO "data_previsao_aprovacao_rascunho_invoice_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_draft_invoice_pedido"    TO "data_confirmacao_aprovacao_rascunho_invoice_pedido";
ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_draft_invoice_pedido"           TO "data_meta_aprovacao_rascunho_invoice_pedido";

COMMIT;

-- ─── VALIDAÇÃO PÓS-DEPLOY ────────────────────────────────────────────────────
-- Em cada schema de organização, rodar:
--
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'pedido'
--      AND column_name LIKE '%draft%';
--
-- Esperado: 0 linhas (nenhuma coluna com 'draft' restante).
--
--   SELECT column_name FROM information_schema.columns
--    WHERE table_name = 'pedido'
--      AND column_name LIKE '%rascunho%';
--
-- Esperado: 18 linhas.

-- ─── ROLLBACK ────────────────────────────────────────────────────────────────
-- Em caso de necessidade de reverter (NÃO recomendado — código novo já assume
-- 'rascunho'; reverter o banco sem reverter o código causa ruptura imediata):
--
-- BEGIN;
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_rascunho_pedido"        TO "data_previsao_recebimento_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_rascunho_pedido"     TO "data_confirmacao_recebimento_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_rascunho_pedido"            TO "data_meta_recebimento_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_rascunho_pedido"          TO "data_previsao_aprovacao_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_rascunho_pedido"       TO "data_confirmacao_aprovacao_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_rascunho_pedido"              TO "data_meta_aprovacao_draft_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_rascunho_proforma_pedido"    TO "data_previsao_recebimento_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_rascunho_proforma_pedido" TO "data_confirmacao_recebimento_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_rascunho_proforma_pedido"        TO "data_meta_recebimento_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_rascunho_proforma_pedido"      TO "data_previsao_aprovacao_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_rascunho_proforma_pedido"   TO "data_confirmacao_aprovacao_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_rascunho_proforma_pedido"          TO "data_meta_aprovacao_draft_proforma_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_recebimento_rascunho_invoice_pedido"     TO "data_previsao_recebimento_draft_invoice_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_recebimento_rascunho_invoice_pedido"  TO "data_confirmacao_recebimento_draft_invoice_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_recebimento_rascunho_invoice_pedido"         TO "data_meta_recebimento_draft_invoice_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_previsao_aprovacao_rascunho_invoice_pedido"       TO "data_previsao_aprovacao_draft_invoice_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_confirmacao_aprovacao_rascunho_invoice_pedido"    TO "data_confirmacao_aprovacao_draft_invoice_pedido";
-- ALTER TABLE "pedido" RENAME COLUMN "data_meta_aprovacao_rascunho_invoice_pedido"           TO "data_meta_aprovacao_draft_invoice_pedido";
-- COMMIT;
--
-- Pré-requisito do rollback: também reverter ~12 arquivos de código + atlas + knowledge.
-- Caminho seguro de retorno é forward-fix.
