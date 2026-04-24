-- =====================================================================
-- Migration DDD — serviço: Cadastros
-- Gerado em: 2026-04-24T14:16:01.002Z
-- Fonte: C:\Users\danie\gravity-antigravity\.claude\planilha-tmp.xlsx
-- =====================================================================
BEGIN;

ALTER TABLE "Empresa" RENAME TO "empresa";
ALTER TABLE "Moeda" RENAME TO "moeda";
ALTER TABLE "Unidade" RENAME TO "unidade";
ALTER TABLE "NCM" RENAME TO "ncm";
ALTER TABLE "HistoricoStatusOPE" RENAME TO "ope_historico_status";
ALTER TABLE "empresa" RENAME COLUMN "suid" TO "suid_empresa";
ALTER TABLE "empresa" RENAME COLUMN "cnpj" TO "cnpj_empresa";
ALTER TABLE "empresa" RENAME COLUMN "tin" TO "tin_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pais" TO "pais_empresa";
ALTER TABLE "empresa" RENAME COLUMN "estado" TO "estado_empresa";
ALTER TABLE "empresa" RENAME COLUMN "cidade" TO "cidade_empresa";
ALTER TABLE "empresa" RENAME COLUMN "endereco" TO "endereco_empresa";
ALTER TABLE "empresa" RENAME COLUMN "zipcode" TO "zipcode_empresa";
ALTER TABLE "empresa" RENAME COLUMN "email" TO "email_empresa";
ALTER TABLE "empresa" RENAME COLUMN "telefone" TO "telefone_empresa";
ALTER TABLE "empresa" RENAME COLUMN "whatsapp" TO "whatsapp_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_importador" TO "pode_ser_importador_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_exportador" TO "pode_ser_exportador_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_fabricante" TO "pode_ser_fabricante_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_agente" TO "pode_ser_agente_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_despachante" TO "pode_ser_despachante_empresa";
ALTER TABLE "empresa" RENAME COLUMN "pode_ser_armador" TO "pode_ser_armador_empresa";
ALTER TABLE "empresa" RENAME COLUMN "ativo" TO "ativo_empresa";
ALTER TABLE "empresa" RENAME COLUMN "criado_em" TO "criado_em_empresa";
ALTER TABLE "empresa" RENAME COLUMN "atualizado_em" TO "atualizado_em_empresa";
ALTER TABLE "ope_historico_status" RENAME COLUMN "id" TO "id_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "suid_ope" TO "suid_ope_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "status_anterior" TO "status_anterior_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "status_novo" TO "status_novo_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "origem" TO "origem_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "payload" TO "payload_historico_status_ope";
ALTER TABLE "ope_historico_status" RENAME COLUMN "registrado_em" TO "registrado_em_historico_status_ope";
ALTER TABLE "moeda" RENAME COLUMN "codigo" TO "codigo_moeda";
ALTER TABLE "moeda" RENAME COLUMN "simbolo" TO "simbolo_moeda";
ALTER TABLE "moeda" RENAME COLUMN "ativo" TO "ativo_moeda";
ALTER TABLE "ncm" RENAME COLUMN "codigo" TO "codigo_ncm";
ALTER TABLE "ncm" RENAME COLUMN "descricao" TO "descricao_ncm";
ALTER TABLE "ncm" RENAME COLUMN "ipi" TO "ipi_ncm";
ALTER TABLE "ncm" RENAME COLUMN "ii" TO "ii_ncm";
ALTER TABLE "ncm" RENAME COLUMN "ativo" TO "ativo_ncm";
ALTER TABLE "OPE" RENAME COLUMN "suid" TO "suid_ope";
ALTER TABLE "OPE" RENAME COLUMN "codigo_portal_unico" TO "codigo_portal_unico_ope";
ALTER TABLE "OPE" RENAME COLUMN "situacao" TO "situacao_ope";
ALTER TABLE "OPE" RENAME COLUMN "versao" TO "versao_ope";
ALTER TABLE "OPE" RENAME COLUMN "cnpj_raiz_empresa" TO "cnpj_raiz_empresa_ope";
ALTER TABLE "OPE" RENAME COLUMN "pais" TO "pais_ope";
ALTER TABLE "OPE" RENAME COLUMN "estado" TO "estado_ope";
ALTER TABLE "OPE" RENAME COLUMN "cidade" TO "cidade_ope";
ALTER TABLE "OPE" RENAME COLUMN "endereco" TO "endereco_ope";
ALTER TABLE "OPE" RENAME COLUMN "zip" TO "zip_ope";
ALTER TABLE "OPE" RENAME COLUMN "tin" TO "tin_ope";
ALTER TABLE "OPE" RENAME COLUMN "email" TO "email_ope";
ALTER TABLE "OPE" RENAME COLUMN "ultima_sincronizacao" TO "ultima_sincronizacao_ope";
ALTER TABLE "OPE" RENAME COLUMN "origem" TO "origem_ope";
ALTER TABLE "unidade" RENAME COLUMN "codigo" TO "codigo_unidade";
ALTER TABLE "unidade" RENAME COLUMN "nome" TO "nome_unidade";
ALTER TABLE "unidade" RENAME COLUMN "tipo" TO "tipo_unidade";
ALTER TABLE "unidade" RENAME COLUMN "ativo" TO "ativo_unidade";
ALTER TABLE "moeda" DROP COLUMN IF EXISTS "nome";
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_armazem_alfandegado_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_transportadora_rodoviaria_nacional_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_cia_aerea_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_transportadora_rodoviaria_internacional_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_seguradora_internacional_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_seguradora_corretora_cambio_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_banco_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "empresa" ADD COLUMN IF NOT EXISTS "pode_ser_armazem_nacional_empresa" BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE "ncm" ADD COLUMN IF NOT EXISTS "pis_ncm" DOUBLE PRECISION;
ALTER TABLE "ncm" ADD COLUMN IF NOT EXISTS "cofins_ncm" DOUBLE PRECISION;

COMMIT;
