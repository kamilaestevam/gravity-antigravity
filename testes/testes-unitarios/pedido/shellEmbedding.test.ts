// @vitest-environment node
/**
 * Testes unitários — Shell Embedding (App.tsx)
 *
 * Testa a lógica de extração de routeKey do App.tsx do Pedido,
 * garantindo que funciona corretamente em dois contextos:
 *   - Standalone (porta 5179): paths sem prefixo de produto
 *   - Embarcado no Shell (porta 8000): paths com /produto/pedido/
 */

import { describe, it, expect } from 'vitest'

// ── Lógica extraída do App.tsx (deve permanecer em sincronia) ─────────────────

const PRODUCT_ID = 'pedido'

const ROUTE_LABELS: Record<string, string> = {
  'pedidos':           'Lista',
  'pedidos/dashboard': 'Dashboard',
  'pedidos/kanban':    'Kanban',
  'pedidos/novo':      'Novo Pedido',
  'historico':         'Histórico',
  'configuracoes':     'Configurações',
}

function getRouteKey(pathname: string): string {
  const segments    = pathname.split('/').filter(Boolean)
  const productIdx  = segments.findIndex(s => s === PRODUCT_ID)
  const relSegments = productIdx >= 0 ? segments.slice(productIdx + 1) : segments
  return relSegments.join('/')
}

function getPageLabel(pathname: string): string {
  return ROUTE_LABELS[getRouteKey(pathname)] ?? 'Lista'
}

// ── Testes ────────────────────────────────────────────────────────────────────

describe('getRouteKey — standalone (porta 5179)', () => {
  it('raiz vazia → routeKey vazio', () => {
    expect(getRouteKey('/')).toBe('')
  })

  it('/pedidos → "pedidos"', () => {
    expect(getRouteKey('/pedidos')).toBe('pedidos')
  })

  it('/pedidos/dashboard → "pedidos/dashboard"', () => {
    expect(getRouteKey('/pedidos/dashboard')).toBe('pedidos/dashboard')
  })

  it('/pedidos/kanban → "pedidos/kanban"', () => {
    expect(getRouteKey('/pedidos/kanban')).toBe('pedidos/kanban')
  })

  it('/configuracoes → "configuracoes"', () => {
    expect(getRouteKey('/configuracoes')).toBe('configuracoes')
  })

  it('/historico → "historico"', () => {
    expect(getRouteKey('/historico')).toBe('historico')
  })
})

describe('getRouteKey — embarcado no shell (porta 8000, /produto/pedido/)', () => {
  it('/produto/pedido/ → routeKey vazio (raiz do produto)', () => {
    expect(getRouteKey('/produto/pedido/')).toBe('')
  })

  it('/produto/pedido/pedidos → "pedidos"', () => {
    expect(getRouteKey('/produto/pedido/pedidos')).toBe('pedidos')
  })

  it('/produto/pedido/pedidos/dashboard → "pedidos/dashboard"', () => {
    expect(getRouteKey('/produto/pedido/pedidos/dashboard')).toBe('pedidos/dashboard')
  })

  it('/produto/pedido/pedidos/kanban → "pedidos/kanban"', () => {
    expect(getRouteKey('/produto/pedido/pedidos/kanban')).toBe('pedidos/kanban')
  })

  it('/produto/pedido/configuracoes → "configuracoes"', () => {
    expect(getRouteKey('/produto/pedido/configuracoes')).toBe('configuracoes')
  })

  it('/produto/pedido/historico → "historico"', () => {
    expect(getRouteKey('/produto/pedido/historico')).toBe('historico')
  })

  it('/produto/pedido/pedidos/novo → "pedidos/novo"', () => {
    expect(getRouteKey('/produto/pedido/pedidos/novo')).toBe('pedidos/novo')
  })
})

describe('getPageLabel — resolução de labels', () => {
  it('standalone /pedidos → "Lista"', () => {
    expect(getPageLabel('/pedidos')).toBe('Lista')
  })

  it('embarcado /produto/pedido/pedidos → "Lista"', () => {
    expect(getPageLabel('/produto/pedido/pedidos')).toBe('Lista')
  })

  it('embarcado /produto/pedido/pedidos/dashboard → "Dashboard"', () => {
    expect(getPageLabel('/produto/pedido/pedidos/dashboard')).toBe('Dashboard')
  })

  it('embarcado /produto/pedido/pedidos/kanban → "Kanban"', () => {
    expect(getPageLabel('/produto/pedido/pedidos/kanban')).toBe('Kanban')
  })

  it('embarcado /produto/pedido/configuracoes → "Configurações"', () => {
    expect(getPageLabel('/produto/pedido/configuracoes')).toBe('Configurações')
  })

  it('embarcado /produto/pedido/historico → "Histórico"', () => {
    expect(getPageLabel('/produto/pedido/historico')).toBe('Histórico')
  })

  it('rota desconhecida → fallback "Lista"', () => {
    expect(getPageLabel('/produto/pedido/rota-inexistente')).toBe('Lista')
  })

  it('raiz do produto embarcado → fallback "Lista"', () => {
    expect(getPageLabel('/produto/pedido/')).toBe('Lista')
  })
})

describe('getRouteKey — consistência standalone vs embarcado', () => {
  const rotas = [
    '/pedidos',
    '/pedidos/dashboard',
    '/pedidos/kanban',
    '/pedidos/novo',
    '/historico',
    '/configuracoes',
  ]

  for (const rota of rotas) {
    it(`"${rota}" produz mesmo routeKey standalone e embarcado`, () => {
      const standalone  = getRouteKey(rota)
      const embarcado   = getRouteKey(`/produto/pedido${rota}`)
      expect(embarcado).toBe(standalone)
    })
  }
})
