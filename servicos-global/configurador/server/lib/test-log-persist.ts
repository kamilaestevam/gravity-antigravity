import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'
import type { TestLogEntry } from '../utils/playwright-parser.js'
import { enrichNewFailuresWithGemini } from './enrich-test-failures.js'

export const testLogsDir = join(process.cwd(), 'data', 'test-logs')

/** Arquivos diários YYYY-MM-DD.json — exclui emt-manifest, emt-runner-pid, playwright-run. */
const DAILY_LOG_FILE = /^\d{4}-\d{2}-\d{2}\.json$/

export function listDailyTestLogFiles(maxDays = 7): string[] {
  if (!existsSync(testLogsDir)) return []
  return readdirSync(testLogsDir)
    .filter(f => DAILY_LOG_FILE.test(f))
    .sort()
    .reverse()
    .slice(0, maxDays)
}

export function appendTestLogEntries(
  entries: TestLogEntry[],
  debugLog?: (msg: string) => void,
  createdAt?: string,
): void {
  const created_at = createdAt ?? new Date().toISOString()
  mkdirSync(testLogsDir, { recursive: true })
  const filePath = join(testLogsDir, `${created_at.slice(0, 10)}.json`)
  let existing: unknown[] = []
  try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
  const novosLogs = entries.map((e, i) => ({
    id: `${Date.now()}-${i}`,
    created_at,
    ...e,
  }))
  try {
    writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))
    debugLog?.(`WROTE ${novosLogs.length} entries to ${filePath}`)
    enrichNewFailuresWithGemini(novosLogs, filePath)
  } catch (writeErr) {
    debugLog?.(`WRITE FAILED: ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`)
  }
}
