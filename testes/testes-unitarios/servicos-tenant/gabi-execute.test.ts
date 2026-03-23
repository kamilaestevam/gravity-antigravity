// server/tests/execute.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeGabiAction } from '../../../servicos-global/tenant/gabi/server/services/execute.js'
import * as auditModule from '../../../servicos-global/tenant/gabi/server/services/audit.js'
import { AppError } from '../../../servicos-global/tenant/gabi/server/lib/errors.js'

vi.mock('../../../servicos-global/tenant/gabi/server/services/audit.js')

describe('executeGabiAction - Barreiras 3 e Rollback', () => {
  const allowAllAccess = async () => true

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve cancelar a ação (rollback) se a gravação da auditoria falhar (Barreira 3)', async () => {
    // Simula falha no banco de dados durante a auditoria
    vi.spyOn(auditModule, 'auditGabiAction').mockRejectedValueOnce(new Error('DB Timeout'))

    const action = { type: 'create', resource: 'Doc', context: 'ctxt' }
    const runner = vi.fn()

    await expect(executeGabiAction('u1', 't1', action, undefined, allowAllAccess, runner))
      .rejects.toThrow('DB Timeout')

    // Certifica-se de que a ação real NUNCA foi chamada
    expect(runner).not.toHaveBeenCalled()
  })

  it('deve executar normalmente quando auditoria funciona', async () => {
    vi.spyOn(auditModule, 'auditGabiAction').mockResolvedValueOnce({ id: 'aud123' } as any)
    const runner = vi.fn().mockResolvedValue({ success: true, processedBy: 'gabi' })

    const result = await executeGabiAction('u1', 't1', { type: 'create', resource: 'Doc', context: 'ctx' }, undefined, allowAllAccess, runner)

    expect(result.success).toBe(true)
    expect(result.auditLogId).toBe('aud123')
    expect(runner).toHaveBeenCalledTimes(1)
  })
})
