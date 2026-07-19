/**
 * kanban-estimativa-custo.tsx — Kanban de Estimativas.
 * Paridade com o Kanban do Bid Frete Internacional: KanbanGlobal do núcleo,
 * colunas coloridas pelo catálogo de status, cards ricos (kbp-*), busca + total.
 * Ordem/visibilidade das colunas: preferências locais (Configurações → Kanban).
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanColunaDef, KanbanItem } from '@nucleo/kanban-global'
import {
  CalendarBlank,
  CheckCircle,
  CurrencyDollar,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Archive,
  ArrowsLeftRight,
} from '@phosphor-icons/react'
import {
  listarEstimativasCusto,
  atualizarStatusEstimativaCusto,
  obterConfigStatusEstimativaCusto,
} from '../shared/api'
import type {
  EstimativaCusto,
  StatusEstimativaCusto,
  ConfigStatusEstimativaCusto,
} from '../shared/schemas-estimativa-custo'
import { STATUS_LABELS, OPERACAO_LABELS } from '../shared/types'
import { usePreferenciasKanbanEstimativaCusto } from '../shared/preferencias-kanban-estimativa-custo'
import { rotaDetalheEstimativaCusto } from '../shared/rotas-estimativa-custo'
import './kanban-estimativa-custo.css'

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : null

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : null

const STATUS_ICONS: Record<StatusEstimativaCusto, React.ReactElement> = {
  EM_CRIACAO: <PencilSimple size={16} weight="duotone" />,
  CRIADA: <CheckCircle size={16} weight="duotone" />,
  ARQUIVADA: <Archive size={16} weight="duotone" />,
}

interface EstimativaKanbanItem extends KanbanItem {
  estimativa: EstimativaCusto
}

/** Card Kanban — mesma estrutura e classes do Bid Frete (`kbp-card`). */
function CardEstimativaKanban({ estimativa }: { estimativa: EstimativaCusto }) {
  const { t } = useTranslation()
  const isImport = estimativa.tipo_operacao_estimativa_custo === 'IMPORTACAO'
  const tipoColor = isImport ? '#60a5fa' : '#34d399'
  const valor = brl(estimativa.custo_nacionalizado_brl_estimativa_custo)
  const data = dataBR(estimativa.data_criacao_estimativa_custo)

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{estimativa.numero_estimativa_custo}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>
          {OPERACAO_LABELS[estimativa.tipo_operacao_estimativa_custo]}
        </span>
      </div>

      <div className="kbp-card-parceiro">
        NCM {estimativa.ncm_estimativa_custo}
      </div>

      {estimativa.descricao_ncm_estimativa_custo && (
        <div className="kbp-card-parceiro">{estimativa.descricao_ncm_estimativa_custo}</div>
      )}

      {estimativa.referencia_estimativa_custo && (
        <div className="kbp-card-itens">
          <Package size={11} />
          {t('simulacusto.kanban.referencia_prefixo', 'Ref:')}{' '}
          {estimativa.referencia_estimativa_custo}
        </div>
      )}

      {data && (
        <div className="kbp-card-data-critica kbp-card-data-critica--ok">
          <CalendarBlank size={11} />
          {data}
        </div>
      )}

      <div className="kbp-card-footer">
        {valor && (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {valor}
          </span>
        )}
        <span className="kbp-card-incoterm">
          <ArrowsLeftRight size={10} />
          {estimativa.incoterm_estimativa_custo}
        </span>
      </div>
    </div>
  )
}

export default function KanbanEstimativaCusto() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { prefs } = usePreferenciasKanbanEstimativaCusto()

  const [estimativas, setEstimativas] = useState<EstimativaCusto[]>([])
  const [catalogoStatus, setCatalogoStatus] = useState<ConfigStatusEstimativaCusto[]>([])
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [lista, catalogo] = await Promise.all([
        listarEstimativasCusto({ limite: 100 }),
        obterConfigStatusEstimativaCusto(),
      ])
      setEstimativas(lista.estimativas_custo)
      setCatalogoStatus(catalogo)
    } catch {
      setEstimativas([])
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const kanbanCols = useMemo(() => {
    const porNome = new Map(catalogoStatus.map(s => [s.nome_status_estimativa_custo, s]))
    return prefs.ordem_colunas
      .filter(status => !prefs.colunas_ocultas.includes(status))
      .map<KanbanColunaDef>(status => ({
        key: status,
        label: STATUS_LABELS[status],
        color: porNome.get(status)?.cor_status_estimativa_custo ?? '#64748b',
        icon: STATUS_ICONS[status] ?? <Package size={16} weight="duotone" />,
        colapsavel: true,
      }))
  }, [catalogoStatus, prefs])

  const itens = useMemo<EstimativaKanbanItem[]>(() =>
    estimativas.map(estimativa => ({
      id: estimativa.id_estimativa_custo,
      colunaKey: estimativa.status_estimativa_custo,
      estimativa,
    })),
    [estimativas],
  )

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter(({ estimativa }) =>
      [
        estimativa.numero_estimativa_custo,
        estimativa.referencia_estimativa_custo,
        estimativa.ncm_estimativa_custo,
        estimativa.descricao_ncm_estimativa_custo,
        STATUS_LABELS[estimativa.status_estimativa_custo],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [busca, itens])

  const handleMover = useCallback(async (itemId: string, novaColunaKey: string) => {
    const novoStatus = novaColunaKey as StatusEstimativaCusto
    const anterior = estimativas
    setEstimativas(prev => prev.map(e =>
      e.id_estimativa_custo === itemId ? { ...e, status_estimativa_custo: novoStatus } : e,
    ))
    try {
      await atualizarStatusEstimativaCusto(itemId, novoStatus)
    } catch {
      setEstimativas(anterior)
    }
  }, [estimativas])

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('simulacusto.kanban.localizar', 'Localizar estimativa...')}
        />
      </div>
      <span className="kbp-total">
        {t('simulacusto.kanban.total_estimativas', {
          count: itensFiltrados.length,
          defaultValue: '{{count}} estimativas',
        })}
      </span>
    </div>
  )

  return (
    <div className="kbp-page ec-kanban-page">
      <KanbanGlobal<EstimativaKanbanItem>
        colunas={kanbanCols}
        itens={itensFiltrados}
        renderCard={(item) => <CardEstimativaKanban estimativa={item.estimativa} />}
        onMoverItem={handleMover}
        onCardClick={(item) => navigate(rotaDetalheEstimativaCusto(item.estimativa.id_estimativa_custo))}
        skeletonCount={3}
        emptyLabel={t('simulacusto.estimativas.vazio', 'Nenhuma estimativa encontrada')}
        getItemLabel={(item) => item.estimativa.numero_estimativa_custo}
        getItemDate={(item) => item.estimativa.data_criacao_estimativa_custo ?? ''}
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
