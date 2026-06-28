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

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useSignUp, useSignIn, useAuth } from '@clerk/clerk-react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { navegarDestinoPosAutenticacao } from '../routing/navegar-destino-pos-autenticacao.js'
import {
  CHAVE_ATIVANDO_SESSAO_CONVITE,
  gravarLoginPendenteConvite,
  limparLoginPendenteConvite,
} from '../auth/clerk-sessao-convite'
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
import './auth.css'

// ─── Helpers de validação ────────────────────────────────────────────────────
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
  const forca = (Number(tem8) + Number(temMaiuscula) + Number(temMinuscula) + Number(temNumero) + Number(temEspecial)) as 0 | 1 | 2 | 3 | 4 | 5
  // Squash 5 → 4 (ainda é "muito forte")
  return { forca: (forca > 4 ? 4 : forca) as 0 | 1 | 2 | 3 | 4, requisitos }
}

const CORES_FORCA = ['#475569', '#ef4444', '#f59e0b', '#22c55e', '#34d399']
const LABEL_FORCA = ['', 'Fraca', 'Razoável', 'Forte', 'Muito forte']

/** Dados mínimos do signUp Clerk usados para pré-popular o formulário. */
interface SignUpDadosConvite {
  emailAddress?: string | null
  firstName?: string | null
  lastName?: string | null
}

type SignUpClerk = NonNullable<ReturnType<typeof useSignUp>['signUp']>

/** Cache ≠ signUp ativo — só considera pronto após create(ticket) ou sessão Clerk válida. */
function signUpProntoParaConvite(ticket: string, signUp: SignUpClerk | null | undefined): boolean {
  if (!signUp) return false
  if (ticketsConviteComSucesso.has(ticket)) return true
  const { email } = normalizarDadosConvite(signUp)
  if (!email) return false
  const status = signUp.status
  if (status === 'missing_requirements' || status === 'complete') return true
  const comSessaoClerk = Boolean(
    (signUp as SignUpClerk & { id?: string | null }).id
    || signUp.createdSessionId,
  )
  return comSessaoClerk
}

/**
 * Tickets Clerk são single-use. Problemas que queimavam o ticket antes do cadastro:
 * 1) React StrictMode (dev) remonta o componente
 * 2) signUp muda de referência → useEffect reexecutava signUp.create (prod, smoke 2026-05-27)
 * 3) Prefetch de links (Gmail) carregava a página e consumia o ticket no auto-create
 */
const promessasTicketConvite = new Map<string, Promise<SignUpDadosConvite>>()
const ticketsConviteComSucesso = new Set<string>()
const ticketsConviteInvalidos = new Set<string>()
/** Lock síncrono — state React não impede double-call antes do re-render. */
const ticketsConviteEmProcessamento = new Set<string>()

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizarDadosConvite(dados: SignUpDadosConvite): { email: string; nome: string } {
  let email = (dados.emailAddress ?? '').trim()
  let fn = (dados.firstName ?? '').trim()
  const ln = (dados.lastName ?? '').trim()

  // Clerk às vezes devolve o e-mail do convite em firstName, não em emailAddress.
  if (!email && REGEX_EMAIL.test(fn)) {
    email = fn
    fn = ''
  }

  return { email, nome: [fn, ln].filter(Boolean).join(' ') }
}

function chaveCacheConvite(ticket: string): string {
  return `gravity:convite:${ticket.slice(0, 64)}`
}

function lerCacheConvite(ticket: string): { email: string; nome: string } | null {
  try {
    const raw = sessionStorage.getItem(chaveCacheConvite(ticket))
    if (!raw) return null
    const parsed = JSON.parse(raw) as { email?: string; nome?: string }
    if (!parsed.email) return null
    return { email: parsed.email, nome: parsed.nome ?? '' }
  } catch {
    return null
  }
}

function gravarCacheConvite(ticket: string, email: string, nome: string): void {
  try {
    sessionStorage.setItem(chaveCacheConvite(ticket), JSON.stringify({ email, nome }))
  } catch {
    /* quota / modo privado — não bloqueia o fluxo */
  }
}

function limparCacheConvite(ticket: string): void {
  try {
    sessionStorage.removeItem(chaveCacheConvite(ticket))
  } catch {
    /* noop */
  }
}

function ticketRevogado(err: unknown): boolean {
  const erroClerk = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> }
  const codigo = erroClerk?.errors?.[0]?.code
  const msgOriginal = erroClerk?.errors?.[0]?.longMessage
    ?? erroClerk?.errors?.[0]?.message
    ?? (err instanceof Error ? err.message : '')
  return (
    codigo === 'invitation_revoked'
    || msgOriginal.toLowerCase().includes('invitation was revoked')
    || msgOriginal.toLowerCase().includes('invitation revoked')
  )
}

function ticketInvalido(err: unknown): boolean {
  const erroClerk = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> }
  const codigo = erroClerk?.errors?.[0]?.code
  const msgOriginal = erroClerk?.errors?.[0]?.longMessage
    ?? erroClerk?.errors?.[0]?.message
    ?? (err instanceof Error ? err.message : '')
  return (
    ticketRevogado(err)
    || codigo === 'form_param_nil'
    || msgOriginal.toLowerCase().includes('ticket is invalid')
  )
}

function preencherFormularioDoConvite(
  dados: SignUpDadosConvite,
  setEmailConvite: (v: string) => void,
  setNome: (v: string) => void,
) {
  const { email, nome } = normalizarDadosConvite(dados)
  if (email) setEmailConvite(email)
  if (nome) setNome(nome)
}

function mesclarDadosSignUp(
  resultado: SignUpDadosConvite,
  signUpAtual: SignUpDadosConvite | null | undefined,
): SignUpDadosConvite {
  return {
    emailAddress: resultado.emailAddress ?? signUpAtual?.emailAddress,
    firstName: resultado.firstName ?? signUpAtual?.firstName,
    lastName: resultado.lastName ?? signUpAtual?.lastName,
  }
}

function conviteJaProcessadoComDados(ticket: string, signUpAtual: SignUpClerk | null | undefined): boolean {
  return signUpProntoParaConvite(ticket, signUpAtual)
}

function processarTicketConvite(
  signUp: SignUpClerk,
  ticket: string,
): Promise<SignUpDadosConvite> {
  if (ticketsConviteInvalidos.has(ticket)) {
    return Promise.reject(new Error('ticket is invalid'))
  }

  const emCache = promessasTicketConvite.get(ticket)
  if (emCache) return emCache

  if (signUpProntoParaConvite(ticket, signUp)) {
    const resolvida = Promise.resolve(mesclarDadosSignUp(signUp, signUp))
    promessasTicketConvite.set(ticket, resolvida)
    ticketsConviteComSucesso.add(ticket)
    const { email, nome } = normalizarDadosConvite(signUp)
    if (email) gravarCacheConvite(ticket, email, nome)
    return resolvida
  }

  if (ticketsConviteEmProcessamento.has(ticket)) {
    return promessasTicketConvite.get(ticket) ?? Promise.reject(new Error('ticket is processing'))
  }

  ticketsConviteEmProcessamento.add(ticket)
  const promessa = signUp
    .create({ strategy: 'ticket', ticket })
    .then((resultado) => {
      ticketsConviteComSucesso.add(ticket)
      const merged = mesclarDadosSignUp(resultado, signUp)
      const { email, nome } = normalizarDadosConvite(merged)
      if (email) gravarCacheConvite(ticket, email, nome)
      return merged
    })
    .catch((err: unknown) => {
      if (ticketInvalido(err)) {
        ticketsConviteInvalidos.add(ticket)
        limparCacheConvite(ticket)
      } else {
        promessasTicketConvite.delete(ticket)
      }
      throw err
    })
    .finally(() => {
      ticketsConviteEmProcessamento.delete(ticket)
    })

  promessasTicketConvite.set(ticket, promessa)
  return promessa
}

function traduzirErroTicket(err: unknown): string {
  const erroClerk = err as { errors?: Array<{ code?: string; longMessage?: string; message?: string }> }
  const codigo = erroClerk?.errors?.[0]?.code
  const msgOriginal = erroClerk?.errors?.[0]?.longMessage
    ?? erroClerk?.errors?.[0]?.message
    ?? (err instanceof Error ? err.message : '')

  if (codigo === 'form_param_nil' || msgOriginal.toLowerCase().includes('ticket is invalid')) {
    return 'O convite é inválido ou já foi utilizado. Solicite um novo convite ao administrador.'
  }
  if (ticketRevogado(err)) {
    return 'Este convite foi cancelado ou substituído por um mais recente. Peça ao administrador para reenviar o convite e use o link do e-mail mais novo.'
  }
  if (
    codigo === 'authorization_invalid'
    || msgOriginal.toLowerCase().includes('sign up is forbidden')
  ) {
    return 'Não foi possível concluir o cadastro com este convite. Abra novamente o link do e-mail (completo, com o ticket) ou solicite um novo convite.'
  }
  if (codigo === 'form_identifier_not_found') {
    return 'Conta não encontrada. Verifique se o link do convite está correto.'
  }
  return msgOriginal || 'Convite inválido ou expirado.'
}

type ResultadoSignUpClerk = {
  status: string
  createdSessionId?: string | null
  missingFields?: string[]
  unverifiedFields?: string[]
}

interface CredenciaisPosCadastro {
  email: string
  senha: string
}

function camposPendentesSignUp(signUpAtual: SignUpClerk | null | undefined): {
  missingFields: string[]
  unverifiedFields: string[]
} {
  if (!signUpAtual) return { missingFields: [], unverifiedFields: [] }
  const s = signUpAtual as SignUpClerk & { missingFields?: string[]; unverifiedFields?: string[] }
  return {
    missingFields: s.missingFields ?? [],
    unverifiedFields: s.unverifiedFields ?? [],
  }
}

function mensagemStatusSignUpIncompleto(signUpAtual: SignUpClerk | null | undefined): string {
  const { missingFields, unverifiedFields } = camposPendentesSignUp(signUpAtual)
  if (unverifiedFields.includes('email_address')) {
    return 'Confirme o código enviado para o seu e-mail para concluir o cadastro.'
  }
  if (missingFields.includes('legal_accepted')) {
    return 'Aceite os Termos de Uso e a Política de Privacidade para continuar.'
  }
  if (missingFields.length > 0) {
    console.error('[CadastroContinuar] signUp missing_requirements', { missingFields, unverifiedFields })
  }
  return 'Não foi possível concluir o cadastro. Tente novamente.'
}

export function CadastroContinuarPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isLoaded: isSignInLoaded, signIn, setActive: setActiveSignIn } = useSignIn()
  const { getToken, userId } = useAuth()

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
  const [processandoTicket, setProcessandoTicket] = useState(false)
  const [etapaCadastro, setEtapaCadastro] = useState<'formulario' | 'verificacao_email'>('formulario')
  const [codigoVerificacao, setCodigoVerificacao] = useState('')

  const signUpRef = useRef(signUp)
  signUpRef.current = signUp
  const processamentoTicketRef = useRef<string | null>(null)

  const aplicarDadosConvite = useCallback((dados: SignUpDadosConvite, ticketAtual?: string) => {
    preencherFormularioDoConvite(dados, setEmailConvite, setNome)
    const { email, nome } = normalizarDadosConvite(dados)
    if (ticketAtual && email) {
      gravarCacheConvite(ticketAtual, email, nome)
    }
    setErro(null)
  }, [])

  const executarProcessamentoTicket = useCallback(async (ticketAtual: string) => {
    const signUpAtual = signUpRef.current
    if (!signUpAtual) return

    if (conviteJaProcessadoComDados(ticketAtual, signUpAtual)) {
      const cache = lerCacheConvite(ticketAtual)
      if (cache) {
        setEmailConvite(cache.email)
        if (cache.nome) setNome(cache.nome)
      } else {
        aplicarDadosConvite(mesclarDadosSignUp(signUpAtual, signUpAtual), ticketAtual)
      }
      setErro(null)
      return
    }

    if (processamentoTicketRef.current === ticketAtual) return

    processamentoTicketRef.current = ticketAtual
    setProcessandoTicket(true)
    setErro(null)
    try {
      const resultado = await processarTicketConvite(signUpAtual, ticketAtual)
      aplicarDadosConvite(mesclarDadosSignUp(resultado, signUpRef.current), ticketAtual)
    } catch (err) {
      const signUpPosFalha = signUpRef.current
      if (conviteJaProcessadoComDados(ticketAtual, signUpPosFalha)) {
        aplicarDadosConvite(mesclarDadosSignUp(signUpPosFalha ?? {}, signUpPosFalha), ticketAtual)
        return
      }
      console.error('[CadastroContinuar] Erro ao processar ticket', {
        ticket: ticketAtual,
        err,
        errors: (err as { errors?: unknown })?.errors,
      })
      setErro(traduzirErroTicket(err))
    } finally {
      if (processamentoTicketRef.current === ticketAtual) {
        processamentoTicketRef.current = null
      }
      setProcessandoTicket(false)
      const signUpPos = signUpRef.current
      if (
        signUpPos
        && !signUpProntoParaConvite(ticketAtual, signUpPos)
        && !ticketsConviteInvalidos.has(ticketAtual)
      ) {
        setErro((prev) => prev ?? 'Não foi possível validar o convite. Recarregue a página ou peça um reenvio ao administrador.')
      }
    }
  }, [aplicarDadosConvite])

  // ─── Detecção de fluxo ────────────────────────────────────────────────────
  // Dois caminhos chegam nesta tela:
  //   1) Convite por e-mail — vem com `__clerk_ticket` na URL.
  //   2) OAuth com campos faltando — pós-Google, signUp já existe no Clerk
  //      mas falta `password` (ou outro campo exigido pelo Dashboard). Antes
  //      ia pro Account Portal hospedado (`*.accounts.dev/sign-up/continue`).
  const isInvitation = !!ticket
  const isOAuthMissing = !ticket && isLoaded && signUp?.status === 'missing_requirements'

  // ─── Pré-popula do ticket ────────────────────────────────────────────────
  // signUp.create uma vez no mount (dedup via Map + lock síncrono).
  useEffect(() => {
    if (!isLoaded || !ticket || !signUp) return

    if (ticketsConviteInvalidos.has(ticket)) {
      setErro(traduzirErroTicket(new Error('ticket is invalid')))
      return
    }

    const cache = lerCacheConvite(ticket)
    if (cache) {
      setEmailConvite(cache.email)
      if (cache.nome) setNome(cache.nome)
    }

    if (conviteJaProcessadoComDados(ticket, signUpRef.current)) {
      aplicarDadosConvite(mesclarDadosSignUp(signUpRef.current ?? {}, signUpRef.current), ticket)
      return
    }

    void executarProcessamentoTicket(ticket)
  }, [isLoaded, ticket, signUp, aplicarDadosConvite, executarProcessamentoTicket])

  // Autofill do browser às vezes joga o e-mail do convite no campo Nome.
  useEffect(() => {
    if (!isInvitation || emailConvite) return
    const candidato = nome.trim()
    if (REGEX_EMAIL.test(candidato)) {
      setEmailConvite(candidato)
      setNome('')
    }
  }, [isInvitation, emailConvite, nome])

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

  const requisitos: RequisitoSenha[] = [
    {
      chave: 'nome',
      ok: nome.trim().length >= 2 && !REGEX_EMAIL.test(nome.trim()),
      mensagem: 'Nome completo (mínimo 2 caracteres)',
    },
    ...requisitosSenha,
    { chave: 'confirma', ok: senhasConferem, mensagem: 'A confirmação de senha confere' },
    { chave: 'termos',   ok: aceiteTermos,   mensagem: 'Aceite dos Termos de Uso e Política de Privacidade' },
  ]

  const conviteValidado = !isInvitation || (
    !!ticket && !!signUp && signUpProntoParaConvite(ticket, signUp)
  )

  const podeEnviar = requisitos.every((r) => r.ok) && !enviando && isLoaded
    && !processandoTicket && conviteValidado

  // Clerk Captcha pode concluir o signUp sem disparar onSubmit — guardar credenciais cedo.
  useEffect(() => {
    if (!podeEnviar || etapaCadastro !== 'formulario') return
    const email = emailConvite.trim()
      || normalizarDadosConvite(signUpRef.current ?? {}).email
      || (signUpRef.current?.emailAddress ?? '').trim()
    if (!email || !senha) return
    gravarLoginPendenteConvite({ email, senha })
  }, [podeEnviar, etapaCadastro, emailConvite, senha])

  // ─── Handlers ─────────────────────────────────────────────────────────────
  async function irPosCadastroConvite(): Promise<void> {
    await navegarDestinoPosAutenticacao({ getToken, navigate, userId })
  }

  async function ativarSessaoCadastro(
    resultado: ResultadoSignUpClerk,
    credenciais?: CredenciaisPosCadastro,
  ): Promise<boolean> {
    if (!setActive) return false

    const sessionIdSignUp =
      resultado.createdSessionId ?? signUpRef.current?.createdSessionId ?? null

    if (resultado.status === 'complete' && sessionIdSignUp) {
      limparLoginPendenteConvite()
      await setActive({ session: sessionIdSignUp })
      await irPosCadastroConvite()
      return true
    }

    const signUpAtual = signUpRef.current
    if (resultado.status === 'complete' && signUpAtual) {
      try {
        await signUpAtual.reload()
        const sessionPosReload = signUpAtual.createdSessionId
        if (sessionPosReload) {
          limparLoginPendenteConvite()
          await setActive({ session: sessionPosReload })
          await irPosCadastroConvite()
          return true
        }
      } catch (err) {
        console.warn('[CadastroContinuar] signUp.reload após complete', err)
      }
    }

    if (
      resultado.status !== 'complete'
      || !credenciais?.email
      || !credenciais.senha
      || !signIn
    ) {
      return false
    }

    try {
      let login = await signIn.create({ transfer: true })

      if (login.status !== 'complete') {
        login = await signIn.create({
          identifier: credenciais.email,
          password: credenciais.senha,
        })
      }

      if (login.status === 'complete' && signIn.createdSessionId) {
        limparLoginPendenteConvite()
        const ativar = setActiveSignIn ?? setActive
        await ativar({ session: signIn.createdSessionId })
        await irPosCadastroConvite()
        return true
      }

      if (login.status === 'needs_second_factor') {
        setErro(
          'Sua conta exige verificação em duas etapas. Entre em contato com o suporte.',
        )
        return false
      }

      console.error('[CadastroContinuar] signIn pós-cadastro incompleto', {
        status: login.status,
      })
    } catch (err) {
      const erroClerk = err as { errors?: Array<{ code?: string; message?: string }> }
      console.error('[CadastroContinuar] Falha no signIn automático pós-cadastro', {
        code: erroClerk?.errors?.[0]?.code,
        message: erroClerk?.errors?.[0]?.message,
        err,
      })
    }

    return false
  }

  async function concluirSignUpComVerificacaoSeNecessario(
    resultado: ResultadoSignUpClerk,
    signUpAtual: SignUpClerk,
    credenciais: CredenciaisPosCadastro,
  ): Promise<boolean> {
    if (await ativarSessaoCadastro(resultado, credenciais)) return true

    const { unverifiedFields } = camposPendentesSignUp(signUpAtual)
    if (resultado.status === 'missing_requirements' && unverifiedFields.includes('email_address')) {
      await signUpAtual.prepareEmailAddressVerification({ strategy: 'email_code' })
      setEtapaCadastro('verificacao_email')
      setErro(null)
      return true
    }

    console.error('[CadastroContinuar] signUp incompleto após update', {
      status: resultado.status,
      ...camposPendentesSignUp(signUpAtual),
    })
    setErro(mensagemStatusSignUpIncompleto(signUpAtual))
    return false
  }

  async function handleCriarConta(ev: React.FormEvent) {
    ev.preventDefault()
    if (!podeEnviar || !signUp || !setActive) return

    const emailCadastroInicial = emailConvite.trim()
      || normalizarDadosConvite(signUp).email
      || (signUp.emailAddress ?? '').trim()
    if (emailCadastroInicial && senha) {
      gravarLoginPendenteConvite({ email: emailCadastroInicial, senha })
    }

    if (isInvitation && ticket) {
      await executarProcessamentoTicket(ticket)
      const signUpPosTicket = signUpRef.current
      const cachePosProcesso = lerCacheConvite(ticket)
      const emailPosProcesso = emailCadastroInicial
        || cachePosProcesso?.email
        || normalizarDadosConvite(signUpPosTicket ?? {}).email
      if (!emailPosProcesso) {
        setErro('Não foi possível validar o convite. Abra novamente o link do e-mail ou solicite um novo convite.')
        return
      }
      if (!signUpPosTicket) {
        setErro('Não foi possível iniciar o cadastro com este convite. Solicite um novo convite ao administrador.')
        return
      }
      if (
        signUpPosTicket.status !== 'missing_requirements'
        && signUpPosTicket.status !== 'complete'
      ) {
        setErro(
          'O convite ainda não foi validado pelo Clerk. Aguarde alguns segundos e tente novamente, ou solicite um novo convite.',
        )
        return
      }
    }

    setEnviando(true)
    setErro(null)
    sessionStorage.setItem(CHAVE_ATIVANDO_SESSAO_CONVITE, '1')
    try {
      const nomeParaCadastro = REGEX_EMAIL.test(nome.trim())
        ? ''
        : nome.trim()
      const [firstName = '', ...resto] = nomeParaCadastro.split(' ')
      const lastName = resto.join(' ')
      const emailCadastro = emailCadastroInicial

      const resultado = await signUp.update({
        firstName,
        lastName,
        password: senha,
        legalAccepted: aceiteTermos,
      }) as ResultadoSignUpClerk

      await concluirSignUpComVerificacaoSeNecessario(
        resultado,
        signUp,
        { email: emailCadastro, senha },
      )
    } catch (err) {
      setErro(traduzirErroTicket(err))
    } finally {
      sessionStorage.removeItem(CHAVE_ATIVANDO_SESSAO_CONVITE)
      setEnviando(false)
    }
  }

  async function handleVerificarCodigoEmail(ev: React.FormEvent) {
    ev.preventDefault()
    if (!signUp || !setActive || !codigoVerificacao.trim()) return

    setEnviando(true)
    setErro(null)
    try {
      const resultado = await signUp.attemptEmailAddressVerification({
        code: codigoVerificacao.trim(),
      }) as ResultadoSignUpClerk

      const emailCadastro = emailConvite.trim()
        || normalizarDadosConvite(signUp).email
        || (signUp.emailAddress ?? '').trim()

      if (!(await ativarSessaoCadastro(resultado, { email: emailCadastro, senha }))) {
        setErro(mensagemStatusSignUpIncompleto(signUp))
      }
    } catch (err) {
      const erroClerk = err as { errors?: Array<{ longMessage?: string; message?: string }> }
      setErro(
        erroClerk?.errors?.[0]?.longMessage
          ?? erroClerk?.errors?.[0]?.message
          ?? 'Código inválido. Verifique o e-mail e tente novamente.',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function handleReenviarCodigoEmail() {
    if (!signUp) return
    setErro(null)
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    } catch (err) {
      console.error('[CadastroContinuar] Falha ao reenviar código', err)
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
      <div className="auth-root auth-root--cadastro">
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
    <div className="auth-root auth-root--cadastro">

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

        {processandoTicket && (
          <div
            role="status"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: 'rgba(129,140,248,0.08)',
              border: '1px solid rgba(129,140,248,0.2)',
              fontSize: '0.8125rem',
              color: '#c7d2fe',
            }}
          >
            <CircleNotch size={16} weight="bold" className="cadastro-spinner" />
            Validando convite…
          </div>
        )}

        {isInvitation && isLoaded && !processandoTicket && conviteValidado && (
          <div
            role="status"
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.25)',
              fontSize: '0.8125rem',
              color: '#86efac',
            }}
          >
            Convite validado para <strong style={{ color: '#fff' }}>{emailConvite}</strong>.
            Defina sua senha para concluir.
          </div>
        )}

        {isInvitation && isLoaded && !processandoTicket && !conviteValidado && !erro && (
          <div
            role="alert"
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)',
              fontSize: '0.8125rem',
              color: '#fca5a5',
            }}
          >
            Aguardando validação do convite… Se nada mudar em alguns segundos, recarregue a página ou peça reenvio do convite.
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

        <form onSubmit={etapaCadastro === 'verificacao_email' ? handleVerificarCodigoEmail : handleCriarConta} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {etapaCadastro === 'verificacao_email' ? (
            <>
              <div
                role="note"
                style={{
                  padding: '0.75rem 1rem', borderRadius: '10px',
                  background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                  fontSize: '0.8125rem', color: '#c7d2fe', lineHeight: 1.5,
                }}
              >
                Enviamos um código para <strong style={{ color: '#fff' }}>{emailConvite}</strong>.
                Digite abaixo para concluir o cadastro.
              </div>
              <CampoGeralGlobal label="Código de verificação" obrigatorio>
                <input
                  value={codigoVerificacao}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="000000"
                  onChange={(e) => setCodigoVerificacao(e.target.value)}
                  style={{ width: '100%' }}
                  disabled={enviando}
                  autoFocus
                />
              </CampoGeralGlobal>
              <button
                type="button"
                onClick={() => { void handleReenviarCodigoEmail() }}
                style={{
                  background: 'transparent', border: 'none', color: '#818cf8',
                  fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left', padding: 0,
                }}
              >
                Reenviar código
              </button>
            </>
          ) : (
            <>
          {/* Nome completo */}
          <CampoGeralGlobal label={t('cadastro.continuar.label_nome', 'Nome completo')} obrigatorio>
            <div className="ws-input-icon-wrap">
              <UserIcon size={16} />
              <input
                value={nome}
                placeholder="Ex: Ana Paula Silva"
                onChange={(e) => setNome(e.target.value)}
                style={{ width: '100%' }}
                disabled={enviando || processandoTicket}
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
                disabled={enviando || processandoTicket}
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
                disabled={enviando || processandoTicket}
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
              disabled={enviando || processandoTicket}
              style={{ marginTop: 2, accentColor: '#818cf8', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.8125rem', color: 'var(--ws-text)', lineHeight: 1.5 }}>
              Li e aceito os{' '}
              <a href="/termos-de-uso" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Termos de Uso</a>
              {' '}e a{' '}
              <a href="/politica-de-privacidade" target="_blank" rel="noreferrer" style={{ color: '#818cf8' }}>Política de Privacidade</a>.
            </span>
          </label>

          {/* Clerk CAPTCHA — exigido em algumas instâncias dev/prod */}
          <div id="clerk-captcha" />

          {/* Checklist de requisitos — visível no convite para deixar claro o que falta */}
          {(senha.length > 0 || isInvitation) && (
            <div className="signup-requisitos">
              {requisitos.map((r) => (
                <div key={r.chave} className={`signup-requisito ${r.ok ? 'signup-requisito--ok' : 'signup-requisito--pendente'}`}>
                  {r.ok ? <CheckCircle size={14} weight="fill" /> : <span className="signup-requisito-bullet">○</span>}
                  <span>{r.mensagem}</span>
                </div>
              ))}
            </div>
          )}
            </>
          )}

          {/* Erro — comum às duas etapas */}
          {erro && !processandoTicket && (
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
            disabled={etapaCadastro === 'verificacao_email' ? enviando || !codigoVerificacao.trim() : !podeEnviar}
            carregando={enviando || processandoTicket}
          >
            {enviando
              ? t('cadastro.continuar.criando', 'Criando conta…')
              : processandoTicket
                ? 'Validando convite…'
                : etapaCadastro === 'verificacao_email'
                  ? 'Verificar e entrar'
                  : t('cadastro.continuar.submit', 'Criar conta')}
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
