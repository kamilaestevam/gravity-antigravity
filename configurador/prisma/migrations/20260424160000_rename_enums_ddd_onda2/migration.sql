-- FASE 06 DDD / Onda 2 — rename de enum types (Configurador)
-- Fonte: planilha_geral_gravity (18), aba "4. mapa-enums", coluna C (Nome Enum DDD)
-- Estratégia: ALTER TYPE ... RENAME TO — zero alteração de VALUES (EN UPPER_SNAKE preservados)
--   Valor-PostgreSQL e Valor-Prisma da planilha são idênticos em todas as 52 linhas.
-- Justificativa DDD override: nomenclaturas novas seguem PascalCase PT-BR (coluna C da planilha)
-- mesmo quando conflitam com "padrão" EN anterior — autorização explícita do dono (22/04/2026).

ALTER TYPE "StatusOrganizacao"   RENAME TO "OrganizacaoStatus";
ALTER TYPE "StatusAssinatura"    RENAME TO "StatusAssinaturaProdutoGravity";
ALTER TYPE "TipoUsuario"         RENAME TO "UsuarioTipo";
ALTER TYPE "StatusEmpresa"       RENAME TO "EmpresaStatus";
ALTER TYPE "TipoMembroEmpresa"   RENAME TO "TipoUsuarioEmpresa";
ALTER TYPE "EscopoTokenServico"  RENAME TO "APITokenServico";
ALTER TYPE "StatusProduto"       RENAME TO "StatusProdutoGravity";
ALTER TYPE "TipoCobranca"        RENAME TO "TipoCobrancaGravity";
ALTER TYPE "TipoLimiteUsuario"   RENAME TO "ProdutoGravityLimiteUsuario";
ALTER TYPE "AmbienteDeploy"      RENAME TO "DeployAmbiente";
ALTER TYPE "StatusDeploy"        RENAME TO "DeployStatus";
ALTER TYPE "FaturaStatus"        RENAME TO "FaturaStatusGravity";
