/**
 * normalizar-transacao-leitura-smart-read.ts — linha da lista (TransacaoLeitura)
 * a partir do payload legado ou leitura normalizada.
 */
import { z } from 'zod'
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
  averageAccuracy: z.number().optional(),
  accuracy: z.number().optional(),
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

function mapearOrigemLeitura(valor: string | undefined): z.infer<typeof OrigemLeituraEnum> {
  const normalizado = (valor ?? '').toLowerCase()
  if (normalizado.includes('api') || normalizado === 'external') return 'API'
  return 'INTERFACE'
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

export function normalizarTransacaoDeLeitura(
  leitura: Leitura,
  extras?: { data_envio?: string | null; origem_leitura?: z.infer<typeof OrigemLeituraEnum> },
): TransacaoLeitura {
  const primeiroArquivo = leitura.arquivos[0]
  return TransacaoLeituraSchema.parse({
    id_leitura: leitura.id_leitura,
    nome_leitura: leitura.nome_leitura,
    status_leitura: leitura.status_leitura,
    total_arquivos: leitura.total_arquivos,
    media_acertos: extrairMediaAcertosLeitura(leitura),
    data_envio: extras?.data_envio ?? null,
    origem_leitura: extras?.origem_leitura ?? 'INTERFACE',
    nome_arquivo: primeiroArquivo?.nome_arquivo ?? null,
    mensagem_erro: null,
  })
}

export function normalizarTransacaoDeItemListaLegado(item: ItemListaLeituraLegado): TransacaoLeitura {
  const leitura = normalizarLeitura(item as LeituraLegado)
  const mediaLista = item.averageAccuracy ?? item.accuracy
  const mediaNormalizada =
    typeof mediaLista === 'number'
      ? mediaLista > 1
        ? mediaLista / 100
        : mediaLista
      : extrairMediaAcertosLeitura(leitura)

  return TransacaoLeituraSchema.parse({
    id_leitura: item._id,
    nome_leitura: item.name ?? leitura.nome_leitura,
    status_leitura: statusDeItemLista(item),
    total_arquivos: item.totalFiles ?? leitura.total_arquivos,
    media_acertos: mediaNormalizada,
    data_envio: item.createdAt ?? null,
    origem_leitura: mapearOrigemLeitura(item.source ?? item.origin),
    nome_arquivo: item.files?.[0]?.filename ?? leitura.arquivos[0]?.nome_arquivo ?? null,
    mensagem_erro: item.errorMessage ?? null,
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
