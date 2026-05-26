import React, { useEffect, useState, useMemo } from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useTranslation } from 'react-i18next'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  SpinnerGap,
  ArrowRight,
  Info,
  MagnifyingGlass,
  Lightning,
  ArrowDown,
  Bell,
  Gear,
} from '@phosphor-icons/react'
import { PRODUCT_META, RELACAO_ENTRE_PRODUTOS_GRAVITY, STACK_ORDER } from '../data/product-meta'
import './hub-store.css'
import './hub.css'
import '../pages/configurador/workspace.css'
import './selecionar-workspace.css'
import { BotaoGlobal } from '@nucleo/botao-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { LogoHub } from '@nucleo/logo-produtos'
import {
  LocalizadorGlobal,
  useLocalizadorHistory,
  buildEcosystemNodes,
  type EcosystemNode,
} from '@nucleo/localizador-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { ToastContainer, useShellStore, useOrganizacaoOverride, useMeSync, useShellBodyClasses } from '@gravity/shell'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { ModalTrocarOrganizacao } from '../components/modal-trocar-organizacao'
import { podeComprarNoStore } from '../routing/route-policy'
import { mapRole } from '../types/niveis-acesso'
import { Notificacoes } from '../../../servicos-plataforma/notificacoes/src/Notificacoes'

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

// PRODUCT_META, RELACAO_ENTRE_PRODUTOS_GRAVITY e STACK_ORDER vivem em
// `../data/product-meta` — fonte única compartilhada com a Assinaturas.

export function Store() {
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useUser()
  const { signOut } = useClerk()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips, addNotification, currentUser } = useShellStore()
  const allowedProducts = useShellStore((s) => s.allowedProducts) ?? []
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'
  const isLight = currentTheme === 'light'
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  // Popula currentUser.tipoUsuario no ShellStore (Pendência #4 — sem
  // isso o item "Trocar Organização" não aparece nesta tela).
  useMeSync()
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)

  // Matriz Cadeia 1 (route-policy.ts): só Master/SuperAdmin/Admin contratam
  // produtos no Store. PADRAO/FORNECEDOR veem o catálogo (Fornecedor é
  // potencial cliente) mas o botão "Ativar" fica permanentemente desabilitado.
  const podeContratar = podeComprarNoStore(dbRole)

  const userRoleLabel = mapRole(dbRole)

  useShellBodyClasses()

  const userName = currentUser.name || user?.fullName || user?.firstName || t('shell.usuario_padrao')
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email || user?.primaryEmailAddress?.emailAddress || t('shell.email_padrao')

  const [catalog, setCatalog] = useState<CatalogProduct[]>([])
  const [subscribed, setSubscribed] = useState<Map<string, SubscribedProduct>>(new Map())
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'todos' | 'catalogo' | 'meus'>('todos')
  const [emBreveOnly, setEmBreveOnly] = useState(false)
  const [category, setCategory] = useState<string>('todas')

  useEffect(() => {
    async function load() {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch(`${API_URL}/produtos-gravity`),
          fetch(`${API_URL}/organizacoes/me/assinaturas-produto-gravity`, {
            headers: { Authorization: `Bearer ${await getToken()}` },
          }).catch(() => null),
        ])
        if (catRes.ok) {
          const catData = await catRes.json()
          setCatalog(catData.products.filter((p: CatalogProduct) => p.status === 'ATIVO' || p.status === 'Ativo' || p.status === 'EM_BREVE'))
        } else {
          console.warn('[Store] GET /produtos-gravity falhou', catRes.status, catRes.statusText)
          addNotification({ type: 'error', message: t('store.notif_erro_catalogo') })
        }
        if (subRes?.ok) {
          const subData = await subRes.json()
          const map = new Map<string, SubscribedProduct>()
          // Novo contrato: { assinaturas: [{ produto: { slug_produto_gravity }, configuracao: { ativo_configuracao_produto_gravity } }] }
          const assinaturas = (subData.assinaturas ?? []) as Array<{
            produto?: { slug_produto_gravity?: string }
            configuracao?: { ativo_configuracao_produto_gravity?: boolean } | null
          }>
          for (const a of assinaturas) {
            const slug = a.produto?.slug_produto_gravity
            if (!slug) continue
            map.set(slug, {
              product_key: slug,
              is_active: !!a.configuracao?.ativo_configuracao_produto_gravity,
            })
          }
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
    const produto = catalog.find(p => p.slug === slug)
    if (produto?.status !== 'ATIVO' && produto?.status !== 'Ativo') {
      console.warn('[Store] tentativa de contratar produto não-ATIVO bloqueada', { slug, status: produto?.status })
      return
    }
    setSubscribing(slug)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/organizacoes/me/assinaturas-produto-gravity/assinar-produto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ slug_produto_gravity: slug }),
      })
      if (res.ok) {
        const id_workspace = sessionStorage.getItem('gravity_company_id')
        if (id_workspace) {
          await fetch(`${API_URL}/workspaces/${id_workspace}/produtos-gravity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ slug_produto_gravity: slug }),
          }).catch(err => console.warn('[Store] vínculo workspace falhou', err))
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

  const getStatus = (slug: string): 'owned' | 'available' | 'soon' => {
    // Status do catálogo (admin) é fonte da verdade. EM_BREVE prevalece sobre
    // qualquer assinatura legada/interna — produto não-lançado nunca aparece
    // como "ativo" na Store, mesmo que a org tenha uma linha em ProdutoGravityAssinatura.
    const produto = catalog.find(p => p.slug === slug)
    if (produto?.status === 'EM_BREVE') return 'soon'
    if (subscribed.get(slug)?.is_active) return 'owned'
    return 'available'
  }

  const ownedCount = useMemo(() => catalog.filter(p => getStatus(p.slug) === 'owned').length, [catalog, subscribed])
  const totalCount = catalog.length
  const emBreveCount = useMemo(() => catalog.filter(p => p.status === 'EM_BREVE').length, [catalog])
  const catalogoCount = useMemo(() => catalog.filter(p => getStatus(p.slug) !== 'owned').length, [catalog, subscribed])

  // Delay determinístico por slug — cada card "owned" pulsa fora de sync (efeito aleatório estável)
  const pulseDelayFor = (slug: string): string => {
    let h = 0
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
    const sec = ((Math.abs(h) % 1000) / 1000) * 5  // 0..5s
    return `${sec.toFixed(2)}s`
  }

  const categoryFilters = useMemo(() => {
    const cats = new Set(catalog.map(p => PRODUCT_META[p.slug]?.categoryFilter).filter(Boolean))
    return ['todas', ...Array.from(cats)]
  }, [catalog])

  const categoryLabel = (key: string): string => {
    const map: Record<string, string> = {
      todas: t('store.filtro_categoria_todas'),
      frete: t('store.filtro_frete'),
      cambio: t('store.filtro_cambio'),
      importacao: t('store.filtro_importacao'),
      comercial: t('store.filtro_comercial'),
    }
    return map[key] ?? key
  }

  // "Em Breve" só faz sentido em Catálogo — força reset ao trocar para Meus produtos
  useEffect(() => {
    if (viewMode === 'meus' && emBreveOnly) setEmBreveOnly(false)
  }, [viewMode, emBreveOnly])

  const filteredCatalog = useMemo(() => {
    return catalog.filter(p => {
      const meta = PRODUCT_META[p.slug]
      const status = getStatus(p.slug)
      const matchesSearch = !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      const matchesView =
        viewMode === 'todos' ? true :
        viewMode === 'meus' ? status === 'owned' :
        status !== 'owned'
      const matchesEmBreve = !emBreveOnly || status === 'soon'
      const matchesCategory = category === 'todas' || meta?.categoryFilter === category
      return matchesSearch && matchesView && matchesEmBreve && matchesCategory
    })
  }, [catalog, subscribed, search, viewMode, emBreveOnly, category])

  // ── Localizador — nós do ecossistema ──────────────────────────────────────
  const { history } = useLocalizadorHistory('store')

  const produtoNodes: EcosystemNode[] = catalog.map(p => {
    const meta = PRODUCT_META[p.slug]
    return {
      id:       p.slug,
      label:    p.name,
      sublabel: 'produto',
      color:    meta?.iconColor ?? '#818cf8',
      type:     'produto',
      status:   allowedProducts.some(a => a.product_key === p.slug && a.is_active) ? 'accessible' : 'locked',
    }
  })

  const ecosystemNodes = buildEcosystemNodes({
    currentProductId: 'store',
    produtoNodes,
    includeAdmin: isGravityAdmin,
  })

  return (
    <div className="gs-root">

      {/* Topbar fixada — sempre visível independente do scroll */}
      <header className="hb-topbar">
        <div className="hb-topbar-left">
          <div className="hb-logo">
            <LogoGlobal iconSize={22} iconColor="#818cf8" />
          </div>
          <div className="hb-topbar-div" />
          <span className="hb-topbar-label">Store</span>
        </div>

        <div className="hb-topbar-right">
          {/* Atalho para Hub */}
          <button
            className="hb-topbar-navlink"
            type="button"
            title={t('store.voltar_hub')}
            onClick={() => navigate('/hub?select=1')}
          >
            <LogoHub size={13} color="#818cf8" />
            Hub
          </button>

          <div className="hb-topbar-sep" />

          {/* Busca — foca o campo de busca de módulos no corpo */}
          <button
            className="hb-topbar-btn"
            type="button"
            title={t('comum.buscar')}
            onClick={() => {
              const el = document.querySelector<HTMLInputElement>('.gs-search__input')
              if (el) {
                el.focus()
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            }}
          >
            <MagnifyingGlass weight="bold" size={16} />
          </button>

          {/* Notificações — componente tenant self-contained */}
          <Notificacoes />

          {/* Toggle tooltips */}
          <button
            className="hb-topbar-btn"
            type="button"
            title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
            onClick={toggleTooltips}
            style={{ color: tooltipsDisabled ? 'var(--hb-muted)' : 'var(--hb-accent)' }}
          >
            <Info weight={tooltipsDisabled ? 'regular' : 'fill'} size={16} />
          </button>

          {/* Localizador — ecosistema */}
          <LocalizadorGlobal
            workspaceName={companyName}
            iconOnly
            currentProductId="store"
            currentProductLabel="Store"
            currentProductColor="#818cf8"
            currentPageLabel="Store"
            history={history}
            nodes={ecosystemNodes}
            onNavigate={(node) => {
              if (node.type === 'hub')               navigate('/hub?select=1')
              else if (node.type === 'core')         navigate('/core')
              else if (node.type === 'configurador') navigate('/configurador')
              else if (node.type === 'admin')        navigate('/admin/visao-geral')
              else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
            }}
          />

          {/* Seletor de idioma */}
          <SeletorIdiomaGlobal iconOnly />

          <div className="hb-topbar-sep" />

          {/* Engrenagem — workspace */}
          <button
            className="hb-topbar-btn"
            type="button"
            title={t('workspace.layout.modulo_nome')}
            onClick={() => navigate('/configurador')}
          >
            <Gear weight="duotone" size={16} />
          </button>

          <UsuarioGlobal
            userName={userName}
            userEmail={userEmail}
            userInitials={userInitials}
            userRole={userRoleLabel}
            isLight={isLight}
            onToggleTheme={toggleTheme}
            onNavigateWorkspace={() => navigate('/configurador/organizacao')}
            onNavigateMarketPlace={() => navigate('/store')}
            onSignOut={() => signOut()}
            isAdmin={isGravityAdmin}
            onNavigateAdmin={() => navigate('/admin/visao-geral')}
            temAcessoTrocarOrganizacao={podeAtivarOverride}
            organizacaoOverrideAtiva={overrideAtivo}
            aoTrocarOrganizacao={() => setModalTrocarOrgAberto(true)}
            aoVoltarParaGravity={() => { limparOverride(); navigate('/hub') }}
            compact
          />
        </div>
      </header>
      <ModalTrocarOrganizacao
        aberto={modalTrocarOrgAberto}
        aoFechar={() => setModalTrocarOrgAberto(false)}
      />

      {/* Conteúdo abaixo da topbar */}
      <div className="gs-store">
          {loading ? (
            <div className="gs-loading">
              <GravityLoader texto="Carregando" tamanho="lg" />
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
                    <div className="gs-stat__n">{emBreveCount}</div>
                    <div className="gs-stat__l">{t('store.stat_em_breve')}</div>
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

                        // Dimensões: corpo W=120 H=90, aba estende 18px direita, cavidade indenta 18px esquerda
                        // Mesma geometria garante que aba e cavidade tracem o MESMO arco — strokes coincidem em uma linha só
                        const path = isFirst && isLast
                          ? 'M 0,0 L 120,0 L 120,90 L 0,90 Z'
                          : isFirst
                          ? 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 Z'
                          : isLast
                          ? 'M 0,0 L 120,0 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'
                          : 'M 0,0 L 120,0 L 120,32 C 138,32 138,58 120,58 L 120,90 L 0,90 L 0,58 C 18,58 18,32 0,32 Z'

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

                {/* Segmented: Todos | Catálogo | Meus produtos */}
                <div className="gs-segmented" role="tablist" aria-label={t('store.view_aria')}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'todos'}
                    className={`gs-segmented__btn${viewMode === 'todos' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => setViewMode('todos')}
                  >
                    {t('store.filtro_todos')}
                    <span className="gs-segmented__count">{totalCount}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'catalogo'}
                    className={`gs-segmented__btn${viewMode === 'catalogo' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => setViewMode('catalogo')}
                  >
                    {t('store.view_catalogo')}
                    <span className="gs-segmented__count">{catalogoCount}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'meus'}
                    className={`gs-segmented__btn${viewMode === 'meus' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => setViewMode('meus')}
                  >
                    {t('store.view_meus')}
                    <span className="gs-segmented__count">{ownedCount}</span>
                  </button>
                </div>

                {/* Chip "Em Breve" — ativo em Todos e Catálogo (quando há itens) */}
                {viewMode !== 'meus' && emBreveCount > 0 && (
                  <button
                    type="button"
                    className={`gs-chip-soon${emBreveOnly ? ' gs-chip-soon--active' : ''}`}
                    onClick={() => setEmBreveOnly(v => !v)}
                    aria-pressed={emBreveOnly}
                  >
                    <Lightning weight="fill" size={12} />
                    {t('store.filtro_em_breve')}
                    <span className="gs-chip-soon__count">{emBreveCount}</span>
                  </button>
                )}

                <div className="gs-toolbar__divider" aria-hidden="true" />

                <div className="gs-filters">
                  {categoryFilters.map(f => (
                    <button
                      key={f}
                      type="button"
                      className={`gs-filter-tab${category === f ? ' gs-filter-tab--active' : ''}`}
                      onClick={() => setCategory(f)}
                    >
                      {categoryLabel(f)}
                    </button>
                  ))}
                </div>

                <div className="gs-toolbar__count">
                  {t('store.contagem_modulos', { count: filteredCatalog.length })}
                </div>
              </div>

              {/* Label seção — dinâmico conforme view */}
              {filteredCatalog.length > 0 && (
                <div className="gs-section-label">
                  <span>
                    {viewMode === 'meus'
                      ? t('store.secao_meus', { count: filteredCatalog.length })
                      : emBreveOnly
                        ? t('store.secao_em_breve', { count: filteredCatalog.length })
                        : t('store.secao_disponiveis', { count: filteredCatalog.length })}
                  </span>
                </div>
              )}

              {/* Grid — módulos disponíveis */}
              {filteredCatalog.length > 0 && (
              <div className="gs-grid">

                {filteredCatalog.map((p, idx) => {
                  const meta = PRODUCT_META[p.slug]
                  const status = getStatus(p.slug)
                  const isOwned = status === 'owned'
                  const isSoon = status === 'soon'
                  const isSubscribing = subscribing === p.slug
                  const delayClass = idx < 6 ? `hs-fade-up-d${Math.min(idx + 1, 4)}` : ''
                  return (
                    <div
                      key={p.id}
                      id={`produto-${p.slug}`}
                      className={`gs-card hs-fade-up ${delayClass}${isOwned ? ' gs-card--owned' : ''}${isSoon ? ' gs-card--soon' : ''}${!isOwned && !isSoon ? ' gs-card--available' : ''}`}
                      onClick={isOwned ? () => navigate(`/produto/${p.slug}`) : undefined}
                      style={isOwned
                        ? { cursor: 'pointer', ['--pulse-delay' as string]: pulseDelayFor(p.slug) } as React.CSSProperties
                        : undefined}
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
                          ) : isSoon ? (
                            <span className="gs-badge gs-badge--soon">
                              <Lightning weight="fill" size={11} /> {t('store.badge_em_breve')}
                            </span>
                          ) : (
                            <span className="gs-badge gs-badge--available">
                              <span className="gs-badge__dot" /> {t('store.badge_disponivel')}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="gs-card__body">
                        <h3 className="gs-card__name">{meta?.nameKey ? t(meta.nameKey) : p.name}</h3>
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
                              <span key={tk} className={`gs-tag${isSoon ? ' gs-tag--muted' : ''}`}>{t(tk)}</span>
                            ))}
                          </div>
                        )}
                        {/* Combina com */}
                        {(RELACAO_ENTRE_PRODUTOS_GRAVITY[p.slug]?.length ?? 0) > 0 && (
                          <div className="gs-card__combina">
                            <span className="gs-card__combina-label">{t('store.combina_com')}</span>
                            <div className="gs-card__combina-chips">
                              {RELACAO_ENTRE_PRODUTOS_GRAVITY[p.slug].map(relSlug => {
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
                        <span />
                        {isOwned ? (
                          <BotaoGlobal
                            variante="secundario"
                            tamanho="pequeno"
                            onClick={(e) => { e.stopPropagation(); navigate(`/produto/${p.slug}`) }}
                          >
                            {t('store.btn_acessar')}
                          </BotaoGlobal>
                        ) : isSoon ? (
                          <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
                            {t('store.btn_em_breve')}
                          </BotaoGlobal>
                        ) : podeContratar ? (
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
                        ) : (
                          // Matriz Cadeia 1: PADRAO/FORNECEDOR vê o catálogo mas
                          // jamais contrata. Fornecedor é potencial cliente —
                          // mostra valor sem habilitar compra. Master/SAdmin/Admin
                          // são os únicos que adquirem produtos para a org.
                          <BotaoGlobal variante="fantasma" tamanho="pequeno" disabled onClick={() => {}}>
                            {t('store.btn_ativar')}
                          </BotaoGlobal>
                        )}
                      </div>
                    </div>
                  )
                })}

              </div>
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
