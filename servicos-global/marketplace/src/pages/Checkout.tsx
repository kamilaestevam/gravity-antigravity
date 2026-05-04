import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle,
  Shield,
  LockSimple,
  SealCheck,
  ArrowRight,
  Rocket,
  CreditCard,
  Globe,
  FileText,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

const PRODUCT_DATA: Record<string, {
  name: string
  icon: React.ReactNode
  price: Record<string, number>
  color: string
}> = {
  'simulador-comex': {
    name: 'Simulador Comex',
    icon: <Globe size={24} weight="duotone" />,
    price: { basico: 97, profissional: 247, enterprise: 0 },
    color: '#818cf8',
  },
  'nf-importacao': {
    name: 'NF Importação',
    icon: <FileText size={24} weight="duotone" />,
    price: { basico: 97, profissional: 247, enterprise: 0 },
    color: '#818cf8',
  },
}

const PLAN_LABELS: Record<string, string> = {
  basico: 'Básico',
  profissional: 'Profissional',
  enterprise: 'Enterprise',
}

export function Checkout() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const produto = searchParams.get('produto') ?? 'simulador-comex'
  const plano = searchParams.get('plano') ?? 'profissional'
  const CONFIGURADOR = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'

  const SECURITY_BADGES = [
    { icon: <LockSimple size={14} weight="bold" />, label: t('marketplace.checkout.seguranca.ssl') },
    { icon: <SealCheck size={14} weight="bold" />, label: t('marketplace.checkout.seguranca.stripe') },
    { icon: <Shield size={14} weight="bold" />, label: t('marketplace.checkout.seguranca.lgpd') },
  ]

  const BENEFITS = [
    t('marketplace.checkout.beneficios.setup'),
    t('marketplace.checkout.beneficios.acesso'),
    t('marketplace.checkout.beneficios.cancelar'),
    t('marketplace.checkout.beneficios.exportar'),
    t('marketplace.checkout.beneficios.suporte'),
  ]

  const productInfo = PRODUCT_DATA[produto]
  const planoLabel = PLAN_LABELS[plano] ?? plano
  const price = productInfo?.price?.[plano] ?? 247

  const confirmUrl = `${CONFIGURADOR}/checkout?produto=${produto}&plano=${plano}`

  return (
    <div>
      {/* Header */}
      <section style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--bg-elevated)', padding: '2rem 0' }}>
        <div className="container">
          <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.5rem' }}>{t('marketplace.checkout.badge')}</p>
          <h1 className="text-h1">{t('marketplace.checkout.titulo')}<span className="gradient-text">{t('marketplace.checkout.titulo_destaque')}</span></h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
            {/* Esquerda — Benefícios */}
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>
                {t('marketplace.checkout.o_que_recebe')}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                {BENEFITS.map(b => (
                  <div key={b} className="feature-item">
                    <div className="feature-item-icon">
                      <CheckCircle size={14} weight="bold" />
                    </div>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>{b}</span>
                  </div>
                ))}
              </div>

              {/* Security badges */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {SECURITY_BADGES.map(b => (
                  <div
                    key={b.label}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--success)' }}
                  >
                    {b.icon}
                    <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Direita — Card de confirmação */}
            <div className="pricing-card">
              {/* Item selecionado */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {productInfo && (
                  <div style={{
                    width: '48px',
                    height: '48px',
                    minWidth: '48px',
                    flexShrink: 0,
                    borderRadius: '12px',
                    background: `${productInfo.color}18`,
                    color: productInfo.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {productInfo.icon}
                  </div>
                )}
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem' }}>
                    {productInfo?.name ?? produto}
                  </p>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {t('marketplace.checkout.plano')} {planoLabel}
                  </p>
                </div>
              </div>

              <div className="divider" style={{ margin: '0' }} />

              {/* Preço */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{t('marketplace.checkout.valor_mensal')}</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>R$</span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>{price}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('marketplace.checkout.por_mes')}</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', borderRadius: '10px', padding: '0.875rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {t('marketplace.checkout.pagamento_info')}
                  <strong>{t('marketplace.checkout.pagamento_nunca')}</strong>{t('marketplace.checkout.pagamento_ponto')}
                </p>
              </div>

              {/* CTA — redireciona ao Configurador */}
              <a
                href={confirmUrl}
                className="btn btn-gradient"
                id="checkout-confirmar"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Rocket size={18} weight="duotone" />
                {t('marketplace.checkout.confirmar')}
                <ArrowRight size={16} weight="bold" />
              </a>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <CreditCard size={14} />
                <span>{t('marketplace.checkout.pagamento_seguro')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
