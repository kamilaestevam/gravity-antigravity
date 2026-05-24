import { describe, it, expect } from 'vitest'
import { buildVisaoGeralMapa } from '../../../servicos-global/produto/pedido/client/src/shared/visaoGeralMapaPedido'
import type { Pedido } from '../../../servicos-global/produto/pedido/client/src/shared/types'

function pedidoBase(overrides: Partial<Pedido>): Pedido {
  return {
    id: 'p1',
    tenant_id: 'org-1',
    company_id: 'ws-1',
    tipo_operacao: 'importacao',
    numero_pedido: 'PO-001',
    status: 'aberto',
    importacao_exportador_id: null,
    exportacao_importador_id: null,
    incoterm: 'FOB',
    moeda_pedido: 'USD',
    valor_total_pedido: 10_000,
    casas_decimais_valor_pedido: 2,
    quantidade_total_pedido: 100,
    casas_decimais_quantidade_pedido: 0,
    condicao_pagamento: null,
    data_emissao_pedido: '2026-05-01',
    itens: [],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    pais_exportador: 'China',
    cidade_exportador: 'Shanghai',
    nome_exportador: 'Shanghai Export Co',
    ...overrides,
  }
}

describe('buildVisaoGeralMapa', () => {
  it('retorna estrutura vazia sem pedidos', () => {
    const mapa = buildVisaoGeralMapa([])
    expect(mapa.pins).toEqual([])
    expect(mapa.topOrigens).toEqual([])
    expect(mapa.globeRoutes).toEqual([])
  })

  it('agrega origem estrangeira e hubs BR em importação (padrão BID Frete)', () => {
    const mapa = buildVisaoGeralMapa([pedidoBase({})])

    const shanghai = mapa.pins.find(p => p.papel === 'origem' && p.label.toLowerCase().includes('shanghai'))
    expect(shanghai).toBeDefined()
    expect(mapa.topOrigens.some(o => o.name.toLowerCase().includes('shanghai') || o.flag === '🇨🇳')).toBe(true)

    const hubsBr = mapa.pins.filter(p => p.papel === 'destino' && p.country === 'Brasil')
    expect(hubsBr.some(h => h.label === 'Guarulhos')).toBe(true)

    expect(mapa.globeRoutes.length).toBeGreaterThan(0)
    expect(mapa.globeRoutes[0].fromId).toBe(shanghai?.id)
    expect(hubsBr.some(h => h.id === mapa.globeRoutes[0].toId)).toBe(true)

    expect(mapa.modaisGlobo.find(m => m.key === 'importacao')?.count).toBe(1)
  })

  it('distribui importações entre hubs Guarulhos, Itajaí e Recife', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({ id: 'p1' }),
      pedidoBase({ id: 'p2', pais_exportador: 'Estados Unidos', cidade_exportador: 'Miami', nome_exportador: 'Miami Co' }),
      pedidoBase({ id: 'p3', pais_exportador: 'Argentina', cidade_exportador: 'Buenos Aires', nome_exportador: 'BA Co' }),
    ])

    expect(mapa.topDestinos.some(d => d.name === 'Guarulhos')).toBe(true)
    expect(mapa.topDestinos.some(d => d.name === 'Itajaí')).toBe(true)
    expect(mapa.topDestinos.some(d => d.name === 'Recife')).toBe(true)
    expect(mapa.pins.filter(p => p.papel === 'origem').length).toBeGreaterThanOrEqual(3)
  })

  it('usa fabricante como fallback de origem quando exportador vazio', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({
        pais_exportador: null,
        cidade_exportador: null,
        nome_exportador: null,
        pais_fabricante: 'China',
        cidade_fabricante: 'Shenzhen',
        nome_fabricante: 'Shenzhen Mfg',
      }),
    ])
    expect(mapa.topOrigens.some(o => o.name.toLowerCase().includes('shenzhen') || o.flag === '🇨🇳')).toBe(true)
  })

  it('agrega métricas cambiais no pin por localização', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({
        id: 'p1',
        valor_total_cambio_pedido: 5000,
        contrato_cambio_id_pedido: 'CC-001',
      }),
      pedidoBase({
        id: 'p2',
        valor_total_cambio_pedido: 8000,
        contrato_cambio_id_pedido: 'CC-002',
      }),
    ])

    const pinHub = mapa.pins.find(p => p.label === 'Guarulhos')
    expect(pinHub).toBeDefined()
    expect(pinHub!.contratosCambioCount).toBe(1)
    expect(pinHub!.totalAPagar).toBe(5000)

    const pinHub2 = mapa.pins.find(p => p.label === 'Itajaí')
    expect(pinHub2?.contratosCambioCount).toBe(1)
    expect(pinHub2?.totalAPagar).toBe(8000)
  })

  it('expõe detalhe clicável para origem sem pin no globo (ex.: exportador)', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({
        pais_exportador: null,
        cidade_exportador: null,
        nome_exportador: 'BYD Auto Industry Co Ltd',
        valor_total_cambio_pedido: 12_000,
        contrato_cambio_id_pedido: 'CC-BYD',
      }),
    ])

    const origem = mapa.topOrigens.find(o => o.name.includes('BYD'))
    expect(origem?.locKey).toBeTruthy()
    expect(origem?.pinId).toBeNull()

    const detalhe = mapa.detalhesPorLocKey[origem!.locKey]
    expect(detalhe).toBeDefined()
    expect(detalhe.pedidosCount).toBe(1)
    expect(detalhe.contratosCambioCount).toBe(1)
    expect(detalhe.totalAPagar).toBe(12_000)
    expect(detalhe.rotas.length).toBeGreaterThan(0)
  })

  it('agrega vencimentos por rota a partir de condição de pagamento', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({
        data_emissao_pedido: '2026-01-15',
        condicao_pagamento: 'NET 45',
        valor_total_cambio_pedido: 5000,
      }),
    ])

    const detalhe = Object.values(mapa.detalhesPorLocKey).find(d => d.rotas.length > 0)
    expect(detalhe?.rotas[0]?.vencimentosPagar.length).toBeGreaterThan(0)
    expect(detalhe?.rotas[0]?.vencimentosPagar[0]?.data).toBe('2026-03-01')
    expect(detalhe?.rotas[0]?.timelineVencimentos.length).toBeGreaterThan(0)

    const resumoPagar = detalhe?.rotas[0]?.resumoVencimentosPagar
    expect(resumoPagar?.quantidade).toBe(1)
    expect(resumoPagar?.valorTotal).toBe(5000)
    expect(resumoPagar?.proximoData).toBe('2026-03-01')
    expect(resumoPagar?.moeda).toBe('USD')
    expect(detalhe?.rotas[0]?.nome_workspace).toBe('—')
  })

  it('propaga nome_workspace quando mapa de workspaces é informado', () => {
    const mapa = buildVisaoGeralMapa(
      [pedidoBase({ company_id: 'ws-hitachi' })],
      new Map([['ws-hitachi', 'CDE Importadora']]),
    )

    const detalhe = Object.values(mapa.detalhesPorLocKey).find(d => d.rotas.length > 0)
    expect(detalhe?.rotas[0]?.nome_workspace).toBe('CDE Importadora')
  })

  it('classifica exportação com origem Brasil', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoBase({
        tipo_operacao: 'exportacao',
        nome_importador: 'Buyer USA Inc',
        pais_exportador: null,
        cidade_exportador: null,
      }),
    ])
    expect(mapa.topOrigens.some(o => o.name === 'Brasil')).toBe(true)
    expect(mapa.pins.some(p => p.papel === 'origem' && p.label === 'Brasil')).toBe(true)
    const pinBr = mapa.pins.find(p => p.label === 'Brasil')
    expect(pinBr?.totalAReceber).toBeGreaterThan(0)
    expect(mapa.modaisGlobo.find(m => m.key === 'exportacao')?.count).toBe(1)
  })
})
