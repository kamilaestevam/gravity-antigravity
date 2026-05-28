import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef, KanbanItem } from '@nucleo/kanban-global'
import {
  ArrowsLeftRight,
  CalendarBlank,
  CheckCircle,
  Clock,
  CurrencyDollar,
  MagnifyingGlass,
  PaperPlaneTilt,
  Package,
  PencilSimple,
  Question,
  Warning,
  XCircle,
} from '@phosphor-icons/react'
import type { Cotacao, PropostaBidFreteInternacional, StatusCotacao } from '../shared/types'
import { MODAL_LABELS, MODALIDADE_LABELS, OPERACAO_LABELS } from '../shared/types'
import { mudarStatusCotacao } from '../shared/api'
import type { KanbanCardConfigBidFrete } from '../shared/kanban-bid-frete-card'
import { useKanbanPreferencesBidFrete } from '../shared/use-kanban-preferences-bid-frete'
import './kanban-bid-frete-internacional.css'

interface CotacoesKanbanProps {
  cotacoes: Cotacao[]
  carregando: boolean
  onRefresh: () => void
}

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

function propostaVencedora(cotacao: Cotacao): PropostaBidFreteInternacional | null {
  const propostas = cotacao.propostas_bid_frete_internacional
  if (!propostas?.length) return null
  const ranqueada = propostas.find(p => p.classificacao_valor_proposta_bid_frete_internacional === 1)
  if (ranqueada) return ranqueada
  return [...propostas].sort(
    (a, b) => a.valor_total_proposta_bid_frete_internacional - b.valor_total_proposta_bid_frete_internacional,
  )[0] ?? null
}

function dataCriticaCotacao(
  cotacao: Cotacao,
  campo: string | null,
): { label: string; urgencia: 'ok' | 'alerta' | 'urgente' } | null {
  if (!campo) return null
  const val = (cotacao as unknown as Record<string, unknown>)[campo]
  if (!val) return null

  const data = new Date(val as string)
  if (isNaN(data.getTime())) return null

  const hoje = new Date()
  const diffDias = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  let urgencia: 'ok' | 'alerta' | 'urgente' = 'ok'
  if (diffDias <= 1) urgencia = 'urgente'
  else if (diffDias <= 7) urgencia = 'alerta'

  return { label: data.toLocaleDateString('pt-BR'), urgencia }
}

function valorFooterCotacao(cotacao: Cotacao): { valor: string; moeda: string } | null {
  if (cotacao.valor_aprovado_ganho_bid_frete_internacional != null) {
    const moeda = cotacao.moeda_aprovada ?? cotacao.moeda_meta_cotacao_bid_frete_internacional ?? 'USD'
    return {
      valor: cotacao.valor_aprovado_ganho_bid_frete_internacional.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      moeda,
    }
  }
  if (cotacao.valor_meta_cotacao_bid_frete_internacional != null) {
    const moeda = cotacao.moeda_meta_cotacao_bid_frete_internacional ?? 'USD'
    return {
      valor: cotacao.valor_meta_cotacao_bid_frete_internacional.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      moeda,
    }
  }
  const proposta = propostaVencedora(cotacao)
  if (proposta) {
    return {
      valor: proposta.valor_total_proposta_bid_frete_internacional.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      moeda: proposta.moeda_proposta_bid_frete_internacional,
    }
  }
  return null
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

/** Card Kanban — mesma estrutura e classes do Pedido (`CardPedido` / `kbp-card`). */
function CardCotacao({ cotacao, cardConfig }: { cotacao: Cotacao; cardConfig: KanbanCardConfigBidFrete }) {
  const { t } = useTranslation()
  const campos = cardConfig.campos
  const isVisivel = (campo: string) => campos.find(c => c.campo === campo)?.visivel ?? false

  const critica = dataCriticaCotacao(cotacao, cardConfig.dataCritica)
  const valorFooter = valorFooterCotacao(cotacao)

  const tipoLabel = OPERACAO_LABELS[cotacao.tipo_operacao_cotacao_bid_frete_internacional]
  const tipoColor = cotacao.tipo_operacao_cotacao_bid_frete_internacional === 'IMPORTACAO' ? '#818cf8' : '#34d399'

  const origem = cotacao.origem_nome_cotacao_bid_frete_internacional
  const destino = cotacao.destino_nome_cotacao_bid_frete_internacional
  const fornecedor = propostaVencedora(cotacao)?.fornecedor?.nome_fornecedor_bid_frete_internacional
  const qtdPropostas = cotacao.propostas_bid_frete_internacional?.length ?? 0

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{cotacao.numero_cotacao_bid_frete_internacional}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>{tipoLabel}</span>
      </div>

      {isVisivel('origem_nome') && origem && (
        <div className="kbp-card-parceiro">{origem}</div>
      )}

      {isVisivel('destino_nome') && destino && (
        <div className="kbp-card-parceiro">{destino}</div>
      )}

      {isVisivel('fornecedor_vencedor') && fornecedor && (
        <div className="kbp-card-parceiro">{fornecedor}</div>
      )}

      {isVisivel('propostas_count') && (
        <div className="kbp-card-itens">
          <Package size={11} />
          {t('bidfrete.kanban.propostas_contagem', {
            count: qtdPropostas,
            defaultValue: '{{count}} proposta(s)',
          })}
        </div>
      )}

      {isVisivel('modal_modalidade') && (
        <div className="kbp-card-itens">
          {MODAL_LABELS[cotacao.modal_cotacao_bid_frete_internacional] ?? cotacao.modal_cotacao_bid_frete_internacional}
          {' · '}
          {MODALIDADE_LABELS[cotacao.modalidade_cotacao_bid_frete_internacional] ?? cotacao.modalidade_cotacao_bid_frete_internacional}
        </div>
      )}

      {isVisivel('referencia_interna') && cotacao.referencia_interna_cotacao_bid_frete_internacional && (
        <div className="kbp-card-parceiro">
          Ref: {cotacao.referencia_interna_cotacao_bid_frete_internacional}
        </div>
      )}

      {isVisivel('status') && (
        <div className="kbp-card-status">{cotacao.status_cotacao_bid_frete_internacional}</div>
      )}

      {critica && (
        <div className={`kbp-card-data-critica kbp-card-data-critica--${critica.urgencia}`}>
          <CalendarBlank size={11} />
          {critica.label}
        </div>
      )}

      <div className="kbp-card-footer">
        {isVisivel('valor_total') && valorFooter && (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {valorFooter.valor} {valorFooter.moeda}
          </span>
        )}
        {isVisivel('incoterm') && cotacao.incoterm_cotacao_bid_frete_internacional && (
          <span className="kbp-card-incoterm">
            <ArrowsLeftRight size={10} />
            {cotacao.incoterm_cotacao_bid_frete_internacional}
          </span>
        )}
      </div>
    </div>
  )
}

export default function CotacoesKanban({ cotacoes, carregando, onRefresh }: CotacoesKanbanProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { colunasOcultas, cardConfig } = useKanbanPreferencesBidFrete()
  const [busca, setBusca] = useState('')
  const [statusOtimista, setStatusOtimista] = useState<Record<string, StatusCotacao>>({})

  useEffect(() => {
    setStatusOtimista(prev => {
      const next = { ...prev }
      let mudou = false
      for (const cotacao of cotacoes) {
        if (next[cotacao.id_cotacao_bid_frete_internacional] === cotacao.status_cotacao_bid_frete_internacional) {
          delete next[cotacao.id_cotacao_bid_frete_internacional]
          mudou = true
        }
      }
      return mudou ? next : prev
    })
  }, [cotacoes])

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

  const kanbanCols = useMemo(() => {
    const ocultas = new Set(colunasOcultas)
    return statusConfig
      .filter(s => !ocultas.has(s.id))
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
      .map<KanbanColunaDef>(s => ({
        key: s.nome,
        label: s.rotulo,
        color: s.cor,
        icon: STATUS_ICONS[s.nome as StatusCotacao] ?? <Package size={16} weight="duotone" />,
        colapsavel: true,
      }))
  }, [statusConfig, colunasOcultas])

  const itens = useMemo<CotacaoKanbanItem[]>(() =>
    cotacoes.map(cotacao => {
      const statusEfetivo = statusOtimista[cotacao.id_cotacao_bid_frete_internacional] ?? cotacao.status_cotacao_bid_frete_internacional
      return {
        id: cotacao.id_cotacao_bid_frete_internacional,
        colunaKey: statusEfetivo,
        cotacao: statusEfetivo === cotacao.status_cotacao_bid_frete_internacional
          ? cotacao
          : { ...cotacao, status_cotacao_bid_frete_internacional: statusEfetivo },
      }
    }),
    [cotacoes, statusOtimista],
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
    const novoStatus = novaColunaKey as StatusCotacao
    await mudarStatusCotacao(itemId, novoStatus)
    setStatusOtimista(prev => ({ ...prev, [itemId]: novoStatus }))
    onRefresh()
  }, [onRefresh])

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('bidfrete.kanban.localizar', 'Localizar cotação...')}
        />
      </div>
      <span className="kbp-total">
        {t('bidfrete.kanban.totalCotacoes', '{{count}} cotações', { count: itensFiltrados.length })}
      </span>
    </div>
  )

  return (
    <div className="kbp-page">
      <KanbanGlobal<CotacaoKanbanItem>
        colunas={kanbanCols}
        itens={itensFiltrados}
        renderCard={(item) => <CardCotacao cotacao={item.cotacao} cardConfig={cardConfig} />}
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
