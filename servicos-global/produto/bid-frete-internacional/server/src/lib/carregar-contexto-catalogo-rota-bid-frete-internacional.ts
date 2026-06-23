/**
 * Catálogo Cadastros (portos + aeroportos) para derivação de snapshot de rota no server.
 */

import { fetchCadastrosJson } from './cadastros-client.js'
import type { ContextoCatalogoRota } from './rota-cotacao-bid-frete-internacional.js'

type PortoCadastros = {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
}

type AeroportoCadastros = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  ativo_aeroporto?: boolean
}

type ListaCadastros<T> = { itens: T[]; total: number }

const LIMITE_PORTOS = 500
const LIMITE_AEROPORTOS = 10_000

export async function carregarContextoCatalogoRotaBidFreteInternacional(
  idOrganizacao: string,
): Promise<ContextoCatalogoRota> {
  const [portosResp, aeroportosResp] = await Promise.all([
    fetchCadastrosJson<ListaCadastros<PortoCadastros>>(
      '/api/v1/cadastros/portos',
      { limit: String(LIMITE_PORTOS), apenas_ativos: 'true' },
      { idOrganizacao },
    ),
    fetchCadastrosJson<ListaCadastros<AeroportoCadastros>>(
      '/api/v1/cadastros/aeroportos',
      { limit: String(LIMITE_AEROPORTOS), apenas_ativos: 'true' },
      { idOrganizacao },
    ),
  ])

  return {
    portos: portosResp.itens.map((p) => ({
      codigo_unlocode_porto: p.codigo_unlocode_porto,
      nome_porto: p.nome_porto,
      codigo_pais_porto: p.codigo_pais_porto ?? null,
    })),
    aeroportos: aeroportosResp.itens
      .filter((a) => a.ativo_aeroporto !== false)
      .map((a) => ({
        codigo_unlocode_aeroporto: a.codigo_unlocode_aeroporto,
        codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? null,
        nome_aeroporto: a.nome_aeroporto,
        codigo_pais_aeroporto: a.codigo_pais_aeroporto ?? null,
      })),
  }
}
