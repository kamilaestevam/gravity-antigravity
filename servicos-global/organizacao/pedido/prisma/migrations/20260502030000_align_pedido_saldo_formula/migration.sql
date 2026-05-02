-- Migration: align_pedido_saldo_formula
-- 1 RENAME COLUMN + 1 RENAME INDEX em pedido_saldo_formula.
-- Aplicada manualmente em transacao em 2026-05-02 (tabela vazia, 0 rows).
--
-- Contexto:
-- pedido_saldo_formula ja estava 95% DDD-aligned, faltava apenas a coluna
-- id_produto (sem sufixo "_gravity") que destoava da convencao usada nas
-- outras tabelas poliformes (dashboard_modelo_global, aprendizado_importacao_dados,
-- pedido_casas_decimais, etc. — todas usam id_produto_gravity).
--
-- Bug runtime corrigido (mesmo padrao do dashboard widgets):
-- - 4 refs em codigo TS chamavam db.pedidoSaldoFormulaConfig (model inexistente).
--   O model real e' PedidoSaldoFormula. Corrigido em:
--   - server/src/routes/saldo-formula-pedido.ts (3 refs)
--   - processos-core/src/routes/pedidos.ts (1 ref)
-- - Bonus: 2 refs adicionais a db.pedidoCasasDecimaisConfig encontradas e
--   corrigidas no caminho (era o mesmo bug, ja tinhamos corrigido na rota
--   casas-decimais-pedido mas faltavam refs em outros arquivos):
--   - processos-core/src/routes/pedidos.ts:1759
--   - pedido/server/src/services/smartImportService.ts:124
--
-- Tabela duplicata em gravity-servicos-teste.public foi DROPada.

ALTER TABLE "pedido_saldo_formula" RENAME COLUMN "id_produto" TO "id_produto_gravity";
ALTER INDEX "pedido_saldo_formula_id_organizacao_id_produto_idx" RENAME TO "pedido_saldo_formula_id_organizacao_id_produto_gravity_idx";
