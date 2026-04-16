// server/workers/testScheduleWorker.ts
// Verifica TestSchedule a cada minuto e dispara runs quando o cron bate.
// Importado pelo index.ts do server na inicialização.

import { prisma } from '../lib/prisma.js'
import { spawn } from 'child_process'
import { resolve, join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { walkSuite, type TestLogEntry } from '../utils/playwright-parser.js'
import { analyzeTestFailure } from '../lib/gemini-test-analyzer.js'

// ─── Cron parser simplificado ────────────────────────────────────────────────

function cronMatches(cron: string, now: Date): boolean {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return false

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
  const checks = [
    { value: now.getMinutes(), field: minute },
    { value: now.getHours(), field: hour },
    { value: now.getDate(), field: dayOfMonth },
    { value: now.getMonth() + 1, field: month },
    { value: now.getDay(), field: dayOfWeek },
  ]

  return checks.every(({ value, field }) => {
    if (!field || field === '*') return true
    // Suporta listas (1,2,3), ranges (1-5), e steps (*/5)
    if (field.startsWith('*/')) {
      const step = parseInt(field.slice(2), 10)
      return step > 0 && value % step === 0
    }
    if (field.includes(',')) {
      return field.split(',').map(Number).includes(value)
    }
    if (field.includes('-')) {
      const [lo, hi] = field.split('-').map(Number)
      return value >= lo && value <= hi
    }
    return parseInt(field, 10) === value
  })
}

// ─── State ───────────────────────────────────────────────────────────────────

let running = false
let intervalId: ReturnType<typeof setInterval> | null = null
const monorepoRoot = resolve(process.cwd(), '..', '..')

// ─── Worker principal ────────────────────────────────────────────────────────

async function checkSchedules(): Promise<void> {
  if (running) return
  running = true

  try {
    // Tenta carregar schedules do banco
    let schedules: Array<{
      id: string
      cron: string
      is_active: boolean
      config: string
      last_run_at: Date | null
    }> = []

    try {
      schedules = await (prisma as any).testSchedule?.findMany?.({
        where: { is_active: true },
      }) ?? []
    } catch {
      // Tabela não existe — tenta fallback em arquivo
      const schedFile = join(process.cwd(), 'data', 'test-schedules', 'schedules.json')
      if (existsSync(schedFile)) {
        const fileSchedules = JSON.parse(readFileSync(schedFile, 'utf-8')) as Array<Record<string, unknown>>
        schedules = fileSchedules
          .filter(s => s.ativo !== false)
          .map(s => ({
            id:          String(s.id),
            cron:        String(s.cron),
            is_active:   true,
            config:      JSON.stringify({ planos: s.planos, modulos: s.modulos, ambientes: s.ambientes, notificar: s.notificar }),
            last_run_at: null,
          }))
      }
    }

    const now = new Date()
    for (const schedule of schedules) {
      if (!cronMatches(schedule.cron, now)) continue

      // Evita re-run no mesmo minuto
      if (schedule.last_run_at) {
        const lastRun = new Date(schedule.last_run_at)
        if (now.getTime() - lastRun.getTime() < 60_000) continue
      }

      console.log(`[testScheduleWorker] Disparando schedule ${schedule.id}`)
      const config = JSON.parse(schedule.config) as {
        planos?: string[]
        modulos?: string[]
        notificar?: boolean
      }

      // Atualiza last_run_at
      try {
        await (prisma as any).testSchedule?.update?.({
          where: { id: schedule.id },
          data: { last_run_at: now },
        })
      } catch { /* ok */ }

      // Dispara Playwright em background
      dispatchRun(schedule.id, config)
    }
  } catch (err) {
    console.error('[testScheduleWorker] Erro:', err)
  } finally {
    running = false
  }
}

function dispatchRun(
  scheduleId: string,
  config: { planos?: string[]; modulos?: string[]; notificar?: boolean },
): void {
  const args = ['playwright', 'test', '--reporter=json']

  if (config.planos?.length) {
    // Resolve spec files do registry
    try {
      const registryPath = resolve(monorepoRoot, 'testes', 'test-plans-registry.json')
      const registry = JSON.parse(readFileSync(registryPath, 'utf-8')) as {
        planos: Array<{ id: string; specFile: string }>
      }
      for (const planId of config.planos) {
        const entry = registry.planos.find(p => p.id === planId)
        if (entry?.specFile) {
          args.push(resolve(monorepoRoot, 'testes', entry.specFile))
        }
      }
    } catch { /* registry missing */ }
  } else if (config.modulos?.length) {
    for (const mod of config.modulos) {
      args.push('--project', mod)
    }
  }

  const proc = spawn('npx', args, {
    cwd:         monorepoRoot,
    shell:       true,
    windowsHide: true,
    timeout:     15 * 60 * 1000,
    env:         { ...process.env, CI: '1' },
  })

  let stdout = ''
  proc.stdout?.on('data', (chunk: Buffer) => { stdout += chunk.toString() })

  proc.on('close', async () => {
    const entries: TestLogEntry[] = []
    try {
      const parsed = JSON.parse(stdout) as { suites?: unknown[] }
      for (const suite of (parsed.suites ?? [])) {
        walkSuite(suite as Parameters<typeof walkSuite>[0], entries)
      }
    } catch { /* parse failed */ }

    // Salva resultados
    const dir = join(process.cwd(), 'data', 'test-logs')
    mkdirSync(dir, { recursive: true })
    const created_at = new Date().toISOString()
    const filePath = join(dir, `${created_at.slice(0, 10)}.json`)
    let existing: unknown[] = []
    try { existing = JSON.parse(readFileSync(filePath, 'utf-8')) } catch { /* novo */ }
    const novosLogs = entries.map((e, i) => ({
      id: `sched-${scheduleId}-${Date.now()}-${i}`,
      created_at,
      schedule_id: scheduleId,
      ...e,
    }))
    writeFileSync(filePath, JSON.stringify([...existing, ...novosLogs], null, 2))

    // Enriquece falhas com Gemini
    const falhas = novosLogs.filter(l => l.result === 'REPROVADO' || l.result === 'ERRO')
    for (const falha of falhas) {
      analyzeTestFailure({
        errorLog:        falha.error_log ?? '',
        testName:        falha.test_name,
        specFilePath:    `${falha.module}/${falha.test_name}`,
        specFileContent: '',
      }).then(analysis => {
        // Atualiza entry no arquivo
        try {
          const content = JSON.parse(readFileSync(filePath, 'utf-8')) as Array<Record<string, unknown>>
          const idx = content.findIndex(e => e.id === falha.id)
          if (idx >= 0) {
            content[idx].ai_analysis = analysis
            writeFileSync(filePath, JSON.stringify(content, null, 2))
          }
        } catch { /* ok */ }
      }).catch(err => {
        console.error(`[testScheduleWorker] Gemini falhou para ${falha.id}:`, err)
      })
    }

    // Notificação de falha
    if (config.notificar && falhas.length > 0) {
      try {
        const { notifyTestFailures } = await import('../lib/test-notifier.js')
        await notifyTestFailures(scheduleId, falhas.length, entries.length)
      } catch { /* notifier não existe ainda */ }
    }

    console.log(`[testScheduleWorker] Schedule ${scheduleId} concluído — ${entries.length} testes`)
  })
}

// ─── Start / Stop ────────────────────────────────────────────────────────────

export function startTestScheduleWorker(): void {
  if (intervalId) return
  console.log('[testScheduleWorker] Iniciando — verificando schedules a cada minuto')
  intervalId = setInterval(() => { checkSchedules().catch(() => {}) }, 60_000)
  // Roda imediatamente também
  checkSchedules().catch(() => {})
}

export function stopTestScheduleWorker(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    console.log('[testScheduleWorker] Parado')
  }
}
