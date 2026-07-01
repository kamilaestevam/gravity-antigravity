/**
 * schemas.ts — Contratos Zod do client Smart Read (REGRA 06/09)
 * Espelho bilateral de server/src/schemas/leitura-smart-read.ts — se o BFF
 * mudar o payload, este arquivo muda no MESMO commit.
 */

import { z } from 'zod'

export const StatusLeituraEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
export type StatusLeitura = z.infer<typeof StatusLeituraEnum>

export const ItemResultadoExtracaoLeituraSchema = z.object({
  tipo_documento: z.string().nullable(),
  dados: z.record(z.string(), z.unknown()),
  dados_original: z.record(z.string(), z.unknown()).optional(),
})

export const ArquivoLeituraSchema = z.object({
  id_arquivo: z.string(),
  nome_arquivo: z.string().nullable(),
  status_arquivo: StatusLeituraEnum,
  tempo_extracao_ia_ms: z.number().int().min(0).nullable().optional(),
  resultado_extracao: z.array(ItemResultadoExtracaoLeituraSchema).nullable(),
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

export const EstadoProgressoLeituraSchema = z.object({
  passo: z.number().int().min(2).max(4),
  nome: z.string(),
  leitura: LeituraSchema,
})
export type EstadoProgressoLeitura = z.infer<typeof EstadoProgressoLeituraSchema>

export const OrigemLeituraEnum = z.enum(['API', 'INTERFACE'])
export type OrigemLeitura = z.infer<typeof OrigemLeituraEnum>

export const MetricasTransacaoLeituraSchema = z.object({
  total_documentos: z.number().int().min(0),
  total_campos_extraidos: z.number().int().min(0),
  total_campos_corretos: z.number().int().min(0),
  total_campos_errados: z.number().int().min(0),
  tipos_documento: z.string().nullable(),
  numeros_documento: z.string().nullable(),
  tempo_extracao_ia_ms: z.number().int().min(0).nullable(),
  tempo_processo_total_ms: z.number().int().min(0).nullable(),
  saving_total_minutos: z.number().min(0).nullable(),
  saving_total_brl: z.number().min(0).nullable(),
})

export const TransacaoLeituraSchema = z.object({
  id_leitura: z.string(),
  nome_leitura: z.string().nullable(),
  status_leitura: StatusLeituraEnum,
  total_arquivos: z.number(),
  media_acertos: z.number().nullable(),
  data_envio: z.string().nullable(),
  origem_leitura: OrigemLeituraEnum,
  nome_arquivo: z.string().nullable(),
  mensagem_erro: z.string().nullable(),
}).merge(MetricasTransacaoLeituraSchema)
export type TransacaoLeitura = z.infer<typeof TransacaoLeituraSchema>

export const ListarTransacoesRespostaSchema = z.object({
  transacoes: z.array(TransacaoLeituraSchema),
  paginacao: z.object({
    pagina: z.number().int().min(1),
    limite: z.number().int().min(1),
    total: z.number().int().min(0),
  }),
})
export type ListarTransacoesResposta = z.infer<typeof ListarTransacoesRespostaSchema>

export const MetricaLeituraRespostaSchema = z.object({
  valor: z.number(),
})
export type MetricaLeituraResposta = z.infer<typeof MetricaLeituraRespostaSchema>

export const StatusTarefaExportacaoLeituraEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
])
export type StatusTarefaExportacaoLeitura = z.infer<typeof StatusTarefaExportacaoLeituraEnum>

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

export const DocumentoLeituraListaSchema = z.object({
  id_documento_leitura: z.string(),
  id_leitura: z.string(),
  id_arquivo: z.string(),
  nome_documento: z.string(),
  status_documento: StatusLeituraEnum.optional(),
  media_acertos: z.number().nullable().optional(),
  data_envio: z.string().nullable().optional(),
  tipo_documento: z.string().nullable(),
  numero_documento: z.string().nullable(),
  valores_colunas: z.record(z.string(), z.string()),
})
export type DocumentoLeituraListaResposta = z.infer<typeof DocumentoLeituraListaSchema>

export const EditarCampoDocumentoListaRequestSchema = z.object({
  id_arquivo: z.string().min(1),
  indice_documento: z.number().int().min(0),
  campo_coluna: z.string().min(1),
  valor: z.string(),
})

export const EditarCampoDocumentoListaRespostaSchema = z.object({
  documentos_atualizados: z.array(DocumentoLeituraListaSchema),
})
export type EditarCampoDocumentoListaResposta = z.infer<typeof EditarCampoDocumentoListaRespostaSchema>
