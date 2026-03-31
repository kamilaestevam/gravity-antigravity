/**
 * LpcoNovo.test.tsx — Testes funcionais para o wizard de criacao de LPCO
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ── Mocks ───────────────────────────────────────────────────────────────────

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  }
})

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
    ArrowLeft: Icon, ArrowRight: Icon, PencilLine: Icon, FileArrowUp: Icon,
    ShoppingCart: Icon, Scan: Icon, Copy: Icon, CloudArrowUp: Icon,
    CheckCircle: Icon, Plus: Icon, Trash: Icon, PaperPlaneTilt: Icon,
  }
})

const mockCriar = vi.fn()

vi.mock('../../shared/api', () => ({
  lpcoApi: {
    criar: (...args: unknown[]) => mockCriar(...args),
  },
}))

// ── Helpers ─────────────────────────────────────────────────────────────────

let LpcoNovo: React.ComponentType

function renderComponent() {
  return render(
    <MemoryRouter initialEntries={['/lpco/novo']}>
      <LpcoNovo />
    </MemoryRouter>
  )
}

beforeEach(async () => {
  vi.clearAllMocks()
  mockCriar.mockRejectedValue(new Error('offline'))
  const mod = await import('../../../../produto/lpco/client/src/pages/LpcoNovo/LpcoNovo')
  LpcoNovo = mod.default
})

// ── Tests ───────────────────────────────────────────────────────────────────

describe('LpcoNovo', () => {
  describe('renderizacao inicial', () => {
    it('deve renderizar titulo Novo LPCO', () => {
      renderComponent()
      expect(screen.getByText('Novo LPCO')).toBeDefined()
    })

    it('deve renderizar step indicator com 4 steps', () => {
      renderComponent()
      expect(screen.getByText('Canal')).toBeDefined()
      expect(screen.getByText('Dados Gerais')).toBeDefined()
      expect(screen.getByText('Itens')).toBeDefined()
      expect(screen.getByText('Revisao')).toBeDefined()
    })

    it('deve iniciar no step 0 (Canal de Entrada)', () => {
      renderComponent()
      // Step 0 mostra os canais de entrada
      expect(screen.getByText('Digitacao Manual')).toBeDefined()
      expect(screen.getByText('Planilha Excel/CSV')).toBeDefined()
      expect(screen.getByText('A partir do Pedido')).toBeDefined()
      expect(screen.getByText('Smart Read (OCR+IA)')).toBeDefined()
      expect(screen.getByText('Duplicado de existente')).toBeDefined()
      expect(screen.getByText('Integracao via API')).toBeDefined()
    })

    it('deve renderizar botao Cancelar no step 0', () => {
      renderComponent()
      expect(screen.getByText('Cancelar')).toBeDefined()
    })

    it('deve renderizar botao Proximo no step 0', () => {
      renderComponent()
      expect(screen.getByText('Proximo')).toBeDefined()
    })
  })

  describe('navegacao entre steps', () => {
    it('deve avancar para step 1 ao clicar Proximo', async () => {
      renderComponent()
      const user = userEvent.setup()

      const proximoBtn = screen.getByText('Proximo')
      await user.click(proximoBtn)

      await waitFor(() => {
        expect(screen.getByText('Tipo Operacao')).toBeDefined()
        expect(screen.getByText('Tipo LPCO')).toBeDefined()
      })
    })

    it('deve voltar para step 0 ao clicar Voltar no step 1', async () => {
      renderComponent()
      const user = userEvent.setup()

      // Avancar para step 1
      await user.click(screen.getByText('Proximo'))
      // Voltar
      await user.click(screen.getByText('Voltar'))

      await waitFor(() => {
        expect(screen.getByText('Digitacao Manual')).toBeDefined()
      })
    })

    it('deve navegar para /lpco ao clicar Cancelar no step 0', async () => {
      renderComponent()
      const user = userEvent.setup()

      await user.click(screen.getByText('Cancelar'))

      expect(mockNavigate).toHaveBeenCalledWith('/lpco')
    })
  })

  describe('step 1 - Dados Gerais', () => {
    async function goToStep1() {
      renderComponent()
      const user = userEvent.setup()
      await user.click(screen.getByText('Proximo'))
      return user
    }

    it('deve renderizar campos de Orgao Anuente e Modelo', async () => {
      await goToStep1()
      await waitFor(() => {
        expect(screen.getByText(/Orgao Anuente/)).toBeDefined()
        expect(screen.getByText(/Modelo LPCO/)).toBeDefined()
      })
    })

    it('deve renderizar campos de Pais e Fundamento Legal', async () => {
      await goToStep1()
      await waitFor(() => {
        expect(screen.getByText(/Pais Procedencia/)).toBeDefined()
        expect(screen.getByText(/Fundamento Legal/)).toBeDefined()
      })
    })

    it('deve renderizar selects de Tipo Operacao e Tipo LPCO', async () => {
      await goToStep1()
      await waitFor(() => {
        expect(screen.getByText('Tipo Operacao')).toBeDefined()
        expect(screen.getByText('Tipo LPCO')).toBeDefined()
      })
    })
  })

  describe('step 3 - Revisao', () => {
    it('deve renderizar botao Criar LPCO no ultimo step', async () => {
      renderComponent()
      const user = userEvent.setup()

      // Avancar por todos os steps
      await user.click(screen.getByText('Proximo')) // step 0 -> 1
      await user.click(screen.getByText('Proximo')) // step 1 -> 2
      await user.click(screen.getByText('Proximo')) // step 2 -> 3

      await waitFor(() => {
        expect(screen.getByText('Criar LPCO')).toBeDefined()
      })
    })

    it('deve renderizar Resumo no step de revisao', async () => {
      renderComponent()
      const user = userEvent.setup()

      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))

      await waitFor(() => {
        expect(screen.getByText('Resumo')).toBeDefined()
      })
    })

    it('deve exibir contagem de itens na revisao', async () => {
      renderComponent()
      const user = userEvent.setup()

      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))

      await waitFor(() => {
        expect(screen.getByText('1 Item(ns)')).toBeDefined()
      })
    })
  })

  describe('submissao', () => {
    it('deve chamar lpcoApi.criar e navegar ao submeter', async () => {
      mockCriar.mockResolvedValue({ id: 'lpco_id_0000001/26' })
      renderComponent()
      const user = userEvent.setup()

      // Navigate to step 3
      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))

      await user.click(screen.getByText('Criar LPCO'))

      await waitFor(() => {
        expect(mockCriar).toHaveBeenCalledTimes(1)
        expect(mockNavigate).toHaveBeenCalledWith('/lpco/lpco_id_0000001/26')
      })
    })

    it('deve navegar para /lpco se API falha', async () => {
      mockCriar.mockRejectedValue(new Error('Erro'))
      renderComponent()
      const user = userEvent.setup()

      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))
      await user.click(screen.getByText('Proximo'))

      await user.click(screen.getByText('Criar LPCO'))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/lpco')
      })
    })
  })
})
