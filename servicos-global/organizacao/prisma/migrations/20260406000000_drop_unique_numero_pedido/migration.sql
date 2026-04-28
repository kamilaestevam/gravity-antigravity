-- Remover unique constraint de numero_pedido na tabela pedidos_comerciais
-- Regra de negócio: múltiplos pedidos podem ter o mesmo numero_pedido por tenant
-- (ex: pedidos replicados, duplicados, importados do ERP com mesmo número)

DO $$
BEGIN
  -- Tenta dropar pelo nome gerado pelo Prisma
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'pedidos_comerciais_tenant_id_numero_pedido_key'
      AND conrelid = 'pedidos_comerciais'::regclass
  ) THEN
    ALTER TABLE "pedidos_comerciais" DROP CONSTRAINT "pedidos_comerciais_tenant_id_numero_pedido_key";
  END IF;

  -- Fallback: dropar qualquer unique constraint sobre (tenant_id, numero_pedido)
  -- caso o nome seja diferente (adicionada manualmente fora do Prisma)
  DECLARE
    r RECORD;
  BEGIN
    FOR r IN
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_attribute a1 ON a1.attrelid = c.conrelid AND a1.attnum = ANY(c.conkey) AND a1.attname = 'tenant_id'
      JOIN pg_attribute a2 ON a2.attrelid = c.conrelid AND a2.attnum = ANY(c.conkey) AND a2.attname = 'numero_pedido'
      WHERE t.relname = 'pedidos_comerciais'
        AND c.contype = 'u'
    LOOP
      EXECUTE 'ALTER TABLE pedidos_comerciais DROP CONSTRAINT ' || quote_ident(r.conname);
    END LOOP;
  END;
END $$;
