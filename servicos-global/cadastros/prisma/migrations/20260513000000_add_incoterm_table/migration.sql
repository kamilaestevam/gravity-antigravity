-- Migration: add_incoterm_table (2026-05-13)
--
-- Adiciona catálogo global dos termos do Incoterms 2020 (ICC). Padrão
-- internacional fixo — produtos consomem via leitura ao vivo (REST API
-- do Cadastros), sem snapshot. Substitui as 5 cópias hardcoded espalhadas
-- pelo produto Pedido (kind-ui-pedido.ts, ModalPedidoNovo.tsx,
-- smartImportService.ts, seed.ts, auditarSeed.ts).
--
-- Quando a ICC publicar Incoterms 2030, criar nova versao_incoterm.
-- Linhas com versao_incoterm anterior continuam acessíveis para pedidos
-- históricos (sem invalidar dados antigos).

CREATE TABLE "incoterm" (
    "codigo_incoterm"    TEXT NOT NULL,
    "nome_incoterm"      TEXT NOT NULL,
    "descricao_incoterm" TEXT,
    "modal_transporte"   TEXT NOT NULL,
    "versao_incoterm"    TEXT NOT NULL DEFAULT '2020',
    "ativo_incoterm"     BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "incoterm_pkey" PRIMARY KEY ("codigo_incoterm")
);

-- Seed inicial — Incoterms 2020 (ICC). 11 termos canônicos.
INSERT INTO "incoterm" ("codigo_incoterm", "nome_incoterm", "descricao_incoterm", "modal_transporte", "versao_incoterm", "ativo_incoterm") VALUES
  ('EXW', 'Ex Works',                          'Vendedor disponibiliza a mercadoria em seu estabelecimento. Comprador assume todos os custos e riscos.', 'qualquer',  '2020', true),
  ('FCA', 'Free Carrier',                      'Vendedor entrega a mercadoria ao transportador indicado pelo comprador em local convencionado.', 'qualquer',  '2020', true),
  ('CPT', 'Carriage Paid To',                  'Vendedor paga o frete até o destino. Risco transfere ao comprador na entrega ao primeiro transportador.', 'qualquer',  '2020', true),
  ('CIP', 'Carriage and Insurance Paid To',    'Como CPT, mas vendedor também contrata seguro com cobertura ampla até o destino.', 'qualquer',  '2020', true),
  ('DAP', 'Delivered At Place',                'Vendedor entrega a mercadoria pronta para descarga no local de destino.', 'qualquer',  '2020', true),
  ('DPU', 'Delivered at Place Unloaded',       'Vendedor entrega a mercadoria descarregada no local de destino. Substitui o antigo DAT.', 'qualquer',  '2020', true),
  ('DDP', 'Delivered Duty Paid',               'Vendedor entrega a mercadoria desembaraçada no destino, pagando direitos e impostos de importação.', 'qualquer',  '2020', true),
  ('FAS', 'Free Alongside Ship',               'Vendedor entrega a mercadoria ao lado do navio no porto de embarque convencionado.', 'maritimo',  '2020', true),
  ('FOB', 'Free On Board',                     'Vendedor entrega a mercadoria a bordo do navio. Risco transfere no embarque.', 'maritimo',  '2020', true),
  ('CFR', 'Cost and Freight',                  'Vendedor paga o frete marítimo até o porto de destino. Risco transfere no embarque.', 'maritimo',  '2020', true),
  ('CIF', 'Cost Insurance and Freight',        'Como CFR, mas vendedor também contrata seguro mínimo até o destino.', 'maritimo',  '2020', true);
