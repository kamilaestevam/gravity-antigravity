// server/lib/test-artifacts.ts
// Gerenciamento de artefatos de testes (screenshots, relatórios)
// Retenção de 30 dias — limpeza automática via cleanOldArtifacts()

import { existsSync, readdirSync, statSync, unlinkSync, rmdirSync } from 'fs'
import { resolve, join } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const RETENTION_DAYS = 30
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000

// ─── Diretórios de artefatos ─────────────────────────────────────────────────

function getArtifactDirs(): string[] {
  const monorepoRoot = resolve(process.cwd(), '..', '..')
  return [
    resolve(monorepoRoot, 'testes', 'test-results'),
    resolve(process.cwd(), 'data', 'test-logs'),
    resolve(process.cwd(), 'data', 'pentest-reports'),
  ]
}

// ─── Limpeza de artefatos antigos ────────────────────────────────────────────

export function cleanOldArtifacts(): { deleted: number; freedBytes: number } {
  const cutoff = Date.now() - RETENTION_MS
  let deleted = 0
  let freedBytes = 0

  for (const dir of getArtifactDirs()) {
    if (!existsSync(dir)) continue
    deleted += cleanDirectory(dir, cutoff, (bytes) => { freedBytes += bytes })
  }

  if (deleted > 0) {
    console.log(
      `[test-artifacts] Limpeza: ${deleted} arquivo(s) removidos, ${formatBytes(freedBytes)} liberados`,
    )
  }

  return { deleted, freedBytes }
}

function cleanDirectory(
  dir: string,
  cutoff: number,
  onDelete: (bytes: number) => void,
): number {
  let deleted = 0

  try {
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(dir, entry.name)

      if (entry.isDirectory()) {
        // Limpa subdiretórios recursivamente
        deleted += cleanDirectory(fullPath, cutoff, onDelete)

        // Remove diretório se ficou vazio
        try {
          const remaining = readdirSync(fullPath)
          if (remaining.length === 0) {
            rmdirSync(fullPath)
          }
        } catch { /* skip */ }
        continue
      }

      // Verifica idade do arquivo
      try {
        const stat = statSync(fullPath)
        if (stat.mtimeMs < cutoff) {
          // Não remove métricas (são leves e úteis para histórico)
          if (fullPath.includes('_metrics')) continue

          unlinkSync(fullPath)
          onDelete(stat.size)
          deleted++
        }
      } catch { /* skip inaccessible */ }
    }
  } catch { /* dir inaccessible */ }

  return deleted
}

// ─── Estatísticas de artefatos ───────────────────────────────────────────────

export interface ArtifactStats {
  totalFiles:     number
  totalSizeBytes: number
  totalSizeHuman: string
  oldestFile:     string | null
  newestFile:     string | null
  byDirectory:    Array<{
    dir:       string
    files:     number
    sizeBytes: number
  }>
}

export function getArtifactStats(): ArtifactStats {
  let totalFiles = 0
  let totalSize = 0
  let oldest = Infinity
  let newest = 0
  let oldestName: string | null = null
  let newestName: string | null = null
  const byDir: ArtifactStats['byDirectory'] = []

  for (const dir of getArtifactDirs()) {
    if (!existsSync(dir)) continue
    const result = countDirectory(dir)
    totalFiles += result.files
    totalSize += result.size
    byDir.push({ dir, files: result.files, sizeBytes: result.size })

    if (result.oldestMs < oldest) {
      oldest = result.oldestMs
      oldestName = result.oldestName
    }
    if (result.newestMs > newest) {
      newest = result.newestMs
      newestName = result.newestName
    }
  }

  return {
    totalFiles,
    totalSizeBytes: totalSize,
    totalSizeHuman: formatBytes(totalSize),
    oldestFile:     oldestName,
    newestFile:     newestName,
    byDirectory:    byDir,
  }
}

function countDirectory(dir: string): {
  files: number
  size: number
  oldestMs: number
  newestMs: number
  oldestName: string | null
  newestName: string | null
} {
  let files = 0
  let size = 0
  let oldestMs = Infinity
  let newestMs = 0
  let oldestName: string | null = null
  let newestName: string | null = null

  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      if (entry.isDirectory()) {
        const sub = countDirectory(fullPath)
        files += sub.files
        size += sub.size
        if (sub.oldestMs < oldestMs) { oldestMs = sub.oldestMs; oldestName = sub.oldestName }
        if (sub.newestMs > newestMs) { newestMs = sub.newestMs; newestName = sub.newestName }
        continue
      }
      try {
        const stat = statSync(fullPath)
        files++
        size += stat.size
        if (stat.mtimeMs < oldestMs) { oldestMs = stat.mtimeMs; oldestName = entry.name }
        if (stat.mtimeMs > newestMs) { newestMs = stat.mtimeMs; newestName = entry.name }
      } catch { /* skip */ }
    }
  } catch { /* dir inaccessible */ }

  return { files, size, oldestMs, newestMs, oldestName, newestName }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}
