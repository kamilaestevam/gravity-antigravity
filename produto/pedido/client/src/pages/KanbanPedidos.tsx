/**
 * KanbanPedidos.tsx — Visão Kanban do produto Pedido (customizado)
 *
 * Colunas = reflexo 1:1 do Status config do tenant (GET /api/v1/pedidos/config/status)
 * Ordem, label e cor vêm da API. Ícone e isReadOnly caem para COLUNAS_BASE como fallback.
 * Card customizado: numero, tipo, parceiro, data crítica com urgência, valor+moeda, saldo
 * Modal customizado: 4 abas (Pedido, Quantidades, Datas, Lembrete)
 * Configuração: preferências por usuário via /api/v1/pedidos/kanban/preferencias
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
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
  ArrowSquareOut,
  Package,
  Scales,
  CalendarCheck,
  CalendarX,
  X,
  Bell,
} from '@phosphor-icons/react'
import { pedidoApi, pedidoConfigApi, kanbanConfigApi } from '../shared/api'
import type { Pedido, StatusPedido, PedidoStatusConfig, KanbanPreferencias, KanbanCardConfig } from '../shared/types'
import { KANBAN_PADRAO, STATUS_PEDIDO_LABELS } from '../shared/types'
import { computarColunasKanban, IS_READ_ONLY_MAP, COLUNAS_FALLBACK_SHAPE } from '../shared/kanbanUtils'
export { computarColunasKanban, IS_READ_ONLY_MAP }
import { useNavigate } from 'react-router-dom'
import { useTrackBehavior } from '../hooks/useTrackBehavior'
import './KanbanPedidos.css'

// ── Colunas base — apenas ícone (label/cor/ordem vêm da API via kanbanUtils) ──

const COLUNAS_BASE: Record<string, { icon: React.ReactElement }> = {
  draft:         { icon: <PencilSimple size={16} weight="duotone" /> },
  aberto:        { icon: <ArrowRight   size={16} weight="duotone" /> },
  transferencia: { icon: <Spinner      size={16} weight="duotone" /> },
  consolidado:   { icon: <CheckCircle  size={16} weight="duotone" /> },
  cancelado:     { icon: <XCircle      size={16} weight="duotone" /> },
}

// Fallback com ícones — usado quando a API falha (degradação graciosa)
const COLUNAS_FALLBACK = COLUNAS_FALLBACK_SHAPE.map(s => ({
  ...s,
  icon: COLUNAS_BASE[s.key]?.icon ?? <Tag size={16} weight="duotone" />,
}))

// ── Tipos locais ──────────────────────────────────────────────────────────────

interface PedidoKanbanItem extends KanbanItem {
  pedido: Pedido
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Retorna a data crítica do campo configurado (ou null se não configurado / sem valor) */
function dataCritica(p: Pedido, campo: string | null): { label: string; urgencia: 'ok' | 'alerta' | 'urgente' } | null {
  if (!campo) return null
  const val = (p as unknown as Record<string, unknown>)[campo]
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

function formatarValorCampo(p: Pedido, campo: string): string {
  const val = (p as unknown as Record<string, unknown>)[campo]
  if (val === null || val === undefined) return '—'
  if (campo.startsWith('data_') || campo.includes('_em')) {
    const d = new Date(val as string)
    return isNaN(d.getTime()) ? String(val) : d.toLocaleDateString('pt-BR')
  }
  if (typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '')) {
    const n = typeof val === 'number' ? val : Number(val)
    return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (campo === 'tipo_operacao') return val === 'importacao' ? '↓ Importação' : '↑ Exportação'
  return String(val)
}

// ── Card ──────────────────────────────────────────────────────────────────────

function CardPedido({ item, cardConfig }: { item: PedidoKanbanItem; cardConfig: KanbanCardConfig }) {
  const p = item.pedido
  const campos = cardConfig.campos
  const isVisivel = (campo: string) => campos.find(c => c.campo === campo)?.visivel ?? false

  const critica = dataCritica(p, cardConfig.dataCritica)

  const tipoLabel = p.tipo_operacao === 'importacao' ? '↓ Importação' : '↑ Exportação'
  const tipoColor = p.tipo_operacao === 'importacao' ? '#818cf8' : '#34d399'

  const valorLabel = p.valor_total_pedido != null
    ? p.valor_total_pedido.toLocaleString('pt-BR', {
        minimumFractionDigits: p.casas_decimais_valor_pedido ?? 2,
        maximumFractionDigits: p.casas_decimais_valor_pedido ?? 2,
      })
    : null

  const saldoTotal = p.saldo_itens_do_pedido
  const qtdInicial = p.quantidade_total_pedido
  const saldoPct = (saldoTotal != null && qtdInicial != null && qtdInicial > 0)
    ? Math.max(0, Math.min(100, (saldoTotal / qtdInicial) * 100))
    : null

  const exportador = p.nome_exportador
  const importador = p.nome_importador

  return (
    <div className="kbp-card">
      <div className="kbp-card-header">
        <span className="kbp-card-numero">{p.numero_pedido}</span>
        <span className="kbp-card-tipo" style={{ color: tipoColor }}>{tipoLabel}</span>
      </div>

      {isVisivel('nome_exportador') && exportador && (
        <div className="kbp-card-parceiro">{exportador}</div>
      )}

      {isVisivel('nome_importador') && importador && (
        <div className="kbp-card-parceiro">{importador}</div>
      )}

      {isVisivel('numero_itens_pedido') && (
        <div className="kbp-card-itens">
          <Package size={11} />
          {String((p as unknown as Record<string, unknown>)['numero_itens_pedido'] ?? '—')} itens
        </div>
      )}

      {isVisivel('status') && p.status && (
        <div className="kbp-card-status">{STATUS_PEDIDO_LABELS[p.status] ?? p.status}</div>
      )}

      {critica && (
        <div className={`kbp-card-data-critica kbp-card-data-critica--${critica.urgencia}`}>
          <CalendarBlank size={11} />
          {critica.label}
        </div>
      )}

      <div className="kbp-card-footer">
        {isVisivel('valor_total_pedido') && valorLabel && (
          <span className="kbp-card-valor">
            <CurrencyDollar size={11} />
            {valorLabel} {p.moeda_pedido || 'USD'}
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
        {isVisivel('numero_proforma') && p.numero_proforma && (
          <span className="kbp-card-incoterm">PRO {p.numero_proforma}</span>
        )}
      </div>

      {isVisivel('saldo_bar') && saldoPct !== null && (
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

interface ModalKanbanPedidoProps {
  pedido: Pedido | null
  aberto: boolean
  colunas: typeof COLUNAS_FALLBACK
  preferencias: KanbanPreferencias | null
  onFechar: () => void
}

function ModalKanbanPedido({
  pedido,
  aberto,
  colunas,
  preferencias,
  onFechar,
}: ModalKanbanPedidoProps) {
  const navigate = useNavigate()
  const [abaAtiva, setAbaAtiva] = useState('pedido')

  useEffect(() => {
    if (pedido) setAbaAtiva('pedido')
  }, [pedido])

  // ESC + scroll lock
  useEffect(() => {
    if (!aberto) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onFechar() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [aberto, onFechar])

  if (!aberto || !pedido) return null

  const prefs = preferencias ?? KANBAN_PADRAO

  const camposPedido      = (prefs.abas.find(a => a.aba === 'pedido')?.campos      ?? KANBAN_PADRAO.abas[0].campos).filter(c => c.visivel)
  const camposQuantidades = (prefs.abas.find(a => a.aba === 'quantidades')?.campos  ?? KANBAN_PADRAO.abas[1].campos).filter(c => c.visivel)
  const camposDatas       = (prefs.abas.find(a => a.aba === 'datas')?.campos        ?? KANBAN_PADRAO.abas[2].campos).filter(c => c.visivel)

  const colunaAtual  = colunas.find(c => c.key === pedido.status)
  const statusCor    = colunaAtual?.color ?? '#64748b'
  const statusRotulo = colunaAtual?.label ?? pedido.status

  function abrirNoCampo(campo: string) {
    navigate('/pedidos', { state: { openPedidoId: pedido!.id, editCampo: campo, numeroPedido: pedido!.numero_pedido } })
    onFechar()
  }

  function abrirCompleto() {
    navigate('/pedidos', { state: { numeroPedido: pedido!.numero_pedido } })
    onFechar()
  }

  const ABAS_MODAL = [
    { id: 'pedido',      rotulo: 'Pedido',      icone: <PencilSimple size={13} weight="duotone" /> },
    { id: 'quantidades', rotulo: 'Quantidades', icone: <Package      size={13} weight="duotone" /> },
    { id: 'datas',       rotulo: 'Datas',        icone: <CalendarBlank size={13} weight="duotone" /> },
    { id: 'lembrete',    rotulo: 'Lembrete',     icone: <Bell         size={13} weight="duotone" /> },
  ]

  const hoje = new Date()

  const modal = (
    <div className="kbp-modal-overlay" onClick={e => { if (e.target === e.currentTarget) onFechar() }}>
      <div className="kbp-modal-dialog" role="dialog" aria-modal="true" aria-label={pedido.numero_pedido}>

        {/* ── Header ── */}
        <div className="kbp-modal-cabecalho">
          <div className="kbp-modal-titulo-wrap">
            <span className="kbp-modal-numero">{pedido.numero_pedido}</span>
            <span className={`kbp-modal-tipo kbp-modal-tipo--${pedido.tipo_operacao}`}>
              {pedido.tipo_operacao === 'importacao' ? '↓ Importação' : '↑ Exportação'}
            </span>
          </div>
          <div className="kbp-modal-status-row">
            <span className="kbp-modal-status-label">STATUS</span>
            <button
              type="button"
              className="kbp-modal-status-badge kbp-modal-campo--clicavel"
              onClick={() => abrirNoCampo('status')}
              title="Clique para editar na lista"
              style={{ color: statusCor, background: `${statusCor}1a`, borderColor: `${statusCor}40` }}
            >
              <span className="kbp-modal-status-dot" style={{ background: statusCor }} />
              {statusRotulo}
              <PencilSimple size={10} weight="bold" className="kbp-modal-campo-edit-icon" />
            </button>
          </div>
          <button className="kbp-modal-btn-fechar" onClick={onFechar} aria-label="Fechar">
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* ── Abas ── */}
        <nav className="kbp-modal-abas" role="tablist">
          {ABAS_MODAL.map(aba => (
            <button
              key={aba.id}
              role="tab"
              aria-selected={abaAtiva === aba.id}
              className={`kbp-modal-aba${abaAtiva === aba.id ? ' kbp-modal-aba--ativa' : ''}`}
              onClick={() => setAbaAtiva(aba.id)}
            >
              {aba.icone}{aba.rotulo}
            </button>
          ))}
        </nav>

        {/* ── Body ── */}
        <div className="kbp-modal-body" role="tabpanel">
          {abaAtiva === 'pedido' && (
            <div className="kbp-modal-aba-grid">
              {camposPedido.map(cfg => (
                <div key={cfg.campo} className="kbp-modal-campo kbp-modal-campo--clicavel" onClick={() => abrirNoCampo(cfg.campo)} title="Clique para editar">
                  <span className="kbp-modal-campo-label">{cfg.label}</span>
                  <span className="kbp-modal-campo-valor">{formatarValorCampo(pedido, cfg.campo)}</span>
                  <PencilSimple size={11} className="kbp-modal-campo-edit-icon" weight="bold" />
                </div>
              ))}
            </div>
          )}

          {abaAtiva === 'quantidades' && (
            <div className="kbp-modal-qtd-lista">
              {camposQuantidades.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo]
                const isSaldo = cfg.campo === 'saldo_itens_do_pedido'
                return (
                  <div key={cfg.campo} className={`kbp-modal-qtd-row kbp-modal-campo--clicavel${isSaldo ? ' kbp-modal-qtd-row--saldo' : ''}`} onClick={() => abrirNoCampo(cfg.campo)} title="Clique para ver itens">
                    <span className="kbp-modal-qtd-label">
                      {isSaldo ? <Scales size={13} weight="duotone" /> : <Package size={13} weight="duotone" />}
                      {cfg.label}
                    </span>
                    <span className="kbp-modal-valor-grupo">
                      <span className="kbp-modal-qtd-valor">
                        {val != null ? Number(val).toLocaleString('pt-BR') : '—'}
                      </span>
                      <PencilSimple size={11} className="kbp-modal-campo-edit-icon" weight="bold" />
                    </span>
                  </div>
                )
              })}
              {Boolean((pedido as unknown as Record<string, unknown>)['unidade_comercializada_pedido']) && (
                <p className="kbp-modal-qtd-unidade">Unidade: {String((pedido as unknown as Record<string, unknown>)['unidade_comercializada_pedido'])}</p>
              )}
            </div>
          )}

          {abaAtiva === 'datas' && (
            <div className="kbp-modal-datas-lista">
              {camposDatas.map(cfg => {
                const val = (pedido as unknown as Record<string, unknown>)[cfg.campo] as string | null
                const d = val ? new Date(val) : null
                const vencida = d && d < hoje && cfg.campo.includes('prevista')
                return (
                  <div key={cfg.campo} className="kbp-modal-data-row kbp-modal-campo--clicavel" onClick={() => abrirNoCampo(cfg.campo)} title="Clique para editar">
                    <span className="kbp-modal-data-label">
                      {vencida
                        ? <CalendarX size={13} weight="duotone" className="kbp-icon-vencida" />
                        : <CalendarCheck size={13} weight="duotone" />
                      }
                      {cfg.label}
                    </span>
                    <span className="kbp-modal-valor-grupo">
                      <span className={`kbp-modal-data-valor${vencida ? ' kbp-modal-data-valor--vencida' : ''}`}>
                        {d ? d.toLocaleDateString('pt-BR') : '—'}
                      </span>
                      <PencilSimple size={11} className="kbp-modal-campo-edit-icon" weight="bold" />
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {abaAtiva === 'lembrete' && (
            <div className="kbp-modal-lembrete">
              <p className="kbp-modal-lembrete-info">Configure lembretes para este pedido na tela de detalhe.</p>
              <button type="button" className="kbp-modal-btn-abrir" onClick={abrirCompleto}>
                <ArrowSquareOut size={15} weight="duotone" />
                Abrir pedido completo
              </button>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="kbp-modal-footer">
          <button type="button" className="kbp-modal-btn-abrir" onClick={abrirCompleto}>
            <ArrowSquareOut size={15} weight="duotone" />
            Abrir pedido completo
          </button>
          <button type="button" className="kbp-modal-btn-fechar-footer" onClick={onFechar}>
            <X size={13} weight="bold" />
            Fechar
          </button>
        </div>

      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function KanbanPedidos() {
  const [pedidos, setPedidos]           = useState<Pedido[]>([])
  const [statusConfig, setStatusConfig] = useState<PedidoStatusConfig[]>([])
  const [preferencias, setPreferencias] = useState<KanbanPreferencias | null>(null)
  const [loading, setLoading]           = useState(true)
  const [busca, setBusca]               = useState('')
  const [modalPedido, setModalPedido]   = useState<Pedido | null>(null)
  const { trackFilter } = useTrackBehavior()

  const carregar = useCallback(() => {
    setLoading(true)
    Promise.all([
      pedidoApi.listar({ limit: '1000' }),
      pedidoConfigApi.listarStatus().catch((err: unknown) => {
        console.error('[KANBAN] Falha ao carregar status config:', err instanceof Error ? err.message : err)
        return { data: [] as PedidoStatusConfig[] }
      }),
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

  useEffect(() => {
    const handlePrefsAtualizadas = () => {
      kanbanConfigApi.obterPreferencias()
        .then(res => setPreferencias(res.data))
        .catch(() => {})
    }
    window.addEventListener('kanban:preferencias:atualizadas', handlePrefsAtualizadas)
    return () => window.removeEventListener('kanban:preferencias:atualizadas', handlePrefsAtualizadas)
  }, [])

  // Colunas = reflexo 1:1 do Status config. Se a API falhar, usa COLUNAS_FALLBACK.
  const colunasComputadas = useMemo(() => {
    const ocultas = new Set(preferencias?.colunas_ocultas ?? [])
    const configFiltrado = statusConfig.filter(s => !ocultas.has(s.nome))
    if (!statusConfig.length) return COLUNAS_FALLBACK
    if (!configFiltrado.length) return []
    const shapes = computarColunasKanban(configFiltrado)
    return shapes.map(s => ({
      ...s,
      icon: COLUNAS_BASE[s.key]?.icon ?? <Tag size={16} weight="duotone" />,
    }))
  }, [statusConfig, preferencias])

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
        onBlur={e => { if (e.target.value.trim()) trackFilter('busca', e.target.value.trim()) }}
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
        renderCard={(item) => <CardPedido item={item} cardConfig={(preferencias ?? KANBAN_PADRAO).card ?? KANBAN_PADRAO.card} />}
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
      />
    </div>
  )
}
