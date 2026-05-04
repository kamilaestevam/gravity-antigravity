/**
 * useServerHealth — Monitor de saúde dos servidores de desenvolvimento.
 *
 * Faz polling periódico nos endpoints /health de cada backend.
 * Quando um servidor que estava UP fica DOWN, dispara uma notificação
 * de erro no padrão do shell (useShellStore.addNotification).
 * Quando volta a subir, dispara notificação de sucesso.
 *
 * Só ativo em modo DEV (import.meta.env.DEV).
 * Usa useShellStore.getState() para não depender de Provider no call site.
 */
import { useEffect, useRef } from 'react'
import { useShellStore } from '@gravity/shell'

const POLL_INTERVAL_MS = 15_000 // 15 segundos
const FETCH_TIMEOUT_MS = 2_500  // timeout por request

interface ServerConfig {
  /** Nome amigável exibido na notificação */
  name: string
  /** URL relativa (passa pelo proxy Vite) */
  url: string
}

const SERVERS: ServerConfig[] = [
  { name: 'Configurador Backend',  url: '/dev-health/configurador' },
  { name: 'Histórico Backend',     url: '/dev-health/historico'    },
  { name: 'Pedido Backend',        url: '/dev-health/pedido'       },
  { name: 'Cadastros Backend',     url: '/dev-health/cadastros'    },
]

/** Retorna true se o servidor respondeu (qualquer HTTP status = UP; erro de rede = DOWN) */
async function ping(url: string): Promise<boolean> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    await fetch(url, { method: 'HEAD', signal: controller.signal })
    return true
  } catch {
    // TypeError (failed to fetch) ou AbortError (timeout) = servidor DOWN
    return false
  } finally {
    clearTimeout(timer)
  }
}

export function useServerHealth(): void {
  // Só monitora em dev — em produção não existe conceito de "servidor caiu localmente"
  if (!import.meta.env.DEV) return

  const addNotification = useShellStore((s) => s.addNotification)

  // Mapa de estado anterior: true = UP, false = DOWN, undefined = não verificado ainda
  const statusRef = useRef<Record<string, boolean | undefined>>({})

  useEffect(() => {
    let cancelled = false

    async function checkAll(): Promise<void> {
      await Promise.allSettled(
        SERVERS.map(async (srv) => {
          const isUp = await ping(srv.url)
          if (cancelled) return

          const prev = statusRef.current[srv.name]

          // Transição UP → DOWN
          if (prev === true && !isUp) {
            addNotification({
              type: 'error',
              message: `⚠️ Servidor caiu: ${srv.name}`,
              duration: 8_000,
            })
          }

          // Transição DOWN → UP (exceto na primeira verificação onde prev === undefined)
          if (prev === false && isUp) {
            addNotification({
              type: 'success',
              message: `✅ Servidor voltou: ${srv.name}`,
              duration: 5_000,
            })
          }

          statusRef.current[srv.name] = isUp
        }),
      )
    }

    // Primeira verificação após 5s (servidores ainda podem estar inicializando)
    const initialTimer = setTimeout(() => {
      void checkAll()
    }, 5_000)

    const intervalId = setInterval(() => {
      void checkAll()
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearTimeout(initialTimer)
      clearInterval(intervalId)
    }
  }, [addNotification])
}
