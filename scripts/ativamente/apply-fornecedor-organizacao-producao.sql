-- Aplicar em gravity-cadastros-producao (Railway → Database → Data → SQL)
-- Migration: 20260524120000_add_fornecedor_organizacao
-- Depois de executar, atualize a página: deve aparecer tabela fornecedor_organizacao (17 tabelas).

-- CreateEnum
CREATE TYPE "TipoFornecedorOrganizacao" AS ENUM (
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
  'FABRICANTE',
  'EXPORTADOR_QUANDO_IMPORTACAO',
  'IMPORTADOR_QUANDO_EXPORTACAO'
);

CREATE TYPE "StatusFornecedorOrganizacao" AS ENUM (
  'ATIVO',
  'INATIVO',
  'PENDENTE_APROVACAO'
);

CREATE TABLE "fornecedor_organizacao" (
    "id_fornecedor_organizacao" TEXT NOT NULL,
    "id_fornecedor" TEXT NOT NULL,
    "id_organizacao" TEXT NOT NULL,
    "tipo_fornecedor_organizacao" "TipoFornecedorOrganizacao" NOT NULL,
    "status_fornecedor_organizacao" "StatusFornecedorOrganizacao" NOT NULL DEFAULT 'ATIVO',
    "id_usuario" TEXT,
    "data_criacao_fornecedor_organizacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao_fornecedor_organizacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedor_organizacao_pkey" PRIMARY KEY ("id_fornecedor_organizacao")
);

CREATE UNIQUE INDEX "fornecedor_organizacao_forn_org_tipo_unq" ON "fornecedor_organizacao"("id_fornecedor", "id_organizacao", "tipo_fornecedor_organizacao");
CREATE INDEX "fornecedor_organizacao_org_idx" ON "fornecedor_organizacao"("id_organizacao");
CREATE INDEX "fornecedor_organizacao_org_forn_idx" ON "fornecedor_organizacao"("id_organizacao", "id_fornecedor");
CREATE INDEX "fornecedor_organizacao_org_usr_idx" ON "fornecedor_organizacao"("id_organizacao", "id_usuario");
CREATE INDEX "fornecedor_organizacao_forn_idx" ON "fornecedor_organizacao"("id_fornecedor");

ALTER TABLE "fornecedor_organizacao" ADD CONSTRAINT "fornecedor_organizacao_id_fornecedor_fkey" FOREIGN KEY ("id_fornecedor") REFERENCES "empresa"("suid_empresa") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Registrar migration no Prisma (evita reaplicar no próximo migrate deploy)
INSERT INTO "_prisma_migrations" (
  id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count
)
SELECT
  gen_random_uuid()::text,
  'manual-railway-ui',
  NOW(),
  '20260524120000_add_fornecedor_organizacao',
  NULL,
  NULL,
  NOW(),
  1
WHERE NOT EXISTS (
  SELECT 1 FROM "_prisma_migrations"
  WHERE migration_name = '20260524120000_add_fornecedor_organizacao'
);
