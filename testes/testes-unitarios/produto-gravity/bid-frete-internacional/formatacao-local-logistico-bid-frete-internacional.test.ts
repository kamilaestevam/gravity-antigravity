import { describe, expect, it } from 'vitest'
import {
  formatarRotuloLocalLogistico,
  formatarRotaExibicaoCotacao,
  normalizarTextoExibicaoLocalLogistico,
  normalizarTextoPontoRota,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/formatacao-local-logistico-bid-frete-internacional.js'

describe('formatacao-local-logistico-bid-frete-internacional', () => {
  it('formatarRotuloLocalLogistico nao duplica sigla quando nome ja contem (EZE)', () => {
    expect(formatarRotuloLocalLogistico('Buenos Aires Ezeiza (EZE)', 'EZE')).toBe(
      'Buenos Aires Ezeiza (EZE)',
    )
  })

  it('formatarRotuloLocalLogistico adiciona sigla quando ausente no nome', () => {
    expect(formatarRotuloLocalLogistico('Ezeiza (Buenos Aires)', 'EZE')).toBe(
      'Ezeiza (Buenos Aires) (EZE)',
    )
  })

  it('normalizarTextoPontoRota remove sufixos repetidos da mesma sigla', () => {
    const r = normalizarTextoPontoRota('Buenos Aires Ezeiza (EZE) (EZE)', 'EZE')
    expect(r).toEqual({ titulo: 'Buenos Aires Ezeiza', sigla: 'EZE' })
  })

  it('normalizarTextoExibicaoLocalLogistico corrige texto persistido com sigla duplicada', () => {
    expect(
      normalizarTextoExibicaoLocalLogistico('Buenos Aires Ezeiza (EZE) (EZE)'),
    ).toBe('Buenos Aires Ezeiza (EZE)')
  })

  it('formatarRotaExibicaoCotacao normaliza origem e destino', () => {
    expect(
      formatarRotaExibicaoCotacao(
        'Buenos Aires Ezeiza (EZE) (EZE)',
        'Buenos Aires Ezeiza (EZE) (EZE)',
      ),
    ).toBe('Buenos Aires Ezeiza (EZE) → Buenos Aires Ezeiza (EZE)')
  })
})
