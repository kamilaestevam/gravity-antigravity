/**
 * LpcoDetalhe.test.tsx — Testes funcionais para a pagina de detalhes do LPCO
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
    useParams: () => ({ id: 'lpco_id_0000001/26' }),
  }
})

vi.mock('@nucleo/status-badge-global', () => ({
  StatusBadgeGlobal: (props: { valor: string }) => <span data-testid="status-badge">{props.valor}</span>,
}))

vi.mock('@nucleo/botao-global', () => ({
  BotaoGlobal: (props: { onClick?: () => void; children?: React.ReactNode; disabled?: boolean; variante?: string }) => (
    <button onClick={props.onClick} disabled={props.disabled} data-testid={`botao-${props.variante ?? 'default'}`}>
      {props.children}
    </button>
  ),
}))

vi.mock('@nucleo/tooltip-global', () => ({
  TooltipGlobal: (props: { children?: React.ReactNode }) => <div>{props.children}</div>,
}))

vi.mock('@phosphor-icons/react', () => {
  const Icon = () => <span data-testid="icon" />
  return {
    ArrowLeft: Icon, ClipboardText: Icon, Package: Icon, Warning: Icon,
    LinkSimple: Icon, FileText: Icon, ClockCounterClockwise: Icon,
    PaperPlaneTilt: Icon, XCircle: Icon, Copy: Icon, CheckCircle: Icon,
    Scales: Icon, CalendarBlank: Icon, Info: Icon,
  }
})

const mockBuscarPorId = vi.fn()
const mockRegistrar = vi.fn()
const mockCancelar = vi.fn()
const mockDuplicar = vi.fn()

vi.mock('../../shared/api', () => ({
  lpcoApi: {
    buscarPorId: (...args: unknown[]) => mockBuscarPorId(...args),
    registrar: (...args: unknown[]) => mockRegistrar(...args),
    cancelar: (...args: unknown[]) => mockCancelar(...args),
    duplicar: (...args: unknown[]) => mockDuplicar(...args),
  },
  lpcoExigenciaApi: {
    listar: vi.fn().mockResolvedValue([]),
    registrar: vi.fn(),
    responder: vi.fn(),
  },
  lpcoVinculoApi: {
    listar: vi.fn().mockResolvedValue([]),
    criar: vi.fn(),
    cancelar: vi.fn(),
    saldo: vi.fn(),
  },
}))

// ── Helpers ─────────────────────────────────────────────────────────────────

let LpcoDetalhe: React.ComponentType

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/lpco/lpco_id_0000001/26']}>
      <LpcoDetalhe />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  // Fallback to mock data when API fails
  mockBuscarPorId.mockRejectedValue(new Error('offline'))
  const mod = await import('../../../../produto/lpco/client/src/pages/LpcoDetalhe/LpcoDetalhe')
  LpcoDetalhe = mod.default
})

// ── Tests ───────────────────────────────────────────────────────────────────

describe('LpcoDetalhe', () => {
  describe('renderizacao com mock data (fallback)', () => {
    it('deve renderizar o numero portal ou ID do LPCO', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('26BR000012345')).toBeDefined()
      })
    })

    it('deve renderizar status badge', async () => {
      renderComponent()
      await waitFor(() => {
        const badges = screen.getAllByTestId('status-badge')
        expect(badges.length).toBeGreaterThan(0)
        expect(badges[0].textContent).toBe('Em Exigencia')
      })
    })

    it('deve renderizar informacoes do orgao anuente', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText(/ANVISA/)).toBeDefined()
      })
    })

    it('deve renderizar 6 tabs', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Dados')).toBeDefined()
        expect(screen.getByText('Itens')).toBeDefined()
        expect(screen.getByText('Exigencias')).toBeDefined()
        expect(screen.getByText('Vinculos')).toBeDefined()
        expect(screen.getByText('Documentos')).toBeDefined()
        expect(screen.getByText('Historico')).toBeDefined()
      })
    })

    it('deve iniciar na tab Dados', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Classificacao')).toBeDefined()
        expect(screen.getByText('Dados Gerais')).toBeDefined()
        expect(screen.getByText('Datas e Vigencia')).toBeDefined()
      })
    })
  })

  describe('tab Dados', () => {
    it('deve exibir informacoes de classificacao', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Importacao')).toBeDefined()
        expect(screen.getByText('Por Operacao')).toBeDefined()
      })
    })

    it('deve exibir numero portal no card Dados Gerais', async () => {
      renderComponent()
      await waitFor(() => {
        const portals = screen.getAllByText('26BR000012345')
        expect(portals.length).toBeGreaterThan(0)
      })
    })

    it('deve exibir fundamento legal', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('RDC 81/2008')).toBeDefined()
      })
    })
  })

  describe('navegacao entre tabs', () => {
    it('deve mudar para tab Itens ao clicar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Itens'))
      await user.click(screen.getByText('Itens'))

      await waitFor(() => {
        // Mock data has 2 items
        expect(screen.getByText(/Medicamento generico - Amoxicilina/)).toBeDefined()
        expect(screen.getByText(/Antibiotico - Cefalexina/)).toBeDefined()
      })
    })

    it('deve mudar para tab Exigencias ao clicar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Exigencias'))
      await user.click(screen.getByText('Exigencias'))

      await waitFor(() => {
        expect(screen.getByText(/Exigencia #1/)).toBeDefined()
        expect(screen.getByText(/certificado de boas praticas/)).toBeDefined()
      })
    })

    it('deve mudar para tab Vinculos ao clicar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Vinculos'))
      await user.click(screen.getByText('Vinculos'))

      await waitFor(() => {
        expect(screen.getByText(/Nenhum vinculo/)).toBeDefined()
      })
    })

    it('deve mudar para tab Documentos ao clicar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Documentos'))
      await user.click(screen.getByText('Documentos'))

      await waitFor(() => {
        expect(screen.getByText(/Area de documentos/)).toBeDefined()
      })
    })

    it('deve mudar para tab Historico ao clicar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Historico'))
      await user.click(screen.getByText('Historico'))

      await waitFor(() => {
        // Mock data has historico events
        expect(screen.getByText(/Exigencia #1 recebida/)).toBeDefined()
        expect(screen.getByText(/LPCO registrado para analise/)).toBeDefined()
      })
    })
  })

  describe('botoes de acao', () => {
    it('deve renderizar botao Cancelar quando status nao e terminal', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Cancelar')).toBeDefined()
      })
    })

    it('deve renderizar botao Duplicar', async () => {
      renderComponent()
      await waitFor(() => {
        expect(screen.getByText('Duplicar')).toBeDefined()
      })
    })

    it('deve navegar para /lpco ao clicar no botao voltar', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('26BR000012345'))

      // Find back button (first button element without text)
      const backButtons = document.querySelectorAll('button[type="button"]')
      if (backButtons.length > 0) {
        await user.click(backButtons[0] as HTMLElement)
        expect(mockNavigate).toHaveBeenCalledWith('/lpco')
      }
    })
  })

  describe('tab Itens - detalhes', () => {
    it('deve exibir NCM dos itens', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Itens'))
      await user.click(screen.getByText('Itens'))

      await waitFor(() => {
        expect(screen.getByText(/NCM 30049099/)).toBeDefined()
        expect(screen.getByText(/NCM 30042099/)).toBeDefined()
      })
    })

    it('deve exibir fabricante dos itens', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Itens'))
      await user.click(screen.getByText('Itens'))

      await waitFor(() => {
        const fabricantes = screen.getAllByText('Shanghai Pharma Co.')
        expect(fabricantes.length).toBe(2)
      })
    })
  })

  describe('exigencias', () => {
    it('deve exibir status da exigencia pendente', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Exigencias'))
      await user.click(screen.getByText('Exigencias'))

      await waitFor(() => {
        const badges = screen.getAllByTestId('status-badge')
        const pendenteBadge = badges.find(b => b.textContent === 'Pendente')
        expect(pendenteBadge).toBeDefined()
      })
    })

    it('deve exibir prazo da exigencia', async () => {
      renderComponent()
      const user = userEvent.setup()

      await waitFor(() => screen.getByText('Exigencias'))
      await user.click(screen.getByText('Exigencias'))

      await waitFor(() => {
        expect(screen.getByText(/Prazo:/)).toBeDefined()
      })
    })
  })
})
