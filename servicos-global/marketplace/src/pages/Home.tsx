import { Fragment, useState, useEffect, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardText,
  Truck,
  CurrencyDollar,
  Calculator as CalcIcon,
  FileText,
  Sparkle,
  ArrowRight,
  CheckCircle,
  Rocket,
  Star,
  Globe,
  Anchor,
  ShieldCheck,
  TrendUp,
  Buildings,
  Users,
  Check,
  Funnel,
  CaretDown,
  CaretUp,
  BuildingOffice,
  ChartLineUp,
  Cube,
  Cpu,
} from '@phosphor-icons/react'
import { OnboardingPreview } from '../components/flows/OnboardingPreview'
import { PaywallDrawer } from '../components/flows/ModalPaywallDrawer'
import { InteractiveSimulator } from '../components/InteractiveSimulator'
import '../styles/home.css'

const PRODUCTS = [
  {
    id: 'pedido',
    icon: <ClipboardText size={26} weight="duotone" />,
    name: 'Pedido',
    tagline: 'Gestão de processos de importação e exportação',
    desc: 'Controle completo de pedidos com saldo automático, etapas customizáveis e rastreabilidade de ponta a ponta.',
    tags: ['Saldo automático', 'Rastreabilidade', 'Etapas'],
    cat: 'Operações',
    catColor: '#818cf8',
    catBg: 'rgba(99,102,241,0.1)',
    catBorder: 'rgba(99,102,241,0.2)',
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
    name: 'Smart Read',
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

const CALC_ITEMS = [
  { id: 'pedido',       label: 'Pedido',        desc: 'Processos de importação/exportação', price: 1.99,  unit: 'processos', fixed: false },
  { id: 'bid-frete',   label: 'BID Frete',     desc: 'Licitações de frete internacional',  price: 1.99,  unit: 'cotações',  fixed: false },
  { id: 'bid-cambio',  label: 'BID Câmbio',    desc: 'Cotações de câmbio comercial',       price: 2.99,  unit: 'cotações',  fixed: false },
  { id: 'simula-custo',label: 'Simula Custo',  desc: 'Mensalidade fixa',                   price: 10.99, unit: '',          fixed: true  },
  { id: 'nf-importacao',label: 'NF Importação',desc: 'Notas fiscais de importação',        price: 1.99,  unit: 'documentos',fixed: false },
  { id: 'smart-read',  label: 'Smart Read',    desc: 'Análises com IA',                    price: 2.00,  unit: 'análises',  fixed: false },
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

function fmtBRL(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function PricingCalculator() {
  const [active, setActive] = useState<Record<string, boolean>>({})
  const [volumes, setVolumes] = useState<Record<string, number>>({})

  function toggle(id: string) {
    const next = !active[id]
    setActive(a => ({ ...a, [id]: next }))
    if (next && !volumes[id]) setVolumes(v => ({ ...v, [id]: 10 }))
  }

  const total = CALC_ITEMS.reduce((sum, item) => {
    if (!active[item.id]) return sum
    return sum + (item.fixed ? item.price : item.price * (volumes[item.id] ?? 0))
  }, 0)

  const activeIds = CALC_ITEMS.filter(i => active[i.id]).map(i => i.id)

  return (
    <div style={{
      background: 'rgba(18, 22, 48, 0.4)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.06)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-lg)',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 1.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '1.0625rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>Calculadora de stack</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Ative módulos e informe o volume mensal estimado</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Estimativa mensal</p>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>{fmtBRL(total)}</p>
        </div>
      </div>

      {/* Rows */}
      <div>
        {CALC_ITEMS.map((item, idx) => {
          const on = !!active[item.id]
          const vol = volumes[item.id] ?? 0
          const cost = on ? (item.fixed ? item.price : item.price * vol) : 0
          return (
            <div
              key={item.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr auto auto',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.125rem 1.75rem',
                borderBottom: idx < CALC_ITEMS.length - 1 ? '1px solid rgba(255, 255, 255, 0.04)' : 'none',
                background: on ? 'rgba(129, 140, 248, 0.03)' : 'transparent',
                transition: 'background 0.25s ease',
              }}
            >
              {/* Toggle */}
              <button
                onClick={() => toggle(item.id)}
                aria-label={`${on ? 'Desativar' : 'Ativar'} ${item.label}`}
                style={{
                  width: '40px', height: '22px', borderRadius: '9999px',
                  background: on ? 'var(--accent)' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid transparent',
                  position: 'relative', cursor: 'pointer', flexShrink: 0, 
                  transition: 'background 0.25s, border-color 0.25s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '3px', left: on ? '21px' : '3px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </button>

              {/* Info */}
              <div>
                <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>

              {/* Volume input */}
              {!item.fixed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <input
                    type="number"
                    min={0}
                    value={on ? vol : ''}
                    disabled={!on}
                    onChange={e => setVolumes(v => ({ ...v, [item.id]: Math.max(0, Number(e.target.value)) }))}
                    placeholder="0"
                    style={{
                      width: '80px', padding: '0.45rem 0.75rem', textAlign: 'right',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px', color: 'var(--text-primary)',
                      fontFamily: '"DM Mono", monospace', fontSize: '0.875rem',
                      opacity: on ? 1 : 0.3, transition: 'opacity 0.25s',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.unit}/mês</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinatura fixa</span>
              )}

              {/* Cost */}
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.9375rem', fontWeight: 700,
                color: on && cost > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'right', minWidth: '90px',
              }}>
                {fmtBRL(cost)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '1.5rem 1.75rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.6 }}>
          Valores estimados em BRL. Descontos de volume progressivos aplicados diretamente na fatura mensal consolidada.
        </p>
        <a
          href={activeIds.length > 0 ? `/cadastro?trial=true&produtos=${activeIds.join(',')}` : '/cadastro?trial=true'}
          className="btn btn-primary"
        >
          <Rocket size={16} weight="duotone" />
          Começar agora
        </a>
      </div>
    </div>
  )
}

const TESTIMONIALS = [
  { name: 'Mariana Alves', role: 'Coordenadora de COMEX, Grupo Têxtil SP', text: 'Reduzimos 40% do tempo de abertura de processo com o módulo Pedido. A rastreabilidade de saldo foi o que mais nos impressionou.' },
  { name: 'Ricardo Fonseca', role: 'Gerente de Importação, Importadora Litoral', text: 'O BID Frete nos deu visibilidade real dos nossos fretes. Antes ficávamos dependentes de planilha. Hoje em 2 cliques sabemos quem é o melhor fornecedor.' },
  { name: 'Juliana Motta', role: 'Head de Operações, Tradings Brasil', text: 'O Smart Read transformou a conferência documental. O que levava 3 horas nossa equipe agora faz em 15 minutos com a IA.' },
]

export function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)
  const [selectedScreen, setSelectedScreen] = useState<string | null>(null)
  const [consoleTab, setConsoleTab] = useState('pedido')
  
  // States for Multi-Workspace section
  const [selectedWorkspace, setSelectedWorkspace] = useState<'matriz' | 'sul' | 'rj'>('matriz')
  const [checkedWorkspaces, setCheckedWorkspaces] = useState({
    matriz: true,
    sul: true,
    rj: false
  })

  const consoleTabsList = [
    { id: 'pedido', label: 'Pedido', icon: <ClipboardText size={16} /> },
    { id: 'bid-frete', label: 'BID Frete', icon: <Truck size={16} /> },
    { id: 'bid-cambio', label: 'BID Câmbio', icon: <CurrencyDollar size={16} /> },
    { id: 'simula-custo', label: 'Simula Custo', icon: <CalcIcon size={16} /> },
    { id: 'nf-importacao', label: 'NF Importação', icon: <FileText size={16} /> },
    { id: 'smart-read', label: 'Smart Read', icon: <Sparkle size={16} /> },
  ]

  const activeProduct = PRODUCTS.find(p => p.id === selectedScreen)
  const activeRgb = activeProduct
    ? (activeProduct.id === 'pedido' ? '129, 140, 248' :
       activeProduct.id === 'bid-frete' ? '251, 191, 36' :
       activeProduct.id === 'bid-cambio' ? '6, 182, 212' :
       activeProduct.id === 'simula-custo' ? '16, 185, 129' :
       activeProduct.id === 'nf-importacao' ? '59, 130, 246' :
       '168, 85, 247')
    : '99, 102, 241'

  const closeScreen = () => {
    setSelectedScreen(null)
  }

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

  // Auto rotate tabs every 6 seconds to look alive
  useEffect(() => {
    const timer = setInterval(() => {
      setConsoleTab(prev => {
        const idx = consoleTabsList.findIndex(t => t.id === prev)
        return consoleTabsList[(idx + 1) % consoleTabsList.length].id
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  function renderConsoleContent(tab: string) {
    switch (tab) {
      case 'pedido':
        return (
          <div className="sim-pedido">
            <div className="sim-pedido__step">
              <span className="sim-pedido__circle">✓</span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Processo #PO-9821</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Saldo do pedido atualizado: 450 de 1000 unidades</p>
              </div>
            </div>
            <div className="sim-pedido__step">
              <span className="sim-pedido__circle">✓</span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>LI Deferida - Anuência Anvisa</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Autorização registrada com sucesso</p>
              </div>
            </div>
            <div className="sim-pedido__step">
              <span className="sim-pedido__circle sim-pedido__circle--active">●</span>
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Desembaraço Parametrizado</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>Aguardando Canal Verde no Porto de Santos</p>
              </div>
            </div>
          </div>
        )
      case 'bid-frete':
        return (
          <div className="sim-bid-frete">
            <div className="sim-bid-frete__card">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>CMA CGM</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>R$ 14.500</p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Transit time: 24 dias</span>
            </div>
            <div className="sim-bid-frete__card sim-bid-frete__card--chosen">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: 800 }}>HAPAG-LLOYD</p>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
              </div>
              <p style={{ fontSize: '1.125rem', fontWeight: 900, color: 'var(--success)', fontFamily: 'DM Mono' }}>R$ 12.400</p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 700 }}>Saving: R$ 2.100 (Melhor Opção)</span>
            </div>
            <div className="sim-bid-frete__card">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>MSC LOGISTICS</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'DM Mono' }}>R$ 15.200</p>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Transit time: 22 dias</span>
            </div>
          </div>
        )
      case 'bid-cambio':
        return (
          <div className="sim-bid-cambio">
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>LEILÃO DE CÂMBIO ATIVO - USD 50,000</p>
            <div className="sim-bid-cambio__row" style={{ borderColor: 'rgba(16, 185, 129, 0.25)', background: 'rgba(16, 185, 129, 0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Corretora Master</span>
              </div>
              <span className="sim-bid-cambio__price" style={{ color: 'var(--success)' }}>R$ 5,128</span>
            </div>
            <div className="sim-bid-cambio__row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Banco Inter</span>
              </div>
              <span className="sim-bid-cambio__price" style={{ color: 'var(--text-secondary)' }}>R$ 5,142</span>
            </div>
            <div className="sim-bid-cambio__row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Bexs FX</span>
              </div>
              <span className="sim-bid-cambio__price" style={{ color: 'var(--text-secondary)' }}>R$ 5,155</span>
            </div>
          </div>
        )
      case 'simula-custo':
        return (
          <div className="sim-simula">
            <div className="sim-simula__bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Impostos Estimados (II, IPI, PIS, COFINS)</span>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>R$ 34.500</span>
              </div>
              <div className="sim-simula__bar-track">
                <div className="sim-simula__bar-fill" style={{ width: '65%', background: '#f59e0b' }} />
              </div>
            </div>
            <div className="sim-simula__bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Custo Logístico (Frete, Seguro, Armazenagem)</span>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 700 }}>R$ 18.200</span>
              </div>
              <div className="sim-simula__bar-track">
                <div className="sim-simula__bar-fill" style={{ width: '35%', background: '#3b82f6' }} />
              </div>
            </div>
            <div className="sim-simula__bar-container">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                <span style={{ color: 'var(--success)', fontWeight: 700 }}>Savings Projetado com Stack Gravity</span>
                <span style={{ fontFamily: 'DM Mono', fontWeight: 700, color: 'var(--success)' }}>R$ 8.900</span>
              </div>
              <div className="sim-simula__bar-track" style={{ background: 'rgba(16, 185, 129, 0.15)' }}>
                <div className="sim-simula__bar-fill" style={{ width: '85%', background: 'var(--success)' }} />
              </div>
            </div>
          </div>
        )
      case 'nf-importacao':
        return (
          <div className="sim-nf">
            <div className="sim-nf__document">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.05em' }}>DI #26/04812-9</span>
                <span className="sim-nf__status-tag">NF-E GERADA</span>
              </div>
              <div className="sim-nf__line" />
              <div className="sim-nf__line sim-nf__line--short" />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <div style={{ width: '24px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
                <div style={{ width: '32px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '12px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1.2 }}>
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)' }}>Rateio Inteligente</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Despesas de frete internacional distribuídas proporcionalmente pelo peso bruto e FOB de cada um dos 12 itens da Declaração de Importação.
              </p>
            </div>
          </div>
        )
      case 'smart-read':
        return (
          <div className="sim-smart-read">
            <div className="sim-smart-read__extracted">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.6875rem', color: '#a855f7', fontWeight: 700, letterSpacing: '0.02em' }}>LEITOR DE DOCUMENTOS IA</span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--success)', fontWeight: 700 }}>COMPILANDO DADOS...</span>
              </div>
              <div className="sim-smart-read__item">
                <span style={{ color: 'var(--text-secondary)' }}>Consignee:</span>
                <span style={{ fontWeight: 600 }}>IMPORTADORA GLOBAL LTDA</span>
              </div>
              <div className="sim-smart-read__item">
                <span style={{ color: 'var(--text-secondary)' }}>Container:</span>
                <span style={{ fontWeight: 600, fontFamily: 'DM Mono' }}>SUDU198276-2</span>
              </div>
              <div className="sim-smart-read__item">
                <span style={{ color: 'var(--text-secondary)' }}>Net Weight:</span>
                <span style={{ fontWeight: 600, fontFamily: 'DM Mono' }}>18.420,00 KG</span>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="home">
      <OnboardingPreview open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      <PaywallDrawer open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* ===== HERO ===== */}
      <section
        className="hero"
        onMouseLeave={closeScreen}
        onClick={(e) => {
          const target = e.target as HTMLElement
          if (target.closest('a') || target.closest('button') || target.closest('input') || target.closest('select')) {
            return
          }
          closeScreen()
        }}
      >
        {/* Glow Effects */}
        <div className="ambient-glow glow-indigo" />
        <div className="ambient-glow glow-purple" />
        <div className="ambient-glow glow-cyan" />

        <div className="container">
          <div className={`hero__content ${selectedScreen ? 'hero__content--dimmed' : ''}`}>
            <div className="badge badge-accent" style={{ display: 'inline-flex', marginBottom: '1.5rem', border: '1px solid rgba(129, 140, 248, 0.15)', background: 'rgba(129, 140, 248, 0.05)' }}>
              <Star size={12} weight="fill" style={{ color: 'var(--accent)' }} />
              <span style={{ fontWeight: 700, letterSpacing: '0.04em' }}>Plataforma de COMEX · Sem cartão de crédito</span>
            </div>

            <h1 className="hero__title text-display">
              Sua operação de{' '}
              <span className="gradient-text">comércio exterior</span>{' '}
              no próximo nível
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
                  <CheckCircle size={15} color="var(--success)" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Efeito 3D Interativo: Giro Flat ao clicar, com Reset ao sair com o mouse */}
          <div
            className={`stack-3d-container ${selectedScreen ? 'has-active-layer' : ''}`}
            style={{ '--active-layer-rgb': activeRgb } as CSSProperties}
            aria-hidden
          >
            {/* Lasers de Conexão (somem no hover) */}
            <div className="stack-connector connector-1" />
            <div className="stack-connector connector-2" />
            <div className="stack-connector connector-3" />
            <div className="stack-connector connector-4" />

            {/* Linhas de conexão SVG — ocultas (coordenadas fixas geravam artefatos sobre a pilha/simulador) */}
            <svg className="stack-connector-svg" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
              <path d="M -20 460 L 60 460 L 150 400" fill="none" stroke="#818cf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="150" cy="400" r="3" fill="#818cf8" />
              
              <path d="M 430 390 L 350 390 L 250 350" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="250" cy="350" r="3" fill="#fbbf24" />
              
              <path d="M -30 320 L 50 320 L 150 280" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="150" cy="280" r="3" fill="#06b6d4" />
              
              <path d="M 440 250 L 360 250 L 250 210" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="250" cy="210" r="3" fill="#10b981" />
              
              <path d="M -20 180 L 60 180 L 150 140" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="150" cy="140" r="3" fill="#3b82f6" />
              
              <path d="M 420 110 L 340 110 L 250 70" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />
              <circle cx="250" cy="70" r="3" fill="#a855f7" />
            </svg>

            {/* Rótulos Flutuantes de Informações */}
            <div className="stack-label-float" style={{ bottom: '40px', left: '-50px', '--layer-color': '#818cf8' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8' }}>MÓDULO 01</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Gestão de Pedidos</span>
            </div>
            <div className="stack-label-float" style={{ bottom: '110px', right: '-60px', left: 'auto', '--layer-color': '#fbbf24' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#fbbf24' }}>MÓDULO 02</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>BID Frete Intel.</span>
            </div>
            <div className="stack-label-float" style={{ bottom: '180px', left: '-60px', '--layer-color': '#06b6d4' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#06b6d4' }}>MÓDULO 03</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>BID Câmbio Corretor</span>
            </div>
            <div className="stack-label-float" style={{ bottom: '250px', right: '-70px', left: 'auto', '--layer-color': '#10b981' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981' }}>MÓDULO 04</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Simula Custo Fiscal</span>
            </div>
            <div className="stack-label-float" style={{ bottom: '320px', left: '-50px', '--layer-color': '#3b82f6' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#3b82f6' }}>MÓDULO 05</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>NF Entrada Automática</span>
            </div>
            <div className="stack-label-float" style={{ bottom: '390px', right: '-50px', left: 'auto', '--layer-color': '#a855f7' } as CSSProperties}>
              <span style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase', color: '#a855f7' }}>MÓDULO 06</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Smart Read IA</span>
            </div>

            {/* Palco Isométrico 3D */}
            <div className={`stack-3d-wrapper ${selectedScreen ? 'has-active-layer' : ''}`}>
              {/* Placa 06: Smart Read */}
              <div
                className={`stack-layer stack-layer-smart-read ${selectedScreen === 'smart-read' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'smart-read') {
                    closeScreen()
                  } else {
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
                        <span className="slab-title">Smart Read</span>
                      </div>
                      <span className="slab-tag">IA</span>
                    </>
                  )}
                </div>
              </div>

              {/* Placa 05: NF Importação */}
              <div
                className={`stack-layer stack-layer-nf-importacao ${selectedScreen === 'nf-importacao' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'nf-importacao') {
                    closeScreen()
                  } else {
                    setSelectedScreen('nf-importacao')
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  {/* Mockup CSS de NF de entrada */}
                  <div className="slab-mock-ui">
                    <div className="slab-mock-header">
                      <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#3b82f6' }}>XML / DANFE</span>
                      <span style={{ fontSize: '0.45rem', color: '#10b981', fontWeight: 700 }}>PROCESSED</span>
                    </div>
                    <div className="slab-mock-line" />
                    <div className="slab-mock-line slab-mock-line--short" />
                    <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                      <span style={{ width: '12px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }} />
                      <span style={{ width: '18px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }} />
                      <span style={{ width: '10px', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '1px' }} />
                    </div>
                  </div>
                  <div className="slab-content">
                    <span className="slab-icon"><FileText size={16} weight="duotone" /></span>
                    <span className="slab-title">NF Importação</span>
                  </div>
                  <span className="slab-tag">Fiscal</span>
                </div>
              </div>

              {/* Placa 04: Simula Custo */}
              <div
                className={`stack-layer stack-layer-simula-custo ${selectedScreen === 'simula-custo' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'simula-custo') {
                    closeScreen()
                  } else {
                    setSelectedScreen('simula-custo')
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  {/* Mockup CSS de Simulação de Margens */}
                  <div className="slab-mock-ui">
                    <div className="slab-mock-header">
                      <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#10b981' }}>SIMULAÇÃO</span>
                      <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.4)', fontFamily: 'DM Mono' }}>SAVINGS: 14%</span>
                    </div>
                    <div className="slab-mock-line" />
                    <div className="slab-mock-chart">
                      <div className="slab-mock-chart-bar" style={{ height: '35%' }} />
                      <div className="slab-mock-chart-bar" style={{ height: '55%' }} />
                      <div className="slab-mock-chart-bar" style={{ height: '80%' }} />
                      <div className="slab-mock-chart-bar" style={{ height: '45%' }} />
                    </div>
                  </div>
                  <div className="slab-content">
                    <span className="slab-icon"><CalcIcon size={16} weight="duotone" /></span>
                    <span className="slab-title">Simula Custo</span>
                  </div>
                  <span className="slab-tag">Simula</span>
                </div>
              </div>

              {/* Placa 03: BID Câmbio */}
              <div
                className={`stack-layer stack-layer-bid-cambio ${selectedScreen === 'bid-cambio' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'bid-cambio') {
                    closeScreen()
                  } else {
                    setSelectedScreen('bid-cambio')
                  }
                }}
              >
                <div className="slab-left" />
                <div className="slab-front" />
                <div className="slab-top">
                  <div className="slab-image-bg" style={{ backgroundImage: "url('/telas/tela_site_bid_cambio.png')" }} />
                  <div className="slab-content">
                    <span className="slab-icon"><CurrencyDollar size={16} weight="duotone" /></span>
                    <span className="slab-title">BID Câmbio</span>
                  </div>
                  <span className="slab-tag">Cotação</span>
                </div>
              </div>

              {/* Placa 02: BID Frete */}
              <div
                className={`stack-layer stack-layer-bid-frete ${selectedScreen === 'bid-frete' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'bid-frete') {
                    closeScreen()
                  } else {
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
                        <span className="slab-title">BID Frete</span>
                      </div>
                      <span className="slab-tag">Logística</span>
                    </>
                  )}
                </div>
              </div>

              {/* Placa 01: Pedido */}
              <div
                className={`stack-layer stack-layer-pedido ${selectedScreen === 'pedido' ? 'active' : ''}`}
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation()
                  if (selectedScreen === 'pedido') {
                    closeScreen()
                  } else {
                    setSelectedScreen('pedido')
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
                      <div className="slab-image-bg" style={{ backgroundImage: "url('/telas/tela_site_pedido.png')" }} />
                      <div className="slab-content">
                        <span className="slab-icon"><ClipboardText size={16} weight="duotone" /></span>
                        <span className="slab-title">Pedido</span>
                      </div>
                      <span className="slab-tag">Processo</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ===== A PLATAFORMA POR DENTRO (Interactive OS Console) ===== */}
      <section className="section" style={{ background: 'rgba(3, 5, 12, 0.4)', borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Demonstração</p>
            <h2>Gravity OS por dentro</h2>
            <p>Interaja com o console e veja as ações fluírem de forma nativa e integrada.</p>
          </div>

          <div className="console-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Header style */}
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
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>Gravity OS Console</span>
            </div>

            {/* Console Tabs */}
            <div className="console-tabs">
              {consoleTabsList.map(tab => (
                <button
                  key={tab.id}
                  className={`console-tab ${consoleTab === tab.id ? 'console-tab--active' : ''}`}
                  onClick={() => setConsoleTab(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Display Body */}
            <div className="console-body">
              {renderConsoleContent(consoleTab)}
            </div>
          </div>
        </div>
      </section>

            {/* ===== PREMIUM 3D MULTI-WORKSPACE ECOSYSTEM ===== */}
      <section className="section multi-workspace-premium" style={{ 
        background: '#02040a', 
        position: 'relative', 
        padding: '8rem 0', 
        overflow: 'hidden',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Deep Space / Premium Glows */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-10%', right: '0%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-10%', left: '0%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(244,63,94,0.05) 0%, transparent 60%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <div className="text-center" style={{ marginBottom: '5rem' }}>
            <span style={{ 
              display: 'inline-block', padding: '6px 16px', borderRadius: '30px', 
              background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)',
              color: '#818cf8', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: '1.5rem'
            }}>Ecossistema Multi-Empresas 3D</span>
            <h2 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: '1.5rem', lineHeight: 1.1 }}>
              O Poder do <span style={{ background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Gravity</span><br/>em Toda a sua Rede
            </h2>
            <p style={{ maxWidth: '650px', margin: '0 auto', color: '#94a3b8', fontSize: '1.125rem', lineHeight: 1.6 }}>
              Experimente a percepção total dos seus dados. Selecione um, alguns ou todos os workspaces e veja o ecossistema consolidar informações em tempo real, impulsionando decisões estratégicas.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '350px 1fr', 
            gap: '4rem', 
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '32px',
            padding: '4rem',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
          }}>
            
            {/* Control Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Painel de Controle</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Ative ou desative workspaces para visualizar o fluxo de dados no ecossistema.</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { id: 'matriz', name: 'Gravity São Paulo', type: 'Matriz', icon: <BuildingOffice weight="duotone" />, color: '#818cf8', activeBg: 'rgba(129, 140, 248, 0.15)' },
                  { id: 'sul', name: 'Gravity Santa Catarina', type: 'Filial Logística', icon: <Buildings weight="duotone" />, color: '#10b981', activeBg: 'rgba(16, 185, 129, 0.15)' },
                  { id: 'rj', name: 'Gravity Rio de Janeiro', type: 'Centro de Distribuição', icon: <Buildings weight="duotone" />, color: '#f43f5e', activeBg: 'rgba(244, 63, 94, 0.15)' }
                ].map(ws => (
                  <div 
                    key={ws.id}
                    onClick={() => setCheckedWorkspaces(prev => ({ ...prev, [ws.id]: !prev[ws.id] }))}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '16px', borderRadius: '16px', cursor: 'pointer',
                      background: checkedWorkspaces[ws.id] ? ws.activeBg : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${checkedWorkspaces[ws.id] ? ws.color : 'rgba(255,255,255,0.05)'}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: checkedWorkspaces[ws.id] ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: checkedWorkspaces[ws.id] ? `0 10px 30px -10px ${ws.color}66` : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: checkedWorkspaces[ws.id] ? ws.color : 'rgba(255,255,255,0.05)',
                      color: checkedWorkspaces[ws.id] ? '#fff' : '#64748b',
                      fontSize: '24px', transition: 'all 0.3s'
                    }}>
                      {ws.icon}
                    </div>
                    <div style={{ marginLeft: '16px', flex: 1 }}>
                      <div style={{ color: checkedWorkspaces[ws.id] ? '#fff' : '#94a3b8', fontWeight: 800, fontSize: '1rem', transition: 'color 0.3s' }}>{ws.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, marginTop: '2px' }}>{ws.type}</div>
                    </div>
                    <div style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${checkedWorkspaces[ws.id] ? ws.color : '#475569'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s',
                      background: checkedWorkspaces[ws.id] ? ws.color : 'transparent'
                    }}>
                      {checkedWorkspaces[ws.id] && <Check size={14} weight="bold" color="#fff" />}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => setCheckedWorkspaces({ matriz: true, sul: true, rj: true })}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                >Habilitar Todos</button>
                <button 
                  onClick={() => setCheckedWorkspaces({ matriz: false, sul: false, rj: false })}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.1)'; e.currentTarget.style.color = '#f43f5e'; e.currentTarget.style.borderColor = '#f43f5e'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >Desabilitar</button>
              </div>
            </div>

            {/* 3D Visualizer */}
            <div style={{ position: 'relative', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: '1500px' }}>
              
              {/* Central Core (SSOT) */}
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                width: '160px', height: '160px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                border: '1px dashed rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 10,
                boxShadow: Object.values(checkedWorkspaces).some(v => v) ? '0 0 80px rgba(255,255,255,0.2)' : 'none',
                transition: 'all 0.5s'
              }}>
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.8)',
                  transform: 'translateZ(50px)',
                  zIndex: 11
                }}>
                  <ShieldCheck size={40} weight="duotone" color="#0f172a" />
                </div>
                <div style={{ position: 'absolute', bottom: '-40px', color: '#fff', fontWeight: 800, fontSize: '0.875rem', letterSpacing: '0.1em' }}>SSOT CORE</div>
              </div>

              {/* Orbital Rings & Nodes */}
              <div style={{
                position: 'absolute', width: '100%', height: '100%',
                transformStyle: 'preserve-3d',
                transform: 'rotateX(60deg) rotateZ(0deg)',
                animation: 'spin 40s linear infinite'
              }}>
                <style>{`
                  @keyframes spin { 0% { transform: rotateX(60deg) rotateZ(0deg); } 100% { transform: rotateX(60deg) rotateZ(360deg); } }
                  @keyframes data-flow { 0% { stroke-dashoffset: 20; } 100% { stroke-dashoffset: 0; } }
                  .node-container { transform-style: preserve-3d; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
                  .node-container.inactive { opacity: 0.3; transform: translateZ(0) scale(0.8) !important; filter: grayscale(1); }
                  .data-beam { stroke-dasharray: 6 4; animation: data-flow 1s linear infinite; transition: opacity 0.3s; }
                `}</style>

                {/* Main Ring */}
                <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)' }} />
                
                {[
                  { id: 'matriz', angle: 0, color: '#818cf8' },
                  { id: 'sul', angle: 120, color: '#10b981' },
                  { id: 'rj', angle: 240, color: '#f43f5e' }
                ].map(ws => (
                  <Fragment key={ws.id}>
                    {/* Beam to Center */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                      <line 
                        x1="50%" y1="50%" 
                        x2={`${50 + Math.cos(ws.angle * Math.PI / 180) * 40}%`} 
                        y2={`${50 + Math.sin(ws.angle * Math.PI / 180) * 40}%`}
                        stroke={ws.color} strokeWidth="3"
                        className="data-beam"
                        style={{ opacity: checkedWorkspaces[ws.id] ? 0.8 : 0 }}
                      />
                    </svg>

                    {/* Node */}
                    <div 
                      className={`node-container ${!checkedWorkspaces[ws.id] ? 'inactive' : ''}`}
                      style={{
                        position: 'absolute',
                        top: `calc(${50 + Math.sin(ws.angle * Math.PI / 180) * 40}% - 40px)`,
                        left: `calc(${50 + Math.cos(ws.angle * Math.PI / 180) * 40}% - 40px)`,
                        width: '80px', height: '80px',
                        transform: `translateZ(${checkedWorkspaces[ws.id] ? '80px' : '0px'})`
                      }}
                    >
                      {/* Node Shadow/Glow on the plane */}
                      <div style={{ position: 'absolute', top: '100%', left: '0', width: '80px', height: '80px', background: ws.color, filter: 'blur(30px)', opacity: 0.5, transform: 'translateZ(-80px)' }} />
                      
                      {/* Node Body (Counter-rotate to face camera slightly) */}
                      <div style={{
                        width: '100%', height: '100%', borderRadius: '20px',
                        background: `linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`,
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${ws.color}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `inset 0 0 20px ${ws.color}40, 0 10px 20px rgba(0,0,0,0.5)`,
                        transform: 'rotateZ(-45deg) rotateX(-60deg)'
                      }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: ws.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${ws.color}` }}>
                          <Buildings size={24} color="#fff" weight="fill" />
                        </div>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>

          </div>

          {/* Aggregated Dashboard */}
          <div style={{ 
            marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem',
            opacity: Object.values(checkedWorkspaces).some(v => v) ? 1 : 0.4,
            transition: 'opacity 0.5s',
            transform: Object.values(checkedWorkspaces).some(v => v) ? 'translateY(0)' : 'translateY(20px)'
          }}>
            {[
              { label: 'RECEITA AGREGADA', value: `USD ${((checkedWorkspaces.matriz ? 1.2 : 0) + (checkedWorkspaces.sul ? 0.45 : 0) + (checkedWorkspaces.rj ? 0.18 : 0)).toFixed(2)}M`, icon: <ChartLineUp size={24} weight="duotone" color="#10b981" /> },
              { label: 'VOLUME DE CARGAS', value: `${(checkedWorkspaces.matriz ? 2400 : 0) + (checkedWorkspaces.sul ? 1100 : 0) + (checkedWorkspaces.rj ? 650 : 0)} TEUs`, icon: <Cube size={24} weight="duotone" color="#818cf8" /> },
              { label: 'OPERADORES ATIVOS', value: `${(checkedWorkspaces.matriz ? 12 : 0) + (checkedWorkspaces.sul ? 5 : 0) + (checkedWorkspaces.rj ? 3 : 0)}`, icon: <Users size={24} weight="duotone" color="#f43f5e" /> },
              { label: 'STATUS DO SISTEMA', value: Object.values(checkedWorkspaces).some(v => v) ? 'SINCRONIZADO' : 'STANDBY', icon: <Cpu size={24} weight="duotone" color={Object.values(checkedWorkspaces).some(v => v) ? '#10b981' : '#64748b'} /> }
            ].map((stat, i) => (
              <div key={i} style={{ 
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>{stat.label}</span>
                  {stat.icon}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                  {stat.value}
                </div>
                {/* Subtle highlight */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: '40%', background: 'linear-gradient(90deg, #818cf8, transparent)' }} />
              </div>
            ))}
          </div>

        </div>
      </section>
{/* ===== MÓDULOS ===== */}
      <section className="section" style={{ background: 'var(--bg-body-dark)', position: 'relative' }}>
        {/* Glow in modules background */}
        <div className="ambient-glow glow-cyan" style={{ bottom: '10%', left: '10%', opacity: 0.1 }} />

        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Módulos</p>
            <h2>Escolha os módulos certos<br />para sua operação</h2>
            <p>Contrate só o que usar, escale conforme crescer. Cada módulo funciona de forma independente ou em conjunto.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {PRODUCTS.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
              >
                {/* Ambient product specific glow on card hover */}
                <div className="card-product-glow" style={{
                  background: `radial-gradient(circle at center, ${p.catColor} 0%, transparent 70%)`
                }} />

                {/* Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
                    background: p.catBg, color: p.catColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${p.catBorder}`,
                  }}>
                    {p.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="badge badge-success" style={{ border: '1px solid rgba(16, 185, 129, 0.15)' }}>Disponível</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '9999px',
                      background: p.catBg, color: p.catColor, border: `1px solid ${p.catBorder}`,
                    }}>{p.cat}</span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                  <p style={{ fontWeight: 800, fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{p.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{p.desc}</p>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', position: 'relative', zIndex: 1 }}>
                  {p.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                      padding: '2px 8px', borderRadius: '9999px',
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '2px' }}>A partir de</p>
                    <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {p.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </p>
                  </div>
                  <a
                    href={`/cadastro?produto=${p.id}&trial=true`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'rgba(129, 140, 248, 0.08)', border: '1px solid rgba(129, 140, 248, 0.15)',
                      color: 'var(--accent)', borderRadius: '9999px',
                      fontSize: '0.75rem', fontWeight: 700, padding: '6px 14px',
                      textDecoration: 'none', transition: 'all var(--transition-fast)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--accent)'
                      e.currentTarget.style.color = '#03050c'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(129, 140, 248, 0.08)'
                      e.currentTarget.style.color = 'var(--accent)'
                    }}
                  >
                    Testar →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== COMO FUNCIONA ===== */}
      <section className="section" style={{ background: 'rgba(3, 5, 12, 0.4)' }}>
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Como funciona</p>
            <h2>Monte seu Gravity</h2>
            <p>Comece com um módulo e adicione mais conforme sua operação cresce. Sem contrato de longo prazo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {[
              { num: '01', title: 'Escolha seus módulos', desc: 'Selecione os produtos que fazem sentido para a sua operação hoje.' },
              { num: '02', title: 'Ative em minutos', desc: 'Crie sua conta, ative os módulos e convide seu time. Sem instalação.' },
              { num: '03', title: 'Opere e integre', desc: 'Importe seus dados e conecte os módulos entre si nativamente.' },
              { num: '04', title: 'Escale sem fricção', desc: 'Pague conforme usa. Descontos por volume se aplicam automaticamente.' },
            ].map(step => (
              <div key={step.num} className="card-surface" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>{step.num}</span>
                <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{step.title}</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALCULADORA ===== */}
      <section className="section" style={{ background: 'var(--bg-body-dark)' }} id="calculadora">
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Estimativa de custo</p>
            <h2>Calcule seu investimento</h2>
            <p>Ative os módulos que quer usar e informe o volume mensal estimado.</p>
          </div>
          <PricingCalculator />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section" style={{ background: 'rgba(3, 5, 12, 0.4)' }}>
        <div className="container">
          <div className="section-title">
            <h2>O que dizem os <span className="gradient-text">clientes</span></h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card-surface" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} color="var(--warning)" weight="fill" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
                  <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{t.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
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
