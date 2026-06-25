import { describe, expect, it } from 'vitest'
import {
  formatarDiffAbsolutaMetrica,
  formatarPctDiffMetrica,
  montarComparacaoMetricaSparkTooltip,
  montarLinhasAnaliseConcorrentesTooltip,
  montarRotuloBarraMetricaRanking,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/comparacao-metrica-spark-bid-frete-internacional'
import type { BarraComparativoInsight } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'

const t = ((_key: string, defaultValue?: string, opts?: Record<string, unknown>) => {
  if (opts == null) return defaultValue ?? ''
  return (defaultValue ?? '').replace(/\{\{(\w+)\}\}/g, (_, k: string) => String(opts[k] ?? ''))
}) as never

function barra(partial: Partial<BarraComparativoInsight> & Pick<BarraComparativoInsight, 'valor' | 'fornecedor'>): BarraComparativoInsight {
  return {
    destaque: false,
    ...partial,
  }
}

describe('formatarPctDiffMetrica', () => {
  it('formata percentual com sinal', () => {
    expect(formatarPctDiffMetrica(5, 30)).toBe('+16,7%')
    expect(formatarPctDiffMetrica(-5, 30)).toBe('−16,7%')
  })

  it('retorna null quando base é zero', () => {
    expect(formatarPctDiffMetrica(3, 0)).toBeNull()
  })
})

describe('formatarDiffAbsolutaMetrica', () => {
  const fmtDias = (v: number) => `${v} dias`

  it('inclui sinal na diferença absoluta', () => {
    expect(formatarDiffAbsolutaMetrica(5, fmtDias)).toBe('+5 dias')
    expect(formatarDiffAbsolutaMetrica(-3, fmtDias)).toBe('−3 dias')
  })
})

describe('montarComparacaoMetricaSparkTooltip', () => {
  const fmtDias = (v: number) => `${v} dias`
  const barras = [
    barra({ valor: 30, fornecedor: 'NOVO AGENTE DE CARGA', destaque: true }),
    barra({ valor: 20, fornecedor: 'TRANSCAPRI' }),
  ]

  it('barra do card compara com média das outras cotações', () => {
    const result = montarComparacaoMetricaSparkTooltip(
      barras[0],
      barras,
      30,
      false,
      fmtDias,
      t,
    )

    expect(result.textoDiferenca).toBe('+10 dias (+50,0%)')
    expect(result.valorReferenciaFormatado).toBe('20 dias')
    expect(result.classe).toBe('melhor')
  })

  it('barra concorrente compara com proposta do card incluindo %', () => {
    const result = montarComparacaoMetricaSparkTooltip(
      barras[1],
      barras,
      30,
      false,
      fmtDias,
      t,
    )

    expect(result.textoDiferenca).toBe('−10 dias (−33,3%)')
    expect(result.nomeReferencia).toBe('NOVO AGENTE DE CARGA')
    expect(result.classe).toBe('pior')
  })

  it('transit time (melhor menor) classifica corretamente', () => {
    const transitBarras = [
      barra({ valor: 10, fornecedor: 'A', destaque: true }),
      barra({ valor: 20, fornecedor: 'B' }),
    ]

    const result = montarComparacaoMetricaSparkTooltip(
      transitBarras[1],
      transitBarras,
      10,
      true,
      fmtDias,
      t,
    )

    expect(result.textoDiferenca).toBe('+10 dias (+100,0%)')
    expect(result.classe).toBe('pior')
  })
})

describe('montarLinhasAnaliseConcorrentesTooltip', () => {
  const fmtDias = (v: number) => `${v} dias`

  it('lista cada concorrente com valor da cotação em hover e % semântico', () => {
    const barras = [
      barra({ valor: 10, fornecedor: 'Agente ABC', destaque: true }),
      barra({ valor: 20, fornecedor: 'TRANSDATA' }),
    ]

    const linhas = montarLinhasAnaliseConcorrentesTooltip(
      barras[1],
      barras,
      true,
      fmtDias,
      t,
      'transit_time',
    )

    expect(linhas).toHaveLength(1)
    expect(linhas[0].fornecedor).toBe('Agente ABC')
    expect(linhas[0].textoLinha).toBe('20 dias — 100% mais lento que Agente ABC')
    expect(linhas[0].classe).toBe('pior')
  })

  it('formata dias com zero à esquerda na linha de análise', () => {
    const barras = [
      barra({ valor: 10, fornecedor: 'Agente ABC' }),
      barra({ valor: 5, fornecedor: 'TRANSDATA' }),
    ]

    const linhas = montarLinhasAnaliseConcorrentesTooltip(
      barras[1],
      barras,
      true,
      fmtDias,
      t,
      'transit_time',
    )

    expect(linhas[0].textoLinha).toBe('05 dias — 50% mais rápido que Agente ABC')
    expect(linhas[0].classe).toBe('melhor')
  })
})

describe('montarRotuloBarraMetricaRanking', () => {
  const barras = [
    barra({ valor: 120, fornecedor: 'TRANSCAPRI', destaque: true }),
    barra({ valor: 150, fornecedor: 'OUTRO' }),
  ]

  it('retorna Melhor quando valor iguala o melhor da métrica', () => {
    const r = montarRotuloBarraMetricaRanking({
      valorAtual: 120,
      barras,
      melhorMenor: true,
      t,
    })
    expect(r.texto).toBe('Melhor')
    expect(r.classe).toBe('melhor')
  })

  it('retorna delta vs melhor quando pior que o líder', () => {
    const r = montarRotuloBarraMetricaRanking({
      valorAtual: 150,
      barras,
      melhorMenor: true,
      t,
    })
    expect(r.texto).toBe('+25,0% vs melhor')
    expect(r.classe).toBe('pior')
  })

  it('usa rank local quando não há barras comparativas', () => {
    expect(
      montarRotuloBarraMetricaRanking({
        valorAtual: 10,
        barras: [],
        melhorMenor: true,
        t,
        rankLocal: 2,
      }).texto,
    ).toBe('2º')
  })
})
