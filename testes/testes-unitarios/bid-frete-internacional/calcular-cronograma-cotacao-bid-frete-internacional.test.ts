import { describe, it, expect } from 'vitest'
import {
  calcularDatasDerivadasCronogramaCotacao,
  cotacaoPermiteEditarPrazoResposta,
  inputDatetimeLocalParaIso,
  isoParaInputDatetimeLocal,
} from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/calcular-cronograma-cotacao-bid-frete-internacional'
import type { DisparoCotacaoBidFreteInternacional } from '../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types'

function disparoMock(
  envio: string | null,
  resposta: string | null,
): DisparoCotacaoBidFreteInternacional {
  return {
    id_disparo_cotacao_bid_frete_internacional: 'disp-1',
    data_envio_disparo_cotacao_bid_frete_internacional: envio,
    data_resposta_disparo_cotacao_bid_frete_internacional: resposta,
  } as DisparoCotacaoBidFreteInternacional
}

describe('calcularDatasDerivadasCronogramaCotacao', () => {
  it('retorna null quando não há disparos com datas', () => {
    expect(calcularDatasDerivadasCronogramaCotacao([])).toEqual({
      data_primeiro_envio_disparo: null,
      data_ultima_resposta_disparo: null,
    })
  })

  it('agrega primeiro envio e última resposta entre disparos', () => {
    const derivadas = calcularDatasDerivadasCronogramaCotacao([
      disparoMock('2026-05-10T10:00:00.000Z', '2026-05-12T08:00:00.000Z'),
      disparoMock('2026-05-08T12:00:00.000Z', '2026-05-15T18:00:00.000Z'),
    ])

    expect(derivadas.data_primeiro_envio_disparo).toBe('2026-05-08T12:00:00.000Z')
    expect(derivadas.data_ultima_resposta_disparo).toBe('2026-05-15T18:00:00.000Z')
  })
})

describe('cotacaoPermiteEditarPrazoResposta', () => {
  it('permite edição em status abertos', () => {
    expect(cotacaoPermiteEditarPrazoResposta('RASCUNHO')).toBe(true)
    expect(cotacaoPermiteEditarPrazoResposta('EM_COTACAO')).toBe(true)
  })

  it('bloqueia edição após aprovação ou cancelamento', () => {
    expect(cotacaoPermiteEditarPrazoResposta('APROVADA')).toBe(false)
    expect(cotacaoPermiteEditarPrazoResposta('CANCELADA')).toBe(false)
  })
})

describe('conversão datetime-local', () => {
  it('converte ISO para input datetime-local e de volta', () => {
    const iso = '2026-05-20T15:30:00.000Z'
    const local = isoParaInputDatetimeLocal(iso)
    expect(local).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    expect(inputDatetimeLocalParaIso(local)).toBe(iso)
  })

  it('retorna vazio para ISO inválido', () => {
    expect(isoParaInputDatetimeLocal('invalido')).toBe('')
    expect(inputDatetimeLocalParaIso('')).toBeNull()
  })
})
