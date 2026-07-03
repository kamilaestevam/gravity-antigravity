// server/lib/embeddings-gemini.ts
// Helper unico de embeddings Gemini (gemini-embedding-2, 768 dims).
// Usado pelo RAG (kb-search / ingest) e pela memoria semantica.

import { GoogleGenAI } from '@google/genai'
import { MODELO_EMBEDDING, EMBEDDING_DIMS } from './modelos-gemini.js'

export type TipoTarefaEmbedding =
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY'

let _genAI: GoogleGenAI | null = null

function getGenAI(): GoogleGenAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY obrigatoria para embedding')
    _genAI = new GoogleGenAI({ apiKey })
  }
  return _genAI
}

/** Embeda um texto e retorna o vetor de 768 dims. */
export async function embedarTexto(
  texto: string,
  taskType: TipoTarefaEmbedding,
): Promise<number[]> {
  const result = await getGenAI().models.embedContent({
    model: MODELO_EMBEDDING,
    contents: texto,
    config: { outputDimensionality: EMBEDDING_DIMS, taskType },
  })
  const values = result.embeddings?.[0]?.values
  if (!values || values.length === 0) {
    throw new Error('[embeddings-gemini] embedContent retornou vetor vazio')
  }
  return values
}

/** Similaridade de cosseno entre dois vetores de mesma dimensao. */
export function similaridadeCosseno(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let produto = 0
  let normaA = 0
  let normaB = 0
  for (let i = 0; i < a.length; i++) {
    produto += a[i] * b[i]
    normaA += a[i] * a[i]
    normaB += b[i] * b[i]
  }
  if (normaA === 0 || normaB === 0) return 0
  return produto / (Math.sqrt(normaA) * Math.sqrt(normaB))
}
