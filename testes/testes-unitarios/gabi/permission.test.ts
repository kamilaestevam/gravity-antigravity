// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {},
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/errors.js', () => ({
  AppError: class AppError extends Error {
    statusCode: number
    code: string
    constructor(message: string, statusCode: number, code: string) {
      super(message)
      this.statusCode = statusCode
      this.code = code
    }
  },
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/catalogo-ferramentas.js', () => ({
  buscarTool: (id: string) => {
    const catalog: Record<string, unknown> = {
      'pedido.listar': { id: 'pedido.listar', produto: 'pedido', classe: 'READ', permissao_minima: null },
      'pedido.criar': { id: 'pedido.criar', produto: 'pedido', classe: 'WRITE_SAFE', permissao_minima: 'PADRAO' },
      'admin.listar_organizacoes': { id: 'admin.listar_organizacoes', produto: 'admin', classe: 'READ', permissao_minima: 'ADMIN' },
      'configurador.alterar_patente': { id: 'configurador.alterar_patente', produto: 'configurador', classe: 'WRITE_DESTRUTIVA', permissao_minima: 'MASTER' },
    }
    return catalog[id] ?? null
  },
}))

import {
  verificarPermissaoLocal,
  verificarPermissaoCompleta,
  _limparCachePermissoes,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/permission.js'

describe('permission', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    _limparCachePermissoes()
  })

  describe('verificarPermissaoLocal', () => {
    it('permite READ para qualquer usuario', () => {
      expect(verificarPermissaoLocal('PADRAO', 'pedido.listar')).toBe(true)
      expect(verificarPermissaoLocal('FORNECEDOR', 'pedido.listar')).toBe(true)
    })

    it('permite tool sem permissao_minima para qualquer usuario', () => {
      expect(verificarPermissaoLocal('FORNECEDOR', 'pedido.listar')).toBe(true)
    })

    it('permite PADRAO em tool com permissao_minima PADRAO', () => {
      expect(verificarPermissaoLocal('PADRAO', 'pedido.criar')).toBe(true)
    })

    it('bloqueia FORNECEDOR em tool com permissao_minima PADRAO', () => {
      expect(verificarPermissaoLocal('FORNECEDOR', 'pedido.criar')).toBe(false)
    })

    it('permite SUPER_ADMIN em qualquer tool', () => {
      expect(verificarPermissaoLocal('SUPER_ADMIN', 'configurador.alterar_patente')).toBe(true)
      expect(verificarPermissaoLocal('SUPER_ADMIN', 'admin.listar_organizacoes')).toBe(true)
    })

    it('bloqueia PADRAO em tool com permissao_minima MASTER', () => {
      expect(verificarPermissaoLocal('PADRAO', 'configurador.alterar_patente')).toBe(false)
    })

    it('permite MASTER em tool com permissao_minima MASTER', () => {
      expect(verificarPermissaoLocal('MASTER', 'configurador.alterar_patente')).toBe(true)
    })

    it('retorna false para tool desconhecida', () => {
      expect(verificarPermissaoLocal('SUPER_ADMIN', 'nao.existe')).toBe(false)
    })
  })

  describe('verificarPermissaoCompleta', () => {
    it('bloqueia usuario anonimo em WRITE', async () => {
      await expect(
        verificarPermissaoCompleta('org-1', 'anonymous', 'PADRAO', 'pedido.criar'),
      ).rejects.toThrow('Autenticacao necessaria')
    })

    it('permite usuario anonimo em READ', async () => {
      await expect(
        verificarPermissaoCompleta('org-1', 'anonymous', 'PADRAO', 'pedido.listar'),
      ).resolves.toBeUndefined()
    })

    it('bloqueia hierarquia insuficiente', async () => {
      await expect(
        verificarPermissaoCompleta('org-1', 'usr-1', 'FORNECEDOR', 'pedido.criar'),
      ).rejects.toThrow('Permissao insuficiente')
    })

    it('permite hierarquia suficiente sem S2S', async () => {
      await expect(
        verificarPermissaoCompleta('org-1', 'usr-1', 'PADRAO', 'pedido.criar'),
      ).resolves.toBeUndefined()
    })
  })
})
