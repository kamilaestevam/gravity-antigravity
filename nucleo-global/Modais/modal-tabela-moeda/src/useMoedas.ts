/**
 * useMoedas.ts — hook React que serve a lista canônica de moedas a partir
 * do serviço Cadastros (`/api/v1/cadastros/moedas`).
 *
 * SSOT: a lista vem do banco `gravity-cadastros-*.moeda`. Antes era hardcoded
 * em três pontos do monorepo — todos eliminados nesta migração.
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Cache em memória (singleton de módulo): a primeira chamada de qualquer
 * componente dispara o fetch; chamadas seguintes retornam imediato com a
 * lista já carregada. Master-data muda raramente (ano), então sem
 * revalidação automática — invalidação manual via `invalidarCacheMoedas()`.
 *
 * **Atenção multi-tenant:** o cache é GLOBAL (compartilhado entre todas as
 * organizações da mesma sessão de browser). Hoje isso é seguro porque
 * `Moeda` é master-data sem `id_organizacao` (catálogo global, mesma lista
 * pra todo mundo). Se algum dia a entidade virar tenant-aware, refatorar
 * para `Map<idOrganizacao, Moeda[]>` ou similar.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Mandamento 06 + 09: a resposta da API é validada com Zod (`listaMoedasSchema`)
 * antes de virar estado React. Sem cast `as`, sem fallback silencioso. Se o
 * backend mudar o shape, o `parse` lança ZodError ruidoso e o consumer mostra
 * o erro — exatamente o anti-pattern que os mandamentos previnem.
 *
 * O schema aqui é uma cópia do `moedaSchema` que vive em
 * `servicos-global/cadastros/shared/schemas/moeda.schema.ts`. Não importamos
 * direto porque `nucleo-global` não pode depender de `servicos-global` (ordem
 * de camadas). A sincronia entre os dois é validada pelo teste
 * `useMoedas.test.ts` (REP-2) que confirma que ambos os schemas casam.
 */
import { useEffect, useState } from 'react'
import { z } from 'zod'

// ── Schema bilateral (espelha cadastros/shared/schemas/moeda.schema.ts) ────

const moedaCodigoRegex = /^[A-Z]{3}$/

export const moedaSchema = z.object({
  codigo_moeda: z.string().regex(moedaCodigoRegex),
  nome_moeda: z.string().min(1),
  simbolo_moeda: z.string().min(1),
  ativo_moeda: z.boolean(),
})

export const listaMoedasSchema = z.object({
  itens: z.array(moedaSchema),
  total: z.number(),
})

export type Moeda = z.infer<typeof moedaSchema>

// ── Cache singleton (ver bloco "Atenção multi-tenant" no topo) ─────────────

let cachePromise: Promise<Moeda[]> | null = null
let cacheValor: Moeda[] | null = null
let cacheErro: string | null = null

async function fetchMoedas(): Promise<Moeda[]> {
  const resp = await fetch('/api/v1/cadastros/moedas?por_pagina=500')
  if (!resp.ok) {
    throw new Error(`Falha ao carregar moedas (${resp.status})`)
  }
  const json = await resp.json()
  // Zod valida shape e tipos — qualquer divergência lança ZodError ruidoso
  // e o consumer mostra mensagem de erro (Mandamento 08, sem fallback).
  const parsed = listaMoedasSchema.parse(json)
  return parsed.itens.filter((m) => m.ativo_moeda)
}

function carregarMoedas(): Promise<Moeda[]> {
  if (cacheValor) return Promise.resolve(cacheValor)
  if (cachePromise) return cachePromise
  cachePromise = fetchMoedas()
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

export interface UseMoedasResult {
  /** Lista de moedas ativas. Vazia enquanto `loading` ou em caso de erro. */
  moedas: Moeda[]
  /** True enquanto a primeira fetch está em andamento. */
  loading: boolean
  /** Mensagem de erro (Mandamento 08 — sem fallback silencioso). */
  erro: string | null
  /** Força re-fetch (limpa cache e tenta de novo). */
  recarregar: () => Promise<void>
}

export function useMoedas(): UseMoedasResult {
  const [moedas, setMoedas] = useState<Moeda[]>(() => cacheValor ?? [])
  const [loading, setLoading] = useState<boolean>(() => cacheValor === null)
  const [erro, setErro] = useState<string | null>(() => cacheErro)

  useEffect(() => {
    let vivo = true
    if (cacheValor) {
      setMoedas(cacheValor)
      setLoading(false)
      setErro(null)
      return
    }
    setLoading(true)
    carregarMoedas()
      .then((lista) => {
        if (!vivo) return
        setMoedas(lista)
        setErro(null)
      })
      .catch((err) => {
        if (!vivo) return
        setErro(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (vivo) setLoading(false)
      })
    return () => {
      vivo = false
    }
  }, [])

  async function recarregar() {
    cachePromise = null
    cacheValor = null
    cacheErro = null
    setLoading(true)
    try {
      const lista = await carregarMoedas()
      setMoedas(lista)
      setErro(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return { moedas, loading, erro, recarregar }
}

/** Limpa o cache em memória — útil em testes ou após mutações. */
export function invalidarCacheMoedas(): void {
  cachePromise = null
  cacheValor = null
  cacheErro = null
}
