/**
 * Mocks compartilhados entre Lista e Kanban de processos.
 *
 * Quando o back/banco do Processo estiver pronto, trocar MOCK_PROCESSOS
 * por chamada real filtrada por workspace.
 */

export type EtapaProcesso =
  | 'abertura' | 'pedido' | 'li' | 'embarque' | 'desembaraco' | 'entrega' | 'concluido'

export interface ProcessoLinha {
  id: string
  numero: string                  // IMP-2026/0150
  importador: string              // Acme Importações
  exportador: string              // Shanghai Electronics
  pais_origem: string             // CN
  pais_destino: string            // BR
  incoterm: string                // CIF
  via_transporte: string          // Marítima
  valor_fob: number               // 108050
  moeda: string                   // USD
  peso_bruto: number              // kg
  data_abertura: string           // ISO
  data_embarque?: string
  data_chegada?: string
  etapa_atual: EtapaProcesso
  responsavel: string
  despachante?: string
}

export const ETAPAS_LABEL: Record<EtapaProcesso, string> = {
  abertura:    'Abertura',
  pedido:      'Pedido',
  li:          'LI',
  embarque:    'Embarque',
  desembaraco: 'Desembaraço',
  entrega:     'Entrega',
  concluido:   'Concluído',
}

export const ETAPAS_COR: Record<EtapaProcesso, string> = {
  abertura:    '#94a3b8',  // cinza
  pedido:      '#60a5fa',  // azul
  li:          '#a78bfa',  // roxo
  embarque:    '#a78bfa',  // roxo
  desembaraco: '#fbbf24',  // âmbar
  entrega:     '#34d399',  // verde claro
  concluido:   '#10b981',  // verde
}

export const ORDEM_ETAPAS: EtapaProcesso[] = [
  'abertura', 'pedido', 'li', 'embarque', 'desembaraco', 'entrega', 'concluido',
]

// ── 7 processos mockados (espelham o que aparece no Hub) ──────────────────

export const MOCK_PROCESSOS: ProcessoLinha[] = [
  {
    id: 'p1', numero: 'IMP-2026/0150',
    importador: 'Acme Importações Ltda.', exportador: 'Shanghai Electronics Co.',
    pais_origem: 'CN', pais_destino: 'BR', incoterm: 'CIF', via_transporte: 'Marítima',
    valor_fob: 108_050, moeda: 'USD', peso_bruto: 18_771,
    data_abertura: '2026-01-10', data_embarque: '2026-03-15', data_chegada: '2026-04-05',
    etapa_atual: 'embarque', responsavel: 'Daniel Martins',
    despachante: 'Asia Shipping Transportes Internacionais Ltda.',
  },
  {
    id: 'p2', numero: 'IMP-2026/0149',
    importador: 'Acme Importações Ltda.', exportador: 'Korea Tech Ltd.',
    pais_origem: 'KR', pais_destino: 'BR', incoterm: 'FOB', via_transporte: 'Aérea',
    valor_fob: 54_200, moeda: 'USD', peso_bruto: 8_400,
    data_abertura: '2026-01-22', data_embarque: '2026-02-28', data_chegada: '2026-03-08',
    etapa_atual: 'desembaraco', responsavel: 'Marina Albuquerque',
    despachante: 'Cargo Express LTDA',
  },
  {
    id: 'p3', numero: 'IMP-2026/0148',
    importador: 'Acme Importações Ltda.', exportador: 'Vietnam Goods SA',
    pais_origem: 'VN', pais_destino: 'BR', incoterm: 'EXW', via_transporte: 'Marítima',
    valor_fob: 32_900, moeda: 'USD', peso_bruto: 5_100,
    data_abertura: '2025-12-15', data_embarque: '2026-01-18', data_chegada: '2026-02-25',
    etapa_atual: 'concluido', responsavel: 'Rafael Mendes',
    despachante: 'Asia Shipping Transportes Internacionais Ltda.',
  },
  {
    id: 'p4', numero: 'IMP-2026/0147',
    importador: 'Acme Importações Ltda.', exportador: 'Mumbai Textiles Pvt',
    pais_origem: 'IN', pais_destino: 'BR', incoterm: 'CIF', via_transporte: 'Marítima',
    valor_fob: 78_400, moeda: 'USD', peso_bruto: 22_500,
    data_abertura: '2026-02-01', data_embarque: '2026-04-10',
    etapa_atual: 'li', responsavel: 'Marina Albuquerque',
  },
  {
    id: 'p5', numero: 'IMP-2026/0146',
    importador: 'Acme Importações Ltda.', exportador: 'Berlin Auto Parts GmbH',
    pais_origem: 'DE', pais_destino: 'BR', incoterm: 'DDP', via_transporte: 'Aérea',
    valor_fob: 145_300, moeda: 'EUR', peso_bruto: 3_800,
    data_abertura: '2026-02-12',
    etapa_atual: 'pedido', responsavel: 'Daniel Martins',
  },
  {
    id: 'p6', numero: 'IMP-2026/0145',
    importador: 'Acme Importações Ltda.', exportador: 'Mexico Beverages SA',
    pais_origem: 'MX', pais_destino: 'BR', incoterm: 'FCA', via_transporte: 'Terrestre',
    valor_fob: 28_900, moeda: 'USD', peso_bruto: 6_200,
    data_abertura: '2026-02-20',
    etapa_atual: 'abertura', responsavel: 'Rafael Mendes',
  },
  {
    id: 'p7', numero: 'IMP-2026/0144',
    importador: 'Acme Importações Ltda.', exportador: 'Tokyo Electronics Inc.',
    pais_origem: 'JP', pais_destino: 'BR', incoterm: 'CIF', via_transporte: 'Marítima',
    valor_fob: 96_750, moeda: 'USD', peso_bruto: 14_200,
    data_abertura: '2026-01-05', data_embarque: '2026-03-01', data_chegada: '2026-04-12',
    etapa_atual: 'entrega', responsavel: 'Marina Albuquerque',
    despachante: 'Cargo Express LTDA',
  },
]

// ── Utils ──────────────────────────────────────────────────────────────────

export const fmtMoeda = (v: number, m: string) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: m })

export const fmtPeso = (kg: number) =>
  `${kg.toLocaleString('pt-BR')} kg`

export const fmtData = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'
