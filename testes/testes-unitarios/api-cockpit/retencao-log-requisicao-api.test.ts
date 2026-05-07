/**
 * Testes unitarios — worker de retencao log_requisicao_api
 *
 * Cobre:
 *   - calcularProximaExecucaoMs em diferentes momentos do dia (UTC)
 *   - executarRetencao com prisma mockado (sucesso, falha de DELETE, falha de VACUUM)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// vi.hoisted garante que os mocks sejam criados antes dos imports dos arquivos sob teste.
// Sem isso, o factory do vi.mock — que tambem e hoisted — nao consegue referenciar variaveis externas.
const { deleteManyMock, executeRawUnsafeMock } = vi.hoisted(() => ({
  deleteManyMock:       vi.fn(),
  executeRawUnsafeMock: vi.fn(),
}))

vi.mock('../../../servicos-global/servicos-plataforma/generated/index.js', () => ({
  PrismaClient: vi.fn().mockImplementation(() => ({
    logRequisicaoApi:  { deleteMany: deleteManyMock },
    $executeRawUnsafe: executeRawUnsafeMock,
  })),
}))

// Mock do logger para nao poluir saida do teste
vi.mock('../../../servicos-global/servicos-plataforma/middleware/logger.js', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() },
}))

import {
  calcularProximaExecucaoMs,
  executarRetencao,
} from '../../../servicos-global/servicos-plataforma/api-cockpit/server/src/workers/retencao-log-requisicao-api'

beforeEach(() => {
  deleteManyMock.mockReset()
  executeRawUnsafeMock.mockReset()
})

afterEach(() => {
  vi.useRealTimers()
})

// ─── calcularProximaExecucaoMs ─────────────────────────────────────────

describe('calcularProximaExecucaoMs', () => {
  it('agora 00:00 UTC: proxima execucao em ~3h (3h UTC mesmo dia)', () => {
    const agora = new Date('2026-05-07T00:00:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe(3 * 60 * 60 * 1000)
  })

  it('agora 02:59 UTC: proxima execucao em ~1min', () => {
    const agora = new Date('2026-05-07T02:59:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe(60 * 1000)
  })

  it('agora exatamente 03:00 UTC: pula pro dia seguinte (24h)', () => {
    const agora = new Date('2026-05-07T03:00:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe(24 * 60 * 60 * 1000)
  })

  it('agora 03:01 UTC: agenda pro dia seguinte (~24h - 1min)', () => {
    const agora = new Date('2026-05-07T03:01:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe(24 * 60 * 60 * 1000 - 60 * 1000)
  })

  it('agora 14:00 UTC: agenda pro dia seguinte 03h (~13h)', () => {
    const agora = new Date('2026-05-07T14:00:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe(13 * 60 * 60 * 1000)
  })

  it('virada de mes: 30/04 23:59 UTC -> 01/05 03:00 UTC', () => {
    const agora = new Date('2026-04-30T23:59:00Z')
    const ms = calcularProximaExecucaoMs(agora)
    expect(ms).toBe((3 * 60 + 1) * 60 * 1000)
  })
})

// ─── executarRetencao ──────────────────────────────────────────────────

describe('executarRetencao', () => {
  it('apaga registros antigos e roda VACUUM com sucesso', async () => {
    deleteManyMock.mockResolvedValue({ count: 1234 })
    executeRawUnsafeMock.mockResolvedValue(undefined)

    const resultado = await executarRetencao()

    expect(resultado).toEqual({ apagados: 1234, vacuumOk: true })
    expect(deleteManyMock).toHaveBeenCalledOnce()
    expect(executeRawUnsafeMock).toHaveBeenCalledWith('VACUUM ANALYZE log_requisicao_api')
  })

  it('passa um filtro com data_criacao_log_requisicao_api lt para deleteMany', async () => {
    deleteManyMock.mockResolvedValue({ count: 0 })
    executeRawUnsafeMock.mockResolvedValue(undefined)

    await executarRetencao()

    const arg = deleteManyMock.mock.calls[0][0]
    expect(arg.where).toBeDefined()
    expect(arg.where.data_criacao_log_requisicao_api).toBeDefined()
    expect(arg.where.data_criacao_log_requisicao_api.lt).toBeInstanceOf(Date)

    // O limite deve ser ~90 dias atras (tolerancia de 1 minuto pra slop)
    const limite = arg.where.data_criacao_log_requisicao_api.lt as Date
    const esperado = Date.now() - 90 * 24 * 60 * 60 * 1000
    expect(Math.abs(limite.getTime() - esperado)).toBeLessThan(60_000)
  })

  it('VACUUM falha mas DELETE foi feito: vacuumOk=false, apagados preservados', async () => {
    deleteManyMock.mockResolvedValue({ count: 42 })
    executeRawUnsafeMock.mockRejectedValue(new Error('vacuum em curso'))

    const resultado = await executarRetencao()

    expect(resultado).toEqual({ apagados: 42, vacuumOk: false })
  })

  it('DELETE falha: retorna apagados=0, vacuumOk=false sem propagar erro', async () => {
    deleteManyMock.mockRejectedValue(new Error('connection refused'))

    const resultado = await executarRetencao()

    expect(resultado).toEqual({ apagados: 0, vacuumOk: false })
    expect(executeRawUnsafeMock).not.toHaveBeenCalled()
  })

  it('zero registros antigos: retorna apagados=0, vacuumOk=true', async () => {
    deleteManyMock.mockResolvedValue({ count: 0 })
    executeRawUnsafeMock.mockResolvedValue(undefined)

    const resultado = await executarRetencao()

    expect(resultado).toEqual({ apagados: 0, vacuumOk: true })
  })
})
