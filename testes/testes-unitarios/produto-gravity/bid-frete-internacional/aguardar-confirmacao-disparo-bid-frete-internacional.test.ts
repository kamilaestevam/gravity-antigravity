import { describe, expect, it, vi } from 'vitest'
import { aguardarConfirmacaoDisparoCotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/aguardar-confirmacao-disparo-bid-frete-internacional.js'
import type { Cotacao } from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/types.js'

function cotacaoComDisparo(status: 'PENDENTE' | 'ENVIADO' | 'ERRO_ENVIO'): Cotacao {
  return {
    id_cotacao_bid_frete_internacional: 'cot-1',
    disparo_cotacao_bid_frete_internacional: [
      {
        id_disparo_cotacao_bid_frete_internacional: 'disp-1',
        id_fornecedor_bid_frete_internacional: 'forn-1',
        canal_disparo_cotacao_bid_frete_internacional: 'EMAIL',
        status_disparo_cotacao_bid_frete_internacional: status,
      },
    ],
  } as Cotacao
}

describe('aguardarConfirmacaoDisparoCotacao', () => {
  it('retorna confirmado quando disparo sai de PENDENTE', async () => {
    const buscar = vi
      .fn<Cotacao>()
      .mockResolvedValueOnce(cotacaoComDisparo('PENDENTE'))
      .mockResolvedValueOnce(cotacaoComDisparo('ENVIADO'))

    const resultado = await aguardarConfirmacaoDisparoCotacao('cot-1', buscar, {
      intervaloMs: 1,
      esperaMaximaMs: 500,
    })

    expect(resultado.confirmado).toBe(true)
    expect(resultado.resumo.enviados_ok).toBe(1)
    expect(resultado.falhasConsulta).toBe(0)
  })

  it('não lança quando consultas falham — retorna nao confirmado no timeout', async () => {
    const buscar = vi.fn().mockRejectedValue(new Error('Application failed to respond'))

    const resultado = await aguardarConfirmacaoDisparoCotacao('cot-1', buscar, {
      intervaloMs: 1,
      esperaMaximaMs: 20,
    })

    expect(resultado.confirmado).toBe(false)
    expect(resultado.falhasConsulta).toBeGreaterThan(0)
    expect(resultado.cotacao).toBeNull()
  })
})
