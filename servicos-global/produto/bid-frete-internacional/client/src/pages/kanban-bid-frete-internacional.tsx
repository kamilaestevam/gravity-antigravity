import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef, KanbanItem } from '@nucleo/kanban-global'
import {
  CheckCircle,
  Clock,
  MagnifyingGlass,
  PaperPlaneTilt,
  Package,
  PencilSimple,
  Question,
  Warning,
  XCircle,
} from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao } from '../shared/types'
import { MODAL_LABELS, MODALIDADE_LABELS } from '../shared/types'
import { RenderBadgeStatus, RenderModalIcon, fmtData } from './colunas-lista-bid-frete-internacional'
import { mudarStatusCotacao } from '../shared/api'

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

interface CotacaoKanbanItem extends KanbanItem {
  cotacao: Cotacao
}

const STATUS_ICONS: Partial<Record<StatusCotacao, React.ReactElement>> = {
  RASCUNHO: <PencilSimple size={16} weight="duotone" />,
  ENVIADA_FORNECEDORES: <PaperPlaneTilt size={16} weight="duotone" />,
  EM_COTACAO: <Clock size={16} weight="duotone" />,
  AGUARDANDO_APROVACAO: <Warning size={16} weight="duotone" />,
  APROVADA: <CheckCircle size={16} weight="duotone" />,
  REPROVADA: <XCircle size={16} weight="duotone" />,
  CANCELADA: <XCircle size={16} weight="duotone" />,
  FALTA_INFORMACAO: <Question size={16} weight="duotone" />,
  EXPIRADA: <Clock size={16} weight="duotone" />,
}

export default function CotacoesKanban({ cotacoes, carregando, onRefresh }: CotacoesKanbanProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [busca, setBusca] = useState('')

  // ─── Kanban Card ──────────────────────────────────────────────────────
  function KanbanCard({ cotacao }: { cotacao: Cotacao }) {
    return (
      <div className="bf-kanban-card">
        <div className="bf-kanban-card-header">
          <span className="bf-kanban-card-numero">
            {cotacao.numero_cotacao_bid_frete_internacional}
          </span>
          {RenderBadgeStatus(cotacao.status_cotacao_bid_frete_internacional)}
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
          <span>{fmtData(cotacao.data_criacao_cotacao_bid_frete_internacional)}</span>
          {cotacao.propostas_bid_frete_internacional && cotacao.propostas_bid_frete_internacional.length > 0 && (
            <span style={{ color: 'var(--success)' }}>
              {cotacao.propostas_bid_frete_internacional.length} {t('bidfrete.cotacoes.respostas')}
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
    statusConfig
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map<KanbanColunaDef>(s => ({
        key: s.nome,
        label: s.rotulo,
        color: s.cor,
        icon: STATUS_ICONS[s.nome as StatusCotacao] ?? <Package size={16} weight="duotone" />,
        colapsavel: true,
      })),
    [statusConfig]
  )

  const itens = useMemo<CotacaoKanbanItem[]>(() =>
    cotacoes.map(cotacao => ({
      id: cotacao.id_cotacao_bid_frete_internacional,
      colunaKey: cotacao.status_cotacao_bid_frete_internacional,
      cotacao,
    })),
    [cotacoes]
  )

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens

    return itens.filter(({ cotacao }) =>
      [
        cotacao.numero_cotacao_bid_frete_internacional,
        cotacao.referencia_interna_cotacao_bid_frete_internacional,
        cotacao.origem_nome_cotacao_bid_frete_internacional,
        cotacao.destino_nome_cotacao_bid_frete_internacional,
        cotacao.status_cotacao_bid_frete_internacional,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [busca, itens])

  const handleMoverCotacao = useCallback(async (itemId: string, novaColunaKey: string) => {
    await mudarStatusCotacao(itemId, novaColunaKey as StatusCotacao)
    onRefresh()
  }, [onRefresh])

  const toolbar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
        <MagnifyingGlass
          size={15}
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted, #64748b)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('bidfrete.kanban.localizar', 'Localizar cotação...')}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem 0.5rem 2.25rem',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--dark-border, rgba(255, 255, 255, 0.1))',
            borderRadius: 8,
            color: 'var(--text-main, #e2e8f0)',
            fontSize: '0.875rem',
            outline: 'none',
          }}
        />
      </div>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
        {t('bidfrete.kanban.totalCotacoes', '{{count}} cotações', { count: itensFiltrados.length })}
      </span>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <KanbanGlobal<CotacaoKanbanItem>
        colunas={kanbanCols}
        itens={itensFiltrados}
        renderCard={(item) => <KanbanCard cotacao={item.cotacao} />}
        onMoverItem={handleMoverCotacao}
        onCardClick={(item) => navigate(`/produto/bid-frete/cotacoes/${item.cotacao.id_cotacao_bid_frete_internacional}`)}
        isLoading={carregando}
        skeletonCount={4}
        emptyLabel={t('bidfrete.kanban.semCotacoes', 'Nenhuma cotação')}
        getItemLabel={(item) => item.cotacao.numero_cotacao_bid_frete_internacional}
        getItemDate={(item) => item.cotacao.data_criacao_cotacao_bid_frete_internacional}
        toolbarSlot={toolbar}
        labels={{
          sortNewest: t('kanban.ordenacao.mais_recente', 'Mais recente primeiro'),
          sortOldest: t('kanban.ordenacao.mais_antigo', 'Mais antigo primeiro'),
          sortAlpha: t('kanban.ordenacao.alfabetica', 'Ordem alfabética'),
          sortPopoverTitle: t('kanban.ordenacao.titulo', 'Ordenar lista'),
          sortPopoverClose: t('comum.fechar', 'Fechar'),
          sortButtonTitle: t('kanban.ordenacao.botao', 'Ordenar coluna'),
          collapseTitle: t('kanban.coluna.colapsar', 'Colapsar coluna'),
          expandTitle: t('kanban.coluna.expandir', 'Expandir coluna'),
          dropHintPrefix: t('kanban.mover.para', 'Mover para'),
          moveCardTitle: t('kanban.mover.titulo', 'Mover para...'),
          moveCardAriaLabel: t('kanban.mover.aria', 'Mover card para outra coluna'),
          moveCardMenuLabel: t('kanban.mover.label', 'Mover para'),
          movingAriaLabel: t('kanban.mover.movendo', 'Movendo...'),
        }}
      />
    </div>
  )
}
