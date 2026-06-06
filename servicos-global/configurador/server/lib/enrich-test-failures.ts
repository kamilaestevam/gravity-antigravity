import { readFileSync, writeFileSync } from 'fs'
import { analyzeTestFailure } from './gemini-test-analyzer.js'
import { readSpecFileContent } from './test-spec-content.js'
import type { AiAnalysis } from './test-schemas.js'

export type LogEntryGravado = {
  id: string
  result: string
  error_log?: string | null
  test_name?: string
  module?: string
  type?: string
}

function resultadoEhFalha(result: string): boolean {
  return result === 'REPROVADO' || result === 'ERRO' || result === 'ERRO_CATASTROFICO'
}

function atualizarAnaliseNoArquivo(filePath: string, id: string, analysis: AiAnalysis): void {
  try {
    const content = JSON.parse(readFileSync(filePath, 'utf-8')) as Array<Record<string, unknown>>
    const idx = content.findIndex(e => e.id === id)
    if (idx >= 0) {
      content[idx].ai_analysis = analysis
      writeFileSync(filePath, JSON.stringify(content, null, 2))
    }
  } catch {
    console.error(`[enrich-test-failures] Falha ao gravar análise para ${id}`)
  }
}

/**
 * Dispara análise Gemini (ou fallback heurístico) para falhas recém-gravadas.
 * Fire-and-forget — atualiza o JSON do dia quando cada análise concluir.
 */
export function enrichNewFailuresWithGemini(
  novosLogs: LogEntryGravado[],
  filePath: string,
): void {
  const falhas = novosLogs.filter(l => resultadoEhFalha(l.result))
  for (const falha of falhas) {
    if (!falha.error_log?.trim()) continue
    analyzeTestFailure({
      errorLog: falha.error_log ?? '',
      testName: String(falha.test_name ?? ''),
      specFilePath: `${String(falha.module ?? '')}/${String(falha.test_name ?? '')}`,
      specFileContent: readSpecFileContent(falha as Record<string, unknown>),
      forceRefresh: false,
    })
      .then(analysis => atualizarAnaliseNoArquivo(filePath, falha.id, analysis))
      .catch(err => {
        console.error(`[enrich-test-failures] Gemini falhou para ${falha.id}:`, err)
      })
  }
}
