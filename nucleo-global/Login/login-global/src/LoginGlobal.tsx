import { SignIn, SignUp } from '@clerk/clerk-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Envelope, ArrowLeft, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './login-global.css'

export function LoginGlobal() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isSignUp = location.pathname.includes('/sign-up')
  const isForgotPassword = location.pathname.includes('/forgot-password')

  const clerkAppearance = {
    variables: {
      colorPrimary: '#6366f1',
      colorBackground: '#1a1f2e',
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
        boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        background: '#1a1f2e',
        overflow: 'visible',
      },
      headerTitle: { display: 'none' },
      headerSubtitle: { display: 'none' },
      socialButtonsBlockButton: {
        border: '1.5px solid rgba(255,255,255,0.45)',
        background: '#2d3548',
        color: '#ffffff',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          background: '#363f54',
          borderColor: 'rgba(255,255,255,0.65)',
          transform: 'translateY(-1px)',
        },
      },
      socialButtonsBlockButtonBadge: {
        background: '#7c3aed',
        color: '#ffffff',
        textTransform: 'uppercase',
        fontSize: '9px',
        fontWeight: '800',
        padding: '2px 8px',
        borderRadius: '100px',
        position: 'absolute',
        top: '6px',
        right: '8px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.8), 0 0 10px rgba(129, 140, 248, 0.5), 0 0 0 1.5px rgba(255,255,255,0.3)',
      },
      formButtonPrimary: {
        background: '#6366f1',
        color: '#ffffff',
        fontWeight: '700',
        borderRadius: '9999px',
        boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: '#4f46e5',
          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.45)',
          transform: 'translateY(-1px)',
        },
      },
      formFieldLabel: { color: '#94a3b8', fontWeight: '600', marginBottom: '4px' },
      formFieldRow: { 
        flexDirection: 'column', 
        gap: '0.75rem' 
      },
      footer: { display: 'none' },
      dividerLine: { background: 'rgba(255,255,255,0.08)' },
      dividerText: { color: '#94a3b8', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' },
    },
  }

  return (
    <div className="login-global-panel">
      <div className="login-global-header">
        <p className="login-global-title">
          {isForgotPassword ? t('login.recuperar_senha_titulo') : isSignUp ? t('login.criar_conta_titulo') : t('login.acessar_titulo')}
        </p>
        <p className="login-global-subtitle">
          {isForgotPassword
            ? t('login.recuperar_subtitulo')
            : isSignUp
              ? t('login.criar_subtitulo')
              : t('login.acessar_subtitulo')}
        </p>
      </div>

      {isForgotPassword ? (
        <ForgotPasswordFlow onBack={() => navigate('/sign-in')} />
      ) : isSignUp ? (
        <SignUp
          routing="hash"
          afterSignUpUrl="/trial"
          signInUrl="/sign-in"
          appearance={clerkAppearance as any}
        />
      ) : (
        <>
          <SignIn
            routing="hash"
            afterSignInUrl="/hub"
            signUpUrl="/sign-up"
            forgotPasswordUrl="/forgot-password"
            appearance={clerkAppearance as any}
          />
          <div className="login-forgot-manual">
            <Link to="/forgot-password">{t('login.esqueceu_senha')}</Link>
          </div>
        </>
      )}

      {!isForgotPassword && (
        <div className="login-global-footer">
          <p className="login-footer-main">
            {isSignUp ? (
              <>
                {t('login.ja_conhece', 'Possui uma conta?')} <Link to="/sign-in">{t('login.entrar')}</Link>
              </>
            ) : (
              <>
                {t('login.sem_conta')} <Link to="/sign-up">{t('login.registrar')}</Link>
              </>
            )}
          </p>
          <p className="login-footer-secondary">
            {isSignUp ? `${t('login.ja_conhece')} ` : `${t('login.sem_conta', 'Novo por aqui?')} `}
            <a href="http://localhost:8002" target="_blank" rel="noreferrer">
              {isSignUp ? t('login.saiba_mais') : t('login.conheca_plataforma')}
            </a>
          </p>
        </div>
      )}
    </div>
  )
}

function ForgotPasswordFlow({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    
    // Simulação de envio
    setTimeout(() => {
      if (email.includes('error')) {
        setStatus('error')
      } else {
        setStatus('success')
      }
    }, 1500)
  }

  if (status === 'success') {
    return (
      <div className="forgot-password-container success">
        <div className="status-icon success">
          <CheckCircle size={48} weight="duotone" />
        </div>
        <h2 className="forgot-title">{t('login.verificar_email_titulo')}</h2>
        <p className="forgot-desc">
          {t('login.verificar_email_desc')}<br />
          <strong>{email}</strong>
        </p>
        <Link className="forgot-button" to="/sign-in" onClick={onBack}>
          {t('login.voltar_login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="forgot-password-container">
      <form onSubmit={handleSubmit} className="forgot-form">
        <div className="forgot-field">
          <label htmlFor="email">{t('comum.email')}</label>
          <div className="forgot-input-wrapper">
            <Envelope size={20} className="forgot-input-icon" />
            <input
              id="email"
              type="email"
              placeholder={t('login.placeholder_email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
            />
          </div>
        </div>

        {status === 'error' && (
          <div className="forgot-error-msg">
            <WarningCircle size={18} />
            <span>{t('login.erro_email_nao_encontrado')}</span>
          </div>
        )}

        <TooltipGlobal descricao="Enviar um link de redefinição para o e-mail informado abaixo">
          <button 
            type="submit" 
            className={`forgot-button ${status === 'loading' ? 'loading' : ''}`}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? <CircleNotch size={20} className="spin" /> : t('login.enviar_instrucoes')}
          </button>
        </TooltipGlobal>
      </form>

      <Link 
        className="forgot-back-link" 
        to="/sign-in" 
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        {t('login.voltar_login')}
      </Link>
    </div>
  )
}
