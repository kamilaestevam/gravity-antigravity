/**
 * KanbanSimuladorBidFrete — cotações organizadas por status no simulador
 * de marketing, com drag-and-drop real via KanbanGlobal (nucleo-global).
 */

import { useCallback, useMemo, useState, type ReactElement } from 'react'
import { KanbanGlobal, type KanbanItem } from '../../../Kanban/kanban-global/src/index'
import {
  AirplaneTilt,
  Anchor,
  ArrowRight,
  CalendarBlank,
  CheckCircle,
  CurrencyDollar,
  Envelope,
  MagnifyingGlass,
  PencilSimple,
  Spinner,
  Truck,
  UsersThree,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  formatarDataCurtaSimuladorBidFrete,
  formatarUsdSimuladorBidFrete,
  listarCotacoesEmpresasSimuladorBidFrete,
  MODAL_SIMULADOR_BID_FRETE,
  STATUS_SIMULADOR_BID_FRETE,
  type CotacaoSimuladorBidFrete,
  type ModalSimuladorBidFrete,
  type StatusCotacaoSimuladorBidFrete,
} from './dados-simulador-bid-frete'
import '../pedido/kanban-simulador-pedido.css'
import './kanban-simulador-bid-frete.css'

const ORDEM_COLUNAS: StatusCotacaoSimuladorBidFrete[] = [
  'RASCUNHO',
  'ENVIADA_FORNECEDORES',
  'EM_COTACAO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
]

const ICONE_COLUNA: Record<StatusCotacaoSimuladorBidFrete, ReactElement> = {
  RASCUNHO: <PencilSimple size={16} weight="duotone" />,
  ENVIADA_FORNECEDORES: <Envelope size={16} weight="duotone" />,
  EM_COTACAO: <Spinner size={16} weight="duotone" />,
  AGUARDANDO_APROVACAO: <ArrowRight size={16} weight="duotone" />,
  APROVADA: <CheckCircle size={16} weight="duotone" />,
  REPROVADA: <CheckCircle size={16} weight="duotone" />,
}

const ICONE_MODAL: Record<ModalSimuladorBidFrete, ReactElement> = {
  MARITIMO: <Anchor size={11} weight="duotone" />,
  AEREO: <AirplaneTilt size={11} weight="duotone" />,
  RODOVIARIO: <Truck size={11} weight="duotone" />,
}

type ItemKanbanBidFrete = KanbanItem & { cotacao: CotacaoSimuladorBidFrete }

function CardKanbanBidFrete({ cotacao }: { cotacao: CotacaoSimuladorBidFrete }) {
  const modalMeta = MODAL_SIMULADOR_BID_FRETE[cotacao.modal]
  const operacaoLabel = cotacao.operacao === 'IMPORTACAO' ? 'Importação' : 'Exportação'
  const operacaoCor = cotacao.operacao === 'IMPORTACAO' ? '#818cf8' : '#34d399'

  return (
    <div className="kbp-card bfs-kanban-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{cotacao.numero}</span>
        <span className="kbp-card-tipo" style={{ color: operacaoCor }}>
          {operacaoLabel}
        </span>
      </div>

      <div className="bfs-kanban-card__rota">
        <span aria-hidden>{cotacao.origem.flag}</span> {cotacao.origem.codigo}
        <ArrowRight size={10} weight="bold" className="bfs-kanban-card__rota-seta" />
        <span aria-hidden>{cotacao.destino.flag}</span> {cotacao.destino.codigo}
      </div>

      <div className="bfs-kanban-card__meta">
        <span className="bfs-kanban-card__modal" style={{ color: modalMeta.cor }}>
          {ICONE_MODAL[cotacao.modal]}
          {modalMeta.rotulo} · {cotacao.modalidade}
        </span>
        <span className="bfs-kanban-card__propostas">
          <UsersThree size={11} weight="duotone" />
          {cotacao.propostasRecebidas}/{cotacao.fornecedoresConvidados}
        </span>
      </div>

      <div className="kbp-card-footer bfs-kanban-card__footer">
        {cotacao.melhorLanceUsd != null ? (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {formatarUsdSimuladorBidFrete(cotacao.melhorLanceUsd)}
          </span>
        ) : (
          <span className="bfs-kanban-card__sem-lance">Sem lances</span>
        )}
        <span className="bfs-kanban-card__prazo">
          <CalendarBlank size={11} />
          {formatarDataCurtaSimuladorBidFrete(cotacao.dataLimiteResposta)}
        </span>
      </div>
    </div>
  )
}

export function KanbanSimuladorBidFrete({
  empresasSelecionadas,
  onAbrirCotacaoCompleta,
}: {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  onAbrirCotacaoCompleta: (numeroCotacao: string) => void
}) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, StatusCotacaoSimuladorBidFrete>>({})
  const [busca, setBusca] = useState('')

  const cotacoes = useMemo(() => {
    const base = listarCotacoesEmpresasSimuladorBidFrete(empresasSelecionadas)
    return base
      .filter((c) => c.status !== 'REPROVADA')
      .map((c) => ({ ...c, status: statusOverrides[c.id] ?? c.status }))
  }, [empresasSelecionadas, statusOverrides])

  const colunas = useMemo(
    () =>
      ORDEM_COLUNAS.map((status) => ({
        key: status,
        label: STATUS_SIMULADOR_BID_FRETE[status].rotulo,
        color: STATUS_SIMULADOR_BID_FRETE[status].cor,
        icon: ICONE_COLUNA[status],
      })),
    [],
  )

  const itens: ItemKanbanBidFrete[] = useMemo(
    () =>
      cotacoes.map((cotacao) => ({
        id: cotacao.id,
        colunaKey: cotacao.status,
        cotacao,
      })),
    [cotacoes],
  )

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    if (!termo) return itens
    return itens.filter(({ cotacao }) =>
      [
        cotacao.numero,
        cotacao.origem.codigo,
        cotacao.origem.cidade,
        cotacao.destino.codigo,
        cotacao.destino.cidade,
        cotacao.fornecedorLider ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [itens, busca])

  const handleMover = useCallback((itemId: string, novaColunaKey: string) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [itemId]: novaColunaKey as StatusCotacaoSimuladorBidFrete,
    }))
  }, [])

  const renderCard = useCallback(
    (item: ItemKanbanBidFrete) => <CardKanbanBidFrete cotacao={item.cotacao} />,
    [],
  )

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          placeholder="Localizar cotação..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>
      <span className="kbp-total">{itensFiltrados.length} cotações</span>
    </div>
  )

  return (
    <div className="pds-kanban-simulador kbp-page bfs-kanban">
      <KanbanGlobal<ItemKanbanBidFrete>
        colunas={colunas}
        itens={itensFiltrados}
        renderCard={renderCard}
        onMoverItem={handleMover}
        onCardClick={(item) => onAbrirCotacaoCompleta(item.cotacao.numero)}
        isLoading={false}
        emptyLabel="Nenhuma cotação"
        getItemLabel={(item) => item.cotacao.numero}
        getItemDate={(item) => item.cotacao.dataCriacao}
        toolbarSlot={toolbar}
        labels={{
          sortNewest: 'Mais recente primeiro',
          sortOldest: 'Mais antigo primeiro',
          sortAlpha: 'Ordem alfabética',
          sortPopoverTitle: 'Ordenar lista',
          sortPopoverClose: 'Fechar ordenação',
          sortButtonTitle: 'Ordenar coluna',
        }}
      />
    </div>
  )
}
