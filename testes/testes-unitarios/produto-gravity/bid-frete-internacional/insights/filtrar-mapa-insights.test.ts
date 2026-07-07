import { describe, expect, it } from 'vitest'
import {
  contarFiltrosMapaAtivos,
  filtrarDadosMapaInsightsBidFreteInternacional,
  filtrarTerminaisMapaInsightsPorBusca,
  filtrosMapaInsightsIniciais,
  FILTROS_STATUS_MAPA_INSIGHTS,
  inferirTipoOperacaoRotaMapa,
  OPERACOES_FILTRO_MAPA_INSIGHTS,
  MODAIS_FILTRO_MAPA_INSIGHTS,
  type FiltroOperacaoModalMapaInsights,
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

/** Semântica opt-out: «sem restrição de operação/modal» = todos os cards ativos. */
const operacaoModalTodosAtivos = (): Set<FiltroOperacaoModalMapaInsights> =>
  new Set([...OPERACOES_FILTRO_MAPA_INSIGHTS, ...MODAIS_FILTRO_MAPA_INSIGHTS])

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
      ...filtrosMapaInsightsIniciais(),
      status: new Set(['RASCUNHO']),
    })
    expect(resultado.routes).toEqual([rotaComStatus])
  })

  it('oculta rota sem status quando filtro de status está ativo', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, [rotaImportacao], {
      ...filtrosMapaInsightsIniciais(),
      status: new Set(['RASCUNHO']),
    })
    expect(resultado.routes).toEqual([])
  })

  it('não restringe quando todos os status estão selecionados', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtrosMapaInsightsIniciais(),
      status: new Set(FILTROS_STATUS_MAPA_INSIGHTS.map((f) => f.id)),
    })
    expect(resultado.routes).toHaveLength(2)
  })

  it('não restringe quando todos os terminais de origem estão selecionados', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtrosMapaInsightsIniciais(),
      codigos_origem: new Set(['CNSHA', 'BRSSZ', 'USNYC']),
    })
    expect(resultado.routes).toHaveLength(2)
  })

  it('filtra por terminal de origem', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtrosMapaInsightsIniciais(),
      status: new Set(),
      codigos_origem: new Set(['CNSHA']),
    })
    expect(resultado.routes).toEqual([rotaImportacao])
    expect(resultado.pins.map((p) => p.portCode).sort()).toEqual(['BRSSZ', 'CNSHA'])
  })

  it('filtra por terminal de destino', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtrosMapaInsightsIniciais(),
      codigos_destino: new Set(['USNYC']),
    })
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
    expect(resultado.pins.map((p) => p.portCode).sort()).toEqual(['BRSSZ', 'USNYC'])
  })

  it('combina filtro de origem e destino', () => {
    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtrosMapaInsightsIniciais(),
      status: new Set(),
      codigos_origem: new Set(['BRSSZ']),
      codigos_destino: new Set(['USNYC']),
    })
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
  })
})

describe('semântica opt-out dos cards de operação e modal', () => {
  const routes = [rotaImportacao, rotaExportacaoAerea]

  it('estado inicial (todos os cards ativos) mostra tudo e conta zero filtros', () => {
    const filtros = filtrosMapaInsightsIniciais()
    expect(contarFiltrosMapaAtivos(filtros)).toBe(0)

    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, filtros)
    expect(resultado.routes).toHaveLength(2)
    expect(resultado.pins).toHaveLength(3)
  })

  it('desativar um modal oculta as rotas daquele modal', () => {
    const filtros = filtrosMapaInsightsIniciais()
    const operacaoModal = new Set(filtros.operacaoModal)
    operacaoModal.delete('AEREO')

    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtros,
      operacaoModal,
    })
    expect(resultado.routes).toEqual([rotaImportacao])
    expect(contarFiltrosMapaAtivos({ ...filtros, operacaoModal })).toBe(1)
  })

  it('desativar uma operação oculta as rotas daquela operação', () => {
    const filtros = filtrosMapaInsightsIniciais()
    const operacaoModal = new Set(filtros.operacaoModal)
    operacaoModal.delete('IMPORTACAO')

    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtros,
      operacaoModal,
    })
    expect(resultado.routes).toEqual([rotaExportacaoAerea])
  })

  it('desativar todos os cards de um grupo oculta tudo', () => {
    const filtros = filtrosMapaInsightsIniciais()
    const operacaoModal = new Set(filtros.operacaoModal)
    operacaoModal.delete('MARITIMO')
    operacaoModal.delete('AEREO')
    operacaoModal.delete('RODOVIARIO')

    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, routes, {
      ...filtros,
      operacaoModal,
    })
    expect(resultado.routes).toHaveLength(0)
    expect(resultado.pins).toHaveLength(0)
  })

  it('grupo de operação completo não oculta rota sem tipo de operação inferível', () => {
    const rotaCrossTrade: ArcRouteBidFrete = {
      fromId: 1,
      toId: 3,
      color: '#60a5fa',
      mode: 'MARITIMO',
      modal_cotacao_bid_frete_internacional: 'MARITIMO',
    }
    const filtros = filtrosMapaInsightsIniciais()
    const operacaoModal = new Set(filtros.operacaoModal)
    operacaoModal.delete('AEREO')

    const resultado = filtrarDadosMapaInsightsBidFreteInternacional(pins, [rotaCrossTrade], {
      ...filtros,
      operacaoModal,
    })
    expect(resultado.routes).toEqual([rotaCrossTrade])
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
