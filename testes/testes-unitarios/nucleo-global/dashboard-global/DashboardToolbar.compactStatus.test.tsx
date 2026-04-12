// @vitest-environment jsdom
/**
 * Testes unitários — DashboardToolbar: prop compactStatus
 * Localização: testes/testes-unitarios/nucleo-global/dashboard-global/DashboardToolbar.compactStatus.test.tsx
 *
 * TU-09: quando compactStatus=true, renderiza dropdown em vez de chips pill;
 *         quando false (padrão), renderiza chips pill.
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardToolbar } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { DashboardToolbarProps } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { GlobalSlicers, ActiveFilter } from '../../../../nucleo-global/Dashboard/dashboard-global/src/tipos'

// ─── Fixtures ────────────────────────────────────────────────────────────────

const slicers: GlobalSlicers = { period: 'current_year', status: [] }
const STATUS_OPTIONS = ['abertos', 'em_andamento', 'atrasados', 'concluidos']
const STATUS_LABELS: Record<string, string> = {
  abertos: 'Abertos',
  em_andamento: 'Em Andamento',
  atrasados: 'Atrasados',
  concluidos: 'Concluídos',
}

function buildProps(overrides: Partial<DashboardToolbarProps> = {}): DashboardToolbarProps {
  return {
    slicers,
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

// ─── TU-09 ───────────────────────────────────────────────────────────────────

describe('TU-09 — prop compactStatus', () => {
  it('renderiza chips pill quando compactStatus=false (padrão)', () => {
    render(<DashboardToolbar {...buildProps({ compactStatus: false })} />)
    expect(screen.getByTestId('status-chips-container')).toBeInTheDocument()
    expect(screen.queryByTestId('status-compact-dropdown')).toBeNull()
  })

  it('renderiza chips pill quando compactStatus não é fornecido (default false)', () => {
    render(<DashboardToolbar {...buildProps()} />)
    expect(screen.getByTestId('status-chips-container')).toBeInTheDocument()
  })

  it('renderiza dropdown compacto quando compactStatus=true', () => {
    render(<DashboardToolbar {...buildProps({ compactStatus: true })} />)
    expect(screen.getByTestId('status-compact-dropdown')).toBeInTheDocument()
    expect(screen.queryByTestId('status-chips-container')).toBeNull()
  })

  it('não renderiza chip "Todos" individual quando compactStatus=true', () => {
    render(<DashboardToolbar {...buildProps({ compactStatus: true })} />)
    expect(screen.queryByTestId('status-chip-todos')).toBeNull()
  })

  it('dropdown compacto contém opção "Todos os status"', () => {
    render(<DashboardToolbar {...buildProps({ compactStatus: true })} />)
    // Abre o dropdown
    const trigger = screen.getByTestId('status-compact-dropdown').querySelector('button')!
    fireEvent.click(trigger)
    // "Todos os status" aparece no trigger (valor selecionado) e na lista — getAllByText evita erro de múltiplos
    expect(screen.getAllByText('Todos os status').length).toBeGreaterThanOrEqual(1)
  })

  it('dropdown compacto lista todos os statusOptions', () => {
    render(<DashboardToolbar {...buildProps({ compactStatus: true })} />)
    const trigger = screen.getByTestId('status-compact-dropdown').querySelector('button')!
    fireEvent.click(trigger)
    expect(screen.getByText('Abertos')).toBeInTheDocument()
    expect(screen.getByText('Em Andamento')).toBeInTheDocument()
    expect(screen.getByText('Atrasados')).toBeInTheDocument()
    expect(screen.getByText('Concluídos')).toBeInTheDocument()
  })

  it('selecionar "Todos os status" no dropdown chama onStatusChange([])', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ compactStatus: true, slicers: { period: 'current_year', status: ['abertos'] }, onStatusChange })} />)
    const trigger = screen.getByTestId('status-compact-dropdown').querySelector('button')!
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Todos os status'))
    expect(onStatusChange).toHaveBeenCalledWith([])
  })

  it('selecionar um status específico no dropdown chama onStatusChange([opt])', () => {
    const onStatusChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ compactStatus: true, onStatusChange })} />)
    const trigger = screen.getByTestId('status-compact-dropdown').querySelector('button')!
    fireEvent.click(trigger)
    fireEvent.click(screen.getByText('Abertos'))
    expect(onStatusChange).toHaveBeenCalledWith(['abertos'])
  })

  it('dropdown exibe contagem no label quando statusCounts fornecido', () => {
    const counts = { todos: 9, abertos: 6, em_andamento: 2, atrasados: 0, concluidos: 1 }
    render(<DashboardToolbar {...buildProps({ compactStatus: true, statusCounts: counts })} />)
    const trigger = screen.getByTestId('status-compact-dropdown').querySelector('button')!
    fireEvent.click(trigger)
    expect(screen.getByText(/Abertos \(6\)/)).toBeInTheDocument()
  })
})
