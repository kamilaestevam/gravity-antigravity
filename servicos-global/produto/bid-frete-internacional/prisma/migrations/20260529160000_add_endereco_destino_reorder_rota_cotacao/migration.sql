-- endereco_destino_cotacao_bid_frete_internacional + reorder bloco rota (origem completo → destino completo)
-- Idempotente: ADD IF NOT EXISTS; reorder via bfi_reorder_table_columns (fixup 20260530130000).

ALTER TABLE "cotacao_bid_frete_internacional"
  ADD COLUMN IF NOT EXISTS "endereco_destino_cotacao_bid_frete_internacional" TEXT;

SELECT public.bfi_reorder_table_columns(
  'cotacao_bid_frete_internacional',
  ARRAY[
    'id_cotacao_bid_frete_internacional',
    'id_bid_bid_frete_internacional',
    'id_organizacao',
    'id_workspace',
    'id_produto_gravity',
    'id_usuario',
    'numero_cotacao_bid_frete_internacional',
    'referencia_interna_cotacao_bid_frete_internacional',
    'tipo_operacao_cotacao_bid_frete_internacional',
    'modal_cotacao_bid_frete_internacional',
    'modalidade_cotacao_bid_frete_internacional',
    'origem_codigo_cotacao_bid_frete_internacional',
    'origem_nome_cotacao_bid_frete_internacional',
    'origem_pais_cotacao_bid_frete_internacional',
    'endereco_origem_cotacao_bid_frete_internacional',
    'destino_codigo_cotacao_bid_frete_internacional',
    'destino_nome_cotacao_bid_frete_internacional',
    'destino_pais_cotacao_bid_frete_internacional',
    'endereco_destino_cotacao_bid_frete_internacional',
    'descricao_mercadoria_cotacao_bid_frete_internacional',
    'ncm_cotacao_bid_frete_internacional',
    'quantidade_cotacao_bid_frete_internacional',
    'tipo_container_cotacao_bid_frete_internacional',
    'peso_kg_cotacao_bid_frete_internacional',
    'cubagem_m3_cotacao_bid_frete_internacional',
    'incoterm_cotacao_bid_frete_internacional',
    'zipcode_origem_cotacao_bid_frete_internacional',
    'zipcode_destino_cotacao_bid_frete_internacional',
    'valor_meta_cotacao_bid_frete_internacional',
    'moeda_meta_cotacao_bid_frete_internacional',
    'visibilidade_cotacao_bid_frete_internacional',
    'anonima_cotacao_bid_frete_internacional',
    'status_cotacao_bid_frete_internacional',
    'data_limite_resposta_cotacao_bid_frete_internacional',
    'data_aprovacao_cotacao_bid_frete_internacional',
    'data_cancelamento_cotacao_bid_frete_internacional',
    'motivo_reprovacao_cotacao_bid_frete_internacional',
    'motivo_cancelamento_cotacao_bid_frete_internacional',
    'id_fornecedor_vencedor_cotacao_bid_frete_internacional',
    'ganho_valor_cotacao_bid_frete_internacional',
    'ganho_percentual_cotacao_bid_frete_internacional',
    'data_criacao_cotacao_bid_frete_internacional',
    'data_atualizacao_cotacao_bid_frete_internacional'
  ]
);

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

CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_id_produto_gravity_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "id_produto_gravity");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_id_usuario_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "id_usuario");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_status_cotacao_bid_frete_internacional_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "status_cotacao_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_id_workspace_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "id_workspace");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_id_bid_bid_frete_internacional_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "id_bid_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_id_organizacao_data_criacao_cotacao_bid_frete_internacional_idx"
  ON "cotacao_bid_frete_internacional"("id_organizacao", "data_criacao_cotacao_bid_frete_internacional");
CREATE INDEX IF NOT EXISTS "cotacao_bid_frete_internacional_numero_cotacao_bid_frete_internacional_idx"
  ON "cotacao_bid_frete_internacional"("numero_cotacao_bid_frete_internacional");

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'disparo_cotacao_bid_frete_internacional_id_cotacao_bid_frete_internacional_fkey'
  ) THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional"
      ADD CONSTRAINT "disparo_cotacao_bid_frete_internacional_id_cotacao_bid_frete_internacional_fkey"
      FOREIGN KEY ("id_cotacao_bid_frete_internacional")
      REFERENCES "cotacao_bid_frete_internacional"("id_cotacao_bid_frete_internacional")
      ON DELETE CASCADE ON UPDATE CASCADE;
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
