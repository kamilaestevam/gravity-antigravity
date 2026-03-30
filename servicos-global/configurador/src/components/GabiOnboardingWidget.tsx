import { useState, useRef, useEffect } from 'react'
import {
  Sparkle,
  X,
  PaperPlaneRight,
  Spinner,
  RocketLaunch,
  ShoppingBagOpen,
  Question,
  ArrowRight,
} from '@phosphor-icons/react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface GabiOnboardingWidgetProps {
  userName: string
  contexto: 'onboarding' | 'store'
  /** Se true, abre o widget automaticamente com mensagem de trial */
  abrirComTrial?: boolean
  onTrialHandled?: () => void
}

const ONBOARDING_WELCOME = `Oi! Sou a **Gabi**, sua assistente de IA na Gravity.

Estou aqui para te guiar nos primeiros passos. Pode me perguntar qualquer coisa sobre a plataforma!`

const STORE_WELCOME = `Bem-vindo a **Gravity Store**!

Posso te ajudar a escolher os modulos ideais para sua operacao. Me conta: qual e o foco da sua empresa?`

const QUICK_ACTIONS_ONBOARDING = [
  { label: 'O que e a Gravity Store?', icon: <ShoppingBagOpen size={16} /> },
  { label: 'Qual o proximo passo?', icon: <ArrowRight size={16} /> },
  { label: 'Como funciona o trial?', icon: <RocketLaunch size={16} /> },
]

const QUICK_ACTIONS_STORE = [
  { label: 'Qual produto comecar?', icon: <RocketLaunch size={16} /> },
  { label: 'O que e o SimulaCusto?', icon: <Question size={16} /> },
  { label: 'Me ajude a escolher', icon: <Sparkle size={16} /> },
]

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

const TRIAL_CTA_RESPONSE = `Pode ficar tranquilo! O trial da Gravity e **100% sem compromisso**:

* **Sem cartao de credito** — nao pedimos nenhum dado de pagamento
* **Sem contrato** — cancela quando quiser, sem burocracia
* **Acesso completo** — todos os recursos liberados por 14 dias
* **Sem pegadinha** — se nao gostar, nao paga nada

So cria sua empresa e comeca a explorar. Simples assim! 🚀`

const DEFAULT_RESPONSE =
  'Entendi! Ainda estou aprendendo sobre esse assunto, mas posso te ajudar com duvidas sobre a plataforma, produtos disponiveis e como comecar.\n\nTente perguntar sobre um dos nossos modulos!'

export function GabiOnboardingWidget({ userName, contexto, abrirComTrial, onTrialHandled }: GabiOnboardingWidgetProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputVal, setInputVal] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [pulse, setPulse] = useState(true)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const welcomeMsg = contexto === 'onboarding' ? ONBOARDING_WELCOME : STORE_WELCOME
  const quickActions = contexto === 'onboarding' ? QUICK_ACTIONS_ONBOARDING : QUICK_ACTIONS_STORE

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Stop pulse after 8s
  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 8000)
    return () => clearTimeout(t)
  }, [])

  // Abrir com mensagem de trial quando badge clicado
  useEffect(() => {
    if (abrirComTrial) {
      setOpen(true)
      setPulse(false)
      const userMsg: Message = { id: Date.now().toString(), role: 'user', content: 'O trial e realmente gratis?' }
      setMessages([userMsg])
      setIsTyping(true)
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'assistant', content: TRIAL_CTA_RESPONSE },
        ])
        setIsTyping(false)
      }, 1000)
      onTrialHandled?.()
    }
  }, [abrirComTrial])

  const handleSend = async (text?: string) => {
    const msg = text || inputVal.trim()
    if (!msg) return

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msg }
    setMessages(prev => [...prev, userMsg])
    setInputVal('')
    setIsTyping(true)

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
        { id: (Date.now() + 1).toString(), role: 'assistant', content: data.response },
      ])
    } catch {
      // Fallback para mock se API nao estiver rodando
      const response = MOCK_RESPONSES[msg] || DEFAULT_RESPONSE
      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: response },
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

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: 400,
          maxWidth: 'calc(100vw - 2rem)',
          height: 560,
          maxHeight: 'calc(100vh - 4rem)',
          borderRadius: 20,
          background: '#0f111a',
          border: '1px solid rgba(99,102,241,0.2)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          animation: 'gabiSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards',
          overflow: 'hidden',
          fontFamily: 'var(--font, Inter, sans-serif)',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
              }}>
                <Sparkle weight="fill" size={22} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f1f5f9' }}>Gabi</div>
                <div style={{ fontSize: '0.75rem', color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                  Assistente de Onboarding
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                cursor: 'pointer',
              }}
              type="button"
            >
              <X size={16} weight="bold" />
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Welcome */}
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

                {/* Quick Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {quickActions.map(action => (
                    <button
                      key={action.label}
                      onClick={() => handleSend(action.label)}
                      style={{
                        background: 'rgba(99,102,241,0.08)',
                        border: '1px solid rgba(99,102,241,0.15)',
                        borderRadius: 12,
                        padding: '0.75rem 1rem',
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
              messages.map(msg => (
                <div
                  key={msg.id}
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
              ))
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
            padding: '0.75rem 1rem 1rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
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
              fontSize: '0.65rem',
              color: '#4b5563',
              marginTop: '0.5rem',
            }}>
              Gabi IA · Assistente Gravity
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
