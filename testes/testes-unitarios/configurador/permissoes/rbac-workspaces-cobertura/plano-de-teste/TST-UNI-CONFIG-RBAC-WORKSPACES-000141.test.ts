// TST-UNI-CONFIG-RBAC-WORKSPACES-000141 — RBAC Workspaces + Permissões Granulares (unitário)
// Plano: rbac-workspaces-unitario.md | Task: TASK-000305
/// <reference types="vitest/globals" />

import {
  temBypassPermissao,
} from '../../../../../../servicos-global/configurador/shared/permissao-bypass.js'
import {
  buildPermissaoString,
  chavesDefaultGranulares,
  ehPermissaoAcessoUsuarioProdutoGravity,
  extrairSlugDaPermissao,
  PERMISSAO_REGEX_PATTERN,
  PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS,
  togglesGranularesPorProduto,
  usuarioTemPermissaoGranularProduto,
  usuarioTemPermissaoCotarFrete,
} from '../../../../../../servicos-global/configurador/shared/permissoes-canonicas.js'

const regexPermissao = new RegExp(PERMISSAO_REGEX_PATTERN)

describe('TST-UNI-CONFIG-RBAC-WORKSPACES-000141', () => {
  describe('ETAPA 1 — temBypassPermissao', () => {
    it('U01–U03: SUPER_ADMIN, ADMIN, MASTER → bypass true', () => {
      expect(temBypassPermissao({ tipo_usuario: 'SUPER_ADMIN' })).toBe(true)
      expect(temBypassPermissao({ tipo_usuario: 'ADMIN' })).toBe(true)
      expect(temBypassPermissao({ tipo_usuario: 'MASTER' })).toBe(true)
    })

    it('U04–U06: PADRAO, FORNECEDOR, null → bypass false', () => {
      expect(temBypassPermissao({ tipo_usuario: 'PADRAO' })).toBe(false)
      expect(temBypassPermissao({ tipo_usuario: 'FORNECEDOR' })).toBe(false)
      expect(temBypassPermissao({ tipo_usuario: null })).toBe(false)
    })
  })

  describe('ETAPA 2 — regex canônico', () => {
    it('U07–U10: chaves válidas', () => {
      expect(regexPermissao.test('pedido:lista:ver')).toBe(true)
      expect(regexPermissao.test('pedido:historico:editar')).toBe(true)
      expect(regexPermissao.test('pedido:acesso_usuario_produtos_gravity:permitido')).toBe(true)
      expect(regexPermissao.test('bid-frete:visao_fornecedor:cotar')).toBe(true)
    })

    it('U11–U13: chaves inválidas', () => {
      expect(regexPermissao.test('Pedido:lista:ver')).toBe(false)
      expect(regexPermissao.test('pedido:foo:ver')).toBe(false)
      expect(regexPermissao.test('pedido:lista:delete')).toBe(false)
    })

    it('U14: buildPermissaoString', () => {
      expect(buildPermissaoString('pedido', 'lista', 'ver')).toBe('pedido:lista:ver')
    })
  })

  describe('ETAPA 3 — defaults granulares', () => {
    it('U15–U18: PADRAO e FORNECEDOR least-privilege', () => {
      expect(chavesDefaultGranulares('pedido', 'PADRAO')).toEqual(['pedido:lista:ver'])
      expect(chavesDefaultGranulares('pedido', 'FORNECEDOR')).toEqual([
        'pedido:dashboard:ver',
        'pedido:lista:ver',
        'pedido:historico:ver',
      ])
      expect(chavesDefaultGranulares('pedido', 'PADRAO').some(k => k.includes('configuracao'))).toBe(false)
      expect(chavesDefaultGranulares('pedido', 'FORNECEDOR').some(k => k.includes('kanban'))).toBe(false)
    })
  })

  describe('ETAPA 4 — helpers Set', () => {
    const set = new Set(['pedido:lista:ver', 'bid-frete:visao_fornecedor:cotar'])

    it('U19–U23: verificação granular e slug', () => {
      expect(usuarioTemPermissaoGranularProduto(set, 'pedido')).toBe(true)
      expect(usuarioTemPermissaoGranularProduto(new Set(), 'pedido')).toBe(false)
      expect(usuarioTemPermissaoCotarFrete(set, 'bid-frete')).toBe(true)
      expect(ehPermissaoAcessoUsuarioProdutoGravity('pedido:acesso_usuario_produtos_gravity:permitido')).toBe(true)
      expect(extrairSlugDaPermissao('pedido:lista:ver')).toBe('pedido')
    })
  })

  describe('ETAPA 5 — PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS', () => {
    it('U24–U25: Set e toggles', () => {
      expect(PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has('pedido')).toBe(true)
      expect(PRODUTOS_COM_PERMISSOES_IMPLEMENTADAS.has('bid-frete')).toBe(true)
      expect(togglesGranularesPorProduto('pedido')).toBe(12)
      expect(togglesGranularesPorProduto('bid-frete')).toBe(13)
    })
  })

  describe('ETAPA 6 — Zod PUT permissões', () => {
    it.todo('U27–U30: importar schema PUT e validar payloads')
  })

  describe('ETAPA 7 — filtro workspace puro', () => {
    it.todo('U31–U33: extrair ou testar helper de filtro hub/me')
  })
})
