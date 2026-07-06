/**
 * Resolve terminal logístico (porto ou aeroporto) no Cadastros — ordem depende do modal.
 */

import { fetchCadastrosJson } from './cadastros-client.js'

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
  latitude_porto?: number | null
  longitude_porto?: number | null
}

type AeroportoCadastros = {
  codigo_unlocode_aeroporto: string
  codigo_iata_aeroporto?: string | null
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  latitude_aeroporto?: number | null
  longitude_aeroporto?: number | null
}

export type LocalCadastrosBidFreteInternacional = {
  codigo: string
  nome: string
  pais: string
  latitude: number
  longitude: number
}

export type MetadadosLocalCadastrosBidFreteInternacional = Pick<
  LocalCadastrosBidFreteInternacional,
  'codigo' | 'nome' | 'pais'
>

function metadadosPorto(
  porto: PortoCadastros,
  codigoUpper: string,
): MetadadosLocalCadastrosBidFreteInternacional {
  return {
    codigo: codigoUpper,
    nome: porto.nome_porto.trim(),
    pais: porto.codigo_pais_porto?.trim().toUpperCase() ?? '',
  }
}

function metadadosAeroporto(
  aeroporto: AeroportoCadastros,
  codigoUpper: string,
): MetadadosLocalCadastrosBidFreteInternacional {
  return {
    codigo: codigoUpper,
    nome: aeroporto.nome_aeroporto.trim(),
    pais: aeroporto.codigo_pais_aeroporto?.trim().toUpperCase() ?? '',
  }
}

function coordsPorto(porto: PortoCadastros, codigoUpper: string): LocalCadastrosBidFreteInternacional | null {
  if (
    porto.latitude_porto == null ||
    porto.longitude_porto == null ||
    !Number.isFinite(porto.latitude_porto) ||
    !Number.isFinite(porto.longitude_porto)
  ) {
    return null
  }
  return {
    codigo: codigoUpper,
    nome: porto.nome_porto.trim(),
    pais: porto.codigo_pais_porto?.trim().toUpperCase() ?? '',
    latitude: porto.latitude_porto,
    longitude: porto.longitude_porto,
  }
}

function coordsAeroporto(
  aeroporto: AeroportoCadastros,
  codigoUpper: string,
): LocalCadastrosBidFreteInternacional | null {
  if (
    aeroporto.latitude_aeroporto == null ||
    aeroporto.longitude_aeroporto == null ||
    !Number.isFinite(aeroporto.latitude_aeroporto) ||
    !Number.isFinite(aeroporto.longitude_aeroporto)
  ) {
    return null
  }
  return {
    codigo: codigoUpper,
    nome: aeroporto.nome_aeroporto.trim(),
    pais: aeroporto.codigo_pais_aeroporto?.trim().toUpperCase() ?? '',
    latitude: aeroporto.latitude_aeroporto,
    longitude: aeroporto.longitude_aeroporto,
  }
}

async function fetchPortoCadastros(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<PortoCadastros | null> {
  try {
    return await fetchCadastrosJson<PortoCadastros>(
      `/api/v1/cadastros/portos/${encodeURIComponent(codigoUpper)}`,
      { apenas_ativos: 'true' },
      { idOrganizacao },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/Cadastros 404/.test(msg)) {
      return null
    }
    console.warn('[bid-frete/resolver-local-cadastros] falha ao buscar porto no Cadastros', {
      codigo: codigoUpper,
      err: msg.slice(0, 300),
    })
    return null
  }
}

async function fetchAeroportoCadastros(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<AeroportoCadastros | null> {
  try {
    return await fetchCadastrosJson<AeroportoCadastros>(
      `/api/v1/cadastros/aeroportos/${encodeURIComponent(codigoUpper)}`,
      { apenas_ativos: 'true' },
      { idOrganizacao },
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (/Cadastros 404/.test(msg)) {
      return null
    }
    console.warn('[bid-frete/resolver-local-cadastros] falha ao buscar aeroporto no Cadastros', {
      codigo: codigoUpper,
      err: msg.slice(0, 300),
    })
    return null
  }
}

async function buscarPorto(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<LocalCadastrosBidFreteInternacional | null> {
  const porto = await fetchPortoCadastros(codigoUpper, idOrganizacao)
  if (!porto) return null
  return coordsPorto(porto, codigoUpper)
}

async function buscarAeroporto(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<LocalCadastrosBidFreteInternacional | null> {
  const aeroporto = await fetchAeroportoCadastros(codigoUpper, idOrganizacao)
  if (!aeroporto) return null
  return coordsAeroporto(aeroporto, codigoUpper)
}

async function buscarMetadadosPorto(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<MetadadosLocalCadastrosBidFreteInternacional | null> {
  const porto = await fetchPortoCadastros(codigoUpper, idOrganizacao)
  if (!porto) return null
  return metadadosPorto(porto, codigoUpper)
}

async function buscarMetadadosAeroporto(
  codigoUpper: string,
  idOrganizacao?: string,
): Promise<MetadadosLocalCadastrosBidFreteInternacional | null> {
  const aeroporto = await fetchAeroportoCadastros(codigoUpper, idOrganizacao)
  if (!aeroporto) return null
  return metadadosAeroporto(aeroporto, codigoUpper)
}

export async function resolverMetadadosLocalCadastrosBidFreteInternacional(
  codigo: string,
  opcoes?: {
    id_organizacao?: string
    modal?: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  },
): Promise<MetadadosLocalCadastrosBidFreteInternacional | null> {
  const codigoUpper = codigo.trim().toUpperCase()
  if (!codigoUpper) return null

  const idOrganizacao = opcoes?.id_organizacao
  const modal = opcoes?.modal ?? 'MARITIMO'

  if (modal === 'AEREO') {
    return (
      (await buscarMetadadosAeroporto(codigoUpper, idOrganizacao))
      ?? (await buscarMetadadosPorto(codigoUpper, idOrganizacao))
    )
  }

  return (
    (await buscarMetadadosPorto(codigoUpper, idOrganizacao))
    ?? (await buscarMetadadosAeroporto(codigoUpper, idOrganizacao))
  )
}

/** Resolve terminal com coordenadas — exige lat/long no Cadastros (mapa). */
export async function resolverLocalCadastrosBidFreteInternacional(
  codigo: string,
  opcoes?: {
    id_organizacao?: string
    modal?: 'MARITIMO' | 'AEREO' | 'RODOVIARIO'
  },
): Promise<LocalCadastrosBidFreteInternacional | null> {
  const codigoUpper = codigo.trim().toUpperCase()
  if (!codigoUpper) return null

  const idOrganizacao = opcoes?.id_organizacao
  const modal = opcoes?.modal ?? 'MARITIMO'

  if (modal === 'AEREO') {
    return (await buscarAeroporto(codigoUpper, idOrganizacao)) ?? (await buscarPorto(codigoUpper, idOrganizacao))
  }

  return (await buscarPorto(codigoUpper, idOrganizacao)) ?? (await buscarAeroporto(codigoUpper, idOrganizacao))
}
