import React, { useEffect, useState, useMemo } from 'react'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  SpinnerGap,
  ArrowLeft,
  ArrowRight,
  Info,
  MagnifyingGlass,
  Truck,
  CurrencyDollar,
  FileMagnifyingGlass,
  FileText,
  ShoppingBag,
  Eye,
  Receipt,
  Lightning,
  Star,
  RocketLaunch,
  Sparkle,
  ArrowDown,
} from '@phosphor-icons/react'
import './hub-store.css'
import '../pages/workspace/workspace.css'
import './selecionar-workspace.css'
import { BotaoGlobal } from '@nucleo/botao-global'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { Notificacoes } from '../../../tenant/notificacoes/src/Notificacoes'

const API_URL = '/api/v1'

interface CatalogProduct {
  id: string
  name: string
  slug: string
  description: string | null
  status: string
  type_billing: string | null
  unit_price: number | string
  currency: string
  backend_module: string | null
}

interface SubscribedProduct {
  product_key: string
  is_active: boolean
}

// Metadados visuais e categóricos por slug (complementam API)
const PRODUCT_META: Record<string, {
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  category: string
  categoryFilter: string
  tags: string[]
  users: number
  featured?: boolean
}> = {
  'bid-frete': {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <Truck weight="duotone" size={28} color="#10b981" />,
    category: 'LOGÍSTICA • COTAÇÃO',
    categoryFilter: 'Frete',
    tags: ['Multi-carrier', 'Tempo real', 'Relatórios', 'API integrada'],
    users: 240,
    featured: true,
  },
  'bid-cambio': {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <CurrencyDollar weight="duotone" size={28} color="#10b981" />,
    category: 'FINANCEIRO • CÂMBIO',
    categoryFilter: 'Câmbio',
    tags: ['Banco Central', 'Multi-moeda', 'Histórico'],
    users: 185,
  },
  'nf-importacao': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileText weight="duotone" size={28} color="#818cf8" />,
    category: 'FISCAL • DOCUMENTOS',
    categoryFilter: 'Importação',
    tags: ['SEFAZ integrada', 'Cálculo NCM', 'XML/PDF'],
    users: 310,
  },
  'lpco': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <Receipt weight="duotone" size={28} color="#818cf8" />,
    category: 'FISCAL • LICENÇAS',
    categoryFilter: 'Importação',
    tags: ['SISCOMEX', 'Saldo automático', 'Rastreio'],
    users: 98,
  },
  'pedido': {
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#f59e0b',
    icon: <ShoppingBag weight="duotone" size={28} color="#f59e0b" />,
    category: 'COMERCIAL • PEDIDOS',
    categoryFilter: 'Comercial',
    tags: ['Fluxo de aprovação', 'Rastreamento', 'Integração ERP'],
    users: 92,
  },
  'simula-custo': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileMagnifyingGlass weight="duotone" size={28} color="#818cf8" />,
    category: 'COMEX • SIMULAÇÃO',
    categoryFilter: 'Importação',
    tags: ['NCM automático', 'Impostos', 'Comparativo'],
    users: 154,
  },
  'smart-read': {
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    icon: <Eye weight="duotone" size={28} color="#a78bfa" />,
    category: 'IA • EXTRAÇÃO DE DADOS',
    categoryFilter: 'Importação',
    tags: ['OCR com IA', 'Invoice', 'Aduaneiro'],
    users: 0,
  },
}

// Produtos "Em Breve" estáticos (não chegam via API)
const COMING_SOON = [
  {
    id: 'cs-smart-read',
    slug: 'smart-read',
    name: 'Smart Read',
    description: 'Extração inteligente de dados de documentos e imagens usando IA. Processa faturas, invoices e documentos aduaneiros automaticamente.',
    category: 'IA • EXTRAÇÃO DE DADOS',
    categoryFilter: 'Importação',
    tags: ['OCR com IA', 'Invoice', 'Aduaneiro'],
    iconBg: 'rgba(139, 92, 246, 0.15)',
    icon: <Eye weight="duotone" size={28} color="#a78bfa" />,
  },
  {
    id: 'cs-nf-pro',
    slug: 'nf-importacao-pro',
    name: 'NF Import Pro',
    description: 'Versão avançada do NF Import com suporte a regimes especiais, drawback, e integração com sistemas aduaneiros SISCOMEX.',
    category: 'FISCAL • AVANÇADO',
    categoryFilter: 'Importação',
    tags: ['SISCOMEX', 'Drawback', 'Regime especial'],
    iconBg: 'rgba(239, 68, 68, 0.15)',
    icon: <Package weight="duotone" size={28} color="#f87171" />,
    isPro: true,
  },
]

export function Store() {
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { user } = useUser()
  const { signOut } = useClerk()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, addNotification } = useShellStore()
  const isLight = currentTheme === 'light'

  const userName = user?.fullName ?? user?.firstName ?? 'Usuário'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? 'usuario@gravity.com.br'

  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [subscribed, setSubscribed] = useState<Map<string, SubscribedProduct>>(new Map())
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('Todos')

  // Carrega catálogo e produtos contratados
  useEffect(() => {
    async function load() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/tenants/products`, {
            headers: { Authorization: `Bearer ${await getToken()}` },
          }).catch(() => null),
        ])

        if (catRes.ok) {
          const catData = await catRes.json()
          setCatalog(catData.products.filter((p: CatalogProduct) => p.status === 'ACTIVE' || p.status === 'Ativo'))
        }

        if (subRes?.ok) {
          const subData = await subRes.json()
          const map = new Map<string, SubscribedProduct>()
          subData.products.forEach((p: SubscribedProduct) => map.set(p.product_key, p))
          setSubscribed(map)
        }
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Falha ao carregar catálogo.' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Scroll para produto específico quando navegado via ?produto=slug
  useEffect(() => {
    const slug = searchParams.get('produto')
    if (!slug || loading) return
    const el = document.getElementById(`produto-${slug}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.classList.add('gs-card--highlight')
      setTimeout(() => el.classList.remove('gs-card--highlight'), 2500)
    }
  }, [loading, searchParams])

  const handleSubscribe = async (slug: string) => {
    setSubscribing(slug)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/tenants/products/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product_key: slug }),
      })

      if (res.ok) {
        const companyId = sessionStorage.getItem('gravity_company_id')
        if (companyId) {
          await fetch(`${API_URL}/companies/${companyId}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ product_key: slug }),
          }).catch(() => {})
        }
        setSubscribed(prev => {
          const next = new Map(prev)
          next.set(slug, { product_key: slug, is_active: true })
          return next
        })
        addNotification({ type: 'success', message: 'Produto contratado com sucesso!' })
      } else {
        const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
        addNotification({ type: 'error', message: body?.error?.message ?? 'Falha ao contratar produto.' })
      }
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : 'Falha ao contratar produto.' })
    } finally {
      setSubscribing(null)
    }
  }

  const getStatus = (slug: string): 'owned' | 'available' =>
    subscribed.get(slug)?.is_active ? 'owned' : 'available'

  // Stats derivados
  const ownedCount = useMemo(() => catalog.filter(p => getStatus(p.slug) === 'owned').length, [catalog, subscribed])
  const totalCount = catalog.length + COMING_SOON.length

  // Filtros disponíveis (dinâmico + fixos)
  const categoryFilters = useMemo(() => {
    const cats = new Set(catalog.map(p => PRODUCT_META[p.slug]?.categoryFilter).filter(Boolean))
    return ['Todos', 'Disponíveis', 'Em Breve', ...Array.from(cats)]
  }, [catalog])

  // Produtos filtrados
  const filteredCatalog = useMemo(() => {
    return catalog.filter(p => {
      const meta = PRODUCT_META[p.slug]
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        activeFilter === 'Todos' ||
        activeFilter === 'Disponíveis' ||
        meta?.categoryFilter === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [catalog, search, activeFilter])

  const showComingSoon = activeFilter === 'Todos' || activeFilter === 'Em Breve'

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)' }}>
        <SpinnerGap size={36} className="hs-spin" color="var(--color-primary)" />
      </div>
    )
  }

  return (
    <div className="sw-shell sw-shell--no-sidebar">
      <div className="sw-page sw-page--full">
        {/* ── Topbar idêntico ao Hub ── */}
        <header className="sw-topbar">
          <div className="sw-t-brand">
            <LogoGlobal iconSize={26} iconColor="#818cf8" />
          </div>

          <div className="sw-t-right">
            <TooltipGlobal titulo="Voltar ao Hub" descricao="Retornar à tela principal do workspace">
              <button
                onClick={() => navigate('/hub')}
                type="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.875rem',
                  borderRadius: '9999px',
                  border: '1px solid rgba(129,140,248,0.25)',
                  background: 'rgba(129,140,248,0.08)',
                  color: '#818cf8',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.15)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(129,140,248,0.08)'; e.currentTarget.style.borderColor = 'rgba(129,140,248,0.25)' }}
              >
                <ArrowLeft size={16} weight="bold" />
                Hub
              </button>
            </TooltipGlobal>

            <LocalizarExpandidoCampoGlobal onBuscarNavigate={() => {}} />

            <button
              className="sw-t-icon"
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--sw-muted, #64748b)' : 'var(--sw-accent-2, #818cf8)' }}
              type="button"
              title={tooltipsDisabled ? 'Habilitar dicas' : 'Desabilitar dicas'}
            >
              <Info size={15} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>

            <Notificacoes tenantId="store" userId={user?.id ?? 'mock-user'} />

            <div className="sw-t-sep" />

            <UsuarioGlobal
              userName={userName}
              userEmail={userEmail}
              userInitials={userInitials}
              userRole="Admin"
              isLight={isLight}
              onToggleTheme={toggleTheme}
              onNavigateWorkspace={() => navigate('/workspace/organizacao')}
              onNavigateMarketPlace={() => navigate('/store')}
              onSignOut={() => signOut()}
              isAdmin={true}
              onNavigateAdmin={() => navigate('/admin/visao-geral')}
            />
          </div>
        </header>

        <div className="gs-store ws-fade-up">

          {/* ── HERO ─────────────────────────────────────────────── */}
          <div className="gs-hero">
            <div className="gs-hero__glow" />
            <span className="gs-pill">
              <span className="gs-pill__dot" />
              Gravity Ecosystem
            </span>
            <h1 className="gs-hero__title">
              Expanda sua <span className="gs-hero__gradient">Operação</span>
            </h1>
            <p className="gs-hero__sub">
              Descubra módulos inteligentes projetados para escalar seu negócio com<br />
              eficiência e dados centralizados.
            </p>
          </div>

          {/* ── STATS ────────────────────────────────────────────── */}
          <div className="gs-stats">
            <div className="gs-stat">
              <div className="gs-stat__icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                <Package weight="duotone" size={20} />
              </div>
              <div>
                <div className="gs-stat__n">{totalCount}</div>
                <div className="gs-stat__l">Módulos disponíveis</div>
              </div>
            </div>
            <div className="gs-stat">
              <div className="gs-stat__icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                <CheckCircle weight="duotone" size={20} />
              </div>
              <div>
                <div className="gs-stat__n">{ownedCount}</div>
                <div className="gs-stat__l">Prontos para ativar</div>
              </div>
            </div>
            <div className="gs-stat">
              <div className="gs-stat__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                <Lightning weight="duotone" size={20} />
              </div>
              <div>
                <div className="gs-stat__n">{COMING_SOON.length}</div>
                <div className="gs-stat__l">Em breve</div>
              </div>
            </div>
            <div className="gs-stat gs-stat--premium">
              <div className="gs-stat__icon" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                <Star weight="duotone" size={20} />
              </div>
              <div>
                <div className="gs-stat__n" style={{ color: '#a5b4fc' }}>Premium</div>
                <div className="gs-stat__l">Todos os módulos incluídos</div>
              </div>
            </div>
          </div>

          {/* ── FILTROS ──────────────────────────────────────────── */}
          <div className="gs-toolbar">
            <div className="gs-search">
              <MagnifyingGlass size={16} weight="bold" />
              <input
                className="gs-search__input"
                type="text"
                placeholder="Buscar módulo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="gs-filters">
              {categoryFilters.map(f => (
                <button
                  key={f}
                  className={`gs-filter-tab${activeFilter === f ? ' gs-filter-tab--active' : ''}`}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="gs-toolbar__count">
              {filteredCatalog.length + (showComingSoon ? COMING_SOON.length : 0)} módulos
            </div>
          </div>

          {/* ── LABEL SEÇÃO ──────────────────────────────────────── */}
          <div className="gs-section-label">
            <span>Módulos Disponíveis ({filteredCatalog.length + (showComingSoon ? COMING_SOON.length : 0)})</span>
          </div>

          {/* ── GRID DE CARDS ────────────────────────────────────── */}
          <div className="gs-grid">

            {/* Produtos ativos do catálogo */}
            {filteredCatalog.map((p, idx) => {
              const meta = PRODUCT_META[p.slug]
              const status = getStatus(p.slug)
              const isOwned = status === 'owned'
              const isSubscribing = subscribing === p.slug
              const delayClass = idx < 6 ? `hs-fade-up-d${Math.min(idx + 1, 4)}` : ''

              return (
                <div
                  key={p.id}
                  id={`produto-${p.slug}`}
                  className={`gs-card hs-fade-up ${delayClass}${isOwned ? ' gs-card--owned' : ''}`}
                  onClick={isOwned ? () => navigate(`/produto/${p.slug}`) : undefined}
                  style={isOwned ? { cursor: 'pointer' } : undefined}
                >
                  {/* Header do card */}
                  <div className="gs-card__top">
                    <div className="gs-card__icon" style={{ background: meta?.iconBg ?? 'rgba(99,102,241,0.12)' }}>
                      {meta?.icon ?? <Package weight="duotone" size={28} color="#818cf8" />}
                    </div>
                    <div className="gs-card__badges">
                      {isOwned ? (
                        <span className="gs-badge gs-badge--owned">
                          <CheckCircle weight="fill" size={11} /> Ativo
                        </span>
                      ) : (
                        <span className="gs-badge gs-badge--available">
                          <span className="gs-badge__dot" /> Disponível
                        </span>
                      )}
                      {meta?.featured && (
                        <span className="gs-badge gs-badge--featured">Destaque</span>
                      )}
                    </div>
                  </div>

                  {/* Corpo */}
                  <div className="gs-card__body">
                    <h3 className="gs-card__name">{p.name}</h3>
                    {meta?.category && (
                      <span className="gs-card__category" style={{ color: meta.iconColor }}>
                        {meta.category}
                      </span>
                    )}
                    <p className="gs-card__desc">
                      {p.description ?? 'Módulo especializado da plataforma Gravity.'}
                    </p>
                    {meta?.tags && (
                      <div className="gs-card__tags">
                        {meta.tags.map(t => (
                          <span key={t} className="gs-tag">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="gs-card__footer">
                    {meta?.users ? (
                      <span className="gs-card__users">+{meta.users} usando</span>
                    ) : <span />}
                    {isOwned ? (
                      <BotaoGlobal
                        variante="primario"
                        tamanho="pequeno"
                        onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}`) }}
                      >
                        Acessar
                      </BotaoGlobal>
                    ) : (
                      <BotaoGlobal
                        variante="primario"
                        tamanho="pequeno"
                        disabled={isSubscribing}
                        onClick={(e) => { e.stopPropagation(); handleSubscribe(p.slug) }}
                      >
                        {isSubscribing
                          ? <><SpinnerGap size={14} className="hs-spin" /> Contratando...</>
                          : <>Ativar Módulo <ArrowRight weight="bold" size={13} /></>
                        }
                      </BotaoGlobal>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Produtos "Em Breve" */}
            {showComingSoon && COMING_SOON.map((p, idx) => (
              <div
                key={p.id}
                id={`produto-${p.slug}`}
                className={`gs-card gs-card--soon hs-fade-up hs-fade-up-d${Math.min(filteredCatalog.length + idx + 1, 4)}`}
              >
                <div className="gs-card__top">
                  <div className="gs-card__icon" style={{ background: p.iconBg }}>
                    {p.icon}
                  </div>
                  <div className="gs-card__badges">
                    <span className="gs-badge gs-badge--soon">
                      <Lightning weight="fill" size={11} /> Em breve
                    </span>
                    {p.isPro && (
                      <span className="gs-badge gs-badge--pro">Pro</span>
                    )}
                  </div>
                </div>

                <div className="gs-card__body">
                  <h3 className="gs-card__name" style={{ color: 'var(--sw-text-2)' }}>{p.name}</h3>
                  <span className="gs-card__category" style={{ color: 'var(--sw-text-3)', opacity: 0.6 }}>
                    {p.category}
                  </span>
                  <p className="gs-card__desc">{p.description}</p>
                  <div className="gs-card__tags">
                    {p.tags.map(t => (
                      <span key={t} className="gs-tag gs-tag--muted">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="gs-card__footer">
                  <span className="gs-card__users" style={{ opacity: 0.5 }}>Em desenvolvimento</span>
                  <div className="gs-card__footer-btn-wrap">
                    <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
                      Em breve
                    </BotaoGlobal>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* ── FOOTER ───────────────────────────────────────────── */}
          <div className="gs-footer">
            <ArrowDown size={20} color="var(--color-text-muted)" />
            <span>© {new Date().getFullYear()} Gravity Platform · Todos os módulos incluem suporte priorizado.</span>
          </div>

        </div>

        <ToastContainer />
      </div>
    </div>
  )
}
