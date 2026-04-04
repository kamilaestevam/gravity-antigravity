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
  Eye,
  PencilSimple,
  Trash,
  Copy,
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
  Funnel,
  ArrowUp,
  ArrowDown,
} from '@phosphor-icons/react'
import { CardBasicoGlobal } from '@nucleo/card-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { TabelaVirtualGlobal } from '@nucleo/tabela-virtual-global'
import type {
  GTColuna,
  GTAcao,
  GTAcaoLote,
  GTAcaoExport,
  GTAbaTipo,
  GTPreferencias,
} from '@nucleo/tabela-virtual-global'
import { useCardPreferences } from '../shared/useCardPreferences'
import { exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON } from '../shared/exportUtils'
import type { ColunasExport } from '../shared/exportUtils'
import {
  pedidoVirtualApi,
  pedidoConfigApi,
  pedidoLoteApi,
  pedidoItemApi,
} from '../shared/api'
import type {
  Pedido,
  PedidoItem,
  PedidoStatusConfig,
  PedidoPreferenciasColunas,
} from '../shared/types'
import {
  STATUS_PEDIDO_LABELS,
  fmtQuantidade,
  fmtMoeda,
  fmtData,
} from '../shared/types'
import './ListaPedidos.css'

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
  anchorRef: React.RefObject<HTMLButtonElement>
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

  // Calcular posição abaixo do âncora
  const [pos, setPos] = React.useState({ top: 0, left: 0 })
  useEffect(() => {
    if (anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + 6, left: Math.max(8, rect.left - 20) })
    }
  }, [anchorRef])

  // Fechar ao clicar fora
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

  // Estado local do popover
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
    if (tipo === 'texto') {
      if (textoLocal.trim()) {
        onAplicar(campo, { tipo: 'texto', valor: textoLocal.trim() })
      } else {
        onLimpar(campo)
      }
    } else if (tipo === 'enum') {
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
      className="lp-filtro-popover"
      style={{ top: pos.top, left: pos.left }}
      role="dialog"
      aria-label={`Filtrar coluna ${label}`}
    >
      {/* Seção Ordenar */}
      <div className="lp-filtro-section">
        <span className="lp-filtro-section-title">Ordenar</span>
        <div className="lp-filtro-sort-btns">
          <button
            className="lp-filtro-sort-btn"
            onClick={() => { onOrdenar(campo, 'asc'); onFechar() }}
            title="Ordem crescente"
          >
            <ArrowUp size={14} weight="bold" />
            Crescente
          </button>
          <button
            className="lp-filtro-sort-btn"
            onClick={() => { onOrdenar(campo, 'desc'); onFechar() }}
            title="Ordem decrescente"
          >
            <ArrowDown size={14} weight="bold" />
            Decrescente
          </button>
        </div>
      </div>

      <div className="lp-filtro-divider" />

      {/* Seção Filtrar */}
      {tipo === 'texto' && (
        <div className="lp-filtro-section">
          <span className="lp-filtro-section-title">Filtrar por {label}</span>
          <input
            className="lp-filtro-input"
            type="text"
            placeholder={`Buscar em ${label}...`}
            value={textoLocal}
            onChange={e => setTextoLocal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') aplicar() }}
            autoFocus
          />
        </div>
      )}

      {tipo === 'enum' && (
        <div className="lp-filtro-section">
          <span className="lp-filtro-section-title">Filtrar por {label}</span>
          {valoresUnicos.length > 6 && (
            <input
              className="lp-filtro-input"
              type="text"
              placeholder="Buscar..."
              value={enumBusca}
              onChange={e => setEnumBusca(e.target.value)}
            />
          )}
          <div className="lp-filtro-enum-list">
            {valoresFiltrados.map(v => (
              <label key={v} className="lp-filtro-enum-item">
                <input
                  type="checkbox"
                  checked={enumLocal.has(v)}
                  onChange={() => {
                    const novo = new Set(enumLocal)
                    if (novo.has(v)) novo.delete(v)
                    else novo.add(v)
                    setEnumLocal(novo)
                  }}
                />
                <span>{v || '(vazio)'}</span>
              </label>
            ))}
            {valoresFiltrados.length === 0 && (
              <span className="lp-filtro-empty">Nenhum valor encontrado</span>
            )}
          </div>
        </div>
      )}

      {tipo === 'numero' && (
        <div className="lp-filtro-section">
          <span className="lp-filtro-section-title">Intervalo</span>
          <div className="lp-filtro-range">
            <input
              className="lp-filtro-input lp-filtro-input--half"
              type="number"
              placeholder="Mín"
              value={minLocal}
              onChange={e => setMinLocal(e.target.value)}
            />
            <span className="lp-filtro-range-sep">—</span>
            <input
              className="lp-filtro-input lp-filtro-input--half"
              type="number"
              placeholder="Máx"
              value={maxLocal}
              onChange={e => setMaxLocal(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Ações */}
      <div className="lp-filtro-acoes">
        <button className="lp-filtro-btn-limpar" onClick={limpar}>
          Limpar filtro
        </button>
        <button className="lp-filtro-btn-aplicar" onClick={aplicar}>
          Aplicar
        </button>
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
  { valor: 'transferencia',label: 'Em Transferência'},
  { valor: 'consolidado',  label: 'Consolidado'     },
  { valor: 'cancelado',    label: 'Cancelado'       },
]

// ── Colunas pai (Pedido) ──────────────────────────────────────────────────────

const COLUNAS_PAI: GTColuna<Pedido>[] = [
  {
    key: 'numero_pedido',
    label: 'Pedido',
    tipo: 'texto',
    filtravel: true,
    sortavel: true,
    naoOcultavel: true,
    frozen: true,
    tooltipTitulo: 'Número do Pedido',
    tooltipDescricao: 'Identificador único do documento comercial (PO/SO)',
    largura: 140,
  },
  {
    key: 'tipo_operacao',
    label: 'Tipo',
    tipo: 'badge',
    filtravel: true,
    tooltipTitulo: 'Tipo de Operação',
    tooltipDescricao: 'Importação (Purchase Order) ou Exportação (Sales Order)',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={row.tipo_operacao === 'importacao' ? 'Importação' : 'Exportação'}
        genero="feminino"
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
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_total_pedido != null
          ? fmtMoeda(row.valor_total_pedido, row.moeda_pedido)
          : '—'}
      </span>
    ),
  },
  {
    key: 'quantidade_total_pedido',
    label: 'Qtd Total',
    tipo: 'numero',
    filtravel: true,
    sortavel: true,
    align: 'right',
    tooltipTitulo: 'Quantidade Total',
    tooltipDescricao: 'Quantidade total contratada no pedido',
    largura: 110,
    render: (_val: unknown, row: Pedido) => (
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.quantidade_total_pedido != null
          ? `${fmtQuantidade(row.quantidade_total_pedido, row.casas_decimais_quantidade_total_pedido)} ${row.unidade_comercializada_pedido ?? ''}`
          : '—'}
      </span>
    ),
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
    render: (_val: unknown, row: Pedido) => (
      <StatusBadgeGlobal
        valor={STATUS_PEDIDO_LABELS[row.status] ?? row.status}
        genero="masculino"
      />
    ),
  },
]

// ── Colunas filha (PedidoItem) ────────────────────────────────────────────────

const COLUNAS_FILHO: GTColuna<PedidoItem>[] = [
  {
    key: 'part_number',
    label: 'Part Number',
    tipo: 'texto',
    naoOcultavel: true,
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
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_inicial, row.casas_decimais_quantidade)}
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
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.8125rem',
        fontWeight: row.quantidade_atual === 0 ? 400 : 600,
        color: row.quantidade_atual === 0 ? 'var(--text-muted)' : 'var(--color-success, #34d399)',
      }}>
        {fmtQuantidade(row.quantidade_atual, row.casas_decimais_quantidade)}
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
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_pronta, row.casas_decimais_quantidade)}
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
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {fmtQuantidade(row.quantidade_transferida, row.casas_decimais_quantidade)}
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
        fontFamily: 'var(--font-mono, monospace)',
        fontSize: '0.8125rem',
        color: row.quantidade_cancelada > 0 ? 'var(--color-error, #ef4444)' : 'var(--text-muted)',
      }}>
        {fmtQuantidade(row.quantidade_cancelada, row.casas_decimais_quantidade)}
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
      <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem' }}>
        {row.valor_unitario != null ? fmtMoeda(row.valor_unitario, row.moeda_item) : '—'}
      </span>
    ),
  },
]

// ── Colunas para exportação ───────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Pedido',          key: 'numero_pedido',               largura: 18 },
  { header: 'Tipo',            key: 'tipo_operacao',               largura: 14 },
  { header: 'Exportador',      key: 'exportador_nome',             largura: 25 },
  { header: 'Fabricante',      key: 'fabricante_nome',             largura: 22 },
  { header: 'Ref. Importador', key: 'referencia_importador',       largura: 20 },
  { header: 'Ref. Exportador', key: 'referencia_exportador',       largura: 20 },
  { header: 'Proforma',        key: 'numero_proforma',             largura: 16 },
  { header: 'Invoice',         key: 'numero_invoice',              largura: 16 },
  { header: 'Incoterm',        key: 'incoterm',                    largura: 12 },
  { header: 'Valor Total',     key: 'valor_total_pedido',          largura: 18 },
  { header: 'Moeda',           key: 'moeda_pedido',                largura: 10 },
  { header: 'Qtd Total',       key: 'quantidade_total_pedido',     largura: 14 },
  { header: 'Data P.O',        key: 'data_emissao_pedido',         largura: 14 },
  { header: 'Status',          key: 'status',                      largura: 16 },
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

  // ── Estado de filtros de coluna ───────────────────────────────────────────────
  const [filtrosAtivos, setFiltrosAtivos]   = useState<FiltrosAtivosMap>({})
  const [popoverAberto, setPopoverAberto]   = useState<string | null>(null)
  const popoverAnchorRefs                   = useRef<Record<string, React.RefObject<HTMLButtonElement>>>({})

  function getAnchorRef(campo: string): React.RefObject<HTMLButtonElement> {
    if (!popoverAnchorRefs.current[campo]) {
      popoverAnchorRefs.current[campo] = React.createRef<HTMLButtonElement>()
    }
    return popoverAnchorRefs.current[campo]
  }

  // ── Pedidos filtrados (client-side) ───────────────────────────────────────────
  const pedidosFiltrados = useMemo<Pedido[]>(() => {
    if (Object.keys(filtrosAtivos).length === 0) return pedidos
    return pedidos.filter(p => {
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
  }, [pedidos, filtrosAtivos])

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

  // ── Valores únicos por campo (para filtro enum) ───────────────────────────────
  const valoresUnicosPorCampo = useMemo<Record<string, string[]>>(() => {
    const result: Record<string, string[]> = {}
    for (const col of COLUNAS_PAI) {
      if (!col.filtravel) continue
      const tipo = detectarTipoColuna(col)
      if (tipo === 'enum') {
        const vals = new Set<string>()
        for (const p of pedidos) {
          vals.add(String((p as Record<string, unknown>)[col.key] ?? ''))
        }
        result[col.key] = Array.from(vals).sort()
      }
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

  // ── Refs para evitar duplo carregamento ──────────────────────────────────────
  const carregandoRef = useRef(false)

  // ── Ações de linha (pai) ──────────────────────────────────────────────────────
  const ACOES_PAI: GTAcao<Pedido>[] = [
    {
      id: 'ver',
      tooltip: 'Ver detalhes do pedido',
      icone: <Eye size={15} weight="duotone" />,
      onClick: (row: Pedido) => { console.info('[Pedido] Ver:', row.id) },
    },
    {
      id: 'editar',
      tooltip: 'Editar dados do pedido',
      icone: <PencilSimple size={15} weight="duotone" />,
      onClick: (row: Pedido) => { navigate(`${row.id}/editar`) },
    },
    {
      id: 'duplicar',
      tooltip: 'Duplicar pedido',
      icone: <Copy size={15} weight="duotone" />,
      onClick: (row: Pedido) => { console.info('[Pedido] Duplicar:', row.id) },
    },
    {
      id: 'deletar',
      tooltip: 'Deletar pedido (somente Draft)',
      icone: <Trash size={15} weight="duotone" />,
      variant: 'danger',
      visivel: (row: Pedido) => row.status === 'draft',
      onClick: (row: Pedido) => { console.info('[Pedido] Deletar:', row.id) },
    },
  ]

  // ── Ações de linha (filho / item) ─────────────────────────────────────────────
  const ACOES_FILHO: GTAcao<PedidoItem>[] = [
    {
      id: 'transferir',
      tooltip: 'Transferir quantidade para processo logístico',
      icone: <ArrowRight size={14} weight="duotone" />,
      visivel: (row: PedidoItem) => row.quantidade_atual > 0,
      onClick: (row: PedidoItem) => {
        setModalTransferir({ item: row, pedidoId: row.pedido_id })
        setQtdTransferir('')
      },
    },
    {
      id: 'cancelar-item',
      tooltip: 'Cancelar quantidade do item',
      icone: <X size={14} weight="duotone" />,
      variant: 'danger',
      visivel: (row: PedidoItem) => row.quantidade_atual > 0,
      onClick: (row: PedidoItem) => { console.info('[Pedido] Cancelar item:', row.id) },
    },
  ]

  // ── Carregar status e preferências ──────────────────────────────────────────
  useEffect(() => {
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
          setAbas(abasApi)
        }
      })
      .catch(() => { /* fallback para ABAS_PADRAO */ })

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

    const atualizado = await pedidoItemApi.atualizar(pedido.id, id, { [campo]: valor } as Partial<PedidoItem>)
      .catch(() => {
        if (import.meta.env.DEV) {
          const item = pedido.itens?.find(i => i.id === id)
          if (item) return { ...item, [campo]: valor } as PedidoItem
        }
        throw new Error(`Erro ao editar campo ${campo}`)
      })

    // Atualiza o item dentro do pedido no estado
    setPedidos(prev => prev.map(p =>
      p.id === pedido.id
        ? { ...p, itens: p.itens?.map(i => i.id === id ? atualizado : i) }
        : p,
    ))
    return atualizado
  }, [pedidos])

  // ── Carregar filhos (itens do pedido) ────────────────────────────────────────
  const handleCarregarFilhos = useCallback(async (pedido: Pedido): Promise<PedidoItem[]> => {
    return pedido.itens ?? []
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

  // ── Ações de exportação (client-side) ────────────────────────────────────────
  const acoesExportacao = useMemo((): GTAcaoExport[] => [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarExcel(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos', titulo: 'Pedidos' },
      ),
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarCSV(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarTXT(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarXML(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => exportarJSON(
        pedidos as unknown as Record<string, unknown>[],
        COLUNAS_EXPORT,
        { nomeArquivo: 'pedidos' },
      ),
    },
  ], [pedidos])

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
          colunas={COLUNAS_PAI}
          itemId={(p: Pedido) => p.id}

          colunasFilhas={COLUNAS_FILHO}
          onCarregarFilhos={handleCarregarFilhos}
          filhoId={(i: PedidoItem) => i.id}
          acoesFilhas={ACOES_FILHO}

          temMais={temMais}
          carregandoMais={carregandoMais}
          onCarregarMais={handleCarregarMais}

          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={handleMudarAba}

          acoes={ACOES_PAI}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          onSelecaoMudar={setPedidosSelecionados}

          acoesBarra={
            <>
              {/* ── Botões de filtro por coluna ── */}
              <div className="lp-filtro-barra" role="toolbar" aria-label="Filtros de coluna">
                {COLUNAS_PAI.filter(col => col.filtravel).map(col => {
                  const ativo = !!filtrosAtivos[col.key]
                  const anchorRef = getAnchorRef(col.key)
                  return (
                    <button
                      key={col.key}
                      ref={anchorRef}
                      className={`lp-filtro-trigger${ativo ? ' lp-filtro-trigger--ativo' : ''}`}
                      onClick={() => setPopoverAberto(prev => prev === col.key ? null : col.key)}
                      aria-pressed={ativo}
                      title={`Filtrar por ${col.label}`}
                    >
                      <Funnel size={11} weight={ativo ? 'fill' : 'regular'} />
                      <span>{col.label}</span>
                    </button>
                  )
                })}
              </div>

              <BotaoGlobal
                variante="primario"
                tamanho="pequeno"
                icone={<Plus size={14} weight="bold" />}
                onClick={() => { navigate('novo') }}
              >
                Novo
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<UploadSimple size={14} weight="duotone" />}
                onClick={() => { console.info('[Pedido] Importar') }}
              >
                Importar
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<CheckSquare size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={async () => {
                  const ids = pedidosSelecionados.map(p => p.id)
                  try {
                    const preview = await pedidoLoteApi.mudarStatusPreview(ids, 'consolidado')
                    const resumo = preview.afetados.map(a => `✓ ${a.numero_pedido} → ${a.status}`).join('\n')
                    if (window.confirm(`${resumo}\n\nConsolidar pedidos selecionados?`)) {
                      await pedidoLoteApi.mudarStatusConfirmar(ids, 'consolidado')
                      await carregarInicial()
                    }
                  } catch (err) {
                    setErroLote(err instanceof Error ? err.message : 'Erro ao consolidar')
                  }
                }}
              >
                Consolidar{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<ArrowsLeftRight size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { console.info('[Pedido] Transferir lote:', pedidosSelecionados.map(p => p.id)) }}
              >
                Transferir{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="secundario"
                tamanho="pequeno"
                icone={<PencilLine size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={() => { console.info('[Pedido] Editar em massa:', pedidosSelecionados.map(p => p.id)) }}
              >
                Editar em Massa{pedidosSelecionados.length > 0 ? ` (${pedidosSelecionados.length})` : ''}
              </BotaoGlobal>
              <BotaoGlobal
                variante="perigo"
                tamanho="pequeno"
                icone={<Trash size={14} weight="duotone" />}
                disabled={pedidosSelecionados.length === 0}
                onClick={async () => {
                  const ids = pedidosSelecionados.map(p => p.id)
                  try {
                    const preview = await pedidoLoteApi.cancelarPreview(ids)
                    if (window.confirm(`${preview.resumo.join('\n')}\n\nExcluir/cancelar pedidos selecionados?`)) {
                      await pedidoLoteApi.cancelarConfirmar(ids)
                      await carregarInicial()
                    }
                  } catch (err) {
                    setErroLote(err instanceof Error ? err.message : 'Erro ao excluir')
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

          camposEditaveis={[
            'numero_pedido',
            'exportador_nome',
            'fabricante_nome',
            'referencia_importador',
            'referencia_exportador',
            'numero_proforma',
            'numero_invoice',
            'incoterm',
          ]}
          onEditar={handleEditar}

          camposEditaveisFilhos={[
            'part_number',
            'ncm',
            'descricao',
            'unidade_comercializada_item',
            'valor_unitario',
          ]}
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
              onClick={() => { navigate('novo') }}
            >
              Novo Pedido
            </BotaoGlobal>
          }

          rowHeight={44}
          childRowHeight={36}
          overscan={6}
          ariaLabel="Lista de pedidos"
        />
      </div>

      {/* ── Modal Transferir Quantidade ── */}
      {modalTransferir && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-surface)', borderRadius: '0.75rem', padding: '1.5rem', width: '400px', border: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Transferir Quantidade — {modalTransferir.item.part_number}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Saldo disponível: <strong>{fmtQuantidade(modalTransferir.item.quantidade_atual, modalTransferir.item.casas_decimais_quantidade)} {modalTransferir.item.unidade_comercializada_item}</strong>
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
                  window.alert(`✓ Transferência de ${fmtQuantidade(qtd, modalTransferir.item.casas_decimais_quantidade)} ${modalTransferir.item.unidade_comercializada_item ?? ''} registrada.`)
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

    </div>
  )
}
