import { useState, useRef, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sparkle,
  X,
  PaperPlaneRight,
  Spinner,
  RocketLaunch,
  ShoppingBagOpen,
  Question,
  ArrowRight,
  Minus,
  CornersOut,
  CornersIn,
  Copy,
  Check,
  Eraser,
} from '@phosphor-icons/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
  streaming?: boolean // true while typewriter is active
}

interface GabiOnboardingWidgetProps {
  userName: string
  pathname: string
}

// ── Contexto por tela ────────────────────────────────────────────────────

interface ScreenContext {
  welcome: string
  actions: { label: string; icon: React.ReactNode }[]
}

function getScreenContext(path: string): ScreenContext {
  // /trial — onboarding inicial
  if (path.includes('/trial'))
    return {
      welcome: 'Estou aqui para te guiar nos primeiros passos. Crie sua empresa e explore a plataforma!',
      actions: [
        { label: 'O que e a Gravity Store?', icon: <ShoppingBagOpen size={16} /> },
        { label: 'Qual o proximo passo?', icon: <ArrowRight size={16} /> },
        { label: 'Como funciona o trial?', icon: <RocketLaunch size={16} /> },
      ],
    }

  // /store — loja de produtos
  if (path.includes('/store'))
    return {
      welcome: 'Aqui voce encontra todos os modulos da Gravity. Posso te ajudar a escolher o ideal para sua operacao!',
      actions: [
        { label: 'Qual produto comecar?', icon: <RocketLaunch size={16} /> },
        { label: 'O que e o SimulaCusto?', icon: <Question size={16} /> },
        { label: 'Me ajude a escolher', icon: <Sparkle size={16} /> },
      ],
    }

  // /workspace/organizacao
  if (path.includes('/organizacao'))
    return {
      welcome: 'Aqui voce gerencia os dados da sua empresa. Posso te ajudar com qualquer configuracao!',
      actions: [
        { label: 'Como editar dados da empresa?', icon: <Question size={16} /> },
        { label: 'O que e o plano Enterprise?', icon: <Sparkle size={16} /> },
        { label: 'Como mudar de plano?', icon: <ArrowRight size={16} /> },
      ],
    }

  // /workspace/workspaces
  if (path.includes('/workspaces'))
    return {
      welcome: 'Workspaces permitem organizar equipes e projetos. Cada workspace pode ter seus proprios produtos!',
      actions: [
        { label: 'O que e um workspace?', icon: <Question size={16} /> },
        { label: 'Como criar um workspace?', icon: <ArrowRight size={16} /> },
        { label: 'Posso ter varios workspaces?', icon: <Sparkle size={16} /> },
      ],
    }

  // /workspace/usuarios
  if (path.includes('/usuarios'))
    return {
      welcome: 'Gerencie quem tem acesso a plataforma. Cada usuario pode ter permissoes diferentes!',
      actions: [
        { label: 'Como convidar usuarios?', icon: <ArrowRight size={16} /> },
        { label: 'Quais roles existem?', icon: <Question size={16} /> },
        { label: 'Como restringir acesso?', icon: <Sparkle size={16} /> },
      ],
    }

  // /workspace/assinaturas
  if (path.includes('/assinaturas'))
    return {
      welcome: 'Aqui voce ve todos os modulos contratados e pode gerenciar suas assinaturas.',
      actions: [
        { label: 'Como contratar um modulo?', icon: <ShoppingBagOpen size={16} /> },
        { label: 'Como cancelar assinatura?', icon: <Question size={16} /> },
        { label: 'O que esta incluso no trial?', icon: <RocketLaunch size={16} /> },
      ],
    }

  // /workspace/financeiro
  if (path.includes('/workspace/financeiro'))
    return {
      welcome: 'Acompanhe faturas, pagamentos e o historico financeiro da sua conta.',
      actions: [
        { label: 'Como funciona a cobranca?', icon: <Question size={16} /> },
        { label: 'Onde vejo minhas faturas?', icon: <ArrowRight size={16} /> },
        { label: 'Quais formas de pagamento?', icon: <Sparkle size={16} /> },
      ],
    }

  // /workspace/api-cockpit
  if (path.includes('/api-cockpit'))
    return {
      welcome: 'O API Cockpit mostra o consumo da Gabi IA, status dos servicos e custos de API.',
      actions: [
        { label: 'Como funciona o custo da IA?', icon: <Question size={16} /> },
        { label: 'O que e o fallback chain?', icon: <Sparkle size={16} /> },
        { label: 'Como ver meu consumo?', icon: <ArrowRight size={16} /> },
      ],
    }

  // /admin/*
  if (path.includes('/admin'))
    return {
      welcome: 'Area administrativa. Posso te ajudar a navegar pelas configuracoes globais da plataforma.',
      actions: [
        { label: 'Como gerenciar organizações?', icon: <Question size={16} /> },
        { label: 'Onde vejo metricas globais?', icon: <ArrowRight size={16} /> },
        { label: 'Como funciona o deploy?', icon: <RocketLaunch size={16} /> },
      ],
    }

  // /produto/bid-frete
  if (path.includes('/bid-frete'))
    return {
      welcome: 'Voce esta no Bid Frete — cotacao inteligente de frete internacional. Posso te ajudar a comparar fretes, entender INCOTERMS e escolher a melhor opcao!',
      actions: [
        { label: 'Como cotar frete internacional?', icon: <Question size={16} /> },
        { label: 'O que sao INCOTERMS?', icon: <Sparkle size={16} /> },
        { label: 'Como comparar cotacoes?', icon: <ArrowRight size={16} /> },
      ],
    }

  // /produto/bid-cambio
  if (path.includes('/bid-cambio'))
    return {
      welcome: 'Voce esta no Bid Cambio — comparacao de taxas de cambio para suas operacoes de comercio exterior. Posso te ajudar a encontrar a melhor taxa!',
      actions: [
        { label: 'Como funciona o Bid Cambio?', icon: <Question size={16} /> },
        { label: 'Como comparar taxas?', icon: <ArrowRight size={16} /> },
        { label: 'Qual e a melhor hora para fechar cambio?', icon: <Sparkle size={16} /> },
      ],
    }

  // /produto/financeiro-comex
  if (path.includes('/financeiro-comex'))
    return {
      welcome: 'Voce esta no Financeiro COMEX — gestao financeira das suas operacoes de importacao e exportacao. Posso te ajudar com DREs, provisoes e controle de custos!',
      actions: [
        { label: 'Como lancar um custo de importacao?', icon: <Question size={16} /> },
        { label: 'Como gerar relatorio financeiro?', icon: <ArrowRight size={16} /> },
        { label: 'Como controlar provisoes cambiais?', icon: <Sparkle size={16} /> },
      ],
    }

  // /produto/nf-importacao
  if (path.includes('/nf-importacao'))
    return {
      welcome: 'Voce esta na gestao de NF de Importacao. Posso te ajudar com emissao, vinculacao de DI, calculo de impostos e mais!',
      actions: [
        { label: 'Como emitir uma NF de importacao?', icon: <Question size={16} /> },
        { label: 'Como vincular a Declaracao de Importacao?', icon: <ArrowRight size={16} /> },
        { label: 'Como calcular os impostos da NF?', icon: <Sparkle size={16} /> },
      ],
    }

  // /produto/lpco
  if (path.includes('/lpco'))
    return {
      welcome: 'Voce esta no modulo LPCO — Licencas, Permissoes, Certificados e Outros. Posso te ajudar com o fluxo de autorizacoes!',
      actions: [
        { label: 'O que e o LPCO?', icon: <Question size={16} /> },
        { label: 'Como solicitar uma licenca?', icon: <ArrowRight size={16} /> },
        { label: 'Quais documentos sao exigidos?', icon: <Sparkle size={16} /> },
      ],
    }

  // /produto/* — dentro de um produto generico
  if (path.includes('/produto'))
    return {
      welcome: 'Voce esta dentro de um produto. Posso te ajudar a usar os recursos disponiveis!',
      actions: [
        { label: 'Como usar este produto?', icon: <Question size={16} /> },
        { label: 'Onde vejo meus dados?', icon: <ArrowRight size={16} /> },
        { label: 'Como exportar relatorios?', icon: <Sparkle size={16} /> },
      ],
    }

  // /selecionar-workspace — criacao do primeiro workspace
  if (path.includes('/selecionar-workspace'))
    return {
      welcome: 'Vou te explicar como funciona! O workspace e o espaco da sua empresa na Gravity — e onde ficam seus dados, produtos e usuarios. Pense nele como a "conta" da sua empresa aqui dentro.',
      actions: [
        { label: 'O que e um workspace?', icon: <Question size={16} /> },
        { label: 'Posso ter mais de um?', icon: <Sparkle size={16} /> },
        { label: 'Como funciona o trial?', icon: <RocketLaunch size={16} /> },
      ],
    }

  // /hub ou qualquer outra
  return {
    welcome: 'Estou aqui para te guiar nos primeiros passos. Pode me perguntar qualquer coisa sobre a plataforma!',
    actions: [
      { label: 'O que e a Gravity Store?', icon: <ShoppingBagOpen size={16} /> },
      { label: 'Como funciona a plataforma?', icon: <Question size={16} /> },
      { label: 'Me ajude a comecar', icon: <RocketLaunch size={16} /> },
    ],
  }
}

const MOCK_RESPONSES: Record<string, string> = {
  'O que e a Gravity Store?':
    'A **Gravity Store** e onde voce encontra todos os modulos da plataforma. Funciona como uma loja de aplicativos para comercio exterior.\n\nCada modulo resolve um problema especifico:\n\n* **SimulaCusto** — Calculo de custos de importacao\n* **Smart Read** — Leitura inteligente de documentos\n* **BID Frete** — Cotacao de frete internacional\n* **BID Cambio** — Comparacao de taxas cambiais\n\nVoce ativa so o que precisa e pode expandir a qualquer momento. Todos incluem **14 dias gratis**!',
  'Qual o proximo passo?':
    'Agora que voce esta criando sua empresa, o proximo passo e simples:\n\n* **1.** Digite o nome da empresa e clique em **Ir para Gravity Store**\n* **2.** Na Store, explore os modulos disponiveis\n* **3.** Ative os que fazem sentido para sua operacao — com **14 dias gratis**\n* **4.** Pronto! Voce ja pode comecar a usar a plataforma\n\nSe precisar de ajuda para escolher os modulos, estarei aqui na Store tambem!',
  'Como funciona o trial?':
    'Simples! Ao criar sua empresa, voce ganha **14 dias gratis** em qualquer modulo que ativar.\n\nDurante o trial voce tem acesso completo — sem limitacoes. Ao final, pode optar por continuar com o plano pago ou cancelar sem custo.',
  'Qual produto comecar?':
    'Depende da sua operacao! Se voce trabalha com **importacao**, o **SimulaCusto** e perfeito para comecar — ele calcula custos de importacao com precisao fiscal.\n\nQuer que eu explique mais sobre ele?',
  'O que e o SimulaCusto?':
    'O **SimulaCusto** calcula o custo total de importacao incluindo:\n\n* Impostos (II, IPI, PIS, COFINS, ICMS)\n* Despesas aduaneiras\n* Frete e seguro\n* Margem de lucro\n\nTudo baseado na **NCM** do produto. E o modulo mais popular da plataforma!',
  'Me ajude a escolher':
    'Claro! Me conta um pouco:\n\n* Sua empresa trabalha com **importacao**, **exportacao** ou ambos?\n* Qual o principal desafio hoje — **custos**, **documentos** ou **logistica**?\n\nCom essas infos consigo recomendar os modulos ideais para voce.',
  'O que e um workspace?':
    'Pense no workspace como a **conta da sua empresa** dentro da Gravity.\n\nE onde ficam organizados:\n\n* **Seus dados** — informacoes da empresa, CNPJ, enderecos\n* **Seus produtos** — os modulos que voce ativa (SimulaCusto, BID Frete, etc.)\n* **Seus usuarios** — as pessoas do time que acessam a plataforma\n\nSe voce tem uma **matriz e filiais**, pode criar um workspace para cada uma. Cada workspace tem seus proprios dados e produtos separados.\n\nDigite o nome da sua empresa e clique em **Continuar** — e rapido!',
  'Posso ter mais de um?':
    'Sim! Voce pode criar **quantos workspaces precisar**.\n\nIsso e util quando:\n\n* Sua empresa tem **filiais** em estados diferentes\n* Voce quer separar **divisoes** (importacao vs. exportacao)\n* Precisa de **ambientes distintos** para projetos\n\nCada workspace tem seus proprios dados, produtos e usuarios — tudo isolado e seguro.\n\nPor enquanto, crie o primeiro com o nome da sua empresa principal. Depois voce adiciona mais nas configuracoes!',
}

const DEFAULT_RESPONSE =
  'Entendi! Ainda estou aprendendo sobre esse assunto, mas posso te ajudar com duvidas sobre a plataforma, produtos disponiveis e como comecar.\n\nTente perguntar sobre um dos nossos modulos!'

// Sugestoes contextuais baseadas na pergunta anterior
const FOLLOW_UP_SUGGESTIONS: Record<string, string[]> = {
  'O que e a Gravity Store?': [
    'Qual produto comecar?',
    'Como funciona o trial?',
    'O que e o SimulaCusto?',
  ],
  'Qual o proximo passo?': [
    'O que e a Gravity Store?',
    'Me ajude a escolher',
    'Como funciona o trial?',
  ],
  'Como funciona o trial?': [
    'O que e a Gravity Store?',
    'Qual produto comecar?',
    'E se eu nao gostar?',
  ],
  'Qual produto comecar?': [
    'O que e o SimulaCusto?',
    'Quais outros produtos tem?',
    'Me ajude a escolher',
  ],
  'O que e o SimulaCusto?': [
    'Como ativar o SimulaCusto?',
    'Quanto custa o SimulaCusto?',
    'Quais outros produtos tem?',
  ],
  'O que e um workspace?': [
    'Posso ter mais de um?',
    'Como funciona o trial?',
    'O que e a Gravity Store?',
  ],
  'Posso ter mais de um?': [
    'O que e a Gravity Store?',
    'Qual produto comecar?',
    'Como funciona o trial?',
  ],
  'Me ajude a escolher': [
    'Trabalho com importacao',
    'Trabalho com exportacao',
    'Trabalho com ambos',
  ],
}

const DEFAULT_SUGGESTIONS = [
  'O que e a Gravity Store?',
  'Me ajude a escolher',
  'Como funciona o trial?',
]

// ── Blurred typing effect — infinite lines, auto-scroll ──

const GHOST_LINES = [
  { text: 'Baseado na documentacao da plataforma,', width: '95%' },
  { text: 'vou analisar os detalhes relevantes para', width: '100%' },
  { text: 'sua pergunta e trazer informacoes', width: '82%' },
  { text: 'precisas sobre o assunto.', width: '62%' },
  { text: 'Verificando dados e parametros do', width: '88%' },
  { text: 'sistema para garantir uma resposta', width: '92%' },
  { text: 'completa e atualizada com base nos', width: '90%' },
  { text: 'registros disponiveis na plataforma.', width: '78%' },
  { text: 'Consultando a base de conhecimento', width: '85%' },
  { text: 'para validar as informacoes antes de', width: '96%' },
  { text: 'apresentar o resultado final.', width: '68%' },
  { text: 'Analisando contexto e historico para', width: '91%' },
  { text: 'oferecer a melhor orientacao possivel', width: '87%' },
  { text: 'sobre sua solicitacao atual.', width: '65%' },
]

const LINE_INTERVAL_MS = 1200

function GabiBlurTyping() {
  const [visibleCount, setVisibleCount] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleCount(prev => prev + 1)
    }, LINE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to bottom as new lines appear
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [visibleCount])

  // Cycle through GHOST_LINES infinitely
  const lines = Array.from({ length: visibleCount }, (_, i) => {
    const src = GHOST_LINES[i % GHOST_LINES.length]
    return { ...src, key: i }
  })

  return (
    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', animation: 'gabiFadeIn 0.3s ease' }}>
      {/* Avatar */}
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'gabiAvatarBreath 2s ease-in-out infinite',
      }}>
        <Sparkle size={14} weight="fill" color="#818cf8" style={{ animation: 'gabiThinkPulse 2s ease-in-out infinite' }} />
      </div>

      {/* Blurred text bubble */}
      <div style={{
        background: '#1c2233', border: '1px solid #272d42',
        borderRadius: '16px 16px 16px 4px',
        padding: '0.875rem 1rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        minWidth: 200, maxWidth: '70%',
        maxHeight: 160, overflowY: 'auto',
        position: 'relative',
        scrollbarWidth: 'none',
      }} ref={scrollRef} className="gabi-blur-scroll">

        {/* Shimmer sweep overlay */}
        <div style={{
          position: 'sticky', top: 0, left: 0, right: 0, height: 0, zIndex: 3,
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '-1rem', right: '-1rem', height: 160,
            background: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.06) 40%, rgba(139,92,246,0.1) 50%, rgba(99,102,241,0.06) 60%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'gabiShimmer 1.8s ease-in-out infinite',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem', position: 'relative', zIndex: 2 }}>
          <Sparkle size={12} weight="fill" color="#6366f1" style={{ animation: 'gabiThinkPulse 1s ease-in-out infinite', flexShrink: 0 }} />
          <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 500 }}>Gerando resposta...</span>
        </div>

        {/* Lines */}
        {lines.map(line => (
          <div key={line.key} style={{
            fontSize: '0.8125rem', lineHeight: 1.5,
            color: 'rgba(160, 170, 200, 0.55)',
            filter: 'blur(3.5px)',
            userSelect: 'none',
            position: 'relative', zIndex: 2,
            width: line.width,
            WebkitMaskImage: 'linear-gradient(90deg, #000 0%, #000 30%, transparent 50%, transparent 100%)',
            maskImage: 'linear-gradient(90deg, #000 0%, #000 30%, transparent 50%, transparent 100%)',
            WebkitMaskSize: '300% 100%',
            maskSize: '300% 100%',
            animation: 'gabiTypeReveal 1.4s ease-out both, gabiLineReveal 2.4s ease-in-out infinite',
          }}>
            {line.text}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Copy button component ──
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      onClick={handleCopy}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: copied ? '#10b981' : '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem',
        fontSize: '0.6rem', fontFamily: 'inherit', padding: '0.125rem 0.25rem', borderRadius: 4,
        transition: 'color 0.2s',
      }}
      type="button"
      title="Copiar resposta"
    >
      {copied ? <Check size={12} weight="bold" /> : <Copy size={12} />}
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

const MIN_W = 340
const MIN_H = 400
const DEFAULT_W = 420
const DEFAULT_H = 560

export function GabiOnboardingWidget({ userName, pathname }: GabiOnboardingWidgetProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [pulse, setPulse] = useState(true)
  const [maximized, setMaximized] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Position & size state
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H })
  const [pos, setPos] = useState({ x: -1, y: -1 }) // -1 = use default (bottom-right)

  // Dragging state
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)
  // Resizing state
  const resizeRef = useRef<{
    startX: number; startY: number; startW: number; startH: number; startPosX: number; startPosY: number
    edge: string
  } | null>(null)

  // Pre-maximize snapshot
  const preMaxRef = useRef({ w: DEFAULT_W, h: DEFAULT_H, x: -1, y: -1 })

  const screen = getScreenContext(pathname)
  const welcomeMsg = `Oi! Sou a **Gabi**, sua assistente de IA na Gravity.\n\n${screen.welcome}`
  const quickActions = screen.actions

  // Listen for external gabi:open events (e.g. from insight cards)
  useEffect(() => {
    function handleGabiOpen(e: Event) {
      const detail = (e as CustomEvent<{ message?: string }>).detail
      setOpen(true)
      setPulse(false)
      if (detail?.message) {
        // Simulate user clicking a quick action
        const fakeUserMsg: Message = {
          id: `u-${Date.now()}`,
          role: 'user',
          content: detail.message,
        }
        setMessages(prev => [...prev, fakeUserMsg])
        setIsTyping(true)
        const response = MOCK_RESPONSES[detail.message] || DEFAULT_RESPONSE
        const suggestions = FOLLOW_UP_SUGGESTIONS[detail.message]
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `a-${Date.now()}`,
              role: 'assistant',
              content: response,
              suggestions,
              streaming: true,
            },
          ])
          setIsTyping(false)
        }, 600)
      }
    }
    window.addEventListener('gabi:open', handleGabiOpen)
    return () => window.removeEventListener('gabi:open', handleGabiOpen)
  }, [])

  const chatBodyRef = useRef<HTMLDivElement>(null)
  const shouldAutoScroll = useRef(true)
  const isStreamingRef = useRef(false)

  // Auto-scroll: only when user hasn't scrolled up manually
  useEffect(() => {
    if (!shouldAutoScroll.current) return
    // During streaming, scroll gently every few updates (not every tick)
    if (isStreamingRef.current) return
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, isTyping]) // only on NEW messages or typing state change, not content updates

  const handleChatScroll = () => {
    const el = chatBodyRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    shouldAutoScroll.current = distFromBottom < 60
  }

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000)
    return () => clearTimeout(t)
  }, [])

  // Compute actual position (default = bottom-right with 2rem margin)
  const getActualPos = useCallback(() => {
    if (pos.x >= 0 && pos.y >= 0) return pos
    return {
      x: window.innerWidth - size.w - 32,
      y: window.innerHeight - size.h - 32,
    }
  }, [pos, size])

  // ── Drag (move) ──
  const onDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    const actual = getActualPos()
    dragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: actual.x, startPosY: actual.y }

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const dx = ev.clientX - dragRef.current.startX
      const dy = ev.clientY - dragRef.current.startY
      setPos({
        x: Math.max(0, Math.min(window.innerWidth - size.w, dragRef.current.startPosX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - size.h, dragRef.current.startPosY + dy)),
      })
    }
    const onUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Resize ──
  const onResizeStart = (e: React.MouseEvent, edge: string) => {
    e.preventDefault()
    e.stopPropagation()
    const actual = getActualPos()
    resizeRef.current = {
      startX: e.clientX, startY: e.clientY,
      startW: size.w, startH: size.h,
      startPosX: actual.x, startPosY: actual.y,
      edge,
    }

    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const r = resizeRef.current
      const dx = ev.clientX - r.startX
      const dy = ev.clientY - r.startY

      let newW = r.startW
      let newH = r.startH
      let newX = r.startPosX
      let newY = r.startPosY

      if (r.edge.includes('e')) newW = Math.max(MIN_W, r.startW + dx)
      if (r.edge.includes('w')) { newW = Math.max(MIN_W, r.startW - dx); newX = r.startPosX + (r.startW - newW) }
      if (r.edge.includes('s')) newH = Math.max(MIN_H, r.startH + dy)
      if (r.edge.includes('n')) { newH = Math.max(MIN_H, r.startH - dy); newY = r.startPosY + (r.startH - newH) }

      setSize({ w: newW, h: newH })
      setPos({ x: newX, y: newY })
    }
    const onUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Maximize / Restore ──
  const toggleMaximize = () => {
    if (maximized) {
      setSize({ w: preMaxRef.current.w, h: preMaxRef.current.h })
      setPos({ x: preMaxRef.current.x, y: preMaxRef.current.y })
      setMaximized(false)
    } else {
      preMaxRef.current = { w: size.w, h: size.h, x: getActualPos().x, y: getActualPos().y }
      setSize({ w: window.innerWidth - 64, h: window.innerHeight - 64 })
      setPos({ x: 32, y: 32 })
      setMaximized(true)
    }
  }

  // Typewriter effect — word by word for natural feel
  const streamText = useCallback((fullText: string, msgId: string, suggestions: string[]) => {
    // Split into words for more natural reveal
    const words = fullText.split(/(\s+)/) // keep whitespace
    let wordIdx = 0
    let tickCount = 0
    isStreamingRef.current = true

    const tick = () => {
      // Reveal 2-3 words per tick for visible chunks
      const wordsPerTick = 3
      wordIdx += wordsPerTick

      if (wordIdx >= words.length) {
        isStreamingRef.current = false
        setMessages(prev => prev.map(m =>
          m.id === msgId ? { ...m, content: fullText, streaming: false, suggestions } : m
        ))
        // Final scroll
        if (shouldAutoScroll.current) {
          setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        }
        return
      }

      const revealed = words.slice(0, wordIdx).join('')
      setMessages(prev => prev.map(m =>
        m.id === msgId ? { ...m, content: revealed } : m
      ))

      // Scroll every 5 ticks (not every tick) — smooth and non-intrusive
      tickCount++
      if (tickCount % 5 === 0 && shouldAutoScroll.current) {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }

      setTimeout(tick, 30) // 30ms per tick = ~100 words/sec, visible and smooth
    }
    tick()
  }, [])

  const handleSend = async (text?: string) => {
    const msg = text || inputVal.trim()
    if (!msg) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    const assistantId = (Date.now() + 1).toString()

    // Phase 1: Show thinking shimmer (isTyping=true, no streaming message yet)
    let fullText = ''
    let suggestions = FOLLOW_UP_SUGGESTIONS[msg] || DEFAULT_SUGGESTIONS
    try {
      const res = await fetch('/api/v1/gabi/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-id-organizacao': 'onboarding',
          'x-id-usuario': userName,
          'x-internal-key': 'gravity-internal',
        },
        body: JSON.stringify({ conversationId: 'new', message: msg, page: pathname }),
      })

      if (!res.ok) throw new Error('API indisponivel')
      const data = await res.json()
      fullText = data.response
      if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        suggestions = data.suggestions
      }
    } catch {
      fullText = MOCK_RESPONSES[msg] || 'Nao consegui me conectar ao servidor da IA no momento. Verifique se o servico Gabi esta ativo e tente novamente em instantes.'
    }

    // Phase 2: Thinking done — start typewriter
    setIsTyping(false)
    setMessages(prev => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', streaming: true },
    ])
    streamText(fullText, assistantId, suggestions)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderContent = (content: string) => {
    const lines = content.split('\n')
    return lines.map((line, i) => {
      // Headers (### or ##)
      const h3 = line.match(/^###\s+(.*)$/)
      if (h3) return <div key={i} style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f1f5f9', margin: '0.75rem 0 0.375rem' }}>{applyInline(h3[1])}</div>
      const h2 = line.match(/^##\s+(.*)$/)
      if (h2) return <div key={i} style={{ fontSize: '1rem', fontWeight: 700, color: '#f1f5f9', margin: '0.75rem 0 0.375rem' }}>{applyInline(h2[1])}</div>

      // Bullet lists: *, -, or numbered (1.)
      const bullet = line.match(/^\s*[\*\-]\s+(.*)$/)
      if (bullet) return <div key={i} style={{ paddingLeft: '1rem', marginBottom: '0.2rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#818cf8', flexShrink: 0 }}>•</span><span>{applyInline(bullet[1])}</span></div>
      const numbered = line.match(/^\s*(\d+)\.\s+(.*)$/)
      if (numbered) return <div key={i} style={{ paddingLeft: '1rem', marginBottom: '0.2rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#818cf8', flexShrink: 0 }}>{numbered[1]}.</span><span>{applyInline(numbered[2])}</span></div>

      // Empty line
      if (!line.trim()) return <div key={i} style={{ height: '0.375rem' }} />

      // Normal text
      return <div key={i}>{applyInline(line)}</div>
    })
  }

  // Apply inline formatting (bold, code, links)
  const applyInline = (text: string) => {
    const parts: React.ReactNode[] = []
    // Match: **bold**, `code`, [link text](url), /rota/path
    const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\)|(?<=\s|^)(\/[\w\-\/]+))/g
    let lastIndex = 0
    let match: RegExpExecArray | null
    let key = 0

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>)
      }
      const m = match[0]
      if (m.startsWith('**') && m.endsWith('**')) {
        parts.push(<strong key={key++} style={{ color: '#f1f5f9' }}>{m.slice(2, -2)}</strong>)
      } else if (m.startsWith('`') && m.endsWith('`')) {
        parts.push(<code key={key++} style={{ background: 'rgba(99,102,241,0.15)', padding: '0.1rem 0.3rem', borderRadius: 4, fontSize: '0.8125rem', color: '#a5b4fc' }}>{m.slice(1, -1)}</code>)
      } else if (m.startsWith('[')) {
        // Markdown link: [text](url)
        const linkMatch = m.match(/^\[(.*?)\]\((.*?)\)$/)
        if (linkMatch) {
          const href = linkMatch[2]
          const isInternal = href.startsWith('/')
          parts.push(
            <a
              key={key++}
              href={href}
              onClick={isInternal ? (e) => { e.preventDefault(); window.location.href = href } : undefined}
              style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
              target={isInternal ? undefined : '_blank'}
              rel={isInternal ? undefined : 'noopener noreferrer'}
            >
              {linkMatch[1]}
            </a>
          )
        }
      } else if (m.startsWith('/')) {
        // Bare route path like /admin/organizacoes
        parts.push(
          <a
            key={key++}
            href={m}
            onClick={(e) => { e.preventDefault(); window.location.href = m }}
            style={{ color: '#818cf8', textDecoration: 'underline', cursor: 'pointer', fontWeight: 500 }}
          >
            {m}
          </a>
        )
      } else {
        parts.push(<span key={key++}>{m}</span>)
      }
      lastIndex = match.index + m.length
    }
    if (lastIndex < text.length) {
      parts.push(<span key={key++}>{text.slice(lastIndex)}</span>)
    }
    return <>{parts}</>
  }

  const actualPos = getActualPos()

  // Edge handles for resize
  const edgeStyle = (cursor: string, extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute', zIndex: 10, ...extra, cursor,
  })

  return (
    <>
      {/* Floating Bubble */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setPulse(false) }}
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
            zIndex: 9999,
            transition: 'transform 0.2s, box-shadow 0.2s',
            animation: pulse ? 'gabiPulse 2s ease-in-out infinite' : undefined,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.5)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.4)'
          }}
          type="button"
          title="Falar com a Gabi"
        >
          <Sparkle weight="fill" size={28} color="#fff" />
        </button>
      )}

      {/* Resizable + Draggable Chat Window */}
      {open && (
        <div
          ref={panelRef}
          style={{
            position: 'fixed',
            left: actualPos.x,
            top: actualPos.y,
            width: size.w,
            height: size.h,
            borderRadius: maximized ? 12 : 20,
            background: '#0f111a',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999,
            animation: 'gabiSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
            overflow: 'hidden',
            fontFamily: 'var(--font, Inter, sans-serif)',
          }}
        >
          {/* Resize handles (8 edges) */}
          {!maximized && (<>
            <div onMouseDown={e => onResizeStart(e, 'n')}  style={edgeStyle('ns-resize',  { top: 0, left: 8, right: 8, height: 6 })} />
            <div onMouseDown={e => onResizeStart(e, 's')}  style={edgeStyle('ns-resize',  { bottom: 0, left: 8, right: 8, height: 6 })} />
            <div onMouseDown={e => onResizeStart(e, 'w')}  style={edgeStyle('ew-resize',  { left: 0, top: 8, bottom: 8, width: 6 })} />
            <div onMouseDown={e => onResizeStart(e, 'e')}  style={edgeStyle('ew-resize',  { right: 0, top: 8, bottom: 8, width: 6 })} />
            <div onMouseDown={e => onResizeStart(e, 'nw')} style={edgeStyle('nwse-resize', { top: 0, left: 0, width: 12, height: 12 })} />
            <div onMouseDown={e => onResizeStart(e, 'ne')} style={edgeStyle('nesw-resize', { top: 0, right: 0, width: 12, height: 12 })} />
            <div onMouseDown={e => onResizeStart(e, 'sw')} style={edgeStyle('nesw-resize', { bottom: 0, left: 0, width: 12, height: 12 })} />
            <div onMouseDown={e => onResizeStart(e, 'se')} style={edgeStyle('nwse-resize', { bottom: 0, right: 0, width: 12, height: 12 })} />
          </>)}

          {/* Header — draggable */}
          <div
            onMouseDown={onDragStart}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              cursor: 'grab',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
                flexShrink: 0,
              }}>
                <Sparkle weight="fill" size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#f1f5f9', lineHeight: 1.2 }}>Gabi</div>
                <div style={{ fontSize: '0.6875rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#10b981' }} />
                  Assistente IA
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {/* Clear conversation */}
              {messages.length > 0 && (
                <button
                  onClick={() => setMessages([])}
                  style={headerBtnStyle}
                  type="button"
                  title="Nova conversa"
                >
                  <Eraser size={14} weight="bold" />
                </button>
              )}
              {/* Minimize */}
              <button
                onClick={() => setOpen(false)}
                style={headerBtnStyle}
                type="button"
                title="Minimizar"
              >
                <Minus size={14} weight="bold" />
              </button>
              {/* Maximize / Restore */}
              <button
                onClick={toggleMaximize}
                style={headerBtnStyle}
                type="button"
                title={maximized ? 'Restaurar' : 'Maximizar'}
              >
                {maximized ? <CornersIn size={14} weight="bold" /> : <CornersOut size={14} weight="bold" />}
              </button>
              {/* Close */}
              <button
                onClick={() => { setOpen(false); setMessages([]) }}
                style={{ ...headerBtnStyle }}
                type="button"
                title="Fechar conversa"
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = '#f87171' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9ca3af' }}
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatBodyRef}
            onScroll={handleChatScroll}
            style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{
                  background: '#1c2233',
                  border: '1px solid #272d42',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  color: '#e5e7eb',
                }}>
                  <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkle weight="fill" size={16} color="#818cf8" />
                    <span style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.8125rem' }}>
                      Ola, {userName}!
                    </span>
                  </div>
                  {renderContent(welcomeMsg)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.label)}
                      style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: 12,
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.8125rem',
                        color: '#c7d2fe',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.15)'
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                        e.currentTarget.style.color = '#fff'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.08)'
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'
                        e.currentTarget.style.color = '#c7d2fe'
                      }}
                      type="button"
                    >
                      {action.icon}
                      {action.label}
                      <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isLastAssistant = msg.role === 'assistant' && idx === messages.length - 1
                const isUser = msg.role === 'user'
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'gabiFadeIn 0.3s ease' }}>
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'flex-start',
                      flexDirection: isUser ? 'row-reverse' : 'row',
                    }}>
                      {/* Avatar */}
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.6875rem', fontWeight: 700,
                        ...(isUser
                          ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff' }
                          : { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }
                        ),
                      }}>
                        {isUser
                          ? userName.charAt(0).toUpperCase()
                          : <Sparkle size={14} weight="fill" color="#818cf8" />
                        }
                      </div>

                      {/* Bubble */}
                      <div style={{ maxWidth: '82%', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div style={{
                          padding: '0.75rem 1rem',
                          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          fontSize: '0.8125rem',
                          lineHeight: 1.65,
                          color: isUser ? '#e2dcf2' : '#e5e7eb',
                          background: isUser ? '#3c2373' : '#1c2233',
                          border: isUser ? '1px solid #483183' : '1px solid #272d42',
                          position: 'relative',
                        }}>
                          {renderContent(msg.content)}
                          {/* Streaming cursor with glow */}
                          {msg.streaming && (
                            <span style={{
                              display: 'inline-block', width: 2, height: '1em',
                              background: 'linear-gradient(to bottom, #6366f1, #8b5cf6)',
                              borderRadius: 1, marginLeft: 2, verticalAlign: 'text-bottom',
                              animation: 'gabiBlink 0.8s ease-in-out infinite, gabiGlow 1.5s ease-in-out infinite',
                            }} />
                          )}
                        </div>

                        {/* Actions row (copy, time) — only for assistant, not while streaming */}
                        {!isUser && !msg.streaming && msg.content && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            paddingLeft: '0.25rem', opacity: 0.5, transition: 'opacity 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '1' }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '0.5' }}
                          >
                            <CopyButton text={msg.content} />
                            <span style={{ fontSize: '0.6rem', color: '#6b7280' }}>
                              {new Date(Number(msg.id)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sugestoes contextuais */}
                    {isLastAssistant && msg.suggestions && !msg.streaming && !isTyping && (
                      <div style={{
                        display: 'flex', flexWrap: 'wrap', gap: '0.375rem',
                        paddingLeft: '2.25rem',
                        animation: 'gabiSlideUp 0.25s ease forwards',
                      }}>
                        {msg.suggestions.map(s => (
                          <button
                            key={s}
                            onClick={() => handleSend(s)}
                            style={{
                              background: 'rgba(99,102,241,0.06)',
                              border: '1px solid rgba(99,102,241,0.15)',
                              borderRadius: 20,
                              padding: '0.3rem 0.75rem',
                              fontSize: '0.7rem',
                              color: '#a5b4fc',
                              cursor: 'pointer',
                              transition: 'all 0.15s',
                              fontFamily: 'inherit',
                              whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'rgba(99,102,241,0.15)'
                              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'
                              e.currentTarget.style.color = '#fff'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'rgba(99,102,241,0.06)'
                              e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'
                              e.currentTarget.style.color = '#a5b4fc'
                            }}
                            type="button"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}

            {/* Thinking animation — Blurred text preview (infinite) */}
            {isTyping && !messages.some(m => m.streaming) && (
              <GabiBlurTyping />
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '0.625rem 1rem 0.75rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexShrink: 0,
          }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid #292a43',
                borderRadius: 14,
                padding: '0.375rem 0.5rem',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#6366f1' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#292a43' }}
            >
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte algo..."
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: '#fff',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  padding: '0.5rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!inputVal.trim()}
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff',
                  border: 'none',
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
                  opacity: inputVal.trim() ? 1 : 0.5,
                  transition: 'opacity 0.2s',
                  flexShrink: 0,
                }}
                type="button"
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
            <div style={{
              textAlign: 'center',
              fontSize: '0.6rem',
              color: '#4b5563',
              marginTop: '0.375rem',
            }}>
              Powered by Gabi IA · Gravity Platform
            </div>
          </div>
        </div>
      )}

      <style>{`
        .gabi-blur-scroll::-webkit-scrollbar { display: none; }
        @keyframes gabiPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 8px 48px rgba(99,102,241,0.6), 0 0 0 8px rgba(99,102,241,0.1); }
        }
        @keyframes gabiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gabiFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gabiBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes gabiShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes gabiThinkPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes gabiAvatarBreath {
          0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
          50% { box-shadow: 0 0 12px 3px rgba(99,102,241,0.25); }
        }
        @keyframes gabiGlow {
          0%, 100% { box-shadow: 0 0 4px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 0 16px rgba(99,102,241,0.6), 0 0 32px rgba(139,92,246,0.3); }
        }
        @keyframes gabiTypeReveal {
          0% {
            -webkit-mask-position: 100% 0;
            mask-position: 100% 0;
          }
          100% {
            -webkit-mask-position: 0% 0;
            mask-position: 0% 0;
          }
        }
        @keyframes gabiLineReveal {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </>
  )
}

const headerBtnStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.08)',
  width: 28,
  height: 28,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9ca3af',
  cursor: 'pointer',
  transition: 'all 0.15s',
}
