import { useState, useEffect, useCallback, useMemo } from 'react'
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
import { type NavItem } from '@nucleo/menu-lateral-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import './selecionar-workspace.css'

/* ── Tipos ── */
interface Workspace {
  id: string
  nome: string
  iniciais: string
  role: string
  modulos: number
  membros: number
  gradientFrom: string
  gradientTo: string
}

interface ProdutoContratado {
  product_key: string
  is_active: boolean
  nome: string
  descricao: string
}

interface ProdutoCatalogo {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
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

/* ── Paleta de gradientes para workspace cards ── */
const WORKSPACE_GRADIENTS = [
  { from: '#4F63FF', to: '#1ED8C8' },
  { from: '#F6A832', to: '#F04E42' },
  { from: '#1ED8C8', to: '#20C96A' },
  { from: '#A855F7', to: '#6366F1' },
  { from: '#EC4899', to: '#F43F5E' },
]

/* ── Atalhos (estáticos — navegação interna) ── */
const ATALHOS: Atalho[] = [
  { id: 'a1', nome: 'Configurador', descricao: 'Workspace, CNPJ, regras fiscais e usuários', iconBg: 'var(--sw-amber-dim)', iconColor: 'var(--sw-amber)', icon: 'gear', admin: true, rota: '/workspace/organizacao' },
  { id: 'a2', nome: 'Store de Módulos', descricao: 'Ative, desative e gerencie produtos', iconBg: 'var(--sw-accent-dim)', iconColor: 'var(--sw-accent-2)', icon: 'squares', rota: '/workspace/assinaturas' },
  { id: 'a3', nome: 'Relatórios', descricao: 'Exportações, histórico e dashboards', iconBg: 'var(--sw-green-dim)', iconColor: 'var(--sw-green)', icon: 'chart', rota: '/workspace/financeiro' },
  { id: 'a4', nome: 'Equipe', descricao: 'Convites, papéis e permissões', iconBg: 'var(--sw-surface-3)', iconColor: 'var(--sw-text-2)', icon: 'users', admin: true, rota: '/workspace/usuarios' },
]

/* ── Helpers ── */
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
  const [produtosContratados, setProdutosContratados] = useState<ProdutoContratado[]>([])
  const [catalogoProdutos, setCatalogoProdutos] = useState<ProdutoCatalogo[]>([])

  const userName = user?.fullName ?? user?.firstName ?? 'Admin'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const rawRole = (user?.publicMetadata?.role as string) ?? ''
  const ROLE_LABELS: Record<string, string> = {
    gravity_admin: 'Admin',
    SUPER_ADMIN: 'Admin',
    ADMIN: 'Admin',
    MASTER: 'Master',
    STANDARD: 'Usuário',
    SUPPLIER: 'Fornecedor',
  }
  const userRole = ROLE_LABELS[rawRole] ?? (rawRole || 'Usuário')
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const selectedWs = workspaces.find(w => w.id === selectedId)

  // Produtos contratados ativos
  const contratadosAtivos = produtosContratados.filter(p => p.is_active)

  // Produtos sugeridos = catálogo que o tenant ainda não contratou (inclui Em Breve)
  const slugsContratados = new Set(produtosContratados.map(p => p.product_key))
  const HIDDEN_STATUSES = new Set(['INACTIVE', 'LEGACY', 'SUSPENDED', 'Inativo', 'Legado', 'Suspenso'])
  const produtosSugeridos = catalogoProdutos.filter(
    p => !HIDDEN_STATUSES.has(p.status) && !slugsContratados.has(p.slug)
  )

  /* ── Carrega TUDO via endpoint agregado (1 chamada = 1 requireAuth) ── */
  useEffect(() => {
    let cancelled = false

    async function carregarTudo() {
      try {
        const token = await getToken()
        const res = await fetch('/api/v1/hub/init', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Hub init failed: ${res.status}`)
        const data = await res.json()

        if (cancelled) return

        // ── Catálogo ──
        const catalogo: ProdutoCatalogo[] = (data.catalog ?? []).map(
          (p: { id: string; name: string; slug: string; description?: string | null; status: string }) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: p.description ?? null,
            status: p.status,
          })
        )
        setCatalogoProdutos(catalogo)

        const catalogMap = new Map(catalogo.map(p => [p.slug, p]))

        // ── Produtos contratados ──
        let totalAtivos = 0
        if (data.products) {
          const contratados: ProdutoContratado[] = data.products.map(
            (p: { product_key: string; is_active: boolean; catalog?: { name?: string; description?: string } }) => {
              const catInfo = catalogMap.get(p.product_key)
              return {
                product_key: p.product_key,
                is_active: p.is_active,
                nome: catInfo?.name ?? p.catalog?.name ?? p.product_key,
                descricao: catInfo?.description ?? p.catalog?.description ?? '',
              }
            }
          )
          setProdutosContratados(contratados)

          totalAtivos = contratados.filter(c => c.is_active).length

          const ativos: ProdutoAtivo[] = contratados
            .filter(c => c.is_active)
            .map(c => {
              const info = PRODUCT_ROUTE_MAP[c.product_key]
              return {
                id: c.product_key,
                slug: c.product_key,
                nome: info?.nome ?? c.nome,
                rota: info?.rota ?? `/produto/${c.product_key}`,
              }
            })
          setProdutosAtivos(ativos)
        }

        // ── Workspaces ──
        const tenantUserCount = data.tenant?._count?.users ?? 0

        if (data.companies && data.companies.length > 0) {
          interface CompanyApi {
            id: string
            name: string
            cnpj: string | null
            status: string
            _count?: { memberships: number }
          }

          const mapeados: Workspace[] = data.companies.map((c: CompanyApi, i: number) => {
            const grad = WORKSPACE_GRADIENTS[i % WORKSPACE_GRADIENTS.length]
            const membros = (c._count?.memberships || 0) > 0 ? c._count!.memberships : tenantUserCount
            return {
              id: c.id,
              nome: c.name,
              iniciais: c.name.substring(0, 2).toUpperCase(),
              role: userRole,
              modulos: totalAtivos,
              membros,
              gradientFrom: grad.from,
              gradientTo: grad.to,
            }
          })
          setWorkspaces(mapeados)
          setSelectedId(mapeados[0].id)
        }

        // Produtos — independente dos workspaces
        if (resProdutos.ok) {
          const dataProd = await resProdutos.json()
          if (dataProd.products) {
            const ativos: ProdutoAtivo[] = dataProd.products
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
        }
      } catch {
        // API indisponível — mostra estado vazio
      } finally {
        if (!cancelled) setCarregando(false)
      }
    }

    carregarTudo()
    return () => { cancelled = true }
  }, [getToken, userRole])

  /* ── Menu lateral: navItems ── */
  const navItems: NavItem[] = useMemo(() => {
    const items: NavItem[] = []

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

    items.push({ label: '', sectionDivider: true, icon: null })
    items.push({ to: '/produto/processo', label: 'Processo', icon: <Folders weight="duotone" size={18} /> })
    items.push({ to: '/workspace/financeiro', label: 'Relatórios', icon: <FileText weight="duotone" size={18} /> })
    items.push({ to: '/workspace/organizacao', label: 'Histórico de Alterações', icon: <ClockCounterClockwise weight="duotone" size={18} /> })
    items.push({ to: '/workspace/api-cockpit', label: 'Cockpit API', icon: <Plug weight="duotone" size={18} /> })
    items.push({ to: '/workspace/organizacao', label: 'Configurações', icon: <GearSix weight="duotone" size={18} /> })

    return items
  }, [produtosAtivos])

  /* ── Handlers ── */
  const handleSelectWs = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

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
            <UsuarioGlobal
              userName={userName}
              userEmail={userEmail}
              userInitials={userInitials}
              userRole={userRole}
              isLight={false}
              onToggleTheme={() => {}}
              onNavigateOrganizacao={() => navigate('/workspace/organizacao')}
              onNavigateMarketPlace={() => navigate('/store')}
              onSignOut={handleSair}
              isAdmin={true}
              onNavigateAdmin={() => navigate('/admin/visao-geral')}
            />
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
                          <span className="sw-ws-role">{ws.role}</span>
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
                      </div>

                      <button
                        className="sw-ws-enter-btn"
                        type="button"
                        onClick={e => { e.stopPropagation(); handleSelectWs(ws.id); setTimeout(() => { sessionStorage.setItem('gravity_company_id', ws.id); sessionStorage.setItem('gravity_company_name', ws.nome); navigate('/core') }, 300) }}
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
                  {/* Contratados */}
                  <div className="sw-prod-panel">
                    <div className="sw-prod-panel-head">
                      <span className="sw-prod-panel-title contracted">Seus Produtos Contratados</span>
                      <span className="sw-sec-count">{contratadosAtivos.length} ativos</span>
                    </div>
                    {contratadosAtivos.length === 0 ? (
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
                    ) : (
                      <div className="sw-prod-list">
                        {contratadosAtivos.map(prod => (
                          <div key={prod.product_key} className="sw-prod-item">
                            <div className="sw-prod-icon" style={{ background: 'var(--sw-green-dim)' }}>
                              <CheckCircle size={18} weight="regular" style={{ color: 'var(--sw-green)' }} />
                            </div>
                            <div className="sw-prod-body">
                              <div className="sw-prod-name">{prod.nome}</div>
                              <div className="sw-prod-desc">{prod.descricao}</div>
                            </div>
                            <div className="sw-prod-right">
                              <span className="sw-badge sw-b-active">Ativo</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Sugeridos (do catálogo, excluindo contratados) */}
                  <div className="sw-prod-panel">
                    <div className="sw-prod-panel-head">
                      <span className="sw-prod-panel-title suggested">Sugeridos para Você</span>
                      <span className="sw-sec-count" style={{ background: 'var(--sw-accent-dim)', color: 'var(--sw-accent-2)' }}>
                        {produtosSugeridos.length} novos
                      </span>
                    </div>
                    {produtosSugeridos.length === 0 ? (
                      <div className="sw-prod-empty">
                        <div className="sw-prod-empty-icon">
                          <CheckCircle size={20} />
                        </div>
                        <div className="sw-prod-empty-title">Tudo contratado!</div>
                        <div className="sw-prod-empty-desc">
                          Você já contratou todos os produtos disponíveis.
                        </div>
                      </div>
                    ) : (
                      <div className="sw-prod-list">
                        {produtosSugeridos.slice(0, 5).map(prod => (
                          <div key={prod.id} className="sw-prod-item">
                            <div className="sw-prod-icon" style={{ background: 'var(--sw-accent-dim)' }}>
                              <Star size={18} weight="regular" style={{ color: 'var(--sw-accent-2)' }} />
                            </div>
                            <div className="sw-prod-body">
                              <div className="sw-prod-name">{prod.name}</div>
                              <div className="sw-prod-desc">{prod.description ?? ''}</div>
                            </div>
                            <div className="sw-prod-right">
                              {(prod.status === 'ACTIVE' || prod.status === 'Ativo') ? (
                                <span className="sw-badge sw-b-new">Disponível</span>
                              ) : (
                                <span className="sw-badge sw-b-trial">Em Breve</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                      {ATALHOS.map(atalho => (
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
