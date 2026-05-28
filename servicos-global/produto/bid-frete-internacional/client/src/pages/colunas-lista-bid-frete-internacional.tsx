import React from 'react'
import type { GTColuna } from '@nucleo/tabela-virtual-global'
import { Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao, ModalFrete, TipoOperacao, ModalidadeCarga, Visibilidade } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS } from '../shared/types'
import type { LinhaPaiLista } from './lista-bid-frete-internacional-utils'
import { isLinhaBidGrupo } from './lista-bid-frete-internacional-utils'
import {
  carregarCasasDecimaisBidFrete,
  STORAGE_KEY_CASAS_BID_FRETE,
  SYNC_EVENT_CASAS_BID_FRETE,
} from '../shared/casas-config-bid-frete'
import { formatarDataBidFrete } from '../shared/formato-data-bid-frete'

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

export function RenderModalIcon(valor: unknown): React.ReactNode {
  const modal = valor as string
  const size = 14
  if (modal === 'MARITIMO') return <Anchor weight="duotone" size={size} />
  if (modal === 'AEREO') return <AirplaneTilt weight="duotone" size={size} />
  return <Truck weight="duotone" size={size} />
}

export const fmtData = (iso: string | null | undefined): string => formatarDataBidFrete(iso)

export const fmtQuantidade = (v: number | null | undefined, casas = 2): string => {
  if (v == null) return '—'
  return v.toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
}

let _casasRaw: string | null | undefined
let _casasParsed: Record<string, number> = {}

function invalidarCacheCasasDecimais(): void {
  _casasRaw = undefined
}

if (typeof window !== 'undefined') {
  window.addEventListener(SYNC_EVENT_CASAS_BID_FRETE, invalidarCacheCasasDecimais)
}

export function lerCasasDecimaisConfig(): Record<string, number> {
  const raw = localStorage.getItem(STORAGE_KEY_CASAS_BID_FRETE)
  if (raw !== _casasRaw) {
    _casasRaw = raw
    _casasParsed = carregarCasasDecimaisBidFrete()
  }
  return _casasParsed
}

/** Casas decimais configuráveis em Configurações → Colunas → Casas Decimais. */
export function getCasas(campo: string, padrao: number): number {
  return lerCasasDecimaisConfig()[campo] ?? padrao
}

function renderTexto(val: unknown): React.ReactNode {
  return (val as string | null | undefined) ?? '—'
}

function renderNumero(val: unknown, casas = 0): React.ReactNode {
  return val != null ? fmtQuantidade(val as number, casas) : '—'
}

function renderMoeda(val: unknown, moeda: string | null | undefined): React.ReactNode {
  if (val == null) return '—'
  return `${moeda ?? 'USD'} ${fmtQuantidade(val as number, 2)}`
}

export interface OpcoesColunasLista {
  organizacoesMap?: Map<string, string>
  workspacesMap?: Map<string, { nome: string }>
  usuariosMap?: Map<string, string>
  idUsuarioAtual?: string
  nomeUsuarioAtual?: string
  /** Fallback de workspace só para cotação do usuário logado sem id_workspace gravado. */
  nomeWorkspaceFallback?: string
}

const LABEL_PRODUTO_GRAVITY: Record<string, string> = {
  'bid-frete-internacional': 'BID Frete Internacional',
}

type ItemColunaLista = Cotacao | LinhaPaiLista

function isUsuarioAtual(id: string | null | undefined, opcoes?: OpcoesColunasLista): boolean {
  if (!id || !opcoes?.idUsuarioAtual) return id === 'user_dev_default'
  return id === opcoes.idUsuarioAtual || id === 'user_dev_default'
}

function textoOrganizacao(val: unknown, opcoes?: OpcoesColunasLista): string {
  const id = String(val ?? '')
  if (!id) return ''
  return opcoes?.organizacoesMap?.get(id) ?? ''
}

function textoWorkspace(
  val: unknown,
  opcoes?: OpcoesColunasLista,
  item?: ItemColunaLista,
): string {
  if (item && isLinhaBidGrupo(item) && item.workspaces_divergentes) {
    return `${item.quantidade_workspaces_distintos} workspaces`
  }
  const id = String(val ?? '')
  if (!id) {
    if (
      item &&
      opcoes?.nomeWorkspaceFallback &&
      isUsuarioAtual('id_usuario' in item ? item.id_usuario : null, opcoes)
    ) {
      return opcoes.nomeWorkspaceFallback
    }
    return ''
  }
  return opcoes?.workspacesMap?.get(id)?.nome ?? ''
}

function textoUsuario(
  val: unknown,
  opcoes?: OpcoesColunasLista,
  item?: ItemColunaLista,
): string {
  if (item && isLinhaBidGrupo(item) && item.usuarios_divergentes) {
    return `${item.quantidade_usuarios_distintos} usuários`
  }
  const id = String(val ?? '')
  if (!id) return ''
  const nome = opcoes?.usuariosMap?.get(id)
  if (nome) return nome
  if (opcoes?.nomeUsuarioAtual && isUsuarioAtual(id, opcoes)) {
    return opcoes.nomeUsuarioAtual
  }
  return ''
}

function renderNomeOrganizacao(
  val: unknown,
  opcoes?: OpcoesColunasLista,
  _item?: ItemColunaLista,
): React.ReactNode {
  const nome = textoOrganizacao(val, opcoes)
  return nome || '—'
}

function renderNomeWorkspace(
  val: unknown,
  opcoes?: OpcoesColunasLista,
  item?: ItemColunaLista,
): React.ReactNode {
  const nome = textoWorkspace(val, opcoes, item)
  return nome || '—'
}

function renderNomeUsuario(
  val: unknown,
  opcoes?: OpcoesColunasLista,
  item?: ItemColunaLista,
): React.ReactNode {
  const nome = textoUsuario(val, opcoes, item)
  return nome || '—'
}

function renderProduto(val: unknown): React.ReactNode {
  const slug = String(val ?? '')
  if (!slug) return '—'
  return LABEL_PRODUTO_GRAVITY[slug] ?? slug
}

/** Valor textual para exportação CSV/Excel — paridade com o que a tabela exibe. */
export function formatValorExportColuna(
  key: string,
  row: Cotacao,
  opcoes: OpcoesColunasLista,
): string {
  const val = row[key as keyof Cotacao]
  switch (key) {
    case 'id_organizacao':
      return textoOrganizacao(val, opcoes)
    case 'id_usuario':
      return textoUsuario(val, opcoes, row)
    case 'id_workspace':
      return textoWorkspace(val, opcoes, row)
    case 'id_produto_gravity': {
      const slug = String(val ?? '')
      return slug ? (LABEL_PRODUTO_GRAVITY[slug] ?? slug) : ''
    }
    default:
      break
  }
  if (val == null) return ''
  return String(val)
}

/** Todas as colunas escalares de `cotacao_bid_frete_internacional` (fragment.prisma). */
export function buildColunasCotacoes(
  _t: unknown,
  opcoes: OpcoesColunasLista = {},
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<Cotacao>[] {
  return [
    {
      key: 'numero_cotacao_bid_frete_internacional',
      label: 'Nº da cotação',
      tipo: 'texto',
      render: (val: unknown, item: Cotacao) => {
        const numero = val as string
        const estiloLink = {
          fontFamily: 'DM Mono, monospace',
          fontSize: '0.8125rem',
          color: 'var(--accent, #6366f1)',
          fontWeight: 600,
        } as const

        if (!onAbrirCotacao) {
          return <span style={estiloLink}>{numero}</span>
        }

        return (
          <button
            type="button"
            aria-label={`Abrir cotação ${numero}`}
            onClick={(e) => {
              e.stopPropagation()
              onAbrirCotacao(item)
            }}
            style={{
              ...estiloLink,
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              textAlign: 'left',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(99, 102, 241, 0.35)',
            }}
          >
            {numero}
          </button>
        )
      },
    },
    {
      key: 'id_cotacao_bid_frete_internacional',
      label: 'ID',
      tipo: 'texto',
      oculta: true,
      render: renderTexto,
    },
    {
      key: 'id_organizacao',
      label: 'Organização',
      tipo: 'texto',
      render: (val: unknown, item: Cotacao) => renderNomeOrganizacao(val, opcoes, item),
      findDisplay: (item: Cotacao) => textoOrganizacao(item.id_organizacao, opcoes) || '—',
    },
    {
      key: 'id_produto_gravity',
      label: 'Produto',
      tipo: 'texto',
      render: (val: unknown) => renderProduto(val),
      findDisplay: (item: Cotacao) => {
        const label = renderProduto(item.id_produto_gravity)
        return label === '—' ? '' : String(label)
      },
    },
    {
      key: 'id_usuario',
      label: 'Usuário',
      tipo: 'texto',
      render: (val: unknown, item: Cotacao) => renderNomeUsuario(val, opcoes, item),
      findDisplay: (item: Cotacao) => textoUsuario(item.id_usuario, opcoes, item) || '—',
    },
    {
      key: 'id_workspace',
      label: 'Workspace',
      tipo: 'texto',
      render: (val: unknown, item: Cotacao) => renderNomeWorkspace(val, opcoes, item),
      findDisplay: (item: Cotacao) => textoWorkspace(item.id_workspace, opcoes, item) || '—',
    },
    {
      key: 'referencia_interna_cotacao_bid_frete_internacional',
      label: 'Referência',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'tipo_operacao_cotacao_bid_frete_internacional',
      label: 'Operação',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeOperacao(val),
    },
    {
      key: 'status_cotacao_bid_frete_internacional',
      label: 'Status',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeStatus(val),
    },
    {
      key: 'data_criacao_cotacao_bid_frete_internacional',
      label: 'Data da cotação',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'data_atualizacao_cotacao_bid_frete_internacional',
      label: 'Última atualização',
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
      label: 'Código origem',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'origem_nome_cotacao_bid_frete_internacional',
      label: 'Origem',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'origem_pais_cotacao_bid_frete_internacional',
      label: 'País origem',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'endereco_origem_cotacao_bid_frete_internacional',
      label: 'Endereço origem',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'destino_codigo_cotacao_bid_frete_internacional',
      label: 'Código destino',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'destino_nome_cotacao_bid_frete_internacional',
      label: 'Destino',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'destino_pais_cotacao_bid_frete_internacional',
      label: 'País destino',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'descricao_mercadoria_cotacao_bid_frete_internacional',
      label: 'Descrição mercadoria',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'ncm_cotacao_bid_frete_internacional',
      label: 'NCM',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'quantidade_cotacao_bid_frete_internacional',
      label: 'Quantidade',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => renderNumero(val, 0),
    },
    {
      key: 'tipo_container_cotacao_bid_frete_internacional',
      label: 'Tipo container',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'peso_kg_cotacao_bid_frete_internacional',
      label: 'Peso (kg)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => renderNumero(val, getCasas('peso_kg_cotacao_bid_frete_internacional', 2)),
    },
    {
      key: 'cubagem_m3_cotacao_bid_frete_internacional',
      label: 'Volume (m³)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) => renderNumero(val, getCasas('cubagem_m3_cotacao_bid_frete_internacional', 3)),
    },
    {
      key: 'incoterm_cotacao_bid_frete_internacional',
      label: 'Incoterm',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'zipcode_origem_cotacao_bid_frete_internacional',
      label: 'Zipcode origem',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'zipcode_destino_cotacao_bid_frete_internacional',
      label: 'Zipcode destino',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'valor_meta_cotacao_bid_frete_internacional',
      label: 'Valor meta',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown, item: Cotacao) =>
        renderMoeda(val, item.moeda_meta_cotacao_bid_frete_internacional),
    },
    {
      key: 'moeda_meta_cotacao_bid_frete_internacional',
      label: 'Moeda meta',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'visibilidade_cotacao_bid_frete_internacional',
      label: 'Visibilidade',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeVisibilidade(val),
    },
    {
      key: 'anonima_cotacao_bid_frete_internacional',
      label: 'Anônima',
      tipo: 'texto',
      render: (val: unknown) => RenderBadgeAnonima(val),
    },
    {
      key: 'data_limite_resposta_cotacao_bid_frete_internacional',
      label: 'Prazo resposta',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'data_aprovacao_cotacao_bid_frete_internacional',
      label: 'Data aprovação',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'data_cancelamento_cotacao_bid_frete_internacional',
      label: 'Data cancelamento',
      tipo: 'periodo',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'motivo_reprovacao_cotacao_bid_frete_internacional',
      label: 'Motivo reprovação',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'motivo_cancelamento_cotacao_bid_frete_internacional',
      label: 'Motivo cancelamento',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'id_fornecedor_vencedor_cotacao_bid_frete_internacional',
      label: 'Fornecedor vencedor',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'ganho_valor_cotacao_bid_frete_internacional',
      label: 'Ganho estimado',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) =>
        val != null
          ? `USD ${fmtQuantidade(val as number, getCasas('ganho_valor_cotacao_bid_frete_internacional', 2))}`
          : '—',
    },
    {
      key: 'ganho_percentual_cotacao_bid_frete_internacional',
      label: 'Ganho (%)',
      tipo: 'numero',
      align: 'right',
      render: (val: unknown) =>
        val != null
          ? `${fmtQuantidade(val as number, getCasas('ganho_percentual_cotacao_bid_frete_internacional', 2))}%`
          : '—',
    },
  ]
}

/** Colunas da linha pai (cotação avulsa ou BID agrupado). */
export function buildColunasPaiLista(
  t: unknown,
  opcoes: OpcoesColunasLista = {},
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<LinhaPaiLista>[] {
  const colunasCotacao = buildColunasCotacoes(t, opcoes, onAbrirCotacao)

  return colunasCotacao.map((col) => ({
    ...col,
    render: (val: unknown, item: LinhaPaiLista) => {
      if (col.key === 'numero_cotacao_bid_frete_internacional' && isLinhaBidGrupo(item)) {
        return (
          <span style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
            <span style={{
              fontFamily: 'DM Mono, monospace',
              fontSize: '0.8125rem',
              color: 'var(--accent, #6366f1)',
              fontWeight: 600,
            }}>
              {item.numero_cotacao_bid_frete_internacional}
            </span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              {item.quantidade_cotacoes} cotações
            </span>
          </span>
        )
      }

      if (col.render) {
        return col.render(val, item as Cotacao)
      }
      return renderTexto(val)
    },
  }))
}

export function buildMapaColunasFilho(
  t: unknown,
  opcoes: OpcoesColunasLista = {},
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): Record<string, { key: keyof Cotacao; render?: GTColuna<Cotacao>['render'] }> {
  const colunas = buildColunasCotacoes(t, opcoes, onAbrirCotacao)
  const mapa: Record<string, { key: keyof Cotacao; render?: GTColuna<Cotacao>['render'] }> = {}
  for (const col of colunas) {
    if (col.key) {
      mapa[col.key as string] = { key: col.key as keyof Cotacao, render: col.render }
    }
  }
  return mapa
}

const COLUNAS_COTACAO_BASE = buildColunasCotacoes(null)

export const CHAVES_COLUNAS_COTACAO = COLUNAS_COTACAO_BASE
  .map(c => c.key)
  .filter((k): k is string => typeof k === 'string')

/** Colunas visíveis por padrão (exclui técnicas como ID interno). */
export const CHAVES_COLUNAS_PADRAO_VISIVEIS = COLUNAS_COTACAO_BASE
  .filter(c => !c.oculta)
  .map(c => c.key)
  .filter((k): k is string => typeof k === 'string')
