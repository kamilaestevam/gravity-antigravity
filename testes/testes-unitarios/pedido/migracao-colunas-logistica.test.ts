import { describe, expect, it } from 'vitest'
import {
  inserirBlocoColunasFaltantes,
  reordenarBlocoColunas,
} from '../../../servicos-global/produto/pedido/client/src/shared/migracaoColunas'
import { CAMPOS_LOGISTICA_PEDIDO } from '../../../servicos-global/produto/pedido/shared/camposLogisticaPedido'

describe('migracaoColunas — bloco logística Pedido', () => {
  it('inserirBlocoColunasFaltantes adiciona colunas após incoterm na ordem SSOT', () => {
    const visiveis = ['numero_pedido', 'incoterm', 'ncm']
    const { resultado, mudou } = inserirBlocoColunasFaltantes(
      visiveis,
      CAMPOS_LOGISTICA_PEDIDO,
      'incoterm',
    )

    expect(mudou).toBe(true)
    expect(resultado).toEqual([
      'numero_pedido',
      'incoterm',
      ...CAMPOS_LOGISTICA_PEDIDO,
      'ncm',
    ])
  })

  it('inserirBlocoColunasFaltantes é idempotente quando bloco já existe', () => {
    const visiveis = ['incoterm', ...CAMPOS_LOGISTICA_PEDIDO, 'ncm']
    const { resultado, mudou } = inserirBlocoColunasFaltantes(
      visiveis,
      CAMPOS_LOGISTICA_PEDIDO,
      'incoterm',
    )

    expect(mudou).toBe(false)
    expect(resultado).toEqual(visiveis)
  })

  it('reordenarBlocoColunas corrige ordem invertida do bloco logística', () => {
    const invertido = [
      'incoterm',
      'aeroporto_destino',
      'porto_origem',
      'local_de_destino',
      'ncm',
    ]
    const { resultado, mudou } = reordenarBlocoColunas(invertido, CAMPOS_LOGISTICA_PEDIDO)

    expect(mudou).toBe(true)
    expect(resultado).toEqual([
      'incoterm',
      'porto_origem',
      'local_de_destino',
      'aeroporto_destino',
      'ncm',
    ])
  })
})
