import React from 'react'
import type { TFunction } from 'i18next'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { Anchor, AirplaneTilt, Van } from '@phosphor-icons/react'
import type { Cotacao, ModalFrete, ModalidadeCarga } from '../../shared/types'
import { MODAL_LABELS, MODALIDADE_LABELS } from '../../shared/types'
import { formatarDataBidFrete } from '../../shared/formato-data-bid-frete'
import { garantirFiltravelColunaBidFrete } from '../../shared/filtros-coluna-lista-bid-frete-internacional'
import type { LinhaPaiLista } from '../lista-bid-frete-internacional-utils'
import type { StatusKanbanFornecedorBidFreteInternacional } from '../../shared/kanban-fornecedor-bid-frete-internacional'
import { CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR } from '../../shared/ordem-colunas-lista-fornecedor-bid-frete-internacional'

const MODAL_ICON: Record<ModalFrete, React.ReactNode> = {
  MARITIMO: <Anchor weight="duotone" size={14} />,
  AEREO: <AirplaneTilt weight="duotone" size={14} />,
  RODOVIARIO: <Van weight="duotone" size={14} />,
}

const STATUS_FUNIL_BADGE: Record<
  StatusKanbanFornecedorBidFreteInternacional,
  { bg: string; color: string; labelKey: string }
> = {
  AGUARDANDO_RESPOSTA: {
    bg: 'rgba(245,158,11,0.15)',
    color: 'var(--warning, #f59e0b)',
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.aguardando_resposta',
  },
  EM_ANALISE: {
    bg: 'rgba(59,130,246,0.15)',
    color: 'var(--accent, #6366f1)',
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.em_analise',
  },
  APROVADA: {
    bg: 'rgba(34,197,94,0.15)',
    color: 'var(--success, #22c55e)',
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.aprovada',
  },
  REPROVADA: {
    bg: 'rgba(239,68,68,0.15)',
    color: 'var(--danger, #ef4444)',
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.reprovada',
  },
  EXPIRADA: {
    bg: 'rgba(100,116,139,0.15)',
    color: 'var(--text-muted, #64748b)',
    labelKey: 'bidfrete.visao_fornecedor_bid_frete_internacional.kanban.expirada',
  },
}

const fmtMoeda = (val: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val)

function primeiraProposta(cotacao: Cotacao) {
  return cotacao.propostas_bid_frete_internacional?.[0]
}

function textoSolicitanteListaFornecedor(row: Cotacao, t: TFunction): string {
  if (row.anonima_cotacao_bid_frete_internacional) {
    return t(
      'bidfrete.visao_fornecedor_bid_frete_internacional.lista.solicitante_oculto',
      'Oculto',
    )
  }
  return row.nome_usuario_solicitante_bid_frete_internacional?.trim() || '—'
}

function renderBadgeFunil(t: TFunction, status: unknown): React.ReactNode {
  const chave = status as StatusKanbanFornecedorBidFreteInternacional
  const cfg = STATUS_FUNIL_BADGE[chave]
  if (!cfg) return <span>{String(status ?? '—')}</span>
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: 'var(--radius-pill, 9999px)',
        fontSize: '0.75rem',
        fontWeight: 600,
        background: cfg.bg,
        color: cfg.color,
      }}
    >
      {t(cfg.labelKey)}
    </span>
  )
}

function buildColunasBase(t: TFunction, onAbrir?: (cotacao: Cotacao) => void): GTColuna<Cotacao>[] {
  return [
    {
      key: 'numero_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_cotacao', 'Cotação'),
      tipo: 'texto',
      largura: 130,
      render: (val: unknown, row: Cotacao) => (
        <button
          type="button"
          onClick={() => onAbrir?.(row)}
          className="bf-lista-link-cotacao"
        >
          {String(val ?? '—')}
        </button>
      ),
    },
    {
      key: 'referencia_interna_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_referencia', 'Referência'),
      tipo: 'texto',
      largura: 120,
    },
    {
      key: 'data_criacao_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_data_cotacao', 'Data cotação'),
      tipo: 'periodo',
      largura: 120,
      render: (val: unknown) => (val ? formatarDataBidFrete(String(val)) : '—'),
    },
    {
      key: 'data_limite_resposta_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_prazo', 'Prazo resposta'),
      tipo: 'periodo',
      largura: 120,
      render: (val: unknown) => (val ? formatarDataBidFrete(String(val)) : '—'),
    },
    {
      key: 'nome_usuario_solicitante_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_solicitante', 'Solicitante'),
      tipo: 'texto',
      largura: 160,
      render: (_val: unknown, row: Cotacao) => textoSolicitanteListaFornecedor(row, t),
      findDisplay: (row: Cotacao) => {
        const texto = textoSolicitanteListaFornecedor(row, t)
        return texto === '—' ? '' : texto
      },
    },
    {
      key: 'origem_nome_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_origem', 'Origem'),
      tipo: 'texto',
      largura: 140,
    },
    {
      key: 'destino_nome_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_destino', 'Destino'),
      tipo: 'texto',
      largura: 140,
    },
    {
      key: 'modal_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_modal', 'Modal'),
      tipo: 'texto',
      largura: 110,
      render: (val: unknown) => {
        const modal = val as ModalFrete
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem' }}>
            {modal ? MODAL_ICON[modal] : null}
            {modal ? MODAL_LABELS[modal] : '—'}
          </span>
        )
      },
    },
    {
      key: 'modalidade_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_modalidade', 'Modalidade'),
      tipo: 'texto',
      largura: 100,
      render: (val: unknown) => MODALIDADE_LABELS[val as ModalidadeCarga] ?? String(val ?? '—'),
    },
    {
      key: 'status_cotacao_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_status_funil', 'Status'),
      tipo: 'texto',
      largura: 150,
      render: (val: unknown) => renderBadgeFunil(t, val),
    },
    {
      key: 'valor_total_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.lista.col_valor_total', 'Valor total'),
      tipo: 'numero',
      largura: 140,
      align: 'right',
      render: (_val: unknown, row: Cotacao) => {
        const proposta = primeiraProposta(row)
        if (!proposta) return '—'
        return (
          <span className="bf-lista-valor-numerico">
            {proposta.moeda_proposta_bid_frete_internacional}{' '}
            {fmtMoeda(proposta.valor_total_proposta_bid_frete_internacional)}
          </span>
        )
      },
    },
    {
      key: 'dias_transito_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_transit_time', 'Transit time'),
      tipo: 'numero',
      largura: 110,
      align: 'center',
      render: (_val: unknown, row: Cotacao) => {
        const dias = primeiraProposta(row)?.dias_transito_proposta_bid_frete_internacional
        if (dias == null) return '—'
        return (
          <span className="bf-lista-valor-numerico">
            {t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.dias', { val: dias })}
          </span>
        )
      },
    },
    {
      key: 'validade_proposta_bid_frete_internacional',
      label: t('bidfrete.visao_fornecedor_bid_frete_internacional.propostas.col_validade', 'Validade proposta'),
      tipo: 'periodo',
      largura: 120,
      render: (_val: unknown, row: Cotacao) => {
        const validade = primeiraProposta(row)?.validade_proposta_bid_frete_internacional
        return validade ? formatarDataBidFrete(validade) : '—'
      },
    },
  ]
}

/** Colunas planas da lista fornecedor — com filtro ▾ (paridade lista comprador). */
export function buildColunasListaFornecedor(
  t: TFunction,
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<Cotacao>[] {
  return buildColunasBase(t, onAbrirCotacao).map(garantirFiltravelColunaBidFrete)
}

export function buildColunasPaiListaFornecedor(
  t: TFunction,
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<LinhaPaiLista>[] {
  const colunas = buildColunasBase(t, onAbrirCotacao)
  return colunas.map(col => ({
    ...col,
    render: (val: unknown, item: LinhaPaiLista) => {
      if (col.render) return col.render(val, item as Cotacao)
      return val == null ? '—' : String(val)
    },
  }))
}

export function buildColunasExportListaFornecedor(
  t: TFunction,
): GTColuna<Cotacao>[] {
  return buildColunasBase(t)
}

const COLUNAS_BASE = buildColunasBase(((k: string) => k) as TFunction)

export { CHAVES_COLUNAS_PADRAO_VISIVEIS_FORNECEDOR } from '../../shared/ordem-colunas-lista-fornecedor-bid-frete-internacional'

export const CHAVES_COLUNAS_LISTA_FORNECEDOR = COLUNAS_BASE
  .map(c => c.key)
  .filter((k): k is string => typeof k === 'string')

export function formatValorExportColunaFornecedor(
  key: string,
  row: Cotacao,
  t?: TFunction,
): string {
  if (key === 'valor_total_proposta_bid_frete_internacional') {
    const p = primeiraProposta(row)
    if (!p) return ''
    return `${p.moeda_proposta_bid_frete_internacional} ${p.valor_total_proposta_bid_frete_internacional}`
  }
  if (key === 'dias_transito_proposta_bid_frete_internacional') {
    const dias = primeiraProposta(row)?.dias_transito_proposta_bid_frete_internacional
    return dias == null ? '' : String(dias)
  }
  if (key === 'validade_proposta_bid_frete_internacional') {
    const v = primeiraProposta(row)?.validade_proposta_bid_frete_internacional
    return v ?? ''
  }
  if (key === 'status_cotacao_bid_frete_internacional') {
    return String(row.status_cotacao_bid_frete_internacional ?? '')
  }
  if (key === 'data_criacao_cotacao_bid_frete_internacional') {
    const val = row.data_criacao_cotacao_bid_frete_internacional
    return val ? formatarDataBidFrete(val) : ''
  }
  if (key === 'data_limite_resposta_cotacao_bid_frete_internacional') {
    const val = row.data_limite_resposta_cotacao_bid_frete_internacional
    return val ? formatarDataBidFrete(val) : ''
  }
  if (key === 'nome_usuario_solicitante_bid_frete_internacional') {
    const fn = t ?? (((k: string, d?: string) => d ?? k) as TFunction)
    const texto = textoSolicitanteListaFornecedor(row, fn)
    return texto === '—' ? '' : texto
  }
  const val = row[key as keyof Cotacao]
  if (val == null) return ''
  return String(val)
}
