import React from 'react'
import i18next from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao, ModalFrete, TipoOperacao, ModalidadeCarga, Visibilidade } from '../../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS } from '../../shared/types'

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
  const label = isAberta ? i18next.t('bidfrete.colunas.aberta') : i18next.t('bidfrete.colunas.direcionada')
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
  const label = isAnonima ? i18next.t('bidfrete.colunas.sim') : i18next.t('bidfrete.colunas.nao')
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
export function buildColunasCotacoes(): GTColuna<Cotacao>[] {
  return [
    {
      key: 'numero',
      label: i18next.t('bidfrete.colunas.processo'),
      tipo: 'texto',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)', fontWeight: 600 }}>
          {val as string}
        </span>
      ),
    },
    {
      key: 'referencia_interna',
      label: i18next.t('bidfrete.colunas.referencia'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'tipo_operacao',
      label: i18next.t('bidfrete.colunas.operacao'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeOperacao(val),
    },
    {
      key: 'status',
      label: i18next.t('bidfrete.colunas.status'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeStatus(val),
    },
    {
      key: 'created_at',
      label: i18next.t('bidfrete.colunas.dataCotacao'),
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'updated_at',
      label: i18next.t('bidfrete.colunas.ultimaAtualizacao'),
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'modal',
      label: i18next.t('bidfrete.colunas.modal'),
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
      key: 'modalidade',
      label: i18next.t('bidfrete.colunas.modalidade'),
      tipo: 'texto',
      render: (val: unknown) => {
        const mod = val as ModalidadeCarga
        return MODALIDADE_LABELS[mod] ?? (val as string | null ?? '—')
      },
    },
    {
      key: 'origem_codigo',
      label: i18next.t('bidfrete.colunas.codigoOrigem'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'origem_nome',
      label: i18next.t('bidfrete.colunas.origem'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'origem_pais',
      label: i18next.t('bidfrete.colunas.paisOrigem'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_codigo',
      label: i18next.t('bidfrete.colunas.codigoDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_nome',
      label: i18next.t('bidfrete.colunas.destino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'destino_pais',
      label: i18next.t('bidfrete.colunas.paisDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'descricao_mercadoria',
      label: i18next.t('bidfrete.colunas.descricaoMercadoria'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'ncm',
      label: i18next.t('bidfrete.colunas.ncm'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'quantidade',
      label: i18next.t('bidfrete.colunas.quantidade'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 0) : '—',
    },
    {
      key: 'tipo_container',
      label: i18next.t('bidfrete.colunas.tipoContainer'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'peso_kg',
      label: i18next.t('bidfrete.colunas.pesoKg'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 0) : '—',
    },
    {
      key: 'cubagem_m3',
      label: i18next.t('bidfrete.colunas.volumeM3'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 2) : '—',
    },
    {
      key: 'incoterm',
      label: i18next.t('bidfrete.colunas.incoterm'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'cep_destino',
      label: i18next.t('bidfrete.colunas.cepDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'visibilidade',
      label: i18next.t('bidfrete.colunas.visibilidade'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeVisibilidade(val),
    },
    {
      key: 'anonima',
      label: i18next.t('bidfrete.colunas.anonima'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeAnonima(val),
    },
    {
      key: 'valor_alvo',
      label: i18next.t('bidfrete.colunas.valorAlvo'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) => val != null ? `${item.moeda_alvo} ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'prazo_resposta',
      label: i18next.t('bidfrete.colunas.prazoResposta'),
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'valor_aprovado',
      label: i18next.t('bidfrete.colunas.valorAprovado'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) => val != null ? `${item.moeda_aprovada ?? 'USD'} ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'saving_valor',
      label: i18next.t('bidfrete.colunas.savingEstimado'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `USD ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'saving_percentual',
      label: i18next.t('bidfrete.colunas.savingPercentual'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `${fmtQuantidade(val as number, 2)}%` : '—',
    },
  ]
}
