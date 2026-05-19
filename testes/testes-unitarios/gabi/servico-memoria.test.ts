// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn()
const mockUpsert = vi.fn()
const mockUpdate = vi.fn()

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiMemoriaUsuario: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

import {
  carregarMemorias,
  salvarMemoria,
  registrarUsoMemoria,
  desativarMemoria,
  formatarMemoriasParaPrompt,
  aplicarDecaimentoMemorias,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/servico-memoria.js'

const ctx = { id_organizacao: 'org-1', id_usuario: 'usr-1' }

describe('servico-memoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('carregarMemorias', () => {
    it('retorna memorias formatadas', async () => {
      mockFindMany.mockResolvedValue([
        {
          tipo_gabi_memoria_usuario: 'preferencia',
          chave_gabi_memoria_usuario: 'idioma',
          valor_gabi_memoria_usuario: 'pt-BR',
          confianca_gabi_memoria_usuario: 1.0,
          origem_gabi_memoria_usuario: 'explicito',
          data_ultimo_uso_gabi_memoria_usuario: new Date(),
        },
      ])

      const memorias = await carregarMemorias(ctx)
      expect(memorias).toHaveLength(1)
      expect(memorias[0].tipo).toBe('preferencia')
      expect(memorias[0].chave).toBe('idioma')
      expect(memorias[0].valor).toBe('pt-BR')
      expect(memorias[0].confianca).toBe(1.0)
    })

    it('filtra por tipo quando fornecido', async () => {
      mockFindMany.mockResolvedValue([])
      await carregarMemorias(ctx, 'onboarding')
      const whereArg = mockFindMany.mock.calls[0][0].where
      expect(whereArg.tipo_gabi_memoria_usuario).toBe('onboarding')
    })

    it('respeita limite', async () => {
      mockFindMany.mockResolvedValue([])
      await carregarMemorias(ctx, undefined, 5)
      expect(mockFindMany.mock.calls[0][0].take).toBe(5)
    })
  })

  describe('salvarMemoria', () => {
    it('faz upsert com confianca 1.0 para explicito', async () => {
      mockUpsert.mockResolvedValue({})
      await salvarMemoria(ctx, 'preferencia', 'tema', 'escuro', 'explicito')
      expect(mockUpsert).toHaveBeenCalledOnce()
      const createArg = mockUpsert.mock.calls[0][0].create
      expect(createArg.confianca_gabi_memoria_usuario).toBe(1.0)
    })

    it('faz upsert com confianca 0.8 para inferido', async () => {
      mockUpsert.mockResolvedValue({})
      await salvarMemoria(ctx, 'contexto', 'pagina', '/pedidos', 'inferido')
      const createArg = mockUpsert.mock.calls[0][0].create
      expect(createArg.confianca_gabi_memoria_usuario).toBe(0.8)
    })

    it('trunca valor acima de 500 chars', async () => {
      mockUpsert.mockResolvedValue({})
      const valorLongo = 'x'.repeat(600)
      await salvarMemoria(ctx, 'contexto', 'chave', valorLongo)
      const createArg = mockUpsert.mock.calls[0][0].create
      expect(createArg.valor_gabi_memoria_usuario.length).toBe(500)
    })
  })

  describe('registrarUsoMemoria', () => {
    it('atualiza data_ultimo_uso', async () => {
      mockUpdate.mockResolvedValue({})
      await registrarUsoMemoria(ctx, 'preferencia', 'idioma')
      expect(mockUpdate).toHaveBeenCalledOnce()
    })

    it('nao lanca erro quando memoria nao encontrada', async () => {
      mockUpdate.mockRejectedValue(new Error('Not found'))
      await expect(registrarUsoMemoria(ctx, 'preferencia', 'inexistente')).resolves.toBeUndefined()
    })
  })

  describe('desativarMemoria', () => {
    it('marca ativo como false', async () => {
      mockUpdate.mockResolvedValue({})
      await desativarMemoria(ctx, 'preferencia', 'idioma')
      const dataArg = mockUpdate.mock.calls[0][0].data
      expect(dataArg.ativo_gabi_memoria_usuario).toBe(false)
    })

    it('nao lanca erro quando memoria nao encontrada', async () => {
      mockUpdate.mockRejectedValue(new Error('Not found'))
      await expect(desativarMemoria(ctx, 'preferencia', 'inexistente')).resolves.toBeUndefined()
    })
  })

  describe('formatarMemoriasParaPrompt', () => {
    it('retorna string vazia para array vazio', () => {
      expect(formatarMemoriasParaPrompt([])).toBe('')
    })

    it('formata memorias agrupadas por tipo', () => {
      const memorias = [
        { tipo: 'preferencia' as const, chave: 'idioma', valor: 'pt-BR', confianca: 1.0, origem: 'explicito' as const, data_ultimo_uso: new Date() },
        { tipo: 'preferencia' as const, chave: 'tema', valor: 'escuro', confianca: 0.8, origem: 'inferido' as const, data_ultimo_uso: new Date() },
        { tipo: 'contexto' as const, chave: 'pagina', valor: '/pedidos', confianca: 0.5, origem: 'inferido' as const, data_ultimo_uso: new Date() },
      ]
      const result = formatarMemoriasParaPrompt(memorias)
      expect(result).toContain('=== MEMORIA DO USUARIO ===')
      expect(result).toContain('[PREFERENCIA]')
      expect(result).toContain('[CONTEXTO]')
      expect(result).toContain('idioma: pt-BR')
      expect(result).toContain('tema: escuro')
      expect(result).toContain('pagina: /pedidos')
      expect(result).toContain('=== FIM DA MEMORIA ===')
    })

    it('mostra label de confianca para valores abaixo de 0.8', () => {
      const memorias = [
        { tipo: 'contexto' as const, chave: 'k', valor: 'v', confianca: 0.5, origem: 'inferido' as const, data_ultimo_uso: new Date() },
      ]
      const result = formatarMemoriasParaPrompt(memorias)
      expect(result).toContain('confianca: 0.5')
    })

    it('omite label de confianca para valores >= 0.8', () => {
      const memorias = [
        { tipo: 'contexto' as const, chave: 'k', valor: 'v', confianca: 1.0, origem: 'explicito' as const, data_ultimo_uso: new Date() },
      ]
      const result = formatarMemoriasParaPrompt(memorias)
      expect(result).not.toContain('confianca:')
    })
  })

  describe('aplicarDecaimentoMemorias', () => {
    it('desativa memorias com confianca abaixo de 0.1 apos decaimento', async () => {
      mockFindMany.mockResolvedValue([
        { id_gabi_memoria_usuario: 'mem-1', confianca_gabi_memoria_usuario: 0.05 },
      ])
      mockUpdate.mockResolvedValue({})

      const result = await aplicarDecaimentoMemorias()
      expect(result.desativadas).toBe(1)
      expect(result.reduzidas).toBe(0)
    })

    it('reduz confianca sem desativar quando acima de 0.1', async () => {
      mockFindMany.mockResolvedValue([
        { id_gabi_memoria_usuario: 'mem-1', confianca_gabi_memoria_usuario: 0.5 },
      ])
      mockUpdate.mockResolvedValue({})

      const result = await aplicarDecaimentoMemorias()
      expect(result.desativadas).toBe(0)
      expect(result.reduzidas).toBe(1)
    })

    it('retorna zeros quando nao ha memorias a decair', async () => {
      mockFindMany.mockResolvedValue([])
      const result = await aplicarDecaimentoMemorias()
      expect(result.desativadas).toBe(0)
      expect(result.reduzidas).toBe(0)
    })
  })
})
