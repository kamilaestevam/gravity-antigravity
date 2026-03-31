/**
 * rateioAlgorithms.ts — Funcoes puras de calculo de rateio
 *
 * 9 metodos de rateio para distribuir despesas entre itens da NF.
 * Todas as funcoes sao puras (sem acesso a DB), recebem dados e retornam resultado.
 *
 * Regras:
 * - Centavo restante: ultimo item absorve diferenca de arredondamento
 * - Divisor zero: fallback para IGUALITARIO com warning
 * - Nenhum valor negativo
 * - Arredondamento ROUND_HALF_UP
 * - CUSTOMIZADO: parser seguro de formula (sem eval())
 */

export type MetodoRateio =
  | 'PESO_LIQUIDO'
  | 'PESO_BRUTO'
  | 'VALOR_CIF'
  | 'VALOR_FOB'
  | 'QUANTIDADE'
  | 'VALOR_II'
  | 'IGUALITARIO'
  | 'MANUAL'
  | 'CUSTOMIZADO'

export interface ItemRateio {
  id: string
  peso_liquido: number
  peso_bruto: number
  valor_cif: number
  valor_fob: number
  quantidade: number
  valor_ii: number
  /** Pesos customizados por campo, usado apenas em CUSTOMIZADO */
  pesos_customizados?: Record<string, number>
}

export interface ResultadoRateioItem {
  itemId: string
  valor_rateado: number
  percentual: number
}

export interface ResultadoRateio {
  itens: ResultadoRateioItem[]
  warnings: string[]
}

/**
 * Arredondamento ROUND_HALF_UP com 2 casas decimais
 */
function roundHalfUp(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

/**
 * Distribui valor proporcional a um campo numerico dos itens.
 * Ultimo item absorve centavo restante.
 */
function ratearProporcional(
  valorTotal: number,
  itens: ItemRateio[],
  campo: keyof ItemRateio,
  warnings: string[]
): ResultadoRateioItem[] {
  const total = itens.reduce((sum, item) => sum + (Number(item[campo]) || 0), 0)

  // Divisor zero: fallback para igualitario
  if (total === 0) {
    warnings.push(`Soma de ${String(campo)} e zero — fallback para rateio igualitario`)
    return ratearIgualitario(valorTotal, itens)
  }

  const resultados: ResultadoRateioItem[] = []
  let somaRateada = 0

  for (let i = 0; i < itens.length; i++) {
    const item = itens[i]
    const valorCampo = Number(item[campo]) || 0
    const percentual = roundHalfUp((valorCampo / total) * 100)

    if (i === itens.length - 1) {
      // Ultimo item absorve centavo restante
      const valorRateado = roundHalfUp(valorTotal - somaRateada)
      resultados.push({
        itemId: item.id,
        valor_rateado: Math.max(0, valorRateado),
        percentual,
      })
    } else {
      const valorRateado = roundHalfUp((valorCampo / total) * valorTotal)
      somaRateada += valorRateado
      resultados.push({
        itemId: item.id,
        valor_rateado: Math.max(0, valorRateado),
        percentual,
      })
    }
  }

  return resultados
}

/**
 * Rateio igualitario: divide igualmente entre todos os itens
 */
function ratearIgualitario(valorTotal: number, itens: ItemRateio[]): ResultadoRateioItem[] {
  if (itens.length === 0) return []

  const valorPorItem = roundHalfUp(valorTotal / itens.length)
  const percentual = roundHalfUp(100 / itens.length)
  const resultados: ResultadoRateioItem[] = []
  let somaRateada = 0

  for (let i = 0; i < itens.length; i++) {
    if (i === itens.length - 1) {
      resultados.push({
        itemId: itens[i].id,
        valor_rateado: Math.max(0, roundHalfUp(valorTotal - somaRateada)),
        percentual,
      })
    } else {
      somaRateada += valorPorItem
      resultados.push({
        itemId: itens[i].id,
        valor_rateado: Math.max(0, valorPorItem),
        percentual,
      })
    }
  }

  return resultados
}

/**
 * Rateio manual: valores ja definidos pelo usuario (apenas valida)
 */
function ratearManual(
  valorTotal: number,
  itens: ItemRateio[],
  valoresManual: Map<string, number>,
  warnings: string[]
): ResultadoRateioItem[] {
  const resultados: ResultadoRateioItem[] = []
  let somaManual = 0

  for (const item of itens) {
    const valor = valoresManual.get(item.id) ?? 0
    if (valor < 0) {
      warnings.push(`Valor negativo ignorado para item ${item.id} — usando 0`)
    }
    const valorFinal = Math.max(0, valor)
    somaManual += valorFinal
    resultados.push({
      itemId: item.id,
      valor_rateado: roundHalfUp(valorFinal),
      percentual: valorTotal > 0 ? roundHalfUp((valorFinal / valorTotal) * 100) : 0,
    })
  }

  const diff = roundHalfUp(Math.abs(somaManual - valorTotal))
  if (diff > 0.01) {
    warnings.push(`Soma manual (${somaManual}) difere do total (${valorTotal}) em ${diff}`)
  }

  return resultados
}

/**
 * Rateio customizado: combinacao ponderada de campos (sem eval)
 *
 * Cada item pode ter pesos_customizados = { peso_liquido: 0.5, valor_cif: 0.5 }
 * O valor ponderado e calculado como: sum(campo_valor * peso)
 * Depois distribui proporcional ao valor ponderado.
 */
function ratearCustomizado(
  valorTotal: number,
  itens: ItemRateio[],
  warnings: string[]
): ResultadoRateioItem[] {
  const CAMPOS_PERMITIDOS: (keyof ItemRateio)[] = [
    'peso_liquido', 'peso_bruto', 'valor_cif', 'valor_fob', 'quantidade', 'valor_ii',
  ]

  const valoresPonderados: number[] = itens.map((item) => {
    const pesos = item.pesos_customizados ?? {}
    let valorPonderado = 0

    for (const [campo, peso] of Object.entries(pesos)) {
      if (!CAMPOS_PERMITIDOS.includes(campo as keyof ItemRateio)) {
        warnings.push(`Campo "${campo}" nao permitido em formula customizada — ignorado`)
        continue
      }
      const valorCampo = Number(item[campo as keyof ItemRateio]) || 0
      const pesoSeguro = Math.max(0, Number(peso) || 0)
      valorPonderado += valorCampo * pesoSeguro
    }

    return Math.max(0, valorPonderado)
  })

  const totalPonderado = valoresPonderados.reduce((s, v) => s + v, 0)

  if (totalPonderado === 0) {
    warnings.push('Soma ponderada customizada e zero — fallback para igualitario')
    return ratearIgualitario(valorTotal, itens)
  }

  const resultados: ResultadoRateioItem[] = []
  let somaRateada = 0

  for (let i = 0; i < itens.length; i++) {
    const percentual = roundHalfUp((valoresPonderados[i] / totalPonderado) * 100)

    if (i === itens.length - 1) {
      const valorRateado = roundHalfUp(valorTotal - somaRateada)
      resultados.push({
        itemId: itens[i].id,
        valor_rateado: Math.max(0, valorRateado),
        percentual,
      })
    } else {
      const valorRateado = roundHalfUp((valoresPonderados[i] / totalPonderado) * valorTotal)
      somaRateada += valorRateado
      resultados.push({
        itemId: itens[i].id,
        valor_rateado: Math.max(0, valorRateado),
        percentual,
      })
    }
  }

  return resultados
}

/**
 * Calcula rateio de uma despesa entre itens da NF
 */
export function calcularRateio(
  metodo: MetodoRateio,
  valorTotal: number,
  itens: ItemRateio[],
  valoresManual?: Map<string, number>
): ResultadoRateio {
  if (valorTotal < 0) {
    return { itens: [], warnings: ['Valor total da despesa nao pode ser negativo'] }
  }

  if (itens.length === 0) {
    return { itens: [], warnings: ['Nenhum item para ratear'] }
  }

  const warnings: string[] = []

  let resultadoItens: ResultadoRateioItem[]

  switch (metodo) {
    case 'PESO_LIQUIDO':
      resultadoItens = ratearProporcional(valorTotal, itens, 'peso_liquido', warnings)
      break
    case 'PESO_BRUTO':
      resultadoItens = ratearProporcional(valorTotal, itens, 'peso_bruto', warnings)
      break
    case 'VALOR_CIF':
      resultadoItens = ratearProporcional(valorTotal, itens, 'valor_cif', warnings)
      break
    case 'VALOR_FOB':
      resultadoItens = ratearProporcional(valorTotal, itens, 'valor_fob', warnings)
      break
    case 'QUANTIDADE':
      resultadoItens = ratearProporcional(valorTotal, itens, 'quantidade', warnings)
      break
    case 'VALOR_II':
      resultadoItens = ratearProporcional(valorTotal, itens, 'valor_ii', warnings)
      break
    case 'IGUALITARIO':
      resultadoItens = ratearIgualitario(valorTotal, itens)
      break
    case 'MANUAL':
      resultadoItens = ratearManual(valorTotal, itens, valoresManual ?? new Map(), warnings)
      break
    case 'CUSTOMIZADO':
      resultadoItens = ratearCustomizado(valorTotal, itens, warnings)
      break
    default: {
      warnings.push(`Metodo "${String(metodo)}" desconhecido — fallback para igualitario`)
      resultadoItens = ratearIgualitario(valorTotal, itens)
    }
  }

  return { itens: resultadoItens, warnings }
}
