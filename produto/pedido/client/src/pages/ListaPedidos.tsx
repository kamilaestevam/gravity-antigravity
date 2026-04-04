/**
 * ListaPedidos.tsx — Tela principal do produto Pedido
 *
 * Tabela virtualizada com TabelaVirtualGlobal (TanStack Virtual v3).
 * Suporta até 1 milhão de linhas via cursor keyset pagination.
 *
 * Hierarquia: Pedido (pai) → PedidoItem (filho expandível)
 *
 * Filtros de coluna: client-side, chips ativos, popover por coluna.
 */

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useShellStore } from '@gravity/shell'
import {
  Package,
  Plus,
  CaretDown,
  Eye,
  PencilSimple,
  Trash,
  CurrencyDollar,
  Scales,
  Warning,
  ArrowRight,
  DownloadSimple,
  ArrowsClockwise,
  X,
  UploadSimple,
  CheckSquare,
  ArrowsLeftRight,
  PencilLine,
  Sparkle,
  CopySimple,
  FilePdf,
  ArrowUp,
  ArrowDown,
  PlusCircle,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTMapaColunasFilho,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import {
  pedidoApi,
  pedidoVirtualApi,
  pedidoConfigApi,
  pedidoLoteApi,
  pedidoItemApi,
  pedidoDuplicarApi,
  pedidoExcluirApi,
  colunasUsuarioApi,
} from '../shared/api'
import { ModalConsolidar } from '../components/ModalConsolidar'
import '../components/ModalConsolidar.css'
import { ModalGerarPdf } from '../components/ModalGerarPdf'
import '../components/ModalGerarPdf.css'
import { ModalDuplicar } from '../components/ModalDuplicar'
import '../components/ModalDuplicar.css'
import { ModalTransferir } from '../components/ModalTransferir'
import '../components/ModalTransferir.css'
import { ModalEdicaoEmMassa } from '../components/ModalEdicaoEmMassa'
import '../components/ModalEdicaoEmMassa.css'
import { DrawerPedido } from '../components/DrawerPedido'
import '../components/DrawerPedido.css'
import { SmartImportModal } from '../components/SmartImport/SmartImportModal'
import '../components/SmartImport/SmartImportModal.css'
import type {
  Pedido,
  PedidoItem,
  PedidoStatusConfig,
  PedidoPreferenciasColunas,
  ColunaUsuario,
} from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtMoeda,
  fmtData,
} from '../shared/types'
import './ListaPedidos.css'

// ── Status: cores padrão e leitura de localStorage ───────────────────────────

const PEDIDO_STATUS_STORAGE_KEY = 'pedido:status_config'

/** Cores padrão por código de status (backend) */
const STATUS_CORES_DEFAULT: Record<string, string> = {
  draft:         '#94a3b8',
  aberto:        '#60a5fa',
  transferencia: '#818cf8',
  consolidado:   '#a78bfa',
  cancelado:     '#f87171',
}

/** Lê o mapa {id → cor} salvo pelo Configuracoes via localStorage */
function lerStatusCores(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PEDIDO_STATUS_STORAGE_KEY)
    if (!raw) return {}
    const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
    // mapeia por id direto
    const mapa: Record<string, string> = {}
    for (const [id, cfg] of Object.entries(parsed)) mapa[id] = cfg.cor
    return mapa
  } catch { return {} }
}

function getStatusCor(status: string): string {
  const local = lerStatusCores()
  return local[status] ?? STATUS_CORES_DEFAULT[status] ?? '#64748b'
}

// ── Tipos de filtro ───────────────────────────────────────────────────────────

type FiltroTexto  = { tipo: 'texto';  valor: string }
type FiltroEnum   = { tipo: 'enum';   valor: Set<string> }
type FiltroNumero = { tipo: 'numero'; valor: { min?: number; max?: number } }
type FiltroAtivo  = FiltroTexto | FiltroEnum | FiltroNumero

type FiltrosAtivosMap = Record<string, FiltroAtivo>

// ── Subcomponente: Popover de filtro por coluna ───────────────────────────────

interface FiltroPopoverColunaProps {
  campo: string
  label: string
  tipo: 'texto' | 'numero' | 'enum'
  filtroAtual: FiltroAtivo | undefined
  valoresUnicos: string[]
  onAplicar: (campo: string, filtro: FiltroAtivo) => void
  onLimpar: (campo: string) => void
  onOrdenar: (campo: string, dir: 'asc' | 'desc') => void
  onFechar: () => void
  anchorRef: React.RefObject<HTMLElement>
}

function FiltroPopoverColuna({
  campo,
  label,
  tipo,
  filtroAtual,
  valoresUnicos,
  onAplicar,
  onLimpar,
  onOrdenar,
  onFechar,
  anchorRef,
}: FiltroPopoverColunaProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      const left = Math.max(8, rect.left - 20)
      const top = rect.bottom + 6
      setPos({ top, left })
    }
  }, [anchorRef])

  useEffect(() => {
    function fora(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        anchorRef.current &&
        !anchorRef.current.contains(e.target as Node)
      ) {
        onFechar()
      }
    }
    document.addEventListener('mousedown', fora)
    return () => document.removeEventListener('mousedown', fora)
  }, [onFechar, anchorRef])

  const [textoLocal, setTextoLocal] = React.useState(
    filtroAtual?.tipo === 'texto' ? filtroAtual.valor : '',
  )
  const [enumLocal, setEnumLocal] = React.useState<Set<string>>(
    filtroAtual?.tipo === 'enum' ? new Set(filtroAtual.valor) : new Set(),
  )
  const [enumBusca, setEnumBusca] = React.useState('')
  const [minLocal, setMinLocal] = React.useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.min != null
      ? String(filtroAtual.valor.min)
      : '',
  )
  const [maxLocal, setMaxLocal] = React.useState(
    filtroAtual?.tipo === 'numero' && filtroAtual.valor.max != null
      ? String(filtroAtual.valor.max)
      : '',
  )

  function aplicar() {
    if (tipo === 'texto' && valoresUnicos.length === 0) {
      if (textoLocal.trim()) {
        onAplicar(campo, { tipo: 'texto', valor: textoLocal.trim() })
      } else {
        onLimpar(campo)
      }
    } else if (tipo === 'enum' || (tipo === 'texto' && valoresUnicos.length > 0)) {
      if (enumLocal.size > 0) {
        onAplicar(campo, { tipo: 'enum', valor: new Set(enumLocal) })
      } else {
        onLimpar(campo)
      }
    } else if (tipo === 'numero') {
      const min = minLocal !== '' ? Number(minLocal) : undefined
      const max = maxLocal !== '' ? Number(maxLocal) : undefined
      if (min != null || max != null) {
        onAplicar(campo, { tipo: 'numero', valor: { min, max } })
      } else {
        onLimpar(campo)
      }
    }
    onFechar()
  }

  function limpar() {
    onLimpar(campo)
    onFechar()
  }

  const valoresFiltrados = valoresUnicos.filter(v =>
    v.toLowerCase().includes(enumBusca.toLowerCase()),
  )

  return (
    <div
      ref={ref}
      className="gtv-export-menu"
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        minWidth: 230,
        maxWidth: 290,
        padding: 0,
        zIndex: 9999,
        background: '#1e2130',
      }}
      role="dialog"
      aria-label={`Filtrar coluna ${label}`}
    >
      {/* Cabeçalho — nome da coluna */}
      <div className="lp-filtro-coluna-nome">{label.toUpperCase()}</div>

      {/* Ordenar */}
      <div className="gtv-col-acoes" style={{ flexDirection: 'row', gap: '0.25rem', padding: '0.375rem 0.5rem' }}>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'asc'); onFechar() }}
        >
          <ArrowUp size={11} weight="bold" /> Cresc.
        </button>
        <button
          type="button"
          className="gtv-col-acao-btn"
          style={{ flex: 1, justifyContent: 'center' }}
          onClick={() => { onOrdenar(campo, 'desc'); onFechar() }}
        >
          <ArrowDown size={11} weight="bold" /> Decresc.
        </button>
      </div>

      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />

      {/* Filtrar por — texto (livre, apenas quando não há valores conhecidos) */}
      {tipo === 'texto' && valoresUnicos.length === 0 && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">FILTRAR POR</div>
          <div className="gtv-col-busca" style={{ borderRadius: '6px', marginTop: '0.25rem' }}>
            <input
              type="text"
              className="gtv-col-busca-input"
              placeholder="Buscar..."
              value={textoLocal}
              onChange={e => setTextoLocal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') aplicar() }}
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Filtrar por — enum (checkboxes) — também para texto com valores conhecidos */}
      {(tipo === 'enum' || (tipo === 'texto' && valoresUnicos.length > 0)) && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">FILTRAR POR</div>
          {valoresUnicos.length > 6 && (
            <div className="gtv-col-busca" style={{ borderRadius: '6px', margin: '0.25rem 0' }}>
              <input
                type="text"
                className="gtv-col-busca-input"
                placeholder="Buscar..."
                value={enumBusca}
                onChange={e => setEnumBusca(e.target.value)}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', maxHeight: 168, overflowY: 'auto', padding: '0.25rem 0' }}>
            {valoresFiltrados.length > 0 ? valoresFiltrados.map(v => (
              <label
                key={v}
                className="gtv-export-item"
                style={{ cursor: 'pointer', gap: '0.5rem', padding: '0.3rem 0.5rem', borderRadius: '6px' }}
              >
                <input
                  type="checkbox"
                  checked={enumLocal.has(v)}
                  style={{ accentColor: 'var(--gtv-accent, #818cf8)', cursor: 'pointer', flexShrink: 0 }}
                  onChange={() => {
                    const novo = new Set(enumLocal)
                    if (novo.has(v)) novo.delete(v)
                    else novo.add(v)
                    setEnumLocal(novo)
                    if (novo.size > 0) onAplicar(campo, { tipo: 'enum', valor: novo })
                    else onLimpar(campo)
                  }}
                />
                <span style={{ fontSize: '0.8125rem' }}>{v || '(vazio)'}</span>
              </label>
            )) : (
              <div className="gtv-col-vazio">Nenhum valor encontrado</div>
            )}
          </div>
        </div>
      )}

      {/* Filtrar por — intervalo numérico */}
      {tipo === 'numero' && (
        <div style={{ padding: '0.375rem 0.5rem' }}>
          <div className="lp-filtro-section-title">INTERVALO</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.25rem' }}>
            <div className="gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input type="number" className="gtv-col-busca-input" placeholder="Mín" value={minLocal} onChange={e => setMinLocal(e.target.value)} />
            </div>
            <span style={{ color: 'var(--gtv-muted, #64748b)', fontSize: '0.75rem', flexShrink: 0 }}>—</span>
            <div className="gtv-col-busca" style={{ borderRadius: '6px', flex: 1 }}>
              <input type="number" className="gtv-col-busca-input" placeholder="Máx" value={maxLocal} onChange={e => setMaxLocal(e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ height: 1, background: 'var(--gtv-border, rgba(255,255,255,0.07))' }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.5rem' }}>
        <button type="button" className="gtv-col-acao-btn gtv-col-acao-btn--reset" onClick={limpar}>
          × Limpar filtro
        </button>
        {(tipo === 'texto' || tipo === 'numero') && (
          <button type="button" className="gtv-btn gtv-btn--ativo" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }} onClick={aplicar}>
            Aplicar
          </button>
        )}
      </div>
    </div>
  )
}

// ── Helpers de filtragem ──────────────────────────────────────────────────────

function detectarTipoColuna(col: GTColuna<Pedido>): 'texto' | 'numero' | 'enum' {
  if (col.tipo === 'numero') return 'numero'
  if (col.tipo === 'badge' || col.key === 'tipo_operacao' || col.key === 'status' || col.key === 'incoterm') return 'enum'
  return 'texto'
}

// ── Status padrão (fallback sem API) ─────────────────────────────────────────

const ABAS_PADRAO: GTAbaTipo[] = [
  { valor: 'todos',        label: 'Todos'           },
  { valor: 'aberto',       label: 'Aberto'          },
  { valor: 'em_andamento', label: 'Em Andamento'    },
  { valor: 'aprovado',     label: 'Aprovado'        },
  { valor: 'transferencia',label: 'Transferido'     },
  { valor: 'consolidado',  label: 'Consolidado'     },
  { valor: 'cancelado',    label: 'Cancelado'       },
]

/** Lê abas do localStorage (salvo pelo Configuracoes) */
function lerAbasDoLocalStorage(): GTAbaTipo[] | null {
  try {
    const raw = localStorage.getItem('pedido:status_config')
    if (!raw) return null
    const parsed: Record<string, { label: string; cor: string }> = JSON.parse(raw)
    const entries = Object.entries(parsed)
    if (entries.length === 0) return null
    return [
      { valor: 'todos', label: 'Todos' },
      ...entries.map(([id, cfg]) => ({ valor: id, label: cfg.label, cor: cfg.cor })),
    ]
  } catch { return null }
}

// ── Casas decimais configuráveis pelo usuário ────────────────────────────────

function lerCasasDecimaisConfig(): Record<string, number> {
  try {
    const raw = localStorage.getItem('pedido:casas_decimais')
    if (raw) return JSON.parse(raw) as Record<string, number>
  } catch { /* ignore */ }
  return {}
}

/** Retorna casas decimais para um campo, respeitando config do usuário em Configurações */
function getCasas(campo: string, padrao: number): number {
  const config = lerCasasDecimaisConfig()
  return config[campo] ?? padrao
}

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

const COLUNAS_PAI: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Número do Pedido',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Número do Pedido',
    tooltipDescricao: 'Identificador único do documento comercial (PO/SO)',
    largura: 180,
  },
  {
    key: 'tipo_operacao',
    label: 'Tipo',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Tipo de Operação',
    tooltipDescricao: 'Importação (Purchase Order) ou Exportação (Sales Order)',
    largura: 170,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
        style={row.tipo_operacao === 'importacao'
          ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
          : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
        }
      />
    ),
  },
  {
    key: 'exportador_nome',
    label: 'Exportador',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Exportador / Fornecedor',
    tooltipDescricao: 'Fornecedor estrangeiro (na importação) ou entidade exportadora',
    largura: 180,
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_nome ?? '—'}</span>,
  },
  {
    key: 'fabricante_nome',
    label: 'Fabricante',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Fabricante',
    tooltipDescricao: 'Identificação da origem produtiva',
    largura: 160,
    render: (_val: unknown, row: Pedido) => <span>{row.fabricante_nome ?? '—'}</span>,
  },
  {
    key: 'referencia_importador',
    label: 'Ref. Importador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Importador',
    tooltipDescricao: 'Código de referência interna do importador para o pedido',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_importador ?? '—'}</span>,
  },
  {
    key: 'referencia_exportador',
    label: 'Ref. Exportador',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Referência do Exportador',
    tooltipDescricao: 'Código de referência utilizado pelo exportador',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_exportador ?? '—'}</span>,
  },
  {
    key: 'numero_proforma',
    label: 'Proforma',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Proforma',
    tooltipDescricao: 'Referência da Proforma Invoice vinculada',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_proforma ?? '—'}</span>,
  },
  {
    key: 'numero_invoice',
    label: 'Invoice',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Número Invoice',
    tooltipDescricao: 'Identificador da Commercial Invoice (Fatura)',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.numero_invoice ?? '—'}</span>,
  },
  {
    key: 'incoterm',
    label: 'Incoterm',
    tipo: 'texto',
    filtravel: true,
    tooltipTitulo: 'Incoterm',
    tooltipDescricao: 'Regra de entrega: FOB, CIF, EXW, etc.',
    largura: 90,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.incoterm ?? '—'}</span>,
  },
  {
    key: 'valor_total_pedido',
    label: 'Valor Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Valor Total do Pedido',
    tooltipDescricao: 'Valor FOB total na moeda do pedido',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_total_pedido != null
          ? fmtMoeda(row.valor_total_pedido, row.moeda_pedido)
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_total_pedido',
    label: 'Qtd Total Pedido',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Total do Pedido',
    tooltipDescricao: 'Quantidade total contratada no pedido',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_total_pedido != null
          ? `${fmtQuantidade(row.quantidade_total_pedido, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_inicial_total',
    label: 'Qtd Inicial',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Soma das quantidades iniciais de todos os itens do pedido',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_inicial_total != null
          ? `${fmtQuantidade(row.quantidade_inicial_total, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_pronta_total',
    label: 'Qtd Pronta',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Soma das quantidades prontas/aprovadas para embarque em todos os itens',
    largura: 110,
    render: (_val: unknown, row: Pedido) => {
      const qtd = row.quantidade_pronta_total
        ?? row.itens?.reduce((s, i) => s + (i.quantidade_pronta ?? 0), 0)
        ?? null
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {qtd != null
            ? `${fmtQuantidade(qtd, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
            : '—'}
        </span>
      )
    },
  },
  {
    key: 'quantidade_a_embarcar',
    label: 'Qtd a Embarcar',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Quantidade a Embarcar',
    tooltipDescricao: 'Pronta − Transferida: quantidade fabricada aguardando embarque',
    largura: 130,
    render: (_val: unknown, row: Pedido) => {
      const qtd = row.quantidade_a_embarcar
        ?? (() => {
          const pronta = row.quantidade_pronta_total ?? row.itens?.reduce((s, i) => s + (i.quantidade_pronta ?? 0), 0) ?? null
          const transf = row.quantidade_transferida_total ?? null
          return pronta != null && transf != null ? Math.max(0, pronta - transf) : null
        })()
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#fbbf24' : undefined }}>
          {qtd != null
            ? `${fmtQuantidade(qtd, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
            : '—'}
        </span>
      )
    },
  },
  {
    key: 'quantidade_a_entregar',
    label: 'Qtd a Entregar',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Quantidade a Entregar',
    tooltipDescricao: 'Total − Transferida: saldo pendente do contrato',
    largura: 130,
    render: (_val: unknown, row: Pedido) => {
      const qtd = row.quantidade_a_entregar
        ?? (() => {
          const total = row.quantidade_total_pedido ?? null
          const transf = row.quantidade_transferida_total ?? null
          return total != null && transf != null ? Math.max(0, total - transf) : null
        })()
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd != null && qtd > 0 ? '#60a5fa' : undefined }}>
          {qtd != null
            ? `${fmtQuantidade(qtd, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
            : '—'}
        </span>
      )
    },
  },
  {
    key: 'quantidade_transferida_total',
    label: 'Qtd Transferida',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Quantidade Transferida (Histórico)',
    tooltipDescricao: 'Histórico: soma das quantidades já transferidas para processos logísticos',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_transferida_total != null
          ? `${fmtQuantidade(row.quantidade_transferida_total, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
  },
  {
    key: 'saldo_quantidade',
    label: 'Saldo',
    tipo: 'numero',
    align: 'right',
    tooltipTitulo: 'Saldo de Quantidade',
    tooltipDescricao: 'Quantidade disponível: Qtd Inicial − Qtd Transferida',
    largura: 110,
    render: (_val: unknown, row: Pedido) => {
      const saldo =
        row.quantidade_inicial_total != null && row.quantidade_transferida_total != null
          ? row.quantidade_inicial_total - row.quantidade_transferida_total
          : null
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {saldo != null
            ? `${fmtQuantidade(saldo, getCasas('quantidade_total_pedido', 0))} ${row.unidade_comercializada_pedido ?? ''}`
            : '—'}
        </span>
      )
    },
  },
  {
    key: 'data_emissao_pedido',
    label: 'Data P.O',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    tooltipTitulo: 'Data do Pedido',
    tooltipDescricao: 'Data de registro ou emissão da Purchase Order',
    largura: 100,
    render: (_val: unknown, row: Pedido) => <span>{fmtData(row.data_emissao_pedido)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Status do Pedido',
    tooltipDescricao: 'Ciclo de vida: Draft, Aberto, Em Transferência, Consolidado, Cancelado',
    oculta: true,
    largura: 130,
    render: (_val: unknown, row: Pedido) => {
      const cor = getStatusCor(row.status)
      return (
        <StatusBadgeGlobal
          valor={STATUS_PEDIDO_LABELS[row.status as keyof typeof STATUS_PEDIDO_LABELS] ?? row.status}
          genero="masculino"
          style={{
            color: cor,
            background: `${cor}1e`,
            border: `1px solid ${cor}33`,
          }}
        />
      )
    },
  },
  // ── Dados comerciais ────────────────────────────────────────────────────────
  {
    key: 'moeda_pedido',
    label: 'Moeda',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Moeda do Pedido',
    tooltipDescricao: 'Moeda de referência do valor total do pedido (ex: USD, EUR)',
    largura: 90,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.moeda_pedido ?? '—'}</span>,
  },
  {
    key: 'unidade_comercializada_pedido',
    label: 'Unidade do Pedido',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Unidade Comercializada do Pedido',
    tooltipDescricao: 'Unidade de medida principal do pedido (ex: KG, UN, CX)',
    largura: 100,
    align: 'center',
    render: (_val: unknown, row: Pedido) => <span>{row.unidade_comercializada_pedido ?? '—'}</span>,
  },
  {
    key: 'referencia_fabricante',
    label: 'Ref. Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Referência do Fabricante',
    tooltipDescricao: 'Código de referência utilizado pelo fabricante para identificar o pedido',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_fabricante ?? '—'}</span>,
  },
  {
    key: 'cobertura_cambial',
    label: 'Cobertura Cambial',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Cobertura Cambial',
    tooltipDescricao: 'Modalidade de cobertura cambial do pedido (ex: Antecipado, à Vista, a Prazo)',
    largura: 150,
    render: (_val: unknown, row: Pedido) => <span>{row.cobertura_cambial ?? '—'}</span>,
  },
  {
    key: 'condicao_pagamento',
    label: 'Cond. Pagamento',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    tooltipTitulo: 'Condição de Pagamento',
    tooltipDescricao: 'Prazo e forma de pagamento acordados com o exportador',
    largura: 150,
    render: (_val: unknown, row: Pedido) => <span>{row.condicao_pagamento ?? '—'}</span>,
  },
  // ── Dados físicos ───────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_total_pedido',
    label: 'Peso Líq. Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Peso Líquido Total do Pedido',
    tooltipDescricao: 'Peso líquido total de todos os itens do pedido, em kg',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_liquido_total_pedido != null
          ? `${fmtQuantidade(row.peso_liquido_total_pedido, getCasas('peso_liquido_total_pedido', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_total_pedido',
    label: 'Peso Bruto Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Peso Bruto Total do Pedido',
    tooltipDescricao: 'Peso bruto total incluindo embalagens, em kg',
    largura: 140,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_bruto_total_pedido != null
          ? `${fmtQuantidade(row.peso_bruto_total_pedido, getCasas('peso_bruto_total_pedido', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_total_pedido',
    label: 'Cubagem Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    tooltipTitulo: 'Cubagem Total do Pedido',
    tooltipDescricao: 'Volume total cubado de todos os itens do pedido, em m³',
    largura: 130,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.cubagem_total_pedido != null
          ? `${fmtQuantidade(row.cubagem_total_pedido, getCasas('cubagem_total_pedido', 4))} m³`
          : '—'}
      </span>
    ),
  },
  // ── Datas de progresso ──────────────────────────────────────────────────────
  {
    key: 'data_prevista_pedido_pronto',
    label: 'Prev. Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Pedido Pronto',
    tooltipDescricao: 'Data prevista para o pedido estar pronto para embarque (confirmada pelo exportador)',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_pedido_pronto ? fmtData(row.data_prevista_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_confirmada_pedido_pronto',
    label: 'Conf. Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Pedido Pronto',
    tooltipDescricao: 'Data confirmada para o pedido estar pronto, após validação do exportador',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_pedido_pronto ? fmtData(row.data_confirmada_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_meta_pedido_pronto',
    label: 'Meta Pronto',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Pedido Pronto',
    tooltipDescricao: 'Data meta definida pelo importador para o pedido estar pronto',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_pedido_pronto ? fmtData(row.data_meta_pedido_pronto) : '—'}</span>,
  },
  {
    key: 'data_prevista_inspecao_pedido',
    label: 'Prev. Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Inspeção do Pedido',
    tooltipDescricao: 'Data prevista para realização da inspeção pré-embarque (PSI/ISF)',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_inspecao_pedido ? fmtData(row.data_prevista_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_inspecao_pedido',
    label: 'Conf. Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Inspeção do Pedido',
    tooltipDescricao: 'Data confirmada para realização da inspeção pré-embarque',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_inspecao_pedido ? fmtData(row.data_confirmada_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_inspecao_pedido',
    label: 'Meta Inspeção',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Inspeção do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a inspeção do pedido',
    largura: 130,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_inspecao_pedido ? fmtData(row.data_meta_inspecao_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_coleta_pedido',
    label: 'Prev. Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Prevista — Coleta do Pedido',
    tooltipDescricao: 'Data prevista para a coleta/retirada da mercadoria no exportador',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_coleta_pedido ? fmtData(row.data_prevista_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_coleta_pedido',
    label: 'Conf. Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Confirmada — Coleta do Pedido',
    tooltipDescricao: 'Data confirmada para coleta/retirada da mercadoria',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_coleta_pedido ? fmtData(row.data_confirmada_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_coleta_pedido',
    label: 'Meta Coleta',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data Meta — Coleta do Pedido',
    tooltipDescricao: 'Data meta definida pelo importador para a coleta do pedido',
    largura: 120,
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_coleta_pedido ? fmtData(row.data_meta_coleta_pedido) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_pedido',
    label: 'Dt Consolidação',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data de Consolidação do Pedido',
    tooltipDescricao: 'Data em que o pedido foi consolidado em um processo logístico',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.data_consolidacao_pedido ? fmtData(row.data_consolidacao_pedido) : '—'}</span>,
  },
  {
    key: 'data_transferencia_saldo_pedido',
    label: 'Dt Transf. Saldo',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    tooltipTitulo: 'Data de Transferência de Saldo',
    tooltipDescricao: 'Data em que o saldo do pedido foi transferido para um processo',
    largura: 140,
    render: (_val: unknown, row: Pedido) => <span>{row.data_transferencia_saldo_pedido ? fmtData(row.data_transferencia_saldo_pedido) : '—'}</span>,
  },
  // ── Exportador (detalhes) ───────────────────────────────────────────────────
  {
    key: 'id_exportador',
    label: 'ID Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'ID do Exportador',
    tooltipDescricao: 'Identificador único do exportador/fornecedor no sistema',
    render: (_val: unknown, row: Pedido) => <span>{row.id_exportador ?? '—'}</span>,
  },
  {
    key: 'pais_exportador',
    label: 'País Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'País do Exportador',
    tooltipDescricao: 'País de origem do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_exportador ?? '—'}</span>,
  },
  {
    key: 'estado_exportador',
    label: 'Estado/Prov. Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Estado ou Província do Exportador',
    tooltipDescricao: 'Estado ou província do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_exportador ?? '—'}</span>,
  },
  {
    key: 'cidade_exportador',
    label: 'Cidade Exportador',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cidade do Exportador',
    tooltipDescricao: 'Cidade do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_exportador ?? '—'}</span>,
  },
  {
    key: 'endereco_exportador',
    label: 'Endereço Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Exportador',
    tooltipDescricao: 'Endereço completo do exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_exportador ?? '—'}</span>,
  },
  {
    key: 'zip_code_exportador',
    label: 'ZIP Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Zip Code do Exportador',
    tooltipDescricao: 'Código postal do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_exportador ?? '—'}</span>,
  },
  {
    key: 'exportador_ou_fabricante',
    label: 'Exportador/Fabricante?',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Exportador ou Fabricante?',
    tooltipDescricao: 'Indica se o exportador é também o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.exportador_ou_fabricante ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante',
    label: 'Relação Exp./Fab.',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Relação entre Exportador e Fabricante',
    tooltipDescricao: 'Tipo de relação entre o exportador e o fabricante do produto',
    render: (_val: unknown, row: Pedido) => <span>{row.relacao_exportador_fabricante ?? '—'}</span>,
  },
  // ── Contato do exportador ───────────────────────────────────────────────────
  {
    key: 'nome_contato_exportador',
    label: 'Contato Exportador',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Nome do Contato do Exportador',
    tooltipDescricao: 'Nome do contato principal no exportador/fornecedor',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'email_contato_exportador',
    label: 'E-mail Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'E-mail do Contato do Exportador',
    tooltipDescricao: 'E-mail do contato principal no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.email_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'whatsapp_contato_exportador',
    label: 'WhatsApp Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 170,
    tooltipTitulo: 'WhatsApp do Contato do Exportador',
    tooltipDescricao: 'Número de WhatsApp do contato do exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.whatsapp_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'cargo_contato_exportador',
    label: 'Cargo Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cargo do Contato do Exportador',
    tooltipDescricao: 'Cargo ou função do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.cargo_contato_exportador ?? '—'}</span>,
  },
  {
    key: 'departamento_contato_exportador',
    label: 'Depto. Contato Exp.',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Departamento do Contato do Exportador',
    tooltipDescricao: 'Departamento do contato no exportador',
    render: (_val: unknown, row: Pedido) => <span>{row.departamento_contato_exportador ?? '—'}</span>,
  },
  // ── Fabricante (detalhes) ───────────────────────────────────────────────────
  {
    key: 'id_fabricante',
    label: 'ID Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'ID do Fabricante',
    tooltipDescricao: 'Identificador único do fabricante no sistema',
    render: (_val: unknown, row: Pedido) => <span>{row.id_fabricante ?? '—'}</span>,
  },
  {
    key: 'pais_fabricante',
    label: 'País Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'País do Fabricante',
    tooltipDescricao: 'País onde o produto foi fabricado',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_fabricante ?? '—'}</span>,
  },
  {
    key: 'estado_fabricante',
    label: 'Estado/Prov. Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Estado ou Província do Fabricante',
    tooltipDescricao: 'Estado ou província onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_fabricante ?? '—'}</span>,
  },
  {
    key: 'cidade_fabricante',
    label: 'Cidade Fabricante',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Cidade do Fabricante',
    tooltipDescricao: 'Cidade onde o fabricante está localizado',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_fabricante ?? '—'}</span>,
  },
  {
    key: 'endereco_fabricante',
    label: 'Endereço Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Fabricante',
    tooltipDescricao: 'Endereço completo do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_fabricante ?? '—'}</span>,
  },
  {
    key: 'zip_code_fabricante',
    label: 'ZIP Fabricante',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Zip Code do Fabricante',
    tooltipDescricao: 'Código postal do fabricante',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_fabricante ?? '—'}</span>,
  },
  // ── OPE ────────────────────────────────────────────────────────────────────
  {
    key: 'cnpj_raiz_empresa_responsavel',
    label: 'CNPJ Raiz Empresa',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'CNPJ Raiz Empresa Responsável',
    tooltipDescricao: 'CNPJ raiz da empresa responsável pelo produto no catálogo',
    render: (_val: unknown, row: Pedido) => <span>{row.cnpj_raiz_empresa_responsavel ?? '—'}</span>,
  },
  {
    key: 'codigo_ope',
    label: 'Cód. OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Código do Operador Estrangeiro (OPE)',
    tooltipDescricao: 'Código do operador estrangeiro cadastrado na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.codigo_ope ?? '—'}</span>,
  },
  {
    key: 'situacao_ope',
    label: 'Situação OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Situação do Operador Estrangeiro',
    tooltipDescricao: 'Situação cadastral do OPE na DUIMP (Ativo, Inativo, etc.)',
    render: (_val: unknown, row: Pedido) => <span>{row.situacao_ope ?? '—'}</span>,
  },
  {
    key: 'versao_ope',
    label: 'Versão OPE',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Versão do Operador Estrangeiro',
    tooltipDescricao: 'Versão do cadastro do OPE na DUIMP',
    render: (_val: unknown, row: Pedido) => <span>{row.versao_ope ?? '—'}</span>,
  },
  {
    key: 'nome_ope',
    label: 'Nome OPE',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro',
    tooltipDescricao: 'Nome completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.nome_ope ?? '—'}</span>,
  },
  {
    key: 'pais_ope',
    label: 'País OPE',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'País do Operador Estrangeiro',
    tooltipDescricao: 'País do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.pais_ope ?? '—'}</span>,
  },
  {
    key: 'estado_ope',
    label: 'Estado OPE',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Estado do Operador Estrangeiro',
    tooltipDescricao: 'Estado ou província do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.estado_ope ?? '—'}</span>,
  },
  {
    key: 'cidade_ope',
    label: 'Cidade OPE',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Cidade do Operador Estrangeiro',
    tooltipDescricao: 'Cidade do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.cidade_ope ?? '—'}</span>,
  },
  {
    key: 'endereco_ope',
    label: 'Endereço OPE',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Endereço do Operador Estrangeiro',
    tooltipDescricao: 'Endereço completo do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.endereco_ope ?? '—'}</span>,
  },
  {
    key: 'zip_code_ope',
    label: 'ZIP OPE',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Zip Code do Operador Estrangeiro',
    tooltipDescricao: 'Código postal do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.zip_code_ope ?? '—'}</span>,
  },
  {
    key: 'tin_ope',
    label: 'TIN OPE',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'TIN do Operador Estrangeiro',
    tooltipDescricao: 'Número de identificação fiscal (Tax Identification Number) do OPE',
    render: (_val: unknown, row: Pedido) => <span>{row.tin_ope ?? '—'}</span>,
  },
  {
    key: 'email_ope',
    label: 'E-mail OPE',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'E-mail do Operador Estrangeiro',
    tooltipDescricao: 'E-mail de contato do operador estrangeiro',
    render: (_val: unknown, row: Pedido) => <span>{row.email_ope ?? '—'}</span>,
  },
  // ── Documentos (anexos e volumes) ───────────────────────────────────────────
  {
    key: 'anexo_pedido',
    label: 'Anexo P.O.',
    tipo: 'texto',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Anexo do Pedido',
    tooltipDescricao: 'Arquivo do pedido (Purchase Order) em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_pedido ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_proforma',
    label: 'Anexo Proforma',
    tipo: 'texto',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Anexo da Proforma Invoice',
    tooltipDescricao: 'Arquivo da Proforma Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_proforma ? '📎' : '—'}</span>,
  },
  {
    key: 'anexo_invoice',
    label: 'Anexo Invoice',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Anexo da Invoice',
    tooltipDescricao: 'Arquivo da Commercial Invoice em PDF ou outro formato',
    render: (_val: unknown, row: Pedido) => <span>{row.anexo_invoice ? '📎' : '—'}</span>,
  },
  {
    key: 'quantidade_volumes_pedido',
    label: 'Qtd Volumes',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Quantidade de Volumes Total do Pedido',
    tooltipDescricao: 'Número total de volumes (caixas, pallets, etc.) do pedido',
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_volumes_pedido != null ? String(row.quantidade_volumes_pedido) : '—'}
      </span>
    ),
  },
  {
    key: 'partnumber_produto_pedido',
    label: 'Part Number',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Part Number do Produto',
    tooltipDescricao: 'Código de referência do produto principal do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.partnumber_produto_pedido ?? '—'}</span>,
  },
  {
    key: 'referencia_interna_produto_catalogo',
    label: 'Ref. Catálogo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Referência Interna do Produto — Catálogo',
    tooltipDescricao: 'Referência interna do produto conforme catálogo de produtos',
    render: (_val: unknown, row: Pedido) => <span>{row.referencia_interna_produto_catalogo ?? '—'}</span>,
  },
  // ── Datas — Draft do Pedido ─────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_pedido',
    label: 'Prev. Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data prevista para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_pedido ? fmtData(row.data_prevista_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_pedido',
    label: 'Conf. Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_pedido ? fmtData(row.data_confirmada_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_pedido',
    label: 'Meta Rec. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Meta de Recebimento — Draft do Pedido',
    tooltipDescricao: 'Data meta para recebimento do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_pedido ? fmtData(row.data_meta_recebimento_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_pedido',
    label: 'Prev. Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data prevista para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_pedido ? fmtData(row.data_prevista_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_pedido',
    label: 'Conf. Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_pedido ? fmtData(row.data_confirmada_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_pedido',
    label: 'Meta Aprov. Draft P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Data Meta de Aprovação — Draft do Pedido',
    tooltipDescricao: 'Data meta para aprovação do rascunho do pedido',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_pedido ? fmtData(row.data_meta_aprovacao_draft_pedido) : '—'}</span>,
  },
  {
    key: 'data_documento_pedido',
    label: 'Dt Documento P.O.',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Data do Documento Pedido',
    tooltipDescricao: 'Data de emissão do documento do pedido (Purchase Order)',
    render: (_val: unknown, row: Pedido) => <span>{row.data_documento_pedido ? fmtData(row.data_documento_pedido) : '—'}</span>,
  },
  // ── Datas — Proforma Invoice ────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_proforma',
    label: 'Prev. Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_proforma ? fmtData(row.data_prevista_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_proforma',
    label: 'Conf. Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_proforma ? fmtData(row.data_confirmada_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_proforma',
    label: 'Meta Rec. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_proforma ? fmtData(row.data_meta_recebimento_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_proforma',
    label: 'Prev. Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_proforma ? fmtData(row.data_prevista_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_proforma',
    label: 'Conf. Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_proforma ? fmtData(row.data_confirmada_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_proforma',
    label: 'Meta Aprov. Draft Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Proforma Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_proforma ? fmtData(row.data_meta_aprovacao_draft_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_proforma',
    label: 'Prev. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Prevista de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_proforma ? fmtData(row.data_prevista_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_proforma',
    label: 'Conf. Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Confirmada de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_proforma ? fmtData(row.data_confirmada_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_proforma',
    label: 'Meta Envio Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Meta de Envio — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para envio do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_proforma ? fmtData(row.data_meta_envio_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_proforma',
    label: 'Prev. Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_proforma ? fmtData(row.data_prevista_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_proforma',
    label: 'Conf. Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_proforma ? fmtData(row.data_confirmada_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_proforma',
    label: 'Meta Rec. Original Proforma',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Meta de Recebimento — Original da Proforma Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_proforma ? fmtData(row.data_meta_recebimento_original_proforma) : '—'}</span>,
  },
  {
    key: 'data_proforma_invoice',
    label: 'Dt Proforma Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data da Proforma Invoice',
    tooltipDescricao: 'Data de emissão da Proforma Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_proforma_invoice ? fmtData(row.data_proforma_invoice) : '—'}</span>,
  },
  // ── Datas — Invoice ─────────────────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_invoice',
    label: 'Prev. Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_draft_invoice ? fmtData(row.data_prevista_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_invoice',
    label: 'Conf. Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_draft_invoice ? fmtData(row.data_confirmada_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_invoice',
    label: 'Meta Rec. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Meta de Recebimento — Draft da Invoice',
    tooltipDescricao: 'Data meta para recebimento do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_draft_invoice ? fmtData(row.data_meta_recebimento_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_invoice',
    label: 'Prev. Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_aprovacao_draft_invoice ? fmtData(row.data_prevista_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_invoice',
    label: 'Conf. Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_aprovacao_draft_invoice ? fmtData(row.data_confirmada_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_invoice',
    label: 'Meta Aprov. Draft Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da Invoice',
    tooltipDescricao: 'Data meta para aprovação do rascunho da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_aprovacao_draft_invoice ? fmtData(row.data_meta_aprovacao_draft_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_invoice',
    label: 'Prev. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Prevista de Envio — Original da Invoice',
    tooltipDescricao: 'Data prevista para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_envio_original_invoice ? fmtData(row.data_prevista_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_invoice',
    label: 'Conf. Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Confirmada de Envio — Original da Invoice',
    tooltipDescricao: 'Data confirmada de envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_envio_original_invoice ? fmtData(row.data_confirmada_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_invoice',
    label: 'Meta Envio Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Meta de Envio — Original da Invoice',
    tooltipDescricao: 'Data meta para envio do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_envio_original_invoice ? fmtData(row.data_meta_envio_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_invoice',
    label: 'Prev. Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Prevista de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data prevista para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_prevista_recebimento_original_invoice ? fmtData(row.data_prevista_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_invoice',
    label: 'Conf. Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 205,
    tooltipTitulo: 'Data Confirmada de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data confirmada de recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_confirmada_recebimento_original_invoice ? fmtData(row.data_confirmada_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_invoice',
    label: 'Meta Rec. Original Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Data Meta de Recebimento — Original da Invoice',
    tooltipDescricao: 'Data meta para recebimento do original da Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_meta_recebimento_original_invoice ? fmtData(row.data_meta_recebimento_original_invoice) : '—'}</span>,
  },
  {
    key: 'data_invoice',
    label: 'Dt Invoice',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Data da Invoice',
    tooltipDescricao: 'Data de emissão da Commercial Invoice',
    render: (_val: unknown, row: Pedido) => <span>{row.data_invoice ? fmtData(row.data_invoice) : '—'}</span>,
  },
]

// ── Mapper: ColunaUsuario → GTColuna<Pedido> ──────────────────────────────────

function mapColunaUsuarioParaGTColuna(col: ColunaUsuario): GTColuna<Pedido> {
  return {
    key:             col.chave as keyof Pedido,
    label:           col.nome,
    tipo:            col.tipo === 'numero' || col.tipo === 'percentual' ? 'numero' : col.tipo === 'data' ? 'periodo' : 'texto',
    filtravel:       true,
    oculta:          true,
    tooltipTitulo:   col.nome,
    tooltipDescricao: col.descricao,
    largura:         140,
    render: (_val: unknown, row: Pedido) => {
      const valores = (row as Record<string, unknown>)['_colunas_usuario'] as
        Record<string, string> | undefined
      const valor = valores?.[col.id] ?? '—'
      if (col.tipo === 'checkbox') {
        return <span>{valor === 'true' ? '✓' : valor === 'false' ? '✗' : '—'}</span>
      }
      if ((col.tipo === 'numero' || col.tipo === 'percentual') && valor !== '—') {
        const num = Number(valor)
        if (!isNaN(num)) {
          const casas = getCasas(col.id, 2)
          const sufixo = col.tipo === 'percentual' ? '%' : ''
          return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtQuantidade(num, casas)}{sufixo}</span>
        }
      }
      return <span>{valor}</span>
    },
  }
}

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

const COLUNAS_FILHO: GTColuna<PedidoItem>[] = [
  {
    key: 'part_number',
    label: 'Part Number',
    tipo: 'texto',
    largura: 130,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.part_number}</span>,
  },
  {
    key: 'ncm',
    label: 'NCM',
    tipo: 'texto',
    largura: 100,
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm}</span>,
  },
  {
    key: 'descricao',
    label: 'Descrição',
    tipo: 'texto',
    largura: 220,
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao}</span>,
  },
  {
    key: 'quantidade_inicial',
    label: 'Qtd Inicial',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Inicial',
    tooltipDescricao: 'Quantidade original do item — valor imutável',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_inicial, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_atual',
    label: 'Saldo Atual',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Saldo Atual',
    tooltipDescricao: 'Saldo vivo disponível para alocação em processos logísticos',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontVariantNumeric: 'tabular-nums',
        fontWeight: row.quantidade_atual === 0 ? 400 : 600,
        color: row.quantidade_atual === 0 ? 'var(--text-muted)' : 'var(--color-success, #34d399)',
      }}>
        {fmtQuantidade(row.quantidade_atual, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_pronta',
    label: 'Qtd Pronta',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Quantidade Pronta',
    tooltipDescricao: 'Montante produzido pela fábrica e validado para embarque',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_pronta, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_transferida',
    label: 'Qtd Transferida',
    tipo: 'numero',
    align: 'right',
    largura: 130,
    tooltipTitulo: 'Quantidade Transferida',
    tooltipDescricao: 'Total já alocado em processos logísticos (embarques)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_transferida, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'quantidade_cancelada',
    label: 'Qtd Cancelada',
    tipo: 'numero',
    align: 'right',
    largura: 120,
    tooltipTitulo: 'Quantidade Cancelada',
    tooltipDescricao: 'Total cancelado permanentemente — subtrai do saldo inicial',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{
        fontVariantNumeric: 'tabular-nums',
        color: row.quantidade_cancelada > 0 ? 'var(--color-error, #ef4444)' : 'var(--text-muted)',
      }}>
        {fmtQuantidade(row.quantidade_cancelada, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  {
    key: 'unidade_comercializada_item',
    label: 'UoM',
    tipo: 'texto',
    align: 'center',
    largura: 80,
    tooltipTitulo: 'Unidade de Medida',
    tooltipDescricao: 'Unidade de medida do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.unidade_comercializada_item ?? '—'}</span>,
  },
  {
    key: 'valor_unitario',
    label: 'Vlr Unitário',
    tipo: 'numero',
    align: 'right',
    largura: 110,
    tooltipTitulo: 'Valor Unitário',
    tooltipDescricao: 'Valor unitário na moeda do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_unitario != null ? fmtMoeda(row.valor_unitario, row.moeda_item) : '—'}
      </span>
    ),
  },
  {
    key: 'valor_item',
    label: 'Vlr Total Item',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Valor Total do Item',
    tooltipDescricao: 'Valor total do item (valor unitário × quantidade) na moeda do item',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_item != null ? fmtMoeda(row.valor_item, row.moeda_item) : '—'}
      </span>
    ),
  },
  {
    key: 'moeda_item',
    label: 'Moeda Item',
    tipo: 'texto',
    align: 'center',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Moeda do Item',
    tooltipDescricao: 'Moeda utilizada para o valor unitário e total do item',
    render: (_val: unknown, row: PedidoItem) => <span>{row.moeda_item ?? '—'}</span>,
  },
  {
    key: 'sequencia_item',
    label: 'Seq.',
    tipo: 'numero',
    align: 'center',
    oculta: true,
    largura: 70,
    tooltipTitulo: 'Sequência do Item',
    tooltipDescricao: 'Número sequencial do item dentro do pedido (conforme invoice)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.sequencia_item != null ? String(row.sequencia_item).padStart(3, '0') : '—'}
      </span>
    ),
  },
  {
    key: 'descricao_completa',
    label: 'Desc. Completa',
    tipo: 'texto',
    oculta: true,
    largura: 260,
    tooltipTitulo: 'Descrição Completa do Produto',
    tooltipDescricao: 'Descrição técnica detalhada do produto conforme catálogo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa ?? '—'}</span>,
  },
  {
    key: 'descricao_espelho_nf',
    label: 'Desc. NF',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Descrição Espelho da Nota Fiscal',
    tooltipDescricao: 'Descrição do produto conforme será exibida na nota fiscal de entrada',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_espelho_nf ?? '—'}</span>,
  },
  {
    key: 'quantidade_unidade_estatistica',
    label: 'Qtd Est.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 100,
    tooltipTitulo: 'Quantidade na Unidade Estatística',
    tooltipDescricao: 'Quantidade do item expressa na unidade estatística exigida pela DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.quantidade_unidade_estatistica != null
          ? `${fmtQuantidade(row.quantidade_unidade_estatistica, getCasas('quantidade_unidade_estatistica', 2))} ${row.unidade_estatistica ?? ''}`
          : '—'}
      </span>
    ),
  },
  // ── Pesos e cubagem ──────────────────────────────────────────────────────────
  {
    key: 'peso_liquido_unitario',
    label: 'Peso Líq. Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Peso Líquido Unitário',
    tooltipDescricao: 'Peso líquido unitário do produto, em kg',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_liquido_unitario != null
          ? `${fmtQuantidade(row.peso_liquido_unitario, getCasas('peso_liquido_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'peso_bruto_unitario',
    label: 'Peso Bruto Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Peso Bruto Unitário',
    tooltipDescricao: 'Peso bruto unitário incluindo embalagem, em kg',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_bruto_unitario != null
          ? `${fmtQuantidade(row.peso_bruto_unitario, getCasas('peso_bruto_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  {
    key: 'cubagem_unitaria',
    label: 'Cubagem Unit.',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Cubagem Unitária',
    tooltipDescricao: 'Volume unitário do produto, em m³',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.cubagem_unitaria != null
          ? `${fmtQuantidade(row.cubagem_unitaria, getCasas('cubagem_unitaria', 4))} m³`
          : '—'}
      </span>
    ),
  },
  // ── Embalagem e documentos ───────────────────────────────────────────────────
  {
    key: 'tipo_embalagem',
    label: 'Embalagem',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Tipo de Embalagem',
    tooltipDescricao: 'Tipo de embalagem do produto (ex: Caixa, Pallet, Tambor)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_embalagem ?? '—'}</span>,
  },
  {
    key: 'numero_lpco',
    label: 'LPCO',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Número da LPCO',
    tooltipDescricao: 'Licença, Permissão, Certificado ou Outros documentos exigidos para importação',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco ?? '—'}</span>,
  },
  {
    key: 'numero_certificado_origem',
    label: 'Cert. Origem',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Número do Certificado de Origem',
    tooltipDescricao: 'Número do certificado de origem emitido pelo exportador ou câmara de comércio',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_certificado_origem ?? '—'}</span>,
  },
  {
    key: 'data_certificado_origem',
    label: 'Dt Cert. Origem',
    tipo: 'periodo',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_certificado_origem ? fmtData(row.data_certificado_origem) : '—'}</span>,
  },
  // ── Classificação ────────────────────────────────────────────────────────────
  {
    key: 'grupo_produto',
    label: 'Grupo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Grupo do Produto',
    tooltipDescricao: 'Grupo de classificação do produto conforme cadastro',
    render: (_val: unknown, row: PedidoItem) => <span>{row.grupo_produto ?? '—'}</span>,
  },
  {
    key: 'subgrupo_produto',
    label: 'Subgrupo',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Subgrupo do Produto',
    tooltipDescricao: 'Subgrupo de classificação do produto dentro do grupo principal',
    render: (_val: unknown, row: PedidoItem) => <span>{row.subgrupo_produto ?? '—'}</span>,
  },
  {
    key: 'campo_especial',
    label: 'Campo Especial',
    tipo: 'texto',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Campo Especial',
    tooltipDescricao: 'Campo configurável para uso interno ou integrações específicas',
    render: (_val: unknown, row: PedidoItem) => <span>{row.campo_especial ?? '—'}</span>,
  },
  // ── Descrições multilíngues ──────────────────────────────────────────────────
  {
    key: 'descricao_en',
    label: 'Desc. (EN)',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Product Description (English)',
    tooltipDescricao: 'Descrição do produto em inglês, conforme invoice internacional',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_en ?? '—'}</span>,
  },
  {
    key: 'descricao_es',
    label: 'Desc. (ES)',
    tipo: 'texto',
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Descripción del Producto (Español)',
    tooltipDescricao: 'Descrição do produto em espanhol',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_es ?? '—'}</span>,
  },
  {
    key: 'texto_posicao_ncm',
    label: 'Texto NCM',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Texto da Posição da NCM',
    tooltipDescricao: 'Descrição oficial da posição tarifária NCM conforme TEC',
    render: (_val: unknown, row: PedidoItem) => <span>{row.texto_posicao_ncm ?? '—'}</span>,
  },
  {
    key: 'atributos_catalogo',
    label: 'Atributos',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Atributos — Catálogo de Produtos',
    tooltipDescricao: 'Atributos técnicos do produto conforme catálogo (cor, voltagem, etc.)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_catalogo ?? '—'}</span>,
  },
  {
    key: 'anexo_lpco',
    label: 'Anexo LPCO',
    tipo: 'texto',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Anexo da LPCO',
    tooltipDescricao: 'Arquivo da Licença, Permissão, Certificado ou Outros (LPCO)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.anexo_lpco ? '📎' : '—'}</span>,
  },
  // ── Datas do item ────────────────────────────────────────────────────────────
  {
    key: 'data_inclusao_item',
    label: 'Dt Inclusão Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 145,
    tooltipTitulo: 'Data de Inclusão do Produto/Item',
    tooltipDescricao: 'Data em que o item foi incluído no pedido',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_inclusao_item ? fmtData(row.data_inclusao_item) : '—'}</span>,
  },
  {
    key: 'data_transferencia_item',
    label: 'Dt Transf. Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 135,
    tooltipTitulo: 'Data de Transferência do Produto/Item',
    tooltipDescricao: 'Data em que o item foi transferido para um processo logístico',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_transferencia_item ? fmtData(row.data_transferencia_item) : '—'}</span>,
  },
  {
    key: 'data_consolidacao_item',
    label: 'Dt Consol. Item',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Data de Consolidação do Produto/Item',
    tooltipDescricao: 'Data em que o item foi consolidado em um processo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_consolidacao_item ? fmtData(row.data_consolidacao_item) : '—'}</span>,
  },
  // ── Datas LPCO ───────────────────────────────────────────────────────────────
  {
    key: 'data_prevista_conferencia_draft_lpco',
    label: 'Prev. Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Prevista de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data prevista para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_conferencia_draft_lpco ? fmtData(row.data_prevista_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_conferencia_draft_lpco',
    label: 'Conf. Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Confirmada de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_conferencia_draft_lpco ? fmtData(row.data_confirmada_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_conferencia_draft_lpco',
    label: 'Meta Conf. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Meta de Conferência — Draft da LPCO',
    tooltipDescricao: 'Data meta para conferência do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_conferencia_draft_lpco ? fmtData(row.data_meta_conferencia_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_lpco',
    label: 'Prev. Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data prevista para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_lpco ? fmtData(row.data_prevista_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_lpco',
    label: 'Conf. Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_lpco ? fmtData(row.data_confirmada_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_lpco',
    label: 'Meta Aprov. Draft LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Meta de Aprovação — Draft da LPCO',
    tooltipDescricao: 'Data meta para aprovação do rascunho da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_lpco ? fmtData(row.data_meta_aprovacao_draft_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_registro_lpco',
    label: 'Prev. Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista do Registro da LPCO',
    tooltipDescricao: 'Data prevista para registro da LPCO no órgão competente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_registro_lpco ? fmtData(row.data_prevista_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_registro_lpco',
    label: 'Conf. Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Data Confirmada do Registro da LPCO',
    tooltipDescricao: 'Data confirmada de registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_registro_lpco ? fmtData(row.data_confirmada_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_registro_lpco',
    label: 'Meta Registro LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data Meta do Registro da LPCO',
    tooltipDescricao: 'Data meta para registro da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_registro_lpco ? fmtData(row.data_meta_registro_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_resultado_analise_lpco',
    label: 'Prev. Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Data Prevista do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data prevista para resultado da análise pelo órgão anuente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_resultado_analise_lpco ? fmtData(row.data_prevista_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_resultado_analise_lpco',
    label: 'Conf. Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Data Confirmada do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data confirmada do resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_resultado_analise_lpco ? fmtData(row.data_confirmada_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_resultado_analise_lpco',
    label: 'Meta Análise LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Data Meta do Resultado da Análise da LPCO',
    tooltipDescricao: 'Data meta para resultado da análise da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_resultado_analise_lpco ? fmtData(row.data_meta_resultado_analise_lpco) : '—'}</span>,
  },
  {
    key: 'data_prevista_deferimento_lpco',
    label: 'Prev. Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Prevista do Deferimento da LPCO',
    tooltipDescricao: 'Data prevista para deferimento (aprovação final) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_deferimento_lpco ? fmtData(row.data_prevista_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_deferimento_lpco',
    label: 'Conf. Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Data Confirmada do Deferimento da LPCO',
    tooltipDescricao: 'Data confirmada do deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_deferimento_lpco ? fmtData(row.data_confirmada_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_meta_deferimento_lpco',
    label: 'Meta Deferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Meta do Deferimento da LPCO',
    tooltipDescricao: 'Data meta para deferimento da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_deferimento_lpco ? fmtData(row.data_meta_deferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_indeferimento_lpco',
    label: 'Conf. Indeferimento LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Data Confirmada do Indeferimento da LPCO',
    tooltipDescricao: 'Data confirmada do indeferimento (reprovação) da LPCO',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_indeferimento_lpco ? fmtData(row.data_confirmada_indeferimento_lpco) : '—'}</span>,
  },
  {
    key: 'data_confirmada_exigencia_lpco',
    label: 'Conf. Exigência LPCO',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Data Confirmada da Exigência da LPCO',
    tooltipDescricao: 'Data confirmada de exigência/pendência da LPCO pelo órgão anuente',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_exigencia_lpco ? fmtData(row.data_confirmada_exigencia_lpco) : '—'}</span>,
  },
  // ── Datas Certificado de Origem ──────────────────────────────────────────────
  {
    key: 'data_prevista_recebimento_draft_cert_origem',
    label: 'Prev. Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Prevista de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data prevista para recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_draft_cert_origem ? fmtData(row.data_prevista_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_draft_cert_origem',
    label: 'Conf. Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 215,
    tooltipTitulo: 'Data Confirmada de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_draft_cert_origem ? fmtData(row.data_confirmada_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_draft_cert_origem',
    label: 'Meta Rec. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Data Meta de Recebimento — Draft do Certificado de Origem',
    tooltipDescricao: 'Data meta para recebimento do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_draft_cert_origem ? fmtData(row.data_meta_recebimento_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_aprovacao_draft_cert_origem',
    label: 'Prev. Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Data Prevista de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data prevista para aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_aprovacao_draft_cert_origem ? fmtData(row.data_prevista_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_aprovacao_draft_cert_origem',
    label: 'Conf. Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 225,
    tooltipTitulo: 'Data Confirmada de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_aprovacao_draft_cert_origem ? fmtData(row.data_confirmada_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_aprovacao_draft_cert_origem',
    label: 'Meta Aprov. Draft Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 220,
    tooltipTitulo: 'Data Meta de Aprovação — Draft do Certificado de Origem',
    tooltipDescricao: 'Data meta para aprovação do rascunho do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_aprovacao_draft_cert_origem ? fmtData(row.data_meta_aprovacao_draft_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_envio_original_cert_origem',
    label: 'Prev. Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 230,
    tooltipTitulo: 'Data Prevista de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data prevista para envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_envio_original_cert_origem ? fmtData(row.data_prevista_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_envio_original_cert_origem',
    label: 'Conf. Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 235,
    tooltipTitulo: 'Data Confirmada de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_envio_original_cert_origem ? fmtData(row.data_confirmada_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_envio_original_cert_origem',
    label: 'Meta Envio Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 230,
    tooltipTitulo: 'Data Meta de Envio — Original do Certificado de Origem',
    tooltipDescricao: 'Data meta para envio do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_envio_original_cert_origem ? fmtData(row.data_meta_envio_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_prevista_recebimento_original_cert_origem',
    label: 'Prev. Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 230,
    tooltipTitulo: 'Data Prevista de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data prevista para recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_prevista_recebimento_original_cert_origem ? fmtData(row.data_prevista_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_confirmada_recebimento_original_cert_origem',
    label: 'Conf. Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 235,
    tooltipTitulo: 'Data Confirmada de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data confirmada de recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_confirmada_recebimento_original_cert_origem ? fmtData(row.data_confirmada_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_meta_recebimento_original_cert_origem',
    label: 'Meta Rec. Original Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 230,
    tooltipTitulo: 'Data Meta de Recebimento — Original do Certificado de Origem',
    tooltipDescricao: 'Data meta para recebimento do original do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_meta_recebimento_original_cert_origem ? fmtData(row.data_meta_recebimento_original_cert_origem) : '—'}</span>,
  },
  {
    key: 'data_cert_origem',
    label: 'Dt Cert. Origem',
    tipo: 'periodo',
    filtravel: true,
    sortavel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Data do Certificado de Origem',
    tooltipDescricao: 'Data de emissão do certificado de origem',
    render: (_val: unknown, row: PedidoItem) => <span>{row.data_cert_origem ? fmtData(row.data_cert_origem) : '—'}</span>,
  },
  // ── DUIMP — Dados gerais ─────────────────────────────────────────────────────
  {
    key: 'tipo_operacao_duimp',
    label: 'Tipo Op. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Tipo de Operação — DUIMP',
    tooltipDescricao: 'Tipo de operação de importação conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_operacao_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_resumida_duimp',
    label: 'Desc. Resumida DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Descrição Resumida do Produto — DUIMP',
    tooltipDescricao: 'Descrição resumida do produto conforme cadastro na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_resumida_duimp ?? '—'}</span>,
  },
  {
    key: 'versao_produto_duimp',
    label: 'Versão Produto DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 170,
    tooltipTitulo: 'Versão do Produto — Catálogo DUIMP',
    tooltipDescricao: 'Versão do cadastro do produto no catálogo DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.versao_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'ncm_duimp',
    label: 'NCM DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'NCM — DUIMP',
    tooltipDescricao: 'Código NCM utilizado na DUIMP (pode diferir do NCM do catálogo)',
    render: (_val: unknown, row: PedidoItem) => <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{row.ncm_duimp ?? '—'}</span>,
  },
  {
    key: 'atributos_duimp',
    label: 'Atributos DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Atributos — DUIMP',
    tooltipDescricao: 'Atributos técnicos do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.atributos_duimp ?? '—'}</span>,
  },
  {
    key: 'aplicacao_mercadoria_duimp',
    label: 'Aplicação Mercadoria DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Aplicação da Mercadoria — DUIMP',
    tooltipDescricao: 'Finalidade ou aplicação da mercadoria conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.aplicacao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'condicao_mercadoria_duimp',
    label: 'Condição Mercadoria DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 190,
    tooltipTitulo: 'Condição da Mercadoria — DUIMP',
    tooltipDescricao: 'Estado da mercadoria (nova, usada, recondicionada) conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.condicao_mercadoria_duimp ?? '—'}</span>,
  },
  {
    key: 'relacao_exportador_fabricante_duimp',
    label: 'Relação Exp./Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 185,
    tooltipTitulo: 'Relação entre Exportador e Fabricante — DUIMP',
    tooltipDescricao: 'Tipo de relação entre exportador e fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.relacao_exportador_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'vinculacao_preco_duimp',
    label: 'Vinculação Preço DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Vinculação de Preço — DUIMP',
    tooltipDescricao: 'Indica se há vinculação de preço entre comprador e vendedor conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.vinculacao_preco_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_completa_duimp',
    label: 'Desc. Completa DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Descrição Completa do Produto — DUIMP',
    tooltipDescricao: 'Descrição completa e técnica do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_completa_duimp ?? '—'}</span>,
  },
  {
    key: 'descricao_complementar_duimp',
    label: 'Desc. Complementar DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Descrição Complementar da Mercadoria — DUIMP',
    tooltipDescricao: 'Informações complementares sobre a mercadoria na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.descricao_complementar_duimp ?? '—'}</span>,
  },
  // ── DUIMP — OPE ─────────────────────────────────────────────────────────────
  {
    key: 'codigo_ope_duimp',
    label: 'Cód. OPE DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Código do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Código do OPE (exportador) conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_duimp',
    label: 'Nome OPE DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'Nome do OPE conforme cadastrado na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_ope_duimp',
    label: 'País OPE DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'País do Operador Estrangeiro — DUIMP',
    tooltipDescricao: 'País do OPE conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_ope_duimp ?? '—'}</span>,
  },
  {
    key: 'codigo_ope_fabricante_duimp',
    label: 'Cód. OPE Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 160,
    tooltipTitulo: 'Código do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Código do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.codigo_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'nome_ope_fabricante_duimp',
    label: 'Nome OPE Fab. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Nome do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'Nome do OPE do fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.nome_ope_fabricante_duimp ?? '—'}</span>,
  },
  {
    key: 'pais_fabricante_ope_duimp',
    label: 'País OPE Fab. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 150,
    tooltipTitulo: 'País do Operador Estrangeiro Fabricante — DUIMP',
    tooltipDescricao: 'País do OPE fabricante conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.pais_fabricante_ope_duimp ?? '—'}</span>,
  },
  // ── DUIMP — Valoração ────────────────────────────────────────────────────────
  {
    key: 'metodo_valoracao_duimp',
    label: 'Método Valoração DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Método de Valoração — DUIMP',
    tooltipDescricao: 'Método de valoração aduaneira utilizado na DUIMP (ex: Método 1 — Valor de Transação)',
    render: (_val: unknown, row: PedidoItem) => <span>{row.metodo_valoracao_duimp ?? '—'}</span>,
  },
  {
    key: 'incoterm_duimp',
    label: 'Incoterm DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Incoterm / Condição de Venda — DUIMP',
    tooltipDescricao: 'Incoterm ou condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.incoterm_duimp ?? '—'}</span>,
  },
  {
    key: 'moeda_produto_duimp',
    label: 'Moeda DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Moeda do Produto — DUIMP',
    tooltipDescricao: 'Moeda utilizada no valor do produto conforme DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.moeda_produto_duimp ?? '—'}</span>,
  },
  {
    key: 'valor_unitario_duimp',
    label: 'Vlr Unit. DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 140,
    tooltipTitulo: 'Valor Unitário do Produto — DUIMP',
    tooltipDescricao: 'Valor unitário do produto na moeda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_unitario_duimp != null ? fmtMoeda(row.valor_unitario_duimp, row.moeda_produto_duimp ?? 'USD') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_total_condicao_venda_duimp',
    label: 'Vlr Total Cond. Venda DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Valor Total na Condição de Venda — DUIMP',
    tooltipDescricao: 'Valor total do item na condição de venda declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_total_condicao_venda_duimp != null ? fmtMoeda(row.valor_total_condicao_venda_duimp, row.moeda_produto_duimp ?? 'USD') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_condicao_venda_brl_duimp',
    label: 'Vlr Cond. Venda (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 200,
    tooltipTitulo: 'Valor na Condição de Venda (R$) — DUIMP',
    tooltipDescricao: 'Valor do item na condição de venda convertido em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_condicao_venda_brl_duimp != null ? fmtMoeda(row.valor_condicao_venda_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_frete_internacional_brl_duimp',
    label: 'Frete Internacional (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 210,
    tooltipTitulo: 'Valor do Frete Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do frete internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_frete_internacional_brl_duimp != null ? fmtMoeda(row.valor_frete_internacional_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_seguro_internacional_brl_duimp',
    label: 'Seguro Internacional (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 215,
    tooltipTitulo: 'Valor do Seguro Internacional (R$) — DUIMP',
    tooltipDescricao: 'Valor do seguro internacional em reais para fins de valoração aduaneira',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_seguro_internacional_brl_duimp != null ? fmtMoeda(row.valor_seguro_internacional_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_local_embarque_brl_duimp',
    label: 'Vlr Local Embarque (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 215,
    tooltipTitulo: 'Valor no Local de Embarque (R$) — DUIMP',
    tooltipDescricao: 'Valor da mercadoria no local de embarque em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_local_embarque_brl_duimp != null ? fmtMoeda(row.valor_local_embarque_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_aduaneiro_brl_duimp',
    label: 'Valor Aduaneiro (R$) DUIMP',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Valor Aduaneiro (R$) — DUIMP',
    tooltipDescricao: 'Valor aduaneiro calculado em reais, base para tributos de importação',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_aduaneiro_brl_duimp != null ? fmtMoeda(row.valor_aduaneiro_brl_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — Cobertura cambial ────────────────────────────────────────────────
  {
    key: 'tipo_cobertura_cambial_duimp',
    label: 'Tipo Cob. Cambial DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 180,
    tooltipTitulo: 'Tipo de Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Modalidade de cobertura cambial declarada na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_cobertura_cambial_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_rof_bacen_duimp',
    label: 'ROF/BACEN DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Número do ROF/BACEN — DUIMP',
    tooltipDescricao: 'Número do Registro de Operações Financeiras junto ao BACEN',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_rof_bacen_duimp ?? '—'}</span>,
  },
  {
    key: 'motivo_sem_cobertura_duimp',
    label: 'Motivo Sem Cobertura DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 195,
    tooltipTitulo: 'Motivo Sem Cobertura Cambial — DUIMP',
    tooltipDescricao: 'Justificativa legal para ausência de cobertura cambial',
    render: (_val: unknown, row: PedidoItem) => <span>{row.motivo_sem_cobertura_duimp ?? '—'}</span>,
  },
  // ── DUIMP — II ──────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ii_duimp',
    label: 'BC II (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do II (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do Imposto de Importação em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ii_duimp != null ? fmtMoeda(row.base_calculo_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ii_duimp',
    label: 'Alíq. II (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 110,
    tooltipTitulo: 'Alíquota do II (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do Imposto de Importação',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ii_duimp != null ? `${fmtQuantidade(row.percentual_ii_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_devido_ii_duimp',
    label: 'II Devido (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Valor Devido do II (R$) — DUIMP',
    tooltipDescricao: 'Valor total do Imposto de Importação devido',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_devido_ii_duimp != null ? fmtMoeda(row.valor_devido_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ii_duimp',
    label: 'II a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 145,
    tooltipTitulo: 'Valor a Recolher do II (R$) — DUIMP',
    tooltipDescricao: 'Valor efetivo do Imposto de Importação a recolher (deduzidas suspensões)',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_recolher_ii_duimp != null ? fmtMoeda(row.valor_recolher_ii_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — IPI ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_ipi_duimp',
    label: 'BC IPI (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do IPI (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do IPI em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_ipi_duimp != null ? fmtMoeda(row.base_calculo_ipi_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_ipi_duimp',
    label: 'Alíq. IPI (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 115,
    tooltipTitulo: 'Alíquota do IPI (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do IPI',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_ipi_duimp != null ? `${fmtQuantidade(row.percentual_ipi_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_ipi_duimp',
    label: 'IPI a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Valor a Recolher do IPI (R$) — DUIMP',
    tooltipDescricao: 'Valor do IPI a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_recolher_ipi_duimp != null ? fmtMoeda(row.valor_recolher_ipi_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — PIS ─────────────────────────────────────────────────────────────
  {
    key: 'base_calculo_pis_duimp',
    label: 'BC PIS (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 120,
    tooltipTitulo: 'Base de Cálculo do PIS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do PIS/PASEP em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_pis_duimp != null ? fmtMoeda(row.base_calculo_pis_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_pis_duimp',
    label: 'Alíq. PIS (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 115,
    tooltipTitulo: 'Alíquota do PIS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do PIS/PASEP',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_pis_duimp != null ? `${fmtQuantidade(row.percentual_pis_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_pis_duimp',
    label: 'PIS a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 150,
    tooltipTitulo: 'Valor a Recolher do PIS (R$) — DUIMP',
    tooltipDescricao: 'Valor do PIS/PASEP a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_recolher_pis_duimp != null ? fmtMoeda(row.valor_recolher_pis_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — COFINS ──────────────────────────────────────────────────────────
  {
    key: 'base_calculo_cofins_duimp',
    label: 'BC COFINS (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 135,
    tooltipTitulo: 'Base de Cálculo do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Base de cálculo do COFINS em reais',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.base_calculo_cofins_duimp != null ? fmtMoeda(row.base_calculo_cofins_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  {
    key: 'percentual_cofins_duimp',
    label: 'Alíq. COFINS (%)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 130,
    tooltipTitulo: 'Alíquota do COFINS (%) — DUIMP',
    tooltipDescricao: 'Percentual de alíquota do COFINS',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.percentual_cofins_duimp != null ? `${fmtQuantidade(row.percentual_cofins_duimp, 2)}%` : '—'}
      </span>
    ),
  },
  {
    key: 'valor_recolher_cofins_duimp',
    label: 'COFINS a Recolher (R$)',
    tipo: 'numero',
    align: 'right',
    oculta: true,
    largura: 165,
    tooltipTitulo: 'Valor a Recolher do COFINS (R$) — DUIMP',
    tooltipDescricao: 'Valor do COFINS a recolher',
    render: (_val: unknown, row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_recolher_cofins_duimp != null ? fmtMoeda(row.valor_recolher_cofins_duimp, 'BRL') : '—'}
      </span>
    ),
  },
  // ── DUIMP — Tratamento administrativo ───────────────────────────────────────
  {
    key: 'existe_tratamento_administrativo_duimp',
    label: 'Trat. Adm. DUIMP?',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 155,
    tooltipTitulo: 'Existe Tratamento Administrativo? — DUIMP',
    tooltipDescricao: 'Indica se existe tratamento administrativo associado ao item na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.existe_tratamento_administrativo_duimp ?? '—'}</span>,
  },
  {
    key: 'tipo_trat_adm_duimp',
    label: 'Tipo Trat. Adm. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Tipo de Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Tipo/modalidade do tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.tipo_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'orgao_trat_adm_duimp',
    label: 'Órgão Trat. Adm. DUIMP',
    tipo: 'texto',
    filtravel: true,
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Órgão do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Órgão anuente responsável pelo tratamento administrativo',
    render: (_val: unknown, row: PedidoItem) => <span>{row.orgao_trat_adm_duimp ?? '—'}</span>,
  },
  {
    key: 'numero_lpco_trat_adm_duimp',
    label: 'LPCO Trat. Adm. DUIMP',
    tipo: 'texto',
    oculta: true,
    largura: 175,
    tooltipTitulo: 'Número da LPCO do Tratamento Administrativo — DUIMP',
    tooltipDescricao: 'Número da LPCO vinculada ao tratamento administrativo na DUIMP',
    render: (_val: unknown, row: PedidoItem) => <span>{row.numero_lpco_trat_adm_duimp ?? '—'}</span>,
  },
]

// ── Campos editáveis (todos exceto Saldo, que é derivado) ────────────────────

const CAMPOS_EDITAVEIS_PAI = COLUNAS_PAI
  .filter(c => c.key !== 'saldo_quantidade')
  .map(c => c.key)

// ── Mapa de colunas filho → renderização nas linhas expandidas ────────────────
// As linhas de item usam as mesmas colunas do pedido pai para alinhamento perfeito.
// Colunas sem mapeamento ficam vazias na linha do item.

const CAMPOS_NUMERICOS_ITEM = new Set([
  'quantidade_inicial', 'quantidade_atual', 'quantidade_pronta',
  'quantidade_transferida', 'quantidade_cancelada',
  'valor_unitario', 'valor_item',
  'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
])

// Campos que pertencem ao Pedido pai — edição roteia para pedidoApi
const CAMPOS_PAI_TEXTO = new Set([
  'exportador_nome', 'fabricante_nome',
  'referencia_importador', 'referencia_exportador', 'referencia_fabricante',
  'numero_proforma', 'numero_invoice',
  'incoterm', 'condicao_pagamento',
])

// Tipo auxiliar: item enriquecido com dados do pedido pai para renderização
type PedidoItemEnriquecido = PedidoItem & {
  _p: {
    id: string
    tipo_operacao: string
    exportador_nome: string | null
    fabricante_nome: string | null
    referencia_importador: string | null
    referencia_exportador: string | null
    referencia_fabricante: string | null
    numero_proforma: string | null
    numero_invoice: string | null
    incoterm: string | null
    condicao_pagamento: string | null
    moeda_pedido: string | null
    unidade_comercializada_pedido: string | null
    cobertura_cambial: string | null
    data_emissao_pedido: string | null
    status: string
  }
}

const MAPA_COLUNAS_FILHO: Record<string, GTMapaColunasFilho<PedidoItem>> = {
  // ── Número do pedido → Part Number do item ────────────────────────────────
  numero_pedido: {
    editavel: true,
    campo: 'part_number',
    render: (row: PedidoItem) => (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
        <span style={{ color: 'var(--gtv-muted, #64748b)', fontVariantNumeric: 'tabular-nums', minWidth: '18px', textAlign: 'right', flexShrink: 0 }}>
          {row.sequencia_item ?? '—'}.
        </span>
        <span style={{ fontFamily: 'var(--font-mono, monospace)', letterSpacing: '0.01em' }}>
          {row.part_number}
        </span>
      </span>
    ),
  },
  // ── Colunas herdadas do pedido pai ────────────────────────────────────────
  tipo_operacao: {
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      if (!p) return null
      return (
        <StatusBadgeGlobal
          valor={p.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
          genero="feminino"
          style={p.tipo_operacao === 'importacao'
            ? { color: '#60a5fa', background: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.2)' }
            : { color: '#34d399', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.2)' }
          }
        />
      )
    },
  },
  exportador_nome: {
    editavel: true,
    campo: 'exportador_nome',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.exportador_nome ?? '—'}</span>
    },
  },
  fabricante_nome: {
    editavel: true,
    campo: 'fabricante_nome',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.fabricante_nome ?? '—'}</span>
    },
  },
  referencia_importador: {
    editavel: true,
    campo: 'referencia_importador',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.referencia_importador ?? '—'}</span>
    },
  },
  referencia_exportador: {
    editavel: true,
    campo: 'referencia_exportador',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.referencia_exportador ?? '—'}</span>
    },
  },
  numero_proforma: {
    editavel: true,
    campo: 'numero_proforma',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.numero_proforma ?? '—'}</span>
    },
  },
  numero_invoice: {
    editavel: true,
    campo: 'numero_invoice',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.numero_invoice ?? '—'}</span>
    },
  },
  incoterm: {
    editavel: true,
    campo: 'incoterm',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.incoterm ?? '—'}</span>
    },
  },
  status: {
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      if (!p) return null
      const cor = getStatusCor(p.status)
      return (
        <StatusBadgeGlobal
          valor={STATUS_PEDIDO_LABELS[p.status as keyof typeof STATUS_PEDIDO_LABELS] ?? p.status}
          genero="masculino"
          style={{ color: cor, background: `${cor}1e`, border: `1px solid ${cor}33` }}
        />
      )
    },
  },
  moeda_pedido: {
    render: (row: PedidoItem) => <span>{row.moeda_item ?? (row as PedidoItemEnriquecido)._p?.moeda_pedido ?? '—'}</span>,
  },
  unidade_comercializada_pedido: {
    render: (row: PedidoItem) => (
      <span>{row.unidade_comercializada_item ?? (row as PedidoItemEnriquecido)._p?.unidade_comercializada_pedido ?? '—'}</span>
    ),
  },
  referencia_fabricante: {
    editavel: true,
    campo: 'referencia_fabricante',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.referencia_fabricante ?? '—'}</span>
    },
  },
  cobertura_cambial: {
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.cobertura_cambial ?? '—'}</span>
    },
  },
  condicao_pagamento: {
    editavel: true,
    campo: 'condicao_pagamento',
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{p?.condicao_pagamento ?? '—'}</span>
    },
  },
  data_emissao_pedido: {
    render: (row: PedidoItem) => {
      const p = (row as PedidoItemEnriquecido)._p
      return <span>{fmtData(p?.data_emissao_pedido ?? null)}</span>
    },
  },
  // ── Pesos e cubagem do item ───────────────────────────────────────────────
  peso_liquido_total_pedido: {
    editavel: true,
    campo: 'peso_liquido_unitario',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_liquido_unitario != null
          ? `${fmtQuantidade(row.peso_liquido_unitario, getCasas('peso_liquido_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  peso_bruto_total_pedido: {
    editavel: true,
    campo: 'peso_bruto_unitario',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.peso_bruto_unitario != null
          ? `${fmtQuantidade(row.peso_bruto_unitario, getCasas('peso_bruto_unitario', 3))} kg`
          : '—'}
      </span>
    ),
  },
  cubagem_total_pedido: {
    editavel: true,
    campo: 'cubagem_unitaria',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.cubagem_unitaria != null
          ? `${fmtQuantidade(row.cubagem_unitaria, getCasas('cubagem_unitaria', 4))} m³`
          : '—'}
      </span>
    ),
  },
  // ── Valores ───────────────────────────────────────────────────────────────
  valor_total_pedido: {
    editavel: true,
    campo: 'valor_item',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {row.valor_item != null ? fmtMoeda(row.valor_item, row.moeda_item) : '—'}
      </span>
    ),
  },
  // ── Quantidades ───────────────────────────────────────────────────────────
  quantidade_total_pedido: {
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--color-success, #34d399)', fontWeight: 600 }}>
        {fmtQuantidade(row.quantidade_atual, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  quantidade_inicial_total: {
    editavel: true,
    campo: 'quantidade_inicial',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_inicial, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  quantidade_a_embarcar: {
    render: (row: PedidoItem) => {
      const qtd = Math.max(0, (row.quantidade_pronta ?? 0) - (row.quantidade_transferida ?? 0))
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? '#fbbf24' : undefined }}>
          {fmtQuantidade(qtd, getCasas('quantidade_item', 0))}
        </span>
      )
    },
  },
  quantidade_a_entregar: {
    render: (row: PedidoItem) => {
      const qtd = Math.max(0, (row.quantidade_inicial ?? 0) - (row.quantidade_transferida ?? 0))
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums', color: qtd > 0 ? '#60a5fa' : undefined }}>
          {fmtQuantidade(qtd, getCasas('quantidade_item', 0))}
        </span>
      )
    },
  },
  quantidade_transferida_total: {
    editavel: true,
    campo: 'quantidade_transferida',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_transferida, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  quantidade_pronta_total: {
    editavel: true,
    campo: 'quantidade_pronta',
    render: (row: PedidoItem) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {fmtQuantidade(row.quantidade_pronta ?? 0, getCasas('quantidade_item', 0))}
      </span>
    ),
  },
  saldo_quantidade: {
    render: (row: PedidoItem) => {
      const saldo = (row.quantidade_inicial ?? 0) - (row.quantidade_transferida ?? 0)
      return (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {fmtQuantidade(saldo, getCasas('quantidade_item', 0))}
        </span>
      )
    },
  },
}

// ── Colunas para exportação ───────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Linha',                    key: '_tipo_linha',                       largura: 10 },
  { header: 'Pedido',                   key: 'numero_pedido',                    largura: 18 },
  { header: 'Part Number',               key: 'numero_item',                      largura: 20 },
  { header: 'Tipo',                     key: 'tipo_operacao',                    largura: 14 },
  { header: 'Status',                   key: 'status',                           largura: 16 },
  { header: 'Exportador',               key: 'exportador_nome',                  largura: 25 },
  { header: 'Fabricante',               key: 'fabricante_nome',                  largura: 22 },
  { header: 'Ref. Importador',          key: 'referencia_importador',            largura: 20 },
  { header: 'Ref. Exportador',          key: 'referencia_exportador',            largura: 20 },
  { header: 'Ref. Fabricante',          key: 'referencia_fabricante',            largura: 20 },
  { header: 'Proforma',                 key: 'numero_proforma',                  largura: 16 },
  { header: 'Invoice',                  key: 'numero_invoice',                   largura: 16 },
  { header: 'Incoterm',                 key: 'incoterm',                         largura: 12 },
  { header: 'Valor Total',              key: 'valor_total_pedido',               largura: 18 },
  { header: 'Moeda',                    key: 'moeda_pedido',                     largura: 10 },
  { header: 'Qtd Total',                key: 'quantidade_total_pedido',          largura: 14 },
  { header: 'Unidade',                  key: 'unidade_comercializada_pedido',    largura: 12 },
  { header: 'Peso Líq. Total (kg)',      key: 'peso_liquido_total_pedido',        largura: 18 },
  { header: 'Peso Bruto Total (kg)',     key: 'peso_bruto_total_pedido',          largura: 18 },
  { header: 'Cubagem Total (m³)',        key: 'cubagem_total_pedido',             largura: 16 },
  { header: 'Cobertura Cambial',        key: 'cobertura_cambial',               largura: 18 },
  { header: 'Cond. Pagamento',          key: 'condicao_pagamento',              largura: 18 },
  { header: 'Data P.O',                 key: 'data_emissao_pedido',              largura: 14 },
  { header: 'Prev. Pronto',             key: 'data_prevista_pedido_pronto',      largura: 14 },
  { header: 'Conf. Pronto',             key: 'data_confirmada_pedido_pronto',    largura: 14 },
  { header: 'Meta Pronto',              key: 'data_meta_pedido_pronto',          largura: 14 },
  { header: 'Prev. Inspeção',           key: 'data_prevista_inspecao_pedido',    largura: 14 },
  { header: 'Conf. Inspeção',           key: 'data_confirmada_inspecao_pedido',  largura: 14 },
  { header: 'Meta Inspeção',            key: 'data_meta_inspecao_pedido',        largura: 14 },
  { header: 'Prev. Coleta',             key: 'data_prevista_coleta_pedido',      largura: 14 },
  { header: 'Conf. Coleta',             key: 'data_confirmada_coleta_pedido',    largura: 14 },
  { header: 'Meta Coleta',              key: 'data_meta_coleta_pedido',          largura: 14 },
  { header: 'Dt Consolidação',          key: 'data_consolidacao_pedido',         largura: 14 },
  { header: 'Dt Transf. Saldo',         key: 'data_transferencia_saldo_pedido',  largura: 14 },
]

// ── Ações de linha (pai) — criadas dentro do componente para acesso ao navigate ─

// ── Componente ────────────────────────────────────────────────────────────────

// ── Helper: traduz erro de API em mensagem clara para o usuário ───────────────

function mensagemErro(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err ?? '')
  const low = msg.toLowerCase()

  // ── Erros HTTP por código exato ────────────────────────────────────────────
  if (msg.includes('HTTP 400'))
    return 'Dados inválidos. Verifique o valor informado e tente novamente.'
  if (msg.includes('HTTP 401'))
    return 'Sessão expirada. Recarregue a página e faça login novamente.'
  if (msg.includes('HTTP 403'))
    return 'Sem permissão para editar este campo.'
  if (msg.includes('HTTP 404'))
    return 'Registro não encontrado. Atualize a página.'
  if (msg.includes('HTTP 409'))
    return 'Conflito de edição — outra aba já alterou este registro. Valor restaurado.'
  if (msg.includes('HTTP 422'))
    return 'Valor inválido para este campo. Verifique o formato esperado.'
  if (msg.includes('HTTP 429'))
    return 'Muitas requisições. Aguarde alguns segundos e tente novamente.'
  if (/HTTP 5\d\d/.test(msg))
    return 'Erro interno do servidor. Tente novamente em instantes.'

  // ── Resposta inválida do servidor (JSON parse error) ──────────────────────
  if (low.includes('unexpected token') || low.includes('is not valid json') || low.includes('syntaxerror'))
    return 'O servidor retornou uma resposta inválida. Tente novamente ou contate o suporte.'

  // ── Erros de rede / conectividade ─────────────────────────────────────────
  if (low.includes('failed to fetch') || low.includes('networkerror') || low.includes('network request failed'))
    return 'Sem conexão com o servidor. Verifique sua rede e tente novamente.'
  if (low.includes('timeout') || low.includes('timed out'))
    return 'A requisição demorou demais. Verifique sua conexão e tente novamente.'
  if (low.includes('aborted') || low.includes('abort'))
    return 'A operação foi cancelada. Tente novamente.'

  // ── Mensagem da API com conteúdo útil — exibir diretamente ───────────────
  // Mensagens curtas sem prefixo HTTP vêm do backend e são legíveis
  // ex: "O campo incoterm deve ser FOB, CIF ou EXW"
  if (msg.length > 0 && msg.length <= 120 && !msg.startsWith('HTTP'))
    return msg

  // ── Fallback genérico ─────────────────────────────────────────────────────
  return 'Erro ao salvar. Tente novamente ou contate o suporte.'
}

// ── Componente ────────────────────────────────────────────────────────────────

export default function ListaPedidos() {
  const { t } = useTranslation()
  const { visiveis: cardsVisiveis } = useCardPreferences()
  const navigate = useNavigate()
  const addNotification = useShellStore(s => s.addNotification)

  // ── Estado de dados ──────────────────────────────────────────────────────────
  const [pedidos, setPedidos]               = useState<Pedido[]>([])
  const [carregando, setCarregando]         = useState(true)
  const [carregandoMais, setCarregandoMais] = useState(false)
  const [temMais, setTemMais]               = useState(false)
  const [cursor, setCursor]                 = useState<string | undefined>(undefined)
  const [total, setTotal]                   = useState(0)

  // ── Seleção de pedidos (bubbled do TabelaVirtualGlobal) ──────────────────────
  const [pedidosSelecionados, setPedidosSelecionados] = useState<Pedido[]>([])

  // ── Seleção de itens filho (bubbled do TabelaVirtualGlobal) ──────────────────
  const [itensSelecionados, setItensSelecionados] = useState<PedidoItem[]>([])

  // ── Estado de exclusão de itens ───────────────────────────────────────────────
  const [excluindoItens, setExcluindoItens] = useState(false)

  // ── Estado do modal Transferir ───────────────────────────────────────────────
  const [modalTransferir, setModalTransferir] = useState<{ item: PedidoItem; pedidoId: string } | null>(null)
  const [qtdTransferir, setQtdTransferir]     = useState('')

  // ── Estado de UI ─────────────────────────────────────────────────────────────
  const [abaAtiva, setAbaAtiva]             = useState('todos')
  const [abas, setAbas]                     = useState<GTAbaTipo[]>(ABAS_PADRAO)
  const [preferencias, setPreferencias]     = useState<GTPreferencias | undefined>(undefined)
  const [sortCampo, setSortCampo]           = useState('data_emissao_pedido')
  const [sortDir, setSortDir]               = useState<'asc' | 'desc'>('desc')
  const [busca, setBusca]                   = useState('')
  const [erroLote, setErroLote]             = useState<string | null>(null)
  const [modalConsolidarAberto, setModalConsolidarAberto] = useState(false)
  const [modalTransferirAberto, setModalTransferirAberto] = useState(false)
  const [modalEdicaoMassaAberto, setModalEdicaoMassaAberto] = useState(false)
  const [modalDuplicarAberto, setModalDuplicarAberto] = useState(false)
  const [modalGerarPdfAberto, setModalGerarPdfAberto] = useState(false)
  const [excluindoLote, setExcluindoLote] = useState(false)

  // ── Colunas do Usuário ────────────────────────────────────────────────────────
  const [colunasUsuario, setColunasUsuario] = useState<ColunaUsuario[]>([])

  // Colunas pai estáticas + colunas customizadas do usuário (escopo pedido ou ambos)
  const colunasComUsuario = useMemo<GTColuna<Pedido>[]>(() => {
    const custom = colunasUsuario
      .filter(c => c.escopo === 'pedido' || c.escopo === 'ambos')
      .map(mapColunaUsuarioParaGTColuna)
    return [...COLUNAS_PAI, ...custom]
  }, [colunasUsuario])

  // ── Estado de filtros de coluna ───────────────────────────────────────────────
  const [filtrosAtivos, setFiltrosAtivos]   = useState<FiltrosAtivosMap>({})
  const [popoverAberto, setPopoverAberto]   = useState<string | null>(null)
  const popoverAnchorRefs                   = useRef<Record<string, React.MutableRefObject<HTMLElement | null>>>({})

  function getAnchorRef(campo: string): React.MutableRefObject<HTMLElement | null> {
    if (!popoverAnchorRefs.current[campo]) {
      popoverAnchorRefs.current[campo] = React.createRef<HTMLElement>() as React.MutableRefObject<HTMLElement | null>
    }
    return popoverAnchorRefs.current[campo]
  }

  // ── Pedidos filtrados (client-side) ───────────────────────────────────────────
  const pedidosFiltrados = useMemo<Pedido[]>(() => {
    let resultado = pedidos
    // Filtro por aba de status (client-side para dev/mock; produção filtra no servidor)
    if (abaAtiva !== 'todos') {
      resultado = resultado.filter(p => p.status === abaAtiva)
    }
    // Busca global client-side (em dev o mock ignora o param de busca do servidor)
    if (busca.trim()) {
      const termo = busca.trim().toLowerCase()
      resultado = resultado.filter(p =>
        [p.numero_pedido, p.exportador_nome, p.fabricante_nome,
         p.referencia_importador, p.referencia_exportador,
         p.numero_proforma, p.numero_invoice]
          .some(v => v != null && String(v).toLowerCase().includes(termo))
      )
    }
    if (Object.keys(filtrosAtivos).length === 0) return resultado
    return resultado.filter(p => {
      const row = p as Record<string, unknown>
      for (const [campo, filtro] of Object.entries(filtrosAtivos)) {
        const val = row[campo]
        if (filtro.tipo === 'texto') {
          if (!String(val ?? '').toLowerCase().includes(filtro.valor.toLowerCase())) return false
        } else if (filtro.tipo === 'enum') {
          const strVal = String(val ?? '')
          if (filtro.valor.size > 0 && !filtro.valor.has(strVal)) return false
        } else if (filtro.tipo === 'numero') {
          const n = Number(val)
          if (filtro.valor.min != null && n < filtro.valor.min) return false
          if (filtro.valor.max != null && n > filtro.valor.max) return false
        }
      }
      return true
    })
  }, [pedidos, filtrosAtivos, abaAtiva, busca])

  // ── Handlers de filtro ────────────────────────────────────────────────────────
  const handleAplicarFiltro = useCallback((campo: string, filtro: FiltroAtivo) => {
    setFiltrosAtivos(prev => ({ ...prev, [campo]: filtro }))
  }, [])

  const handleLimparFiltro = useCallback((campo: string) => {
    setFiltrosAtivos(prev => {
      const novo = { ...prev }
      delete novo[campo]
      return novo
    })
  }, [])

  const handleLimparTodosFiltros = useCallback(() => {
    setFiltrosAtivos({})
  }, [])

  // ── Valores únicos por campo (para filtro enum e sugestões texto) ────────────
  const valoresUnicosPorCampo = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {}
    for (const col of COLUNAS_PAI) {
      if (!col.filtravel) continue
      if (detectarTipoColuna(col) === 'numero') continue // range — sem lista
      const vals = new Set<string>()
      for (const p of pedidos) {
        const v = String((p as Record<string, unknown>)[col.key] ?? '').trim()
        if (v && v !== 'undefined' && v !== 'null') vals.add(v)
      }
      if (vals.size > 0) result[col.key] = Array.from(vals).sort()
    }
    return result
  }, [pedidos])

  // ── Rótulo legível do valor de filtro ─────────────────────────────────────────
  function rotulofiltro(campo: string, filtro: FiltroAtivo): string {
    if (filtro.tipo === 'texto') return filtro.valor
    if (filtro.tipo === 'enum') return Array.from(filtro.valor).join(', ')
    if (filtro.tipo === 'numero') {
      const { min, max } = filtro.valor
      if (min != null && max != null) return `${min} — ${max}`
      if (min != null) return `≥ ${min}`
      if (max != null) return `≤ ${max}`
    }
    return ''
  }

  // ── Estado dos modais de criação ─────────────────────────────────────────────
  const [drawerAberto, setDrawerAberto]           = useState(false)
  const [pedidoEditandoId, setPedidoEditandoId]   = useState<string | undefined>(undefined)
  const [smartImportAberto, setSmartImportAberto] = useState(false)
  const [novoDropdownAberto, setNovoDropdownAberto] = useState(false)
  const [modalCockpitAberto, setModalCockpitAberto] = useState(false)
  const novoDropdownRef = useRef<HTMLDivElement>(null)

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)


  // ── Carregar status e preferências ──────────────────────────────────────────
  useEffect(() => {
    // Inicializar abas do localStorage imediatamente (enquanto API carrega)
    const abasLocal = lerAbasDoLocalStorage()
    if (abasLocal && abasLocal.length > 1) setAbas(abasLocal)

    pedidoConfigApi.listarStatus()
      .then(res => {
        if (res.data.length > 0) {
          const abasApi: GTAbaTipo[] = [
            { valor: 'todos', label: 'Todos' },
            ...res.data
              .sort((a, b) => a.ordem - b.ordem)
              .map((s: PedidoStatusConfig) => ({
                valor: s.nome,
                label: s.rotulo,
                cor: s.cor,
              })),
          ]
          // Mescla com extras do localStorage (status criados pelo usuário)
          const idsApi = new Set(abasApi.map(a => a.valor))
          const extras = (abasLocal ?? []).filter(a => a.valor !== 'todos' && !idsApi.has(a.valor))
          setAbas([...abasApi, ...extras])
        }
      })
      .catch(() => {
        // Fallback: usar dados do localStorage ou ABAS_PADRAO
        if (!abasLocal || abasLocal.length <= 1) return
        setAbas(abasLocal)
      })

    pedidoConfigApi.getPreferenciasUsuario()
      .then(prefs => {
        if (prefs?.colunas_visiveis?.length > 0) {
          setPreferencias({
            colunas_visiveis: prefs.colunas_visiveis,
            larguras: prefs.colunas_largura,
          })
        }
      })
      .catch(() => { /* sem preferências salvas */ })

    // Carregar colunas customizadas do usuário (escopo pedido ou ambos)
    colunasUsuarioApi.listar()
      .then(lista => setColunasUsuario(lista))
      .catch(() => { /* fallback: sem colunas customizadas */ })
  }, [])

  // ── Primeira carga ───────────────────────────────────────────────────────────
  const carregarInicial = useCallback(async (
    novaAba: string = abaAtiva,
    novaOrdem: string = sortCampo,
    novaDir: 'asc' | 'desc' = sortDir,
    novaBusca: string = busca,
  ) => {
    if (carregandoRef.current) return
    carregandoRef.current = true
    setCarregando(true)
    setCursor(undefined)
    try {
      const res = await pedidoVirtualApi.listar({
        sort: novaOrdem,
        dir: novaDir,
        limit: 100,
        status: novaAba !== 'todos' ? novaAba : undefined,
        busca: novaBusca || undefined,
      })
      setPedidos(res.data)
      setTotal(res.total)
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } catch {
      // Em dev sem backend, usar mock vazio para não bloquear UI
      setPedidos([])
      setTotal(0)
      setTemMais(false)
    } finally {
      setCarregando(false)
      carregandoRef.current = false
    }
  }, [abaAtiva, sortCampo, sortDir, busca])

  // ── Fechar dropdown ao clicar fora ──────────────────────────────────────────
  useEffect(() => {
    if (!novoDropdownAberto) return
    const handler = (e: MouseEvent) => {
      if (novoDropdownRef.current && !novoDropdownRef.current.contains(e.target as Node)) {
        setNovoDropdownAberto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [novoDropdownAberto])

  useEffect(() => { carregarInicial() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Carregar mais (cursor) ───────────────────────────────────────────────────
  const handleCarregarMais = useCallback(async () => {
    if (!temMais || carregandoMais || !cursor) return
    setCarregandoMais(true)
    try {
      const res = await pedidoVirtualApi.listar({
        cursor,
        sort: sortCampo,
        dir: sortDir,
        limit: 100,
        status: abaAtiva !== 'todos' ? abaAtiva : undefined,
        busca: busca || undefined,
      })
      setPedidos(prev => [...prev, ...res.data])
      setTemMais(res.hasMore)
      setCursor(res.nextCursor ?? undefined)
    } finally {
      setCarregandoMais(false)
    }
  }, [temMais, carregandoMais, cursor, sortCampo, sortDir, abaAtiva, busca])

  // ── Mudar aba ────────────────────────────────────────────────────────────────
  const handleMudarAba = useCallback((aba: string) => {
    setAbaAtiva(aba)
    carregarInicial(aba, sortCampo, sortDir, busca)
  }, [carregarInicial, sortCampo, sortDir, busca])

  // ── Ordenação ────────────────────────────────────────────────────────────────
  const handleOrdenar = useCallback((campo: string, dir: 'asc' | 'desc') => {
    setSortCampo(campo)
    setSortDir(dir)
    carregarInicial(abaAtiva, campo, dir, busca)
  }, [carregarInicial, abaAtiva, busca])

  // ── Busca ────────────────────────────────────────────────────────────────────
  const handleBuscar = useCallback((termo: string) => {
    setBusca(termo)
    carregarInicial(abaAtiva, sortCampo, sortDir, termo)
  }, [carregarInicial, abaAtiva, sortCampo, sortDir])

  // ── Edição inline (pai) ──────────────────────────────────────────────────────
  const handleEditar = useCallback(async (id: string, campo: string, valor: unknown): Promise<Pedido> => {
    const atualizado = await pedidoVirtualApi.editarCampo(id, campo, valor)
    setPedidos(prev => prev.map(p => p.id === id ? atualizado : p))
    return atualizado
  }, [])

  // ── Edição inline (filho / item) ──────────────────────────────────────────────
  const handleEditarFilho = useCallback(async (id: string, campo: string, valor: unknown): Promise<PedidoItem> => {
    // Localiza o item no estado atual para saber o pedidoId
    const pedido = pedidos.find(p => p.itens?.some(i => i.id === id))
    if (!pedido) throw new Error('Não foi possível localizar o pedido deste item. Recarregue a página.')

    // Campos do pedido pai → atualiza o pedido, não o item
    if (CAMPOS_PAI_TEXTO.has(campo)) {
      const pedidoAtualizado = await pedidoApi.atualizar(pedido.id, { [campo]: valor as string } as Partial<Pedido>)
        .catch(() => {
          if (import.meta.env.DEV) return { ...pedido, [campo]: valor } as Pedido
          throw new Error(`Erro ao editar campo ${campo} do pedido`)
        })
      // Atualiza o pedido e re-enriquece os itens com o novo valor
      setPedidos(prev => prev.map(p => {
        if (p.id !== pedido.id) return p
        return {
          ...p,
          ...pedidoAtualizado,
          itens: p.itens?.map(i => ({
            ...i,
            _p: { ...(i as PedidoItemEnriquecido)._p, [campo]: valor },
          })),
        }
      }))
      const item = pedido.itens?.find(i => i.id === id)!
      return { ...item, _p: { ...(item as PedidoItemEnriquecido)._p, [campo]: valor } } as PedidoItem
    }

    const valorFinal: unknown = CAMPOS_NUMERICOS_ITEM.has(campo) ? Number(valor) || 0 : valor

    const atualizado = await pedidoItemApi.atualizar(pedido.id, id, { [campo]: valorFinal } as Partial<PedidoItem>)
      .catch(() => {
        if (import.meta.env.DEV) {
          const item = pedido.itens?.find(i => i.id === id)
          if (item) return { ...item, [campo]: valorFinal } as PedidoItem
        }
        throw new Error(`Erro ao editar campo ${campo}`)
      })

    // Atualiza o item e recalcula os aggregates do pedido pai
    setPedidos(prev => prev.map(p => {
      if (p.id !== pedido.id) return p
      const itensAtualizados = p.itens?.map(i => i.id === id ? atualizado : i) ?? []
      return {
        ...p,
        itens: itensAtualizados,
        quantidade_inicial_total:    itensAtualizados.reduce((s, i) => s + (Number(i.quantidade_inicial)    || 0), 0),
        quantidade_transferida_total: itensAtualizados.reduce((s, i) => s + (Number(i.quantidade_transferida) || 0), 0),
      }
    }))
    return atualizado
  }, [pedidos])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  const handleCarregarFilhos = useCallback(async (pedido: Pedido): Promise<PedidoItem[]> => {
    return (pedido.itens ?? []).map(item => ({
      ...item,
      _p: {
        id: pedido.id,
        tipo_operacao: pedido.tipo_operacao,
        exportador_nome: pedido.exportador_nome ?? null,
        fabricante_nome: pedido.fabricante_nome ?? null,
        referencia_importador: pedido.referencia_importador ?? null,
        referencia_exportador: pedido.referencia_exportador ?? null,
        referencia_fabricante: pedido.referencia_fabricante ?? null,
        numero_proforma: pedido.numero_proforma ?? null,
        numero_invoice: pedido.numero_invoice ?? null,
        incoterm: pedido.incoterm ?? null,
        condicao_pagamento: pedido.condicao_pagamento ?? null,
        moeda_pedido: pedido.moeda_pedido ?? null,
        unidade_comercializada_pedido: pedido.unidade_comercializada_pedido ?? null,
        cobertura_cambial: pedido.cobertura_cambial ?? null,
        data_emissao_pedido: pedido.data_emissao_pedido ?? null,
        status: pedido.status,
      },
    }))
  }, [])

  // ── Salvar preferências ──────────────────────────────────────────────────────
  const handleSalvarPreferencias = useCallback((prefs: GTPreferencias) => {
    setPreferencias(prefs)
    pedidoConfigApi.salvarPreferenciasUsuario({
      colunas_visiveis: prefs.colunas_visiveis,
      colunas_largura: prefs.larguras,
    }).catch(() => { /* silent — preferências ficam localmente */ })
  }, [])

  // ── Ações em lote ─────────────────────────────────────────────────────────────
  const acoesLote: GTAcaoLote<Pedido>[] = [
    {
      id: 'mudar-status',
      label: 'Mudar Status',
      icone: <ArrowsClockwise size={15} weight="duotone" />,
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.mudarStatusPreview(ids, 'consolidado')
          const resumo = preview.afetados.map(a => `✓ ${a.numero_pedido} → ${a.status}`).join('\n')
          if (window.confirm(`${resumo}\n\nConfirmar mudança de status?`)) {
            await pedidoLoteApi.mudarStatusConfirmar(ids, 'consolidado')
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao mudar status')
        }
      },
    },
    {
      id: 'cancelar',
      label: 'Cancelar Pedidos',
      icone: <X size={15} weight="duotone" />,
      variant: 'danger',
      onClick: async (itens: Pedido[]) => {
        const ids = itens.map((p: Pedido) => p.id)
        try {
          const preview = await pedidoLoteApi.cancelarPreview(ids)
          if (window.confirm(`${preview.resumo.join('\n')}\n\nConfirmar cancelamento?`)) {
            await pedidoLoteApi.cancelarConfirmar(ids)
            await carregarInicial()
          }
        } catch (err) {
          setErroLote(err instanceof Error ? err.message : 'Erro ao cancelar')
        }
      },
    },
  ]

  // ── Config de exportação (lida do localStorage — mesmas preferências de Configurações) ──
  // ── Lê config de exportação fresco no momento do clique (não cache stale) ──
  function lerExportConfig() {
    try {
      const raw = localStorage.getItem('pedido:export_config')
      if (raw) return JSON.parse(raw) as {
        formatoPadrao: 'csv' | 'xlsx' | 'pdf'
        incluirColunasUsuario: boolean
        incluirItens: boolean
        apenasSelection: boolean
        incluirCabecalho: boolean
        separadorCsv: 'virgula' | 'ponto-virgula' | 'tab'
      }
    } catch { /* ignore */ }
    return { formatoPadrao: 'xlsx' as const, incluirColunasUsuario: true, incluirItens: true, apenasSelection: false, incluirCabecalho: true, separadorCsv: 'ponto-virgula' as const }
  }

  function buildDadosExport() {
    const cfg = lerExportConfig()
    const base = cfg.apenasSelection && pedidosSelecionados.length > 0
      ? pedidosSelecionados
      : pedidosFiltrados

    const colunasExport: ColunasExport[] = [
      ...COLUNAS_EXPORT,
      ...(cfg.incluirColunasUsuario
        ? colunasUsuario.map(c => ({ header: c.nome, key: c.chave, largura: 18 }))
        : []),
    ]

    const sepMap = { virgula: ',' as const, 'ponto-virgula': ';' as const, tab: '\t' as const }
    const sep = sepMap[cfg.separadorCsv] ?? ','

    let dados: Record<string, unknown>[]
    if (cfg.incluirItens) {
      dados = base.flatMap(p => {
        const pai = p as unknown as Record<string, unknown>
        const itensDoPedido = (p.itens ?? []).map((i, _idx) => ({
          ...pai,
          _tipo_linha: 'Item',
          numero_item: i.part_number ?? '',
          part_number: i.part_number,
          descricao: i.descricao,
          ncm: i.ncm,
          quantidade_item: i.quantidade_atual,
          quantidade_inicial_item: i.quantidade_inicial,
          valor_unitario: i.valor_unitario,
          valor_item: i.valor_item,
          moeda_item: i.moeda_item,
          unidade_item: i.unidade_comercializada_item,
        }))
        return itensDoPedido.length > 0
          ? [{ ...pai, _tipo_linha: 'Pedido', numero_item: '' }, ...itensDoPedido]
          : [{ ...pai, _tipo_linha: 'Pedido' }]
      })
    } else {
      dados = base.map(p => ({ ...(p as unknown as Record<string, unknown>), _tipo_linha: 'Pedido' }))
    }

    return { cfg, dados, colunasExport, sep }
  }

  // ── Ações de exportação (client-side) ────────────────────────────────────────
  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarExcel(dados, colunasExport, { nomeArquivo: 'pedidos', titulo: 'Pedidos' })
      },
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport, sep } = buildDadosExport()
        exportarCSV(dados, colunasExport, { nomeArquivo: 'pedidos', semCabecalho: !cfg.incluirCabecalho, separadorCsv: sep })
      },
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { cfg, dados, colunasExport } = buildDadosExport()
        exportarTXT(dados, colunasExport, { nomeArquivo: 'pedidos', semCabecalho: !cfg.incluirCabecalho })
      },
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarXML(dados, colunasExport, { nomeArquivo: 'pedidos' })
      },
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { dados, colunasExport } = buildDadosExport()
        exportarJSON(dados, colunasExport, { nomeArquivo: 'pedidos' })
      },
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [pedidos, pedidosFiltrados, pedidosSelecionados, colunasUsuario])

  // ── Stats para KPIs ──────────────────────────────────────────────────────────
  const valorTotal    = pedidos.reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)
  const qtdTotal      = pedidos.reduce((acc, p) => acc + (p.quantidade_total_pedido ?? 0), 0)
  const todosItens    = pedidos.flatMap(p => p.itens ?? [])
  const itensProntos  = todosItens.reduce((acc, i) => acc + (i.quantidade_pronta    ?? 0), 0)
  const qtdAtualTotal = todosItens.reduce((acc, i) => acc + (i.quantidade_atual     ?? 0), 0)
  const coberturaPend = pedidos
    .filter(p => p.cobertura_cambial === 'sem_cobertura' || !p.cobertura_cambial)
    .reduce((acc, p) => acc + (p.valor_total_pedido ?? 0), 0)

  return (
    <div className="ws-fade-up lp-page">

      {/* ── KPI cards ── */}
      <div className="lp-stats-row">
        <div className="lp-cards">
          {cardsVisiveis.map(pref => {
            if (pref.id === 'total_pedidos') return (
              <CardBasicoGlobal key="total_pedidos"
                titulo={t('pedido.total_pedidos')}
                icone={<Package weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
                valor={total}
                subtexto={`${todosItens.length} ${t('pedido.itens_total')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.abertos')}</span><strong>{pedidos.filter(p => p.status === 'aberto').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.em_andamento')}</span><strong>{pedidos.filter(p => p.status === 'transferencia').length}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.concluidos')}</span><strong>{pedidos.filter(p => p.status === 'consolidado').length}</strong></p>
                </>}
              />
            )
            if (pref.id === 'valor_total') return (
              <CardBasicoGlobal key="valor_total"
                titulo={t('pedido.valor_total')}
                icone={<CurrencyDollar weight="duotone" size={16} style={{ color: '#34d399' }} />}
                valor={fmtMoeda(valorTotal)}
                variante="sucesso"
                subtexto={t('pedido.soma_pedidos')}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.moeda')}</span><strong>USD</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.media_por_pedido')}</span><strong>{fmtMoeda(pedidos.length ? valorTotal / pedidos.length : 0)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'qtd_total') return (
              <CardBasicoGlobal key="qtd_total"
                titulo={t('pedido.qtd_total')}
                icone={<Scales weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                valor={fmtQuantidade(qtdTotal)}
                variante="aviso"
                subtexto={`${fmtQuantidade(qtdAtualTotal)} ${t('pedido.saldo_atual')}`}
                tooltip={<>
                  <p className="cg-tooltip__row"><span>{t('pedido.pronto')}</span><strong>{fmtQuantidade(itensProntos)}</strong></p>
                  <p className="cg-tooltip__row"><span>{t('pedido.saldo_vivo')}</span><strong>{fmtQuantidade(qtdAtualTotal)}</strong></p>
                </>}
              />
            )
            if (pref.id === 'cobertura_pendente') return (
              <CardBasicoGlobal key="cobertura_pendente"
                titulo={t('pedido.cobertura_pendente')}
                icone={<Warning weight="duotone" size={16} style={{ color: '#f87171' }} />}
                valor={fmtMoeda(coberturaPend)}
                variante="erro"
                subtexto={t('pedido.sem_cobertura')}
                tooltip={<p className="cg-tooltip__row"><span>{t('pedido.aguardando_cobertura')}</span><strong>{pedidos.filter(p => !p.cobertura_cambial || p.cobertura_cambial === 'sem_cobertura').length}</strong></p>}
              />
            )
            return null
          })}
        </div>
      </div>

      {/* ── Feedback de erro em lote ── */}
      {erroLote && (
        <div className="lp-erro-lote" role="alert">
          <Warning size={16} weight="duotone" />
          <span>{erroLote}</span>
          <button onClick={() => setErroLote(null)} aria-label="Fechar erro"><X size={14} /></button>
        </div>
      )}

      {/* ── Chips de filtros ativos ── */}
      {Object.keys(filtrosAtivos).length > 0 && (
        <div className="lp-filtros-chips" role="status" aria-label="Filtros ativos">
          {COLUNAS_PAI.filter(col => filtrosAtivos[col.key] != null).map(col => {
            const filtro = filtrosAtivos[col.key]!
            return (
              <span key={col.key} className="lp-filtro-chip">
                <span className="lp-filtro-chip-label">{col.label}:</span>
                <span className="lp-filtro-chip-valor">{rotulofiltro(col.key, filtro)}</span>
                <button
                  className="lp-filtro-chip-remove"
                  onClick={() => handleLimparFiltro(col.key)}
                  aria-label={`Remover filtro ${col.label}`}
                >
                  <X size={10} weight="bold" />
                </button>
              </span>
            )
          })}
          <button
            className="lp-filtros-limpar-tudo"
            onClick={handleLimparTodosFiltros}
          >
            Limpar tudo
          </button>
        </div>
      )}

      {/* ── Popovers de filtro (renderizados no nível do page para z-index correto) ── */}
      {popoverAberto && (() => {
        const col = COLUNAS_PAI.find(c => c.key === popoverAberto)
        if (!col) return null
        const anchorRef = getAnchorRef(popoverAberto)
        return (
          <FiltroPopoverColuna
            campo={col.key}
            label={col.label}
            tipo={detectarTipoColuna(col)}
            filtroAtual={filtrosAtivos[col.key]}
            valoresUnicos={valoresUnicosPorCampo[col.key] ?? []}
            onAplicar={handleAplicarFiltro}
            onLimpar={handleLimparFiltro}
            onOrdenar={handleOrdenar}
            onFechar={() => setPopoverAberto(null)}
            anchorRef={anchorRef}
          />
        )
      })()}

      {/* ── Tabela virtual ── */}
      <div className="lp-tabela-wrapper">
        <TabelaVirtualGlobal<Pedido, PedidoItem>
          dados={pedidosFiltrados}
          colunas={colunasComUsuario}
          itemId={(p: Pedido) => p.id}

          mapaColunasFilho={MAPA_COLUNAS_FILHO}
          onCarregarFilhos={handleCarregarFilhos}
          filhoId={(i: PedidoItem) => i.id}
          temMais={temMais}
          carregandoMais={carregandoMais}
          onCarregarMais={handleCarregarMais}

          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={handleMudarAba}

          acoes={[
            {
              id: 'editar',
              tooltip: 'Editar pedido',
              icone: <PencilLine size={14} weight="duotone" />,
              onClick: (pedido: Pedido) => {
                setPedidoEditandoId(pedido.id)
                setDrawerAberto(true)
              },
            },
          ]}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          onSelecaoMudar={setPedidosSelecionados}
          onFiltroColuna={(key, anchor) => {
            setPopoverAberto(prev => prev === key ? null : key)
            // Armazena o elemento âncora para posicionamento do popover
            const ref = getAnchorRef(key)
            if (ref && 'current' in ref) (ref as React.MutableRefObject<HTMLElement | null>).current = anchor
          }}
          filtrosAtivosKeys={new Set(Object.keys(filtrosAtivos))}

          selecionavelFilhos
          onSelecaoFilho={(itens: PedidoItem[]) => setItensSelecionados(itens)}
          acoesFilho={(item: PedidoItem) => [
            {
              label: 'Transferir',
              icone: <ArrowsLeftRight size={13} weight="duotone" />,
              onClick: () => {
                setItensSelecionados([item])
                setModalTransferirAberto(true)
              },
            },
            {
              label: 'Duplicar',
              icone: <CopySimple size={13} weight="duotone" />,
              onClick: () => {
                setItensSelecionados([item])
                setModalDuplicarAberto(true)
              },
            },
            {
              label: 'Excluir',
              icone: <Trash size={13} weight="duotone" />,
              perigo: true,
              onClick: async () => {
                setExcluindoItens(true)
                try {
                  await pedidoExcluirApi.excluirItens(item.pedido_id, [item.id])
                  addNotification({ tipo: 'sucesso', mensagem: 'Item excluído com sucesso.' })
                  await carregarInicial()
                } catch {
                  addNotification({ tipo: 'erro', mensagem: 'Erro ao excluir item. Tente novamente.' })
                } finally {
                  setExcluindoItens(false)
                }
              },
            },
          ]}

          acoesBarra={
            <>
              {/* ── Dropdown "Novo" ── */}
              <div ref={novoDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                <BotaoGlobal
                  variante="primario"
                  tamanho="pequeno"
                  icone={<Plus size={14} weight="bold" />}
                  onClick={() => setNovoDropdownAberto(prev => !prev)}
                >
                  Novo <CaretDown size={12} weight="bold" style={{ marginLeft: 2 }} />
                </BotaoGlobal>

                {novoDropdownAberto && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    zIndex: 200,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                    minWidth: '170px',
                    padding: '0.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.125rem',
                  }}>
                    {/* Manual */}
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', border: 'none', borderRadius: '0.375rem',
                        background: 'transparent', color: 'var(--text-primary)',
                        fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        setPedidoEditandoId(undefined)
                        setDrawerAberto(true)
                        setNovoDropdownAberto(false)
                      }}
                    >
                      <Plus size={14} weight="bold" style={{ color: 'var(--ws-accent)', flexShrink: 0 }} />
                      Manual
                    </button>

                    {/* Importar */}
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', border: 'none', borderRadius: '0.375rem',
                        background: 'transparent', color: 'var(--text-primary)',
                        fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        setSmartImportAberto(true)
                        setNovoDropdownAberto(false)
                      }}
                    >
                      <UploadSimple size={14} weight="duotone" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      Importar
                    </button>

                    {/* Divider */}
                    <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.125rem 0.5rem' }} />

                    {/* Cockpit API */}
                    <button
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', border: 'none', borderRadius: '0.375rem',
                        background: 'transparent', color: 'var(--text-primary)',
                        fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => {
                        setModalCockpitAberto(true)
                        setNovoDropdownAberto(false)
                      }}
                    >
                      <ArrowsLeftRight size={14} weight="duotone" style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      Cockpit API
                    </button>
                  </div>
                )}
              </div>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<PlusCircle size={14} weight="duotone" />}
                onClick={() => navigate('/configuracoes?tab=colunas')}
                tooltipTitulo="Nova Coluna"
                tooltipDescricao="Gerenciar colunas personalizadas em Configurações"
              >
                Nova Coluna
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<CheckSquare size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length < 2}
                onClick={() => { setModalConsolidarAberto(true) }}
              >
                Consolidar{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<ArrowsLeftRight size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { setModalTransferirAberto(true) }}
              >
                Transferir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<PencilLine size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { setModalEdicaoMassaAberto(true) }}
              >
                Editar em Massa{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<FilePdf size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => setModalGerarPdfAberto(true)}
                tooltipTitulo="Gerar Documento"
                tooltipDescricao="Gera PDF a partir de um template ou documento padrão"
              >
                Gerar Documento{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<CopySimple size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => setModalDuplicarAberto(true)}
              >
                Duplicar{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="perigo"
                tamanho="pequeno"
                icone={<Trash size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0 || excluindoLote}
                carregando={excluindoLote}
                onClick={async () => {
                  const ids = pedidosSelecionados.map(p => p.id)
                  setExcluindoLote(true)
                  try {
                    const preview = await pedidoExcluirApi.preview(ids)
                    const totalPermitidos = preview.permitidos.length
                    const totalBloqueados = preview.bloqueados.length
                    const resumo: string[] = []
                    if (totalPermitidos > 0) {
                      resumo.push(`✓ ${totalPermitidos} pedido${totalPermitidos !== 1 ? 's' : ''} serão excluídos permanentemente.`)
                    }
                    if (totalBloqueados > 0) {
                      resumo.push(`✗ ${totalBloqueados} pedido${totalBloqueados !== 1 ? 's' : ''} bloqueado${totalBloqueados !== 1 ? 's' : ''} (status não permitido):`)
                      preview.bloqueados.forEach(b => resumo.push(`  - ${b.numero_pedido}: ${b.motivo}`))
                    }
                    if (totalPermitidos === 0) {
                      setErroLote('Nenhum pedido pode ser excluído com os status atuais.')
                      return
                    }
                    const mensagem = `${resumo.join('\n')}\n\nEsta ação não pode ser desfeita. Deseja prosseguir?`
                    if (window.confirm(mensagem)) {
                      await pedidoExcluirApi.confirmar(preview.permitidos.map(p => p.id))
                      setPedidosSelecionados([])
                      await carregarInicial()
                    }
                  } catch (err) {
                    setErroLote(err instanceof Error ? err.message : 'Erro ao excluir')
                  } finally {
                    setExcluindoLote(false)
                  }
                }}
              >
                Excluir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
            </>
          }

          onBuscar={handleBuscar}
          placeholderBusca="Buscar pedido, exportador, referência..."
          onOrdenar={handleOrdenar}
          sortCampo={sortCampo}
          sortDir={sortDir}

          camposEditaveis={CAMPOS_EDITAVEIS_PAI}
          onEditar={handleEditar}

          camposEditaveisFilhos={CAMPOS_EDITAVEIS_PAI}
          onEditarFilho={handleEditarFilho}

          onSalvoComSucesso={() => addNotification({ type: 'success', message: 'Campo atualizado com sucesso.' })}
          onErroAoSalvar={(msg) => addNotification({ type: 'error', message: mensagemErro(msg) })}

          preferencias={preferencias}
          onSalvarPreferencias={handleSalvarPreferencias}

          carregando={carregando}
          emptyIcon={<Package size={40} weight="duotone" style={{ color: 'var(--text-muted)' }} />}
          emptyTitle="Nenhum pedido encontrado"
          emptyDescription="Crie seu primeiro pedido ou ajuste os filtros ativos."
          emptyAction={
            <BotaoGlobal
              variante="primario"
              tamanho="pequeno"
              icone={<Plus size={14} weight="bold" />}
              onClick={() => { setPedidoEditandoId(undefined); setDrawerAberto(true) }}
            >
              Novo Pedido
            </BotaoGlobal>
          }

          rowHeight={44}
          childRowHeight={44}
          overscan={6}
          ariaLabel="Lista de pedidos"
        />
      </div>

      {/* ── Drawer Criar/Editar Pedido ── */}
      <DrawerPedido
        aberto={drawerAberto}
        pedidoId={pedidoEditandoId}
        onFechar={() => setDrawerAberto(false)}
        onSalvo={() => {
          setDrawerAberto(false)
          carregarInicial()
        }}
      />

      {/* ── Smart Import Modal ── */}
      <SmartImportModal
        aberto={smartImportAberto}
        onFechar={() => setSmartImportAberto(false)}
        onConcluido={(_ids) => {
          setSmartImportAberto(false)
          carregarInicial()
        }}
      />

      {/* ── Modal Transferir Quantidade ── */}
      {modalTransferir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '400px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Transferir Quantidade — {modalTransferir.item.part_number}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Saldo disponível: <strong>{fmtQuantidade(modalTransferir.item.quantidade_atual, getCasas('quantidade_item', 0))} {modalTransferir.item.unidade_comercializada_item}</strong>
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Quantidade a Transferir
              </label>
              <input
                type="number"
                style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'var(--bg-base)', border: '1px solid var(--border-subtle)', borderRadius: '0.375rem', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                value={qtdTransferir}
                onChange={e => setQtdTransferir(e.target.value)}
                max={modalTransferir.item.quantidade_atual}
                min={0.01}
                step={0.01}
                placeholder="0.00"
                autoFocus
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <BotaoGlobal variante="secundario" onClick={() => { setModalTransferir(null); setQtdTransferir('') }}>Cancelar</BotaoGlobal>
              <BotaoGlobal
                variante="primario"
                icone={<ArrowRight size={14} />}
                onClick={async () => {
                  const qtd = parseFloat(qtdTransferir)
                  if (!qtd || qtd <= 0 || qtd > modalTransferir.item.quantidade_atual) return
                  console.info('[Pedido] Transferir:', { item: modalTransferir.item.id, quantidade: qtd })
                  window.alert(`✓ Transferência de ${fmtQuantidade(qtd, getCasas('quantidade_item', 0))} ${modalTransferir.item.unidade_comercializada_item ?? ''} registrada.`)
                  setModalTransferir(null)
                  setQtdTransferir('')
                }}
              >
                Transferir
              </BotaoGlobal>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal Transferir Pedidos ── */}
      {modalTransferirAberto && pedidosSelecionados.length > 0 && (
        <ModalTransferir
          pedidos={pedidosSelecionados}
          onFechar={() => setModalTransferirAberto(false)}
          onConcluido={() => {
            setModalTransferirAberto(false)
            setPedidosSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Edição em Massa ── */}
      {modalEdicaoMassaAberto && pedidosSelecionados.length > 0 && (
        <ModalEdicaoEmMassa
          pedidos={pedidosSelecionados}
          onFechar={() => setModalEdicaoMassaAberto(false)}
          onConcluido={() => {
            setModalEdicaoMassaAberto(false)
            setPedidosSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Consolidar Pedidos ── */}
      {modalConsolidarAberto && (
        <ModalConsolidar
          pedidosSelecionados={pedidosSelecionados}
          onFechar={() => setModalConsolidarAberto(false)}
          onConcluido={async () => {
            setModalConsolidarAberto(false)
            setPedidosSelecionados([])
            await carregarInicial()
          }}
        />
      )}

      {/* ── Modal Duplicar Pedidos ── */}
      {modalDuplicarAberto && pedidosSelecionados.length > 0 && (
        <ModalDuplicar
          pedidos={pedidosSelecionados}
          onFechar={() => setModalDuplicarAberto(false)}
          onConcluido={() => {
            setModalDuplicarAberto(false)
            setPedidosSelecionados([])
            carregarInicial()
          }}
        />
      )}

      {/* ── Modal Gerar Documento PDF ── */}
      {modalGerarPdfAberto && pedidosSelecionados.length > 0 && (
        <ModalGerarPdf
          pedidos={pedidosSelecionados.map(p => ({ id: p.id, numero: p.numero_pedido }))}
          onFechar={() => setModalGerarPdfAberto(false)}
          onConcluido={() => {
            setModalGerarPdfAberto(false)
          }}
        />
      )}

      {/* ── Modal Cockpit API ── */}
      {modalCockpitAberto && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setModalCockpitAberto(false)}
        >
          <div
            style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '540px', maxWidth: '90vw', border: '1px solid var(--border-subtle)', boxShadow: '0 24px 48px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Criar Pedido via API
              </h3>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem', borderRadius: '0.25rem', display: 'flex', alignItems: 'center' }}
                onClick={() => setModalCockpitAberto(false)}
                aria-label="Fechar"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Endpoint */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Endpoint
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--ws-accent)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)' }}>
                POST /api/v1/cockpit/pedidos
              </code>
            </div>

            {/* Auth */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Autenticação
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', fontSize: '0.8125rem', color: 'var(--text-primary)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)', whiteSpace: 'pre' }}>
                {`Authorization: Bearer gv_live_sk_...`}
              </code>
            </div>

            {/* Payload */}
            <div style={{ marginBottom: '1.25rem' }}>
              <p style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.25rem', letterSpacing: '0.05em' }}>
                Exemplo de Payload
              </p>
              <code style={{ display: 'block', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.875rem', fontSize: '0.8rem', color: 'var(--text-primary)', fontFamily: 'monospace', border: '1px solid var(--border-subtle)', whiteSpace: 'pre', lineHeight: 1.6, overflowX: 'auto' }}>
                {`{
  "tipo_operacao": "importacao",
  "numero_pedido": "PO-2026-001",
  "exportador_id": "exp_abc123",
  "incoterm": "FOB",
  "moeda_pedido": "USD",
  "data_emissao_pedido": "2026-04-04",
  "itens": [
    {
      "part_number": "ABC-001",
      "descricao": "Produto exemplo",
      "quantidade": 100,
      "valor_unitario": 25.50
    }
  ]
}`}
              </code>
            </div>

            {/* Nota */}
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', background: 'var(--bg-base)', borderRadius: '0.375rem', padding: '0.625rem 0.875rem', border: '1px solid var(--border-subtle)', margin: 0 }}>
              Gerencie seus tokens em <strong style={{ color: 'var(--ws-accent)' }}>Configurações → API</strong>
            </p>
          </div>
        </div>
      )}


    </div>
  )
}
