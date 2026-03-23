import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Lightning,
  ChartBar,
  EnvelopeSimple,
  WhatsappLogo,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Buildings,
  Globe,
  Hexagon,
  Rocket,
} from '@phosphor-icons/react'
import { OnboardingPreview } from '../components/flows/OnboardingPreview'
import { PaywallDrawer } from '../components/flows/PaywallDrawer'
import '../styles/home.css'

const FEATURES = [
  { icon: <ChartBar size={24} weight="duotone" />, title: 'Dashboard Unificado', desc: 'Métricas em tempo real de todos os módulos em um único lugar.' },
  { icon: <EnvelopeSimple size={24} weight="duotone" />, title: 'Email Transacional', desc: 'Envio de emails com Resend — logs, templates e rastreamento.' },
  { icon: <WhatsappLogo size={24} weight="duotone" />, title: 'WhatsApp Business', desc: 'Integração nativa com Meta Cloud API. Sem custo extra.' },
  { icon: <Clock size={24} weight="duotone" />, title: 'Cronômetro de Atividades', desc: 'Rastreie tempo por projeto, cliente e colaborador.' },
  { icon: <Lightning size={24} weight="duotone" />, title: 'Automações', desc: 'Gatilhos e ações entre módulos sem código.' },
  { icon: <Globe size={24} weight="duotone" />, title: 'Multi-tenant Nativo', desc: 'Cada empresa tem seus dados isolados por design.' },
]

const TESTIMONIALS = [
  { name: 'Ana Paula M.', role: 'Head de Ops, Logística BR', text: 'Reduzimos 40% do tempo de importação com o Simulador Comex. O suporte foi incrível na implantação.' },
  { name: 'Carlos Fonseca', role: 'CTO, TechStart', text: 'A arquitetura multi-tenant do Gravity nos poupou meses de desenvolvimento. APIs limpas e documentação excelente.' },
  { name: 'Maria José S.', role: 'Fundadora, Agência Digital', text: 'Finalmente um SaaS que não precisa de 3 meses de onboarding. Estávamos operacionais no mesmo dia.' },
]

const LOGOS = ['Logística BR', 'TechStart', 'Agência Digital', 'ComexPro', 'DataFlow', 'NovaBiz']

export function Home() {
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [paywallOpen, setPaywallOpen] = useState(false)

  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

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
              <span>Product-Led Growth · 14 dias grátis</span>
            </div>

            <h1 className="hero__title text-display">
              Uma plataforma para{' '}
              <span className="gradient-text">todos os seus serviços</span>
            </h1>

            <p className="hero__subtitle">
              Gravity é uma plataforma SaaS B2B multi-tenant modular. Email, WhatsApp,
              dashboard, atividades — compartilhados entre todos os seus produtos.
              Sem duplicar dados. Sem duplicar custo.
            </p>

            <div className="hero__ctas">
              <button
                className="btn btn-gradient btn-lg"
                id="hero-start-preview"
                onClick={() => setOnboardingOpen(true)}
              >
                <Rocket size={18} weight="duotone" />
                Iniciar Preview Grátis
              </button>
              <Link to="/produtos" className="btn btn-secondary btn-lg">
                Ver Produtos
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="hero__trust">
              {['Sem cartão', 'Setup em 60s', 'Cancele quando quiser'].map(t => (
                <div key={t} className="hero__trust-item">
                  <CheckCircle size={14} color="var(--success)" weight="fill" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="hero__preview" aria-hidden>
            <div className="dashboard-preview">
              <div className="dashboard-preview__header">
                <div className="dashboard-preview__dots">
                  <span /><span /><span />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Gravity — Dashboard</span>
              </div>
              <div className="dashboard-preview__body">
                <div className="dashboard-preview__kpis">
                  {[
                    { label: 'Receita', value: 'R$ 284k', color: 'var(--success)' },
                    { label: 'Atividades', value: '47', color: 'var(--accent)' },
                    { label: 'Tickets', value: '12', color: 'var(--warning)' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '0.875rem' }}>
                      <p style={{ fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 600 }}>{k.label}</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: k.color, marginTop: '0.25rem' }}>{k.value}</p>
                    </div>
                  ))}
                </div>
                {/* Chart bars mock */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '80px', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                  {[40, 65, 48, 80, 55, 70, 90, 62, 75, 84].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${h}%`,
                        background: i === 9 ? 'var(--accent)' : 'var(--bg-surface)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  ))}
                </div>
                {/* Activity rows mock */}
                {['Proposta enviada — R$ 48k', 'Email disparado — 3.2k leads', 'Reunião agendada'].map((a, i) => (
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

      {/* ===== SOCIAL PROOF — Logos ===== */}
      <section className="logos-section section-sm">
        <div className="container">
          <p className="text-micro" style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Confiado por empresas que crescem com inteligência
          </p>
          <div className="logos-grid">
            {LOGOS.map(logo => (
              <div key={logo} className="logo-item">
                <Buildings size={20} weight="duotone" color="var(--text-muted)" />
                <span>{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Serviços compartilhados, <span className="gradient-text">dados únicos</span></h2>
            <p>Cada módulo existe uma vez por empresa. Seus produtos consomem os mesmos serviços sem duplicar infraestrutura.</p>
          </div>
          <div className="features-grid">
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ color: 'var(--accent)', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.375rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE INTERATIVO ===== */}
      <section className="section" style={{ background: 'var(--bg-base)' }}>
        <div className="container">
          <div className="section-title">
            <h2>Veja o sistema <span className="gradient-text">antes de assinar</span></h2>
            <p>Explore o ambiente completo com dados reais de demonstração. Sem pedir cartão.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <button
              className="btn btn-gradient btn-lg animate-pulse-glow"
              id="showcase-try-button"
              onClick={() => setOnboardingOpen(true)}
              style={{ marginBottom: '1rem' }}
            >
              <Lightning size={20} weight="duotone" />
              Explorar o Sistema Agora
            </button>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              60 segundos para ver o valor real. Sem formulário. Sem cartão.
            </p>
          </div>
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
                <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING RESUMIDO ===== */}
      <section className="section" style={{ background: 'var(--bg-base)' }}>
        <div className="container container-narrow">
          <div className="section-title">
            <h2>Preços <span className="gradient-text">simples e transparentes</span></h2>
            <p>Começe grátis. Escale quando precisar.</p>
          </div>

          {/* Botão paywall demo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button
              className="btn btn-secondary"
              id="home-try-paywall"
              onClick={() => setPaywallOpen(true)}
              style={{ fontSize: '0.8125rem' }}
            >
              <Hexagon size={16} weight="duotone" />
              Demo: Ver como funciona o upgrade Pro
            </button>
          </div>

          <div style={{ textAlign: 'center' }}>
            <Link to="/precos" className="btn btn-primary btn-lg">
              Ver Todos os Planos
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="section" style={{ background: 'var(--bg-surface)' }}>
        <div className="container container-narrow" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            Pronto para <span className="gradient-text">começar?</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.0625rem' }}>
            14 dias gratuitos. Setup em 60 segundos. Cancele quando quiser.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${CONFIGURADOR}/trial?trial=true`}
              className="btn btn-gradient btn-lg"
              id="home-final-cta-trial"
            >
              <Rocket size={18} weight="duotone" />
              Começar Trial Grátis
            </a>
            <Link to="/precos" className="btn btn-secondary btn-lg">
              Ver Preços
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
