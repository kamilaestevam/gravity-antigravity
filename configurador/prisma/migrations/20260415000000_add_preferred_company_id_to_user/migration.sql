-- Migration: add_preferred_company_id_to_user
-- Feature: Workspace Preferido (skip pós-login)
--
-- Adiciona coluna preferred_company_id em User com FK para Company e
-- ON DELETE SET NULL. Permite ao usuário marcar 1 company como preferida
-- para pular a tela SelecionarWorkspace no login seguinte.
--
-- Regras de negócio:
--   - Master e Standard podem usar este campo (role != SUPPLIER).
--   - Supplier (fornecedor cross-tenant) sempre vê a tela de seleção
--     (enforced no backend, não no schema).
--   - Se a company for deletada, o campo vira NULL automaticamente
--     (sem erro, usuário cai na tela de seleção no próximo login).
--
-- Migration non-breaking: coluna nullable, pode rodar em produção sem downtime.

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "preferred_company_id" TEXT;

ALTER TABLE "User"
  ADD CONSTRAINT "User_preferred_company_id_fkey"
  FOREIGN KEY ("preferred_company_id")
  REFERENCES "Company"("id")
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- Índice para suportar o ON DELETE SET NULL eficientemente
-- (quando uma Company é deletada, Postgres busca todos os Users que a referenciam)
CREATE INDEX IF NOT EXISTS "User_preferred_company_id_idx"
  ON "User" ("preferred_company_id");
