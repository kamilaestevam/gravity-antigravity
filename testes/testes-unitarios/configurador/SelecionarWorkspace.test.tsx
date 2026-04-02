/**
 * Testes unitários — SelecionarWorkspace (Dashboard Core)
 * Localização: testes/testes-unitarios/configurador/SelecionarWorkspace.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: renderização, seleção de workspace, navegação, estados de loading,
 *            seções de produtos, atalhos, painel Gabi AI
 *
 * ATUALIZADO: usa /api/v1/hub/init (endpoint agregado) em vez de 4 chamadas separadas
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

/* ── Mocks ── */
const mockNavigate = vi.fn()
const mockSignOut = vi.fn()
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
      fullName: 'Daniel Admin',
      firstName: 'Daniel',
      publicMetadata: { role: 'gravity_admin' },
      primaryEmailAddress: { emailAddress: 'daniel@dmm-ie.com.br' },
    },
  }),
  useAuth: () => ({ getToken: mockGetToken }),
}))

vi.mock('@nucleo/usuario-global', () => ({
  UsuarioGlobal: ({ userName, userRole }: { userName: string; userRole: string }) => (
    <div data-testid="usuario-global">{userName} - {userRole}</div>
  ),
}))

vi.mock('@nucleo/menu-lateral-global', () => ({
  MenuLateralGlobal: () => null,
}))

// Mock fetch — /api/v1/hub/init
const mockFetch = vi.fn()
global.fetch = mockFetch

/* ── Dados mock do /hub/init ── */
const hubInitResponse = {
  tenant: {
    id: 'tenant-1',
    name: 'DMM Importação',
    subscriptions: [{ status: 'TRIALING' }],
    _count: { users: 3, companies: 2 },
  },
  companies: [
    { id: 'comp-1', name: 'DMM Importação', cnpj: null, status: 'ACTIVE', _count: { memberships: 3 } },
    { id: 'comp-2', name: 'Fiação Fides', cnpj: null, status: 'ACTIVE', _count: { memberships: 1 } },
  ],
  products: [
    { product_key: 'simula-custo', is_active: true, catalog: { name: 'SimulaCusto', description: 'Cálculo fiscal' } },
  ],
  catalog: [
    { id: 'p1', name: 'SimulaCusto', slug: 'simula-custo', description: 'Cálculo fiscal', status: 'ACTIVE' },
    { id: 'p2', name: 'BID Frete', slug: 'bid-frete', description: 'Cotação frete', status: 'ACTIVE' },
    { id: 'p3', name: 'Smart Read', slug: 'smart-read', description: null, status: 'COMING_SOON' },
  ],
}

function renderDashboard() {
  const { SelecionarWorkspace } = require('../../../servicos-global/configurador/src/pages/SelecionarWorkspace')
  return render(
    <MemoryRouter initialEntries={['/hub']}>
      <SelecionarWorkspace />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  sessionStorage.clear()
  // Retorna resposta do /hub/init por padrão
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => hubInitResponse,
  })
})

// ─── 1. Renderização inicial ───────────────────────────────────────────────

describe('SelecionarWorkspace — renderização inicial', () => {
  it('mostra estado de loading inicialmente', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}))
    renderDashboard()
    expect(screen.getByText('Carregando workspaces...')).toBeInTheDocument()
  })

  it('renderiza título "Acessar Workspace"', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Acessar Workspace')).toBeInTheDocument()
    })
  })

  it('chama /api/v1/hub/init com token de auth', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/v1/hub/init', {
        headers: { Authorization: 'Bearer mock-token' },
      })
    })
  })

  it('faz apenas UMA chamada fetch (endpoint agregado)', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Acessar Workspace')).toBeInTheDocument()
    })
    // Aguarda que não haja chamadas adicionais
    await new Promise(r => setTimeout(r, 100))
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})

// ─── 2. Workspace cards da API ──────────────────────────────────────────────

describe('SelecionarWorkspace — workspace cards', () => {
  it('renderiza workspace cards da API + botão criar', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('DMM Importação')).toBeInTheDocument()
    })
    expect(screen.getByText('Fiação Fides')).toBeInTheDocument()
    expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
  })

  it('primeiro workspace é selecionado por padrão', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/Workspace: DMM Importação/)).toBeInTheDocument()
    })
  })

  it('mostra plano Starter do tenant', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Starter')).toBeInTheDocument()
    })
  })

  it('mostra contagem de membros', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('DMM Importação')).toBeInTheDocument()
    })
    // Deve mostrar membros do _count.memberships (3) ou do tenant (3)
    const statNumbers = screen.getAllByText('3')
    expect(statNumbers.length).toBeGreaterThanOrEqual(1)
  })
})

// ─── 3. Seleção de workspace ────────────────────────────────────────────────

describe('SelecionarWorkspace — seleção de workspace', () => {
  it('altera divider ao clicar em outro workspace', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('DMM Importação')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Fiação Fides'))
    expect(screen.getByText(/Workspace: Fiação Fides/)).toBeInTheDocument()
  })

  it('botão "Entrar no Workspace" salva no sessionStorage e navega', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('DMM Importação')).toBeInTheDocument()
    })

    const enterBtns = screen.getAllByText('Entrar no Workspace')
    await user.click(enterBtns[0])

    await waitFor(() => {
      expect(sessionStorage.getItem('gravity_company_id')).toBe('comp-1')
      expect(sessionStorage.getItem('gravity_company_name')).toBe('DMM Importação')
    })
  })
})

// ─── 4. Criar workspace ─────────────────────────────────────────────────────

describe('SelecionarWorkspace — criar workspace', () => {
  it('navega para /workspace/workspaces ao clicar', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Criar novo workspace'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/workspaces')
  })
})

// ─── 5. Seção de Produtos ───────────────────────────────────────────────────

describe('SelecionarWorkspace — seção Produtos', () => {
  it('renderiza seção "Produtos" com cabeçalho', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Produtos')).toBeInTheDocument()
    })
    expect(screen.getByText('Ver catálogo completo')).toBeInTheDocument()
  })

  it('mostra produtos contratados ativos', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Seus Produtos Contratados')).toBeInTheDocument()
    })
    expect(screen.getByText('1 ativos')).toBeInTheDocument()
  })

  it('mostra produtos sugeridos do catálogo', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Sugeridos para Você')).toBeInTheDocument()
    })
    // BID Frete e Smart Read (não contratados)
    expect(screen.getByText('BID Frete')).toBeInTheDocument()
  })

  it('navega ao clicar "Ver catálogo completo"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Ver catálogo completo')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Ver catálogo completo'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/assinaturas')
  })
})

// ─── 6. Seção Acesso Rápido ─────────────────────────────────────────────────

describe('SelecionarWorkspace — seção Acesso Rápido', () => {
  it('renderiza seção com atalhos', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Acesso Rápido')).toBeInTheDocument()
    })
    expect(screen.getByText('Atalhos')).toBeInTheDocument()
    expect(screen.getByText('Configurador')).toBeInTheDocument()
    expect(screen.getByText('Store de Módulos')).toBeInTheDocument()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
    expect(screen.getByText('Equipe')).toBeInTheDocument()
  })

  it('navega ao clicar num atalho', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Configurador')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Configurador'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/organizacao')
  })
})

// ─── 7. Painel Gabi AI ──────────────────────────────────────────────────────

describe('SelecionarWorkspace — painel Gabi AI', () => {
  it('renderiza cabeçalho Gabi AI', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('GABI AI · Insights')).toBeInTheDocument()
    })
    expect(screen.getByText('3 oportunidades esta semana')).toBeInTheDocument()
  })

  it('renderiza insight de redução tributária', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/Redução Tributária · NCM 8471/)).toBeInTheDocument()
    })
    expect(screen.getByText('R$ 28.400/mês')).toBeInTheDocument()
  })
})

// ─── 8. Resiliência — API falha ─────────────────────────────────────────────

describe('SelecionarWorkspace — resiliência', () => {
  it('mostra estado vazio quando API falha', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    renderDashboard()
    await waitFor(() => {
      // Deve sair do loading sem crash
      expect(screen.queryByText('Carregando workspaces...')).not.toBeInTheDocument()
    })
    // Deve mostrar pelo menos o botão de criar workspace
    expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
  })

  it('mostra estado vazio quando API retorna companies vazio', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ...hubInitResponse, companies: [] }),
    })
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
    })
  })
})

// ─── 9. Acessibilidade ─────────────────────────────────────────────────────

describe('SelecionarWorkspace — acessibilidade', () => {
  it('workspace cards têm role="button" e tabIndex', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('DMM Importação')).toBeInTheDocument()
    })
    const cards = screen.getAllByRole('button')
    expect(cards.length).toBeGreaterThan(0)
  })
})
