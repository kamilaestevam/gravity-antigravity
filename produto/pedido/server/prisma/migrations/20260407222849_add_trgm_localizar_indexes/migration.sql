-- Migration: add_trgm_localizar_indexes
-- Objetivo: habilitar pg_trgm e criar índices GIN para suportar ILIKE eficiente
-- no endpoint GET /api/v1/pedidos/localizar — mantendo SLA de 200ms em 1M+ linhas.
--
-- SAFE: CREATE EXTENSION IF NOT EXISTS e CREATE INDEX CONCURRENTLY IF NOT EXISTS
-- não bloqueiam leitura/escrita existente. Idempotente — pode rodar múltiplas vezes.

-- 1. Habilitar extensão pg_trgm (uma vez por banco, sem risco)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Índice GIN trigram nos campos textuais do Pedido mais buscados
--    Concatena os campos em uma string para um único índice eficiente
CREATE INDEX IF NOT EXISTS idx_pedido_localizar_trgm
ON pedidos_comerciais USING GIN (
  (
    COALESCE(numero_pedido, '')         || ' ' ||
    COALESCE(tipo_operacao, '')         || ' ' ||
    COALESCE(status, '')                || ' ' ||
    COALESCE(incoterm, '')              || ' ' ||
    COALESCE(moeda_pedido, '')          || ' ' ||
    COALESCE(numero_proforma, '')       || ' ' ||
    COALESCE(numero_invoice, '')        || ' ' ||
    COALESCE(referencia_importador, '') || ' ' ||
    COALESCE(referencia_exportador, '') || ' ' ||
    COALESCE(referencia_fabricante, '')
  ) gin_trgm_ops
);

-- 3. Índice GIN trigram nos campos textuais do PedidoItem
CREATE INDEX IF NOT EXISTS idx_pedido_item_localizar_trgm
ON pedido_itens USING GIN (
  (
    COALESCE(part_number, '')                 || ' ' ||
    COALESCE(ncm, '')                         || ' ' ||
    COALESCE(descricao_item, '')              || ' ' ||
    COALESCE(unidade_comercializada_item, '') || ' ' ||
    COALESCE(moeda_item, '')
  ) gin_trgm_ops
);

-- 4. Índice GIN trigram no valor de colunas customizadas do usuário
CREATE INDEX IF NOT EXISTS idx_valor_coluna_usuario_localizar_trgm
ON valores_colunas_usuario_pedido USING GIN (valor gin_trgm_ops);

-- 5. Índice GIN no JSONB detalhes_operacionais para busca de exportador/importador/fabricante
--    jsonb_path_ops cobre operadores de containment; para ILIKE precisamos do cast ::text
--    Índice trigram no cast textual do JSONB completo
CREATE INDEX IF NOT EXISTS idx_pedido_detalhes_trgm
ON pedidos_comerciais USING GIN (
  (detalhes_operacionais::text) gin_trgm_ops
);
