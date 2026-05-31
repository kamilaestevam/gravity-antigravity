import type { TFunction } from 'i18next'
import type { BarraComparativoInsight } from './infograficos-fluxo-cotacao-bid-frete-internacional'

export type ClasseComparacaoMetricaSpark = 'melhor' | 'pior' | 'igual'

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
