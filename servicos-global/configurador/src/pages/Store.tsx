import React, { useEffect, useState, useMemo } from 'react'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useTranslation } from 'react-i18next'
import { useAuth, useClerk, useUser } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Package,
  CheckCircle,
  MagnifyingGlass,
  Lightning,
  ArrowDown,
} from '@phosphor-icons/react'
import { PRODUCT_META, metaProdutoStore } from '../data/product-meta'
import {
  filtrarProdutosPublicadosStore,
  storeAssinaturasRespostaSchema,
  storeCatalogoRespostaApiSchema,
} from '../schemas/store-catalogo-api'
import {
  classeSegmentoPuzzleStore,
  contarStatusCatalogoStore,
  resolverStatusProdutoStore,
  type StatusExibicaoProdutoStore,
} from '../data/status-produto-store'
import { ordenarSlugsPuzzleStore } from '../data/store-puzzle-order'
import { StorePuzzleRow } from '../components/store-puzzle-row'
import { StorePuzzleCarousel } from '../components/store-puzzle-carousel'
import {
  StoreCardsRows,
  filtrarCatalogoStoreBusca,
  type StoreLinhaKey,
} from '../components/store-cards-rows'
import './hub-store.css'
import './hub.css'
import '../pages/configurador/workspace.css'
import './selecionar-workspace.css'
import { LogoHub } from '@nucleo/logo-produtos'
import { useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { ToastContainer, useShellStore, useOrganizacaoOverride, useMeSync, useShellBodyClasses, useLoadAllowedProducts } from '@gravity/shell'
import { TopbarPaginaGravity } from '../components/topbar-pagina-gravity'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { ModalTrocarOrganizacao } from '../components/modal-trocar-organizacao'
import { podeComprarNoStore } from '../routing/route-policy'
import { mapRole } from '../types/niveis-acesso'

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
  const { addNotification, currentUser } = useShellStore()
  const allowedProducts = useShellStore((s) => s.allowedProducts) ?? []
  const companyName = sessionStorage.getItem('gravity_company_name') || 'Workspace'
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole } = useCarregarTipoUsuario()
  // Popula currentUser.tipoUsuario no ShellStore (Pendência #4 — sem
  // isso o item "Trocar Organização" não aparece nesta tela).
  useMeSync()
  useLoadAllowedProducts()
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
  const [category, setCategory] = useState<string>('todas')
  const [viewMode, setViewMode] = useState<StoreLinhaKey>('assinar')

  const carregarCatalogo = React.useCallback(async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        fetch(`${API_URL}/produtos-gravity`, { cache: 'no-store' }),
        fetch(`${API_URL}/organizacoes/me/assinaturas-produto-gravity`, {
          cache: 'no-store',
          headers: { Authorization: `Bearer ${await getToken()}` },
        }).catch(() => null),
      ])
      if (catRes.ok) {
        const raw = await catRes.json()
        const parsed = storeCatalogoRespostaApiSchema.parse(raw)
        const publicados = filtrarProdutosPublicadosStore(parsed.products)
        setCatalog(publicados as CatalogProduct[])
        if (publicados.length === 0) {
          console.warn('[Store] catálogo vazio após filtro ATIVO/EM_BREVE', raw)
        }
      } else {
        console.warn('[Store] GET /produtos-gravity falhou', catRes.status, catRes.statusText)
        addNotification({ type: 'error', message: t('store.notif_erro_catalogo') })
      }
      if (subRes?.ok) {
        try {
          const subData = storeAssinaturasRespostaSchema.parse(await subRes.json())
          const map = new Map<string, SubscribedProduct>()
          for (const a of subData.assinaturas) {
            const slug = a.produto.slug_produto_gravity
            map.set(slug, {
              product_key: slug,
              is_active: !!a.configuracao?.ativo_configuracao_produto_gravity,
            })
          }
          setSubscribed(map)
        } catch (parseErr) {
          console.warn('[Store] assinaturas com formato inesperado — contadores sem vínculo', parseErr)
        }
      }
    } catch (err) {
      console.error('[Store] falha ao carregar catálogo/assinaturas', err)
      addNotification({ type: 'error', message: err instanceof Error ? err.message : t('store.notif_erro_catalogo') })
    } finally {
      setLoading(false)
    }
  }, [getToken, addNotification, t])

  useEffect(() => {
    setLoading(true)
    void carregarCatalogo()
  }, [carregarCatalogo])

  useEffect(() => {
    const onVisivel = () => {
      if (document.visibilityState === 'visible') void carregarCatalogo()
    }
    document.addEventListener('visibilitychange', onVisivel)
    return () => document.removeEventListener('visibilitychange', onVisivel)
  }, [carregarCatalogo])

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

  const statusProduto = (slug: string): StatusExibicaoProdutoStore =>
    resolverStatusProdutoStore(slug, catalog, subscribed)

  const puzzleSlugsOrdenados = useMemo(
    () => ordenarSlugsPuzzleStore(catalog),
    [catalog],
  )

  const puzzleLinhaAtivos = useMemo(
    () =>
      puzzleSlugsOrdenados.filter((slug) => {
        const s = resolverStatusProdutoStore(slug, catalog, subscribed)
        return s === 'contratado' || s === 'disponivel'
      }),
    [puzzleSlugsOrdenados, catalog, subscribed],
  )

  const contratadosNoPuzzle = useMemo(
    () =>
      puzzleLinhaAtivos.filter(
        (slug) => resolverStatusProdutoStore(slug, catalog, subscribed) === 'contratado',
      ).length,
    [puzzleLinhaAtivos, catalog, subscribed],
  )

  const contagemStore = useMemo(
    () => contarStatusCatalogoStore(catalog, subscribed),
    [catalog, subscribed],
  )

  // Delay determinístico por slug — cada card "owned" pulsa fora de sync (efeito aleatório estável)
  const pulseDelayFor = (slug: string): string => {
    let h = 0
    for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
    const sec = ((Math.abs(h) % 1000) / 1000) * 5  // 0..5s
    return `${sec.toFixed(2)}s`
  }

  const categoryFilters = useMemo(() => {
    const cats = new Set(catalog.map(p => metaProdutoStore(p.slug)?.categoryFilter).filter(Boolean))
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

  const catalogoFiltrado = useMemo(
    () => filtrarCatalogoStoreBusca(catalog, search, category),
    [catalog, search, category],
  )

  const contagemLinhas = useMemo(() => {
    let ativo = 0
    let assinar = 0
    let em_breve = 0
    for (const p of catalogoFiltrado) {
      const s = statusProduto(p.slug)
      if (s === 'contratado') ativo++
      else if (s === 'disponivel') assinar++
      else if (s === 'em_breve') em_breve++
    }
    return {
      todos: catalogoFiltrado.length,
      ativo,
      assinar,
      em_breve,
    }
  }, [catalogoFiltrado, catalog, subscribed])

  const irParaLinha = (linha: StoreLinhaKey) => {
    setViewMode(linha)
    document.getElementById(`store-linha-${linha}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const secoes: StoreLinhaKey[] = ['assinar', 'ativo', 'em_breve', 'todos']
    const elementos = secoes
      .map((k) => document.getElementById(`store-linha-${k}`))
      .filter((el): el is HTMLElement => el != null)
    if (elementos.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visivel = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visivel?.target.id) {
          const key = visivel.target.id.replace('store-linha-', '') as StoreLinhaKey
          setViewMode(key)
        }
      },
      { root: null, rootMargin: '-12% 0px -55% 0px', threshold: [0.08, 0.2, 0.4] },
    )
    for (const el of elementos) observer.observe(el)
    return () => observer.disconnect()
  }, [catalogoFiltrado.length, loading])

  // ── Localizador — nós do ecossistema ──────────────────────────────────────
  const { history } = useLocalizadorHistory('store')

  const produtoNodes: EcosystemNode[] = catalog.map(p => {
    const meta = metaProdutoStore(p.slug)
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

      <TopbarPaginaGravity
        rotuloTela="Store"
        atalho={{
          label: 'Hub',
          title: t('store.voltar_hub'),
          icon: <LogoHub size={13} color="#818cf8" />,
          onClick: () => navigate('/hub?select=1'),
        }}
        onBuscar={() => {
          const el = document.querySelector<HTMLInputElement>('.gs-search__input')
          if (el) {
            el.focus()
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }}
        workspaceName={companyName}
        localizador={{
          currentProductId: 'store',
          currentProductLabel: 'Store',
          currentProductColor: '#818cf8',
          currentPageLabel: 'Store',
          history,
          nodes: ecosystemNodes,
          onNavigate: (node) => {
            if (node.type === 'hub')               navigate('/hub?select=1')
            else if (node.type === 'core')         navigate('/hub?select=1')
            else if (node.type === 'hub-store')    navigate('/store')
            else if (node.type === 'configurador') navigate('/configurador')
            else if (node.type === 'admin')        navigate('/admin/visao-geral')
            else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
          },
        }}
        onAbrirConfigurador={() => navigate('/configurador')}
        usuario={{
          userName,
          userEmail,
          userInitials,
          userRole: userRoleLabel,
          onNavigateWorkspace: () => navigate('/configurador/organizacao'),
          onNavigateMarketPlace: () => navigate('/store'),
          onSignOut: () => signOut(),
          isAdmin: isGravityAdmin,
          onNavigateAdmin: () => navigate('/admin/visao-geral'),
          temAcessoTrocarOrganizacao: podeAtivarOverride,
          organizacaoOverrideAtiva: overrideAtivo,
          aoTrocarOrganizacao: () => setModalTrocarOrgAberto(true),
          aoVoltarParaGravity: () => { limparOverride(); navigate('/hub') },
        }}
      />
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
                    <div className="gs-stat__n">{contagemStore.disponiveis}</div>
                    <div className="gs-stat__l">{t('store.stat_disponiveis')}</div>
                  </div>
                </div>
                <div className="gs-stat">
                  <div className="gs-stat__icon" style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}>
                    <CheckCircle weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n">{contagemStore.contratados}</div>
                    <div className="gs-stat__l">{t('store.stat_contratados')}</div>
                  </div>
                </div>
                <div className="gs-stat">
                  <div className="gs-stat__icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                    <Lightning weight="duotone" size={20} />
                  </div>
                  <div>
                    <div className="gs-stat__n">{contagemStore.em_breve}</div>
                    <div className="gs-stat__l">{t('store.stat_em_breve')}</div>
                  </div>
                </div>
              </div>

              {/* ── MONTE O SEU GRAVITY — Puzzle Stack ───────────────────── */}
              <div className="gs-stack">
                  <div className="gs-stack__head">
                    <div>
                      <h2 className="gs-stack__title">{t('store.stack_titulo')}</h2>
                      <p className="gs-stack__sub">{t('store.stack_sub')}</p>
                    </div>
                    <div className="gs-stack__meter">
                      <div className="gs-stack__meter-bar">
                        {puzzleLinhaAtivos.map((slug) => (
                          <div
                            key={slug}
                            className={`gs-stack__seg${classeSegmentoPuzzleStore(statusProduto(slug))}`}
                          />
                        ))}
                      </div>
                      <span className="gs-stack__meter-label">
                        {contratadosNoPuzzle === 0
                          ? t('store.stack_nenhum')
                          : contratadosNoPuzzle === puzzleLinhaAtivos.length
                            ? t('store.stack_completo')
                            : t('store.stack_parcial', {
                                n: contratadosNoPuzzle,
                                total: puzzleLinhaAtivos.length,
                              })}
                      </span>
                    </div>
                  </div>

                  <div className="gs-stack__lanes">
                    {puzzleLinhaAtivos.length > 0 && (
                      <StorePuzzleCarousel className="gs-puzzle-carousel--ativos">
                        <StorePuzzleRow
                          embutido
                          slugs={puzzleLinhaAtivos}
                          catalog={catalog}
                          statusDe={statusProduto}
                          variante="ativos"
                        />
                      </StorePuzzleCarousel>
                    )}
                  </div>

                  {contratadosNoPuzzle === 0 && (
                    <p className="gs-stack__hint">{t('store.stack_hint')}</p>
                  )}
                </div>

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

                <div className="gs-segmented gs-segmented--4" role="tablist" aria-label={t('store.view_aria')}>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'todos'}
                    className={`gs-segmented__btn${viewMode === 'todos' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => irParaLinha('todos')}
                  >
                    {t('store.filtro_todos')}
                    <span className="gs-segmented__count">{contagemLinhas.todos}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'ativo'}
                    className={`gs-segmented__btn${viewMode === 'ativo' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => irParaLinha('ativo')}
                  >
                    {t('store.filtro_ativo')}
                    <span className="gs-segmented__count">{contagemLinhas.ativo}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'assinar'}
                    className={`gs-segmented__btn gs-segmented__btn--assinar${viewMode === 'assinar' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => irParaLinha('assinar')}
                  >
                    {t('store.filtro_assinar')}
                    <span className="gs-segmented__count">{contagemLinhas.assinar}</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === 'em_breve'}
                    className={`gs-segmented__btn gs-segmented__btn--soon${viewMode === 'em_breve' ? ' gs-segmented__btn--active' : ''}`}
                    onClick={() => irParaLinha('em_breve')}
                  >
                    <Lightning weight="fill" size={12} />
                    {t('store.filtro_em_breve')}
                    <span className="gs-segmented__count">{contagemLinhas.em_breve}</span>
                  </button>
                </div>

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
                  {t('store.contagem_produtos', { count: catalogoFiltrado.length })}
                </div>
              </div>

              <StoreCardsRows
                catalog={catalog}
                catalogoFiltrado={catalogoFiltrado}
                assinaturas={subscribed}
                podeContratar={podeContratar}
                subscribing={subscribing}
                onSubscribe={handleSubscribe}
                pulseDelayFor={pulseDelayFor}
              />

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
