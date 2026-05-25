import { describe, it, expect } from 'vitest'
import { resolverColagemPopover } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/utils/colagemPopover'

describe('resolverColagemPopover', () => {
  it('texto livre multi-linha cola inteiro numa célula (descrição item)', () => {
    const texto = 'Placa de circuito\nimpresso multicamada 6L FR4'
    const r = resolverColagemPopover(texto, { textoLivre: true })
    expect(r).toEqual({
      tipo: 'aplicar',
      valor: 'Placa de circuito\nimpresso multicamada 6L FR4',
    })
  })

  it('ref exportador curta continua linha única', () => {
    const r = resolverColagemPopover('REF-EXP-ITEM-001', { textoLivre: true })
    expect(r).toEqual({ tipo: 'aplicar', valor: 'REF-EXP-ITEM-001' })
  })

  it('campo numérico multi-linha aciona smart paste', () => {
    const r = resolverColagemPopover('10\n20\n30', { textoLivre: false })
    expect(r).toEqual({ tipo: 'smart_paste', linhas: ['10', '20', '30'] })
  })

  it('clipboard vazio retorna null', () => {
    expect(resolverColagemPopover('   \n  ', { textoLivre: true })).toBeNull()
  })
})
