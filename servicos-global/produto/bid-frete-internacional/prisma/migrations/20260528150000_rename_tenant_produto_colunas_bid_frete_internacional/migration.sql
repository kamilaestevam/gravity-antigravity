-- Colunas tenant/produto/workspace legadas (product_id, user_id, company_id) e timestamps em inglês.
-- Paridade com Pedido (company_id → id_workspace) e fragment.prisma SSOT.
-- Idempotente: só renomeia se a coluna antiga existir.

DO $$ BEGIN
  -- cotacao_bid_frete_internacional
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cotacao_bid_frete_internacional' AND column_name = 'company_id') THEN
    ALTER TABLE "cotacao_bid_frete_internacional" RENAME COLUMN "company_id" TO "id_workspace";
  END IF;

  -- avaliacao_bid_frete_internacional
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'fornecedor_id') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "fornecedor_id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'cotacao_id') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "cotacao_id" TO "id_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_avaliacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'avaliacao_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "avaliacao_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_avaliacao_bid_frete_internacional";
  END IF;

  -- tabela_bid_frete_internacional
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'fornecedor_id') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "fornecedor_id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_tabela_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tabela_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "tabela_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_tabela_bid_frete_internacional";
  END IF;

  -- ganho_bid_frete_internacional
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganho_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganho_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganho_bid_frete_internacional' AND column_name = 'company_id') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "company_id" TO "id_workspace";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganho_bid_frete_internacional' AND column_name = 'cotacao_id') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "cotacao_id" TO "id_cotacao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ganho_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "ganho_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_ganho_bid_frete_internacional";
  END IF;

  -- integracao_bid_frete_internacional
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'product_id') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "product_id" TO "id_produto_gravity";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'user_id') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "user_id" TO "id_usuario";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'fornecedor_id') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "fornecedor_id" TO "id_fornecedor_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'created_at') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "created_at" TO "data_criacao_integracao_bid_frete_internacional";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'integracao_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "integracao_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_integracao_bid_frete_internacional";
  END IF;

  -- classificacao_bid_frete_internacional (global)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'classificacao_bid_frete_internacional' AND column_name = 'updated_at') THEN
    ALTER TABLE "classificacao_bid_frete_internacional" RENAME COLUMN "updated_at" TO "data_atualizacao_classificacao_bid_frete_internacional";
  END IF;
END $$;
