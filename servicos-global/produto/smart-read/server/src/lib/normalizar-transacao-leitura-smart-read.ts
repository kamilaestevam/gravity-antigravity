/**
 * normalizar-transacao-leitura-smart-read.ts — linha da lista (TransacaoLeitura)
 * a partir do payload legado ou leitura normalizada.
 */
import { z } from 'zod'
import {
  calcularMetricasTransacaoLeituraSmartRead,
  metricasTransacaoLeituraVazias,
  resolverMediaAcertosTransacaoLeituraSmartRead,
  resolverSavingTransacaoLeituraSmartRead,
} from '../../../shared/metricas-transacao-leitura-smart-read.js'
import { corrigirEncodingNomeArquivoSmartRead } from '../../../shared/corrigir-encoding-nome-arquivo-smart-read.js'
import {
  LeituraSchema,
  OrigemLeituraEnum,
  StatusLeituraEnum,
  TransacaoLeituraSchema,
  normalizarLeitura,
  type Leitura,
  type LeituraLegado,
  type TransacaoLeitura,
} from '../schemas/leitura-smart-read.js'

export const ItemListaLeituraLegadoSchema = z.object({
  _id: z.string(),
  name: z.string().optional(),
  status: z.string().optional(),
  totalFiles: z.number().optional(),
  processedFiles: z.number().optional(),
  createdAt: z.string().optional(),
  completedAt: z.string().nullable().optional(),
  averageAccuracy: z.number().optional(),
  accuracy: z.number().optional(),
  average_accuracy: z.number().optional(),
  source: z.string().optional(),
  origin: z.string().optional(),
  errorMessage: z.string().nullable().optional(),
  files: z
    .array(
      z.object({
        filename: z.string().optional(),
        processingStatus: z.string().optional(),
      }),
    )
    .optional(),
})

export type ItemListaLeituraLegado = z.infer<typeof ItemListaLeituraLegadoSchema>

export function mapearOrigemLeitura(valor: string | undefined): z.infer<typeof OrigemLeituraEnum> {
  const normalizado = (valor ?? '').toLowerCase()
  if (normalizado.includes('api') || normalizado === 'external') return 'API'
  return 'INTERFACE'
}

export function mesclarOrigemLeituraTransacao(
  anterior: z.infer<typeof OrigemLeituraEnum>,
  novo: z.infer<typeof OrigemLeituraEnum>,
): z.infer<typeof OrigemLeituraEnum> {
  return anterior === 'API' || novo === 'API' ? 'API' : novo
}

export function complementarMetricasTransacaoLista(transacao: TransacaoLeitura): TransacaoLeitura {
  let resultado: TransacaoLeitura = {
    ...transacao,
    media_acertos: resolverMediaAcertosTransacaoLeituraSmartRead(transacao),
  }

  const saving = resolverSavingTransacaoLeituraSmartRead(resultado)
  if (saving) {
    resultado = {
      ...resultado,
      saving_total_minutos: saving.saving_total_minutos,
      saving_total_brl: saving.saving_total_brl,
    }
  }

  return TransacaoLeituraSchema.parse(resultado)
}

export function mesclarTransacaoNaLista(
  anterior: TransacaoLeitura,
  novo: TransacaoLeitura,
): TransacaoLeitura {
  const mesclada = complementarMetricasTransacaoLista({
    ...novo,
    total_documentos: Math.max(anterior.total_documentos, novo.total_documentos),
    total_campos_extraidos: Math.max(anterior.total_campos_extraidos, novo.total_campos_extraidos),
    total_campos_corretos: Math.max(anterior.total_campos_corretos, novo.total_campos_corretos),
    total_campos_errados: Math.max(anterior.total_campos_errados, novo.total_campos_errados),
    tipos_documento: novo.tipos_documento ?? anterior.tipos_documento,
    numeros_documento: novo.numeros_documento ?? anterior.numeros_documento,
    tempo_extracao_ia_ms: novo.tempo_extracao_ia_ms ?? anterior.tempo_extracao_ia_ms,
    tempo_processo_total_ms: novo.tempo_processo_total_ms ?? anterior.tempo_processo_total_ms,
    saving_total_minutos: novo.saving_total_minutos ?? anterior.saving_total_minutos,
    saving_total_brl: novo.saving_total_brl ?? anterior.saving_total_brl,
    origem_leitura: mesclarOrigemLeituraTransacao(anterior.origem_leitura, novo.origem_leitura),
    nome_leitura: novo.nome_leitura || anterior.nome_leitura,
    data_envio: anterior.data_envio ?? novo.data_envio,
    mensagem_erro: novo.mensagem_erro ?? anterior.mensagem_erro,
    media_acertos: novo.media_acertos ?? anterior.media_acertos,
  })

  return complementarMetricasTransacaoLista(mesclada)
}

function extrairMediaAcertosLeitura(leitura: Leitura): number | null {
  const valores: number[] = []
  for (const arquivo of leitura.arquivos) {
    for (const doc of arquivo.resultado_extracao ?? []) {
      const bruto = doc.dados.accuracy ?? doc.dados.score
      if (typeof bruto === 'number' && Number.isFinite(bruto)) {
        valores.push(bruto > 1 ? bruto / 100 : bruto)
      }
    }
  }
  if (valores.length === 0) return null
  return valores.reduce((acc, n) => acc + n, 0) / valores.length
}

function statusDeItemLista(item: ItemListaLeituraLegado): z.infer<typeof StatusLeituraEnum> {
  const leitura = normalizarLeitura(item as LeituraLegado)
  return leitura.status_leitura
}

function anexarMetricasTransacao(
  base: Omit<TransacaoLeitura, keyof ReturnType<typeof metricasTransacaoLeituraVazias>>,
  leitura: Leitura,
  contextoTempo?: { created_at?: string | null; completed_at?: string | null },
): TransacaoLeitura {
  const metricas =
    leitura.arquivos.some((arquivo) => (arquivo.resultado_extracao?.length ?? 0) > 0)
      ? calcularMetricasTransacaoLeituraSmartRead(leitura, {
          created_at: contextoTempo?.created_at ?? null,
          completed_at: contextoTempo?.completed_at ?? null,
        })
      : {
          ...metricasTransacaoLeituraVazias(),
          tempo_processo_total_ms: calcularMetricasTransacaoLeituraSmartRead(leitura, {
            created_at: contextoTempo?.created_at ?? null,
            completed_at: contextoTempo?.completed_at ?? null,
          }).tempo_processo_total_ms,
        }

  return TransacaoLeituraSchema.parse({
    ...base,
    ...metricas,
  })
}

export function normalizarTransacaoDeLeitura(
  leitura: Leitura,
  extras?: {
    data_envio?: string | null
    origem_leitura?: z.infer<typeof OrigemLeituraEnum>
    created_at?: string | null
    completed_at?: string | null
  },
): TransacaoLeitura {
  const primeiroArquivo = leitura.arquivos[0]
  const base = {
    id_leitura: leitura.id_leitura,
    nome_leitura: leitura.nome_leitura,
    status_leitura: leitura.status_leitura,
    total_arquivos: leitura.total_arquivos,
    media_acertos: extrairMediaAcertosLeitura(leitura),
    data_envio: extras?.data_envio ?? null,
    origem_leitura: extras?.origem_leitura ?? 'INTERFACE',
    nome_arquivo: primeiroArquivo?.nome_arquivo ?? null,
    mensagem_erro: null,
  }

  return anexarMetricasTransacao(base, leitura, {
    created_at: extras?.created_at ?? extras?.data_envio ?? null,
    completed_at: extras?.completed_at ?? null,
  })
}

export function normalizarTransacaoDeItemListaLegado(item: ItemListaLeituraLegado): TransacaoLeitura {
  const leitura = normalizarLeitura(item as LeituraLegado)
  const mediaLista = item.averageAccuracy ?? item.accuracy ?? item.average_accuracy
  const mediaNormalizada =
    typeof mediaLista === 'number'
      ? mediaLista > 1
        ? mediaLista / 100
        : mediaLista
      : extrairMediaAcertosLeitura(leitura)

  const base = {
    id_leitura: item._id,
    nome_leitura: item.name ?? leitura.nome_leitura,
    status_leitura: statusDeItemLista(item),
    total_arquivos: item.totalFiles ?? leitura.total_arquivos,
    media_acertos: mediaNormalizada,
    data_envio: item.createdAt ?? null,
    origem_leitura: mapearOrigemLeitura(item.source ?? item.origin),
    nome_arquivo:
      corrigirEncodingNomeArquivoSmartRead(item.files?.[0]?.filename) ??
      leitura.arquivos[0]?.nome_arquivo ??
      null,
    mensagem_erro: item.errorMessage ?? null,
  }

  return anexarMetricasTransacao(base, leitura, {
    created_at: item.createdAt ?? null,
    completed_at: item.completedAt ?? null,
  })
}

export function extrairItensListaLegado(bruto: unknown): ItemListaLeituraLegado[] {
  if (Array.isArray(bruto)) {
    return bruto.map((item) => ItemListaLeituraLegadoSchema.parse(item))
  }
  if (bruto && typeof bruto === 'object') {
    const obj = bruto as Record<string, unknown>
    for (const chave of ['items', 'data', 'content', 'readings', 'results']) {
      const candidato = obj[chave]
      if (Array.isArray(candidato)) {
        return candidato.map((item) => ItemListaLeituraLegadoSchema.parse(item))
      }
    }
  }
  throw new Error('Formato de lista legado nao reconhecido')
}

export function extrairTotalListaLegado(bruto: unknown, fallback: number): number {
  if (bruto && typeof bruto === 'object' && !Array.isArray(bruto)) {
    const obj = bruto as Record<string, unknown>
    for (const chave of ['total', 'totalElements', 'totalCount', 'count']) {
      const valor = obj[chave]
      if (typeof valor === 'number') return valor
    }
  }
  return fallback
}

export { LeituraSchema }
