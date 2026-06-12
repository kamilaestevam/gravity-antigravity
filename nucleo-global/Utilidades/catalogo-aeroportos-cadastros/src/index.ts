/**
 * Catálogo completo de aeroportos (Cadastros) — cache em memória por sessão.
 * SLA: uma requisição indexada (limit alto) em vez de múltiplos round-trips.
 */

export const LIMITE_CATALOGO_AEROPORTOS_GLOBAL = 10_000
export const LIMITE_CATALOGO_AEROPORTOS_POR_PAIS = 2_000

export type AeroportoCatalogoMin = {
  codigo_iata_aeroporto?: string | null
  codigo_unlocode_aeroporto: string
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  ativo_aeroporto: boolean
}

export type ListarAeroportosCadastrosFn = (params: {
  q?: string
  pais?: string
  limit?: number
}) => Promise<{ itens: AeroportoCatalogoMin[]; total: number }>

const cache = new Map<string, Promise<AeroportoCatalogoMin[]>>()

export function carregarCatalogoAeroportosCadastros(
  listar: ListarAeroportosCadastrosFn,
  codigoPais?: string,
): Promise<AeroportoCatalogoMin[]> {
  const pais = codigoPais?.trim().toUpperCase()
  const key = pais || '__all__'
  const existente = cache.get(key)
  if (existente) return existente

  const promessa = listar({
    ...(pais ? { pais } : {}),
    limit: pais ? LIMITE_CATALOGO_AEROPORTOS_POR_PAIS : LIMITE_CATALOGO_AEROPORTOS_GLOBAL,
  }).then((resp) => {
    if (resp.total > resp.itens.length) {
      console.warn(
        `[catalogo-aeroportos] truncado key=${key}: ${resp.itens.length}/${resp.total}`,
      )
    }
    return resp.itens.filter((a) => a.ativo_aeroporto !== false)
  })

  cache.set(key, promessa)
  return promessa
}

export function limparCacheCatalogoAeroportos(): void {
  cache.clear()
}
