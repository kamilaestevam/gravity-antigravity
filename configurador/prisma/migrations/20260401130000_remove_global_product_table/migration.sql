-- Migration: remove_global_product_table
-- Remove tabela legada GlobalProduct. A tabela Product é a fonte única de verdade
-- para o catálogo de produtos, gerenciada pelo Admin via /api/admin/products.

DROP TABLE IF EXISTS "GlobalProduct";
