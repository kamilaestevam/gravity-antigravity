/**
 * leitura-smart-read.ts — Contratos Zod do BFF Smart Read
 * Bilateral (REGRA 09): o que o legado devolve (validado na entrada)
 * e o que o BFF expõe aos consumidores Gravity (normalizado, DDD).
 */

import { z } from 'zod'

export const StatusLeituraEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
export type StatusLeitura = z.infer<typeof StatusLeituraEnum>

export const ResultadoProcessamentoLegadoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  fileType: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

export const ArquivoLeituraLegadoSchema = z.object({
  fileReferenceId: z.string(),
  filename: z.string().optional(),
  mimeType: z.string().optional(),
  size: z.number().optional(),
  processingStatus: z.string().optional(),
  processingResult: z.array(ResultadoProcessamentoLegadoSchema).optional(),
  // Resultado corrigido pelo usuario no legado — tem precedencia quando existe
  // (mesma regra do frontend de referencia: finalProcessingResult ?? processingResult).
  finalProcessingResult: z.array(ResultadoProcessamentoLegadoSchema).nullable().optional(),
})

export const LeituraLegadoSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  status: z.string().optional(),
  totalFiles: z.number().optional(),
  processedFiles: z.number().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
  files: z.array(ArquivoLeituraLegadoSchema).optional(),
})
export type LeituraLegado = z.infer<typeof LeituraLegadoSchema>

export const CriarLeituraLegadoRespostaSchema = z.object({
  _id: z.string(),
})

export const EnviarArquivoLegadoRespostaSchema = z.object({
  fileReferenceId: z.string().optional(),
})

export const ArquivoLeituraSchema = z.object({
  id_arquivo: z.string(),
  nome_arquivo: z.string().nullable(),
  status_arquivo: StatusLeituraEnum,
  resultado_extracao: z
    .array(z.object({ tipo_documento: z.string().nullable(), dados: z.record(z.string(), z.unknown()) }))
    .nullable(),
})

export const LeituraSchema = z.object({
  id_leitura: z.string(),
  nome_leitura: z.string().nullable(),
  status_leitura: StatusLeituraEnum,
  total_arquivos: z.number(),
  arquivos_processados: z.number(),
  arquivos: z.array(ArquivoLeituraSchema),
})
export type Leitura = z.infer<typeof LeituraSchema>

export const CriarLeituraRespostaSchema = z.object({
  id_leitura: z.string(),
  id_arquivo: z.string().nullable(),
  status_leitura: StatusLeituraEnum,
})
export type CriarLeituraResposta = z.infer<typeof CriarLeituraRespostaSchema>

function mapearStatus(status: string | undefined): StatusLeitura {
  const normalizado = (status ?? '').toLowerCase()
  if (normalizado.includes('fail') || normalizado.includes('error')) return 'FAILED'
  // 'processing_created_files' conta como concluido: a IA ja terminou e o
  // processingResult ja esta disponivel — so os arquivos de export ainda geram
  // em background (mesma regra do frontend de referencia do legado).
  if (
    normalizado === 'completed' ||
    normalizado === 'completed_ai' ||
    normalizado === 'created_files' ||
    normalizado === 'processing_created_files'
  ) {
    return 'COMPLETED'
  }
  if (normalizado === '' || normalizado === 'pending' || normalizado === 'uploaded') return 'PENDING'
  return 'PROCESSING'
}

export function normalizarLeitura(legado: LeituraLegado): Leitura {
  const arquivos = legado.files ?? []
  const statusArquivos = arquivos.map((arquivo) => mapearStatus(arquivo.processingStatus))
  let statusLeitura = mapearStatus(legado.status)
  // O status da leitura no legado atualiza com atraso em relacao aos arquivos:
  // se todos os arquivos concluiram (ou algum falhou), o agregado reflete isso.
  if (statusLeitura === 'PROCESSING' || statusLeitura === 'PENDING') {
    if (statusArquivos.length > 0 && statusArquivos.every((s) => s === 'COMPLETED')) {
      statusLeitura = 'COMPLETED'
    } else if (statusArquivos.includes('FAILED')) {
      statusLeitura = 'FAILED'
    }
  }
  return {
    id_leitura: legado._id,
    nome_leitura: legado.name ?? null,
    status_leitura: statusLeitura,
    total_arquivos: legado.totalFiles ?? 0,
    arquivos_processados: legado.processedFiles ?? 0,
    arquivos: arquivos.map((arquivo) => {
      const resultado = arquivo.finalProcessingResult ?? arquivo.processingResult
      return {
        id_arquivo: arquivo.fileReferenceId,
        nome_arquivo: arquivo.filename ?? null,
        status_arquivo: mapearStatus(arquivo.processingStatus),
        resultado_extracao: resultado
          ? resultado.map((item) => ({
              tipo_documento: item.fileType ?? null,
              dados: item.data ?? {},
            }))
          : null,
      }
    }),
  }
}
