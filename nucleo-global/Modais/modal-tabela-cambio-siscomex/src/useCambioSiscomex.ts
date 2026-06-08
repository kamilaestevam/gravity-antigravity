/**
 * useCambioSiscomex — catálogo Portal Único / BACEN via Cadastros.
 * GET /api/v1/cadastros/cambio-siscomex
 */
import { useEffect, useState } from 'react'
import { z } from 'zod'

export const tipoCambioSiscomexEnum = z.enum([
  'cobertura_cambial',
  'modalidade_pagamento',
])

export const cambioSiscomexSchema = z.object({
  codigo_cambio_siscomex:    z.string().min(1),
  tipo_cambio_siscomex:        tipoCambioSiscomexEnum,
  nome_cambio_siscomex:        z.string().min(1),
  descricao_cambio_siscomex:   z.string().nullable().optional(),
  ordem_cambio_siscomex:       z.number().int(),
  ativo_cambio_siscomex:       z.boolean(),
})

export const listaCambioSiscomexSchema = z.object({
  itens: z.array(cambioSiscomexSchema),
  total: z.number(),
})

export type CambioSiscomex = z.infer<typeof cambioSiscomexSchema>
export type TipoCambioSiscomex = z.infer<typeof tipoCambioSiscomexEnum>

export interface UseCambioSiscomexResult {
  itens: CambioSiscomex[]
  coberturaCambial: CambioSiscomex[]
  modalidadePagamento: CambioSiscomex[]
  loading: boolean
  erro: string | null
}

let cachePromise: Promise<CambioSiscomex[]> | null = null
let cacheValor: CambioSiscomex[] | null = null
let cacheErro: string | null = null

async function fetchCambioSiscomex(): Promise<CambioSiscomex[]> {
  const resp = await fetch('/api/v1/cadastros/cambio-siscomex?apenas_ativos=true')
  if (!resp.ok) {
    throw new Error(`Falha ao carregar cambio-siscomex (${resp.status})`)
  }
  const json = await resp.json()
  const parsed = listaCambioSiscomexSchema.parse(json)
  return parsed.itens.sort((a, b) => {
    if (a.ordem_cambio_siscomex !== b.ordem_cambio_siscomex) {
      return a.ordem_cambio_siscomex - b.ordem_cambio_siscomex
    }
    return a.codigo_cambio_siscomex.localeCompare(b.codigo_cambio_siscomex)
  })
}

export function invalidarCacheCambioSiscomex(): void {
  cachePromise = null
  cacheValor = null
  cacheErro = null
}

/** Catálogo oficial embutido — degradacao graciosa se Cadastros offline (Mandamento 08: log, nao falha silenciosa). */
const FALLBACK_CANONICO: CambioSiscomex[] = [
  { codigo_cambio_siscomex: 'ATE_180_DIAS', tipo_cambio_siscomex: 'cobertura_cambial', nome_cambio_siscomex: 'Até 180 dias', descricao_cambio_siscomex: null, ordem_cambio_siscomex: 1, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '181_ATE_360', tipo_cambio_siscomex: 'cobertura_cambial', nome_cambio_siscomex: 'De 181 a 360 dias', descricao_cambio_siscomex: null, ordem_cambio_siscomex: 2, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: 'ACIMA_360', tipo_cambio_siscomex: 'cobertura_cambial', nome_cambio_siscomex: 'Acima de 360 dias', descricao_cambio_siscomex: null, ordem_cambio_siscomex: 3, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: 'SEM_COBERTURA', tipo_cambio_siscomex: 'cobertura_cambial', nome_cambio_siscomex: 'Sem cobertura cambial', descricao_cambio_siscomex: null, ordem_cambio_siscomex: 4, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '10', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Pagamento antecipado total ou preponderante', ordem_cambio_siscomex: 10, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '20', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Pagamento à vista total ou preponderante — carta de crédito', ordem_cambio_siscomex: 20, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '21', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Pagamento à vista total ou preponderante — outros', ordem_cambio_siscomex: 21, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '30', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: "Financiamento do fornecedor (supplier's credit) — carta de crédito", ordem_cambio_siscomex: 30, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '31', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: "Financiamento do fornecedor (supplier's credit) — outros", ordem_cambio_siscomex: 31, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '40', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: "Financiamento de banco estrangeiro ao importador (buyer's credit) — carta de crédito", ordem_cambio_siscomex: 40, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '41', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: "Financiamento de banco estrangeiro ao importador (buyer's credit) — outros", ordem_cambio_siscomex: 41, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '50', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Linha de crédito de banco estrangeiro a banco brasileiro — carta de crédito', ordem_cambio_siscomex: 50, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '51', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Linha de crédito de banco estrangeiro a banco brasileiro — outros', ordem_cambio_siscomex: 51, ativo_cambio_siscomex: true },
  { codigo_cambio_siscomex: '52', tipo_cambio_siscomex: 'modalidade_pagamento', nome_cambio_siscomex: 'Financiamento de instituição não financeira ao importador', ordem_cambio_siscomex: 52, ativo_cambio_siscomex: true },
]

export function useCambioSiscomex(): UseCambioSiscomexResult {
  const [itens, setItens] = useState<CambioSiscomex[]>(cacheValor ?? [])
  const [loading, setLoading] = useState(!cacheValor)
  const [erro, setErro] = useState<string | null>(cacheErro)

  useEffect(() => {
    if (cacheValor) {
      setItens(cacheValor)
      setLoading(false)
      setErro(cacheErro)
      return
    }

    if (!cachePromise) {
      cachePromise = fetchCambioSiscomex()
        .then((data) => {
          cacheValor = data
          cacheErro = null
          return data
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Erro ao carregar cambio-siscomex'
          console.warn('[useCambioSiscomex] Cadastros indisponível — usando catálogo canônico embutido:', msg)
          cacheValor = FALLBACK_CANONICO
          cacheErro = msg
          return FALLBACK_CANONICO
        })
    }

    cachePromise
      .then((data) => {
        setItens(data)
        setLoading(false)
        setErro(null)
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : 'Erro ao carregar cambio-siscomex'
        if (cacheValor?.length) {
          setItens(cacheValor)
          setErro(msg)
        } else {
          setItens(FALLBACK_CANONICO)
          setErro(msg)
        }
        setLoading(false)
      })
  }, [])

  const coberturaCambial = itens.filter((i) => i.tipo_cambio_siscomex === 'cobertura_cambial')
  const modalidadePagamento = itens.filter((i) => i.tipo_cambio_siscomex === 'modalidade_pagamento')

  return { itens, coberturaCambial, modalidadePagamento, loading, erro }
}
