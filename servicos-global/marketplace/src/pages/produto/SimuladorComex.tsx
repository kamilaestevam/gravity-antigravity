import { Link, useNavigate } from 'react-router-dom'
import {
  Globe,
  CheckCircle,
  ArrowRight,
  ChartBar,
  EnvelopeSimple,
  WhatsappLogo,
  Clock,
  Star,
  Rocket,
} from '@phosphor-icons/react'

const FEATURES = [
  { icon: <Globe size={18} weight="duotone" />, label: 'Todos os países do mundo' },
  { icon: <ChartBar size={18} weight="duotone" />, label: 'Simulações ilimitadas' },
  { icon: <EnvelopeSimple size={18} weight="duotone" />, label: 'Relatórios exportáveis' },
  { icon: <WhatsappLogo size={18} weight="duotone" />, label: 'Integração WhatsApp para alertas' },
  { icon: <Clock size={18} weight="duotone" />, label: 'Histórico completo de simulações' },
  { icon: <Star size={18} weight="duotone" />, label: 'Cálculo de impostos automático' },
]

export function SimuladorComex() {
  const navigate = useNavigate()
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

  return (
    <div>
      {/* Hero do Produto */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
            <div>
              <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>
                Produto
              </p>
              <h1 className="text-h1" style={{ marginBottom: '1rem' }}>
                Simulador <span className="gradient-text">Comex</span>
              </h1>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem', fontSize: '1.0625rem' }}>
                Calcule custos reais de operações de comércio exterior com precisão.
                Impostos, fretes, variações cambiais — tudo em um único simulador integrado à plataforma Gravity.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <a
                  href={`${CONFIGURADOR}/trial?produto=simulador-comex&trial=true`}
                  className="btn btn-primary btn-lg"
                  id="simulador-test-gratis"
                >
                  <Rocket size={18} weight="duotone" />
                  Teste Grátis — 14 dias
                </a>
                <a
                  href={`${CONFIGURADOR}/checkout?produto=simulador-comex&plano=profissional`}
                  className="btn btn-secondary btn-lg"
                  id="simulador-assinar"
                >
                  Assinar Agora
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--bg-elevated)',
              borderRadius: '16px',
              padding: '1.5rem',
            }}>
              <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '1rem' }}>
                Preview — Simulação de Importação
              </p>
              {[
                { label: 'Produto', value: 'Eletrônicos CH 8471' },
                { label: 'País de Origem', value: 'China' },
                { label: 'Valor FOB', value: 'US$ 12.500,00' },
                { label: 'II + IPI + PIS/Cofins', value: 'R$ 18.340,00' },
                { label: 'Custo Total BR', value: 'R$ 79.640,00' },
              ].map(row => (
                <div key={row.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid var(--bg-elevated)',
                  fontSize: '0.875rem',
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                  <span style={{ fontWeight: 600, color: row.label === 'Custo Total BR' ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {row.value}
                  </span>
                </div>
              ))}
              <div style={{ marginTop: '1rem' }}>
                <span className="badge badge-success">
                  <CheckCircle size={12} weight="fill" />
                  Dados reais de demonstração
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Funcionalidades <span className="gradient-text">principais</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
            {FEATURES.map(f => (
              <div key={f.label} className="card-surface" style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '2px' }}>{f.icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem */}
      <section className="section" style={{ background: 'var(--bg-base)' }}>
        <div className="container container-narrow">
          <div className="section-title">
            <h2>Para quem é <span className="gradient-text">indicado</span></h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              'Empresas que realizam importações regulares e precisam de controle de custos',
              'Traders e despachantes aduaneiros que precisam de simulações rápidas',
              'Gestores financeiros que precisam de visibilidade sobre custos de importação',
              'Equipes de compras que avaliam fornecedores internacionais',
            ].map(item => (
              <div key={item} className="feature-item">
                <div className="feature-item-icon"><CheckCircle size={14} weight="bold" /></div>
                <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={`${CONFIGURADOR}/trial?produto=simulador-comex&trial=true`}
              className="btn btn-gradient btn-lg"
              id="simulador-bottom-cta-trial"
            >
              Teste Grátis — 14 dias
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
