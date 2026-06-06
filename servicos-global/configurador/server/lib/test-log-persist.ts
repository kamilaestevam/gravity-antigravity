import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import type { TestLogEntry } from '../utils/playwright-parser.js'

export const testLogsDir = join(process.cwd(), 'data', 'test-logs')

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
  } catch (writeErr) {
    debugLog?.(`WRITE FAILED: ${writeErr instanceof Error ? writeErr.message : String(writeErr)}`)
  }
}
