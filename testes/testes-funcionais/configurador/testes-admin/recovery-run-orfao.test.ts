// @vitest-environment node
// Teste funcional: recovery de runs órfãos de testes Playwright.
// Simula cenário onde servidor reinicia durante execução de testes,
// deixando um arquivo de output Playwright sem processar.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, writeFileSync, readFileSync, mkdirSync, rmSync, unlinkSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { walkSuite, type TestLogEntry } from '../../../../servicos-global/configurador/server/utils/playwright-parser.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const tmpDir = path.join(__dirname, '_tmp-recovery')

interface RunMarker {
  status: 'running' | 'completed'
  pid: number
  started_at: string
  runId: string
}

function processOrphanedRun(dir: string, markerPath: string): number {
  let markerRaw: string
  try { markerRaw = readFileSync(markerPath, 'utf-8') } catch { return 0 }
  const marker = JSON.parse(markerRaw) as RunMarker

  const stdoutPath = path.join(dir, `playwright-run-${marker.runId}.json`)
  if (!existsSync(stdoutPath)) {
    try { unlinkSync(markerPath) } catch { /* ok */ }
    return 0
  }

  const entries: TestLogEntry[] = []
  try {
    const raw = readFileSync(stdoutPath, 'utf-8').trim()
    if (raw) {
      const parsed = JSON.parse(raw) as { suites?: unknown[] }
      for (const suite of (parsed.suites ?? [])) {
        walkSuite(suite as Parameters<typeof walkSuite>[0], entries)
      }
    }
  } catch {
    entries.push({
      type: 'E2E', module: 'playwright/recovery',
      test_name: 'Recovery de run órfão',
      result: 'ERRO',
      duration: '0ms',
      error_log: 'Run não produziu JSON válido (servidor reiniciou durante execução)',
      ai_analysis: null,
    })
  }

  if (entries.length > 0) {
    const filePath = path.join(dir, `${marker.started_at.slice(0, 10)}.json`)
    let existing: unknown[] = []
    try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
    const novosLogs = entries.map((e, i) => ({
      id: `recovery-${Date.now()}-${i}`,
      created_at: marker.started_at,
      ...e,
    }))
    writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))
  }

  try { unlinkSync(stdoutPath) } catch { /* ok */ }
  try { unlinkSync(markerPath) } catch { /* ok */ }

  return entries.length
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true })
})

afterEach(() => {
  try { rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ok */ }
})

// ─── Recovery de run órfão ──────────────────────────────────────────────────

describe('processOrphanedRun — recovery de runs órfãos', () => {
  it('processa JSON válido do Playwright e gera daily entries', () => {
    const runId = '1747519200000'
    const markerPath = path.join(tmpDir, '_current-run.json')

    const marker: RunMarker = {
      status: 'running',
      pid: 999999999,
      started_at: '2026-05-17T21:00:00.000Z',
      runId,
    }
    writeFileSync(markerPath, JSON.stringify(marker))

    const playwrightOutput = {
      suites: [{
        title: 'test-suite',
        file: 'test.spec.ts',
        specs: [{
          title: 'deve funcionar',
          ok: true,
          tests: [{ projectName: 'pedido', results: [{ status: 'passed', duration: 1500 }] }],
        }, {
          title: 'deve falhar com input inválido',
          ok: false,
          tests: [{ projectName: 'pedido', results: [{ status: 'failed', duration: 800, error: { message: 'Expected visible' } }] }],
        }],
      }],
    }
    writeFileSync(path.join(tmpDir, `playwright-run-${runId}.json`), JSON.stringify(playwrightOutput))

    const count = processOrphanedRun(tmpDir, markerPath)

    expect(count).toBe(2)

    const dailyPath = path.join(tmpDir, '2026-05-17.json')
    expect(existsSync(dailyPath)).toBe(true)

    const entries = JSON.parse(readFileSync(dailyPath, 'utf-8'))
    expect(entries).toHaveLength(2)
    expect(entries[0].result).toBe('APROVADO')
    expect(entries[1].result).toBe('REPROVADO')
    expect(entries[1].ai_analysis).toBeTruthy()
    expect(entries[1].ai_analysis.erroResumo).toBeTruthy()

    expect(existsSync(path.join(tmpDir, `playwright-run-${runId}.json`))).toBe(false)
    expect(existsSync(markerPath)).toBe(false)
  })

  it('gera entrada de ERRO quando JSON do Playwright é inválido', () => {
    const runId = '1747519200001'
    const markerPath = path.join(tmpDir, '_current-run.json')

    writeFileSync(markerPath, JSON.stringify({
      status: 'running', pid: 999999999,
      started_at: '2026-05-17T22:00:00.000Z', runId,
    }))
    writeFileSync(path.join(tmpDir, `playwright-run-${runId}.json`), 'not valid json{{{')

    const count = processOrphanedRun(tmpDir, markerPath)

    expect(count).toBe(1)

    const dailyPath = path.join(tmpDir, '2026-05-17.json')
    const entries = JSON.parse(readFileSync(dailyPath, 'utf-8'))
    expect(entries[0].result).toBe('ERRO')
    expect(entries[0].module).toBe('playwright/recovery')
  })

  it('retorna 0 e limpa marker quando não há arquivo de output', () => {
    const markerPath = path.join(tmpDir, '_current-run.json')
    writeFileSync(markerPath, JSON.stringify({
      status: 'running', pid: 999999999,
      started_at: '2026-05-17T23:00:00.000Z', runId: 'sem-output',
    }))

    const count = processOrphanedRun(tmpDir, markerPath)
    expect(count).toBe(0)
    expect(existsSync(markerPath)).toBe(false)
  })

  it('merge com entries existentes no arquivo do dia', () => {
    const runId = '1747519200002'
    const markerPath = path.join(tmpDir, '_current-run.json')

    writeFileSync(markerPath, JSON.stringify({
      status: 'running', pid: 999999999,
      started_at: '2026-05-17T20:00:00.000Z', runId,
    }))

    const existingEntries = [{ id: 'old-1', created_at: '2026-05-17T10:00:00.000Z', test_name: 'teste antigo', result: 'APROVADO' }]
    writeFileSync(path.join(tmpDir, '2026-05-17.json'), JSON.stringify(existingEntries))

    const playwrightOutput = {
      suites: [{
        title: 'suite',
        specs: [{ title: 'novo teste', ok: true, tests: [{ results: [{ status: 'passed', duration: 100 }] }] }],
      }],
    }
    writeFileSync(path.join(tmpDir, `playwright-run-${runId}.json`), JSON.stringify(playwrightOutput))

    processOrphanedRun(tmpDir, markerPath)

    const entries = JSON.parse(readFileSync(path.join(tmpDir, '2026-05-17.json'), 'utf-8'))
    expect(entries).toHaveLength(2)
    expect(entries[0].id).toBe('old-1')
    expect(entries[1].result).toBe('APROVADO')
  })
})
