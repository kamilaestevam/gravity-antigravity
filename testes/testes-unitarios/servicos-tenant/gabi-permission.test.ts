// server/tests/permission.test.ts
import { describe, it, expect } from 'vitest'
import { assertGabiPermission } from '../../../servicos-global/tenant/gabi/server/services/permission.js'
import { AppError } from '../../../servicos-global/tenant/gabi/server/lib/errors.js'

describe('Barreira 1: assertGabiPermission', () => {
  it('deve passar se o usuário tiver permissão', async () => {
    const mockChecker = async () => true
    await expect(assertGabiPermission('user1', 'create', 'Activity', 't1', mockChecker))
      .resolves.toBeUndefined()
  })

  it('deve lançar AppError se o usuário NÃO tiver permissão', async () => {
    const mockChecker = async () => false
    await expect(assertGabiPermission('user1', 'delete', 'Activity', 't1', mockChecker))
      .rejects.toThrow(AppError)
  })

  it('deve incluir os detalhes da ação negada na mensagem de erro', async () => {
    const mockChecker = async () => false
    try {
      await assertGabiPermission('user-fail', 'export', 'Report', 't1', mockChecker)
      expect.fail('Deveria ter lançado erro')
    } catch (err) {
      const e = err as { message: string; statusCode: number; code: string }
      expect(e.message).toContain('user-fail')
      expect(e.message).toContain('export')
      expect(e.message).toContain('Report')
      expect(e.statusCode).toBe(403)
      expect(e.code).toBe('FORBIDDEN_GABI_ACTION')
    }
  })
})
