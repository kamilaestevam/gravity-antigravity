/**
 * Markers persistidos por execução de teste (suporta runs simultâneos).
 * Um arquivo por run em data/test-logs/runs/run-<id_execucao_teste>.json
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync, unlinkSync, renameSync } from 'fs'
import { join } from 'path'
import { appendTestLogEntries } from './test-log-persist.js'
import { testLogsDir } from './test-log-persist.js'
import { walkSuite, type TestLogEntry } from '../utils/playwright-parser.js'
import type { PersistTesteContexto } from './teste-persist.js'

const LEGACY_MARKER_PATH = join(testLogsDir, '_current-run.json')
export const DIRETORIO_MARKERS_EXECUCAO_TESTE = join(testLogsDir, 'runs')

export type StatusExecucaoTeste = 'rodando' | 'concluido'
export type RunnerExecucaoTeste = 'EMT' | 'E2E'
export type GatilhoExecucaoTeste = 'manual' | 'cron' | 'ci'

export interface MarkerExecucaoTeste {
  status_execucao_teste: StatusExecucaoTeste
  pid_execucao_teste: number
  data_inicio_execucao_teste: string
  id_execucao_teste: string
  runner_execucao_teste?: RunnerExecucaoTeste
  ambiente_teste?: string
  disparado_por_teste?: string
  gatilho_teste?: GatilhoExecucaoTeste
  lista_planos_execucao_teste?: string[]
  lista_modulos_execucao_teste?: string[]
}

/** Marker legado (_current-run.json) — só para migração. */
interface MarkerLegadoExecucaoTeste {
  status: 'running' | 'completed'
  pid: number
  started_at: string
  runId: string
  runner?: RunnerExecucaoTeste
  ambiente_teste?: string
  disparado_por_teste?: string
}

export function obterLimiteExecucoesSimultaneasTeste(): number {
  const raw = process.env.LIMITE_EXECUCOES_SIMULTANEAS_TESTE
  if (raw) {
    const n = parseInt(raw, 10)
    if (n > 0 && n <= 20) return n
  }
  return 3
}

export function caminhoMarkerExecucaoTeste(id_execucao_teste: string): string {
  return join(DIRETORIO_MARKERS_EXECUCAO_TESTE, `run-${id_execucao_teste}.json`)
}

export function caminhoResultadoEmtTeste(id_execucao_teste: string): string {
  return join(testLogsDir, `emt-resultado-teste-${id_execucao_teste}.json`)
}

export function caminhoManifestoEmtTeste(id_execucao_teste: string): string {
  return join(testLogsDir, `emt-manifest-${id_execucao_teste}.json`)
}

function converterMarkerLegado(legado: MarkerLegadoExecucaoTeste): MarkerExecucaoTeste {
  return {
    status_execucao_teste: legado.status === 'running' ? 'rodando' : 'concluido',
    pid_execucao_teste: legado.pid,
    data_inicio_execucao_teste: legado.started_at,
    id_execucao_teste: legado.runId,
    runner_execucao_teste: legado.runner,
    ambiente_teste: legado.ambiente_teste,
    disparado_por_teste: legado.disparado_por_teste,
    gatilho_teste: 'manual',
  }
}

export function migrarMarkerLegadoSeExistir(): void {
  if (!existsSync(LEGACY_MARKER_PATH)) return
  try {
    const legado = JSON.parse(readFileSync(LEGACY_MARKER_PATH, 'utf-8')) as MarkerLegadoExecucaoTeste
    if (legado?.runId) {
      gravarMarkerExecucaoTeste(converterMarkerLegado(legado))
    }
    unlinkSync(LEGACY_MARKER_PATH)
  } catch {
    try { unlinkSync(LEGACY_MARKER_PATH) } catch { /* ok */ }
  }
}

export function lerMarkerExecucaoTeste(id_execucao_teste: string): MarkerExecucaoTeste | null {
  try {
    const path = caminhoMarkerExecucaoTeste(id_execucao_teste)
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf-8')) as MarkerExecucaoTeste
  } catch {
    return null
  }
}

export function listarMarkersExecucaoTeste(): MarkerExecucaoTeste[] {
  migrarMarkerLegadoSeExistir()
  mkdirSync(DIRETORIO_MARKERS_EXECUCAO_TESTE, { recursive: true })
  const markers: MarkerExecucaoTeste[] = []
  for (const file of readdirSync(DIRETORIO_MARKERS_EXECUCAO_TESTE)) {
    if (!file.startsWith('run-') || !file.endsWith('.json')) continue
    try {
      const parsed = JSON.parse(
        readFileSync(join(DIRETORIO_MARKERS_EXECUCAO_TESTE, file), 'utf-8'),
      ) as MarkerExecucaoTeste
      if (parsed?.id_execucao_teste) markers.push(parsed)
    } catch { /* ignora arquivo corrompido */ }
  }
  return markers
}

export function gravarMarkerExecucaoTeste(marker: MarkerExecucaoTeste): void {
  mkdirSync(DIRETORIO_MARKERS_EXECUCAO_TESTE, { recursive: true })
  const dest = caminhoMarkerExecucaoTeste(marker.id_execucao_teste)
  const tmp = dest + '.tmp'
  writeFileSync(tmp, JSON.stringify(marker, null, 2))
  renameSync(tmp, dest)
}

export function removerMarkerExecucaoTeste(id_execucao_teste: string): void {
  try { unlinkSync(caminhoMarkerExecucaoTeste(id_execucao_teste)) } catch { /* ok */ }
}

export function isProcessoExecucaoTesteAtivo(pid: number): boolean {
  try { process.kill(pid, 0); return true } catch { return false }
}

export function listarExecucoesAtivasTeste(): MarkerExecucaoTeste[] {
  return listarMarkersExecucaoTeste().filter(
    m => m.status_execucao_teste === 'rodando' && isProcessoExecucaoTesteAtivo(m.pid_execucao_teste),
  )
}

export function ctxDoMarkerExecucaoTeste(marker: MarkerExecucaoTeste): PersistTesteContexto {
  return {
    id_execucao_teste: marker.id_execucao_teste,
    ambiente_teste: marker.ambiente_teste ?? 'Local',
    disparado_por_teste: marker.disparado_por_teste,
    gatilho_teste: marker.gatilho_teste ?? 'manual',
    data_criacao_teste: marker.data_inicio_execucao_teste,
  }
}

export type ResultadoValidacaoExecucaoTeste =
  | { ok: true }
  | { ok: false; codigo: string; mensagem: string }

export function validarNovaExecucaoTeste(opts: {
  runner_execucao_teste: RunnerExecucaoTeste
  lista_planos_execucao_teste?: string[]
  lista_modulos_execucao_teste?: string[]
}): ResultadoValidacaoExecucaoTeste {
  const ativas = listarExecucoesAtivasTeste()
  const limite = obterLimiteExecucoesSimultaneasTeste()

  if (ativas.length >= limite) {
    return {
      ok: false,
      codigo: 'LIMITE_EXECUCOES_ATINGIDO',
      mensagem: `Limite de ${limite} execuções simultâneas atingido. Aguarde uma concluir.`,
    }
  }

  const planosNovos = new Set(opts.lista_planos_execucao_teste ?? [])
  if (planosNovos.size > 0) {
    for (const ativa of ativas) {
      for (const plano of ativa.lista_planos_execucao_teste ?? []) {
        if (planosNovos.has(plano)) {
          return {
            ok: false,
            codigo: 'PLANO_EM_EXECUCAO',
            mensagem: `O plano ${plano} já está em execução (run ${ativa.id_execucao_teste}).`,
          }
        }
      }
    }
  }

  return { ok: true }
}

function resolverCaminhoResultadoEmt(id_execucao_teste: string): string {
  const novo = caminhoResultadoEmtTeste(id_execucao_teste)
  if (existsSync(novo)) return novo
  const legado = join(testLogsDir, `emt-result-${id_execucao_teste}.json`)
  if (existsSync(legado)) return legado
  return novo
}

export function finalizarRunEmt(
  marker: MarkerExecucaoTeste,
  debugLog?: (msg: string) => void,
): void {
  const log = debugLog ?? (() => {})
  const resultPath = resolverCaminhoResultadoEmt(marker.id_execucao_teste)

  if (existsSync(resultPath)) {
    try {
      const raw = JSON.parse(readFileSync(resultPath, 'utf-8')) as { entries: TestLogEntry[] }
      if (Array.isArray(raw.entries) && raw.entries.length > 0) {
        void appendTestLogEntries(raw.entries, log, marker.data_inicio_execucao_teste, ctxDoMarkerExecucaoTeste(marker))
      }
      unlinkSync(resultPath)
      log(`EMT finalize ${marker.id_execucao_teste} — ${raw.entries?.length ?? 0} entries`)
    } catch (err) {
      log(`EMT finalize ${marker.id_execucao_teste} READ FAILED: ${err instanceof Error ? err.message : String(err)}`)
    }
    removerMarkerExecucaoTeste(marker.id_execucao_teste)
    return
  }

  appendTestLogEntries([{
    type: 'EMT',
    module: 'EMT/run-interrompido',
    test_name: marker.id_execucao_teste,
    result: 'ERRO',
    duration: '0ms',
    error_log:
      'Run EMT interrompido antes de gravar resultado (cfg-back reiniciou via tsx watch, ou processo filho morreu). '
      + 'Aguarde ~2 min na próxima execução sem reiniciar o cfg-back.',
    ai_analysis: null,
  }], log, marker.data_inicio_execucao_teste, ctxDoMarkerExecucaoTeste(marker))
  log(`EMT finalize ${marker.id_execucao_teste} — orphan sem emt-resultado-teste (gravado ERRO)`)
  removerMarkerExecucaoTeste(marker.id_execucao_teste)
}

function finalizarRunE2EOrfao(
  marker: MarkerExecucaoTeste,
  debugLog?: (msg: string) => void,
): void {
  const stdoutPath = join(testLogsDir, `playwright-run-${marker.id_execucao_teste}.json`)
  if (!existsSync(stdoutPath)) {
    removerMarkerExecucaoTeste(marker.id_execucao_teste)
    return
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
    void appendTestLogEntries(entries, debugLog, marker.data_inicio_execucao_teste, ctxDoMarkerExecucaoTeste(marker))
  }

  try { unlinkSync(stdoutPath) } catch { /* ok */ }
  try { unlinkSync(stdoutPath.replace('.json', '.stderr.log')) } catch { /* ok */ }
  removerMarkerExecucaoTeste(marker.id_execucao_teste)
}

export function processarExecucoesOrfasTeste(debugLog?: (msg: string) => void): void {
  migrarMarkerLegadoSeExistir()
  for (const marker of listarMarkersExecucaoTeste()) {
    if (marker.status_execucao_teste !== 'rodando') {
      removerMarkerExecucaoTeste(marker.id_execucao_teste)
      continue
    }
    if (isProcessoExecucaoTesteAtivo(marker.pid_execucao_teste)) continue

    if (marker.runner_execucao_teste === 'EMT') {
      finalizarRunEmt(marker, debugLog)
    } else {
      finalizarRunE2EOrfao(marker, debugLog)
    }
  }
}

export interface ExecucaoTesteStatusApi {
  id_execucao_teste: string
  data_inicio_execucao_teste: string
  runner_execucao_teste: RunnerExecucaoTeste | null
  ambiente_teste: string
  gatilho_teste: GatilhoExecucaoTeste
  lista_planos_execucao_teste: string[]
  lista_modulos_execucao_teste: string[]
  disparado_por_teste: string | null
}

export function montarRespostaStatusExecucoesTeste(): {
  execucoes_teste: ExecucaoTesteStatusApi[]
  limite_execucoes_simultaneas_teste: number
  quantidade_execucoes_ativas_teste: number
} {
  processarExecucoesOrfasTeste()
  const ativas = listarExecucoesAtivasTeste()
  return {
    execucoes_teste: ativas.map(m => ({
      id_execucao_teste: m.id_execucao_teste,
      data_inicio_execucao_teste: m.data_inicio_execucao_teste,
      runner_execucao_teste: m.runner_execucao_teste ?? null,
      ambiente_teste: m.ambiente_teste ?? 'Local',
      gatilho_teste: m.gatilho_teste ?? 'manual',
      lista_planos_execucao_teste: m.lista_planos_execucao_teste ?? [],
      lista_modulos_execucao_teste: m.lista_modulos_execucao_teste ?? [],
      disparado_por_teste: m.disparado_por_teste ?? null,
    })),
    limite_execucoes_simultaneas_teste: obterLimiteExecucoesSimultaneasTeste(),
    quantidade_execucoes_ativas_teste: ativas.length,
  }
}
