/**
 * KanbanPedidos.tsx — Visão Kanban do produto Pedido
 *
 * Colunas = status do pedido (draft → aberto → transferencia → consolidado → cancelado)
 * Drag & drop chama pedidoApi.alterarStatus para persistir a mudança.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { KanbanGlobal, CardKanbanModal } from '@nucleo/kanban-global'
import type { KanbanItem, CardKanbanItem } from '@nucleo/kanban-global'
import {
  PencilSimple,
  Spinner,
  CheckCircle,
  XCircle,
  ArrowRight,
  CalendarBlank,
  ArrowsLeftRight,
  CurrencyDollar,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { pedidoApi } from '../shared/api'
import type { Pedido, StatusPedido } from '../shared/types'
import './KanbanPedidos.css'

// ── Colunas ───────────────────────────────────────────────────────────────────

const COLUNAS = [
  { key: 'draft',        label: 'Rascunho',        color: '#64748b', icon: <PencilSimple    size={16} weight="duotone" /> },
  { key: 'aberto',       label: 'Aberto',           color: '#3b82f6', icon: <ArrowRight      size={16} weight="duotone" /> },
  { key: 'transferencia',label: 'Em Andamento',     color: '#f97316', icon: <Spinner         size={16} weight="duotone" /> },
  { key: 'consolidado',  label: 'Consolidado',      color: '#22c55e', icon: <CheckCircle     size={16} weight="duotone" /> },
  { key: 'cancelado',    label: 'Cancelado',        color: '#ef4444', icon: <XCircle         size={16} weight="duotone" />, isReadOnly: true },
]

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface PedidoKanbanItem extends KanbanItem {
  pedido: Pedido
}

interface PedidoModalItem extends CardKanbanItem {
  pedido: Pedido
}

function toModalItem(item: PedidoKanbanItem): PedidoModalItem {
  const p = item.pedido
  return {
    id:         p.id,
    colunaKey:  p.status,
    nome:       p.numero_pedido,
    empresa:    p.exportador_nome || p.importador_nome || '—',
    responsavel: '—',
    valor:      p.valor_total_pedido ?? 0,
    data:       p.data_emissao_pedido || new Date().toISOString(),
    prioridade: 'media',
    pedido:     p,
  }
}

// ── Card ──────────────────────────────────────────────────────────────────────

function CardPedido({ item }: { item: PedidoKanbanItem }) {
  const p = item.pedido

  const dataLabel = p.data_emissao_pedido
    ? new Date(p.data_emissao_pedido).toLocaleDateString('pt-BR')
    : '—'

  const valorLabel = p.valor_total_pedido != null
    ? p.valor_total_pedido.toLocaleString('pt-BR', {
        style:                 'currency',
        currency:              p.moeda_pedido || 'USD',
        minimumFractionDigits: p.casas_decimais_total_pedido ?? 2,
        maximumFractionDigits: p.casas_decimais_total_pedido ?? 2,
      })
    : '—'

  const tipoLabel = p.tipo_operacao === 'importacao' ? '↓ Importação' : '↑ Exportação'
  const tipoColor = p.tipo_operacao === 'importacao' ? '#818cf8' : '#34d399'

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{p.numero_pedido}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>{tipoLabel}</span>
      </div>

      {(p.exportador_nome || p.importador_nome) && (
        <div className="kbp-card-parceiro">
          {p.exportador_nome || p.importador_nome}
        </div>
      )}

      <div className="kbp-card-footer">
        <span className="kbp-card-info">
          <CalendarBlank size={11} />
          {dataLabel}
        </span>
        <span className="kbp-card-valor">
          <CurrencyDollar size={11} />
          {valorLabel}
        </span>
      </div>

      {p.incoterm && (
        <div className="kbp-card-incoterm">
          <ArrowsLeftRight size={10} />
          {p.incoterm}
        </div>
      )}
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function KanbanPedidos() {
  const [pedidos, setPedidos]     = useState<Pedido[]>([])
  const [loading, setLoading]     = useState(true)
  const [busca, setBusca]         = useState('')
  const [modalItem, setModalItem] = useState<PedidoModalItem | null>(null)

  const carregar = useCallback(() => {
    setLoading(true)
    pedidoApi.listar()
      .then(res => setPedidos(res.data))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Sincroniza com a tela Lista: recarrega quando ela muta dados
  useEffect(() => {
    const handleAtualizado = (e: Event) => {
      const { origem } = (e as CustomEvent<{ origem: string }>).detail
      if (origem !== 'kanban') carregar()
    }
    window.addEventListener('pedido:atualizado', handleAtualizado)
    return () => window.removeEventListener('pedido:atualizado', handleAtualizado)
  }, [carregar])

  const itens = useMemo<PedidoKanbanItem[]>(() =>
    pedidos.map(p => ({ id: p.id, colunaKey: p.status, pedido: p })),
    [pedidos],
  )

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(({ pedido: p }) =>
      [p.numero_pedido, p.exportador_nome, p.importador_nome, p.incoterm, p.status]
        .filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }, [itens, busca])

  async function handleMover(itemId: string, novaColunaKey: string) {
    // Otimista: atualiza estado local imediatamente
    setPedidos(prev =>
      prev.map(p => p.id === itemId ? { ...p, status: novaColunaKey as StatusPedido } : p),
    )
    await pedidoApi.alterarStatus(itemId, novaColunaKey)
    // Notifica a Lista para se sincronizar
    window.dispatchEvent(new CustomEvent('pedido:atualizado', { detail: { origem: 'kanban' } }))
  }

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          placeholder="Buscar pedido, exportador, incoterm…"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      <span className="kbp-total">
        {itensFiltrados.length} pedido{itensFiltrados.length !== 1 ? 's' : ''}
      </span>
    </div>
  )

  return (
    <div className="kbp-page">
      <KanbanGlobal<PedidoKanbanItem>
        colunas={COLUNAS}
        itens={itensFiltrados}
        renderCard={(item) => <CardPedido item={item} />}
        onMoverItem={handleMover}
        onCardClick={(item) => setModalItem(toModalItem(item))}
        isLoading={loading}
        skeletonCount={4}
        emptyLabel="Nenhum pedido"
        getItemLabel={(item) => item.pedido.numero_pedido}
        getItemDate={(item) => item.pedido.data_emissao_pedido}
        toolbarSlot={toolbar}
      />

      <CardKanbanModal<PedidoModalItem>
        aberto={modalItem !== null}
        item={modalItem}
        colunas={COLUNAS}
        onFechar={() => setModalItem(null)}
        onSalvar={() => setModalItem(null)}
      />
    </div>
  )
}
