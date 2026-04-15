import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useClerk, useUser, useAuth } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import {
  House,
  SquaresFour,
  ChartLine,
  UsersThree,
  GearSix,
  MagnifyingGlass,
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
  Truck,
  ClipboardText,
  Fire,
  Info,
} from '@phosphor-icons/react'
import { LanguageSwitcherGlobal } from '@nucleo/language-switcher-global'
import { type NavItem } from '@nucleo/menu-lateral-global'
import { UsuarioGlobal } from '@nucleo/usuario-global'
import { LogoGlobal } from '@nucleo/logo-global'
import { LocalizarExpandidoCampoGlobal } from '@nucleo/campo-localizar-expandido-global'
import { LocalizadorGlobal, useLocalizadorHistory, buildEcosystemNodes, type EcosystemNode } from '@nucleo/localizador-global'
import { useLoadSystemRole } from '../hooks/useLoadSystemRole'
import { ToastContainer, useShellStore } from '@gravity/shell'
import { AvisoInternoGlobal, type AvisoInterno } from '@nucleo/mensageria-global'
import { ModalGlobal } from '@nucleo/modal-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
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

/* ── Tipo de insight GABI ── */
interface GabiInsight {
  id: string
  variante: 'default' | 'warn'
  tag: string
  texto: React.ReactNode
  stat?: { label: string; valor: string }
  textoLink: string
  rota: string
}

interface CompanyApi {
  id: string
  name: string
  cnpj: string | null
  status: string
  _count?: { memberships: number }
}

/* ── Paleta de gradientes para workspace cards ── */
const WORKSPACE_GRADIENTS = [
  { from: '#4F63FF', to: '#1ED8C8' },
  { from: '#F6A832', to: '#F04E42' },
  { from: '#1ED8C8', to: '#20C96A' },
  { from: '#A855F7', to: '#6366F1' },
  { from: '#EC4899', to: '#F43F5E' },
]

/* ── Mock workspaces (fallback quando API não retorna companies) ── */
const MOCK_WORKSPACES_RAW = [
  { id: 'mock-1',  name: 'DMM Importações',     modulos: 3, membros: 12 },
  { id: 'mock-2',  name: 'TechBrasil Ltda',      modulos: 5, membros: 8  },
  { id: 'mock-3',  name: 'Exporta Sul',          modulos: 2, membros: 5  },
  { id: 'mock-4',  name: 'Alpha Logística',      modulos: 7, membros: 20 },
  { id: 'mock-5',  name: 'Comex Partners',       modulos: 4, membros: 3  },
  { id: 'mock-6',  name: 'Nexus Trade',          modulos: 6, membros: 15 },
  { id: 'mock-7',  name: 'Prime Cargo',          modulos: 3, membros: 7  },
  { id: 'mock-8',  name: 'Global Freight',       modulos: 5, membros: 9  },
  { id: 'mock-9',  name: 'Summit Distribuidora', modulos: 2, membros: 4  },
  { id: 'mock-10', name: 'Zenith Operações',     modulos: 4, membros: 6  },
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

/* ── Mapa de slug → ícone, cor e bg para produtos sugeridos ── */
const PRODUCT_ICON_MAP: Record<string, { icon: React.ReactElement; color: string; bg: string }> = {
  'nf-importacao':  { icon: <FileText size={18} weight="duotone" />,        color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  'nf-import':      { icon: <FileText size={18} weight="duotone" />,        color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  'pedido':         { icon: <ClipboardText size={18} weight="duotone" />,   color: '#34d399', bg: 'rgba(52,211,153,0.10)' },
  'processo':       { icon: <ClipboardText size={18} weight="duotone" />,   color: '#34d399', bg: 'rgba(52,211,153,0.10)' },
  'bid-cambio':     { icon: <CurrencyDollar size={18} weight="duotone" />,  color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
  'bid-frete':      { icon: <Truck size={18} weight="duotone" />,           color: '#1ED8C8', bg: 'rgba(30,216,200,0.10)' },
  'simula-custo':   { icon: <Calculator size={18} weight="duotone" />,      color: '#a78bfa', bg: 'rgba(167,139,250,0.10)' },
  'smart-read':     { icon: <Folders size={18} weight="duotone" />,         color: '#f472b6', bg: 'rgba(244,114,182,0.10)' },
}

function getProdutoIcon(slug: string): { icon: React.ReactElement; color: string; bg: string } {
  return PRODUCT_ICON_MAP[slug] ?? { icon: <Star size={18} weight="regular" />, color: 'var(--sw-accent-2)', bg: 'var(--sw-accent-dim)' }
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL — SelecionarWorkspace (Dashboard Core)
══════════════════════════════════════════════════════ */
export function SelecionarWorkspace() {
  const { t } = useTranslation()
  const { signOut } = useClerk()
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const { currentTheme, toggleTheme, tooltipsDisabled, toggleTooltips } = useShellStore()
  const isLight = currentTheme === 'light'

  useEffect(() => {
    if (isLight) {
      document.body.classList.add('light-theme')
    } else {
      document.body.classList.remove('light-theme')
    }
  }, [isLight])
  const [modalSemProdutos, setModalSemProdutos] = useState(false)

  const [workspaces, setWorkspaces] = useState<Workspace[]>(() =>
    MOCK_WORKSPACES_RAW.map((c, i) => {
      const grad = WORKSPACE_GRADIENTS[i % WORKSPACE_GRADIENTS.length]
      return {
        id: c.id,
        nome: c.name,
        iniciais: c.name.substring(0, 2).toUpperCase(),
        role: 'Importador',
        modulos: c.modulos,
        membros: c.membros,
        gradientFrom: grad.from,
        gradientTo: grad.to,
      }
    })
  )
  const [selectedId, setSelectedId] = useState<string | null>(MOCK_WORKSPACES_RAW[0].id)
  const [carregando, setCarregando] = useState(true)
  const [entrando, setEntrando] = useState(false)
  const [produtosAtivos, setProdutosAtivos] = useState<ProdutoAtivo[]>([])
  const [produtosContratados, setProdutosContratados] = useState<ProdutoContratado[]>([])
  const [catalogoProdutos, setCatalogoProdutos] = useState<ProdutoCatalogo[]>([])
  const [wsSearch, setWsSearch] = useState('')
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('gravity_ws_favorites')
      return new Set(stored ? JSON.parse(stored) : [])
    } catch { return new Set() }
  })
  const wsCarouselRef = useRef<HTMLDivElement>(null)
  const prodCarouselRef = useRef<HTMLDivElement>(null)
  const gabiCarouselRef = useRef<HTMLDivElement>(null)

  /* ── GABI insights ── */
  const [gabiInsights, setGabiInsights] = useState<GabiInsight[]>([])
  const [gabiLoading, setGabiLoading] = useState(true)

  /* ── Mensageria (sino) ── */
  const [avisos, setAvisos] = useState<AvisoInterno[]>([])
  const handleMarcarLido = (id: string) => setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a))
  const handleMarcarTodosLidos = () => setAvisos(prev => prev.map(a => ({ ...a, lido: true })))
  const handleCriarAviso = (texto: string) => {
    const novo: AvisoInterno = {
      id: `aviso-${Date.now()}`,
      conteudo: texto,
      autor: { nome: userName },
      dataHora: new Date().toLocaleString('pt-BR'),
      lido: false,
      tipo: 'aviso',
    }
    setAvisos(prev => [novo, ...prev])
  }
  const [gabiPaused, setGabiPaused] = useState(false)

  const userName = user?.fullName ?? user?.firstName ?? 'Admin'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
  const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''

  const selectedWs = workspaces.find(w => w.id === selectedId)

  // ── Localizador ──────────────────────────────────────────────────────────
  const { history: locHistory, addEntry: locAddEntry } = useLocalizadorHistory('hub')
  useEffect(() => {
    locAddEntry({ productId: 'hub', productLabel: 'Hub', productColor: '#818cf8', pageLabel: 'Hub', pagePath: '/hub' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Role canônico vem do banco (via /api/v1/me) — não do publicMetadata do Clerk.
  // Alinhado com o refactor de auth de 01/04 (commit dea06fd).
  // Fallback: se /api/v1/me ainda não respondeu ou falhou, usa publicMetadata
  // do Clerk (legado) para evitar flash de "Usuário" enquanto o backend carrega.
  const { isGravityAdmin, role: dbRole, isReady: roleReady } = useLoadSystemRole()
  const ROLE_LABELS: Record<string, string> = {
    SUPER_ADMIN: 'Super Admin',
    ADMIN: 'Admin',
    MASTER: 'Master',
    STANDARD: 'Usuário',
    SUPPLIER: 'Fornecedor',
    gravity_admin: 'Super Admin',
  }
  const clerkRole = (user?.publicMetadata?.role as string) ?? ''
  const userRole = dbRole
    ? (ROLE_LABELS[dbRole] ?? dbRole)
    : (clerkRole ? (ROLE_LABELS[clerkRole] ?? clerkRole) : (roleReady ? 'Usuário' : '…'))
  const hubEcosystemNodes = buildEcosystemNodes({
    currentProductId: 'hub',
    includeAdmin: isGravityAdmin,
  })

  // Workspaces filtrados por busca e ordenados: favoritos primeiro
  const wsFiltrados = useMemo(() => {
    const term = wsSearch.trim().toLowerCase()
    const filtered = term
      ? workspaces.filter(ws => ws.nome.toLowerCase().includes(term))
      : workspaces
    return [...filtered].sort((a, b) => {
      const aFav = favoriteIds.has(a.id) ? 0 : 1
      const bFav = favoriteIds.has(b.id) ? 0 : 1
      return aFav - bFav
    })
  }, [workspaces, wsSearch, favoriteIds])

  function toggleFavorite(e: React.MouseEvent, wsId: string) {
    e.stopPropagation()
    setFavoriteIds(prev => {
      const next = new Set(prev)
      if (next.has(wsId)) { next.delete(wsId) } else { next.add(wsId) }
      try { localStorage.setItem('gravity_ws_favorites', JSON.stringify([...next])) } catch {}
      return next
    })
  }

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
        if (!token) {
          setTimeout(() => { if (!cancelled) carregarTudo() }, 500)
          return
        }
        const res = await fetch('/api/v1/hub/init', {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Se auth falhar, ainda carrega o catálogo público para mostrar produtos disponíveis
        if (!res.ok) {
          const catRes = await fetch('/api/v1/hub/catalog').catch(() => null)
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
        const tenantUserCount = data.tenant?._count?.users ?? 0

        if (data.companies && data.companies.length > 0) {
          const mapeados: Workspace[] = (data.companies as CompanyApi[]).map((c, i) => {
            const grad = WORKSPACE_GRADIENTS[i % WORKSPACE_GRADIENTS.length]
            const membros = (c._count?.memberships || 0) > 0 ? c._count!.memberships : tenantUserCount
            return {
              id: c.id,
              nome: c.name,
              iniciais: c.name.substring(0, 2).toUpperCase(),
              role: data.tenant?.tipo_empresa ?? '',
              modulos: totalAtivos,
              membros,
              gradientFrom: grad.from,
              gradientTo: grad.to,
            }
          })
          setWorkspaces(mapeados)
          setSelectedId(mapeados[0].id)
        } else {
          setWorkspaces(MOCK_WORKSPACES_RAW.map((c, i) => {
            const grad = WORKSPACE_GRADIENTS[i % WORKSPACE_GRADIENTS.length]
            return {
              id: c.id,
              nome: c.name,
              iniciais: c.name.substring(0, 2).toUpperCase(),
              role: data.tenant?.tipo_empresa ?? 'Importador',
              modulos: c.modulos,
              membros: c.membros,
              gradientFrom: grad.from,
              gradientTo: grad.to,
            }
          }))
          setSelectedId(MOCK_WORKSPACES_RAW[0].id)
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

  /* ── Carrossel scroll ── */
  const scrollCarousel = useCallback((ref: React.RefObject<HTMLDivElement | null>, dir: 'left' | 'right') => {
    if (!ref.current) return
    const amount = 340
    ref.current.scrollBy({ left: dir === 'right' ? amount : -amount, behavior: 'smooth' })
  }, [])

  /* ── GABI: auto-avanço a cada 6s ── */
  React.useEffect(() => {
    if (gabiPaused || gabiInsights.length <= 1) return
    const timer = setInterval(() => scrollCarousel(gabiCarouselRef, 'right'), 5000)
    return () => clearInterval(timer)
  }, [gabiPaused, gabiInsights.length, scrollCarousel])

  /* ── GABI: busca dados reais dos produtos contratados ── */
  React.useEffect(() => {
    let cancelled = false

    async function fetchGabiInsights() {
      try {
        const token = await getToken()
        if (!token) return
        const headers = { Authorization: `Bearer ${token}` }
        const activeKeys = new Set(produtosContratados.filter(p => p.is_active).map(p => p.product_key))
        const insights: GabiInsight[] = []

        const safe = async (fn: () => Promise<void>) => { try { await fn() } catch {} }

        /* BID Câmbio — vencimentos */
        if (activeKeys.has('bid-cambio')) {
          await safe(async () => {
            const r = await fetch('/api/v1/bid-cambio/dashboard/vencimentos?dias=30', { headers })
            if (!r.ok) return
            const d = await r.json()
            const total: number = d.proximos_vencimentos?.total ?? 0
            if (total > 0)
              insights.push({
                id: 'cambio-venc', variante: 'warn',
                tag: 'Alerta de Prazo · BID Câmbio',
                texto: <>{total} parcela{total > 1 ? 's' : ''} vence{total === 1 ? '' : 'm'} em menos de <strong>30 dias</strong>. Revise para não perder o prazo.</>,
                textoLink: 'Ver parcelas', rota: '/produto/bid-cambio',
              })
          })

          /* BID Câmbio — economia */
          await safe(async () => {
            const r = await fetch('/api/v1/bid-cambio/dashboard', { headers })
            if (!r.ok) return
            const d = await r.json()
            const eco: number = d.financeiro?.economia_acumulada_mes ?? 0
            if (eco > 0)
              insights.push({
                id: 'cambio-eco', variante: 'default',
                tag: 'Economia · BID Câmbio',
                texto: <>Você economizou neste mês operando câmbio pelo marketplace Gravity.</>,
                stat: { label: 'Economia acumulada', valor: `R$ ${eco.toLocaleString('pt-BR')}` },
                textoLink: 'Ver detalhes', rota: '/produto/bid-cambio',
              })
          })
        }

        /* BID Frete — alertas */
        if (activeKeys.has('bid-frete')) {
          await safe(async () => {
            const r = await fetch('/api/v1/bid-frete/dashboard/calendario', { headers })
            if (!r.ok) return
            const d = await r.json()
            const alertas: Array<{ tipo: string; count: number }> = d.alertas ?? []
            const fora = alertas.find(a => a.tipo === 'fora_prazo')?.count ?? 0
            const hoje = alertas.find(a => a.tipo === 'vence_hoje')?.count ?? 0
            if (fora > 0 || hoje > 0)
              insights.push({
                id: 'frete-alert', variante: 'warn',
                tag: 'Alerta · BID Frete',
                texto: <>
                  {fora > 0 && <><strong>{fora} cotação{fora > 1 ? 'ões' : ''}</strong> fora do prazo. </>}
                  {hoje > 0 && <><strong>{hoje}</strong> vence{hoje === 1 ? '' : 'm'} hoje.</>}
                </>,
                textoLink: 'Ver cotações', rota: '/produto/bid-frete',
              })
          })
        }

        /* SimulaCusto — KPIs */
        if (activeKeys.has('simula-custo')) {
          await safe(async () => {
            const r = await fetch('/api/v1/simula-custo/dashboard/kpis', { headers })
            if (!r.ok) return
            const d = await r.json()
            const inviavel: number = d.inviavel ?? 0
            const atencao: number = d.atencao ?? 0
            const media: number = d.mediaLandedCostBrl ?? 0
            if (inviavel > 0 || atencao > 0)
              insights.push({
                id: 'simula-kpi', variante: inviavel > 0 ? 'warn' : 'default',
                tag: 'Simulações · SimulaCusto',
                texto: <>
                  {inviavel > 0 && <><strong>{inviavel} simulaç{inviavel > 1 ? 'ões inviáveis' : 'ão inviável'}</strong> detectada{inviavel > 1 ? 's' : ''}. </>}
                  {atencao > 0 && <><strong>{atencao}</strong> requer{atencao === 1 ? '' : 'em'} atenção.</>}
                </>,
                ...(media > 0 && { stat: { label: 'Média landed cost', valor: `R$ ${Math.round(media).toLocaleString('pt-BR')}` } }),
                textoLink: 'Ver simulações', rota: '/produto/simula-custo',
              })
          })
        }

        /* LPCO — licenças suspensas */
        if (activeKeys.has('lpco')) {
          await safe(async () => {
            const r = await fetch('/api/v1/lpco/stats', { headers })
            if (!r.ok) return
            const d = await r.json()
            const suspensa: number = d.SUSPENSA ?? d.suspensa ?? 0
            if (suspensa > 0)
              insights.push({
                id: 'lpco-alert', variante: 'warn',
                tag: 'Atenção · LPCO',
                texto: <><strong>{suspensa} licença{suspensa > 1 ? 's' : ''} suspensa{suspensa > 1 ? 's' : ''}</strong>. Regularize para retomar as operações de importação.</>,
                textoLink: 'Ver licenças', rota: '/produto/lpco',
              })
          })
        }

        /* Cards extras para demonstração visual do carrossel */
        insights.push(
          {
            id: 'demo-ncm', variante: 'default',
            tag: 'Redução Tributária · NCM 8471',
            texto: <>Economize até <strong>12% em ICMS</strong> reclassificando 3 SKUs com enquadramento fiscal mais favorável.</>,
            stat: { label: 'Economia estimada', valor: 'R$ 23.400/mês' },
            textoLink: 'Ver análise completa', rota: '/produto/simula-custo',
          },
          {
            id: 'demo-frete', variante: 'default',
            tag: 'Oportunidade · BID Frete',
            texto: <>Há <strong>2 fornecedores novos</strong> cadastrados na sua rota SP–Manaus com tarifa até <strong>18% menor</strong>.</>,
            stat: { label: 'Melhor oferta', valor: 'R$ 4.200 / ton' },
            textoLink: 'Comparar fretes', rota: '/produto/bid-frete',
          },
          {
            id: 'demo-lpco', variante: 'warn',
            tag: 'Vencimento · LPCO',
            texto: <><strong>1 licença de importação</strong> vence em <strong>7 dias</strong>. Inicie a renovação para evitar bloqueio operacional.</>,
            textoLink: 'Renovar agora', rota: '/produto/lpco',
          },
          {
            id: 'demo-cambio', variante: 'default',
            tag: 'Câmbio · BID Câmbio',
            texto: <>Dólar em queda de <strong>1,4%</strong> esta semana. Boa janela para antecipar fechamento de câmbio.</>,
            stat: { label: 'USD/BRL atual', valor: 'R$ 5,12' },
            textoLink: 'Ver cotações', rota: '/produto/bid-cambio',
          },
          {
            id: 'demo-di', variante: 'warn',
            tag: 'Atenção · DI Pendente',
            texto: <><strong>3 Declarações de Importação</strong> aguardam parametrização há mais de <strong>5 dias</strong>.</>,
            textoLink: 'Ver DIs', rota: '/produto/lpco',
          },
          {
            id: 'demo-pedido', variante: 'default',
            tag: 'Pedido · NF Importação',
            texto: <>Pedido <strong>#PED-2041</strong> teve todas as notas fiscais emitidas. Pronto para faturamento.</>,
            stat: { label: 'Valor total', valor: 'R$ 187.300' },
            textoLink: 'Ver pedido', rota: '/produto/nf-importacao',
          },
          {
            id: 'demo-ncm2', variante: 'default',
            tag: 'Classificação · SimulaCusto',
            texto: <>GABI identificou <strong>5 NCMs</strong> com alíquota de II reduzida disponível por ex-tarifário.</>,
            stat: { label: 'Potencial de economia', valor: 'R$ 41.000/ano' },
            textoLink: 'Ver oportunidades', rota: '/produto/simula-custo',
          }
        )

        /* Fallback */
        if (insights.length === 0)
          insights.push({
            id: 'fallback', variante: 'default',
            tag: 'GABI AI · Pronta',
            texto: <>Sua assistente está pronta. Ative produtos para receber <strong>insights em tempo real</strong> das suas operações COMEX.</>,
            textoLink: 'Explorar produtos', rota: '/store',
          })

        if (!cancelled) { setGabiInsights(insights); setGabiLoading(false) }
      } catch {
        if (!cancelled) setGabiLoading(false)
      }
    }

    if (!carregando) fetchGabiInsights()
    return () => { cancelled = true }
  }, [carregando, produtosContratados, getToken])

  /* ══════════════════════════════════
     RENDER
  ══════════════════════════════════ */
  return (
    <div className="sw-shell sw-shell--no-sidebar">
      {/* ── PAGE (Hub sem menu lateral) ── */}
      <div className="sw-page sw-page--full">
        {/* TOPBAR */}
        <header className="sw-topbar">
          <div className="sw-t-brand">
            <LogoGlobal iconSize={22} iconColor="#818cf8" />
            <div className="sw-t-div" />
            <span className="sw-t-module-label">HUB</span>
          </div>
          <div className="sw-t-right">
            <LocalizarExpandidoCampoGlobal
              onBuscarNavigate={(term) => {
                const termLower = term.toLowerCase()
                // Buscar em workspaces
                const ws = workspaces.find(w => w.nome.toLowerCase().includes(termLower))
                if (ws) { setSelectedId(ws.id); return }
                // Buscar em produtos contratados
                const prod = produtosContratados.find(p => p.nome.toLowerCase().includes(termLower) || p.product_key.toLowerCase().includes(termLower))
                if (prod) { navigate(`/produto/${prod.product_key}`); return }
                // Buscar em catálogo
                const cat = catalogoProdutos.find(p => p.name.toLowerCase().includes(termLower))
                if (cat) { navigate('/workspace/assinaturas'); return }
                // Buscar em navItems
                const flat = navItems.flatMap(i => i.children ? i.children : [i])
                const target = flat.find(item => item.label?.toLowerCase().includes(termLower))
                if (target?.to) navigate(target.to)
              }}
            />

            <div className="sw-notif-wrap">
              <AvisoInternoGlobal
                avisos={avisos}
                onMarcarLido={handleMarcarLido}
                onMarcarTodosLidos={handleMarcarTodosLidos}
                onCriarAviso={handleCriarAviso}
              />
            </div>

            {/* Toggle de tooltips */}
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

            {/* Localizador — Onde estou */}
            <LocalizadorGlobal
              workspaceName={selectedWs?.nome ?? 'Gravity'}
              iconOnly
              currentProductId="hub"
              currentProductLabel="Hub"
              currentProductColor="#818cf8"
              currentPageLabel="Hub"
              history={locHistory}
              nodes={hubEcosystemNodes}
              onNavigate={(node) => {
                if (node.type === 'hub')               navigate('/hub')
                else if (node.type === 'core')         navigate('/core')
                else if (node.type === 'configurador') navigate('/configurador')
                else if (node.type === 'admin')        navigate('/admin/visao-geral')
              }}
            />

            {/* Seletor de idioma */}
            <LanguageSwitcherGlobal iconOnly />

            <div className="sw-t-sep" />

            {/* Configurações do workspace */}
            <button
              className="sw-t-icon"
              type="button"
              title={t('workspace.layout.modulo_nome')}
              onClick={() => navigate('/workspace/organizacao')}
            >
              <GearSix size={16} weight="duotone" />
            </button>

            <UsuarioGlobal
              userName={userName}
              userEmail={userEmail}
              userInitials={userInitials}
              userRole={userRole}
              isLight={isLight}
              onToggleTheme={toggleTheme}
              onNavigateWorkspace={() => navigate('/workspace/organizacao')}
              onNavigateMarketPlace={() => navigate('/store')}
              onSignOut={handleSair}
              isAdmin={isGravityAdmin}
              onNavigateAdmin={() => navigate('/admin/visao-geral')}
              compact
            />
          </div>
        </header>

        {/* CONTENT */}
        <div className="sw-content">
          {carregando ? (
            <div className="sw-loading">
              <div className="sw-loading-spinner" />
              <span>{t('sw.carregando')}</span>
            </div>
          ) : (
            <>
              {/* ════ BLOCO 1: WORKSPACES ════ */}
              <section className="sw-ws-section sw-a0">
                <div className="sw-ws-title-block">
                  <div className="sw-ws-title-row">
                    <span className="sw-ws-icon" aria-hidden="true">
                      <SquaresFour weight="duotone" size={24} />
                    </span>
                    <h1 className="sw-ws-title">{t('sw.titulo')}</h1>
                  </div>
                  <p className="sw-ws-sub">{t('sw.subtitulo')}</p>
                </div>

                <div className="sw-ws-search-wrap">
                  <span className="sw-ws-search-icon" aria-hidden="true">
                    <MagnifyingGlass size={15} weight="bold" />
                  </span>
                  <input
                    className="sw-ws-search"
                    type="text"
                    placeholder={t('sw.buscar_placeholder')}
                    value={wsSearch}
                    onChange={e => setWsSearch(e.target.value)}
                    aria-label={t('sw.buscar_aria')}
                  />
                  {wsSearch && (
                    <button
                      className="sw-ws-search-clear"
                      type="button"
                      onClick={() => setWsSearch('')}
                      aria-label={t('sw.limpar_busca')}
                    >×</button>
                  )}
                </div>

                <div className="sw-ws-carousel-wrap">
                  <button className="sw-carousel-btn sw-carousel-btn--left" type="button" onClick={() => scrollCarousel(wsCarouselRef, 'left')} aria-label="Anterior">
                    <CaretLeft size={16} weight="bold" />
                  </button>
                  <div className="sw-ws-grid" ref={wsCarouselRef}>
                    {wsFiltrados.length === 0 && (
                      <div className="sw-ws-empty-search">
                        <MagnifyingGlass size={22} weight="light" />
                        <span>{t('sw.nenhum_ws_encontrado')}"<strong>{wsSearch}</strong>"</span>
                      </div>
                    )}
                    {wsFiltrados.map(ws => (
                      <div
                        key={ws.id}
                        className={`sw-ws-card${ws.id === selectedId ? ' selected' : ''}${favoriteIds.has(ws.id) ? ' favorited' : ''}`}
                        data-searchable="true"
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
                          <div className="sw-ws-card-top-actions">
                            <TooltipGlobal
                              titulo={favoriteIds.has(ws.id) ? 'Remover dos favoritos' : 'Favoritar workspace'}
                              descricao={favoriteIds.has(ws.id) ? 'Clique para remover este workspace dos favoritos' : 'Marque como favorito para acessar rapidamente na próxima vez'}
                            >
                              <button
                                className={`sw-ws-fav-btn${favoriteIds.has(ws.id) ? ' active' : ''}`}
                                type="button"
                                onClick={e => toggleFavorite(e, ws.id)}
                                aria-label={favoriteIds.has(ws.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                              >
                                <Star size={14} weight={favoriteIds.has(ws.id) ? 'fill' : 'regular'} />
                              </button>
                            </TooltipGlobal>
                            <div className="sw-ws-check">
                              <Check size={12} color="white" weight="bold" />
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '-12px' }}>
                          <div className="sw-ws-name">{ws.nome}</div>
                          <div className="sw-ws-meta">
                            <span className="sw-ws-role">{ws.role}</span>
                          </div>
                        </div>

                        <div className="sw-ws-stats">
                          <div>
                            <div className="sw-ws-stat-n">{ws.modulos}</div>
                            <div className="sw-ws-stat-l">{t('sw.stat_produtos')}</div>
                          </div>
                          <div>
                            <div className="sw-ws-stat-n">{ws.membros}</div>
                            <div className="sw-ws-stat-l">{t('sw.stat_usuarios')}</div>
                          </div>
                        </div>

                        <button
                          className="sw-ws-enter-btn"
                          type="button"
                          onClick={e => {
                            e.stopPropagation()
                            handleSelectWs(ws.id)
                            setTimeout(() => {
                              sessionStorage.setItem('gravity_company_id', ws.id)
                              sessionStorage.setItem('gravity_company_name', ws.nome)
                              if (contratadosAtivos.length > 0) {
                                navigate('/core')
                              } else {
                                setModalSemProdutos(true)
                              }
                            }, 300)
                          }}
                          disabled={entrando}
                        >
                          {entrando ? t('sw.entrando') : t('sw.entrar_btn')}
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    ))}

                    {/* Criar novo workspace */}
                    <button className="sw-ws-add-card" type="button" onClick={handleCriarWorkspace}>
                      <Plus size={20} />
                      <span className="sw-ws-add-label">{t('sw.criar_workspace')}</span>
                    </button>
                  </div>
                  <button className="sw-carousel-btn sw-carousel-btn--right" type="button" onClick={() => scrollCarousel(wsCarouselRef, 'right')} aria-label="Próximo">
                    <CaretRight size={16} weight="bold" />
                  </button>
                </div>

                {/* GABI AI — carrossel dinâmico */}
                <div
                  className="sw-gabi-card sw-a1"
                  onMouseEnter={() => setGabiPaused(true)}
                  onMouseLeave={() => setGabiPaused(false)}
                >
                  <div className="sw-gabi-card-watermark" aria-hidden="true">
                    <Sparkle weight="fill" size={200} />
                  </div>
                  <div className="sw-gabi-card-main">
                    {/* Header */}
                    <div className="sw-gabi-card-top-row">
                      <div className="sw-gabi-card-header">
                        <div className="sw-gabi-card-avatar">
                          <Sparkle weight="fill" size={14} color="#fff" />
                        </div>
                        <span className="sw-gabi-card-label">{t('sw.gabi_label')}</span>
                      </div>
                      <div className="sw-gabi-header-right">
                        <button
                          className="sw-gabi-nav-btn"
                          type="button"
                          onClick={() => scrollCarousel(gabiCarouselRef, 'left')}
                          disabled={gabiInsights.length <= 1}
                          aria-label="Insight anterior"
                        >
                          <CaretLeft size={12} weight="bold" />
                        </button>
                        <button
                          className="sw-gabi-nav-btn"
                          type="button"
                          onClick={() => scrollCarousel(gabiCarouselRef, 'right')}
                          disabled={gabiInsights.length <= 1}
                          aria-label="Próximo insight"
                        >
                          <CaretRight size={12} weight="bold" />
                        </button>
                        <span className="sw-gabi-live-badge">
                          <span className="sw-gabi-live-dot" />
                          {t('sw.ao_vivo')}
                        </span>
                      </div>
                    </div>

                      {/* Track horizontal */}
                      {gabiLoading ? (
                        <div className="sw-gabi-insights-track">
                          {[0, 1, 2].map(i => (
                            <div key={i} className="sw-gabi-insight-card sw-gabi-insight-card--skeleton">
                              <div className="sw-gabi-skeleton-line sw-gabi-skeleton-line--short" />
                              <div className="sw-gabi-skeleton-line" />
                              <div className="sw-gabi-skeleton-line" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="sw-gabi-insights-track" ref={gabiCarouselRef}>
                          {gabiInsights.map(ins => (
                            <div
                              key={ins.id}
                              className={`sw-gabi-insight-card${ins.variante === 'warn' ? ' sw-gabi-insight-card--warn' : ''}`}
                            >
                              <div className={`sw-gabi-insight-tag${ins.variante === 'warn' ? ' sw-gabi-insight-tag--warn' : ''}`}>
                                {ins.variante === 'warn'
                                  ? <Warning size={11} weight="fill" />
                                  : <RocketLaunch size={11} weight="fill" />}
                                {ins.tag}
                              </div>
                              <p className="sw-gabi-insight-text">{ins.texto}</p>
                              <div className="sw-gabi-insight-bottom">
                                {ins.stat && (
                                  <div className="sw-gabi-insight-stat">
                                    <span className="sw-gabi-insight-stat-label">{ins.stat.label}</span>
                                    <span className="sw-gabi-insight-stat-value">{ins.stat.valor}</span>
                                  </div>
                                )}
                                <button
                                  className="sw-gabi-insight-link"
                                  type="button"
                                  onClick={() => navigate(ins.rota)}
                                >
                                  {ins.textoLink} <CaretRight size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
              </section>

              {/* ════ BLOCO 2: PRODUTOS ════ */}
              <section className="sw-products-section sw-a1">
                <div className="sw-prod-panel sw-prod-panel--unified">
                  <div className="sw-prod-panel-head">
                    <span className="sw-prod-panel-title contracted">
                      <Package weight="duotone" size={15} />
                      Produtos Gravity
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="sw-sec-count">
                        {contratadosAtivos.length}/{contratadosAtivos.length + produtosSugeridos.length} {t('sw.ativos')}
                      </span>
                      <button className="sw-btn-ver-catalogo" type="button" onClick={() => navigate('/store')}>
                        {t('sw.ver_catalogo')} <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>

                  <div className="sw-prod-list">
                    {/* Contratados e habilitados */}
                    {contratadosAtivos.map(prod => {
                      const iconData = getProdutoIcon(prod.product_key)
                      const rota = PRODUCT_ROUTE_MAP[prod.product_key]?.rota ?? `/produto/${prod.product_key}`
                      return (
                        <div
                          key={prod.product_key}
                          className="sw-prod-item sw-prod-item--active"
                          data-searchable="true"
                          onClick={() => navigate(rota)}
                        >
                          <div className="sw-prod-icon" style={{ background: iconData.bg, color: iconData.color }}>
                            {iconData.icon}
                          </div>
                          <div className="sw-prod-body">
                            <div className="sw-prod-name">{prod.nome}</div>
                            <div className="sw-prod-desc">{prod.descricao}</div>
                          </div>
                          <div className="sw-prod-right">
                            <span className="sw-badge sw-b-active">{t('sw.ativo')}</span>
                            <button
                              className="sw-btn-acessar"
                              type="button"
                              onClick={e => { e.stopPropagation(); navigate(rota) }}
                            >
                              Acessar <ArrowRight size={10} weight="bold" />
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    {/* Não contratados — bloqueados com "Assine agora" */}
                    {produtosSugeridos.map(prod => {
                      const iconData = getProdutoIcon(prod.slug)
                      const isActive = prod.status === 'ACTIVE' || prod.status === 'Ativo'
                      return (
                        <div
                          key={prod.id}
                          className="sw-prod-item sw-prod-item--locked"
                          data-searchable="true"
                        >
                          <div className="sw-prod-icon" style={{ background: iconData.bg, color: iconData.color, opacity: 0.5 }}>
                            {iconData.icon}
                          </div>
                          <div className="sw-prod-body">
                            <div className="sw-prod-name">{prod.name}</div>
                            <div className="sw-prod-desc">{prod.description ?? ''}</div>
                          </div>
                          <div className="sw-prod-right">
                            {isActive ? (
                              <button
                                className="sw-btn-contratar"
                                type="button"
                                onClick={() => navigate(`/store?produto=${prod.slug}`)}
                              >
                                Assine agora <ArrowRight size={11} weight="bold" />
                              </button>
                            ) : (
                              <span className="sw-badge sw-b-trial">{t('sw.em_breve')}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>

            </>
          )}
        </div>
      </div>
      <ModalGlobal
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
      </ModalGlobal>

      <ToastContainer />
    </div>
  )
}
