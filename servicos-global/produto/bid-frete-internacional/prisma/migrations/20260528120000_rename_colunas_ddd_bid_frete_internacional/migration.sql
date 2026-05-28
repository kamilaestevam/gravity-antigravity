-- Renomeia colunas legadas (inglês/curtas) → DDD SSOT em cotacao, fornecedor, disparo e proposta.
-- Idempotente: só renomeia se a coluna antiga existir e a nova ainda não existir.

-- ─── cotacao_bid_frete_internacional ───────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'id_cotacao_bid_frete_internacional') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "id" TO "id_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'numero') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "numero" TO "numero_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'referencia_interna') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "referencia_interna" TO "referencia_interna_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'tipo_operacao') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "tipo_operacao" TO "tipo_operacao_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'modal') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "modal" TO "modal_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'modalidade') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "modalidade" TO "modalidade_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'origem_codigo') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "origem_codigo" TO "origem_codigo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'origem_nome') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "origem_nome" TO "origem_nome_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'origem_pais') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "origem_pais" TO "origem_pais_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'destino_codigo') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "destino_codigo" TO "destino_codigo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'destino_nome') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "destino_nome" TO "destino_nome_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'destino_pais') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "destino_pais" TO "destino_pais_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'descricao_mercadoria') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "descricao_mercadoria" TO "descricao_mercadoria_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'ncm') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "ncm" TO "ncm_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'quantidade') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "quantidade" TO "quantidade_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'id_container') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "id_container" TO "tipo_container_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'peso_kg') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "peso_kg" TO "peso_kg_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'cubagem_m3') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "cubagem_m3" TO "cubagem_m3_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'incoterm') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "incoterm" TO "incoterm_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'zip_code_origem') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "zip_code_origem" TO "zipcode_origem_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'zip_code_destino') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "zip_code_destino" TO "zipcode_destino_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'valor_target') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "valor_target" TO "valor_meta_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'moeda_target') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "moeda_target" TO "moeda_meta_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'visibilidade') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "visibilidade" TO "visibilidade_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'ocultar_nome_empresa') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "ocultar_nome_empresa" TO "anonima_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'status') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "status" TO "status_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'data_limite_resposta') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "data_limite_resposta" TO "data_limite_resposta_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'data_aprovacao') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "data_aprovacao" TO "data_aprovacao_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'data_cancelamento') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "data_cancelamento" TO "data_cancelamento_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'motivo_reprovacao') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "motivo_reprovacao" TO "motivo_reprovacao_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'motivo_cancelamento') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "motivo_cancelamento" TO "motivo_cancelamento_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'fornecedor_vencedor_id') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "fornecedor_vencedor_id" TO "id_fornecedor_vencedor_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'saving_valor') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "saving_valor" TO "ganho_valor_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'saving_percentual') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "saving_percentual" TO "ganho_percentual_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_cotacao_bid_frete_internacional";
  END IF;
END $$;

-- ─── fornecedor_bid_frete_internacional ────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'id_fornecedor_bid_frete_internacional') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'nome') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "nome" TO "nome_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'nome_fantasia') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "nome_fantasia" TO "nome_fantasia_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'tipo') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "tipo" TO "tipo_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'cnpj') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "cnpj" TO "cnpj_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'email') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "email" TO "email_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'telefone') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "telefone" TO "telefone_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'whatsapp') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "whatsapp" TO "whatsapp_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'website') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "website" TO "website_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'pais') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "pais" TO "pais_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'cidade') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "cidade" TO "cidade_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'status') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "status" TO "status_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'clerk_user_id') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "clerk_user_id" TO "id_clerk_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'aceita_cotacao_aberta') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "aceita_cotacao_aberta" TO "aceita_cotacao_aberta_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'cotacao_automatica') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "cotacao_automatica" TO "cotacao_automatica_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fornecedor_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "fornecedor_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_fornecedor_bid_frete_internacional";
  END IF;
END $$;

-- ─── disparo_cotacao_bid_frete_internacional ───────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'id_disparo_cotacao_bid_frete_internacional') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "id" TO "id_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'cotacao_id') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "cotacao_id" TO "id_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'fornecedor_id') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "fornecedor_id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'canal') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "canal" TO "canal_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'status') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "status" TO "status_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'enviado_em') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "enviado_em" TO "data_envio_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'visualizado_em') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "visualizado_em" TO "data_visualizacao_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'respondido_em') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "respondido_em" TO "data_resposta_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'token_resposta') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "token_resposta" TO "token_resposta_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'token_expira_em') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "token_expira_em" TO "data_expiracao_token_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'mensagem_id') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "mensagem_id" TO "id_mensagem_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'erro_envio') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "erro_envio" TO "erro_envio_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'disparo_cotacao_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "disparo_cotacao_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_disparo_cotacao_bid_frete_internacional";
  END IF;
END $$;

-- ─── proposta_bid_frete_internacional ────────────────────────────────────────────
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'id_proposta_bid_frete_internacional') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "id" TO "id_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'bid_request_id') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "bid_request_id" TO "id_disparo_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'cotacao_id') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "cotacao_id" TO "id_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'fornecedor_id') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "fornecedor_id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'moeda') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "moeda" TO "moeda_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'valor_frete') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "valor_frete" TO "valor_frete_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'taxas_origem') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "taxas_origem" TO "taxas_origem_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'taxas_destino') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "taxas_destino" TO "taxas_destino_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'valor_total') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "valor_total" TO "valor_total_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'transit_time_dias') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "transit_time_dias" TO "dias_transito_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'free_time_dias') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "free_time_dias" TO "dias_free_time_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'validade_cotacao') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "validade_cotacao" TO "validade_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'transbordos') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "transbordos" TO "transbordos_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'escalas') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "escalas" TO "escalas_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'observacoes') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "observacoes" TO "observacoes_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'status') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "status" TO "status_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'ranking_preco') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "ranking_preco" TO "classificacao_valor_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'ranking_transit') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "ranking_transit" TO "classificacao_transito_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'ranking_avaliacao') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "ranking_avaliacao" TO "classificacao_avaliacao_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'via_tabela_padrao') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "via_tabela_padrao" TO "via_tabela_valor_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'via_api') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "via_api" TO "via_api_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'via_portal') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "via_portal" TO "via_portal_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'via_email') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "via_email" TO "via_email_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'proposta_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "proposta_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_proposta_bid_frete_internacional";
  END IF;
END $$;
