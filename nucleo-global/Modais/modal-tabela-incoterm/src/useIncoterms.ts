/**
 * useIncoterms.ts — hook React que serve o catálogo canônico de Incoterms
 * (ICC Incoterms 2020) a partir do serviço Cadastros
 * (`GET /api/v1/cadastros/incoterms`).
 *
 * SSOT: a lista vem do banco `gravity-cadastros-*.incoterm`. Adotado como
 * SSOT em 2026-05-13, substituindo as 5 cópias hardcoded espalhadas pelo
 * produto Pedido. Espelho dos hooks `useMoedas()` e `useUnidades()`.
 *
 * Cache em memória (singleton de módulo): primeira chamada dispara o fetch;
 * seguintes retornam imediato. Master-data muda raramente (Incoterms 2020
 * é versão atual da ICC — próxima em 2030). Invalidação manual via
 * `invalidarCacheIncoterms()`.
 *
 * Multi-tenant: cache é GLOBAL (compartilhado entre organizações da mesma
 * sessão). Seguro porque Incoterm é master-data sem id_organizacao.
 *
 * Mandamento 06 + 09: a resposta da API é validada com Zod
 * (`listaIncotermsSchema`) antes de virar estado React. Schema espelha
 * `incoterm.schema.ts` em `servicos-global/cadastros/shared/schemas/`.
 * `nucleo-global` não pode depender de `servicos-global` (ordem de camadas),
 * por isso a duplicação controlada do schema.
 */
import { useEffect, useState } from 'react'
import { z } from 'zod'

// ── Schema bilateral (espelha cadastros/shared/schemas/incoterm.schema.ts) ──

export const modalTransporteEnum = z.enum([
  'maritimo',
  'qualquer',
])

export const incotermSchema = z.object({
  codigo_incoterm:    z.string().min(2).max(4),
  nome_incoterm:      z.string().min(1),
  descricao_incoterm: z.string().nullable().optional(),
  modal_transporte:   modalTransporteEnum,
  versao_incoterm:    z.string().min(4),
  ativo_incoterm:     z.boolean(),
})

export const listaIncotermsSchema = z.object({
  itens: z.array(incotermSchema),
  total: z.number(),
})

export type Incoterm = z.infer<typeof incotermSchema>
export type ModalTransporte = z.infer<typeof modalTransporteEnum>

// ── Ordenação canônica para UX ─────────────────────────────────────────────
// Marítimos primeiro (uso mais comum em COMEX brasileiro), depois multimodal.
// Dentro de cada grupo, alfabético.
const ORDEM_MODAL: Record<ModalTransporte, number> = {
  maritimo: 1,
  qualquer: 2,
}

function ordenarPorModal(incoterms: Incoterm[]): Incoterm[] {
  return [...incoterms].sort((a, b) => {
    const ordemA = ORDEM_MODAL[a.modal_transporte] ?? 99
    const ordemB = ORDEM_MODAL[b.modal_transporte] ?? 99
    if (ordemA !== ordemB) return ordemA - ordemB
    return a.codigo_incoterm.localeCompare(b.codigo_incoterm)
  })
}

// ── Cache singleton ────────────────────────────────────────────────────────

let cachePromise: Promise<Incoterm[]> | null = null
let cacheValor: Incoterm[] | null = null
let cacheErro: string | null = null

async function fetchIncoterms(): Promise<Incoterm[]> {
  const resp = await fetch('/api/v1/cadastros/incoterms?apenas_ativos=true')
  if (!resp.ok) {
    throw new Error(`Falha ao carregar incoterms (${resp.status})`)
  }
  const json = await resp.json()
  const parsed = listaIncotermsSchema.parse(json)
  return ordenarPorModal(parsed.itens)
}

function carregarIncoterms(): Promise<Incoterm[]> {
  if (cacheValor) return Promise.resolve(cacheValor)
  if (cachePromise) return cachePromise
  cachePromise = fetchIncoterms()
    .then((lista) => {
      cacheValor = lista
      cacheErro = null
      return lista
    })
    .catch((err) => {
      const msg = err instanceof Error ? err.message : String(err)
      cacheErro = msg
      cachePromise = null
      throw err
    })
  return cachePromise
}

export interface UseIncotermsResult {
  incoterms: Incoterm[]
  loading: boolean
  erro: string | null
  recarregar: () => Promise<void>
}

export function useIncoterms(): UseIncotermsResult {
  const [incoterms, setIncoterms] = useState<Incoterm[]>(() => cacheValor ?? [])
  const [loading, setLoading]     = useState<boolean>(() => cacheValor === null)
  const [erro, setErro]           = useState<string | null>(() => cacheErro)

  useEffect(() => {
    let vivo = true
    if (cacheValor) {
      setIncoterms(cacheValor)
      setLoading(false)
      setErro(null)
      return
    }
    setLoading(true)
    carregarIncoterms()
      .then((lista) => {
        if (!vivo) return
        setIncoterms(lista)
        setErro(null)
      })
      .catch((err) => {
        if (!vivo) return
        setErro(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (vivo) setLoading(false)
      })
    return () => { vivo = false }
  }, [])

  async function recarregar() {
    cachePromise = null
    cacheValor = null
    cacheErro = null
    setLoading(true)
    try {
      const lista = await carregarIncoterms()
      setIncoterms(lista)
      setErro(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return { incoterms, loading, erro, recarregar }
}

/** Limpa o cache em memória — útil em testes ou após mutações. */
export function invalidarCacheIncoterms(): void {
  cachePromise = null
  cacheValor = null
  cacheErro = null
}
