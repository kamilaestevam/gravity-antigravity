// server/__tests__/test-artifacts.test.ts
// Testes unitários para gerenciamento de artefatos (retenção, limpeza, stats)

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { existsSync, readdirSync, statSync, unlinkSync, rmdirSync } from 'fs'

// Mock fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn(),
    unlinkSync: vi.fn(),
    rmdirSync: vi.fn(),
  }
})

import { cleanOldArtifacts, getArtifactStats } from '../lib/test-artifacts.js'

describe('cleanOldArtifacts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna zero quando diretórios não existem', () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const result = cleanOldArtifacts()
    expect(result.deleted).toBe(0)
    expect(result.freedBytes).toBe(0)
  })

  it('não deleta arquivos recentes', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'recent.png', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0],
    ])
    vi.mocked(statSync).mockReturnValue({
      mtimeMs: Date.now() - 1000, // 1 segundo atrás
      size: 1024,
    } as ReturnType<typeof statSync>)

    const result = cleanOldArtifacts()
    expect(result.deleted).toBe(0)
    expect(unlinkSync).not.toHaveBeenCalled()
  })

  it('deleta arquivos mais antigos que 30 dias', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const oldTime = Date.now() - (31 * 24 * 60 * 60 * 1000) // 31 dias atrás
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'old-screenshot.png', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0],
    ])
    vi.mocked(statSync).mockReturnValue({
      mtimeMs: oldTime,
      size: 2048,
    } as ReturnType<typeof statSync>)

    const result = cleanOldArtifacts()
    expect(result.deleted).toBeGreaterThanOrEqual(1)
    expect(result.freedBytes).toBeGreaterThanOrEqual(2048)
  })

  it('não deleta arquivos em _metrics (preserva histórico)', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    const oldTime = Date.now() - (31 * 24 * 60 * 60 * 1000)

    // Simula diretório _metrics com arquivo antigo
    vi.mocked(readdirSync).mockImplementation((dir) => {
      const dirStr = String(dir)
      if (dirStr.includes('_metrics')) {
        return [{ name: 'old-metric.json', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0]]
      }
      return [{ name: '_metrics', isDirectory: () => true } as unknown as ReturnType<typeof readdirSync>[0]]
    })
    vi.mocked(statSync).mockReturnValue({ mtimeMs: oldTime, size: 512 } as ReturnType<typeof statSync>)

    cleanOldArtifacts()
    // unlinkSync não deve ser chamado para _metrics
    expect(unlinkSync).not.toHaveBeenCalled()
  })
})

describe('getArtifactStats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna stats zeradas quando diretórios não existem', () => {
    vi.mocked(existsSync).mockReturnValue(false)

    const stats = getArtifactStats()
    expect(stats.totalFiles).toBe(0)
    expect(stats.totalSizeBytes).toBe(0)
    expect(stats.totalSizeHuman).toBe('0 B')
    expect(stats.oldestFile).toBeNull()
    expect(stats.newestFile).toBeNull()
  })

  it('conta arquivos corretamente', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'file1.png', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0],
      { name: 'file2.json', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0],
    ])
    vi.mocked(statSync).mockReturnValue({
      mtimeMs: Date.now(),
      size: 1024,
    } as ReturnType<typeof statSync>)

    const stats = getArtifactStats()
    // 3 diretórios × 2 arquivos cada = 6
    expect(stats.totalFiles).toBeGreaterThanOrEqual(2)
  })

  it('formata bytes corretamente', () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'big.png', isDirectory: () => false } as unknown as ReturnType<typeof readdirSync>[0],
    ])
    vi.mocked(statSync).mockReturnValue({
      mtimeMs: Date.now(),
      size: 1024 * 1024 * 5, // 5 MB
    } as ReturnType<typeof statSync>)

    const stats = getArtifactStats()
    expect(stats.totalSizeHuman).toMatch(/MB/)
  })
})
