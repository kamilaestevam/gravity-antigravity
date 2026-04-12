// @vitest-environment jsdom
/**
 * Testes unitários — DashboardToolbar
 * Localização: testes/testes-unitarios/nucleo-global/dashboard-global/DashboardToolbar.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura alvo: 80% (nucleo-global)
 *
 * TU-01: label "Status" ausente no DOM; divisor vertical presente
 * TU-02: botão "Personalizar" — ghost no estado padrão, primário ao editar
 * TU-03: chip "Todos" presente e ativo por padrão; limpa seleção ao clicar
 * TU-04: prop statusCounts exibe contagem "(n)" nos chips
 * TU-05: contagem ausente quando statusCounts não fornecido
 * TU-06: chip com count=0 tem aria-disabled=true e não dispara onClick
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardToolbar } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { DashboardToolbarProps } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { GlobalSlicers, ActiveFilter } from '../../../../nucleo-global/Dashboard/dashboard-global/src/tipos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const slicersSemFiltro: GlobalSlicers = { period: 'current_year', status: [] }
const slicersComStatus: GlobalSlicers = { period: 'current_year', status: ['abertos'] }

const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos']
const STATUS_LABELS: Record<string, string> = {
  abertos: 'Abertos',
  em_andamento: 'Em Andamento',
  atrasados: 'Atrasados',
  concluidos: 'Concluídos',
}

function buildProps(overrides: Partial<DashboardToolbarProps> = {}): DashboardToolbarProps {
  return {
    slicers: slicersSemFiltro,
    onPeriodChange: vi.fn(),
    onStatusChange: vi.fn(),
    activeFilters: [] as ActiveFilter[],
    onClearFilters: vi.fn(),
    editMode: false,
    onEditModeChange: vi.fn(),
    statusOptions: STATUS_OPTIONS,
    statusLabels: STATUS_LABELS,
    ...overrides,
  }
}

// ─── TU-01: Remoção do label "Status" e presença do divisor ─────────────────

describe('TU-01 — label "Status" e divisor vertical', () => {
  it('não renderiza o texto "Status" solto no DOM', () => {
    render(<DashboardToolbar {...buildProps()} />)
    // Deve não haver um elemento com texto exato "Status" fora de contexto semântico
    const allText = screen.queryAllByText('Status')
    expect(allText).toHaveLength(0)
  })

  it('renderiza o divisor visual entre Período e chips de Status', () => {
    const { container } = render(<DashboardToolbar {...buildProps()} />)
    // Divisor tem aria-hidden="true"
    const divider = container.querySelector('[aria-hidden="true"]')
    expect(divider).not.toBeNull()
  })

  it('não exibe divisor quando statusOptions está vazio', () => {
    const { container } = render(<DashboardToolbar {...buildProps({ statusOptions: [] })} />)
    const divider = container.querySelector('[aria-hidden="true"]')
    expect(divider).toBeNull()
  })
})

// ─── TU-02: Botão "Reorganizar" — secondary vs accent ───────────────────────

describe('TU-02 — botão Reorganizar dashboard', () => {
  it('exibe "Reorganizar" quando editMode=false', () => {
    render(<DashboardToolbar {...buildProps({ editMode: false })} />)
    expect(screen.getByTestId('btn-reorganizar')).toHaveTextContent('Reorganizar')
  })

  it('usa estilo btn-secondary (bg-surface, text-primary) no estado padrão', () => {
    render(<DashboardToolbar {...buildProps({ editMode: false })} />)
    const btn = screen.getByTestId('btn-reorganizar')
    expect(btn.style.background).toBe('var(--bg-surface)')
    expect(btn.style.color).toBe('var(--text-primary)')
  })

  it('exibe "Concluir" quando editMode=true', () => {
    render(<DashboardToolbar {...buildProps({ editMode: true })} />)
    expect(screen.getByTestId('btn-reorganizar')).toHaveTextContent('Concluir')
  })

  it('usa estilo primário (background accent) no modo edição', () => {
    render(<DashboardToolbar {...buildProps({ editMode: true })} />)
    const btn = screen.getByTestId('btn-reorganizar')
    expect(btn.style.background).toBe('var(--accent)')
    // jsdom normaliza #fff → rgb(255, 255, 255)
    expect(btn.style.color).toMatch(/^(#fff|rgb\(255,\s*255,\s*255\))$/)
  })

  it('chama onEditModeChange ao clicar', () => {
    const onEditModeChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ onEditModeChange })} />)
    fireEvent.click(screen.getByTestId('btn-reorganizar'))
    expect(onEditModeChange).toHaveBeenCalledWith(true)
  })

  it('"Adicionar Dashboard" é sempre visível (não exige editMode)', () => {
    const onAddWidget = vi.fn()
    render(<DashboardToolbar {...buildProps({ editMode: false, onAddWidget })} />)
    expect(screen.getByTestId('btn-adicionar-dashboard')).toBeInTheDocument()
  })
})

// ─── TU-03: Chip "Todos" ─────────────────────────────────────────────────────

describe('TU-03 — chip Todos', () => {
  it('renderiza chip "Todos" como primeiro chip quando statusOptions não está vazio', () => {
    render(<DashboardToolbar {...buildProps()} />)
    expect(screen.getByTestId('status-chip-todos')).toBeInTheDocument()
  })

  it('"Todos" está ativo (estilo chipActive) quando nenhum status selecionado', () => {
    render(<DashboardToolbar {...buildProps({ slicers: slicersSemFiltro })} />)
    const chip = screen.getByTestId('status-chip-todos')
    // chipActive aplica background var(--bg-base)
    expect(chip.style.background).toBe('var(--bg-base)')
  })

  it('"Todos" não está ativo quando algum status está selecionado', () => {
    render(<DashboardToolbar {...buildProps({ slicers: slicersComStatus })} />)
    const chip = screen.getByTestId('status-chip-todos')
    expect(chip.style.background).not.toBe('var(--bg-base)')
  })

  it('clicar em "Todos" chama onStatusChange com array vazio', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ slicers: slicersComStatus, onStatusChange })} />)
    fireEvent.click(screen.getByTestId('status-chip-todos'))
    expect(onStatusChange).toHaveBeenCalledWith([])
  })

  it('"Todos" aparece antes dos outros chips no DOM', () => {
    render(<DashboardToolbar {...buildProps()} />)
    const todos = screen.getByTestId('status-chip-todos')
    const abertos = screen.getByTestId('status-chip-abertos')
    // compareDocumentPosition: 4 = DOCUMENT_POSITION_FOLLOWING (todos vem antes)
    expect(todos.compareDocumentPosition(abertos) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('não renderiza chips de status quando statusOptions está vazio', () => {
    render(<DashboardToolbar {...buildProps({ statusOptions: [] })} />)
    expect(screen.queryByTestId('status-chip-todos')).toBeNull()
  })
})

// ─── TU-04: statusCounts exibe contagens nos chips ───────────────────────────

describe('TU-04 — prop statusCounts exibe contagens', () => {
  const counts = { todos: 9, abertos: 6, em_andamento: 2, atrasados: 0, concluidos: 1 }

  it('renderiza contagem "(6)" no chip Abertos', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-abertos')
    expect(chip).toHaveTextContent('(6)')
  })

  it('renderiza contagem no chip Todos a partir da chave "todos"', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-todos')
    expect(chip).toHaveTextContent('(9)')
  })
})

// ─── TU-05: sem contagem quando statusCounts não fornecido ───────────────────

describe('TU-05 — ausência de contagens sem statusCounts', () => {
  it('não renderiza "(n)" quando statusCounts é undefined', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: undefined })} />)
    const chip = screen.getByTestId('status-chip-abertos')
    expect(chip.textContent).not.toMatch(/\(\d+\)/)
  })

  it('chip Todos não mostra contagem quando statusCounts ausente', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: undefined })} />)
    const chip = screen.getByTestId('status-chip-todos')
    expect(chip.textContent).not.toMatch(/\(\d+\)/)
  })
})

// ─── TU-06: chips com count=0 desabilitados ──────────────────────────────────

describe('TU-06 — chips desabilitados quando count=0', () => {
  const counts = { todos: 9, abertos: 6, em_andamento: 2, atrasados: 0, concluidos: 1 }

  it('chip "Atrasados" com count=0 tem aria-disabled="true"', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-atrasados')
    expect(chip.getAttribute('aria-disabled')).toBe('true')
  })

  it('chip "Atrasados" com count=0 não chama onStatusChange ao clicar', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ statusCounts: counts, onStatusChange })} />)
    fireEvent.click(screen.getByTestId('status-chip-atrasados'))
    expect(onStatusChange).not.toHaveBeenCalled()
  })

  it('chip com count>0 não está desabilitado', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-abertos')
    // aria-disabled={false} renderiza como "false" no DOM (não null)
    expect(chip.getAttribute('aria-disabled')).not.toBe('true')
  })

  it('chip com count=0 tem cursor not-allowed', () => {
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-atrasados')
    expect(chip.style.cursor).toBe('not-allowed')
  })
})

// ─── TU-10: PeriodDropdown — abertura, seleção e calendário inline ──────────

describe('TU-10 — PeriodDropdown interações', () => {
  it('abre a lista de opções ao clicar no trigger', () => {
    render(<DashboardToolbar {...buildProps()} />)
    // Trigger do período — texto do valor selecionado (current_year → "Ano atual")
    const trigger = screen.getByRole('button', { name: /Ano atual/i })
    fireEvent.click(trigger)
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('selecionar opção "30d" chama onPeriodChange com "30d"', () => {
    const onPeriodChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ onPeriodChange })} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Últimos 30 dias/i }))
    expect(onPeriodChange).toHaveBeenCalledWith('30d')
  })

  it('selecionar "Período personalizado" exibe o painel do calendário', () => {
    render(<DashboardToolbar {...buildProps()} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Período personalizado/i }))
    expect(screen.getByTestId('calendario-painel-global')).toBeInTheDocument()
  })

  it('fecha a lista ao clicar fora do dropdown', () => {
    render(<DashboardToolbar {...buildProps()} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    // Dispara mousedown fora do componente
    fireEvent.mouseDown(document.body)
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('exibe label formatado para período custom (ex: custom:2026-01-01:2026-03-31)', () => {
    render(<DashboardToolbar {...buildProps({
      slicers: { period: 'custom:2026-01-01:2026-03-31', status: [] },
    })} />)
    // formatCustomLabel → "1 Jan 2026 – 31 Mar 2026"
    expect(screen.getByText(/Jan 2026/)).toBeInTheDocument()
  })
})

// ─── TU-11 (renumerado): clicar chip ativo remove status; clicar chip inativo adiciona ─────

describe('TU-11 — toggle de chip de status', () => {
  it('clicar chip inativo adiciona status ao array', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ slicers: slicersSemFiltro, onStatusChange })} />)
    fireEvent.click(screen.getByTestId('status-chip-abertos'))
    expect(onStatusChange).toHaveBeenCalledWith(['abertos'])
  })

  it('clicar chip ativo remove status do array', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ slicers: slicersComStatus, onStatusChange })} />)
    fireEvent.click(screen.getByTestId('status-chip-abertos'))
    expect(onStatusChange).toHaveBeenCalledWith([])
  })
})

// ─── TU-11: filtros ativos ───────────────────────────────────────────────────

describe('TU-12 — filtros ativos', () => {
  const filtros = [{ field: 'status', label: 'Status: Aberto', sourceWidgetId: 'w1' }]

  it('renderiza lista de filtros ativos quando activeFilters não está vazio', () => {
    render(<DashboardToolbar {...buildProps({ activeFilters: filtros })} />)
    expect(screen.getByText('Status: Aberto')).toBeInTheDocument()
  })

  it('renderiza botão "Limpar" quando há filtros ativos', () => {
    render(<DashboardToolbar {...buildProps({ activeFilters: filtros })} />)
    expect(screen.getByText(/Limpar/)).toBeInTheDocument()
  })

  it('chama onClearFilters ao clicar Limpar', () => {
    const onClearFilters = vi.fn()
    render(<DashboardToolbar {...buildProps({ activeFilters: filtros, onClearFilters })} />)
    fireEvent.click(screen.getByText(/Limpar/))
    expect(onClearFilters).toHaveBeenCalled()
  })

  it('não renderiza seção de filtros quando activeFilters está vazio', () => {
    render(<DashboardToolbar {...buildProps({ activeFilters: [] })} />)
    expect(screen.queryByText(/Filtros ativos/)).toBeNull()
  })
})

// ─── TU-12: chip Todos — fallback de contagem via reduce ─────────────────────

describe('TU-13 — chip Todos sem chave "todos" em statusCounts usa reduce', () => {
  it('soma todas as contagens quando chave "todos" está ausente', () => {
    // statusCounts sem chave "todos" → reduce soma 6+2+0+1 = 9
    const counts = { abertos: 6, em_andamento: 2, atrasados: 0, concluidos: 1 }
    render(<DashboardToolbar {...buildProps({ statusCounts: counts })} />)
    const chip = screen.getByTestId('status-chip-todos')
    expect(chip).toHaveTextContent('(9)')
  })
})

// ─── TU-13: statusActiveColors sobrescreve cor do chip ativo ─────────────────

describe('TU-14 — statusActiveColors em chip ativo', () => {
  it('chip ativo com customColors aplica color do texto definido', () => {
    const onStatusChange = vi.fn()
    const customColors = { abertos: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#ef4444' } }
    render(<DashboardToolbar {...buildProps({
      slicers: slicersComStatus,
      statusActiveColors: customColors,
    })} />)
    const chip = screen.getByTestId('status-chip-abertos')
    // com customColors ativo, color deve ser o texto definido
    expect(chip.style.color).toBe('rgb(239, 68, 68)')
  })
})
