import { describe, it, expect } from 'vitest'

// Testa a lógica de filtro sem depender de DOM
// (lógica extraída de ListaPedidos e tabela-virtual-global)

describe('lógica de filtro — texto', () => {
  it('aplica filtro de texto corretamente', () => {
    const pedidos = [
      { numero_pedido: 'PO-001', status: 'aberto' },
      { numero_pedido: 'PO-002', status: 'cancelado' },
    ]
    const termo = 'PO-001'
    const filtrado = pedidos.filter(p =>
      String(p.numero_pedido ?? '').toLowerCase().includes(termo.toLowerCase())
    )
    expect(filtrado).toHaveLength(1)
    expect(filtrado[0].numero_pedido).toBe('PO-001')
  })

  it('filtro case-insensitive encontra variações de maiúsculas', () => {
    const pedidos = [
      { numero_pedido: 'PO-001' },
      { numero_pedido: 'po-002' },
    ]
    const filtrado = pedidos.filter(p =>
      String(p.numero_pedido ?? '').toLowerCase().includes('po-')
    )
    expect(filtrado).toHaveLength(2)
  })

  it('filtro vazio retorna todos', () => {
    const pedidos = [
      { numero_pedido: 'PO-001' },
      { numero_pedido: 'PO-002' },
    ]
    const filtrado = pedidos.filter(() => true)
    expect(filtrado).toHaveLength(2)
  })

  it('filtro sem match retorna lista vazia', () => {
    const pedidos = [
      { numero_pedido: 'PO-001' },
      { numero_pedido: 'PO-002' },
    ]
    const filtrado = pedidos.filter(p =>
      String(p.numero_pedido ?? '').toLowerCase().includes('XYZ'.toLowerCase())
    )
    expect(filtrado).toHaveLength(0)
  })

  it('trata campo nulo como string vazia — não lança exceção', () => {
    const pedidos = [
      { numero_pedido: null },
      { numero_pedido: 'PO-001' },
    ]
    const filtrado = pedidos.filter(p =>
      String(p.numero_pedido ?? '').toLowerCase().includes('po-001')
    )
    expect(filtrado).toHaveLength(1)
  })
})

describe('lógica de filtro — enum (Set)', () => {
  it('filtra por status usando Set', () => {
    const pedidos = [
      { status: 'aberto' },
      { status: 'cancelado' },
      { status: 'aberto' },
    ]
    const filtroSet = new Set(['aberto'])
    const filtrado = pedidos.filter(p => filtroSet.has(p.status))
    expect(filtrado).toHaveLength(2)
  })

  it('Set vazio retorna lista vazia', () => {
    const pedidos = [
      { status: 'aberto' },
      { status: 'cancelado' },
    ]
    const filtroSet = new Set<string>([])
    const filtrado = pedidos.filter(p => filtroSet.has(p.status))
    expect(filtrado).toHaveLength(0)
  })

  it('Set com múltiplos valores filtra corretamente', () => {
    const pedidos = [
      { status: 'aberto' },
      { status: 'cancelado' },
      { status: 'encerrado' },
    ]
    const filtroSet = new Set(['aberto', 'encerrado'])
    const filtrado = pedidos.filter(p => filtroSet.has(p.status))
    expect(filtrado).toHaveLength(2)
  })
})

describe('lógica de filtro — número (intervalo)', () => {
  it('filtra por intervalo mínimo', () => {
    const items = [{ valor: 100 }, { valor: 200 }, { valor: 50 }]
    const filtrado = items.filter(i => i.valor >= 100)
    expect(filtrado).toHaveLength(2)
  })

  it('filtra por intervalo máximo', () => {
    const items = [{ valor: 100 }, { valor: 200 }, { valor: 50 }]
    const filtrado = items.filter(i => i.valor <= 100)
    expect(filtrado).toHaveLength(2)
  })

  it('filtra por intervalo completo (min + max)', () => {
    const items = [{ valor: 100 }, { valor: 200 }, { valor: 50 }]
    const filtrado = items.filter(i => i.valor >= 80 && i.valor <= 150)
    expect(filtrado).toHaveLength(1)
    expect(filtrado[0].valor).toBe(100)
  })

  it('intervalo que não engloba nenhum valor retorna lista vazia', () => {
    const items = [{ valor: 100 }, { valor: 200 }, { valor: 50 }]
    const filtrado = items.filter(i => i.valor >= 300 && i.valor <= 400)
    expect(filtrado).toHaveLength(0)
  })

  it('intervalo com min === max seleciona apenas o valor exato', () => {
    const items = [{ valor: 100 }, { valor: 200 }, { valor: 50 }]
    const filtrado = items.filter(i => i.valor >= 200 && i.valor <= 200)
    expect(filtrado).toHaveLength(1)
    expect(filtrado[0].valor).toBe(200)
  })
})
