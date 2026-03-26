import { SignIn, SignUp } from '@clerk/clerk-react'
import { useLocation } from 'react-router-dom'
import './login-global.css'

export function LoginGlobal() {
  const location = useLocation()
  const isSignUp = location.pathname.includes('/sign-up')

  const clerkAppearance = {
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
        border: '1px solid rgba(255, 255, 255, 0.1)',
        background: '#1e293b',
      },
      headerTitle: { display: 'none' },
      headerSubtitle: { display: 'none' },
      socialButtonsBlockButton: {
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#1e293b',
        color: '#ffffff',
        transition: 'all 0.2s ease',
        '&:hover': {
          background: '#242f42',
          borderColor: 'rgba(255,255,255,0.15)',
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
      },
      formButtonPrimary: {
        background: '#6366f1',
        color: '#ffffff',
        fontWeight: '700',
        borderRadius: '9999px',
        boxShadow: '0 1px 3px rgba(99, 102, 241, 0.25)',
      },
      footerActionLink: { color: '#818cf8', fontWeight: '600' },
      footer: { display: 'none' },
      dividerLine: { background: 'rgba(255,255,255,0.1)' },
      dividerText: { color: '#64748b' },
    },
  }

  return (
    <div className="login-global-panel">
      <div className="login-global-header">
        <p className="login-global-title">{isSignUp ? 'Criar sua conta' : 'Acessar a plataforma'}</p>
        <p className="login-global-subtitle">{isSignUp ? 'Preencha os dados e comece agora' : 'Entre com suas credenciais para continuar'}</p>
      </div>

      {isSignUp ? (
        <SignUp
          routing="hash"
          afterSignUpUrl="/trial"
          signInUrl="/sign-in"
          appearance={clerkAppearance as any}
        />
      ) : (
        <SignIn
          routing="hash"
          afterSignInUrl="/hub"
          signUpUrl="/sign-up"
          appearance={clerkAppearance as any}
        />
      )}

      <div className="login-global-footer">
        <p>
          {isSignUp ? (
            <>
              Possui uma conta? <a href="/#/sign-in">Entrar</a>
            </>
          ) : (
            <>
              Não possui uma conta? <a href="/#/sign-up">Registre-se</a>
            </>
          )}
        </p>
        <p style={{ marginTop: '1.5rem' }}>
          {isSignUp ? 'Já conhece a plataforma? ' : 'Novo por aqui? '}
          <a href="http://localhost:8002" target="_blank" rel="noreferrer">
            {isSignUp ? 'Saiba mais' : 'Conheça a plataforma'}
          </a>
        </p>
      </div>
    </div>
  )
}
