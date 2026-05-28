-- Colunas/tabelas que ficaram legadas após 20260528120000 (integracao, tabela, local_origem, bid_detalhe_taxas).
-- Idempotente.

-- bid_detalhe_taxas → taxa_bid_frete_internacional (SSOT do fragment)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'bid_detalhe_taxas')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'taxa_bid_frete_internacional') THEN
    ALTER TABLE "bid_detalhe_taxas" RENAME TO "taxa_bid_frete_internacional";
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'id_taxa_bid_frete_internacional') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "id" TO "id_taxa_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'response_id') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "response_id" TO "id_proposta_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'tipo') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "tipo" TO "tipo_taxa_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'nome') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "nome" TO "nome_taxa_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'valor') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "valor" TO "valor_taxa_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'taxa_bid_frete_internacional' AND column_name = 'moeda') THEN
    ALTER TABLE "taxa_bid_frete_internacional" RENAME COLUMN "moeda" TO "moeda_taxa_bid_frete_internacional";
  END IF;
END $$;

-- integracao_bid_frete_internacional
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'id_integracao_bid_frete_internacional') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "id" TO "id_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'nome') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "nome" TO "nome_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'tipo') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "tipo" TO "tipo_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'ativo') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "ativo" TO "ativo_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'base_url') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "base_url" TO "base_url_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'api_key_hash') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "api_key_hash" TO "api_key_hash_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'auth_type') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "auth_type" TO "tipo_autenticacao_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'headers_extra') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "headers_extra" TO "headers_extra_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'config_extra') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "config_extra" TO "config_extra_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'ultimo_teste_em') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "ultimo_teste_em" TO "data_ultimo_teste_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'ultimo_teste_ok') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "ultimo_teste_ok" TO "ultimo_teste_ok_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'erro_ultimo_teste') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "erro_ultimo_teste" TO "erro_ultimo_teste_integracao_bid_frete_internacional";
  END IF;
END $$;

-- tabela_bid_frete_internacional
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'id')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'id_tabela_bid_frete_internacional') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "id" TO "id_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'origem_codigo') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "origem_codigo" TO "origem_codigo_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'origem_nome') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "origem_nome" TO "origem_nome_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'destino_codigo') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "destino_codigo" TO "destino_codigo_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'destino_nome') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "destino_nome" TO "destino_nome_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'modal') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "modal" TO "modal_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'modalidade') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "modalidade" TO "modalidade_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'moeda') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "moeda" TO "moeda_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'valor_frete') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "valor_frete" TO "valor_frete_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'taxas_origem') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "taxas_origem" TO "taxas_origem_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'taxas_destino') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "taxas_destino" TO "taxas_destino_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'valor_total') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "valor_total" TO "valor_total_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'transit_time_dias') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "transit_time_dias" TO "dias_transito_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'free_time_dias') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "free_time_dias" TO "dias_free_time_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'validade_inicio') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "validade_inicio" TO "validade_inicio_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'validade_fim') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "validade_fim" TO "validade_fim_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'ativa') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "ativa" TO "ativa_tabela_bid_frete_internacional";
  END IF;
END $$;

-- local_origem_bid_frete_internacional (catálogo global de portos/aeroportos)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'codigo')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'codigo_local_origem_bid_frete_internacional') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "codigo" TO "codigo_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'nome') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "nome" TO "nome_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'pais') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "pais" TO "pais_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'pais_codigo') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "pais_codigo" TO "pais_codigo_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'tipo') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "tipo" TO "tipo_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'latitude') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "latitude" TO "latitude_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'longitude') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "longitude" TO "longitude_local_origem_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'local_origem_bid_frete_internacional' AND column_name = 'ativo') THEN
    ALTER TABLE "local_origem_bid_frete_internacional" RENAME COLUMN "ativo" TO "ativo_local_origem_bid_frete_internacional";
  END IF;
END $$;
