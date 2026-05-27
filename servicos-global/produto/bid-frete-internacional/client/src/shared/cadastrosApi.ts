/**
 * cadastrosApi.ts — Cliente HTTP do BID Frete Internacional para Cadastros (SSOT).
 * Países e portos: /api/v1/cadastros/*
 */

export interface PaisCadastro {
  id_pais: string
  codigo_pais_iso_alpha2: string
  codigo_pais_iso_alpha3: string
  nome_pais_portugues: string
  nome_pais_ingles: string
  ativo_pais: boolean
}

export interface PortoCadastro {
  codigo_unlocode_porto: string
  nome_porto: string
  codigo_pais_porto?: string | null
  ativo_porto: boolean
}

export interface AeroportoCadastro {
  codigo_unlocode_aeroporto: string
  codigo_iata_aeroporto?: string | null
  nome_aeroporto: string
  codigo_pais_aeroporto?: string | null
  ativo_aeroporto: boolean
}

function headers(): Record<string, string> {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'dev-key',
  }

  const orgId =
    sessionStorage.getItem('gravity_tenant_id') ||
    sessionStorage.getItem('gravity_company_id') ||
    sessionStorage.getItem('gravity_id_organizacao') ||
    import.meta.env.VITE_TENANT_ID ||
    import.meta.env.VITE_DEV_TENANT_ID ||
    'org_dev_default'

  const userId =
    sessionStorage.getItem('gravity_id_usuario') ||
    import.meta.env.VITE_USER_ID ||
    'user_dev_default'

  customHeaders['x-id-organizacao'] = orgId
  customHeaders['x-id-usuario'] = userId

  return customHeaders
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const cadastrosApi = {
  listarPaises: (): Promise<{ itens: PaisCadastro[]; total: number }> =>
    request('/api/v1/cadastros/paises?apenas_ativos=true'),

  listarPortos: (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: PortoCadastro[]; total: number }> => {
    const search = new URLSearchParams({ apenas_ativos: 'true' })
    if (params?.q) search.set('q', params.q)
    if (params?.pais) search.set('pais', params.pais)
    if (params?.limit) search.set('limit', String(params.limit))
    return request(`/api/v1/cadastros/portos?${search.toString()}`)
  },

  listarAeroportos: (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: AeroportoCadastro[]; total: number }> => {
    const search = new URLSearchParams({ apenas_ativos: 'true' })
    if (params?.q) search.set('q', params.q)
    if (params?.pais) search.set('pais', params.pais)
    if (params?.limit) search.set('limit', String(params.limit))
    return request(`/api/v1/cadastros/aeroportos?${search.toString()}`)
  },
}
