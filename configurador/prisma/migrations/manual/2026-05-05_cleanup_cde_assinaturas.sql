-- Cleanup pontual: zera as assinaturas e configurações da organização CDE.
--
-- Contexto (decisão dono 2026-05-05): assinaturas residuais foram criadas
-- durante testes da feature de DDD assinaturas. As linhas existentes estão
-- inconsistentes com o estado atual do catálogo (Pedido EM_TESTE com produto
-- SUSPENSO, Simula Custo CANCELADA mas oculta no front). Decisão: começar do
-- zero — após este cleanup, a CDE volta a poder contratar normalmente via
-- POST /api/v1/organizacoes/me/assinaturas/assinar-produto.
--
-- Escopo: APENAS a organização CDE (id_organizacao = 'cmoarq22a000l1358c1p2qfqt').
-- Outras organizações não são afetadas.

BEGIN;

-- Apaga assinaturas (status_comercial)
DELETE FROM assinatura_produto_gravity
 WHERE id_organizacao = 'cmoarq22a000l1358c1p2qfqt';

-- Apaga configurações (chave/JSON/ativo)
DELETE FROM configuracao_produto_gravity
 WHERE id_organizacao_configuracao_produto_gravity = 'cmoarq22a000l1358c1p2qfqt';

-- Defesa: caso existam vínculos workspace×produto da CDE, remove também.
-- (Hoje não há registros desse tipo para a CDE, mas a query é idempotente.)
DELETE FROM produto_gravity_workspace
 WHERE id_organizacao = 'cmoarq22a000l1358c1p2qfqt';

COMMIT;

-- ─── ROLLBACK: não há reversão automática ───────────────────────────────────
-- Os registros apagados eram dados de teste sem valor histórico relevante.
-- Se necessário restaurar, recriar via UI ou via POST /assinar-produto.
