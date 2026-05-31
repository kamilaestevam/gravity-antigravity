import { describe, expect, it } from 'vitest'
import {
  formatarDiffAbsolutaMetrica,
  formatarPctDiffMetrica,
  montarComparacaoMetricaSparkTooltip,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/comparacao-metrica-spark-bid-frete-internacional'
import type { BarraComparativoInsight } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/infograficos-fluxo-cotacao-bid-frete-internacional'

const t = ((_key: string, defaultValue?: string) => defaultValue ?? '') as never

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
