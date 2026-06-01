// @vitest-environment node
import { describe, it, expect } from 'vitest'
import {
  chavesDefaultGranulares,
  chavesDefaultPermissoesVinculo,
  chavesDefaultExtrasVinculo,
  buildPermissaoCotarFreteString,
  togglesGranularesPorProduto,
  usuarioTemPermissaoGranularProduto,
  usuarioTemPermissaoCotarFrete,
  DEFAULTS_GRANULARES_POR_PRODUTO,
  buildPermissaoString,
  SECOES_PRODUTO,
  ACOES_PRODUTO,
} from '../../../servicos-global/configurador/shared/permissoes-canonicas.js'

describe('DEFAULTS_GRANULARES_POR_PRODUTO', () => {
  describe('pedido › PADRAO', () => {
    const defaults = DEFAULTS_GRANULARES_POR_PRODUTO['pedido'].PADRAO

    it('contém apenas lista:ver (least-privilege)', () => {
      expect(defaults).toEqual([
        { secao: 'lista', acao: 'ver' },
      ])
    })

    it('NÃO contém dashboard:ver (Master concede explicitamente)', () => {
      const temDashboard = defaults.some(d => d.secao === 'dashboard')
      expect(temDashboard).toBe(false)
    })

    it('NÃO contém kanban (ver nem editar)', () => {
      const temKanban = defaults.some(d => d.secao === 'kanban')
      expect(temKanban).toBe(false)
    })

    it('NÃO contém configuracao:ver', () => {
      const temConfig = defaults.some(d => d.secao === 'configuracao')
      expect(temConfig).toBe(false)
    })

    it('NÃO contém historico:ver', () => {
      const temHistorico = defaults.some(d => d.secao === 'historico')
      expect(temHistorico).toBe(false)
    })

    it('NÃO contém lista:editar', () => {
      const temEditar = defaults.some(d => d.secao === 'lista' && d.acao === 'editar')
      expect(temEditar).toBe(false)
    })
  })

  describe('pedido › FORNECEDOR', () => {
    const defaults = DEFAULTS_GRANULARES_POR_PRODUTO['pedido'].FORNECEDOR

    it('contém dashboard:ver, lista:ver e historico:ver (read-only)', () => {
      expect(defaults).toEqual([
        { secao: 'dashboard', acao: 'ver' },
        { secao: 'lista', acao: 'ver' },
        { secao: 'historico', acao: 'ver' },
      ])
    })

    it('NÃO contém nenhuma ação editar', () => {
      const temEditar = defaults.some(d => d.acao === 'editar')
      expect(temEditar).toBe(false)
    })
  })
})

describe('chavesDefaultGranulares', () => {
  it('retorna apenas pedido:lista:ver para PADRAO no pedido', () => {
    const chaves = chavesDefaultGranulares('pedido', 'PADRAO')
    expect(chaves).toEqual(['pedido:lista:ver'])
  })

  it('retorna 3 chaves para FORNECEDOR no pedido', () => {
    const chaves = chavesDefaultGranulares('pedido', 'FORNECEDOR')
    expect(chaves).toEqual([
      'pedido:dashboard:ver',
      'pedido:lista:ver',
      'pedido:historico:ver',
    ])
  })

  it('retorna [] para MASTER (bypass — Mand. 04)', () => {
    expect(chavesDefaultGranulares('pedido', 'MASTER')).toEqual([])
  })

  it('retorna [] para SUPER_ADMIN (bypass — Mand. 04)', () => {
    expect(chavesDefaultGranulares('pedido', 'SUPER_ADMIN')).toEqual([])
  })

  it('retorna [] para ADMIN (bypass — Mand. 04)', () => {
    expect(chavesDefaultGranulares('pedido', 'ADMIN')).toEqual([])
  })

  it('retorna [] para produto inexistente no mapa', () => {
    expect(chavesDefaultGranulares('produto-inexistente', 'PADRAO')).toEqual([])
  })

  it('retorna [] para tipo_usuario desconhecido', () => {
    expect(chavesDefaultGranulares('pedido', 'TIPO_INVALIDO')).toEqual([])
  })
})

describe('buildPermissaoString', () => {
  it('constrói string canônica slug:secao:acao', () => {
    for (const secao of SECOES_PRODUTO) {
      for (const acao of ACOES_PRODUTO) {
        expect(buildPermissaoString('pedido', secao, acao)).toBe(`pedido:${secao}:${acao}`)
      }
    }
  })
})

describe('BID Frete — cotar e vínculo', () => {
  it('FORNECEDOR no BID recebe cotar em chavesDefaultExtrasVinculo', () => {
    expect(chavesDefaultExtrasVinculo('bid-frete-internacional', 'FORNECEDOR')).toEqual([
      'bid-frete-internacional:visao_fornecedor:cotar',
    ])
  })

  it('chavesDefaultPermissoesVinculo mescla grade + cotar', () => {
    const chaves = chavesDefaultPermissoesVinculo('bid-frete-internacional', 'FORNECEDOR')
    expect(chaves).toContain('bid-frete-internacional:dashboard:ver')
    expect(chaves).toContain('bid-frete-internacional:visao_fornecedor:cotar')
  })

  it('togglesGranularesPorProduto soma +1 no BID', () => {
    expect(togglesGranularesPorProduto('bid-frete-internacional')).toBe(13)
    expect(togglesGranularesPorProduto('pedido')).toBe(12)
  })

  it('usuarioTemPermissaoGranularProduto e CotarFrete distinguem chaves', () => {
    const set = new Set([
      'bid-frete-internacional:visao_fornecedor:cotar',
      'bid-frete-internacional:dashboard:ver',
    ])
    expect(usuarioTemPermissaoGranularProduto(set, 'bid-frete-internacional')).toBe(true)
    expect(usuarioTemPermissaoCotarFrete(set, 'bid-frete-internacional')).toBe(true)
    expect(usuarioTemPermissaoGranularProduto(
      new Set([buildPermissaoCotarFreteString('bid-frete-internacional')]),
      'bid-frete-internacional',
    )).toBe(false)
  })

  it('slugs bid-frete e bid-frete-internacional são compatíveis', () => {
    const set = new Set(['bid-frete:visao_fornecedor:cotar'])
    expect(usuarioTemPermissaoCotarFrete(set, 'bid-frete-internacional')).toBe(true)
  })
})
