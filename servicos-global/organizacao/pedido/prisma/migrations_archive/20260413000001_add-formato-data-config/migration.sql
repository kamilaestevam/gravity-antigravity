-- Migration: adicionar formato_data à tabela de configuração de casas decimais
-- O campo armazena o formato de exibição de datas escolhido pelo tenant.
-- Padrão: DD/MM/AAAA (Brasil/Europa)

ALTER TABLE "pedido_casas_decimais_config"
  ADD COLUMN IF NOT EXISTS "formato_data" TEXT NOT NULL DEFAULT 'DD/MM/AAAA';
