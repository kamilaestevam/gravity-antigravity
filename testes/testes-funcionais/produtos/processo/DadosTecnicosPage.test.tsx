/**
 * Testes funcionais — DadosTecnicosPage (Produto Processo)
 * Localizacao: testes/testes-funcionais/produtos/processo/DadosTecnicosPage.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: renderizacao das 4 abas (Partes, Transporte, Despacho, Seguro),
 *            navegacao entre abas, preenchimento de campos, gauge, busca,
 *            salvar/cancelar com dirty tracking e localStorage
 */

// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import React from 'react'
import DadosTecnicosPage from '../../../../produto/processo/client/src/pages/dados-tecnicos/DadosTecnicosPage'

// ── Helpers ──────────────────────────────────────────────────────────────────

function clickTab(label: string) {
  const tabs = screen.getAllByRole('button').filter(b => b.textContent === label)
  fireEvent.click(tabs[0])
}

function getInputByDisplayValue(value: string) {
  return screen.getByDisplayValue(value)
}

function getAllInputs(): HTMLInputElement[] {
  return screen.getAllByRole('textbox') as HTMLInputElement[]
}

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

// ═══════════════════════════════════════════════════════════════════════════════
// 1. Renderizacao geral
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Renderizacao geral', () => {
  it('1. renderiza titulo "Dados Tecnicos"', () => {
    render(<DadosTecnicosPage />)
    expect(screen.getByTestId('cabecalho-titulo')).toHaveTextContent('Dados Tecnicos')
  })

  it('2. exibe 4 botoes de aba (Partes, Transporte, Despacho, Seguro)', () => {
    render(<DadosTecnicosPage />)
    const tabs = ['Partes', 'Transporte', 'Despacho', 'Seguro']
    for (const tab of tabs) {
      const btn = screen.getAllByRole('button').find(b => b.textContent === tab)
      expect(btn).toBeDefined()
    }
  })

  it('3. aba padrao e "Partes" (classe active)', () => {
    render(<DadosTecnicosPage />)
    const partesTab = screen.getAllByRole('button').find(b => b.textContent === 'Partes')
    expect(partesTab?.className).toContain('active')
  })

  it('4. exibe gauge com contagem de preenchimento 24/24', () => {
    render(<DadosTecnicosPage />)
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('24/24')
  })

  it('5. exibe campo de busca', () => {
    render(<DadosTecnicosPage />)
    expect(screen.getByTestId('localizar-expandido')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Aba Partes
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Aba Partes', () => {
  it('6. exibe titulo da secao "Importador"', () => {
    render(<DadosTecnicosPage />)
    expect(screen.getByText('Importador')).toBeInTheDocument()
  })

  it('7. exibe titulo da secao "Exportador"', () => {
    render(<DadosTecnicosPage />)
    expect(screen.getByText('Exportador')).toBeInTheDocument()
  })

  it('8. exibe campo Razao Social com valor pre-preenchido', () => {
    render(<DadosTecnicosPage />)
    expect(getInputByDisplayValue('Acme Importacoes Ltda.')).toBeInTheDocument()
  })

  it('9. exibe campo CNPJ com valor pre-preenchido', () => {
    render(<DadosTecnicosPage />)
    expect(getInputByDisplayValue('12.345.678/0001-99')).toBeInTheDocument()
  })

  it('10. editar campo altera o valor', () => {
    render(<DadosTecnicosPage />)
    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: 'Nova Empresa Ltda.' } })
    expect(getInputByDisplayValue('Nova Empresa Ltda.')).toBeInTheDocument()
  })

  it('11. campo UF converte para maiusculo', () => {
    render(<DadosTecnicosPage />)
    const ufInput = getInputByDisplayValue('SP')
    fireEvent.change(ufInput, { target: { value: 'rj' } })
    expect(getInputByDisplayValue('RJ')).toBeInTheDocument()
  })

  it('12. campo Pais do exportador converte para maiusculo', () => {
    render(<DadosTecnicosPage />)
    const paisInput = getInputByDisplayValue('CN')
    fireEvent.change(paisInput, { target: { value: 'us' } })
    expect(getInputByDisplayValue('US')).toBeInTheDocument()
  })

  it('exibe campo Endereco do importador com valor pre-preenchido', () => {
    render(<DadosTecnicosPage />)
    expect(getInputByDisplayValue('Av. Paulista, 1000')).toBeInTheDocument()
  })

  it('exibe campo Cidade do importador com valor pre-preenchido', () => {
    render(<DadosTecnicosPage />)
    expect(getInputByDisplayValue('Sao Paulo')).toBeInTheDocument()
  })

  it('exibe campo Nome do exportador com valor pre-preenchido', () => {
    render(<DadosTecnicosPage />)
    expect(getInputByDisplayValue('Shanghai Electronics Co.')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 3. Aba Transporte
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Aba Transporte', () => {
  it('13. clicar em Transporte exibe campos de transporte', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    expect(screen.getByText('Transporte Internacional')).toBeInTheDocument()
  })

  it('14. exibe select Via de Transporte', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    const selects = screen.getAllByTestId('select-global')
    // Via de Transporte is the first select
    expect(selects.length).toBeGreaterThanOrEqual(2)
    expect(selects[0]).toHaveValue('maritima')
  })

  it('15. exibe Porto de Embarque com valor "Shanghai"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    expect(getInputByDisplayValue('Shanghai')).toBeInTheDocument()
  })

  it('16. exibe campo Numero BL / AWB', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    expect(getInputByDisplayValue('MSKU1234567')).toBeInTheDocument()
  })

  it('exibe Porto de Destino com valor "Santos"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    expect(getInputByDisplayValue('Santos')).toBeInTheDocument()
  })

  it('exibe Companhia de Transporte com valor "Maersk Line"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Transporte')
    expect(getInputByDisplayValue('Maersk Line')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Aba Despacho
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Aba Despacho', () => {
  it('17. clicar em Despacho exibe campos de despacho', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    expect(screen.getByText('Despacho Aduaneiro')).toBeInTheDocument()
  })

  it('18. exibe select Incoterm', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    const selects = screen.getAllByTestId('select-global')
    const incotermSelect = selects.find(s => (s as HTMLSelectElement).value === 'CIF')
    expect(incotermSelect).toBeDefined()
  })

  it('19. exibe select Canal', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    const selects = screen.getAllByTestId('select-global')
    const canalSelect = selects.find(s => (s as HTMLSelectElement).value === 'verde')
    expect(canalSelect).toBeDefined()
  })

  it('20. exibe select Regime Tributario', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    const selects = screen.getAllByTestId('select-global')
    const regimeSelect = selects.find(s => (s as HTMLSelectElement).value === 'comum')
    expect(regimeSelect).toBeDefined()
  })

  it('exibe campo Recinto Alfandegado com valor "Santos Brasil"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    expect(getInputByDisplayValue('Santos Brasil')).toBeInTheDocument()
  })

  it('exibe campo URFA com valor "ALF/Santos"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Despacho')
    expect(getInputByDisplayValue('ALF/Santos')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 5. Aba Seguro
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Aba Seguro', () => {
  it('21. clicar em Seguro exibe campos de seguro', () => {
    render(<DadosTecnicosPage />)
    clickTab('Seguro')
    // Seguro tab button + Seguro section title both exist
    expect(screen.getAllByText('Seguro').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByDisplayValue('Tokio Marine')).toBeInTheDocument()
  })

  it('22. exibe campo Seguradora com valor "Tokio Marine"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Seguro')
    expect(getInputByDisplayValue('Tokio Marine')).toBeInTheDocument()
  })

  it('23. exibe campo Valor Segurado com valor "108050.00"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Seguro')
    expect(getInputByDisplayValue('108050.00')).toBeInTheDocument()
  })

  it('exibe campo Numero da Apolice com valor "AP-2026-001234"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Seguro')
    expect(getInputByDisplayValue('AP-2026-001234')).toBeInTheDocument()
  })

  it('exibe campo Moeda do Seguro com valor "USD"', () => {
    render(<DadosTecnicosPage />)
    clickTab('Seguro')
    expect(getInputByDisplayValue('USD')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Salvar / Cancelar / Dirty tracking
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Salvar e Cancelar', () => {
  it('24. botao Salvar grava dados no localStorage', async () => {
    render(<DadosTecnicosPage />)

    // Edit a field to make dirty
    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: 'Teste Salvar Ltda.' } })

    // Click save
    const salvarBtn = screen.getByTestId('btn-salvar')
    fireEvent.click(salvarBtn)

    // Advance timers past the 1200ms delay
    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    const stored = localStorage.getItem('gravity:dados-tecnicos')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.importador_nome).toBe('Teste Salvar Ltda.')
  })

  it('25. botao Cancelar reverte alteracoes', () => {
    render(<DadosTecnicosPage />)

    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: 'Alterado' } })
    expect(getInputByDisplayValue('Alterado')).toBeInTheDocument()

    const cancelarBtn = screen.getByTestId('btn-cancelar')
    fireEvent.click(cancelarBtn)

    expect(getInputByDisplayValue('Acme Importacoes Ltda.')).toBeInTheDocument()
  })

  it('26. editar campo marca dirty=true (habilita botoes)', () => {
    render(<DadosTecnicosPage />)

    // Initially dirty=false
    const botoesDiv = screen.getByTestId('botoes-salvar')
    expect(botoesDiv).toHaveAttribute('data-dirty', 'false')

    // Edit a field
    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: 'Mudou' } })

    // Now dirty=true
    expect(botoesDiv).toHaveAttribute('data-dirty', 'true')
  })

  it('27. apos salvar, dados persistem no localStorage', async () => {
    render(<DadosTecnicosPage />)

    const input = getInputByDisplayValue('12.345.678/0001-99')
    fireEvent.change(input, { target: { value: '99.999.999/0001-00' } })

    fireEvent.click(screen.getByTestId('btn-salvar'))

    await act(async () => {
      vi.advanceTimersByTime(1500)
    })

    const stored = JSON.parse(localStorage.getItem('gravity:dados-tecnicos')!)
    expect(stored.importador_cnpj).toBe('99.999.999/0001-00')
    // Other fields remain intact
    expect(stored.importador_nome).toBe('Acme Importacoes Ltda.')
    expect(stored.exportador_nome).toBe('Shanghai Electronics Co.')
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 7. Navegacao entre abas
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Navegacao entre abas', () => {
  it('28. trocar de aba preserva dados do formulario', () => {
    render(<DadosTecnicosPage />)

    // Edit field on Partes tab
    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: 'Empresa Modificada' } })

    // Switch to Transporte then back to Partes
    clickTab('Transporte')
    expect(screen.queryByDisplayValue('Empresa Modificada')).toBeNull()

    clickTab('Partes')
    expect(getInputByDisplayValue('Empresa Modificada')).toBeInTheDocument()
  })

  it('aba ativa muda a classe active ao clicar', () => {
    render(<DadosTecnicosPage />)
    const buttons = screen.getAllByRole('button')

    const partesBtn = buttons.find(b => b.textContent === 'Partes')!
    const transporteBtn = buttons.find(b => b.textContent === 'Transporte')!

    expect(partesBtn.className).toContain('active')
    expect(transporteBtn.className).not.toContain('active')

    fireEvent.click(transporteBtn)

    expect(partesBtn.className).not.toContain('active')
    expect(transporteBtn.className).toContain('active')
  })

  it('todas as 4 abas podem ser acessadas sequencialmente', () => {
    render(<DadosTecnicosPage />)

    // Partes (default)
    expect(screen.getByText('Importador')).toBeInTheDocument()

    // Transporte
    clickTab('Transporte')
    expect(screen.getByText('Transporte Internacional')).toBeInTheDocument()

    // Despacho
    clickTab('Despacho')
    expect(screen.getByText('Despacho Aduaneiro')).toBeInTheDocument()

    // Seguro
    clickTab('Seguro')
    expect(getInputByDisplayValue('Tokio Marine')).toBeInTheDocument()
  })
})

// ═══════════════════════════════════════════════════════════════════════════════
// 8. Gauge de preenchimento
// ═══════════════════════════════════════════════════════════════════════════════

describe('DadosTecnicosPage — Gauge de preenchimento', () => {
  it('gauge atualiza ao limpar um campo', () => {
    render(<DadosTecnicosPage />)

    // Start at 24/24
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('24/24')

    // Clear a field
    const input = getInputByDisplayValue('Acme Importacoes Ltda.')
    fireEvent.change(input, { target: { value: '' } })

    // Now 23/24
    expect(screen.getByTestId('gauge-value')).toHaveTextContent('23/24')
  })

  it('gauge mostra legenda com labels Preenchidos e Vazios', () => {
    render(<DadosTecnicosPage />)

    const legendas = screen.getAllByTestId('gauge-legenda')
    const labels = legendas.map(el => el.getAttribute('data-label'))
    expect(labels).toContain('Preenchidos')
    expect(labels).toContain('Vazios')
  })
})
