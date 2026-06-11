-- Colunas personalizadas: alerta de divergência entre itens na linha do pedido (opt-in, default desligado).
ALTER TABLE "coluna_usuario_pedido"
  ADD COLUMN IF NOT EXISTS "alerta_divergencia_itens_coluna_usuario_pedido" BOOLEAN NOT NULL DEFAULT false;
