/**
 * exportacao-leitura-smart-read.ts — Contratos Zod export DATI (download-tasks)
 * Bilateral com client/src/shared/schemas.ts (REGRA 09).
 */

import { z } from 'zod'

export const StatusTarefaExportacaoLeituraEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
])
export type StatusTarefaExportacaoLeitura = z.infer<typeof StatusTarefaExportacaoLeituraEnum>

export const CriarExportacaoLeituraCorpoSchema = z.object({
  ids_arquivo: z.array(z.string().min(1)).min(1),
})
export type CriarExportacaoLeituraCorpo = z.infer<typeof CriarExportacaoLeituraCorpoSchema>

export const CriarExportacaoLeituraRespostaSchema = z.object({
  id_tarefa: z.string().min(1),
  status_tarefa: StatusTarefaExportacaoLeituraEnum,
})
export type CriarExportacaoLeituraResposta = z.infer<typeof CriarExportacaoLeituraRespostaSchema>

export const StatusExportacaoLeituraRespostaSchema = z.object({
  id_tarefa: z.string().min(1),
  status_tarefa: StatusTarefaExportacaoLeituraEnum,
  pronto: z.boolean(),
  mensagem_erro: z.string().nullable(),
})
export type StatusExportacaoLeituraResposta = z.infer<typeof StatusExportacaoLeituraRespostaSchema>

/** Legado DATI — POST download-tasks */
export const TarefaLegadoPresenterSchema = z.object({
  id: z.string(),
  status: z.string(),
  taskType: z.string().optional(),
})

/** Legado DATI — GET download-tasks/{taskId} */
export const StatusTarefaDownloadLegadoSchema = z.object({
  taskId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  downloadUrl: z.string().optional(),
  message: z.string().optional(),
})

export const ItemFinalResultLegadoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  fileType: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const AtualizarResultadoArquivoLegadoCorpoSchema = z.object({
  finalResult: z.array(ItemFinalResultLegadoSchema),
})

export function normalizarStatusTarefaExportacaoLegado(
  bruto: string | undefined,
): StatusTarefaExportacaoLeitura {
  const s = (bruto ?? '').toLowerCase()
  if (s === 'completed' || s === 'complete') return 'completed'
  if (s === 'failed' || s === 'fail' || s === 'error') return 'failed'
  if (s === 'pending' || s === 'created') return 'pending'
  return 'processing'
}
