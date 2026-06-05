import { existsSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'

const monorepoRoot = resolve(process.cwd(), '..', '..')

export interface EmtRunArtifacts {
  /** Caminho relativo ao monorepo da pasta de saída (prints + RESULTADO.txt). */
  emt_pasta: string | null
  /** Nomes dos arquivos .png na pasta. */
  emt_prints: string[]
  /** Texto do RESULTADO.txt ou trecho do stdout com checks aprovados. */
  success_log: string | null
}

function pastaRelativa(abs: string): string {
  return abs.replace(/\\/g, '/').replace(`${monorepoRoot.replace(/\\/g, '/')}/`, '')
}

/** Localiza a pasta EMT mais próxima do instante do run (RESULTADO.txt ou .png recentes). */
export function resolverPastaEmtRecente(
  scriptRel: string,
  startedAtMs: number,
  janelaMs = 180_000,
): string | null {
  try {
    const scriptDir = dirname(resolve(monorepoRoot, scriptRel))
    const subpastas = readdirSync(scriptDir, { withFileTypes: true }).filter(d => d.isDirectory())
    let melhor: { path: string; mtime: number } | null = null

    for (const sub of subpastas) {
      const dirPath = join(scriptDir, sub.name)
      const candidatos = ['RESULTADO.txt', '01-pos-login.png', '02-config-status-inicial.png']
      for (const nome of candidatos) {
        const filePath = join(dirPath, nome)
        if (!existsSync(filePath)) continue
        const mtime = statSync(filePath).mtimeMs
        if (mtime < startedAtMs - janelaMs) continue
        if (!melhor || mtime > melhor.mtime) melhor = { path: dirPath, mtime }
        break
      }
    }
    return melhor?.path ?? null
  } catch {
    return null
  }
}

export function coletarArtefatosEmt(
  scriptRel: string,
  startedAtMs: number,
  code: number,
  stdout: string,
): EmtRunArtifacts {
  const pastaAbs = resolverPastaEmtRecente(scriptRel, startedAtMs)
  if (!pastaAbs) {
    return {
      emt_pasta: null,
      emt_prints: [],
      success_log: code === 0 ? extrairLogSucessoDoStdout(stdout) : null,
    }
  }

  const prints = readdirSync(pastaAbs)
    .filter(f => f.endsWith('.png'))
    .sort()

  let success_log: string | null = null
  const resultPath = join(pastaAbs, 'RESULTADO.txt')
  if (existsSync(resultPath)) {
    success_log = readFileSync(resultPath, 'utf-8').slice(0, 12_000)
  } else if (code === 0) {
    success_log = extrairLogSucessoDoStdout(stdout)
  }

  return {
    emt_pasta: pastaRelativa(pastaAbs),
    emt_prints: prints,
    success_log,
  }
}

function extrairLogSucessoDoStdout(stdout: string): string | null {
  const linhas = stdout.split('\n').filter(l => {
    const t = l.trim()
    return t.startsWith('✓') || t.includes('Resultado: PASSOU') || t.startsWith('📸')
  })
  return linhas.length > 0 ? linhas.join('\n') : null
}

/** Enriquece logs EMT antigos que não gravaram success_log / prints. */
export function enrichirLogEmt(
  entry: Record<string, unknown>,
  specFile: string | null,
): Record<string, unknown> {
  if (entry.type !== 'EMT' || !specFile) return entry

  const temPrints = Array.isArray(entry.emt_prints) && (entry.emt_prints as unknown[]).length > 0
  const temLog = typeof entry.success_log === 'string' && entry.success_log.length > 0
  if (temPrints && (temLog || entry.result !== 'APROVADO')) return entry
  if (entry.result !== 'APROVADO' && entry.error_log && temPrints) return entry

  const createdMs = new Date(String(entry.created_at ?? Date.now())).getTime()
  const artefatos = coletarArtefatosEmt(specFile, createdMs, entry.result === 'APROVADO' ? 0 : 1, '')

  return {
    ...entry,
    emt_pasta: entry.emt_pasta ?? artefatos.emt_pasta,
    emt_prints: temPrints ? entry.emt_prints : artefatos.emt_prints,
    success_log: temLog ? entry.success_log : (artefatos.success_log ?? entry.success_log ?? null),
  }
}

export function resolverCaminhoPrintSeguro(
  emtPastaRel: string,
  nomeArquivo: string,
): string | null {
  if (!emtPastaRel || !nomeArquivo) return null
  if (nomeArquivo.includes('..') || nomeArquivo.includes('/') || nomeArquivo.includes('\\')) return null
  if (!nomeArquivo.endsWith('.png')) return null
  if (!emtPastaRel.startsWith('testes/testes-em-tela/')) return null

  const abs = resolve(monorepoRoot, emtPastaRel, nomeArquivo)
  const pastaAbs = resolve(monorepoRoot, emtPastaRel)
  if (!abs.startsWith(pastaAbs)) return null
  if (!existsSync(abs)) return null
  return abs
}

export function buscarLogTestePorId(
  id: string,
  testLogsDir: string,
): Record<string, unknown> | null {
  try {
    if (!existsSync(testLogsDir)) return null
    const files = readdirSync(testLogsDir)
      .filter(f => f.endsWith('.json') && !f.startsWith('playwright-run-'))
      .sort()
      .reverse()
    for (const file of files.slice(0, 14)) {
      try {
        const content = JSON.parse(readFileSync(join(testLogsDir, file), 'utf-8'))
        if (!Array.isArray(content)) continue
        const hit = content.find((e: unknown) =>
          e && typeof e === 'object' && (e as { id?: string }).id === id,
        )
        if (hit) return hit as Record<string, unknown>
      } catch { /* ignore */ }
    }
  } catch { /* ignore */ }
  return null
}

export function specFileDoRegistry(planoId: string): string | null {
  try {
    const registryPath = resolve(monorepoRoot, 'testes', 'test-plans-registry.json')
    const raw = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      planos?: Array<{ id: string; specFile?: string }>
    }
    const entry = raw.planos?.find(p => p.id === planoId)
    return entry?.specFile ?? null
  } catch {
    return null
  }
}
