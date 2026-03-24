import { SignIn } from '@clerk/clerk-react'
import { LogoGlobal } from '@nucleo/logo-global'
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
            <LogoGlobal iconSize={30} iconColor="#818cf8" />
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
              colorPrimary: '#6366f1',
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
                boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(129, 140, 248, 0.1)',
                border: '1px solid rgba(129,140,248,0.25)',
                background: '#1e293b',
              },
              headerTitle: { display: 'none' },
              headerSubtitle: { display: 'none' },
              socialButtonsBlockButton: {
                border: '1px solid rgba(255,255,255,0.1)',
                background: '#0f172a',
                color: '#f1f5f9',
                transition: 'all 0.2s ease',
              },
              formButtonPrimary: {
                background: '#6366f1',
                color: '#ffffff',
                fontWeight: '700',
                borderRadius: '9999px',
                boxShadow: '0 1px 3px rgba(99, 102, 241, 0.25)',
              },
              footerActionLink: { color: '#818cf8', fontWeight: '600' },
              dividerLine: { background: 'rgba(255,255,255,0.1)' },
              dividerText: { color: '#64748b' },
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
