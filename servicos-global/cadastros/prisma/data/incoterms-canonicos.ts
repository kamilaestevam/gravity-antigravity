/**
 * incoterms-canonicos.ts — Catálogo canônico do Incoterms 2020 (ICC).
 *
 * Padrão internacional fixo — não muda por organização nem por tempo
 * (dentro de uma versão). Quando a ICC publicar Incoterms 2030, criar
 * nova versão e manter as linhas antigas para pedidos históricos.
 *
 * Fonte: ICC (International Chamber of Commerce) — https://iccwbo.org/
 * Adotado como SSOT em 2026-05-13 (substitui 5 cópias hardcoded no
 * produto Pedido).
 *
 * Mapeamento aplicado pelo seed:
 *   - codigo_incoterm    ← sigla
 *   - nome_incoterm      ← nome
 *   - descricao_incoterm ← descricao
 *   - modal_transporte   ← modal ('maritimo' | 'qualquer')
 *   - versao_incoterm    ← '2020' (fixo)
 *   - ativo_incoterm     ← true
 */

export interface IncotermCanonico {
  sigla: string
  nome: string
  descricao: string
  modal: 'maritimo' | 'qualquer'
}

export const INCOTERMS_CANONICOS: IncotermCanonico[] = [
  // Multimodal — qualquer modal de transporte
  { sigla: 'EXW', nome: 'Ex Works',                       descricao: 'Vendedor disponibiliza a mercadoria em seu estabelecimento. Comprador assume todos os custos e riscos.', modal: 'qualquer' },
  { sigla: 'FCA', nome: 'Free Carrier',                   descricao: 'Vendedor entrega a mercadoria ao transportador indicado pelo comprador em local convencionado.',         modal: 'qualquer' },
  { sigla: 'CPT', nome: 'Carriage Paid To',               descricao: 'Vendedor paga o frete até o destino. Risco transfere ao comprador na entrega ao primeiro transportador.', modal: 'qualquer' },
  { sigla: 'CIP', nome: 'Carriage and Insurance Paid To', descricao: 'Como CPT, mas vendedor também contrata seguro com cobertura ampla até o destino.',                        modal: 'qualquer' },
  { sigla: 'DAP', nome: 'Delivered At Place',             descricao: 'Vendedor entrega a mercadoria pronta para descarga no local de destino.',                                 modal: 'qualquer' },
  { sigla: 'DPU', nome: 'Delivered at Place Unloaded',    descricao: 'Vendedor entrega a mercadoria descarregada no local de destino. Substitui o antigo DAT.',                 modal: 'qualquer' },
  { sigla: 'DDP', nome: 'Delivered Duty Paid',            descricao: 'Vendedor entrega a mercadoria desembaraçada no destino, pagando direitos e impostos de importação.',      modal: 'qualquer' },
  // Marítimo — apenas modal aquaviário (porto)
  { sigla: 'FAS', nome: 'Free Alongside Ship',            descricao: 'Vendedor entrega a mercadoria ao lado do navio no porto de embarque convencionado.',                      modal: 'maritimo' },
  { sigla: 'FOB', nome: 'Free On Board',                  descricao: 'Vendedor entrega a mercadoria a bordo do navio. Risco transfere no embarque.',                            modal: 'maritimo' },
  { sigla: 'CFR', nome: 'Cost and Freight',               descricao: 'Vendedor paga o frete marítimo até o porto de destino. Risco transfere no embarque.',                     modal: 'maritimo' },
  { sigla: 'CIF', nome: 'Cost Insurance and Freight',     descricao: 'Como CFR, mas vendedor também contrata seguro mínimo até o destino.',                                     modal: 'maritimo' },
]
