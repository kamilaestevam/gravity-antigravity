import { LogoGlobal } from '@nucleo/logo-global'
import { LoginGlobal } from '@nucleo/login-global'
import { Atom, CursorClick, Coins, ShieldCheck } from '@phosphor-icons/react'
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
            O marketplace de sua{' '}
            <span className="auth-headline-accent">
              eficiência operacional.
            </span>
          </h1>

          <p className="auth-subheadline">
            Módulos independentes ou conectados para escalar seu negócio. 
            Reduza a digitação manual com IA e assuma o controle real dos seus custos.
          </p>

          {/* Features */}
          <div className="auth-features">
            {[
              { 
                icon: <Atom size={20} weight="duotone" className="auth-feature-icon" />, 
                title: 'Ecossistema Modular', 
                desc: 'Produtos que operam de forma isolada ou em harmonia, sem perda de dados.' 
              },
              { 
                icon: <CursorClick size={20} weight="duotone" className="auth-feature-icon" />, 
                title: 'Zero Digitação', 
                desc: 'A Gabi AI automatiza processos braçais e elimina erros de preenchimento.' 
              },
              { 
                icon: <Coins size={20} weight="duotone" className="auth-feature-icon" />, 
                title: 'Gestão de Custos', 
                desc: 'Visibilidade total e controle financeiro integrado a cada módulo do sistema.' 
              },
              { 
                icon: <ShieldCheck size={20} weight="duotone" className="auth-feature-icon" />, 
                title: 'Padrão Enterprise', 
                desc: 'Privacidade absoluta com isolamento total por tenant em arquitetura SaaS.' 
              },
            ].map((f, i) => (
              <div key={f.title} className="auth-feature" style={{ '--i': i } as any}>
                <div className="auth-feature-icon-wrapper">
                  {f.icon}
                </div>
                <div className="auth-feature-content">
                  <h3 className="auth-feature-title">{f.title}</h3>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
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
