/**
 * persistencia-leitura-smart-read.ts — guarda local (localStorage) do progresso
 * de uma leitura: passo atual + edições de Conferência.
 *
 * O backend do Smart Read ainda não expõe endpoint para gravar edições, então a
 * "memória" do ponto onde o usuário parou vive no navegador, por id_leitura.
 * Ao reabrir a leitura pelo link da lista, restauramos passo + dados editados.
 */

import { z } from 'zod'
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

export function salvarEstadoLeituraSmartRead(idLeitura: string, estado: EstadoSalvoLeitura): void {
  try {
    localStorage.setItem(chave(idLeitura), JSON.stringify(estado))
  } catch {
    /* localStorage indisponível ou cota excedida — ignora silenciosamente */
  }
}

export function lerEstadoLeituraSmartRead(idLeitura: string): EstadoSalvoLeitura | null {
  try {
    const bruto = localStorage.getItem(chave(idLeitura))
    if (!bruto) return null
    const resultado = EstadoSalvoLeituraSchema.safeParse(JSON.parse(bruto))
    return resultado.success ? resultado.data : null
  } catch {
    return null
  }
}

export function limparEstadoLeituraSmartRead(idLeitura: string): void {
  try {
    localStorage.removeItem(chave(idLeitura))
  } catch {
    /* ignora */
  }
}

/** Reexport de tipo para conveniência dos consumidores. */
export type { Leitura }
