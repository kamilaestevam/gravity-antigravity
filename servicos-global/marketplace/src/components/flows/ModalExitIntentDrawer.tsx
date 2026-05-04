import { useState } from 'react'
import { X, EnvelopeSimple, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { useExitIntent } from '../../hooks/useExitIntent'
import { useTranslation } from 'react-i18next'

export function ExitIntentDrawer() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const { reset } = useExitIntent(() => {
    setOpen(true)
  })

  const handleClose = () => {
    setOpen(false)
    reset()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // Redireciona para o Configurador com email e sessão salva
    const configuradorUrl = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.usegravity.com.br'
    setSent(true)
    setTimeout(() => {
      window.location.href = `${configuradorUrl}/trial?email=${encodeURIComponent(email)}&from=exit-intent`
    }, 1500)
  }

  return (
    <>
      {/* Overlay — não é modal bloqueante, é drawer lateral */}
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={handleClose}
        aria-hidden
      />

      {/* Drawer lateral direito — NUNCA modal bloqueante (regra do Fluxo C) */}
      <aside
        className={`drawer ${open ? 'open' : ''}`}
        role="complementary"
        aria-label={t('marketplace.exit_intent.salvar_progresso')}
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <div>
            <p className="text-micro" style={{ color: 'var(--warning)', marginBottom: '0.25rem' }}>
              {t('marketplace.exit_intent.antes_ir')}
            </p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              {t('marketplace.exit_intent.salvar_progresso')}
            </h3>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClose}
            aria-label={t('marketplace.exit_intent.fechar')}
            style={{ padding: '0.375rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {!sent ? (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                {t('marketplace.exit_intent.descricao')}
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    t('marketplace.exit_intent.dias_gratis'),
                    t('marketplace.exit_intent.setup_rapido'),
                    t('marketplace.exit_intent.cancele'),
                  ].map(item => (
                    <div key={item} className="feature-item">
                      <div className="feature-item-icon">
                        <CheckCircle size={14} weight="bold" />
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="exit-email">
                    {t('marketplace.exit_intent.seu_email')}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <EnvelopeSimple
                      size={16}
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      id="exit-email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t('marketplace.exit_intent.placeholder_email')}
                      required
                      autoFocus
                      style={{ paddingLeft: '2.25rem', width: '100%' }}
                    />
                  </div>
                </div>

                <TooltipGlobal descricao={t('marketplace.exit_intent.tooltip_enviar')}>
                  <button type="submit" className="btn btn-gradient" id="exit-intent-submit" style={{ width: '100%', justifyContent: 'center' }}>
                    {t('marketplace.exit_intent.salvar_continuar')}
                    <ArrowRight size={16} weight="bold" />
                  </button>
                </TooltipGlobal>
              </form>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.875rem' }}>
                {t('marketplace.exit_intent.sem_spam')}
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} color="var(--success)" weight="duotone" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>{t('marketplace.exit_intent.perfeito')}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {t('marketplace.exit_intent.redirecionando')}
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
