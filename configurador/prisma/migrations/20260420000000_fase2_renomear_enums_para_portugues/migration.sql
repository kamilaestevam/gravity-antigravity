-- Fase 2 — Renomear tipos de enum para português
-- APENAS ALTER TYPE ... RENAME TO — zero alteração de dados ou valores
-- Os VALUES dos enums (SUPER_ADMIN, ACTIVE, MASTER, etc.) são INTOCÁVEIS

ALTER TYPE "TenantStatus"       RENAME TO "StatusOrganizacao";
ALTER TYPE "SubscriptionStatus" RENAME TO "StatusAssinatura";
ALTER TYPE "UserRole"           RENAME TO "TipoUsuario";
ALTER TYPE "CompanyStatus"      RENAME TO "StatusEmpresa";
ALTER TYPE "UserMembershipRole" RENAME TO "TipoMembroEmpresa";
ALTER TYPE "ServiceTokenScope"  RENAME TO "EscopoTokenServico";
ALTER TYPE "ProductStatus"      RENAME TO "StatusProduto";
ALTER TYPE "BillingType"        RENAME TO "TipoCobranca";
ALTER TYPE "UserLimitType"      RENAME TO "TipoLimiteUsuario";
ALTER TYPE "DeployEnvironment"  RENAME TO "AmbienteDeploy";
ALTER TYPE "DeployStatus"       RENAME TO "StatusDeploy";
