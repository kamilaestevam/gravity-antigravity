-- Passo 01b — ENUM tipo_fornecedor_organizacao: apenas prestadores de serviço / portal.
-- Remove EXPORTADOR_QUANDO_IMPORTACAO e IMPORTADOR_QUANDO_EXPORTACAO (contraparte = empresa + Pedido).
-- Tabela fornecedor_organizacao vazia em prod/teste no cutover; seguro recriar tipo.

CREATE TYPE "TipoFornecedorOrganizacao_new" AS ENUM (
  'AGENTE_CARGA',
  'DESPACHANTE_ADUANEIRO',
  'ARMADOR',
  'CIA_AEREA',
  'TRANSPORTADORA_RODOVIARIA_NACIONAL',
  'TRANSPORTADORA_RODOVIARIA_INTERNACIONAL',
  'ARMAZEM_ALFANDEGADO',
  'ARMAZEM_NACIONAL',
  'BANCO',
  'SEGURADORA_INTERNACIONAL',
  'CORRETORA_CAMBIO',
  'FABRICANTE'
);

ALTER TABLE "fornecedor_organizacao"
  ALTER COLUMN "tipo_fornecedor_organizacao" TYPE "TipoFornecedorOrganizacao_new"
  USING ("tipo_fornecedor_organizacao"::text::"TipoFornecedorOrganizacao_new");

DROP TYPE "TipoFornecedorOrganizacao";

ALTER TYPE "TipoFornecedorOrganizacao_new" RENAME TO "TipoFornecedorOrganizacao";
