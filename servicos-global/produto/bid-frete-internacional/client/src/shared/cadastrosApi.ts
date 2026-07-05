/**
 * cadastrosApi.ts — Cliente HTTP do BID Frete Internacional para Cadastros (SSOT).
 * Países, portos, aeroportos, containers e parceiros COMEX.
 */

import { z } from 'zod'
import {
  LIMITE_BUSCA_CATALOGO_LOGISTICA_BID,
  LIMITE_CATALOGO_LOGISTICA_GLOBAL_BID,
} from '../../../shared/limites-catalogo-logistica-bid-frete-internacional'
import { useShellStore, injetarHeaderOverride } from '@gravity/shell'
import {
  ehParceiroFreteInternacional,
  mapParceiroCadastrosParaFornecedorBid,
} from './map-parceiro-cadastros-fornecedor-bid'
import type { Fornecedor } from './types'
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

export interface ContainerCadastro {
  id_container: string
  tipo_container: string
  tamanho_container: string
  codigo_iso_container: string | null
  armador_dono_container: string | null
  ativo_container: boolean
}

export interface MercadoriaPerigosaCadastro {
  id_mercadoria_perigosa: string
  numero_onu_mercadoria_perigosa: string
  nome_tecnico_embarque_mercadoria_perigosa: string
  nome_ascii_mercadoria_perigosa: string
  nome_ingles_mercadoria_perigosa: string
  classe_mercadoria_perigosa: number
  divisao_mercadoria_perigosa?: string | null
  grupo_embalagem_mercadoria_perigosa?: string | null
  ativo_mercadoria_perigosa: boolean
}

export function rotuloMercadoriaPerigosaCadastro(m: MercadoriaPerigosaCadastro): string {
  const pg = m.grupo_embalagem_mercadoria_perigosa ? `, PG ${m.grupo_embalagem_mercadoria_perigosa}` : ''
  const div = m.divisao_mercadoria_perigosa ? `.${m.divisao_mercadoria_perigosa.split('.').pop()}` : ''
  return `UN ${m.numero_onu_mercadoria_perigosa} — ${m.nome_tecnico_embarque_mercadoria_perigosa} (Cl. ${m.classe_mercadoria_perigosa}${div}${pg})`
}

export type TipoTaxaOrigemDestino = 'ORIGEM' | 'DESTINO' | 'FRETE'

export interface TaxaOrigemDestinoCadastro {
  id_taxa_origem_destino: string
  nome_taxa_origem_destino: string
  descricao_taxa_origem_destino?: string | null
  tipo_taxa_origem_destino: TipoTaxaOrigemDestino
  codigo_taxa_origem_destino?: string | null
  ativo_taxa_origem_destino: boolean
  /** Presente no banco Cadastros quando a coluna existir. */
  legado_taxa_origem_destino?: boolean
}

const ROTULOS_TIPO_CONTAINER: Record<string, string> = {
  DRY: 'Dry',
  REEFER: 'Reefer',
  OPEN_TOP: 'Open Top',
  FLAT_RACK: 'Flat Rack',
  TANK: 'Tank',
  BULK: 'Bulk',
  PLATAFORMA: 'Plataforma',
}

export function rotuloContainerCadastro(container: ContainerCadastro): string {
  const tipo = ROTULOS_TIPO_CONTAINER[container.tipo_container] ?? container.tipo_container
  const partes = [tipo, container.tamanho_container].filter(Boolean)
  if (container.armador_dono_container) {
    partes.push(container.armador_dono_container)
  }
  return partes.join(' · ')
}

function headers(): Record<string, string> {
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026',
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

function resolverIdOrganizacao(): string {
  const state = useShellStore.getState()
  const live =
    state.organizacaoOverride?.idOrganizacao ??
    state.currentUser.idOrganizacao

  if (live) return live

  return (
    sessionStorage.getItem('gravity_id_organizacao') ||
    sessionStorage.getItem('gravity_tenant_id') ||
    import.meta.env.VITE_ID_ORGANIZACAO ||
    import.meta.env.VITE_DEV_TENANT_ID ||
    'org_dev_default'
  )
}

async function authHeadersCadastros(): Promise<Record<string, string>> {
  const idOrganizacao = resolverIdOrganizacao()
  const customHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-internal-key': import.meta.env.VITE_CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026',
    'x-id-organizacao': idOrganizacao,
    'x-organizacao-id': idOrganizacao,
    ...injetarHeaderOverride(),
  }

  const shellUserId = useShellStore.getState().currentUser.id
  const userId =
    shellUserId ||
    sessionStorage.getItem('gravity_id_usuario') ||
    import.meta.env.VITE_USER_ID ||
    'user_dev_default'
  customHeaders['x-id-usuario'] = userId

  try {
    const clerk = (window as unknown as { Clerk?: { session?: { getToken(): Promise<string | null> } } }).Clerk
    const token = clerk?.session ? await clerk.session.getToken() : null
    if (token) customHeaders.Authorization = `Bearer ${token}`
  } catch {
    /* sem token Clerk */
  }

  return customHeaders
}

const parceiroCadastrosSchema = z.object({
  id_fornecedor: z.string(),
  id_organizacao: z.string(),
  nome_fornecedor: z.string(),
  cnpj_fornecedor: z.string().nullable().optional(),
  pais_fornecedor: z.string(),
  cidade_fornecedor: z.string().nullable().optional(),
  email_principal_fornecedor: z.string().nullable().optional(),
  telefone_principal_fornecedor: z.string().nullable().optional(),
  whatsapp_principal_fornecedor: z.string().nullable().optional(),
  pode_ser_agente_fornecedor: z.boolean(),
  pode_ser_armador_fornecedor: z.boolean(),
  pode_ser_cia_aerea_fornecedor: z.boolean(),
  pode_ser_transportadora_rodoviaria_nacional_fornecedor: z.boolean(),
  pode_ser_transportadora_rodoviaria_internacional_fornecedor: z.boolean(),
  ativo_fornecedor: z.boolean(),
  criado_em_fornecedor: z.string().optional(),
  atualizado_em_fornecedor: z.string().optional(),
})

const listaParceirosCadastrosSchema = z.object({
  itens: z.array(parceiroCadastrosSchema),
  total: z.number(),
})

const mercadoriaPerigosaCadastroSchema = z.object({
  id_mercadoria_perigosa: z.string(),
  numero_onu_mercadoria_perigosa: z.string(),
  nome_tecnico_embarque_mercadoria_perigosa: z.string(),
  nome_ascii_mercadoria_perigosa: z.string(),
  nome_ingles_mercadoria_perigosa: z.string(),
  classe_mercadoria_perigosa: z.number(),
  divisao_mercadoria_perigosa: z.string().nullable().optional(),
  grupo_embalagem_mercadoria_perigosa: z.string().nullable().optional(),
  ativo_mercadoria_perigosa: z.boolean(),
})

const listaMercadoriasPerigosasBidSchema = z.object({
  mercadorias_perigosas: z.array(mercadoriaPerigosaCadastroSchema),
  total: z.number(),
})

const portoDadosMestreBidSchema = z.object({
  codigo: z.string().min(1),
  nome: z.string().min(1),
  pais_codigo_porto_bid_frete_internacional: z.string(),
  tipo: z.string(),
})

const listaPortosDadosMestreBidSchema = z.object({
  portos: z.array(portoDadosMestreBidSchema),
  total: z.number().optional(),
})

const aeroportoDadosMestreBidSchema = z.object({
  id_aeroporto: z.string().min(1),
  codigo_iata_aeroporto: z.string().nullable().optional(),
  nome_aeroporto: z.string().min(1),
  codigo_pais_aeroporto: z.string(),
})

const listaAeroportosDadosMestreBidSchema = z.object({
  aeroportos: z.array(aeroportoDadosMestreBidSchema),
  total: z.number().optional(),
})

async function requestCadastros<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: await authHeadersCadastros() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Fornecedores de frete internacional — mesma fonte do modal Novo Fornecedor (Cadastros). */
export async function listarParceirosFreteCadastros(): Promise<Fornecedor[]> {
  const raw = await requestCadastros<unknown>(
    '/api/v1/fornecedores?escopo=parceiros&por_pagina=200&pagina=1',
  )
  const parsed = listaParceirosCadastrosSchema.parse(raw)
  return parsed.itens
    .filter(ehParceiroFreteInternacional)
    .map(mapParceiroCadastrosParaFornecedorBid)
}

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Catálogo global via proxy BID (público — sem chave interna no browser). */
async function requestPublicDadosMestreBidFrete<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? `Erro ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const cadastrosApi = {
  listarPaises: (): Promise<{ itens: PaisCadastro[]; total: number }> =>
    request('/api/v1/cadastros/paises?apenas_ativos=true'),

  listarPortos: async (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: PortoCadastro[]; total: number }> => {
    const busca = params?.q?.trim()
    const pais = params?.pais?.trim().toUpperCase()
    const limitePadrao = busca
      ? LIMITE_BUSCA_CATALOGO_LOGISTICA_BID
      : LIMITE_CATALOGO_LOGISTICA_GLOBAL_BID
    const search = new URLSearchParams({ tipo: 'porto' })
    if (busca) search.set('q', busca)
    if (pais && pais.length === 2) search.set('pais', pais)
    search.set('limit', String(params?.limit ?? limitePadrao))
    const path = `/api/v1/bid-frete-internacional/dados-mestre/portos?${search.toString()}`
    const raw = await requestPublicDadosMestreBidFrete<unknown>(path)
    const parsed = listaPortosDadosMestreBidSchema.parse(raw)
    const itens: PortoCadastro[] = parsed.portos
      .filter((p) => p.tipo === 'porto')
      .map((p) => ({
        codigo_unlocode_porto: p.codigo,
        nome_porto: p.nome,
        codigo_pais_porto: p.pais_codigo_porto_bid_frete_internacional || null,
        ativo_porto: true,
      }))
    return { itens, total: parsed.total ?? itens.length }
  },

  listarAeroportos: async (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: AeroportoCadastro[]; total: number }> => {
    const busca = params?.q?.trim()
    const pais = params?.pais?.trim().toUpperCase()
    const limitePadrao = busca
      ? LIMITE_BUSCA_CATALOGO_LOGISTICA_BID
      : LIMITE_CATALOGO_LOGISTICA_GLOBAL_BID
    const search = new URLSearchParams()
    if (busca) search.set('q', busca)
    if (pais && pais.length === 2) search.set('pais', pais)
    search.set('limit', String(params?.limit ?? limitePadrao))
    const qs = search.toString()
    const path = `/api/v1/bid-frete-internacional/dados-mestre/aeroportos${qs ? `?${qs}` : ''}`
    const raw = await requestPublicDadosMestreBidFrete<unknown>(path)
    const parsed = listaAeroportosDadosMestreBidSchema.parse(raw)
    const itens: AeroportoCadastro[] = parsed.aeroportos.map((a) => ({
      codigo_unlocode_aeroporto: a.id_aeroporto,
      codigo_iata_aeroporto: a.codigo_iata_aeroporto ?? a.id_aeroporto,
      nome_aeroporto: a.nome_aeroporto,
      codigo_pais_aeroporto: a.codigo_pais_aeroporto || null,
      ativo_aeroporto: true,
    }))
    return { itens, total: parsed.total ?? itens.length }
  },

  listarMercadoriasPerigosas: async (
    params?: { q?: string; classe?: number; limit?: number },
  ): Promise<{ itens: MercadoriaPerigosaCadastro[]; total: number }> => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.classe != null) search.set('classe', String(params.classe))
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    const path = `/api/v1/bid-frete-internacional/dados-mestre/mercadorias-perigosas${qs ? `?${qs}` : ''}`
    const raw = await requestPublicDadosMestreBidFrete<unknown>(path)
    const parsed = listaMercadoriasPerigosasBidSchema.parse(raw)
    return { itens: parsed.mercadorias_perigosas, total: parsed.total }
  },

  listarContainers: (params?: { q?: string; limit?: number }): Promise<{ itens: ContainerCadastro[]; total: number }> => {
    const search = new URLSearchParams({ apenas_ativos: 'true' })
    if (params?.q) search.set('q', params.q)
    if (params?.limit) search.set('limit', String(params.limit))
    return request(`/api/v1/cadastros/containers?${search.toString()}`)
  },

  listarTaxasOrigemDestino: (params?: {
    q?: string
    tipo?: TipoTaxaOrigemDestino
    limit?: number
    apenas_nao_legado?: boolean
  }): Promise<{ itens: TaxaOrigemDestinoCadastro[]; total: number }> => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.tipo) search.set('tipo', params.tipo)
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    const path = `/api/v1/bid-frete-internacional/dados-mestre/taxas-origem-destino${qs ? `?${qs}` : ''}`
    return requestPublicDadosMestreBidFrete(path)
  },
}
