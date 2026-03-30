import { useState, useRef, useEffect, useCallback } from 'react'
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
} from '@phosphor-icons/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
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
  if (path.includes('/financeiro'))
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
        { label: 'Como gerenciar tenants?', icon: <Question size={16} /> },
        { label: 'Onde vejo metricas globais?', icon: <ArrowRight size={16} /> },
        { label: 'Como funciona o deploy?', icon: <RocketLaunch size={16} /> },
      ],
    }

  // /produto/* — dentro de um produto
  if (path.includes('/produto'))
    return {
      welcome: 'Voce esta dentro de um produto. Posso te ajudar a usar os recursos disponiveis!',
      actions: [
        { label: 'Como usar este produto?', icon: <Question size={16} /> },
        { label: 'Onde vejo meus dados?', icon: <ArrowRight size={16} /> },
        { label: 'Como exportar relatorios?', icon: <Sparkle size={16} /> },
      ],
    }

  // /hub, /selecionar-workspace, ou qualquer outra
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

const MIN_W = 340
const MIN_H = 400
const DEFAULT_W = 420
const DEFAULT_H = 560

export function GabiOnboardingWidget({ userName, pathname }: GabiOnboardingWidgetProps) {
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

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

  const handleSend = async (text?: string) => {
    const msg = text || inputVal.trim()
    if (!msg) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

    const suggestions = FOLLOW_UP_SUGGESTIONS[msg] || DEFAULT_SUGGESTIONS

    try {
      const res = await fetch('/api/v1/gabi/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'onboarding',
          'x-user-id': userName,
          'x-internal-key': 'gravity-internal',
        },
        body: JSON.stringify({ conversationId: 'new', message: msg }),
      })

      if (!res.ok) throw new Error('API indisponivel')

      const data = await res.json()
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response, suggestions },
      ])
    } catch {
      const response = MOCK_RESPONSES[msg] || DEFAULT_RESPONSE
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response, suggestions },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      let formatted = line
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')

      const listMatch = formatted.match(/^\* (.*)$/)
      if (listMatch) {
        return (
          <div key={i} style={{ paddingLeft: '1rem', marginBottom: '0.25rem' }}>
            <span dangerouslySetInnerHTML={{ __html: `&bull; ${listMatch[1]}` }} />
          </div>
        )
      }

      return (
        <span key={i}>
          <span dangerouslySetInnerHTML={{ __html: formatted }} />
          {i < content.split('\n').length - 1 && <br />}
        </span>
      )
    })
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
                style={{ ...headerBtnStyle, ':hover': undefined }}
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
          <div style={{
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
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div
                      style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                      }}
                    >
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '0.875rem',
                        lineHeight: 1.6,
                        color: msg.role === 'user' ? '#e2dcf2' : '#e5e7eb',
                        background: msg.role === 'user' ? '#3c2373' : '#1c2233',
                        border: msg.role === 'user' ? '1px solid #483183' : '1px solid #272d42',
                      }}>
                        {renderContent(msg.content)}
                      </div>
                    </div>

                    {/* Sugestoes contextuais — so na ultima resposta da Gabi */}
                    {isLastAssistant && msg.suggestions && !isTyping && (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.375rem',
                        paddingLeft: '0.25rem',
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
                              fontSize: '0.75rem',
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

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: '0.375rem 0.75rem',
                borderRadius: 99,
                fontSize: '0.75rem',
                color: '#9ca3af',
              }}>
                <Spinner size={14} style={{ animation: 'gabiSpin 1s linear infinite' }} />
                Pensando...
                <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af', animation: 'gabiBounce 1.4s infinite ease-in-out -0.32s' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af', animation: 'gabiBounce 1.4s infinite ease-in-out -0.16s' }} />
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#9ca3af', animation: 'gabiBounce 1.4s infinite ease-in-out' }} />
                </span>
              </div>
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
              Gabi IA · Arraste as bordas para redimensionar
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes gabiPulse {
          0%, 100% { box-shadow: 0 8px 32px rgba(99,102,241,0.4); }
          50% { box-shadow: 0 8px 48px rgba(99,102,241,0.6), 0 0 0 8px rgba(99,102,241,0.1); }
        }
        @keyframes gabiSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gabiSpin { 100% { transform: rotate(360deg); } }
        @keyframes gabiBounce {
          0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
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
