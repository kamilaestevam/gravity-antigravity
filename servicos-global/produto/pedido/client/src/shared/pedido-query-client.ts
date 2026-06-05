/**
 * QueryClient do Pedido — módulo leve para o shell (Configurador) envolver AppInner.
 * Evita importar App.tsx no bootstrap (puxaria Clerk, shell, rotas e quebraria a raiz).
 */
import { QueryClient } from '@tanstack/react-query'

export const pedidoQueryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: true },
  },
})
