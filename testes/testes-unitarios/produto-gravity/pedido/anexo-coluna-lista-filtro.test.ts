import { describe, expect, it } from 'vitest'
import { filtrarAnexosPorColuna } from '../../../../servicos-global/produto/pedido/client/src/shared/anexoColunaLista'

describe('filtrarAnexosPorColuna', () => {
  const base = [
    { id: '1', categoria: 'pedido' },
    { id: '2', categoria: 'anexo_pedido' },
    { id: '3', categoria: 'proforma' },
    { id: '4', categoria: undefined },
    { id: '5', categoria: 'lpco' },
  ]

  it('inclui categoria atual da coluna', () => {
    expect(filtrarAnexosPorColuna(base, 'pedido').map(a => a.id)).toEqual(['1', '2'])
  })

  it('exclui categorias de outras colunas e sem categoria', () => {
    expect(filtrarAnexosPorColuna(base, 'proforma').map(a => a.id)).toEqual(['3'])
    expect(filtrarAnexosPorColuna(base, 'lpco').map(a => a.id)).toEqual(['5'])
  })
})
