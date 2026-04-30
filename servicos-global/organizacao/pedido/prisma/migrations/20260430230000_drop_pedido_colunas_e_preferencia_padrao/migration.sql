-- Migration: drop_pedido_colunas_e_preferencia_padrao
-- DROP de 2 tabelas mortas (declaradas no schema mas sem uso real em codigo TS).
-- Aplicada manualmente em transacao em 2026-04-30 (ambas com 0 rows).
--
-- Contexto:
-- - pedido_colunas: era um "catalogo de colunas disponiveis" para a lista do
--   produto Pedido. Frontend tem COLUNAS_PADRAO_VISIVEIS hardcoded em
--   Pedidos.tsx — nunca consumiu esse catalogo. Zero refs em codigo TS.
-- - preferencia_padrao_pedido: era o "default da organizacao" (override dos
--   defaults). Sem tela no Configuracoes.tsx. A unica ref no codigo era no
--   inicializacao-pedido.ts chamando model name errado (pedidoPreferenciaPadrao
--   nao existia no schema — model real era PedidoListaColunasPadrao).
--
-- Tabela preferencia_coluna_pedido (Q3) foi MANTIDA — sera tornada funcional
-- no proximo commit (entrega da rota PUT/GET + rename para naming consistente).
--
-- Tabelas duplicadas em gravity-servicos-teste.public foram tambem DROPadas.

DROP TABLE IF EXISTS "pedido_colunas" CASCADE;
DROP TABLE IF EXISTS "preferencia_padrao_pedido" CASCADE;
