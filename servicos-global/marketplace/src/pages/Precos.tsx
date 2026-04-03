import { useState } from 'react'
import {
  CheckCircle,
  ArrowRight,
  ChatCircle,
  Crown,
  Rocket,
  Star,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

type Billing = 'anual' | 'mensal'

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    desc: 'Para times pequenos começando',
    priceAnual: 97,
    priceMensal: 127,
    popular: false,
    features: [
      '3 usuários',
      '2 produtos ativos',
      'Dashboard unificado',
      'Email transacional (5k/mês)',
      'Suporte via chat',
    ],
    notIncluded: ['WhatsApp Business', 'Relatórios avançados', 'SLA garantido'],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    desc: 'Para empresas em crescimento',
    priceAnual: 247,
    priceMensal: 317,
    popular: true,
    features: [
      '15 usuários',
      'Produtos ilimitados',
      'Dashboard + WhatsApp',
      'Email (50k/mês)',
      'Síntese analítica com IA',
      'Automações entre módulos',
      'Suporte prioritário',
    ],
    notIncluded: ['SLA 99.9% garantido'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    desc: 'Para operações de grande escala',
    priceAnual: null,
    priceMensal: null,
    popular: false,
    custom: true,
    features: [
      'Usuários ilimitados',
      'Todos os produtos',
      'SLA 99.9% garantido',
      'Onboarding dedicado',
      'Integração ERP',
      'Suporte 24/7 Premium',
      'Ambiente on-premise opcional',
    ],
    notIncluded: [],
  },
]

export function Precos() {
  const { t } = useTranslation()
  const [billing, setBilling] = useState<Billing>('anual')
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'

  return (
    <div>
      {/* Header */}
      <section className="section-sm" style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.75rem' }}>{t('marketplace.precos.badge')}</p>
          <h1 className="text-h1" style={{ marginBottom: '0.75rem' }}>
            {t('marketplace.precos.titulo')} <span className="gradient-text">{t('marketplace.precos.titulo_destaque')}</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '1.0625rem' }}>
            {t('marketplace.precos.subtitulo')}
          </p>

          {/* Toggle Anual / Mensal */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.875rem' }}>
            <div className="tabs-pill">
              <button
                className={`tab-pill ${billing === 'anual' ? 'active' : ''}`}
                id="billing-anual"
                onClick={() => setBilling('anual')}
              >
                {t('marketplace.precos.anual')}
              </button>
              <button
                className={`tab-pill ${billing === 'mensal' ? 'active' : ''}`}
                id="billing-mensal"
                onClick={() => setBilling('mensal')}
              >
                {t('marketplace.precos.mensal')}
              </button>
            </div>
            {billing === 'anual' && (
              <span className="badge badge-success">
                <Star size={11} weight="fill" />
                {t('marketplace.precos.economize')}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Plans — Lei de Hick: máximo 3 planos visíveis */}
      <section className="section">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', alignItems: 'start', maxWidth: '960px', margin: '0 auto' }}>
            {PLANS.map(plan => (
              <div
                key={plan.id}
                className={`pricing-card ${plan.popular ? 'popular' : ''}`}
              >
                {/* Plan Header */}
                <div>
                  {plan.popular && (
                    <Crown size={24} color="var(--accent)" weight="duotone" style={{ marginBottom: '0.75rem' }} />
                  )}
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {plan.name}
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{plan.desc}</p>
                </div>

                {/* Price */}
                <div>
                  {plan.custom ? (
                    <div>
                      <p style={{ fontSize: '1.75rem', fontWeight: 800 }}>{t('marketplace.precos.personalizado')}</p>
                      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {t('marketplace.precos.fale_equipe')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>R$</span>
                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.popular ? 'var(--accent)' : 'var(--text-primary)' }}>
                          {billing === 'anual' ? plan.priceAnual : plan.priceMensal}
                        </span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('marketplace.checkout.por_mes')}</span>
                      </div>
                      {billing === 'anual' && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {t('marketplace.precos.cobrado_anualmente')}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* CTA */}
                {plan.custom ? (
                  <a
                    href={`${CONFIGURADOR}/contato?plano=enterprise`}
                    className="btn btn-secondary"
                    id={`precos-cta-${plan.id}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ChatCircle size={16} weight="duotone" />
                    {t('marketplace.precos.falar_vendas')}
                  </a>
                ) : (
                  <a
                    href={`${CONFIGURADOR}/trial?plano=${plan.id}&trial=true`}
                    className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}
                    id={`precos-cta-${plan.id}`}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Rocket size={16} weight="duotone" />
                    {t('marketplace.precos.comecar_com', { plano: plan.name })}
                    <ArrowRight size={15} />
                  </a>
                )}

                <div className="divider" style={{ margin: '0' }} />

                {/* Features list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {plan.features.map(f => (
                    <div key={f} className="feature-item">
                      <div className="feature-item-icon" style={{ width: '1.25rem', height: '1.25rem', minWidth: '1.25rem' }}>
                        <CheckCircle size={13} weight="bold" />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map(f => (
                    <div key={f} className="feature-item" style={{ opacity: 0.4 }}>
                      <div style={{ width: '1.25rem', height: '1.25rem', minWidth: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '10px', height: '1px', background: 'var(--text-muted)' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Inline */}
          <div style={{ maxWidth: '520px', margin: '3rem auto 0', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              {t('marketplace.precos.faq_info')}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
