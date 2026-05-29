// @vitest-environment node
/**
 * Matriz de decisões do Smart Import confirmar — SSOT testável sem Prisma.
 * Cada caso espelha SMART-IMPORT-REGRAS-NEGOCIO.md § Pedidos Duplicados.
 */
import { describe, it, expect } from 'vitest'
import {
  planoConfirmarLinha,
  obterDecisaoDuplicataImport,
  ehLinhaItemSmartImport,
  sanitizarDadosLinhaImport,
  CAMPOS_PK_PROIBIDOS_PLANILHA,
} from '../../../servicos-global/produto/pedido/shared/smart-import-confirmar-decisoes.js'
import { gerarIdImportacao } from '../../../servicos-global/produto/pedido/shared/smart-import-ids.js'

describe('planoConfirmarLinha — matriz de decisões', () => {
  const base = {
    pedidoExiste: true,
    ehLinhaItem: false,
    temDadosItem: false,
    sobrescritaJaPreparada: false,
    decisaoDup: undefined as undefined,
  }

  it('pular — qualquer linha do pedido', () => {
    const plano = planoConfirmarLinha({ ...base, decisaoDup: 'pular', ehLinhaItem: true, temDadosItem: true })
    expect(plano.pular).toBe(true)
    expect(plano.criarItemEmPedidoExistente).toBe(false)
  })

  it('pedido inexistente — criar novo', () => {
    const plano = planoConfirmarLinha({ ...base, pedidoExiste: false, ehLinhaItem: true, temDadosItem: true })
    expect(plano.criarPedidoNovo).toBe(true)
  })

  it('criar — cabeçalho com pedido existente → erro criar_duplicata', () => {
    const plano = planoConfirmarLinha({ ...base, decisaoDup: 'criar' })
    expect(plano.erro).toBe('criar_duplicata')
  })

  it('criar — linha ITEM com pedido existente → erro pedido_existe', () => {
    const plano = planoConfirmarLinha({
      ...base,
      decisaoDup: 'criar',
      ehLinhaItem: true,
      temDadosItem: true,
    })
    expect(plano.erro).toBe('pedido_existe_sem_decisao')
  })

  it('sobrescrever — linha PEDIDO → prepara + somente cabeçalho', () => {
    const plano = planoConfirmarLinha({ ...base, decisaoDup: 'sobrescrever' })
    expect(plano.prepararSobrescrita).toBe(true)
    expect(plano.somenteCabecalho).toBe(true)
    expect(plano.criarItemEmPedidoExistente).toBe(false)
    expect(plano.contarComoAtualizado).toBe(true)
  })

  it('sobrescrever — linha ITEM → prepara + recria item', () => {
    const plano = planoConfirmarLinha({
      ...base,
      decisaoDup: 'sobrescrever',
      ehLinhaItem: true,
      temDadosItem: true,
    })
    expect(plano.prepararSobrescrita).toBe(true)
    expect(plano.criarItemEmPedidoExistente).toBe(true)
    expect(plano.somenteCabecalho).toBe(false)
  })

  it('sobrescrever — 2ª linha ITEM do mesmo PO → só recria item (sem prep)', () => {
    const plano = planoConfirmarLinha({
      ...base,
      decisaoDup: 'sobrescrever',
      ehLinhaItem: true,
      temDadosItem: true,
      sobrescritaJaPreparada: true,
    })
    expect(plano.prepararSobrescrita).toBe(false)
    expect(plano.criarItemEmPedidoExistente).toBe(true)
  })

  it('incremental — pedido existe, linha ITEM → adiciona item', () => {
    const plano = planoConfirmarLinha({
      ...base,
      ehLinhaItem: true,
      temDadosItem: true,
    })
    expect(plano.criarItemEmPedidoExistente).toBe(true)
    expect(plano.prepararSobrescrita).toBe(false)
  })

  it('incremental — pedido existe, linha PEDIDO sem item → erro', () => {
    const plano = planoConfirmarLinha({ ...base })
    expect(plano.erro).toBe('pedido_existe_sem_decisao')
  })

  it('legado flat — part number sem tipo_linha → trata como ITEM', () => {
    expect(ehLinhaItemSmartImport('', { part_number_item: 'PN-1' })).toBe(true)
    const plano = planoConfirmarLinha({
      ...base,
      decisaoDup: 'sobrescrever',
      ehLinhaItem: true,
      temDadosItem: true,
    })
    expect(plano.criarItemEmPedidoExistente).toBe(true)
  })
})

describe('obterDecisaoDuplicataImport', () => {
  it('resolve por numero editado ou original', () => {
    const decisoes = { 'PO-A': 'sobrescrever' as const }
    expect(obterDecisaoDuplicataImport(decisoes, 'PO-A', 'PO-B')).toBe('sobrescrever')
    expect(obterDecisaoDuplicataImport(decisoes, undefined, 'PO-A')).toBe('sobrescrever')
  })
})

describe('sanitizarDadosLinhaImport', () => {
  it('remove PKs proibidas', () => {
    const limpo = sanitizarDadosLinhaImport({
      id_item: 'pite_x',
      id_pedido: 'pedi_x',
      numero_pedido: 'PO-1',
    })
    for (const pk of CAMPOS_PK_PROIBIDOS_PLANILHA) {
      expect(limpo[pk]).toBeUndefined()
    }
    expect(limpo.numero_pedido).toBe('PO-1')
  })
})

describe('gerarIdImportacao', () => {
  it('gera 1000 IDs únicos (simula lote produção)', () => {
    const ids = new Set(Array.from({ length: 1000 }, () => gerarIdImportacao('pite')))
    expect(ids.size).toBe(1000)
  })
})
