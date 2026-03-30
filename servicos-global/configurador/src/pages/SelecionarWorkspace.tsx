import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useClerk, useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  House,
  SquaresFour,
  ChartLine,
  UsersThree,
  GearSix,
  Bell,
  MagnifyingGlass,
  CaretDown,
  SignOut,
  Plus,
  Check,
  ArrowRight,
  Star,
  Download,
  CheckCircle,
  Clock,
  Sparkle,
  Warning,
  Envelope,
  WhatsappLogo,
  ShoppingBagOpen,
  Folders,
  FileText,
  ClockCounterClockwise,
  Plug,
  Package,
  ListChecks,
} from '@phosphor-icons/react'
import { MenuLateralGlobal, type NavItem } from '@nucleo/menu-lateral-global'
import './selecionar-workspace.css'

/* ── Tipos ── */
interface Workspace {
  id: string
  nome: string
  iniciais: string
  plano: 'business' | 'starter' | 'pro'
  role: string
  modulos: number
  membros: number
  simulacoes: string
  gradientFrom: string
  gradientTo: string
}

interface ProdutoSugerido {
  id: string
  nome: string
  descricao: string
  badge: 'promo' | 'new' | 'trial'
  badgeLabel: string
  stat?: string
  iconBg: string
  iconColor: string
  icon: 'star' | 'squares' | 'download' | 'check'
}

interface ProdutoAtivo {
  id: string
  slug: string
  nome: string
  rota: string
}

interface Atalho {
  id: string
  nome: string
  descricao: string
  iconBg: string
  iconColor: string
  icon: 'gear' | 'squares' | 'chart' | 'users'
  admin?: boolean
  rota: string
}

/* ── Dados mock (serão substituídos por API) ── */
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: 'ws-1',
    nome: 'TESTE ABC',
    iniciais: 'TA',
    plano: 'business',
    role: 'Admin',
    modulos: 0,
    membros: 1,
    simulacoes: '847',
    gradientFrom: '#4F63FF',
    gradientTo: '#1ED8C8',
  },
  {
    id: 'ws-2',
    nome: 'Empresa Beta',
    iniciais: 'CB',
    plano: 'starter',
    role: 'Editor',
    modulos: 3,
    membros: 5,
    simulacoes: '1.2k',
    gradientFrom: '#F6A832',
    gradientTo: '#F04E42',
  },
  {
    id: 'ws-3',
    nome: 'XYZ Importações',
    iniciais: 'XY',
    plano: 'pro',
    role: 'Visualizador',
    modulos: 7,
    membros: 12,
    simulacoes: '4.7k',
    gradientFrom: '#1ED8C8',
    gradientTo: '#20C96A',
  },
]

const MOCK_PRODUTOS_SUGERIDOS: ProdutoSugerido[] = [
  {
    id: 'p1',
    nome: 'Classificação Fiscal IA',
    descricao: 'NCMs automáticos com 98% de precisão',
    badge: 'promo',
    badgeLabel: '30% OFF',
    stat: 'Base 80k NCMs',
    iconBg: 'var(--sw-amber-dim)',
    iconColor: 'var(--sw-amber)',
    icon: 'star',
  },
  {
    id: 'p2',
    nome: 'Simulador de Drawback',
    descricao: 'Exoneração tributária em tempo real',
    badge: 'new',
    badgeLabel: 'Novo',
    iconBg: 'var(--sw-accent-dim)',
    iconColor: 'var(--sw-accent-2)',
    icon: 'squares',
  },
  {
    id: 'p3',
    nome: 'Monitor DI / LI',
    descricao: 'Acompanhe declarações em tempo real',
    badge: 'trial',
    badgeLabel: 'Trial 14d',
    iconBg: 'var(--sw-teal-dim)',
    iconColor: 'var(--sw-teal)',
    icon: 'download',
  },
  {
    id: 'p4',
    nome: 'Compliance Tributário',
    descricao: 'SPED, EFD, ECF — auditoria automática',
    badge: 'trial',
    badgeLabel: 'Trial 14d',
    iconBg: 'var(--sw-green-dim)',
    iconColor: 'var(--sw-green)',
    icon: 'check',
  },
]

const MOCK_ATALHOS: Atalho[] = [
  { id: 'a1', nome: 'Configurador', descricao: 'Workspace, CNPJ, regras fiscais e usuários', iconBg: 'var(--sw-amber-dim)', iconColor: 'var(--sw-amber)', icon: 'gear', admin: true, rota: '/workspace/organizacao' },
  { id: 'a2', nome: 'Store de Módulos', descricao: 'Ative, desative e gerencie produtos', iconBg: 'var(--sw-accent-dim)', iconColor: 'var(--sw-accent-2)', icon: 'squares', rota: '/workspace/assinaturas' },
  { id: 'a3', nome: 'Relatórios', descricao: 'Exportações, histórico e dashboards', iconBg: 'var(--sw-green-dim)', iconColor: 'var(--sw-green)', icon: 'chart', rota: '/workspace/financeiro' },
  { id: 'a4', nome: 'Equipe', descricao: 'Convites, papéis e permissões', iconBg: 'var(--sw-surface-3)', iconColor: 'var(--sw-text-2)', icon: 'users', admin: true, rota: '/workspace/usuarios' },
]

/* ── Helpers ── */
function planLabel(plano: string): string {
  const map: Record<string, string> = { business: 'Business', starter: 'Starter', pro: 'Pro' }
  return map[plano] ?? plano
}

function planClass(plano: string): string {
  const map: Record<string, string> = { business: 'sw-plan-business', starter: 'sw-plan-starter', pro: 'sw-plan-pro' }
  return map[plano] ?? ''
}

function badgeClass(badge: string): string {
  const map: Record<string, string> = { promo: 'sw-b-promo', new: 'sw-b-new', trial: 'sw-b-trial', active: 'sw-b-active' }
  return map[badge] ?? ''
}

function ProdIcon({ icon, color }: { icon: string; color: string }) {
  const props = { size: 18, weight: 'regular' as const, style: { color } }
  switch (icon) {
    case 'star': return <Star {...props} />
    case 'squares': return <SquaresFour {...props} />
    case 'download': return <Download {...props} />
    case 'check': return <CheckCircle {...props} />
    default: return <Star {...props} />
  }
}

function ShortcutIcon({ icon, color }: { icon: string; color: string }) {
  const props = { size: 17, weight: 'regular' as const, style: { color } }
  switch (icon) {
    case 'gear': return <GearSix {...props} />
    case 'squares': return <SquaresFour {...props} />
    case 'chart': return <ChartLine {...props} />
    case 'users': return <UsersThree {...props} />
    default: return <GearSix {...props} />
  }
}

/* ── Mapa de slug → rota e nome amigável ── */
const PRODUCT_ROUTE_MAP: Record<string, { nome: string; rota: string }> = {
  'simula-custo': { nome: 'SimulaCusto', rota: '/produto/simula-custo' },
  'bid-frete': { nome: 'BID Frete Internacional', rota: '/produto/bid-frete' },
  'bid-cambio': { nome: 'BID Câmbio', rota: '/produto/bid-cambio' },
  'smart-read': { nome: 'Smart Read', rota: '/produto/smart-read' },
  'processo': { nome: 'Processo', rota: '/produto/processo' },
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — SelecionarWorkspace (Dashboard Core)
══════════════════════════════════════════════════════ */
export function SelecionarWorkspace() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [entrando, setEntrando] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])

  const userName = user?.fullName ?? user?.firstName ?? 'Admin'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userRole = (user?.publicMetadata?.role as string) ?? 'Superadmin'

  const selectedWs = workspaces.find(w => w.id === selectedId)
  const tenantName = selectedWs?.nome ?? 'Gravity'
  const tenantPlan = selectedWs ? planLabel(selectedWs.plano) : 'Business'

  /* ── Carrega workspaces da API ── */
  useEffect(() => {
    let cancelled = false

    async function carregarWorkspaces() {
      try {
        const token = await getToken()
        const response = await fetch('/api/v1/tenants/companies', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (!cancelled && data.companies && data.companies.length > 0) {
          const mapeados: Workspace[] = data.companies.map((c: Record<string, unknown>, i: number) => ({
            id: c.id as string,
            nome: c.name as string,
            iniciais: (c.name as string).substring(0, 2).toUpperCase(),
            plano: 'business' as const,
            role: 'Admin',
            modulos: 0,
            membros: 1,
            simulacoes: '0',
            gradientFrom: MOCK_WORKSPACES[i % MOCK_WORKSPACES.length].gradientFrom,
            gradientTo: MOCK_WORKSPACES[i % MOCK_WORKSPACES.length].gradientTo,
          }))
          setWorkspaces(mapeados)
          setSelectedId(mapeados[0].id)
        } else if (!cancelled) {
          setWorkspaces(MOCK_WORKSPACES)
          setSelectedId(MOCK_WORKSPACES[0].id)
        }
      } catch {
        if (!cancelled) {
          setWorkspaces(MOCK_WORKSPACES)
          setSelectedId(MOCK_WORKSPACES[0].id)
        }
      } finally {
        if (!cancelled) setCarregando(false)
      }
    }

    carregarWorkspaces()
    return () => { cancelled = true }
  }, [getToken])

  /* ── Carrega produtos ativos do catálogo ── */
  useEffect(() => {
    let cancelled = false

    async function carregarProdutos() {
      try {
        const token = await getToken()
        const response = await fetch('/api/v1/products', {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()

        if (!cancelled && data.products) {
          const ativos: ProdutoAtivo[] = data.products
            .filter((p: Record<string, unknown>) => p.status === 'ACTIVE')
            .map((p: Record<string, unknown>) => {
              const slug = p.slug as string
              const info = PRODUCT_ROUTE_MAP[slug]
              return {
                id: p.id as string,
                slug,
                nome: info?.nome ?? (p.name as string),
                rota: info?.rota ?? `/produto/${slug}`,
              }
            })
          setProdutosAtivos(ativos)
        }
      } catch {
        // Sem produtos ativos — menu não mostrará seção de produtos Gravity
      }
    }

    carregarProdutos()
    return () => { cancelled = true }
  }, [getToken])

  /* ── Menu lateral: navItems ── */
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []

    // ── Meu Espaço ──
    items.push({
      label: 'Meu Espaço',
      icon: <House weight="duotone" size={18} />,
      children: [
        { to: '/hub', label: 'Dashboard', icon: <House weight="duotone" size={18} /> },
        { to: '/hub', label: 'Atividades', icon: <ListChecks weight="duotone" size={18} /> },
        { to: '/store', label: 'Produtos', icon: <Package weight="duotone" size={18} /> },
        { to: '/workspace/financeiro', label: 'Email', icon: <Envelope weight="duotone" size={18} /> },
        { to: '/workspace/usuarios', label: 'WhatsApp', icon: <WhatsappLogo weight="duotone" size={18} /> },
      ],
    })

    // ── Produtos Gravity (dinâmico baseado em produtos ativos) ──
    if (produtosAtivos.length > 0) {
      items.push({
        label: 'Produtos Gravity',
        sectionDivider: true,
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })

      produtosAtivos.forEach(prod => {
        items.push({
          to: prod.rota,
          label: prod.nome,
          icon: <Package weight="duotone" size={18} />,
        })
      })
    } else {
      // Fallback: mostra seção com indicação de que não há produtos
      items.push({
        label: 'Produtos Gravity',
        sectionDivider: true,
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
      items.push({
        to: '/store',
        label: 'Explorar Catálogo',
        icon: <ShoppingBagOpen weight="duotone" size={18} />,
      })
    }

    // ── Divisor ──
    items.push({ label: '', sectionDivider: true, icon: null })

    // ── Processo ──
    items.push({
      to: '/produto/processo',
      label: 'Processo',
      icon: <Folders weight="duotone" size={18} />,
    })

    // ── Relatórios ──
    items.push({
      to: '/workspace/financeiro',
      label: 'Relatórios',
      icon: <FileText weight="duotone" size={18} />,
    })

    // ── Histórico de Alterações ──
    items.push({
      to: '/workspace/organizacao',
      label: 'Histórico de Alterações',
      icon: <ClockCounterClockwise weight="duotone" size={18} />,
    })

    // ── Cockpit API ──
    items.push({
      to: '/workspace/api-cockpit',
      label: 'Cockpit API',
      icon: <Plug weight="duotone" size={18} />,
    })

    // ── Configurações ──
    items.push({
      to: '/workspace/organizacao',
      label: 'Configurações',
      icon: <GearSix weight="duotone" size={18} />,
    })

    return items
  }, [produtosAtivos])

  /* ── Handlers ── */
  const handleSelectWs = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleEnterWs = useCallback(() => {
    if (!selectedWs || entrando) return
    setEntrando(true)
    sessionStorage.setItem('gravity_company_id', selectedWs.id)
    sessionStorage.setItem('gravity_company_name', selectedWs.nome)
    setTimeout(() => navigate('/core'), 500)
  }, [selectedWs, entrando, navigate])

  const handleSair = useCallback(() => {
    signOut(() => navigate('/'))
  }, [signOut, navigate])

  const handleCriarWorkspace = useCallback(() => {
    navigate('/workspace/workspaces')
  }, [navigate])

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div className="sw-shell sw-shell--no-sidebar">
      {/* ── PAGE (Hub sem menu lateral) ── */}
      <div className="sw-page sw-page--full">
        {/* TOPBAR */}
        <header className="sw-topbar">
          <span className="sw-t-brand">Gravity<span>.</span></span>
          <div className="sw-t-right">
            <div className="sw-notif-wrap">
              <button className="sw-t-icon" type="button" title="Notificações">
                <Bell size={15} />
              </button>
            </div>
            <button className="sw-t-icon" type="button" title="Buscar">
              <MagnifyingGlass size={15} />
            </button>
            <div className="sw-t-sep" />
            <button className="sw-t-user" type="button">
              <div className="sw-t-user-ava">{userInitials}</div>
              <div>
                <div className="sw-t-user-name">{userName}</div>
                <div className="sw-t-user-role">{userRole}</div>
              </div>
              <CaretDown size={12} style={{ color: 'var(--sw-text-3)', marginLeft: 2 }} />
            </button>
            <button className="sw-t-exit" type="button" onClick={handleSair}>
              <SignOut size={13} />
              Sair
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="sw-content">
          {carregando ? (
            <div className="sw-loading">
              <div className="sw-loading-spinner" />
              <span>Carregando workspaces...</span>
            </div>
          ) : (
            <>
              {/* ════ BLOCO 1: WORKSPACES ════ */}
              <section className="sw-ws-section sw-a0">
                <h1 className="sw-ws-title">Acessar Workspace</h1>
                <p className="sw-ws-sub">Selecione o workspace que deseja operar nesta sessão.</p>

                <div className="sw-ws-grid">
                  {workspaces.map(ws => (
                    <div
                      key={ws.id}
                      className={`sw-ws-card${ws.id === selectedId ? ' selected' : ''}`}
                      onClick={() => handleSelectWs(ws.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSelectWs(ws.id) }}
                    >
                      <div className="sw-ws-card-top">
                        <div
                          className="sw-ws-logo"
                          style={{ background: `linear-gradient(135deg, ${ws.gradientFrom} 0%, ${ws.gradientTo} 100%)` }}
                        >
                          {ws.iniciais}
                        </div>
                        <div className="sw-ws-check">
                          <Check size={12} color="white" weight="bold" />
                        </div>
                      </div>

                      <div>
                        <div className="sw-ws-name">{ws.nome}</div>
                        <div className="sw-ws-meta">
                          <span className={`sw-ws-plan-tag ${planClass(ws.plano)}`}>
                            {planLabel(ws.plano)}
                          </span>
                          <span className="sw-ws-role">· {ws.role}</span>
                        </div>
                      </div>

                      <div className="sw-ws-stats">
                        <div>
                          <div className="sw-ws-stat-n">{ws.modulos}</div>
                          <div className="sw-ws-stat-l">Módulos</div>
                        </div>
                        <div>
                          <div className="sw-ws-stat-n">{ws.membros}</div>
                          <div className="sw-ws-stat-l">Membros</div>
                        </div>
                        <div>
                          <div className="sw-ws-stat-n">{ws.simulacoes}</div>
                          <div className="sw-ws-stat-l">Simulações</div>
                        </div>
                      </div>

                      <button
                        className="sw-ws-enter-btn"
                        type="button"
                        onClick={e => { e.stopPropagation(); handleEnterWs() }}
                        disabled={entrando}
                      >
                        {entrando ? 'Entrando...' : 'Entrar no Workspace'}
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ))}

                  {/* Criar novo workspace */}
                  <button className="sw-ws-add-card" type="button" onClick={handleCriarWorkspace}>
                    <Plus size={20} />
                    <span className="sw-ws-add-label">Criar novo workspace</span>
                  </button>
                </div>
              </section>

              {/* DIVIDER */}
              {selectedWs && (
                <div className="sw-pill-divider sw-a1">
                  <div className="sw-pill-divider-line" />
                  <div className="sw-pill-divider-label">Workspace: {selectedWs.nome}</div>
                  <div className="sw-pill-divider-line" />
                </div>
              )}

              {/* ════ BLOCO 2: PRODUTOS ════ */}
              <section className="sw-products-section sw-a1">
                <div className="sw-sec-header">
                  <div className="sw-sec-title-wrap">
                    <div className="sw-sec-pip" style={{ background: 'var(--sw-accent-2)' }} />
                    <span className="sw-sec-title">Produtos</span>
                  </div>
                  <button className="sw-sec-link" type="button" onClick={() => navigate('/workspace/assinaturas')}>
                    Ver catálogo completo
                    <ArrowRight size={12} />
                  </button>
                </div>

                <div className="sw-products-cols">
                  {/* Contratados (empty state) */}
                  <div className="sw-prod-panel">
                    <div className="sw-prod-panel-head">
                      <span className="sw-prod-panel-title contracted">Seus Produtos Contratados</span>
                      <span className="sw-sec-count">0 ativos</span>
                    </div>
                    <div className="sw-prod-empty">
                      <div className="sw-prod-empty-icon">
                        <Clock size={20} />
                      </div>
                      <div className="sw-prod-empty-title">Nenhum produto ativo</div>
                      <div className="sw-prod-empty-desc">
                        Explore o catálogo e ative seu primeiro módulo para este workspace.
                      </div>
                      <button className="sw-btn-sm" type="button" onClick={() => navigate('/workspace/assinaturas')}>
                        Explorar Catálogo
                      </button>
                    </div>
                  </div>

                  {/* Sugeridos */}
                  <div className="sw-prod-panel">
                    <div className="sw-prod-panel-head">
                      <span className="sw-prod-panel-title suggested">Sugeridos para Você</span>
                      <span className="sw-sec-count" style={{ background: 'var(--sw-accent-dim)', color: 'var(--sw-accent-2)' }}>
                        {MOCK_PRODUTOS_SUGERIDOS.length} novos
                      </span>
                    </div>
                    <div className="sw-prod-list">
                      {MOCK_PRODUTOS_SUGERIDOS.map(prod => (
                        <div key={prod.id} className="sw-prod-item">
                          <div className="sw-prod-icon" style={{ background: prod.iconBg }}>
                            <ProdIcon icon={prod.icon} color={prod.iconColor} />
                          </div>
                          <div className="sw-prod-body">
                            <div className="sw-prod-name">{prod.nome}</div>
                            <div className="sw-prod-desc">{prod.descricao}</div>
                          </div>
                          <div className="sw-prod-right">
                            <span className={`sw-badge ${badgeClass(prod.badge)}`}>{prod.badgeLabel}</span>
                            {prod.stat && <span className="sw-prod-stat">{prod.stat}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ════ BLOCO 3: ATALHOS + GABI AI ════ */}
              <section className="sw-a2">
                <div className="sw-sec-header" style={{ marginBottom: 16 }}>
                  <div className="sw-sec-title-wrap">
                    <div className="sw-sec-pip" style={{ background: 'var(--sw-text-3)' }} />
                    <span className="sw-sec-title">Acesso Rápido</span>
                  </div>
                </div>

                <div className="sw-bottom-cols">
                  {/* Shortcuts */}
                  <div className="sw-shortcuts-panel">
                    <div className="sw-shortcuts-head">
                      <span className="sw-shortcuts-head-title">Atalhos</span>
                    </div>
                    <div className="sw-shortcuts-grid">
                      {MOCK_ATALHOS.map(atalho => (
                        <button
                          key={atalho.id}
                          className="sw-shortcut-item"
                          type="button"
                          onClick={() => navigate(atalho.rota)}
                        >
                          <div className="sw-sh-icon" style={{ background: atalho.iconBg }}>
                            <ShortcutIcon icon={atalho.icon} color={atalho.iconColor} />
                          </div>
                          <div>
                            <div className="sw-sh-name">{atalho.nome}</div>
                            <div className="sw-sh-desc">{atalho.descricao}</div>
                          </div>
                          {atalho.admin && (
                            <span className="sw-sh-tag sw-sh-admin">Admin</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* GABI AI Insights */}
                  <div className="sw-gabi-panel">
                    <div className="sw-gabi-head">
                      <div className="sw-gabi-icon-wrap">
                        <Sparkle size={15} />
                      </div>
                      <div>
                        <div className="sw-gabi-title">GABI AI · Insights</div>
                        <div className="sw-gabi-sub">3 oportunidades esta semana</div>
                      </div>
                      <div className="sw-gabi-live">
                        <div className="sw-gabi-live-dot" />
                        ao vivo
                      </div>
                    </div>

                    <div className="sw-gabi-body">
                      {/* Insight 1: Redução Tributária */}
                      <div className="sw-insight-card">
                        <div className="sw-i-type">
                          <Download size={11} />
                          Redução Tributária · NCM 8471
                        </div>
                        <div className="sw-i-text">
                          <strong>40% das suas simulações</strong> recentes poderiam economizar até{' '}
                          <strong>12% em ICMS</strong> com desembaraço via Santa Catarina.
                        </div>
                        <div className="sw-i-saving">
                          <span className="sw-i-saving-label">Economia estimada</span>
                          <span className="sw-i-saving-value">R$ 28.400/mês</span>
                        </div>
                        <div className="sw-i-footer">
                          <button className="sw-i-action" type="button">
                            Ver análise completa
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>

                      {/* Insight 2: Alerta de Prazo */}
                      <div className="sw-insight-card secondary">
                        <div className="sw-i-type">
                          <Warning size={11} />
                          Alerta de Prazo · Drawback
                        </div>
                        <div className="sw-i-text">
                          <strong>2 regimes de drawback</strong> vencem em menos de{' '}
                          <strong>30 dias</strong>. Renove para não perder o benefício.
                        </div>
                        <div className="sw-i-footer">
                          <button className="sw-i-action" type="button">
                            Ver prazos
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
