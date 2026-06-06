/**
 * cadastrosApi.ts — Cliente HTTP do Pedido para o serviço Cadastros (SSOT §4.1).
 *
 * - `/api/v1/empresas/*`     — identidade 1:1 da organização (`empresaSchema`)
 * - `/api/v1/fornecedores/*` — parceiros COMEX (`fornecedorSchema`)
 * - `/api/v1/cadastros/*`    — catálogos globais (país, porto, aeroporto…)
 *
 * Mandamento 06/09: validação Zod bilateral — schemas importados do Cadastros.
 */

import { z } from 'zod'
import {
  empresaSchema,
  fornecedorSchema,
  criarFornecedorSchema,
  type Empresa,
  type Fornecedor,
} from '@cadastros/shared/schemas'
import { request, getApiContext } from './api'

export type { Empresa, Fornecedor }

const listaFornecedoresSchema = z.object({
  itens: z.array(fornecedorSchema),
  total: z.number(),
  pagina: z.number(),
  por_pagina: z.number(),
})

export type ListaFornecedores = z.infer<typeof listaFornecedoresSchema>

export interface Pais {
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

export type PapelEmpresaRapido =
  | 'importador'
  | 'exportador'
  | 'fabricante'

export interface CriarFornecedorRapidoInput {
  nome_fornecedor: string
  pais_fornecedor: string
  cnpj_fornecedor?: string | null
  tin_fornecedor?: string | null
  papel: PapelEmpresaRapido
}

function toCriarFornecedorPayload(input: CriarFornecedorRapidoInput): z.infer<typeof criarFornecedorSchema> {
  const { idOrganizacao } = getApiContext()
  const ehBr = input.pais_fornecedor === 'BR'
  return criarFornecedorSchema.parse({
    id_organizacao: idOrganizacao,
    nome_fornecedor: input.nome_fornecedor.trim(),
    pais_fornecedor: input.pais_fornecedor,
    cnpj_fornecedor: ehBr && input.cnpj_fornecedor ? input.cnpj_fornecedor.trim() : null,
    tin_fornecedor: !ehBr && input.tin_fornecedor ? input.tin_fornecedor.trim() : null,
    pode_ser_importador_fornecedor: input.papel === 'importador',
    pode_ser_exportador_fornecedor: input.papel === 'exportador',
    pode_ser_fabricante_fornecedor: input.papel === 'fabricante',
    ativo_fornecedor: true,
  })
}

async function parseJsonComSchema<T>(raw: unknown, schema: z.ZodType<T>): Promise<T> {
  return schema.parse(raw)
}

/** Parceiros elegíveis como importador na exportação (papel COMEX Importador + ativo). */
export function filtrarFornecedoresPapelImportador(itens: Fornecedor[]): Fornecedor[] {
  return itens.filter((f) => f.pode_ser_importador_fornecedor && f.ativo_fornecedor)
}

/** Parceiros elegíveis como exportador na importação (papel COMEX Exportador + ativo). */
export function filtrarFornecedoresPapelExportador(itens: Fornecedor[]): Fornecedor[] {
  return itens.filter((f) => f.pode_ser_exportador_fornecedor && f.ativo_fornecedor)
}

/** Opções do popover GTV — exportação (valor = id_fornecedor). */
export function mapearOpcoesImportadorExportacao(itens: Fornecedor[]): Array<{ valor: string; label: string }> {
  return filtrarFornecedoresPapelImportador(itens)
    .map((f) => ({
      valor: f.id_fornecedor ?? '',
      label: f.nome_fornecedor,
    }))
    .filter((o) => o.valor.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

/**
 * EXP: remove opções que coincidem com workspaces (id ou nome).
 * Evita listar "CDE EXPORTADOR" etc. no popover de importador da exportação.
 */
/** Opções do popover GTV — importação (valor = id_fornecedor). */
export function mapearOpcoesExportadorImportacao(itens: Fornecedor[]): Array<{ valor: string; label: string }> {
  return filtrarFornecedoresPapelExportador(itens)
    .map((f) => ({
      valor: f.id_fornecedor ?? '',
      label: f.nome_fornecedor,
    }))
    .filter((o) => o.valor.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'))
}

/**
 * IMP: remove opções que coincidem com workspaces (id ou nome).
 * Evita listar nomes de workspace no popover de exportador da importação.
 */
export function filtrarOpcoesExportadorImpSemWorkspaces(
  opcoesExportadores: Array<{ valor: string; label: string }>,
  workspaceOpcoes: Array<{ valor: string; label: string }>,
): Array<{ valor: string; label: string }> {
  const idsWs = new Set(workspaceOpcoes.map((o) => o.valor.trim()).filter(Boolean))
  const labelsWs = new Set(
    workspaceOpcoes.map((o) => o.label.trim().toLowerCase()).filter(Boolean),
  )
  return opcoesExportadores.filter((o) => {
    const id = o.valor.trim()
    const label = o.label.trim().toLowerCase()
    if (idsWs.has(id)) return false
    if (labelsWs.has(label)) return false
    return true
  })
}

export function filtrarOpcoesImportadorExpSemWorkspaces(
  opcoesImportadores: Array<{ valor: string; label: string }>,
  workspaceOpcoes: Array<{ valor: string; label: string }>,
): Array<{ valor: string; label: string }> {
  const idsWs = new Set(workspaceOpcoes.map((o) => o.valor.trim()).filter(Boolean))
  const labelsWs = new Set(
    workspaceOpcoes.map((o) => o.label.trim().toLowerCase()).filter(Boolean),
  )
  return opcoesImportadores.filter((o) => {
    const id = o.valor.trim()
    const label = o.label.trim().toLowerCase()
    if (idsWs.has(id)) return false
    if (labelsWs.has(label)) return false
    return true
  })
}

export const cadastrosApi = {
  /** Parceiros COMEX — lista paginada (exclui empresa-da-org no backend). */
  listarFornecedores: async (busca?: string, por_pagina = 200): Promise<ListaFornecedores> => {
    const params = new URLSearchParams({ por_pagina: String(por_pagina), escopo: 'parceiros' })
    if (busca?.trim()) params.set('busca', busca.trim())
    const raw = await request<unknown>(`/api/v1/fornecedores?${params.toString()}`)
    return parseJsonComSchema(raw, listaFornecedoresSchema)
  },

  /** Parceiros com papel Exportador (importação — contraparte estrangeira). */
  listarExportadores: async (busca?: string, por_pagina = 500): Promise<ListaFornecedores> => {
    const params = new URLSearchParams({
      por_pagina: String(por_pagina),
      escopo: 'parceiros',
      pode_ser_exportador_fornecedor: 'true',
    })
    if (busca?.trim()) params.set('busca', busca.trim())
    const raw = await request<unknown>(`/api/v1/fornecedores?${params.toString()}`)
    const parsed = await parseJsonComSchema(raw, listaFornecedoresSchema)
    const itens = filtrarFornecedoresPapelExportador(parsed.itens)
    return { ...parsed, itens, total: itens.length }
  },

  /** Parceiros com papel Importador (exportação — contraparte estrangeira). */
  listarImportadores: async (busca?: string, por_pagina = 500): Promise<ListaFornecedores> => {
    const params = new URLSearchParams({
      por_pagina: String(por_pagina),
      escopo: 'parceiros',
      pode_ser_importador_fornecedor: 'true',
    })
    if (busca?.trim()) params.set('busca', busca.trim())
    const raw = await request<unknown>(`/api/v1/fornecedores?${params.toString()}`)
    const parsed = await parseJsonComSchema(raw, listaFornecedoresSchema)
    const itens = filtrarFornecedoresPapelImportador(parsed.itens)
    return { ...parsed, itens, total: itens.length }
  },

  /** Empresa 1:1 da organização — `GET /empresas/da-organizacao`. */
  obterEmpresaDaOrganizacao: async (): Promise<Empresa> => {
    const raw = await request<unknown>('/api/v1/empresas/da-organizacao')
    return parseJsonComSchema(raw, empresaSchema)
  },

  /** Cria parceiro COMEX (cadastro rápido no modal de pedido). */
  criarFornecedor: async (input: CriarFornecedorRapidoInput): Promise<Fornecedor> => {
    const payload = toCriarFornecedorPayload(input)
    const raw = await request<unknown>('/api/v1/fornecedores', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return parseJsonComSchema(raw, fornecedorSchema)
  },

  listarPaises: (): Promise<{ itens: Pais[] }> =>
    request<{ itens: Pais[] }>('/api/v1/cadastros/paises'),

  listarPortos: (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: PortoCadastro[]; total: number }> => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.pais) search.set('pais', params.pais)
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    return request<{ itens: PortoCadastro[]; total: number }>(`/api/v1/cadastros/portos${qs ? `?${qs}` : ''}`)
  },

  listarAeroportos: (params?: { q?: string; pais?: string; limit?: number }): Promise<{ itens: AeroportoCadastro[]; total: number }> => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.pais) search.set('pais', params.pais)
    if (params?.limit) search.set('limit', String(params.limit))
    const qs = search.toString()
    return request<{ itens: AeroportoCadastro[]; total: number }>(`/api/v1/cadastros/aeroportos${qs ? `?${qs}` : ''}`)
  },
}

/** @deprecated Use `listarFornecedores`. */
export const listarEmpresas = cadastrosApi.listarFornecedores

