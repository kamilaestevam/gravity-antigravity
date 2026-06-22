/**
 * persistencia-leitura-smart-read.ts — progresso do wizard (passo + conferência).
 * Fonte primária: API → Postgres. Fallback localStorage se API indisponível.
 */

import { z } from 'zod'
import { smartReadApi } from './api'
import { LeituraSchema, type Leitura } from './schemas'

const PREFIXO_CHAVE = 'smart-read:leitura:'

const EstadoSalvoLeituraSchema = z.object({
  passo: z.number().int().min(2).max(4),
  nome: z.string(),
  leitura: LeituraSchema,
})

export type EstadoSalvoLeitura = z.infer<typeof EstadoSalvoLeituraSchema>

function chave(idLeitura: string): string {
  return `${PREFIXO_CHAVE}${idLeitura}`
}

function salvarLocal(idLeitura: string, estado: EstadoSalvoLeitura): void {
  try {
    localStorage.setItem(chave(idLeitura), JSON.stringify(estado))
  } catch {
    /* localStorage indisponível */
  }
}

function lerLocal(idLeitura: string): EstadoSalvoLeitura | null {
  try {
    const bruto = localStorage.getItem(chave(idLeitura))
    if (!bruto) return null
    const resultado = EstadoSalvoLeituraSchema.safeParse(JSON.parse(bruto))
    return resultado.success ? resultado.data : null
  } catch {
    return null
  }
}

export async function carregarProgressoLeituraSmartRead(
  idLeitura: string,
): Promise<EstadoSalvoLeitura | null> {
  try {
    const remoto = await smartReadApi.obterProgressoLeitura(idLeitura)
    if (remoto) return remoto
  } catch (erro) {
    if (import.meta.env.DEV) {
      console.warn('[smart-read][persist] GET progresso falhou — localStorage', erro)
    }
  }
  return lerLocal(idLeitura)
}

export async function persistirProgressoLeituraSmartRead(
  idLeitura: string,
  estado: EstadoSalvoLeitura,
): Promise<void> {
  try {
    await smartReadApi.salvarProgressoLeitura(idLeitura, estado)
    salvarLocal(idLeitura, estado)
    return
  } catch (erro) {
    const mensagem = erro instanceof Error ? erro.message : String(erro)
    if (import.meta.env.DEV) {
      console.error('[smart-read][persist] PATCH progresso falhou — localStorage', mensagem)
    }
  }
  salvarLocal(idLeitura, estado)
}

/** @deprecated use carregarProgressoLeituraSmartRead */
export function lerEstadoLeituraSmartRead(idLeitura: string): EstadoSalvoLeitura | null {
  return lerLocal(idLeitura)
}

/** @deprecated use persistirProgressoLeituraSmartRead */
export function salvarEstadoLeituraSmartRead(idLeitura: string, estado: EstadoSalvoLeitura): void {
  salvarLocal(idLeitura, estado)
}

export function limparEstadoLeituraSmartRead(idLeitura: string): void {
  try {
    localStorage.removeItem(chave(idLeitura))
  } catch {
    /* ignora */
  }
}

export type { Leitura }
