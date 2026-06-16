/**
 * Ícones de e-mail no disparo — listar/selecionar contatos e cadastro rápido (Cadastros SSOT).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EnvelopeSimple, Plus, CheckCircle, WarningCircle } from '@phosphor-icons/react'
import {
  adicionarEmailFornecedorCadastros,
  buscarFornecedorCadastrosContatos,
  extrairEmailsContatoFornecedor,
} from '../shared/cadastros-fornecedor-contato-api'
import { emailValidoDisparoBidFrete } from '../shared/contato-disparo-bid-frete-internacional'
import type { Fornecedor } from '../shared/types'

export interface ContatoEmailFornecedorDisparoProps {
  fornecedor: Fornecedor
  emailSelecionado?: string
  onEmailSelecionado?: (id_fornecedor: string, email: string) => void
  onContatosAtualizados?: () => void
  exibirBadge?: boolean
}

export function ContatoEmailFornecedorDisparo({
  fornecedor,
  emailSelecionado,
  onEmailSelecionado,
  onContatosAtualizados,
  exibirBadge = true,
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
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const temEmail = emails.length > 0 || emailValidoDisparoBidFrete(fornecedor.email_fornecedor_bid_frete_internacional)
  const emailAtivo = emailSelecionado
    ?? (emailValidoDisparoBidFrete(fornecedor.email_fornecedor_bid_frete_internacional)
      ? fornecedor.email_fornecedor_bid_frete_internacional!.trim().toLowerCase()
      : emails[0])

  const carregarEmails = useCallback(async () => {
    try {
      const dados = await buscarFornecedorCadastrosContatos(id)
      const lista = extrairEmailsContatoFornecedor(dados)
      setEmails(lista)
      if (lista.length > 0 && onEmailSelecionado && !emailSelecionado) {
        onEmailSelecionado(id, lista[0])
      }
    } catch {
      /* mantém espelho BID */
    }
  }, [id, emailSelecionado, onEmailSelecionado])

  useEffect(() => {
    if (aberto) void carregarEmails()
  }, [aberto, carregarEmails])

  useEffect(() => {
    if (!aberto) return undefined
    const fechar = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setAberto(false)
        setCadastroRapido(false)
      }
    }
    document.addEventListener('mousedown', fechar)
    return () => document.removeEventListener('mousedown', fechar)
  }, [aberto])

  const handleSalvarEmail = async () => {
    const valor = emailNovo.trim().toLowerCase()
    if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setErro(t('bidfrete.disparo.email_invalido', 'E-mail inválido'))
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      const lista = await adicionarEmailFornecedorCadastros(id, valor)
      setEmails(lista)
      onEmailSelecionado?.(id, valor)
      onContatosAtualizados?.()
      setEmailNovo('')
      setCadastroRapido(false)
    } catch (e: unknown) {
      setErro(e instanceof Error ? e.message : t('bidfrete.disparo.erro_salvar_email', 'Erro ao salvar e-mail'))
    } finally {
      setSalvando(false)
    }
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
              {emails.length === 0 ? (
                <p className="bf-contato-email-vazio">{t('bidfrete.disparo.nenhum_email_listado', 'Nenhum e-mail cadastrado.')}</p>
              ) : (
                <ul className="bf-contato-email-lista">
                  {emails.map(email => (
                    <li key={email}>
                      <button
                        type="button"
                        className={`bf-contato-email-opcao${emailAtivo === email ? ' bf-contato-email-opcao--ativa' : ''}`}
                        onClick={() => {
                          onEmailSelecionado?.(id, email)
                          setAberto(false)
                        }}
                      >
                        {email}
                        {emailAtivo === email && <CheckCircle weight="fill" size={14} />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" className="bf-contato-email-link" onClick={() => setCadastroRapido(true)}>
                + {t('bidfrete.disparo.adicionar_email', 'Adicionar e-mail')}
              </button>
            </>
          )}
          {cadastroRapido && (
            <div className="bf-contato-email-rapido">
              <input
                type="email"
                value={emailNovo}
                placeholder="email@fornecedor.com"
                onChange={e => setEmailNovo(e.target.value)}
                disabled={salvando}
              />
              {erro && <p className="bf-contato-email-erro" role="alert">{erro}</p>}
              <div className="bf-contato-email-rapido-acoes">
                <button type="button" onClick={() => setCadastroRapido(false)} disabled={salvando}>
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

      <style>{`
        .bf-contato-email-wrap { display: inline-flex; align-items: center; gap: 0.25rem; position: relative; flex-wrap: wrap; }
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
        .bf-contato-email-opcao {
          width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
          padding: 0.45rem 0.55rem; border-radius: 6px; border: none; background: transparent;
          color: #f1f5f9; font-size: 0.8125rem; cursor: pointer; text-align: left;
        }
        .bf-contato-email-opcao:hover, .bf-contato-email-opcao--ativa { background: rgba(99,102,241,0.15); }
        .bf-contato-email-vazio { margin: 0; font-size: 0.8125rem; color: #64748b; }
        .bf-contato-email-link { margin-top: 0.5rem; background: none; border: none; color: #818cf8; font-size: 0.75rem; cursor: pointer; padding: 0; }
        .bf-contato-email-rapido input {
          width: 100%; box-sizing: border-box; padding: 0.45rem 0.55rem; border-radius: 6px;
          border: 1px solid #475569; background: #0f172a; color: #f1f5f9; font-size: 0.8125rem;
        }
        .bf-contato-email-erro { margin: 0.35rem 0 0; font-size: 0.75rem; color: #fca5a5; }
        .bf-contato-email-rapido-acoes { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }
        .bf-contato-email-salvar { color: #fff; background: #6366f1; border: none; border-radius: 6px; padding: 0.35rem 0.65rem; cursor: pointer; font-size: 0.75rem; }
      `}</style>
    </div>
  )
}
