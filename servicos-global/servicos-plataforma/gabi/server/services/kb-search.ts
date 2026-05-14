// server/services/kb-search.ts
// Busca semantica na base de conhecimento via pgvector (cosine similarity).
import { GoogleGenerativeAI } from '@google/generative-ai'
import prisma from '../lib/prisma.js'

const EMBEDDING_MODEL = 'text-embedding-004'
const DEFAULT_TOP_K = 10
const MAX_TOTAL_TOKENS = 12_000
const MIN_SIMILARITY = 0.3

interface KbSearchResult {
  conteudo: string
  segmento: string
  titulo_secao: string
  similaridade: number
  tokens: number
}

export interface KbSearchMeta {
  chunks_retornados: number
  score_similaridade_medio: number
  tempo_busca_ms: number
  tokens_total_chunks: number
}

let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY obrigatoria para embedding')
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

async function embedQuery(query: string): Promise<number[]> {
  const model = getGenAI().getGenerativeModel({ model: EMBEDDING_MODEL })
  const result = await model.embedContent({
    content: { parts: [{ text: query }], role: 'user' },
  })
  return result.embedding.values
}

function vectorToSql(vec: number[]): string {
  return `[${vec.join(',')}]`
}

export async function searchKnowledgeBase(
  query: string,
  page?: string,
  topK: number = DEFAULT_TOP_K,
): Promise<{ chunks: string; meta: KbSearchMeta }> {
  const inicio = Date.now()

  const queryEmbedding = await embedQuery(query)
  const vecSql = vectorToSql(queryEmbedding)

  // Filtro por segmento se a pagina esta mapeada
  const segmentoFilter = page ? mapPageToSegmento(page) : null

  const segmentoClause = segmentoFilter
    ? `AND segmento_gabi_kb_chunk = ANY($2::text[])`
    : ''

  const params: unknown[] = [topK * 2]
  if (segmentoFilter) params.push(segmentoFilter)

  const results = await prisma.$queryRawUnsafe<Array<{
    conteudo_gabi_kb_chunk: string
    segmento_gabi_kb_chunk: string
    titulo_secao_gabi_kb_chunk: string
    tokens_gabi_kb_chunk: number
    similaridade: number
  }>>(
    `SELECT
      conteudo_gabi_kb_chunk,
      segmento_gabi_kb_chunk,
      titulo_secao_gabi_kb_chunk,
      tokens_gabi_kb_chunk,
      1 - (embedding_gabi_kb_chunk <=> '${vecSql}'::vector) as similaridade
    FROM gabi_kb_chunk
    WHERE 1 - (embedding_gabi_kb_chunk <=> '${vecSql}'::vector) > ${MIN_SIMILARITY}
    ${segmentoClause}
    ORDER BY embedding_gabi_kb_chunk <=> '${vecSql}'::vector
    LIMIT $1`,
    ...params,
  )

  // Selecionar top-K respeitando limite de tokens
  const selected: KbSearchResult[] = []
  let totalTokens = 0
  for (const row of results) {
    if (selected.length >= topK) break
    if (totalTokens + row.tokens_gabi_kb_chunk > MAX_TOTAL_TOKENS) continue
    selected.push({
      conteudo: row.conteudo_gabi_kb_chunk,
      segmento: row.segmento_gabi_kb_chunk,
      titulo_secao: row.titulo_secao_gabi_kb_chunk,
      similaridade: Number(row.similaridade),
      tokens: row.tokens_gabi_kb_chunk,
    })
    totalTokens += row.tokens_gabi_kb_chunk
  }

  const tempoMs = Date.now() - inicio
  const scoreMedia = selected.length > 0
    ? selected.reduce((s, c) => s + c.similaridade, 0) / selected.length
    : 0

  const chunksText = selected.length > 0
    ? selected
        .map((c) => `--- [${c.segmento}] ${c.titulo_secao} (score: ${c.similaridade.toFixed(3)}) ---\n${c.conteudo}`)
        .join('\n\n')
    : ''

  return {
    chunks: chunksText,
    meta: {
      chunks_retornados: selected.length,
      score_similaridade_medio: Math.round(scoreMedia * 1000) / 1000,
      tempo_busca_ms: tempoMs,
      tokens_total_chunks: totalTokens,
    },
  }
}

const PAGE_SEGMENT_MAP: Record<string, string[]> = {
  '/produto/lpco':              ['lpco'],
  '/produto/pedido':            ['pedido'],
  '/produto/nf-importacao':     ['nf-importacao'],
  '/produto/bid-frete':         ['bid-frete'],
  '/produto/bid-cambio':        ['bid-cambio'],
  '/produto/financeiro-comex':  ['financeiro-comex'],
  '/produto/simula-custo':      ['simula-custo'],
  '/produto/processo':          ['processo'],
  '/workspace/organizacao':     ['configurador'],
  '/workspace/workspaces':      ['configurador'],
  '/workspace/usuarios':        ['configurador'],
  '/workspace/assinaturas':     ['configurador'],
  '/workspace/financeiro':      ['configurador'],
  '/workspace/api-cockpit':     ['api-cockpit', 'configurador'],
  '/workspace/conector-cargowise': ['api-cockpit'],
  '/admin':                     ['configurador'],
  '/store':                     ['marketplace'],
  '/hub':                       ['dashboard', 'configurador'],
}

function mapPageToSegmento(page: string): string[] | null {
  const normalized = page.toLowerCase().replace(/\/$/, '')

  const direct = PAGE_SEGMENT_MAP[normalized]
  if (direct) return direct

  const prefix = Object.entries(PAGE_SEGMENT_MAP)
    .find(([route]) => normalized.startsWith(route))
  if (prefix) return prefix[1]

  return null
}
