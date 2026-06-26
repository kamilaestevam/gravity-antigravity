/**
 * gemini-gerar-conteudo-smart-read.ts — wrapper REST Gemini com usageMetadata real
 */

import type { UsoLlmChamadaLeituraSmartRead } from '../../../shared/uso-llm-leitura-smart-read.js'
import { calcularCustoUsdGeminiLeituraSmartRead } from '../../../shared/uso-llm-leitura-smart-read.js'

export type ResultadoGeminiGerarConteudoSmartRead = {
  texto: string
  modelo: string
  uso: UsoLlmChamadaLeituraSmartRead
  custo_usd: number
}

type UsageMetadataGemini = {
  promptTokenCount?: number
  candidatesTokenCount?: number
  totalTokenCount?: number
}

function extrairUsoGemini(
  usage: UsageMetadataGemini | undefined,
  modelo: string,
): Pick<ResultadoGeminiGerarConteudoSmartRead, 'uso' | 'custo_usd'> {
  const tokens_entrada = usage?.promptTokenCount ?? 0
  const tokens_saida = usage?.candidatesTokenCount ?? 0
  const tokens_total =
    usage?.totalTokenCount ?? (tokens_entrada + tokens_saida > 0 ? tokens_entrada + tokens_saida : 0)
  const uso: UsoLlmChamadaLeituraSmartRead = {
    tokens_entrada,
    tokens_saida,
    tokens_total,
  }
  return {
    uso,
    custo_usd: calcularCustoUsdGeminiLeituraSmartRead(modelo, tokens_entrada, tokens_saida),
  }
}

export type ParametrosGeminiGerarConteudoSmartRead = {
  modelo: string
  systemInstruction: string
  promptUsuario: string
  generationConfig?: Record<string, unknown>
  timeoutMs?: number
}

export async function gerarConteudoGeminiSmartRead(
  params: ParametrosGeminiGerarConteudoSmartRead,
): Promise<ResultadoGeminiGerarConteudoSmartRead> {
  const apiKey = process.env.GEMINI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ausente')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${params.modelo}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: params.systemInstruction }] },
        contents: [{ parts: [{ text: params.promptUsuario }] }],
        generationConfig: params.generationConfig,
      }),
      signal: AbortSignal.timeout(params.timeoutMs ?? 60_000),
    },
  )

  if (!response.ok) {
    const detalhe = await response.text()
    throw new Error(`Gemini HTTP ${response.status}: ${detalhe.slice(0, 200)}`)
  }

  const payload = (await response.json()) as {
    usageMetadata?: UsageMetadataGemini
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }

  const texto = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  const { uso, custo_usd } = extrairUsoGemini(payload.usageMetadata, params.modelo)

  return {
    texto,
    modelo: params.modelo,
    uso,
    custo_usd,
  }
}
