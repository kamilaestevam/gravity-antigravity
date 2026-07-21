import { Fragment, useState, useEffect, useRef, type CSSProperties } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ClipboardText,
  Package,
  Truck,
  CurrencyDollar,
  Calculator as CalcIcon,
  FileText,
  Sparkle,
  ArrowRight,
  Rocket,
  Star,
  Globe,
  Anchor,
  ShieldCheck,
  TrendUp,
  Buildings,
  CalendarBlank,
} from '@phosphor-icons/react'
import { OnboardingPreview } from '../components/flows/OnboardingPreview'
import { PaywallDrawer } from '../components/flows/ModalPaywallDrawer'
import { InteractiveSimulator } from '../components/InteractiveSimulator'
import { FlexibleProductSelectionFlow } from '../components/FlexibleProductSelectionFlow'
import '../styles/home.css'

const PRODUCTS = [
  {
    id: 'pedido',
    icon: <Package size={26} weight="duotone" />,
    name: 'Pedido',
    tagline: 'Insights, lista, pipeline e gestão de processos COMEX',
    desc: 'Panorama de pedidos com globo animado, KPIs, lista operacional e Kanban por etapa — saldo automático e rastreabilidade ponta a ponta.',
    tags: ['Insights', 'Kanban', 'Rastreabilidade'],
    cat: 'Operações',
    catColor: '#fbbf24',
    catBg: 'rgba(217,119,6,0.1)',
    catBorder: 'rgba(251,191,36,0.25)',
    price: 'R$ 1,99',
    unit: '/ processo',
  },
  {
    id: 'bid-frete',
    icon: <Truck size={26} weight="duotone" />,
    name: 'BID Frete',
    tagline: 'Licitação inteligente de fretes internacionais',
    desc: 'Compare ofertas de múltiplos fornecedores com ranking automático, cálculo de savings e aprovação em 2 cliques.',
    tags: ['Ranking automático', 'Multi-fornecedor', 'Savings'],
    cat: 'Cotações',
    catColor: '#fbbf24',
    catBg: 'rgba(245,158,11,0.1)',
    catBorder: 'rgba(245,158,11,0.25)',
    price: 'R$ 1,99',
    unit: '/ cotação',
  },
  {
    id: 'bid-cambio',
    icon: <CurrencyDollar size={26} weight="duotone" />,
    name: 'BID Câmbio',
    tagline: 'Marketplace de corretoras de câmbio',
    desc: 'Comparativo automático entre corretoras com PTAX integrado e cálculo de economia para suas operações de COMEX.',
    tags: ['Comparativo', 'PTAX integrado', 'Economia real'],
    cat: 'Cotações',
    catColor: '#06b6d4',
    catBg: 'rgba(6,182,212,0.1)',
    catBorder: 'rgba(6,182,212,0.25)',
    price: 'R$ 2,99',
    unit: '/ cotação',
  },
  {
    id: 'simula-custo',
    icon: <CalcIcon size={26} weight="duotone" />,
    name: 'Simula Custo',
    tagline: 'Simulação de custos de importação e exportação',
    desc: 'Calcule o custo real das suas operações com múltiplos cenários, impostos automáticos e projeção de margens.',
    tags: ['Multi-cenário', 'Impostos automáticos', 'Margem'],
    cat: 'Simulação',
    catColor: '#10b981',
    catBg: 'rgba(16,185,129,0.1)',
    catBorder: 'rgba(16,185,129,0.25)',
    price: 'R$ 10,99',
    unit: '/ mês',
  },
  {
    id: 'nf-importacao',
    icon: <FileText size={26} weight="duotone" />,
    name: 'NF Importação',
    tagline: 'Notas fiscais de importação sem burocracia',
    desc: 'Gestão completa de NFs de importação com DI vinculada, rateio automático de despesas e exportação contábil.',
    tags: ['DI vinculada', 'Rateio automático', 'Contábil'],
    cat: 'Operações',
    catColor: '#3b82f6',
    catBg: 'rgba(59,130,246,0.1)',
    catBorder: 'rgba(59,130,246,0.2)',
    price: 'R$ 1,99',
    unit: '/ documento',
  },
  {
    id: 'smart-read',
    icon: <Sparkle size={26} weight="duotone" />,
    name: 'Smart Docs',
    tagline: 'Inteligência documental com IA para COMEX',
    desc: 'Extração automática, conferência, análise de riscos e Q&A com IA sobre qualquer documento de comércio exterior.',
    tags: ['Extração com IA', 'Q&A documental', 'Riscos'],
    cat: 'Inteligência',
    catColor: '#a855f7',
    catBg: 'rgba(168,85,247,0.1)',
    catBorder: 'rgba(168,85,247,0.25)',
    price: 'R$ 2,00',
    unit: '/ análise',
  },
]

const PARTNERS = [
  { name: 'MAERSK LINE', icon: <Globe size={18} /> },
  { name: 'MSC SHIPPING', icon: <Anchor size={18} /> },
  { name: 'CMA CGM', icon: <Globe size={18} /> },
  { name: 'HAPAG-LLOYD', icon: <Anchor size={18} /> },
  { name: 'PORT DE SANTOS', icon: <Globe size={18} /> },
  { name: 'RECEITA FEDERAL', icon: <ShieldCheck size={18} /> },
  { name: 'TRADINGS BRASIL', icon: <TrendUp size={18} /> },
  { name: 'ALFÂNDEGA LOG', icon: <ShieldCheck size={18} /> },
]


interface ModuloHero {
  id: string
  numero: string
  nome: string
  descricao: string
  cor: string
  corRgb: string
  lado: 'esquerda' | 'direita'
  /* De onde a linha conectora sai do card: pela lateral (padrão) ou pelo topo */
  saida?: 'lado' | 'topo'
  bottom: number
  offset: number
}

/* Pilha do hero — só os produtos no ar (01–03). Os demais vivem no backlog. */
const MODULOS_HERO: ModuloHero[] = [
  {
    id: 'pedido',
    numero: '01',
    nome: 'Pedidos',
    descricao: 'Gestão de pedidos de importação e exportação.',
    cor: '#d97706',
    corRgb: '217, 119, 6',
    lado: 'esquerda',
    saida: 'topo',
    bottom: 385,
    offset: -50,
  },
  {
    id: 'smart-read',
    numero: '02',
    nome: 'Smart Docs',
    descricao: 'IA lê, extrai e analisa dados em segundos.',
    cor: '#a855f7',
    corRgb: '168, 85, 247',
    lado: 'direita',
    saida: 'topo',
    bottom: 300,
    offset: -50,
  },
  {
    id: 'bid-frete',
    numero: '03',
    nome: 'BID Frete Internacional',
    descricao: 'Gestão de cotações marítimas, aéreas e rodoviárias — Impo / Expo.',
    cor: '#fbbf24',
    corRgb: '251, 191, 36',
    lado: 'esquerda',
    bottom: 215,
    offset: -50,
  },
]

/* Seção Transparência · Nosso backlog */
type GrupoBacklog = 'dev' | 'breve' | 'planejado'

interface ModuloBacklog {
  id: string
  grupo: GrupoBacklog
  nome: string
  numero: string
  cor: string
  descricao: string
  prazo: string
  status: string
  listaEspera: number
  /** Datas ISO 'AAAA-MM-DD'. Com as duas definidas, o progresso do módulo
   * cresce sozinho a cada dia, do peso do status até 95% na data de entrega. */
  dataInicio?: string
  dataEntrega?: string
}

const BACKLOG_TABS: { id: GrupoBacklog; rotulo: string; cor: string }[] = [
  { id: 'dev', rotulo: 'Em desenvolvimento', cor: '#818cf8' },
  { id: 'breve', rotulo: 'Em breve · 2026', cor: '#fbbf24' },
  { id: 'planejado', rotulo: 'Planejado · 2027', cor: '#94a3b8' },
]

const MODULOS_BACKLOG: ModuloBacklog[] = [
  {
    id: 'bid-cambio',
    grupo: 'dev',
    nome: 'BID Câmbio',
    numero: '04',
    cor: '#06b6d4',
    descricao: 'Cotações de câmbio em tempo real e gestão inteligente.',
    prazo: 'Outubro/2026',
    status: 'Em desenvolvimento',
    listaEspera: 264,
    dataInicio: '2026-04-15',
    dataEntrega: '2026-10-01',
  },
  {
    id: 'simula-custo',
    grupo: 'dev',
    nome: 'Simula Custo',
    numero: '05',
    cor: '#10b981',
    descricao: 'Simulação de impostos e custos da importação antes de fechar.',
    prazo: 'Outubro/2026',
    status: 'Em desenvolvimento',
    listaEspera: 218,
    dataInicio: '2026-04-01',
    dataEntrega: '2026-10-01',
  },
  {
    id: 'smart-transito',
    grupo: 'dev',
    nome: 'Smart Trânsito',
    numero: '06',
    cor: '#ec4899',
    descricao: 'Rastreamento inteligente de cargas em trânsito, ponta a ponta.',
    prazo: 'Outubro/2026',
    status: 'Em desenvolvimento',
    listaEspera: 154,
    dataInicio: '2026-05-15',
    dataEntrega: '2026-10-15',
  },
  {
    id: 'duimp',
    grupo: 'breve',
    nome: 'DUIMP',
    numero: '07',
    cor: '#f43f5e',
    descricao: 'Declaração Única de Importação integrada ao Portal Único Siscomex.',
    prazo: 'Outubro/2026',
    status: 'Em especificação',
    listaEspera: 342,
    dataInicio: '2026-07-01',
    dataEntrega: '2026-10-15',
  },
  {
    id: 'due',
    grupo: 'breve',
    nome: 'DUE',
    numero: '08',
    cor: '#84cc16',
    descricao: 'Declaração Única de Exportação com preenchimento assistido.',
    prazo: 'Novembro/2026',
    status: 'Em especificação',
    listaEspera: 187,
    dataInicio: '2026-07-15',
    dataEntrega: '2026-11-15',
  },
  {
    id: 'catalogo-produtos',
    grupo: 'breve',
    nome: 'Catálogo de Produtos',
    numero: '09',
    cor: '#14b8a6',
    descricao: 'Cadastro central de NCM, atributos e catálogo Siscomex.',
    prazo: 'Dezembro/2026',
    status: 'Descoberta',
    listaEspera: 96,
    dataInicio: '2026-08-01',
    dataEntrega: '2026-12-01',
  },
  {
    id: 'nf-importacao',
    grupo: 'breve',
    nome: 'NF Impo/Expo',
    numero: '10',
    cor: '#3b82f6',
    descricao: 'Emissão e conferência de notas de importação e exportação.',
    prazo: 'Dezembro/2026',
    status: 'Descoberta',
    listaEspera: 129,
    dataInicio: '2026-08-15',
    dataEntrega: '2026-12-15',
  },
  {
    id: 'financeiro',
    grupo: 'planejado',
    nome: 'Financeiro',
    numero: '11',
    cor: '#6366f1',
    descricao: 'Contas, câmbio e fluxo de caixa da operação em um só lugar.',
    prazo: '2027',
    status: 'No radar',
    listaEspera: 87,
  },
  {
    id: 'smart-data',
    grupo: 'planejado',
    nome: 'Smart Data',
    numero: '12',
    cor: '#f97316',
    descricao: 'Analytics e BI sobre toda a sua operação COMEX.',
    prazo: '2027',
    status: 'No radar',
    listaEspera: 63,
  },
]

/*
 * Evolução da plataforma — métrica fixa, sem atualização manual do %.
 * Duas fontes, ambas automáticas:
 * 1. Estágio: cada status tem um peso base (PESO_STATUS_BACKLOG).
 * 2. Tempo: módulo com dataInicio + dataEntrega cresce linearmente a cada dia,
 *    do peso base até 95% na data de entrega. Os 5% finais só quando o módulo
 *    sai do backlog e entra em MODULOS_NO_AR (evita marcar 100% sem estar no ar).
 */
const MODULOS_NO_AR = 3

const PESO_STATUS_BACKLOG: Record<string, number> = {
  'Em desenvolvimento': 0.6,
  'Em especificação': 0.25,
  'Descoberta': 0.1,
  'No radar': 0,
}

const TETO_PROGRESSO_BACKLOG = 0.95

const MESES_ROTULO_BACKLOG = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

/** Rótulo de prazo do card: derivado da dataEntrega quando existe (ex.: "Outubro/2026"). */
function rotuloEntrega(modulo: ModuloBacklog): string {
  if (!modulo.dataEntrega) return modulo.prazo
  const data = new Date(`${modulo.dataEntrega}T00:00:00`)
  return `${MESES_ROTULO_BACKLOG[data.getMonth()]}/${data.getFullYear()}`
}

function progressoModulo(modulo: ModuloBacklog, hoje = new Date()): number {
  const base = PESO_STATUS_BACKLOG[modulo.status] ?? 0
  if (!modulo.dataInicio || !modulo.dataEntrega) return base
  const inicio = new Date(`${modulo.dataInicio}T00:00:00`).getTime()
  const entrega = new Date(`${modulo.dataEntrega}T00:00:00`).getTime()
  if (entrega <= inicio) return base
  const fracaoTempo = Math.min(Math.max((hoje.getTime() - inicio) / (entrega - inicio), 0), 1)
  return base + (TETO_PROGRESSO_BACKLOG - base) * fracaoTempo
}

function progressoModuloPct(modulo: ModuloBacklog): number {
  return Math.round(progressoModulo(modulo) * 1000) / 10
}

function progressoPlataforma(): number {
  const totalModulos = MODULOS_NO_AR + MODULOS_BACKLOG.length
  const pontos = MODULOS_NO_AR
    + MODULOS_BACKLOG.reduce((soma, m) => soma + progressoModulo(m), 0)
  return Math.round((pontos / totalModulos) * 1000) / 10
}

interface ConexaoModulo {
  x1: number
  y1: number
  x2: number
  y2: number
}

function conexoesIguais(a: Record<string, ConexaoModulo>, b: Record<string, ConexaoModulo>) {
  const chaves = Object.keys(b)
  if (Object.keys(a).length !== chaves.length) return false
  return chaves.every(k => {
    const ca = a[k]
    const cb = b[k]
    return ca && ca.x1 === cb.x1 && ca.y1 === cb.y1 && ca.x2 === cb.x2 && ca.y2 === cb.y2
  })
}

const DEMO_SIMULADORES = new Set(['pedido', 'bid-frete', 'smart-read'])

export function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null)
  const [pedidoRevealFx, setPedidoRevealFx] = useState(false)
  const [moduloDestacadoId, setModuloDestacadoId] = useState<string | null>(null)
  const [conexoesModulos, setConexoesModulos] = useState<Record<string, ConexaoModulo>>({})
  const pedidoRevealTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stackContainerRef = useRef<HTMLDivElement | null>(null)
  const labelModuloRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const layerModuloRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [backlogTab, setBacklogTab] = useState<GrupoBacklog>('breve')
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const demo = searchParams.get('demo')
    if (!demo || !DEMO_SIMULADORES.has(demo)) return
    setSelectedScreen(demo)
    const next = new URLSearchParams(searchParams)
    next.delete('demo')
    setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])

  const activeProduct = PRODUCTS.find(p => p.id === selectedScreen)
  const activeRgb = activeProduct
    ? (activeProduct.id === 'pedido' ? '217, 119, 6' :
       activeProduct.id === 'bid-frete' ? '251, 191, 36' :
       activeProduct.id === 'bid-cambio' ? '6, 182, 212' :
       activeProduct.id === 'simula-custo' ? '16, 185, 129' :
       activeProduct.id === 'nf-importacao' ? '59, 130, 246' :
       '168, 85, 247')
    : '99, 102, 241'

  // Refs de histerese: o destaque só troca ao ENTRAR em outra placa (nunca ao sair),
  // com cooldown — evita oscilação quando a placa levanta e sai de baixo do cursor parado
  const moduloDestacadoRef = useRef<string | null>(null)
  const ultimaTrocaDestaqueRef = useRef(0)

  const aplicarDestaque = (id: string | null) => {
    moduloDestacadoRef.current = id
    setModuloDestacadoId(id)
  }

  const closeScreen = () => {
    setSelectedScreen(null)
    setPedidoRevealFx(false)
    aplicarDestaque(null)
  }

  const abrirModuloPedido = () => {
    if (selectedScreen === 'pedido') return
    aplicarDestaque('pedido')
    setPedidoRevealFx(true)
    if (pedidoRevealTimer.current) clearTimeout(pedidoRevealTimer.current)
    pedidoRevealTimer.current = setTimeout(() => {
      setSelectedScreen('pedido')
      setPedidoRevealFx(false)
      aplicarDestaque(null)
    }, 340)
  }

  const destacarModulo = (id: string) => {
    if (moduloDestacadoRef.current === id) return
    const agora = performance.now()
    if (agora - ultimaTrocaDestaqueRef.current < 300) return
    ultimaTrocaDestaqueRef.current = agora
    aplicarDestaque(id)
  }

  const removerDestaqueModulo = (id: string) => {
    if (pedidoRevealFx && id === 'pedido') return
    if (moduloDestacadoRef.current === id) aplicarDestaque(null)
  }

  const limparDestaquePilha = () => {
    if (pedidoRevealFx) return
    aplicarDestaque(null)
  }

  const modulo01Destacado = moduloDestacadoId === 'pedido'

  useEffect(() => () => {
    if (pedidoRevealTimer.current) clearTimeout(pedidoRevealTimer.current)
  }, [])

  // Mede continuamente a posição rótulo ↔ camada para desenhar as linhas conectoras.
  // rAF é necessário porque as camadas 3D transladam com transitions CSS longas.
  useEffect(() => {
    let frame = 0
    let anterior: Record<string, ConexaoModulo> = {}

    const medir = () => {
      frame = requestAnimationFrame(medir)
      const container = stackContainerRef.current
      if (!container) return
      const base = container.getBoundingClientRect()
      const proximo: Record<string, ConexaoModulo> = {}

      for (const modulo of MODULOS_HERO) {
        const label = labelModuloRefs.current[modulo.id]
        const layer = layerModuloRefs.current[modulo.id]
        if (!label || !layer) continue
        const lr = label.getBoundingClientRect()
        const cr = layer.getBoundingClientRect()
        if (lr.width === 0 || cr.width === 0) continue

        const saidaTopo = modulo.saida === 'topo'
        const x1 = saidaTopo
          ? lr.left + lr.width / 2 - base.left
          : (modulo.lado === 'esquerda' ? lr.right : lr.left) - base.left
        const y1 = (saidaTopo ? lr.top : lr.top + lr.height / 2) - base.top
        // Ancora na borda do losango isométrico voltada para o rótulo (~28% para dentro do bbox)
        const x2 = (modulo.lado === 'esquerda'
          ? cr.left + cr.width * 0.28
          : cr.right - cr.width * 0.28) - base.left
        const y2 = cr.top + cr.height / 2 - base.top

        proximo[modulo.id] = {
          x1: Math.round(x1 * 2) / 2,
          y1: Math.round(y1 * 2) / 2,
          x2: Math.round(x2 * 2) / 2,
          y2: Math.round(y2 * 2) / 2,
        }
      }

      if (!conexoesIguais(anterior, proximo)) {
        anterior = proximo
        setConexoesModulos(proximo)
      }
    }

    frame = requestAnimationFrame(medir)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Handle ESC key to close active screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeScreen()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="home">
      <OnboardingPreview open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      <PaywallDrawer open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* ===== HERO ===== */}
      <section
        className="hero"
        onMouseLeave={() => {
          if (!selectedScreen) closeScreen()
        }}
        onClick={(e) => {
          if (selectedScreen) return
          const target = e.target as HTMLElement
          if (target.closest('a') || target.closest('button') || target.closest('input') || target.closest('select')) {
            return
          }
          closeScreen()
        }}
      >
        {/* Glow Effects */}
        <div className="container">
          <div className={`hero__content ${selectedScreen ? 'hero__content--dimmed' : ''}`}>
            <div className="hero__badge">
              <Star size={13} weight="fill" style={{ color: '#818cf8' }} />
              <span>Plataforma de COMEX · Sem cartão de crédito</span>
            </div>

            <h1 className="hero__title">
              <span className="hero__title-line">Sua operação de</span>
              <span className="hero__title-line gradient-text">comércio exterior</span>
              <span className="hero__title-line">no próximo nível</span>
            </h1>

            <p className="hero__subtitle">
              Da cotação de frete ao câmbio, da gestão de pedidos à conferência com IA — tudo integrado, modular e pronto para escalar.
            </p>

            <div className="hero__ctas">
              <a href="/cadastro?trial=true" className="btn btn-gradient btn-lg">
                <Rocket size={18} weight="duotone" />
                Testar gratuitamente
              </a>
              <Link to="/produtos" className="btn btn-secondary btn-lg">
                Ver módulos
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="hero__trust">
              {['Sem cartão de crédito', 'Ativo em minutos', 'Cancele quando quiser'].map(item => (
                <div key={item} className="hero__trust-item">
                  <span className="hero__trust-check">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efeito 3D Interativo: Giro Flat ao clicar, com Reset ao sair com o mouse */}
          <div
            ref={stackContainerRef}
            className={`stack-3d-container ${selectedScreen ? 'has-active-layer' : ''}`}
            style={{ '--active-layer-rgb': activeRgb } as CSSProperties}
            onMouseLeave={limparDestaquePilha}
          >
            {/* Linhas conectoras dinâmicas: rótulo ↔ camada, medidas em tempo real */}
            <svg className="stack-links-svg" aria-hidden="true">
              <defs>
                {MODULOS_HERO.map(modulo => (
                  <linearGradient key={modulo.id} id={`stack-link-grad-${modulo.id}`} gradientUnits="userSpaceOnUse"
                    x1={conexoesModulos[modulo.id]?.x1 ?? 0}
                    y1={conexoesModulos[modulo.id]?.y1 ?? 0}
                    x2={conexoesModulos[modulo.id]?.x2 ?? 0}
                    y2={conexoesModulos[modulo.id]?.y2 ?? 0}
                  >
                    <stop offset="0%" stopColor={modulo.cor} stopOpacity="0.9" />
                    <stop offset="55%" stopColor={modulo.cor} stopOpacity="0.45" />
                    <stop offset="100%" stopColor={modulo.cor} stopOpacity="0.12" />
                  </linearGradient>
                ))}
              </defs>
              {MODULOS_HERO.map(modulo => {
                const c = conexoesModulos[modulo.id]
                if (!c) return null
                const destacado = moduloDestacadoId === modulo.id
                // Traçado ortogonal (estilo circuito) com canto arredondado.
                // Saída "lado": horizontal e depois vertical. Saída "topo": vertical e depois horizontal.
                const dirX = c.x2 >= c.x1 ? 1 : -1
                const dirY = c.y2 >= c.y1 ? 1 : -1
                const raio = Math.min(10, Math.abs(c.x2 - c.x1), Math.abs(c.y2 - c.y1))
                const path = modulo.saida === 'topo'
                  ? [
                      `M ${c.x1} ${c.y1}`,
                      `L ${c.x1} ${c.y2 + raio * -dirY}`,
                      `Q ${c.x1} ${c.y2} ${c.x1 + raio * dirX} ${c.y2}`,
                      `L ${c.x2} ${c.y2}`,
                    ].join(' ')
                  : [
                      `M ${c.x1} ${c.y1}`,
                      `L ${c.x2 - raio * dirX} ${c.y1}`,
                      `Q ${c.x2} ${c.y1} ${c.x2} ${c.y1 + raio * dirY}`,
                      `L ${c.x2} ${c.y2}`,
                    ].join(' ')
                return (
                  <g key={modulo.id} className={`stack-link ${destacado ? 'stack-link--ativo' : ''}`} style={{ color: modulo.cor }}>
                    <path className="stack-link__halo" d={path} stroke={modulo.cor} />
                    <path className="stack-link__linha" d={path} stroke={`url(#stack-link-grad-${modulo.id})`} />
                    <path className="stack-link__fluxo" d={path} stroke={modulo.cor} />
                    <circle className="stack-link__origem" cx={c.x1} cy={c.y1} r="2.5" fill={modulo.cor} />
                    <circle className="stack-link__alvo" cx={c.x2} cy={c.y2} r="3" fill={modulo.cor} />
                    <circle className="stack-link__pulso" cx={c.x2} cy={c.y2} r="3" fill="none" stroke={modulo.cor} />
                  </g>
                )
              })}
            </svg>

            {/* Rótulos Flutuantes de Informações */}
            {MODULOS_HERO.map(modulo => {
              const destacado = moduloDestacadoId === modulo.id
              const emReveal = modulo.id === 'pedido' && pedidoRevealFx
              const posicao: CSSProperties = modulo.lado === 'esquerda'
                ? { bottom: `${modulo.bottom}px`, left: `${modulo.offset}px` }
                : { bottom: `${modulo.bottom}px`, right: `${modulo.offset}px`, left: 'auto' }
              return (
                <div
                  key={modulo.id}
                  ref={el => { labelModuloRefs.current[modulo.id] = el }}
                  className={`stack-label-float stack-label-float--clickable ${destacado || emReveal ? 'stack-label-float--destaque' : ''}`}
                  style={{
                    ...posicao,
                    '--layer-color': modulo.cor,
                    '--layer-color-rgb': modulo.corRgb,
                  } as CSSProperties}
                  role="button"
                  tabIndex={0}
                  aria-label={`Módulo ${modulo.numero} — ${modulo.nome}. ${modulo.descricao}`}
                  onMouseEnter={() => destacarModulo(modulo.id)}
                  onMouseLeave={() => removerDestaqueModulo(modulo.id)}
                  onFocus={() => destacarModulo(modulo.id)}
                  onBlur={() => removerDestaqueModulo(modulo.id)}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (modulo.id === 'pedido') {
                      abrirModuloPedido()
                    } else if (selectedScreen !== modulo.id) {
                      setSelectedScreen(modulo.id)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      if (modulo.id === 'pedido') {
                        abrirModuloPedido()
                      } else if (selectedScreen !== modulo.id) {
                        setSelectedScreen(modulo.id)
                      }
                    }
                  }}
                >
                  <span className="stack-label-float__kicker">
                    <span className="stack-label-float__dot" />
                    MÓDULO {modulo.numero}
                  </span>
                  <span className="stack-label-float__nome">{modulo.nome}</span>
                  <span className="stack-label-float__descricao">{modulo.descricao}</span>
                  <span className="stack-label-float__cta">
                    Explorar módulo
                    <ArrowRight size={11} weight="bold" />
                  </span>
                </div>
              )
            })}

            {/* Palco Isométrico 3D */}
            <div className={`stack-3d-wrapper ${selectedScreen ? 'has-active-layer' : ''}`}>
              {/* Placa 06: Smart Docs */}
              <div
                ref={el => { layerModuloRefs.current['smart-read'] = el }}
                className={`stack-layer stack-layer-smart-read ${selectedScreen === 'smart-read' ? 'active' : ''} ${moduloDestacadoId === 'smart-read' ? 'stack-layer--sync' : ''}`}
                role="button"
                tabIndex={0}
                onMouseEnter={() => destacarModulo('smart-read')}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen !== 'smart-read') {
                    setSelectedScreen('smart-read')
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  {selectedScreen === 'smart-read' ? (
                    <InteractiveSimulator productId="smart-read" onClose={closeScreen} />
                  ) : (
                    <>
                      <div className="slab-image-bg" style={{ backgroundImage: "url('/telas/tela_site_smart_doc.png')" }} />
                      <div className="slab-content">
                        <span className="slab-icon"><Sparkle size={16} weight="duotone" /></span>
                      </div>
                      <span className="slab-tag">IA</span>
                    </>
                  )}
                </div>
              </div>

              {/* Placa 01: Insights — preview sem rótulo; clique revela simulador */}
              <div
                ref={el => { layerModuloRefs.current['pedido'] = el }}
                className={`stack-layer stack-layer-pedido ${selectedScreen === 'pedido' ? 'active' : ''} ${pedidoRevealFx ? 'stack-layer-pedido--reveal' : ''} ${modulo01Destacado ? 'stack-layer--sync' : ''}`}
                role="button"
                tabIndex={0}
                aria-label="Módulo 01 Pedidos — abrir simulador"
                onMouseEnter={() => destacarModulo('pedido')}
                onClick={(e) => {
                  e.stopPropagation()
                  abrirModuloPedido()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    abrirModuloPedido()
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  {selectedScreen === 'pedido' ? (
                    <InteractiveSimulator productId="pedido" onClose={closeScreen} />
                  ) : (
                    <>
                      <div
                        className="slab-image-bg slab-image-bg--modulo-01"
                        style={{ backgroundImage: "url('/telas/tela_site_pedido_insights.png')" }}
                      />
                      <div className="slab-content">
                        <span className="slab-icon"><Package size={16} weight="duotone" /></span>
                      </div>
                      <span className="slab-modulo-numero" aria-hidden>01</span>
                      <span className="slab-modulo-cta" aria-hidden>
                        <Package size={20} weight="duotone" />
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Placa 02: BID Frete */}
              <div
                ref={el => { layerModuloRefs.current['bid-frete'] = el }}
                className={`stack-layer stack-layer-bid-frete ${selectedScreen === 'bid-frete' ? 'active' : ''} ${moduloDestacadoId === 'bid-frete' ? 'stack-layer--sync' : ''}`}
                role="button"
                tabIndex={0}
                onMouseEnter={() => destacarModulo('bid-frete')}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen !== 'bid-frete') {
                    setSelectedScreen('bid-frete')
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  {selectedScreen === 'bid-frete' ? (
                    <InteractiveSimulator productId="bid-frete" onClose={closeScreen} />
                  ) : (
                    <>
                      <div className="slab-image-bg" style={{ backgroundImage: "url('/telas/tela_site_bid_frete.png')" }} />
                      <div className="slab-content">
                        <span className="slab-icon"><Truck size={16} weight="duotone" /></span>
                      </div>
                      <span className="slab-tag">Logística</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FlexibleProductSelectionFlow />

      {/* ===== ROLLING MARQUEE LOGOS ===== */}
      <section className="logos-section">
        <div className="container">
          <p className="logos-section__title">Integrado com operadores de escala mundial</p>
          <div className="marquee-container">
            <div className="marquee-track">
              {/* Render twice for seamless loop */}
              {[...PARTNERS, ...PARTNERS].map((partner, idx) => (
                <div key={idx} className="marquee-item">
                  <span className="marquee-icon">{partner.icon}</span>
                  <span>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRANSPARÊNCIA · NOSSO BACKLOG ===== */}
      <section className="section" style={{ background: 'var(--bg-body-dark)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div className="container">
          <div className="backlog-wrapper">
            <div className="backlog-header">
              <p className="text-micro" style={{ color: 'var(--accent)', letterSpacing: '0.16em', marginBottom: '0.75rem' }}>Transparência</p>
              <h2>Nosso backlog</h2>
              <p className="backlog-header__sub">
                {MODULOS_NO_AR} módulos já rodando em produção. Mais{' '}
                {MODULOS_BACKLOG.filter(m => m.grupo !== 'planejado').length} chegam até o fim de 2026,
                e outros seguem no radar. Acompanhe o que vem por aí — sem letras miúdas.
              </p>
              <div className="backlog-stats">
                <div className="backlog-stat backlog-stat--verde">
                  <strong>{MODULOS_NO_AR}</strong>
                  <span>no ar</span>
                </div>
                <div className="backlog-stat backlog-stat--amarelo">
                  <strong>{MODULOS_BACKLOG.filter(m => m.grupo !== 'planejado').length}</strong>
                  <span>até 2026</span>
                </div>
                <div className="backlog-stat backlog-stat--cinza">
                  <strong>{MODULOS_BACKLOG.filter(m => m.grupo === 'planejado').length}</strong>
                  <span>planejado</span>
                </div>
              </div>

              {/* Evolução da plataforma — % derivado do status dos módulos (métrica fixa) */}
              <div className="backlog-progresso">
                <div className="backlog-progresso__topo">
                  <span className="backlog-progresso__rotulo">Evolução da plataforma</span>
                  <span className="backlog-progresso__valor">{progressoPlataforma()}%</span>
                </div>
                <div className="backlog-progresso__track">
                  <div className="backlog-progresso__fill" style={{ width: `${progressoPlataforma()}%` }} />
                </div>
                <p className="backlog-progresso__nota">
                  Calculado automaticamente pelo estágio e pelas datas de entrega dos {MODULOS_NO_AR + MODULOS_BACKLOG.length} módulos — avança um pouco a cada dia.
                </p>
              </div>
            </div>

            <div className="console-container backlog-console">
              {/* Header estilo janela */}
              <div style={{
                background: 'rgba(3, 5, 12, 0.5)',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <span style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
                  <span style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
                  <span style={{ display: 'block', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>Gravity OS Console · Backlog</span>
              </div>

              {/* Abas por status */}
              <div className="backlog-tabs">
                {BACKLOG_TABS.map(tab => {
                  const qtd = MODULOS_BACKLOG.filter(m => m.grupo === tab.id).length
                  return (
                    <button
                      key={tab.id}
                      className={`backlog-tab ${backlogTab === tab.id ? 'backlog-tab--active' : ''}`}
                      style={{ '--backlog-tab-cor': tab.cor } as CSSProperties}
                      onClick={() => setBacklogTab(tab.id)}
                    >
                      <span className="backlog-tab__dot" aria-hidden />
                      {tab.rotulo}
                      <span className="backlog-tab__qtd">{qtd}</span>
                    </button>
                  )
                })}
              </div>

              {/* Lista de módulos do grupo */}
              <div className="backlog-body">
                <p className="backlog-body__rotulo">
                  {MODULOS_BACKLOG.filter(m => m.grupo === backlogTab).length} módulos · 50% de desconto na lista de espera
                </p>
                <div className="backlog-lista">
                  {MODULOS_BACKLOG.filter(m => m.grupo === backlogTab).map(modulo => (
                    <div key={modulo.id} className="backlog-item">
                      <span className="backlog-item__dot" style={{ background: modulo.cor, boxShadow: `0 0 10px ${modulo.cor}` }} aria-hidden />
                      <div className="backlog-item__info">
                        <div className="backlog-item__titulo">
                          <strong>{modulo.nome}</strong>
                          <span style={{ color: modulo.cor }}>Módulo {modulo.numero}</span>
                        </div>
                        <p>{modulo.descricao}</p>
                        <div className="backlog-item__progresso">
                          <div className="backlog-item__progresso-track">
                            <div
                              className="backlog-item__progresso-fill"
                              style={{
                                width: `${progressoModuloPct(modulo)}%`,
                                background: modulo.cor,
                                boxShadow: `0 0 8px ${modulo.cor}66`,
                              }}
                            />
                          </div>
                          <span className="backlog-item__progresso-valor">{progressoModuloPct(modulo)}%</span>
                        </div>
                      </div>
                      <div className="backlog-item__prazo">
                        <span className="backlog-item__quando">
                          <CalendarBlank size={14} weight="duotone" />
                          {rotuloEntrega(modulo)}
                        </span>
                        <span className="backlog-item__status">{modulo.status}</span>
                      </div>
                      <div className="backlog-item__acao">
                        <a href="/cadastro?trial=true" className="btn btn-gradient">Entrar na lista · -50%</a>
                        <span>{modulo.listaEspera} na lista de espera</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ===== CTA FINAL ===== */}
      <section className="section" style={{ background: 'var(--bg-body-dark)', borderTop: '1px solid rgba(255, 255, 255, 0.04)', position: 'relative', overflow: 'hidden' }}>
        <div className="ambient-glow glow-purple" style={{ bottom: '-15%', left: '50%', transform: 'translateX(-50%)', opacity: 0.15, width: '500px', height: '500px' }} />

        <div className="container container-narrow" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.25rem', letterSpacing: '-0.03em' }}>
            Pronto para automatizar<br />seu COMEX?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Comece com um trial gratuito. Sem cartão de crédito, sem contrato, sem compromisso.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/cadastro?trial=true" className="btn btn-gradient btn-lg">
              <Rocket size={18} weight="duotone" />
              Criar conta grátis
            </a>
            <a href="/login" className="btn btn-secondary btn-lg">
              Já tenho conta
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
