import type { TFunction } from 'i18next'
import type { BarraComparativoInsight } from './infograficos-fluxo-cotacao-bid-frete-internacional'

export type ClasseComparacaoMetricaSpark = 'melhor' | 'pior' | 'igual'

export type TipoMetricaComparativaBidFrete =
  | 'transit_time'
  | 'frete'
  | 'taxas'
  | 'free_time'
  | 'escala'
  | 'generico'

export interface LinhaAnaliseConcorrenteTooltip {
  fornecedor: string
  textoLinha: string
  classe: ClasseComparacaoMetricaSpark
  /** Posição normalizada (0–100) no mini-gráfico da linha. */
  posicaoAtualPct: number
  posicaoConcorrentePct: number
}

export interface ComparacaoMetricaSparkTooltip {
  classe: ClasseComparacaoMetricaSpark
  tituloSecao: string
  rotuloReferencia: string
  nomeReferencia: string
  valorReferenciaFormatado: string
  textoDiferenca: string
  textoLegenda: string
}

export function classificarDiffMetricaSpark(
  melhorMenor: boolean,
  valor: number,
  referencia: number,
): ClasseComparacaoMetricaSpark {
  if (valor === referencia) return 'igual'
  if (melhorMenor) return valor < referencia ? 'melhor' : 'pior'
  return valor > referencia ? 'melhor' : 'pior'
}

export function formatarPctDiffMetrica(delta: number, base: number): string | null {
  if (base === 0) return null
  const pct = (delta / base) * 100
  const formatado = Math.abs(pct).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
  if (pct > 0) return `+${formatado}%`
  if (pct < 0) return `−${formatado}%`
  return '0%'
}

export function formatarDiffAbsolutaMetrica(
  delta: number,
  formatarValor: (valor: number) => string,
): string {
  if (delta === 0) {
    return formatarValor(0)
  }
  const sinal = delta > 0 ? '+' : '−'
  return `${sinal}${formatarValor(Math.abs(delta))}`
}

export function inferirTipoMetricaComparativaFromRotulo(
  rotuloMetrica: string,
): TipoMetricaComparativaBidFrete {
  const n = rotuloMetrica
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
  if (n.includes('transit') || n.includes('transito')) return 'transit_time'
  if (n.includes('free')) return 'free_time'
  if (n.includes('escala')) return 'escala'
  if (n.includes('taxa')) return 'taxas'
  if (n.includes('frete') || n.includes('preco')) return 'frete'
  return 'generico'
}

function formatarPctAbsolutoLegenda(delta: number, base: number): string | null {
  if (base === 0) return null
  const pct = Math.abs((delta / base) * 100)
  return `${pct.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}%`
}

function formatarValorExibicaoAnalise(valor: number, formatarValor: (v: number) => string): string {
  const fmt = formatarValor(valor)
  return fmt.replace(/^(\d+)\s*(dias?)\b/i, (_, n: string, unidade: string) => {
    const pad = n.padStart(2, '0')
    return `${pad} ${unidade.toLowerCase() === 'dia' ? 'dias' : unidade}`
  })
}

export function montarTextoLegendaComparacaoMetrica(
  valorAtual: number,
  valorReferencia: number,
  nomeReferencia: string,
  melhorMenor: boolean,
  tipo: TipoMetricaComparativaBidFrete,
  t: TFunction,
): { classe: ClasseComparacaoMetricaSpark; textoLegenda: string } {
  const classe = classificarDiffMetricaSpark(melhorMenor, valorAtual, valorReferencia)

  if (valorAtual === valorReferencia) {
    return {
      classe: 'igual',
      textoLegenda: t('bidfrete.detalhe_cotacao.spark_diff_igual_a', 'Igual a {{alvo}}', {
        alvo: nomeReferencia,
      }),
    }
  }

  const pct = formatarPctAbsolutoLegenda(valorAtual - valorReferencia, valorReferencia)
  const pctFmt = pct ?? formatarDiffAbsolutaMetrica(
    valorAtual - valorReferencia,
    (v) => String(v),
  )

  if (classe === 'pior') {
    switch (tipo) {
      case 'transit_time':
        return {
          classe,
          textoLegenda: t(
            'bidfrete.detalhe_cotacao.spark_pct_mais_lento_que',
            '{{pct}} mais lento que {{nome}}',
            { pct: pctFmt, nome: nomeReferencia },
          ),
        }
      case 'frete':
      case 'taxas':
        return {
          classe,
          textoLegenda: t(
            'bidfrete.detalhe_cotacao.spark_pct_mais_caro_que',
            '{{pct}} mais caro que {{nome}}',
            { pct: pctFmt, nome: nomeReferencia },
          ),
        }
      case 'free_time':
        return {
          classe,
          textoLegenda: t(
            'bidfrete.detalhe_cotacao.spark_pct_menos_free_time_que',
            '{{pct}} menos free time que {{nome}}',
            { pct: pctFmt, nome: nomeReferencia },
          ),
        }
      case 'escala':
        return {
          classe,
          textoLegenda: t(
            'bidfrete.detalhe_cotacao.spark_pct_mais_escalas_que',
            '{{pct}} mais escalas que {{nome}}',
            { pct: pctFmt, nome: nomeReferencia },
          ),
        }
      default:
        return {
          classe,
          textoLegenda: t(
            'bidfrete.detalhe_cotacao.spark_pct_pior_que',
            '{{pct}} pior que {{nome}}',
            { pct: pctFmt, nome: nomeReferencia },
          ),
        }
    }
  }

  switch (tipo) {
    case 'transit_time':
      return {
        classe,
        textoLegenda: t(
          'bidfrete.detalhe_cotacao.spark_pct_mais_rapido_que',
          '{{pct}} mais rápido que {{nome}}',
          { pct: pctFmt, nome: nomeReferencia },
        ),
      }
    case 'frete':
    case 'taxas':
      return {
        classe,
        textoLegenda: t(
          'bidfrete.detalhe_cotacao.spark_pct_mais_barato_que',
          '{{pct}} mais barato que {{nome}}',
          { pct: pctFmt, nome: nomeReferencia },
        ),
      }
    case 'free_time':
      return {
        classe,
        textoLegenda: t(
          'bidfrete.detalhe_cotacao.spark_pct_mais_free_time_que',
          '{{pct}} mais free time que {{nome}}',
          { pct: pctFmt, nome: nomeReferencia },
        ),
      }
    case 'escala':
      return {
        classe,
        textoLegenda: t(
          'bidfrete.detalhe_cotacao.spark_pct_menos_escalas_que',
          '{{pct}} menos escalas que {{nome}}',
          { pct: pctFmt, nome: nomeReferencia },
        ),
      }
    default:
      return {
        classe,
        textoLegenda: t(
          'bidfrete.detalhe_cotacao.spark_pct_melhor_que',
          '{{pct}} melhor que {{nome}}',
          { pct: pctFmt, nome: nomeReferencia },
        ),
      }
  }
}

function posicaoNormalizadaEscala(valor: number, min: number, max: number): number {
  if (max === min) return 50
  return ((valor - min) / (max - min)) * 100
}

/** Lista de comparações da cotação em hover vs cada outra resposta (somente tooltip). */
export function montarLinhasAnaliseConcorrentesTooltip(
  barraAtual: BarraComparativoInsight,
  barras: BarraComparativoInsight[],
  melhorMenor: boolean,
  formatarValor: (valor: number) => string,
  t: TFunction,
  tipoMetrica: TipoMetricaComparativaBidFrete,
): LinhaAnaliseConcorrenteTooltip[] {
  const concorrentes = barras.filter((b) => b.fornecedor !== barraAtual.fornecedor)
  if (concorrentes.length === 0) return []

  const valores = barras.map((b) => b.valor)
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const valorAtualFmt = formatarValorExibicaoAnalise(barraAtual.valor, formatarValor)

  return concorrentes.map((concorrente) => {
    const { classe, textoLegenda } = montarTextoLegendaComparacaoMetrica(
      barraAtual.valor,
      concorrente.valor,
      concorrente.fornecedor,
      melhorMenor,
      tipoMetrica,
      t,
    )
    return {
      fornecedor: concorrente.fornecedor,
      textoLinha: `${valorAtualFmt} — ${textoLegenda}`,
      classe,
      posicaoAtualPct: posicaoNormalizadaEscala(barraAtual.valor, min, max),
      posicaoConcorrentePct: posicaoNormalizadaEscala(concorrente.valor, min, max),
    }
  })
}

function mediaBarras(barras: BarraComparativoInsight[]): number | null {
  if (barras.length === 0) return null
  return barras.reduce((acc, barra) => acc + barra.valor, 0) / barras.length
}

function montarDiffComBase(
  valorBarra: number,
  base: number,
  melhorMenor: boolean,
  formatarValor: (valor: number) => string,
  t: TFunction,
  alvoLegenda: string,
): Pick<ComparacaoMetricaSparkTooltip, 'classe' | 'textoDiferenca' | 'textoLegenda'> {
  const delta = valorBarra - base
  const classe = classificarDiffMetricaSpark(melhorMenor, valorBarra, base)

  if (delta === 0) {
    return {
      classe: 'igual',
      textoDiferenca: t('bidfrete.detalhe_cotacao.spark_diff_igual', 'Igual'),
      textoLegenda: t('bidfrete.detalhe_cotacao.spark_diff_igual_a', 'Igual a {{alvo}}', { alvo: alvoLegenda }),
    }
  }

  const diffAbs = formatarDiffAbsolutaMetrica(delta, formatarValor)
  const pct = formatarPctDiffMetrica(delta, base)
  const textoDiferenca = pct != null ? `${diffAbs} (${pct})` : diffAbs

  const maiorMenor =
    delta > 0
      ? t('bidfrete.detalhe_cotacao.spark_maior_que', 'maior')
      : t('bidfrete.detalhe_cotacao.spark_menor_que', 'menor')

  return {
    classe,
    textoDiferenca,
    textoLegenda: t(
      'bidfrete.detalhe_cotacao.spark_diff_legenda',
      '{{diff}} {{maior_menor}} que {{alvo}}',
      { diff: pct ?? diffAbs, maior_menor: maiorMenor, alvo: alvoLegenda },
    ),
  }
}

export function montarComparacaoMetricaSparkTooltip(
  barra: BarraComparativoInsight,
  barras: BarraComparativoInsight[],
  valorReferenciaCard: number,
  melhorMenor: boolean,
  formatarValor: (valor: number) => string,
  t: TFunction,
): ComparacaoMetricaSparkTooltip {
  const barraReferenciaCard = barras.find((b) => b.destaque) ?? barras[0]
  const nomeCard = barraReferenciaCard?.fornecedor ?? '—'
  const alvoCard = t('bidfrete.detalhe_cotacao.spark_alvo_proposta_card', 'a proposta do card')
  const alvoOutras = t('bidfrete.detalhe_cotacao.spark_alvo_outras_cotacoes', 'as outras cotações')

  if (barra.destaque) {
    const outras = barras.filter((b) => !b.destaque)
    const mediaOutras = mediaBarras(outras)

    if (mediaOutras == null) {
      return {
        classe: 'igual',
        tituloSecao: t('bidfrete.detalhe_cotacao.spark_tooltip_vs_outras', 'Vs outras cotações'),
        rotuloReferencia: t('bidfrete.detalhe_cotacao.spark_tooltip_referencia', 'Referência'),
        nomeReferencia: t('bidfrete.detalhe_cotacao.spark_esta_proposta', 'Esta proposta'),
        valorReferenciaFormatado: formatarValor(barra.valor),
        textoDiferenca: t('bidfrete.detalhe_cotacao.spark_esta_proposta', 'Esta proposta'),
        textoLegenda: '',
      }
    }

    const diff = montarDiffComBase(barra.valor, mediaOutras, melhorMenor, formatarValor, t, alvoOutras)

    return {
      ...diff,
      tituloSecao: t('bidfrete.detalhe_cotacao.spark_tooltip_vs_outras', 'Vs outras cotações'),
      rotuloReferencia: t('bidfrete.detalhe_cotacao.spark_tooltip_media_outras', 'Média das outras'),
      nomeReferencia: t('bidfrete.detalhe_cotacao.spark_tooltip_n_propostas', '{{n}} proposta(s)', {
        n: outras.length,
      }),
      valorReferenciaFormatado: formatarValor(mediaOutras),
    }
  }

  const diff = montarDiffComBase(barra.valor, valorReferenciaCard, melhorMenor, formatarValor, t, alvoCard)

  return {
    ...diff,
    tituloSecao: t('bidfrete.detalhe_cotacao.spark_tooltip_vs_referencia', 'Vs proposta do card'),
    rotuloReferencia: t('bidfrete.detalhe_cotacao.spark_tooltip_referencia', 'Referência'),
    nomeReferencia: nomeCard,
    valorReferenciaFormatado: formatarValor(valorReferenciaCard),
  }
}

export interface RotuloBarraMetricaRanking {
  texto: string
  classe: ClasseComparacaoMetricaSpark
}

export function valorMelhorEntreBarras(
  barras: BarraComparativoInsight[],
  melhorMenor: boolean,
): number {
  if (barras.length === 0) return 0
  const valores = barras.map((b) => b.valor)
  return melhorMenor ? Math.min(...valores) : Math.max(...valores)
}

/** Rótulo da barra no ranking (combate): Melhor ou delta vs melhor — sem % de preenchimento. */
export function montarRotuloBarraMetricaRanking(params: {
  valorAtual: number
  barras: BarraComparativoInsight[]
  melhorMenor: boolean
  t: TFunction
  rankLocal?: number
  /** Quando não há barras comparativas (ex.: preço total vs 1º). */
  percentualAcimaDoMelhor?: number | null
}): RotuloBarraMetricaRanking {
  const {
    valorAtual,
    barras,
    melhorMenor,
    t,
    rankLocal,
    percentualAcimaDoMelhor,
  } = params

  if (barras.length >= 2) {
    const melhorValor = valorMelhorEntreBarras(barras, melhorMenor)
    const classe = classificarDiffMetricaSpark(melhorMenor, valorAtual, melhorValor)
    if (valorAtual === melhorValor) {
      return {
        texto: t('bidfrete.detalhe_cotacao.barra_metrica_melhor', 'Melhor'),
        classe: 'melhor',
      }
    }
    const deltaPct = formatarPctDiffMetrica(valorAtual - melhorValor, melhorValor)
    const delta = deltaPct ?? formatarDiffAbsolutaMetrica(
      valorAtual - melhorValor,
      (v) => String(v),
    )
    return {
      texto: t(
        'bidfrete.detalhe_cotacao.barra_metrica_delta_vs_melhor',
        '{{delta}} vs melhor',
        { delta },
      ),
      classe,
    }
  }

  if (percentualAcimaDoMelhor != null) {
    if (Math.abs(percentualAcimaDoMelhor) < 0.05) {
      return {
        texto: t('bidfrete.detalhe_cotacao.barra_metrica_melhor', 'Melhor'),
        classe: 'melhor',
      }
    }
    const pct = percentualAcimaDoMelhor.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })
    const delta = percentualAcimaDoMelhor > 0 ? `+${pct}%` : `−${pct}%`
    return {
      texto: t(
        'bidfrete.detalhe_cotacao.barra_metrica_delta_vs_melhor',
        '{{delta}} vs melhor',
        { delta },
      ),
      classe: percentualAcimaDoMelhor > 0 ? 'pior' : 'melhor',
    }
  }

  if (rankLocal != null && rankLocal > 0) {
    if (rankLocal === 1) {
      return {
        texto: t('bidfrete.detalhe_cotacao.barra_metrica_melhor', 'Melhor'),
        classe: 'melhor',
      }
    }
    return {
      texto: t('bidfrete.detalhe_cotacao.barra_metrica_colocacao', '{{n}}º', { n: rankLocal }),
      classe: rankLocal <= 2 ? 'igual' : 'pior',
    }
  }

  return { texto: '—', classe: 'igual' }
}
