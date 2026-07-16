/**
 * leitura-smart-read.ts — Contratos Zod do BFF Smart Read
 * Bilateral (REGRA 09): o que o legado devolve (validado na entrada)
 * e o que o BFF expõe aos consumidores Gravity (normalizado, DDD).
 */

import { z } from 'zod'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../shared/corrigir-encoding-nome-arquivo-smart-read.js'
import { mesclarDadosExtracaoLegado } from '../../../shared/mesclar-dados-extracao-legado-smart-read.js'
import { StatusFluxoLeituraEnum } from '../../../shared/status-fluxo-leitura-smart-read.js'

export const StatusLeituraEnum = z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])
export type StatusLeitura = z.infer<typeof StatusLeituraEnum>

export { StatusFluxoLeituraEnum }
export type StatusFluxoLeitura = z.infer<typeof StatusFluxoLeituraEnum>

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
  url: z.string().optional(),
  downloadUrl: z.string().optional(),
  fileUrl: z.string().optional(),
  processingStatus: z.string().optional(),
  processingTimeMs: z.number().optional(),
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
  source: z.string().optional(),
  origin: z.string().optional(),
  files: z.array(ArquivoLeituraLegadoSchema).optional(),
})
export type LeituraLegado = z.infer<typeof LeituraLegadoSchema>

export const CriarLeituraLegadoRespostaSchema = z.object({
  _id: z.string(),
})

export const EnviarArquivoLegadoRespostaSchema = z.object({
  fileReferenceId: z.string().optional(),
})

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

export const LeituraSchema = z.object({
  id_leitura: z.string(),
  nome_leitura: z.string().nullable(),
  status_leitura: StatusLeituraEnum,
  total_arquivos: z.number(),
  arquivos_processados: z.number(),
  arquivos: z.array(ArquivoLeituraSchema),
  tempo_processo_total_ms: z.number().int().min(0).nullable().optional(),
})
export type Leitura = z.infer<typeof LeituraSchema>

export const CriarLeituraRespostaSchema = z.object({
  id_leitura: z.string(),
  id_arquivo: z.string().nullable(),
  status_leitura: StatusLeituraEnum,
})
export type CriarLeituraResposta = z.infer<typeof CriarLeituraRespostaSchema>

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
  /** Fluxo Gravity (Lista). Independente de status_leitura DATI. */
  status_fluxo_leitura: StatusFluxoLeituraEnum,
  /** Passo wizard 1–4 quando conhecido (progresso); null se só legado. */
  passo_atual_leitura: z.number().int().min(1).max(4).nullable(),
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

function resolverTempoExtracaoArquivoLegadoMs(arquivo: {
  processingTimeMs?: number
}): number | null {
  if (typeof arquivo.processingTimeMs === 'number' && arquivo.processingTimeMs >= 0) {
    return Math.round(arquivo.processingTimeMs)
  }
  return null
}

type ResultadoExtracaoLegado = {
  id?: string | number
  fileType?: string
  data?: Record<string, unknown>
}

function idResultadoExtracaoLegado(item: ResultadoExtracaoLegado): string | null {
  if (item.id == null) return null
  return String(item.id)
}

function resolverItemOriginalPareado(
  originais: ResultadoExtracaoLegado[],
  itemFinal: ResultadoExtracaoLegado,
  indice: number,
): ResultadoExtracaoLegado | undefined {
  if (indice < originais.length && originais[indice]) {
    return originais[indice]
  }

  const idFinal = idResultadoExtracaoLegado(itemFinal)
  if (idFinal) {
    const porId = originais.find((item) => idResultadoExtracaoLegado(item) === idFinal)
    if (porId) return porId
  }

  const tipoFinal = itemFinal.fileType?.trim()
  if (tipoFinal) {
    const porTipo = originais.find((item) => item.fileType?.trim() === tipoFinal)
    if (porTipo) return porTipo
  }

  return undefined
}

function dadosDistintos(
  esquerda: Record<string, unknown>,
  direita: Record<string, unknown>,
): boolean {
  return JSON.stringify(esquerda) !== JSON.stringify(direita)
}

export function parearResultadoExtracaoLegado(arquivo: {
  processingResult?: ResultadoExtracaoLegado[]
  finalProcessingResult?: ResultadoExtracaoLegado[] | null
}): z.infer<typeof ItemResultadoExtracaoLeituraSchema>[] | null {
  const finais = arquivo.finalProcessingResult ?? arquivo.processingResult
  if (!finais || finais.length === 0) return null

  const originais = arquivo.processingResult ?? []

  return finais.map((itemFinal, indice) => {
    const dadosBrutosFinal = itemFinal.data ?? {}
    const itemOriginal =
      originais.length > 0 ? resolverItemOriginalPareado(originais, itemFinal, indice) : undefined
    const dadosOriginal = itemOriginal?.data
    const dados =
      dadosOriginal != null
        ? mesclarDadosExtracaoLegado(dadosBrutosFinal, dadosOriginal)
        : dadosBrutosFinal

    const base = {
      tipo_documento: itemFinal.fileType ?? itemOriginal?.fileType ?? null,
      dados,
    }

    if (dadosOriginal && dadosDistintos(dadosOriginal, dadosBrutosFinal)) {
      return { ...base, dados_original: dadosOriginal }
    }

    return base
  })
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
    arquivos: arquivos.map((arquivo) => ({
      id_arquivo: arquivo.fileReferenceId,
      nome_arquivo: corrigirEncodingNomeArquivoSmartRead(arquivo.filename ?? null),
      status_arquivo: mapearStatus(arquivo.processingStatus),
      tempo_extracao_ia_ms: resolverTempoExtracaoArquivoLegadoMs(arquivo),
      resultado_extracao: parearResultadoExtracaoLegado(arquivo),
    })),
  }
}
