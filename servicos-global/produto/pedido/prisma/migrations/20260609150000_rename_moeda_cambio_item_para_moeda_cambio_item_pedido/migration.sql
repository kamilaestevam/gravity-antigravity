-- DDD: renomeia moeda_cambio_item → moeda_cambio_item_pedido (mirror de moeda_cambio_pedido no item)
-- Idempotente: renomeia se existir nome antigo; senão garante coluna com nome canônico.

DO $$
DECLARE s text;
BEGIN
  FOR s IN
    SELECT table_schema
    FROM information_schema.tables
    WHERE table_name = 'pedido_item'
  LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = s AND table_name = 'pedido_item' AND column_name = 'moeda_cambio_item'
    ) AND NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = s AND table_name = 'pedido_item' AND column_name = 'moeda_cambio_item_pedido'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I.pedido_item RENAME COLUMN moeda_cambio_item TO moeda_cambio_item_pedido',
        s
      );
    ELSIF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = s AND table_name = 'pedido_item' AND column_name = 'moeda_cambio_item_pedido'
    ) THEN
      EXECUTE format(
        'ALTER TABLE %I.pedido_item ADD COLUMN IF NOT EXISTS moeda_cambio_item_pedido TEXT',
        s
      );
    END IF;
  END LOOP;
END $$;
