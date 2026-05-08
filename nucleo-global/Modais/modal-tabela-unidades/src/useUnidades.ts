/**
 * useUnidades.ts — hook React que serve a lista canônica de unidades de
 * medida a partir do serviço Cadastros (`/api/v1/cadastros/unidades`).
 *
 * SSOT: a lista vem do banco `gravity-cadastros-*.unidade`. Antes era
 * hardcoded em quatro pontos do monorepo — todos eliminados nesta migração
 * (espelho da migração de `Moeda` em 2026-05-08).
 *
 * ──────────────────────────────────────────────────────────────────────────
 * Cache em memória (singleton de módulo): a primeira chamada de qualquer
 * componente dispara o fetch; chamadas seguintes retornam imediato com a
 * lista já carregada. Master-data muda raramente — sem revalidação
 * automática. Invalidação manual via `invalidarCacheUnidades()`.
 *
 * **Atenção multi-tenant:** o cache é GLOBAL (compartilhado entre todas as
 * organizações da mesma sessão de browser). Hoje seguro porque `Unidade`
 * é master-data sem `id_organizacao` (catálogo global). Se algum dia a
 * entidade virar tenant-aware, refatorar para `Map<idOrganizacao, …>`.
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Mandamento 06 + 09: a resposta da API é validada com Zod
 * (`listaUnidadesSchema`) antes de virar estado React. Sem cast `as`, sem
 * fallback silencioso. Se o backend mudar o shape, o `parse` lança
 * ZodError ruidoso e o consumer mostra o erro.
 *
 * O schema aqui espelha `unidade.schema.ts` em
 * `servicos-global/cadastros/shared/schemas/`. Não importamos direto porque
 * `nucleo-global` não pode depender de `servicos-global` (ordem de camadas).
 * O teste `useUnidades.test.ts` valida que ambos os schemas casam.
 */
import { useEffect, useState } from 'react'
import { z } from 'zod'

// ── Schema bilateral (espelha cadastros/shared/schemas/unidade.schema.ts) ──

export const tipoUnidadeEnum = z.enum([
  'peso',
  'volume',
  'comprimento',
  'area',
  'contagem',
  'energia',
  'gemas',
  'agrupamento',
  'embalagem',
  'caixa',
  'quantidade', // legado — equivalente a 'contagem'
])

export const unidadeSchema = z.object({
  codigo_unidade: z.string().min(1).max(8),
  nome_unidade: z.string().min(1),
  tipo_unidade: tipoUnidadeEnum,
  ativo_unidade: z.boolean(),
})

export const listaUnidadesSchema = z.object({
  itens: z.array(unidadeSchema),
  total: z.number(),
})

export type Unidade = z.infer<typeof unidadeSchema>
export type TipoUnidade = z.infer<typeof tipoUnidadeEnum>

// ── Ordenação canônica para UX ─────────────────────────────────────────────
// Categorias ordenadas pelo uso em COMEX: peso/volume/comprimento são as
// mais comuns; embalagem/caixa têm muitas variações mas raramente são as
// primeiras escolhas. Decisão de UX: agrupar por categoria nessa ordem,
// e dentro de cada categoria, por código alfabético.
const ORDEM_CATEGORIA: Record<TipoUnidade, number> = {
  peso: 1,
  volume: 2,
  comprimento: 3,
  area: 4,
  contagem: 5,
  quantidade: 5, // legado, mesma posição
  energia: 6,
  gemas: 7,
  agrupamento: 8,
  embalagem: 9,
  caixa: 10,
}

function ordenarPorCategoria(unidades: Unidade[]): Unidade[] {
  return [...unidades].sort((a, b) => {
    const ordemA = ORDEM_CATEGORIA[a.tipo_unidade] ?? 99
    const ordemB = ORDEM_CATEGORIA[b.tipo_unidade] ?? 99
    if (ordemA !== ordemB) return ordemA - ordemB
    return a.codigo_unidade.localeCompare(b.codigo_unidade)
  })
}

// ── Cache singleton (ver bloco "Atenção multi-tenant" no topo) ─────────────

let cachePromise: Promise<Unidade[]> | null = null
let cacheValor: Unidade[] | null = null
let cacheErro: string | null = null

async function fetchUnidades(): Promise<Unidade[]> {
  const resp = await fetch('/api/v1/cadastros/unidades?por_pagina=500')
  if (!resp.ok) {
    throw new Error(`Falha ao carregar unidades (${resp.status})`)
  }
  const json = await resp.json()
  const parsed = listaUnidadesSchema.parse(json)
  const ativas = parsed.itens.filter((u) => u.ativo_unidade)
  return ordenarPorCategoria(ativas)
}

function carregarUnidades(): Promise<Unidade[]> {
  if (cacheValor) return Promise.resolve(cacheValor)
  if (cachePromise) return cachePromise
  cachePromise = fetchUnidades()
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

export interface UseUnidadesResult {
  unidades: Unidade[]
  loading: boolean
  erro: string | null
  recarregar: () => Promise<void>
}

export function useUnidades(): UseUnidadesResult {
  const [unidades, setUnidades] = useState<Unidade[]>(() => cacheValor ?? [])
  const [loading, setLoading] = useState<boolean>(() => cacheValor === null)
  const [erro, setErro] = useState<string | null>(() => cacheErro)

  useEffect(() => {
    let vivo = true
    if (cacheValor) {
      setUnidades(cacheValor)
      setLoading(false)
      setErro(null)
      return
    }
    setLoading(true)
    carregarUnidades()
      .then((lista) => {
        if (!vivo) return
        setUnidades(lista)
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
      const lista = await carregarUnidades()
      setUnidades(lista)
      setErro(null)
    } catch (err) {
      setErro(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return { unidades, loading, erro, recarregar }
}

/** Limpa o cache em memória — útil em testes ou após mutações. */
export function invalidarCacheUnidades(): void {
  cachePromise = null
  cacheValor = null
  cacheErro = null
}
