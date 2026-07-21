/**
 * Deriva KPIs e séries para a tela de resultado a partir do formulário e da simulação.
 */
import type { EntradaSimulaCusto, ResultadoSimulacaoSimulaCusto } from './schemas-simula-custo'
import {
  FATO_GERADOR_PRAZO_LABELS,
  TIPO_VALOR_PRAZO_LABELS,
} from './types'
import { formatarMoedaEstrangeiraSimulaCusto } from './formatacao-moeda-simula-custo'

export interface NoFluxoCaixaSimulaCusto {
  pctAcumulado: number
  valorFormatado: string
  rotulo: string
  dataRotulo: string
}

export interface DadosFluxoCaixaSimulaCusto {
  moeda: string
  totalMercadoria: number
  totalMercadoriaFormatado: string
  proximoPagamentoFormatado: string
  prazoMedioDias: number | null
  pills: string[]
  nos: NoFluxoCaixaSimulaCusto[]
}

export interface InsightGabiSimulaCusto {
  nomeUsuario: string
  dataIdealCambio: string
  ptaxIdeal: number
  economiaCambioBrl: number
  fatorAtual: number
  fatorIdeal: number
  valorFobIdealUsd: number
}

export interface DadosFatorImportacaoSimulaCusto {
  fatorAtual: number
  fatorIdeal: number
  valorFobAtual: number
  valorFobIdeal: number
  moeda: string
  custosFixos: Array<{ nome: string; valorBrl: number; cor: string }>
}

const CUSTOS_FIXOS_MOCK: Array<{ nome: string; valorBrl: number; cor: string }> = [
  { nome: 'Frete internacional (marítimo)', valorBrl: 8400, cor: '#6ea0ff' },
  { nome: 'Despacho aduaneiro', valorBrl: 1850, cor: '#a78bfa' },
  { nome: 'Transporte interno', valorBrl: 2100, cor: '#f6b28a' },
  { nome: 'Armazenagem', valorBrl: 1200, cor: '#34d399' },
]

function rotuloPrazoPagamento(
  prazo: EntradaSimulaCusto['prazos_pagamento_simula_custo'][number],
): string {
  const tipo = TIPO_VALOR_PRAZO_LABELS[prazo.tipo_valor_prazo_pagamento_simula_custo]
  const valor =
    prazo.tipo_valor_prazo_pagamento_simula_custo === 'PERCENTUAL'
      ? `${prazo.valor_prazo_pagamento_simula_custo}%`
      : String(prazo.valor_prazo_pagamento_simula_custo)
  const fato = FATO_GERADOR_PRAZO_LABELS[prazo.fato_gerador_prazo_pagamento_simula_custo]
  const dias =
    prazo.momento_prazo_pagamento_simula_custo === 'NO_DIA'
      ? ''
      : ` ${prazo.momento_prazo_pagamento_simula_custo === 'ANTES' ? '-' : '+'}${prazo.dias_prazo_pagamento_simula_custo}d`
  return `${valor} ${tipo.toLowerCase()} · ${fato}${dias}`
}

export function derivarFluxoCaixaSimulaCusto(
  form: EntradaSimulaCusto,
): DadosFluxoCaixaSimulaCusto {
  const moeda = form.moeda_produto_simula_custo
  const totalMercadoria = form.valor_produto_simula_custo
  const prazos = form.prazos_pagamento_simula_custo

  if (prazos.length === 0 || totalMercadoria <= 0) {
    return {
      moeda,
      totalMercadoria,
      totalMercadoriaFormatado: formatarMoedaEstrangeiraSimulaCusto(totalMercadoria, moeda),
      proximoPagamentoFormatado: '—',
      prazoMedioDias: null,
      pills: [],
      nos: [],
    }
  }

  const pills = prazos.map(rotuloPrazoPagamento)
  let acumulado = 0
  const nos: NoFluxoCaixaSimulaCusto[] = prazos.map((prazo, i) => {
    const parcela =
      prazo.tipo_valor_prazo_pagamento_simula_custo === 'PERCENTUAL'
        ? (totalMercadoria * prazo.valor_prazo_pagamento_simula_custo) / 100
        : prazo.valor_prazo_pagamento_simula_custo
    acumulado += parcela
    const pctAcumulado = totalMercadoria > 0 ? (acumulado / totalMercadoria) * 100 : 0
    const fato = FATO_GERADOR_PRAZO_LABELS[prazo.fato_gerador_prazo_pagamento_simula_custo]
    return {
      pctAcumulado: Math.min(100, pctAcumulado),
      valorFormatado: formatarMoedaEstrangeiraSimulaCusto(parcela, moeda),
      rotulo: fato,
      dataRotulo: `Parcela ${i + 1}`,
    }
  })

  const primeiro = prazos[0]
  const valorPrimeiro =
    primeiro.tipo_valor_prazo_pagamento_simula_custo === 'PERCENTUAL'
      ? (totalMercadoria * primeiro.valor_prazo_pagamento_simula_custo) / 100
      : primeiro.valor_prazo_pagamento_simula_custo

  const diasMedio =
    prazos.reduce((s, p) => s + p.dias_prazo_pagamento_simula_custo, 0) / prazos.length

  return {
    moeda,
    totalMercadoria,
    totalMercadoriaFormatado: formatarMoedaEstrangeiraSimulaCusto(totalMercadoria, moeda),
    proximoPagamentoFormatado: formatarMoedaEstrangeiraSimulaCusto(valorPrimeiro, moeda),
    prazoMedioDias: Math.round(diasMedio),
    pills,
    nos,
  }
}

export function derivarFatorImportacaoSimulaCusto(
  form: EntradaSimulaCusto,
  resultado: ResultadoSimulacaoSimulaCusto,
): DadosFatorImportacaoSimulaCusto {
  const ptax = resultado.ptax_utilizada_simula_custo
  const valorFobBrl =
    form.moeda_produto_simula_custo === 'BRL'
      ? form.valor_produto_simula_custo
      : form.valor_produto_simula_custo * ptax

  const fatorAtual =
    valorFobBrl > 0 ? resultado.resultado.custo_nacionalizado_brl / valorFobBrl : 0

  const custoFixoTotal = CUSTOS_FIXOS_MOCK.reduce((s, c) => s + c.valorBrl, 0)
  const fatorIdeal = fatorAtual > 0 ? Math.max(fatorAtual * 0.9, fatorAtual - 0.3) : 2.96
  const valorFobIdealBrl =
    fatorIdeal > 0 ? (resultado.resultado.custo_nacionalizado_brl - custoFixoTotal) / fatorIdeal : 0
  const valorFobIdeal =
    form.moeda_produto_simula_custo === 'BRL'
      ? valorFobIdealBrl
      : valorFobIdealBrl / ptax

  return {
    fatorAtual,
    fatorIdeal,
    valorFobAtual: form.valor_produto_simula_custo,
    valorFobIdeal: Math.max(form.valor_produto_simula_custo, valorFobIdeal),
    moeda: form.moeda_produto_simula_custo,
    custosFixos: CUSTOS_FIXOS_MOCK,
  }
}

export function derivarInsightGabiSimulaCusto(
  form: EntradaSimulaCusto,
  resultado: ResultadoSimulacaoSimulaCusto,
  nomeUsuario: string,
): InsightGabiSimulaCusto {
  const ptaxHoje = resultado.ptax_utilizada_simula_custo
  const ptaxIdeal = Math.max(ptaxHoje * 0.985, ptaxHoje - 0.07)
  const valorUsd =
    form.moeda_produto_simula_custo === 'USD'
      ? form.valor_produto_simula_custo
      : form.valor_produto_simula_custo / ptaxHoje
  const economiaCambioBrl = Math.max(0, (ptaxHoje - ptaxIdeal) * valorUsd)
  const fator = derivarFatorImportacaoSimulaCusto(form, resultado)

  const primeiroNome = nomeUsuario.trim().split(/\s+/)[0] || 'você'

  return {
    nomeUsuario: primeiroNome,
    dataIdealCambio: '15/ago',
    ptaxIdeal,
    economiaCambioBrl: Math.round(economiaCambioBrl),
    fatorAtual: fator.fatorAtual,
    fatorIdeal: fator.fatorIdeal,
    valorFobIdealUsd:
      form.moeda_produto_simula_custo === 'USD'
        ? fator.valorFobIdeal
        : fator.valorFobIdeal,
  }
}

/** Curva ilustrativa de dólar futuro (6 meses) ancorada na PTAX. */
export function serieDolarFuturoSimulaCusto(ptax: number): Array<{ mes: string; valor: number }> {
  const meses = ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const fatores = [1.0, 0.986, 0.992, 1.004, 1.01, 1.015]
  return meses.map((mes, i) => ({
    mes,
    valor: ptax * fatores[i],
  }))
}
