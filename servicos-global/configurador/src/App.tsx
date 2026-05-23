import React from 'react'
import { Routes, Route, useNavigate, useParams, Navigate, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn, useAuth, useUser, AuthenticateWithRedirectCallback } from '@clerk/clerk-react'
import { useCarregarTipoUsuario } from './hooks/use-carregar-tipo-usuario'
import { ConfiguradorRoute } from './routing/guards'
import { NavigateComPrefixo } from './routing/NavigateComPrefixo'
import { useServerHealth } from './hooks/use-server-health'
import { AutenticacaoPage } from './pages/AutenticacaoPage'
import { CadastroContinuarPage } from './pages/CadastroContinuarPage'
import { RecuperarSenhaRedefinirPage } from './pages/RecuperarSenhaRedefinirPage'

// Harness E2E — dev-only, sem auth (import.meta.env.DEV === false em produção)
const E2ENotificacoesHarness = import.meta.env.DEV
  ? React.lazy(() => import('./pages/E2ENotificacoesHarness').then(m => ({ default: m.E2ENotificacoesHarness })))
  : null

// Lazy-load — Gabi é pesado e não é crítico para o primeiro render
const GabiOnboardingWidget = React.lazy(() =>
  import('./components/GabiOnboardingWidget').then(m => ({ default: m.GabiOnboardingWidget }))
)

export type Page =
  | { name: 'admin' }
  | { name: 'tenant-detail'; id_organizacao: string }
  | { name: 'hub' }
  | { name: 'store' }

import { Onboarding } from './pages/Onboarding'
import { Contato } from './pages/Contato'
import { ListaEspera } from './pages/ListaEspera'
import { TermosDeUsoPage } from './pages/TermosDeUsoPage'
import { PoliticaDePrivacidadePage } from './pages/PoliticaDePrivacidadePage'

// Lazy-load — cada grupo carrega só quando o usuário navega para a rota
const lazy = (fn: () => Promise<{ [k: string]: React.ComponentType<any> }>, name: string) =>
  React.lazy(() => fn().then(m => ({ default: (m as any)[name] })))

// SelecionarWorkspace lazy — evita carregar 30+ ícones phosphor no bundle inicial
const SelecionarWorkspace = lazy(() => import('./pages/SelecionarWorkspace'), 'SelecionarWorkspace')

const Hub = lazy(() => import('./pages/Hub'), 'Hub')
const Store = lazy(() => import('./pages/Store'), 'Store')
const OrganizacoesAdmin = lazy(() => import('./pages/OrganizacoesAdmin'), 'OrganizacoesAdmin')
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'), 'AdminLayout')
const VisaoGeralAdmin = lazy(() => import('./pages/admin/VisaoGeralAdmin'), 'VisaoGeralAdmin')
const ProdutosGravityAdmin = lazy(() => import('./pages/admin/ProdutosGravityAdmin'), 'ProdutosGravityAdmin')
const HistoricoGlobalAdmin = lazy(() => import('./pages/admin/HistoricoGlobalAdmin'), 'HistoricoGlobalAdmin')
const FinanceiroAdmin = lazy(() => import('./pages/admin/FinanceiroAdmin'), 'FinanceiroAdmin')
const TestesGeraisAdmin = lazy(() => import('./pages/admin/TestesGeraisAdmin'), 'TestesGeraisAdmin')
const ApiCockpitAdmin = lazy(() => import('./pages/admin/ApiCockpitAdmin'), 'ApiCockpitAdmin')
const ApiTokensAdmin = lazy(() => import('./pages/admin/ApiTokensAdmin'), 'ApiTokensAdmin')
const ApiWebhooksAdmin = lazy(() => import('./pages/admin/ApiWebhooksAdmin'), 'ApiWebhooksAdmin')
const ApiConsumoAdmin = lazy(() => import('./pages/admin/ApiConsumoAdmin'), 'ApiConsumoAdmin')
const MonitorLlmAdmin = lazy(() => import('./pages/admin/MonitorLlmAdmin'), 'MonitorLlmAdmin')
const UsuariosAdmin = lazy(() => import('./pages/admin/UsuariosAdmin'), 'UsuariosAdmin')
const OrganizacaoDetalheAdmin = lazy(() => import('./pages/OrganizacaoDetalheAdmin'), 'OrganizacaoDetalheAdmin')
const DeployAdmin = lazy(() => import('./pages/admin/DeployAdmin'), 'DeployAdmin')
const SegurancaAdmin = lazy(() => import('./pages/admin/SegurancaAdmin'), 'SegurancaAdmin')
const NcmIntegracaoAdmin = lazy(() => import('./pages/admin/NcmIntegracaoAdmin'), 'NcmIntegracaoAdmin')
const CertificadosAdmin = lazy(() => import('./pages/admin/CertificadosAdmin'), 'CertificadosAdmin')
const CadastrosGlobaisAdmin = React.lazy(() => import('./pages/admin/CadastrosGlobaisAdmin'))
const EmpresasEParceirosAdmin = lazy(() => import('./pages/admin/EmpresasEParceirosAdmin'), 'EmpresasEParceirosAdmin')
const WorkspaceLayout = lazy(() => import('./pages/configurador/WorkspaceLayout'), 'WorkspaceLayout')
const Organizacao = lazy(() => import('./pages/configurador/Organizacao'), 'Organizacao')
const Workspaces = lazy(() => import('./pages/configurador/Workspaces'), 'Workspaces')
const Usuarios = lazy(() => import('./pages/configurador/Usuarios'), 'Usuarios')
const EmpresasEParceiros = lazy(() => import('./pages/configurador/EmpresasEParceiros'), 'EmpresasEParceiros')
const Assinaturas = lazy(() => import('./pages/configurador/Assinaturas'), 'Assinaturas')
const FinanceiroWorkspace = lazy(() => import('./pages/configurador/FinanceiroWorkspace'), 'FinanceiroWorkspace')
const ApiCockpit = lazy(() => import('./pages/configurador/ApiCockpit'), 'ApiCockpit')
const ApiTokens = lazy(() => import('./pages/configurador/ApiTokens'), 'ApiTokens')
const ApiWebhooks = lazy(() => import('./pages/configurador/ApiWebhooks'), 'ApiWebhooks')
const ApiConsumo = lazy(() => import('./pages/configurador/ApiConsumo'), 'ApiConsumo')
const ConectorCargoWise = lazy(() => import('./pages/configurador/ConectorCargoWise'), 'ConectorCargoWise')
const TaxasMoedaPage = lazy(() => import('./pages/configurador/TaxasMoeda'), 'TaxasMoeda')
const HistoricoOrganizacao = lazy(() => import('./pages/configurador/HistoricoOrganizacao'), 'HistoricoOrganizacao')

// Core — tela pós-seleção de workspace (menu lateral + conteúdo)
const Core = lazy(() => import('./pages/Core'), 'Core')
// HistoricoWorkspace removido em 2026-05-07 — era duplicação do <HistoricoOrganizacao>
// (mesma tabela HistoricoLog, escopo Master/Standard/Fornecedor). Tela canonica do
// cliente fica em /workspace/historico-organizacao. Tela admin segue em /admin/historico-global.

// Lazy-load dos produtos (carregados sob demanda quando o usuário navega)
const SimulaCustoApp = React.lazy(() => import('../../produto/simula-custo/client/src/App'))
const ProcessoApp = React.lazy(() => import('../../produto/processo/client/src/App'))
const BidFreteApp = React.lazy(() => import('../../produto/bid-frete-internacional/client/src/App'))
const BidCambioApp = React.lazy(() => import('../../produto/bid-cambio/client/src/App'))
const PedidoApp = React.lazy(() => import('../../produto/pedido/client/src/App'))

import { GravityLoader } from '@nucleo/gravity-loader-global'
import { ROTAS_PEDIDO, BASE_ROTA_PEDIDO } from '../../produto/pedido/client/src/shared/rotas'

/**
 * Porteiro da entrada do produto Pedido.
 *
 * Problema historico: NavLinks resolvem `to="pedidos/kanban"` relativo a URL atual em vez
 * do base `/produto/pedido`, produzindo paths acumulados como:
 *   - /produto/pedido/pedidos/pedidos/kanban  (de Lista -> Kanban)
 *   - /produto/pedido/pedidos/dashboard/pedidos/kanban  (de Dashboard -> Kanban)
 *
 * Solucao: validar o sufixo (apos o base) contra ROTAS_PEDIDO. Se invalido, extrair o sufixo
 * valido mais curto (= destino pretendido pelo usuario) e redirecionar. A lista de rotas
 * validas vive em produto/pedido/client/src/shared/rotas.ts (SSOT).
 */
const ROTAS_VALIDAS_PEDIDO = new Set<string>(ROTAS_PEDIDO.estaticas)

function GuardaRotaPedido() {
  const location = useLocation()

  const sufixo = location.pathname.startsWith(BASE_ROTA_PEDIDO + '/')
    ? location.pathname.slice(BASE_ROTA_PEDIDO.length + 1)
    : ''

  const valido =
    ROTAS_VALIDAS_PEDIDO.has(sufixo) ||
    ROTAS_PEDIDO.dinamicas.some(rx => rx.test(sufixo))

  if (!valido) {
    const segmentos = sufixo.split('/').filter(Boolean)
    let destino = 'pedidos'
    for (let len = 1; len <= Math.min(segmentos.length, 3); len++) {
      const candidato = segmentos.slice(-len).join('/')
      if (ROTAS_VALIDAS_PEDIDO.has(candidato)) { destino = candidato; break }
    }
    return <Navigate to={`${BASE_ROTA_PEDIDO}/${destino}`} replace />
  }

  return <React.Suspense fallback={<ProductLoading />}><PedidoApp /></React.Suspense>
}

const ProductLoading = () => (
  <div style={{ position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-body)', zIndex: 50 }}>
    <GravityLoader texto="Carregando" tamanho="lg" />
  </div>
)

class ProductErrorBoundary extends React.Component<
  { children: React.ReactNode; name: string },
  { error: Error | null }
> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', color: '#f87171', background: '#1e293b', borderRadius: '8px', margin: '2rem' }}>
          <h2>Erro ao carregar: {this.props.name}</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem', marginTop: '1rem' }}>
            {this.state.error.message}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function OrganizacaoDetalheWrapper() {
  const { id_organizacao } = useParams()
  const navigate = useNavigate()
  return <OrganizacaoDetalheAdmin id_organizacao={id_organizacao!} onBack={() => navigate('/admin/organizacoes')} />
}

/** Rota raiz: se logado → /hub, se não → /login (URL canônica) */
function RootRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const [clerkTimeout, setClerkTimeout] = React.useState(false)

  React.useEffect(() => {
    if (isLoaded) return
    const timer = setTimeout(() => setClerkTimeout(true), 1500)
    return () => clearTimeout(timer)
  }, [isLoaded])

  // Se Clerk não carregou após timeout (ex: cookies bloqueados em anônima), mostra login direto
  if (!isLoaded && !clerkTimeout) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
        <GravityLoader texto="Carregando" tamanho="lg" />
      </div>
    )
  }

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <Navigate to="/login" replace />
  )
}

/** Guarda para rotas públicas (Login/Cadastro). Se logado, expulsa para o sistema. */
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
        <GravityLoader texto="Carregando" tamanho="lg" />
      </div>
    )
  }

  return isSignedIn ? (
    <Navigate to="/hub" replace />
  ) : (
    <>{children}</>
  )
}

/** Wrapper para rotas que exigem autenticação — otimizado para evitar round-trip ao Clerk */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()

  // Enquanto Clerk não carregou, mostra loader (evita flash branco)
  if (!isLoaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <GravityLoader tamanho="lg" />
    </div>
  )

  // Se não autenticado, redireciona para /login local (sem round-trip ao Clerk hosted)
  if (!isSignedIn) return <Navigate to="/login" replace />

  return <>{children}</>
}

/** Wrapper para rotas exclusivas de administradores Gravity (SUPER_ADMIN ou ADMIN).
 *  Role lido do banco via /api/v1/me — não depende de Clerk publicMetadata. */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth()
  const { pronto: isReady, gravityAdmin: isGravityAdmin } = useCarregarTipoUsuario()

  if (!isLoaded) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <GravityLoader tamanho="lg" />
    </div>
  )
  if (!isSignedIn) return <Navigate to="/login" replace />
  if (!isReady) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-body)' }}>
      <GravityLoader texto="Carregando" tamanho="lg" />
    </div>
  )

  if (!isGravityAdmin) return <Navigate to="/hub" replace />

  return <>{children}</>
}

/** Monitor de saúde dos servidores de dev — dispara toast quando algum cai ou volta */
function ServerHealthMonitor() {
  useServerHealth()
  return null
}

/** Gabi IA global — aparece em todas as telas autenticadas (lazy-loaded) */
function GabiGlobal() {
  const { user } = useUser()
  const location = useLocation()

  return (
    <React.Suspense fallback={null}>
      <GabiOnboardingWidget
        userName={user?.firstName ?? 'Usuario'}
        pathname={location.pathname}
      />
    </React.Suspense>
  )
}

export default function App() {
  const routerNavigate = useNavigate()

  const adminNavigate = (next: Page) => {
    if (next.name === 'admin') routerNavigate('/admin/organizacoes')
    if (next.name === 'tenant-detail') routerNavigate(`/admin/organizacoes/${next.id_organizacao}`)
  }

  return (
    <div style={{ height: '100%', background: 'var(--bg-body-dark)' }}>
      <ServerHealthMonitor />
      <Routes>
        {/* Tela de login — clientes existentes */}
        <Route path="/" element={<RootRedirect />} />
        {/* /login/sso-callback — intercepta retorno do OAuth (Google) do form custom de SignIn.
            DEVE preceder o catch-all /login/* para nao ser engolida pela AutenticacaoPage. */}
        <Route path="/login/sso-callback" element={
          <AuthenticateWithRedirectCallback
            signInFallbackRedirectUrl="/hub"
            signUpFallbackRedirectUrl="/trial"
          />
        } />
        <Route path="/login/*" element={<PublicRoute><AutenticacaoPage /></PublicRoute>} />
        {/* /cadastro/continuar — fluxo de convite Clerk customizado (precede o catch-all /cadastro/*) */}
        <Route path="/cadastro/continuar" element={<PublicRoute><CadastroContinuarPage /></PublicRoute>} />
        {/* /cadastro/sso-callback — intercepta retorno do OAuth (Google) do <SignUp> embutido.
            Sem esta rota, o Clerk joga o usuario com 'missing_requirements' no Account Portal
            hospedado em *.accounts.dev (tela branca). continueSignUpUrl manda o usuario para
            a CadastroContinuarPage Gravity-styled quando faltam campos (ex: senha pos-Google). */}
        <Route path="/cadastro/sso-callback" element={
          <AuthenticateWithRedirectCallback
            continueSignUpUrl="/cadastro/continuar"
            signUpFallbackRedirectUrl="/trial"
            signInFallbackRedirectUrl="/hub"
          />
        } />
        <Route path="/cadastro/*" element={<PublicRoute><AutenticacaoPage /></PublicRoute>} />
        {/* /recuperar-senha/redefinir — etapa 2 do reset (codigo + nova senha).
            Precede o catch-all /recuperar-senha/* para nao ser engolida pela AutenticacaoPage. */}
        <Route path="/recuperar-senha/redefinir" element={<PublicRoute><RecuperarSenhaRedefinirPage /></PublicRoute>} />
        <Route path="/recuperar-senha/*" element={<PublicRoute><AutenticacaoPage /></PublicRoute>} />

        {/* Onboarding — novos clientes vindos do Marketplace */}
        <Route path="/trial" element={<Onboarding />} />
        <Route path="/contato" element={<Contato />} />
        <Route path="/waitlist" element={<ListaEspera />} />
        <Route path="/termos-de-uso" element={<TermosDeUsoPage />} />
        <Route path="/politica-de-privacidade" element={<PoliticaDePrivacidadePage />} />

        {/* Redirect legado — Clerk antigo redirecionava para /selecionar-workspace */}
        <Route path="/selecionar-workspace" element={<Navigate to="/hub" replace />} />

        {/* Área autenticada */}
        <Route path="/hub" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><SelecionarWorkspace /></React.Suspense></ProtectedRoute>} />
        <Route path="/store" element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Store /></React.Suspense></ProtectedRoute>} />

        {/* Core — workspace selecionado */}
        {/* Index → Hub standalone (sem sidebar); sub-rotas → Core layout com sidebar */}
        <Route path="/core">
          <Route index element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Hub /></React.Suspense></ProtectedRoute>} />
          <Route element={<ProtectedRoute><React.Suspense fallback={<ProductLoading />}><Core /></React.Suspense></ProtectedRoute>}>
            <Route path="atividades" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Atividades — em desenvolvimento</div>} />
            <Route path="email" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Email — em desenvolvimento</div>} />
            <Route path="whatsapp" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>WhatsApp — em desenvolvimento</div>} />
            <Route path="notificacoes" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Notificações — em desenvolvimento</div>} />
            {/* /core/historico removido em 2026-05-07 — ver HistoricoOrganizacao em /workspace/historico-organizacao */}
            <Route path="conector-erp" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Conector ERP — em desenvolvimento</div>} />
            <Route path="configuracoes" element={<div style={{ padding: '2rem', color: 'var(--ws-muted)' }}>Configurações — em desenvolvimento</div>} />
          </Route>
        </Route>

        {/* Produtos — rotas canônicas (sem prefixo /produto/, ver
            documentos-tecnicos/arquitetura/rotas-convencao.md) */}
        <Route path="/simula-custo/*" element={<ProtectedRoute><ProductErrorBoundary name="SimulaCusto"><React.Suspense fallback={<ProductLoading />}><SimulaCustoApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/processo/*" element={<ProtectedRoute><ProductErrorBoundary name="Processo"><React.Suspense fallback={<ProductLoading />}><ProcessoApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/bid-frete/*" element={<ProtectedRoute><ProductErrorBoundary name="BID Frete"><React.Suspense fallback={<ProductLoading />}><BidFreteApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/bid-frete-internacional/*" element={<ProtectedRoute><ProductErrorBoundary name="BID Frete Internacional"><React.Suspense fallback={<ProductLoading />}><BidFreteApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/bid-cambio/*" element={<ProtectedRoute><ProductErrorBoundary name="BID Câmbio"><React.Suspense fallback={<ProductLoading />}><BidCambioApp /></React.Suspense></ProductErrorBoundary></ProtectedRoute>} />
        <Route path="/pedido/*" element={<ProtectedRoute><ProductErrorBoundary name="Pedido"><GuardaRotaPedido /></ProductErrorBoundary></ProtectedRoute>} />

        {/* Redirects legacy (90 dias após merge — Pendência #5) */}
        <Route path="/produto/simula-custo/*" element={<NavigateComPrefixo de="/produto/simula-custo" para="/simula-custo" />} />
        <Route path="/produto/processo/*" element={<NavigateComPrefixo de="/produto/processo" para="/processo" />} />
        <Route path="/produto/bid-frete/*" element={<NavigateComPrefixo de="/produto/bid-frete" para="/bid-frete" />} />
        <Route path="/produto/bid-cambio/*" element={<NavigateComPrefixo de="/produto/bid-cambio" para="/bid-cambio" />} />
        <Route path="/produto/pedido/*" element={<NavigateComPrefixo de="/produto/pedido" para="/pedido" />} />

        {/* Admin — área interna restrita — exclusivo gravity_admin */}
        <Route path="/admin" element={<AdminRoute><React.Suspense fallback={<ProductLoading />}><AdminLayout /></React.Suspense></AdminRoute>}>
          <Route index element={<Navigate to="/admin/visao-geral" replace />} />
          <Route path="visao-geral" element={<React.Suspense fallback={<ProductLoading />}><VisaoGeralAdmin /></React.Suspense>} />
          <Route path="usuarios" element={<React.Suspense fallback={<ProductLoading />}><UsuariosAdmin /></React.Suspense>} />
          <Route path="produtos-gravity" element={<React.Suspense fallback={<ProductLoading />}><ProdutosGravityAdmin /></React.Suspense>} />
          <Route path="financeiro" element={<React.Suspense fallback={<ProductLoading />}><FinanceiroAdmin /></React.Suspense>} />
          <Route path="historico-global" element={<React.Suspense fallback={<ProductLoading />}><HistoricoGlobalAdmin /></React.Suspense>} />
          <Route path="deploy" element={<React.Suspense fallback={<ProductLoading />}><DeployAdmin /></React.Suspense>} />
          <Route path="testes-gerais" element={<React.Suspense fallback={<ProductLoading />}><TestesGeraisAdmin /></React.Suspense>} />
          <Route path="api-cockpit" element={<React.Suspense fallback={<ProductLoading />}><ApiCockpitAdmin /></React.Suspense>} />
          <Route path="api-cockpit/logs" element={<Navigate to="/admin/api-cockpit/consumo" replace />} />
          <Route path="api-cockpit/tokens" element={<React.Suspense fallback={<ProductLoading />}><ApiTokensAdmin /></React.Suspense>} />
          <Route path="api-cockpit/webhooks" element={<React.Suspense fallback={<ProductLoading />}><ApiWebhooksAdmin /></React.Suspense>} />
          <Route path="api-cockpit/consumo" element={<React.Suspense fallback={<ProductLoading />}><ApiConsumoAdmin /></React.Suspense>} />
          <Route path="api-cockpit/monitor-llm" element={<React.Suspense fallback={<ProductLoading />}><MonitorLlmAdmin /></React.Suspense>} />
          <Route path="seguranca" element={<React.Suspense fallback={<ProductLoading />}><SegurancaAdmin /></React.Suspense>} />
          <Route path="ncm-integracao" element={<React.Suspense fallback={<ProductLoading />}><NcmIntegracaoAdmin /></React.Suspense>} />
          <Route path="certificados-digitais" element={<React.Suspense fallback={<ProductLoading />}><CertificadosAdmin /></React.Suspense>} />
          <Route path="cadastros-globais" element={<React.Suspense fallback={<ProductLoading />}><CadastrosGlobaisAdmin /></React.Suspense>} />
          <Route path="empresas-e-parceiros" element={<React.Suspense fallback={<ProductLoading />}><EmpresasEParceirosAdmin /></React.Suspense>} />
          <Route path="taxas-moeda" element={<React.Suspense fallback={<ProductLoading />}><TaxasMoedaPage /></React.Suspense>} />
          <Route path="organizacoes" element={<React.Suspense fallback={<ProductLoading />}><OrganizacoesAdmin navigate={adminNavigate} /></React.Suspense>} />
          <Route path="organizacoes/:id_organizacao" element={<React.Suspense fallback={<ProductLoading />}><OrganizacaoDetalheWrapper /></React.Suspense>} />
        </Route>

        {/* Configurador — área da org do cliente, restrita a MASTER/SUPER_ADMIN/ADMIN
            (matriz Cadeia 1 em src/routing/route-policy.ts). PADRAO/FORNECEDOR
            redirecionados para /hub. ADMIN entra read-only — mutações são
            bloqueadas no backend por requireConfiguradorMutation. */}
        <Route path="/configurador" element={<ConfiguradorRoute><React.Suspense fallback={<ProductLoading />}><WorkspaceLayout /></React.Suspense></ConfiguradorRoute>}>
          <Route index element={<Navigate to="/configurador/organizacao" replace />} />
          <Route path="organizacao" element={<React.Suspense fallback={<ProductLoading />}><Organizacao /></React.Suspense>} />
          <Route path="workspaces" element={<React.Suspense fallback={<ProductLoading />}><Workspaces /></React.Suspense>} />
          <Route path="usuarios" element={<React.Suspense fallback={<ProductLoading />}><Usuarios /></React.Suspense>} />
          <Route path="empresas-e-parceiros" element={<React.Suspense fallback={<ProductLoading />}><EmpresasEParceiros /></React.Suspense>} />
          <Route path="assinaturas" element={<React.Suspense fallback={<ProductLoading />}><Assinaturas /></React.Suspense>} />
          <Route path="financeiro" element={<React.Suspense fallback={<ProductLoading />}><FinanceiroWorkspace /></React.Suspense>} />
          <Route path="api-cockpit" element={<React.Suspense fallback={<ProductLoading />}><ApiCockpit /></React.Suspense>} />
          <Route path="api-cockpit/tokens" element={<React.Suspense fallback={<ProductLoading />}><ApiTokens /></React.Suspense>} />
          <Route path="api-cockpit/webhooks" element={<React.Suspense fallback={<ProductLoading />}><ApiWebhooks /></React.Suspense>} />
          <Route path="api-cockpit/consumo" element={<React.Suspense fallback={<ProductLoading />}><ApiConsumo /></React.Suspense>} />
          <Route path="conector-cargowise" element={<React.Suspense fallback={<ProductLoading />}><ConectorCargoWise /></React.Suspense>} />
          <Route path="taxas-moeda" element={<React.Suspense fallback={<ProductLoading />}><TaxasMoedaPage /></React.Suspense>} />
          <Route path="taxas-cambio" element={<Navigate to="/configurador/taxas-moeda" replace />} />
          <Route path="taxa-cambio" element={<Navigate to="/configurador/taxas-moeda" replace />} />
          <Route path="historico-organizacao" element={<React.Suspense fallback={<ProductLoading />}><HistoricoOrganizacao /></React.Suspense>} />
        </Route>

        {/* Redirect legacy /workspace/* → /configurador/* (90 dias — Pendência #5) */}
        <Route path="/workspace" element={<Navigate to="/configurador" replace />} />
        <Route path="/workspace/*" element={<NavigateComPrefixo de="/workspace" para="/configurador" />} />

        {/* Harness E2E — dev-only, sem autenticação */}
        {E2ENotificacoesHarness && (
          <Route
            path="/e2e-notificacoes"
            element={
              <React.Suspense fallback={null}>
                <E2ENotificacoesHarness />
              </React.Suspense>
            }
          />
        )}

        {/* 404 — rota nao encontrada */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', padding: '6rem 1.5rem' }}>
            <p style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--bg-elevated)', lineHeight: 1 }}>404</p>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>Página não encontrada</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>A página que você procura não existe ou foi movida.</p>
            <a href="/" style={{ color: 'var(--accent)' }}>Voltar ao início</a>
          </div>
        } />
      </Routes>

      {/* Gabi IA — presente em todas as telas pos-login */}
      <SignedIn>
        <GabiGlobal />
      </SignedIn>
    </div>
  )
}
