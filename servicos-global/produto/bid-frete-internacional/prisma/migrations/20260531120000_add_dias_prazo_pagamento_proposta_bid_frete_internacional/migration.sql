-- Prazo de pagamento (dias) na proposta — entre free time e validade (Railway UI).
-- Idempotente: ADD IF NOT EXISTS; reorder via bfi_reorder_table_columns.

ALTER TABLE "proposta_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "dias_prazo_pagamento_proposta_bid_frete_internacional" INTEGER;

CREATE OR REPLACE FUNCTION public.bfi_reorder_table_columns(
  p_table_name text,
  p_column_order text[]
) RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_tmp text := p_table_name || '__bfi_reord';
  v_col text;
  v_create_parts text[] := ARRAY[]::text[];
  v_select_parts text[] := ARRAY[]::text[];
  v_coltype text;
  v_not_null boolean;
  v_default text;
  v_pk_cols text[];
  v_rec record;
  v_i integer;
  v_pos integer;
  v_needs_reorder boolean := false;
BEGIN
  IF to_regclass(format('public.%I', p_table_name)) IS NULL THEN
    RETURN;
  END IF;

  FOR v_i IN 1..array_length(p_column_order, 1) LOOP
    SELECT c.ordinal_position
    INTO v_pos
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table_name
      AND c.column_name = p_column_order[v_i];

    IF v_pos IS NULL OR v_pos <> v_i THEN
      v_needs_reorder := true;
      EXIT;
    END IF;
  END LOOP;

  IF NOT v_needs_reorder THEN
    RETURN;
  END IF;

  FOR v_rec IN
    SELECT
      n.nspname AS schema_name,
      rel.relname AS table_name,
      c.conname AS constraint_name
    FROM pg_constraint c
    JOIN pg_class rel ON rel.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = rel.relnamespace
    WHERE c.contype = 'f'
      AND (
        (n.nspname = 'public' AND rel.relname = p_table_name)
        OR c.confrelid = format('public.%I', p_table_name)::regclass
      )
  LOOP
    EXECUTE format(
      'ALTER TABLE %I.%I DROP CONSTRAINT %I',
      v_rec.schema_name,
      v_rec.table_name,
      v_rec.constraint_name
    );
  END LOOP;

  FOR v_i IN 1..array_length(p_column_order, 1) LOOP
    v_col := p_column_order[v_i];

    SELECT
      format_type(a.atttypid, a.atttypmod),
      a.attnotnull,
      pg_get_expr(d.adbin, d.adrelid)
    INTO v_coltype, v_not_null, v_default
    FROM pg_attribute a
    JOIN pg_class cl ON cl.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE n.nspname = 'public'
      AND cl.relname = p_table_name
      AND a.attname = v_col
      AND a.attnum > 0
      AND NOT a.attisdropped;

    IF v_coltype IS NULL THEN
      RAISE EXCEPTION 'Coluna % ausente em %', v_col, p_table_name;
    END IF;

    v_create_parts := array_append(
      v_create_parts,
      format(
        '%I %s%s%s',
        v_col,
        v_coltype,
        CASE WHEN v_not_null THEN ' NOT NULL' ELSE '' END,
        CASE WHEN v_default IS NOT NULL THEN format(' DEFAULT %s', v_default) ELSE '' END
      )
    );
    v_select_parts := array_append(v_select_parts, format('%I', v_col));
  END LOOP;

  FOR v_col IN
    SELECT c.column_name
    FROM information_schema.columns c
    WHERE c.table_schema = 'public'
      AND c.table_name = p_table_name
      AND NOT (c.column_name = ANY (p_column_order))
    ORDER BY c.ordinal_position
  LOOP
    SELECT
      format_type(a.atttypid, a.atttypmod),
      a.attnotnull,
      pg_get_expr(d.adbin, d.adrelid)
    INTO v_coltype, v_not_null, v_default
    FROM pg_attribute a
    JOIN pg_class cl ON cl.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE n.nspname = 'public'
      AND cl.relname = p_table_name
      AND a.attname = v_col
      AND a.attnum > 0
      AND NOT a.attisdropped;

    v_create_parts := array_append(
      v_create_parts,
      format(
        '%I %s%s%s',
        v_col,
        v_coltype,
        CASE WHEN v_not_null THEN ' NOT NULL' ELSE '' END,
        CASE WHEN v_default IS NOT NULL THEN format(' DEFAULT %s', v_default) ELSE '' END
      )
    );
    v_select_parts := array_append(v_select_parts, format('%I', v_col));
  END LOOP;

  SELECT array_agg(a.attname ORDER BY array_position(con.conkey, a.attnum))
  INTO v_pk_cols
  FROM pg_constraint con
  JOIN pg_class cl ON cl.oid = con.conrelid
  JOIN pg_namespace n ON n.oid = cl.relnamespace
  JOIN pg_attribute a ON a.attrelid = cl.oid AND a.attnum = ANY (con.conkey)
  WHERE con.contype = 'p'
    AND n.nspname = 'public'
    AND cl.relname = p_table_name;

  EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', v_tmp);
  EXECUTE format(
    'CREATE TABLE %I (%s%s)',
    v_tmp,
    array_to_string(v_create_parts, ', '),
    CASE
      WHEN v_pk_cols IS NOT NULL THEN format(', PRIMARY KEY (%s)', array_to_string(v_pk_cols, ', '))
      ELSE ''
    END
  );
  EXECUTE format(
    'INSERT INTO %I SELECT %s FROM %I',
    v_tmp,
    array_to_string(v_select_parts, ', '),
    p_table_name
  );
  EXECUTE format('DROP TABLE %I CASCADE', p_table_name);
  EXECUTE format('ALTER TABLE %I RENAME TO %I', v_tmp, p_table_name);
END;
$$;

SELECT public.bfi_reorder_table_columns(
  'proposta_bid_frete_internacional',
  ARRAY[
    'id_proposta_bid_frete_internacional',
    'id_cotacao_bid_frete_internacional',
    'id_bid_bid_frete_internacional',
    'id_organizacao',
    'id_workspace',
    'id_produto_gravity',
    'id_usuario',
    'id_disparo_cotacao_bid_frete_internacional',
    'id_fornecedor_bid_frete_internacional',
    'moeda_proposta_bid_frete_internacional',
    'valor_frete_proposta_bid_frete_internacional',
    'taxas_origem_proposta_bid_frete_internacional',
    'taxas_destino_proposta_bid_frete_internacional',
    'valor_total_proposta_bid_frete_internacional',
    'dias_transito_proposta_bid_frete_internacional',
    'dias_free_time_proposta_bid_frete_internacional',
    'dias_prazo_pagamento_proposta_bid_frete_internacional',
    'validade_proposta_bid_frete_internacional',
    'transbordos_proposta_bid_frete_internacional',
    'escalas_proposta_bid_frete_internacional',
    'observacoes_proposta_bid_frete_internacional',
    'status_proposta_bid_frete_internacional',
    'classificacao_valor_proposta_bid_frete_internacional',
    'classificacao_transito_proposta_bid_frete_internacional',
    'classificacao_avaliacao_proposta_bid_frete_internacional',
    'via_tabela_proposta_bid_frete_internacional',
    'via_api_proposta_bid_frete_internacional',
    'via_portal_proposta_bid_frete_internacional',
    'via_email_proposta_bid_frete_internacional',
    'data_criacao_proposta_bid_frete_internacional',
    'data_atualizacao_proposta_bid_frete_internacional'
  ]
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposta_bid_frete_internacional_id_bid_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "proposta_bid_frete_internacional"
      ADD CONSTRAINT "proposta_bid_frete_internacional_id_bid_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_bid_bid_frete_internacional")
      REFERENCES "bid_frete_internacional"("id_bid_bid_frete_internacional")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposta_bid_frete_internacional_id_cotacao_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "proposta_bid_frete_internacional"
      ADD CONSTRAINT "proposta_bid_frete_internacional_id_cotacao_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_cotacao_bid_frete_internacional")
      REFERENCES "cotacao_bid_frete_internacional"("id_cotacao_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposta_bid_frete_internacional_id_disparo_cotacao_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "proposta_bid_frete_internacional"
      ADD CONSTRAINT "proposta_bid_frete_internacional_id_disparo_cotacao_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_disparo_cotacao_bid_frete_internacional")
      REFERENCES "disparo_cotacao_bid_frete_internacional"("id_disparo_cotacao_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'proposta_bid_frete_internacional_id_fornecedor_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "proposta_bid_frete_internacional"
      ADD CONSTRAINT "proposta_bid_frete_internacional_id_fornecedor_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_fornecedor_bid_frete_internacional")
      REFERENCES "fornecedor_bid_frete_internacional"("id_fornecedor_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_disparo_cotacao_bid_frete_internacional_key"
  ON "proposta_bid_frete_internacional"("id_disparo_cotacao_bid_frete_internacional");

CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_produto_gravity_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_produto_gravity");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_usuario_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_workspace_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_workspace");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_cotacao_bid_frete_internacional_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_cotacao_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_bid_bid_frete_internacional_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_bid_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_id_fornecedor_bid_frete_internacional_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "id_fornecedor_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "proposta_bid_frete_internacional_id_organizacao_valor_total_proposta_bid_frete_internacional_idx"
  ON "proposta_bid_frete_internacional"("id_organizacao", "valor_total_proposta_bid_frete_internacional");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'taxa_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "taxa_bid_frete_internacional"
      ADD CONSTRAINT "taxa_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_proposta_bid_frete_internacional")
      REFERENCES "proposta_bid_frete_internacional"("id_proposta_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'taxa_origem_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "taxa_origem_bid_frete_internacional"
      ADD CONSTRAINT "taxa_origem_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_proposta_bid_frete_internacional")
      REFERENCES "proposta_bid_frete_internacional"("id_proposta_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'taxa_destino_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "taxa_destino_bid_frete_internacional"
      ADD CONSTRAINT "taxa_destino_bid_frete_internacional_id_proposta_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_proposta_bid_frete_internacional")
      REFERENCES "proposta_bid_frete_internacional"("id_proposta_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.bfi_reorder_table_columns(text, text[]);
