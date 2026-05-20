// CadastroContinuarPage.tsx
//
// Tela Gravity-styled que substitui o Account Portal hospedado em
// *.accounts.dev/sign-up/continue para usuários convidados. Recebe o
// `__clerk_ticket` da URL, completa o signUp via useSignUp() do
// @clerk/clerk-react e redireciona para /hub no sucesso.
//
// Layout: split panel idêntico ao AutenticacaoPage (branding à esquerda,
// formulário à direita). Reusa `auth.css` e `LogoGlobal`.
//
// Backend gera o link via clerkClient.invitations.createInvitation({
//   emailAddress, redirectUrl: `${APP_BASE_URL}/cadastro/continuar`
// }) — ver server/routes/usuario.ts e admin.ts.

import { useState, useEffect, useMemo } from 'react'
import { useSignUp } from '@clerk/clerk-react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Atom, CursorClick, Coins, ShieldCheck,
  User as UserIcon, EnvelopeSimple, Lock, Eye, EyeSlash,
  CheckCircle, WarningCircle, CircleNotch, GoogleLogo,
} from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { BannerRequisitosGlobal, type RequisitoSalvar } from '@nucleo/banner-requisitos-global'
import './auth.css'

// ─── Helpers de validação ────────────────────────────────────────────────────
function avaliarSenha(senha: string): {
  forca: 0 | 1 | 2 | 3 | 4
  requisitos: RequisitoSalvar[]
} {
  const tem8 = senha.length >= 8
  const temMaiuscula = /[A-Z]/.test(senha)
  const temMinuscula = /[a-z]/.test(senha)
  const temNumero = /\d/.test(senha)
  const temEspecial = /[^A-Za-z0-9]/.test(senha)
  const requisitos: RequisitoSalvar[] = [
    { chave: 'min8',        ok: tem8,           mensagem: 'No mínimo 8 caracteres' },
    { chave: 'maiuscula',   ok: temMaiuscula,   mensagem: 'Pelo menos 1 letra maiúscula' },
    { chave: 'minuscula',   ok: temMinuscula,   mensagem: 'Pelo menos 1 letra minúscula' },
    { chave: 'numero',      ok: temNumero,      mensagem: 'Pelo menos 1 número' },
    { chave: 'especial',    ok: temEspecial,    mensagem: 'Pelo menos 1 caractere especial' },
  ]
  const forca = (Number(tem8) + Number(temMaiuscula) + Number(temMinuscula) + Number(temNumero) + Number(temEspecial)) as 0 | 1 | 2 | 3 | 4 | 5
  // Squash 5 → 4 (ainda é "muito forte")
  return { forca: (forca > 4 ? 4 : forca) as 0 | 1 | 2 | 3 | 4, requisitos }
}

const CORES_FORCA = ['#475569', '#ef4444', '#f59e0b', '#22c55e', '#34d399']
const LABEL_FORCA = ['', 'Fraca', 'Razoável', 'Forte', 'Muito forte']

export function CadastroContinuarPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoaded, signUp, setActive } = useSignUp()

  const ticket = searchParams.get('__clerk_ticket')
  const status = searchParams.get('__clerk_status')

  // ─── Estado do form ───────────────────────────────────────────────────────
  const [nome, setNome] = useState('')
  const [emailConvite, setEmailConvite] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  // Estado independente: alguns usuários querem ver SÓ uma das senhas
  // (típico em fluxo de cadastro — confirmar senha digitada cegamente).
  const [verConfirmacao, setVerConfirmacao] = useState(false)
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [oauthCarregando, setOauthCarregando] = useState(false)

  // ─── Detecção de fluxo ────────────────────────────────────────────────────
  // Dois caminhos chegam nesta tela:
  //   1) Convite por e-mail — vem com `__clerk_ticket` na URL.
  //   2) OAuth com campos faltando — pós-Google, signUp já existe no Clerk
  //      mas falta `password` (ou outro campo exigido pelo Dashboard). Antes
  //      ia pro Account Portal hospedado (`*.accounts.dev/sign-up/continue`).
  const isInvitation = !!ticket
  const isOAuthMissing = !ticket && isLoaded && signUp?.status === 'missing_requirements'

  // ─── Pré-popula do ticket ────────────────────────────────────────────────
  // O Clerk preenche signUp.emailAddress / firstName / lastName quando o
  // ticket é processado via signUp.create({ strategy: 'ticket', ticket })
  useEffect(() => {
    if (!isLoaded || !signUp || !ticket) return

    void signUp
      .create({ strategy: 'ticket', ticket })
      .then((resultado) => {
        if (resultado.emailAddress) setEmailConvite(resultado.emailAddress)
        const fn = (resultado.firstName ?? '').trim()
        const ln = (resultado.lastName ?? '').trim()
        const completo = [fn, ln].filter(Boolean).join(' ')
        if (completo) setNome(completo)
      })
      .catch((err) => {
        const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
          ?? (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
          ?? (err instanceof Error ? err.message : 'Convite inválido ou expirado.')
        setErro(msg)
      })
  }, [isLoaded, signUp, ticket])

  // ─── Pré-popula do OAuth (Google → missing fields) ────────────────────────
  // Sem ticket, mas o Clerk já tem signUp ativo com email/nome do Google.
  useEffect(() => {
    if (!isOAuthMissing || !signUp) return
    if (signUp.emailAddress) setEmailConvite(signUp.emailAddress)
    const fn = (signUp.firstName ?? '').trim()
    const ln = (signUp.lastName ?? '').trim()
    const completo = [fn, ln].filter(Boolean).join(' ')
    if (completo) setNome(completo)
  }, [isOAuthMissing, signUp])

  // ─── Validações reativas ──────────────────────────────────────────────────
  const { forca, requisitos: requisitosSenha } = useMemo(() => avaliarSenha(senha), [senha])
  const senhasConferem = senha.length > 0 && senha === confirmacao

  const requisitos: RequisitoSalvar[] = [
    { chave: 'nome', ok: nome.trim().length >= 2, mensagem: 'Nome completo (mínimo 2 caracteres)' },
    ...requisitosSenha,
    { chave: 'confirma', ok: senhasConferem, mensagem: 'A confirmação de senha confere' },
    { chave: 'termos',   ok: aceiteTermos,   mensagem: 'Aceite dos Termos de Uso e Política de Privacidade' },
  ]

  const podeEnviar = requisitos.every((r) => r.ok) && !enviando && isLoaded

  // ─── Handlers ─────────────────────────────────────────────────────────────
  async function handleCriarConta(ev: React.FormEvent) {
    ev.preventDefault()
    if (!podeEnviar || !signUp || !setActive) return

    setEnviando(true)
    setErro(null)
    try {
      // Atualiza signUp com nome + senha. emailAddress já veio do ticket.
      const [firstName = '', ...resto] = nome.trim().split(' ')
      const lastName = resto.join(' ')
      const resultado = await signUp.update({
        firstName,
        lastName,
        password: senha,
      })

      if (resultado.status === 'complete' && resultado.createdSessionId) {
        await setActive({ session: resultado.createdSessionId })
        navigate('/hub', { replace: true })
        return
      }

      // Estado intermediário (raro com ticket válido) — força reload no Clerk
      setErro('Não foi possível concluir o cadastro. Tente novamente.')
    } catch (err) {
      const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
        ?? (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : 'Falha ao criar conta. Tente novamente.')
      setErro(msg)
    } finally {
      setEnviando(false)
    }
  }

  async function handleGoogleOAuth() {
    if (!signUp || oauthCarregando) return
    setOauthCarregando(true)
    setErro(null)
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/cadastro/continuar',
        redirectUrlComplete: '/hub',
      })
    } catch (err) {
      const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
        ?? (err instanceof Error ? err.message : 'Falha ao iniciar login Google.')
      setErro(msg)
      setOauthCarregando(false)
    }
  }

  // ─── Estados de erro pré-form (entrada inválida na rota) ──────────────────
  // Só mostramos "convite não encontrado" depois que o Clerk carregou e
  // confirmamos que NÃO é nem convite nem OAuth-missing-fields nem retorno
  // do Clerk (status=sign_up).
  if (isLoaded && !isInvitation && !isOAuthMissing && status !== 'sign_up') {
    return (
      <div className="auth-root">
        <div className="auth-brand">
          <div className="auth-brand-grid" />
          <div className="auth-brand-content">
            <div className="auth-logo">
              <LogoGlobal iconSize={30} iconColor="#818cf8" />
            </div>
          </div>
        </div>
        <div className="auth-divider" />
        <div className="login-global-panel">
          <div className="login-global-header">
            <p className="login-global-title">Convite não encontrado</p>
            <p className="login-global-subtitle">
              O link que você usou está incompleto ou expirou. Solicite um novo convite ao administrador da sua organização.
            </p>
          </div>
          <Link to="/login" style={{ color: '#818cf8', textAlign: 'center', marginTop: '1.5rem', display: 'block' }}>
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-root">

      {/* ── Painel esquerdo — Branding ── */}
      <div className="auth-brand">
        <div className="auth-brand-grid" />
        <div className="auth-brand-content">
          <div className="auth-logo">
            <LogoGlobal iconSize={30} iconColor="#818cf8" />
          </div>

          <h1 className="auth-headline">
            {t('auth.headline', 'O marketplace do')}{' '}
            <span className="auth-headline-accent">
              {t('auth.headline_destaque', 'comércio exterior.')}
            </span>
          </h1>

          <p className="auth-subheadline">
            {t('auth.subheadline')}
          </p>

          <div className="auth-features">
            {[
              { icon: <Atom size={20} weight="duotone" className="auth-feature-icon" />,         title: t('auth.ecossistema_titulo'),       desc: t('auth.ecossistema_desc') },
              { icon: <CursorClick size={20} weight="duotone" className="auth-feature-icon" />, title: t('auth.zero_digitacao_titulo'),    desc: t('auth.zero_digitacao_desc') },
              { icon: <Coins size={20} weight="duotone" className="auth-feature-icon" />,        title: t('auth.gestao_custos_titulo'),     desc: t('auth.gestao_custos_desc') },
              { icon: <ShieldCheck size={20} weight="duotone" className="auth-feature-icon" />,  title: t('auth.padrao_enterprise_titulo'), desc: t('auth.padrao_enterprise_desc') },
            ].map((f, i) => (
              <div key={f.title} className="auth-feature" style={{ '--i': i } as React.CSSProperties}>
                <div className="auth-feature-icon-wrapper">{f.icon}</div>
                <div className="auth-feature-content">
                  <h3 className="auth-feature-title">{f.title}</h3>
                  <p className="auth-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-divider" />

      {/* ── Painel direito — Formulário ── */}
      <div className="login-global-panel">
        <div className="login-global-header">
          <p className="login-global-title">
            {t('cadastro.continuar.titulo', 'Bem-vindo(a) ao Gravity')}
          </p>
          <p className="login-global-subtitle">
            {t('cadastro.continuar.subtitulo', 'Complete seu cadastro para acessar a plataforma.')}
          </p>
        </div>

        {/* Banner contextual — convite ou continuação OAuth.
            Skeleton durante o round-trip ao Clerk (signUp.create com ticket
            leva tempo perceptível — dono reportou em smoke 2026-05-12).
            Mostra placeholder imediato em vez de "nada" durante a espera. */}
        {(isInvitation || isOAuthMissing) && !emailConvite && !erro && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(129,140,248,0.04)', border: '1px solid rgba(129,140,248,0.12)',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              marginBottom: '1.25rem', fontSize: '0.8125rem',
            }}
          >
            <CheckCircle size={18} weight="fill" style={{ color: 'rgba(129,140,248,0.4)', flexShrink: 0 }} />
            <span style={{
              color: 'rgba(199,210,254,0.6)',
              display: 'inline-block',
              background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.04) 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.4s ease-in-out infinite',
              borderRadius: 4,
              padding: '0.125rem 0.5rem',
              minWidth: '14rem',
            }}>
              Carregando dados do convite…
            </span>
            <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
          </div>
        )}
        {emailConvite && (
          <div
            role="note"
            style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              marginBottom: '1.25rem', fontSize: '0.8125rem',
            }}
          >
            <CheckCircle size={18} weight="fill" style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ color: '#c7d2fe' }}>
              {isInvitation ? (
                <>Convite recebido para <strong style={{ color: '#fff' }}>{emailConvite}</strong></>
              ) : (
                <>Quase lá — defina uma senha para <strong style={{ color: '#fff' }}>{emailConvite}</strong></>
              )}
            </span>
          </div>
        )}

        {/* Botão Google OAuth + Divisor
            Decisão dono 2026-05-12 — Opção A: esconder ambos quando o usuário
            vem de um convite Clerk (isInvitation === true). O convite já
            confirmou a identidade via link no e-mail; mostrar "Continuar com
            Google" logo após "Convite recebido para X" gera confusão (usuário
            pensa que precisa re-confirmar via Google). Para o fluxo OAuth
            missing fields (isOAuthMissing) o botão continua visível — embora
            redundante naquele caminho, mantém comportamento original e não é
            o foco do ajuste. */}
        {!isInvitation && (
          <>
            <button
              type="button"
              className="cadastro-google-btn"
              disabled={oauthCarregando || !isLoaded}
              onClick={handleGoogleOAuth}
            >
              {oauthCarregando ? (
                <CircleNotch size={18} weight="bold" className="cadastro-spinner" />
              ) : (
                <GoogleLogo size={18} weight="bold" />
              )}
              <span>{t('cadastro.continuar.google', 'Continuar com Google')}</span>
            </button>

            {/* Divisor */}
            <div className="cadastro-divider">
              <span>{t('cadastro.continuar.ou', 'ou crie com senha')}</span>
            </div>
          </>
        )}

        <form onSubmit={handleCriarConta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Nome completo */}
          <CampoGeralGlobal label={t('cadastro.continuar.label_nome', 'Nome completo')} obrigatorio>
            <div className="ws-input-icon-wrap">
              <UserIcon size={16} />
              <input
                value={nome}
                placeholder="Ex: Ana Paula Silva"
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%' }}
                disabled={enviando}
                autoFocus
                autoComplete="name"
              />
            </div>
          </CampoGeralGlobal>

          {/* E-mail (read-only, vem do convite ou do Google) */}
          <CampoGeralGlobal label={t('cadastro.continuar.label_email', 'E-mail')}>
            <TooltipGlobal descricao={isInvitation ? 'O e-mail veio do convite e não pode ser alterado aqui.' : 'E-mail confirmado pelo Google. Para usar outro, volte ao login e tente de novo.'}>
              <div className="ws-input-icon-wrap">
                <EnvelopeSimple size={16} />
                <input
                  value={emailConvite}
                  disabled
                  style={{ width: '100%', color: 'var(--ws-muted)', cursor: 'not-allowed' }}
                  autoComplete="email"
                />
              </div>
            </TooltipGlobal>
          </CampoGeralGlobal>

          {/* Senha */}
          <CampoGeralGlobal label={t('cadastro.continuar.label_senha', 'Senha')} obrigatorio>
            <div className="ws-input-icon-wrap" style={{ position: 'relative' }}>
              <Lock size={16} />
              <input
                value={senha}
                type={verSenha ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                onChange={(e) => setSenha(e.target.value)}
                style={{ width: '100%', paddingRight: '2.5rem' }}
                disabled={enviando}
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVerSenha((v) => !v)}
                style={{
                  position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer',
                  padding: '0.25rem', display: 'flex', alignItems: 'center',
                }}
              >
                {verSenha ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Barra de força */}
            {senha.length > 0 && (
              <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ flex: 1, height: '4px', borderRadius: '9999px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${forca * 25}%`,
                      height: '100%',
                      background: CORES_FORCA[forca],
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.6875rem', color: CORES_FORCA[forca], fontWeight: 600, minWidth: '70px', textAlign: 'right' }}>
                  {LABEL_FORCA[forca]}
                </span>
              </div>
            )}
          </CampoGeralGlobal>

          {/* Confirmar senha */}
          <CampoGeralGlobal label={t('cadastro.continuar.label_confirmar', 'Confirmar senha')} obrigatorio>
            <div className="ws-input-icon-wrap" style={{ position: 'relative' }}>
              <Lock size={16} />
              <input
                value={confirmacao}
                type={verConfirmacao ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                onChange={(e) => setConfirmacao(e.target.value)}
                style={{ width: '100%', paddingRight: '2.5rem' }}
                disabled={enviando}
                autoComplete="new-password"
              />
              <button
                type="button"
                aria-label={verConfirmacao ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setVerConfirmacao((v) => !v)}
                style={{
                  position: 'absolute', right: '0.625rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'transparent', border: 'none', color: 'var(--ws-muted)', cursor: 'pointer',
                  padding: '0.25rem', display: 'flex', alignItems: 'center',
                }}
              >
                {verConfirmacao ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </CampoGeralGlobal>

          {/* Aceite de termos */}
          <label
            style={{
              display: 'flex', alignItems: 'flex-start', gap: '0.625rem',
              padding: '0.625rem 0.75rem', borderRadius: '8px',
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={aceiteTermos}
              onChange={(e) => setAceiteTermos(e.target.checked)}
              disabled={enviando}
              style={{ marginTop: 2, accentColor: '#818cf8', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--ws-text)', lineHeight: 1.5 }}>
              Li e aceito os{' '}
              <a href="#" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Termos de Uso</a>
              {' '}e a{' '}
              <a href="#" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Política de Privacidade</a>.
            </span>
          </label>

          {/* Banner de requisitos */}
          <BannerRequisitosGlobal requisitos={requisitos} />

          {/* Erro */}
          {erro && (
            <div
              role="alert"
              style={{
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)',
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                fontSize: '0.8125rem', color: '#fca5a5',
              }}
            >
              <WarningCircle size={18} weight="fill" style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{erro}</span>
            </div>
          )}

          {/* Submit */}
          <BotaoGlobal
            type="submit"
            variante="primario"
            blocoCompleto
            centralizado
            disabled={!podeEnviar}
            icone={enviando ? <CircleNotch size={18} weight="bold" className="cadastro-spinner" /> : undefined}
          >
            {enviando ? t('cadastro.continuar.criando', 'Criando conta…') : t('cadastro.continuar.submit', 'Criar conta')}
          </BotaoGlobal>
        </form>

        <div className="login-global-footer">
          <p className="login-footer-main">
            {t('cadastro.continuar.ja_conhece', 'Já tem uma conta?')}{' '}
            <Link to="/login">{t('cadastro.continuar.entrar', 'Entrar')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
