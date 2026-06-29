import type { Server } from 'node:http'

export interface SidecarListenHandles {
  sidecarListenReady: Promise<void>
  aoSubirListen: () => void
  aoErroListen: (err: NodeJS.ErrnoException) => void
}

/** Promise resolvida no listen(); rejeitada em EADDRINUSE/outros erros quando modo sidecar. */
export function criarSidecarListenReady(
  modoSidecar: boolean,
  porta: number,
  nomeServico: string,
): SidecarListenHandles {
  if (!modoSidecar) {
    return {
      sidecarListenReady: Promise.resolve(),
      aoSubirListen: () => undefined,
      aoErroListen: () => undefined,
    }
  }

  let resolveListen: (() => void) | undefined
  let rejectListen: ((err: Error) => void) | undefined

  const sidecarListenReady = new Promise<void>((resolve, reject) => {
    resolveListen = resolve
    rejectListen = reject
  })

  return {
    sidecarListenReady,
    aoSubirListen: () => resolveListen?.(),
    aoErroListen: (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        rejectListen?.(new Error(`Porta ${porta} já em uso (EADDRINUSE)`))
        console.error(`[${nomeServico}] Porta ${porta} já em uso — sidecar indisponível`)
        return
      }
      rejectListen?.(err)
      throw err
    },
  }
}

export function registrarErroListenSidecar(
  server: Server,
  handles: SidecarListenHandles,
  modoSidecar: boolean,
  porta: number,
  nomeServico: string,
): void {
  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      if (modoSidecar) {
        handles.aoErroListen(err)
        return
      }
      console.error(`[${nomeServico}] Porta ${porta} já em uso. Execute: npm run dev:reset`)
      process.exit(1)
      return
    }
    handles.aoErroListen(err)
  })
}
