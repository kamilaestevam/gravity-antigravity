import { LogoGlobal } from '@nucleo/logo-global'
import { LoginGlobal } from '@nucleo/login-global'
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

      {/* ── Right Panel — LoginGlobal ── */}
      <LoginGlobal />

    </div>
  )
}
