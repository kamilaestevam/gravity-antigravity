// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Hoisted mocks ──────────────────────────────────────────────────────────

const {
  mockRotearFerramenta,
  mockSanitizarResultado,
  mockResetarContadorTurno,
  mockVerificarPermissaoCompleta,
  mockBuscarTool,
  mockFiltrarToolsPorPermissao,
  mockGerarGeminiDeclarations,
} = vi.hoisted(() => ({
  mockRotearFerramenta: vi.fn(),
  mockSanitizarResultado: vi.fn((v: unknown) => v),
  mockResetarContadorTurno: vi.fn(),
  mockVerificarPermissaoCompleta: vi.fn(),
  mockBuscarTool: vi.fn(),
  mockFiltrarToolsPorPermissao: vi.fn(),
  mockGerarGeminiDeclarations: vi.fn(),
}))

// ── Module mocks ───────────────────────────────────────────────────────────

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

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/roteador-ferramentas.js', () => ({
  rotearFerramenta: (...args: unknown[]) => mockRotearFerramenta(...args),
  sanitizarResultado: (...args: unknown[]) => mockSanitizarResultado(...args),
  resetarContadorTurno: (...args: unknown[]) => mockResetarContadorTurno(...args),
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/permission.js', () => ({
  verificarPermissaoCompleta: (...args: unknown[]) => mockVerificarPermissaoCompleta(...args),
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/catalogo-ferramentas.js', () => ({
  buscarTool: (...args: unknown[]) => mockBuscarTool(...args),
  filtrarToolsPorPermissao: (...args: unknown[]) => mockFiltrarToolsPorPermissao(...args),
  gerarGeminiDeclarations: (...args: unknown[]) => mockGerarGeminiDeclarations(...args),
  geminiNameToToolId: (name: string) => name.replace(/_/, '.'),
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/gemini-types.js', () => ({}))

// ── Stub fetch to intercept Gemini SDK HTTP calls ──────────────────────────

let fetchHandler: (url: string, init?: RequestInit) => Promise<Response>

vi.stubGlobal('fetch', vi.fn((...args: unknown[]) => {
  const url = String(args[0])
  const init = args[1] as RequestInit | undefined
  return fetchHandler(url, init)
}))

import {
  executarAgente,
  confirmarAcaoPendente,
} from '../../../servicos-global/servicos-plataforma/gabi/server/services/orquestrador-agente.js'

// ── Helpers ────────────────────────────────────────────────────────────────

const ctx = {
  id_organizacao: 'org-1',
  id_usuario: 'usr-1',
  id_conversa: 'conv-1',
  tipo_usuario: 'PADRAO',
}

function geminiTextResponse(text: string) {
  return {
    candidates: [{
      content: { parts: [{ text }], role: 'model' },
      finishReason: 'STOP',
    }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 150 },
    modelVersion: 'gemini-2.5-flash',
  }
}

function geminiFunctionCallResponse(calls: Array<{ name: string; args: Record<string, unknown> }>) {
  return {
    candidates: [{
      content: {
        parts: calls.map((c) => ({ functionCall: c })),
        role: 'model',
      },
      finishReason: 'STOP',
    }],
    usageMetadata: { promptTokenCount: 100, candidatesTokenCount: 50, totalTokenCount: 150 },
    modelVersion: 'gemini-2.5-flash',
  }
}

function makeFetchOk(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeFetchError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: { message } }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('orquestrador-agente', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockFiltrarToolsPorPermissao.mockReturnValue([
      { id: 'pedido.listar' },
      { id: 'pedido.criar' },
    ])
    mockGerarGeminiDeclarations.mockReturnValue([{ functionDeclarations: [] }])
    mockBuscarTool.mockReturnValue({ id: 'pedido.listar', classe: 'READ' })
    mockVerificarPermissaoCompleta.mockResolvedValue(undefined)

    // Default: cache creation fails (404), generateContent returns text
    fetchHandler = (url: string) => {
      if (url.includes('cachedContents')) {
        return Promise.resolve(makeFetchError(404, 'Cache not available'))
      }
      return Promise.resolve(makeFetchOk(geminiTextResponse('Ola! Como posso ajudar?')))
    }
  })

  describe('executarAgente', () => {
    it('retorna resposta de texto simples (sem function calls)', async () => {
      const result = await executarAgente('Voce e a GABI', 'Oi', [], ctx)

      expect(result.texto).toBe('Ola! Como posso ajudar?')
      expect(result.modelo_usado).toBe('gemini-2.5-flash')
      expect(result.tokens_input).toBeGreaterThanOrEqual(0)
      expect(result.tokens_output).toBeGreaterThanOrEqual(0)
      expect(result.custo_usd).toBeGreaterThanOrEqual(0)
      expect(result.tools_chamadas).toHaveLength(0)
      expect(result.confirmacoes_pendentes).toHaveLength(0)
      expect(result.dados_alterados).toBe(false)
    })

    it('reseta contador de turno no inicio', async () => {
      await executarAgente('system', 'msg', [], ctx)
      expect(mockResetarContadorTurno).toHaveBeenCalledWith('conv-1')
    })

    it('filtra tools por permissao do tipo_usuario', async () => {
      await executarAgente('system', 'msg', [], ctx)
      expect(mockFiltrarToolsPorPermissao).toHaveBeenCalledWith('PADRAO')
    })

    it('executa function call READ e retorna resultado', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_listar', args: {} }]),
          ))
        }
        return Promise.resolve(makeFetchOk(
          geminiTextResponse('Encontrei 3 pedidos.'),
        ))
      }

      mockRotearFerramenta.mockResolvedValue({
        tipo: 'executado',
        dados: [{ id: '1' }, { id: '2' }, { id: '3' }],
        duracao_ms: 120,
      })

      const result = await executarAgente('system', 'Liste meus pedidos', [], ctx)

      expect(result.texto).toBe('Encontrei 3 pedidos.')
      expect(result.tools_chamadas).toHaveLength(1)
      expect(result.tools_chamadas[0].tool_id).toBe('pedido.listar')
      expect(result.tools_chamadas[0].sucesso).toBe(true)
      expect(result.tools_chamadas[0].aguardando_confirmacao).toBeUndefined()
    })

    it('registra confirmacao pendente para WRITE', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_criar', args: { nome: 'Novo' } }]),
          ))
        }
        return Promise.resolve(makeFetchOk(
          geminiTextResponse('Preciso da sua confirmacao.'),
        ))
      }

      const expiraEm = new Date(Date.now() + 60_000)
      mockRotearFerramenta.mockResolvedValue({
        tipo: 'aguardando_confirmacao',
        confirmacao: {
          nonce: 'nonce-abc',
          descricao_acao: 'Criar pedido "Novo"',
          classe: 'WRITE_SAFE',
          expira_em: expiraEm,
        },
        duracao_ms: 15,
      })

      const result = await executarAgente('system', 'Cria um pedido', [], ctx)

      expect(result.confirmacoes_pendentes).toHaveLength(1)
      expect(result.confirmacoes_pendentes[0].nonce).toBe('nonce-abc')
      expect(result.confirmacoes_pendentes[0].tool_id).toBe('pedido.criar')
      expect(result.confirmacoes_pendentes[0].classe).toBe('WRITE_SAFE')
      expect(result.tools_chamadas[0].aguardando_confirmacao).toBe(true)
      expect(result.tools_chamadas[0].nonce).toBe('nonce-abc')
    })

    it('registra tool com erro quando rotearFerramenta retorna erro', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_listar', args: {} }]),
          ))
        }
        return Promise.resolve(makeFetchOk(
          geminiTextResponse('Houve um erro ao listar.'),
        ))
      }

      mockRotearFerramenta.mockResolvedValue({
        tipo: 'erro',
        erro: 'Timeout no servico',
        duracao_ms: 10_000,
      })

      const result = await executarAgente('system', 'Lista', [], ctx)

      expect(result.tools_chamadas[0].sucesso).toBe(false)
      expect(result.tools_chamadas[0].duracao_ms).toBe(10_000)
    })

    it('registra tool com erro quando permissao falha', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_criar', args: {} }]),
          ))
        }
        return Promise.resolve(makeFetchOk(
          geminiTextResponse('Sem permissao.'),
        ))
      }

      mockVerificarPermissaoCompleta.mockRejectedValue(new Error('Permissao insuficiente'))

      const result = await executarAgente('system', 'Criar pedido', [], ctx)

      expect(result.tools_chamadas[0].sucesso).toBe(false)
    })

    it('calcula dados_alterados=true para WRITE executado com sucesso', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_criar', args: {} }]),
          ))
        }
        return Promise.resolve(makeFetchOk(geminiTextResponse('Criado!')))
      }

      mockRotearFerramenta.mockResolvedValue({
        tipo: 'executado',
        dados: { id: 'new-1' },
        duracao_ms: 50,
      })
      mockBuscarTool.mockReturnValue({ id: 'pedido.criar', classe: 'WRITE_SAFE' })

      const result = await executarAgente('system', 'Criar', [], ctx)

      expect(result.dados_alterados).toBe(true)
    })

    it('calcula dados_alterados=false para READ', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchOk(
            geminiFunctionCallResponse([{ name: 'pedido_listar', args: {} }]),
          ))
        }
        return Promise.resolve(makeFetchOk(geminiTextResponse('Listados.')))
      }

      mockRotearFerramenta.mockResolvedValue({
        tipo: 'executado',
        dados: [],
        duracao_ms: 30,
      })
      mockBuscarTool.mockReturnValue({ id: 'pedido.listar', classe: 'READ' })

      const result = await executarAgente('system', 'Lista', [], ctx)

      expect(result.dados_alterados).toBe(false)
    })

    it('emite SSE de transparency quando emitSse fornecido', async () => {
      const emitSse = vi.fn()

      await executarAgente('system', 'msg', [], ctx, emitSse)
      expect(emitSse).toHaveBeenCalledWith('transparency', { message: 'Processando sua mensagem...' })
    })

    it('faz fallback para proximo modelo quando primeiro falha', async () => {
      let callCount = 0
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        callCount++
        if (callCount === 1) {
          return Promise.resolve(makeFetchError(503, 'Model overloaded'))
        }
        return Promise.resolve(makeFetchOk(geminiTextResponse('Resposta do fallback')))
      }

      const result = await executarAgente('system', 'msg', [], ctx)

      expect(result.texto).toBe('Resposta do fallback')
      expect(result.modelo_usado).toBe('gemini-2.0-flash')
    })

    it('lanca erro quando todos os modelos falham', async () => {
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        return Promise.resolve(makeFetchError(503, 'All models down'))
      }

      await expect(
        executarAgente('system', 'msg', [], ctx),
      ).rejects.toThrow('Todos os modelos falharam')
    })

    it('retorna texto fallback quando response.text() retorna vazio', async () => {
      fetchHandler = (url: string) => {
        if (url.includes('cachedContents')) {
          return Promise.resolve(makeFetchError(404, 'no cache'))
        }
        return Promise.resolve(makeFetchOk({
          candidates: [{
            content: { parts: [{ text: '' }], role: 'model' },
            finishReason: 'STOP',
          }],
          usageMetadata: { promptTokenCount: 10, candidatesTokenCount: 0, totalTokenCount: 10 },
        }))
      }

      const result = await executarAgente('system', 'msg', [], ctx)
      expect(result.texto).toContain('tarefa foi muito complexa')
    })
  })

  describe('confirmarAcaoPendente', () => {
    it('retorna sucesso quando rotearFerramenta executa', async () => {
      mockRotearFerramenta.mockResolvedValue({
        tipo: 'executado',
        dados: { id: 'pedido-1', status: 'criado' },
        duracao_ms: 80,
      })

      const result = await confirmarAcaoPendente(
        'nonce-123',
        'pedido.criar',
        { nome: 'Teste' },
        ctx,
      )

      expect(result.sucesso).toBe(true)
      expect(result.dados).toEqual({ id: 'pedido-1', status: 'criado' })
    })

    it('passa nonce para rotearFerramenta', async () => {
      mockRotearFerramenta.mockResolvedValue({
        tipo: 'executado',
        dados: {},
        duracao_ms: 10,
      })

      await confirmarAcaoPendente('nonce-xyz', 'pedido.criar', {}, ctx)

      expect(mockRotearFerramenta).toHaveBeenCalledWith(
        'pedido.criar',
        {},
        ctx,
        expect.objectContaining({ nonce: 'nonce-xyz' }),
      )
    })

    it('retorna erro quando rotearFerramenta retorna erro', async () => {
      mockRotearFerramenta.mockResolvedValue({
        tipo: 'erro',
        erro: 'Nonce expirado',
        duracao_ms: 5,
      })

      const result = await confirmarAcaoPendente('nonce-old', 'pedido.criar', {}, ctx)

      expect(result.sucesso).toBe(false)
      expect(result.erro).toBe('Nonce expirado')
    })

    it('retorna erro quando rotearFerramenta lanca excecao', async () => {
      mockRotearFerramenta.mockRejectedValue(new Error('Servico fora do ar'))

      const result = await confirmarAcaoPendente('nonce-x', 'pedido.criar', {}, ctx)

      expect(result.sucesso).toBe(false)
      expect(result.erro).toBe('Servico fora do ar')
    })

    it('repassa emitSse para rotearFerramenta', async () => {
      mockRotearFerramenta.mockResolvedValue({ tipo: 'executado', dados: {} })
      const emitSse = vi.fn()

      await confirmarAcaoPendente('nonce-1', 'pedido.criar', {}, ctx, emitSse)

      expect(mockRotearFerramenta).toHaveBeenCalledWith(
        'pedido.criar',
        {},
        ctx,
        expect.objectContaining({ emitSse }),
      )
    })
  })
})
