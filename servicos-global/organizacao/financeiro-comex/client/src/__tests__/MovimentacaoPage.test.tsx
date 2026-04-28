import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import MovimentacaoPage from '../pages/Movimentacao/MovimentacaoPage'

// Mock das APIs
vi.mock('../shared/api', () => ({
  dashboard: {
    get: vi.fn(),
  },
  lancamentos: {
    listar: vi.fn(),
    criar: vi.fn(),
    editar: vi.fn(),
    excluir: vi.fn(),
  },
  categorias: {
    listar: vi.fn(),
  },
  condicoes: {
    listar: vi.fn(),
  },
  historico: {
    listar: vi.fn(),
  },
}))

import { dashboard, lancamentos, categorias, condicoes } from '../shared/api'

const mockFinanceiro = {
  id: 'fin-1',
  tenant_id: 'tenant-1',
  company_id: 'company-1',
  processo_id: 'proc-1',
  tipo_operacao: 'IMPORTACAO' as const,
  referencia: 'DATI-2875/25',
  total_brl: 50000,
  total_usd: 1000,
  total_eur: 0,
  total_outros: 0,
  saldo: -34507.76,
  adiantado: 15492.24,
  pagos: 0,
  agendados: 0,
  pendente: 50000,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const mockLancamento = {
  id: 'lanc-1',
  tenant_id: 'tenant-1',
  company_id: 'company-1',
  financeiro_id: 'fin-1',
  categoria_id: 'cat-1',
  categoria_nome: '300 - Frete Internacional',
  grupo_custo: 'CUSTO_OPERACIONAL' as const,
  moeda: 'USD' as const,
  taxa_cambio: 5.6923,
  valor: 100,
  valor_brl: 569.23,
  status_pagamento: 'PENDENTE' as const,
  canal_entrada: 'MANUAL' as const,
  despesa_aduaneira: false,
  despesa_nf: false,
  espelho_nf: true,
  icms_origem_portal: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  created_by: 'user-1',
}

function renderPage(processoId = 'proc-1') {
  return render(
    <MemoryRouter initialEntries={[`/financeiro-comex/movimentacao/${processoId}`]}>
      <Routes>
        <Route path="/financeiro-comex/movimentacao/:processoId" element={<MovimentacaoPage />} />
        <Route path="/financeiro-comex/numerario/:processoId" element={<div>Numerario</div>} />
        <Route path="/financeiro-comex/rateio/:processoId" element={<div>Rateio</div>} />
      </Routes>
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(dashboard.get as ReturnType<typeof vi.fn>).mockResolvedValue({ data: mockFinanceiro })
  ;(lancamentos.listar as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: [mockLancamento],
    meta: { total: 1, page: 1, limit: 50, pages: 1 },
  })
  ;(categorias.listar as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })
  ;(condicoes.listar as ReturnType<typeof vi.fn>).mockResolvedValue({ data: [] })
})

describe('MovimentacaoPage', () => {
  it('CA-010: carrega e exibe KPIs do processo', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Saldo')).toBeInTheDocument()
      expect(screen.getByText('Adiantado')).toBeInTheDocument()
      expect(screen.getByText('Pagos')).toBeInTheDocument()
      expect(screen.getAllByText('Pendente').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('exibe tabs de navegacao', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('Movimentacao')).toBeInTheDocument()
      expect(screen.getByText('Numerario')).toBeInTheDocument()
      expect(screen.getByText('Rateio')).toBeInTheDocument()
    })
  })

  it('exibe lancamento na tabela', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('300 - Frete Internacional')).toBeInTheDocument()
      expect(screen.getByText('USD')).toBeInTheDocument()
      expect(screen.getAllByText('Pendente').length).toBeGreaterThanOrEqual(1)
    })
  })

  it('exibe empty state quando nao ha lancamentos', async () => {
    ;(lancamentos.listar as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { total: 0, page: 1, limit: 50, pages: 0 },
    })
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Nenhum lancamento/i)).toBeInTheDocument()
    })
  })

  it('exibe botao + Novo', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText('+ Novo')).toBeInTheDocument()
    })
  })

  it('exibe botao Importar', async () => {
    renderPage()
    await waitFor(() => {
      expect(screen.getByText(/Importar/i)).toBeInTheDocument()
    })
  })

  it('abre modal ao clicar + Novo', async () => {
    renderPage()
    await waitFor(() => screen.getByText('+ Novo'))
    await userEvent.click(screen.getByText('+ Novo'))
    expect(screen.getByText('Novo Lancamento')).toBeInTheDocument()
  })

  it('CA-006: saldo negativo exibido em vermelho', async () => {
    renderPage()
    await waitFor(() => {
      const saldoCard = screen.getByText('Saldo').parentElement
      expect(saldoCard?.classList.contains('fincom-kpi--negativo')).toBe(true)
    })
  })
})
