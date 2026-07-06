/**
 * Kanban embutido — visão fornecedor (sem PaginaGlobal; usado pela lista unificada).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef, KanbanItem } from '@nucleo/kanban-global'
import {
  CheckCircle,
  Clock,
  Envelope,
  MagnifyingGlass,
  Package,
  XCircle,
} from '@phosphor-icons/react'
import type { Cotacao, DisparoCotacaoBidFreteInternacional } from '../../shared/types'
import {
  colunaKanbanFornecedorBidFrete,
  cotacaoKanbanFromDisparoFornecedor,
  type StatusKanbanFornecedorBidFreteInternacional,
} from '../../shared/kanban-fornecedor-bid-frete-internacional'
import { navegarOportunidadeFornecedor } from '../../shared/lista-visao-fornecedor-bid-frete-dados'
import { useKanbanPreferencesBidFrete } from '../../shared/use-kanban-preferences-bid-frete'
import { CardCotacaoKanbanBidFrete } from '../kanban-bid-frete-internacional'
import { ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL } from '../../shared/rotas-bid-frete-internacional'
import '../kanban-bid-frete-internacional.css'

interface DisparoKanbanItem extends KanbanItem {
  disparo: DisparoCotacaoBidFreteInternacional
  cotacao: Cotacao
}

const STATUS_FORNECEDOR_KANBAN: Array<{
  id: string
  nome: StatusKanbanFornecedorBidFreteInternacional
  rotulo: string
  cor: string
  ordem: number
}> = [
  { id: 'aguardando', nome: 'AGUARDANDO_RESPOSTA', rotulo: 'Aguardando resposta', cor: '#fbbf24', ordem: 1 },
  { id: 'em_analise', nome: 'EM_ANALISE', rotulo: 'Em análise', cor: '#818cf8', ordem: 2 },
  { id: 'aprovada', nome: 'APROVADA', rotulo: 'Aprovada', cor: '#10b981', ordem: 3 },
  { id: 'reprovada', nome: 'REPROVADA', rotulo: 'Reprovada', cor: '#ef4444', ordem: 4 },
  { id: 'expirada', nome: 'EXPIRADA', rotulo: 'Expirada', cor: '#94a3b8', ordem: 5 },
]

const STATUS_ICONS_FORNECEDOR: Record<StatusKanbanFornecedorBidFreteInternacional, React.ReactElement> = {
  AGUARDANDO_RESPOSTA: <Envelope size={16} weight="duotone" />,
  EM_ANALISE: <Clock size={16} weight="duotone" />,
  APROVADA: <CheckCircle size={16} weight="duotone" />,
  REPROVADA: <XCircle size={16} weight="duotone" />,
  EXPIRADA: <Clock size={16} weight="duotone" />,
}

const KANBAN_COLUNAS_OCULTAS_KEY_FORNECEDOR = 'bid-frete:fornecedor:config:kanban-colunas-ocultas'

function lerColunasOcultasFornecedor(): string[] {
  try {
    const raw = localStorage.getItem(KANBAN_COLUNAS_OCULTAS_KEY_FORNECEDOR)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

export interface KanbanFornecedorConteudoProps {
  disparos: DisparoCotacaoBidFreteInternacional[]
  toolbarInicio?: React.ReactNode
}

export function KanbanFornecedorConteudo({ disparos, toolbarInicio }: KanbanFornecedorConteudoProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { cardConfig } = useKanbanPreferencesBidFrete('fornecedor')
  const [busca, setBusca] = useState('')
  const [colunasOcultas, setColunasOcultas] = useState<string[]>(lerColunasOcultasFornecedor)

  useEffect(() => {
    const onStorage = () => setColunasOcultas(lerColunasOcultasFornecedor())
    window.addEventListener('storage', onStorage)
    window.addEventListener('focus', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('focus', onStorage)
    }
  }, [])

  const kanbanCols = useMemo(() => {
    const ocultas = new Set(colunasOcultas)
    return STATUS_FORNECEDOR_KANBAN
      .filter(s => !ocultas.has(s.id))
      .sort((a, b) => a.ordem - b.ordem)
      .map<KanbanColunaDef>(s => ({
        key: s.nome,
        label: t(`bidfrete.visao_fornecedor_bid_frete_internacional.kanban.${s.nome.toLowerCase()}`, {
          defaultValue: s.rotulo,
        }),
        color: s.cor,
        icon: STATUS_ICONS_FORNECEDOR[s.nome] ?? <Package size={16} weight="duotone" />,
        colapsavel: true,
      }))
  }, [colunasOcultas, t])

  const itens = useMemo<DisparoKanbanItem[]>(() => {
    const resultado: DisparoKanbanItem[] = []
    for (const disparo of disparos) {
      const cotacao = cotacaoKanbanFromDisparoFornecedor(disparo)
      if (!cotacao) continue
      resultado.push({
        id: disparo.id_disparo_cotacao_bid_frete_internacional,
        colunaKey: colunaKanbanFornecedorBidFrete(disparo),
        disparo,
        cotacao,
      })
    }
    return resultado
  }, [disparos])

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter(({ cotacao }) =>
      [
        cotacao.numero_cotacao_bid_frete_internacional,
        cotacao.origem_nome_cotacao_bid_frete_internacional,
        cotacao.destino_nome_cotacao_bid_frete_internacional,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [busca, itens])

  const handleCardClick = useCallback((item: DisparoKanbanItem) => {
    navegarOportunidadeFornecedor(navigate, ROTAS_VISAO_FORNECEDOR_BID_FRETE_INTERNACIONAL, item.disparo)
  }, [navigate])

  const toolbar = (
    <div className="kbp-toolbar">
      {toolbarInicio}
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('bidfrete.visao_fornecedor_bid_frete_internacional.kanban.busca', {
            defaultValue: 'Localizar cotação...',
          })}
        />
      </div>
      <span className="kbp-total">
        {t('bidfrete.visao_fornecedor_bid_frete_internacional.kanban.total', {
          count: itensFiltrados.length,
          defaultValue: '{{count}} oportunidades',
        })}
      </span>
    </div>
  )

  return (
    <div className="kbp-page">
      <KanbanGlobal<DisparoKanbanItem>
        colunas={kanbanCols}
        itens={itensFiltrados}
        renderCard={(item) => (
          <CardCotacaoKanbanBidFrete cotacao={item.cotacao} cardConfig={cardConfig} />
        )}
        onCardClick={handleCardClick}
        skeletonCount={4}
        emptyLabel={t('bidfrete.visao_fornecedor_bid_frete_internacional.kanban.vazio', {
          defaultValue: 'Nenhuma cotação no funil',
        })}
        getItemLabel={(item) => item.cotacao.numero_cotacao_bid_frete_internacional}
        getItemDate={(item) =>
          item.disparo.data_envio_disparo_cotacao_bid_frete_internacional
          ?? item.cotacao.data_criacao_cotacao_bid_frete_internacional
        }
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
