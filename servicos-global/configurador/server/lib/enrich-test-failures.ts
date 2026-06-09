import { readFileSync, writeFileSync } from 'fs'
import { analyzeTestFailure } from './gemini-test-analyzer.js'
import { readSpecFileContent } from './test-spec-content.js'
import { atualizarCampoTeste } from './teste-persist.js'
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
  if (!filePath) return
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
      .then(async analysis => {
        if (filePath) atualizarAnaliseNoArquivo(filePath, falha.id, analysis)
        else {
          const ok = await atualizarCampoTeste(falha.id, 'analise_ia_teste', analysis)
          if (!ok) console.error(`[enrich-test-failures] Falha DB para ${falha.id}`)
        }
      })
      .catch(err => console.error(`[enrich-test-failures] Gemini falhou para ${falha.id}:`, err))
  }
}
