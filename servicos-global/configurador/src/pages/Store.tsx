import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
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
import { useLoadSystemRole } from '../hooks/useLoadSystemRole'
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

const PRODUCT_META: Record<string, {
  iconBg: string
  iconColor: string
  icon: React.ReactNode
  categoryKey: string
  categoryFilter: string
  descKey: string
  tagKeys: string[]
  users: number
  featured?: boolean
}> = {
  'bid-frete': {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <Truck weight="duotone" size={28} color="#10b981" />,
    categoryKey: 'store.cat_logistica',
    categoryFilter: 'frete',
    descKey: 'store.prod_bid_frete_desc',
    tagKeys: ['store.tag_multi_carrier', 'store.tag_tempo_real', 'store.tag_relatorios', 'store.tag_api_integrada'],
    users: 240,
    featured: true,
  },
  'bid-cambio': {
    iconBg: 'rgba(16, 185, 129, 0.15)',
    iconColor: '#10b981',
    icon: <CurrencyDollar weight="duotone" size={28} color="#10b981" />,
    categoryKey: 'store.cat_financeiro',
    categoryFilter: 'cambio',
    descKey: 'store.prod_bid_cambio_desc',
    tagKeys: ['store.tag_banco_central', 'store.tag_multi_moeda', 'store.tag_historico'],
    users: 185,
  },
  'nf-importacao': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileText weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_fiscal_doc',
    categoryFilter: 'importacao',
    descKey: 'store.prod_nf_importacao_desc',
    tagKeys: ['store.tag_sefaz', 'store.tag_calc_ncm', 'store.tag_xml_pdf'],
    users: 310,
  },
  'lpco': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <Receipt weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_fiscal_lic',
    categoryFilter: 'importacao',
    descKey: 'store.prod_lpco_desc',
    tagKeys: ['store.tag_siscomex', 'store.tag_saldo_auto', 'store.tag_rastreio'],
    users: 98,
  },
  'pedido': {
    iconBg: 'rgba(245, 158, 11, 0.15)',
    iconColor: '#f59e0b',
    icon: <ShoppingBag weight="duotone" size={28} color="#f59e0b" />,
    categoryKey: 'store.cat_comercial',
    categoryFilter: 'comercial',
    descKey: 'store.prod_pedido_desc',
    tagKeys: ['store.tag_aprov', 'store.tag_rastreamento', 'store.tag_integ_erp'],
    users: 92,
  },
  'simula-custo': {
    iconBg: 'rgba(99, 102, 241, 0.15)',
    iconColor: '#818cf8',
    icon: <FileMagnifyingGlass weight="duotone" size={28} color="#818cf8" />,
    categoryKey: 'store.cat_comex',
    categoryFilter: 'importacao',
    descKey: 'store.prod_simula_custo_desc',
    tagKeys: ['store.tag_ncm_auto', 'store.tag_impostos', 'store.tag_comparativo'],
    users: 154,
  },
  'smart-read': {
    iconBg: 'rgba(139, 92, 246, 0.15)',
    iconColor: '#a78bfa',
    icon: <Eye weight="duotone" size={28} color="#a78bfa" />,
    categoryKey: 'store.cat_ia',
    categoryFilter: 'importacao',
    descKey: 'store.prod_smart_read_desc',
    tagKeys: ['store.tag_ocr_ia', 'store.tag_invoice', 'store.tag_aduaneiro'],
    users: 0,
  },
}

// Relações entre produtos — quais módulos se complementam
const PRODUCT_RELATIONS: Record<string, string[]> = {
  'simula-custo':  ['nf-importacao', 'bid-frete'],
  'nf-importacao': ['simula-custo', 'lpco', 'bid-frete'],
  'bid-frete':     ['simula-custo', 'nf-importacao', 'pedido'],
  'bid-cambio':    ['pedido'],
  'lpco':          ['nf-importacao'],
  'pedido':        ['bid-cambio', 'bid-frete'],
}

// Ordem lógica dos produtos no Stack Visualizer (fluxo de operação)
const STACK_ORDER = ['simula-custo', 'nf-importacao', 'lpco', 'bid-frete', 'bid-cambio', 'pedido']

const COMING_SOON_CONFIG = [
  {
    id: 'cs-smart-read',
    slug: 'smart-read',
    nameKey: 'store.smart_read_nome',
    descKey: 'store.smart_read_desc',
    categoryKey: 'store.cat_ia',
    tagKeys: ['store.tag_ocr_ia', 'store.tag_invoice', 'store.tag_aduaneiro'],
    iconBg: 'rgba(139, 92, 246, 0.15)',
    icon: <Eye weight="duotone" size={28} color="#a78bfa" />,
    isPro: false,
  },
  {
    id: 'cs-nf-pro',
    slug: 'nf-importacao-pro',
    nameKey: 'store.nf_pro_nome',
    descKey: 'store.nf_pro_desc',
    categoryKey: 'store.cat_fiscal_avancado',
    tagKeys: ['store.tag_siscomex', 'store.tag_drawback', 'store.tag_regime_especial'],
    iconBg: 'rgba(239, 68, 68, 0.15)',
    icon: <Package weight="duotone" size={28} color="#f87171" />,
    isPro: true,
  },
]

export function Store() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, addNotification } = useShellStore()
  const isLight = currentTheme === 'light'
  const { isGravityAdmin, role: dbRole } = useLoadSystemRole()

  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN:       'Admin',
    MASTER:      'Master',
    STANDARD:    'Standard',
    SUPPLIER:    'Fornecedor',
  }
  const userRoleLabel = ROLE_LABELS[dbRole ?? ''] ?? 'Standard'

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])

  const userName = user?.fullName ?? user?.firstName ?? t('shell.usuario_padrao')
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? t('shell.email_padrao')

  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [subscribed, setSubscribed] = useState<Map<string, SubscribedProduct>>(new Map())
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('todos')

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
          setCatalog(catData.products.filter((p: CatalogProduct) => p.status === 'ACTIVE' || p.status === 'Ativo' || p.status === 'COMING_SOON'))
        }
        if (subRes?.ok) {
          const subData = await subRes.json()
          const map = new Map<string, SubscribedProduct>()
          subData.products.forEach((p: SubscribedProduct) => map.set(p.product_key, p))
          setSubscribed(map)
        }
      } catch (err) {
        addNotification({ type: 'error', message: err instanceof Error ? err.message : t('store.notif_erro_catalogo') })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

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
        addNotification({ type: 'success', message: t('store.notif_contratado') })
      } else {
        const body = await res.json().catch(() => ({ error: { message: res.statusText } }))
        addNotification({ type: 'error', message: body?.error?.message ?? t('store.notif_erro_contratar') })
      }
    } catch (err) {
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('store.notif_erro_contratar') })
    } finally {
      setSubscribing(null)
    }
  }

  const getStatus = (slug: string): 'owned' | 'available' =>
    subscribed.get(slug)?.is_active ? 'owned' : 'available'

  const ownedCount = useMemo(() => catalog.filter(p => getStatus(p.slug) === 'owned').length, [catalog, subscribed])
  const totalCount = catalog.length + COMING_SOON_CONFIG.length

  const categoryFilters = useMemo(() => {
    const cats = new Set(catalog.map(p => PRODUCT_META[p.slug]?.categoryFilter).filter(Boolean))
    return ['todos', 'disponiveis', 'em_breve', ...Array.from(cats)]
  }, [catalog])

  const filterLabel = (key: string): string => {
    const map: Record<string, string> = {
      todos: t('store.filtro_todos'),
      disponiveis: t('store.filtro_disponiveis'),
      em_breve: t('store.filtro_em_breve'),
      frete: t('store.filtro_frete'),
      cambio: t('store.filtro_cambio'),
      importacao: t('store.filtro_importacao'),
      comercial: t('store.filtro_comercial'),
    }
    return map[key] ?? key
  }

  const filteredCatalog = useMemo(() => {
    return catalog.filter(p => {
      const meta = PRODUCT_META[p.slug]
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        activeFilter === 'todos' ||
        activeFilter === 'disponiveis' ||
        meta?.categoryFilter === activeFilter
      return matchesSearch && matchesFilter
    })
  }, [catalog, search, activeFilter])

  const showComingSoon = activeFilter === 'todos' || activeFilter === 'em_breve'

  return (
    <div className="gs-root">

      {/* Topbar fixada — sempre visível independente do scroll */}
      <header className="gs-topbar">
        <div className="sw-t-brand">
          <LogoGlobal iconSize={26} iconColor="#818cf8" />
        </div>
        <div className="sw-t-right">
          <TooltipGlobal titulo={t('store.voltar_hub')} descricao={t('store.voltar_hub_desc')}>
            <button
              type="button"
              onClick={() => navigate('/hub')}
              className="gs-back-btn"
            >
              <ArrowLeft size={16} weight="bold" />
              Hub
            </button>
          </TooltipGlobal>
          <LocalizarExpandidoCampoGlobal onBuscarNavigate={() => {}} />
          <button
            className="sw-t-icon"
            type="button"
            onClick={toggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--sw-muted, #64748b)' : 'var(--sw-accent-2, #818cf8)' }}
            title={tooltipsDisabled ? t('store.habilitar_dicas') : t('store.desabilitar_dicas')}
          >
            <Info size={15} weight={tooltipsDisabled ? 'regular' : 'fill'} />
          </button>
          <Notificacoes tenantId="store" userId={user?.id ?? 'mock-user'} />
          <div className="sw-t-sep" />
          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRoleLabel}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/workspace/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            compact
          />
        </div>
      </header>

      {/* Conteúdo abaixo da topbar */}
      <div className="gs-store">
          {loading ? (
            <div className="gs-loading">
              <SpinnerGap size={36} className="hs-spin" color="var(--color-primary)" />
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="gs-hero">
                <div className="gs-hero__glow" />
                <span className="gs-pill">
                  <span className="gs-pill__dot" />
                  {t('store.hero_pill')}
                </span>
                <h1 className="gs-hero__title">
                  {t('store.hero_titulo_pre')} <span className="gs-hero__gradient">{t('store.hero_titulo_destaque')}</span>
                </h1>
                <p className="gs-hero__sub">{t('store.hero_sub')}</p>
              </div>

              {/* Stats */}
              <div className="gs-stats">
                <div className="gs-stat">
                  <div className="gs-stat__icon" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                    <Package weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n">{totalCount}</div>
                    <div className="gs-stat__l">{t('store.stat_modulos')}</div>
                  </div>
                </div>
                <div className="gs-stat">
                  <div className="gs-stat__icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                    <CheckCircle weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n">{ownedCount}</div>
                    <div className="gs-stat__l">{t('store.stat_ativos')}</div>
                  </div>
                </div>
                <div className="gs-stat">
                  <div className="gs-stat__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    <Lightning weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n">{COMING_SOON_CONFIG.length}</div>
                    <div className="gs-stat__l">{t('store.stat_em_breve')}</div>
                  </div>
                </div>
                <div className="gs-stat gs-stat--premium">
                  <div className="gs-stat__icon" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                    <Star weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n" style={{ color: '#a5b4fc' }}>{t('store.stat_premium_titulo')}</div>
                    <div className="gs-stat__l">{t('store.stat_premium_desc')}</div>
                  </div>
                </div>
              </div>

              {/* ── MONTE O SEU GRAVITY — Puzzle Stack ───────────────────── */}
              {catalog.length > 0 && (
                <div className="gs-stack">
                  <div className="gs-stack__head">
                    <div>
                      <h2 className="gs-stack__title">{t('store.stack_titulo')}</h2>
                      <p className="gs-stack__sub">{t('store.stack_sub')}</p>
                    </div>
                    <div className="gs-stack__meter">
                      <div className="gs-stack__meter-bar">
                        {Array.from({ length: catalog.length }).map((_, i) => (
                          <div key={i} className={`gs-stack__seg${i < ownedCount ? ' gs-stack__seg--on' : ''}`} />
                        ))}
                      </div>
                      <span className="gs-stack__meter-label">
                        {ownedCount === 0
                          ? t('store.stack_nenhum')
                          : ownedCount === catalog.length
                            ? t('store.stack_completo')
                            : t('store.stack_parcial', { n: ownedCount, total: catalog.length })}
                      </span>
                    </div>
                  </div>

                  {/* Peças de quebra-cabeça com SVG real */}
                  <div className="gs-stack__pieces-scroll">
                  <div className="gs-stack__pieces">
                    {(() => {
                      const validSlugs = STACK_ORDER.filter(s => catalog.find(p => p.slug === s))
                      return validSlugs.map((slug, pieceIdx) => {
                        const cp = catalog.find(p => p.slug === slug)!
                        const meta = PRODUCT_META[slug]
                        const isOwned = getStatus(slug) === 'owned'
                        const isFirst = pieceIdx === 0
                        const isLast = pieceIdx === validSlugs.length - 1
                        // Primeira peça fica na frente para a aba cobrir a cavidade da próxima
                        const zIdx = validSlugs.length - pieceIdx + 1

                        // Dimensões: corpo W=120 H=90, aba estende 18px direita, cavidade indenta 13px esquerda
                        const path = isFirst && isLast
                          ? 'M 0,0 L 120,0 L 120,90 L 0,90 Z'
                          : isFirst
                          ? 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 Z'
                          : isLast
                          ? 'M 0,0 L 120,0 L 120,90 L 0,90 L 0,58 C 13,58 13,32 0,32 Z'
                          : 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 L 0,58 C 13,58 13,32 0,32 Z'

                        const fill = isOwned ? (meta?.iconBg ?? 'rgba(99,102,241,0.18)') : 'rgba(255,255,255,0.025)'
                        const stroke = isOwned ? (meta?.iconColor ?? '#818cf8') : 'rgba(255,255,255,0.09)'

                        return (
                          <div
                            key={slug}
                            className={`gs-piece${isOwned ? ' gs-piece--on' : ''}${isFirst ? '' : ' gs-piece--has-blank'}`}
                            style={{ zIndex: zIdx, '--piece-color': meta?.iconColor ?? '#818cf8' } as React.CSSProperties}
                            onClick={() => isOwned
                              ? navigate(`/produto/${slug}`)
                              : document.getElementById(`produto-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                            title={cp.name}
                          >
                            {/* Shape SVG da peça */}
                            <svg width="138" height="90" viewBox="0 0 138 90" className="gs-piece__svg">
                              <path d={path} fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" />
                            </svg>
                            {/* Conteúdo */}
                            <div className={`gs-piece__body${isFirst ? '' : ' gs-piece__body--indent'}`}>
                              <div className="gs-piece__icon">
                                {meta?.icon ?? <Package weight="duotone" size={20} color="#818cf8" />}
                              </div>
                              <span className="gs-piece__name">{cp.name}</span>
                              {isOwned && (
                                <span className="gs-piece__check">
                                  <CheckCircle weight="fill" size={11} color="#10b981" />
                                </span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>
                  </div>

                  {ownedCount === 0 && (
                    <p className="gs-stack__hint">{t('store.stack_hint')}</p>
                  )}
                </div>
              )}

              {/* Toolbar */}
              <div className="gs-toolbar">
                <div className="gs-search">
                  <MagnifyingGlass size={16} weight="bold" />
                  <input
                    className="gs-search__input"
                    type="text"
                    placeholder={t('store.buscar_placeholder')}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="gs-filters">
                  {categoryFilters.map(f => (
                    <button
                      key={f}
                      type="button"
                      className={`gs-filter-tab${activeFilter === f ? ' gs-filter-tab--active' : ''}`}
                      onClick={() => setActiveFilter(f)}
                    >
                      {filterLabel(f)}
                    </button>
                  ))}
                </div>
                <div className="gs-toolbar__count">
                  {t('store.contagem_modulos', { count: filteredCatalog.length + (showComingSoon ? COMING_SOON_CONFIG.length : 0) })}
                </div>
              </div>

              {/* Label seção — disponíveis */}
              {filteredCatalog.length > 0 && (
                <div className="gs-section-label">
                  <span>{t('store.secao_disponiveis', { count: filteredCatalog.length })}</span>
                </div>
              )}

              {/* Grid — módulos disponíveis */}
              {filteredCatalog.length > 0 && (
              <div className="gs-grid">

                {filteredCatalog.map((p, idx) => {
                  const meta = PRODUCT_META[p.slug]
                  const isOwned = getStatus(p.slug) === 'owned'
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
                      <div className="gs-card__top">
                        <div className="gs-card__icon" style={{ background: meta?.iconBg ?? 'rgba(99,102,241,0.12)' }}>
                          {meta?.icon ?? <Package weight="duotone" size={28} color="#818cf8" />}
                        </div>
                        <div className="gs-card__badges">
                          {isOwned ? (
                            <span className="gs-badge gs-badge--owned">
                              <CheckCircle weight="fill" size={11} /> {t('store.badge_ativo')}
                            </span>
                          ) : (
                            <span className="gs-badge gs-badge--available">
                              <span className="gs-badge__dot" /> {t('store.badge_disponivel')}
                            </span>
                          )}
                          {meta?.featured && (
                            <span className="gs-badge gs-badge--featured">{t('store.badge_destaque')}</span>
                          )}
                        </div>
                      </div>
                      <div className="gs-card__body">
                        <h3 className="gs-card__name">{p.name}</h3>
                        {meta?.categoryKey && (
                          <span className="gs-card__category" style={{ color: meta.iconColor }}>
                            {t(meta.categoryKey)}
                          </span>
                        )}
                        <p className="gs-card__desc">
                          {meta?.descKey ? t(meta.descKey) : (p.description ?? t('store.modulo_desc_fallback'))}
                        </p>
                        {meta?.tagKeys && (
                          <div className="gs-card__tags">
                            {meta.tagKeys.map(tk => (
                              <span key={tk} className="gs-tag">{t(tk)}</span>
                            ))}
                          </div>
                        )}
                        {/* Combina com */}
                        {(PRODUCT_RELATIONS[p.slug]?.length ?? 0) > 0 && (
                          <div className="gs-card__combina">
                            <span className="gs-card__combina-label">{t('store.combina_com')}</span>
                            <div className="gs-card__combina-chips">
                              {PRODUCT_RELATIONS[p.slug].map(relSlug => {
                                const relMeta = PRODUCT_META[relSlug]
                                const relOwned = getStatus(relSlug) === 'owned'
                                const relProduct = catalog.find(cp => cp.slug === relSlug)
                                if (!relMeta || !relProduct) return null
                                return (
                                  <span
                                    key={relSlug}
                                    className={`gs-combina-chip${relOwned ? ' gs-combina-chip--owned' : ''}`}
                                    style={{ color: relMeta.iconColor }}
                                  >
                                    {relProduct.name}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="gs-card__footer">
                        {meta?.users ? (
                          <span className="gs-card__users">{t('store.usuarios_usando', { count: meta.users })}</span>
                        ) : <span />}
                        {isOwned ? (
                          <BotaoGlobal
                            variante="primario"
                            tamanho="pequeno"
                            onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}`) }}
                          >
                            {t('store.btn_acessar')}
                          </BotaoGlobal>
                        ) : (
                          <BotaoGlobal
                            variante="primario"
                            tamanho="pequeno"
                            disabled={isSubscribing}
                            onClick={(e) => { e.stopPropagation(); handleSubscribe(p.slug) }}
                          >
                            {isSubscribing
                              ? <><SpinnerGap size={14} className="hs-spin" /> {t('store.btn_contratando')}</>
                              : <>{t('store.btn_ativar')} <ArrowRight weight="bold" size={13} /></>
                            }
                          </BotaoGlobal>
                        )}
                      </div>
                    </div>
                  )
                })}

              </div>
              )}

              {/* Label + Grid — módulos em breve */}
              {showComingSoon && COMING_SOON_CONFIG.length > 0 && (
                <>
                  <div className="gs-section-label" style={{ marginTop: filteredCatalog.length > 0 ? '2rem' : undefined }}>
                    <span>{t('store.secao_em_breve', { count: COMING_SOON_CONFIG.length })}</span>
                  </div>
                  <div className="gs-grid">
                    {COMING_SOON_CONFIG.map((p, idx) => (
                      <div
                        key={p.id}
                        id={`produto-${p.slug}`}
                        className={`gs-card gs-card--soon hs-fade-up hs-fade-up-d${Math.min(idx + 1, 4)}`}
                      >
                        <div className="gs-card__top">
                          <div className="gs-card__icon" style={{ background: p.iconBg }}>
                            {p.icon}
                          </div>
                          <div className="gs-card__badges">
                            <span className="gs-badge gs-badge--soon">
                              <Lightning weight="fill" size={11} /> {t('store.badge_em_breve')}
                            </span>
                            {p.isPro && (
                              <span className="gs-badge gs-badge--pro">{t('store.badge_pro')}</span>
                            )}
                          </div>
                        </div>
                        <div className="gs-card__body">
                          <h3 className="gs-card__name" style={{ color: 'var(--sw-text-2)' }}>{t(p.nameKey)}</h3>
                          <span className="gs-card__category" style={{ color: 'var(--sw-text-3)', opacity: 0.6 }}>
                            {t(p.categoryKey)}
                          </span>
                          <p className="gs-card__desc">{t(p.descKey)}</p>
                          <div className="gs-card__tags">
                            {p.tagKeys.map(tk => (
                              <span key={tk} className="gs-tag gs-tag--muted">{t(tk)}</span>
                            ))}
                          </div>
                        </div>
                        <div className="gs-card__footer">
                          <span className="gs-card__users" style={{ opacity: 0.5 }}>{t('store.em_desenvolvimento')}</span>
                          <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
                            {t('store.btn_em_breve')}
                          </BotaoGlobal>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Footer */}
              <div className="gs-footer">
                <ArrowDown size={20} color="var(--color-text-muted)" />
                <span>{t('store.footer_texto', { ano: new Date().getFullYear() })}</span>
              </div>
            </>
          )}
        </div>

      <ToastContainer />
    </div>
  )
}
