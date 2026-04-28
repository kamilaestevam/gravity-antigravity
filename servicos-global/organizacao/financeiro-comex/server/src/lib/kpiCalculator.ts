/**
 * kpiCalculator.ts — Calculo de KPIs financeiros do Financeiro Comex
 *
 * Regra (RN-002): Saldo = Custos Totais (BRL) - Numerario Total
 * Saldo negativo = empresa ainda deve (estado normal durante processo)
 */

import { roundTo4 } from './currencyConverter.js'

export interface LancamentoKPI {
  valor_brl: number
  moeda: string
  valor: number
  status_pagamento: 'PENDENTE' | 'AGENDADO' | 'PAGO'
}

export interface NumerarioKPI {
  valor_total: number
}

export interface KPIResult {
  total_brl: number
  total_usd: number
  total_eur: number
  total_outros: number
  adiantado: number
  pagos: number
  agendados: number
  pendente: number
  saldo: number
}

/**
 * Calcula todos os KPIs a partir dos lancamentos e numerarios do processo
 */
export function calcularKPIs(
  lancamentos: LancamentoKPI[],
  numerarios: NumerarioKPI[]
): KPIResult {
  let total_brl = 0
  let total_usd = 0
  let total_eur = 0
  let total_outros = 0
  let pagos = 0
  let agendados = 0
  let pendente = 0

  for (const l of lancamentos) {
    total_brl = roundTo4(total_brl + l.valor_brl)

    if (l.moeda === 'USD') {
      total_usd = roundTo4(total_usd + l.valor)
    } else if (l.moeda === 'EUR') {
      total_eur = roundTo4(total_eur + l.valor)
    } else if (l.moeda !== 'BRL') {
      total_outros = roundTo4(total_outros + l.valor_brl)
    }

    if (l.status_pagamento === 'PAGO') {
      pagos = roundTo4(pagos + l.valor_brl)
    } else if (l.status_pagamento === 'AGENDADO') {
      agendados = roundTo4(agendados + l.valor_brl)
    } else {
      pendente = roundTo4(pendente + l.valor_brl)
    }
  }

  const adiantado = numerarios.reduce((sum, n) => roundTo4(sum + n.valor_total), 0)
  // Saldo = Numerario - Custos (negativo = empresa ainda deve; estado normal)
  const saldo = roundTo4(adiantado - total_brl)

  return {
    total_brl,
    total_usd,
    total_eur,
    total_outros,
    adiantado,
    pagos,
    agendados,
    pendente,
    saldo,
  }
}
