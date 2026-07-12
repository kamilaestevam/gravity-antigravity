/**
 * persistencia-leitura-smart-read.ts — progresso do wizard (passo + conferência).
 * Fonte primária: API → Postgres. Fallback localStorage se API indisponível.
 */

import { z } from 'zod'
import { escolherProgressoSalvoLeituraSmartRead } from '../../../shared/escolher-progresso-salvo-leitura-smart-read'
import { AnaliseRiscosCacheProgressoLeituraSchema } from '../../../shared/analise-riscos-cache-progresso-smart-read'
import type { AnaliseRiscosLeituraResponse } from '../../../shared/analise-riscos-leitura-smart-read'
import { smartReadApi } from './api'
import { LeituraSchema, type Leitura } from './schemas'
import { salvarCacheAnaliseRiscosSessaoSmartRead } from './cache-analise-riscos-sessao-smart-read'

const PREFIXO_CHAVE = 'smart-read:leitura:'

const EstadoSalvoLeituraSchema = z.object({
  passo: z.number().int().min(2).max(4),
  nome: z.string(),
  leitura: LeituraSchema,
  analise_riscos_cache: AnaliseRiscosCacheProgressoLeituraSchema.optional(),
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
  const local = lerLocal(idLeitura)
  let remoto: EstadoSalvoLeitura | null = null
  try {
    remoto = await smartReadApi.obterProgressoLeitura(idLeitura)
  } catch (erro) {
    if (import.meta.env.DEV) {
      console.warn('[smart-read][persist] GET progresso falhou — localStorage', erro)
    }
  }
  return escolherProgressoSalvoLeituraSmartRead(remoto, local)
}

export async function persistirCacheAnaliseRiscosProgressoSmartRead(
  idLeitura: string,
  chave: string,
  resposta: AnaliseRiscosLeituraResponse,
  estadoBase?: EstadoSalvoLeitura,
): Promise<void> {
  const estado = estadoBase ?? (await carregarProgressoLeituraSmartRead(idLeitura))
  if (!estado) return
  const cacheAtual = estado.analise_riscos_cache ?? {}
  await persistirProgressoLeituraSmartRead(idLeitura, {
    ...estado,
    analise_riscos_cache: { ...cacheAtual, [chave]: resposta },
  })
}

export function hidratarCacheAnaliseRiscosDeProgresso(
  estado: EstadoSalvoLeitura | null | undefined,
): void {
  if (!estado?.analise_riscos_cache) return
  for (const [chave, resposta] of Object.entries(estado.analise_riscos_cache)) {
    salvarCacheAnaliseRiscosSessaoSmartRead(chave, resposta)
  }
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
