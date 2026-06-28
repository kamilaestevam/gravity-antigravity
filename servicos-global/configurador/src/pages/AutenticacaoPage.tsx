import { LogoGlobal } from '@nucleo/logo-global'
import { LoginGlobal } from '@nucleo/login-global'
import { GravityLoader } from '@nucleo/gravity-loader-global'
import { Atom, CursorClick, Coins, ShieldCheck } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@clerk/clerk-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLoginAutomaticoPosConvite } from '../auth/use-login-automatico-pos-convite'
import { navegarDestinoPosAutenticacao } from '../routing/navegar-destino-pos-autenticacao.js'
import './auth.css'

export function AutenticacaoPage() {
  const { t } = useTranslation()
  const { getToken, userId } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const authCadastro = location.pathname.startsWith('/cadastro')
  const loginAutomaticoConvite = useLoginAutomaticoPosConvite()

  if (loginAutomaticoConvite) {
    return (
      <div className="auth-root" style={{ alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div id="clerk-captcha" />
        <GravityLoader texto="Entrando na plataforma…" tamanho="lg" />
      </div>
    )
  }

  return (
    <div className={authCadastro ? 'auth-root auth-root--cadastro' : 'auth-root'}>

      {/* ── Left Panel — Branding ── */}
      <div className="auth-brand">
        <div className="auth-brand-grid" />

        <div className="auth-brand-content">
          {/* Logo — mesmo do Marketplace */}
          <div className="auth-logo">
            <LogoGlobal iconSize={50} iconColor="#818cf8" />
          </div>

          {/* Headline */}
          <h1 className="auth-headline">
            {t('auth.headline')}{' '}
            <span className="auth-headline-accent">
              {t('auth.headline_destaque')}
            </span>
          </h1>

          <p className="auth-subheadline">
            {t('auth.subheadline')}
          </p>

          {/* Features */}
          <div className="auth-features">
            {[
              {
                icon: <Atom size={20} weight="duotone" className="auth-feature-icon" />,
                title: t('auth.ecossistema_titulo'),
                desc: t('auth.ecossistema_desc')
              },
              {
                icon: <CursorClick size={20} weight="duotone" className="auth-feature-icon" />,
                title: t('auth.zero_digitacao_titulo'),
                desc: t('auth.zero_digitacao_desc')
              },
              {
                icon: <Coins size={20} weight="duotone" className="auth-feature-icon" />,
                title: t('auth.gestao_custos_titulo'),
                desc: t('auth.gestao_custos_desc')
              },
              {
                icon: <ShieldCheck size={20} weight="duotone" className="auth-feature-icon" />,
                title: t('auth.padrao_enterprise_titulo'),
                desc: t('auth.padrao_enterprise_desc')
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
      <LoginGlobal
        onAutenticacaoCompleta={async () => {
          await navegarDestinoPosAutenticacao({ getToken, navigate, userId })
        }}
      />

    </div>
  )
}
