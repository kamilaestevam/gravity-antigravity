/**
 * Resolução de códigos Cadastros na edição inline da lista — paridade com wizard Nova Cotação.
 */
import type { AeroportoCadastro, PortoCadastro } from './cadastrosApi'
import type { Cotacao } from './types'
import {
  codigoAeroportoDestinoParaEdicao,
  codigoAeroportoOrigemParaEdicao,
  codigoPortoDestinoParaEdicao,
  codigoPortoOrigemParaEdicao,
  derivarSnapshotRotaCotacao,
  prepararCamposRotaCotacaoPersistencia,
} from './rota-cotacao-bid-frete-internacional'

export {
  codigoAeroportoDestinoParaEdicao,
  codigoAeroportoOrigemParaEdicao,
  codigoPortoDestinoParaEdicao,
  codigoPortoOrigemParaEdicao,
  derivarSnapshotRotaCotacao,
}

export function codigoOrigemParaEdicao(cotacao: Cotacao): string {
  const modal = cotacao.modal_cotacao_bid_frete_internacional
  if (modal === 'MARITIMO') return codigoPortoOrigemParaEdicao(cotacao)
  if (modal === 'AEREO') return codigoAeroportoOrigemParaEdicao(cotacao)
  return cotacao.pais_origem_rodoviario_cotacao_bid_frete_internacional?.trim() ?? ''
}

export function codigoDestinoParaEdicao(cotacao: Cotacao): string {
  const modal = cotacao.modal_cotacao_bid_frete_internacional
  if (modal === 'MARITIMO') return codigoPortoDestinoParaEdicao(cotacao)
  if (modal === 'AEREO') return codigoAeroportoDestinoParaEdicao(cotacao)
  return cotacao.pais_destino_rodoviario_cotacao_bid_frete_internacional?.trim() ?? ''
}

export function patchPortoOrigemPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
): Partial<Cotacao> {
  return prepararCamposRotaCotacaoPersistencia(
    {
      ...cotacao,
      porto_origem_cotacao_bid_frete_internacional: codigo,
    },
    { portos },
  )
}

export function patchPortoDestinoPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
): Partial<Cotacao> {
  return prepararCamposRotaCotacaoPersistencia(
    {
      ...cotacao,
      porto_destino_cotacao_bid_frete_internacional: codigo,
    },
    { portos },
  )
}

export function patchAeroportoOrigemPorCodigoCadastro(
  cotacao: Cotacao,
  iata: string,
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  return prepararCamposRotaCotacaoPersistencia(
    {
      ...cotacao,
      aeroporto_origem_cotacao_bid_frete_internacional: iata,
    },
    { aeroportos },
  )
}

export function patchAeroportoDestinoPorCodigoCadastro(
  cotacao: Cotacao,
  iata: string,
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  return prepararCamposRotaCotacaoPersistencia(
    {
      ...cotacao,
      aeroporto_destino_cotacao_bid_frete_internacional: iata,
    },
    { aeroportos },
  )
}

/** @deprecated use patchPortoOrigemPorCodigoCadastro / patchAeroportoOrigemPorCodigoCadastro */
export function patchOrigemPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  const modal = cotacao.modal_cotacao_bid_frete_internacional
  if (modal === 'AEREO') return patchAeroportoOrigemPorCodigoCadastro(cotacao, codigo, aeroportos)
  return patchPortoOrigemPorCodigoCadastro(cotacao, codigo, portos)
}

/** @deprecated use patchPortoDestinoPorCodigoCadastro / patchAeroportoDestinoPorCodigoCadastro */
export function patchDestinoPorCodigoCadastro(
  cotacao: Cotacao,
  codigo: string,
  portos: PortoCadastro[],
  aeroportos: AeroportoCadastro[],
): Partial<Cotacao> {
  const modal = cotacao.modal_cotacao_bid_frete_internacional
  if (modal === 'AEREO') return patchAeroportoDestinoPorCodigoCadastro(cotacao, codigo, aeroportos)
  return patchPortoDestinoPorCodigoCadastro(cotacao, codigo, portos)
}

export const CAMPOS_LOCALIZACAO_CODIGO = new Set([
  'porto_origem_cotacao_bid_frete_internacional',
  'porto_destino_cotacao_bid_frete_internacional',
  'aeroporto_origem_cotacao_bid_frete_internacional',
  'aeroporto_destino_cotacao_bid_frete_internacional',
  'pais_origem_rodoviario_cotacao_bid_frete_internacional',
  'pais_destino_rodoviario_cotacao_bid_frete_internacional',
  'estado_provincia_origem_rodoviario_cotacao_bid_frete_internacional',
  'estado_provincia_destino_rodoviario_cotacao_bid_frete_internacional',
  'cidade_origem_rodoviario_cotacao_bid_frete_internacional',
  'cidade_destino_rodoviario_cotacao_bid_frete_internacional',
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

  const parcial: Partial<Cotacao> = { [campo]: codigo || null }

  if (campo.startsWith('pais_') || campo.startsWith('estado_') || campo.startsWith('cidade_')) {
    return prepararCamposRotaCotacaoPersistencia({ ...cotacao, ...parcial })
  }

  if (
    campo === 'porto_origem_cotacao_bid_frete_internacional'
    || campo === 'aeroporto_origem_cotacao_bid_frete_internacional'
  ) {
    return cotacao.modal_cotacao_bid_frete_internacional === 'AEREO'
      ? patchAeroportoOrigemPorCodigoCadastro(cotacao, codigo, aeroportos)
      : patchPortoOrigemPorCodigoCadastro(cotacao, codigo, portos)
  }

  if (
    campo === 'porto_destino_cotacao_bid_frete_internacional'
    || campo === 'aeroporto_destino_cotacao_bid_frete_internacional'
  ) {
    return cotacao.modal_cotacao_bid_frete_internacional === 'AEREO'
      ? patchAeroportoDestinoPorCodigoCadastro(cotacao, codigo, aeroportos)
      : patchPortoDestinoPorCodigoCadastro(cotacao, codigo, portos)
  }

  return null
}

export function rotuloOrigemExibicaoLista(cotacao: Cotacao): string {
  const snapshot = derivarSnapshotRotaCotacao(cotacao)
  return snapshot.origem_nome_cotacao_bid_frete_internacional
}

export function rotuloDestinoExibicaoLista(cotacao: Cotacao): string {
  const snapshot = derivarSnapshotRotaCotacao(cotacao)
  return snapshot.destino_nome_cotacao_bid_frete_internacional
}
