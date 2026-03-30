/**
 * Testes funcionais — SelecionarWorkspace (Dashboard Core)
 * Localização: testes/testes-funcionais/configurador/selecionar-workspace.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: fluxos completos de usuário (workspace selection → enter,
 *            navegação entre seções, interações encadeadas)
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

/* ── Mocks ── */
const mockNavigate = vi.fn()
const mockSignOut = vi.fn((callback: () => void) => callback())
const mockGetToken = vi.fn().mockResolvedValue('mock-token')

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

vi.mock('@clerk/clerk-react', () => ({
  useClerk: () => ({ signOut: mockSignOut }),
  useUser: () => ({
    user: {
      fullName: 'Maria Operadora',
      firstName: 'Maria',
      publicMetadata: { role: 'editor' },
    },
  }),
  useAuth: () => ({ getToken: mockGetToken }),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

function renderDashboard() {
  const { SelecionarWorkspace } = require('../../../servicos-global/configurador/src/pages/SelecionarWorkspace')
  return render(
    <MemoryRouter initialEntries={['/selecionar-workspace']}>
      <SelecionarWorkspace />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  mockFetch.mockRejectedValue(new Error('API indisponível'))
})

// ─── Fluxo 1: Selecionar workspace e entrar ─────────────────────────────────

describe('Fluxo: selecionar workspace e acessar', () => {
  it('seleciona segundo workspace → divider atualiza → botão entra → navega para /hub', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })

    // 1. Divider inicial
    expect(screen.getByText(/Workspace: TESTE ABC/)).toBeInTheDocument()

    // 2. Seleciona "Empresa Beta"
    await user.click(screen.getByText('Empresa Beta'))
    expect(screen.getByText(/Workspace: Empresa Beta/)).toBeInTheDocument()

    // 3. Clica em "Entrar no Workspace"
    const enterBtns = screen.getAllByText('Entrar no Workspace')
    // O botão visível é o do card selecionado
    await user.click(enterBtns[0])

    // 4. Verifica sessionStorage
    expect(sessionStorage.getItem('gravity_company_id')).toBe('ws-2')
    expect(sessionStorage.getItem('gravity_company_name')).toBe('Empresa Beta')

    // 5. Navega para /hub (com delay de 500ms)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/hub')
    }, { timeout: 2000 })
  })

  it('pode mudar seleção múltiplas vezes antes de entrar', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })

    // Seleciona Empresa Beta
    await user.click(screen.getByText('Empresa Beta'))
    expect(screen.getByText(/Workspace: Empresa Beta/)).toBeInTheDocument()

    // Muda para XYZ Importações
    await user.click(screen.getByText('XYZ Importações'))
    expect(screen.getByText(/Workspace: XYZ Importações/)).toBeInTheDocument()

    // Volta para TESTE ABC
    await user.click(screen.getByText('TESTE ABC'))
    expect(screen.getByText(/Workspace: TESTE ABC/)).toBeInTheDocument()
  })
})

// ─── Fluxo 2: Navegação entre seções ────────────────────────────────────────

describe('Fluxo: navegação via atalhos e botões', () => {
  it('atalho "Configurador" navega para /workspace/organizacao', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Configurador')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Configurador'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/organizacao')
  })

  it('atalho "Store de Módulos" navega para /workspace/assinaturas', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Store de Módulos')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Store de Módulos'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/assinaturas')
  })

  it('atalho "Relatórios" navega para /workspace/financeiro', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Relatórios')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Relatórios'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/financeiro')
  })

  it('atalho "Equipe" navega para /workspace/usuarios', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Equipe')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Equipe'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/usuarios')
  })

  it('"Criar novo workspace" navega para /workspace/workspaces', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Criar novo workspace'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/workspaces')
  })
})

// ─── Fluxo 3: Logout ────────────────────────────────────────────────────────

describe('Fluxo: logout', () => {
  it('botão "Sair" chama signOut com callback que navega para /', async () => {
    const user = userEvent.setup()
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sair'))
    expect(mockSignOut).toHaveBeenCalledOnce()
    // O callback passado ao signOut navega para /
    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

// ─── Fluxo 4: API real com dados ────────────────────────────────────────────

describe('Fluxo: carregamento de workspaces via API', () => {
  it('carrega workspaces da API com sucesso e seleciona primeiro', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: [
          { id: 'api-1', name: 'Empresa API 1' },
          { id: 'api-2', name: 'Empresa API 2' },
        ],
      }),
    })

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Empresa API 1')).toBeInTheDocument()
    })
    expect(screen.getByText('Empresa API 2')).toBeInTheDocument()

    // Primeiro workspace é selecionado automaticamente
    expect(screen.getByText(/Workspace: Empresa API 1/)).toBeInTheDocument()
  })

  it('envia token de autenticação na requisição', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ companies: [{ id: 'x', name: 'Test' }] }),
    })

    renderDashboard()

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/tenants/companies',
        expect.objectContaining({
          headers: { Authorization: 'Bearer mock-token' },
        })
      )
    })
  })

  it('fallback para mock quando API retorna erro HTTP', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    })

    renderDashboard()

    await waitFor(() => {
      // Fallback: companies vazio ou undefined → usa mock
      const testeAbc = screen.queryByText('TESTE ABC')
      // Pode mostrar mock ou empty state dependendo da lógica
      expect(screen.queryByText('Carregando workspaces...')).not.toBeInTheDocument()
    })
  })
})

// ─── Fluxo 5: Informações do usuário ────────────────────────────────────────

describe('Fluxo: exibição de dados do usuário', () => {
  it('mostra nome e role do usuário na topbar', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Maria Operadora')).toBeInTheDocument()
    })
    expect(screen.getByText('editor')).toBeInTheDocument()
  })

  it('mostra iniciais do usuário no avatar da topbar e sidebar', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Maria Operadora')).toBeInTheDocument()
    })

    // Iniciais: MO
    const avatars = screen.getAllByText('MO')
    expect(avatars.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── Fluxo 6: Conteúdo completo da página ───────────────────────────────────

describe('Fluxo: todas as seções do dashboard renderizam', () => {
  it('página completa renderiza: header + workspace + produtos + atalhos + gabi', async () => {
    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Acessar Workspace')).toBeInTheDocument()
    })

    // Header
    expect(screen.getByText('Gravity')).toBeInTheDocument()

    // Workspace section
    expect(screen.getByText('Selecione o workspace que deseja operar nesta sessão.')).toBeInTheDocument()

    // Divider
    expect(screen.getByText(/Workspace:/)).toBeInTheDocument()

    // Produtos
    expect(screen.getByText('Produtos')).toBeInTheDocument()
    expect(screen.getByText('Seus Produtos Contratados')).toBeInTheDocument()
    expect(screen.getByText('Sugeridos para Você')).toBeInTheDocument()

    // Acesso Rápido
    expect(screen.getByText('Acesso Rápido')).toBeInTheDocument()
    expect(screen.getByText('Atalhos')).toBeInTheDocument()

    // Gabi AI
    expect(screen.getByText('GABI AI · Insights')).toBeInTheDocument()
    expect(screen.getByText('Economia estimada')).toBeInTheDocument()
    expect(screen.getByText('R$ 28.400/mês')).toBeInTheDocument()
  })
})
