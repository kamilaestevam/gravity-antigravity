// @vitest-environment node
/**
 * Testes unitários — lgpdService.ts
 * Verifica export, delete, dry-run e USER_DATA_MAP.
 */

import { describe, it, expect, vi } from 'vitest'

// Mock PrismaClient
const mockFindFirst = vi.fn()
const mockFindMany = vi.fn()
const mockDeleteMany = vi.fn()
const mockUpdateMany = vi.fn()
const mockCount = vi.fn()
const mockTransaction = vi.fn()

vi.mock('@prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    user = { findFirst: mockFindFirst }
    userPermission = { findMany: mockFindMany, deleteMany: mockDeleteMany, count: mockCount }
    historyLog = { updateMany: mockUpdateMany }
    $transaction = mockTransaction
  },
}))

import { exportUserData, deleteUserData, USER_DATA_MAP } from '../../../servicos-global/configurador/server/services/lgpdService.js'
import { PrismaClient } from '@prisma/client'

describe('lgpdService', () => {
  const prisma = new PrismaClient() as any

  describe('exportUserData', () => {
    it('deve exportar dados do usuario encontrado', async () => {
      mockFindFirst.mockResolvedValueOnce({
        id: 'u1',
        clerk_user_id: 'clerk-123',
        name: 'Test User',
        email: 'test@test.com',
      })
      mockFindMany.mockResolvedValueOnce([
        { id: 'p1', permission: 'email:write' },
      ])

      const result = await exportUserData(prisma, 'tenant-A', 'clerk-123')

      expect(result.userId).toBe('clerk-123')
      expect(result.tenantId).toBe('tenant-A')
      expect(result.data.user).toHaveLength(1)
      expect(result.data.permissions).toHaveLength(1)
      expect(result.exportedAt).toBeDefined()
    })

    it('deve retornar data vazio se usuario nao encontrado', async () => {
      mockFindFirst.mockResolvedValueOnce(null)
      mockFindMany.mockResolvedValueOnce([])

      const result = await exportUserData(prisma, 'tenant-A', 'nao-existe')

      expect(result.data.user).toBeUndefined()
      expect(result.data.permissions).toBeUndefined()
    })
  })

  describe('deleteUserData — dry run', () => {
    it('deve contar registros sem deletar', async () => {
      mockCount.mockResolvedValueOnce(5) // userPermission

      const result = await deleteUserData(prisma, 'tenant-A', 'user-1', { dryRun: true })

      expect(result.totalRecordsDeleted).toBe(5)
      expect(result.tablesAffected).toContain('userPermission')
      expect(mockDeleteMany).not.toHaveBeenCalled()
    })
  })

  describe('USER_DATA_MAP', () => {
    it('deve ter mapeamento para configurador', () => {
      expect(USER_DATA_MAP.configurador).toContain('User')
      expect(USER_DATA_MAP.configurador).toContain('UserPermission')
    })

    it('deve ter mapeamento para servicos tenant', () => {
      expect(USER_DATA_MAP.tenant.cronometro).toContain('TimerSession')
      expect(USER_DATA_MAP.tenant.email).toContain('EmailThread')
      expect(USER_DATA_MAP.tenant.notificacoes).toContain('Notification')
    })

    it('deve ter mapeamento para produtos', () => {
      expect(USER_DATA_MAP.produtos['bid-frete']).toContain('Cotacao')
      expect(USER_DATA_MAP.produtos['simula-custo']).toContain('Estimativa')
      expect(USER_DATA_MAP.produtos.processo).toContain('Processo')
    })

    it('historico deve ser anonimizado, nao deletado', () => {
      expect(USER_DATA_MAP.tenant.historico[0]).toContain('anonimizado')
    })
  })
})
