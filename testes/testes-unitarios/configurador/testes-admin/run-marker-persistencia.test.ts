// @vitest-environment node
// Markers de execução de teste — suporte a runs simultâneos.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { existsSync, writeFileSync, readFileSync, mkdirSync, rmSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../../..')
const tmpDir = path.join(root, 'testes', 'testes-unitarios', 'configurador', 'testes-admin', '_tmp-run-marker')

vi.mock('../../../../servicos-global/configurador/server/lib/test-log-persist.js', () => ({
  testLogsDir: tmpDir,
  appendTestLogEntries: vi.fn(),
}))

const {
  gravarMarkerExecucaoTeste,
  lerMarkerExecucaoTeste,
  listarMarkersExecucaoTeste,
  removerMarkerExecucaoTeste,
  listarExecucoesAtivasTeste,
  validarNovaExecucaoTeste,
  migrarMarkerLegadoSeExistir,
  caminhoResultadoEmtTeste,
  DIRETORIO_MARKERS_EXECUCAO_TESTE,
} = await import('../../../../servicos-global/configurador/server/lib/execucao-teste-markers.js')

function markerExemplo(id: string, pid = process.pid): Parameters<typeof gravarMarkerExecucaoTeste>[0] {
  return {
    status_execucao_teste: 'rodando',
    pid_execucao_teste: pid,
    data_inicio_execucao_teste: '2026-06-10T12:00:00.000Z',
    id_execucao_teste: id,
    runner_execucao_teste: 'EMT',
    ambiente_teste: 'Local',
    gatilho_teste: 'manual',
    lista_planos_execucao_teste: ['TST-EMT-PEDIDO-001'],
  }
}

beforeEach(() => {
  mkdirSync(tmpDir, { recursive: true })
  mkdirSync(DIRETORIO_MARKERS_EXECUCAO_TESTE, { recursive: true })
})

afterEach(() => {
  try { rmSync(tmpDir, { recursive: true, force: true }) } catch { /* ok */ }
})

describe('markers de execucao teste', () => {
  it('gravar e ler marker por id_execucao_teste', () => {
    const m = markerExemplo('run-001')
    gravarMarkerExecucaoTeste(m)
    expect(lerMarkerExecucaoTeste('run-001')).toEqual(m)
  })

  it('listar múltiplos markers simultâneos', () => {
    gravarMarkerExecucaoTeste(markerExemplo('run-a'))
    gravarMarkerExecucaoTeste(markerExemplo('run-b', process.pid))
    expect(listarMarkersExecucaoTeste()).toHaveLength(2)
    expect(listarExecucoesAtivasTeste()).toHaveLength(2)
  })

  it('remover marker específico sem afetar outros', () => {
    gravarMarkerExecucaoTeste(markerExemplo('run-x'))
    gravarMarkerExecucaoTeste(markerExemplo('run-y'))
    removerMarkerExecucaoTeste('run-x')
    expect(lerMarkerExecucaoTeste('run-x')).toBeNull()
    expect(lerMarkerExecucaoTeste('run-y')).not.toBeNull()
  })

  it('validarNovaExecucaoTeste bloqueia plano já em execução', () => {
    gravarMarkerExecucaoTeste(markerExemplo('ativo'))
    const r = validarNovaExecucaoTeste({
      runner_execucao_teste: 'E2E',
      lista_planos_execucao_teste: ['TST-EMT-PEDIDO-001'],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.codigo).toBe('PLANO_EM_EXECUCAO')
  })

  it('validarNovaExecucaoTeste bloqueia segundo EMT simultâneo', () => {
    gravarMarkerExecucaoTeste(markerExemplo('emt-1'))
    const r = validarNovaExecucaoTeste({
      runner_execucao_teste: 'EMT',
      lista_planos_execucao_teste: ['TST-EMT-PEDIDO-002'],
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.codigo).toBe('EMT_CONCORRENTE')
  })

  it('migra _current-run.json legado para runs/', () => {
    writeFileSync(path.join(tmpDir, '_current-run.json'), JSON.stringify({
      status: 'running',
      pid: process.pid,
      started_at: '2026-06-10T11:00:00.000Z',
      runId: 'legado-123',
      runner: 'E2E',
    }))
    migrarMarkerLegadoSeExistir()
    expect(existsSync(path.join(tmpDir, '_current-run.json'))).toBe(false)
    expect(lerMarkerExecucaoTeste('legado-123')?.id_execucao_teste).toBe('legado-123')
  })

  it('caminhoResultadoEmtTeste usa nome DDD emt-resultado-teste', () => {
    expect(caminhoResultadoEmtTeste('abc')).toContain('emt-resultado-teste-abc.json')
  })
})
