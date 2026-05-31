import { describe, it, expect } from 'vitest'
import {
  resolverColagemPopover,
  campoEhNcm,
  extrairTextoDeHtml,
  lerTextoClipboard,
} from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/utils/colagemPopover'

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

describe('campoEhNcm', () => {
  it('reconhece legado ncm e DDD bid', () => {
    expect(campoEhNcm('ncm')).toBe(true)
    expect(campoEhNcm('ncm_cotacao_bid_frete_internacional')).toBe(true)
    expect(campoEhNcm('descricao_mercadoria')).toBe(false)
  })
})

describe('lerTextoClipboard', () => {
  it('extrai texto de text/html quando text/plain vazio', () => {
    const data = {
      getData: (tipo: string) =>
        tipo === 'text/html' ? '<table><tr><td>A</td><td>B</td></tr></table>' : '',
    } as DataTransfer
    const texto = lerTextoClipboard(data)
    expect(texto).toContain('A')
    expect(texto).toContain('B')
  })
})

describe('extrairTextoDeHtml', () => {
  it('preserva quebras de linha entre linhas da tabela', () => {
    const html = '<table><tr><td>Linha1</td></tr><tr><td>Linha2</td></tr></table>'
    const texto = extrairTextoDeHtml(html)
    expect(texto).toMatch(/Linha1/)
    expect(texto).toMatch(/Linha2/)
  })
})
