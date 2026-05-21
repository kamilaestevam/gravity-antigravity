import React from 'react'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao, ModalFrete, TipoOperacao, ModalidadeCarga, Visibilidade } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS } from '../shared/types'

// ─── Badge de status ───
const BADGE_COLORS: Record<string, { bg: string; color: string }> = {
  info:    { bg: 'rgba(59,130,246,0.15)',  color: 'var(--accent, #6366f1)' },
  warning: { bg: 'rgba(245,158,11,0.15)',  color: 'var(--warning, #f59e0b)' },
  success: { bg: 'rgba(34,197,94,0.15)',   color: 'var(--success, #22c55e)' },
  danger:  { bg: 'rgba(239,68,68,0.15)',   color: 'var(--danger, #ef4444)' },
  default: { bg: 'rgba(100,116,139,0.15)', color: 'var(--text-muted, #64748b)' },
}

export function RenderBadgeStatus(valor: unknown): React.ReactNode {
  const status = valor as StatusCotacao
  const variante = STATUS_BADGE[status] || 'default'
  const cores = BADGE_COLORS[variante]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: cores.bg,
      color: cores.color,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}

// ─── Badge de Operação ───
export function RenderBadgeOperacao(valor: unknown): React.ReactNode {
  const op = valor as TipoOperacao
  const isImport = op === 'IMPORTACAO'
  const bg = isImport ? 'rgba(59,130,246,0.15)' : 'rgba(168,85,247,0.15)'
  const color = isImport ? 'var(--accent, #6366f1)' : '#a855f7'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: bg,
      color: color,
    }}>
      {OPERACAO_LABELS[op] || op}
    </span>
  )
}

// ─── Badge de Visibilidade ───
export function RenderBadgeVisibilidade(valor: unknown): React.ReactNode {
  const vis = valor as Visibilidade
  const isAberta = vis === 'ABERTA'
  const bg = isAberta ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)'
  const color = isAberta ? 'var(--success, #22c55e)' : 'var(--accent, #6366f1)'
  const label = isAberta ? 'Aberta' : 'Direcionada'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: bg,
      color: color,
    }}>
      {label}
    </span>
  )
}

// ─── Badge de Anônima ───
export function RenderBadgeAnonima(valor: unknown): React.ReactNode {
  const isAnonima = !!valor
  const bg = isAnonima ? 'rgba(148,163,184,0.15)' : 'rgba(59,130,246,0.15)'
  const color = isAnonima ? 'var(--text-muted, #64748b)' : 'var(--accent, #6366f1)'
  const label = isAnonima ? 'Sim' : 'Não'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: bg,
      color: color,
    }}>
      {label}
    </span>
  )
}

// ─── Modal icon ───
export function RenderModalIcon(valor: unknown): React.ReactNode {
  const modal = valor as string
  const size = 14
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} />
  return <Truck weight="duotone" size={size} />
}

// ─── Formatação ───
export const fmtData = (iso: string | null | undefined): string => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const fmtQuantidade = (v: number | null | undefined, casas = 2): string => {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

export const getCasas = (v: number): number => {
  if (Math.floor(v) === v) return 0
  return 2
}

// ─── Construtor de colunas ───
export function buildColunasCotacoes(t: unknown): GTColuna<Cotacao>[] {
  return [
    {
      key: 'numero_cotacao_bid_frete_internacional',
      label: 'Processo (DATI)',
      tipo: 'texto',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)', fontWeight: 600 }}>
          {val as string}
        </span>
      ),
    },
    {
      key: 'referencia_interna_cotacao_bid_frete_internacional',
      label: 'Referência',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'tipo_operacao_cotacao_bid_frete_internacional',
      label: 'Operação',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeOperacao(val),
    },
    {
      key: 'status',
      label: 'Status',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeStatus(val),
    },
    {
      key: 'created_at',
      label: 'Data da cotação',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'updated_at',
      label: 'Última Atualização',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'modal_cotacao_bid_frete_internacional',
      label: 'Modal',
      tipo: 'texto',
      render: (val: unknown) => {
        const modal = val as ModalFrete
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {RenderModalIcon(modal)}
            {MODAL_LABELS[modal] ?? modal}
          </span>
        )
      },
    },
    {
      key: 'modalidade_cotacao_bid_frete_internacional',
      label: 'Modalidade',
      tipo: 'texto',
      render: (val: unknown) => {
        const mod = val as ModalidadeCarga
        return MODALIDADE_LABELS[mod] ?? (val as string | null ?? '—')
      },
    },
    {
      key: 'origem_codigo_cotacao_bid_frete_internacional',
      label: 'Código Origem',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'origem_nome_cotacao_bid_frete_internacional',
      label: 'Origem',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'origem_pais_cotacao_bid_frete_internacional',
      label: 'País Origem',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_codigo_cotacao_bid_frete_internacional',
      label: 'Código Destino',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_nome_cotacao_bid_frete_internacional',
      label: 'Destino',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_pais_cotacao_bid_frete_internacional',
      label: 'País Destino',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'descricao_mercadoria_cotacao_bid_frete_internacional',
      label: 'Descrição Mercadoria',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'ncm_cotacao_bid_frete_internacional',
      label: 'NCM',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'quantidade_cotacao_bid_frete_internacional',
      label: 'Quantidade',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 0) : '—',
    },
    {
      key: 'tipo_container_cotacao_bid_frete_internacional',
      label: 'Tipo Container',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'peso_kg_cotacao_bid_frete_internacional',
      label: 'Peso (Kg)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 0) : '—',
    },
    {
      key: 'cubagem_m3_cotacao_bid_frete_internacional',
      label: 'Volume (m³)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 2) : '—',
    },
    {
      key: 'incoterm_cotacao_bid_frete_internacional',
      label: 'Incoterm',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'cep_destino',
      label: 'CEP Destino',
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'visibilidade_cotacao_bid_frete_internacional',
      label: 'Visibilidade',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeVisibilidade(val),
    },
    {
      key: 'anonima',
      label: 'Anônima',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeAnonima(val),
    },
    {
      key: 'valor_alvo',
      label: 'Valor Alvo',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) => val != null ? `${item.moeda_alvo} ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'prazo_resposta',
      label: 'Prazo Resposta',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'valor_aprovado_ganho_bid_frete_internacional',
      label: 'Valor Aprovado',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) => val != null ? `${item.moeda_aprovada ?? 'USD'} ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'ganho_valor_cotacao_bid_frete_internacional',
      label: 'Ganho Estimado',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `USD ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'ganho_percentual_ganho_bid_frete_internacional',
      label: 'Ganho (%)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `${fmtQuantidade(val as number, 2)}%` : '—',
    },
  ]
}

