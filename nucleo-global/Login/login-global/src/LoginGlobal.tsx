import { useSignUp, useSignIn } from '@clerk/clerk-react'
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

function avaliarSenha(senha: string) {
  const tem8 = senha.length >= 8
  const temMaiuscula = /[A-Z]/.test(senha)
  const temMinuscula = /[a-z]/.test(senha)
  const temNumero = /\d/.test(senha)
  const temEspecial = /[^A-Za-z0-9]/.test(senha)
  const requisitos = [
    { chave: 'min8', ok: tem8, mensagem: 'No mínimo 8 caracteres' },
    { chave: 'maiuscula', ok: temMaiuscula, mensagem: 'Pelo menos 1 letra maiúscula' },
    { chave: 'minuscula', ok: temMinuscula, mensagem: 'Pelo menos 1 letra minúscula' },
    { chave: 'numero', ok: temNumero, mensagem: 'Pelo menos 1 número' },
    { chave: 'especial', ok: temEspecial, mensagem: 'Pelo menos 1 caractere especial' },
  ]
  const total = Number(tem8) + Number(temMaiuscula) + Number(temMinuscula) + Number(temNumero) + Number(temEspecial)
  const forca = Math.min(total, 4) as 0 | 1 | 2 | 3 | 4
  return { forca, requisitos }
}

const CORES_FORCA = ['#475569', '#ef4444', '#f59e0b', '#22c55e', '#34d399']
const LABEL_FORCA = ['', 'Fraca', 'Razoável', 'Forte', 'Muito forte']

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
        <SignUpFlow />
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
 * SignUpFlow — form custom de cadastro com useSignUp().
 *
 * Substitui o componente <SignUp> do Clerk pelo hook oficial `useSignUp()`.
 * Adiciona: campo "Confirmar senha" com toggle independente, barra de força
 * e checklist visual dos requisitos de senha. Fluxo em 2 etapas:
 *   1) Formulário (nome, email, senha, confirmação) → signUp.create()
 *   2) Verificação de e-mail (código 6 dígitos) → attemptEmailAddressVerification()
 *
 * Mandamentos respeitados:
 *   - Mand. 01 (Clerk isolado): apenas autenticação, sem ler publicMetadata
 *   - Mand. 05 (sem casting vazio): estados null/string, nunca {} as ...
 *   - Mand. 08 (sem fallback silencioso): switch explícito, console.error em ramos inesperados
 */
function SignUpFlow() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isLoaded, signUp, setActive } = useSignUp()
  const [nome, setNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmacao, setVerConfirmacao] = useState(false)
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'oauth_loading'>('idle')
  const [etapa, setEtapa] = useState<'form' | 'verificacao'>('form')
  const [codigo, setCodigo] = useState('')

  const { forca, requisitos } = avaliarSenha(senha)
  const senhasDiferentes = confirmacao.length > 0 && senha !== confirmacao
  const carregando = status === 'loading' || status === 'oauth_loading'

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp || carregando) return

    if (senha !== confirmacao) {
      setErro(t('cadastro.erro_senhas_diferentes', 'As senhas não coincidem.'))
      return
    }
    if (requisitos.some(r => !r.ok)) {
      setErro(t('cadastro.erro_requisitos_senha', 'A senha não atende todos os requisitos.'))
      return
    }

    setStatus('loading')
    setErro(null)

    try {
      await signUp.create({
        firstName: nome.trim(),
        lastName: sobrenome.trim(),
        emailAddress: email.trim(),
        password: senha,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setEtapa('verificacao')
      setStatus('idle')
    } catch (err) {
      const erroClerk = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> }
      const codigoClerk = erroClerk?.errors?.[0]?.code

      if (codigoClerk === 'form_captcha_invalid' || codigoClerk === 'captcha_required') {
        console.error('[SignUpFlow] Clerk exigiu CAPTCHA', { codigoClerk, erro: err })
      }

      const msg = erroClerk?.errors?.[0]?.longMessage
        ?? erroClerk?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : t('cadastro.erro_generico', 'Erro ao criar conta. Tente novamente.'))
      setErro(msg)
      setStatus('idle')
    }
  }

  const verificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signUp) return

    setStatus('loading')
    setErro(null)

    try {
      const resultado = await signUp.attemptEmailAddressVerification({ code: codigo })

      switch (resultado.status) {
        case 'complete':
          if (resultado.createdSessionId) {
            await setActive({ session: resultado.createdSessionId })
            navigate('/trial', { replace: true })
          }
          return

        default:
          console.error('[SignUpFlow] Status inesperado após verificação', {
            status: resultado.status,
            resultado,
          })
          setErro(t('cadastro.erro_verificacao', 'Verificação incompleta. Tente novamente.'))
          setStatus('idle')
          return
      }
    } catch (err) {
      const erroClerk = err as { errors?: Array<{ longMessage?: string; message?: string }> }
      const msg = erroClerk?.errors?.[0]?.longMessage
        ?? erroClerk?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : t('cadastro.erro_codigo_invalido', 'Código inválido.'))
      setErro(msg)
      setStatus('idle')
    }
  }

  const reenviarCodigo = async () => {
    if (!isLoaded || !signUp) return
    setErro(null)
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    } catch (err) {
      console.error('[SignUpFlow] Falha ao reenviar código', { err })
    }
  }

  const entrarComGoogle = async () => {
    if (!isLoaded || !signUp) return
    setStatus('oauth_loading')
    setErro(null)

    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/cadastro/sso-callback',
        redirectUrlComplete: '/trial',
      })
    } catch (err) {
      console.error('[SignUpFlow] Falha ao iniciar OAuth Google', { err })
      const erroClerk = err as { errors?: Array<{ longMessage?: string; message?: string }> }
      const msg = erroClerk?.errors?.[0]?.longMessage
        ?? erroClerk?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : t('login.erro_generico'))
      setErro(msg)
      setStatus('idle')
    }
  }

  // ── Etapa 2: Verificação de e-mail ──
  if (etapa === 'verificacao') {
    const digitos = codigo.padEnd(6, '').split('').slice(0, 6)

    const aoDigitar = (valor: string, indice: number) => {
      const digito = valor.replace(/\D/g, '').slice(-1)
      const novosCodigo = codigo.split('')
      novosCodigo[indice] = digito
      const novoCodigo = novosCodigo.join('').replace(/\s/g, '')
      setCodigo(novoCodigo)
      if (digito && indice < 5) {
        const proximo = document.getElementById(`signup-otp-${indice + 1}`)
        proximo?.focus()
      }
    }

    const aoTeclar = (e: React.KeyboardEvent<HTMLInputElement>, indice: number) => {
      if (e.key === 'Backspace' && !digitos[indice] && indice > 0) {
        const anterior = document.getElementById(`signup-otp-${indice - 1}`)
        anterior?.focus()
      }
    }

    const aoColar = (e: React.ClipboardEvent) => {
      const texto = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
      if (texto) {
        e.preventDefault()
        setCodigo(texto)
        const ultimo = document.getElementById(`signup-otp-${Math.min(texto.length, 5)}`)
        ultimo?.focus()
      }
    }

    return (
      <div className="signin-container">
        <div className="signup-card">
          <p className="signup-verificacao-titulo">
            {t('cadastro.verificar_titulo', 'Verifique seu e-mail')}
          </p>
          <p className="signup-verificacao-desc">
            {t('cadastro.verificar_desc', 'Enviamos um código de 6 dígitos para')}{' '}
            <strong style={{ color: '#f1f5f9' }}>{email}</strong>
          </p>

          <form onSubmit={verificarCodigo} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="signup-field">
              <label>{t('cadastro.label_codigo', 'Código de verificação')}</label>
              <div className="signup-otp-boxes">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    id={`signup-otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digitos[i] || ''}
                    onChange={(e) => aoDigitar(e.target.value, i)}
                    onKeyDown={(e) => aoTeclar(e, i)}
                    onPaste={i === 0 ? aoColar : undefined}
                    disabled={carregando}
                    autoFocus={i === 0}
                    className="signup-otp-input"
                  />
                ))}
              </div>
            </div>

            {erro && (
              <div className="signin-error-msg" role="alert">
                <WarningCircle size={18} />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              className={`signin-button ${status === 'loading' ? 'loading' : ''}`}
              disabled={carregando || codigo.length < 6}
            >
              {status === 'loading' ? (
                <><CircleNotch size={20} className="spin" /> Verificando...</>
              ) : (
                'Verificar'
              )}
            </button>
          </form>

          <button type="button" className="signup-reenviar" onClick={reenviarCodigo} disabled={carregando}>
            {t('cadastro.reenviar_codigo', 'Reenviar código')}
          </button>
        </div>
      </div>
    )
  }

  // ── Etapa 1: Formulário de cadastro ──
  return (
    <div className="signin-container">
      <div className="signup-card">
        <button
          type="button"
          className="signup-social-google"
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

        <div className="signin-divider" role="separator">
          <span>OU</span>
        </div>

        <form onSubmit={aoSubmeter} className="signin-form" noValidate>
          <div className="signup-field">
            <label htmlFor="signup-nome">{t('cadastro.label_nome', 'Nome')}</label>
            <div className="signup-input-wrapper">
              <input
                id="signup-nome"
                type="text"
                placeholder={t('cadastro.placeholder_nome', 'Seu nome')}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-sobrenome">{t('cadastro.label_sobrenome', 'Sobrenome')}</label>
            <div className="signup-input-wrapper">
              <input
                id="signup-sobrenome"
                type="text"
                placeholder={t('cadastro.placeholder_sobrenome', 'Seu sobrenome')}
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-email">{t('comum.email', 'E-mail')}</label>
            <div className="signup-input-wrapper">
              <input
                id="signup-email"
                type="email"
                placeholder={t('login.placeholder_email')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={carregando}
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="signup-senha">{t('comum.senha', 'Senha')}</label>
            <div className="signup-input-wrapper signup-input-wrapper--senha">
              <input
                id="signup-senha"
                type={verSenha ? 'text' : 'password'}
                placeholder={t('cadastro.placeholder_senha', 'Mínimo 8 caracteres')}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={carregando}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="signup-input-toggle"
                onClick={() => setVerSenha((v) => !v)}
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {verSenha ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {senha.length > 0 && (
              <div className="signup-forca">
                <div className="signup-forca-track">
                  <div
                    className="signup-forca-fill"
                    style={{ width: `${forca * 25}%`, background: CORES_FORCA[forca] }}
                  />
                </div>
                <span className="signup-forca-label" style={{ color: CORES_FORCA[forca] }}>
                  {LABEL_FORCA[forca]}
                </span>
              </div>
            )}
          </div>

          <div className="signup-field">
            <label htmlFor="signup-confirmacao">{t('cadastro.label_confirmar', 'Confirmar senha')}</label>
            <div className="signup-input-wrapper signup-input-wrapper--senha">
              <input
                id="signup-confirmacao"
                type={verConfirmacao ? 'text' : 'password'}
                placeholder={t('cadastro.placeholder_confirmar', 'Digite a senha novamente')}
                value={confirmacao}
                onChange={(e) => setConfirmacao(e.target.value)}
                required
                disabled={carregando}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="signup-input-toggle"
                onClick={() => setVerConfirmacao((v) => !v)}
                aria-label={verConfirmacao ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
              >
                {verConfirmacao ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {senhasDiferentes && (
              <span className="signup-senha-erro">{t('cadastro.senhas_diferentes', 'As senhas não coincidem')}</span>
            )}
          </div>

          <label className="signup-termos">
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              disabled={carregando}
            />
            <span>
              Li e aceito os{' '}
              <a href="#" target="_blank" rel="noreferrer">Termos de Uso</a>
              {' '}e a{' '}
              <a href="#" target="_blank" rel="noreferrer">Política de Privacidade</a>.
            </span>
          </label>

          {senha.length > 0 && (
            <div className="signup-requisitos">
              {requisitos.map((r) => (
                <div key={r.chave} className={`signup-requisito ${r.ok ? 'signup-requisito--ok' : 'signup-requisito--pendente'}`}>
                  {r.ok ? <CheckCircle size={14} weight="fill" /> : <span className="signup-requisito-bullet">○</span>}
                  <span>{r.mensagem}</span>
                </div>
              ))}
            </div>
          )}

          {erro && (
            <div className="signin-error-msg" role="alert">
              <WarningCircle size={18} />
              <span>{erro}</span>
            </div>
          )}

          <div id="clerk-captcha" />

          <button
            type="submit"
            className={`signin-button ${status === 'loading' ? 'loading' : ''}`}
            disabled={carregando || !nome || !email || !senha || !confirmacao || senhasDiferentes || requisitos.some(r => !r.ok) || !aceiteTermos}
          >
            {status === 'loading' ? (
              <><CircleNotch size={20} className="spin" /> Criando conta...</>
            ) : (
              'Continuar'
            )}
          </button>
        </form>
      </div>

      <Link className="forgot-back-link" to="/login">
        <ArrowLeft size={16} />
        {t('login.voltar_login')}
      </Link>
    </div>
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
  const [etapa, setEtapa] = useState<'credenciais' | 'codigo_email'>('credenciais')
  const [codigoEmail, setCodigoEmail] = useState('')

  const completarLogin = async () => {
    if (!signIn) return
    await setActive({ session: signIn.createdSessionId })
    navigate('/hub')
  }

  const enviarCodigoSegundoFator = async () => {
    if (!signIn) return
    const segundosFatores = signIn.supportedSecondFactors ?? []
    const temEmail = segundosFatores.some((f: { strategy: string }) => f.strategy === 'email_code')
    const temTOTP = segundosFatores.some((f: { strategy: string }) => f.strategy === 'totp')

    if (temEmail) {
      await signIn.prepareSecondFactor({ strategy: 'email_code' })
      setEtapa('codigo_email')
      setStatus('idle')
    } else if (temTOTP) {
      setEtapa('codigo_email')
      setStatus('idle')
    } else {
      console.error('[LoginGlobal] Nenhuma estrategia de segundo fator suportada', { segundosFatores })
      setErro(t('login.erro_2fa_nao_suportado'))
      setStatus('idle')
    }
  }

  const aoSubmeterCodigo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigoEmail || !isLoaded || !signIn) return
    setStatus('loading')
    setErro(null)

    try {
      const segundosFatores = signIn.supportedSecondFactors ?? []
      const temEmail = segundosFatores.some((f: { strategy: string }) => f.strategy === 'email_code')
      const estrategia = temEmail ? 'email_code' as const : 'totp' as const

      const resultado = await signIn.attemptSecondFactor({ strategy: estrategia, code: codigoEmail })
      if (resultado.status === 'complete') {
        await setActive({ session: resultado.createdSessionId })
        navigate('/hub')
      } else {
        console.error('[LoginGlobal] Status inesperado apos segundo fator', { status: resultado.status })
        setErro(t('login.erro_status_incompleto'))
        setStatus('idle')
      }
    } catch (err) {
      const erroClerk = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> }
      const msg = erroClerk?.errors?.[0]?.longMessage ?? erroClerk?.errors?.[0]?.message ?? t('login.erro_generico')
      setErro(msg)
      setStatus('idle')
    }
  }

  const aoSubmeter = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !senha || !isLoaded || !signIn) return

    setStatus('loading')
    setErro(null)

    try {
      const resultado = await signIn.create({ identifier: email, password: senha })

      switch (resultado.status) {
        case 'complete':
          await completarLogin()
          return

        case 'needs_second_factor':
          await enviarCodigoSegundoFator()
          return

        default:
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

  if (etapa === 'codigo_email') {
    return (
      <div className="signin-container">
        <div className="signin-card">
          <form onSubmit={aoSubmeterCodigo} className="signin-form" noValidate>
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <Envelope size={32} style={{ color: 'var(--ws-accent, #818cf8)', marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.9rem', color: 'var(--ws-text-secondary, #94a3b8)', margin: 0 }}>
                {t('login.verificacao_email_desc')}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--ws-text-tertiary, #64748b)', marginTop: '0.25rem' }}>
                {email}
              </p>
            </div>

            <div className="signin-field">
              <label htmlFor="signin-codigo">{t('login.codigo_verificacao')}</label>
              <div className="signin-input-wrapper">
                <input
                  id="signin-codigo"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  value={codigoEmail}
                  onChange={(e) => setCodigoEmail(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  disabled={carregando}
                  autoFocus
                  style={{ textAlign: 'center', letterSpacing: '0.3em', fontSize: '1.2rem' }}
                />
                <Lock size={20} className="signin-input-icon" />
              </div>
            </div>

            {erro && (
              <div id="signin-erro" className="signin-error-msg" role="alert">
                <WarningCircle size={18} />
                <span>{erro}</span>
              </div>
            )}

            <button
              type="submit"
              className={`signin-button ${status === 'loading' ? 'loading' : ''}`}
              disabled={carregando || codigoEmail.length < 6}
            >
              {status === 'loading' ? (
                <>
                  <CircleNotch size={20} className="spin" />
                  {t('login.verificando')}
                </>
              ) : (
                t('login.verificar')
              )}
            </button>

            <button
              type="button"
              className="signin-forgot-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.5rem', width: '100%' }}
              onClick={() => { setEtapa('credenciais'); setCodigoEmail(''); setErro(null) }}
            >
              <ArrowLeft size={14} style={{ marginRight: '0.25rem' }} />
              {t('login.voltar_login')}
            </button>
          </form>
        </div>
      </div>
    )
  }

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
