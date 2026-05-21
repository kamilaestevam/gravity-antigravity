import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Cotacao, StatusCotacao } from '../shared/types'
import { MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'
import { RenderBadgeStatus, RenderModalIcon, fmtData } from './colunas-cotacoes'

interface CotacoesKanbanProps {
  cotacoes: Cotacao[]
  carregando: boolean
  onRefresh: () => void
}

interface KanbanColConfig {
  status: StatusCotacao
  label: string
  headerColor: string
  headerBg: string
}

const KANBAN_COLS: KanbanColConfig[] = [
  { status: 'ENVIADA_FORNECEDORES',  label: 'Enviada ao fornecedor', headerColor: '#3b82f6', headerBg: 'rgba(59,130,246,0.15)' },
  { status: 'AGUARDANDO_APROVACAO',  label: 'Aprovação pendente',    headerColor: '#f59e0b', headerBg: 'rgba(245,158,11,0.15)' },
  { status: 'FALTA_INFORMACAO',      label: 'Falta de informação',   headerColor: '#f97316', headerBg: 'rgba(249,115,22,0.15)' },
  { status: 'EM_COTACAO',            label: 'Baixo limite de resposta', headerColor: '#ef4444', headerBg: 'rgba(239,68,68,0.15)' },
  { status: 'EXPIRADA',              label: 'Fora de prazo',         headerColor: '#ef4444', headerBg: 'rgba(239,68,68,0.15)' },
  { status: 'APROVADA',              label: 'Encerradas',            headerColor: '#22c55e', headerBg: 'rgba(34,197,94,0.15)' },
]

export default function CotacoesKanban({ cotacoes, carregando }: CotacoesKanbanProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ─── Kanban Card ──────────────────────────────────────────────────────
  function KanbanCard({ cotacao }: { cotacao: Cotacao }) {
    return (
      <div
        className="bf-kanban-card"
        onClick={() => navigate(`/cotacoes/${cotacao.id}`)}
      >
        <div className="bf-kanban-card-header">
          <span className="bf-kanban-card-numero">
            {cotacao.numero_cotacao_bid_frete_internacional}
          </span>
          {RenderBadgeStatus(cotacao.status)}
        </div>
        <div className="bf-kanban-card-route">
          {RenderModalIcon(cotacao.modal_cotacao_bid_frete_internacional)}
          <span>{cotacao.origem_nome_cotacao_bid_frete_internacional}</span>
          <span style={{ color: 'var(--text-muted)' }}>→</span>
          <span>{cotacao.destino_nome_cotacao_bid_frete_internacional}</span>
        </div>
        <div className="bf-kanban-card-meta">
          <span>{MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional] ?? cotacao.modal_cotacao_bid_frete_internacional}</span>
          <span>{MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional] ?? cotacao.modalidade_cotacao_bid_frete_internacional}</span>
          {cotacao.peso_kg_cotacao_bid_frete_internacional && (
            <span>{cotacao.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} Kg</span>
          )}
        </div>
        {cotacao.referencia_interna_cotacao_bid_frete_internacional && (
          <div className="bf-kanban-card-ref">
            Ref: {cotacao.referencia_interna_cotacao_bid_frete_internacional}
          </div>
        )}
        <div className="bf-kanban-card-footer">
          <span>{fmtData(cotacao.created_at)}</span>
          {cotacao.bid_responses && cotacao.bid_responses.length > 0 && (
            <span style={{ color: 'var(--success)' }}>
              {cotacao.bid_responses.length} {t('bidfrete.cotacoes.respostas')}
            </span>
          )}
        </div>
      </div>
    )
  }

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
        Carregando quadro kanban...
      </div>
    )
  }

  return (
    <div className="bf-kanban-board">
      {KANBAN_COLS.map(col => {
        const cards = cotacoes.filter(c => c.status === col.status)
        return (
          <div key={col.status} className="bf-kanban-col">
            <div className="bf-kanban-col-header" style={{ background: col.headerBg, color: col.headerColor }}>
              <span className="bf-kanban-col-dot" style={{ background: col.headerColor }} />
              {col.label}
              <span className="bf-kanban-col-count">{cards.length}</span>
            </div>
            <div className="bf-kanban-col-body">
              {cards.length === 0 ? (
                <div className="bf-kanban-empty">{t('bidfrete.cotacoes.vazio')}</div>
              ) : (
                cards.map(c => <KanbanCard key={c.id} cotacao={c} />)
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
