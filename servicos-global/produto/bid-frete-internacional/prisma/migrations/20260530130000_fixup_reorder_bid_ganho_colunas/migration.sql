-- Fixup: bid e ganho não foram reordenados porque o skip checava só a 2ª coluna.
-- Idempotente: compara posição das N primeiras colunas desejadas.

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

-- bid: id_workspace logo após id_organizacao
SELECT public.bfi_reorder_table_columns(
  'bid_frete_internacional',
  ARRAY[
    'id_bid_bid_frete_internacional',
    'id_organizacao',
    'id_workspace',
    'id_produto_gravity',
    'id_usuario',
    'numero_bid_bid_frete_internacional',
    'referencia_interna_bid_bid_frete_internacional',
    'status_bid_bid_frete_internacional',
    'tipo_operacao_bid_bid_frete_internacional',
    'modais_bid_bid_frete_internacional',
    'modalidade_bid_bid_frete_internacional',
    'origens_bid_bid_frete_internacional',
    'destinos_bid_bid_frete_internacional',
    'data_criacao_bid_bid_frete_internacional',
    'data_atualizacao_bid_bid_frete_internacional'
  ]
);

-- ganho: schema legado (colunas curtas) — id_workspace após id_organizacao
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ganho_bid_frete_internacional'
      AND column_name = 'id'
  ) THEN
    PERFORM public.bfi_reorder_table_columns(
      'ganho_bid_frete_internacional',
      ARRAY[
        'id',
        'id_organizacao',
        'id_workspace',
        'id_produto_gravity',
        'id_usuario',
        'id_cotacao_bid_frete_internacional',
        'valor_target',
        'valor_aprovado',
        'valor_medio',
        'saving_vs_target',
        'saving_vs_media',
        'saving_percentual',
        'moeda',
        'data_criacao_ganho_bid_frete_internacional'
      ]
    );
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ganho_bid_frete_internacional'
      AND column_name = 'id_ganho_bid_frete_internacional'
  ) THEN
    PERFORM public.bfi_reorder_table_columns(
      'ganho_bid_frete_internacional',
      ARRAY[
        'id_ganho_bid_frete_internacional',
        'id_organizacao',
        'id_workspace',
        'id_produto_gravity',
        'id_usuario',
        'id_cotacao_bid_frete_internacional',
        'valor_meta_ganho_bid_frete_internacional',
        'valor_aprovado_ganho_bid_frete_internacional',
        'valor_medio_ganho_bid_frete_internacional',
        'ganho_vs_meta_ganho_bid_frete_internacional',
        'ganho_vs_media_ganho_bid_frete_internacional',
        'ganho_percentual_ganho_bid_frete_internacional',
        'moeda_ganho_bid_frete_internacional',
        'data_criacao_ganho_bid_frete_internacional'
      ]
    );
  END IF;
END $$;

-- Recria FK cotação → bid (dropada no reorder de bid)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'cotacao_bid_frete_internacional_id_bid_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "cotacao_bid_frete_internacional"
      ADD CONSTRAINT "cotacao_bid_frete_internacional_id_bid_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_bid_bid_frete_internacional")
      REFERENCES "bid_frete_internacional"("id_bid_bid_frete_internacional")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "bid_frete_internacional_id_organizacao_idx"
  ON "bid_frete_internacional"("id_organizacao");
CREATE INDEX IF NOT EXISTS "bid_frete_internacional_id_organizacao_id_workspace_idx"
  ON "bid_frete_internacional"("id_organizacao", "id_workspace");

DROP FUNCTION IF EXISTS public.bfi_reorder_table_columns(text, text[]);
