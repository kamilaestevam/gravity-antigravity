/**
 * kanban-simula-custo.tsx — Kanban de Simulas.
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
  listarSimulasCusto,
  atualizarStatusSimulaCusto,
  obterConfigStatusSimulaCusto,
} from '../shared/api'
import type {
  SimulaCusto,
  StatusSimulaCusto,
  ConfigStatusSimulaCusto,
} from '../shared/schemas-simula-custo'
import { STATUS_LABELS, OPERACAO_LABELS } from '../shared/types'
import { usePreferenciasKanbanSimulaCusto } from '../shared/preferencias-kanban-simula-custo'
import { rotaDetalheSimulaCusto } from '../shared/rotas-simula-custo'
import './kanban-simula-custo.css'

const brl = (val: number | null) =>
  val != null
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
    : null

const dataBR = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : null

const STATUS_ICONS: Record<StatusSimulaCusto, React.ReactElement> = {
  EM_CRIACAO: <PencilSimple size={16} weight="duotone" />,
  CRIADA: <CheckCircle size={16} weight="duotone" />,
  ARQUIVADA: <Archive size={16} weight="duotone" />,
}

interface SimulaKanbanItem extends KanbanItem {
  simula: SimulaCusto
}

/** Card Kanban — mesma estrutura e classes do Bid Frete (`kbp-card`). */
function CardSimulaKanban({ simula }: { simula: SimulaCusto }) {
  const { t } = useTranslation()
  const isImport = simula.tipo_operacao_simula_custo === 'IMPORTACAO'
  const tipoColor = isImport ? '#60a5fa' : '#34d399'
  const valor = brl(simula.custo_nacionalizado_brl_simula_custo)
  const data = dataBR(simula.data_criacao_simula_custo)

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{simula.numero_simula_custo}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>
          {OPERACAO_LABELS[simula.tipo_operacao_simula_custo]}
        </span>
      </div>

      <div className="kbp-card-parceiro">
        NCM {simula.ncm_simula_custo}
      </div>

      {simula.descricao_ncm_simula_custo && (
        <div className="kbp-card-parceiro">{simula.descricao_ncm_simula_custo}</div>
      )}

      {simula.referencia_simula_custo && (
        <div className="kbp-card-itens">
          <Package size={11} />
          {t('simulacusto.kanban.referencia_prefixo', 'Ref:')}{' '}
          {simula.referencia_simula_custo}
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
          {simula.incoterm_simula_custo}
        </span>
      </div>
    </div>
  )
}

export default function KanbanSimulaCusto() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { prefs } = usePreferenciasKanbanSimulaCusto()

  const [simulas, setSimulas] = useState<SimulaCusto[]>([])
  const [catalogoStatus, setCatalogoStatus] = useState<ConfigStatusSimulaCusto[]>([])
  const [busca, setBusca] = useState('')

  const carregar = useCallback(async () => {
    try {
      const [lista, catalogo] = await Promise.all([
        listarSimulasCusto({ limite: 100 }),
        obterConfigStatusSimulaCusto(),
      ])
      setSimulas(lista.simulas_custo)
      setCatalogoStatus(catalogo)
    } catch {
      setSimulas([])
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const kanbanCols = useMemo(() => {
    const porNome = new Map(catalogoStatus.map(s => [s.nome_status_simula_custo, s]))
    return prefs.ordem_colunas
      .filter(status => !prefs.colunas_ocultas.includes(status))
      .map<KanbanColunaDef>(status => ({
        key: status,
        label: STATUS_LABELS[status],
        color: porNome.get(status)?.cor_status_simula_custo ?? '#64748b',
        icon: STATUS_ICONS[status] ?? <Package size={16} weight="duotone" />,
        colapsavel: true,
      }))
  }, [catalogoStatus, prefs])

  const itens = useMemo<SimulaKanbanItem[]>(() =>
    simulas.map(simula => ({
      id: simula.id_simula_custo,
      colunaKey: simula.status_simula_custo,
      simula,
    })),
    [simulas],
  )

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter(({ simula }) =>
      [
        simula.numero_simula_custo,
        simula.referencia_simula_custo,
        simula.ncm_simula_custo,
        simula.descricao_ncm_simula_custo,
        STATUS_LABELS[simula.status_simula_custo],
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [busca, itens])

  const handleMover = useCallback(async (itemId: string, novaColunaKey: string) => {
    const novoStatus = novaColunaKey as StatusSimulaCusto
    const anterior = simulas
    setSimulas(prev => prev.map(e =>
      e.id_simula_custo === itemId ? { ...e, status_simula_custo: novoStatus } : e,
    ))
    try {
      await atualizarStatusSimulaCusto(itemId, novoStatus)
    } catch {
      setSimulas(anterior)
    }
  }, [simulas])

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          value={busca}
          onChange={event => setBusca(event.target.value)}
          placeholder={t('simulacusto.kanban.localizar', 'Localizar simula...')}
        />
      </div>
      <span className="kbp-total">
        {t('simulacusto.kanban.total_simulas', {
          count: itensFiltrados.length,
          defaultValue: '{{count}} simulas',
        })}
      </span>
    </div>
  )

  return (
    <div className="kbp-page ec-kanban-page">
      <KanbanGlobal<SimulaKanbanItem>
        colunas={kanbanCols}
        itens={itensFiltrados}
        renderCard={(item) => <CardSimulaKanban simula={item.simula} />}
        onMoverItem={handleMover}
        onCardClick={(item) => navigate(rotaDetalheSimulaCusto(item.simula.id_simula_custo))}
        skeletonCount={3}
        emptyLabel={t('simulacusto.simulas.vazio', 'Nenhuma simula encontrada')}
        getItemLabel={(item) => item.simula.numero_simula_custo}
        getItemDate={(item) => item.simula.data_criacao_simula_custo ?? ''}
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
