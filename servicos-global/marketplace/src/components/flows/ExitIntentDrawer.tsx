import { useState } from 'react'
import { X, EnvelopeSimple, ArrowRight, CheckCircle } from '@phosphor-icons/react'
import { useExitIntent } from '../../hooks/useExitIntent'

export function ExitIntentDrawer() {
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
    const configuradorUrl = import.meta.env.VITE_CONFIGURADOR_URL ?? 'https://configurador.gravity.com.br'
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
        aria-label="Salvar progresso"
        aria-hidden={!open}
      >
        <div className="drawer-header">
          <div>
            <p className="text-micro" style={{ color: 'var(--warning)', marginBottom: '0.25rem' }}>
              Antes de ir...
            </p>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Salve seu progresso
            </h3>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleClose}
            aria-label="Fechar"
            style={{ padding: '0.375rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {!sent ? (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                Vimos que você explorou o <strong style={{ color: 'var(--text-primary)' }}>Gravity</strong>.
                Quer receber um link para continuar de onde parou?
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {[
                    '14 dias grátis sem cartão',
                    'Setup em menos de 60 segundos',
                    'Cancele quando quiser',
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
                    Seu melhor e-mail
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
                      placeholder="voce@empresa.com.br"
                      required
                      autoFocus
                      style={{ paddingLeft: '2.25rem', width: '100%' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-gradient" id="exit-intent-submit" style={{ width: '100%', justifyContent: 'center' }}>
                  Salvar e Continuar Depois
                  <ArrowRight size={16} weight="bold" />
                </button>
              </form>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.875rem' }}>
                Sem spam. Apenas um link. Prometido.
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle size={48} color="var(--success)" weight="duotone" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Perfeito!</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Link salvo. Redirecionando para o setup...
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
