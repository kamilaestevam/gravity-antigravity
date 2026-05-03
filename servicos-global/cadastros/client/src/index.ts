/**
 * SDK do client @tenant/cadastros — usado por outros serviços para consumir
 * a API REST do Cadastros via header `x-internal-key`.
 *
 * Princípios:
 * - Schema Zod = contrato bilateral (Mandamento 09): validamos TODA resposta.
 * - Falha ruidoso (Mandamento 08): `parse` lança ZodError em divergência.
 * - Cache: apenas `buscarPorSuid` (Empresa/OPE) e listas inteiras de
 *   catálogos (Moeda/Unidade/NCM). Listas de Empresa NÃO são cacheadas.
 */

import { CacheTTL } from './cache.js'
import {
  empresaSchema,
  listaEmpresasSchema,
  moedaSchema,
  unidadeSchema,
  ncmSchema,
  opeSchema,
  previewImpactoSchema,
  type Empresa,
  type ListaEmpresas,
  type Moeda,
  type Unidade,
  type NCM,
  type OPE,
  type PreviewImpacto,
  type CriarEmpresaInput,
  type AtualizarEmpresaInput,
} from '../../shared/schemas/index.js'
import { z } from 'zod'

// Reexporta tudo que o consumidor pode precisar.
export * from '../../shared/schemas/index.js'
export { CacheTTL } from './cache.js'
export { derivarTipoVisual } from '../../server/src/utils/derivar-tipo-visual.js'
export type { FlagsTipoEmpresa } from '../../server/src/utils/derivar-tipo-visual.js'

export interface CadastrosClientOptions {
  baseUrl: string
  internalKey: string
  /** TTL do cache em ms. Default 5min. */
  cacheTtlMs?: number
  /** Implementação de fetch — útil pra testes. Default: globalThis.fetch. */
  fetchImpl?: typeof fetch
}

const listaMoedasSchema = z.object({ itens: z.array(moedaSchema), total: z.number() })
const listaUnidadesSchema = z.object({ itens: z.array(unidadeSchema), total: z.number() })
const listaNcmSchema = z.object({ itens: z.array(ncmSchema), total: z.number() })

export interface CadastrosClient {
  empresas: {
    listar: (params: { id_organizacao: string; pagina?: number; por_pagina?: number; busca?: string; pais?: string }) => Promise<ListaEmpresas>
    buscarPorSuid: (suid: string, id_organizacao: string) => Promise<Empresa>
    criar: (dados: CriarEmpresaInput) => Promise<Empresa>
    atualizar: (suid: string, id_organizacao: string, dados: AtualizarEmpresaInput) => Promise<Empresa>
    desativar: (suid: string, id_organizacao: string) => Promise<Empresa>
    previewImpacto: (suid: string, id_organizacao: string) => Promise<PreviewImpacto>
  }
  moedas: { listar: () => Promise<Moeda[]>; buscar: (codigo: string) => Promise<Moeda> }
  unidades: { listar: () => Promise<Unidade[]>; buscar: (codigo: string) => Promise<Unidade> }
  ncm: { listar: () => Promise<NCM[]>; buscar: (codigo: string) => Promise<NCM> }
  ope: { buscarPorSuid: (suid: string, id_organizacao: string) => Promise<OPE> }
  /** Limpa todos os caches do cliente. */
  invalidarCache: () => void
}

export function criarCadastrosClient(opts: CadastrosClientOptions): CadastrosClient {
  const baseUrl = opts.baseUrl.replace(/\/$/, '')
  const fetchFn = opts.fetchImpl ?? globalThis.fetch
  if (!fetchFn) {
    throw new Error('[cadastros-sdk] fetch não disponível — passe `fetchImpl` ou rode em Node 18+')
  }

  const cacheEmpresa = new CacheTTL<Empresa>({ ttlMs: opts.cacheTtlMs })
  const cacheOpe = new CacheTTL<OPE>({ ttlMs: opts.cacheTtlMs })
  const cacheCatalogos = new CacheTTL<unknown>({ ttlMs: opts.cacheTtlMs })

  async function chamar<T>(
    metodo: string,
    rota: string,
    schema: z.ZodType<T>,
    init: { body?: unknown; idOrganizacao?: string } = {},
  ): Promise<T> {
    const headers: Record<string, string> = {
      'x-internal-key': opts.internalKey,
      'content-type': 'application/json',
    }
    if (init.idOrganizacao) headers['x-organizacao-id'] = init.idOrganizacao

    const resposta = await fetchFn(`${baseUrl}${rota}`, {
      method: metodo,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
    const corpoTexto = await resposta.text()
    let corpoJson: unknown = null
    if (corpoTexto.length > 0) {
      try { corpoJson = JSON.parse(corpoTexto) } catch { corpoJson = null }
    }
    if (!resposta.ok) {
      const detalhe = corpoJson ?? corpoTexto
      throw new Error(`[cadastros-sdk] ${metodo} ${rota} falhou (${resposta.status}): ${JSON.stringify(detalhe)}`)
    }
    return schema.parse(corpoJson)
  }

  return {
    empresas: {
      listar: async (params) => {
        const qs = new URLSearchParams()
        qs.set('id_organizacao', params.id_organizacao)
        if (params.pagina) qs.set('pagina', String(params.pagina))
        if (params.por_pagina) qs.set('por_pagina', String(params.por_pagina))
        if (params.busca) qs.set('busca', params.busca)
        if (params.pais) qs.set('pais', params.pais)
        return chamar('GET', `/api/v1/empresas?${qs.toString()}`, listaEmpresasSchema, {
          idOrganizacao: params.id_organizacao,
        })
      },

      buscarPorSuid: async (suid, idOrganizacao) => {
        const chave = `${idOrganizacao}:${suid}`
        const cacheado = cacheEmpresa.get(chave)
        if (cacheado) return cacheado
        const empresa = await chamar('GET', `/api/v1/empresas/${encodeURIComponent(suid)}`, empresaSchema, { idOrganizacao })
        cacheEmpresa.set(chave, empresa)
        return empresa
      },

      criar: async (dados) => {
        const empresa = await chamar('POST', '/api/v1/empresas', empresaSchema, {
          body: dados,
          idOrganizacao: dados.id_organizacao,
        })
        cacheEmpresa.set(`${empresa.id_organizacao}:${empresa.suid_empresa}`, empresa)
        return empresa
      },

      atualizar: async (suid, idOrganizacao, dados) => {
        const empresa = await chamar('PUT', `/api/v1/empresas/${encodeURIComponent(suid)}`, empresaSchema, {
          body: dados,
          idOrganizacao,
        })
        cacheEmpresa.set(`${idOrganizacao}:${suid}`, empresa)
        return empresa
      },

      desativar: async (suid, idOrganizacao) => {
        const empresa = await chamar('DELETE', `/api/v1/empresas/${encodeURIComponent(suid)}`, empresaSchema, { idOrganizacao })
        cacheEmpresa.invalidate(`${idOrganizacao}:${suid}`)
        return empresa
      },

      previewImpacto: async (suid, idOrganizacao) => {
        return chamar('GET', `/api/v1/empresas/${encodeURIComponent(suid)}/preview-impacto`, previewImpactoSchema, { idOrganizacao })
      },
    },

    moedas: {
      listar: async () => {
        const cacheado = cacheCatalogos.get('moedas') as { itens: Moeda[] } | null
        if (cacheado) return cacheado.itens
        const lista = await chamar('GET', '/api/v1/cadastros/moedas', listaMoedasSchema)
        cacheCatalogos.set('moedas', lista)
        return lista.itens
      },
      buscar: async (codigo) => chamar('GET', `/api/v1/cadastros/moedas/${encodeURIComponent(codigo)}`, moedaSchema),
    },

    unidades: {
      listar: async () => {
        const cacheado = cacheCatalogos.get('unidades') as { itens: Unidade[] } | null
        if (cacheado) return cacheado.itens
        const lista = await chamar('GET', '/api/v1/cadastros/unidades', listaUnidadesSchema)
        cacheCatalogos.set('unidades', lista)
        return lista.itens
      },
      buscar: async (codigo) => chamar('GET', `/api/v1/cadastros/unidades/${encodeURIComponent(codigo)}`, unidadeSchema),
    },

    ncm: {
      listar: async () => {
        const cacheado = cacheCatalogos.get('ncm') as { itens: NCM[] } | null
        if (cacheado) return cacheado.itens
        const lista = await chamar('GET', '/api/v1/cadastros/ncm', listaNcmSchema)
        cacheCatalogos.set('ncm', lista)
        return lista.itens
      },
      buscar: async (codigo) => chamar('GET', `/api/v1/cadastros/ncm/${encodeURIComponent(codigo)}`, ncmSchema),
    },

    ope: {
      buscarPorSuid: async (suid, idOrganizacao) => {
        const chave = `${idOrganizacao}:${suid}`
        const cacheado = cacheOpe.get(chave)
        if (cacheado) return cacheado
        const ope = await chamar('GET', `/api/v1/cadastros/operacoes-comex/${encodeURIComponent(suid)}`, opeSchema, { idOrganizacao })
        cacheOpe.set(chave, ope)
        return ope
      },
    },

    invalidarCache: () => {
      cacheEmpresa.clear()
      cacheOpe.clear()
      cacheCatalogos.clear()
    },
  }
}
