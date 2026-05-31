import { describe, expect, it } from 'vitest'
import {
  LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL,
  montarTextoTruncadoExibicao,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/texto-truncado-bid-frete-internacional.js'

describe('montarTextoTruncadoExibicao', () => {
  it('nao trunca texto dentro do limite padrao (50)', () => {
    expect(montarTextoTruncadoExibicao('DESCONSOLIDACAO')).toEqual({
      truncado: false,
      exibicao: 'DESCONSOLIDACAO',
    })
  })

  it('trunca apos o limite padrao', () => {
    const longo = 'A'.repeat(LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL + 3)
    const r = montarTextoTruncadoExibicao(longo)
    expect(r.truncado).toBe(true)
    expect(r.exibicao).toBe(`${'A'.repeat(LIMITE_TRUNCAR_TEXTO_BID_FRETE_INTERNACIONAL)}…`)
  })

  it('respeita limite customizado', () => {
    expect(montarTextoTruncadoExibicao('DESCONSOLIDACAO', 12)).toEqual({
      truncado: true,
      exibicao: 'DESCONSOLIDA…',
    })
  })
})
