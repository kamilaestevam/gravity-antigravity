import { describe, it, expect } from 'vitest'
import {
  codigosElegiveisSelecaoLocalFornecedorBidFrete,
  codigosOpcaoPortoAeroportoParaPersistencia,
  exigeSelecaoLocalFornecedorRespostaBidFrete,
  mapaRotulosOpcionaisPersistidosCotacaoBidFrete,
  parseCodigosOpcaoPortoAeroportoFromDb,
  parseEntradasOpcaoPortoAeroportoFromDb,
  type ContextoLocaisOpcionaisCotacaoBidFrete,
} from '../../../../servicos-global/produto/bid-frete-internacional/shared/opcao-porto-aeroporto-cotacao-bid-frete-internacional'

const ctxMaritimoComOpcionais: ContextoLocaisOpcionaisCotacaoBidFrete = {
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  porto_origem_cotacao_bid_frete_internacional: 'BRSSZ',
  porto_destino_cotacao_bid_frete_internacional: 'NLRTM',
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: true,
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: ['BRPNG', 'BRSSZ'],
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: true,
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: ['BEANR'],
}

describe('opcao-porto-aeroporto-cotacao-bid-frete-internacional', () => {
  it('parseCodigosOpcaoPortoAeroportoFromDb normaliza JSON e array', () => {
    expect(parseCodigosOpcaoPortoAeroportoFromDb(['BRSSZ', 'BRPNG'])).toEqual(['BRSSZ', 'BRPNG'])
    expect(parseCodigosOpcaoPortoAeroportoFromDb(null)).toEqual([])
    expect(parseCodigosOpcaoPortoAeroportoFromDb('invalido')).toEqual([])
  })

  it('parseEntradasOpcaoPortoAeroportoFromDb aceita objetos com rotulo', () => {
    expect(
      parseEntradasOpcaoPortoAeroportoFromDb([
        'BRSSZ',
        { codigo: 'BRRIO', rotulo: 'BRRIO — Rio de Janeiro, BR' },
      ]),
    ).toEqual([
      'BRSSZ',
      { codigo: 'BRRIO', rotulo: 'BRRIO — Rio de Janeiro, BR' },
    ])
  })

  it('mapaRotulosOpcionaisPersistidosCotacaoBidFrete extrai rotulos do JSON', () => {
    const mapa = mapaRotulosOpcionaisPersistidosCotacaoBidFrete({
      codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: [
        { codigo: 'CNGUA', rotulo: 'CNGUA — Guangzhou, CN' },
      ],
      codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: [
        { codigo: 'BRRIO', rotulo: 'BRRIO — Rio de Janeiro, BR' },
      ],
    })
    expect(mapa.CNGUA).toBe('CNGUA — Guangzhou, CN')
    expect(mapa.BRRIO).toBe('BRRIO — Rio de Janeiro, BR')
  })

  it('codigosOpcaoPortoAeroportoParaPersistencia grava rotulo quando informado', () => {
    expect(
      codigosOpcaoPortoAeroportoParaPersistencia(true, [
        { codigo: 'BRRIO', rotulo: 'BRRIO — Rio de Janeiro, BR' },
        'BRSSZ',
      ]),
    ).toEqual([
      { codigo: 'BRRIO', rotulo: 'BRRIO — Rio de Janeiro, BR' },
      'BRSSZ',
    ])
  })

  it('codigosElegiveis inclui principal e opcionais sem duplicar', () => {
    expect(codigosElegiveisSelecaoLocalFornecedorBidFrete(ctxMaritimoComOpcionais, 'origem')).toEqual([
      'BRSSZ',
      'BRPNG',
    ])
    expect(codigosElegiveisSelecaoLocalFornecedorBidFrete(ctxMaritimoComOpcionais, 'destino')).toEqual([
      'NLRTM',
      'BEANR',
    ])
  })

  it('exigeSelecaoLocalFornecedorRespostaBidFrete só quando há opcionais habilitados', () => {
    expect(exigeSelecaoLocalFornecedorRespostaBidFrete(ctxMaritimoComOpcionais, 'origem')).toBe(true)
    expect(exigeSelecaoLocalFornecedorRespostaBidFrete(ctxMaritimoComOpcionais, 'destino')).toBe(true)
    expect(exigeSelecaoLocalFornecedorRespostaBidFrete({
      ...ctxMaritimoComOpcionais,
      habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: false,
      codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: [],
    }, 'origem')).toBe(false)
  })
})
