-- Catálogo global de mercadorias perigosas (lista ONU).

CREATE TABLE IF NOT EXISTS "mercadoria_perigosa" (
    "id_mercadoria_perigosa" TEXT NOT NULL,
    "numero_onu_mercadoria_perigosa" TEXT NOT NULL,
    "nome_tecnico_embarque_mercadoria_perigosa" TEXT NOT NULL,
    "nome_ascii_mercadoria_perigosa" TEXT NOT NULL,
    "nome_ingles_mercadoria_perigosa" TEXT NOT NULL,
    "classe_mercadoria_perigosa" INTEGER NOT NULL,
    "divisao_mercadoria_perigosa" TEXT,
    "grupo_embalagem_mercadoria_perigosa" TEXT,
    "versao_fonte_mercadoria_perigosa" TEXT NOT NULL,
    "ativo_mercadoria_perigosa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "mercadoria_perigosa_pkey" PRIMARY KEY ("id_mercadoria_perigosa")
);

CREATE UNIQUE INDEX IF NOT EXISTS "mercadoria_perigosa_numero_onu_mercadoria_perigosa_nome_ascii_mercadoria_perigosa_grupo_embalagem_mercadoria_perigosa_key"
    ON "mercadoria_perigosa"("numero_onu_mercadoria_perigosa", "nome_ascii_mercadoria_perigosa", "grupo_embalagem_mercadoria_perigosa");

CREATE INDEX IF NOT EXISTS "mercadoria_perigosa_onu_idx" ON "mercadoria_perigosa"("numero_onu_mercadoria_perigosa");
CREATE INDEX IF NOT EXISTS "mercadoria_perigosa_nome_ascii_idx" ON "mercadoria_perigosa"("nome_ascii_mercadoria_perigosa");
CREATE INDEX IF NOT EXISTS "mercadoria_perigosa_classe_idx" ON "mercadoria_perigosa"("classe_mercadoria_perigosa");
CREATE INDEX IF NOT EXISTS "mercadoria_perigosa_ativo_idx" ON "mercadoria_perigosa"("ativo_mercadoria_perigosa");
