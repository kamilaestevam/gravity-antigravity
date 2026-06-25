import { describe, expect, it } from 'vitest'
import {
  filtrarDadosMapaInsightsBidFreteInternacional,
  filtrarTerminaisMapaInsightsPorBusca,
  inferirTipoOperacaoRotaMapa,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/filtrar-dados-mapa-insights-bid-frete-internacional'
import type {
  ArcRouteBidFrete,
  MapPinBidFrete,
} from '../../../../../servicos-global/produto/bid-frete-internacional/client/src/shared/componentes/visao-geral-mapa-bid-frete'

function pin(
  id: number,
  portCode: string,
  label: string,
): MapPinBidFrete {
  return {
    id,
    label,
    portCode,
    country: portCode.slice(0, 2),
    lat: 0,
    lng: 0,
    geoLat: 0,
    geoLng: 0,
    activeBids: 1,
    bestPrice: 100,
    savingPct: 0,
    mode: 'MARITIMO',
    supplier: 'Fornecedor',
    flag: '🏳️',
  }
}

const pins: MapPinBidFrete[] = [
  pin(1, 'CNSHA', 'Shanghai'),
  pin(2, 'BRSSZ', 'Santos'),
  pin(3, 'USNYC', 'New York'),
]

const rotaImportacao: ArcRouteBidFrete = {
  fromId: 1,
  toId: 2,
  color: '#60a5fa',
  mode: 'MARITIMO',
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  tipo_operacao_cotacao_bid_frete_internacional: 'IMPORTACAO',
}

const rotaExportacaoAerea: ArcRouteBidFrete = {
  fromId: 2,
  toId: 3,
  color: '#fbbf24',
  mode: 'AEREO',
  modal_cotacao_bid_frete_internacional: 'AEREO',
  tipo_operacao_cotacao_bid_frete_internacional: 'EXPORTACAO',
}

describe('inferirTipoOperacaoRotaMapa', () => {
  it('infere importação quando destino é BR e origem não é BR', () => {
    expect(inferirTipoOperacaoRotaMapa(pins[0], pins[1])).toBe('IMPORTACAO')
  })

  it('infere exportação quando origem é BR e destino não é BR', () => {
    expect(inferirTipoOperacaoRotaMapa(pins[1], pins[2])).toBe('EXPORTACAO')
  })
})

describe('filtrarDadosMapaInsightsBidFreteInternacional', () => {
  const routes = [rotaImportacao, rotaExportacaoAerea]

  it('retorna tudo quando não há filtros', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, new Set())
    expect(resultado.routes).toHaveLength(2)
    expect(resultado.pins).toHaveLength(3)
  })

  it('filtra por importação', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(
      pins,
      routes,
      new Set(['IMPORTACAO']),
    )
    expect(resultado.routes).toEqual([rotaImportacao])
    expect(resultado.pins.map((p) => p.id).sort()).toEqual([1, 2])
  })

  it('combina filtro de operação e modal', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(
      pins,
      routes,
      new Set(['EXPORTACAO', 'AEREO']),
    )
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
    expect(resultado.pins.map((p) => p.id).sort()).toEqual([2, 3])
  })

  it('infere tipo de operação quando campo da API está ausente', () => {
    const rotaSemTipo: ArcRouteBidFrete = {
      fromId: 1,
      toId: 2,
      color: '#60a5fa',
      mode: 'MARITIMO',
      modal_cotacao_bid_frete_internacional: 'MARITIMO',
    }
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(
      pins,
      [rotaSemTipo],
      new Set(['IMPORTACAO']),
    )
    expect(resultado.routes).toHaveLength(1)
  })

  it('filtra por status de cotação na rota', () => {
    const rotaComStatus: ArcRouteBidFrete = {
      ...rotaImportacao,
      statuses_cotacao_bid_frete_internacional: ['RASCUNHO', 'EM_COTACAO'],
    }
    const rotaOutroStatus: ArcRouteBidFrete = {
      ...rotaExportacaoAerea,
      statuses_cotacao_bid_frete_internacional: ['APROVADA'],
    }
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, [rotaComStatus, rotaOutroStatus], {
      operacaoModal: new Set(),
      status: new Set(['RASCUNHO']),
      codigos_origem: new Set(),
      codigos_destino: new Set(),
    })
    expect(resultado.routes).toEqual([rotaComStatus])
  })

  it('mantém rota sem status quando filtro de status está ativo', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, [rotaImportacao], {
      operacaoModal: new Set(),
      status: new Set(['RASCUNHO']),
      codigos_origem: new Set(),
      codigos_destino: new Set(),
    })
    expect(resultado.routes).toEqual([rotaImportacao])
  })

  it('filtra por terminal de origem', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      operacaoModal: new Set(),
      status: new Set(),
      codigos_origem: new Set(['CNSHA']),
      codigos_destino: new Set(),
    })
    expect(resultado.routes).toEqual([rotaImportacao])
    expect(resultado.pins.map((p) => p.portCode).sort()).toEqual(['BRSSZ', 'CNSHA'])
  })

  it('filtra por terminal de destino', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      operacaoModal: new Set(),
      status: new Set(),
      codigos_origem: new Set(),
      codigos_destino: new Set(['USNYC']),
    })
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
    expect(resultado.pins.map((p) => p.portCode).sort()).toEqual(['BRSSZ', 'USNYC'])
  })

  it('combina filtro de origem e destino', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      operacaoModal: new Set(),
      status: new Set(),
      codigos_origem: new Set(['BRSSZ']),
      codigos_destino: new Set(['USNYC']),
    })
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
  })
})

describe('filtrarTerminaisMapaInsightsPorBusca', () => {
  it('retorna todos quando busca está vazia', () => {
    expect(filtrarTerminaisMapaInsightsPorBusca(pins, '')).toEqual(pins)
  })

  it('filtra por código ou nome com vários termos', () => {
    expect(filtrarTerminaisMapaInsightsPorBusca(pins, 'cn sh')).toEqual([pins[0]])
    expect(filtrarTerminaisMapaInsightsPorBusca(pins, 'BR,SSZ')).toEqual([pins[1]])
  })
})
