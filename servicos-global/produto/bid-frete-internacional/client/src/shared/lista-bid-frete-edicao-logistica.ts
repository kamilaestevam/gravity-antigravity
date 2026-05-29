/**
 * Resolução de códigos Cadastros na edição inline da lista — paridade com wizard Nova Cotação.
 */
import type { AeroportoCadastro, PortoCadastro } from './cadastrosApi'
import type { Cotacao } from './types'

/** Código usado no select (UN/LOCODE ou IATA) — só campos persistidos em `cotacao_bid_frete_internacional`. */
export function codigoOrigemParaEdicao(cotacao: Cotacao): string {
  return cotacao.origem_codigo_cotacao_bid_frete_internacional?.trim() ?? ''
}

export function codigoDestinoParaEdicao(cotacao: Cotacao): string {
  return cotacao.destino_codigo_cotacao_bid_frete_internacional?.trim() ?? ''
}

export function patchOrigemPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  const modal = cotacao.modal_cotacao_bid_frete_internacional

  if (modal === 'AEREO') {
    const aeroporto = aeroportos.find(
      a => a.codigo_iata_aeroporto === codigo || a.codigo_unlocode_aeroporto === codigo,
    )
    const codigoPersistido = aeroporto?.codigo_iata_aeroporto?.trim() || codigo
    const nome = aeroporto
      ? `${codigoPersistido} — ${aeroporto.nome_aeroporto}`
      : codigo
    return {
      origem_codigo_cotacao_bid_frete_internacional: codigoPersistido,
      origem_nome_cotacao_bid_frete_internacional: nome,
      ...(aeroporto?.codigo_pais_aeroporto
        ? { origem_pais_cotacao_bid_frete_internacional: aeroporto.codigo_pais_aeroporto }
        : {}),
    }
  }

  const porto = portos.find(p => p.codigo_unlocode_porto === codigo)
  const nome = porto ? `${porto.codigo_unlocode_porto} — ${porto.nome_porto}` : codigo
  return {
    origem_codigo_cotacao_bid_frete_internacional: codigo,
    origem_nome_cotacao_bid_frete_internacional: nome,
    ...(porto?.codigo_pais_porto
      ? { origem_pais_cotacao_bid_frete_internacional: porto.codigo_pais_porto }
      : {}),
  }
}

export function patchDestinoPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  const modal = cotacao.modal_cotacao_bid_frete_internacional

  if (modal === 'AEREO') {
    const aeroporto = aeroportos.find(
      a => a.codigo_iata_aeroporto === codigo || a.codigo_unlocode_aeroporto === codigo,
    )
    const codigoPersistido = aeroporto?.codigo_iata_aeroporto?.trim() || codigo
    const nome = aeroporto
      ? `${codigoPersistido} — ${aeroporto.nome_aeroporto}`
      : codigo
    return {
      destino_codigo_cotacao_bid_frete_internacional: codigoPersistido,
      destino_nome_cotacao_bid_frete_internacional: nome,
      ...(aeroporto?.codigo_pais_aeroporto
        ? { destino_pais_cotacao_bid_frete_internacional: aeroporto.codigo_pais_aeroporto }
        : {}),
    }
  }

  const porto = portos.find(p => p.codigo_unlocode_porto === codigo)
  const nome = porto ? `${porto.codigo_unlocode_porto} — ${porto.nome_porto}` : codigo
  return {
    destino_codigo_cotacao_bid_frete_internacional: codigo,
    destino_nome_cotacao_bid_frete_internacional: nome,
    ...(porto?.codigo_pais_porto
      ? { destino_pais_cotacao_bid_frete_internacional: porto.codigo_pais_porto }
      : {}),
  }
}

/** Campos de localização que salvam código de cadastro (select), não texto livre. */
export const CAMPOS_LOCALIZACAO_CODIGO = new Set([
  'origem_nome_cotacao_bid_frete_internacional',
  'destino_nome_cotacao_bid_frete_internacional',
  'origem_codigo_cotacao_bid_frete_internacional',
  'destino_codigo_cotacao_bid_frete_internacional',
])

export function ehCampoLocalizacaoCodigo(campo: string): boolean {
  return CAMPOS_LOCALIZACAO_CODIGO.has(campo)
}

export function resolverPatchEdicaoLocalizacao(
  cotacao: Cotacao,
  campo: string,
  codigoSelecionado: unknown,
  portos: PortoCadastro[],
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> | null {
  const codigo = String(codigoSelecionado ?? '').trim()
  if (!ehCampoLocalizacaoCodigo(campo)) return null

  if (
    campo === 'origem_nome_cotacao_bid_frete_internacional'
    || campo === 'origem_codigo_cotacao_bid_frete_internacional'
  ) {
    return patchOrigemPorCodigoCadastro(cotacao, codigo, portos, aeroportos)
  }

  if (
    campo === 'destino_nome_cotacao_bid_frete_internacional'
    || campo === 'destino_codigo_cotacao_bid_frete_internacional'
  ) {
    return patchDestinoPorCodigoCadastro(cotacao, codigo, portos, aeroportos)
  }

  return null
}
