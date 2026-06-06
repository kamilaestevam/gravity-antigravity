/**
 * Processo filho detached para runs EMT.
 * Sobrevive a restart do cfg-back (tsx watch) e grava emt-result-{runId}.json ao terminar.
 *
 * Uso: npx tsx server/lib/emt-background-runner.ts <runId>
 */
import { spawn } from 'child_process'
import { existsSync, readFileSync, writeFileSync, unlinkSync, readdirSync, statSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { coletarArtefatosEmt } from './emt-artifacts.js'
import type { TestLogEntry } from '../utils/playwright-parser.js'

const RUN_TESTS_TIMEOUT_MS = 30 * 60 * 1000
const monorepoRoot = resolve(process.cwd(), '..', '..')
const testLogsDir = join(process.cwd(), 'data', 'test-logs')

type RegistryPlanoRun = { id: string; specFile?: string; tipo?: string }

interface EmtManifest {
  planos: RegistryPlanoRun[]
  env: Record<string, string>
  started_at: string
}

function debugLog(msg: string): void {
  try {
    writeFileSync(join(testLogsDir, '_debug-spawn.log'), `[${new Date().toISOString()}] ${msg}\n`, { flag: 'a' })
  } catch { /* ignora */ }
}

function lerResultadoTxtEmtRecente(scriptRel: string, startedAtMs: number): string | null {
  try {
    const scriptDir = dirname(resolve(monorepoRoot, scriptRel))
    const subpastas = readdirSync(scriptDir, { withFileTypes: true }).filter(d => d.isDirectory())
    let melhor: { path: string; mtime: number } | null = null
    for (const sub of subpastas) {
      const resultPath = join(scriptDir, sub.name, 'RESULTADO.txt')
      if (!existsSync(resultPath)) continue
      const mtime = statSync(resultPath).mtimeMs
      if (mtime < startedAtMs - 5000) continue
      if (!melhor || mtime > melhor.mtime) melhor = { path: resultPath, mtime }
    }
    if (melhor) return readFileSync(melhor.path, 'utf-8')
  } catch { /* pasta indisponível */ }
  return null
}

function montarErrorLogEmt(
  code: number,
  stdout: string,
  stderr: string,
  scriptRel: string,
  startedAtMs: number,
): string | null {
  if (code === 0) return null
  const terminal = [stderr, stdout].map(s => s.trim()).filter(Boolean).join('\n').trim()
  if (terminal) return terminal.slice(0, 4000)
  const resultadoTxt = lerResultadoTxtEmtRecente(scriptRel, startedAtMs)
  if (resultadoTxt) return resultadoTxt.slice(0, 4000)
  return 'Script EMT encerrou com erro (exit ≠ 0) sem saída no terminal. Verifique RESULTADO.txt na pasta do script.'
}

function runTsxScript(
  scriptRel: string,
  env: Record<string, string>,
): Promise<{ code: number; stdout: string; stderr: string; durationMs: number; startedAtMs: number }> {
  const startedAtMs = Date.now()
  return new Promise(resolve => {
    let stderr = ''
    let stdout = ''
    const proc = spawn('npx', ['tsx', scriptRel], {
      cwd: monorepoRoot,
      env,
      shell: true,
      windowsHide: true,
      timeout: RUN_TESTS_TIMEOUT_MS,
    })
    proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString() })
    proc.stderr?.on('data', (chunk: Buffer) => { stderr += chunk.toString() })
    proc.on('close', code => {
      resolve({
        code: code ?? 1,
        stdout,
        stderr,
        durationMs: Date.now() - startedAtMs,
        startedAtMs,
      })
    })
  })
}

async function main(): Promise<void> {
  const runId = process.argv[2]
  if (!runId) {
    console.error('[emt-background-runner] runId ausente')
    process.exit(1)
  }

  const manifestPath = join(testLogsDir, `emt-manifest-${runId}.json`)
  const resultPath = join(testLogsDir, `emt-result-${runId}.json`)

  if (!existsSync(manifestPath)) {
    debugLog(`EMT runner ${runId} — manifest ausente`)
    process.exit(1)
  }

  let manifest: EmtManifest
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf-8')) as EmtManifest
  } catch {
    debugLog(`EMT runner ${runId} — manifest inválido`)
    process.exit(1)
  }

  debugLog(`EMT runner ${runId} pid=${process.pid} — ${manifest.planos.length} plano(s)`)

  const entries: TestLogEntry[] = []
  try {
    for (const plano of manifest.planos) {
      if (!plano.specFile) continue
      debugLog(`EMT ${plano.id} → npx tsx ${plano.specFile}`)
      const { code, stdout, stderr, durationMs, startedAtMs } = await runTsxScript(plano.specFile, manifest.env)
      const artefatos = coletarArtefatosEmt(plano.specFile, startedAtMs, code, stdout, runId)
      entries.push({
        type: 'EMT',
        module: plano.id,
        test_name: plano.id,
        result: code === 0 ? 'APROVADO' : 'REPROVADO',
        duration: `${durationMs}ms`,
        error_log: montarErrorLogEmt(code, stdout, stderr, plano.specFile, startedAtMs),
        success_log: code === 0 ? artefatos.success_log : null,
        emt_pasta: artefatos.emt_pasta,
        emt_prints: artefatos.emt_prints,
        ai_analysis: null,
      } as TestLogEntry)
    }

    writeFileSync(resultPath, JSON.stringify({ entries, completed_at: new Date().toISOString() }, null, 2))
    debugLog(`EMT runner ${runId} — wrote result (${entries.length} entries)`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    debugLog(`EMT runner ${runId} — FATAL: ${msg}`)
    writeFileSync(resultPath, JSON.stringify({
      entries: [{
        type: 'EMT',
        module: manifest.planos[0]?.id ?? 'EMT',
        test_name: manifest.planos[0]?.id ?? 'EMT',
        result: 'ERRO',
        duration: '0ms',
        error_log: `Runner EMT falhou: ${msg}`,
        ai_analysis: null,
      }],
      completed_at: new Date().toISOString(),
    }, null, 2))
  } finally {
    try { unlinkSync(manifestPath) } catch { /* ok */ }
  }
}

main().catch(err => {
  debugLog(`EMT runner uncaught: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
