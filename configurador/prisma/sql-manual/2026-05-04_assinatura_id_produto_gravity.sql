-- Migration: assinatura_produto_gravity ganha id_produto_gravity
--
-- Decisão de domínio (Coordenador 04/05/2026, dono aprovou Caminho 1):
-- Cada (organizacao × produto contratado) tem uma assinatura própria com
-- status comercial e datas. Hoje a tabela tinha apenas id_organizacao —
-- representava só status guarda-chuva da org, sem amarração ao produto.
-- A correção adiciona id_produto_gravity + FK + unique + indice.
--
-- Backfill: as 2 linhas pré-existentes em status EM_TESTE não estão
-- amarradas a nenhum produto (são órfãs do modelo antigo). Decisão:
-- DELETAR antes de adicionar a coluna NOT NULL. As organizações
-- continuam funcionais — quando o usuário re-assinar um produto na
-- tela /workspace/assinaturas o backend cria uma nova linha correta.
--
-- ROLLBACK: o reverso desta migration está em comentário no final do
-- arquivo. Em caso de incidente, executar o bloco ROLLBACK abaixo.

BEGIN;

-- 1. Limpar registros órfãos (sem id_produto_gravity, modelo antigo)
DELETE FROM assinatura_produto_gravity;

-- 2. Adicionar coluna NOT NULL
ALTER TABLE assinatura_produto_gravity
  ADD COLUMN id_produto_gravity TEXT NOT NULL;

-- 3. Foreign key para produto_gravity
ALTER TABLE assinatura_produto_gravity
  ADD CONSTRAINT apg_produto_fkey
  FOREIGN KEY (id_produto_gravity)
  REFERENCES produto_gravity(id_produto_gravity)
  ON DELETE RESTRICT
  ON UPDATE CASCADE;

-- 4. Unique: uma assinatura por (org, produto)
CREATE UNIQUE INDEX apg_org_produto_unq
  ON assinatura_produto_gravity (id_organizacao, id_produto_gravity);

-- 5. Indice de leitura
CREATE INDEX apg_org_produto_idx
  ON assinatura_produto_gravity (id_organizacao, id_produto_gravity);

COMMIT;

-- ─── ROLLBACK ──────────────────────────────────────────────────────────────
-- BEGIN;
-- DROP INDEX IF EXISTS apg_org_produto_idx;
-- DROP INDEX IF EXISTS apg_org_produto_unq;
-- ALTER TABLE assinatura_produto_gravity DROP CONSTRAINT IF EXISTS apg_produto_fkey;
-- ALTER TABLE assinatura_produto_gravity DROP COLUMN IF EXISTS id_produto_gravity;
-- COMMIT;
