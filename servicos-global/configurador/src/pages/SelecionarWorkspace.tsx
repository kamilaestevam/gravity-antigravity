import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { z } from 'zod'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { useTranslation } from 'react-i18next'
import { useClerk, useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  House,
  SquaresFour,
  ChartLine,
  UsersThree,
  GearSix,
  Plus,
  Check,
  ArrowRight,
  Star,
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
  CaretLeft,
  CaretRight,
  RocketLaunch,
  CurrencyDollar,
  Calculator,
  ClipboardText,
  Fire,
  Info,
} from '@phosphor-icons/react'
import { type NavItem } from '@nucleo/menu-lateral-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { corOficialProdutoDim, corOficialProdutoGravity, iconeOficialProdutoGravity } from '@nucleo/logo-produtos'
import { CampoLocalizarExpandidoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes } from '@nucleo/localizador-global'
import { SeletorIdiomaGlobal } from '@nucleo/language-switcher-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { AvisoInternoGlobal, type AvisoInterno } from '@nucleo/mensageria-global'
import { useCarregarTipoUsuario } from '../hooks/use-carregar-tipo-usuario'
import { mapRole } from '../types/niveis-acesso'
import { podeMutarConfigurador } from '../routing/route-policy'
import {
  ToastContainer,
  useShellStore,
  useOrganizacaoOverride,
  useMeSync,
  useShellBodyClasses,
  useLoadAllowedProducts,
} from '@gravity/shell'
import { ModalTrocarOrganizacao } from '../components/modal-trocar-organizacao'
import { ModalOverlay } from '@nucleo/modal-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  BarrasMeterProdutosContratadosHub,
  GradeProdutosContratadosHub,
} from '../components/grade-produtos-contratados-hub'
import { PreferenciasWorkspacesPorProdutoHub } from '../components/preferencias-workspaces-por-produto-hub'
import { CardVitrineStoreHub } from '../components/card-vitrine-store-hub'
import '../../../../nucleo-global/Campos/campo-geral-global/src/campo-geral.css'
import {
  escopoPadraoTodosWorkspaces,
  filtrarIdsEscopoHubValidos,
  lerEscopoHubProdutoLocal,
} from '../utils/escopo-workspaces-produto-hub'
import {
  buscarMapaNomesWorkspacesOrg,
  escopoPedidoDivergeDoWorkspace,
  filtrarIdsEscopoWorkspacesValidos,
  obterPreferenciaEscopoHubPedido,
  resolverNomesWorkspacesEscopo,
  salvarSuprimirAvisoEscopoHubPedido,
} from '../utils/pedido-escopo-hub'
import './configurador/workspace.css'
import './selecionar-workspace.css'
import './hub-unificado.css'
import './hub-store.css'
import './hub.css'

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

/* ── Tipo de insight GABI (alinhado com HubInsight do backend) ── */
interface GabiInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: string
  stat?: { label: string; valor: string }
  textoLink?: string
  rota?: string
  score?: number
  produto?: string
}

const gabiInsightItemSchema = z.object({
  id: z.string(),
  variante: z.enum(['default', 'warn']).optional(),
  tag: z.string(),
  texto: z.string(),
  stat: z.object({ label: z.string(), valor: z.string() }).optional(),
  textoLink: z.string().optional(),
  rota: z.string().optional(),
  score: z.number().optional(),
  produto: z.string().optional(),
})

const gabiInsightsResponseSchema = z.object({
  insights: z.array(gabiInsightItemSchema),
})

const GABI_INSIGHT_FALLBACK: GabiInsight = {
  id: 'fallback',
  variante: 'default',
  tag: 'GABI AI · Pronta',
  texto: 'Sua assistente está pronta. Ative produtos para receber insights em tempo real das suas operações COMEX.',
  textoLink: 'Explorar produtos',
  rota: '/store',
}

const GABI_INSIGHTS_POR_PAGINA = 3

/**
 * Layout GABI no HUB — experimentos 0–4.
 * 0 = original (caixa + cards mesmo tom). "Voltar para original" → 0.
 * 1 = sem caixa · 2 = bandeja + cards elevados · 3 = bandeja GABI · 4 = variantes conteúdo
 */
const HUB_GABI_LAYOUT_EXPERIMENTO: 0 | 1 | 2 | 3 | 4 = 1

function classePainelGabiLayout(): string {
  return HUB_GABI_LAYOUT_EXPERIMENTO === 0
    ? ''
    : ` sw-hub-gabi-layout--${HUB_GABI_LAYOUT_EXPERIMENTO}`
}

function classeInsightGabiCard(insight: GabiInsight): string {
  const classes = ['sw-hub-gabi-insight-card']
  if (insight.variante === 'warn') classes.push('sw-hub-gabi-insight-card--warn')
  if (HUB_GABI_LAYOUT_EXPERIMENTO === 4) {
    const tagLc = insight.tag.toLowerCase()
    const descoberta =
      tagLc.includes('sabia que você pode') || tagLc.startsWith('dica ·')
    classes.push(descoberta ? 'sw-hub-gabi-insight-card--descoberta' : 'sw-hub-gabi-insight-card--operacao')
  }
  return classes.join(' ')
}

/** Sempre 3 slots — última página preenche com wrap (evita 1 card + 2 colunas vazias). */
function montarJanelaInsightsGabi(insights: GabiInsight[], indicePagina: number): GabiInsight[] {
  const total = insights.length
  if (total === 0) return []

  const inicio = indicePagina * GABI_INSIGHTS_POR_PAGINA
  return Array.from({ length: GABI_INSIGHTS_POR_PAGINA }, (_, slot) => {
    return insights[(inicio + slot) % total]
  })
}

interface WorkspaceFromHub {
  id_workspace: string
  nome_workspace: string
  cnpj_workspace?: string | null
  status_workspace: string
  quantidade_usuarios_workspace?: number
  _count?: { vinculos_workspace: number }
}

/* ── Paleta de gradientes para workspace cards ── */
const WORKSPACE_GRADIENTS = [
  { from: '#4F63FF', to: '#1ED8C8' },
  { from: '#F6A832', to: '#F04E42' },
  { from: '#1ED8C8', to: '#20C96A' },
  { from: '#A855F7', to: '#6366F1' },
  { from: '#EC4899', to: '#F43F5E' },
]

/* Mock workspaces removido — dados sempre vêm do backend (/api/v1/hub/init) */

/* ── Atalhos (estáticos — navegação interna) ── */
const ATALHOS: Atalho[] = [
  { id: 'a1', nome: 'Configurador', descricao: 'Workspace, CNPJ, regras fiscais e usuários', iconBg: 'var(--sw-amber-dim)', iconColor: 'var(--sw-amber)', icon: 'gear', admin: true, rota: '/configurador/organizacao' },
  { id: 'a2', nome: 'Store de Módulos', descricao: 'Ative, desative e gerencie produtos', iconBg: 'var(--sw-accent-dim)', iconColor: 'var(--sw-accent-2)', icon: 'squares', rota: '/configurador/assinaturas' },
  { id: 'a3', nome: 'Relatórios', descricao: 'Exportações, histórico e dashboards', iconBg: 'var(--sw-green-dim)', iconColor: 'var(--sw-green)', icon: 'chart', rota: '/configurador/financeiro' },
  { id: 'a4', nome: 'Equipe', descricao: 'Convites, papéis e permissões', iconBg: 'var(--sw-surface-3)', iconColor: 'var(--sw-text-2)', icon: 'users', admin: true, rota: '/configurador/usuarios' },
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
  'simula-custo': { nome: 'SimulaCusto', rota: '/simula-custo' },
  'bid-frete': { nome: 'BID Frete Internacional', rota: '/bid-frete' },
  'bid-cambio': { nome: 'BID Câmbio', rota: '/bid-cambio' },
  'smart-read': { nome: 'Smart Read', rota: '/produto/smart-read' },
  'processo': { nome: 'Processo', rota: '/processo' },
}

const PRODUCT_ICON_SLUGS = [
  'nf-importacao',
  'nf-import',
  'pedido',
  'processo',
  'bid-cambio',
  'bid-frete',
  'bid-frete-internacional',
  'simula-custo',
  'smart-read',
] as const

function buildProdutoIconVisual(slug: string): { icon: React.ReactElement; color: string; bg: string } {
  return {
    icon: iconeOficialProdutoGravity(slug, 18) as React.ReactElement,
    color: corOficialProdutoGravity(slug),
    bg: corOficialProdutoDim(slug),
  }
}

/* ── Slugs conhecidos → ícone/cor SSOT (mesmo padrão do Hub) ── */
const PRODUCT_ICON_MAP: Record<string, { icon: React.ReactElement; color: string; bg: string }> =
  Object.fromEntries(PRODUCT_ICON_SLUGS.map((slug) => [slug, buildProdutoIconVisual(slug)]))

/* ── Mapa de slug/product_key → chave de tradução do nome ── */
const PRODUCT_NAME_KEYS: Record<string, string> = {
  'bid-frete':     'store.prod_bid_frete_nome',
  'bid-cambio':    'store.prod_bid_cambio_nome',
  'nf-importacao': 'store.prod_nf_importacao_nome',
  'nf-import':     'store.prod_nf_importacao_nome',
  'lpco':          'store.prod_lpco_nome',
  'pedido':        'store.prod_pedido_nome',
  'simula-custo':  'store.prod_simula_custo_nome',
  'smart-read':    'store.prod_smart_read_nome',
}

/* ── Mapa de slug/product_key → chave de tradução da descrição ── */
const PRODUCT_DESC_KEYS: Record<string, string> = {
  'bid-frete':     'store.prod_bid_frete_desc',
  'bid-cambio':    'store.prod_bid_cambio_desc',
  'nf-importacao': 'store.prod_nf_importacao_desc',
  'nf-import':     'store.prod_nf_importacao_desc',
  'lpco':          'store.prod_lpco_desc',
  'pedido':        'store.prod_pedido_desc',
  'simula-custo':  'store.prod_simula_custo_desc',
  'smart-read':    'store.prod_smart_read_desc',
}

function getProdutoIcon(slug: string): { icon: React.ReactElement; color: string; bg: string } {
  return PRODUCT_ICON_MAP[slug] ?? { icon: <Star size={18} weight="regular" />, color: 'var(--sw-accent-2)', bg: 'var(--sw-accent-dim)' }
}

function getHubGreeting(t: (key: string, fallback?: string | Record<string, unknown>) => string): string {
  const h = new Date().getHours()
  if (h < 12) return t('hub.bom_dia', 'Bom dia')
  if (h < 18) return t('hub.boa_tarde', 'Boa tarde')
  return t('hub.boa_noite', 'Boa noite')
}

function formatHubDate(locale: string): string {
  return new Date().toLocaleDateString(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface HubProcessoOperacaoResumo {
  id: string
  nome: string
  detalhe: string
  badge: string
  badgeVariant: 'embarque' | 'desembaraco'
}

function getHubProcessosOperacaoMock(
  t: (key: string, fallback?: string) => string,
): HubProcessoOperacaoResumo[] {
  return [
    {
      id: 'hub-op-1',
      nome: 'Acme Importações · Shanghai Electronics',
      detalhe: 'IMP-2026/0150 · US$ 108.050 · Marítima',
      badge: t('hub.mock_badge_embarque', 'Embarque').toUpperCase(),
      badgeVariant: 'embarque',
    },
    {
      id: 'hub-op-2',
      nome: 'Acme Importações · Korea Tech Ltd.',
      detalhe: 'IMP-2026/0149 · US$ 54.200 · Aérea',
      badge: t('hub.mock_badge_desembaraco', 'Desembaraço').toUpperCase(),
      badgeVariant: 'desembaraco',
    },
  ]
}

function LegendaEscopoWorkspacesHub({ nomes }: { nomes: readonly string[] }) {
  const { t } = useTranslation()

  if (nomes.length === 0) return null

  return (
    <div className="sw-escopo-ws-legenda-wrap">
      <div className="sw-escopo-ws-legenda-titulo">
        {t('sw.modal_escopo_pedido_legenda_titulo', { count: nomes.length })}
      </div>
      <ul className="sw-escopo-ws-legenda">
        {nomes.map((nome, indice) => (
          <li key={`${indice}-${nome}`} className="sw-escopo-ws-legenda-item">
            <span className="sw-escopo-ws-legenda-num" aria-hidden="true">{indice + 1}</span>
            <span className="sw-escopo-ws-legenda-nome">{nome}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — SelecionarWorkspace (Dashboard Core)
══════════════════════════════════════════════════════ */
export function SelecionarWorkspace() {
  const { t, i18n } = useTranslation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const {
    addNotification,
    currentUser,
    toggleTooltips,
    tooltipsDisabled,
    currentTheme,
    toggleTheme,
  } = useShellStore()
  const isLight = currentTheme === 'light'
  const [searchParams] = useSearchParams()
  useShellBodyClasses()
  const [modalSemProdutos, setModalSemProdutos] = useState(false)
  const [modalEscopoPedidoAberto, setModalEscopoPedidoAberto] = useState(false)
  const [workspaceEntradaPendente, setWorkspaceEntradaPendente] = useState<Workspace | null>(null)
  const [escopoPedidoNomes, setEscopoPedidoNomes] = useState<string[]>([])
  const [naoExibirAvisoEscopo, setNaoExibirAvisoEscopo] = useState(false)

  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [entrando, setEntrando] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])
  const [produtosContratados, setProdutosContratados] = useState<ProdutoContratado[]>([])
  const [catalogoProdutos, setCatalogoProdutos] = useState<ProdutoCatalogo[]>([])
  // Workspace preferido unificado: 1 único workspace por usuário, persistido no backend.
  // Dispara skip pós-login (redireciona direto para /core no próximo acesso).
  // Fornecedor (SUPPLIER) nunca recebe valor aqui — backend força null.
  const [preferredId, setPreferredId] = useState<string | null>(null)
  const [escoposPorProduto, setEscoposPorProduto] = useState<Record<string, string[]>>({})

  /* ── GABI insights ── */
  const [gabiInsights, setGabiInsights] = useState<GabiInsight[]>([])
  const [gabiLoading, setGabiLoading] = useState(true)
  const gabiFetchSeq = useRef(0)
  const gabiCarregouAlgumaVez = useRef(false)

  const [gabiPaused, setGabiPaused] = useState(false)
  const [gabiIndice, setGabiIndice] = useState(0)

  /* ── Mensageria (sino) — paridade sw-topbar ── */
  const [avisos, setAvisos] = useState<AvisoInterno[]>([])
  const handleMarcarLido = useCallback(
    (id: string) => setAvisos(prev => prev.map(a => (a.id === id ? { ...a, lido: true } : a))),
    [],
  )
  const handleMarcarTodosLidos = useCallback(
    () => setAvisos(prev => prev.map(a => ({ ...a, lido: true }))),
    [],
  )

  const selectedWs = workspaces.find(w => w.id === selectedId)

  // Role canônico vem do banco (via /api/v1/me) — Mandamento 01: Clerk só autentica.
  const { gravityAdmin: isGravityAdmin, tipoUsuario: dbRole, pronto: roleReady, idOrganizacao, idUsuarioPrisma } = useCarregarTipoUsuario()
  useMeSync()
  useLoadAllowedProducts()
  const { podeAtivarOverride, overrideAtivo, limparOverride } = useOrganizacaoOverride()
  const companyName = sessionStorage.getItem('gravity_company_name') || selectedWs?.nome || 'Workspace'

  const userName = currentUser.name || user?.fullName || user?.firstName || t('shell.usuario_padrao')
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = currentUser.email || user?.primaryEmailAddress?.emailAddress || t('shell.email_padrao')
  const userRoleLabel = mapRole(dbRole)

  // ── Localizador ──────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('hub')
  useEffect(() => {
    locAddEntry({ productId: 'hub', productLabel: 'Hub', productColor: '#818cf8', pageLabel: 'Hub', pagePath: '/hub' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [modalTrocarOrgAberto, setModalTrocarOrgAberto] = useState(false)
  const hubEcosystemNodes = buildEcosystemNodes({
    currentProductId: 'hub',
    includeAdmin: isGravityAdmin,
    includeStore: true,
  })

  // Produtos contratados ativos
  const contratadosAtivos = useMemo(
    () => produtosContratados.filter(p => p.is_active),
    [produtosContratados],
  )

  const produtosContratadosHubLinha = useMemo(
    () =>
      contratadosAtivos.map((p) => ({
        product_key: p.product_key,
        nome: PRODUCT_NAME_KEYS[p.product_key]
          ? t(PRODUCT_NAME_KEYS[p.product_key])
          : p.nome,
      })),
    [contratadosAtivos, t],
  )

  const saudacaoHub = getHubGreeting(
    (key, fallback) =>
      typeof fallback === 'string' ? t(key, fallback) : t(key, fallback as Record<string, unknown>),
  )
  const linhaHeroResumo = useMemo(() => {
    const nomeWs = selectedWs?.nome ?? t('sw.hero_escolha_workspace', 'Selecione um workspace')
    const detalhe = t(
      'hub.hero_processos',
      '{{ativos}} processos em andamento · {{pendentes}} aguardando ação · {{plugins}} produtos no workspace',
      { ativos: 7, pendentes: 3, plugins: contratadosAtivos.length },
    )
    return `${nomeWs} · ${detalhe}`
  }, [selectedWs, contratadosAtivos.length, t])

  const gabiTotalPaginas = Math.max(1, Math.ceil(gabiInsights.length / GABI_INSIGHTS_POR_PAGINA))

  const insightsGabiVisiveis = useMemo(
    () => montarJanelaInsightsGabi(gabiInsights, gabiIndice),
    [gabiIndice, gabiInsights],
  )

  const processosOperacaoHub = useMemo(
    () =>
      getHubProcessosOperacaoMock((key, fallback) =>
        typeof fallback === 'string' ? t(key, fallback) : t(key),
      ),
    [t],
  )

  const abrirProcessoHub = useCallback(() => {
    const orgId = idOrganizacao ?? sessionStorage.getItem('gravity_tenant_id')
    if (orgId) {
      navigate(`/processo?idOrganizacao=${encodeURIComponent(orgId)}`)
    } else {
      navigate('/processo')
    }
  }, [idOrganizacao, navigate])

  const abrirProdutoContratadoHub = useCallback((slug: string, rota?: string) => {
    const escopoProduto = escoposPorProduto[slug]
    const wsId =
      escopoProduto?.[0]
      ?? sessionStorage.getItem('gravity_company_id')
      ?? selectedId
      ?? workspaces[0]?.id
      ?? undefined
    const ws = wsId ? workspaces.find(w => w.id === wsId) : undefined
    if (ws) {
      sessionStorage.setItem('gravity_company_id', ws.id)
      sessionStorage.setItem('gravity_company_name', ws.nome)
      setSelectedId(ws.id)
    }
    navigate(rota ?? PRODUCT_ROUTE_MAP[slug]?.rota ?? `/produto/${slug}`)
  }, [escoposPorProduto, selectedId, workspaces, navigate])

  /* ── Carrega TUDO via endpoint agregado (1 chamada = 1 requireAuth) ── */
  useEffect(() => {
    let cancelled = false

    async function carregarTudo() {
      try {
        const token = await getToken()
        if (!token) {
          setTimeout(() => { if (!cancelled) carregarTudo() }, 500)
          return
        }
        const res = await fetch('/api/v1/hub/init', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          if (res.status === 401) {
            navigate('/trial', { replace: true })
            return
          }
          const catRes = await fetch('/api/v1/hub/catalogo').catch(() => null)
          if (catRes?.ok) {
            const catData = await catRes.json()
            const catalogo: ProdutoCatalogo[] = (catData.catalog ?? []).map(
              (p: { id: string; name: string; slug: string; description?: string | null; status: string }) => ({
                id: p.id, name: p.name, slug: p.slug, description: p.description ?? null, status: p.status,
              })
            )
            if (!cancelled) setCatalogoProdutos(catalogo)
          }
          if (!cancelled) setCarregando(false)
          return
        }

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
        const orgUserCount = data.organizacao?._count?.usuarios ?? 0

        // ── Workspace preferido (vem do /hub/init) ──
        // Backend já validou que aponta para workspace ativo com membership.
        // Fornecedor sempre recebe null (enforced no backend).
        const serverPreferredId: string | null = data.idWorkspacePreferido ?? null
        setPreferredId(serverPreferredId)

        if (data.workspaces && data.workspaces.length > 0) {
          const mapeados: Workspace[] = (data.workspaces as WorkspaceFromHub[]).map((w, i) => {
            const grad = WORKSPACE_GRADIENTS[i % WORKSPACE_GRADIENTS.length]
            const vinculos = w.quantidade_usuarios_workspace
              ?? w._count?.vinculos_workspace
              ?? 0
            const membros = vinculos > 0 ? vinculos : orgUserCount
            return {
              id: w.id_workspace,
              nome: w.nome_workspace,
              iniciais: w.nome_workspace.substring(0, 2).toUpperCase(),
              role: data.organizacao?.tipo_organizacao ?? '',
              modulos: totalAtivos,
              membros,
              gradientFrom: grad.from,
              gradientTo: grad.to,
            }
          })
          setWorkspaces(mapeados)
          setSelectedId(serverPreferredId ?? mapeados[0].id)

          // ── Skip pós-login: redirect automático ──
          // Requisitos para o skip disparar:
          //   1. Query param ?select=1 ausente (escape hatch não acionado)
          //   2. preferredId válido vindo do backend
          //   3. Tenant tem pelo menos 1 produto ativo (senão abriria modalSemProdutos)
          //   4. tipo_usuario não é FORNECEDOR (backend já garantiu, mas double-check no client)
          const forceSelect = searchParams.get('select') === '1'
          if (
            !forceSelect &&
            serverPreferredId &&
            totalAtivos > 0 &&
            dbRole !== 'FORNECEDOR'
          ) {
            const targetWs = mapeados.find(w => w.id === serverPreferredId)
            if (targetWs) {
              sessionStorage.setItem('gravity_company_id', targetWs.id)
              sessionStorage.setItem('gravity_company_name', targetWs.nome)
              navigate('/hub', { replace: true })
              return
            }
          }

          // ── Migration suave: localStorage antigo (favoritos múltiplos) → backend ──
          // Se não há preferido no backend mas há favoritos salvos localmente,
          // pega o primeiro que ainda existe como company e promove para preferido.
          if (!serverPreferredId && dbRole !== 'FORNECEDOR') {
            try {
              const legacy = localStorage.getItem('gravity_ws_favorites')
              if (legacy) {
                const ids: string[] = JSON.parse(legacy)
                const firstValid = ids.find(id => mapeados.some(m => m.id === id))
                if (firstValid) {
                  // Fire-and-forget: promove no backend
                  const token2 = await getToken()
                  if (token2) {
                    fetch('/api/v1/me/preferencias', {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token2}`,
                      },
                      body: JSON.stringify({ preferredCompanyId: firstValid }),
                    }).catch(() => {})
                  }
                  if (!cancelled) setPreferredId(firstValid)
                }
                localStorage.removeItem('gravity_ws_favorites')
              }
            } catch {
              // Migration best-effort — ignora falha
            }
          }
        } else {
          // Sem companies — mostra estado vazio (dados reais virão após onboarding)
          setWorkspaces([])
          setSelectedId(null)
        }

      } catch {
        // API indisponível — mostra estado vazio
      } finally {
        if (!cancelled) setCarregando(false)
      }
    }

    carregarTudo()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getToken])

  /* ── Escopo por produto contratado (default: todos os workspaces) ── */
  const chavesProdutosContratados = useMemo(
    () => contratadosAtivos.map(p => p.product_key).join('|'),
    [contratadosAtivos],
  )

  const idsWorkspacesDisponiveisKey = useMemo(
    () => workspaces.map(w => w.id).join('|'),
    [workspaces],
  )

  const escopoCarregamentoRef = useRef(0)

  useEffect(() => {
    const idsDisponiveis = workspaces.map(w => w.id)
    const padraoInicial = escopoPadraoTodosWorkspaces(idsDisponiveis)

    if (!idOrganizacao || !idUsuarioPrisma || idsDisponiveis.length === 0 || contratadosAtivos.length === 0) {
      setEscoposPorProduto({})
      return
    }

    const escopoDefault: Record<string, string[]> = {}
    for (const prod of contratadosAtivos) {
      escopoDefault[prod.product_key] = padraoInicial
    }
    setEscoposPorProduto(prev => (Object.keys(prev).length > 0 ? prev : escopoDefault))

    const requestId = ++escopoCarregamentoRef.current

    async function carregarEscoposProdutos() {
      try {
        const token = await getToken()
        if (!token || requestId !== escopoCarregamentoRef.current) return

        const mapa = await buscarMapaNomesWorkspacesOrg(token)
        if (requestId !== escopoCarregamentoRef.current) return

        const ctx = {
          idOrganizacao,
          idUsuario: idUsuarioPrisma,
          idWorkspace:
            sessionStorage.getItem('gravity_company_id')
            ?? workspaces[0]?.id
            ?? null,
        }

        const next: Record<string, string[]> = {}

        for (const prod of contratadosAtivos) {
          const productKey = prod.product_key
          let idsBackend: string[] = []

          if (productKey === 'pedido') {
            const preferencia = await obterPreferenciaEscopoHubPedido(token, ctx)
            if (preferencia.idsEscopo) {
              idsBackend = filtrarIdsEscopoWorkspacesValidos(preferencia.idsEscopo, mapa)
            }
          }

          const idsLocal = lerEscopoHubProdutoLocal(idOrganizacao, productKey)
          const idsLocalValidos = idsLocal
            ? filtrarIdsEscopoHubValidos(idsLocal, idsDisponiveis)
            : []

          next[productKey] = idsBackend.length > 0
            ? idsBackend
            : idsLocalValidos.length > 0
              ? idsLocalValidos
              : padraoInicial
        }

        if (requestId === escopoCarregamentoRef.current) {
          setEscoposPorProduto(next)
        }
      } catch {
        /* mantém escopo default já exibido — edição não bloqueia */
      }
    }

    void carregarEscoposProdutos()
  }, [
    getToken,
    idOrganizacao,
    idUsuarioPrisma,
    idsWorkspacesDisponiveisKey,
    chavesProdutosContratados,
    contratadosAtivos,
    workspaces,
  ])

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
        { to: '/configurador/financeiro', label: 'Email', icon: <Envelope weight="duotone" size={18} /> },
        { to: '/configurador/usuarios', label: 'WhatsApp', icon: <WhatsappLogo weight="duotone" size={18} /> },
      ],
    })

    if (produtosAtivos.length > 0) {
      items.push({
        label: t('sw.produtos_gravity'),
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
        label: t('sw.produtos_gravity'),
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
    items.push({ to: '/processo', label: 'Processo', icon: <Folders weight="duotone" size={18} /> })
    items.push({ to: '/configurador/financeiro', label: 'Relatórios', icon: <FileText weight="duotone" size={18} /> })
    items.push({ to: '/configurador/organizacao', label: 'Histórico de Alterações', icon: <ClockCounterClockwise weight="duotone" size={18} /> })
    items.push({ to: '/configurador/api-cockpit', label: 'Cockpit API', icon: <Plug weight="duotone" size={18} /> })
    items.push({ to: '/configurador/organizacao', label: 'Configurações', icon: <GearSix weight="duotone" size={18} /> })

    return items
  }, [produtosAtivos])

  const buscarNoHub = useCallback((termo: string) => {
    const termLower = termo.toLowerCase()
    const ws = workspaces.find(w => w.nome.toLowerCase().includes(termLower))
    if (ws) {
      setSelectedId(ws.id)
      return
    }
    const prod = produtosContratados.find(
      p => p.nome.toLowerCase().includes(termLower) || p.product_key.toLowerCase().includes(termLower),
    )
    if (prod) {
      navigate(`/produto/${prod.product_key}`)
      return
    }
    const cat = catalogoProdutos.find(p => p.name.toLowerCase().includes(termLower))
    if (cat) {
      navigate('/store')
      return
    }
    const flat = navItems.flatMap(i => (i.children ? i.children : [i]))
    const target = flat.find(item => item.label?.toLowerCase().includes(termLower))
    if (target?.to) navigate(target.to)
  }, [workspaces, produtosContratados, catalogoProdutos, navItems, navigate])

  /* ── Handlers ── */
  const handleSelectWs = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleSair = useCallback(() => {
    signOut(() => navigate('/'))
  }, [signOut, navigate])

  const handleCriarAviso = useCallback((texto: string) => {
    const novo: AvisoInterno = {
      id: `aviso-${Date.now()}`,
      conteudo: texto,
      autor: { nome: userName },
      dataHora: new Date().toLocaleString(i18n.language),
      lido: false,
      tipo: 'aviso',
    }
    setAvisos(prev => [novo, ...prev])
  }, [userName, i18n.language])

  const handleCriarWorkspace = useCallback(() => {
    navigate('/configurador/workspaces')
  }, [navigate])

  const executarEntradaWorkspace = useCallback((ws: Workspace) => {
    sessionStorage.setItem('gravity_company_id', ws.id)
    sessionStorage.setItem('gravity_company_name', ws.nome)
    if (contratadosAtivos.length > 0) {
      navigate('/hub#hub-secao-produtos')
    } else {
      setModalSemProdutos(true)
    }
  }, [contratadosAtivos.length, navigate])

  const tentarEntrarNoWorkspace = useCallback(async (ws: Workspace) => {
    handleSelectWs(ws.id)
    setEntrando(true)
    try {
      const temPedidoContratado = contratadosAtivos.some(p => p.product_key === 'pedido')
      if (temPedidoContratado) {
        const token = await getToken()
        if (token && idOrganizacao && idUsuarioPrisma) {
          const ctx = { idOrganizacao, idUsuario: idUsuarioPrisma }
          const preferencia = await obterPreferenciaEscopoHubPedido(token, ctx)
          const mapaNomesWorkspaces = await buscarMapaNomesWorkspacesOrg(token)

          if (!preferencia.suprimirAvisoEscopoHub) {
            const idsEscopoBrutos = preferencia.idsEscopo
            if (idsEscopoBrutos) {
              const idsEscopo = filtrarIdsEscopoWorkspacesValidos(idsEscopoBrutos, mapaNomesWorkspaces)
              if (idsEscopo.length > 0 && escopoPedidoDivergeDoWorkspace(ws.id, idsEscopo)) {
                setEscopoPedidoNomes(resolverNomesWorkspacesEscopo(idsEscopo, mapaNomesWorkspaces))
                setNaoExibirAvisoEscopo(false)
                setWorkspaceEntradaPendente(ws)
                setModalEscopoPedidoAberto(true)
                return
              }
            }
          }
        }
      }
      executarEntradaWorkspace(ws)
    } finally {
      setEntrando(false)
    }
  }, [
    contratadosAtivos,
    executarEntradaWorkspace,
    getToken,
    handleSelectWs,
    idOrganizacao,
    idUsuarioPrisma,
  ])

  const fecharModalEscopoPedido = useCallback(() => {
    setModalEscopoPedidoAberto(false)
    setWorkspaceEntradaPendente(null)
    setEscopoPedidoNomes([])
    setNaoExibirAvisoEscopo(false)
  }, [])

  const confirmarEntradaEscopoPedido = useCallback(async () => {
    const ws = workspaceEntradaPendente
    const suprimir = naoExibirAvisoEscopo
    fecharModalEscopoPedido()
    if (suprimir) {
      const token = await getToken()
      if (token && idOrganizacao && idUsuarioPrisma) {
        void salvarSuprimirAvisoEscopoHubPedido(token, {
          idOrganizacao,
          idUsuario: idUsuarioPrisma,
        })
      }
    }
    if (ws) executarEntradaWorkspace(ws)
  }, [
    executarEntradaWorkspace,
    fecharModalEscopoPedido,
    getToken,
    idOrganizacao,
    idUsuarioPrisma,
    naoExibirAvisoEscopo,
    workspaceEntradaPendente,
  ])

  /* ── Carrossel scroll ── */
  const scrollCarousel = useCallback((ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return
    const amount = 340
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }, [])

  React.useEffect(() => {
    setGabiIndice(0)
  }, [gabiInsights.length])

  React.useEffect(() => {
    setGabiIndice(prev => Math.min(prev, gabiTotalPaginas - 1))
  }, [gabiTotalPaginas])

  /* ── GABI: auto-avanço a cada 5s (página de 3 insights) ── */
  React.useEffect(() => {
    if (gabiPaused || gabiTotalPaginas <= 1) return
    const timer = setInterval(() => {
      setGabiIndice(prev => (prev + 1) % gabiTotalPaginas)
    }, 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, gabiTotalPaginas])

  /* ── GABI: busca insights cross-produto do backend (hub/insights) ── */
  React.useEffect(() => {
    if (!roleReady || !idOrganizacao) return

    const seq = ++gabiFetchSeq.current
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    async function carregarInsightsGabi(tentativa = 0) {
      if (gabiFetchSeq.current !== seq) return

      try {
        const token = await getToken()
        if (!token) {
          if (tentativa < 24) {
            retryTimer = setTimeout(() => carregarInsightsGabi(tentativa + 1), 500)
          } else if (gabiFetchSeq.current === seq) {
            setGabiInsights([GABI_INSIGHT_FALLBACK])
            setGabiLoading(false)
          }
          return
        }

        if (!gabiCarregouAlgumaVez.current) {
          setGabiLoading(true)
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15_000)

        const res = await fetch('/api/v1/hub/insights', {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (gabiFetchSeq.current !== seq) return
        if (!res.ok) throw new Error(`status_${res.status}`)

        const raw: unknown = await res.json()
        const parsed = gabiInsightsResponseSchema.safeParse(raw)
        if (!parsed.success) throw new Error('contrato_insights_invalido')

        const insights: GabiInsight[] = parsed.data.insights.map(ins => ({
          id: ins.id,
          variante: ins.variante ?? 'default',
          tag: ins.tag,
          texto: ins.texto,
          stat: ins.stat,
          textoLink: ins.textoLink,
          rota: ins.rota,
          score: ins.score ?? 0,
          produto: ins.produto,
        }))

        setGabiInsights(insights.length > 0 ? insights : [GABI_INSIGHT_FALLBACK])
        gabiCarregouAlgumaVez.current = true
      } catch {
        if (gabiFetchSeq.current !== seq) return
        setGabiInsights([GABI_INSIGHT_FALLBACK])
        gabiCarregouAlgumaVez.current = true
      } finally {
        if (gabiFetchSeq.current === seq) {
          setGabiLoading(false)
        }
      }
    }

    carregarInsightsGabi()

    return () => {
      gabiFetchSeq.current += 1
      if (retryTimer) clearTimeout(retryTimer)
    }
    // getToken via closure Clerk — não colocar nas deps (reexecução cancelava o fetch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleReady, idOrganizacao, chavesProdutosContratados])

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div className="sw-shell sw-shell--no-sidebar sw-hub-root">
      <div className="sw-page sw-page--full">
        <header className="sw-topbar">
          <div className="sw-t-brand">
            <LogoGlobal iconSize={22} iconColor="#818cf8" />
            <div className="sw-t-div" />
            <span className="sw-t-module-label">HUB</span>
          </div>
          <div className="sw-t-right">
            <CampoLocalizarExpandidoGlobal onBuscarNavigate={buscarNoHub} />

            <div className="sw-notif-wrap">
              <AvisoInternoGlobal
                avisos={avisos}
                onMarcarLido={handleMarcarLido}
                onMarcarTodosLidos={handleMarcarTodosLidos}
                onCriarAviso={handleCriarAviso}
              />
            </div>

            <button
              className="sw-t-icon"
              type="button"
              aria-label={tooltipsDisabled ? t('shell.habilitar_dicas') : t('shell.desabilitar_dicas')}
              title={tooltipsDisabled ? t('shell.label_habilitar_dicas') : t('shell.label_desabilitar_dicas')}
              onClick={toggleTooltips}
              style={{ color: tooltipsDisabled ? 'var(--sw-muted, #64748b)' : 'var(--sw-accent-2, #818cf8)' }}
            >
              <Info size={16} weight={tooltipsDisabled ? 'regular' : 'fill'} />
            </button>

            <LocalizadorGlobal
              workspaceName={companyName}
              iconOnly
              currentProductId="hub"
              currentProductLabel="Hub"
              currentProductColor="#818cf8"
              currentPageLabel="Hub"
              history={locHistory}
              nodes={hubEcosystemNodes}
              onNavigate={(node) => {
                if (node.type === 'hub')               navigate('/hub?select=1')
                else if (node.type === 'core')         navigate('/hub?select=1')
                else if (node.type === 'hub-store')    navigate('/store')
                else if (node.type === 'configurador') navigate('/configurador')
                else if (node.type === 'admin')        navigate('/admin/visao-geral')
                else if (node.type === 'produto')      navigate(`/produto/${node.id}`)
              }}
            />

            <SeletorIdiomaGlobal iconOnly />

            <div className="sw-t-sep" />

            <button
              className="sw-t-icon"
              type="button"
              title={t('workspace.layout.modulo_nome')}
              onClick={() => navigate('/configurador/organizacao')}
            >
              <GearSix size={16} weight="duotone" />
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
              onSignOut={handleSair}
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

        <div className="sw-content sw-content--hub-unificado">
          {carregando ? (
            <div className="sw-loading">
              <GravityLoader texto="Carregando" tamanho="lg" />
            </div>
          ) : (
            <div className="sw-hub-unificado">
              <section className="sw-hub-hero sw-a0" aria-label={t('sw.titulo')}>
                <div>
                  <h1>
                    {saudacaoHub}, <em>{userName}</em> 👋
                  </h1>
                  <p className="sw-hub-hero-sub">{linhaHeroResumo}</p>
                </div>
                <div className="sw-hub-hero-meta">
                  <div className="sw-hub-status-pill">
                    <span className="sw-hub-status-dot" aria-hidden="true" />
                    {t('hub.sistema_operacional', 'Sistema operacional')}
                  </div>
                  <span>{formatHubDate(i18n.language)}</span>
                </div>
              </section>

              <div id="hub-secao-produtos" className="sw-hub-row-top sw-a0">
                <section
                  className="sw-hub-panel sw-hub-panel--produtos"
                  aria-label={t('sw.produtos_contratados', 'Seus Produtos Gravity')}
                >
                  <div className="sw-hub-prod-head">
                    <div className="sw-hub-prod-head-left">
                      <div className="sw-hub-panel-label">
                        {t('sw.produtos_contratados', 'Seus Produtos Gravity')}
                      </div>
                      <p className="sw-hub-store-desc">
                        {t('sw.produtos_contratados_desc')}
                      </p>
                    </div>
                    <div className="sw-hub-prod-head-right">
                      <button
                        type="button"
                        className="sw-hub-link-pill"
                        onClick={() => navigate('/store')}
                      >
                        <ShoppingBagOpen size={13} weight="duotone" aria-hidden />
                        {t('sw.ver_catalogo', 'Gravity Store')}
                        <ArrowRight size={12} weight="bold" className="sw-hub-link-pill__arrow" aria-hidden />
                      </button>
                      <BarrasMeterProdutosContratadosHub
                        catalogo={catalogoProdutos}
                        produtosContratados={produtosContratados.map(p => ({
                          product_key: p.product_key,
                          is_active: p.is_active,
                          nome: PRODUCT_NAME_KEYS[p.product_key]
                            ? t(PRODUCT_NAME_KEYS[p.product_key])
                            : p.nome,
                        }))}
                      />
                    </div>
                  </div>
                  <GradeProdutosContratadosHub
                    rotuloNoCabecalho
                    catalogo={catalogoProdutos}
                    produtosContratados={produtosContratados.map(p => ({
                      product_key: p.product_key,
                      is_active: p.is_active,
                      nome: PRODUCT_NAME_KEYS[p.product_key]
                        ? t(PRODUCT_NAME_KEYS[p.product_key])
                        : p.nome,
                    }))}
                    t={t}
                    onIrStore={() => navigate('/store')}
                    onAbrirProdutoContratado={abrirProdutoContratadoHub}
                  />
                </section>

                <section className="sw-hub-panel sw-hub-panel--ws" aria-label={t('sw.secao_workspaces', 'Workspaces')}>
                  <div className="sw-hub-panel-label">{t('sw.secao_workspaces', 'Workspaces')}</div>
                  <p className="sw-ws-por-produto-intro">
                    {t(
                      'sw.ws_pref_intro',
                      'Preferência de filiais por produto — o que você define aqui é o que cada módulo usa ao abrir',
                    )}
                  </p>

                  <PreferenciasWorkspacesPorProdutoHub
                    produtos={produtosContratadosHubLinha}
                    workspaces={workspaces}
                    escoposPorProduto={escoposPorProduto}
                    idOrganizacao={idOrganizacao}
                    idUsuario={idUsuarioPrisma}
                    getToken={getToken}
                    onEscopoProdutoChange={(productKey, ids) => {
                      setEscoposPorProduto(prev => ({ ...prev, [productKey]: ids }))
                    }}
                    onNotificacao={addNotification}
                    getIconeProduto={getProdutoIcon}
                    podeCriarWorkspace={podeMutarConfigurador(dbRole)}
                    onCriarWorkspace={handleCriarWorkspace}
                    t={(key, fallback) => t(key, fallback ?? key)}
                  />
                </section>
              </div>

              <section className="sw-hub-row-ops sw-a1" aria-label={t('hub.operacoes_andamento', 'Operações em andamento')}>
                <div className="sw-hub-ops-head">
                  <div className="sw-hub-panel-label">
                    {t('hub.operacoes_andamento', 'Operações em andamento')}
                  </div>
                  <button
                    type="button"
                    className="sw-hub-link-pill"
                    onClick={() => {
                      const orgId = idOrganizacao ?? sessionStorage.getItem('gravity_tenant_id')
                      if (orgId) {
                        navigate(`/processo?idOrganizacao=${encodeURIComponent(orgId)}`)
                      } else {
                        navigate('/processo')
                      }
                    }}
                  >
                    <Folders size={13} weight="duotone" aria-hidden />
                    {t('hub.ver_todos_processos', 'Ver todos os processos')}
                    <ArrowRight size={12} weight="bold" className="sw-hub-link-pill__arrow" aria-hidden />
                  </button>
                </div>
                <div className="sw-hub-kpi-row">
                  <div className="sw-hub-kpi">
                    <div className="sw-hub-kpi-val">7</div>
                    <div className="sw-hub-kpi-lbl">{t('hub.kpi_processos', 'Processos em andamento')}</div>
                    <span className="sw-hub-kpi-tag sw-hub-kpi-tag--up">▲ {t('hub.kpi_delta_1_hoje', '1 hoje')}</span>
                  </div>
                  <div className="sw-hub-kpi">
                    <div className="sw-hub-kpi-val">3</div>
                    <div className="sw-hub-kpi-lbl">{t('hub.kpi_aguardando_acao', 'Aguardando ação')}</div>
                    <span className="sw-hub-kpi-tag sw-hub-kpi-tag--warn">⚠ {t('hub.kpi_delta_3_pendentes', '3 pendentes')}</span>
                  </div>
                  <div className="sw-hub-kpi">
                    <div className="sw-hub-kpi-val">12</div>
                    <div className="sw-hub-kpi-lbl">{t('hub.kpi_notas', 'NFs de importação')}</div>
                    <span className="sw-hub-kpi-tag sw-hub-kpi-tag--warn">⚠ {t('hub.kpi_delta_7_pendentes', '7 pendentes')}</span>
                  </div>
                  <div className="sw-hub-kpi">
                    <div className="sw-hub-kpi-val">91%</div>
                    <div className="sw-hub-kpi-lbl">{t('hub.kpi_gabi_curto', 'Assertividade Gabi IA')}</div>
                    <span className="sw-hub-kpi-tag sw-hub-kpi-tag--up">{t('hub.kpi_delta_ativo', 'ativo')}</span>
                  </div>
                </div>
                <div className="sw-hub-proc-list">
                  {processosOperacaoHub.map((proc) => (
                    <button
                      key={proc.id}
                      type="button"
                      className="sw-hub-proc"
                      onClick={abrirProcessoHub}
                    >
                      <div>
                        <div className="sw-hub-proc-name">{proc.nome}</div>
                        <div className="sw-hub-proc-sub">{proc.detalhe}</div>
                      </div>
                      <span className={`sw-hub-proc-badge sw-hub-proc-badge--${proc.badgeVariant}`}>
                        {proc.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <div
                className="sw-hub-row-gabi sw-a1"
                onMouseEnter={() => setGabiPaused(true)}
                onMouseLeave={() => setGabiPaused(false)}
              >
                <section
                  className="sw-hub-panel sw-hub-panel--store"
                  aria-label={t('sw.gravity_store', 'Gravity Store')}
                >
                  <div className="sw-hub-panel-label">{t('sw.gravity_store', 'Gravity Store')}</div>
                  <p className="sw-hub-store-desc">
                    {t('sw.store_desc', 'Descubra novas ferramentas e ative produtos no workspace.')}
                  </p>
                  <CardVitrineStoreHub
                    catalogo={catalogoProdutos}
                    produtosContratados={produtosContratados.map(p => ({
                      product_key: p.product_key,
                      is_active: p.is_active,
                    }))}
                    onAbrirStore={() => navigate('/store')}
                  />
                  <button
                    type="button"
                    className="sw-hub-store-btn"
                    onClick={() => navigate('/store')}
                  >
                    {t('sw.visitar_store', 'Visitar Gravity Store')}
                    <ArrowRight size={12} weight="bold" />
                  </button>
                </section>

                <section
                  className={`sw-hub-panel sw-hub-panel--gabi${classePainelGabiLayout()}`}
                  aria-label={t('sw.gabi_label')}
                >
                  <div className="sw-hub-gabi-head">
                    <div className="sw-hub-panel-label" style={{ margin: 0 }}>
                      {t('sw.gabi_label')}
                    </div>
                    <span className="sw-gabi-live-badge">
                      <span className="sw-gabi-live-dot" />
                      {t('sw.ao_vivo')}
                    </span>
                  </div>
                  <div className="sw-gabi-card">
                    <div className="sw-gabi-card-main">
                      <div className="sw-gabi-card-top-row">
                        <div className="sw-gabi-header-right" style={{ marginLeft: 'auto' }}>
                          <button
                            className="sw-gabi-nav-btn"
                            type="button"
                            onClick={() =>
                              setGabiIndice(prev => (prev - 1 + gabiTotalPaginas) % gabiTotalPaginas)}
                            disabled={gabiTotalPaginas <= 1}
                            aria-label="Página anterior de insights"
                          >
                            <CaretLeft size={12} weight="bold" />
                          </button>
                          <button
                            className="sw-gabi-nav-btn"
                            type="button"
                            onClick={() =>
                              setGabiIndice(prev => (prev + 1) % gabiTotalPaginas)}
                            disabled={gabiTotalPaginas <= 1}
                            aria-label="Próxima página de insights"
                          >
                            <CaretRight size={12} weight="bold" />
                          </button>
                        </div>
                      </div>

                      <div className="sw-hub-gabi-slide-wrap">
                        {gabiLoading ? (
                          <div className="sw-hub-gabi-grid">
                            {Array.from({ length: GABI_INSIGHTS_POR_PAGINA }, (_, idx) => (
                              <div
                                key={`gabi-skeleton-${idx}`}
                                className="sw-hub-gabi-insight-card sw-gabi-insight-card--skeleton"
                              >
                                <div className="sw-gabi-skeleton-line sw-gabi-skeleton-line--short" />
                                <div className="sw-gabi-skeleton-line" />
                                <div className="sw-gabi-skeleton-line" />
                              </div>
                            ))}
                          </div>
                        ) : insightsGabiVisiveis.length > 0 ? (
                          <div className="sw-hub-gabi-grid">
                            {insightsGabiVisiveis.map((insight, slot) => (
                              <div
                                key={`${insight.id}-${gabiIndice}-${slot}`}
                                className={classeInsightGabiCard(insight)}
                              >
                                <div
                                  className={`sw-hub-gabi-insight-tag${insight.variante === 'warn' ? ' sw-hub-gabi-insight-tag--warn' : ''}`}
                                >
                                  {insight.variante === 'warn'
                                    ? <Warning size={11} weight="fill" />
                                    : <RocketLaunch size={11} weight="fill" />}
                                  {insight.tag}
                                </div>
                                <p className="sw-hub-gabi-insight-text">{insight.texto}</p>
                                <div className="sw-hub-gabi-insight-foot">
                                  <div className="sw-hub-gabi-insight-stat-slot">
                                    {insight.stat ? (
                                      <div className="sw-hub-gabi-insight-stat">
                                        <span className="sw-hub-gabi-insight-stat-label">{insight.stat.label}</span>
                                        <span className="sw-hub-gabi-insight-stat-value">{insight.stat.valor}</span>
                                      </div>
                                    ) : null}
                                  </div>
                                  <div className="sw-hub-gabi-insight-link-slot">
                                    {insight.textoLink && insight.rota ? (
                                      <button
                                        className="sw-hub-gabi-insight-link"
                                        type="button"
                                        onClick={() => navigate(insight.rota!)}
                                      >
                                        {insight.textoLink} <CaretRight size={11} />
                                      </button>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="sw-gabi-insight-text">{t('sw.gabi_sem_insights', 'Nenhum insight no momento.')}</p>
                        )}
                      </div>

                      {gabiTotalPaginas > 1 && (
                        <div className="sw-hub-gabi-dots" role="tablist" aria-label={t('sw.gabi_label')}>
                          {Array.from({ length: gabiTotalPaginas }, (_, idx) => (
                            <button
                              key={`gabi-pagina-${idx}`}
                              type="button"
                              role="tab"
                              aria-selected={idx === gabiIndice}
                              className={`sw-hub-gabi-dot${idx === gabiIndice ? ' sw-hub-gabi-dot--active' : ''}`}
                              onClick={() => setGabiIndice(idx)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>

      <ModalOverlay
        aberto={modalEscopoPedidoAberto}
        aoFechar={fecharModalEscopoPedido}
        tamanho="lg"
        titulo=""
        cabecalhoPersonalizado={
          <div className="sw-modal-escopo-pedido">
            <div className="sw-modal-escopo-pedido-icone">
              <ClipboardText size={28} weight="duotone" />
            </div>

            <div className="sw-modal-escopo-pedido-corpo">
              <h2 className="sw-modal-escopo-pedido-titulo">
                {t('sw.modal_escopo_pedido_titulo')}
              </h2>
              <p className="sw-modal-escopo-pedido-desc">
                {t('sw.modal_escopo_pedido_desc', {
                  workspaceAlvo: workspaceEntradaPendente?.nome ?? '',
                })}
              </p>
              <LegendaEscopoWorkspacesHub nomes={escopoPedidoNomes} />
              <span className="cg-hint-contextual cg-hint-contextual--centro">
                <Info size={14} weight="fill" className="cg-hint-contextual__icone" aria-hidden="true" />
                {t('sw.modal_escopo_pedido_dica')}
              </span>
            </div>
          </div>
        }
        renderizarFooter={() => (
          <div className="sw-modal-escopo-pedido-footer">
            <span className="cg-hint-contextual cg-hint-contextual--centro">
              <Info size={14} weight="fill" className="cg-hint-contextual__icone" aria-hidden="true" />
              {t('sw.modal_escopo_pedido_como_mudar')}
            </span>
            <label className="sw-modal-escopo-pedido-checkbox">
              <input
                type="checkbox"
                checked={naoExibirAvisoEscopo}
                onChange={e => setNaoExibirAvisoEscopo(e.target.checked)}
              />
              <span>{t('sw.modal_escopo_nao_exibir')}</span>
            </label>
            <button
              type="button"
              className="sw-modal-escopo-pedido-btn-acordo"
              onClick={() => { void confirmarEntradaEscopoPedido() }}
            >
              {t('sw.modal_escopo_btn_acordo')}
            </button>
          </div>
        )}
      >
        <div style={{ display: 'none' }} />
      </ModalOverlay>

      <ModalOverlay
        aberto={modalSemProdutos}
        aoFechar={() => setModalSemProdutos(false)}
        tamanho="md"
        titulo=""
        cabecalhoPersonalizado={
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem 2rem 0.75rem',
            gap: '1rem',
          }}>
            {/* Ícone indigo — friendly, não destrutivo */}
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(180deg, rgba(129,140,248,0.15) 0%, rgba(129,140,248,0.05) 100%)',
              border: '1px solid rgba(129,140,248,0.2)',
              boxShadow: '0 0 0 8px rgba(129,140,248,0.04), inset 0 2px 8px rgba(129,140,248,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              position: 'relative',
            }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1) 0%, transparent 60%)',
                pointerEvents: 'none',
              }} />
              <Package size={28} weight="duotone" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '100%', marginTop: '0.25rem' }}>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-primary, #f1f5f9)',
                margin: 0,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
              }}>
                {t('sw.modal_sem_produtos_titulo')}
              </h2>
              <p style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary, #94a3b8)',
                lineHeight: 1.5,
                margin: 0,
                width: '100%',
                textAlign: 'center',
              }}>
                {t('sw.modal_sem_produtos_desc')}
              </p>

              {/* Destaque comercial */}
              <div style={{
                marginTop: '0.25rem',
                padding: '0.875rem 1rem',
                background: 'linear-gradient(135deg, rgba(129,140,248,0.1) 0%, rgba(167,139,250,0.06) 100%)',
                border: '1px solid rgba(129,140,248,0.2)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                textAlign: 'left',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              }}>
                <span style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, minWidth: 32,
                  borderRadius: '8px',
                  background: 'rgba(129,140,248,0.15)',
                  color: '#818cf8',
                }}>
                  <RocketLaunch size={17} weight="duotone" />
                </span>
                <div>
                  <p style={{ margin: '0 0 0.2rem', fontSize: '0.8125rem', fontWeight: 700, color: '#f1f5f9' }}>
                    {t('sw.modal_cta_titulo')}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                    {t('sw.modal_cta_desc')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
        renderizarFooter={() => (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0 2rem 2rem',
          }}>
            <button
              type="button"
              style={{
                width: '180px', height: '38px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontWeight: 600, fontSize: '0.875rem',
                background: '#f8fafc', color: '#0f172a',
                border: '1px solid transparent', borderRadius: '8px',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onClick={() => setModalSemProdutos(false)}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {t('sw.modal_btn_agora_nao')}
            </button>

            <button
              type="button"
              style={{
                width: '180px', height: '38px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)',
                color: '#ffffff',
                border: '1px solid #4f46e5',
                borderTopColor: '#818cf8',
                borderRadius: '8px',
                fontWeight: 600, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
              onClick={() => { setModalSemProdutos(false); navigate('/store') }}
              onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(180deg, #a5b4fc 0%, #818cf8 100%)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(180deg, #818cf8 0%, #6366f1 100%)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Package size={16} weight="bold" />
              {t('sw.modal_btn_ver_store')}
            </button>
          </div>
        )}
      >
        <div style={{ display: 'none' }} />
      </ModalOverlay>

        <ToastContainer />
      </div>
    </div>
  )
}
