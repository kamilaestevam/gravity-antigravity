-- FASE 06 DDD / Onda 2A — rename de VALUES de enum (Configurador)
-- Fonte: planilha_geral_gravity (20), aba "4. mapa-enums"
-- Estratégia: ALTER TYPE ... RENAME VALUE — preserva dados existentes (não precisa de backfill).
-- Escopo: 10 enums, 40 pares (EN → PT-BR).
-- Pré-requisito: types já renomeados na migration 20260424160000_rename_enums_ddd_onda2.

-- 1) OrganizacaoStatus (4 valores)
ALTER TYPE "OrganizacaoStatus" RENAME VALUE 'ACTIVE'         TO 'ATIVO';
ALTER TYPE "OrganizacaoStatus" RENAME VALUE 'SUSPENDED'      TO 'SUSPENSO';
ALTER TYPE "OrganizacaoStatus" RENAME VALUE 'CANCELLED'      TO 'CANCELADO';
ALTER TYPE "OrganizacaoStatus" RENAME VALUE 'PENDING_SETUP'  TO 'CONFIGURACAO_PENDENTE';

-- 2) StatusAssinaturaProdutoGravity (5 valores)
ALTER TYPE "StatusAssinaturaProdutoGravity" RENAME VALUE 'ACTIVE'      TO 'ATIVA';
ALTER TYPE "StatusAssinaturaProdutoGravity" RENAME VALUE 'PAST_DUE'    TO 'VENCIDA';
ALTER TYPE "StatusAssinaturaProdutoGravity" RENAME VALUE 'CANCELLED'   TO 'CANCELADA';
ALTER TYPE "StatusAssinaturaProdutoGravity" RENAME VALUE 'TRIALING'    TO 'EM_TESTE';
ALTER TYPE "StatusAssinaturaProdutoGravity" RENAME VALUE 'INCOMPLETE'  TO 'INCOMPLETA';

-- 3) UsuarioTipo (5 valores — SUPER_ADMIN, ADMIN, MASTER preservados)
ALTER TYPE "UsuarioTipo" RENAME VALUE 'STANDARD' TO 'PADRAO';
ALTER TYPE "UsuarioTipo" RENAME VALUE 'SUPPLIER' TO 'FORNECEDOR';

-- 4) EmpresaStatus (2 valores)
ALTER TYPE "EmpresaStatus" RENAME VALUE 'ACTIVE'   TO 'ATIVO';
ALTER TYPE "EmpresaStatus" RENAME VALUE 'INACTIVE' TO 'INATIVO';

-- 5) TipoUsuarioEmpresa (3 valores — MASTER preservado)
ALTER TYPE "TipoUsuarioEmpresa" RENAME VALUE 'STANDARD' TO 'PADRAO';
ALTER TYPE "TipoUsuarioEmpresa" RENAME VALUE 'SUPPLIER' TO 'FORNECEDOR';

-- 6) APITokenServico (3 valores — WEBHOOK, CRON preservados)
ALTER TYPE "APITokenServico" RENAME VALUE 'SERVICE' TO 'SERVICO';

-- 7) StatusProdutoGravity (5 valores)
ALTER TYPE "StatusProdutoGravity" RENAME VALUE 'ACTIVE'       TO 'ATIVO';
ALTER TYPE "StatusProdutoGravity" RENAME VALUE 'SUSPENDED'    TO 'SUSPENSO';
ALTER TYPE "StatusProdutoGravity" RENAME VALUE 'COMING_SOON'  TO 'EM_BREVE';
ALTER TYPE "StatusProdutoGravity" RENAME VALUE 'LEGACY'       TO 'LEGADO';
ALTER TYPE "StatusProdutoGravity" RENAME VALUE 'INACTIVE'     TO 'INATIVO';

-- 8) TipoCobrancaGravity (9 valores)
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'MONTHLY'      TO 'MENSAL';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_PROCESS'  TO 'POR_PROCESSO';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_DOCUMENT' TO 'POR_DOCUMENTO';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_ESTIMATE' TO 'POR_ESTIMATIVA';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_DI_DUIMP' TO 'POR_DI_DUIMP';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_DUE'      TO 'POR_DUE';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_PRODUCT'  TO 'POR_PRODUTO';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_FLOW'     TO 'POR_FLUXO';
ALTER TYPE "TipoCobrancaGravity" RENAME VALUE 'PER_LPCO'     TO 'POR_LPCO';

-- 9) ProdutoGravityLimiteUsuario (2 valores)
ALTER TYPE "ProdutoGravityLimiteUsuario" RENAME VALUE 'UNLIMITED' TO 'ILIMITADO';
ALTER TYPE "ProdutoGravityLimiteUsuario" RENAME VALUE 'LIMITED'   TO 'LIMITADO';

-- 10) DeployAmbiente (4 valores)
ALTER TYPE "DeployAmbiente" RENAME VALUE 'DEVELOPMENT' TO 'DESENVOLVIMENTO';
ALTER TYPE "DeployAmbiente" RENAME VALUE 'STAGING'     TO 'HOMOLOGACAO';
ALTER TYPE "DeployAmbiente" RENAME VALUE 'PRODUCTION'  TO 'PRODUCAO';
ALTER TYPE "DeployAmbiente" RENAME VALUE 'ALL'         TO 'TODOS';

-- 11) DeployStatus (4 valores)
ALTER TYPE "DeployStatus" RENAME VALUE 'SUCCESS'     TO 'SUCESSO';
ALTER TYPE "DeployStatus" RENAME VALUE 'FAILED'      TO 'FALHOU';
ALTER TYPE "DeployStatus" RENAME VALUE 'ROLLBACK'    TO 'REVERTIDO';
ALTER TYPE "DeployStatus" RENAME VALUE 'IN_PROGRESS' TO 'EM_ANDAMENTO';
