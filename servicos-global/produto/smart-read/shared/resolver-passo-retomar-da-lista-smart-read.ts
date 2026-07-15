/**
 * SSOT — passo ao abrir leitura pela Lista (status DATI + passo persistido + status fluxo).
 */
import { passoPorStatusFluxoLeituraSmartRead } from './passo-status-fluxo-leitura-smart-read.js'
import type { StatusFluxoLeituraPassoSmartRead } from './passo-status-fluxo-leitura-smart-read.js'
import {
  resolverPassoRetomarLeituraSmartRead,
  type StatusLeituraRetomarSmartRead,
} from './resolver-passo-retomar-leitura-smart-read.js'

export function resolverPassoRetomarDaListaSmartRead(entrada: {
  status_leitura: StatusLeituraRetomarSmartRead
  passo_atual_leitura?: number | null
  status_fluxo_leitura?: StatusFluxoLeituraPassoSmartRead
}): number {
  const porStatus = resolverPassoRetomarLeituraSmartRead(
    entrada.status_leitura,
    entrada.passo_atual_leitura,
  )
  const porFluxo =
    entrada.status_fluxo_leitura != null
      ? passoPorStatusFluxoLeituraSmartRead(entrada.status_fluxo_leitura)
      : porStatus
  return Math.max(porStatus, porFluxo)
}
