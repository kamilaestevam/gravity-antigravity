-- Migration: add_cambio_siscomex (2026-06-08)
-- Catálogo global Portal Único / BACEN: cobertura cambial + modalidade de pagamento.

CREATE TABLE "cambio_siscomex" (
    "codigo_cambio_siscomex"    TEXT NOT NULL,
    "tipo_cambio_siscomex"      TEXT NOT NULL,
    "nome_cambio_siscomex"      TEXT NOT NULL,
    "descricao_cambio_siscomex" TEXT,
    "ordem_cambio_siscomex"     INTEGER NOT NULL DEFAULT 0,
    "ativo_cambio_siscomex"     BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cambio_siscomex_pkey" PRIMARY KEY ("codigo_cambio_siscomex")
);

CREATE INDEX "cambio_siscomex_tipo_idx" ON "cambio_siscomex"("tipo_cambio_siscomex");

-- Cobertura cambial (DUIMP/DI — API Integra Comex)
INSERT INTO "cambio_siscomex" ("codigo_cambio_siscomex", "tipo_cambio_siscomex", "nome_cambio_siscomex", "descricao_cambio_siscomex", "ordem_cambio_siscomex", "ativo_cambio_siscomex") VALUES
  ('ATE_180_DIAS',  'cobertura_cambial', 'Até 180 dias',        'Importação com cobertura cambial — prazo de fechamento até 180 dias.', 1, true),
  ('181_ATE_360',   'cobertura_cambial', 'De 181 a 360 dias',   'Importação com cobertura cambial — prazo de 181 a 360 dias.', 2, true),
  ('ACIMA_360',     'cobertura_cambial', 'Acima de 360 dias',   'Exige instituição financiadora, valor e número ROF/BACEN.', 3, true),
  ('SEM_COBERTURA', 'cobertura_cambial', 'Sem cobertura cambial', 'Exige motivo conforme tabela Motivo da Importação sem Cobertura Cambial.', 4, true);

-- Modalidade de pagamento (Tabelas Aduaneiras — LI/DI)
INSERT INTO "cambio_siscomex" ("codigo_cambio_siscomex", "tipo_cambio_siscomex", "nome_cambio_siscomex", "ordem_cambio_siscomex", "ativo_cambio_siscomex") VALUES
  ('10', 'modalidade_pagamento', 'Pagamento antecipado total ou preponderante', 10, true),
  ('20', 'modalidade_pagamento', 'Pagamento à vista total ou preponderante — carta de crédito', 20, true),
  ('21', 'modalidade_pagamento', 'Pagamento à vista total ou preponderante — outros', 21, true),
  ('30', 'modalidade_pagamento', 'Financiamento do fornecedor (supplier''s credit) — carta de crédito', 30, true),
  ('31', 'modalidade_pagamento', 'Financiamento do fornecedor (supplier''s credit) — outros', 31, true),
  ('40', 'modalidade_pagamento', 'Financiamento de banco estrangeiro ao importador (buyer''s credit) — carta de crédito', 40, true),
  ('41', 'modalidade_pagamento', 'Financiamento de banco estrangeiro ao importador (buyer''s credit) — outros', 41, true),
  ('50', 'modalidade_pagamento', 'Linha de crédito de banco estrangeiro a banco brasileiro — carta de crédito', 50, true),
  ('51', 'modalidade_pagamento', 'Linha de crédito de banco estrangeiro a banco brasileiro — outros', 51, true),
  ('52', 'modalidade_pagamento', 'Financiamento de instituição não financeira ao importador', 52, true);
