/**
 * Testes funcionais — KanbanGlobal (componente + integração)
 * Localização: testes/testes-funcionais/nucleo-global/kanban-global/kanban-component.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobre: renderização de colunas, distribuição de itens, filterFn, colunasVisiveis,
 *         isLoading, onCardClick, modoGlobal, onMoverItem, integração com avaliarRegras
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import type { KanbanColunaDef, KanbanItem } from '../../../../nucleo-global/Kanban/kanban-global/src/tipos'

// ── Mocks de dependências externas ────────────────────────────────────────────

// CSS — ignorado em testes
vi.mock('../../../../nucleo-global/Kanban/kanban-global/src/kanban-global.css',    () => ({}))
vi.mock('../../../../nucleo-global/Kanban/kanban-global/src/kanban-configuracoes.css', () => ({}))

// @dnd-kit — mock completo para evitar APIs de ponteiro/teclado que não existem em jsdom
vi.mock('@dnd-kit/core', () => {
  const React = require('react')
  return {
    DndContext:     ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { 'data-testid': 'dnd-context' }, children),
    DragOverlay:    ({ children }: { children?: React.ReactNode }) =>
      children ? React.createElement('div', { 'data-testid': 'drag-overlay' }, children) : null,
    useSensor:      () => ({}),
    useSensors:     (...args: unknown[]) => args,
    PointerSensor:  class {},
    KeyboardSensor: class {},
    TouchSensor:    class {},
    useDroppable:   () => ({ setNodeRef: vi.fn(), isOver: false }),
  }
})

vi.mock('@dnd-kit/sortable', () => {
  const React = require('react')
  return {
    SortableContext:          ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', null, children),
    useSortable:              () => ({
      setNodeRef:  vi.fn(),
      listeners:   {},
      attributes:  {},
      transform:   null,
      transition:  null,
      isDragging:  false,
    }),
    verticalListSortingStrategy: {},
    arrayMove: (arr: unknown[], from: number, to: number) => {
      const result = [...arr]
      const [item] = result.splice(from, 1)
      result.splice(to, 0, item)
      return result
    },
  }
})

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}))

// @phosphor-icons — retorna spans com data-icon para identificar nos testes
vi.mock('@phosphor-icons/react', () => {
  const React = require('react')
  const makeIcon = (name: string) =>
    function MockIcon(props: Record<string, unknown>) {
      return React.createElement('span', { 'data-icon': name, ...props })
    }
  return {
    SortDescending:   makeIcon('SortDescending'),
    SortAscending:    makeIcon('SortAscending'),
    TextAa:           makeIcon('TextAa'),
    Check:            makeIcon('Check'),
    X:                makeIcon('X'),
    Tray:             makeIcon('Tray'),
    ArrowFatDown:     makeIcon('ArrowFatDown'),
    CaretRight:       makeIcon('CaretRight'),
    CaretDown:        makeIcon('CaretDown'),
    DotsThreeVertical:makeIcon('DotsThreeVertical'),
    BuildingOffice:   makeIcon('BuildingOffice'),
  }
})

// ── Import do componente (após mocks) ─────────────────────────────────────────

import { KanbanGlobal } from '../../../../nucleo-global/Kanban/kanban-global/src/KanbanGlobal'
import { KanbanConfiguracoes } from '../../../../nucleo-global/Kanban/kanban-global/src/KanbanConfiguracoes'
import { avaliarRegras } from '../../../../nucleo-global/Kanban/kanban-global/src/regras'

// ── Fixtures ──────────────────────────────────────────────────────────────────

interface Pedido extends KanbanItem {
  titulo: string
  valor:  number
  data:   string
}

const COLUNAS: KanbanColunaDef[] = [
  { key: 'pendente',  label: 'Pendente',  color: '#f59e0b' },
  { key: 'aprovado',  label: 'Aprovado',  color: '#22c55e' },
  { key: 'cancelado', label: 'Cancelado', color: '#ef4444', colapsavel: true },
]

function makeItens(): Pedido[] {
  return [
    { id: 'p1', colunaKey: 'pendente',  titulo: 'Pedido Alpha', valor: 100, data: '2026-01-01T00:00:00Z' },
    { id: 'p2', colunaKey: 'pendente',  titulo: 'Pedido Beta',  valor: 500, data: '2026-02-01T00:00:00Z' },
    { id: 'p3', colunaKey: 'aprovado',  titulo: 'Pedido Gamma', valor: 200, data: '2026-03-01T00:00:00Z' },
    { id: 'p4', colunaKey: 'cancelado', titulo: 'Pedido Delta', valor:  50, data: '2026-04-01T00:00:00Z' },
  ]
}

function renderCard(item: Pedido) {
  return <div data-testid="card-content">{item.titulo}</div>
}

// ── 1. Renderização básica ────────────────────────────────────────────────────

describe('KanbanGlobal — renderização', () => {
  it('exibe cabeçalhos de todas as colunas', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })

  it('exibe board com data-testid correto', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} testIdPrefix="meu-kb" />)
    expect(screen.getByTestId('meu-kb-board')).toBeInTheDocument()
  })

  it('exibe data-testid padrão "kg-board" quando não fornecido', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.getByTestId('kg-board')).toBeInTheDocument()
  })

  it('renderiza toolbarSlot quando fornecido', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        toolbarSlot={<div data-testid="toolbar">Filtros</div>}
      />,
    )
    expect(screen.getByTestId('toolbar')).toBeInTheDocument()
  })

  it('não renderiza toolbarSlot quando não fornecido', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.queryByTestId('toolbar')).toBeNull()
  })
})

// ── 2. Distribuição de itens por coluna ───────────────────────────────────────

describe('KanbanGlobal — distribuição de itens', () => {
  it('exibe todos os cards', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.getAllByTestId('card-content')).toHaveLength(4)
  })

  it('exibe conteúdo correto de cada card', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.getByText('Pedido Alpha')).toBeInTheDocument()
    expect(screen.getByText('Pedido Gamma')).toBeInTheDocument()
  })

  it('exibe emptyLabel quando coluna está vazia', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={[makeItens()[0]!]}  // só coluna pendente tem item
        renderCard={renderCard}
        emptyLabel="Vazio aqui"
      />,
    )
    const textos = screen.getAllByText('Vazio aqui')
    expect(textos.length).toBeGreaterThanOrEqual(2) // aprovado + cancelado
  })

  it('usa "Nenhum item" como emptyLabel padrão', () => {
    render(
      <KanbanGlobal
        colunas={[COLUNAS[0]!]}
        itens={[]}
        renderCard={renderCard}
      />,
    )
    expect(screen.getByText('Nenhum item')).toBeInTheDocument()
  })
})

// ── 3. filterFn ───────────────────────────────────────────────────────────────

describe('KanbanGlobal — filterFn', () => {
  it('exibe apenas itens que passam no filtro', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        filterFn={item => (item as Pedido).valor >= 200}
      />,
    )
    const cards = screen.getAllByTestId('card-content')
    expect(cards).toHaveLength(2) // Beta (500) e Gamma (200)
    expect(screen.getByText('Pedido Beta')).toBeInTheDocument()
    expect(screen.getByText('Pedido Gamma')).toBeInTheDocument()
    expect(screen.queryByText('Pedido Alpha')).toBeNull()
  })

  it('exibe tudo quando filterFn retorna true sempre', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        filterFn={() => true}
      />,
    )
    expect(screen.getAllByTestId('card-content')).toHaveLength(4)
  })

  it('exibe emptyLabel em todas colunas quando filterFn rejeita tudo', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        filterFn={() => false}
        emptyLabel="Sem resultados"
      />,
    )
    const vazio = screen.getAllByText('Sem resultados')
    expect(vazio).toHaveLength(3) // uma por coluna
  })
})

// ── 4. colunasVisiveis ────────────────────────────────────────────────────────

describe('KanbanGlobal — colunasVisiveis', () => {
  it('exibe apenas as colunas permitidas', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        colunasVisiveis={['pendente', 'aprovado']}
      />,
    )
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(screen.queryByText('Cancelado')).toBeNull()
  })

  it('exibe uma única coluna quando colunasVisiveis tem só uma', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        colunasVisiveis={['aprovado']}
      />,
    )
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(screen.queryByText('Pendente')).toBeNull()
    expect(screen.queryByText('Cancelado')).toBeNull()
  })

  it('exibe todas as colunas quando colunasVisiveis não é fornecido', () => {
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.getByText('Pendente')).toBeInTheDocument()
    expect(screen.getByText('Aprovado')).toBeInTheDocument()
    expect(screen.getByText('Cancelado')).toBeInTheDocument()
  })
})

// ── 5. isLoading (skeleton) ───────────────────────────────────────────────────

describe('KanbanGlobal — isLoading', () => {
  it('não exibe cards quando isLoading=true', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        isLoading
      />,
    )
    expect(screen.queryByTestId('card-content')).toBeNull()
  })

  it('exibe cards normalmente quando isLoading=false', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        isLoading={false}
      />,
    )
    expect(screen.getAllByTestId('card-content')).toHaveLength(4)
  })

  it('exibe skeletons quando isLoading=true (kg-skeleton class)', () => {
    const { container } = render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={[]}
        renderCard={renderCard}
        isLoading
        skeletonCount={2}
      />,
    )
    const skeletons = container.querySelectorAll('.kg-skeleton-card')
    expect(skeletons.length).toBe(6) // 3 colunas × 2 skeletons
  })
})

// ── 6. onCardClick ────────────────────────────────────────────────────────────

describe('KanbanGlobal — onCardClick', () => {
  it('chama onCardClick com o item ao clicar', () => {
    const onCardClick = vi.fn()
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        onCardClick={onCardClick}
        isReadOnly
      />,
    )
    fireEvent.click(screen.getByText('Pedido Alpha'))
    expect(onCardClick).toHaveBeenCalledOnce()
    expect(onCardClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'p1' }))
  })

  it('não chama onCardClick quando não fornecido', () => {
    // Sem erro ao clicar quando callback não fornecido
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(() => fireEvent.click(screen.getByText('Pedido Alpha'))).not.toThrow()
  })
})

// ── 7. modoGlobal (cross-tenant) ──────────────────────────────────────────────

describe('KanbanGlobal — modoGlobal', () => {
  it('exibe badge de tenant quando modoGlobal=true e tenantLabel definido', () => {
    const itensGlobal: Pedido[] = [
      { id: 'p1', colunaKey: 'pendente', titulo: 'Pedido Cross', valor: 100, data: '2026-01-01T00:00:00Z',
        tenantId: 'tenant-a', tenantLabel: 'Empresa A', tenantColor: '#6366f1' },
    ]
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={itensGlobal}
        renderCard={renderCard}
        modoGlobal
      />,
    )
    expect(screen.getByText('Empresa A')).toBeInTheDocument()
  })

  it('não exibe badge de tenant quando modoGlobal=false', () => {
    const itensGlobal: Pedido[] = [
      { id: 'p1', colunaKey: 'pendente', titulo: 'Pedido Cross', valor: 100, data: '2026-01-01T00:00:00Z',
        tenantLabel: 'Empresa A' },
    ]
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={itensGlobal}
        renderCard={renderCard}
        modoGlobal={false}
      />,
    )
    expect(screen.queryByText('Empresa A')).toBeNull()
  })
})

// ── 8. Integração com avaliarRegras ───────────────────────────────────────────

describe('integração avaliarRegras + KanbanGlobal', () => {
  it('avaliarRegras identifica coluna correta para mover automaticamente', () => {
    const itens = makeItens()
    const item = itens.find(i => i.id === 'p3')! // Gamma, aprovado, valor=200

    const { colunaDestino } = (() => {
      const destino = avaliarRegras(
        item,
        [{ id: 'r1', ativo: true, campoKey: 'valor', operador: 'maior', valor: '100', colunaDestino: 'cancelado', prioridade: 0 }],
        (i, k) => (i as Pedido)[k as keyof Pedido] as unknown,
        item.colunaKey,
      )
      return { colunaDestino: destino }
    })()

    expect(colunaDestino).toBe('cancelado')
  })

  it('avaliarRegras retorna null quando item já está na coluna destino', () => {
    const item: Pedido = { id: 'p1', colunaKey: 'cancelado', titulo: 'X', valor: 50, data: '' }
    const destino = avaliarRegras(
      item,
      [{ id: 'r1', ativo: true, campoKey: 'valor', operador: 'menor', valor: '100', colunaDestino: 'cancelado', prioridade: 0 }],
      (i, k) => (i as Pedido)[k as keyof Pedido] as unknown,
      'cancelado',
    )
    expect(destino).toBeNull()
  })
})

// ── 9. isReadOnly ─────────────────────────────────────────────────────────────

describe('KanbanGlobal — isReadOnly', () => {
  it('renderiza sem erros em modo read-only', () => {
    expect(() =>
      render(
        <KanbanGlobal
          colunas={COLUNAS}
          itens={makeItens()}
          renderCard={renderCard}
          isReadOnly
        />,
      ),
    ).not.toThrow()
  })

  it('ativa isReadOnly implícito quando onMoverItem não fornecido', () => {
    // Sem onMoverItem → isReadOnly=true implícito (sem botão mover)
    render(<KanbanGlobal colunas={COLUNAS} itens={makeItens()} renderCard={renderCard} />)
    expect(screen.queryByTitle('Mover para…')).toBeNull()
  })
})

// ── 10. colunaFooterSlot ──────────────────────────────────────────────────────

describe('KanbanGlobal — colunaFooterSlot', () => {
  it('exibe footer slot em cada coluna', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={makeItens()}
        renderCard={renderCard}
        colunaFooterSlot={col => (
          <button data-testid={`footer-${col.key}`}>+ Adicionar</button>
        )}
      />,
    )
    expect(screen.getByTestId('footer-pendente')).toBeInTheDocument()
    expect(screen.getByTestId('footer-aprovado')).toBeInTheDocument()
    expect(screen.getByTestId('footer-cancelado')).toBeInTheDocument()
  })
})

// ── 11. labels customizáveis ──────────────────────────────────────────────────

describe('KanbanGlobal — labels', () => {
  it('usa labels customizados quando fornecidos', () => {
    render(
      <KanbanGlobal
        colunas={COLUNAS}
        itens={[]}
        renderCard={renderCard}
        emptyLabel="Sem itens no momento"
      />,
    )
    expect(screen.getAllByText('Sem itens no momento')).toHaveLength(3)
  })
})

// ── 12. barrel exports ────────────────────────────────────────────────────────

describe('barrel exports', () => {
  it('KanbanGlobal é uma função React', () => {
    expect(KanbanGlobal).toBeTypeOf('function')
  })

  it('KanbanConfiguracoes é uma função React', () => {
    expect(KanbanConfiguracoes).toBeTypeOf('function')
  })

  it('avaliarRegras é uma função', () => {
    expect(avaliarRegras).toBeTypeOf('function')
  })
})
