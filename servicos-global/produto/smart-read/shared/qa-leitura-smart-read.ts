/**
 * qa-leitura-smart-read.ts — contrato bilateral POST /leituras/qa (Consultor Rafa)
 */

import { z } from 'zod'
import { DocumentoAnaliseRiscoSchema } from './analise-riscos-leitura-smart-read'

export const MensagemHistoricoQaLeituraSchema = z.object({
  papel: z.enum(['usuario', 'assistente']),
  conteudo: z.string().trim().min(1),
})

export const QaLeituraRequestSchema = z.object({
  documentos: z.array(DocumentoAnaliseRiscoSchema).min(1),
  pergunta: z.string().trim().min(1),
  historico: z.array(MensagemHistoricoQaLeituraSchema).max(20).optional().default([]),
})

export const QaLeituraResponseSchema = z.object({
  resposta: z.string().min(1),
  llm_ativo: z.boolean(),
  aviso: z.string().nullable().optional(),
})

export type MensagemHistoricoQaLeitura = z.infer<typeof MensagemHistoricoQaLeituraSchema>
export type QaLeituraRequest = z.infer<typeof QaLeituraRequestSchema>
export type QaLeituraResponse = z.infer<typeof QaLeituraResponseSchema>
