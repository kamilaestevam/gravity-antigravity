/**
 * Mocks compartilhados entre as 3 abas do Financeiro
 * (FinanceiroMovimentacao, FinanceiroNumerario, FinanceiroRateio).
 *
 * Schema fonte: servicos-global/produto/financeiro-comex/prisma/fragment.prisma
 *   - FinanceiroLancamento, FinanceiroNumerario, FinanceiroRateio
 *
 * Quando o back/banco do Processo estiver pronto, trocar MOCK_* por
 * chamadas reais filtradas por processo_id.
 */

export type Moeda = 'BRL' | 'USD' | 'EUR'
export type StatusPagamento = 'pendente' | 'agendado' | 'pago' | 'cancelado'

export interface Lancamento {
  id: string
  data: string
  descricao: string
  fornecedor: string
  moeda: Moeda
  taxa: number
  valor: number
  valor_brl: number
  data_pagamento?: string
  data_vencimento?: string
  status: StatusPagamento
}

export interface Numerario {
  id: string
  descricao: string
  is_principal: boolean
  data: string
  valor_total: number
}

export interface Rateio {
  id: string
  nome: string
  data: string
}

export const MOCK_LANCAMENTOS: Lancamento[] = [
  { id: 'l1', data: '2025-12-29T12:01:58Z', descricao: '4 - Frete Internacional',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'USD', taxa: 5.5413, valor: 800, valor_brl: 4433.04,
    data_vencimento: '2026-01-15', status: 'pendente' },
  { id: 'l2', data: '2025-12-29T12:01:58Z', descricao: '56 - Taxas do CE (Collect)',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'BRL', taxa: 1, valor: 404.55, valor_brl: 404.55,
    data_vencimento: '2026-01-10', status: 'pendente' },
  { id: 'l3', data: '2025-12-29T12:01:58Z', descricao: '8 - THC',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'BRL', taxa: 1, valor: 600, valor_brl: 600,
    data_pagamento: '2025-12-30', status: 'pago' },
  { id: 'l4', data: '2025-12-29T12:01:58Z', descricao: '9 - Marinha Mercante (AFRMM)',
    fornecedor: 'MARINHA MERCANTE', moeda: 'BRL', taxa: 1, valor: 450.77, valor_brl: 450.77,
    data_pagamento: '2025-12-30', status: 'pago' },
  { id: 'l5', data: '2025-12-29T12:05:47Z', descricao: '18 - Seguro',
    fornecedor: 'AXA SEGUROS S.A', moeda: 'USD', taxa: 5.5413, valor: 1.02914, valor_brl: 5.70,
    data_vencimento: '2026-02-01', status: 'agendado' },
]

export const MOCK_NUMERARIOS: Numerario[] = [
  { id: 'n1', descricao: 'Numerário principal', is_principal: true,
    data: '2025-12-28', valor_total: 0 },
]

export const MOCK_RATEIOS: Rateio[] = [
  { id: 'r1', nome: 'Rateio', data: '2025-12-29T12:24:00Z' },
  { id: 'r2', nome: 'Rateio', data: '2025-12-29T12:28:00Z' },
]

// ── Utilitarios de formatacao ─────────────────────────────────────────────

export const fmtMoeda = (v: number, m: Moeda) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: m })

export const fmtData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')

export const fmtDataHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit' })

export const STATUS_LABEL: Record<StatusPagamento, string> = {
  pendente:  'Pendente',
  agendado:  'Agendado',
  pago:      'Pago',
  cancelado: 'Cancelado',
}

// ── Calculo de totais consolidados ────────────────────────────────────────

export function calcularTotais(lancamentos: Lancamento[]) {
  const acc = {
    BRL: { aberto: 0, pago: 0, agendado: 0, total: 0 },
    USD: { aberto: 0, pago: 0, agendado: 0, total: 0 },
    EUR: { aberto: 0, pago: 0, agendado: 0, total: 0 },
  } as Record<Moeda, { aberto: number; pago: number; agendado: number; total: number }>
  for (const l of lancamentos) {
    if (l.status === 'cancelado') continue
    acc[l.moeda].total += l.valor
    if (l.status === 'pendente')  acc[l.moeda].aberto   += l.valor
    if (l.status === 'agendado')  acc[l.moeda].agendado += l.valor
    if (l.status === 'pago')      acc[l.moeda].pago     += l.valor
  }
  return acc
}
