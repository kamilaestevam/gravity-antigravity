import { describe, it, expect } from 'vitest'
import {
  buildVisaoGeralMapa,
  type FornecedorMapaGeo,
} from '../../../../servicos-global/produto/pedido/client/src/shared/visaoGeralMapaPedido'
import type { Pedido } from '../../../../servicos-global/produto/pedido/client/src/shared/types'

/**
 * @vitest-environment node
 */

function pedidoImportacao(id: string): Pedido {
  return {
    id,
    tenant_id: 'org-1',
    company_id: 'ws-1',
    tipo_operacao: 'importacao',
    numero_pedido: id,
    status: 'consolidado',
    importacao_exportador_id: 'exp-1',
    exportacao_importador_id: null,
    pais_exportador: 'China',
    cidade_exportador: 'Shanghai',
    nome_exportador: 'Fornecedor China Ltda.',
    moeda_pedido: 'USD',
    valor_total_pedido: 10000,
    itens: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  } as Pedido
}

function pedidoExportacao(
  id: string,
  extras: Partial<Pedido> & { nome_importador?: string | null } = {},
): Pedido {
  return {
    id,
    tenant_id: 'org-1',
    company_id: 'ws-1',
    tipo_operacao: 'exportacao',
    numero_pedido: id,
    status: 'consolidado',
    importacao_exportador_id: null,
    exportacao_importador_id: extras.exportacao_importador_id ?? null,
    nome_importador: extras.nome_importador ?? 'IMPORTADOR ABC',
    moeda_pedido: 'USD',
    valor_total_pedido: 20000,
    itens: [],
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...extras,
  } as Pedido
}

const FORNECEDORES = new Map<string, FornecedorMapaGeo>([
  ['imp-us', { paisIso: 'US', nome: 'Walmart International Sourcing' }],
  ['imp-de', { paisIso: 'DE', nome: 'FIDES LTDA' }],
  ['imp-ar', { paisIso: 'AR', nome: 'Argentina Importadora S.A.' }],
])

describe('buildVisaoGeralMapa — rotas do globo', () => {
  it('gera rotas de importação e exportação quando ambas existem', () => {
    const mapa = buildVisaoGeralMapa(
      [
        pedidoImportacao('imp-1'),
        pedidoExportacao('exp-1', { exportacao_importador_id: 'imp-ar', nome_importador: 'Argentina Importadora S.A.' }),
      ],
      new Map(),
      FORNECEDORES,
    )

    const modos = new Set(mapa.globeRoutes.map(r => r.mode))
    expect(modos.has('importacao')).toBe(true)
    expect(modos.has('exportacao')).toBe(true)

    const rotaExport = mapa.globeRoutes.find(r => r.mode === 'exportacao')
    expect(rotaExport).toBeDefined()

    const pinBr = mapa.pins.find(p => p.locKey.startsWith('orig-exp|'))
    const pinArgentina = mapa.pins.find(p => p.locKey === 'dest|ext|ar')
    expect(pinBr).toBeDefined()
    expect(pinArgentina).toBeDefined()
    expect(rotaExport?.fromId).toBe(pinBr?.id)
    expect(rotaExport?.toId).toBe(pinArgentina?.id)
  })

  it('usa país do cadastro do importador (fornecedor) sem exigir logística', () => {
    const mapa = buildVisaoGeralMapa(
      [
        pedidoExportacao('exp-us', {
          exportacao_importador_id: 'imp-us',
          nome_importador: 'Walmart International Sourcing',
        }),
        pedidoExportacao('exp-de', {
          exportacao_importador_id: 'imp-de',
          nome_importador: 'FIDES LTDA',
        }),
      ],
      new Map(),
      FORNECEDORES,
    )

    const paisesDestino = mapa.pins
      .filter(p => p.papel === 'destino' && p.tipoOperacao === 'exportacao')
      .map(p => p.country)

    expect(paisesDestino).toContain('Estados Unidos')
    expect(paisesDestino).toContain('Alemanha')
    expect(mapa.globeRoutes.filter(r => r.mode === 'exportacao').length).toBeGreaterThanOrEqual(2)
  })

  it('aceita logística como reforço opcional quando cadastro ausente', () => {
    const mapa = buildVisaoGeralMapa([
      pedidoExportacao('exp-1', {
        nome_importador: 'CDE',
        porto_destino: 'MXMEX',
      }),
    ])

    const pinMexico = mapa.pins.find(p => p.locKey === 'dest|ext|mx')
    expect(pinMexico?.geoLat).not.toBeNull()
    expect(pinMexico?.country).toBe('México')
    expect(mapa.globeRoutes.some(r => r.mode === 'exportacao')).toBe(true)
  })

  it('inclui pedidos em qualquer status (sem filtrar funil)', () => {
    const mapa = buildVisaoGeralMapa(
      [
        pedidoExportacao('exp-rascunho', { status: 'rascunho', exportacao_importador_id: 'imp-us' }),
        pedidoExportacao('exp-consolidado', { status: 'consolidado', exportacao_importador_id: 'imp-de' }),
      ],
      new Map(),
      FORNECEDORES,
    )

    expect(mapa.globeRoutes.filter(r => r.mode === 'exportacao').length).toBeGreaterThanOrEqual(2)
  })

  it('usa local_de_origem da logística quando cadastro comercial está vazio', () => {
    const mapa = buildVisaoGeralMapa([
      {
        ...pedidoImportacao('imp-ky'),
        pais_exportador: null,
        cidade_exportador: null,
        nome_exportador: 'EXPORTADOR 777',
        local_de_origem: 'KY',
        local_de_destino: 'BR',
      },
      {
        ...pedidoImportacao('imp-my'),
        pais_exportador: null,
        cidade_exportador: null,
        nome_exportador: 'CDE',
        local_de_origem: 'MY',
        local_de_destino: 'BR',
      },
      {
        ...pedidoImportacao('imp-al'),
        pais_exportador: null,
        cidade_exportador: null,
        nome_exportador: 'Fornecedor AL',
        local_de_origem: 'AL',
        local_de_destino: 'BR',
        porto_origem: 'ARBUE',
      },
    ])

    const origensEstrangeiras = mapa.pins.filter(
      p => p.papel === 'origem' && p.tipoOperacao === 'importacao' && !p.country.includes('Brasil'),
    )
    expect(origensEstrangeiras.length).toBeGreaterThanOrEqual(3)

    const paises = new Set(origensEstrangeiras.map(p => p.country))
    expect(paises.has('Ilhas Cayman')).toBe(true)
    expect(paises.has('Malásia')).toBe(true)
    expect(paises.has('Argentina')).toBe(true)

    expect(mapa.globeRoutes.filter(r => r.mode === 'importacao').length).toBeGreaterThanOrEqual(3)
  })
})
