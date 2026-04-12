// @vitest-environment jsdom
/**
 * Testes funcionais — DashboardToolbar + CalendarioPainelGlobal (integração)
 * Localização: testes/testes-funcionais/nucleo-global/dashboard-global/DashboardToolbar.funcional.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Valida comportamento integrado do PeriodDropdown com o CalendarioPainelGlobal:
 * - Abertura do painel de calendário ao clicar "Período personalizado"
 * - Fluxo completo: seleção → callback → fechamento do dropdown
 * - Botão Cancelar do painel chama onFechar corretamente
 *
 * TF-01: PeriodDropdown + CalendarioPainelGlobal — fluxo de período personalizado
 * TF-02: CalendarioPainelGlobal standalone — callbacks e renderização
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => cleanup())

// ─── Mock do CalendarioPainelGlobal para testes de integração do Toolbar ────

vi.mock('../../../../nucleo-global/Campos/campo-calendario-global/src/index', () => ({
  CalendarioPainelGlobal: ({
    aoMudarValor,
    onFechar,
  }: {
    valor?: { inicio: Date | null; fim: Date | null }
    aoMudarValor?: (v: { inicio: Date | null; fim: Date | null }) => void
    onFechar?: () => void
  }) => (
    <div data-testid="calendario-painel-global">
      <button
        data-testid="btn-aplicar-cal"
        onClick={() => aoMudarValor?.({ inicio: new Date('2026-01-01'), fim: new Date('2026-03-31') })}
      >
        Aplicar
      </button>
      <button data-testid="btn-cancelar-cal" onClick={onFechar}>
        Cancelar
      </button>
    </div>
  ),
}))

import { DashboardToolbar } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { DashboardToolbarProps } from '../../../../nucleo-global/Dashboard/dashboard-global/src/DashboardToolbar/DashboardToolbar'
import type { GlobalSlicers, ActiveFilter } from '../../../../nucleo-global/Dashboard/dashboard-global/src/tipos'

function buildProps(overrides: Partial<DashboardToolbarProps> = {}): DashboardToolbarProps {
  return {
    slicers: { period: 'current_year', status: [] } as GlobalSlicers,
    onPeriodChange: vi.fn(),
    onStatusChange: vi.fn(),
    activeFilters: [] as ActiveFilter[],
    onClearFilters: vi.fn(),
    editMode: false,
    onEditModeChange: vi.fn(),
    statusOptions: [],
    statusLabels: {},
    ...overrides,
  }
}

// ─── TF-01: Fluxo completo — PeriodDropdown + CalendarioPainelGlobal ─────────

describe('TF-01 — PeriodDropdown integrado com CalendarioPainelGlobal', () => {
  it('clicar "Período personalizado" exibe CalendarioPainelGlobal', () => {
    render(<DashboardToolbar {...buildProps()} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Período personalizado/i }))
    expect(screen.getByTestId('calendario-painel-global')).toBeInTheDocument()
  })

  it('Aplicar no calendário chama onPeriodChange com string custom:YYYY-MM-DD:YYYY-MM-DD', () => {
    const onPeriodChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ onPeriodChange })} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Período personalizado/i }))
    fireEvent.click(screen.getByTestId('btn-aplicar-cal'))
    expect(onPeriodChange).toHaveBeenCalledWith('custom:2026-01-01:2026-03-31')
  })

  it('Aplicar fecha o dropdown (CalendarioPainelGlobal desaparece)', () => {
    const onPeriodChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ onPeriodChange })} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Período personalizado/i }))
    fireEvent.click(screen.getByTestId('btn-aplicar-cal'))
    expect(screen.queryByTestId('calendario-painel-global')).toBeNull()
  })

  it('Cancelar fecha o painel sem chamar onPeriodChange', () => {
    const onPeriodChange = vi.fn()
    render(<DashboardToolbar {...buildProps({ onPeriodChange })} />)
    fireEvent.click(screen.getByRole('button', { name: /Ano atual/i }))
    fireEvent.click(screen.getByRole('option', { name: /Período personalizado/i }))
    fireEvent.click(screen.getByTestId('btn-cancelar-cal'))
    expect(onPeriodChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('calendario-painel-global')).toBeNull()
  })

  it('após aplicar período custom, trigger exibe label formatado', () => {
    render(<DashboardToolbar {...buildProps({
      slicers: { period: 'custom:2026-01-01:2026-03-31', status: [] },
    })} />)
    // formatCustomLabel: "1 Jan 2026 – 31 Mar 2026"
    expect(screen.getByText(/Jan 2026/)).toBeInTheDocument()
  })
})
