import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname, relative } from 'path'
import { listDailyTestLogFiles } from './test-log-persist.js'
import { raizRepositorioGravity, registryPlanosTestePath } from './raiz-repositorio-gravity.js'
import type { TestLogEntry } from '../utils/playwright-parser.js'

const PREFIXO_EMT_PERSISTENTE = 'data/emt-artifacts/'

/** Diretório persistente de PNGs EMT — montar volume Railway aqui em produção. */
export function dirArtefatosEmtPersistente(): string {
  const base = process.env.EMT_ARTIFACTS_DIR?.trim()
  if (base) return resolve(base)
  return resolve(process.cwd(), 'data', 'emt-artifacts')
}

export function isCaminhoRelPrintEmtPermitido(rel: string): boolean {
  return (
    (rel.startsWith('testes/testes-em-tela/') || rel.startsWith(PREFIXO_EMT_PERSISTENTE + 'testes/testes-em-tela/'))
    && rel.includes('/resultado-teste/')
    && !rel.includes('..')
  )
}

/** Caminho relativo persistido no banco (convenção fixa, independente de EMT_ARTIFACTS_DIR). */
export function pastaEmtPersistenteRel(emtPastaRelMonorepo: string): string {
  return `${PREFIXO_EMT_PERSISTENTE}${emtPastaRelMonorepo}`
}

/** Resolve pasta EMT absoluta (monorepo ou cópia persistente). */
export function resolverPastaEmtAbsoluta(emtPastaRel: string): string | null {
  if (!emtPastaRel || emtPastaRel.includes('..')) return null
  if (emtPastaRel.startsWith(PREFIXO_EMT_PERSISTENTE)) {
    const sufixo = emtPastaRel.slice(PREFIXO_EMT_PERSISTENTE.length)
    if (!sufixo.startsWith('testes/testes-em-tela/')) return null
    return resolve(dirArtefatosEmtPersistente(), sufixo)
  }
  if (emtPastaRel.startsWith('testes/testes-em-tela/')) {
    const monorepo = resolve(raizRepositorioGravity, emtPastaRel)
    if (existsSync(monorepo)) return monorepo
    const espelho = resolve(dirArtefatosEmtPersistente(), emtPastaRel)
    if (existsSync(espelho)) return espelho
    return monorepo
  }
  return null
}

/**
 * Copia prints + RESULTADO.txt para data/emt-artifacts/ (sobrevive redeploy Railway).
 * Retorna caminho relativo ao cwd para gravar em pasta_emt_teste.
 */
export function espelharArtefatosEmtPersistente(emtPastaRelMonorepo: string): string | null {
  if (!emtPastaRelMonorepo.startsWith('testes/testes-em-tela/')) return null
  const origem = resolve(raizRepositorioGravity, emtPastaRelMonorepo)
  if (!existsSync(origem)) return null

  const destino = resolve(dirArtefatosEmtPersistente(), emtPastaRelMonorepo)
  mkdirSync(dirname(destino), { recursive: true })
  try {
    cpSync(origem, destino, { recursive: true, force: true })
  } catch {
    return null
  }

  const relPersistente = pastaEmtPersistenteRel(emtPastaRelMonorepo)
  return relPersistente
}

/** Antes de persistir no banco — espelha PNGs para pasta persistente. */
export function prepararEntradaEmtParaPersistencia(entry: TestLogEntry): TestLogEntry {
  if (entry.type !== 'EMT' || !entry.emt_pasta) return entry
  if (entry.emt_pasta.startsWith(PREFIXO_EMT_PERSISTENTE)) return entry
  const pastaPersistente = espelharArtefatosEmtPersistente(entry.emt_pasta)
  if (!pastaPersistente) return entry
  return { ...entry, emt_pasta: pastaPersistente }
}

export interface EmtRunArtifacts {
  /** Caminho relativo ao monorepo da pasta de saída (prints + RESULTADO.txt). */
  emt_pasta: string | null
  /** Nomes dos arquivos .png na pasta. */
  emt_prints: string[]
  /** Legado / fallback sem pasta — persistência nova deixa null e lê RESULTADO.txt na listagem. */
  success_log: string | null
}

function pastaRelativa(abs: string): string {
  return abs.replace(/\\/g, '/').replace(`${raizRepositorioGravity.replace(/\\/g, '/')}/`, '')
}

function resolverFeatureRootDoScript(scriptRel: string): string {
  const scriptDir = dirname(resolve(raizRepositorioGravity, scriptRel))
  const nome = scriptDir.replace(/\\/g, '/').split('/').pop() ?? ''
  if (nome === 'plano-teste' || nome === 'plano-de-teste') {
    return dirname(scriptDir)
  }
  return scriptDir
}

/** Pasta isolada por run: resultado-teste/<runId>/ — só válida se RESULTADO.txt existir. */
export function resolverPastaEmtPorRunId(scriptRel: string, runId: string): string | null {
  try {
    const featureRoot = resolverFeatureRootDoScript(scriptRel)
    const pasta = join(featureRoot, 'resultado-teste', runId)
    if (!existsSync(pasta)) return null
    if (!existsSync(join(pasta, 'RESULTADO.txt'))) return null
    return pasta
  } catch {
    return null
  }
}

/** @deprecated Legado — pasta datada compartilhada. Preferir resultado-teste/<runId>. */
export function resolverPastaEmtRecente(
  scriptRel: string,
  startedAtMs: number,
  janelaMs = 180_000,
): string | null {
  try {
    const scriptDir = dirname(resolve(raizRepositorioGravity, scriptRel))
    const subpastas = readdirSync(scriptDir, { withFileTypes: true }).filter(d => d.isDirectory())
    let melhor: { path: string; mtime: number } | null = null

    for (const sub of subpastas) {
      if (sub.name === 'plano-teste' || sub.name === 'resultado-teste') continue
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

/** SSOT do log EMT — arquivo completo, sem truncar (escala para planos longos). */
export function lerResultadoTxtDaPasta(pastaAbs: string): string | null {
  try {
    const resultPath = join(pastaAbs, 'RESULTADO.txt')
    if (!existsSync(resultPath)) return null
    return readFileSync(resultPath, 'utf-8')
  } catch {
    return null
  }
}

function listarPrintsDaPasta(pastaAbs: string, aprovado: boolean): string[] {
  return readdirSync(pastaAbs)
    .filter(f => f.endsWith('.png'))
    .filter(f => (aprovado ? f !== '99-erro.png' : true))
    .sort()
}

/** Metadados para persistir no JSON diário — não embute RESULTADO.txt (fica em emt_pasta). */
function artefatosDaPasta(pastaAbs: string, code: number, stdout: string): EmtRunArtifacts {
  const aprovado = code === 0
  const prints = listarPrintsDaPasta(pastaAbs, aprovado)
  const temResultadoTxt = existsSync(join(pastaAbs, 'RESULTADO.txt'))

  let success_log: string | null = null
  if (!temResultadoTxt && aprovado) {
    success_log = extrairLogSucessoDoStdout(stdout)
  }

  return {
    emt_pasta: pastaRelativa(pastaAbs),
    emt_prints: prints,
    success_log,
  }
}

export function coletarArtefatosEmt(
  scriptRel: string,
  startedAtMs: number,
  code: number,
  stdout: string,
  runId?: string,
): EmtRunArtifacts {
  if (runId) {
    const pastaRun = resolverPastaEmtPorRunId(scriptRel, runId)
    if (pastaRun) return artefatosDaPasta(pastaRun, code, stdout)

    const featureRel = pastaRelativa(resolverFeatureRootDoScript(scriptRel))
    const pastaPersist = join(dirArtefatosEmtPersistente(), featureRel, 'resultado-teste', runId)
    if (existsSync(join(pastaPersist, 'RESULTADO.txt'))) {
      return artefatosDaPasta(pastaPersist, code, stdout)
    }
  }

  const pastaAbs = resolverPastaEmtRecente(scriptRel, startedAtMs)
  if (!pastaAbs) {
    return {
      emt_pasta: null,
      emt_prints: [],
      success_log: code === 0 ? extrairLogSucessoDoStdout(stdout) : null,
    }
  }

  return artefatosDaPasta(pastaAbs, code, stdout)
}

function extrairLogSucessoDoStdout(stdout: string): string | null {
  const linhas = stdout.split('\n').filter(l => {
    const t = l.trim()
    return t.startsWith('✓') || t.includes('Resultado: PASSOU') || t.startsWith('📸')
  })
  return linhas.length > 0 ? linhas.join('\n') : null
}

function aplicarLogCompletoDoDisco(
  entry: Record<string, unknown>,
  pastaAbs: string,
  prints: string[],
): Record<string, unknown> {
  const logCompleto = lerResultadoTxtDaPasta(pastaAbs)
  const aprovado = entry.result === 'APROVADO'

  return {
    ...entry,
    emt_prints: prints,
    success_log: aprovado ? (logCompleto ?? entry.success_log ?? null) : null,
    error_log: !aprovado
      ? (logCompleto ?? entry.error_log ?? null)
      : entry.error_log,
  }
}

/** Enriquece logs EMT — lê RESULTADO.txt integral da pasta quando existir. */
export function enrichirLogEmt(
  entry: Record<string, unknown>,
  specFile: string | null,
): Record<string, unknown> {
  if (entry.type !== 'EMT' || !specFile) return entry

  const emtPastaSalva = typeof entry.emt_pasta === 'string' && entry.emt_pasta.length > 0
    ? entry.emt_pasta
    : null

  if (emtPastaSalva) {
    const pastaAbs = resolverPastaEmtAbsoluta(emtPastaSalva)
    if (pastaAbs && existsSync(pastaAbs)) {
      const code = entry.result === 'APROVADO' ? 0 : 1
      const artefatos = artefatosDaPasta(pastaAbs, code, '')
      return aplicarLogCompletoDoDisco(entry, pastaAbs, artefatos.emt_prints)
    }
  }

  const temPrints = Array.isArray(entry.emt_prints) && (entry.emt_prints as unknown[]).length > 0
  const temLog = typeof entry.success_log === 'string' && entry.success_log.length > 0
  if (temPrints && (temLog || entry.result !== 'APROVADO')) return entry
  if (entry.result !== 'APROVADO' && entry.error_log && temPrints) return entry

  const createdMs = new Date(String(entry.created_at ?? Date.now())).getTime()
  const runIdFallback = typeof entry.id_execucao_teste === 'string' ? entry.id_execucao_teste : undefined
  const artefatos = coletarArtefatosEmt(
    specFile,
    createdMs,
    entry.result === 'APROVADO' ? 0 : 1,
    '',
    runIdFallback,
  )

  if (artefatos.emt_pasta) {
    const pastaAbs = resolverPastaEmtAbsoluta(artefatos.emt_pasta)
    if (pastaAbs && existsSync(pastaAbs)) {
      return aplicarLogCompletoDoDisco(
        { ...entry, emt_pasta: artefatos.emt_pasta },
        pastaAbs,
        temPrints ? (entry.emt_prints as string[]) : artefatos.emt_prints,
      )
    }
  }

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
  if (!isCaminhoRelPrintEmtPermitido(emtPastaRel)) return null

  const pastaAbs = resolverPastaEmtAbsoluta(emtPastaRel)
  if (!pastaAbs) return null

  const abs = resolve(pastaAbs, nomeArquivo)
  const rel = relative(pastaAbs, abs)
  if (!rel || rel.startsWith('..') || rel.includes('..')) return null
  if (!existsSync(abs)) return null
  return abs
}

export function buscarLogTestePorId(
  id: string,
  testLogsDir: string,
): Record<string, unknown> | null {
  try {
    if (!existsSync(testLogsDir)) return null
    for (const file of listDailyTestLogFiles(14)) {
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
    const registryPath = registryPlanosTestePath
    const raw = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
      planos?: Array<{ id: string; specFile?: string }>
    }
    const entry = raw.planos?.find(p => p.id === planoId)
    return entry?.specFile ?? null
  } catch {
    return null
  }
}
