import { SignUp, useSignIn } from '@clerk/clerk-react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Envelope, Lock, Eye, EyeSlash, ArrowLeft, CheckCircle, WarningCircle, CircleNotch } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import './login-global.css'

/** Chave no sessionStorage onde o consumer salva uma mensagem de erro pra
 *  exibir no topo da tela de login (ex: usuário INATIVO redirecionado pelo
 *  middleware do backend). Lê e LIMPA no mount. */
const STORAGE_KEY_ERRO_LOGIN = 'gravity_login_error'

export function LoginGlobal() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const isSignUp = location.pathname.includes('/cadastro')
  const isForgotPassword = location.pathname.includes('/recuperar-senha')

  // Mensagem de erro vinda do backend (ex: USUARIO_INATIVO, ORGANIZACAO_SUSPENSA).
  // Salva em sessionStorage pelo hook useCarregarTipoUsuario antes do signOut.
  // Lê uma vez no mount, exibe, e limpa pra não persistir entre tentativas.
  const [erroLogin, setErroLogin] = useState<string | null>(null)
  useEffect(() => {
    try {
      const msg = sessionStorage.getItem(STORAGE_KEY_ERRO_LOGIN)
      if (msg) {
        setErroLogin(msg)
        sessionStorage.removeItem(STORAGE_KEY_ERRO_LOGIN)
      }
    } catch { /* sessionStorage não disponível em SSR/privacy */ }
  }, [])

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

      {/* Banner de erro vindo do backend (ex: USUARIO_INATIVO). Aparece SÓ se
          sessionStorage tinha mensagem ao montar — sumir nas próximas tentativas. */}
      {erroLogin && !isForgotPassword && (
        <div
          role="alert"
          style={{
            margin: '0 0 1rem',
            padding: '0.875rem 1rem',
            borderRadius: '8px',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid rgba(248,113,113,0.3)',
            color: '#fca5a5',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.625rem',
            lineHeight: 1.4,
          }}
        >
          <WarningCircle size={20} weight="fill" style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>{erroLogin}</span>
        </div>
      )}

      {isForgotPassword ? (
        <ForgotPasswordFlow onBack={() => navigate('/login')} />
      ) : isSignUp ? (
        <>
          <SignUp
            routing="hash"
            afterSignUpUrl="/trial"
            signInUrl="/login"
            appearance={clerkAppearance as any}
          />
          <Link className="forgot-back-link" to="/login">
            <ArrowLeft size={16} />
            {t('login.voltar_login')}
          </Link>
        </>
      ) : (
        <SignInFlow />
      )}

      {!isForgotPassword && (
        <div className="login-global-footer">
          <p className="login-footer-main">
            {isSignUp ? (
              <>
                {t('login.ja_conhece', 'Possui uma conta?')} <Link to="/login">{t('login.entrar')}</Link>
              </>
            ) : (
              <>
                {t('login.sem_conta')} <Link to="/cadastro">{t('login.registrar')}</Link>
              </>
            )}
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
  const [erroMensagem, setErroMensagem] = useState<string | null>(null)
  const { isLoaded, signIn } = useSignIn()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !isLoaded || !signIn) return

    setStatus('loading')
    setErroMensagem(null)

    try {
      // Dispara envio real do código de 6 dígitos via Clerk
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setStatus('success')
    } catch (err) {
      const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
        ?? (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : 'Não foi possível enviar o código. Verifique o e-mail e tente novamente.')
      setErroMensagem(msg)
      setStatus('error')
    }
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
        <Link
          className="forgot-button"
          to={`/recuperar-senha/redefinir?email=${encodeURIComponent(email)}`}
        >
          {t('login.tenho_codigo', 'Tenho o código')}
        </Link>
        <Link className="forgot-back-link" to="/login" onClick={onBack} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} />
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
            <span>{erroMensagem ?? t('login.erro_email_nao_encontrado')}</span>
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
        to="/login"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        {t('login.voltar_login')}
      </Link>
    </div>
  )
}

/**
 * Logo Google "G" oficial (4 cores). Usado pelo botao "Continuar com Google".
 * SVG inline equivalente ao logo que o Clerk renderiza no <SignUp>/<SignIn>,
 * pra manter consistencia visual entre /login e /cadastro.
 */
function GoogleLogoColorido({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FBBC05" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#EA4335" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#34A853" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#4285F4" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  )
}

/**
 * SignInFlow — form custom de login com email+senha empilhados no mesmo card.
 *
 * Substitui o componente <SignIn> do Clerk (que renderizava em 2 passos: email
 * primeiro, depois senha em outra tela) pelo hook oficial `useSignIn()`. Mantém
 * 100% da cadeia pos-login intacta:
 *   - setActive({ session }) cria a sessao Clerk
 *   - navigate('/hub') dispara o ciclo do useCarregarTipoUsuario
 *   - banner USUARIO_INATIVO continua aparecendo via sessionStorage
 *
 * Mandamentos respeitados:
 *   - Mand. 01 (Clerk isolado): apenas autenticacao, sem ler publicMetadata
 *   - Mand. 05 (sem casting vazio): estados null/string, nunca {} as ...
 *   - Mand. 08 (sem fallback silencioso): switch exaustivo no result.status com console.error
 */
function SignInFlow() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'oauth_loading'>('idle')

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha || !isLoaded || !signIn) return

    setStatus('loading')
    setErro(null)

    try {
      const resultado = await signIn.create({ identifier: email, password: senha })

      // Mand. 08 — discriminated union explicita com console.error em todo ramo nao-sucesso
      switch (resultado.status) {
        case 'complete':
          await setActive({ session: resultado.createdSessionId })
          navigate('/hub')
          return

        case 'needs_second_factor':
          console.error('[LoginGlobal] 2FA solicitado mas tela atual nao suporta', { resultado })
          setErro(t('login.erro_2fa_nao_suportado'))
          setStatus('idle')
          return

        default:
          // needs_identifier, needs_first_factor inesperado, needs_new_password, etc.
          console.error('[LoginGlobal] Status inesperado de signIn.create', {
            status: resultado.status,
            resultado,
          })
          setErro(t('login.erro_status_incompleto'))
          setStatus('idle')
          return
      }
    } catch (err) {
      const erroClerk = err as {
        errors?: Array<{ code?: string; longMessage?: string; message?: string }>
      }
      const codigoClerk = erroClerk?.errors?.[0]?.code
      const mensagemClerk =
        erroClerk?.errors?.[0]?.longMessage ?? erroClerk?.errors?.[0]?.message

      let mensagemFinal: string
      if (codigoClerk === 'session_exists') {
        mensagemFinal = t('login.erro_sessao_existente')
      } else if (
        codigoClerk === 'form_password_incorrect' ||
        codigoClerk === 'form_identifier_not_found' ||
        codigoClerk === 'strategy_for_user_invalid'
      ) {
        mensagemFinal = t('login.erro_credenciais_invalidas')
      } else if (
        codigoClerk === 'form_captcha_invalid' ||
        codigoClerk === 'captcha_required' ||
        codigoClerk === 'captcha_not_enabled'
      ) {
        // Mand. 08 — o dono optou por nao adicionar <div id="clerk-captcha"/>
        console.error('[LoginGlobal] Clerk exigiu CAPTCHA mas form custom nao tem suporte', {
          codigoClerk,
          erro: err,
        })
        mensagemFinal = t('login.erro_generico')
      } else if (mensagemClerk) {
        mensagemFinal = mensagemClerk
      } else if (err instanceof Error) {
        mensagemFinal = err.message
      } else {
        mensagemFinal = t('login.erro_generico')
      }

      setErro(mensagemFinal)
      setStatus('idle')
    }
  }

  const entrarComGoogle = async () => {
    if (!isLoaded || !signIn) return
    setStatus('oauth_loading')
    setErro(null)

    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/login/sso-callback',
        redirectUrlComplete: '/hub',
      })
    } catch (err) {
      console.error('[LoginGlobal] Falha ao iniciar OAuth Google', { err })
      const erroClerk = err as {
        errors?: Array<{ longMessage?: string; message?: string }>
      }
      const mensagem =
        erroClerk?.errors?.[0]?.longMessage ??
        erroClerk?.errors?.[0]?.message ??
        (err instanceof Error ? err.message : t('login.erro_generico'))
      setErro(mensagem)
      setStatus('idle')
    }
  }

  const carregando = status === 'loading' || status === 'oauth_loading'

  return (
    <div className="signin-container">
      <div className="signin-card">
      <button
        type="button"
        className="signin-social-google"
        onClick={entrarComGoogle}
        disabled={carregando}
        aria-label={t('login.continuar_com_google')}
      >
        {status === 'oauth_loading' ? (
          <CircleNotch size={20} className="spin" />
        ) : (
          <GoogleLogoColorido size={20} />
        )}
        <span>{t('login.continuar_com_google')}</span>
      </button>

      <div className="signin-divider" role="separator" aria-orientation="horizontal">
        <span>OU</span>
      </div>

      <form onSubmit={aoSubmeter} className="signin-form" noValidate>
        <div className="signin-field">
          <label htmlFor="signin-email">{t('comum.email')}</label>
          <div className="signin-input-wrapper">
            <input
              id="signin-email"
              type="email"
              placeholder={t('login.placeholder_email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={carregando}
              aria-invalid={erro ? 'true' : 'false'}
              aria-describedby={erro ? 'signin-erro' : undefined}
            />
            <Envelope size={20} className="signin-input-icon" />
          </div>
        </div>

        <div className="signin-field">
          <label htmlFor="signin-senha">{t('comum.senha')}</label>
          <div className="signin-input-wrapper signin-input-wrapper--senha">
            <input
              id="signin-senha"
              type={verSenha ? 'text' : 'password'}
              placeholder={t('login.placeholder_senha')}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={carregando}
              aria-invalid={erro ? 'true' : 'false'}
              aria-describedby={erro ? 'signin-erro' : undefined}
            />
            <Lock size={20} className="signin-input-icon" />
            <button
              type="button"
              className="signin-input-toggle"
              onClick={() => setVerSenha((v) => !v)}
              aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              tabIndex={-1}
            >
              {verSenha ? <EyeSlash size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {erro && (
          <div id="signin-erro" className="signin-error-msg" role="alert">
            <WarningCircle size={18} />
            <span>{erro}</span>
          </div>
        )}

        <TooltipGlobal descricao={t('login.tooltip_entrar')}>
          <button
            type="submit"
            className={`signin-button ${status === 'loading' ? 'loading' : ''}`}
            disabled={carregando || !email || !senha}
          >
            {status === 'loading' ? (
              <>
                <CircleNotch size={20} className="spin" />
                {t('login.entrando')}
              </>
            ) : (
              t('login.entrar')
            )}
          </button>
        </TooltipGlobal>
      </form>
      </div>

      <div className="signin-forgot-link">
        <Link to="/recuperar-senha">{t('login.esqueceu_senha')}</Link>
      </div>
    </div>
  )
}
