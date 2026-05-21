import React from 'react'
import type { Cotacao, StatusCotacao } from '../shared/types'
import { STATUS_LABELS } from '../shared/types'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'

interface CotacoesKanbanProps {
  cotacoes: Cotacao[]
  carregando: boolean
  onRefresh: () => void
}

interface Column {
  id: string
  title: string
  color: string
  statuses: StatusCotacao[]
}

const COLUMNS: Column[] = [
  {
    id: 'elaboracao',
    title: 'Rascunho / Pendente',
    color: '#94a3b8', // slate-400
    statuses: ['RASCUNHO', 'FALTA_INFORMACAO'],
  },
  {
    id: 'em_cotacao',
    title: 'Em Cotação',
    color: '#3b82f6', // blue-500
    statuses: ['EM_COTACAO', 'ENVIADA_FORNECEDORES'],
  },
  {
    id: 'aprovacao',
    title: 'Aprovação Pendente',
    color: '#eab308', // yellow-500
    statuses: ['AGUARDANDO_APROVACAO'],
  },
  {
    id: 'finalizado',
    title: 'Finalizado / Expirado',
    color: '#10b981', // emerald-500
    statuses: ['APROVADA', 'REPROVADA', 'CANCELADA', 'EXPIRADA'],
  },
]

export default function CotacoesKanban({ cotacoes, carregando, onRefresh }: CotacoesKanbanProps) {
  const navigate = useNavigate()

  const getModalIcon = (modal: string) => {
    const size = 13
    if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} style={{ color: 'var(--accent)' }} />
    if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} style={{ color: 'var(--accent)' }} />
    return <Truck weight="duotone" size={size} style={{ color: 'var(--accent)' }} />
  }

  const formatData = (iso: string | null | undefined): string => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }

  return (
    <div className="bf-kanban-board" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem', flex: 1, minHeight: 0 }}>
      {COLUMNS.map(col => {
        const colCotacoes = cotacoes.filter(c => col.statuses.includes(c.status))
        
        return (
          <div key={col.id} className="bf-kanban-col">
            <div className="bf-kanban-col-header" style={{ borderBottom: `2px solid ${col.color}` }}>
              <span className="bf-kanban-col-dot" style={{ backgroundColor: col.color }} />
              <span>{col.title}</span>
              <span className="bf-kanban-col-count">{colCotacoes.length}</span>
            </div>
            
            <div className="bf-kanban-col-body">
              {carregando ? (
                <div className="bf-kanban-empty">Carregando...</div>
              ) : colCotacoes.length === 0 ? (
                <div className="bf-kanban-empty">Nenhuma cotação</div>
              ) : (
                colCotacoes.map(c => (
                  <div key={c.id} className="bf-kanban-card" onClick={() => navigate(`/cotacoes/${c.id}`)}>
                    <div className="bf-kanban-card-header">
                      <span className="bf-kanban-card-numero_cotacao_bid_frete_internacional">
                        {c.numero_cotacao_bid_frete_internacional}
                      </span>
                      <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem', borderRadius: '4px', background: 'var(--bg-elevated)', fontWeight: 600 }}>
                        {STATUS_LABELS[c.status] || c.status}
                      </span>
                    </div>
                    
                    <div className="bf-kanban-card-route">
                      <span>{c.origem_codigo_cotacao_bid_frete_internacional}</span>
                      <ArrowRight size={10} weight="bold" style={{ color: 'var(--text-muted)' }} />
                      <span>{c.destino_codigo_cotacao_bid_frete_internacional}</span>
                    </div>
                    
                    <div className="bf-kanban-card-ref">
                      {c.referencia_interna_cotacao_bid_frete_internacional || 'Sem ref. interna'}
                    </div>
                    
                    <div className="bf-kanban-card-meta">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        {getModalIcon(c.modal_cotacao_bid_frete_internacional)}
                        {c.incoterm_cotacao_bid_frete_internacional}
                      </span>
                      {c.peso_kg_cotacao_bid_frete_internacional != null && (
                        <span>• {c.peso_kg_cotacao_bid_frete_internacional.toLocaleString('pt-BR')} kg</span>
                      )}
                    </div>
                    
                    <div className="bf-kanban-card-footer">
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem' }}>
                        <Calendar size={12} weight="duotone" />
                        {c.prazo_resposta ? `Até ${formatData(c.prazo_resposta)}` : formatData(c.created_at)}
                      </span>
                      {c.ganho_valor_cotacao_bid_frete_internacional != null && c.ganho_valor_cotacao_bid_frete_internacional > 0 ? (
                        <span style={{ color: 'var(--success, #22c55e)', fontWeight: 600 }}>
                          +USD {c.ganho_valor_cotacao_bid_frete_internacional.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>—</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
