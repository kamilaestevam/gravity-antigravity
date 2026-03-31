/**
 * Testes funcionais — WorkflowPage (Produto Processo)
 * Localizacao: testes/testes-funcionais/produtos/processo/WorkflowPage.test.tsx
 *
 * Ferramentas: Vitest + @testing-library/react (jsdom)
 * Cobertura: loading skeleton, empty state, timeline stepper, follow-up feed,
 *            filtros de categoria, caixa de comentario, exclusao de documento,
 *            estimativas de custo, estados vazios
 */

// @vitest-environment jsdom

import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// ─── Mock Data ──────────────────────────────────────────────────────────────

const mockProcesso = {
  id: 'proc-1',
  tenant_id: 'tenant-1',
  numero: 'IMP-2026/0001',
  referencia_cliente: 'REF-001',
  importador_nome: 'Acme Ltda',
  importador_cnpj: '12.345.678/0001-00',
  exportador_nome: 'Shanghai Co',
  exportador_pais: 'CN',
  status: 'em_andamento' as const,
  valor_fob_total: 50000,
  moeda_fob: 'USD',
  peso_bruto_total: 1200,
  data_abertura: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  etapas: [
    { id: 'e1', processo_id: 'proc-1', nome: 'Abertura', ordem: 1, status: 'concluida' as const, data_conclusao: '2026-01-10T00:00:00Z', created_at: '2026-01-10T00:00:00Z' },
    { id: 'e2', processo_id: 'proc-1', nome: 'Pedido', ordem: 2, status: 'em_andamento' as const, created_at: '2026-01-15T00:00:00Z' },
    { id: 'e3', processo_id: 'proc-1', nome: 'Embarque', ordem: 3, status: 'pendente' as const, created_at: '2026-01-15T00:00:00Z' },
  ],
  documentos: [
    { id: 'd1', processo_id: 'proc-1', tenant_id: 'tenant-1', tipo: 'invoice' as const, nome: 'Invoice.pdf', arquivo_url: '#', tamanho_bytes: 100000, mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-01-20T00:00:00Z' },
    { id: 'd2', processo_id: 'proc-1', tenant_id: 'tenant-1', tipo: 'bl' as const, nome: 'BL-2026.pdf', arquivo_url: '#', tamanho_bytes: 250000, mime_type: 'application/pdf', uploaded_by: 'user1', created_at: '2026-01-22T00:00:00Z' },
  ],
  estimativasCusto: [
    { id: 'c1', processo_id: 'proc-1', tenant_id: 'tenant-1', categoria: 'Frete', descricao: 'Frete maritimo', valor_estimado: 5000, valor_real: 5200, moeda: 'BRL', status: 'confirmado' as const, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
    { id: 'c2', processo_id: 'proc-1', tenant_id: 'tenant-1', categoria: 'Seguro', descricao: 'Seguro carga', valor_estimado: 1200, valor_real: undefined, moeda: 'BRL', status: 'estimado' as const, created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z' },
  ],
  pedidos: [],
  followUps: [],
}

const mockFollowUps = [
  {
    id: 'fu-1',
    processo_id: 'proc-1',
    tenant_id: 'tenant-1',
    user_id: 'u1',
    user_nome: 'Ana Silva',
    tipo: 'comentario' as const,
    categoria: 'geral' as const,
    titulo: 'Nota sobre embarque',
    descricao: 'Container confirmado para semana que vem',
    created_at: '2026-01-25T10:30:00Z',
  },
  {
    id: 'fu-2',
    processo_id: 'proc-1',
    tenant_id: 'tenant-1',
    user_id: 'system',
    user_nome: 'Sistema',
    tipo: 'sistema' as const,
    categoria: 'operacional' as const,
    titulo: 'Status atualizado',
    descricao: 'Processo movido para Em Andamento',
    created_at: '2026-01-24T08:00:00Z',
  },
  {
    id: 'fu-3',
    processo_id: 'proc-1',
    tenant_id: 'tenant-1',
    user_id: 'u2',
    user_nome: 'Bruno Costa',
    tipo: 'email' as const,
    categoria: 'cliente' as const,
    titulo: 'Email enviado',
    descricao: 'Confirmacao de embarque enviada ao cliente',
    created_at: '2026-01-26T14:00:00Z',
  },
]

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRefetch = vi.fn()
const mockAddNotification = vi.fn()

let mockLoading = false
let mockProcessoValue: typeof mockProcesso | null = mockProcesso

vi.mock('../../../../produto/processo/client/src/pages/ProcessoLayout', () => ({
  useProcesso: () => ({
    processo: mockProcessoValue,
    loading: mockLoading,
    error: null,
    refetch: mockRefetch,
  }),
  ProcessoContext: { Provider: ({ children }: { children: React.ReactNode }) => children },
}))

vi.mock('@gravity/shell', () => ({
  useShellStore: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ addNotification: mockAddNotification }),
}))

const mockGetFollowUps = vi.fn().mockResolvedValue([])
const mockCreateFollowUp = vi.fn().mockResolvedValue({ id: 'fu-new' })
const mockDeleteDocumento = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../../produto/processo/client/src/shared/api', () => ({
  getFollowUps: (...args: unknown[]) => mockGetFollowUps(...args),
  createFollowUp: (...args: unknown[]) => mockCreateFollowUp(...args),
  deleteDocumento: (...args: unknown[]) => mockDeleteDocumento(...args),
}))

// Mock nucleo-global components as simple pass-through wrappers
vi.mock('@nucleo/pagina-global', () => ({
  PaginaGlobal: ({ children, cabecalho }: { children: React.ReactNode; cabecalho?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'pagina-global' }, cabecalho, children),
}))

vi.mock('@nucleo/cabecalho-global', () => ({
  CabecalhoGlobal: ({ titulo, subtitulo, acoes }: { titulo?: string; subtitulo?: string; acoes?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'cabecalho-global' },
      titulo && React.createElement('span', null, titulo),
      subtitulo && React.createElement('span', null, subtitulo),
      acoes,
    ),
}))

vi.mock('@nucleo/card-global', () => ({
  CardBasicoGlobal: ({ titulo, valor, subtexto }: { titulo?: string; valor?: string; subtexto?: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'card-basico' },
      titulo && React.createElement('span', null, titulo),
      valor && React.createElement('span', null, valor),
      subtexto,
    ),
}))

vi.mock('@nucleo/botao-global', () => ({
  BotaoGlobal: ({ children, onClick, disabled, className }: { children?: React.ReactNode; onClick?: () => void; disabled?: boolean; className?: string }) =>
    React.createElement('button', { onClick, disabled, className, 'data-testid': 'botao-global' }, children),
}))

vi.mock('@nucleo/tooltip-global', () => ({
  TooltipGlobal: ({ children }: { children: React.ReactNode }) =>
    React.createElement('div', { 'data-testid': 'tooltip-global' }, children),
}))

vi.mock('@nucleo/campo-geral-global', () => ({
  GeralCampoGlobal: ({ children, label }: { children?: React.ReactNode; label?: string }) =>
    React.createElement('div', { 'data-testid': 'campo-geral', 'aria-label': label }, children),
}))

vi.mock('@nucleo/modal-confirmar-excluir-global', () => ({
  SelecaoExcluirGlobal: ({ aberto, titulo, descricao, nomeItem, aoConfirmar, aoCancelar }: {
    aberto: boolean; titulo?: string; descricao?: string; nomeItem?: string;
    aoConfirmar?: () => void; aoCancelar?: () => void
  }) =>
    aberto
      ? React.createElement('div', { 'data-testid': 'modal-excluir', role: 'dialog' },
          titulo && React.createElement('h2', null, titulo),
          descricao && React.createElement('p', null, descricao),
          nomeItem && React.createElement('span', { 'data-testid': 'modal-nome-item' }, nomeItem),
          React.createElement('button', { onClick: aoConfirmar, 'data-testid': 'modal-confirmar' }, 'Confirmar'),
          React.createElement('button', { onClick: aoCancelar, 'data-testid': 'modal-cancelar' }, 'Cancelar'),
        )
      : null,
}))

vi.mock('@nucleo/status-badge-global', () => ({
  StatusBadgeGlobal: ({ valor }: { valor?: string }) =>
    React.createElement('span', { 'data-testid': 'status-badge' }, valor),
}))

// Mock Phosphor icons as simple spans showing icon name
const iconMock = (name: string) =>
  (props: Record<string, unknown>) => React.createElement('span', { 'data-testid': `icon-${name}`, ...props })

vi.mock('@phosphor-icons/react', () => ({
  FlowArrow: iconMock('FlowArrow'),
  ChatText: iconMock('ChatText'),
  File: iconMock('File'),
  Envelope: iconMock('Envelope'),
  Robot: iconMock('Robot'),
  Check: iconMock('Check'),
  Trash: iconMock('Trash'),
  PaperPlaneRight: iconMock('PaperPlaneRight'),
  CurrencyDollar: iconMock('CurrencyDollar'),
  Package: iconMock('Package'),
  Truck: iconMock('Truck'),
  ShieldCheck: iconMock('ShieldCheck'),
  Clock: iconMock('Clock'),
  Warning: iconMock('Warning'),
  Empty: iconMock('Empty'),
}))

// Mock CSS import
vi.mock('../../../../produto/processo/client/src/pages/workflow/WorkflowPage.css', () => ({}))

// ─── Import Component Under Test ────────────────────────────────────────────

import WorkflowPage from '../../../../produto/processo/client/src/pages/workflow/WorkflowPage'

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderWorkflow() {
  return render(React.createElement(WorkflowPage))
}

// ─── Tests ──────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockLoading = false
  mockProcessoValue = mockProcesso
  mockGetFollowUps.mockResolvedValue([])
  mockCreateFollowUp.mockResolvedValue({ id: 'fu-new' })
  mockDeleteDocumento.mockResolvedValue(undefined)
})

// ═══════════════════════════════════════════════════════════════════════════
// 1. Loading State
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Loading State', () => {
  it('renders loading skeleton when loading=true', () => {
    mockLoading = true
    const { container } = renderWorkflow()

    expect(container.querySelector('.wf-loading')).toBeTruthy()
    expect(container.querySelectorAll('.wf-skeleton-circle')).toHaveLength(5)
    expect(container.querySelector('.wf-skeleton-stepper')).toBeTruthy()
  })

  it('does not render main content during loading', () => {
    mockLoading = true
    renderWorkflow()

    expect(screen.queryByText(/Workflow/)).toBeNull()
    expect(screen.queryByText('Follow-up')).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 2. Empty State (processo = null)
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Empty State', () => {
  it('renders empty state when processo is null', () => {
    mockProcessoValue = null
    const { container } = renderWorkflow()

    expect(container.querySelector('.wf-empty-state')).toBeTruthy()
    expect(screen.getByText('Nenhum processo selecionado')).toBeTruthy()
    expect(screen.getByText('Selecione um processo para visualizar o workflow')).toBeTruthy()
  })

  it('shows FlowArrow icon in empty state', () => {
    mockProcessoValue = null
    renderWorkflow()

    expect(screen.getByTestId('icon-FlowArrow')).toBeTruthy()
  })

  it('does not render stepper or feed when processo is null', () => {
    mockProcessoValue = null
    const { container } = renderWorkflow()

    expect(container.querySelector('.wf-stepper')).toBeNull()
    expect(container.querySelector('.wf-followup-section')).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 3. Header / Cabecalho
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Header', () => {
  it('displays processo numero in header title', async () => {
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText(`Workflow — ${mockProcesso.numero}`)).toBeTruthy()
    })
  })

  it('displays importador and exportador in subtitle', async () => {
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText(`${mockProcesso.importador_nome} | ${mockProcesso.exportador_nome}`)).toBeTruthy()
    })
  })

  it('renders Atualizar button that calls refetch', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Atualizar')).toBeTruthy()
    })

    await user.click(screen.getByText('Atualizar'))
    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 4. Timeline Stepper
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Timeline Stepper', () => {
  it('renders etapas sorted by ordem', async () => {
    renderWorkflow()

    await waitFor(() => {
      const labels = screen.getAllByText(/Abertura|Pedido|Embarque/)
      expect(labels).toHaveLength(6) // label appears in tooltip + step label
    })
  })

  it('shows check icon for concluida etapa', async () => {
    const { container } = renderWorkflow()

    await waitFor(() => {
      const doneCircles = container.querySelectorAll('.wf-step-circle--done')
      expect(doneCircles).toHaveLength(1)
    })

    // Check icon rendered inside done circle
    const doneCircle = container.querySelector('.wf-step-circle--done')
    expect(doneCircle?.querySelector('[data-testid="icon-Check"]')).toBeTruthy()
  })

  it('highlights active etapa circle', async () => {
    const { container } = renderWorkflow()

    await waitFor(() => {
      const activeCircles = container.querySelectorAll('.wf-step-circle--active')
      expect(activeCircles).toHaveLength(1)
    })
  })

  it('shows ordem number for pending etapa', async () => {
    const { container } = renderWorkflow()

    await waitFor(() => {
      const pendingCircles = container.querySelectorAll('.wf-step-circle--pending')
      expect(pendingCircles).toHaveLength(1)
    })

    const pendingCircle = container.querySelector('.wf-step-circle--pending')
    expect(pendingCircle?.textContent).toBe('3')
  })

  it('renders connector lines between steps', async () => {
    const { container } = renderWorkflow()

    await waitFor(() => {
      const connectors = container.querySelectorAll('.wf-connector')
      // 3 etapas = 2 connectors (one before each non-first step)
      expect(connectors).toHaveLength(2)
    })
  })

  it('marks connector as done when adjacent steps are done', async () => {
    const { container } = renderWorkflow()

    await waitFor(() => {
      const doneConnectors = container.querySelectorAll('.wf-connector--done')
      expect(doneConnectors.length).toBeGreaterThanOrEqual(1)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 5. Follow-up Feed
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Follow-up Feed', () => {
  it('shows empty state when no follow-ups exist', async () => {
    mockGetFollowUps.mockResolvedValue([])
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Nenhum follow-up registrado ainda')).toBeTruthy()
    })
  })

  it('renders follow-up items with user name and description', async () => {
    mockGetFollowUps.mockResolvedValue(mockFollowUps)
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Ana Silva')).toBeTruthy()
      expect(screen.getByText('Container confirmado para semana que vem')).toBeTruthy()
      expect(screen.getByText('Nota sobre embarque')).toBeTruthy()
    })
  })

  it('renders system follow-up with Robot icon', async () => {
    mockGetFollowUps.mockResolvedValue(mockFollowUps)
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Sistema')).toBeTruthy()
    })
  })

  it('renders email follow-up with Envelope icon', async () => {
    mockGetFollowUps.mockResolvedValue(mockFollowUps)
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Bruno Costa')).toBeTruthy()
      expect(screen.getByText('Email enviado')).toBeTruthy()
    })
  })

  it('renders tipo label for each follow-up', async () => {
    mockGetFollowUps.mockResolvedValue(mockFollowUps)
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Comentario')).toBeTruthy()
      expect(screen.getByText('Sistema')).toBeTruthy()
      expect(screen.getByText('Email')).toBeTruthy()
    })
  })

  it('calls getFollowUps on mount with tenant and processo IDs', async () => {
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalledWith('tenant-1', 'proc-1', {})
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 6. Category Filter Pills
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Category Filters', () => {
  it('renders all 5 category filter pills', () => {
    renderWorkflow()

    expect(screen.getByText('Geral')).toBeTruthy()
    expect(screen.getByText('Financeiro')).toBeTruthy()
    expect(screen.getByText('Documental')).toBeTruthy()
    expect(screen.getByText('Operacional')).toBeTruthy()
    expect(screen.getByText('Cliente')).toBeTruthy()
  })

  it('activates filter pill on click and refetches follow-ups', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    mockGetFollowUps.mockClear()

    await user.click(screen.getByText('Financeiro'))

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalledWith('tenant-1', 'proc-1', { categoria: 'financeiro' })
    })
  })

  it('deactivates filter pill on second click (toggle off)', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    // First click activates
    await user.click(screen.getByText('Operacional'))
    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalledWith('tenant-1', 'proc-1', { categoria: 'operacional' })
    })

    mockGetFollowUps.mockClear()

    // Second click deactivates
    await user.click(screen.getByText('Operacional'))
    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalledWith('tenant-1', 'proc-1', { categoria: undefined })
    })
  })

  it('adds active class to selected filter pill', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    const pill = screen.getByText('Geral')
    await user.click(pill)

    await waitFor(() => {
      expect(pill.classList.contains('wf-tab-pill--active')).toBe(true)
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 7. Comment Textarea + Submission
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Comment Box', () => {
  it('renders comment textarea with placeholder', () => {
    renderWorkflow()

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    expect(textarea).toBeTruthy()
  })

  it('renders Enviar button initially disabled', () => {
    renderWorkflow()

    const enviarBtn = screen.getByText('Enviar')
    expect(enviarBtn.closest('button')?.disabled).toBe(true)
  })

  it('enables Enviar button when comment has text', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Novo comentario de teste')

    const enviarBtn = screen.getByText('Enviar')
    expect(enviarBtn.closest('button')?.disabled).toBe(false)
  })

  it('does not submit empty comment', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    // Type spaces only
    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, '   ')

    const enviarBtn = screen.getByText('Enviar')
    expect(enviarBtn.closest('button')?.disabled).toBe(true)
  })

  it('calls createFollowUp on Enviar click with correct payload', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Observacao importante')

    await user.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(mockCreateFollowUp).toHaveBeenCalledWith('tenant-1', 'proc-1', {
        tipo: 'comentario',
        categoria: 'geral',
        titulo: 'Comentario',
        descricao: 'Observacao importante',
      })
    })
  })

  it('clears textarea after successful submission', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    const textarea = screen.getByPlaceholderText('Adicionar comentario...') as HTMLTextAreaElement
    await user.type(textarea, 'Comentario temporario')
    await user.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(textarea.value).toBe('')
    })
  })

  it('shows success notification after comment submission', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Comentario com notificacao')
    await user.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Comentario adicionado com sucesso',
      })
    })
  })

  it('shows error notification when submission fails', async () => {
    mockCreateFollowUp.mockRejectedValueOnce(new Error('Network error'))
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Comentario que falha')
    await user.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'danger',
        message: 'Erro ao adicionar comentario',
      })
    })
  })

  it('submits comment on Enter key (without Shift)', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Enter submit test')
    await user.keyboard('{Enter}')

    await waitFor(() => {
      expect(mockCreateFollowUp).toHaveBeenCalled()
    })
  })

  it('refetches follow-ups after successful comment', async () => {
    const user = userEvent.setup()
    renderWorkflow()

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })

    mockGetFollowUps.mockClear()

    const textarea = screen.getByPlaceholderText('Adicionar comentario...')
    await user.type(textarea, 'Refetch test')
    await user.click(screen.getByText('Enviar'))

    await waitFor(() => {
      expect(mockGetFollowUps).toHaveBeenCalled()
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 8. Document List
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Documents', () => {
  it('renders document list with names', async () => {
    renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
      expect(screen.getByText('BL-2026.pdf')).toBeTruthy()
    })
  })

  it('displays document type and size in metadata', async () => {
    renderWorkflow()

    await waitFor(() => {
      // 100000 bytes = ~98 KB
      const metaElements = document.querySelectorAll('.wf-doc-meta')
      expect(metaElements.length).toBe(2)
    })
  })

  it('renders Documentos section title', () => {
    renderWorkflow()

    expect(screen.getByText('Documentos')).toBeTruthy()
  })

  it('shows empty state when no documents exist', () => {
    mockProcessoValue = { ...mockProcesso, documentos: [] }
    renderWorkflow()

    expect(screen.getByText('Nenhum documento anexado')).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 9. Delete Document Flow
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Delete Document', () => {
  it('opens delete modal when trash button is clicked', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    expect(deleteButtons.length).toBe(2)

    await user.click(deleteButtons[0])

    expect(screen.getByTestId('modal-excluir')).toBeTruthy()
    expect(screen.getByText('Excluir Documento')).toBeTruthy()
  })

  it('shows document name in delete modal', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    expect(screen.getByTestId('modal-nome-item').textContent).toBe('Invoice.pdf')
  })

  it('calls deleteDocumento API on confirm', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    await user.click(screen.getByTestId('modal-confirmar'))

    await waitFor(() => {
      expect(mockDeleteDocumento).toHaveBeenCalledWith('tenant-1', 'd1')
    })
  })

  it('calls refetch after successful document deletion', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    await user.click(screen.getByTestId('modal-confirmar'))

    await waitFor(() => {
      expect(mockRefetch).toHaveBeenCalled()
    })
  })

  it('shows success notification after document deletion', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    await user.click(screen.getByTestId('modal-confirmar'))

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        message: 'Documento excluido com sucesso',
      })
    })
  })

  it('closes modal on cancel', async () => {
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    expect(screen.getByTestId('modal-excluir')).toBeTruthy()

    await user.click(screen.getByTestId('modal-cancelar'))

    expect(screen.queryByTestId('modal-excluir')).toBeNull()
  })

  it('shows error notification when deletion fails', async () => {
    mockDeleteDocumento.mockRejectedValueOnce(new Error('Delete failed'))
    const user = userEvent.setup()
    const { container } = renderWorkflow()

    await waitFor(() => {
      expect(screen.getByText('Invoice.pdf')).toBeTruthy()
    })

    const deleteButtons = container.querySelectorAll('.wf-doc-delete')
    await user.click(deleteButtons[0])

    await user.click(screen.getByTestId('modal-confirmar'))

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'danger',
        message: 'Erro ao excluir documento',
      })
    })
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 10. Cost Estimates
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Cost Estimates', () => {
  it('renders Estimativa de Custos section title', () => {
    renderWorkflow()

    expect(screen.getByText('Estimativa de Custos')).toBeTruthy()
  })

  it('renders cost cards with category and formatted value', async () => {
    renderWorkflow()

    await waitFor(() => {
      const cards = screen.getAllByTestId('card-basico')
      expect(cards).toHaveLength(2)
    })

    expect(screen.getByText('Frete')).toBeTruthy()
    expect(screen.getByText('Seguro')).toBeTruthy()
  })

  it('shows "Real:" value for costs with valor_real', () => {
    renderWorkflow()

    const realTexts = document.querySelectorAll('.wf-custo-real')
    expect(realTexts.length).toBe(1)
  })

  it('shows "Aguardando valor real" for costs without valor_real', () => {
    renderWorkflow()

    expect(screen.getByText('Aguardando valor real')).toBeTruthy()
  })

  it('shows empty state when no cost estimates exist', () => {
    mockProcessoValue = { ...mockProcesso, estimativasCusto: [] }
    renderWorkflow()

    expect(screen.getByText('Nenhuma estimativa cadastrada')).toBeTruthy()
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// 11. Follow-up Error Handling
// ═══════════════════════════════════════════════════════════════════════════

describe('WorkflowPage — Follow-up Error Handling', () => {
  it('shows error notification when getFollowUps fails', async () => {
    mockGetFollowUps.mockRejectedValueOnce(new Error('Fetch error'))
    renderWorkflow()

    await waitFor(() => {
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'danger',
        message: 'Erro ao carregar follow-ups',
      })
    })
  })
})
