import { describe, expect, it } from 'vitest'
import {
  calcularDivergenciasPedido,
  mesclarDivergenciasPreservandoNcmPedido,
  obterNcmExibicaoPedido,
} from '../../../servicos-global/produto/pedido/shared/pedidoDivergencias'

describe('calcularDivergenciasPedido — referencia_importador / referencia_exportador', () => {
  it('marca divergente quando pedido difere do único valor preenchido nos itens', () => {
    const divergencias = calcularDivergenciasPedido(
      [{ referencia_importador: 'cde' }],
      { referencia_importador: 'abc' },
    )
    expect(divergencias.referencia_importador_divergente).toBe(true)
  })

  it('não marca divergente quando pedido e itens concordam', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { referencia_importador: 'abc' },
        { referencia_importador: 'abc' },
      ],
      { referencia_importador: 'abc' },
    )
    expect(divergencias.referencia_importador_divergente).toBe(false)
  })

  it('marca divergente quando itens têm valores distintos entre si', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { referencia_exportador: 'REF-A' },
        { referencia_exportador: 'REF-B' },
      ],
      { referencia_exportador: 'REF-A' },
    )
    expect(divergencias.referencia_exportador_divergente).toBe(true)
  })

  it('não marca divergente quando pedido e itens estão vazios', () => {
    const divergencias = calcularDivergenciasPedido(
      [{ referencia_importador: null }, { referencia_importador: '' }],
      { referencia_importador: null },
    )
    expect(divergencias.referencia_importador_divergente).toBe(false)
  })
})

describe('calcularDivergenciasPedido — NCM', () => {
  it('não marca ncm_divergente quando itens têm NCMs distintos', () => {
    const divergencias = calcularDivergenciasPedido(
      [
        { ncm: '8471.30.19' },
        { ncm: '8471.30.20' },
      ],
      {},
    )
    expect(divergencias.ncm_divergente).toBe(false)
    expect(divergencias.ncms_distintos_count).toBe(2)
    expect(divergencias.ncm_valor_unico).toBeNull()
  })

  it('preenche ncm_valor_unico quando todos os itens coincidem', () => {
    const divergencias = calcularDivergenciasPedido(
      [{ ncm: '8471.30.19' }, { ncm: '8471.30.19' }],
      {},
    )
    expect(divergencias.ncm_divergente).toBe(false)
    expect(divergencias.ncm_valor_unico).toBe('8471.30.19')
  })

  it('obterNcmExibicaoPedido prioriza valor canônico do pedido sobre itens', () => {
    expect(
      obterNcmExibicaoPedido({ ncm: '0302.89.34', ncm_valor_unico: '8471.30.19' }),
    ).toBe('0302.89.34')
  })

  it('mesclarDivergenciasPreservandoNcmPedido mantém ncm_valor_unico do pedido', () => {
    const mesclado = mesclarDivergenciasPreservandoNcmPedido(
      { ncm: '0302.89.34' },
      { ncm_valor_unico: '8471.30.19', ncm_divergente: false },
    )
    expect(mesclado.ncm_valor_unico).toBe('0302.89.34')
  })
})
