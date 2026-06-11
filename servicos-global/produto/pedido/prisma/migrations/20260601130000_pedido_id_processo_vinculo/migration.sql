-- Vínculo Pedido → Processo (modelo híbrido)
-- Sem FK cross-banco: id_processo é link lógico para API Processo.

ALTER TABLE "pedido" ADD COLUMN IF NOT EXISTS "id_processo" TEXT;

CREATE INDEX IF NOT EXISTS "pedido_id_organizacao_id_processo_idx"
  ON "pedido"("id_organizacao", "id_processo");
