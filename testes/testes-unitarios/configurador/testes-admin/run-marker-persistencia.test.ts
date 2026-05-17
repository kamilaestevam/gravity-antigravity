// @vitest-environment node
// Testes unitários para o sistema de run marker persistido em arquivo.
// Garante que o status de execução de testes sobrevive a restarts do servidor.

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { existsSync, writeFileSync, readFileSync, mkdirSync, unlinkSync, rmSync, renameSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')

const tmpDir = path.join(root, 'testes', 'testes-unitarios', 'configurador', 'testes-admin', '_tmp-run-marker')
const MARKER_PATH = path.join(tmpDir, '_current-run.json')

interface RunMarker {
  status: 'running' | 'completed'
  pid: number
  started_at: string
  runId: string
}

function readRunMarker(): RunMarker | null {
  try {
    if (!existsSync(MARKER_PATH)) return null
    return JSON.parse(readFileSync(MARKER_PATH, 'utf-8')) as RunMarker
  } catch { return null }
}

function writeRunMarker(marker: RunMarker): void {
  mkdirSync(tmpDir, { recursive: true })
  const tmpPath = MARKER_PATH + '.tmp'
  writeFileSync(tmpPath, JSON.stringify(marker, null, 2))
  renameSync(tmpPath, MARKER_PATH)
}

function clearRunMarker(): void {
  try { unlinkSync(MARKER_PATH) } catch { /* ok */ }
}

function isProcessAlive(pid: number): boolean {
  try { process.kill(pid, 0); return true } catch { return false }
}

// ─── Setup / Teardown ───────────────────────────────────────────────────────

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true })
  clearRunMarker()
})

afterEach(() => {
  try { rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ok */ }
})

// ─── readRunMarker ──────────────────────────────────────────────────────────

describe('readRunMarker', () => {
  it('retorna null quando arquivo não existe', () => {
    expect(readRunMarker()).toBeNull()
  })

  it('retorna marker quando arquivo existe e é válido', () => {
    const marker: RunMarker = {
      status: 'running',
      pid: 12345,
      started_at: '2026-05-17T20:00:00.000Z',
      runId: '1747515600000',
    }
    writeFileSync(MARKER_PATH, JSON.stringify(marker))
    expect(readRunMarker()).toEqual(marker)
  })

  it('retorna null quando arquivo tem JSON inválido', () => {
    writeFileSync(MARKER_PATH, 'not json{{{')
    expect(readRunMarker()).toBeNull()
  })
})

// ─── writeRunMarker ─────────────────────────────────────────────────────────

describe('writeRunMarker', () => {
  it('cria arquivo com dados do marker', () => {
    const marker: RunMarker = {
      status: 'running',
      pid: 99999,
      started_at: '2026-05-17T21:00:00.000Z',
      runId: '1747519200000',
    }
    writeRunMarker(marker)
    expect(existsSync(MARKER_PATH)).toBe(true)

    const saved = JSON.parse(readFileSync(MARKER_PATH, 'utf-8'))
    expect(saved.status).toBe('running')
    expect(saved.pid).toBe(99999)
    expect(saved.runId).toBe('1747519200000')
  })

  it('sobrescreve marker existente', () => {
    writeRunMarker({ status: 'running', pid: 1, started_at: '', runId: 'old' })
    writeRunMarker({ status: 'completed', pid: 2, started_at: '', runId: 'new' })

    const saved = readRunMarker()
    expect(saved?.runId).toBe('new')
    expect(saved?.status).toBe('completed')
  })
})

// ─── clearRunMarker ─────────────────────────────────────────────────────────

describe('clearRunMarker', () => {
  it('remove arquivo existente', () => {
    writeFileSync(MARKER_PATH, '{}')
    clearRunMarker()
    expect(existsSync(MARKER_PATH)).toBe(false)
  })

  it('não falha quando arquivo não existe', () => {
    expect(() => clearRunMarker()).not.toThrow()
  })
})

// ─── isProcessAlive ─────────────────────────────────────────────────────────

describe('isProcessAlive', () => {
  it('retorna true para PID do processo atual', () => {
    expect(isProcessAlive(process.pid)).toBe(true)
  })

  it('retorna false para PID inexistente', () => {
    expect(isProcessAlive(999999999)).toBe(false)
  })
})
