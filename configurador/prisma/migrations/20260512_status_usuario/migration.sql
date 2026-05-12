-- Migration: status_usuario
-- Adiciona enum + coluna status_usuario na tabela `usuario` para suportar
-- desativação real (persistida) pelo admin/master.
--
-- Decisão arquitetural 2026-05-12 (Coordenador + Líder Técnico aprovaram):
--   • Valores persistidos: ATIVO | INATIVO. CONVIDADO continua derivado
--     em runtime no backend a partir de id_clerk_usuario LIKE 'pending_%'
--     (decisão deliberada pra não duplicar fonte da verdade do Clerk).
--   • SUSPENSO ficou fora do enum (YAGNI — sem job/billing/rate-limit que use).
--   • Default ATIVO — todo usuário existente é considerado ativo no backfill.
--   • Bloqueio de login feito pelo middleware requireAuth (Mand. 01 — Clerk
--     fora; usamos lookup interno do Usuario.status_usuario).
--   • PATCH /api/v1/usuarios/:id/status muda valor. Não pode auto-desativar
--     e não pode INATIVAR último MASTER ativo da organização.
--
-- IDEMPOTENTE — usa IF NOT EXISTS / DO blocks para tolerar reaplicação.

-- 1. CreateEnum "StatusUsuario" (idempotente)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StatusUsuario') THEN
    CREATE TYPE "StatusUsuario" AS ENUM ('ATIVO', 'INATIVO');
  END IF;
END$$;

-- 2. AddColumn status_usuario (idempotente, default ATIVO faz o backfill)
ALTER TABLE "usuario"
  ADD COLUMN IF NOT EXISTS "status_usuario" "StatusUsuario" NOT NULL DEFAULT 'ATIVO';

-- 3. CreateIndex composto (id_organizacao, status_usuario) — filtro frequente
--    na tela admin/configurador "listar usuários ativos da org X".
CREATE INDEX IF NOT EXISTS "usuario_id_organizacao_status_usuario_idx"
  ON "usuario" ("id_organizacao", "status_usuario");
