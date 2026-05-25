-- Permite múltiplos pedidos com o mesmo numero_pedido na organização.
-- A decisão do usuário (criar duplicado) é tratada na aplicação via modal de confirmação.
DROP INDEX IF EXISTS "pedido_id_organizacao_numero_pedido_key";

CREATE INDEX IF NOT EXISTS "pedido_id_organizacao_numero_pedido_idx"
  ON "pedido"("id_organizacao", "numero_pedido");
