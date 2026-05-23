import React from 'react'
import i18next from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao, ModalFrete, TipoOperacao, ModalidadeCarga, Visibilidade, StatusCotacaoBidFreteConfig } from '../../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS, lerStatusConfigLocal, obterInfoStatus } from '../../shared/types'

// ─── Badge de status (dinâmico via config) ───

/** Gera cor de fundo com transparência a partir de cor hex */
function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return `rgba(100,116,139,${alpha})`
  return `rgba(${r},${g},${b},${alpha})`
}

export function RenderBadgeStatus(valor: unknown): React.ReactNode {
  const status = valor as string
  const statusConfig = lerStatusConfigLocal()
  const info = obterInfoStatus(status, statusConfig)

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.2rem 0.6rem',
      borderRadius: 'var(--radius-pill, 9999px)',
      fontSize: '0.75rem',
      fontWeight: 600,
      background: hexToRgba(info.cor, 0.15),
      color: info.cor,
    }}>
      {info.rotulo}
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
      key: 'numero_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.processo'),
      tipo: 'texto',
      render: (val: unknown) => (
        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.8125rem', color: 'var(--accent, #6366f1)', fontWeight: 600 }}>
          {val as string}
        </span>
      ),
    },
    {
      key: 'referencia_interna_cotacao_bid_frete',
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
      key: 'status_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.status'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeStatus(val),
    },
    {
      key: 'criado_em_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.dataCotacao'),
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'atualizado_em_cotacao_bid_frete',
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
      key: 'porto_origem_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.codigoOrigem'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'pais_origem_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.paisOrigem'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'porto_destino_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.codigoDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'pais_destino_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.paisDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'descricao_mercadoria_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.descricaoMercadoria'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'ncm_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.ncm'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'quantidade_volumes_cotacao_bid_frete',
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
      key: 'peso_kg_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.pesoKg'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 0) : '—',
    },
    {
      key: 'cubagem_m3_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.volumeM3'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? fmtQuantidade(val as number, 2) : '—',
    },
    {
      key: 'incoterm_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.incoterm'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'cep_destino_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.cepDestino'),
      tipo: 'texto',
      render: (val: unknown) => (val as string | null) ?? '—',
    },
    {
      key: 'visibilidade_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.visibilidade'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeVisibilidade(val),
    },
    {
      key: 'anonima_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.anonima'),
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeAnonima(val),
    },
    {
      key: 'valor_alvo_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.valorAlvo'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) => val != null ? `${item.moeda_alvo_cotacao_bid_frete} ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'data_limite_resposta_cotacao_bid_frete',
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
      key: 'saving_valor_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.savingEstimado'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `USD ${fmtQuantidade(val as number, 2)}` : '—',
    },
    {
      key: 'saving_percentual_cotacao_bid_frete',
      label: i18next.t('bidfrete.colunas.savingPercentual'),
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => val != null ? `${fmtQuantidade(val as number, 2)}%` : '—',
    },
  ]
}
