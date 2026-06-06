/**
 * Dispara TST-EMT-PEDIDO-CONFIG-STATUS-001 em Produção pelo mesmo pipeline do Admin
 * (buildSafeTestEnv + npx tsx + gravação em data/test-logs).
 *
 * Uso: npx tsx scripts/ativamente/disparar-emt-producao.ts
 */
import { spawn } from 'child_process'
import {
  existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, statSync,
} from 'fs'
import { join, resolve, dirname } from 'path'
import dotenv from 'dotenv'
import { coletarArtefatosEmt } from '../../servicos-global/configurador/server/lib/emt-artifacts.js'

const ROOT = resolve(import.meta.dirname, '../..')
const CFG_DIR = join(ROOT, 'servicos-global', 'configurador')
const TEST_LOGS = join(CFG_DIR, 'data', 'test-logs')
const PLANO_ID = 'TST-EMT-PEDIDO-CONFIG-STATUS-001'
const SPEC = 'testes/testes-em-tela/pedido/lista/editar-salvar/plano-de-teste/run-lista-editar-salvar.ts'
const TIMEOUT_MS = 30 * 60 * 1000

dotenv.config({ path: join(ROOT, '.env.local') })
dotenv.config({ path: join(CFG_DIR, '.env') })

function buildEnv(): Record<string, string> {
  const env: Record<string, string> = { ...process.env as Record<string, string> }
  env.CI = '1'
  env.GRAVITY_TEST_AMBIENTE = 'producao'
  env.PLAYWRIGHT_BASE_URL = process.env.GRAVITY_PROD_UI_URL ?? 'https://usegravity.com.br'

  const prodSecret = process.env.CLERK_PROD_SECRET_KEY?.trim()
  const prodPk =
    process.env.CLERK_PROD_PUBLISHABLE_KEY?.trim()
    ?? process.env.VITE_CLERK_PROD_PUBLISHABLE_KEY?.trim()

  if (prodSecret) env.CLERK_SECRET_KEY = prodSecret
  if (prodPk) {
    env.CLERK_PUBLISHABLE_KEY = prodPk
    env.VITE_CLERK_PUBLISHABLE_KEY = prodPk
  }

  return env
}

function lerResultadoTxt(startedAtMs: number): string | null {
  try {
    const scriptDir = dirname(resolve(ROOT, SPEC))
    const subs = readdirSync(scriptDir, { withFileTypes: true }).filter(d => d.isDirectory())
    let melhor: { path: string; mtime: number } | null = null
    for (const sub of subs) {
      const p = join(scriptDir, sub.name, 'RESULTADO.txt')
      if (!existsSync(p)) continue
      const mtime = statSync(p).mtimeMs
      if (mtime < startedAtMs - 5000) continue
      if (!melhor || mtime > melhor.mtime) melhor = { path: p, mtime }
    }
    if (melhor) return readFileSync(melhor.path, 'utf-8')
  } catch { /* ignore */ }
  return null
}

function montarErrorLog(
  code: number, stdout: string, stderr: string, startedAtMs: number,
): string | null {
  if (code === 0) return null
  const terminal = [stderr, stdout].map(s => s.trim()).filter(Boolean).join('\n').trim()
  if (terminal) return terminal.slice(0, 4000)
  const txt = lerResultadoTxt(startedAtMs)
  if (txt) return txt.slice(0, 4000)
  return 'Script EMT encerrou com erro sem saída no terminal.'
}

function gravarLog(entry: {
  result: 'APROVADO' | 'REPROVADO'
  duration: string
  error_log: string | null
  success_log?: string | null
  emt_pasta?: string | null
  emt_prints?: string[]
}): string {
  const created_at = new Date().toISOString()
  const filePath = join(TEST_LOGS, `${created_at.slice(0, 10)}.json`)
  mkdirSync(TEST_LOGS, { recursive: true })
  let existing: unknown[] = []
  try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
  const id = `${Date.now()}-0`
  const novo = {
    id,
    created_at,
    type: 'EMT',
    module: PLANO_ID,
    test_name: PLANO_ID,
    result: entry.result,
    duration: entry.duration,
    error_log: entry.error_log,
    success_log: entry.success_log ?? null,
    emt_pasta: entry.emt_pasta ?? null,
    emt_prints: entry.emt_prints ?? [],
    ai_analysis: null,
  }
  writeFileSync(filePath, JSON.stringify([...existing, novo], null, 2))
  return id
}

async function run(): Promise<'APROVADO' | 'REPROVADO'> {
  const env = buildEnv()
  const startedAtMs = Date.now()
  console.log(`[disparar-emt] Produção → ${env.PLAYWRIGHT_BASE_URL}`)
  console.log(`[disparar-emt] Clerk: ${env.CLERK_SECRET_KEY?.slice(0, 7) ?? 'ausente'}…`)

  let stdout = ''
  let stderr = ''
  const code = await new Promise<number>(resolveCode => {
    const proc = spawn('npx', ['tsx', SPEC], {
      cwd: ROOT,
      env,
      shell: true,
      windowsHide: true,
      timeout: TIMEOUT_MS,
    })
    proc.stdout?.on('data', (c: Buffer) => { stdout += c.toString(); process.stdout.write(c) })
    proc.stderr?.on('data', (c: Buffer) => { stderr += c.toString(); process.stderr.write(c) })
    proc.on('close', c => resolveCode(c ?? 1))
  })

  const durationMs = Date.now() - startedAtMs
  const result = code === 0 ? 'APROVADO' : 'REPROVADO'
  const artefatos = coletarArtefatosEmt(SPEC, startedAtMs, code, stdout)
  const id = gravarLog({
    result,
    duration: `${durationMs}ms`,
    error_log: montarErrorLog(code, stdout, stderr, startedAtMs),
    success_log: code === 0 ? artefatos.success_log : null,
    emt_pasta: artefatos.emt_pasta,
    emt_prints: artefatos.emt_prints,
  })

  console.log(`\n[disparar-emt] ${result} — id=${id} — ${durationMs}ms`)
  return result
}

run()
  .then(r => process.exit(r === 'APROVADO' ? 0 : 1))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
