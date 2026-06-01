import React from 'react'
import type { GTColuna, GTValorMoeda } from '@nucleo/tabela-virtual-global'
import { StatusBadgeGlobal } from '@nucleo/status-badge-global'
import { Anchor, AirplaneTilt, Truck } from '@phosphor-icons/react'
import type { Cotacao, StatusCotacao, ModalFrete, TipoOperacao, ModalidadeCarga, Visibilidade } from '../shared/types'
import { classeMoedaBadge } from '../shared/types'
import { STATUS_LABELS, STATUS_BADGE, MODAL_LABELS, OPERACAO_LABELS, MODALIDADE_LABELS, INCOTERMS } from '../shared/types'
import {
  codigoDestinoParaEdicao,
  codigoOrigemParaEdicao,
} from '../shared/lista-bid-frete-edicao-logistica'
import { rotuloCadastroLista, type GTOpcaoCadastro } from '../shared/useCadastrosListaBidFrete'
import type { LinhaPaiLista } from './lista-bid-frete-internacional-utils'
import { isLinhaBidGrupo } from './lista-bid-frete-internacional-utils'
import {
  carregarCasasDecimaisBidFrete,
  STORAGE_KEY_CASAS_BID_FRETE,
  SYNC_EVENT_CASAS_BID_FRETE,
} from '../shared/casas-config-bid-frete'
import { formatarDataBidFrete } from '../shared/formato-data-bid-frete'
import { criarColunasDatasMotivosCotacaoLista } from '../shared/colunas-datas-motivos-cotacao-bid-frete-internacional'
import { formatarContainersPersistidosParaExibicao } from '../shared/containers-cotacao-bid-frete-internacional'
import {
  TextoTruncadoComTooltip,
} from '../shared/texto-truncado-com-tooltip-bid-frete-internacional'
import { CAMPOS_NAO_EDITAVEIS_COTACAO as CAMPOS_NAO_EDITAVEIS_LISTA } from '../shared/salvar-campo-cotacao-bid-frete-internacional'

export { CAMPOS_NAO_EDITAVEIS_LISTA }

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

/** Paridade visual com Pedido › ColunasPai › tipo_operacao (lista). */
export const ESTILO_BADGE_OPERACAO_IMPORTACAO: React.CSSProperties = {
  color: '#60a5fa',
  background: 'rgba(96,165,250,0.12)',
  border: '1px solid rgba(96,165,250,0.2)',
}

export const ESTILO_BADGE_OPERACAO_EXPORTACAO: React.CSSProperties = {
  color: '#34d399',
  background: 'rgba(52,211,153,0.12)',
  border: '1px solid rgba(52,211,153,0.2)',
}

export function RenderBadgeOperacao(valor: unknown): React.ReactNode {
  const op = valor as TipoOperacao
  const isImport = op === 'IMPORTACAO'
  return (
    <StatusBadgeGlobal
      valor={OPERACAO_LABELS[op] || op}
      genero="feminino"
      style={isImport ? ESTILO_BADGE_OPERACAO_IMPORTACAO : ESTILO_BADGE_OPERACAO_EXPORTACAO}
    />
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

export { LIMITE_TRUNCAR_DESCRICAO_LISTA } from '../shared/texto-truncado-com-tooltip-bid-frete-internacional'

function renderTexto(val: unknown): React.ReactNode {
  return (val as string | null | undefined) ?? '—'
}

function renderDescricaoTruncada(
  valor: string | null | undefined,
  label: string,
): React.ReactNode {
  return <TextoTruncadoComTooltip texto={valor} rotuloTooltip={label} />
}

function renderNumero(val: unknown, casas = 0): React.ReactNode {
  return val != null ? fmtQuantidade(val as number, casas) : '—'
}

/** Célula valor + badge de moeda (paridade Pedido `valor_total_pedido`). */
function renderCelulaValorMoeda(
  valor: number | null | undefined,
  moeda: string | null | undefined,
  casas = 2,
): React.ReactNode {
  const codigo = (moeda ?? 'USD').trim() || 'USD'
  const num = valor != null ? Number(valor) : null
  const temValor = num != null && !Number.isNaN(num)
  return (
    <span className="gtv-celula-moeda">
      <span className={classeMoedaBadge(codigo)}>{codigo}</span>
      {temValor ? fmtQuantidade(num, casas) : '—'}
    </span>
  )
}

/** Moeda de exibição/edição de valores monetários da cotação (paridade valor meta / aprovado). */
export function moedaMonetariaCotacao(cotacao: Cotacao): string {
  return (
    cotacao.moeda_meta_cotacao_bid_frete_internacional?.trim()
    || cotacao.moeda_aprovada?.trim()
    || 'USD'
  )
}

function renderBadgeMoeda(moeda: string | null | undefined): React.ReactNode {
  const codigo = moeda?.trim()
  if (!codigo) return '—'
  return (
    <span className="gtv-celula-moeda">
      <span className={classeMoedaBadge(codigo)}>{codigo}</span>
    </span>
  )
}

export interface OpcoesColunasLista {
  organizacoesMap?: Map<string, string>
  workspacesMap?: Map<string, { nome: string }>
  usuariosMap?: Map<string, string>
  idUsuarioAtual?: string
  nomeUsuarioAtual?: string
  /** Fallback de workspace só para cotação do usuário logado sem id_workspace gravado. */
  nomeWorkspaceFallback?: string
  /** Opções de status (Configurações → sincronizado com localStorage). */
  statusOpcoes?: Array<{ valor: string; label: string }>
  /** Catálogos Cadastros — paridade Pedido (select com busca no popover GTV). */
  paisesOpcoes?: GTOpcaoCadastro[]
  portosOpcoes?: GTOpcaoCadastro[]
  aeroportosOpcoes?: GTOpcaoCadastro[]
  containersOpcoes?: GTOpcaoCadastro[]
}

function opcoesLocalizacaoLista(opcoes: OpcoesColunasLista): GTOpcaoCadastro[] | undefined {
  const portos = opcoes.portosOpcoes ?? []
  const aeroportos = opcoes.aeroportosOpcoes ?? []
  const merged = [...portos, ...aeroportos]
  return merged.length > 0 ? merged : undefined
}

function renderRotuloLocalizacao(
  cotacao: Cotacao,
  opcoesLoc: GTOpcaoCadastro[] | undefined,
  codigo: string,
  nomeFallback: string,
): React.ReactNode {
  const rotulo = opcoesLoc ? rotuloCadastroLista(codigo, opcoesLoc) : ''
  return rotulo || nomeFallback || '—'
}

const OPCOES_OPERACAO = (Object.entries(OPERACAO_LABELS) as Array<[TipoOperacao, string]>).map(
  ([valor, label]) => ({ valor, label }),
)
const OPCOES_MODAL = (Object.entries(MODAL_LABELS) as Array<[ModalFrete, string]>).map(
  ([valor, label]) => ({ valor, label }),
)
const OPCOES_MODALIDADE = (Object.entries(MODALIDADE_LABELS) as Array<[ModalidadeCarga, string]>).map(
  ([valor, label]) => ({ valor, label }),
)
const OPCOES_VISIBILIDADE: Array<{ valor: string; label: string }> = [
  { valor: 'ABERTA', label: 'Aberta' },
  { valor: 'DIRECIONADA', label: 'Direcionada' },
]
const OPCOES_ANONIMA: Array<{ valor: string; label: string }> = [
  { valor: 'true', label: 'Sim' },
  { valor: 'false', label: 'Não' },
]
const OPCOES_INCOTERM = INCOTERMS.map(inc => ({ valor: inc, label: inc }))
const OPCOES_STATUS_PADRAO = (Object.entries(STATUS_LABELS) as Array<[StatusCotacao, string]>).map(
  ([valor, label]) => ({ valor, label }),
)

function aplicarConfigEdicaoColuna(
  col: GTColuna<Cotacao>,
  opcoes: OpcoesColunasLista,
): GTColuna<Cotacao> {
  const key = col.key as string
  if (!key || CAMPOS_NAO_EDITAVEIS_LISTA.has(key)) {
    const tooltipServidor =
      key === 'data_atualizacao_cotacao_bid_frete_internacional'
        ? 'Atualizada automaticamente pelo sistema ao salvar alterações.'
        : undefined
    return {
      ...col,
      editavel: false,
      ...(tooltipServidor ? { tooltipBloqueado: tooltipServidor } : {}),
    }
  }

  const base: GTColuna<Cotacao> = { ...col, editavel: true }

  switch (key) {
    case 'status_cotacao_bid_frete_internacional':
      return {
        ...base,
        opcoes: opcoes.statusOpcoes?.length ? opcoes.statusOpcoes : OPCOES_STATUS_PADRAO,
      }
    case 'tipo_operacao_cotacao_bid_frete_internacional':
      return { ...base, opcoes: OPCOES_OPERACAO }
    case 'modal_cotacao_bid_frete_internacional':
      return { ...base, opcoes: OPCOES_MODAL }
    case 'modalidade_cotacao_bid_frete_internacional':
      return { ...base, opcoes: OPCOES_MODALIDADE }
    case 'visibilidade_cotacao_bid_frete_internacional':
      return { ...base, opcoes: OPCOES_VISIBILIDADE }
    case 'anonima_cotacao_bid_frete_internacional':
      return {
        ...base,
        opcoes: OPCOES_ANONIMA,
        getValorEditar: (item: Cotacao) => String(!!item.anonima_cotacao_bid_frete_internacional),
      }
    case 'incoterm_cotacao_bid_frete_internacional':
      return { ...base, opcoes: OPCOES_INCOTERM }
    case 'id_organizacao':
      return {
        ...base,
        opcoes: opcoes.organizacoesMap
          ? [...opcoes.organizacoesMap.entries()].map(([valor, label]) => ({ valor, label }))
          : undefined,
        getValorEditar: (item: Cotacao) => item.id_organizacao,
      }
    case 'id_workspace':
      return {
        ...base,
        opcoes: opcoes.workspacesMap
          ? [...opcoes.workspacesMap.entries()].map(([valor, w]) => ({
              valor,
              label: w.nome,
            }))
          : undefined,
        getValorEditar: (item: Cotacao) => item.id_workspace ?? '',
      }
    case 'id_usuario':
      return {
        ...base,
        opcoes: opcoes.usuariosMap
          ? [...opcoes.usuariosMap.entries()].map(([valor, label]) => ({ valor, label }))
          : undefined,
        getValorEditar: (item: Cotacao) => item.id_usuario ?? '',
      }
    case 'id_produto_gravity':
      return {
        ...base,
        opcoes: [{ valor: 'bid-frete-internacional', label: 'BID Frete Internacional' }],
      }
    case 'origem_nome_cotacao_bid_frete_internacional':
    case 'origem_codigo_cotacao_bid_frete_internacional': {
      const opcoesLoc = opcoesLocalizacaoLista(opcoes)
      return {
        ...base,
        opcoes: opcoesLoc,
        editavel: (item: Cotacao) =>
          item.modal_cotacao_bid_frete_internacional !== 'RODOVIARIO' && !!opcoesLoc?.length,
        getValorEditar: codigoOrigemParaEdicao,
        findDisplay: (item: Cotacao) => {
          const rotulo = opcoesLoc
            ? rotuloCadastroLista(codigoOrigemParaEdicao(item), opcoesLoc)
            : ''
          return rotulo || item.origem_nome_cotacao_bid_frete_internacional || ''
        },
        render: (_val: unknown, item: Cotacao) =>
          renderRotuloLocalizacao(
            item,
            opcoesLoc,
            codigoOrigemParaEdicao(item),
            item.origem_nome_cotacao_bid_frete_internacional,
          ),
      }
    }
    case 'destino_nome_cotacao_bid_frete_internacional':
    case 'destino_codigo_cotacao_bid_frete_internacional': {
      const opcoesLoc = opcoesLocalizacaoLista(opcoes)
      return {
        ...base,
        opcoes: opcoesLoc,
        editavel: (item: Cotacao) =>
          item.modal_cotacao_bid_frete_internacional !== 'RODOVIARIO' && !!opcoesLoc?.length,
        getValorEditar: codigoDestinoParaEdicao,
        findDisplay: (item: Cotacao) => {
          const rotulo = opcoesLoc
            ? rotuloCadastroLista(codigoDestinoParaEdicao(item), opcoesLoc)
            : ''
          return rotulo || item.destino_nome_cotacao_bid_frete_internacional || ''
        },
        render: (_val: unknown, item: Cotacao) =>
          renderRotuloLocalizacao(
            item,
            opcoesLoc,
            codigoDestinoParaEdicao(item),
            item.destino_nome_cotacao_bid_frete_internacional,
          ),
      }
    }
    case 'origem_pais_cotacao_bid_frete_internacional':
      return {
        ...base,
        opcoes: opcoes.paisesOpcoes,
        getValorEditar: (item: Cotacao) => item.origem_pais_cotacao_bid_frete_internacional ?? '',
        findDisplay: (item: Cotacao) =>
          rotuloCadastroLista(item.origem_pais_cotacao_bid_frete_internacional, opcoes.paisesOpcoes ?? '')
            || item.origem_pais_cotacao_bid_frete_internacional
            || '—',
        render: (_val: unknown, item: Cotacao) =>
          rotuloCadastroLista(item.origem_pais_cotacao_bid_frete_internacional, opcoes.paisesOpcoes ?? '')
            || item.origem_pais_cotacao_bid_frete_internacional
            || '—',
      }
    case 'destino_pais_cotacao_bid_frete_internacional':
      return {
        ...base,
        opcoes: opcoes.paisesOpcoes,
        getValorEditar: (item: Cotacao) => item.destino_pais_cotacao_bid_frete_internacional ?? '',
        findDisplay: (item: Cotacao) =>
          rotuloCadastroLista(item.destino_pais_cotacao_bid_frete_internacional, opcoes.paisesOpcoes ?? '')
            || item.destino_pais_cotacao_bid_frete_internacional
            || '—',
        render: (_val: unknown, item: Cotacao) =>
          rotuloCadastroLista(item.destino_pais_cotacao_bid_frete_internacional, opcoes.paisesOpcoes ?? '')
            || item.destino_pais_cotacao_bid_frete_internacional
            || '—',
      }
    case 'tipo_container_cotacao_bid_frete_internacional': {
      const rotuloContainer = (codigo: string) =>
        rotuloCadastroLista(codigo, opcoes.containersOpcoes ?? []) || codigo
      return {
        ...base,
        opcoes: opcoes.containersOpcoes,
        getValorEditar: (item: Cotacao) => item.tipo_container_cotacao_bid_frete_internacional ?? '',
        findDisplay: (item: Cotacao) =>
          item.tipo_container_cotacao_bid_frete_internacional
            ? formatarContainersPersistidosParaExibicao(
                item.tipo_container_cotacao_bid_frete_internacional,
                item.quantidade_volume_cotacao_bid_frete_internacional,
                rotuloContainer,
              )
            : '—',
        render: (_val: unknown, item: Cotacao) =>
          item.tipo_container_cotacao_bid_frete_internacional
            ? formatarContainersPersistidosParaExibicao(
                item.tipo_container_cotacao_bid_frete_internacional,
                item.quantidade_volume_cotacao_bid_frete_internacional,
                rotuloContainer,
              )
            : '—',
      }
    }
    case 'valor_meta_cotacao_bid_frete_internacional': {
      const casas = getCasas('valor_meta_cotacao_bid_frete_internacional', 2)
      return {
        ...base,
        tipo: 'moeda',
        casasDecimais: casas,
        getValorEditar: (item: Cotacao): GTValorMoeda => ({
          currency: item.moeda_meta_cotacao_bid_frete_internacional ?? 'USD',
          amount: item.valor_meta_cotacao_bid_frete_internacional ?? 0,
        }),
        render: (_val: unknown, item: Cotacao) =>
          renderCelulaValorMoeda(item.valor_meta_cotacao_bid_frete_internacional, item.moeda_meta_cotacao_bid_frete_internacional, casas),
      }
    }
    case 'ganho_valor_cotacao_bid_frete_internacional': {
      const casas = getCasas('ganho_valor_cotacao_bid_frete_internacional', 2)
      return {
        ...base,
        tipo: 'moeda',
        casasDecimais: casas,
        getValorEditar: (item: Cotacao): GTValorMoeda => ({
          currency: moedaMonetariaCotacao(item),
          amount: item.ganho_valor_cotacao_bid_frete_internacional ?? 0,
        }),
        render: (_val: unknown, item: Cotacao) => (
          <span style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
            {renderCelulaValorMoeda(
              item.ganho_valor_cotacao_bid_frete_internacional,
              moedaMonetariaCotacao(item),
              casas,
            )}
          </span>
        ),
      }
    }
    case 'moeda_meta_cotacao_bid_frete_internacional':
      return {
        ...base,
        opcoes: [
          { valor: 'USD', label: 'USD' },
          { valor: 'EUR', label: 'EUR' },
          { valor: 'BRL', label: 'BRL' },
          { valor: 'GBP', label: 'GBP' },
          { valor: 'CNY', label: 'CNY' },
        ],
        render: (_val: unknown, item: Cotacao) =>
          renderBadgeMoeda(item.moeda_meta_cotacao_bid_frete_internacional),
      }
    default:
      return base
  }
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
function buildColunasCotacoesBase(
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
      label: 'Produto Gravity',
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
      label: 'Referência Interna',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'tipo_operacao_cotacao_bid_frete_internacional',
      label: 'Tipo de operação',
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
      align: 'center',
      render: (val: unknown) => fmtData(val as string),
    },
    {
      key: 'data_atualizacao_cotacao_bid_frete_internacional',
      label: 'Última atualização',
      tipo: 'periodo',
      align: 'center',
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
      label: 'Cód. origem',
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
      label: 'País de origem',
      tipo: 'texto',
      align: 'center',
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
      label: 'Cód. destino',
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
      label: 'País de destino',
      tipo: 'texto',
      align: 'center',
      render: renderTexto,
    },
    {
      key: 'endereco_destino_cotacao_bid_frete_internacional',
      label: 'Endereço destino',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'descricao_mercadoria_cotacao_bid_frete_internacional',
      label: 'Descrição mercadoria',
      tipo: 'texto',
      tooltipDescricao: 'Texto completo da mercadoria cotada',
      render: (val: unknown) =>
        renderDescricaoTruncada(val as string | null | undefined, 'Descrição mercadoria'),
    },
    {
      key: 'ncm_cotacao_bid_frete_internacional',
      label: 'NCM',
      tipo: 'texto',
      render: renderTexto,
    },
    {
      key: 'quantidade_volume_cotacao_bid_frete_internacional',
      label: 'Quantidade de Volumes',
      tipo: 'numero',
      align: 'center',
      render: (val: unknown) => renderNumero(val, 0),
    },
    {
      key: 'tipo_container_cotacao_bid_frete_internacional',
      label: 'Tipo container',
      tipo: 'texto',
      align: 'center',
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
      tipo: 'moeda',
      align: 'center',
      casasDecimais: getCasas('valor_meta_cotacao_bid_frete_internacional', 2),
      getValorEditar: (item: Cotacao): GTValorMoeda => ({
        currency: item.moeda_meta_cotacao_bid_frete_internacional ?? 'USD',
        amount: item.valor_meta_cotacao_bid_frete_internacional ?? 0,
      }),
      render: (_val: unknown, item: Cotacao) =>
        renderCelulaValorMoeda(
          item.valor_meta_cotacao_bid_frete_internacional,
          item.moeda_meta_cotacao_bid_frete_internacional,
          getCasas('valor_meta_cotacao_bid_frete_internacional', 2),
        ),
    },
    {
      key: 'moeda_meta_cotacao_bid_frete_internacional',
      label: 'Moeda meta',
      tipo: 'texto',
      align: 'center',
      render: (_val: unknown, item: Cotacao) =>
        renderBadgeMoeda(item.moeda_meta_cotacao_bid_frete_internacional),
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
    ...criarColunasDatasMotivosCotacaoLista(),
    {
      key: 'id_fornecedor_vencedor_cotacao_bid_frete_internacional',
      label: 'Fornecedor vencedor',
      tipo: 'texto',
      align: 'center',
      render: renderTexto,
    },
    {
      key: 'ganho_valor_cotacao_bid_frete_internacional',
      label: 'Ganho estimado',
      tipo: 'moeda',
      align: 'center',
      casasDecimais: getCasas('ganho_valor_cotacao_bid_frete_internacional', 2),
      getValorEditar: (item: Cotacao): GTValorMoeda => ({
        currency: moedaMonetariaCotacao(item),
        amount: item.ganho_valor_cotacao_bid_frete_internacional ?? 0,
      }),
      render: (_val: unknown, item: Cotacao) => (
        <span style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
          {renderCelulaValorMoeda(
            item.ganho_valor_cotacao_bid_frete_internacional,
            moedaMonetariaCotacao(item),
            getCasas('ganho_valor_cotacao_bid_frete_internacional', 2),
          )}
        </span>
      ),
    },
    {
      key: 'ganho_percentual_cotacao_bid_frete_internacional',
      label: 'Ganho (%)',
      tipo: 'numero',
      align: 'center',
      render: (val: unknown) => (
        <span style={{ display: 'block', width: '100%', textAlign: 'center' }}>
          {val != null
            ? `${fmtQuantidade(val as number, getCasas('ganho_percentual_cotacao_bid_frete_internacional', 2))}%`
            : '—'}
        </span>
      ),
    },
  ]
}

export function buildColunasCotacoes(
  t: unknown,
  opcoes: OpcoesColunasLista = {},
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<Cotacao>[] {
  return buildColunasCotacoesBase(t, opcoes, onAbrirCotacao).map(col =>
    aplicarConfigEdicaoColuna(col, opcoes),
  )
}

/** Colunas da linha pai (cotação avulsa ou BID agrupado). */
export function buildColunasPaiLista(
  t: unknown,
  opcoes: OpcoesColunasLista = {},
  onAbrirCotacao?: (cotacao: Cotacao) => void,
): GTColuna<LinhaPaiLista>[] {
  const colunasCotacao = buildColunasCotacoes(t, opcoes, onAbrirCotacao)
  const tooltipBid =
    'Expanda o BID e edite cada cotação na linha filha.'

  return colunasCotacao.map((col) => ({
    ...col,
    editavel: (item: LinhaPaiLista) => {
      if (isLinhaBidGrupo(item)) return false
      if (typeof col.editavel === 'function') return col.editavel(item as Cotacao)
      return col.editavel === true
    },
    tooltipBloqueado: (item: LinhaPaiLista) =>
      isLinhaBidGrupo(item) ? tooltipBid : undefined,
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

const COLUNAS_COTACAO_BASE = buildColunasCotacoesBase(null)

export const CHAVES_COLUNAS_COTACAO = COLUNAS_COTACAO_BASE
  .map(c => c.key)
  .filter((k): k is string => typeof k === 'string')

/** Whitelist de campos editáveis inline na lista (todas as colunas exceto técnicas). */
export const CAMPOS_EDITAVEIS_LISTA = CHAVES_COLUNAS_COTACAO.filter(
  k => !CAMPOS_NAO_EDITAVEIS_LISTA.has(k),
)

/** Colunas visíveis na 1ª abertura (sem prefs salvas). Ordem = layout padrão da lista. */
export const CHAVES_COLUNAS_PADRAO_VISIVEIS: string[] = [
  'numero_cotacao_bid_frete_internacional',
  'tipo_operacao_cotacao_bid_frete_internacional',
  'modal_cotacao_bid_frete_internacional',
  'modalidade_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'origem_codigo_cotacao_bid_frete_internacional',
  'origem_pais_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'destino_codigo_cotacao_bid_frete_internacional',
  'destino_pais_cotacao_bid_frete_internacional',
]
