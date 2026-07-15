/**
 * KanbanSimuladorPedido — paridade visual com PedidosKanban.tsx (marketing).
 */

import { useCallback, useMemo, useState, type ReactElement } from 'react'
import { KanbanGlobal } from '@nucleo/kanban-global'
import {
  ArrowRight,
  ArrowsLeftRight,
  CalendarBlank,
  CheckCircle,
  CurrencyDollar,
  MagnifyingGlass,
  Package,
  PencilSimple,
  Spinner,
  Tag,
  XCircle,
} from '@phosphor-icons/react'
import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import {
  COLUNAS_KANBAN_SIMULADOR_PEDIDO,
  KANBAN_PREFS_SIMULADOR_PEDIDO,
  listarPedidosKanbanSimulador,
  pedidosKanbanParaItens,
  type PedidoKanbanItemSimulador,
  type PedidoKanbanSimulador,
  type StatusKanbanPedidoSimulador,
} from './dados-kanban-simulador-pedido'
import { ModalKanbanSimuladorPedido } from './modal-kanban-simulador-pedido'
import './kanban-simulador-pedido.css'

const COLUNAS_BASE_ICONES: Record<string, ReactElement> = {
  rascunho: <PencilSimple size={16} weight="duotone" />,
  aberto: <ArrowRight size={16} weight="duotone" />,
  em_andamento: <Spinner size={16} weight="duotone" />,
  aprovado: <CheckCircle size={16} weight="duotone" />,
  transferencia: <ArrowsLeftRight size={16} weight="duotone" />,
  consolidado: <Package size={16} weight="duotone" />,
  cancelado: <XCircle size={16} weight="duotone" />,
}

function dataCriticaCard(
  pedido: PedidoKanbanSimulador,
  campo: string | null,
): { label: string; urgencia: 'ok' | 'alerta' | 'urgente' } | null {
  if (!campo) return null
  const val = (pedido as unknown as Record<string, unknown>)[campo]
  if (!val) return null
  const data = new Date(String(val))
  if (Number.isNaN(data.getTime())) return null
  const hoje = new Date()
  const diffDias = Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  let urgencia: 'ok' | 'alerta' | 'urgente' = 'ok'
  if (diffDias <= 1) urgencia = 'urgente'
  else if (diffDias <= 7) urgencia = 'alerta'
  return { label: data.toLocaleDateString('pt-BR'), urgencia }
}

function CardKanbanSimuladorPedido({
  item,
}: {
  item: PedidoKanbanItemSimulador
}) {
  const p = item.pedido
  const cardConfig = KANBAN_PREFS_SIMULADOR_PEDIDO.card
  const campos = cardConfig.campos
  const isVisivel = (campo: string) => campos.find(c => c.campo === campo)?.visivel ?? false
  const critica = dataCriticaCard(p, cardConfig.dataCritica)
  const tipoLabel = p.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'
  const tipoColor = p.tipo_operacao === 'importacao' ? '#818cf8' : '#34d399'
  const valorLabel = p.valor_total_pedido != null
    ? p.valor_total_pedido.toLocaleString('pt-BR', {
      minimumFractionDigits: p.casas_decimais_valor_pedido,
      maximumFractionDigits: p.casas_decimais_valor_pedido,
    })
    : null

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{p.numero_pedido}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>{tipoLabel}</span>
      </div>

      {isVisivel('nome_exportador') && p.nome_exportador && (
        <div className="kbp-card-parceiro">{p.nome_exportador}</div>
      )}

      {isVisivel('nome_importador') && p.nome_importador && (
        <div className="kbp-card-parceiro">{p.nome_importador}</div>
      )}

      {critica && (
        <div className={`kbp-card-data-critica kbp-card-data-critica--${critica.urgencia}`}>
          <CalendarBlank size={11} />
          {critica.label}
        </div>
      )}

      <div className="kbp-card-footer">
        {isVisivel('valor_total_pedido') && valorLabel != null && (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {valorLabel} {p.moeda_pedido}
          </span>
        )}
        {isVisivel('incoterm') && p.incoterm && (
          <span className="kbp-card-incoterm">
            <ArrowsLeftRight size={10} />
            {p.incoterm}
          </span>
        )}
        {isVisivel('numero_invoice') && p.numero_invoice && (
          <span className="kbp-card-incoterm">INV {p.numero_invoice}</span>
        )}
      </div>
    </div>
  )
}

export interface KanbanSimuladorPedidoProps {
  empresasSelecionadas: PerfilEmpresaSimulador[]
  onAbrirPedidoCompleto: (numeroPedido: string) => void
}

export function KanbanSimuladorPedido({
  empresasSelecionadas,
  onAbrirPedidoCompleto,
}: KanbanSimuladorPedidoProps) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, StatusKanbanPedidoSimulador>>({})
  const [busca, setBusca] = useState('')
  const [modalPedido, setModalPedido] = useState<PedidoKanbanSimulador | null>(null)

  const pedidos = useMemo(() => {
    const base = listarPedidosKanbanSimulador(empresasSelecionadas)
    return base.map(p => ({
      ...p,
      status: statusOverrides[p.id] ?? p.status,
    }))
  }, [empresasSelecionadas, statusOverrides])

  const colunas = useMemo(
    () => COLUNAS_KANBAN_SIMULADOR_PEDIDO.map(col => ({
      ...col,
      icon: COLUNAS_BASE_ICONES[col.key] ?? <Tag size={16} weight="duotone" />,
    })),
    [],
  )

  const itens = useMemo(
    () => pedidosKanbanParaItens(pedidos),
    [pedidos],
  )

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(({ pedido: p }) =>
      [p.numero_pedido, p.nome_exportador, p.nome_importador, p.incoterm, p.status]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [itens, busca])

  const handleMover = useCallback((itemId: string, novaColunaKey: string) => {
    setStatusOverrides(prev => ({
      ...prev,
      [itemId]: novaColunaKey as StatusKanbanPedidoSimulador,
    }))
    setModalPedido(prev =>
      prev?.id === itemId
        ? { ...prev, status: novaColunaKey as StatusKanbanPedidoSimulador }
        : prev,
    )
  }, [])

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          placeholder="Localizar pedido..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      <span className="kbp-total">
        {itensFiltrados.length} pedidos
      </span>
    </div>
  )

  return (
    <div className="pds-kanban-simulador kbp-page" data-sds-tutorial-alvo="pedido-kanban-colunas">
      <KanbanGlobal<PedidoKanbanItemSimulador>
        colunas={colunas}
        itens={itensFiltrados}
        renderCard={item => <CardKanbanSimuladorPedido item={item} />}
        onMoverItem={handleMover}
        onCardClick={item => setModalPedido(item.pedido)}
        isLoading={false}
        skeletonCount={5}
        emptyLabel="Nenhum pedido encontrado"
        getItemLabel={item => item.pedido.numero_pedido}
        getItemDate={item => item.pedido.data_emissao_pedido ?? undefined}
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

      <ModalKanbanSimuladorPedido
        pedido={modalPedido}
        aberto={modalPedido !== null}
        colunas={colunas}
        onFechar={() => setModalPedido(null)}
        onAbrirPedidoCompleto={onAbrirPedidoCompleto}
      />
    </div>
  )
}
