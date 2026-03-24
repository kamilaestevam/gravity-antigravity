import { SignIn } from '@clerk/clerk-react'
import { Hexagon } from '@phosphor-icons/react'
import './auth.css'

export function AuthPage() {
  return (
    <div className="auth-root">

      {/* ── Left Panel — Branding ── */}
      <div className="auth-brand">
        <div className="auth-brand-grid" />

        <div className="auth-brand-content">
          {/* Logo — mesmo do Marketplace */}
          <div className="auth-logo">
            <Hexagon size={30} weight="duotone" color="#38bdf8" />
            <span className="auth-logo-name">Gravity</span>
          </div>

          {/* Headline */}
          <h1 className="auth-headline">
            Sua operação,{' '}
            <span className="auth-headline-accent">
              um lugar só.
            </span>
          </h1>

          <p className="auth-subheadline">
            Plataforma SaaS B2B multi-tenant modular. Email, WhatsApp,
            dashboard e atividades — compartilhados entre todos os seus
            produtos, sem duplicar dados ou custo.
          </p>

          {/* Features */}
          <div className="auth-features">
            {[
              { title: 'Multi-tenant nativo', desc: 'Cada empresa, dados isolados por design.' },
              { title: 'Módulos compartilhados', desc: 'WhatsApp, email e dashboard em um só lugar.' },
              { title: 'IA integrada', desc: 'Gabi analisa sua operação em tempo real.' },
              { title: 'Segurança enterprise', desc: 'JWT + RLS + isolamento total por tenant.' },
            ].map(f => (
              <div key={f.title} className="auth-feature">
                <div className="auth-feature-dot" />
                <p className="auth-feature-text">
                  <strong>{f.title}</strong> — {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="auth-divider" />

      {/* ── Right Panel — Clerk SignIn ── */}
      <div className="auth-form-panel">
        <div className="auth-form-header">
          <p className="auth-form-title">Acessar a plataforma</p>
          <p className="auth-form-subtitle">Entre com suas credenciais para continuar</p>
        </div>

        <SignIn
          routing="hash"
          afterSignInUrl="/hub"
          appearance={{
            variables: {
              colorPrimary: '#38bdf8',
              colorBackground: '#1e293b',
              colorInputBackground: '#0f172a',
              colorInputText: '#f1f5f9',
              colorText: '#f1f5f9',
              colorTextSecondary: '#94a3b8',
              colorNeutral: '#475569',
              borderRadius: '8px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '0.9rem',
            },
            elements: {
              card: {
                boxShadow: 'none',
                border: '1px solid rgba(56,189,248,0.12)',
                background: '#1e293b',
              },
              headerTitle: { display: 'none' },
              headerSubtitle: { display: 'none' },
              socialButtonsBlockButton: {
                border: '1px solid rgba(56,189,248,0.15)',
                background: '#0f172a',
                color: '#f1f5f9',
              },
              formButtonPrimary: {
                background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
                color: '#0f172a',
                fontWeight: '700',
                borderRadius: '9999px',
              },
              footerActionLink: { color: '#38bdf8' },
              dividerLine: { background: 'rgba(56,189,248,0.1)' },
              dividerText: { color: '#475569' },
            },
          }}
        />

        <p className="auth-form-footer">
          Novo por aqui?{' '}
          <a href="http://localhost:8002" target="_blank" rel="noreferrer">
            Conheça a plataforma
          </a>
        </p>
      </div>

    </div>
  )
}
