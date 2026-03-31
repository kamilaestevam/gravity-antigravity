/**
 * LpcoLista.test.tsx — Testes funcionais para a pagina de listagem de LPCOs
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@nucleo/tabela-global', () => ({
  TabelaGlobal: (props: { dados?: unknown[]; mensagemVazio?: string; id?: string }) => (
    <div data-testid="tabela">
      <span data-testid="tabela-count">{props.dados?.length ?? 0} items</span>
      {props.dados?.length === 0 && <span>{props.mensagemVazio}</span>}
    </div>
  ),
}))

vi.mock('@nucleo/status-badge-global', () => ({
  StatusBadgeGlobal: (props: { valor: string }) => <span data-testid="status-badge">{props.valor}</span>,
}))

vi.mock('@nucleo/botao-global', () => ({
  BotaoGlobal: (props: { onClick?: () => void; children?: React.ReactNode; disabled?: boolean }) => (
    <button onClick={props.onClick} disabled={props.disabled} data-testid="botao">
      {props.children}
    </button>
  ),
}))

vi.mock('@nucleo/tooltip-global', () => ({
  TooltipGlobal: (props: { children?: React.ReactNode }) => <div>{props.children}</div>,
}))

vi.mock('@phosphor-icons/react', () => {
  const Icon = (props: { size?: number }) => <span data-testid="icon" />
  return {
    Plus: Icon, Eye: Icon, Copy: Icon, XCircle: Icon, Files: Icon,
    Clock: Icon, Warning: Icon, CheckCircle: Icon, Prohibit: Icon,
    ArrowClockwise: Icon, MagnifyingGlass: Icon, Funnel: Icon,
  }
})

const mockListar = vi.fn()
const mockStats = vi.fn()
const mockDuplicar = vi.fn()

vi.mock('../../shared/api', () => ({
  lpcoApi: {
    listar: (...args: unknown[]) => mockListar(...args),
    stats: (...args: unknown[]) => mockStats(...args),
    duplicar: (...args: unknown[]) => mockDuplicar(...args),
  },
}))

// Fix CSS import
vi.mock('./LpcoLista.css', () => ({}))

// ── Helpers ─────────────────────────────────────────────────────────────────

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/lpco']}>
      <LpcoLista />
    </MemoryRouter>
  )
}

// Import after mocks
let LpcoLista: React.ComponentType
beforeEach(async () => {
  vi.clearAllMocks()
  mockListar.mockRejectedValue(new Error('offline'))
  mockStats.mockRejectedValue(new Error('offline'))

  const mod = await import('../../../../produto/lpco/client/src/pages/LpcoLista/LpcoLista')
  LpcoLista = mod.default
})

// ── Tests ───────────────────────────────────────────────────────────────────

describe('LpcoLista', () => {
  it('deve renderizar o titulo LPCOs', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('LPCOs')).toBeDefined()
    })
  })

  it('deve renderizar o subtitulo', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText(/Licencas, Permissoes, Certificados/)).toBeDefined()
    })
  })

  it('deve renderizar botao Novo LPCO', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Novo LPCO')).toBeDefined()
    })
  })

  it('deve renderizar botao Simulador TA', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Simulador TA')).toBeDefined()
    })
  })

  it('deve renderizar tabela com dados mock quando API falha', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('tabela')).toBeDefined()
      expect(screen.getByTestId('tabela-count').textContent).toBe('7 items')
    })
  })

  it('deve renderizar stats cards', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeDefined()
      expect(screen.getByText('Rascunho')).toBeDefined()
      expect(screen.getByText('Em Analise')).toBeDefined()
      expect(screen.getByText('Em Exigencia')).toBeDefined()
      expect(screen.getByText('Deferida')).toBeDefined()
      expect(screen.getByText('Indeferida')).toBeDefined()
    })
  })

  it('deve renderizar tabela com dados do backend quando API funciona', async () => {
    mockListar.mockResolvedValue({
      data: [
        { id: 'lpco_id_0000001/26', status: 'deferida', orgao_anuente: 'ANVISA' },
        { id: 'lpco_id_0000002/26', status: 'rascunho', orgao_anuente: 'MAPA' },
      ],
      total: 2,
    })
    mockStats.mockResolvedValue({ total: 2, deferida: 1, rascunho: 1 })

    renderComponent()
    await waitFor(() => {
      expect(screen.getByTestId('tabela-count').textContent).toBe('2 items')
    })
  })

  it('deve exibir skeleton de carregamento inicialmente', () => {
    // Mock com promessa pendente para manter estado loading
    mockListar.mockReturnValue(new Promise(() => {}))
    mockStats.mockReturnValue(new Promise(() => {}))

    renderComponent()
    const skeletons = document.querySelectorAll('.lp-skeleton-row')
    expect(skeletons.length).toBe(5)
  })
})
