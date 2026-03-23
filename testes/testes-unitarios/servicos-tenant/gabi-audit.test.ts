// server/tests/audit.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditGabiAction } from '../../../servicos-global/tenant/gabi/server/services/audit.js'
import prisma from '../../../servicos-global/tenant/gabi/server/lib/prisma.js'

vi.mock('../../../servicos-global/tenant/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiUsageLog: {
      create: vi.fn()
    }
  }
}))

describe('Barreira 2 & 5: auditGabiAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve gravar o log de auditoria com os dados corretos e actor_type = gabi (Barreira 5)', async () => {
    const mockCreate = prisma.gabiUsageLog.create as any
    mockCreate.mockResolvedValue({ id: 'log123' })

    const result = await auditGabiAction('user1', 't1', 'create', 'snapshot json')
    
    expect(result).toEqual({ id: 'log123' })
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        tenant_id: 't1',
        product_id: undefined,
        user_id: 'user1',
        action_taken: 'create',
        conversation_snapshot: 'snapshot json',
        actor_type: 'gabi',
        triggered_by: 'user1'
      }
    })
  })

  it('lança erro se conversation_snapshot não for fornecido (Barreira 2)', async () => {
    await expect(auditGabiAction('u1', 't1', 'action', '')).rejects.toThrow(/Obrigatório fornecer conversationSnapshot/)
  })
})
