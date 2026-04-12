// @vitest-environment jsdom
/**
 * Testes funcionais — useGTExpandir (integração com componente React)
 *
 * Diferença dos unitários: aqui renderizamos um componente real que usa o hook
 * e verificamos o DOM resultante, simulando a perspectiva do usuário.
 *
 * Cobre:
 *   F01 — Expansão renderiza filhos no DOM
 *   F02 — Badge tipo_operacao do filho reflete o pai no momento da expansão
 *   F03 — Editar pai → filhos recarregam com tipo_operacao atualizado
 *   F04 — Colapsar remove filhos do DOM, re-expandir do cache não recarrega
 *   F05 — colapsarTodos remove todos os filhos do DOM
 */

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react'
import { useGTExpandir } from '../../../../nucleo-global/Tabelas/tabela-virtual-global/src/hooks/useGTExpandir'

// ── Tipos ────────────────────────────────────────────────────────────────────

interface Pedido {
  id: string
  numero: string
  tipo_operacao: 'importacao' | 'exportacao'
}

interface Item {
  id: string
  pedidoId: string
  _p: { tipo_operacao: 'importacao' | 'exportacao' }
}

const pedidoId = (p: Pedido) => p.id

// ── Componente de teste ───────────────────────────────────────────────────────

interface TestTableProps {
  dados: Pedido[]
  onCarregarFilhos: (p: Pedido) => Promise<Item[]>
}

function TestTable({ dados, onCarregarFilhos }: TestTableProps) {
  const { expandidos, filhosCache, toggle, colapsarTodos } = useGTExpandir<Pedido, Item>(
    onCarregarFilhos,
    dados,
    pedidoId,
  )

  return (
    <div>
      <button data-testid="colapsar-todos" onClick={colapsarTodos}>Colapsar todos</button>
      {dados.map(pedido => (
        <div key={pedido.id}>
          <div data-testid={`pai-${pedido.id}`}>
            <button
              data-testid={`toggle-${pedido.id}`}
              onClick={() => toggle(pedido.id, pedido)}
              aria-expanded={expandidos.has(pedido.id)}
            >
              {pedido.numero}
            </button>
            <span data-testid={`badge-pai-${pedido.id}`}>{pedido.tipo_operacao}</span>
          </div>

          {expandidos.has(pedido.id) && (filhosCache.get(pedido.id) ?? []).map(item => (
            <div key={item.id} data-testid={`filho-${item.id}`}>
              <span data-testid={`badge-filho-${item.id}`}>{item._p.tipo_operacao}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Wrappers de controle ───────────────────────────────────────────────────────

function criarPedido(id: string, tipo: 'importacao' | 'exportacao'): Pedido {
  return { id, numero: `PO-${id}`, tipo_operacao: tipo }
}

function criarItens(pedido: Pedido): Item[] {
  return [
    { id: `${pedido.id}-i1`, pedidoId: pedido.id, _p: { tipo_operacao: pedido.tipo_operacao } },
    { id: `${pedido.id}-i2`, pedidoId: pedido.id, _p: { tipo_operacao: pedido.tipo_operacao } },
  ]
}

// ── F01 — Expansão renderiza filhos no DOM ────────────────────────────────────

describe('F01 — expansão renderiza filhos no DOM', () => {
  it('filhos aparecem após clicar no toggle', async () => {
    const pedido = criarPedido('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    render(<TestTable dados={[pedido]} onCarregarFilhos={onCarregarFilhos} />)

    expect(screen.queryByTestId('filho-p1-i1')).toBeNull()

    await act(async () => {
      fireEvent.click(screen.getByTestId('toggle-p1'))
    })

    await waitFor(() => expect(screen.getByTestId('filho-p1-i1')).toBeTruthy())
    expect(screen.getByTestId('filho-p1-i2')).toBeTruthy()
    expect(onCarregarFilhos).toHaveBeenCalledOnce()
  })
})

// ── F02 — Badge filho reflete tipo_operacao do pai ────────────────────────────

describe('F02 — badge tipo_operacao do filho reflete o pai na expansão', () => {
  it('importacao: filho exibe importacao', async () => {
    const pedido = criarPedido('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    render(<TestTable dados={[pedido]} onCarregarFilhos={onCarregarFilhos} />)

    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await waitFor(() => screen.getByTestId('badge-filho-p1-i1'))

    expect(screen.getByTestId('badge-filho-p1-i1').textContent).toBe('importacao')
  })

  it('exportacao: filho exibe exportacao', async () => {
    const pedido = criarPedido('p1', 'exportacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    render(<TestTable dados={[pedido]} onCarregarFilhos={onCarregarFilhos} />)

    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await waitFor(() => screen.getByTestId('badge-filho-p1-i1'))

    expect(screen.getByTestId('badge-filho-p1-i1').textContent).toBe('exportacao')
  })
})

// ── F03 — Editar pai → filhos recarregam com novo tipo_operacao ───────────────

describe('F03 — editar tipo_operacao do pai recarrega filhos', () => {
  it('após edição do pai, filhos refletem novo tipo_operacao', async () => {
    const pedidoOriginal = criarPedido('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    const { rerender } = render(
      <TestTable dados={[pedidoOriginal]} onCarregarFilhos={onCarregarFilhos} />,
    )

    // Expandir
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await waitFor(() => screen.getByTestId('badge-filho-p1-i1'))

    expect(screen.getByTestId('badge-filho-p1-i1').textContent).toBe('importacao')
    expect(onCarregarFilhos).toHaveBeenCalledTimes(1)

    // Simular edição: nova referência com tipo diferente
    const pedidoEditado = criarPedido('p1', 'exportacao')

    await act(async () => {
      rerender(<TestTable dados={[pedidoEditado]} onCarregarFilhos={onCarregarFilhos} />)
    })

    // Aguardar recarregamento
    await waitFor(() => expect(onCarregarFilhos).toHaveBeenCalledTimes(2))

    // Badge dos filhos agora deve refletir exportacao
    await waitFor(() =>
      expect(screen.getByTestId('badge-filho-p1-i1').textContent).toBe('exportacao')
    )
  })
})

// ── F04 — Colapsar e re-expandir do cache ─────────────────────────────────────

describe('F04 — colapsar remove filhos do DOM; re-expandir usa cache', () => {
  it('filhos somem após colapsar e reaparecem ao re-expandir sem nova chamada', async () => {
    const pedido = criarPedido('p1', 'importacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    render(<TestTable dados={[pedido]} onCarregarFilhos={onCarregarFilhos} />)

    // Expandir
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await waitFor(() => screen.getByTestId('filho-p1-i1'))

    // Colapsar
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    expect(screen.queryByTestId('filho-p1-i1')).toBeNull()

    // Re-expandir
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await waitFor(() => screen.getByTestId('filho-p1-i1'))

    // Apenas 1 carregamento
    expect(onCarregarFilhos).toHaveBeenCalledTimes(1)
  })
})

// ── F05 — colapsarTodos remove todos os filhos do DOM ────────────────────────

describe('F05 — colapsarTodos remove todos os filhos do DOM', () => {
  it('após colapsarTodos nenhuma linha filho é visível', async () => {
    const p1 = criarPedido('p1', 'importacao')
    const p2 = criarPedido('p2', 'exportacao')
    const onCarregarFilhos = vi.fn().mockImplementation((p: Pedido) =>
      Promise.resolve(criarItens(p))
    )

    render(<TestTable dados={[p1, p2]} onCarregarFilhos={onCarregarFilhos} />)

    // Expandir ambos
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p1')) })
    await act(async () => { fireEvent.click(screen.getByTestId('toggle-p2')) })

    await waitFor(() => screen.getByTestId('filho-p1-i1'))
    await waitFor(() => screen.getByTestId('filho-p2-i1'))

    // Colapsar todos
    act(() => { fireEvent.click(screen.getByTestId('colapsar-todos')) })

    expect(screen.queryByTestId('filho-p1-i1')).toBeNull()
    expect(screen.queryByTestId('filho-p2-i1')).toBeNull()
  })
})
