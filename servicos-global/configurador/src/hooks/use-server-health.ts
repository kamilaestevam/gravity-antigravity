/**
 * useServerHealth — Monitor de saúde dos servidores de desenvolvimento.
 *
 * Faz polling periódico nos endpoints /health de cada backend.
 * Quando um servidor que estava UP fica DOWN:
 *   - Toast de erro (imediato, auto-fecha em 8s)
 *   - Aviso persistente no sininho (tipo 'aviso', fica até marcar lido)
 * Quando volta a subir:
 *   - Toast de sucesso (auto-fecha em 5s)
 *   - Aviso persistente no sininho (tipo 'sistema')
 *
 * Só ativo em modo DEV (import.meta.env.DEV).
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
  { name: 'Configurador',  url: '/dev-health/configurador' },
  { name: 'Histórico',     url: '/dev-health/historico'    },
  { name: 'Pedido',        url: '/dev-health/pedido'       },
  { name: 'Cadastros',     url: '/dev-health/cadastros'    },
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
  const addAviso        = useShellStore((s) => s.addAviso)

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
            // Toast imediato
            addNotification({
              type: 'error',
              message: `${srv.name} está temporariamente indisponível`,
              duration: 8_000,
            })
            // Aviso persistente no sininho
            addAviso({
              conteudo: `${srv.name} está fora do ar. Algumas funcionalidades podem não responder até que o serviço seja restabelecido.`,
              autor: { nome: 'Monitor de Servidores' },
              tipo: 'aviso',
            })
          }

          // Transição DOWN → UP (exceto primeira verificação onde prev === undefined)
          if (prev === false && isUp) {
            // Toast imediato
            addNotification({
              type: 'success',
              message: `${srv.name} voltou a funcionar normalmente`,
              duration: 5_000,
            })
            // Aviso persistente no sininho
            addAviso({
              conteudo: `${srv.name} está disponível novamente. Você já pode utilizar todas as funcionalidades normalmente.`,
              autor: { nome: 'Monitor de Servidores' },
              tipo: 'sistema',
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
  }, [addNotification, addAviso])
}
