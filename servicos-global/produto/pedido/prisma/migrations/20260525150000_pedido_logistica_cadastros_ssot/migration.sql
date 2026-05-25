-- Logística Pedido — campos com lookup lógico em Cadastros (sem FK cross-banco).
-- local_de_origem / local_de_destino  → cadastros.pais (codigo_pais_iso_alpha2)
-- aeroporto_origem / aeroporto_destino → cadastros.aeroporto (codigo_iata_aeroporto ou codigo_unlocode_aeroporto)
-- porto_origem / porto_destino (existentes) → cadastros.porto (codigo_unlocode_porto) — validação em runtime

ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "local_de_origem"  TEXT;
ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "local_de_destino" TEXT;
ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "aeroporto_origem"  TEXT;
ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "aeroporto_destino" TEXT;
