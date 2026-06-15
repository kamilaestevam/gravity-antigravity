/**
 * QueryClient do BID Frete Internacional — paridade pedido-query-client.ts
 */
import { QueryClient } from '@tanstack/react-query'

export const bidFreteQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: true },
  },
})
