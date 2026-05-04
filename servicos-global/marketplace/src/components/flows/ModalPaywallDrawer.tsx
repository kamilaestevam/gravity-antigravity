import { useState } from 'react'
import {
  X,
  CreditCard,
  CheckCircle,
  LockSimple,
  SealCheck,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'

interface PaywallDrawerProps {
  open: boolean
  onClose: () => void
  featureName?: string
  produto?: string
  plano?: string
}

export function PaywallDrawer({
  open,
  onClose,
  featureName = 'Filtros avançados de relatório',
  produto = 'simulador-comex',
  plano = 'profissional',
}: PaywallDrawerProps) {
  const { t } = useTranslation()
  const [cardNumber, setCardNumber] = useState('')
  const [cardValid, setCardValid] = useState<boolean | null>(null)

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value)
    setCardNumber(formatted)
    const digits = formatted.replace(/\s/g, '')
    if (digits.length === 0) setCardValid(null)
    else if (digits.length === 16) setCardValid(true)
    else setCardValid(false)
  }

  const handleConfirm = () => {
    // Redireciona para o Configurador — Marketplace NUNCA processa pagamento
    const configuradorUrl = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'
    window.location.href = `${configuradorUrl}/checkout?produto=${produto}&plano=${plano}`
  }

  return (
    <>
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden
      />

      <aside
        className={`drawer ${open ? 'open' : ''}`}
        role="complementary"
        aria-label={t('marketplace.paywall.aria_label')}
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <div>
            <p className="text-micro" style={{ color: 'var(--accent)', marginBottom: '0.25rem' }}>
              {t('marketplace.paywall.feature_pro')}
            </p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              {t('marketplace.paywall.desbloquear')}
            </h3>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label={t('marketplace.paywall.fechar')}
            style={{ padding: '0.375rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* Toast warning suave — micro-bloqueio de Fluxo B */}
          <div className="toast-warning" style={{ marginBottom: '1.5rem' }}>
            <LockSimple size={18} weight="duotone" />
            <span>
              <strong>{featureName}</strong> {t('marketplace.paywall.requer_plano')}
            </span>
          </div>

          {/* Preview do componente que o usuário quer usar */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px dashed var(--bg-elevated)',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            opacity: 0.7,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--warning-10)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '8px', padding: '0.375rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--warning)', whiteSpace: 'nowrap' }}>
              🔒 {t('marketplace.paywall.plano_pro')}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', filter: 'blur(4px)' }}>
              <div style={{ height: '10px', flex: 2, background: 'var(--bg-elevated)', borderRadius: '99px' }} />
              <div style={{ height: '10px', flex: 1, background: 'var(--bg-elevated)', borderRadius: '99px' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', filter: 'blur(4px)' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ height: '32px', background: 'var(--bg-elevated)', borderRadius: '8px' }} />
              ))}
            </div>
          </div>

          {/* Formulário de cartão — demo/sandbox, não processa */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="input-group" style={{ marginBottom: '0.875rem' }}>
              <label htmlFor="paywall-card">{t('marketplace.paywall.numero_cartao')}</label>
              <div style={{ position: 'relative' }}>
                <CreditCard
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: cardValid === true ? 'var(--success)' : cardValid === false ? 'var(--danger)' : 'var(--text-muted)',
                    transition: 'color 0.15s ease',
                  }}
                />
                <input
                  id="paywall-card"
                  type="text"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={handleCardChange}
                  placeholder="0000 0000 0000 0000"
                  style={{
                    paddingLeft: '2.25rem',
                    paddingRight: cardValid !== null ? '2.25rem' : '0.875rem',
                    width: '100%',
                    borderColor: cardValid === true ? 'var(--success)' : cardValid === false ? 'var(--danger)' : undefined,
                    transition: 'border-color 0.15s ease',
                  }}
                />
                {cardValid === true && (
                  <CheckCircle
                    size={16}
                    color="var(--success)"
                    weight="fill"
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="input-group">
                <label htmlFor="paywall-expiry">{t('marketplace.paywall.validade')}</label>
                <input id="paywall-expiry" type="text" placeholder="MM/AA" maxLength={5} />
              </div>
              <div className="input-group">
                <label htmlFor="paywall-cvv">{t('marketplace.paywall.cvv')}</label>
                <input id="paywall-cvv" type="text" placeholder="000" maxLength={3} />
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            {[t('marketplace.paywall.ssl'), t('marketplace.paywall.stripe'), t('marketplace.paywall.lgpd')].map(badge => (
              <div key={badge} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--success)' }}>
                <SealCheck size={14} weight="duotone" />
                <span>{badge}</span>
              </div>
            ))}
          </div>

          <button
            className="btn btn-gradient"
            id="paywall-confirm"
            onClick={handleConfirm}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('marketplace.paywall.confirmar')}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
            {t('marketplace.paywall.redirecionamento')}
          </p>
        </div>
      </aside>
    </>
  )
}
