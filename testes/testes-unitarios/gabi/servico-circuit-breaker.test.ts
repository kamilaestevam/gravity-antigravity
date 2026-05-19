// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPrismaCreate = vi.fn()
const mockPrismaFindUnique = vi.fn()
const mockPrismaUpdate = vi.fn()
const mockPrismaDeleteMany = vi.fn()

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiConfirmacaoAcao: {
      create: (...args: unknown[]) => mockPrismaCreate(...args),
      findUnique: (...args: unknown[]) => mockPrismaFindUnique(...args),
      update: (...args: unknown[]) => mockPrismaUpdate(...args),
      deleteMany: (...args: unknown[]) => mockPrismaDeleteMany(...args),
    },
    gabiToolExecucao: {
      create: vi.fn(),
    },
  },
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
      'pedido.listar': { id: 'pedido.listar', produto: 'pedido', classe: 'READ', metodo: 'GET', descricao: 'Listar pedidos', endpoint: '/api/v1/pedidos' },
      'pedido.criar': { id: 'pedido.criar', produto: 'pedido', classe: 'WRITE_SAFE', metodo: 'POST', descricao: 'Criar novo pedido', endpoint: '/api/v1/pedidos' },
      'pedido.excluir': { id: 'pedido.excluir', produto: 'pedido', classe: 'WRITE_DESTRUTIVA', metodo: 'DELETE', descricao: 'Excluir pedido', endpoint: '/api/v1/pedidos/:id_pedido' },
    }
    return catalog[id] ?? null
  },
}))

import {
  classificarTool,
  gerarDescricaoAcao,
  criarConfirmacao,
  validarNonce,
  processarChamadaTool,
  verificarLimiteTurno,
  resetarContadorTurno,
  limparNoncesExpirados,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/servico-circuit-breaker.js'

const ctx = {
  id_organizacao: 'org-1',
  id_usuario: 'usr-1',
  id_conversa: 'conv-1',
  tipo_usuario: 'PADRAO',
}

describe('servico-circuit-breaker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetarContadorTurno('conv-1')
  })

  describe('classificarTool', () => {
    it('retorna executar_imediato para READ', () => {
      const result = classificarTool('pedido.listar')
      expect(result.tipo).toBe('executar_imediato')
      expect(result.classe).toBe('READ')
    })

    it('retorna exige_confirmacao para WRITE_SAFE', () => {
      const result = classificarTool('pedido.criar')
      expect(result.tipo).toBe('exige_confirmacao')
      expect(result.classe).toBe('WRITE_SAFE')
    })

    it('lanca erro para tool desconhecida', () => {
      expect(() => classificarTool('nao.existe')).toThrow('Tool desconhecida')
    })
  })

  describe('gerarDescricaoAcao', () => {
    it('gera descricao para WRITE_SAFE', () => {
      const desc = gerarDescricaoAcao('pedido.criar', {})
      expect(desc).toContain('criar novo pedido')
    })

    it('gera descricao para WRITE_DESTRUTIVA', () => {
      const desc = gerarDescricaoAcao('pedido.excluir', { id_pedido: 'abc' })
      expect(desc).toContain('destrutiva')
      expect(desc).toContain('abc')
    })

    it('inclui contagem de registros quando ids presentes', () => {
      const desc = gerarDescricaoAcao('pedido.criar', { ids: ['a', 'b', 'c'] })
      expect(desc).toContain('3 registro(s)')
    })

    it('retorna fallback para tool desconhecida', () => {
      const desc = gerarDescricaoAcao('nao.existe', {})
      expect(desc).toBe('Executar nao.existe')
    })
  })

  describe('criarConfirmacao', () => {
    it('cria nonce e persiste no banco', async () => {
      mockPrismaCreate.mockResolvedValue({})

      const result = await criarConfirmacao(ctx, 'pedido.criar', { nome: 'teste' }, 'Criar pedido')
      expect(result.nonce).toBeDefined()
      expect(result.nonce.length).toBeGreaterThan(10)
      expect(result.tool_id).toBe('pedido.criar')
      expect(result.descricao_acao).toBe('Criar pedido')
      expect(result.expira_em).toBeInstanceOf(Date)
      expect(mockPrismaCreate).toHaveBeenCalledOnce()
    })

    it('lanca erro para tool desconhecida', async () => {
      await expect(criarConfirmacao(ctx, 'nao.existe', {}, 'teste')).rejects.toThrow('Tool desconhecida')
    })
  })

  describe('validarNonce', () => {
    const baseRegistro = {
      nonce_gabi_confirmacao_acao: 'nonce-123',
      consumido_gabi_confirmacao_acao: false,
      data_expiracao_gabi_confirmacao_acao: new Date(Date.now() + 60_000),
      tool_id_gabi_confirmacao_acao: 'pedido.criar',
      id_usuario_gabi_confirmacao_acao: 'usr-1',
      id_organizacao_gabi_confirmacao_acao: 'org-1',
      parametros_hash_gabi_confirmacao_acao: '',
    }

    it('rejeita nonce inexistente', async () => {
      mockPrismaFindUnique.mockResolvedValue(null)
      await expect(validarNonce('x', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce de confirmacao invalido')
    })

    it('rejeita nonce ja consumido', async () => {
      mockPrismaFindUnique.mockResolvedValue({ ...baseRegistro, consumido_gabi_confirmacao_acao: true })
      await expect(validarNonce('nonce-123', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce ja foi utilizado')
    })

    it('rejeita nonce expirado', async () => {
      mockPrismaFindUnique.mockResolvedValue({
        ...baseRegistro,
        data_expiracao_gabi_confirmacao_acao: new Date(Date.now() - 1000),
      })
      await expect(validarNonce('nonce-123', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce expirado')
    })

    it('rejeita nonce de outra tool', async () => {
      mockPrismaFindUnique.mockResolvedValue({ ...baseRegistro, tool_id_gabi_confirmacao_acao: 'outro.tool' })
      await expect(validarNonce('nonce-123', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce pertence a outra tool')
    })

    it('rejeita nonce de outro usuario', async () => {
      mockPrismaFindUnique.mockResolvedValue({ ...baseRegistro, id_usuario_gabi_confirmacao_acao: 'usr-999' })
      await expect(validarNonce('nonce-123', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce pertence a outro usuario')
    })

    it('rejeita nonce de outra organizacao', async () => {
      mockPrismaFindUnique.mockResolvedValue({ ...baseRegistro, id_organizacao_gabi_confirmacao_acao: 'org-999' })
      await expect(validarNonce('nonce-123', 'pedido.criar', {}, ctx)).rejects.toThrow('Nonce pertence a outra organizacao')
    })
  })

  describe('verificarLimiteTurno', () => {
    it('permite ate 5 chamadas', () => {
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
    })

    it('bloqueia na 6a chamada', () => {
      for (let i = 0; i < 5; i++) verificarLimiteTurno('conv-1')
      expect(() => verificarLimiteTurno('conv-1')).toThrow('Limite de 5 tools por turno atingido')
    })

    it('resetar permite novas chamadas', () => {
      for (let i = 0; i < 5; i++) verificarLimiteTurno('conv-1')
      resetarContadorTurno('conv-1')
      expect(() => verificarLimiteTurno('conv-1')).not.toThrow()
    })
  })

  describe('processarChamadaTool', () => {
    const mockExecutor = vi.fn()

    it('executa READ imediatamente sem confirmacao', async () => {
      mockExecutor.mockResolvedValue({ sucesso: true, status: 200, dados: [{ id: '1' }] })

      const result = await processarChamadaTool({
        tool_id: 'pedido.listar',
        parametros: {},
        ctx,
        executor: mockExecutor,
      })

      expect(result.tipo).toBe('executado')
      expect(result.dados).toEqual([{ id: '1' }])
      expect(mockPrismaCreate).not.toHaveBeenCalled()
    })

    it('exige confirmacao para WRITE sem nonce', async () => {
      mockPrismaCreate.mockResolvedValue({})

      const result = await processarChamadaTool({
        tool_id: 'pedido.criar',
        parametros: { nome: 'teste' },
        ctx,
        executor: mockExecutor,
      })

      expect(result.tipo).toBe('aguardando_confirmacao')
      expect(result.confirmacao).toBeDefined()
      expect(result.confirmacao!.nonce).toBeDefined()
      expect(mockExecutor).not.toHaveBeenCalled()
    })
  })

  describe('limparNoncesExpirados', () => {
    it('deleta nonces expirados e retorna contagem', async () => {
      mockPrismaDeleteMany.mockResolvedValue({ count: 3 })
      const count = await limparNoncesExpirados()
      expect(count).toBe(3)
      expect(mockPrismaDeleteMany).toHaveBeenCalledOnce()
    })
  })
})
