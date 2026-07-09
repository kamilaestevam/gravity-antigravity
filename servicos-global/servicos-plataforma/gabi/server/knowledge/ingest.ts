/**
 * ingest.ts — Pipeline de ingestao RAG: chunka a KB por headers markdown,
 * gera embeddings via Gemini (gemini-embedding-2, 768 dims), e upsert no
 * PostgreSQL (pgvector).
 *
 * Execucao: GEMINI_API_KEY=... DATABASE_URL=... npx tsx server/knowledge/ingest.ts
 * Pre-requisitos:
 *   1. KB compilada: npx tsx server/knowledge/compile.ts
 *   2. Extensao pgvector: CREATE EXTENSION IF NOT EXISTS vector;
 */

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'
import { GoogleGenAI } from '@google/genai'
import { EMBEDDING_DIMS } from '../lib/modelos-gemini.js'
import { embedarTexto } from '../lib/embeddings-gemini.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const KB_PATH = path.resolve(__dirname, 'gravity-knowledge-base.txt')
const SEGMENTS_DIR = path.resolve(__dirname, 'segments')

const MAX_CHUNK_TOKENS = 800
// gemini-embedding-2 embeda 1 conteudo por chamada; batch aqui = janela de
// concorrencia (N chamadas individuais em paralelo), nao um batch de API.
const BATCH_SIZE = 10
const BATCH_DELAY_MS = 200

interface KbChunk {
  hash_conteudo: string
  conteudo: string
  segmento: string
  titulo_secao: string
  nivel: number
  tokens: number
  ordem: number
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

function sha256(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex')
}

function chunkByMarkdownHeaders(text: string, segmento: string): KbChunk[] {
  const chunks: KbChunk[] = []
  const lines = text.split('\n')

  let currentTitle = segmento
  let currentLevel = 1
  let currentContent: string[] = []
  let ordem = 0

  function flushChunk() {
    const content = currentContent.join('\n').trim()
    if (!content || content.length < 20) return

    const tokens = estimateTokens(content)
    if (tokens > MAX_CHUNK_TOKENS) {
      const subChunks = splitLargeChunk(content, currentTitle, currentLevel, segmento, ordem)
      chunks.push(...subChunks)
      ordem += subChunks.length
    } else {
      chunks.push({
        hash_conteudo: sha256(content),
        conteudo: content,
        segmento,
        titulo_secao: currentTitle,
        nivel: currentLevel,
        tokens,
        ordem: ordem++,
      })
    }
    currentContent = []
  }

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,4})\s+(.+)/)
    if (headerMatch) {
      flushChunk()
      currentLevel = headerMatch[1].length
      currentTitle = headerMatch[2].trim()
      currentContent.push(line)
    } else {
      currentContent.push(line)
    }
  }
  flushChunk()

  return chunks
}

function splitLargeChunk(
  content: string,
  title: string,
  level: number,
  segmento: string,
  startOrdem: number,
): KbChunk[] {
  const paragraphs = content.split(/\n\n+/)
  const results: KbChunk[] = []
  let buffer: string[] = []
  let bufferTokens = 0
  let subOrdem = startOrdem

  for (const para of paragraphs) {
    const paraTokens = estimateTokens(para)
    if (bufferTokens + paraTokens > MAX_CHUNK_TOKENS && buffer.length > 0) {
      const text = buffer.join('\n\n').trim()
      results.push({
        hash_conteudo: sha256(text),
        conteudo: text,
        segmento,
        titulo_secao: title,
        nivel: level,
        tokens: estimateTokens(text),
        ordem: subOrdem++,
      })
      buffer = []
      bufferTokens = 0
    }
    buffer.push(para)
    bufferTokens += paraTokens
  }

  if (buffer.length > 0) {
    const text = buffer.join('\n\n').trim()
    results.push({
      hash_conteudo: sha256(text),
      conteudo: text,
      segmento,
      titulo_secao: title,
      nivel: level,
      tokens: estimateTokens(text),
      ordem: subOrdem++,
    })
  }

  return results
}

async function generateEmbeddings(
  _genAI: GoogleGenAI,
  texts: string[],
): Promise<number[][]> {
  // RETRIEVAL_DOCUMENT: vetor otimizado para o lado "documento" da busca
  // (a query usa RETRIEVAL_QUERY em kb-search.ts). 768 dims casa com vector(768).
  // Uma chamada por texto (o modelo nao faz batch real), em paralelo pela janela.
  const vetores = await Promise.all(
    texts.map((text) => embedarTexto(text, 'RETRIEVAL_DOCUMENT')),
  )
  return vetores.map((v) => {
    if (v.length !== EMBEDDING_DIMS) {
      throw new Error(`[ingest] embedding com dimensao inesperada: ${v.length} (esperado ${EMBEDDING_DIMS})`)
    }
    return v
  })
}

function vectorToSql(vec: number[]): string {
  return `[${vec.join(',')}]`
}

async function ingest() {
  const apiKey = process.env.GEMINI_API_KEY
  const dbUrl = process.env.DATABASE_URL
  if (!apiKey) throw new Error('GEMINI_API_KEY obrigatoria')
  if (!dbUrl) throw new Error('DATABASE_URL obrigatoria')

  const genAI = new GoogleGenAI({ apiKey })

  // Importar pg dinamicamente (disponivel no monorepo)
  const { Client } = await import('pg')
  const client = new Client({ connectionString: dbUrl })
  await client.connect()

  // Garantir extensao vector
  await client.query('CREATE EXTENSION IF NOT EXISTS vector')

  // Carregar e chunkar KB + segmentos
  const allChunks: KbChunk[] = []
  const versao = new Date().toISOString().slice(0, 10)

  // Chunkar segmentos individuais
  if (fs.existsSync(SEGMENTS_DIR)) {
    const files = fs.readdirSync(SEGMENTS_DIR).filter((f) => f.endsWith('.txt'))
    for (const file of files) {
      const segmento = file.replace('.txt', '')
      const content = fs.readFileSync(path.join(SEGMENTS_DIR, file), 'utf-8')
      const chunks = chunkByMarkdownHeaders(content, segmento)
      allChunks.push(...chunks)
    }
  }

  // Chunkar KB completa para conteudo nao coberto por segmentos
  if (fs.existsSync(KB_PATH)) {
    const fullKb = fs.readFileSync(KB_PATH, 'utf-8')
    const segmentedHashes = new Set(allChunks.map((c) => c.hash_conteudo))
    const generalChunks = chunkByMarkdownHeaders(fullKb, 'geral')
      .filter((c) => !segmentedHashes.has(c.hash_conteudo))
    allChunks.push(...generalChunks)
  }

  console.log(`[INGEST] ${allChunks.length} chunks gerados (${allChunks.reduce((s, c) => s + c.tokens, 0)} tokens total)`)

  // Gerar embeddings em batches
  const embeddings: number[][] = []
  for (let i = 0; i < allChunks.length; i += BATCH_SIZE) {
    const batch = allChunks.slice(i, i + BATCH_SIZE)
    const batchEmbeddings = await generateEmbeddings(
      genAI,
      batch.map((c) => c.conteudo),
    )
    embeddings.push(...batchEmbeddings)
    console.log(`[INGEST] Embeddings: ${Math.min(i + BATCH_SIZE, allChunks.length)}/${allChunks.length}`)
    if (i + BATCH_SIZE < allChunks.length) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  // A base de conhecimento e GLOBAL (identica para toda organizacao — sao docs
  // da plataforma, nao dados de tenant). Fica no schema public, uma unica copia,
  // que e exatamente onde kb-search.ts consulta (search_path default = public).
  const SCHEMA_KB = 'public'
  console.log(`[INGEST] Processando schema: ${SCHEMA_KB}`)
  await upsertChunksInSchema(client, SCHEMA_KB, allChunks, embeddings, versao)

  // Limpar chunks de versoes antigas
  if (await tabelaKbExiste(client, SCHEMA_KB)) {
    await client.query(`
      DELETE FROM "${SCHEMA_KB}"."gabi_kb_chunk"
      WHERE versao_kb_gabi_kb_chunk != $1
    `, [versao])
  }

  await client.end()
  console.log(`[INGEST] Concluido! ${allChunks.length} chunks no schema ${SCHEMA_KB}. Versao: ${versao}`)
}

async function tabelaKbExiste(
  client: import('pg').Client,
  schemaName: string,
): Promise<boolean> {
  const { rows } = await client.query<{ existe: boolean }>(
    `SELECT to_regclass($1) IS NOT NULL AS existe`,
    [`"${schemaName}".gabi_kb_chunk`],
  )
  return rows[0]?.existe === true
}

async function upsertChunksInSchema(
  client: import('pg').Client,
  schemaName: string,
  chunks: KbChunk[],
  embeddings: number[][],
  versao: string,
) {
  if (!(await tabelaKbExiste(client, schemaName))) {
    console.log(`[INGEST] schema ${schemaName} sem tabela gabi_kb_chunk — pulando (schema nao composto com o fragment da Gabi)`)
    return
  }

  // Garantir tabela tem indice HNSW (idempotente)
  await client.query(`
    CREATE INDEX IF NOT EXISTS gkc_embedding_hnsw_idx
    ON "${schemaName}"."gabi_kb_chunk"
    USING hnsw (embedding_gabi_kb_chunk vector_cosine_ops)
    WITH (m = 16, ef_construction = 64)
  `).catch(() => {
    // Indice ja pode existir ou tabela pode nao existir ainda
  })

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = embeddings[i]
    const vecSql = vectorToSql(embedding)

    await client.query(`
      INSERT INTO "${schemaName}"."gabi_kb_chunk" (
        id_gabi_kb_chunk,
        hash_conteudo_gabi_kb_chunk,
        conteudo_gabi_kb_chunk,
        embedding_gabi_kb_chunk,
        segmento_gabi_kb_chunk,
        titulo_secao_gabi_kb_chunk,
        nivel_gabi_kb_chunk,
        tokens_gabi_kb_chunk,
        versao_kb_gabi_kb_chunk,
        ordem_gabi_kb_chunk,
        data_criacao_gabi_kb_chunk,
        data_atualizacao_gabi_kb_chunk
      ) VALUES (
        gen_random_uuid()::text,
        $1, $2, $3::vector, $4, $5, $6, $7, $8, $9, NOW(), NOW()
      )
      ON CONFLICT (hash_conteudo_gabi_kb_chunk) DO UPDATE SET
        conteudo_gabi_kb_chunk = EXCLUDED.conteudo_gabi_kb_chunk,
        embedding_gabi_kb_chunk = EXCLUDED.embedding_gabi_kb_chunk,
        segmento_gabi_kb_chunk = EXCLUDED.segmento_gabi_kb_chunk,
        titulo_secao_gabi_kb_chunk = EXCLUDED.titulo_secao_gabi_kb_chunk,
        nivel_gabi_kb_chunk = EXCLUDED.nivel_gabi_kb_chunk,
        tokens_gabi_kb_chunk = EXCLUDED.tokens_gabi_kb_chunk,
        versao_kb_gabi_kb_chunk = EXCLUDED.versao_kb_gabi_kb_chunk,
        ordem_gabi_kb_chunk = EXCLUDED.ordem_gabi_kb_chunk,
        data_atualizacao_gabi_kb_chunk = NOW()
    `, [
      chunk.hash_conteudo,
      chunk.conteudo,
      vecSql,
      chunk.segmento,
      chunk.titulo_secao,
      chunk.nivel,
      chunk.tokens,
      versao,
      chunk.ordem,
    ])
  }
}

ingest().catch((err) => {
  console.error('[INGEST] ERRO:', err)
  process.exit(1)
})
