// @vitest-environment node
/**
 * edicao-massa-item-ids.test.ts — Verifica que o campo item_ids filtra
 * corretamente quais itens são editados na edição em massa.
 *
 * Bug original: selecionar 2 itens e fazer edição em massa replicava
 * para TODOS os itens do pedido e para o pedido em si. Causa: o pipeline
 * inteiro (frontend → payload → backend) não tinha o conceito de item_ids.
 *
 * Fix: adicionado item_ids? ao EdicaoMassaPayload. Quando presente,
 * backend filtra itens pelo Set de IDs; quando ausente, edita todos.
 * Campos de nível pedido são ignorados quando item_ids está presente.
 */
import { describe, it, expect } from 'vitest'

// ── Helpers que espelham a lógica do backend ────────────────────────────────

/** Cria filtroItemIds como o backend faz */
function criarFiltroItemIds(item_ids?: string[]): Set<string> | null {
  return item_ids && item_ids.length > 0
    ? new Set(item_ids)
    : null
}

/** Filtra itens como o backend faz no slow path */
function filtrarItens(
  todosItens: { id_item: string; [key: string]: unknown }[],
  filtroItemIds: Set<string> | null,
) {
  return filtroItemIds
    ? todosItens.filter(i => filtroItemIds.has(i.id_item))
    : todosItens
}

// ── Dados de teste ──────────────────────────────────────────────────────────

const ITENS_PEDIDO = [
  { id_item: 'item_001', ncm_item: '8471.30.19', referencia_importador_item: 'REF-A' },
  { id_item: 'item_002', ncm_item: '8471.30.19', referencia_importador_item: 'REF-B' },
  { id_item: 'item_003', ncm_item: '9999.99.99', referencia_importador_item: 'REF-C' },
  { id_item: 'item_004', ncm_item: '8471.30.19', referencia_importador_item: 'REF-D' },
  { id_item: 'item_005', ncm_item: '7308.90.10', referencia_importador_item: 'REF-E' },
]

// ── Testes ──────────────────────────────────────────────────────────────────

describe('item_ids — criação do filtro', () => {
  it('item_ids preenchido cria Set com os IDs', () => {
    const filtro = criarFiltroItemIds(['item_001', 'item_002'])
    expect(filtro).not.toBeNull()
    expect(filtro!.size).toBe(2)
    expect(filtro!.has('item_001')).toBe(true)
    expect(filtro!.has('item_002')).toBe(true)
    expect(filtro!.has('item_003')).toBe(false)
  })

  it('item_ids undefined retorna null (= todos os itens)', () => {
    const filtro = criarFiltroItemIds(undefined)
    expect(filtro).toBeNull()
  })

  it('item_ids vazio retorna null (= todos os itens)', () => {
    const filtro = criarFiltroItemIds([])
    expect(filtro).toBeNull()
  })
})

describe('item_ids — filtragem de itens', () => {
  it('filtro null retorna TODOS os itens (comportamento padrão)', () => {
    const resultado = filtrarItens(ITENS_PEDIDO, null)
    expect(resultado).toHaveLength(5)
    expect(resultado).toEqual(ITENS_PEDIDO)
  })

  it('filtro com 2 IDs retorna apenas esses 2 itens', () => {
    const filtro = criarFiltroItemIds(['item_001', 'item_003'])
    const resultado = filtrarItens(ITENS_PEDIDO, filtro)
    expect(resultado).toHaveLength(2)
    expect(resultado.map(i => i.id_item)).toEqual(['item_001', 'item_003'])
  })

  it('filtro com 1 ID retorna apenas esse item', () => {
    const filtro = criarFiltroItemIds(['item_005'])
    const resultado = filtrarItens(ITENS_PEDIDO, filtro)
    expect(resultado).toHaveLength(1)
    expect(resultado[0].id_item).toBe('item_005')
  })

  it('filtro com ID inexistente retorna array vazio', () => {
    const filtro = criarFiltroItemIds(['item_999'])
    const resultado = filtrarItens(ITENS_PEDIDO, filtro)
    expect(resultado).toHaveLength(0)
  })

  it('filtro com todos os IDs retorna todos os itens', () => {
    const filtro = criarFiltroItemIds(ITENS_PEDIDO.map(i => i.id_item))
    const resultado = filtrarItens(ITENS_PEDIDO, filtro)
    expect(resultado).toHaveLength(5)
  })
})

describe('item_ids — lógica de pedido-level skip', () => {
  it('quando filtroItemIds presente, campos de pedido NÃO são aplicados', () => {
    const filtroItemIds = criarFiltroItemIds(['item_001'])
    const camposPedido = [{ campo: 'incoterm_pedido', valor: 'CIF' }]

    // Espelha a condição do backend: if (camposPedido.length > 0 && !filtroItemIds)
    const deveAtualizarPedido = camposPedido.length > 0 && !filtroItemIds
    expect(deveAtualizarPedido).toBe(false)
  })

  it('quando filtroItemIds null, campos de pedido SÃO aplicados', () => {
    const filtroItemIds = criarFiltroItemIds(undefined)
    const camposPedido = [{ campo: 'incoterm_pedido', valor: 'CIF' }]

    const deveAtualizarPedido = camposPedido.length > 0 && !filtroItemIds
    expect(deveAtualizarPedido).toBe(true)
  })

  it('quando não há campos de pedido, não atualiza pedido independente do filtro', () => {
    const filtroItemIds = criarFiltroItemIds(undefined)
    const camposPedido: unknown[] = []

    const deveAtualizarPedido = camposPedido.length > 0 && !filtroItemIds
    expect(deveAtualizarPedido).toBe(false)
  })
})

describe('item_ids — fast path desabilitado com seleção de itens', () => {
  it('filtroItemIds presente desabilita fast path', () => {
    const camposPedido = [{ campo: 'incoterm_pedido', operacao: 'substituir' }]
    const camposItem: unknown[] = []
    const camposCascade: unknown[] = []
    const novoTipo = null
    const filtroItemIds = criarFiltroItemIds(['item_001'])

    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposCascade.length === 0 &&
      novoTipo === null &&
      !filtroItemIds

    expect(todosCamposPedidoSaoRapidos).toBe(false)
  })

  it('filtroItemIds null permite fast path (se demais condições ok)', () => {
    const camposPedido = [{ campo: 'incoterm_pedido', operacao: 'substituir' }]
    const camposItem: unknown[] = []
    const camposCascade: unknown[] = []
    const novoTipo = null
    const filtroItemIds = criarFiltroItemIds(undefined)

    const todosCamposPedidoSaoRapidos =
      camposPedido.length > 0 &&
      camposItem.length === 0 &&
      camposCascade.length === 0 &&
      novoTipo === null &&
      !filtroItemIds

    expect(todosCamposPedidoSaoRapidos).toBe(true)
  })
})

describe('item_ids — payload do frontend', () => {
  it('quando itens selecionados (sem pedidos), payload inclui item_ids', () => {
    const pedidosSelecionados: unknown[] = []
    const itensSelecionados = [
      { id: 'item_001', pedido_id: 'p1' },
      { id: 'item_003', pedido_id: 'p1' },
    ]

    const itensSelecionadosIds =
      pedidosSelecionados.length === 0 && itensSelecionados.length > 0
        ? itensSelecionados.map(i => i.id)
        : undefined

    expect(itensSelecionadosIds).toEqual(['item_001', 'item_003'])
  })

  it('quando pedidos selecionados, item_ids é undefined (edita todos)', () => {
    const pedidosSelecionados = [{ id: 'p1' }]
    const itensSelecionados = [
      { id: 'item_001', pedido_id: 'p1' },
    ]

    const itensSelecionadosIds =
      pedidosSelecionados.length === 0 && itensSelecionados.length > 0
        ? itensSelecionados.map(i => i.id)
        : undefined

    expect(itensSelecionadosIds).toBeUndefined()
  })

  it('sem seleção alguma, item_ids é undefined', () => {
    const pedidosSelecionados: unknown[] = []
    const itensSelecionados: unknown[] = []

    const itensSelecionadosIds =
      pedidosSelecionados.length === 0 && itensSelecionados.length > 0
        ? (itensSelecionados as { id: string }[]).map(i => i.id)
        : undefined

    expect(itensSelecionadosIds).toBeUndefined()
  })
})

describe('item_ids — contagem de itens afetados no preview', () => {
  it('com filtroItemIds, conta apenas itens filtrados', () => {
    const pedidos = [
      { itens_pedido: ITENS_PEDIDO.slice(0, 3) },  // 3 itens
      { itens_pedido: ITENS_PEDIDO.slice(3, 5) },   // 2 itens
    ]
    const filtroItemIds = criarFiltroItemIds(['item_001', 'item_004'])

    const totalItensSomados = pedidos.reduce<number>(
      (acc, p) => {
        const itens = p.itens_pedido ?? []
        if (!filtroItemIds) return acc + itens.length
        return acc + itens.filter(i => filtroItemIds.has(i.id_item)).length
      },
      0,
    )

    // item_001 está no primeiro pedido, item_004 no segundo
    expect(totalItensSomados).toBe(2)
  })

  it('sem filtroItemIds, conta TODOS os itens', () => {
    const pedidos = [
      { itens_pedido: ITENS_PEDIDO.slice(0, 3) },  // 3 itens
      { itens_pedido: ITENS_PEDIDO.slice(3, 5) },   // 2 itens
    ]
    const filtroItemIds = criarFiltroItemIds(undefined)

    const totalItensSomados = pedidos.reduce<number>(
      (acc, p) => {
        const itens = p.itens_pedido ?? []
        if (!filtroItemIds) return acc + itens.length
        return acc + itens.filter(i => filtroItemIds.has(i.id_item)).length
      },
      0,
    )

    expect(totalItensSomados).toBe(5)
  })
})

describe('item_ids — cenários de seleção mista', () => {
  it('selecionar pedido A + itens do pedido B → pedido A edita todos, pedido B edita só itens selecionados', () => {
    // No frontend, quando pedidos são selecionados, item_ids é undefined → todos itens
    // A seleção mista não é possível no mesmo payload: ou é pedidos ou é itens
    // Este teste verifica que a lógica no frontend escolhe corretamente
    const pedidosSelecionados = [{ id: 'p1' }]
    const itensSelecionados = [{ id: 'item_003', pedido_id: 'p2' }]

    // Regra: se há pedidos selecionados, item_ids é undefined
    const itensSelecionadosIds =
      pedidosSelecionados.length === 0 && itensSelecionados.length > 0
        ? itensSelecionados.map(i => i.id)
        : undefined

    expect(itensSelecionadosIds).toBeUndefined()
  })
})
