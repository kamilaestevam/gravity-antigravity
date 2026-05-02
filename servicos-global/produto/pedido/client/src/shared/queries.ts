/**
 * queries.ts — Hooks React Query para o produto Pedido
 *
 * Centraliza todos os fetches de dados em hooks tipados.
 * Elimina useState/useEffect manuais espalhados pelos componentes.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  pedidoApi,
  pedidoVirtualApi,
  pedidoConfigApi,
  colunasUsuarioApi,
  configRegrasApi,
} from './api'
import type { Pedido, ColunaUsuario } from './types'

// ── Chaves de query ───────────────────────────────────────────────────────────

export const QUERY_KEYS = {
  pedidos:      (params: object) => ['pedidos', params] as const,
  pedido:       (id: string)     => ['pedido', id]      as const,
  status:       ()               => ['pedido-status']   as const,
  preferencias: ()               => ['pedido-preferencias'] as const,
  colunas:      ()               => ['pedido-colunas']  as const,
  regras:       ()               => ['pedido-regras']   as const,
} as const

// ── Hooks de leitura ──────────────────────────────────────────────────────────

export interface PedidosParams {
  sort?:   string
  dir?:    'asc' | 'desc'
  limit?:  number
  page?:   number
  status?: string
  busca?:  string
  cursor?: string
}

export function usePedidos(
  params: PedidosParams,
  options?: Omit<UseQueryOptions<{ data: Pedido[]; total: number }>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: QUERY_KEYS.pedidos(params),
    queryFn: () => pedidoVirtualApi.listar(params),
    staleTime: 30_000,
    ...options,
  })
}

export function usePedido(
  id: string,
  options?: Omit<UseQueryOptions<Pedido>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: QUERY_KEYS.pedido(id),
    queryFn: () => pedidoApi.buscarPorId(id),
    enabled: !!id,
    staleTime: 60_000,
    ...options,
  })
}

export function usePedidoStatus() {
  return useQuery({
    queryKey: QUERY_KEYS.status(),
    queryFn: () => pedidoConfigApi.listarStatus(),
    staleTime: 5 * 60_000,
  })
}

export function usePedidoPreferencias() {
  return useQuery({
    queryKey: QUERY_KEYS.preferencias(),
    queryFn: () => pedidoConfigApi.getPreferenciasUsuario(),
    staleTime: 10 * 60_000,
  })
}

export function useColunasUsuario(
  options?: Omit<UseQueryOptions<ColunaUsuario[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: QUERY_KEYS.colunas(),
    queryFn: () => colunasUsuarioApi.listar(),
    staleTime: 5 * 60_000,
    ...options,
  })
}

export function useConfigRegras() {
  return useQuery({
    queryKey: QUERY_KEYS.regras(),
    queryFn: () => configRegrasApi.obter(),
    staleTime: 5 * 60_000,
  })
}

// ── Hooks de mutação ──────────────────────────────────────────────────────────

export function useUpdatePedidoCampo() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, campo, valor }: { id: string; campo: string; valor: unknown }) =>
      pedidoVirtualApi.editarCampo(id, campo, valor),
    onSuccess: (_data, { id }) => {
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.pedido(id) })
    },
  })
}

export function useCreatePedido() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dados: Partial<Pedido>) => pedidoApi.criar(dados),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })
}
