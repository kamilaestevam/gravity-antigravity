import { SignIn, SignUp } from '@clerk/clerk-react'
import { useLocation, Link } from 'react-router-dom'
import './login-global.css'

export function LoginGlobal() {
  const location = useLocation()
  const isSignUp = location.pathname.includes('/sign-up')

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
        <p className="login-footer-main">
          {isSignUp ? (
            <>
              Possui uma conta? <Link to="/sign-in">Entrar</Link>
            </>
          ) : (
            <>
              Não possui uma conta? <Link to="/sign-up">Registre-se</Link>
            </>
          )}
        </p>
        <p className="login-footer-secondary">
          {isSignUp ? 'Já conhece a plataforma? ' : 'Novo por aqui? '}
          <a href="http://localhost:8002" target="_blank" rel="noreferrer">
            {isSignUp ? 'Saiba mais' : 'Conheça a plataforma'}
          </a>
        </p>
      </div>
    </div>
  )
}
