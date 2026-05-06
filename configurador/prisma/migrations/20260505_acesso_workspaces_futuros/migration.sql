-- Migration: acesso_workspaces_futuros
-- Adiciona coluna Boolean + índice composto em `usuario` para feature de
-- auto-vínculo de workspaces criados após o convite.
--
-- Decisão arquitetural 2026-05-05 (Coordenador + Líder Técnico aprovaram):
--   • Quando um workspace é criado, usuários PADRAO/FORNECEDOR com flag=true
--     recebem `UsuarioWorkspace` automático (em job pós-commit).
--   • MASTER/SUPER_ADMIN/ADMIN têm bypass por Mand. 04 — flag ignorada.
--   • Default false (least privilege, Mand. 08).
--   • Backfill: nenhum — admins reabilitam manualmente via UI da F5.
--
-- IDEMPOTENTE — usa IF NOT EXISTS pois há drift entre migrations e DB
-- (banco pode já conter a coluna por aplicação manual prévia).

-- AddColumn (idempotente)
ALTER TABLE "usuario"
  ADD COLUMN IF NOT EXISTS "acesso_workspaces_futuros" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex (idempotente)
CREATE INDEX IF NOT EXISTS "usuario_id_organizacao_acesso_workspaces_futuros_idx"
  ON "usuario"("id_organizacao", "acesso_workspaces_futuros");
