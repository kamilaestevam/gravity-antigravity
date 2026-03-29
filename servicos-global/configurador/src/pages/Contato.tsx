import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { EnvelopeSimple, ArrowLeft, PaperPlaneTilt } from '@phosphor-icons/react'

export function Contato() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const plano = searchParams.get('plano') ?? ''

  const [form, setForm] = useState({
    nome: '',
    email: '',
    empresa: '',
    mensagem: plano === 'enterprise'
      ? 'Tenho interesse no plano Enterprise. Gostaria de agendar uma conversa com o time de vendas.'
      : '',
  })
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-body-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={14} />
          Voltar
        </button>

        <div style={{ background: 'var(--bg-surface)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--bg-elevated)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <EnvelopeSimple size={28} weight="duotone" color="var(--accent)" />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Fale com Vendas</h1>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {plano === 'enterprise' ? 'Plano Enterprise — atendimento personalizado' : 'Entre em contato com nossa equipe'}
              </p>
            </div>
          </div>

          {enviado ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <PaperPlaneTilt size={48} weight="duotone" color="var(--success)" style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem' }}>Mensagem enviada</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Nossa equipe entrara em contato em ate 24 horas uteis.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', display: 'block' }}>Nome</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-elevated)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', display: 'block' }}>Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-elevated)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', display: 'block' }}>Empresa</label>
                <input
                  type="text"
                  required
                  value={form.empresa}
                  onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-elevated)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', display: 'block' }}>Mensagem</label>
                <textarea
                  required
                  rows={4}
                  value={form.mensagem}
                  onChange={e => setForm(f => ({ ...f, mensagem: e.target.value }))}
                  style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '8px', border: '1px solid var(--bg-elevated)', background: 'var(--bg-base)', color: 'var(--text-primary)', fontSize: '0.875rem', resize: 'vertical' }}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Enviar Mensagem
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
