// server/lib/modelos-gemini.ts
// Fonte unica de verdade dos modelos Gemini usados pela Gabi:
// cadeia de fallback, precos por 1M tokens e calculo de custo.
//
// Antes vivia duplicado em services/orquestrador-agente.ts e services/gemini.ts.
// Precos em USD por 1M tokens — fonte: https://ai.google.dev/gemini-api/docs/pricing
// (conferido em 2026-07). "inputCached" = leitura de context cache (cachedContents).

/**
 * Cadeia de modelos tentados em ordem: se o primeiro falhar (erro de API,
 * resposta vazia, indisponibilidade), cai para o proximo.
 *
 * gemini-3.5-flash e o modelo primario (mais capaz em function calling + raciocinio).
 * Fallbacks descem para modelos mais baratos e estaveis.
 */
export const MODELS_CHAIN = [
  'gemini-3.5-flash',
  'gemini-2.5-flash',
  'gemini-2.5-pro',
] as const

export interface PrecoModelo {
  /** USD por 1M tokens de input "fresco" (nao cacheado). */
  input: number
  /** USD por 1M tokens de input lido do context cache. */
  inputCached: number
  /** USD por 1M tokens de output. */
  output: number
}

/**
 * Tabela de precos por modelo (USD / 1M tokens).
 * Para gemini-2.5-pro usamos o tier <= 200k tokens; com RAG + context caching
 * o input efetivo fica bem abaixo de 200k. Modelos ausentes usam o fallback
 * conservador de `precoPadrao`.
 */
export const MODEL_PRICING: Record<string, PrecoModelo> = {
  'gemini-3.5-flash':      { input: 1.50, inputCached: 0.15,  output: 9.00 },
  'gemini-2.5-flash':      { input: 0.30, inputCached: 0.03,  output: 2.50 },
  'gemini-2.5-pro':        { input: 1.25, inputCached: 0.125, output: 10.0 },
  'gemini-3-flash-preview':{ input: 0.50, inputCached: 0.05,  output: 3.00 },
  'gemini-3.1-flash-lite': { input: 0.25, inputCached: 0.025, output: 1.50 },
  'gemini-2.0-flash':      { input: 0.10, inputCached: 0.025, output: 0.40 },
}

const precoPadrao: PrecoModelo = { input: 1.0, inputCached: 0.25, output: 3.0 }

export function precoDoModelo(model: string): PrecoModelo {
  return MODEL_PRICING[model] ?? precoPadrao
}

/**
 * Custo em USD de uma chamada, dado o modelo e a contagem de tokens.
 * `cachedTokens` sao descontados de `tokensIn` (input fresco = in - cached).
 */
export function calcularCusto(
  model: string,
  tokensIn: number,
  tokensOut: number,
  cachedTokens = 0,
): number {
  const pricing = precoDoModelo(model)
  const freshTokens = Math.max(0, tokensIn - cachedTokens)
  return (
    freshTokens * pricing.input +
    cachedTokens * pricing.inputCached +
    tokensOut * pricing.output
  ) / 1_000_000
}

/** Modelo barato para tarefas auxiliares (extracao de memoria, titulos). */
export const MODELO_AUXILIAR = 'gemini-3.1-flash-lite'

/** Modelo de embedding do RAG (768 dims via outputDimensionality). */
export const MODELO_EMBEDDING = 'gemini-embedding-2'
export const EMBEDDING_DIMS = 768
