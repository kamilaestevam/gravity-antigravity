/**
 * SSOT — campos de rota por modal e derivação do snapshot legado
 * (origem_codigo/nome, destino_codigo/nome, origem_pais, destino_pais).
 */

export type ModalRotaCotacao = 'MARITIMO' | 'AEREO' | 'RODOVIARIO'

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

export function codigoRodoviarioSnapshot(pais: string, estado: string, cidade: string): string {
  const partes = [trim(pais), trim(estado), trim(cidade)].filter(Boolean)
  return partes.join('-').replace(/\s+/g, '_').toUpperCase()
}

export function nomeRodoviarioSnapshot(cidade: string, estado: string): string {
  const c = trim(cidade)
  const e = trim(estado)
  if (c && e) return `${c}, ${e}`
  return c || e || ''
}

function rotuloPorto(codigo: string, portos: CatalogoPortoRota[]) {
  const porto = portos.find(p => p.codigo_unlocode_porto === codigo)
  const nome = porto ? `${codigo} — ${porto.nome_porto}` : codigo
  const pais = trim(porto?.codigo_pais_porto) || (codigo.length >= 2 ? codigo.slice(0, 2).toUpperCase() : '')
  return { codigo, nome, pais }
}

function rotuloAeroporto(iata: string, aeroportos: CatalogoAeroportoRota[]) {
  const aeroporto = aeroportos.find(
    a => trim(a.codigo_iata_aeroporto) === iata || a.codigo_unlocode_aeroporto === iata,
  )
  const codigo = trim(aeroporto?.codigo_iata_aeroporto) || iata
  const nome = aeroporto ? `${codigo} — ${aeroporto.nome_aeroporto}` : codigo
  const pais = trim(aeroporto?.codigo_pais_aeroporto) || (codigo.length >= 2 ? codigo.slice(0, 2).toUpperCase() : '')
  return { codigo, nome, pais }
}

function derivarOrigem(input: CamposRotaModalCotacao, ctx: ContextoCatalogoRota) {
  const modal = input.modal_cotacao_bid_frete_internacional
  const portos = ctx.portos ?? []
  const aeroportos = ctx.aeroportos ?? []

  if (modal === 'MARITIMO') {
    const codigo = trim(input.porto_origem_cotacao_bid_frete_internacional)
    if (codigo) {
      const r = rotuloPorto(codigo, portos)
      return {
        origem_codigo_cotacao_bid_frete_internacional: r.codigo,
        origem_nome_cotacao_bid_frete_internacional: r.nome,
        origem_pais_cotacao_bid_frete_internacional: r.pais,
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
        origem_pais_cotacao_bid_frete_internacional: r.pais,
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

function derivarDestino(input: CamposRotaModalCotacao, ctx: ContextoCatalogoRota) {
  const modal = input.modal_cotacao_bid_frete_internacional
  const portos = ctx.portos ?? []
  const aeroportos = ctx.aeroportos ?? []

  if (modal === 'MARITIMO') {
    const codigo = trim(input.porto_destino_cotacao_bid_frete_internacional)
    if (codigo) {
      const r = rotuloPorto(codigo, portos)
      return {
        destino_codigo_cotacao_bid_frete_internacional: r.codigo,
        destino_nome_cotacao_bid_frete_internacional: r.nome,
        destino_pais_cotacao_bid_frete_internacional: r.pais,
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
        destino_pais_cotacao_bid_frete_internacional: r.pais,
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

export function derivarSnapshotRotaCotacao(
  input: CamposRotaModalCotacao,
  ctx: ContextoCatalogoRota = {},
): SnapshotRotaDerivado {
  return { ...derivarOrigem(input, ctx), ...derivarDestino(input, ctx) }
}

export function prepararCamposRotaCotacaoPersistencia<T extends CamposRotaModalCotacao>(
  input: T,
  ctx: ContextoCatalogoRota = {},
): T & SnapshotRotaDerivado {
  const snapshot = derivarSnapshotRotaCotacao(input, ctx)
  return { ...input, ...snapshot }
}
