-- Migration: rename_permissao_admin_gravity_merge_resource_action
-- 1. Renomeia tabela permissao_admin_gravity → permissao_usuario_admin_gravity
-- 2. Mescla colunas resource + action numa única coluna permissao_usuario_admin
--    (valores tipo 'editar_tenants', 'visualizar_billing', 'gerenciar_deploy')
-- 3. Renomeia demais colunas para sufixo _permissao_usuario_admin
-- 4. admin_id (clerk_user_id) renomeado para id_clerk_usuario (consistente com decisões anteriores)
-- Aplicada manualmente em transação em 2026-04-30 (tabela vazia).

-- 1. RENAME TABLE
ALTER TABLE "permissao_admin_gravity" RENAME TO "permissao_usuario_admin_gravity";

-- 2. DROP COLUMNs antigas (índices dependentes caem junto automaticamente)
ALTER TABLE "permissao_usuario_admin_gravity" DROP COLUMN "resource";
ALTER TABLE "permissao_usuario_admin_gravity" DROP COLUMN "action";

-- 3. ADD nova coluna permissao_usuario_admin
ALTER TABLE "permissao_usuario_admin_gravity" ADD COLUMN "permissao_usuario_admin" TEXT NOT NULL;

-- 4. RENAME COLUMNs
ALTER TABLE "permissao_usuario_admin_gravity" RENAME COLUMN "id"          TO "id_permissao_usuario_admin";
ALTER TABLE "permissao_usuario_admin_gravity" RENAME COLUMN "admin_id"    TO "id_clerk_usuario";
ALTER TABLE "permissao_usuario_admin_gravity" RENAME COLUMN "granted_by"  TO "concedido_por_permissao_usuario_admin";
ALTER TABLE "permissao_usuario_admin_gravity" RENAME COLUMN "created_at"  TO "data_criacao_permissao_usuario_admin";
ALTER TABLE "permissao_usuario_admin_gravity" RENAME COLUMN "updated_at"  TO "data_atualizacao_permissao_usuario_admin";

-- 5. RENAME PK + admin_id_idx
ALTER INDEX "permissao_admin_gravity_pkey"           RENAME TO "permissao_usuario_admin_gravity_pkey";
ALTER INDEX "permissao_admin_gravity_admin_id_idx"   RENAME TO "permissao_usuario_admin_gravity_admin_idx";

-- 6. CREATE novo unique sobre (admin, permissao)
CREATE UNIQUE INDEX "permissao_usuario_admin_gravity_admin_permissao_unq"
  ON "permissao_usuario_admin_gravity" ("id_clerk_usuario", "permissao_usuario_admin");
