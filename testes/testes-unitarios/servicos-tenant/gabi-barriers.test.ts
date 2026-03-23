// server/tests/barriers.test.ts
import { describe, it, expect, vi } from 'vitest'
import { executeGabiAction } from '../../../servicos-global/tenant/gabi/server/services/execute.js'

vi.mock('../../../servicos-global/tenant/gabi/server/services/audit.js', () => ({
  auditGabiAction: vi.fn().mockResolvedValue({ id: 'aud123' })
}))

describe('Barreiras 4 e 6: Confirmações e Transparência', () => {
  const allowAccess = async () => true

  it('exige confirmação do usuário antes de rodar ações destrutivas como delete (Barreira 4)', async () => {
    const action = { type: 'delete', resource: 'Service', context: 'ctxt' }
    
    // Tentativa sem confirmação
    const result = await executeGabiAction('u1', 't1', action, undefined, allowAccess)
    
    expect(result).toHaveProperty('requiresConfirmation', true)
    expect(result.success).toBeUndefined()
  })

  it('executa ação destrutiva se `confirmed: true` estiver no payload', async () => {
    const action = { type: 'delete', resource: 'Service', context: 'ctxt', confirmed: true }
    
    const runner = vi.fn().mockResolvedValue({ deleted: 1 })
    const result = await executeGabiAction('u1', 't1', action, undefined, allowAccess, runner)
    
    expect(result.success).toBe(true)
    expect(runner).toHaveBeenCalledTimes(1)
  })

  it('emite eventos SSE de transparência (Barreira 6)', async () => {
    const action = { type: 'create', resource: 'Service', context: 'ctxt' }
    const emit = vi.fn()
    const runner = vi.fn().mockResolvedValue(true)

    await executeGabiAction('u1', 't1', action, emit, allowAccess, runner)

    expect(emit).toHaveBeenCalledWith('transparency', expect.objectContaining({ message: expect.stringContaining('Verificando permissões') }))
    expect(emit).toHaveBeenCalledWith('transparency', expect.objectContaining({ message: expect.stringContaining('📝 Esta conversa') }))
  })
})
