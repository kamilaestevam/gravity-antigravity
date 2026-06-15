/**
 * SSOT — campos de rota por modal e derivação do snapshot legado
 * (origem_codigo/nome, destino_codigo/nome, origem_pais, destino_pais).
 */
import {
  ehCodigoIata,
  ehCodigoUnlocode,
  paisDeCodigoUnlocode,
  resolverAeroportoNoCatalogoImportacao,
  resolverPortoNoCatalogoImportacao,
} from './resolver-cadastro-rota-importacao-bid-frete-internacional'

export type ModalRotaCotacao = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'

export { ehCodigoUnlocode, ehCodigoIata } from './resolver-cadastro-rota-importacao-bid-frete-internacional'

/** ISO alpha-2 — América Latina e Caribe (filtro Cadastros/Pais). */
export const CODIGOS_ISO_PAIS_AMERICA_LATINA = new Set([
  'AR', 'BO', 'BR', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'SV', 'GT', 'HN',
  'MX', 'NI', 'PA', 'PY', 'PE', 'PR', 'UY', 'VE', 'GY', 'SR', 'GF', 'BZ',
  'HT', 'JM', 'TT', 'BB', 'GD', 'LC', 'VC', 'AG', 'DM', 'KN', 'BS', 'AW',
  'CW', 'SX', 'BQ', 'FK', 'GS', 'VI', 'KY', 'BM', 'MS', 'TC', 'AI', 'VG',
  'GP', 'MQ', 'BL', 'MF', 'PM',
])

export interface CatalogoPortoRota {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}

export interface CatalogoAeroportoRota {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
}

export interface CamposRotaModalCotacao {
  modal_cotacao_bid_frete_internacional: ModalRotaCotacao
  porto_origem_cotacao_bid_frete_internacional?: string | null
  porto_destino_cotacao_bid_frete_internacional?: string | null
  aeroporto_origem_cotacao_bid_frete_internacional?: string | null
  aeroporto_destino_cotacao_bid_frete_internacional?: string | null
  pais_origem_rodoviario_cotacao_bid_frete_internacional?: string | null
  pais_destino_rodoviario_cotacao_bid_frete_internacional?: string | null
  estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional?: string | null
  estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional?: string | null
  cidade_origem_rodoviario_cotacao_bid_frete_internacional?: string | null
  cidade_destino_rodoviario_cotacao_bid_frete_internacional?: string | null
  origem_codigo_cotacao_bid_frete_internacional?: string | null
  origem_nome_cotacao_bid_frete_internacional?: string | null
  origem_pais_cotacao_bid_frete_internacional?: string | null
  destino_codigo_cotacao_bid_frete_internacional?: string | null
  destino_nome_cotacao_bid_frete_internacional?: string | null
  destino_pais_cotacao_bid_frete_internacional?: string | null
}

export interface SnapshotRotaDerivado {
  origem_codigo_cotacao_bid_frete_internacional: string
  origem_nome_cotacao_bid_frete_internacional: string
  origem_pais_cotacao_bid_frete_internacional: string
  destino_codigo_cotacao_bid_frete_internacional: string
  destino_nome_cotacao_bid_frete_internacional: string
  destino_pais_cotacao_bid_frete_internacional: string
}

export interface ContextoCatalogoRota {
  portos?: CatalogoPortoRota[]
  aeroportos?: CatalogoAeroportoRota[]
}

function trim(val: string | null | undefined): string {
  return (val ?? '').trim()
}

export function ehCodigoPaisAmericaLatina(codigoIso: string | null | undefined): boolean {
  const codigo = trim(codigoIso).toUpperCase()
  return codigo.length > 0 && CODIGOS_ISO_PAIS_AMERICA_LATINA.has(codigo)
}

export function codigoRodoviarioSnapshot(
  pais: string,
  estado: string,
  cidade: string,
): string {
  const partes = [trim(pais), trim(estado), trim(cidade)].filter(Boolean)
  return partes.join('-').replace(/\s+/g, '_').toUpperCase()
}

export function nomeRodoviarioSnapshot(
  cidade: string,
  estado: string,
): string {
  const c = trim(cidade)
  const e = trim(estado)
  if (c && e) return `${c}, ${e}`
  return c || e || ''
}

function rotuloPorto(
  valorBruto: string,
  portos: CatalogoPortoRota[],
): { codigo: string; nome: string; pais: string } {
  const bruto = trim(valorBruto)
  if (!bruto) return { codigo: '', nome: '', pais: '' }

  const { porto } = resolverPortoNoCatalogoImportacao(bruto, portos)
  if (porto) {
    const codigo = porto.codigo_unlocode_porto
    return {
      codigo,
      nome: `${codigo} — ${porto.nome_porto}`,
      pais: trim(porto.codigo_pais_porto) || paisDeCodigoUnlocode(codigo),
    }
  }

  const codigo = trim(valorBruto).toUpperCase()
  if (ehCodigoUnlocode(codigo)) {
    return {
      codigo,
      nome: codigo,
      pais: paisDeCodigoUnlocode(codigo),
    }
  }

  return { codigo: bruto, nome: bruto, pais: '' }
}

function rotuloAeroporto(
  valorBruto: string,
  aeroportos: CatalogoAeroportoRota[],
): { codigo: string; nome: string; pais: string } {
  const bruto = trim(valorBruto)
  if (!bruto) return { codigo: '', nome: '', pais: '' }

  const { aeroporto } = resolverAeroportoNoCatalogoImportacao(bruto, aeroportos)
  if (aeroporto) {
    const codigo = trim(aeroporto.codigo_iata_aeroporto) || aeroporto.codigo_unlocode_aeroporto
    return {
      codigo,
      nome: `${codigo} — ${aeroporto.nome_aeroporto}`,
      pais: trim(aeroporto.codigo_pais_aeroporto) || paisDeCodigoUnlocode(codigo),
    }
  }

  const codigo = trim(valorBruto).toUpperCase()
  if (ehCodigoIata(codigo) || ehCodigoUnlocode(codigo)) {
    return {
      codigo,
      nome: codigo,
      pais: paisDeCodigoUnlocode(codigo),
    }
  }

  return { codigo: bruto, nome: bruto, pais: '' }
}

function derivarOrigem(
  input: CamposRotaModalCotacao,
  ctx: ContextoCatalogoRota,
): Pick<SnapshotRotaDerivado, 'origem_codigo_cotacao_bid_frete_internacional' | 'origem_nome_cotacao_bid_frete_internacional' | 'origem_pais_cotacao_bid_frete_internacional'> {
  const modal = input.modal_cotacao_bid_frete_internacional
  const portos = ctx.portos ?? []
  const aeroportos = ctx.aeroportos ?? []
  const paisExplicito = trim(input.origem_pais_cotacao_bid_frete_internacional)

  if (modal === 'MARITIMO') {
    const codigo = trim(input.porto_origem_cotacao_bid_frete_internacional)
    if (codigo) {
      const r = rotuloPorto(codigo, portos)
      return {
        origem_codigo_cotacao_bid_frete_internacional: r.codigo,
        origem_nome_cotacao_bid_frete_internacional: r.nome,
        origem_pais_cotacao_bid_frete_internacional: r.pais || paisExplicito,
      }
    }
  }

  if (modal === 'AEREO') {
    const iata = trim(input.aeroporto_origem_cotacao_bid_frete_internacional)
    if (iata) {
      const r = rotuloAeroporto(iata, aeroportos)
      return {
        origem_codigo_cotacao_bid_frete_internacional: r.codigo,
        origem_nome_cotacao_bid_frete_internacional: r.nome,
        origem_pais_cotacao_bid_frete_internacional: r.pais || paisExplicito,
      }
    }
  }

  if (modal === 'RODOVIARIO') {
    const pais = trim(input.pais_origem_rodoviario_cotacao_bid_frete_internacional)
    const estado = trim(input.estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional)
    const cidade = trim(input.cidade_origem_rodoviario_cotacao_bid_frete_internacional)
    if (pais && cidade) {
      return {
        origem_codigo_cotacao_bid_frete_internacional: codigoRodoviarioSnapshot(pais, estado, cidade),
        origem_nome_cotacao_bid_frete_internacional: nomeRodoviarioSnapshot(cidade, estado),
        origem_pais_cotacao_bid_frete_internacional: pais,
      }
    }
  }

  return {
    origem_codigo_cotacao_bid_frete_internacional: trim(input.origem_codigo_cotacao_bid_frete_internacional),
    origem_nome_cotacao_bid_frete_internacional: trim(input.origem_nome_cotacao_bid_frete_internacional),
    origem_pais_cotacao_bid_frete_internacional: trim(input.origem_pais_cotacao_bid_frete_internacional),
  }
}

function derivarDestino(
  input: CamposRotaModalCotacao,
  ctx: ContextoCatalogoRota,
): Pick<SnapshotRotaDerivado, 'destino_codigo_cotacao_bid_frete_internacional' | 'destino_nome_cotacao_bid_frete_internacional' | 'destino_pais_cotacao_bid_frete_internacional'> {
  const modal = input.modal_cotacao_bid_frete_internacional
  const portos = ctx.portos ?? []
  const aeroportos = ctx.aeroportos ?? []
  const paisExplicito = trim(input.destino_pais_cotacao_bid_frete_internacional)

  if (modal === 'MARITIMO') {
    const codigo = trim(input.porto_destino_cotacao_bid_frete_internacional)
    if (codigo) {
      const r = rotuloPorto(codigo, portos)
      return {
        destino_codigo_cotacao_bid_frete_internacional: r.codigo,
        destino_nome_cotacao_bid_frete_internacional: r.nome,
        destino_pais_cotacao_bid_frete_internacional: r.pais || paisExplicito,
      }
    }
  }

  if (modal === 'AEREO') {
    const iata = trim(input.aeroporto_destino_cotacao_bid_frete_internacional)
    if (iata) {
      const r = rotuloAeroporto(iata, aeroportos)
      return {
        destino_codigo_cotacao_bid_frete_internacional: r.codigo,
        destino_nome_cotacao_bid_frete_internacional: r.nome,
        destino_pais_cotacao_bid_frete_internacional: r.pais || paisExplicito,
      }
    }
  }

  if (modal === 'RODOVIARIO') {
    const pais = trim(input.pais_destino_rodoviario_cotacao_bid_frete_internacional)
    const estado = trim(input.estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional)
    const cidade = trim(input.cidade_destino_rodoviario_cotacao_bid_frete_internacional)
    if (pais && cidade) {
      return {
        destino_codigo_cotacao_bid_frete_internacional: codigoRodoviarioSnapshot(pais, estado, cidade),
        destino_nome_cotacao_bid_frete_internacional: nomeRodoviarioSnapshot(cidade, estado),
        destino_pais_cotacao_bid_frete_internacional: pais,
      }
    }
  }

  return {
    destino_codigo_cotacao_bid_frete_internacional: trim(input.destino_codigo_cotacao_bid_frete_internacional),
    destino_nome_cotacao_bid_frete_internacional: trim(input.destino_nome_cotacao_bid_frete_internacional),
    destino_pais_cotacao_bid_frete_internacional: trim(input.destino_pais_cotacao_bid_frete_internacional),
  }
}

/** Deriva snapshot legado a partir dos campos explícitos por modal. */
export function derivarSnapshotRotaCotacao(
  input: CamposRotaModalCotacao,
  ctx: ContextoCatalogoRota = {},
): SnapshotRotaDerivado {
  return {
    ...derivarOrigem(input, ctx),
    ...derivarDestino(input, ctx),
  }
}

export function prepararCamposRotaCotacaoPersistencia<T extends CamposRotaModalCotacao>(
  input: T,
  ctx: ContextoCatalogoRota = {},
): T & SnapshotRotaDerivado {
  const snapshot = derivarSnapshotRotaCotacao(input, ctx)
  const modal = input.modal_cotacao_bid_frete_internacional
  const patch: Partial<CamposRotaModalCotacao> = {}

  if (modal === 'MARITIMO') {
    const rawOrigem = trim(input.porto_origem_cotacao_bid_frete_internacional)
    if (rawOrigem) {
      const codigoResolvido = snapshot.origem_codigo_cotacao_bid_frete_internacional
      if (codigoResolvido && codigoResolvido !== rawOrigem && ehCodigoUnlocode(codigoResolvido)) {
        patch.porto_origem_cotacao_bid_frete_internacional = codigoResolvido
      }
    }
    const rawDestino = trim(input.porto_destino_cotacao_bid_frete_internacional)
    if (rawDestino) {
      const codigoResolvido = snapshot.destino_codigo_cotacao_bid_frete_internacional
      if (codigoResolvido && codigoResolvido !== rawDestino && ehCodigoUnlocode(codigoResolvido)) {
        patch.porto_destino_cotacao_bid_frete_internacional = codigoResolvido
      }
    }
  }

  if (modal === 'AEREO') {
    const rawOrigem = trim(input.aeroporto_origem_cotacao_bid_frete_internacional)
    if (rawOrigem) {
      const codigoResolvido = snapshot.origem_codigo_cotacao_bid_frete_internacional
      if (codigoResolvido && codigoResolvido !== rawOrigem && (ehCodigoIata(codigoResolvido) || ehCodigoUnlocode(codigoResolvido))) {
        patch.aeroporto_origem_cotacao_bid_frete_internacional = codigoResolvido
      }
    }
    const rawDestino = trim(input.aeroporto_destino_cotacao_bid_frete_internacional)
    if (rawDestino) {
      const codigoResolvido = snapshot.destino_codigo_cotacao_bid_frete_internacional
      if (codigoResolvido && codigoResolvido !== rawDestino && (ehCodigoIata(codigoResolvido) || ehCodigoUnlocode(codigoResolvido))) {
        patch.aeroporto_destino_cotacao_bid_frete_internacional = codigoResolvido
      }
    }
  }

  return { ...input, ...patch, ...snapshot }
}

/** Campos de snapshot legado — não editáveis diretamente no front. */
export const CAMPOS_SNAPSHOT_ROTA_OCULTOS_FRONT = [
  'origem_codigo_cotacao_bid_frete_internacional',
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_codigo_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
] as const

export function codigoPortoOrigemParaEdicao(cotacao: CamposRotaModalCotacao): string {
  return trim(cotacao.porto_origem_cotacao_bid_frete_internacional)
    || (cotacao.modal_cotacao_bid_frete_internacional === 'MARITIMO'
      ? trim(cotacao.origem_codigo_cotacao_bid_frete_internacional)
      : '')
}

export function codigoPortoDestinoParaEdicao(cotacao: CamposRotaModalCotacao): string {
  return trim(cotacao.porto_destino_cotacao_bid_frete_internacional)
    || (cotacao.modal_cotacao_bid_frete_internacional === 'MARITIMO'
      ? trim(cotacao.destino_codigo_cotacao_bid_frete_internacional)
      : '')
}

export function codigoAeroportoOrigemParaEdicao(cotacao: CamposRotaModalCotacao): string {
  return trim(cotacao.aeroporto_origem_cotacao_bid_frete_internacional)
    || (cotacao.modal_cotacao_bid_frete_internacional === 'AEREO'
      ? trim(cotacao.origem_codigo_cotacao_bid_frete_internacional)
      : '')
}

export function codigoAeroportoDestinoParaEdicao(cotacao: CamposRotaModalCotacao): string {
  return trim(cotacao.aeroporto_destino_cotacao_bid_frete_internacional)
    || (cotacao.modal_cotacao_bid_frete_internacional === 'AEREO'
      ? trim(cotacao.destino_codigo_cotacao_bid_frete_internacional)
      : '')
}
