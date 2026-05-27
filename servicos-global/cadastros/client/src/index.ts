/**
 * SDK do client @tenant/cadastros — usado por outros serviços para consumir
 * a API REST do Cadastros via header `x-internal-key`.
 *
 * Princípios:
 * - Schema Zod = contrato bilateral (Mandamento 09): validamos TODA resposta.
 * - Falha ruidoso (Mandamento 08): `parse` lança ZodError em divergência.
 * - Rotas `/api/v1/fornecedores` usam fornecedorSchema (parceiros COMEX).
 * - Rotas `/api/v1/empresas` usam empresaSchema (identidade 1:1 da org — §4.1).
 */

import { CacheTTL } from './cache.js'
import {
  empresaSchema,
  fornecedorSchema,
  listaFornecedoresSchema,
  criarFornecedorSchema,
  moedaSchema,
  unidadeSchema,
  ncmSchema,
  opeSchema,
  previewImpactoSchema,
  type Empresa,
  type Fornecedor,
  type ListaFornecedores,
  type Moeda,
  type Unidade,
  type NCM,
  type OPE,
  type PreviewImpacto,
  type CriarFornecedorInput,
  type AtualizarFornecedorInput,
  type CriarEmpresaInput,
  type AtualizarEmpresaInput,
} from '../../shared/schemas/index.js'
import { z } from 'zod'

export * from '../../shared/schemas/index.js'
export { CacheTTL } from './cache.js'
export { derivarTipoVisual } from '../../server/src/utils/derivar-tipo-visual.js'
export type { FlagsTipoEmpresa } from '../../server/src/utils/derivar-tipo-visual.js'

/** @deprecated Use Fornecedor — alias legado do namespace empresas→fornecedores */
export type { Fornecedor as EmpresaLegacySdk }

export interface CadastrosClientOptions {
  baseUrl: string
  internalKey: string
  cacheTtlMs?: number
  fetchImpl?: typeof fetch
}

export interface CadastrosClient {
  /** Parceiros COMEX — GET/POST/PUT/DELETE /api/v1/fornecedores */
  fornecedores: {
    listar: (params: {
      id_organizacao: string
      pagina?: number
      por_pagina?: number
      busca?: string
      pais?: string
    }) => Promise<ListaFornecedores>
    buscarPorSuid: (suid: string, id_organizacao: string) => Promise<Fornecedor>
    criar: (dados: CriarFornecedorInput) => Promise<Fornecedor>
    atualizar: (suid: string, id_organizacao: string, dados: AtualizarFornecedorInput) => Promise<Fornecedor>
    desativar: (suid: string, id_organizacao: string) => Promise<Fornecedor>
    previewImpacto: (suid: string, id_organizacao: string) => Promise<PreviewImpacto>
    /** @deprecated Use `empresas.obterDaOrganizacao` — empresa-da-org não é fornecedor. */
    obterDaOrganizacao: (id_organizacao: string) => Promise<Empresa>
  }
  /** Identidade 1:1 da org — GET/POST /api/v1/empresas */
  empresas: {
    obterDaOrganizacao: (id_organizacao: string) => Promise<Empresa>
    criar: (dados: CriarEmpresaInput) => Promise<Empresa>
  }
  moedas: { listar: () => Promise<Moeda[]>; buscar: (codigo: string) => Promise<Moeda> }
  unidades: { listar: () => Promise<Unidade[]>; buscar: (codigo: string) => Promise<Unidade> }
  ncm: { listar: () => Promise<NCM[]>; buscar: (codigo: string) => Promise<NCM> }
  ope: { buscarPorSuid: (suid: string, id_organizacao: string) => Promise<OPE> }
  invalidarCache: () => void
}

const listaMoedasSchema = z.object({ itens: z.array(moedaSchema), total: z.number() })
const listaUnidadesSchema = z.object({ itens: z.array(unidadeSchema), total: z.number() })
const listaNcmSchema = z.object({ itens: z.array(ncmSchema), total: z.number() })

export function criarCadastrosClient(opts: CadastrosClientOptions): CadastrosClient {
  const baseUrl = opts.baseUrl.replace(/\/$/, '')
  const fetchFn = opts.fetchImpl ?? globalThis.fetch
  if (!fetchFn) {
    throw new Error('[cadastros-sdk] fetch não disponível — passe `fetchImpl` ou rode em Node 18+')
  }

  const cacheFornecedor = new CacheTTL<Fornecedor>({ ttlMs: opts.cacheTtlMs })
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
    if (init.idOrganizacao) {
      headers['x-organizacao-id'] = init.idOrganizacao
      headers['x-id-organizacao'] = init.idOrganizacao
    }

    const resposta = await fetchFn(`${baseUrl}${rota}`, {
      method: metodo,
      headers,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    })
    const corpoTexto = await resposta.text()
    let corpoJson: unknown = null
    if (corpoTexto.length > 0) {
      try {
        corpoJson = JSON.parse(corpoTexto)
      } catch {
        corpoJson = null
      }
    }
    if (!resposta.ok) {
      const detalhe = corpoJson ?? corpoTexto
      throw new Error(`[cadastros-sdk] ${metodo} ${rota} falhou (${resposta.status}): ${JSON.stringify(detalhe)}`)
    }
    return schema.parse(corpoJson)
  }

  const fornecedores = {
    listar: async (params: {
      id_organizacao: string
      pagina?: number
      por_pagina?: number
      busca?: string
      pais?: string
    }) => {
      const qs = new URLSearchParams()
      qs.set('id_organizacao', params.id_organizacao)
      if (params.pagina) qs.set('pagina', String(params.pagina))
      if (params.por_pagina) qs.set('por_pagina', String(params.por_pagina))
      if (params.busca) qs.set('busca', params.busca)
      if (params.pais) qs.set('pais', params.pais)
      return chamar('GET', `/api/v1/fornecedores?${qs.toString()}`, listaFornecedoresSchema, {
        idOrganizacao: params.id_organizacao,
      })
    },

    buscarPorSuid: async (suid: string, idOrganizacao: string) => {
      const chave = `${idOrganizacao}:${suid}`
      const cacheado = cacheFornecedor.get(chave)
      if (cacheado) return cacheado
      const fornecedor = await chamar(
        'GET',
        `/api/v1/fornecedores/${encodeURIComponent(suid)}`,
        fornecedorSchema,
        { idOrganizacao },
      )
      cacheFornecedor.set(chave, fornecedor)
      return fornecedor
    },

    criar: async (dados: CriarFornecedorInput) => {
      criarFornecedorSchema.parse(dados)
      const fornecedor = await chamar('POST', '/api/v1/fornecedores', fornecedorSchema, {
        body: dados,
        idOrganizacao: dados.id_organizacao,
      })
      cacheFornecedor.set(`${fornecedor.id_organizacao}:${fornecedor.id_fornecedor}`, fornecedor)
      return fornecedor
    },

    atualizar: async (suid: string, idOrganizacao: string, dados: AtualizarFornecedorInput) => {
      const fornecedor = await chamar(
        'PUT',
        `/api/v1/fornecedores/${encodeURIComponent(suid)}`,
        fornecedorSchema,
        { body: dados, idOrganizacao },
      )
      cacheFornecedor.set(`${idOrganizacao}:${suid}`, fornecedor)
      return fornecedor
    },

    desativar: async (suid: string, idOrganizacao: string) => {
      const fornecedor = await chamar(
        'DELETE',
        `/api/v1/fornecedores/${encodeURIComponent(suid)}`,
        fornecedorSchema,
        { idOrganizacao },
      )
      cacheFornecedor.invalidate(`${idOrganizacao}:${suid}`)
      return fornecedor
    },

    previewImpacto: async (suid: string, idOrganizacao: string) => {
      return chamar(
        'GET',
        `/api/v1/fornecedores/${encodeURIComponent(suid)}/preview-impacto`,
        previewImpactoSchema,
        { idOrganizacao },
      )
    },

  }

  async function obterEmpresaDaOrganizacaoImpl(idOrganizacao: string): Promise<Empresa> {
    const chave = `org:${idOrganizacao}`
    const cacheado = cacheEmpresa.get(chave)
    if (cacheado) return cacheado
    const empresa = await chamar('GET', '/api/v1/empresas/da-organizacao', empresaSchema, {
      idOrganizacao,
    })
    cacheEmpresa.set(chave, empresa)
    return empresa
  }

  const fornecedoresComCompat = {
    ...fornecedores,
    obterDaOrganizacao: obterEmpresaDaOrganizacaoImpl,
  }

  return {
    fornecedores: fornecedoresComCompat,
    empresas: {
      obterDaOrganizacao: obterEmpresaDaOrganizacaoImpl,
      criar: async (dados: CriarEmpresaInput) => {
        const empresa = await chamar('POST', '/api/v1/empresas', empresaSchema, {
          body: dados,
          idOrganizacao: dados.id_organizacao,
        })
        cacheEmpresa.set(`org:${empresa.id_organizacao}`, empresa)
        return empresa
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
      buscar: async (codigo) =>
        chamar('GET', `/api/v1/cadastros/unidades/${encodeURIComponent(codigo)}`, unidadeSchema),
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
        const ope = await chamar(
          'GET',
          `/api/v1/cadastros/operacoes-comex/${encodeURIComponent(suid)}`,
          opeSchema,
          { idOrganizacao },
        )
        cacheOpe.set(chave, ope)
        return ope
      },
    },
    invalidarCache: () => {
      cacheFornecedor.clear()
      cacheEmpresa.clear()
      cacheOpe.clear()
      cacheCatalogos.clear()
    },
  }
}
