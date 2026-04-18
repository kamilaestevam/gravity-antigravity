-- Renomear campos do PedidoItem (pedido_itens) — idempotente
-- Colunas já criadas com nomes corretos na migration inicial são ignoradas.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'quantidade_inicial') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_inicial" TO "quantidade_inicial_pedido";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'quantidade_atual') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_atual" TO "quantidade_atual_pedido";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'quantidade_pronta') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_pronta" TO "quantidade_pronta_pedido";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'quantidade_transferida') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_transferida" TO "quantidade_transferida_pedido";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'quantidade_cancelada') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "quantidade_cancelada" TO "quantidade_cancelada_pedido";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'casas_decimais_quantidade') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "casas_decimais_quantidade" TO "casas_decimais_quantidade_item";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'descricao') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "descricao" TO "descricao_item";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'valor_unitario') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "valor_unitario" TO "valor_por_unidade_item";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedido_itens' AND column_name = 'valor_item') THEN
    ALTER TABLE "pedido_itens" RENAME COLUMN "valor_item" TO "valor_total_item";
  END IF;
END $$;

-- Renomear campo do TransferHistorico (transfer_historico) — idempotente
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transfer_historico' AND column_name = 'quantidade') THEN
    ALTER TABLE "transfer_historico" RENAME COLUMN "quantidade" TO "quantidade_item_transferida";
  END IF;
END $$;
