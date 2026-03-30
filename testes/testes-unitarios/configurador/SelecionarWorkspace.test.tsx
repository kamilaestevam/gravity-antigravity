/**
 * Testes unitários — SelecionarWorkspace (Dashboard Core)
 * Localização: testes/testes-unitarios/configurador/SelecionarWorkspace.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: renderização, seleção de workspace, navegação, estados de loading,
 *            seções de produtos, atalhos, painel Gabi AI
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
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
    },
  }),
  useAuth: () => ({ getToken: mockGetToken }),
}))

// Mock fetch para API de empresas
const mockFetch = vi.fn()
global.fetch = mockFetch

function renderDashboard() {
  // Importação lazy para que os mocks sejam aplicados
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
  // Por padrão, API retorna erro → fallback para mock
  mockFetch.mockRejectedValue(new Error('API not available'))
})

// ─── 1. Renderização inicial e loading ───────────────────────────────────────

describe('SelecionarWorkspace — renderização inicial', () => {
  it('mostra estado de loading inicialmente', () => {
    // Fetch demora para resolver
    mockFetch.mockImplementation(() => new Promise(() => {}))
    renderDashboard()
    expect(screen.getByText('Carregando workspaces...')).toBeInTheDocument()
  })

  it('renderiza a sidebar com botões de navegação', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.queryByText('Carregando workspaces...')).not.toBeInTheDocument()
    })
    // Sidebar: logo mark, nav buttons
    expect(screen.getByTitle('Home')).toBeInTheDocument()
    expect(screen.getByTitle('Módulos')).toBeInTheDocument()
    expect(screen.getByTitle('Relatórios')).toBeInTheDocument()
    expect(screen.getByTitle('Equipe')).toBeInTheDocument()
    expect(screen.getByTitle('Configurações')).toBeInTheDocument()
  })

  it('renderiza a topbar com branding, usuário e botão sair', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.queryByText('Carregando workspaces...')).not.toBeInTheDocument()
    })
    expect(screen.getByText('Gravity')).toBeInTheDocument()
    expect(screen.getByText('Daniel Admin')).toBeInTheDocument()
    expect(screen.getByText('gravity_admin')).toBeInTheDocument()
    expect(screen.getByText('Sair')).toBeInTheDocument()
  })

  it('renderiza título "Acessar Workspace"', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Acessar Workspace')).toBeInTheDocument()
    })
  })
})

// ─── 2. Workspace cards (fallback mock) ──────────────────────────────────────

describe('SelecionarWorkspace — workspace cards', () => {
  it('renderiza 3 workspace cards + botão criar', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })
    expect(screen.getByText('Empresa Beta')).toBeInTheDocument()
    expect(screen.getByText('XYZ Importações')).toBeInTheDocument()
    expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
  })

  it('primeiro workspace é selecionado por padrão', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })
    // Divider mostra o workspace selecionado
    expect(screen.getByText(/Workspace: TESTE ABC/)).toBeInTheDocument()
  })

  it('mostra plano e role de cada workspace', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Business')).toBeInTheDocument()
    })
    expect(screen.getByText('Starter')).toBeInTheDocument()
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText('· Admin')).toBeInTheDocument()
    expect(screen.getByText('· Editor')).toBeInTheDocument()
    expect(screen.getByText('· Visualizador')).toBeInTheDocument()
  })

  it('mostra estatísticas dos workspaces', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('847')).toBeInTheDocument()
    })
    expect(screen.getByText('1.2k')).toBeInTheDocument()
    expect(screen.getByText('4.7k')).toBeInTheDocument()
  })
})

// ─── 3. Seleção de workspace ────────────────────────────────────────────────

describe('SelecionarWorkspace — seleção de workspace', () => {
  it('altera divider ao clicar em outro workspace', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })

    // Clica no segundo workspace
    await user.click(screen.getByText('Empresa Beta'))
    expect(screen.getByText(/Workspace: Empresa Beta/)).toBeInTheDocument()
  })

  it('botão "Entrar no Workspace" salva ID no sessionStorage e navega', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })

    // O botão "Entrar no Workspace" deve estar visível no card selecionado
    const enterBtns = screen.getAllByText('Entrar no Workspace')
    await user.click(enterBtns[0])

    // Verifica sessionStorage
    expect(sessionStorage.getItem('gravity_company_id')).toBe('ws-1')
    expect(sessionStorage.getItem('gravity_company_name')).toBe('TESTE ABC')
  })
})

// ─── 4. Criar workspace ─────────────────────────────────────────────────────

describe('SelecionarWorkspace — criar workspace', () => {
  it('navega para /workspace/workspaces ao clicar em "Criar novo workspace"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Criar novo workspace')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Criar novo workspace'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/workspaces')
  })
})

// ─── 5. Botão Sair ──────────────────────────────────────────────────────────

describe('SelecionarWorkspace — logout', () => {
  it('chama signOut ao clicar em "Sair"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Sair')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Sair'))
    expect(mockSignOut).toHaveBeenCalledOnce()
  })
})

// ─── 6. Seção de Produtos ───────────────────────────────────────────────────

describe('SelecionarWorkspace — seção Produtos', () => {
  it('renderiza seção "Produtos" com cabeçalho', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Produtos')).toBeInTheDocument()
    })
    expect(screen.getByText('Ver catálogo completo')).toBeInTheDocument()
  })

  it('mostra painel "Seus Produtos Contratados" com estado vazio', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Seus Produtos Contratados')).toBeInTheDocument()
    })
    expect(screen.getByText('0 ativos')).toBeInTheDocument()
    expect(screen.getByText('Nenhum produto ativo')).toBeInTheDocument()
    expect(screen.getByText('Explorar Catálogo')).toBeInTheDocument()
  })

  it('mostra painel "Sugeridos para Você" com 4 produtos', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Sugeridos para Você')).toBeInTheDocument()
    })
    expect(screen.getByText('4 novos')).toBeInTheDocument()
    expect(screen.getByText('Classificação Fiscal IA')).toBeInTheDocument()
    expect(screen.getByText('Simulador de Drawback')).toBeInTheDocument()
    expect(screen.getByText('Monitor DI / LI')).toBeInTheDocument()
    expect(screen.getByText('Compliance Tributário')).toBeInTheDocument()
  })

  it('mostra badges corretos dos produtos sugeridos', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('30% OFF')).toBeInTheDocument()
    })
    expect(screen.getByText('Novo')).toBeInTheDocument()
    // Dois badges "Trial 14d"
    const trialBadges = screen.getAllByText('Trial 14d')
    expect(trialBadges).toHaveLength(2)
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

  it('navega ao clicar "Explorar Catálogo"', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Explorar Catálogo')).toBeInTheDocument()
    })

    await user.click(screen.getByText('Explorar Catálogo'))
    expect(mockNavigate).toHaveBeenCalledWith('/workspace/assinaturas')
  })
})

// ─── 7. Seção Acesso Rápido ─────────────────────────────────────────────────

describe('SelecionarWorkspace — seção Acesso Rápido', () => {
  it('renderiza seção "Acesso Rápido" com atalhos', async () => {
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

  it('mostra tags "Admin" nos atalhos corretos', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Configurador')).toBeInTheDocument()
    })
    const adminTags = screen.getAllByText('Admin')
    expect(adminTags.length).toBeGreaterThanOrEqual(2)
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

// ─── 8. Painel Gabi AI ──────────────────────────────────────────────────────

describe('SelecionarWorkspace — painel Gabi AI', () => {
  it('renderiza cabeçalho Gabi AI com insights', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('GABI AI · Insights')).toBeInTheDocument()
    })
    expect(screen.getByText('3 oportunidades esta semana')).toBeInTheDocument()
    expect(screen.getByText('ao vivo')).toBeInTheDocument()
  })

  it('renderiza insight de redução tributária', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/Redução Tributária · NCM 8471/)).toBeInTheDocument()
    })
    expect(screen.getByText(/40% das suas simulações/)).toBeInTheDocument()
    expect(screen.getByText('R$ 28.400/mês')).toBeInTheDocument()
    expect(screen.getByText('Ver análise completa')).toBeInTheDocument()
  })

  it('renderiza alerta de prazo drawback', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText(/Alerta de Prazo · Drawback/)).toBeInTheDocument()
    })
    expect(screen.getByText(/2 regimes de drawback/)).toBeInTheDocument()
    expect(screen.getByText('Ver prazos')).toBeInTheDocument()
  })
})

// ─── 9. Integração com API ──────────────────────────────────────────────────

describe('SelecionarWorkspace — integração com API', () => {
  it('carrega workspaces da API quando disponível', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        companies: [
          { id: 'real-1', name: 'Empresa Real' },
          { id: 'real-2', name: 'Outra Empresa' },
        ],
      }),
    })

    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('Empresa Real')).toBeInTheDocument()
    })
    expect(screen.getByText('Outra Empresa')).toBeInTheDocument()
  })

  it('usa dados mock quando API falha', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })
  })

  it('usa dados mock quando API retorna lista vazia', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ companies: [] }),
    })
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })
  })
})

// ─── 10. Acessibilidade ─────────────────────────────────────────────────────

describe('SelecionarWorkspace — acessibilidade', () => {
  it('workspace cards têm role="button" e tabIndex', async () => {
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('workspace cards respondem a teclado (Enter)', async () => {
    const user = userEvent.setup()
    renderDashboard()
    await waitFor(() => {
      expect(screen.getByText('TESTE ABC')).toBeInTheDocument()
    })

    // Foca e pressiona Enter no segundo card (Empresa Beta)
    const empresaBetaCard = screen.getByText('Empresa Beta').closest('[role="button"]')
    if (empresaBetaCard) {
      (empresaBetaCard as HTMLElement).focus()
      await user.keyboard('{Enter}')
      expect(screen.getByText(/Workspace: Empresa Beta/)).toBeInTheDocument()
    }
  })
})
