/**
 * Utilitários da lista — hierarquia BID (pai) → cotações (filhas) | avulsa → propostas.
 * BID = entidade bid_frete_internacional com N cotações vinculadas via id_bid.
 * Cotação avulsa = id_bid null; expandir mostra propostas.
 */

import type { BidFreteInternacional, Cotacao, PropostaBidFreteInternacional, StatusBid, StatusCotacao } from '../shared/types'

export interface LinhaBidGrupoPai {
  _tipo_linha: 'bid'
  id_linha_lista: string
  id_bid_bid_frete_internacional: string
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
  status_bid_bid_frete_internacional: StatusBid
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

export type LinhaPaiLista = Cotacao | LinhaBidGrupoPai
export type LinhaFilhaLista = Cotacao | PropostaBidFreteInternacional

export function isLinhaBidGrupo(linha: LinhaPaiLista): linha is LinhaBidGrupoPai {
  return '_tipo_linha' in linha && linha._tipo_linha === 'bid'
}

export function isLinhaProposta(filha: LinhaFilhaLista): filha is PropostaBidFreteInternacional {
  return 'id_proposta_bid_frete_internacional' in filha
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

function buildLinhaBidGrupo(bid: BidFreteInternacional): LinhaBidGrupoPai {
  const cotacoes = [...(bid.cotacoes ?? [])].sort(
    (a, b) =>
      new Date(b.data_criacao_cotacao_bid_frete_internacional).getTime() -
      new Date(a.data_criacao_cotacao_bid_frete_internacional).getTime(),
  )
  const principal = cotacoes[0]
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
  const ref = bid.referencia_interna_bid_bid_frete_internacional?.trim() || bid.numero_bid_bid_frete_internacional

  return {
    _tipo_linha: 'bid',
    id_linha_lista: `bid:${bid.id_bid_bid_frete_internacional}`,
    id_bid_bid_frete_internacional: bid.id_bid_bid_frete_internacional,
    referencia_bid: ref,
    quantidade_cotacoes: cotacoes.length,
    cotacoes,
    numero_cotacao_bid_frete_internacional: bid.numero_bid_bid_frete_internacional,
    referencia_interna_cotacao_bid_frete_internacional: ref,
    id_organizacao: bid.id_organizacao,
    id_usuario: usuarios.valor ?? bid.id_usuario,
    id_workspace: workspaces.valor ?? bid.id_workspace ?? null,
    usuarios_divergentes: usuarios.divergente,
    workspaces_divergentes: workspaces.divergente,
    quantidade_usuarios_distintos: usuarios.quantidade,
    quantidade_workspaces_distintos: workspaces.quantidade,
    status_cotacao_bid_frete_internacional: statusMaisAvancado(cotacoes),
    status_bid_bid_frete_internacional: bid.status_bid_bid_frete_internacional,
    data_criacao_cotacao_bid_frete_internacional: principal?.data_criacao_cotacao_bid_frete_internacional ?? bid.data_criacao_bid_bid_frete_internacional,
    data_atualizacao_cotacao_bid_frete_internacional: principal?.data_atualizacao_cotacao_bid_frete_internacional ?? bid.data_atualizacao_bid_bid_frete_internacional,
    tipo_operacao_cotacao_bid_frete_internacional: principal?.tipo_operacao_cotacao_bid_frete_internacional ?? 'IMPORTACAO',
    modal_cotacao_bid_frete_internacional: principal?.modal_cotacao_bid_frete_internacional ?? 'MARITIMO',
    modalidade_cotacao_bid_frete_internacional: principal?.modalidade_cotacao_bid_frete_internacional ?? 'FCL',
    origem_nome_cotacao_bid_frete_internacional: origens.size === 1 ? [...origens][0] : `${origens.size} origens`,
    destino_nome_cotacao_bid_frete_internacional: destinos.size === 1 ? [...destinos][0] : `${destinos.size} destinos`,
    ganho_valor_cotacao_bid_frete_internacional: ganhoTotal > 0 ? ganhoTotal : null,
    ganho_percentual_cotacao_bid_frete_internacional: ganhoPctMedio,
  }
}

function ordenarLinhasPaiPorDataCriacao(linhas: LinhaPaiLista[]): LinhaPaiLista[] {
  return [...linhas].sort((a, b) => {
    const da = new Date(a.data_criacao_cotacao_bid_frete_internacional).getTime()
    const db = new Date(b.data_criacao_cotacao_bid_frete_internacional).getTime()
    return db - da
  })
}

function idsCotacaoNasLinhasPai(linhas: LinhaPaiLista[]): Set<string> {
  const ids = new Set<string>()
  for (const linha of linhas) {
    if (isLinhaBidGrupo(linha)) {
      for (const c of linha.cotacoes) {
        ids.add(c.id_cotacao_bid_frete_internacional)
      }
    } else {
      ids.add(linha.id_cotacao_bid_frete_internacional)
    }
  }
  return ids
}

/** Monta linhas pai: BIDs da entidade + cotações avulsas (sem id_bid). */
export function montarLinhasPaiLista(
  bids: BidFreteInternacional[],
  cotacoesAvulsas: Cotacao[],
): LinhaPaiLista[] {
  const linhasBids = bids.map(buildLinhaBidGrupo)
  return ordenarLinhasPaiPorDataCriacao([...cotacoesAvulsas, ...linhasBids])
}

/**
 * Hierarquia BID + avulsas; se cotações do fetch plano não aparecerem (ex.: API de BIDs falhou),
 * inclui as faltantes como linhas planas para não deixar a tabela vazia com KPI preenchido.
 */
export function montarLinhasPaiListaComFallback(
  bids: BidFreteInternacional[],
  cotacoesAvulsas: Cotacao[],
  cotacoesPlanoFallback: Cotacao[],
): LinhaPaiLista[] {
  const hierarquia = montarLinhasPaiLista(bids, cotacoesAvulsas)
  const idsPresentes = idsCotacaoNasLinhasPai(hierarquia)
  const faltantes = cotacoesPlanoFallback.filter(
    c => !idsPresentes.has(c.id_cotacao_bid_frete_internacional),
  )
  if (faltantes.length === 0) return hierarquia
  return ordenarLinhasPaiPorDataCriacao([...hierarquia, ...faltantes])
}

export function idLinhaPaiLista(linha: LinhaPaiLista): string {
  if (isLinhaBidGrupo(linha)) return linha.id_linha_lista
  return linha.id_cotacao_bid_frete_internacional
}

export function idLinhaFilhaLista(filha: LinhaFilhaLista): string {
  if (isLinhaProposta(filha)) return filha.id_proposta_bid_frete_internacional
  return filha.id_cotacao_bid_frete_internacional
}

export function cotacaoDaLinhaPai(linha: LinhaPaiLista): Cotacao | null {
  if (isLinhaBidGrupo(linha)) return null
  return linha
}

export function cotacoesFilhasDaLinha(linha: LinhaPaiLista): Cotacao[] {
  if (isLinhaBidGrupo(linha)) return linha.cotacoes
  return []
}

export function propostasFilhasDaCotacaoAvulsa(cotacao: Cotacao): PropostaBidFreteInternacional[] {
  return cotacao.propostas_bid_frete_internacional ?? []
}

const STATUS_SEM_DESTAQUE_EXPIRACAO: StatusCotacao[] = [
  'EXPIRADA',
  'CANCELADA',
  'APROVADA',
  'REPROVADA',
]

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
