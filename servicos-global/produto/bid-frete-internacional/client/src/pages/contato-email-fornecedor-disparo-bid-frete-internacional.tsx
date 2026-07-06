/**
 * Contatos de e-mail no disparo — popover compacto ou painel expandido (padrão lista).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  EnvelopeSimple,
  Plus,
  CheckCircle,
  WarningCircle,
  PencilSimple,
  Trash,
} from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import {
  adicionarEmailFornecedorCadastros,
  buscarFornecedorCadastrosContatos,
  editarEmailFornecedorCadastros,
  excluirEmailFornecedorCadastros,
  extrairEmailsContatoFornecedor,
} from '../shared/cadastros-fornecedor-contato-api'
import { emailValidoDisparoBidFrete } from '../shared/contato-disparo-bid-frete-internacional'
import type { Fornecedor } from '../shared/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export interface ContatoEmailFornecedorDisparoProps {
  fornecedor: Fornecedor
  emailsSelecionados?: string[]
  onEmailsSelecionados?: (id_fornecedor: string, emails: string[]) => void
  onContatosAtualizados?: () => void
  exibirBadge?: boolean
  /** popover = ícones + dropdown; expandido = lista inline com editar/excluir */
  variant?: 'popover' | 'expandido'
}

export function ContatoEmailFornecedorDisparo({
  fornecedor,
  emailsSelecionados,
  onEmailsSelecionados,
  onContatosAtualizados,
  exibirBadge = true,
  variant = 'popover',
}: ContatoEmailFornecedorDisparoProps) {
  const { t } = useTranslation()
  const id = fornecedor.id_fornecedor_bid_frete_internacional
  const [emails, setEmails] = useState<string[]>(() => {
    const espelho = fornecedor.email_fornecedor_bid_frete_internacional
    return emailValidoDisparoBidFrete(espelho) ? [espelho!.trim().toLowerCase()] : []
  })
  const [aberto, setAberto] = useState(false)
  const [cadastroRapido, setCadastroRapido] = useState(false)
  const [emailNovo, setEmailNovo] = useState('')
  const [emailEditando, setEmailEditando] = useState<string | null>(null)
  const [emailEditandoValor, setEmailEditandoValor] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const selecionados = emailsSelecionados ?? []
  const temEmail = emails.length > 0 || emailValidoDisparoBidFrete(fornecedor.email_fornecedor_bid_frete_internacional)

  const definirSelecionados = useCallback((lista: string[]) => {
    onEmailsSelecionados?.(id, lista)
  }, [id, onEmailsSelecionados])

  const toggleEmailSelecionado = useCallback((email: string) => {
    const normalizado = email.trim().toLowerCase()
    const atuais = selecionados.map(e => e.trim().toLowerCase())
    const novo = atuais.includes(normalizado)
      ? atuais.filter(e => e !== normalizado)
      : [...atuais, normalizado]
    definirSelecionados(novo)
  }, [selecionados, definirSelecionados])

  const carregarEmails = useCallback(async () => {
    try {
      const dados = await buscarFornecedorCadastrosContatos(id)
      const lista = extrairEmailsContatoFornecedor(dados)
      setEmails(lista)
      if (lista.length > 0 && onEmailsSelecionados && selecionados.length === 0) {
        onEmailsSelecionados(id, lista)
      }
    } catch {
      /* mantém espelho BID */
    }
  }, [id, onEmailsSelecionados, selecionados.length])

  useEffect(() => {
    if (variant === 'expandido' || aberto) void carregarEmails()
  }, [variant, aberto, carregarEmails])

  useEffect(() => {
    if (variant !== 'popover' || !aberto) return undefined
    const fechar = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAberto(false)
        setCadastroRapido(false)
        setEmailEditando(null)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto, variant])

  useEffect(() => {
    if (!sucesso) return undefined
    const timer = window.setTimeout(() => setSucesso(null), 4000)
    return () => window.clearTimeout(timer)
  }, [sucesso])

  const validarEmail = (valor: string): boolean => EMAIL_REGEX.test(valor.trim().toLowerCase())

  const handleSalvarEmail = async () => {
    const valor = emailNovo.trim().toLowerCase()
    if (!validarEmail(valor)) {
      setErro(t('bidfrete.disparo.email_invalido', 'E-mail inválido'))
      return
    }
    setSalvando(true)
    setErro(null)
    setSucesso(null)
    try {
      const lista = await adicionarEmailFornecedorCadastros(id, valor)
      setEmails(lista)
      const atuais = selecionados.map(e => e.trim().toLowerCase())
      definirSelecionados(atuais.includes(valor) ? atuais : [...atuais, valor])
      onContatosAtualizados?.()
      setEmailNovo('')
      setCadastroRapido(false)
      setSucesso(t('bidfrete.disparo.email_salvo_cadastro', 'Salvo no cadastro do fornecedor'))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_salvar_email', 'Erro ao salvar e-mail'))
    } finally {
      setSalvando(false)
    }
  }

  const handleSalvarEdicao = async () => {
    if (!emailEditando) return
    const valor = emailEditandoValor.trim().toLowerCase()
    if (!validarEmail(valor)) {
      setErro(t('bidfrete.disparo.email_invalido', 'E-mail inválido'))
      return
    }
    setSalvando(true)
    setErro(null)
    setSucesso(null)
    try {
      const lista = await editarEmailFornecedorCadastros(id, emailEditando, valor)
      setEmails(lista)
      const atuais = selecionados.map(e => e.trim().toLowerCase())
      const atualizados = atuais.map(e => (e === emailEditando.trim().toLowerCase() ? valor : e))
      definirSelecionados([...new Set(atualizados)])
      onContatosAtualizados?.()
      setEmailEditando(null)
      setEmailEditandoValor('')
      setSucesso(t('bidfrete.disparo.email_salvo_cadastro', 'Salvo no cadastro do fornecedor'))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_salvar_email', 'Erro ao salvar e-mail'))
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (email: string) => {
    setSalvando(true)
    setErro(null)
    setSucesso(null)
    try {
      const lista = await excluirEmailFornecedorCadastros(id, email)
      setEmails(lista)
      const alvo = email.trim().toLowerCase()
      const restantes = selecionados.filter(e => e.trim().toLowerCase() !== alvo)
      definirSelecionados(restantes.length > 0 ? restantes : lista)
      onContatosAtualizados?.()
      setSucesso(t('bidfrete.disparo.email_salvo_cadastro', 'Salvo no cadastro do fornecedor'))
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_salvar_email', 'Erro ao salvar e-mail'))
    } finally {
      setSalvando(false)
    }
  }

  const renderListaEmails = (modo: 'popover' | 'expandido') => (
    <>
      {emails.length === 0 ? (
        <p className="bf-contato-email-vazio">{t('bidfrete.disparo.nenhum_email_listado', 'Nenhum e-mail cadastrado.')}</p>
      ) : (
        <ul className={`bf-contato-email-lista${modo === 'expandido' ? ' bf-contato-email-lista--expandida' : ''}`}>
          {emails.map(email => {
            const editando = emailEditando === email
            const ativo = selecionados.map(e => e.trim().toLowerCase()).includes(email)
            return (
              <li key={email} className={modo === 'expandido' ? 'bf-contato-email-linha-expandida' : undefined}>
                {editando ? (
                  <div className="bf-contato-email-edicao">
                    <input
                      type="email"
                      className="bf-contato-email-input"
                      value={emailEditandoValor}
                      onChange={e => setEmailEditandoValor(e.target.value)}
                      disabled={salvando}
                      autoFocus
                    />
                    <div className="bf-contato-email-edicao-acoes">
                      <button
                        type="button"
                        className="bf-contato-email-cancelar"
                        onClick={() => { setEmailEditando(null); setErro(null) }}
                        disabled={salvando}
                      >
                        {t('comum.cancelar', 'Cancelar')}
                      </button>
                      <button type="button" className="bf-contato-email-salvar" onClick={() => void handleSalvarEdicao()} disabled={salvando}>
                        {salvando ? t('comum.salvando', 'Salvando…') : t('comum.salvar', 'Salvar')}
                      </button>
                    </div>
                  </div>
                ) : modo === 'expandido' ? (
                  <div className={`bf-contato-email-row${ativo ? ' bf-contato-email-row--ativa' : ''}`}>
                    <label className="bf-contato-email-row-selecao">
                      <input
                        type="checkbox"
                        checked={ativo}
                        onChange={() => toggleEmailSelecionado(email)}
                        disabled={salvando}
                      />
                      <span className="bf-contato-email-endereco">{email}</span>
                      {ativo && <CheckCircle weight="fill" size={14} className="bf-contato-email-ativo-icone" />}
                    </label>
                    <div className="bf-contato-email-row-acoes">
                      <TooltipGlobal descricao={t('bidfrete.disparo.editar_email', 'Editar e-mail')}>
                        <button
                          type="button"
                          className="bf-contato-email-acao"
                          aria-label={t('bidfrete.disparo.editar_email', 'Editar e-mail')}
                          disabled={salvando}
                          onClick={() => {
                            setEmailEditando(email)
                            setEmailEditandoValor(email)
                            setCadastroRapido(false)
                            setErro(null)
                          }}
                        >
                          <PencilSimple size={15} weight="bold" />
                        </button>
                      </TooltipGlobal>
                      <TooltipGlobal descricao={t('bidfrete.disparo.excluir_email', 'Excluir e-mail')}>
                        <button
                          type="button"
                          className="bf-contato-email-acao bf-contato-email-acao--excluir"
                          aria-label={t('bidfrete.disparo.excluir_email', 'Excluir e-mail')}
                          disabled={salvando}
                          onClick={() => void handleExcluir(email)}
                        >
                          <Trash size={15} weight="bold" />
                        </button>
                      </TooltipGlobal>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={`bf-contato-email-opcao${ativo ? ' bf-contato-email-opcao--ativa' : ''}`}
                    onClick={() => {
                      toggleEmailSelecionado(email)
                      setAberto(false)
                    }}
                  >
                    {email}
                    {ativo && <CheckCircle weight="fill" size={14} />}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </>
  )

  if (variant === 'expandido') {
    return (
      <div className="bf-contato-email-expandido">
        <p className="bf-contato-email-expandido-titulo">
          <EnvelopeSimple weight="duotone" size={14} />
          {t('bidfrete.disparo.emails_cadastrados', 'E-mails cadastrados')}
        </p>
        {renderListaEmails('expandido')}
        {!cadastroRapido ? (
          <button
            type="button"
            className="bf-contato-email-link"
            onClick={() => { setCadastroRapido(true); setEmailEditando(null); setErro(null) }}
          >
            <Plus weight="bold" size={12} />
            {t('bidfrete.disparo.adicionar_email', 'Adicionar e-mail')}
          </button>
        ) : (
          <div className="bf-contato-email-rapido">
            <input
              type="email"
              className="bf-contato-email-input"
              value={emailNovo}
              placeholder="email@fornecedor.com"
              onChange={e => setEmailNovo(e.target.value)}
              disabled={salvando}
            />
            {erro && <p className="bf-contato-email-erro" role="alert">{erro}</p>}
            <div className="bf-contato-email-rapido-acoes">
              <button
                type="button"
                className="bf-contato-email-cancelar"
                onClick={() => { setCadastroRapido(false); setErro(null) }}
                disabled={salvando}
              >
                {t('comum.cancelar', 'Cancelar')}
              </button>
              <button type="button" className="bf-contato-email-salvar" onClick={() => void handleSalvarEmail()} disabled={salvando}>
                {salvando ? t('comum.salvando', 'Salvando…') : t('comum.salvar', 'Salvar')}
              </button>
            </div>
          </div>
        )}
        {sucesso && !cadastroRapido && !emailEditando && (
          <p className="bf-contato-email-sucesso" role="status">{sucesso}</p>
        )}
        {erro && !cadastroRapido && !emailEditando && (
          <p className="bf-contato-email-erro" role="alert">{erro}</p>
        )}
        <ContatoEmailStyles />
      </div>
    )
  }

  return (
    <div className="bf-contato-email-wrap" ref={popoverRef}>
      {exibirBadge && (
        <span className={`bf-disparo-contato-badge ${temEmail ? 'bf-disparo-contato-badge--ok' : 'bf-disparo-contato-badge--warn'}`}>
          {temEmail ? <CheckCircle weight="fill" size={12} /> : <WarningCircle weight="fill" size={12} />}
          {temEmail
            ? t('bidfrete.disparo.email_cadastrado', 'E-mail cadastrado')
            : t('bidfrete.disparo.sem_email', 'Sem e-mail')}
        </span>
      )}
      <button
        type="button"
        className="bf-contato-email-btn"
        title={t('bidfrete.disparo.ver_emails', 'Ver e-mails cadastrados')}
        aria-label={t('bidfrete.disparo.ver_emails', 'Ver e-mails cadastrados')}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAberto(v => !v); setCadastroRapido(false) }}
      >
        <EnvelopeSimple weight="duotone" size={16} />
      </button>
      <button
        type="button"
        className="bf-contato-email-btn bf-contato-email-btn--add"
        title={t('bidfrete.disparo.cadastro_rapido_email', 'Cadastrar e-mail rápido')}
        aria-label={t('bidfrete.disparo.cadastro_rapido_email', 'Cadastrar e-mail rápido')}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setAberto(true)
          setCadastroRapido(true)
        }}
      >
        <Plus weight="bold" size={14} />
      </button>

      {aberto && (
        <div className="bf-contato-email-popover" role="dialog">
          <p className="bf-contato-email-popover-titulo">{fornecedor.nome_fornecedor_bid_frete_internacional}</p>
          {!cadastroRapido && (
            <>
              {renderListaEmails('popover')}
              <button type="button" className="bf-contato-email-link" onClick={() => setCadastroRapido(true)}>
                + {t('bidfrete.disparo.adicionar_email', 'Adicionar e-mail')}
              </button>
            </>
          )}
          {cadastroRapido && (
            <div className="bf-contato-email-rapido">
              <input
                type="email"
                className="bf-contato-email-input"
                value={emailNovo}
                placeholder="email@fornecedor.com"
                onChange={e => setEmailNovo(e.target.value)}
                disabled={salvando}
              />
              {erro && <p className="bf-contato-email-erro" role="alert">{erro}</p>}
              {sucesso && <p className="bf-contato-email-sucesso" role="status">{sucesso}</p>}
              <div className="bf-contato-email-rapido-acoes">
                <button
                  type="button"
                  className="bf-contato-email-cancelar"
                  onClick={() => setCadastroRapido(false)}
                  disabled={salvando}
                >
                  {t('comum.cancelar', 'Cancelar')}
                </button>
                <button type="button" className="bf-contato-email-salvar" onClick={() => void handleSalvarEmail()} disabled={salvando}>
                  {salvando ? t('comum.salvando', 'Salvando…') : t('comum.salvar', 'Salvar')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <ContatoEmailStyles />
    </div>
  )
}

function ContatoEmailStyles() {
  return (
    <style>{`
      .bf-contato-email-wrap { display: inline-flex; align-items: center; gap: 0.25rem; position: relative; flex-wrap: wrap; }
      .bf-contato-email-expandido {
        display: flex; flex-direction: column; gap: 0.5rem; width: 100%;
        padding: 0.65rem 0.75rem; border-radius: 8px;
        background: rgba(15, 23, 42, 0.55); border: 1px solid rgba(71, 85, 105, 0.45);
      }
      .bf-contato-email-expandido-titulo {
        display: flex; align-items: center; gap: 0.4rem; margin: 0;
        font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
        color: #94a3b8;
      }
      .bf-contato-email-btn {
        display: inline-flex; align-items: center; justify-content: center;
        width: 26px; height: 26px; border-radius: 6px; border: 1px solid rgba(129,140,248,0.35);
        background: rgba(99,102,241,0.08); color: #a5b4fc; cursor: pointer; padding: 0;
      }
      .bf-contato-email-btn:hover { background: rgba(99,102,241,0.18); }
      .bf-contato-email-btn--add { color: #86efac; border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); }
      .bf-contato-email-popover {
        position: absolute; z-index: 50; top: calc(100% + 6px); left: 0; min-width: 260px;
        background: #1e293b; border: 1px solid #475569; border-radius: 10px; padding: 0.75rem;
        box-shadow: 0 12px 32px rgba(0,0,0,0.45);
      }
      .bf-contato-email-popover-titulo { margin: 0 0 0.5rem; font-size: 0.75rem; font-weight: 700; color: #94a3b8; }
      .bf-contato-email-lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
      .bf-contato-email-lista--expandida { gap: 0.35rem; }
      .bf-contato-email-linha-expandida { list-style: none; }
      .bf-contato-email-row {
        display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
        padding: 0.35rem 0.45rem; border-radius: 6px; border: 1px solid transparent;
      }
      .bf-contato-email-row--ativa { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.25); }
      .bf-contato-email-row-selecao {
        display: flex; align-items: center; gap: 0.5rem; flex: 1; min-width: 0;
        cursor: pointer; text-align: left; color: #f1f5f9;
      }
      .bf-contato-email-row-selecao input[type="checkbox"] { cursor: pointer; flex-shrink: 0; accent-color: #6366f1; }
      .bf-contato-email-endereco { font-size: 0.8125rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .bf-contato-email-ativo-icone { color: #86efac; flex-shrink: 0; }
      .bf-contato-email-row-acoes { display: flex; align-items: center; gap: 0.2rem; flex-shrink: 0; }
      .bf-contato-email-acao {
        display: inline-flex; align-items: center; justify-content: center;
        width: 28px; height: 28px; border-radius: 6px; border: 1px solid rgba(129,140,248,0.25);
        background: transparent; color: #a5b4fc; cursor: pointer; padding: 0;
      }
      .bf-contato-email-acao:hover:not(:disabled) { background: rgba(99,102,241,0.15); }
      .bf-contato-email-acao--excluir { color: #f87171; border-color: rgba(248,113,113,0.25); }
      .bf-contato-email-acao--excluir:hover:not(:disabled) { background: rgba(239,68,68,0.12); }
      .bf-contato-email-acao:disabled { opacity: 0.45; cursor: not-allowed; }
      .bf-contato-email-opcao {
        width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
        padding: 0.45rem 0.55rem; border-radius: 6px; border: none; background: transparent;
        color: #f1f5f9; font-size: 0.8125rem; cursor: pointer; text-align: left;
      }
      .bf-contato-email-opcao:hover, .bf-contato-email-opcao--ativa { background: rgba(99,102,241,0.15); }
      .bf-contato-email-edicao { display: flex; flex-direction: column; gap: 0.625rem; width: 100%; }
      .bf-contato-email-edicao input, .bf-contato-email-rapido input, .bf-contato-email-input {
        width: 100%; box-sizing: border-box; padding: 0.45rem 0.55rem; border-radius: 6px;
        border: 1px solid rgba(71, 85, 105, 0.85); background: #0f172a; color: #f1f5f9;
        font-size: 0.8125rem; color-scheme: dark;
      }
      .bf-contato-email-edicao input:focus, .bf-contato-email-rapido input:focus, .bf-contato-email-input:focus {
        outline: none; border-color: #6366f1;
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.22);
      }
      .bf-contato-email-edicao input:disabled, .bf-contato-email-rapido input:disabled, .bf-contato-email-input:disabled {
        opacity: 0.65; cursor: not-allowed;
      }
      .bf-contato-email-edicao input::placeholder, .bf-contato-email-rapido input::placeholder, .bf-contato-email-input::placeholder {
        color: #64748b;
      }
      .bf-contato-email-edicao input:-webkit-autofill,
      .bf-contato-email-rapido input:-webkit-autofill,
      .bf-contato-email-input:-webkit-autofill {
        -webkit-box-shadow: 0 0 0 1000px #0f172a inset !important;
        -webkit-text-fill-color: #f1f5f9 !important;
        caret-color: #f1f5f9;
        transition: background-color 9999s ease-out 0s;
      }
      .bf-contato-email-edicao-acoes, .bf-contato-email-rapido-acoes {
        display: flex; justify-content: flex-end; gap: 0.625rem; align-items: center;
        margin-top: 0.625rem; padding-top: 0.125rem;
      }
      .bf-contato-email-rapido { display: flex; flex-direction: column; gap: 0.625rem; }
      .bf-contato-email-cancelar {
        color: #e2e8f0; background: transparent;
        border: 1px solid rgba(148, 163, 184, 0.45); border-radius: 6px;
        padding: 0.35rem 0.65rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;
      }
      .bf-contato-email-cancelar:hover:not(:disabled) {
        background: rgba(148, 163, 184, 0.12); border-color: rgba(226, 232, 240, 0.55);
      }
      .bf-contato-email-cancelar:disabled { opacity: 0.45; cursor: not-allowed; }
      .bf-contato-email-vazio { margin: 0; font-size: 0.8125rem; color: #64748b; }
      .bf-contato-email-link {
        display: inline-flex; align-items: center; gap: 0.3rem; margin-top: 0.15rem;
        background: none; border: none; color: #818cf8; font-size: 0.75rem; font-weight: 600;
        cursor: pointer; padding: 0; align-self: flex-start;
      }
      .bf-contato-email-erro { margin: 0.35rem 0 0; font-size: 0.75rem; color: #fca5a5; }
      .bf-contato-email-sucesso { margin: 0.35rem 0 0; font-size: 0.75rem; color: #86efac; }
      .bf-contato-email-salvar {
        color: #fff; background: #6366f1; border: none; border-radius: 6px;
        padding: 0.35rem 0.65rem; cursor: pointer; font-size: 0.75rem; font-weight: 600;
      }
      .bf-contato-email-salvar:hover:not(:disabled) { background: #4f46e5; }
      .bf-contato-email-salvar:disabled { opacity: 0.55; cursor: not-allowed; }
    `}</style>
  )
}
