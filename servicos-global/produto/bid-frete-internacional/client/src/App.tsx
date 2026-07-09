/**
 * App.tsx — Raiz da SPA BID Frete Internacional
 *
 * Usa <TelaProdutoGlobal> (mesmo padrão do Pedido):
 * sidebar com logo + nome do produto, workspace, navegação, título de página.
 */

import React, { lazy, Suspense, useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Routes, Route, Navigate, useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { bidFreteQueryClient } from './shared/bid-frete-query-client'
import { useShellStore, ToastContainer, useMeSync, urlCriarWorkspace, urlGerenciarWorkspaces } from '@gravity/shell'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { TelaProdutoComOrganizacaoOverride } from '@gravity/shell'
import { useLocalizadorHistory, type EcosystemNode } from '@nucleo/localizador-global'
import { getProdutoMeta } from '@nucleo/logo-produtos'
import {
  ChartPieSlice,
  ChartBar,
  ListBullets,
  FileText,
  Buildings,
  ClockCounterClockwise,
  GearSix,
  UserCircle,
  CheckCircle,
  Envelope,
  WhatsappLogo,
  Kanban,
} from '@phosphor-icons/react'
import { PRODUCT_CONFIG, type NavigationItem } from './shared/config'
import { injectTenantGetter, injectUserGetter, injectWorkspaceGetter } from './shared/api'
import {
  ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL,
  rotaBidFreteInternacional,
  rotaDetalheCotacaoBidFreteInternacional,
} from './shared/rotas-bid-frete-internacional'
import { traduzirPageMetaTopo } from './shared/page-meta-topo'
import { PaginaCarregandoBidFreteInternacional } from './shared/pagina-carregando-bid-frete-internacional'
import './shared/bid-frete-page-shell.css'
import { BidFreteVisualizacaoLayout } from './components/BidFreteVisualizacaoLayout'
import { BidFreteMultiView } from './components/BidFreteMultiView'
import type { NavItem } from '@nucleo/tela-produto-global'
import { bidFreteConfigApi, setApiContext } from './shared/api'
import {
  useEscopoWorkspacesBidFreteInternacional,
} from './shared/useEscopoWorkspacesBidFreteInternacional'

// ── Lazy loading das telas ────────────────────────────────────────────────────

const bidFreteVisualizacoesClienteElement = <BidFreteMultiView modo="cliente" />
const bidFreteVisualizacoesFornecedorElement = <BidFreteMultiView modo="fornecedor" />
const ModalNovaCotacaoBidFreteInternacional = lazy(
  () => import('./pages/modal-nova-cotacao-bid-frete-internacional'),
)
const CotacoesImportar = lazy(() => import('./pages/importar-bid-frete-internacional'))
const DetalheCotacao = lazy(() => import('./pages/cotacao-detalhe'))
const Comparativo = lazy(() => import('./pages/comparativo'))
const Fornecedores = lazy(() => import('./pages/fornecedores-lista'))
const DetalheFornecedor = lazy(() => import('./pages/fornecedor-detalhe'))
const Configuracoes = lazy(() => import('./pages/configuracoes'))

const VisaoFornecedorCotacoesPendentes = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-cotacoes-pendentes'))
const VisaoFornecedorPropostas = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-propostas'))
const VisaoFornecedorTabelasValor = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-tabelas-valor'))
const VisaoFornecedorDesempenho = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-desempenho'))
const VisaoFornecedorConfiguracoes = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-configuracoes'))
const VisaoFornecedorResponderCotacao = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-responder-cotacao'))
const VisaoFornecedorResponderPublico = lazy(() => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-bid-frete-internacional-responder-publico'))
const AceiteAprovacaoPropostaPublico = lazy(() => import('./pages/aceite-aprovacao-proposta-bid-frete-internacional-publico'))
const VisaoFornecedorCondicoesPlataforma = lazy(
  () => import('./pages/visao-fornecedor-bid-frete-internacional/visao-fornecedor-condicoes-plataforma-bid-frete-internacional'),
)

injectTenantGetter(() => useShellStore.getState().currentUser?.idOrganizacao)
injectUserGetter(() => useShellStore.getState().currentUser?.id)
injectWorkspaceGetter(() => {
  const idStore = useShellStore.getState().idWorkspaceAtivo
  if (idStore) return idStore
  try { return sessionStorage.getItem('gravity_company_id') || undefined }
  catch { return undefined }
})

const PRODUTO       = getProdutoMeta('bid-frete-internacional')
const PRODUCT_ID    = 'bid-frete-internacional'
const PRODUCT_NAME  = 'Bid Frete Internacional'
const PRODUCT_COLOR = PRODUTO.color

const iconMap: Record<string, React.ReactNode> = {
  'chart-pie-slice':         <ChartPieSlice         weight="duotone" size={20} />,
  'chart-bar':               <ChartBar              weight="duotone" size={20} />,
  'file-text':               <FileText              weight="duotone" size={20} />,
  'list-bullets':            <ListBullets           weight="duotone" size={20} />,
  'buildings':               <Buildings             weight="duotone" size={20} />,
  'clock-counter-clockwise': <ClockCounterClockwise weight="duotone" size={20} />,
  'gear-six':                <GearSix               weight="duotone" size={20} />,
  'user-circle':             <UserCircle            weight="duotone" size={20} />,
  'check-circle':            <CheckCircle           weight="duotone" size={20} />,
  'envelope':                <Envelope              weight="duotone" size={20} />,
  'whatsapp-logo':           <WhatsappLogo          weight="duotone" size={20} />,
  'kanban':                  <Kanban                weight="duotone" size={20} />,
}

function mapNavItem(item: NavigationItem, t: (key: string) => string): NavItem {
  const label = item.labelKey ? t(item.labelKey) : item.label
  if (item.sectionDivider) {
    return { label, sectionDivider: true as const, icon: null as any }
  }
  return {
    id:           item.id,
    to:           item.id,
    label,
    icon:         iconMap[item.icon ?? ''] ?? <ListBullets weight="duotone" size={20} />,
    disabled:     item.disabled,
    badge:        item.badge,
    badgeVariant: item.badgeVariant as 'accent' | 'muted' | undefined,
    external:     item.external,
    children:     item.children?.map(child => mapNavItem(child, t)),
  }
}

const ECOSYSTEM_NODES: EcosystemNode[] = [
  { id: 'hub',          label: 'Hub',          sublabel: 'workspaces',     color: '#818cf8',     type: 'hub',          status: 'accessible' },
  { id: 'configurador', label: 'Configurador', sublabel: 'auth · billing', color: '#f472b6',     type: 'configurador', status: 'accessible' },
  { id: PRODUCT_ID,     label: PRODUCT_NAME,   sublabel: PRODUTO.sublabel, color: PRODUCT_COLOR, type: 'produto',      status: 'current' },
]

function LoadingFallback() {
  return <PaginaCarregandoBidFreteInternacional className="bid-frete-page-shell" />
}

/** Redirect legado: /cotacoes e /cotacoes?visao=* → /lista ou /kanban (rotas-convencao.md). */
function RedirectCotacoesVisaoLegado() {
  const [searchParams] = useSearchParams()
  const visao = searchParams.get('visao')
  const destino = visao === 'kanban' ? 'kanban' : 'lista'
  return <Navigate to={rotaBidFreteInternacional(destino)} replace />
}

/** Redirect legado: /lista/:id_cotacao → /cotacoes/:id_cotacao (rota canônica do detalhe). */
function RedirectListaDetalheCotacao() {
  const { id_cotacao } = useParams<{ id_cotacao: string }>()
  if (!id_cotacao) return <Navigate to={rotaBidFreteInternacional('lista')} replace />
  return <Navigate to={rotaDetalheCotacaoBidFreteInternacional(id_cotacao)} replace />
}

const queryClient = bidFreteQueryClient

export { bidFreteQueryClient } from './shared/bid-frete-query-client'

function AppInner() {
  useMeSync()
  const { t } = useTranslation()
  const { getToken } = useAuth()
  const { signOut } = useClerk()
  const location = useLocation()
  const navigate = useNavigate()

  const currentUser      = useShellStore(s => s.currentUser)
  const tooltipsDisabled = useShellStore(s => s.tooltipsDisabled)
  const toggleTooltips   = useShellStore(s => s.toggleTooltips)
  const toggleTheme      = useShellStore(s => s.toggleTheme)
  const currentTheme     = useShellStore(s => s.currentTheme)
  const workspacesStore  = useShellStore(s => s.workspaces)
  const idWorkspaceAtivo = useShellStore(s => s.idWorkspaceAtivo)

  const idsWorkspacesEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.idsWorkspacesEscopo)
  const hidratadoEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.hidratado)
  const hidratarEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.hidratar)
  const reiniciarHidratacaoEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.reiniciarHidratacao)
  const alternarWorkspaceEscopo = useEscopoWorkspacesBidFreteInternacional(s => s.alternarWorkspace)
  const definirEscopoWorkspaces = useEscopoWorkspacesBidFreteInternacional(s => s.definirEscopo)
  const sinalAbrirMenuWorkspaces = useEscopoWorkspacesBidFreteInternacional(s => s.sinalAbrirMenuWorkspaces)
  const sessaoEscopoHidratadaRef = useRef<string | null>(null)
  const qtdWorkspaces = workspacesStore.length
  const idsWorkspacesDisponiveisAssinatura = useMemo(
    () => workspacesStore.map(ws => ws.id).join('\0'),
    [workspacesStore],
  )

  useEffect(() => {
    if (currentUser.id) {
      setApiContext({
        idOrganizacao: currentUser.idOrganizacao ?? '',
        userId: currentUser.id,
        userName: currentUser.name ?? '',
      })
    }
  }, [currentUser.id, currentUser.idOrganizacao, currentUser.name])

  useEffect(() => {
    if (qtdWorkspaces === 0 || !idWorkspaceAtivo || !currentUser?.idOrganizacao || !currentUser.id) return

    const sessao = `${currentUser.idOrganizacao}:${currentUser.id}`
    if (sessaoEscopoHidratadaRef.current === sessao) return

    reiniciarHidratacaoEscopo()

    let cancelled = false
    const idsDisponiveis = workspacesStore.map(ws => ws.id)

    // Default imediato (sessionStorage) — sidebar e APIs filtram antes do GET backend
    hidratarEscopo(idsDisponiveis, idWorkspaceAtivo, null)

    void bidFreteConfigApi.obterEscopoWorkspaces()
      .then(res => {
        if (cancelled) return
        const idsSalvos = res.data?.ids_workspaces_escopo
        hidratarEscopo(
          idsDisponiveis,
          idWorkspaceAtivo,
          idsSalvos !== undefined ? idsSalvos : null,
        )
        sessaoEscopoHidratadaRef.current = sessao
      })
      .catch(() => {
        if (cancelled) return
        hidratarEscopo(idsDisponiveis, idWorkspaceAtivo, null)
        sessaoEscopoHidratadaRef.current = sessao
      })

    return () => { cancelled = true }
  }, [
    qtdWorkspaces,
    idWorkspaceAtivo,
    currentUser?.idOrganizacao,
    currentUser?.id,
    hidratarEscopo,
    reiniciarHidratacaoEscopo,
    idsWorkspacesDisponiveisAssinatura,
  ])

  const { history, addEntry } = useLocalizadorHistory(PRODUCT_ID)

  useEffect(() => {
    const pageLabel = location.pathname.split('/').filter(Boolean).pop() ?? 'Bid Frete Internacional'
    addEntry({
      productId:    PRODUCT_ID,
      productLabel: PRODUCT_NAME,
      productColor: PRODUCT_COLOR,
      pageLabel,
      pagePath:     location.pathname,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  const pageMeta = useMemo(
    () => traduzirPageMetaTopo(location.pathname, location.search, t),
    [location.pathname, location.search, t],
  )

  const initials = currentUser.name
    ? currentUser.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser.email?.[0]?.toUpperCase() ?? '?'

  const isAdmin =
    currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ||
    currentUser.role === 'SUPER_ADMIN'  || currentUser.role === 'ADMIN'

  const wsAtivo = workspacesStore.find(ws => ws.id === idWorkspaceAtivo)
  const nomeWorkspaceAtivo = wsAtivo?.nome_workspace ?? currentUser.nomeWorkspacePreferido ?? currentUser.nomeOrganizacao ?? 'Minha Empresa'

  const escopoWorkspaces = useMemo(() => {
    if (!hidratadoEscopo || idsWorkspacesEscopo.length === 0) {
      return { tenantName: nomeWorkspaceAtivo, tenantPlan: currentUser.nomeOrganizacao ?? '' }
    }
    const nomes = idsWorkspacesEscopo
      .map(id => workspacesStore.find(ws => ws.id === id)?.nome_workspace)
      .filter((n): n is string => Boolean(n))
    if (nomes.length === 0) {
      return { tenantName: nomeWorkspaceAtivo, tenantPlan: currentUser.nomeOrganizacao ?? '' }
    }
    if (nomes.length === 1) {
      return { tenantName: nomes[0], tenantPlan: currentUser.nomeOrganizacao ?? '' }
    }
    const preview = nomes.slice(0, 2).join(', ')
    const suffix = nomes.length > 2 ? '…' : ''
    return {
      tenantName: `${nomes.length} workspaces`,
      tenantPlan: `${preview}${suffix}`,
    }
  }, [hidratadoEscopo, idsWorkspacesEscopo, workspacesStore, nomeWorkspaceAtivo, currentUser.nomeOrganizacao])

  const workspacesSidebar = workspacesStore.map(ws => ({ id: ws.id, name: ws.nome_workspace, plan: '' }))

  const isRespostaPublica = location.pathname.includes(
    '/visao-fornecedor-bid-frete-internacional/publico/',
  )
  const isAceiteAprovacaoPublico = location.pathname.includes(
    '/aceite-aprovacao-proposta-bid-frete-internacional/publico/',
  )
  const isCondicoesPlataforma = location.pathname.includes(
    '/visao-fornecedor-bid-frete-internacional/condicoes-plataforma',
  )
  const isPaginaPublicaFornecedor = isRespostaPublica || isCondicoesPlataforma || isAceiteAprovacaoPublico

  const isVisaoFornecedor =
    location.pathname.includes('visao-fornecedor-bid-frete-internacional')
    && !isPaginaPublicaFornecedor

  const productModoBadgeLabel = isVisaoFornecedor
    ? t('bidfrete.visao_fornecedor_bid_frete_internacional.identidade.badge_fornecedor', 'Visão Fornecedor')
    : undefined
  const productModoAriaLabel = isVisaoFornecedor
    ? t('bidfrete.visao_fornecedor_bid_frete_internacional.identidade.modo', 'Visão fornecedor')
    : undefined
  const productModoTooltipTitulo = isVisaoFornecedor
    ? t('bidfrete.visao_fornecedor_bid_frete_internacional.identidade.tooltip_titulo', 'Visão fornecedor')
    : undefined
  const productModoTooltipDescricao = isVisaoFornecedor
    ? t(
        'bidfrete.visao_fornecedor_bid_frete_internacional.identidade.tooltip_descricao',
        'Área para responder cotações, enviar propostas e acompanhar seu desempenho',
      )
    : undefined

  const navItems = useMemo(() => {
    const nav = isVisaoFornecedor
      ? PRODUCT_CONFIG.navigation_visao_fornecedor_bid_frete_internacional
      : PRODUCT_CONFIG.navigation
    return nav.map(item => mapNavItem(item, t))
  }, [isVisaoFornecedor, t])

  if (isPaginaPublicaFornecedor) {
    return (
      <>
        <ToastContainer />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* /bid-frete/* (splat longo) — usuário logado ou rota protegida legada */}
            <Route
              path="/bid-frete/visao-fornecedor-bid-frete-internacional/condicoes-plataforma"
              element={<VisaoFornecedorCondicoesPlataforma />}
            />
            <Route
              path="/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/condicoes-plataforma"
              element={<VisaoFornecedorCondicoesPlataforma />}
            />
            <Route
              path="visao-fornecedor-bid-frete-internacional/condicoes-plataforma"
              element={<VisaoFornecedorCondicoesPlataforma />}
            />
            <Route
              path="/bid-frete/visao-fornecedor-bid-frete-internacional/publico/:token_resposta_disparo_cotacao_bid_frete_internacional"
              element={<VisaoFornecedorResponderPublico />}
            />
            <Route
              path="/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/publico/:token_resposta_disparo_cotacao_bid_frete_internacional"
              element={<VisaoFornecedorResponderPublico />}
            />
            <Route
              path="visao-fornecedor-bid-frete-internacional/publico/:token_resposta_disparo_cotacao_bid_frete_internacional"
              element={<VisaoFornecedorResponderPublico />}
            />
            {/* /bid-frete/.../publico/* (splat = só o token) — link do e-mail sem login */}
            <Route
              path=":token_resposta_disparo_cotacao_bid_frete_internacional"
              element={<VisaoFornecedorResponderPublico />}
            />
            <Route
              path="/bid-frete/aceite-aprovacao-proposta-bid-frete-internacional/publico/:token_aceite_aprovacao_proposta_bid_frete_internacional"
              element={<AceiteAprovacaoPropostaPublico />}
            />
            <Route
              path="/bid-frete-internacional/aceite-aprovacao-proposta-bid-frete-internacional/publico/:token_aceite_aprovacao_proposta_bid_frete_internacional"
              element={<AceiteAprovacaoPropostaPublico />}
            />
            <Route
              path="aceite-aprovacao-proposta-bid-frete-internacional/publico/:token_aceite_aprovacao_proposta_bid_frete_internacional"
              element={<AceiteAprovacaoPropostaPublico />}
            />
          </Routes>
        </Suspense>
      </>
    )
  }

  return (
    <TelaProdutoComOrganizacaoOverride
      productId={PRODUCT_ID}
      productName={PRODUCT_NAME}
      productModoVariant={isVisaoFornecedor ? 'visao_fornecedor' : undefined}
      productModoBadgeLabel={productModoBadgeLabel}
      productModoAriaLabel={productModoAriaLabel}
      productModoTooltipTitulo={productModoTooltipTitulo}
      productModoTooltipDescricao={productModoTooltipDescricao}
      tenantName={escopoWorkspaces.tenantName}
      tenantPlan={escopoWorkspaces.tenantPlan}
      navItems={navItems}
      workspaces={workspacesSidebar}
      modoWorkspace="multiplo"
      workspacesEscopoIds={idsWorkspacesEscopo}
      onAlternarWorkspaceEscopo={alternarWorkspaceEscopo}
      onDefinirEscopoWorkspaces={definirEscopoWorkspaces}
      sinalAbrirMenuWorkspaces={sinalAbrirMenuWorkspaces}
      onSwitchWorkspace={(id: string) => {
        const ws = workspacesStore.find(w => w.id === id)
        sessionStorage.setItem('gravity_company_id', id)
        if (ws) sessionStorage.setItem('gravity_company_name', ws.nome_workspace)
        definirEscopoWorkspaces([id])
        window.location.reload()
      }}
      onCreateWorkspace={() => { window.location.href = urlCriarWorkspace('5181') }}
      onManageWorkspace={() => { window.location.href = urlGerenciarWorkspaces('5181') }}
      tooltipsDisabled={tooltipsDisabled}
      onToggleTooltips={toggleTooltips}
      onNavigateHub={() => { window.location.href = '/hub' }}
      onNavigateSettings={() => {
        navigate(
          isVisaoFornecedor
            ? ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.configuracoes
            : '/bid-frete/configuracoes',
        )
      }}
      localizador={{
        workspaceName:       escopoWorkspaces.tenantName,
        currentPageLabel:    pageMeta.label,
        currentPageIcon:     pageMeta.icone,
        currentPageSubtitle: pageMeta.subtitulo,
        history,
        nodes: ECOSYSTEM_NODES,
        onNavigate: (node: EcosystemNode) => {
          if (node.type === 'hub')               window.location.href = '/hub'
          else if (node.type === 'configurador') window.location.href = '/configurador'
          else if (node.type === 'produto') {
            const destino =
              node.id === 'bid-frete' || node.id === 'bid-frete-internacional'
                ? '/bid-frete/insights'
                : `/produto/${node.id}`
            window.location.href = destino
          }
        },
      }}
      usuario={{
        userName:              currentUser.name  || 'Usuário',
        userEmail:             currentUser.email || '',
        userInitials:          initials,
        userRole:              currentUser.role  ?? 'Membro',
        isAdmin,
        onNavigateAdmin:       () => { window.location.href = '/admin' },
        isLight:               currentTheme === 'light',
        onToggleTheme:         toggleTheme,
        onNavigateWorkspace:   () => { window.location.href = '/configurador' },
        onNavigateMarketPlace: () => { window.location.href = '/store' },
        onSignOut:             () => { signOut(() => { window.location.href = '/' }) },
      }}
    >
      <ToastContainer />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/"              element={<Navigate to={rotaBidFreteInternacional('insights')} replace />} />
          <Route path="visao-geral"    element={<Navigate to={rotaBidFreteInternacional('insights')} replace />} />
          <Route element={<BidFreteVisualizacaoLayout modo="cliente" />}>
            <Route path="insights"     element={bidFreteVisualizacoesClienteElement} />
            <Route path="dashboard"   element={bidFreteVisualizacoesClienteElement} />
            <Route path="lista"       element={bidFreteVisualizacoesClienteElement} />
            <Route path="kanban"      element={bidFreteVisualizacoesClienteElement} />
            <Route path="configuracoes" element={<Configuracoes />} />
          </Route>
          <Route path="lista/:id_cotacao" element={<RedirectListaDetalheCotacao />} />
          <Route path="cotacoes"       element={<RedirectCotacoesVisaoLegado />} />
          <Route path="cotacoes/nova" element={<ModalNovaCotacaoBidFreteInternacional />} />
          <Route path="cotacoes/importar" element={<CotacoesImportar />} />
          <Route path="cotacoes/:id_cotacao" element={<DetalheCotacao />} />
          <Route path="cotacoes/:id_cotacao/comparativo" element={<Comparativo />} />
          <Route path="fornecedores"   element={<Fornecedores />} />
          <Route path="fornecedores/:id_fornecedor" element={<DetalheFornecedor />} />

          <Route path="visao-fornecedor-bid-frete-internacional" element={<Navigate to="visao-fornecedor-bid-frete-internacional/dashboard" replace />} />
          <Route element={<BidFreteVisualizacaoLayout modo="fornecedor" />}>
            <Route path="visao-fornecedor-bid-frete-internacional/dashboard" element={bidFreteVisualizacoesFornecedorElement} />
            <Route path="visao-fornecedor-bid-frete-internacional/paineis-dashboard" element={bidFreteVisualizacoesFornecedorElement} />
            <Route path="visao-fornecedor-bid-frete-internacional/lista" element={bidFreteVisualizacoesFornecedorElement} />
            <Route path="visao-fornecedor-bid-frete-internacional/kanban" element={bidFreteVisualizacoesFornecedorElement} />
            <Route path="visao-fornecedor-bid-frete-internacional/configuracoes" element={<VisaoFornecedorConfiguracoes />} />
          </Route>
          <Route path="visao-fornecedor-bid-frete-internacional/cotacoes-pendentes" element={<VisaoFornecedorCotacoesPendentes />} />
          <Route path="visao-fornecedor-bid-frete-internacional/propostas" element={<VisaoFornecedorPropostas />} />
          <Route path="visao-fornecedor-bid-frete-internacional/tabelas-valor" element={<VisaoFornecedorTabelasValor />} />
          <Route path="visao-fornecedor-bid-frete-internacional/desempenho" element={<VisaoFornecedorDesempenho />} />
          <Route path="visao-fornecedor-bid-frete-internacional/responder/:id_disparo_cotacao_bid_frete_internacional" element={<VisaoFornecedorResponderCotacao />} />

          {/* Redirects legado portal → visão fornecedor */}
          <Route path="portal/*" element={<Navigate to={ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL.dashboard} replace />} />

          <Route path="*" element={<Navigate to={rotaBidFreteInternacional('insights')} replace />} />
        </Routes>
      </Suspense>
    </TelaProdutoComOrganizacaoOverride>
  )
}

/** Shell do Configurador carrega AppInner; standalone usa App com QueryClientProvider. */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export { AppInner, PRODUCT_CONFIG }
