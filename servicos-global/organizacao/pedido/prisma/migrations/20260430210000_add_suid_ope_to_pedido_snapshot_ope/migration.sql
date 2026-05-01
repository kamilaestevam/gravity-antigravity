-- Migration: adiciona coluna suid_ope a pedido_snapshot_ope (referência lógica ao Cadastros).
-- Compatível com tabelas existentes (sem default, nullable). Front/back ainda permitem snapshot via codigo_ope quando suid_ope ausente.

ALTER TABLE "pedido_snapshot_ope" ADD COLUMN IF NOT EXISTS "suid_ope" TEXT;
