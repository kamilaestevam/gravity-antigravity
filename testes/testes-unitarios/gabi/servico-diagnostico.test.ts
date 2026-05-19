// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()
const mockFindMany = vi.fn()
const mockCount = vi.fn()

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiDiagnosticoErro: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
    gabiChamado: {
      create: (...args: unknown[]) => mockCreate(...args),
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
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

vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

import {
  registrarErro,
  consultarErrosRecentes,
  diagnosticarProblema,
  abrirChamado,
  consultarChamados,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/servico-diagnostico.js'

describe('servico-diagnostico', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('registrarErro', () => {
    it('cria registro no banco (fire-and-forget)', async () => {
      mockCreate.mockResolvedValue({})
      await registrarErro({
        id_organizacao: 'org-1',
        id_usuario: 'usr-1',
        produto: 'pedido',
        endpoint: '/api/v1/pedidos',
        metodo: 'GET',
        status_http: 500,
        codigo_erro: 'INTERNAL',
        detalhes: 'Erro no banco',
      })
      expect(mockCreate).toHaveBeenCalledOnce()
    })

    it('trunca detalhes acima de 5000 chars', async () => {
      mockCreate.mockResolvedValue({})
      await registrarErro({
        id_organizacao: 'org-1',
        id_usuario: 'usr-1',
        produto: 'pedido',
        endpoint: '/api/v1/pedidos',
        metodo: 'GET',
        status_http: 500,
        detalhes: 'x'.repeat(6000),
      })
      const dataArg = mockCreate.mock.calls[0][0].data
      expect(dataArg.detalhes_gabi_diagnostico_erro.length).toBe(5000)
    })

    it('nao lanca erro quando banco falha', async () => {
      mockCreate.mockRejectedValue(new Error('DB error'))
      await expect(
        registrarErro({
          id_organizacao: 'org-1',
          id_usuario: 'usr-1',
          produto: 'pedido',
          endpoint: '/test',
          metodo: 'GET',
          status_http: 500,
        }),
      ).resolves.toBeUndefined()
    })
  })

  describe('consultarErrosRecentes', () => {
    it('retorna erros formatados', async () => {
      const agora = new Date()
      mockFindMany.mockResolvedValue([
        {
          produto_gabi_diagnostico_erro: 'pedido',
          endpoint_gabi_diagnostico_erro: '/api/v1/pedidos',
          metodo_gabi_diagnostico_erro: 'GET',
          status_http_gabi_diagnostico_erro: 500,
          codigo_erro_gabi_diagnostico_erro: 'INTERNAL',
          detalhes_gabi_diagnostico_erro: 'Erro no banco',
          data_criacao_gabi_diagnostico_erro: agora,
        },
      ])

      const erros = await consultarErrosRecentes('org-1', 'usr-1')
      expect(erros).toHaveLength(1)
      expect(erros[0].produto).toBe('pedido')
      expect(erros[0].status_http).toBe(500)
      expect(erros[0].codigo_erro).toBe('INTERNAL')
    })

    it('converte null para undefined em campos opcionais', async () => {
      mockFindMany.mockResolvedValue([
        {
          produto_gabi_diagnostico_erro: 'pedido',
          endpoint_gabi_diagnostico_erro: '/test',
          metodo_gabi_diagnostico_erro: 'GET',
          status_http_gabi_diagnostico_erro: 404,
          codigo_erro_gabi_diagnostico_erro: null,
          detalhes_gabi_diagnostico_erro: null,
          data_criacao_gabi_diagnostico_erro: new Date(),
        },
      ])

      const erros = await consultarErrosRecentes('org-1', 'usr-1')
      expect(erros[0].codigo_erro).toBeUndefined()
      expect(erros[0].detalhes).toBeUndefined()
    })
  })

  describe('diagnosticarProblema', () => {
    it('retorna mensagem quando nao ha erros', async () => {
      mockFindMany.mockResolvedValue([])
      const resultado = await diagnosticarProblema('org-1', 'usr-1')
      expect(resultado).toContain('Nenhum erro recente')
    })

    it('agrupa erros por produto/status e sugere acoes', async () => {
      mockFindMany.mockResolvedValue([
        {
          produto_gabi_diagnostico_erro: 'pedido',
          endpoint_gabi_diagnostico_erro: '/test',
          metodo_gabi_diagnostico_erro: 'GET',
          status_http_gabi_diagnostico_erro: 401,
          codigo_erro_gabi_diagnostico_erro: null,
          detalhes_gabi_diagnostico_erro: null,
          data_criacao_gabi_diagnostico_erro: new Date(),
        },
        {
          produto_gabi_diagnostico_erro: 'pedido',
          endpoint_gabi_diagnostico_erro: '/test2',
          metodo_gabi_diagnostico_erro: 'POST',
          status_http_gabi_diagnostico_erro: 500,
          codigo_erro_gabi_diagnostico_erro: null,
          detalhes_gabi_diagnostico_erro: null,
          data_criacao_gabi_diagnostico_erro: new Date(),
        },
      ])

      const resultado = await diagnosticarProblema('org-1', 'usr-1')
      expect(resultado).toContain('2 erro(s) recente(s)')
      expect(resultado).toContain('autenticacao')
      expect(resultado).toContain('erro interno')
    })

    it('sugere para 429 aguardar', async () => {
      mockFindMany.mockResolvedValue([
        {
          produto_gabi_diagnostico_erro: 'configurador',
          endpoint_gabi_diagnostico_erro: '/test',
          metodo_gabi_diagnostico_erro: 'GET',
          status_http_gabi_diagnostico_erro: 429,
          codigo_erro_gabi_diagnostico_erro: null,
          detalhes_gabi_diagnostico_erro: null,
          data_criacao_gabi_diagnostico_erro: new Date(),
        },
      ])

      const resultado = await diagnosticarProblema('org-1', 'usr-1')
      expect(resultado).toContain('limite de requisicoes')
    })
  })

  describe('abrirChamado', () => {
    it('cria chamado com numero sequencial e retorna dados', async () => {
      mockCount.mockResolvedValue(5)
      mockCreate.mockResolvedValue({
        data_criacao_gabi_chamado: new Date(),
      })

      const chamado = await abrirChamado({
        id_organizacao: 'org-1',
        id_usuario: 'usr-1',
        tipo: 'bug',
        produto: 'pedido',
        descricao_usuario: 'Pedido nao salva corretamente',
      })

      expect(chamado.numero).toMatch(/^GABI-\d{4}-\d{4}$/)
      expect(chamado.status).toBe('aberto')
      expect(chamado.tipo).toBe('bug')
      expect(chamado.produto).toBe('pedido')
    })
  })

  describe('consultarChamados', () => {
    it('retorna chamados formatados', async () => {
      mockFindMany.mockResolvedValue([
        {
          numero_gabi_chamado: 'GABI-2026-0001',
          status_gabi_chamado: 'aberto',
          tipo_gabi_chamado: 'bug',
          produto_gabi_chamado: 'pedido',
          descricao_usuario_gabi_chamado: 'Problema X',
          data_criacao_gabi_chamado: new Date(),
        },
      ])

      const chamados = await consultarChamados('org-1', 'usr-1')
      expect(chamados).toHaveLength(1)
      expect(chamados[0].numero).toBe('GABI-2026-0001')
      expect(chamados[0].status).toBe('aberto')
    })
  })
})
