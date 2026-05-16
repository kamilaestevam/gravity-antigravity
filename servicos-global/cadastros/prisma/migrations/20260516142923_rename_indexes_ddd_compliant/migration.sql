-- Renomeia índices para nomes DDD completos (sem abreviação críptica).
-- eqi_* → exportador_quando_importacao_*
-- iqe_* → importador_quando_exportacao_*

ALTER INDEX "eqi_org_idx" RENAME TO "exportador_quando_importacao_org_idx";
ALTER INDEX "eqi_org_ws_idx" RENAME TO "exportador_quando_importacao_org_ws_idx";
ALTER INDEX "eqi_org_nome_idx" RENAME TO "exportador_quando_importacao_org_nome_idx";

ALTER INDEX "iqe_org_idx" RENAME TO "importador_quando_exportacao_org_idx";
ALTER INDEX "iqe_org_ws_idx" RENAME TO "importador_quando_exportacao_org_ws_idx";
ALTER INDEX "iqe_org_nome_idx" RENAME TO "importador_quando_exportacao_org_nome_idx";
