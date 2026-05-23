import React, { useState, useEffect, useMemo } from 'react'
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

// ─── Status Config dinâmico (sincronizado com Configurações via localStorage) ───

interface StatusConfig {
  id: string
  nome: string
  rotulo: string
  cor: string
  ordem: number
  is_sistema: boolean
}

const STATUS_CONFIG_KEY = 'bid-frete:config:status'

const STATUS_CANONICOS: StatusConfig[] = [
  { id: 'rascunho', nome: 'RASCUNHO', rotulo: 'Rascunho', cor: '#94a3b8', ordem: 1, is_sistema: true },
  { id: 'enviada_fornecedores', nome: 'ENVIADA_FORNECEDORES', rotulo: 'Enviada ao fornecedor', cor: '#60a5fa', ordem: 2, is_sistema: true },
  { id: 'em_cotacao', nome: 'EM_COTACAO', rotulo: 'Em cotação', cor: '#fbbf24', ordem: 3, is_sistema: true },
  { id: 'aguardando_aprovacao', nome: 'AGUARDANDO_APROVACAO', rotulo: 'Aprovação pendente', cor: '#818cf8', ordem: 4, is_sistema: true },
  { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 5, is_sistema: false },
  { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 6, is_sistema: false },
  { id: 'cancelada', nome: 'CANCELADA', rotulo: 'Cancelada', cor: '#6b7280', ordem: 7, is_sistema: false },
  { id: 'falta_informacao', nome: 'FALTA_INFORMACAO', rotulo: 'Falta de informação', cor: '#fb7185', ordem: 8, is_sistema: false },
  { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#d1d5db', ordem: 9, is_sistema: false },
]

function lerStatusConfig(): StatusConfig[] {
  try {
    const raw = localStorage.getItem(STATUS_CONFIG_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* storage indisponível */ }
  return STATUS_CANONICOS
}

/** Converte hex (#RRGGBB) para rgba com opacidade */
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function CotacoesKanban({ cotacoes, carregando }: CotacoesKanbanProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ─── Kanban Card ──────────────────────────────────────────────────────
  function KanbanCard({ cotacao }: { cotacao: Cotacao }) {
    return (
      <div
        className="bf-kanban-card"
        onClick={() => navigate(`/produto/bid-frete/cotacoes/${cotacao.id}`)}
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

  // ─── Status dinâmico do localStorage ───
  const [statusConfig, setStatusConfig] = useState<StatusConfig[]>(lerStatusConfig)

  useEffect(() => {
    const handleStorage = () => setStatusConfig(lerStatusConfig())
    window.addEventListener('storage', handleStorage)
    window.addEventListener('focus', handleStorage)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('focus', handleStorage)
    }
  }, [])

  const kanbanCols = useMemo(() =>
    statusConfig.map(s => ({
      status: s.nome as StatusCotacao,
      label: s.rotulo,
      headerColor: s.cor,
      headerBg: hexToRgba(s.cor, 0.15),
    })),
    [statusConfig]
  )

  if (carregando) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--text-secondary)' }}>
        Carregando quadro kanban...
      </div>
    )
  }

  return (
    <div className="bf-kanban-board">
      {kanbanCols.map(col => {
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
