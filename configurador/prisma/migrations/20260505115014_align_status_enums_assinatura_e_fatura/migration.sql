-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: align status enums (assinatura + fatura)
--
-- Decisões consolidadas (sessão 2026-05-04):
--
-- 1. StatusAssinaturaProdutoGravity (5 → 4 valores)
--    Antes:  ATIVA, VENCIDA, CANCELADA, EM_TESTE, INCOMPLETA
--    Depois: ATIVA, EM_TESTE, SUSPENSA, CANCELADA
--    Map:    VENCIDA → ATIVA, INCOMPLETA → ATIVA, +SUSPENSA
--    Default: EM_TESTE → ATIVA (onboarding cria ATIVA direto)
--
-- 2. StatusFaturaProdutoGravity (6 → 7 valores, vocabulário PT-BR)
--    Antes:  DRAFT, OPEN, PAID, VOID, OVERDUE, UNCOLLECTIBLE
--    Depois: RASCUNHO, EMITIDA, ENVIADA, PAGA, EM_ATRASO, ANULADA, INCOBRAVEL
--    Map:    DRAFT → RASCUNHO, OPEN → EMITIDA, PAID → PAGA,
--            VOID → ANULADA, OVERDUE → EM_ATRASO, UNCOLLECTIBLE → INCOBRAVEL
--    Default: DRAFT → RASCUNHO
--
-- 3. StatusProdutoGravity: SEM MUDANÇA
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. StatusAssinaturaProdutoGravity ──────────────────────────────────────

-- 1.1 Cria novo tipo com os 4 valores definitivos
CREATE TYPE "StatusAssinaturaProdutoGravity_new" AS ENUM (
  'ATIVA',
  'EM_TESTE',
  'SUSPENSA',
  'CANCELADA'
);

-- 1.2 Remove default temporariamente
ALTER TABLE "assinatura_produto_gravity"
  ALTER COLUMN "status_assinatura_produto_gravity" DROP DEFAULT;

-- 1.3 Migra coluna para o novo tipo, convertendo valores legados
ALTER TABLE "assinatura_produto_gravity"
  ALTER COLUMN "status_assinatura_produto_gravity" TYPE "StatusAssinaturaProdutoGravity_new"
  USING (
    CASE
      WHEN "status_assinatura_produto_gravity"::text IN ('VENCIDA', 'INCOMPLETA') THEN 'ATIVA'
      ELSE "status_assinatura_produto_gravity"::text
    END
  )::"StatusAssinaturaProdutoGravity_new";

-- 1.4 Drop tipo antigo, renomeia novo para o nome canônico
DROP TYPE "StatusAssinaturaProdutoGravity";
ALTER TYPE "StatusAssinaturaProdutoGravity_new" RENAME TO "StatusAssinaturaProdutoGravity";

-- 1.5 Restaura default (agora ATIVA)
ALTER TABLE "assinatura_produto_gravity"
  ALTER COLUMN "status_assinatura_produto_gravity" SET DEFAULT 'ATIVA';


-- ── 2. StatusFaturaProdutoGravity ──────────────────────────────────────────

-- 2.1 Cria novo tipo com os 7 valores em PT-BR
CREATE TYPE "StatusFaturaProdutoGravity_new" AS ENUM (
  'RASCUNHO',
  'EMITIDA',
  'ENVIADA',
  'PAGA',
  'EM_ATRASO',
  'ANULADA',
  'INCOBRAVEL'
);

-- 2.2 Remove default temporariamente
ALTER TABLE "fatura_produto_gravity"
  ALTER COLUMN "status_fatura_produto_gravity" DROP DEFAULT;

-- 2.3 Migra coluna para o novo tipo, convertendo valores legados em inglês → PT-BR
ALTER TABLE "fatura_produto_gravity"
  ALTER COLUMN "status_fatura_produto_gravity" TYPE "StatusFaturaProdutoGravity_new"
  USING (
    CASE "status_fatura_produto_gravity"::text
      WHEN 'DRAFT'         THEN 'RASCUNHO'
      WHEN 'OPEN'          THEN 'EMITIDA'
      WHEN 'PAID'          THEN 'PAGA'
      WHEN 'VOID'          THEN 'ANULADA'
      WHEN 'OVERDUE'       THEN 'EM_ATRASO'
      WHEN 'UNCOLLECTIBLE' THEN 'INCOBRAVEL'
    END
  )::"StatusFaturaProdutoGravity_new";

-- 2.4 Drop tipo antigo, renomeia novo
DROP TYPE "StatusFaturaProdutoGravity";
ALTER TYPE "StatusFaturaProdutoGravity_new" RENAME TO "StatusFaturaProdutoGravity";

-- 2.5 Restaura default (agora RASCUNHO)
ALTER TABLE "fatura_produto_gravity"
  ALTER COLUMN "status_fatura_produto_gravity" SET DEFAULT 'RASCUNHO';
