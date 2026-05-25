-- P1 Dashboard Pedido — índice composto para filtros workspace + período
-- Aplicar via Coordenador após compose do fragment.prisma
-- Idempotente: IF NOT EXISTS

CREATE INDEX CONCURRENTLY IF NOT EXISTS pedido_id_organizacao_id_workspace_data_emissao_pedido_idx
  ON pedido (id_organizacao, id_workspace, data_emissao_pedido);
