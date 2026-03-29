import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bell, CheckCircle } from '@phosphor-icons/react'

const PRODUCT_NAMES: Record<string, string> = {
  'simulacusto': 'SimulaCusto',
  'nf-importacao': 'NF Importacao',
  'bid-frete': 'BID Frete Internacional',
  'dashboard': 'Dashboard Analitico',
}

export function Waitlist() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const produto = searchParams.get('produto') ?? ''
  const productName = PRODUCT_NAMES[produto] ?? produto

  const [email, setEmail] = useState('')
  const [inscrito, setInscrito] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInscrito(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--bg-elevated)', textAlign: 'center' }}>
          {inscrito ? (
            <>
              <CheckCircle size={56} weight="duotone" color="var(--success)" style={{ marginBottom: '1rem' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Voce esta na lista</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Avisaremos assim que <strong>{productName}</strong> estiver disponivel.
              </p>
            </>
          ) : (
            <>
              <Bell size={48} weight="duotone" color="var(--accent)" style={{ marginBottom: '1rem' }} />
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {productName ? `Waitlist — ${productName}` : 'Entrar na Waitlist'}
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
                Este produto esta em desenvolvimento. Deixe seu email para ser avisado no lancamento.
              </p>
              <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ flex: 1, padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-elevated)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
                <button type="submit" className="btn btn-primary">
                  Inscrever
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
