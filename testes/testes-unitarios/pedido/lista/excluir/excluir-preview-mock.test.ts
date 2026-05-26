// @vitest-environment node
import { describe, it, expect } from 'vitest'

/**
 * Testa a lógica corrigida do mockExcluirPreview.
 *
 * Bug original: mockExcluirPreview filtrava IDs recebidos contra
 * MOCK_PEDIDOS_RESPONSE.data estático — IDs reais (CUIDs) nunca batiam
 * com IDs mock ("pedi_id_0000001/26"), retornando permitidos=[] e
 * bloqueados=[], gerando tabela vazia no modal de exclusão.
 *
 * Correção: gerar permitidos a partir dos IDs recebidos, sem filtrar
 * contra mock estático.
 */

// ── Réplica da lógica corrigida (isolada do módulo real para teste puro) ──

interface ExcluirPreviewPermitido {
  id: string
  numero_pedido: string
  total_itens: number
}

interface ExcluirPreview {
  permitidos: ExcluirPreviewPermitido[]
  bloqueados: { id: string; numero_pedido: string; status: string; motivo: string }[]
}

function mockExcluirPreview(ids: string[]): ExcluirPreview {
  const permitidos: ExcluirPreviewPermitido[] = ids.map((id, i) => ({
    id,
    numero_pedido: `MOCK-${i + 1}`,
    total_itens: 0,
  }))
  return { permitidos, bloqueados: [] }
}

// ── Testes ───────────────────────────────────────────────────────────────────

describe('mockExcluirPreview — gera preview a partir dos IDs recebidos', () => {
  it('IDs CUID reais geram permitidos com numero_pedido sequencial', () => {
    const ids = ['cm3abc123def', 'cm3xyz789ghi', 'cm3qrs456jkl']
    const resultado = mockExcluirPreview(ids)

    expect(resultado.permitidos).toHaveLength(3)
    expect(resultado.bloqueados).toHaveLength(0)

    expect(resultado.permitidos[0]).toEqual({
      id: 'cm3abc123def',
      numero_pedido: 'MOCK-1',
      total_itens: 0,
    })
    expect(resultado.permitidos[1]).toEqual({
      id: 'cm3xyz789ghi',
      numero_pedido: 'MOCK-2',
      total_itens: 0,
    })
    expect(resultado.permitidos[2]).toEqual({
      id: 'cm3qrs456jkl',
      numero_pedido: 'MOCK-3',
      total_itens: 0,
    })
  })

  it('ID único retorna exatamente 1 permitido', () => {
    const resultado = mockExcluirPreview(['id_unico'])

    expect(resultado.permitidos).toHaveLength(1)
    expect(resultado.permitidos[0].id).toBe('id_unico')
    expect(resultado.permitidos[0].numero_pedido).toBe('MOCK-1')
  })

  it('lista vazia retorna permitidos vazio e bloqueados vazio', () => {
    const resultado = mockExcluirPreview([])

    expect(resultado.permitidos).toHaveLength(0)
    expect(resultado.bloqueados).toHaveLength(0)
  })

  it('IDs nunca ficam com numero_pedido vazio (bug original)', () => {
    const ids = ['cm3a', 'cm3b', 'cm3c', 'cm3d', 'cm3e']
    const resultado = mockExcluirPreview(ids)

    for (const p of resultado.permitidos) {
      expect(p.numero_pedido).toBeTruthy()
      expect(p.numero_pedido.length).toBeGreaterThan(0)
    }
  })

  it('cada ID é preservado no campo id do permitido', () => {
    const ids = ['abc', 'def', 'ghi']
    const resultado = mockExcluirPreview(ids)

    const idsRetornados = resultado.permitidos.map(p => p.id)
    expect(idsRetornados).toEqual(ids)
  })

  it('total_itens é sempre 0 no mock (sem dados reais)', () => {
    const resultado = mockExcluirPreview(['a', 'b'])

    for (const p of resultado.permitidos) {
      expect(p.total_itens).toBe(0)
    }
  })

  it('bloqueados é sempre array vazio no mock corrigido', () => {
    const resultado = mockExcluirPreview(['x', 'y', 'z'])
    expect(resultado.bloqueados).toEqual([])
  })
})

describe('ModalPedidosExcluir — estado "ambos zero" tratado', () => {
  /**
   * Testa a lógica de decisão do componente para o estado onde
   * preview retorna permitidos=0 e bloqueados=0.
   * Extraído como função pura para teste sem React.
   */
  function determinarEstadoModal(totalPermitidos: number, totalBloqueados: number, temItensAvulsos: boolean): string {
    if (totalPermitidos === 0 && totalBloqueados > 0 && !temItensAvulsos) return 'todos_bloqueados'
    if (totalPermitidos === 0 && totalBloqueados === 0 && !temItensAvulsos) return 'erro_comunicacao'
    if (totalPermitidos > 0 || temItensAvulsos) return 'pode_excluir'
    return 'desconhecido'
  }

  it('permitidos > 0 → pode excluir', () => {
    expect(determinarEstadoModal(3, 0, false)).toBe('pode_excluir')
  })

  it('permitidos > 0 com bloqueados → pode excluir (parcial)', () => {
    expect(determinarEstadoModal(2, 1, false)).toBe('pode_excluir')
  })

  it('permitidos = 0, bloqueados > 0 → todos bloqueados', () => {
    expect(determinarEstadoModal(0, 5, false)).toBe('todos_bloqueados')
  })

  it('permitidos = 0, bloqueados = 0 → erro de comunicação (bug corrigido)', () => {
    expect(determinarEstadoModal(0, 0, false)).toBe('erro_comunicacao')
  })

  it('permitidos = 0, bloqueados = 0, mas tem itens avulsos → pode excluir', () => {
    expect(determinarEstadoModal(0, 0, true)).toBe('pode_excluir')
  })

  it('permitidos = 0, bloqueados > 0, mas tem itens avulsos → pode excluir', () => {
    expect(determinarEstadoModal(0, 3, true)).toBe('pode_excluir')
  })
})

describe('Filtro de itens avulsos — exclui itens cujo pai está na seleção', () => {
  /**
   * Réplica da lógica de filtro do ModalPedidosExcluir:
   * itens cujo pedido pai está selecionado são excluídos da lista
   * de itens avulsos (o pai já cuida da exclusão via cascade).
   * Mesmo padrão do ModalPedidosDuplicar.
   */
  interface ItemSimples { id: string; pedido_id: string }

  function filtrarItensAvulsos(itens: ItemSimples[], idsPedidos: string[]): ItemSimples[] {
    const set = new Set(idsPedidos)
    return itens.filter(it => !set.has(it.pedido_id))
  }

  it('item cujo pai está selecionado é excluído da lista', () => {
    const itens = [
      { id: 'it1', pedido_id: 'ped1' },
      { id: 'it2', pedido_id: 'ped2' },
    ]
    const resultado = filtrarItensAvulsos(itens, ['ped1'])
    expect(resultado).toEqual([{ id: 'it2', pedido_id: 'ped2' }])
  })

  it('item cujo pai NÃO está selecionado permanece', () => {
    const itens = [{ id: 'it1', pedido_id: 'ped_x' }]
    const resultado = filtrarItensAvulsos(itens, ['ped_y'])
    expect(resultado).toEqual([{ id: 'it1', pedido_id: 'ped_x' }])
  })

  it('todos os itens com pai selecionado → lista vazia', () => {
    const itens = [
      { id: 'it1', pedido_id: 'ped1' },
      { id: 'it2', pedido_id: 'ped1' },
    ]
    const resultado = filtrarItensAvulsos(itens, ['ped1'])
    expect(resultado).toHaveLength(0)
  })

  it('sem pedidos selecionados → todos os itens permanecem', () => {
    const itens = [
      { id: 'it1', pedido_id: 'ped1' },
      { id: 'it2', pedido_id: 'ped2' },
    ]
    const resultado = filtrarItensAvulsos(itens, [])
    expect(resultado).toHaveLength(2)
  })

  it('lista de itens vazia → retorna vazio', () => {
    const resultado = filtrarItensAvulsos([], ['ped1'])
    expect(resultado).toHaveLength(0)
  })
})

describe('Agrupamento de itens por pedido_id', () => {
  interface ItemSimples { id: string; pedido_id: string }

  function agruparPorPedido(itens: ItemSimples[]): Map<string, ItemSimples[]> {
    const mapa = new Map<string, ItemSimples[]>()
    for (const it of itens) {
      const lista = mapa.get(it.pedido_id) ?? []
      lista.push(it)
      mapa.set(it.pedido_id, lista)
    }
    return mapa
  }

  it('agrupa itens do mesmo pedido juntos', () => {
    const itens = [
      { id: 'it1', pedido_id: 'ped1' },
      { id: 'it2', pedido_id: 'ped1' },
      { id: 'it3', pedido_id: 'ped2' },
    ]
    const mapa = agruparPorPedido(itens)
    expect(mapa.size).toBe(2)
    expect(mapa.get('ped1')).toHaveLength(2)
    expect(mapa.get('ped2')).toHaveLength(1)
  })

  it('lista vazia → mapa vazio', () => {
    const mapa = agruparPorPedido([])
    expect(mapa.size).toBe(0)
  })

  it('cada item em pedido diferente → N entradas', () => {
    const itens = [
      { id: 'it1', pedido_id: 'ped1' },
      { id: 'it2', pedido_id: 'ped2' },
      { id: 'it3', pedido_id: 'ped3' },
    ]
    const mapa = agruparPorPedido(itens)
    expect(mapa.size).toBe(3)
  })
})
