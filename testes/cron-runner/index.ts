// testes/cron-runner/index.ts
// Container Railway que roda diariamente, executa os 6 tipos de teste
// em todas as telas registradas, e posta resultados via POST /admin/test-logs
//
// Deploy: Railway container com cron schedule "0 3 * * *" (3h BRT)
// Env vars: API_URL, API_TOKEN, PLAYWRIGHT_BROWSERS_PATH

import { execSync } from 'child_process'
import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve } from 'path'

// ─── Config ──────────────────────────────────────────────────────────────────

const API_URL = process.env.API_URL ?? 'http://localhost:8005'
const API_TOKEN = process.env.API_TOKEN ?? ''
const MONOREPO_ROOT = resolve(__dirname, '..', '..')

interface RegistryPlan {
  id:       string
  tipo:     string
  escopo:   string
  sublocal: string
  specFile: string
}

interface TestResult {
  type:         string
  module:       string
  test_name:    string
  result:       'APROVADO' | 'REPROVADO' | 'ERRO'
  duration:     string
  error_log:    string | null
  ai_analysis:  null
}

// ─── Runner ──────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[cron-runner] Iniciando run diário — ${new Date().toISOString()}`)
  console.log(`[cron-runner] API_URL: ${API_URL}`)

  // 1. Carrega registry
  const registryPath = resolve(MONOREPO_ROOT, 'testes', 'test-plans-registry.json')
  if (!existsSync(registryPath)) {
    console.error('[cron-runner] Registry não encontrado:', registryPath)
    process.exit(1)
  }

  const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as { planos: RegistryPlan[] }
  const planos = registry.planos.filter(p => p.specFile)
  console.log(`[cron-runner] ${planos.length} planos com specs encontrados`)

  if (planos.length === 0) {
    console.log('[cron-runner] Nenhum spec para rodar — saindo')
    process.exit(0)
  }

  // 2. Roda Playwright para cada tipo de teste
  const tiposTeste = ['E2E', 'FUN', 'CRO', 'UNI', 'CON', 'PEN']
  const allResults: TestResult[] = []

  for (const tipo of tiposTeste) {
    const specsDoTipo = planos.filter(p => p.tipo === tipo)
    if (specsDoTipo.length === 0) continue

    console.log(`[cron-runner] Rodando ${specsDoTipo.length} specs tipo ${tipo}...`)

    for (const plan of specsDoTipo) {
      const specPath = resolve(MONOREPO_ROOT, 'testes', plan.specFile)
      if (!existsSync(specPath)) {
        allResults.push({
          type:      plan.tipo,
          module:    plan.escopo,
          test_name: plan.id,
          result:    'ERRO',
          duration:  '0ms',
          error_log: `Spec file não encontrado: ${plan.specFile}`,
          ai_analysis: null,
        })
        continue
      }

      try {
        const startMs = Date.now()
        const output = execSync(
          `npx playwright test "${specPath}" --reporter=json`,
          {
            cwd: MONOREPO_ROOT,
            timeout: 5 * 60 * 1000, // 5 min por spec
            encoding: 'utf-8',
            env: {
              ...process.env,
              CI: '1',
            },
          },
        )
        const duration = Date.now() - startMs
        const parsed = JSON.parse(output)

        // Extrai resultados do JSON reporter
        const specs = extractSpecs(parsed)
        for (const spec of specs) {
          allResults.push({
            type:      plan.tipo,
            module:    plan.escopo,
            test_name: spec.title,
            result:    spec.ok ? 'APROVADO' : 'REPROVADO',
            duration:  `${spec.duration ?? duration}ms`,
            error_log: spec.error?.slice(0, 500) ?? null,
            ai_analysis: null,
          })
        }
      } catch (err) {
        const execErr = err as { stdout?: string; stderr?: string }
        // Playwright retorna exit code 1 quando testes falham — parse stdout
        try {
          const parsed = JSON.parse(execErr.stdout ?? '{}')
          const specs = extractSpecs(parsed)
          for (const spec of specs) {
            allResults.push({
              type:      plan.tipo,
              module:    plan.escopo,
              test_name: spec.title,
              result:    spec.ok ? 'APROVADO' : 'REPROVADO',
              duration:  `${spec.duration ?? 0}ms`,
              error_log: spec.error?.slice(0, 500) ?? null,
              ai_analysis: null,
            })
          }
        } catch {
          allResults.push({
            type:      plan.tipo,
            module:    plan.escopo,
            test_name: plan.id,
            result:    'ERRO',
            duration:  '0ms',
            error_log: String(execErr.stderr ?? err).slice(0, 500),
            ai_analysis: null,
          })
        }
      }
    }
  }

  // 3. Posta resultados via API
  console.log(`[cron-runner] ${allResults.length} resultados — postando via API...`)
  const aprovados = allResults.filter(r => r.result === 'APROVADO').length
  const reprovados = allResults.filter(r => r.result === 'REPROVADO').length
  const erros = allResults.filter(r => r.result === 'ERRO').length
  console.log(`[cron-runner] Aprovados: ${aprovados}, Reprovados: ${reprovados}, Erros: ${erros}`)

  if (allResults.length > 0) {
    try {
      const response = await fetch(`${API_URL}/api/v1/admin/test-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_TOKEN ? { Authorization: `Bearer ${API_TOKEN}` } : {}),
        },
        body: JSON.stringify({ entries: allResults }),
      })

      if (!response.ok) {
        console.error(`[cron-runner] Falha ao postar resultados: ${response.status}`)
      } else {
        console.log('[cron-runner] Resultados postados com sucesso')
      }
    } catch (postErr) {
      console.error('[cron-runner] Erro ao postar:', postErr)
    }
  }

  console.log(`[cron-runner] Run concluído — ${new Date().toISOString()}`)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface ExtractedSpec {
  title:    string
  ok:       boolean
  duration: number
  error?:   string
}

function extractSpecs(parsed: Record<string, unknown>): ExtractedSpec[] {
  const results: ExtractedSpec[] = []
  const suites = (parsed.suites ?? []) as Array<Record<string, unknown>>

  function walkSuites(suitesArr: Array<Record<string, unknown>>): void {
    for (const suite of suitesArr) {
      const specs = (suite.specs ?? []) as Array<Record<string, unknown>>
      for (const spec of specs) {
        const tests = (spec.tests ?? []) as Array<Record<string, unknown>>
        const test0 = tests[0]
        const results0 = ((test0?.results ?? []) as Array<Record<string, unknown>>)[0]

        results.push({
          title:    String(spec.title ?? 'unknown'),
          ok:       Boolean(spec.ok),
          duration: Number(results0?.duration ?? 0),
          error:    results0?.error
            ? String((results0.error as Record<string, unknown>).message ?? (results0.error as Record<string, unknown>).stack ?? '')
            : undefined,
        })
      }
      const childSuites = (suite.suites ?? []) as Array<Record<string, unknown>>
      if (childSuites.length > 0) walkSuites(childSuites)
    }
  }

  walkSuites(suites)
  return results
}

// ─── Entry point ─────────────────────────────────────────────────────────────

main().catch(err => {
  console.error('[cron-runner] Fatal:', err)
  process.exit(1)
})
