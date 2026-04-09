/**
 * KanbanPedidos.tsx — Visão Kanban do produto Pedido (customizado)
 *
 * Colunas = status do pedido (draft → aberto → transferencia → consolidado → cancelado)
 * Card customizado: numero, tipo, parceiro, data crítica com urgência, valor+moeda, saldo
 * Modal customizado: 4 abas (Pedido, Quantidades, Datas, Lembrete)
 * Configuração: preferências por usuário via /api/v1/pedidos/kanban/preferencias
 */

import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { KanbanGlobal } from '@nucleo/kanban-global'
import type { KanbanItem } from '@nucleo/kanban-global'
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
  Tag,
  X,
  ArrowSquareOut,
  Package,
  Scales,
  CalendarCheck,
  CalendarX,
} from '@phosphor-icons/react'
import { pedidoApi, pedidoConfigApi, kanbanConfigApi } from '../shared/api'
import type { Pedido, StatusPedido, PedidoStatusConfig, KanbanPreferencias } from '../shared/types'
import { KANBAN_PADRAO } from '../shared/types'
import { useNavigate } from 'react-router-dom'
import './KanbanPedidos.css'

// ── Colunas ───────────────────────────────────────────────────────────────────

const COLUNAS = [
  { key: 'draft',         label: 'Rascunho',    color: '#64748b', icon: <PencilSimple size={16} weight="duotone" /> },
  { key: 'aberto',        label: 'Aberto',      color: '#3b82f6', icon: <ArrowRight   size={16} weight="duotone" /> },
  { key: 'transferencia', label: 'Em Andamento',color: '#f97316', icon: <Spinner      size={16} weight="duotone" /> },
  { key: 'consolidado',   label: 'Consolidado', color: '#22c55e', icon: <CheckCircle  size={16} weight="duotone" /> },
  { key: 'cancelado',     label: 'Cancelado',   color: '#ef4444', icon: <XCircle      size={16} weight="duotone" />, isReadOnly: true },
]

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface PedidoKanbanItem extends KanbanItem {
  pedido: Pedido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna a menor data prevista não-nula entre pronto, inspeção e coleta */
function dataCritica(p: Pedido): { label: string; urgencia: 'ok' | 'alerta' | 'urgente' } | null {
  const candidatas = [
    p.data_prevista_pedido_pronto,
    p.data_prevista_inspecao_pedido,
    p.data_prevista_coleta_pedido,
  ].filter(Boolean) as string[]

  if (candidatas.length === 0) return null

  const datas = candidatas.map(d => new Date(d)).sort((a, b) => a.getTime() - b.getTime())
  const menor = datas[0]
  const hoje = new Date()
  const diffDias = Math.ceil((menor.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

  let urgencia: 'ok' | 'alerta' | 'urgente' = 'ok'
  if (diffDias <= 1) urgencia = 'urgente'
  else if (diffDias <= 7) urgencia = 'alerta'

  const label = menor.toLocaleDateString('pt-BR')
  return { label, urgencia }
}

function formatarValorCampo(p: Pedido, campo: string): string {
  const val = (p as unknown as Record<string, unknown>)[campo]
  if (val === null || val === undefined) return '—'
  if (campo.startsWith('data_') || campo.includes('_em')) {
    const d = new Date(val as string)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('pt-BR')
  }
  if (typeof val === 'number') {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (campo === 'tipo_operacao') return val === 'importacao' ? '↓ Importação' : '↑ Exportação'
  return String(val)
}

// ── Card ──────────────────────────────────────────────────────────────────────

function CardPedido({ item }: { item: PedidoKanbanItem }) {
  const p = item.pedido
  const critica = dataCritica(p)

  const tipoLabel = p.tipo_operacao === 'importacao' ? '↓ Importação' : '↑ Exportação'
  const tipoColor = p.tipo_operacao === 'importacao' ? '#818cf8' : '#34d399'

  const valorLabel = p.valor_total_pedido != null
    ? p.valor_total_pedido.toLocaleString('pt-BR', {
        minimumFractionDigits: p.casas_decimais_valor_pedido ?? 2,
        maximumFractionDigits: p.casas_decimais_valor_pedido ?? 2,
      })
    : null

  const saldoTotal = p.saldo_itens_do_pedido
  const qtdInicial = p.quantidade_total_inicial_pedido
  const saldoPct = (saldoTotal != null && qtdInicial != null && qtdInicial > 0)
    ? Math.max(0, Math.min(100, (saldoTotal / qtdInicial) * 100))
    : null

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{p.numero_pedido}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>{tipoLabel}</span>
      </div>

      {(p.nome_exportador || p.nome_importador) && (
        <div className="kbp-card-parceiro">
          {p.nome_exportador || p.nome_importador}
        </div>
      )}

      {critica && (
        <div className={`kbp-card-data-critica kbp-card-data-critica--${critica.urgencia}`}>
          <CalendarBlank size={11} />
          {critica.label}
        </div>
      )}

      <div className="kbp-card-footer">
        {valorLabel && (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {valorLabel} {p.moeda_pedido || 'USD'}
          </span>
        )}
        {p.incoterm && (
          <span className="kbp-card-incoterm">
            <ArrowsLeftRight size={10} />
            {p.incoterm}
          </span>
        )}
      </div>

      {saldoPct !== null && (
        <div className="kbp-card-saldo-wrap">
          <div className="kbp-card-saldo-bar">
            <div className="kbp-card-saldo-fill" style={{ width: `${saldoPct}%` }} />
          </div>
          <span className="kbp-card-saldo-label">
            {saldoTotal?.toLocaleString('pt-BR') ?? '—'} / {qtdInicial?.toLocaleString('pt-BR') ?? '—'}
          </span>
        </div>
      )}
    </div>
  )
}

// ── Modal Kanban Pedido ───────────────────────────────────────────────────────

type ModalAba = 'pedido' | 'quantidades' | 'datas' | 'lembrete'

interface ModalKanbanPedidoProps {
  pedido: Pedido | null
  aberto: boolean
  colunas: typeof COLUNAS
  preferencias: KanbanPreferencias | null
  onFechar: () => void
  onSalvarStatus: (novoStatus: string) => void
}

function ModalKanbanPedido({
  pedido,
  aberto,
  colunas,
  preferencias,
  onFechar,
  onSalvarStatus,
}: ModalKanbanPedidoProps) {
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState<ModalAba>('pedido')
  const [novoStatus, setNovoStatus] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (pedido) setNovoStatus(pedido.status)
    setAbaAtiva('pedido')
  }, [pedido])

  if (!aberto || !pedido) return null

  const prefs = preferencias ?? KANBAN_PADRAO

  // Campos visíveis por aba (respeitando visivel: false)
  const camposPedido     = (prefs.abas.find(a => a.aba === 'pedido')?.campos     ?? KANBAN_PADRAO.abas[0].campos).filter(c => c.visivel)
  const camposQuantidades = (prefs.abas.find(a => a.aba === 'quantidades')?.campos ?? KANBAN_PADRAO.abas[1].campos).filter(c => c.visivel)
  const camposDatas      = (prefs.abas.find(a => a.aba === 'datas')?.campos      ?? KANBAN_PADRAO.abas[2].campos).filter(c => c.visivel)

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) onFechar()
  }

  function handleSalvar() {
    if (pedido && novoStatus && novoStatus !== pedido.status) {
      onSalvarStatus(novoStatus)
    }
    onFechar()
  }

  const ABAS: { id: ModalAba; label: string }[] = [
    { id: 'pedido',      label: 'Pedido'      },
    { id: 'quantidades', label: 'Quantidades' },
    { id: 'datas',       label: 'Datas'       },
    { id: 'lembrete',    label: 'Lembrete'    },
  ]

  return (
    <div className="kbp-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="kbp-modal">
        {/* Header */}
        <div className="kbp-modal-header">
          <div className="kbp-modal-titulo-wrap">
            <span className="kbp-modal-numero">{pedido.numero_pedido}</span>
            <span className={`kbp-modal-tipo kbp-modal-tipo--${pedido.tipo_operacao}`}>
              {pedido.tipo_operacao === 'importacao' ? '↓ Importação' : '↑ Exportação'}
            </span>
          </div>
          <button type="button" className="kbp-modal-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Status (sempre visível) */}
        <div className="kbp-modal-status-row">
          <label className="kbp-modal-status-label">Status</label>
          <select
            className="kbp-modal-status-select"
            value={novoStatus}
            onChange={e => setNovoStatus(e.target.value)}
          >
            {colunas.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="kbp-modal-tabs">
          {ABAS.map(aba => (
            <button
              key={aba.id}
              type="button"
              className={`kbp-modal-tab${abaAtiva === aba.id ? ' kbp-modal-tab--ativo' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.label}
            </button>
          ))}
        </div>

        {/* Conteúdo das abas */}
        <div className="kbp-modal-body">

          {/* ABA: Pedido */}
          {abaAtiva === 'pedido' && (
            <div className="kbp-modal-aba-grid">
              {camposPedido.map(cfg => (
                <div key={cfg.campo} className="kbp-modal-campo">
                  <span className="kbp-modal-campo-label">{cfg.label}</span>
                  <span className="kbp-modal-campo-valor">
                    {formatarValorCampo(pedido, cfg.campo)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* ABA: Quantidades */}
          {abaAtiva === 'quantidades' && (
            <div className="kbp-modal-qtd-lista">
              {camposQuantidades.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo]
                const isSaldo = cfg.campo === 'saldo_itens_do_pedido'
                return (
                  <div key={cfg.campo} className={`kbp-modal-qtd-row${isSaldo ? ' kbp-modal-qtd-row--saldo' : ''}`}>
                    <span className="kbp-modal-qtd-label">
                      {isSaldo ? <Scales size={13} weight="duotone" /> : <Package size={13} weight="duotone" />}
                      {cfg.label}
                    </span>
                    <span className="kbp-modal-qtd-valor">
                      {val != null ? Number(val).toLocaleString('pt-BR') : '—'}
                    </span>
                  </div>
                )
              })}
              {Boolean((pedido as unknown as Record<string, unknown>)['unidade_comercializada_pedido']) && (
                <p className="kbp-modal-qtd-unidade">Unidade: {String((pedido as unknown as Record<string, unknown>)['unidade_comercializada_pedido'])}</p>
              )}
            </div>
          )}

          {/* ABA: Datas */}
          {abaAtiva === 'datas' && (
            <div className="kbp-modal-datas-lista">
              {camposDatas.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo] as string | null
                const d = val ? new Date(val) : null
                const hoje = new Date()
                const vencida = d && d < hoje && cfg.campo.includes('prevista')
                return (
                  <div key={cfg.campo} className="kbp-modal-data-row">
                    <span className="kbp-modal-data-label">
                      {vencida
                        ? <CalendarX size={13} weight="duotone" style={{ color: '#ef4444' }} />
                        : <CalendarCheck size={13} weight="duotone" />
                      }
                      {cfg.label}
                    </span>
                    <span className={`kbp-modal-data-valor${vencida ? ' kbp-modal-data-valor--vencida' : ''}`}>
                      {d ? d.toLocaleDateString('pt-BR') : '—'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {/* ABA: Lembrete */}
          {abaAtiva === 'lembrete' && (
            <div className="kbp-modal-lembrete">
              <p className="kbp-modal-lembrete-info">
                Configure lembretes para este pedido na tela de detalhe.
              </p>
              <button
                type="button"
                className="kbp-modal-btn-abrir"
                onClick={() => { navigate(`/pedidos/${pedido.id}`); onFechar() }}
              >
                <ArrowSquareOut size={15} weight="duotone" />
                Abrir pedido completo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="kbp-modal-footer">
          <button
            type="button"
            className="kbp-modal-btn-abrir"
            onClick={() => { navigate(`/pedidos/${pedido.id}`); onFechar() }}
          >
            <ArrowSquareOut size={15} weight="duotone" />
            Abrir pedido completo
          </button>
          <div className="kbp-modal-footer-actions">
            <button type="button" className="kbp-modal-btn-cancelar" onClick={onFechar}>
              Cancelar
            </button>
            <button type="button" className="kbp-modal-btn-salvar" onClick={handleSalvar}>
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function KanbanPedidos() {
  const [pedidos, setPedidos]           = useState<Pedido[]>([])
  const [statusConfig, setStatusConfig] = useState<PedidoStatusConfig[]>([])
  const [preferencias, setPreferencias] = useState<KanbanPreferencias | null>(null)
  const [loading, setLoading]           = useState(true)
  const [busca, setBusca]               = useState('')
  const [modalPedido, setModalPedido]   = useState<Pedido | null>(null)

  const carregar = useCallback(() => {
    setLoading(true)
    Promise.all([
      pedidoApi.listar({ limit: '1000' }),
      pedidoConfigApi.listarStatus().catch(() => ({ data: [] as PedidoStatusConfig[] })),
      kanbanConfigApi.obterPreferencias().catch(() => ({ data: null })),
    ])
      .then(([pedidosRes, statusRes, prefRes]) => {
        setPedidos(pedidosRes.data)
        setStatusConfig(statusRes.data)
        setPreferencias(prefRes.data)
      })
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { carregar() }, [carregar])

  useEffect(() => {
    const handleAtualizado = (e: Event) => {
      const { origem } = (e as CustomEvent<{ origem: string }>).detail
      if (origem !== 'kanban') carregar()
    }
    window.addEventListener('pedido:atualizado', handleAtualizado)
    return () => window.removeEventListener('pedido:atualizado', handleAtualizado)
  }, [carregar])

  const colunasComputadas = useMemo(() => {
    const chavesBase = new Set(COLUNAS.map(c => c.key))
    const customColunas = statusConfig
      .filter(s => !chavesBase.has(s.nome))
      .sort((a, b) => a.ordem - b.ordem)
      .map(s => ({
        key:   s.nome,
        label: s.rotulo,
        color: s.cor,
        icon:  <Tag size={16} weight="duotone" />,
      }))
    return [...COLUNAS, ...customColunas]
  }, [statusConfig])

  const itens = useMemo<PedidoKanbanItem[]>(() =>
    pedidos.map(p => ({ id: p.id, colunaKey: p.status, pedido: p })),
    [pedidos],
  )

  const itensFiltrados = useMemo(() => {
    if (!busca.trim()) return itens
    const q = busca.toLowerCase()
    return itens.filter(({ pedido: p }) =>
      [p.numero_pedido, p.nome_exportador, p.nome_importador, p.incoterm, p.status]
        .filter(Boolean).join(' ').toLowerCase().includes(q),
    )
  }, [itens, busca])

  async function handleMover(itemId: string, novaColunaKey: string) {
    setPedidos(prev =>
      prev.map(p => p.id === itemId ? { ...p, status: novaColunaKey as StatusPedido } : p),
    )
    await pedidoApi.alterarStatus(itemId, novaColunaKey)
    window.dispatchEvent(new CustomEvent('pedido:atualizado', { detail: { origem: 'kanban' } }))
  }

  async function handleSalvarStatus(novoStatus: string) {
    if (!modalPedido) return
    await handleMover(modalPedido.id, novoStatus)
  }

  const toolbar = (
    <div className="kbp-toolbar">
      <div className="kbp-search-wrap">
        <MagnifyingGlass size={15} className="kbp-search-icon" />
        <input
          type="text"
          className="kbp-search"
          placeholder="Localizar"
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
        colunas={colunasComputadas}
        itens={itensFiltrados}
        renderCard={(item) => <CardPedido item={item} />}
        onMoverItem={handleMover}
        onCardClick={(item) => setModalPedido(item.pedido)}
        isLoading={loading}
        skeletonCount={4}
        emptyLabel="Nenhum pedido"
        getItemLabel={(item) => item.pedido.numero_pedido}
        getItemDate={(item) => item.pedido.data_emissao_pedido}
        toolbarSlot={toolbar}
      />

      <ModalKanbanPedido
        pedido={modalPedido}
        aberto={modalPedido !== null}
        colunas={colunasComputadas}
        preferencias={preferencias}
        onFechar={() => setModalPedido(null)}
        onSalvarStatus={handleSalvarStatus}
      />
    </div>
  )
}
