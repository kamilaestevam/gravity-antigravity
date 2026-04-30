-- Migration: drop_processo_domain_legacy
-- DROP de 4 tabelas legadas do dominio Processo que residiam erroneamente no banco do Pedido.
-- Aplicada manualmente em transacao em 2026-04-30 (todas as tabelas vazias, 0 rows).
--
-- Contexto:
-- O dominio Processo (containers, faturas, logistica, processo principal) NAO pertence ao
-- servico Pedido. As 4 tabelas eram restos de uma fase anterior de desenvolvimento. Sem
-- uso no codigo TS do Pedido (zero refs em pedido/server/src ou pedido/client/src).
--
-- Em gravity-servicos-teste.public.* as duplicatas foram MANTIDAS provisoriamente como
-- parking lot ate existirem os bancos dedicados por produto (Processo, etc.).
--
-- Models removidos do fragment.prisma do Pedido:
-- - ProcessoGravity              (mapeava tabela_processos)
-- - PedidoProcessoGravity        (mapeava fatura_processo)
-- - LogisticaProcessoGravity     (mapeava logistica_processo)
-- - ContainerProcessoGravity     (mapeava container_processo)
-- - relation removida: PedidoItem.embarques_efetivos_pedido_item LogisticaProcessoGravity[]

-- DROPs (CASCADE para resolver FKs internas entre as 4 tabelas)
DROP TABLE IF EXISTS "container_processo" CASCADE;
DROP TABLE IF EXISTS "fatura_processo" CASCADE;
DROP TABLE IF EXISTS "logistica_processo" CASCADE;
DROP TABLE IF EXISTS "tabela_processos" CASCADE;
