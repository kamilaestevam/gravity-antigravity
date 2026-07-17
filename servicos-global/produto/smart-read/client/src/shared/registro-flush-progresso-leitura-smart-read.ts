/**
 * Registro module-level do progresso pendente — flush sobrevive unmount do modal
 * e troca de produto (SPA ou pagehide), independente de aberto.
 */
import {
  persistirProgressoLeituraUrgenteSmartRead,
  persistirProgressoLeituraSmartRead,
  type EstadoSalvoLeitura,
} from './persistencia-leitura-smart-read'

type PendenteFlush = { idLeitura: string; estado: EstadoSalvoLeitura }

let pendenteFlush: PendenteFlush | null = null
let listenersInstalados = false

export function definirPendenteFlushProgressoLeituraSmartRead(
  valor: PendenteFlush | null,
): void {
  pendenteFlush = valor
}

export function executarFlushProgressoLeituraSmartReadPendente(): void {
  if (!pendenteFlush) return
  persistirProgressoLeituraUrgenteSmartRead(pendenteFlush.idLeitura, pendenteFlush.estado)
  void persistirProgressoLeituraSmartRead(pendenteFlush.idLeitura, pendenteFlush.estado)
}

function instalarListenersFlushProgressoLeituraSmartRead(): void {
  if (listenersInstalados || typeof window === 'undefined') return
  listenersInstalados = true

  const flush = () => executarFlushProgressoLeituraSmartReadPendente()
  window.addEventListener('pagehide', flush)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush()
  })
}

instalarListenersFlushProgressoLeituraSmartRead()
