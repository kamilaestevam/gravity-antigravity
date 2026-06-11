import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import type { TestLogEntry } from '../utils/playwright-parser.js'
import { enrichNewFailuresWithGemini } from './enrich-test-failures.js'
import { persistirEntradasTeste, type PersistTesteContexto } from './teste-persist.js'
import { prepararEntradaEmtParaPersistencia } from './emt-artifacts.js'

export const testLogsDir = join(process.cwd(), 'data', 'test-logs')

const DAILY_LOG_FILE = /^\d{4}-\d{2}-\d{2}\.json$/

export function listDailyTestLogFiles(maxDays = 7): string[] {
  if (!existsSync(testLogsDir)) return []
  return readdirSync(testLogsDir)
    .filter(f => DAILY_LOG_FILE.test(f))
    .sort()
    .reverse()
    .slice(0, maxDays)
}

export async function appendTestLogEntries(
  entries: TestLogEntry[],
  debugLog?: (msg: string) => void,
  createdAt?: string,
  ctx: PersistTesteContexto = {},
): Promise<void> {
  const created_at = createdAt ?? new Date().toISOString()
  const contexto: PersistTesteContexto = { ...ctx, data_criacao_teste: created_at }

  const entradasNormalizadas = entries.map(e =>
    e.type === 'EMT' ? prepararEntradaEmtParaPersistencia(e) : e,
  )

  const { ids, salvouNoBanco } = await persistirEntradasTeste(entradasNormalizadas, contexto, debugLog)

  if (salvouNoBanco) {
    debugLog?.(`DB persistiu ${ids.length} entrada(s)`)
    enrichNewFailuresWithGemini(
      entradasNormalizadas.map((e, i) => ({ id: ids[i] ?? `${Date.now()}-${i}`, result: e.result, ...e })),
      '',
    )
    return
  }

  mkdirSync(testLogsDir, { recursive: true })
  const filePath = join(testLogsDir, `${created_at.slice(0, 10)}.json`)
  let existing: unknown[] = []
  try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
  const novosLogs = entradasNormalizadas.map((e, i) => ({ id: `${Date.now()}-${i}`, created_at, ...e }))
  try {
    writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))
    debugLog?.(`WROTE ${novosLogs.length} entries to ${filePath} (fallback JSON)`)
    enrichNewFailuresWithGemini(novosLogs, filePath)
  } catch (writeErr) {
    debugLog?.(`WRITE FAILED: ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`)
  }
}
