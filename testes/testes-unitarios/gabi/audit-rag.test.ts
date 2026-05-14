import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/lib/prisma.js', () => ({
  default: {
    gabiLogUso: {
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

vi.mock('../../../servicos-global/servicos-plataforma/gabi/server/services/kb-search.js', () => ({}))

import { auditGabiAction } from '../../../servicos-global/servicos-plataforma/gabi/server/services/audit.js'

describe('auditGabiAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCreate.mockResolvedValue({ id_gabi_log_uso: 'test-id' })
  })

  it('grava log sem ragMeta', async () => {
    await auditGabiAction('user1', 'org1', 'chat', 'mensagem teste', undefined, {
      modelo: 'gemini-2.5-flash',
      tokensInput: 1000,
      tokensOutput: 200,
      custoUsd: 0.003,
    })

    expect(mockCreate).toHaveBeenCalledOnce()
    const data = mockCreate.mock.calls[0][0].data
    expect(data.snapshot_conversa_gabi_log_uso).toBe('mensagem teste')
    expect(data.modelo_gabi_log_uso).toBe('gemini-2.5-flash')
    expect(data.tokens_input_gabi_log_uso).toBe(1000)
  })

  it('inclui metricas RAG no snapshot quando ragMeta presente', async () => {
    await auditGabiAction('user1', 'org1', 'chat', 'mensagem teste', undefined, {
      modelo: 'gemini-2.5-flash',
      tokensInput: 500,
      tokensOutput: 100,
      custoUsd: 0.001,
    }, {
      chunks_retornados: 5,
      score_similaridade_medio: 0.82,
      tempo_busca_ms: 12,
      tokens_total_chunks: 3000,
    })

    expect(mockCreate).toHaveBeenCalledOnce()
    const data = mockCreate.mock.calls[0][0].data
    expect(data.snapshot_conversa_gabi_log_uso).toContain('[RAG]')
    expect(data.snapshot_conversa_gabi_log_uso).toContain('chunks=5')
    expect(data.snapshot_conversa_gabi_log_uso).toContain('score_medio=0.82')
    expect(data.snapshot_conversa_gabi_log_uso).toContain('busca_ms=12')
    expect(data.snapshot_conversa_gabi_log_uso).toContain('tokens_chunks=3000')
  })

  it('rejeita quando snapshot vazio', async () => {
    await expect(
      auditGabiAction('user1', 'org1', 'chat', '')
    ).rejects.toThrow('Obrigatório fornecer conversationSnapshot')
  })

  it('grava sem llmUsage (defaults para 0)', async () => {
    await auditGabiAction('user1', 'org1', 'chat', 'msg')

    const data = mockCreate.mock.calls[0][0].data
    expect(data.modelo_gabi_log_uso).toBeNull()
    expect(data.tokens_input_gabi_log_uso).toBe(0)
    expect(data.tokens_output_gabi_log_uso).toBe(0)
    expect(data.custo_usd_gabi_log_uso).toBe(0)
  })
})
