import { describe, expect, it } from 'vitest'
import {
  formatarContainersPersistidosParaExibicao,
  parseContainersPersistidos,
  serializarLinhasContainersFcl,
} from '../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/containers-cotacao-bid-frete-internacional'

describe('containers-cotacao-bid-frete-internacional', () => {
  it('serializa uma linha como ISO simples', () => {
    expect(
      serializarLinhasContainersFcl([{ tipo_container: '22G0', quantidade: 2 }]),
    ).toEqual({
      tipo_container_cotacao_bid_frete_internacional: '22G0',
      quantidade_volume_cotacao_bid_frete_internacional: 2,
    })
  })

  it('serializa várias linhas com pipe', () => {
    expect(
      serializarLinhasContainersFcl([
        { tipo_container: '22G0', quantidade: 2 },
        { tipo_container: '45G0', quantidade: 1 },
      ]),
    ).toEqual({
      tipo_container_cotacao_bid_frete_internacional: '22G0:2|45G0:1',
      quantidade_volume_cotacao_bid_frete_internacional: 3,
    })
  })

  it('parse legado ISO + quantidade separada', () => {
    expect(parseContainersPersistidos('22G0', 3)).toEqual([
      { id: 1, tipo_container: '22G0', quantidade: 3 },
    ])
  })

  it('parse multi e formata exibição', () => {
    const texto = formatarContainersPersistidosParaExibicao(
      '22G0:2|45G0:1',
      3,
      (c) => c,
    )
    expect(texto).toBe('2× 22G0 + 1× 45G0')
  })
})
