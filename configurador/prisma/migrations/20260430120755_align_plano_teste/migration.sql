-- Migration: align_plano_teste
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME COLUMNs (22)
ALTER TABLE "plano_teste" RENAME COLUMN "id"               TO "id_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "tenant_id"        TO "id_organizacao_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "versao"           TO "versao_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "tipo"             TO "tipo_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "escopo"           TO "escopo_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "sublocal"         TO "sublocal_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "tela"             TO "tela_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "rota"             TO "rota_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "criticidade"      TO "criticidade_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "ambientes"        TO "ambientes_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "componente_path"  TO "caminho_componente_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "spec_path"        TO "caminho_spec_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "mapeamento_path"  TO "caminho_mapeamento_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "cobertura_pct"    TO "cobertura_pct_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "passos_total"     TO "passos_total_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "resumo_executivo" TO "resumo_executivo_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "plano_completo"   TO "plano_completo_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "status"           TO "status_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "ultima_execucao"  TO "ultima_execucao_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "ultimo_resultado" TO "ultimo_resultado_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "created_at"       TO "data_criacao_plano_teste";
ALTER TABLE "plano_teste" RENAME COLUMN "updated_at"       TO "data_atualizacao_plano_teste";

-- 2. RENAME INDEXes (4, mantendo prefixo abreviado plt_*)
ALTER INDEX "plano_teste_tenant_id_idx"     RENAME TO "plt_org_idx";
ALTER INDEX "plano_teste_tipo_escopo_idx"   RENAME TO "plt_tipo_escopo_idx";
ALTER INDEX "plano_teste_status_idx"        RENAME TO "plt_status_idx";
ALTER INDEX "plano_teste_sublocal_idx"      RENAME TO "plt_sublocal_idx";
