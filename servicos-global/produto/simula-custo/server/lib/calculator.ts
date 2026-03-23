/**
 * calculator.ts — SimulaCusto
 * Lógica de cálculo pura, sem side effects.
 * Facilita testes unitários.
 */

export type Categoria =
  | 'infraestrutura'
  | 'suporte'
  | 'licenca'
  | 'integracao'
  | 'customizacao'

export interface ItemCategoria {
  categoria: Categoria
  descricao: string
  quantidade: number
  precoUnitario: number
}

export interface SimulacaoInput {
  tenantId: string
  nomeServico: string
  itens: ItemCategoria[]
  descontoPercentual?: number // 0–100
  metricasDashboard?: {
    usuariosAtivos?: number
    volumeTransacoes?: number
  }
  historicoRelatorio?: {
    mediaGastoMensal?: number
    mesesHistorico?: number
  }
}

export interface BreakdownCategoria {
  categoria: Categoria
  descricao: string
  subtotal: number
  percentualDoTotal: number
}

export interface SimulacaoResult {
  tenantId: string
  nomeServico: string
  subtotalBruto: number
  descontoValor: number
  totalFinal: number
  breakdown: BreakdownCategoria[]
  alertas: string[]
  criadoEm: string // ISO string
}

/**
 * Calcula os subtotais por categoria.
 */
export function calcularBreakdown(itens: ItemCategoria[]): Map<Categoria, number> {
  const mapa = new Map<Categoria, number>()

  for (const item of itens) {
    const atual = mapa.get(item.categoria) ?? 0
    mapa.set(item.categoria, atual + item.quantidade * item.precoUnitario)
  }

  return mapa
}

/**
 * Aplica desconto percentual a um valor bruto.
 */
export function aplicarDesconto(valorBruto: number, descontoPercentual: number): number {
  if (descontoPercentual < 0 || descontoPercentual > 100) {
    throw new RangeError(`Desconto inválido: ${descontoPercentual}. Deve estar entre 0 e 100.`)
  }
  return valorBruto * (descontoPercentual / 100)
}

/**
 * Gera alertas com base nas métricas e histórico.
 */
export function gerarAlertas(input: SimulacaoInput, totalFinal: number): string[] {
  const alertas: string[] = []

  const { metricasDashboard, historicoRelatorio } = input

  if (metricasDashboard?.usuariosAtivos && metricasDashboard.usuariosAtivos > 1000) {
    alertas.push('Alto volume de usuários ativos — considere plano Enterprise.')
  }

  if (metricasDashboard?.volumeTransacoes && metricasDashboard.volumeTransacoes > 50000) {
    alertas.push('Volume de transações elevado — verifique limites de API.')
  }

  if (historicoRelatorio?.mediaGastoMensal) {
    const variacao = totalFinal - historicoRelatorio.mediaGastoMensal
    const percentual = (variacao / historicoRelatorio.mediaGastoMensal) * 100

    if (percentual > 20) {
      alertas.push(
        `Custo simulado ${percentual.toFixed(1)}% acima da média histórica (R$ ${historicoRelatorio.mediaGastoMensal.toFixed(2)}).`
      )
    } else if (percentual < -10) {
      alertas.push(
        `Custo simulado ${Math.abs(percentual).toFixed(1)}% abaixo da média histórica — verifique se está correto.`
      )
    }
  }

  return alertas
}

/**
 * Função principal: executa toda a simulação de custo.
 * Pura e sem side effects.
 */
export function executarSimulacao(input: SimulacaoInput): SimulacaoResult {
  if (!input.itens || input.itens.length === 0) {
    throw new Error('A simulação requer ao menos um item para calcular.')
  }

  const desconto = input.descontoPercentual ?? 0
  const breakdownMap = calcularBreakdown(input.itens)

  // Subtotal bruto
  let subtotalBruto = 0
  for (const valor of breakdownMap.values()) {
    subtotalBruto += valor
  }

  // Desconto
  const descontoValor = aplicarDesconto(subtotalBruto, desconto)
  const totalFinal = subtotalBruto - descontoValor

  // Breakdown com percentual
  const breakdown: BreakdownCategoria[] = []
  for (const [categoria, subtotal] of breakdownMap.entries()) {
    const percent = totalFinal > 0 ? (subtotal / totalFinal) * 100 : 0
    // Find descricao from first item of this categoria
    const itemRef = input.itens.find((i) => i.categoria === categoria)
    breakdown.push({
      categoria,
      descricao: itemRef?.descricao ?? categoria,
      subtotal,
      percentualDoTotal: Math.round(percent * 100) / 100,
    })
  }

  const alertas = gerarAlertas(input, totalFinal)

  return {
    tenantId: input.tenantId,
    nomeServico: input.nomeServico,
    subtotalBruto,
    descontoValor,
    totalFinal,
    breakdown,
    alertas,
    criadoEm: new Date().toISOString(),
  }
}
