-- Rebrand catálogo Admin: Smart Read → Smart Docs (slug técnico permanece smart-read)
-- Banco: configurador (tabela produto_gravity)
--
-- 1) Dry-run — conferir linhas afetadas:
SELECT
  id_produto_gravity,
  nome_produto_gravity,
  slug_produto_gravity,
  descricao_produto_gravity,
  status_produto_gravity
FROM produto_gravity
WHERE slug_produto_gravity = 'smart-read'
   OR nome_produto_gravity ILIKE '%Smart Read%'
   OR descricao_produto_gravity ILIKE '%Smart Read%';

-- 2) Aplicar (executar em transação):
BEGIN;

UPDATE produto_gravity
SET
  nome_produto_gravity = 'Smart Docs',
  descricao_produto_gravity = 'Inteligência documental para COMEX — extração, conferência, riscos e Q&A com IA',
  data_atualizacao_produto_gravity = NOW()
WHERE slug_produto_gravity = 'smart-read'
   OR nome_produto_gravity ILIKE '%Smart Read%';

-- Opcional: descrições legadas que citam "leitura inteligente" sem "Smart Read" no texto
UPDATE produto_gravity
SET
  descricao_produto_gravity = 'Inteligência documental para COMEX — extração, conferência, riscos e Q&A com IA',
  data_atualizacao_produto_gravity = NOW()
WHERE slug_produto_gravity = 'smart-read'
  AND descricao_produto_gravity ILIKE '%leitura inteligente%'
  AND descricao_produto_gravity NOT ILIKE '%Smart Docs%';

COMMIT;

-- 3) Verificação pós-update:
SELECT nome_produto_gravity, slug_produto_gravity, descricao_produto_gravity
FROM produto_gravity
WHERE slug_produto_gravity = 'smart-read';
