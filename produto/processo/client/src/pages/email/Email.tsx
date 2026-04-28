/**
 * Email.tsx — Tela de Email do Processo
 *
 * Layout dividido: lista de emails (esquerda) + detalhe do email (direita).
 * Lista com busca, tabs pill de categoria, indicador de não lido.
 * Detalhe com from/to, assunto, corpo, anexos com TooltipGlobal.
 * Ações: Responder, Encaminhar, Vincular ao Follow-up.
 */

import React, { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { useShellStore } from '@gravity/shell'
import {
  Envelope,
  EnvelopeOpen,
  MagnifyingGlass,
  ArrowBendUpLeft,
  ArrowBendUpRight,
  Link as LinkIcon,
  Paperclip,
  Circle,
  Tag,
  Star,
} from '@phosphor-icons/react'
import './Email.css'

// ─── Tipos ─────────────────────────────────────────────────────────────────

interface EmailAnexo {
  nome: string
  tamanho: string
}

interface EmailItem {
  id: string
  from: string
  fromEmail: string
  to: string
  toEmail: string
  subject: string
  preview: string
  body: string
  date: string
  read: boolean
  starred: boolean
  category: string
  attachments: EmailAnexo[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────────

const MOCK_EMAILS: EmailItem[] = [
  {
    id: '1',
    from: 'Carlos Silva',
    fromEmail: 'carlos.silva@exportador.com',
    to: 'Operações',
    toEmail: 'operacoes@importador.com.br',
    subject: 'Invoice Proforma - PO 2024/001',
    preview: 'Segue em anexo a invoice proforma conforme solicitado...',
    body: `Prezados,\n\nSegue em anexo a invoice proforma referente ao pedido PO 2024/001.\n\nOs valores estão conforme negociado:\n- Valor FOB: USD 45,320.00\n- Condição de pagamento: 30/60/90 dias\n- Previsão de embarque: 15/04/2026\n\nAguardo confirmação para prosseguir com a produção.\n\nAtenciosamente,\nCarlos Silva\nExport Manager`,
    date: '2026-03-28T10:30:00Z',
    read: false,
    starred: true,
    category: 'financeiro',
    attachments: [
      { nome: 'Invoice_Proforma_PO2024001.pdf', tamanho: '245 KB' },
    ],
  },
  {
    id: '2',
    from: 'Agente Portuário',
    fromEmail: 'operacao@agente-portuario.com.br',
    to: 'Operações',
    toEmail: 'operacoes@importador.com.br',
    subject: 'Previsão de Chegada - Container MSKU1234567',
    preview: 'Informamos que o container MSKU1234567 tem previsão de chegada...',
    body: `Boa tarde,\n\nInformamos que o container MSKU1234567 tem previsão de chegada no porto de Santos para o dia 05/04/2026.\n\nDados do embarque:\n- Navio: MSC DIANA\n- Viagem: 025E\n- BL: MEDUSX12345\n- ETA Santos: 05/04/2026\n\nSolicitamos a documentação para liberação com antecedência.\n\nAtt,\nEquipe Operacional`,
    date: '2026-03-27T16:45:00Z',
    read: true,
    starred: false,
    category: 'operacional',
    attachments: [],
  },
  {
    id: '3',
    from: 'Despachante',
    fromEmail: 'despacho@despachante.com.br',
    to: 'Operações',
    toEmail: 'operacoes@importador.com.br',
    subject: 'DI Registrada - Processo 2024/0150',
    preview: 'A DI foi registrada com sucesso. Número de registro: 24/1234567-0...',
    body: `Prezados,\n\nInformamos que a DI referente ao processo 2024/0150 foi registrada com sucesso.\n\nDados do registro:\n- Número DI: 24/1234567-0\n- Data registro: 27/03/2026\n- Canal: Verde\n- Previsão desembaraço: 28/03/2026\n\nAcompanharemos o desembaraço e informaremos quando concluído.\n\nAtt,\nEquipe de Despacho`,
    date: '2026-03-27T09:15:00Z',
    read: true,
    starred: false,
    category: 'documental',
    attachments: [
      { nome: 'Comprovante_Registro_DI.pdf', tamanho: '128 KB' },
      { nome: 'Extrato_DI.pdf', tamanho: '312 KB' },
    ],
  },
  {
    id: '4',
    from: 'Cliente',
    fromEmail: 'compras@cliente.com.br',
    to: 'Comercial',
    toEmail: 'comercial@importador.com.br',
    subject: 'RE: Atualização do pedido',
    preview: 'Gostaríamos de saber a previsão atualizada de entrega...',
    body: `Bom dia,\n\nGostaríamos de saber a previsão atualizada de entrega do pedido PO 2024/001.\n\nNosso estoque está baixo e precisamos planejar a produção.\n\nPodemos agendar uma call para discutir?\n\nObrigado,\nDepartamento de Compras`,
    date: '2026-03-26T14:20:00Z',
    read: false,
    starred: false,
    category: 'cliente',
    attachments: [],
  },
]

const CATEGORY_LABELS: Record<string, string> = {
  financeiro: 'Financeiro',
  operacional: 'Operacional',
  documental: 'Documental',
  cliente: 'Cliente',
  geral: 'Geral',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── Loading Skeleton ──────────────────────────────────────────────────────

function EmailListSkeleton() {
  return (
    <div className="em-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="em-skeleton" style={{ padding: '0.875rem 0' }}>
          <div className="em-skeleton-line em-skeleton-line--medium" />
          <div className="em-skeleton-line em-skeleton-line--full" />
          <div className="em-skeleton-line em-skeleton-line--short" />
        </div>
      ))}
    </div>
  )
}

function EmailDetailSkeleton() {
  return (
    <div className="em-skeleton ws-fade-up">
      <div className="em-skeleton-line em-skeleton-line--full" style={{ height: '1.5rem' }} />
      <div className="em-skeleton-line em-skeleton-line--medium" />
      <div style={{ height: '1rem' }} />
      <div className="em-skeleton-line em-skeleton-line--full" />
      <div className="em-skeleton-line em-skeleton-line--full" />
      <div className="em-skeleton-line em-skeleton-line--medium" />
      <div className="em-skeleton-line em-skeleton-line--short" />
    </div>
  )
}

// ─── Componente Principal ──────────────────────────────────────────────────

export default function Email() {
  const { t } = useTranslation()
  const addNotification = useShellStore((state) => state.addNotification)

  const [emails] = useState<EmailItem[]>(MOCK_EMAILS)
  const [selectedId, setSelectedId] = useState<string>(MOCK_EMAILS[0]?.id ?? '')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [loading] = useState(false)

  const filteredEmails = emails.filter((e) => {
    const matchSearch =
      !search ||
      e.subject.toLowerCase().includes(search.toLowerCase()) ||
      e.from.toLowerCase().includes(search.toLowerCase())
    const matchCategory = !filterCategory || e.category === filterCategory
    return matchSearch && matchCategory
  })

  const selectedEmail = emails.find((e) => e.id === selectedId)

  const handleResponder = useCallback(() => {
    addNotification({
      type: 'success',
      message: 'Resposta iniciada com sucesso',
    })
  }, [addNotification])

  const handleEncaminhar = useCallback(() => {
    addNotification({
      type: 'success',
      message: 'Encaminhamento iniciado com sucesso',
    })
  }, [addNotification])

  const handleVincular = useCallback(() => {
    if (!selectedEmail) return
    addNotification({
      type: 'success',
      message: `E-mail vinculado ao follow-up: ${selectedEmail.subject}`,
    })
  }, [addNotification, selectedEmail])

  const handleSelectEmail = useCallback((id: string) => {
    setSelectedId(id)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, id: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleSelectEmail(id)
      }
    },
    [handleSelectEmail]
  )

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<Envelope weight="duotone" size={22} />}
          titulo={t('processo.menu.email')}
          subtitulo={t('processo.email.subtitulo', 'Comunicação do processo')}
        />
      }
    >
      <div className="em-layout ws-fade-up ws-fade-up-d1">
        {/* ─── Lista de Emails (Esquerda) ────────────── */}
        <div className="em-list-panel">
          {/* Barra de Busca */}
          <div className="em-search-bar">
            <MagnifyingGlass size={16} weight="duotone" className="em-search-icon" />
            <input
              className="em-search-input"
              type="text"
              placeholder={t('tabela.buscar')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Buscar e-mails"
            />
          </div>

          {/* Filtros de Categoria — pill tabs */}
          <div className="em-category-filters" role="tablist" aria-label="Filtrar por categoria">
            <button
              role="tab"
              aria-selected={!filterCategory}
              className={`em-cat-pill ${!filterCategory ? 'em-cat-pill--active' : ''}`}
              onClick={() => setFilterCategory(null)}
            >
              {t('common.todos', 'Todos')}
            </button>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={filterCategory === key}
                className={`em-cat-pill ${filterCategory === key ? 'em-cat-pill--active' : ''}`}
                onClick={() => setFilterCategory(filterCategory === key ? null : key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Lista */}
          {loading ? (
            <EmailListSkeleton />
          ) : (
            <div className="em-list" role="listbox" aria-label="Lista de e-mails">
              {filteredEmails.length === 0 && (
                <div className="em-list-empty">
                  <EnvelopeOpen weight="duotone" size={40} color="var(--text-muted)" />
                  <p>{t('tabela.sem_resultado')}</p>
                  <span style={{ fontSize: '0.75rem' }}>
                    {t('tabela.limpar_filtros')}
                  </span>
                </div>
              )}
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  role="option"
                  aria-selected={selectedId === email.id}
                  tabIndex={0}
                  className={`em-list-item ${selectedId === email.id ? 'em-list-item--selected' : ''} ${!email.read ? 'em-list-item--unread' : ''}`}
                  onClick={() => handleSelectEmail(email.id)}
                  onKeyDown={(e) => handleKeyDown(e, email.id)}
                >
                  <div className="em-list-item-top">
                    <div className="em-list-item-from">
                      {!email.read && (
                        <Circle size={8} weight="fill" className="em-unread-dot" />
                      )}
                      <span>{email.from}</span>
                    </div>
                    <span className="em-list-item-date">{formatDate(email.date)}</span>
                  </div>
                  <div className="em-list-item-subject">{email.subject}</div>
                  <div className="em-list-item-preview">{email.preview}</div>
                  <div className="em-list-item-bottom">
                    <span className={`em-list-item-tag em-list-item-tag--${email.category}`}>
                      <Tag size={12} weight="duotone" />
                      {CATEGORY_LABELS[email.category]}
                    </span>
                    {email.attachments.length > 0 && (
                      <span className="em-list-item-attach">
                        <Paperclip size={12} weight="duotone" />
                        {email.attachments.length}
                      </span>
                    )}
                    {email.starred && (
                      <Star size={12} weight="fill" className="em-list-item-star" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Detalhe do Email (Direita) ────────────── */}
        <div className="em-detail-panel">
          {loading && !selectedEmail ? (
            <EmailDetailSkeleton />
          ) : selectedEmail ? (
            <>
              {/* Header do Email */}
              <div className="em-detail-header ws-fade-up">
                <div className="em-detail-subject">{selectedEmail.subject}</div>
                <div className="em-detail-meta">
                  <span className={`em-detail-badge em-detail-badge--${selectedEmail.category}`}>
                    {CATEGORY_LABELS[selectedEmail.category]}
                  </span>
                  <span className="em-detail-date">{formatFullDate(selectedEmail.date)}</span>
                </div>
              </div>

              {/* De / Para */}
              <div className="em-detail-addresses ws-fade-up ws-fade-up-d1">
                <div className="em-detail-addr-row">
                  <span className="em-detail-addr-label">{t('common.de', 'De')}:</span>
                  <span className="em-detail-addr-name">{selectedEmail.from}</span>
                  <span className="em-detail-addr-email">
                    &lt;{selectedEmail.fromEmail}&gt;
                  </span>
                </div>
                <div className="em-detail-addr-row">
                  <span className="em-detail-addr-label">{t('common.para', 'Para')}:</span>
                  <span className="em-detail-addr-name">{selectedEmail.to}</span>
                  <span className="em-detail-addr-email">
                    &lt;{selectedEmail.toEmail}&gt;
                  </span>
                </div>
              </div>

              {/* Corpo do Email */}
              <div className="em-detail-body ws-fade-up ws-fade-up-d2">
                {selectedEmail.body.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </div>

              {/* Anexos */}
              {selectedEmail.attachments.length > 0 && (
                <div className="em-detail-attachments ws-fade-up ws-fade-up-d2">
                  <div className="em-detail-attach-title">
                    <Paperclip size={14} weight="duotone" />
                    {t('processo.email.anexos', 'Anexos')} ({selectedEmail.attachments.length})
                  </div>
                  <div className="em-detail-attach-list">
                    {selectedEmail.attachments.map((att, idx) => (
                      <TooltipGlobal
                        key={idx}
                        titulo={att.nome}
                        descricao="Clique para baixar o arquivo"
                      >
                        <div
                          className="em-detail-attach-item"
                          role="button"
                          tabIndex={0}
                          aria-label={`Baixar ${att.nome}`}
                        >
                          <Paperclip size={14} weight="duotone" />
                          <span className="em-detail-attach-name">{att.nome}</span>
                          <span className="em-detail-attach-size">{att.tamanho}</span>
                        </div>
                      </TooltipGlobal>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="em-detail-actions ws-fade-up ws-fade-up-d3">
                <TooltipGlobal
                  titulo={t('processo.email.responder', 'Responder')}
                  descricao={t('processo.email.responder_desc', 'Abre o editor de resposta para este e-mail')}
                >
                  <BotaoGlobal
                    label={t('processo.email.responder', 'Responder')}
                    variante="secundario"
                    icone={<ArrowBendUpLeft size={16} weight="duotone" />}
                    onClick={handleResponder}
                  />
                </TooltipGlobal>
                <TooltipGlobal
                  titulo={t('processo.email.encaminhar', 'Encaminhar')}
                  descricao={t('processo.email.encaminhar_desc', 'Encaminha este e-mail para outro destinatário')}
                >
                  <BotaoGlobal
                    label={t('processo.email.encaminhar', 'Encaminhar')}
                    variante="secundario"
                    icone={<ArrowBendUpRight size={16} weight="duotone" />}
                    onClick={handleEncaminhar}
                  />
                </TooltipGlobal>
                <TooltipGlobal
                  titulo={t('processo.email.vincular', 'Vincular ao Follow-up')}
                  descricao={t('processo.email.vincular_desc', 'Associa este e-mail a uma tarefa de acompanhamento')}
                >
                  <BotaoGlobal
                    label={t('processo.email.vincular', 'Vincular ao Follow-up')}
                    variante="primario"
                    icone={<LinkIcon size={16} weight="duotone" />}
                    onClick={handleVincular}
                  />
                </TooltipGlobal>
              </div>
            </>
          ) : (
            <div className="em-detail-empty ws-fade-up">
              <Envelope weight="duotone" size={48} color="var(--text-muted)" />
              <p>{t('processo.email.selecione', 'Selecione um e-mail para visualizar')}</p>
            </div>
          )}
        </div>
      </div>
    </PaginaGlobal>
  )
}
