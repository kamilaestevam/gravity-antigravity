-- Rename cartório empresa → fornecedor (DDD Cadastros — Passo rename P0)
-- Aplicar em gravity-cadastros-teste E gravity-cadastros-producao.
-- Valores de SUID preservados (id_fornecedor = antigo suid_empresa).

-- 1) Quebra FK temporária
ALTER TABLE "fornecedor_organizacao" DROP CONSTRAINT IF EXISTS "fornecedor_organizacao_id_fornecedor_fkey";

-- 2) Tabela
ALTER TABLE "empresa" RENAME TO "fornecedor";

-- 3) PK
ALTER TABLE "fornecedor" RENAME CONSTRAINT "empresa_pkey" TO "fornecedor_pkey";

-- 4) Colunas
ALTER TABLE "fornecedor" RENAME COLUMN "suid_empresa" TO "id_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "id_organizacao_empresa" TO "id_organizacao_cadastro_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "id_produto_empresa" TO "id_produto_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "id_usuario_empresa" TO "id_usuario_cadastro_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "nome_empresa" TO "nome_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "cnpj_empresa" TO "cnpj_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "tin_empresa" TO "tin_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pais_empresa" TO "pais_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "estado_empresa" TO "estado_provincia_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "cidade_empresa" TO "cidade_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "endereco_empresa" TO "endereco_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "zipcode_empresa" TO "cep_zipcode_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "email_empresa" TO "email_principal_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "telefone_empresa" TO "telefone_principal_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "whatsapp_empresa" TO "whatsapp_principal_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_importador_empresa" TO "pode_ser_importador_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_exportador_empresa" TO "pode_ser_exportador_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_fabricante_empresa" TO "pode_ser_fabricante_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_agente_empresa" TO "pode_ser_agente_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_despachante_empresa" TO "pode_ser_despachante_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_armador_empresa" TO "pode_ser_armador_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_armazem_alfandegado_empresa" TO "pode_ser_armazem_alfandegado_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_transportadora_rodoviaria_nacional_empresa" TO "pode_ser_transportadora_rodoviaria_nacional_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_cia_aerea_empresa" TO "pode_ser_cia_aerea_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_transportadora_rodoviaria_internacional_empresa" TO "pode_ser_transportadora_rodoviaria_internacional_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_seguradora_internacional_empresa" TO "pode_ser_seguradora_internacional_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_seguradora_corretora_cambio_empresa" TO "pode_ser_seguradora_corretora_cambio_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_banco_empresa" TO "pode_ser_banco_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "pode_ser_armazem_nacional_empresa" TO "pode_ser_armazem_nacional_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "ativo_empresa" TO "ativo_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "criado_em_empresa" TO "criado_em_fornecedor";
ALTER TABLE "fornecedor" RENAME COLUMN "atualizado_em_empresa" TO "atualizado_em_fornecedor";

-- 5) Índices / uniques
ALTER INDEX IF EXISTS "emp_unq_org_cnpj" RENAME TO "forn_unq_org_cnpj";
ALTER INDEX IF EXISTS "emp_unq_org_tin_pais" RENAME TO "forn_unq_org_tin_pais";
ALTER INDEX IF EXISTS "emp_org_idx" RENAME TO "forn_org_idx";
ALTER INDEX IF EXISTS "emp_org_prd_idx" RENAME TO "forn_org_prd_idx";
ALTER INDEX IF EXISTS "emp_org_usr_idx" RENAME TO "forn_org_usr_idx";
ALTER INDEX IF EXISTS "emp_org_nome_idx" RENAME TO "forn_org_nome_idx";

-- 6) FK fornecedor_organizacao → fornecedor
ALTER TABLE "fornecedor_organizacao"
  ADD CONSTRAINT "fornecedor_organizacao_id_fornecedor_fkey"
  FOREIGN KEY ("id_fornecedor") REFERENCES "fornecedor"("id_fornecedor")
  ON DELETE RESTRICT ON UPDATE CASCADE;
