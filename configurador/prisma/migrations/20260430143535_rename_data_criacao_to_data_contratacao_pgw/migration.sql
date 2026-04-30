-- Migration: rename_data_criacao_to_data_contratacao_pgw
-- Renomeia data_criacao_produto_gravity_workspace → data_contratacao_produto_gravity_workspace
-- Decisão de domínio: a criação desta linha É o evento de contratação do produto
-- no workspace, então o nome semântico de negócio prevalece sobre o padrão técnico.
-- Default @default(now()) preservado: auto-preenche com data de ativação,
-- pode ser sobrescrito explicitamente em casos de backdate/migração.

ALTER TABLE "produto_gravity_workspace"
  RENAME COLUMN "data_criacao_produto_gravity_workspace"
  TO "data_contratacao_produto_gravity_workspace";
