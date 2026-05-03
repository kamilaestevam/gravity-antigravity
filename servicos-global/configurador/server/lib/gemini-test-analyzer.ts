// server/lib/gemini-test-analyzer.ts
// Analisa falhas de teste via Gemini 2.0 Flash/Pro com fallback heuristico
// Template: skills/testes/analista-erros-testes-gemini/integracao.md

import { GoogleGenerativeAI } from '@google/generative-ai'
import crypto from 'crypto'
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateAiAnalysis as fallbackHeuristic } from '../utils/playwright-parser.js'
import {
  AiAnalysisSchema,
  validateDiffAgainstSource,
  type AiAnalysis,
} from './test-schemas.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ─── Inputs ──────────────────────────────────────────────────────────────────

export interface AnalyzeInput {
  errorLog:              string
  testName:              string
  specFilePath:          string
  specFileContent:       string
  componentFilePath?:    string | null
  componentFileContent?: string | null
  mapeamentoTestids?:    Record<string, unknown> | null
  lastCommitsTouching?:  Array<{ hash: string; autor: string; data: string; mensagem: string }>
  screenshot?:           string | null
  forceRefresh?:         boolean
}

// ─── Cache em memoria (TTL 24h) ──────────────────────────────────────────────

const cache = new Map<string, { analysis: AiAnalysis; expires: number }>()
const CACHE_TTL_MS = 24 * 60 * 60 * 1000

function hashError(input: AnalyzeInput): string {
  return crypto
    .createHash('sha256')
    .update(`${input.errorLog}::${input.testName}`)
    .digest('hex')
    .slice(0, 16)
}

// ─── Metricas ────────────────────────────────────────────────────────────────

interface MetricEntry {
  timestamp:     string
  modelo:        string
  cacheHit:      boolean
  tokensInput:   number
  tokensOutput:  number
  duracaoMs:     number
  confianca:     string
  categoria:     string
  validouDiff:   boolean
  validouSchema: boolean
}

let cacheHits = 0
let cacheMisses = 0

function logMetric(entry: MetricEntry): void {
  const today = new Date().toISOString().slice(0, 10)
  const metricsDir = resolve(process.cwd(), 'data/test-logs/_metrics')
  const metricsFile = resolve(metricsDir, `${today}.json`)

  try {
    if (!existsSync(metricsDir)) {
      mkdirSync(metricsDir, { recursive: true })
    }
    const existing: MetricEntry[] = existsSync(metricsFile)
      ? JSON.parse(readFileSync(metricsFile, 'utf-8'))
      : []
    existing.push(entry)
    writeFileSync(metricsFile, JSON.stringify(existing, null, 2), 'utf-8')
  } catch {
    console.error('[gemini-test-analyzer] Falha ao gravar metrica')
  }
}

// ─── Cliente Gemini ──────────────────────────────────────────────────────────

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.warn('[gemini-test-analyzer] GEMINI_API_KEY nao definida — usando apenas fallback heuristico')
}
const genai = apiKey ? new GoogleGenerativeAI(apiKey) : null

// Carrega o prompt mestre uma vez na inicializacao
// CORRIGIDO: path correto e skills/testes/ (nao skills/arquitetura/)
const PROMPT_MESTRE_PATH = resolve(
  __dirname,
  '../../../../skills/testes/analista-erros-testes-gemini/prompt-mestre.md',
)
const PROMPT_MESTRE = existsSync(PROMPT_MESTRE_PATH)
  ? extractSystemPrompt(readFileSync(PROMPT_MESTRE_PATH, 'utf-8'))
  : ''

function extractSystemPrompt(markdown: string): string {
  const match = markdown.match(/## System Prompt[\s\S]*?```\n([\s\S]*?)\n```/)
  return match?.[1] ?? ''
}

// ─── Funcao principal ────────────────────────────────────────────────────────

export async function analyzeTestFailure(input: AnalyzeInput): Promise<AiAnalysis> {
  const hash = hashError(input)

  // 1. Cache
  if (!input.forceRefresh) {
    const cached = cache.get(hash)
    if (cached && cached.expires > Date.now()) {
      cacheHits++
      return cached.analysis
    }
  }
  cacheMisses++

  // 2. Sem API key → fallback direto
  if (!genai) {
    return toFullAnalysis(fallbackHeuristic(input.errorLog, input.specFilePath))
  }

  // 3. Tenta Gemini Flash
  const startMs = Date.now()
  try {
    const analysis = await callGemini(input, 'gemini-2.0-flash', startMs)
    if (analysis.confianca === 'baixa') {
      // Escala pro Pro
      try {
        const proAnalysis = await callGemini(input, 'gemini-2.0-pro', startMs)
        if (proAnalysis.confianca !== 'baixa') {
          cache.set(hash, { analysis: proAnalysis, expires: Date.now() + CACHE_TTL_MS })
          return proAnalysis
        }
      } catch {
        // mantem o do flash
      }
    }
    cache.set(hash, { analysis, expires: Date.now() + CACHE_TTL_MS })
    return analysis
  } catch (err) {
    console.error('[gemini-test-analyzer] Falha no Gemini, usando fallback:', err)
    return toFullAnalysis(fallbackHeuristic(input.errorLog, input.specFilePath))
  }
}

// ─── Chamada ao Gemini com retry ─────────────────────────────────────────────

async function callGemini(
  input: AnalyzeInput,
  modelName: string,
  startMs: number,
): Promise<AiAnalysis> {
  const model = genai!.getGenerativeModel({
    model: modelName,
    systemInstruction: PROMPT_MESTRE,
    generationConfig: {
      temperature:      0.2,
      topP:             0.8,
      topK:             40,
      maxOutputTokens:  2048,
      responseMimeType: 'application/json',
    },
  })

  const userMessage = JSON.stringify({
    errorLog:             input.errorLog.slice(0, 4000),
    testName:             input.testName,
    specFilePath:         input.specFilePath,
    specFileContent:      input.specFileContent.slice(0, 8000),
    componentFilePath:    input.componentFilePath ?? null,
    componentFileContent: input.componentFileContent?.slice(0, 8000) ?? null,
    mapeamentoTestids:    input.mapeamentoTestids ?? null,
    lastCommitsTouching:  input.lastCommitsTouching ?? [],
  })

  // Retry com backoff: 1s, 3s, 9s
  let lastErr: Error | null = null
  for (const delay of [0, 1000, 3000, 9000]) {
    if (delay) await new Promise(r => setTimeout(r, delay))
    try {
      const result = await model.generateContent(userMessage)
      const text = result.response.text()
      const json: unknown = JSON.parse(text)
      const parsed = AiAnalysisSchema.parse(json)

      // Validacao anti-alucinacao
      const haystack = (input.specFileContent + '\n' + (input.componentFileContent ?? ''))
      const validated = validateDiffAgainstSource(parsed, haystack)

      validated.modeloUsado = modelName
      validated.tokensUsados = result.response.usageMetadata?.totalTokenCount ?? 0

      // Registra metrica
      logMetric({
        timestamp:     new Date().toISOString(),
        modelo:        modelName,
        cacheHit:      false,
        tokensInput:   result.response.usageMetadata?.promptTokenCount ?? 0,
        tokensOutput:  result.response.usageMetadata?.candidatesTokenCount ?? 0,
        duracaoMs:     Date.now() - startMs,
        confianca:     validated.confianca,
        categoria:     validated.categoria,
        validouDiff:   validated.codigoDiff !== null,
        validouSchema: true,
      })

      return validated
    } catch (e) {
      lastErr = e as Error
    }
  }
  throw lastErr ?? new Error('Gemini call failed after retries')
}

// ─── Conversao do legado heuristico pro formato novo ─────────────────────────

function toFullAnalysis(heuristic: ReturnType<typeof fallbackHeuristic>): AiAnalysis {
  if (!heuristic) {
    return {
      erroResumo:       'Falha nao classificada',
      motivo:           'Analise indisponivel — Gemini fora e heuristica nao conseguiu classificar. Abra o erro bruto para investigar.',
      sugestaoCorrecao: 'Abra o erro bruto na expansao do log e investigue manualmente.',
      arquivo:          'desconhecido',
      codigoDiff:       null,
      categoria:        'NAO_CLASSIFICAVEL',
      confianca:        'baixa',
      commitSuspeito:   null,
    }
  }
  return {
    erroResumo:       heuristic.erroResumo,
    motivo:           heuristic.motivo,
    sugestaoCorrecao: heuristic.sugestaoCorrecao,
    arquivo:          heuristic.arquivo,
    codigoDiff:       heuristic.codigoDiff
      ? { arquivo: heuristic.arquivo, old: heuristic.codigoDiff.old, new: heuristic.codigoDiff.new, explicacao: 'Sugestao heuristica (sem Gemini)' }
      : null,
    categoria:        'NAO_CLASSIFICAVEL',
    confianca:        'baixa',
    commitSuspeito:   null,
  }
}

// ─── Metricas expostas via /admin/metricas-llm (model LLMMetricas) ───────────

export function getMetrics(): {
  cacheSize: number
  cacheHits: number
  cacheMisses: number
  hitRate: number
} {
  const total = cacheHits + cacheMisses
  return {
    cacheSize:   cache.size,
    cacheHits,
    cacheMisses,
    hitRate:     total > 0 ? Math.round((cacheHits / total) * 100) : 0,
  }
}
