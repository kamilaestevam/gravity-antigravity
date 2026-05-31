import { describe, expect, it } from 'vitest'
import { isColunaSomenteLeituraCompleta } from '../../../servicos-global/produto/pedido/client/src/shared/columnBehaviorConfig'

describe('isColunaSomenteLeituraCompleta (Pedido)', () => {
  it('status: item editável → coluna não é somente leitura completa', () => {
    expect(isColunaSomenteLeituraCompleta('status')).toBe(false)
  })

  it('valor_total_pedido: item editável → coluna normal', () => {
    expect(isColunaSomenteLeituraCompleta('valor_total_pedido')).toBe(false)
  })

  it('pais_exportador: bloqueado nos dois níveis', () => {
    expect(isColunaSomenteLeituraCompleta('pais_exportador')).toBe(true)
  })

  it('porto_origem: pedido editável, item não → coluna normal', () => {
    expect(isColunaSomenteLeituraCompleta('porto_origem')).toBe(false)
  })
})
