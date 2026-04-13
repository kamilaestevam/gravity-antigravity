// @vitest-environment node
/**
 * Testes unitarios — Gabi permission checker
 * Verifica que o default checker nega acesso (secure by default).
 */

import { describe, it, expect } from 'vitest'
import {
  assertGabiPermission,
  type PermissionChecker,
} from '../../../servicos-global/tenant/gabi/server/services/permission.js'

describe('Gabi Permission — Secure by Default', () => {
  it('default checker deve negar acesso (retornar false)', async () => {
    // Quando nenhum checker customizado e fornecido, o default deve negar
    await expect(
      assertGabiPermission('user-1', 'read', 'Activity', 'tenant-1')
    ).rejects.toThrow()
  })

  it('default checker deve lancar erro 403 com codigo FORBIDDEN_GABI_ACTION', async () => {
    try {
      await assertGabiPermission('user-1', 'delete', 'Report', 'tenant-1')
      expect.fail('Deveria ter lancado erro')
    } catch (err) {
      const e = err as { statusCode: number; code: string; message: string }
      expect(e.statusCode).toBe(403)
      expect(e.code).toBe('FORBIDDEN_GABI_ACTION')
      expect(e.message).toContain('user-1')
      expect(e.message).toContain('delete')
      expect(e.message).toContain('Report')
      expect(e.message).toContain('Barreira 1')
    }
  })

  it('assertGabiPermission deve lancar 403 quando checker retorna false', async () => {
    const denyChecker: PermissionChecker = async () => false

    await expect(
      assertGabiPermission('user-x', 'create', 'Task', 'tenant-x', denyChecker)
    ).rejects.toMatchObject({
      statusCode: 403,
      code: 'FORBIDDEN_GABI_ACTION',
    })
  })

  it('assertGabiPermission deve passar quando checker customizado retorna true', async () => {
    const allowChecker: PermissionChecker = async () => true

    await expect(
      assertGabiPermission('user-ok', 'read', 'Dashboard', 'tenant-ok', allowChecker)
    ).resolves.toBeUndefined()
  })

  it('assertGabiPermission deve propagar erro do checker (nao engolir excecoes)', async () => {
    const brokenChecker: PermissionChecker = async () => {
      throw new Error('Servico de permissoes indisponivel')
    }

    await expect(
      assertGabiPermission('user-1', 'read', 'Data', 'tenant-1', brokenChecker)
    ).rejects.toThrow('Servico de permissoes indisponivel')
  })

  it('deve incluir userId, action e resource na mensagem de erro', async () => {
    try {
      await assertGabiPermission('usr-abc', 'export', 'Financeiro', 'tnt-99')
      expect.fail('Deveria ter lancado erro')
    } catch (err) {
      const e = err as { statusCode: number; code: string; message: string }
      expect(e.message).toContain('usr-abc')
      expect(e.message).toContain('export')
      expect(e.message).toContain('Financeiro')
    }
  })
})
