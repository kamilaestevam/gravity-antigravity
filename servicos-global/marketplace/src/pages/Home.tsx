import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ClipboardText,
  Truck,
  CurrencyDollar,
  Calculator,
  FileText,
  Sparkle,
  ArrowRight,
  CheckCircle,
  Rocket,
  Star,
} from '@phosphor-icons/react'
import { OnboardingPreview } from '../components/flows/OnboardingPreview'
import { PaywallDrawer } from '../components/flows/ModalPaywallDrawer'
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
    catColor: '#fbbf24',
    catBg: 'rgba(245,158,11,0.1)',
    catBorder: 'rgba(245,158,11,0.25)',
    price: 'R$ 2,99',
    unit: '/ cotação',
  },
  {
    id: 'simula-custo',
    icon: <Calculator size={26} weight="duotone" />,
    name: 'Simula Custo',
    tagline: 'Simulação de custos de importação e exportação',
    desc: 'Calcule o custo real das suas operações com múltiplos cenários, impostos automáticos e projeção de margens.',
    tags: ['Multi-cenário', 'Impostos automáticos', 'Margem'],
    cat: 'Simulação',
    catColor: '#34d399',
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
    catColor: '#818cf8',
    catBg: 'rgba(99,102,241,0.1)',
    catBorder: 'rgba(99,102,241,0.2)',
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
    catColor: '#a78bfa',
    catBg: 'rgba(139,92,246,0.1)',
    catBorder: 'rgba(139,92,246,0.25)',
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

function fmtBRL(n: number) {
  return 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function Calculator() {
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
      background: 'var(--bg-base)',
      border: '1px solid var(--bg-elevated)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Calculadora de stack</p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '2px' }}>Ative módulos e informe o volume mensal estimado</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Estimativa mensal</p>
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '1.75rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{fmtBRL(total)}</p>
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
                gap: '0.75rem',
                padding: '0.875rem 1.5rem',
                borderBottom: idx < CALC_ITEMS.length - 1 ? '1px solid var(--bg-elevated)' : 'none',
                background: on ? 'rgba(99,102,241,0.04)' : undefined,
                transition: 'background 0.15s',
              }}
            >
              {/* Toggle */}
              <button
                onClick={() => toggle(item.id)}
                aria-label={`${on ? 'Desativar' : 'Ativar'} ${item.label}`}
                style={{
                  width: '36px', height: '20px', borderRadius: '9999px',
                  background: on ? 'var(--accent)' : 'var(--bg-elevated)',
                  border: `1px solid ${on ? 'var(--accent)' : 'var(--bg-elevated)'}`,
                  position: 'relative', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <span style={{
                  position: 'absolute', top: '2px', left: on ? '16px' : '2px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: on ? '#fff' : 'var(--text-muted)',
                  transition: 'left 0.2s, background 0.2s',
                }} />
              </button>

              {/* Info */}
              <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: on ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.label}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>

              {/* Volume input */}
              {!item.fixed ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={0}
                    value={on ? vol : ''}
                    disabled={!on}
                    onChange={e => setVolumes(v => ({ ...v, [item.id]: Math.max(0, Number(e.target.value)) }))}
                    placeholder="0"
                    style={{
                      width: '72px', padding: '0.375rem 0.625rem', textAlign: 'right',
                      background: 'var(--bg-surface)', border: '1px solid var(--bg-elevated)',
                      borderRadius: '6px', color: 'var(--text-primary)',
                      fontFamily: '"DM Mono", monospace', fontSize: '0.8125rem',
                      opacity: on ? 1 : 0.35, transition: 'opacity 0.15s',
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{item.unit}/mês</span>
                </div>
              ) : (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assinatura fixa</span>
              )}

              {/* Cost */}
              <div style={{
                fontFamily: '"DM Mono", monospace', fontSize: '0.875rem', fontWeight: 500,
                color: on && cost > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                textAlign: 'right', minWidth: '80px',
              }}>
                {fmtBRL(cost)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid var(--bg-elevated)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '360px', lineHeight: 1.5 }}>
          Valores estimados em BRL. Descontos por volume se aplicam automaticamente na fatura.
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

  return (
    <div className="home">
      <OnboardingPreview open={onboardingOpen} onClose={() => setOnboardingOpen(false)} />
      <PaywallDrawer open={paywallOpen} onClose={() => setPaywallOpen(false)} />

      {/* ===== HERO ===== */}
      <section className="hero section">
        <div className="container">
          <div className="hero__content">
            <div className="badge badge-accent" style={{ display: 'inline-flex', marginBottom: '1.5rem' }}>
              <Star size={12} weight="fill" />
              <span>Plataforma de COMEX · Sem cartão de crédito</span>
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
                  <CheckCircle size={14} color="var(--success)" weight="fill" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview mock */}
          <div className="hero__preview" aria-hidden>
            <div className="dashboard-preview">
              <div className="dashboard-preview__header">
                <div className="dashboard-preview__dots">
                  <span /><span /><span />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gravity — Pedidos de Importação</span>
              </div>
              <div className="dashboard-preview__body">
                <div className="dashboard-preview__kpis">
                  {[
                    { label: 'Processos ativos', value: '24', color: 'var(--accent)' },
                    { label: 'Saldo disponível', value: 'R$482k', color: 'var(--success)' },
                    { label: 'Em cotação', value: '7', color: 'var(--warning)' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '0.875rem' }}>
                      <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: k.color, marginTop: '0.25rem' }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                  {[40, 65, 48, 80, 55, 70, 90, 62, 75, 84].map((h, i) => (
                    <div key={i} style={{
                      flex: 1, height: `${h}%`,
                      background: i === 9 ? 'var(--accent)' : 'var(--bg-surface)',
                      borderRadius: '4px 4px 0 0',
                    }} />
                  ))}
                </div>
                {['BID Frete — Cotação aprovada · R$ 12.400', 'NF Importação #4821 — Emitida com sucesso', 'Smart Read — 3 riscos identificados em BL'].map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ['var(--success)', 'var(--accent)', 'var(--warning)'][i], flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MÓDULOS ===== */}
      <section className="section" style={{ background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Módulos</p>
            <h2>Escolha os módulos certos<br />para sua operação</h2>
            <p>Contrate só o que usar, escale conforme crescer. Cada módulo funciona de forma independente ou em conjunto.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {PRODUCTS.map(p => (
              <div
                key={p.id}
                className="card"
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Top */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0,
                    background: p.catBg, color: p.catColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="badge badge-success">Disponível</span>
                    <span style={{
                      fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '9999px',
                      background: p.catBg, color: p.catColor, border: `1px solid ${p.catBorder}`,
                    }}>{p.cat}</span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem', color: 'var(--text-primary)' }}>{p.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{p.desc}</p>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {p.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-muted)',
                      background: 'var(--bg-elevated)', border: '1px solid var(--bg-elevated)',
                      padding: '2px 8px', borderRadius: '9999px',
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.875rem', borderTop: '1px solid var(--bg-elevated)' }}>
                  <div>
                    <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '2px' }}>A partir de</p>
                    <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {p.price} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.unit}</span>
                    </p>
                  </div>
                  <a
                    href={`/cadastro?produto=${p.id}&trial=true`}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      background: 'var(--accent-10)', border: '1px solid rgba(99,102,241,0.25)',
                      color: 'var(--accent)', borderRadius: '9999px',
                      fontSize: '0.75rem', fontWeight: 600, padding: '5px 12px',
                      textDecoration: 'none', transition: 'background 0.15s',
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
      <section className="section">
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Como funciona</p>
            <h2>Monte seu Gravity</h2>
            <p>Comece com um módulo e adicione mais conforme sua operação cresce. Sem contrato de longo prazo.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {[
              { num: '01', title: 'Escolha seus módulos', desc: 'Selecione os produtos que fazem sentido para a sua operação hoje.' },
              { num: '02', title: 'Ative em minutos', desc: 'Crie sua conta, ative os módulos e convide seu time. Sem instalação.' },
              { num: '03', title: 'Opere e integre', desc: 'Importe seus dados e conecte os módulos entre si nativamente.' },
              { num: '04', title: 'Escale sem fricção', desc: 'Pague conforme usa. Descontos por volume se aplicam automaticamente.' },
            ].map(step => (
              <div key={step.num} className="card-surface" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '0.6875rem', fontWeight: 500, letterSpacing: '0.08em', color: 'var(--accent)' }}>{step.num}</span>
                <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{step.title}</p>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.55 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CALCULADORA ===== */}
      <section className="section" style={{ background: 'var(--bg-base)' }} id="calculadora">
        <div className="container">
          <div className="section-title">
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>Estimativa de custo</p>
            <h2>Calcule seu investimento</h2>
            <p>Ative os módulos que quer usar e informe o volume mensal estimado.</p>
          </div>
          <Calculator />
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>O que dizem os <span className="gradient-text">clientes</span></h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card-surface" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} color="var(--warning)" weight="fill" />
                  ))}
                </div>
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>"{t.text}"</p>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Pronto para automatizar<br />seu COMEX?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
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
