// RecuperarSenhaRedefinirPage.tsx
//
// Tela Gravity-styled de redefinição de senha — recebe o código de 6 dígitos
// enviado por e-mail (estratégia `reset_password_email_code` do Clerk) +
// nova senha + confirmação. Conclui via signIn.attemptFirstFactor e ativa
// a sessão. Reusa `auth.css` e o padrão visual do CadastroContinuarPage.

import { useState, useMemo, useEffect } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Atom, CursorClick, Coins, ShieldCheck,
  EnvelopeSimple, Lock, Eye, EyeSlash, Hash,
  CheckCircle, WarningCircle, CircleNotch, ArrowLeft,
} from '@phosphor-icons/react'
import { LogoGlobal } from '@nucleo/logo-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import '../../../../nucleo-global/Login/login-global/src/login-global.css'
import './auth.css'

interface RequisitoSenha { chave: string; ok: boolean; mensagem: string }

function avaliarSenha(senha: string): {
  forca: 0 | 1 | 2 | 3 | 4
  requisitos: RequisitoSenha[]
} {
  const tem8 = senha.length >= 8
  const temMaiuscula = /[A-Z]/.test(senha)
  const temMinuscula = /[a-z]/.test(senha)
  const temNumero = /\d/.test(senha)
  const temEspecial = /[^A-Za-z0-9]/.test(senha)
  const requisitos: RequisitoSenha[] = [
    { chave: 'min8',        ok: tem8,           mensagem: 'No mínimo 8 caracteres' },
    { chave: 'maiuscula',   ok: temMaiuscula,   mensagem: 'Pelo menos 1 letra maiúscula' },
    { chave: 'minuscula',   ok: temMinuscula,   mensagem: 'Pelo menos 1 letra minúscula' },
    { chave: 'numero',      ok: temNumero,      mensagem: 'Pelo menos 1 número' },
    { chave: 'especial',    ok: temEspecial,    mensagem: 'Pelo menos 1 caractere especial' },
  ]
  const totalOk = Number(tem8) + Number(temMaiuscula) + Number(temMinuscula) + Number(temNumero) + Number(temEspecial)
  const forca = (totalOk > 4 ? 4 : totalOk) as 0 | 1 | 2 | 3 | 4
  return { forca, requisitos }
}

const CORES_FORCA = ['#475569', '#f87171', '#fbbf24', '#60a5fa', '#34d399'] as const
const LABEL_FORCA = ['—', 'Fraca', 'Média', 'Boa', 'Muito forte'] as const

export function RecuperarSenhaRedefinirPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoaded, signIn, setActive } = useSignIn()

  const emailParam = searchParams.get('email') ?? ''

  const [codigo, setCodigo] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirmacao, setVerConfirmacao] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [reenviado, setReenviado] = useState(false)

  // Pré-popula o campo "verificando código de" com o e-mail vindo da etapa anterior
  // (passado via query param). Se o usuário entrou direto nesta rota sem passar
  // por /recuperar-senha, o estado `signIn` ainda pode ter o identifier dele.
  const emailExibicao = emailParam || signIn?.identifier || ''

  // Se o signIn não está mais ativo (ex: usuário recarregou a página depois de
  // muito tempo), volta pra etapa de envio.
  useEffect(() => {
    if (!isLoaded) return
    if (!signIn || signIn.status === null) {
      // Nenhum fluxo de reset em andamento — orienta o usuário a recomeçar
      setErro('Sessão de redefinição expirada. Solicite um novo código.')
    }
  }, [isLoaded, signIn])

  const { forca, requisitos: requisitosSenha } = useMemo(() => avaliarSenha(senha), [senha])
  const senhasConferem = senha.length > 0 && senha === confirmacao
  const codigoValido = /^\d{6}$/.test(codigo)

  const requisitos: RequisitoSenha[] = [
    { chave: 'codigo', ok: codigoValido, mensagem: 'Código de 6 dígitos preenchido' },
    ...requisitosSenha,
    { chave: 'confirma', ok: senhasConferem, mensagem: 'A confirmação de senha confere' },
  ]

  const podeEnviar = requisitos.every((r) => r.ok) && !enviando && isLoaded && !!signIn

  async function handleRedefinir(ev: React.FormEvent) {
    ev.preventDefault()
    if (!podeEnviar || !signIn || !setActive) return

    setEnviando(true)
    setErro(null)
    try {
      const resultado = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: codigo,
        password: senha,
      })

      if (resultado.status === 'complete' && resultado.createdSessionId) {
        await setActive({ session: resultado.createdSessionId })
        navigate('/hub', { replace: true })
        return
      }

      if (resultado.status === 'needs_second_factor') {
        // 2FA habilitado — Clerk exige passo adicional. Por ora não tratamos.
        setErro('Sua conta exige verificação em duas etapas. Esse fluxo ainda não está disponível por aqui — entre em contato com o suporte.')
        return
      }

      setErro('Não foi possível redefinir a senha. Tente novamente.')
    } catch (err) {
      const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
        ?? (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
        ?? (err instanceof Error ? err.message : 'Falha ao redefinir senha. Tente novamente.')
      setErro(msg)
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviarCodigo() {
    if (!signIn || !emailExibicao) return
    setErro(null)
    setReenviado(false)
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailExibicao,
      })
      setReenviado(true)
    } catch (err) {
      const msg = (err as { errors?: Array<{ longMessage?: string; message?: string }> })?.errors?.[0]?.longMessage
        ?? (err as { errors?: Array<{ message?: string }> })?.errors?.[0]?.message
        ?? 'Falha ao reenviar o código.'
      setErro(msg)
    }
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
            {t('recuperar.redefinir.titulo', 'Redefinir senha')}
          </p>
          <p className="login-global-subtitle">
            {t('recuperar.redefinir.subtitulo', 'Informe o código que enviamos por e-mail e crie uma nova senha.')}
          </p>
        </div>

        {/* Banner com o e-mail destinatário */}
        {emailExibicao && (
          <div
            role="note"
            style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              marginBottom: '1.25rem', fontSize: '0.8125rem',
            }}
          >
            <EnvelopeSimple size={18} weight="fill" style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ color: '#c7d2fe' }}>
              Código enviado para <strong style={{ color: '#fff' }}>{emailExibicao}</strong>
            </span>
          </div>
        )}

        {reenviado && (
          <div
            role="status"
            style={{
              padding: '0.625rem 1rem', borderRadius: '8px',
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1rem', fontSize: '0.8125rem', color: '#86efac',
            }}
          >
            <CheckCircle size={16} weight="fill" />
            <span>Novo código enviado.</span>
          </div>
        )}

        <form onSubmit={handleRedefinir} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Código de 6 dígitos */}
          <div className="signup-field">
            <label htmlFor="redefinir-codigo">{t('recuperar.redefinir.label_codigo', 'Código de 6 dígitos')}</label>
            <div className="signup-input-wrapper">
              <input
                id="redefinir-codigo"
                value={codigo}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                disabled={enviando}
                autoFocus
                autoComplete="one-time-code"
              />
            </div>
          </div>

          {/* Nova senha */}
          <div className="signup-field">
            <label htmlFor="redefinir-senha">{t('recuperar.redefinir.label_nova_senha', 'Nova senha')}</label>
            <div className="signup-input-wrapper signup-input-wrapper--senha">
              <input
                id="redefinir-senha"
                value={senha}
                type={verSenha ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                onChange={(e) => setSenha(e.target.value)}
                disabled={enviando}
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

          {/* Confirmação */}
          <div className="signup-field">
            <label htmlFor="redefinir-confirmacao">{t('recuperar.redefinir.label_confirmar', 'Confirmar nova senha')}</label>
            <div className="signup-input-wrapper signup-input-wrapper--senha">
              <input
                id="redefinir-confirmacao"
                value={confirmacao}
                type={verConfirmacao ? 'text' : 'password'}
                placeholder="Digite a senha novamente"
                onChange={(e) => setConfirmacao(e.target.value)}
                disabled={enviando}
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
          </div>

          {/* Checklist de requisitos */}
          <div className="signup-requisitos">
            {requisitos.map((r) => (
              <div key={r.chave} className={`signup-requisito ${r.ok ? 'signup-requisito--ok' : 'signup-requisito--pendente'}`}>
                {r.ok ? <CheckCircle size={14} weight="fill" /> : <span className="signup-requisito-bullet">○</span>}
                <span>{r.mensagem}</span>
              </div>
            ))}
          </div>

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

          <BotaoGlobal
            type="submit"
            variante="primario"
            blocoCompleto
            centralizado
            disabled={!podeEnviar}
            icone={enviando ? <CircleNotch size={18} weight="bold" className="cadastro-spinner" /> : undefined}
          >
            {enviando ? 'Redefinindo…' : 'Redefinir senha'}
          </BotaoGlobal>
        </form>

        <div className="login-global-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <TooltipGlobal descricao="Reenviar código para o mesmo e-mail.">
            <button
              type="button"
              onClick={handleReenviarCodigo}
              disabled={!emailExibicao || enviando}
              style={{
                background: 'transparent', border: 'none', color: '#818cf8', fontWeight: 600,
                fontSize: '0.8125rem', cursor: emailExibicao ? 'pointer' : 'not-allowed', padding: 0,
                width: '100%', textAlign: 'center',
              }}
            >
              Não recebi — reenviar código
            </button>
          </TooltipGlobal>
          <Link className="forgot-back-link" to="/login" style={{ marginTop: '0.5rem' }}>
            <ArrowLeft size={16} />
            {t('login.voltar_login', 'Voltar para o login')}
          </Link>
        </div>
      </div>
    </div>
  )
}
