/**
 * schemas.ts — Contratos Zod do client Smart Read (REGRA 06/09)
 * Espelho bilateral de server/src/schemas/leitura-smart-read.ts — se o BFF
 * mudar o payload, este arquivo muda no MESMO commit.
 */

import { z } from 'zod'

export const StatusLeituraEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
export type StatusLeitura = z.infer<typeof StatusLeituraEnum>

export const ArquivoLeituraSchema = z.object({
  id_arquivo: z.string(),
  nome_arquivo: z.string().nullable(),
  status_arquivo: StatusLeituraEnum,
  resultado_extracao: z
    .array(z.object({ tipo_documento: z.string().nullable(), dados: z.record(z.string(), z.unknown()) }))
    .nullable(),
})
export type ArquivoLeitura = z.infer<typeof ArquivoLeituraSchema>

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
