/**
 * Utilitários da lista — hierarquia BID (pai) → cotações (filhas).
 * BID = grupo com 2+ cotações compartilhando referencia_interna.
 * Cotação avulsa = linha plana (sem expandir).
 */

import type { Cotacao, StatusCotacao } from '../shared/types'

export interface LinhaBidGrupoPai {
  _tipo_linha: 'bid'
  id_linha_lista: string
  referencia_bid: string
  quantidade_cotacoes: number
  cotacoes: Cotacao[]
  numero_cotacao_bid_frete_internacional: string
  referencia_interna_cotacao_bid_frete_internacional: string
  id_organizacao: string
  id_usuario: string | null
  id_workspace: string | null
  usuarios_divergentes: boolean
  workspaces_divergentes: boolean
  quantidade_usuarios_distintos: number
  quantidade_workspaces_distintos: number
  status_cotacao_bid_frete_internacional: StatusCotacao
  data_criacao_cotacao_bid_frete_internacional: string
  data_atualizacao_cotacao_bid_frete_internacional: string
  tipo_operacao_cotacao_bid_frete_internacional: Cotacao['tipo_operacao_cotacao_bid_frete_internacional']
  modal_cotacao_bid_frete_internacional: Cotacao['modal_cotacao_bid_frete_internacional']
  modalidade_cotacao_bid_frete_internacional: Cotacao['modalidade_cotacao_bid_frete_internacional']
  origem_nome_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  ganho_valor_cotacao_bid_frete_internacional: number | null
  ganho_percentual_cotacao_bid_frete_internacional: number | null
}

function agregarCampoId(
  cotacoes: Cotacao[],
  campo: 'id_usuario' | 'id_workspace',
): { valor: string | null; divergente: boolean; quantidade: number } {
  const valores = cotacoes
    .map(c => c[campo])
    .filter((v): v is string => typeof v === 'string' && v.length > 0)
  const unicos = new Set(valores)
  return {
    valor: unicos.size === 1 ? [...unicos][0] : null,
    divergente: unicos.size > 1,
    quantidade: unicos.size,
  }
}

export type LinhaPaiLista = Cotacao | LinhaBidGrupoPai

export function isLinhaBidGrupo(linha: LinhaPaiLista): linha is LinhaBidGrupoPai {
  return '_tipo_linha' in linha && linha._tipo_linha === 'bid'
}

const PRIORIDADE_STATUS: StatusCotacao[] = [
  'APROVADA',
  'AGUARDANDO_APROVACAO',
  'EM_COTACAO',
  'ENVIADA_FORNECEDORES',
  'FALTA_INFORMACAO',
  'RASCUNHO',
  'REPROVADA',
  'CANCELADA',
  'EXPIRADA',
]

function statusMaisAvancado(cotacoes: Cotacao[]): StatusCotacao {
  for (const status of PRIORIDADE_STATUS) {
    if (cotacoes.some(c => c.status_cotacao_bid_frete_internacional === status)) {
      return status
    }
  }
  return cotacoes[0]?.status_cotacao_bid_frete_internacional ?? 'RASCUNHO'
}

function buildLinhaBidGrupo(referencia: string, cotacoes: Cotacao[]): LinhaBidGrupoPai {
  const ordenadas = [...cotacoes].sort(
    (a, b) =>
      new Date(b.data_criacao_cotacao_bid_frete_internacional).getTime() -
      new Date(a.data_criacao_cotacao_bid_frete_internacional).getTime(),
  )
  const principal = ordenadas[0]
  const origens = new Set(cotacoes.map(c => c.origem_nome_cotacao_bid_frete_internacional))
  const destinos = new Set(cotacoes.map(c => c.destino_nome_cotacao_bid_frete_internacional))
  const ganhoTotal = cotacoes.reduce((acc, c) => acc + (c.ganho_valor_cotacao_bid_frete_internacional ?? 0), 0)
  const ganhosPct = cotacoes
    .map(c => c.ganho_percentual_cotacao_bid_frete_internacional)
    .filter((v): v is number => v != null)
  const ganhoPctMedio = ganhosPct.length > 0
    ? ganhosPct.reduce((a, b) => a + b, 0) / ganhosPct.length
    : null

  const usuarios = agregarCampoId(cotacoes, 'id_usuario')
  const workspaces = agregarCampoId(cotacoes, 'id_workspace')

  return {
    _tipo_linha: 'bid',
    id_linha_lista: `bid:${referencia}`,
    referencia_bid: referencia,
    quantidade_cotacoes: cotacoes.length,
    cotacoes: ordenadas,
    numero_cotacao_bid_frete_internacional: `BID · ${referencia}`,
    referencia_interna_cotacao_bid_frete_internacional: referencia,
    id_organizacao: principal.id_organizacao,
    id_usuario: usuarios.valor,
    id_workspace: workspaces.valor,
    usuarios_divergentes: usuarios.divergente,
    workspaces_divergentes: workspaces.divergente,
    quantidade_usuarios_distintos: usuarios.quantidade,
    quantidade_workspaces_distintos: workspaces.quantidade,
    status_cotacao_bid_frete_internacional: statusMaisAvancado(cotacoes),
    data_criacao_cotacao_bid_frete_internacional: principal.data_criacao_cotacao_bid_frete_internacional,
    data_atualizacao_cotacao_bid_frete_internacional: principal.data_atualizacao_cotacao_bid_frete_internacional,
    tipo_operacao_cotacao_bid_frete_internacional: principal.tipo_operacao_cotacao_bid_frete_internacional,
    modal_cotacao_bid_frete_internacional: principal.modal_cotacao_bid_frete_internacional,
    modalidade_cotacao_bid_frete_internacional: principal.modalidade_cotacao_bid_frete_internacional,
    origem_nome_cotacao_bid_frete_internacional: origens.size === 1 ? [...origens][0] : `${origens.size} origens`,
    destino_nome_cotacao_bid_frete_internacional: destinos.size === 1 ? [...destinos][0] : `${destinos.size} destinos`,
    ganho_valor_cotacao_bid_frete_internacional: ganhoTotal > 0 ? ganhoTotal : null,
    ganho_percentual_cotacao_bid_frete_internacional: ganhoPctMedio,
  }
}

/** Monta linhas pai: cotação avulsa ou BID agrupado por referência interna. */
export function montarLinhasPaiLista(cotacoes: Cotacao[]): LinhaPaiLista[] {
  const grupos = new Map<string, Cotacao[]>()
  const avulsas: Cotacao[] = []

  for (const cotacao of cotacoes) {
    const ref = cotacao.referencia_interna_cotacao_bid_frete_internacional?.trim()
    if (ref) {
      const lista = grupos.get(ref) ?? []
      lista.push(cotacao)
      grupos.set(ref, lista)
    } else {
      avulsas.push(cotacao)
    }
  }

  const linhas: LinhaPaiLista[] = [...avulsas]

  for (const [referencia, items] of grupos) {
    if (items.length === 1) {
      linhas.push(items[0])
    } else {
      linhas.push(buildLinhaBidGrupo(referencia, items))
    }
  }

  return linhas.sort((a, b) => {
    const da = new Date(a.data_criacao_cotacao_bid_frete_internacional).getTime()
    const db = new Date(b.data_criacao_cotacao_bid_frete_internacional).getTime()
    return db - da
  })
}

export function idLinhaPaiLista(linha: LinhaPaiLista): string {
  return isLinhaBidGrupo(linha) ? linha.id_linha_lista : linha.id_cotacao_bid_frete_internacional
}

export function cotacaoDaLinhaPai(linha: LinhaPaiLista): Cotacao | null {
  if (isLinhaBidGrupo(linha)) return null
  return linha
}

export function cotacoesFilhasDaLinha(linha: LinhaPaiLista): Cotacao[] {
  if (isLinhaBidGrupo(linha)) return linha.cotacoes
  return []
}

const STATUS_SEM_DESTAQUE_EXPIRACAO: StatusCotacao[] = [
  'EXPIRADA',
  'CANCELADA',
  'APROVADA',
  'REPROVADA',
]

/** Cotação com prazo de resposta entre agora e `horasLimite` (exclusivo de status finais). */
export function cotacaoPrestesAExpirar(
  cotacao: Cotacao,
  horasLimite: number,
  agoraMs = Date.now(),
): boolean {
  if (STATUS_SEM_DESTAQUE_EXPIRACAO.includes(cotacao.status_cotacao_bid_frete_internacional)) {
    return false
  }

  const limite = cotacao.data_limite_resposta_cotacao_bid_frete_internacional
  if (!limite) return false

  const limiteMs = new Date(limite).getTime()
  if (!Number.isFinite(limiteMs)) return false

  const restanteHoras = (limiteMs - agoraMs) / (1000 * 60 * 60)
  return restanteHoras > 0 && restanteHoras <= horasLimite
}

export function linhaPaiPrestesAExpirar(
  linha: LinhaPaiLista,
  horasLimite: number,
  agoraMs = Date.now(),
): boolean {
  if (isLinhaBidGrupo(linha)) {
    return linha.cotacoes.some(c => cotacaoPrestesAExpirar(c, horasLimite, agoraMs))
  }
  return cotacaoPrestesAExpirar(linha, horasLimite, agoraMs)
}
