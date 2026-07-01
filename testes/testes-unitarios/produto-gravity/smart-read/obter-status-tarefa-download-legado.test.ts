import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { obterStatusTarefaDownloadLegado } from '../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js'

// TASK-000403 — o DATI responde 404 «Task result data not found» enquanto o
// worker GENERATE_READING_DOWNLOAD ainda gera o ZIP. Esse 404 deve virar
// «processing» (não-terminal) para o poll do front prosseguir; qualquer outro
// erro (incl. «Task not found») continua ruidoso (Mandamento 08).
describe('obterStatusTarefaDownloadLegado — 404 transitório do DATI', () => {
  const envOriginal = { ...process.env }
  const COMPANY = 'company-1'
  const TASK_ID = '6a44eab74c6925ba36edcb2d'

  beforeEach(() => {
    // Desliga o mock legado (usa caminho real com fetch stubado).
    process.env.NODE_ENV = 'test'
    process.env.SMART_READ_MOCK_LEGADO = '0'
    process.env.SMART_READ_LEGADO_URL = 'https://legado.example'
    process.env.SMART_READ_LEGADO_CHAVE_GRAVITY = 'chave-teste'
  })

  afterEach(() => {
    process.env = { ...envOriginal }
    vi.restoreAllMocks()
  })

  it('mapeia 404 «Task result data not found» para status processing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () =>
          '{"message":"Task result data not found","error":"Not Found","statusCode":404}',
      }),
    )

    await expect(obterStatusTarefaDownloadLegado(COMPANY, TASK_ID)).resolves.toEqual({
      taskId: TASK_ID,
      status: 'processing',
    })
  })

  it('lança em 404 de outra natureza (ex.: «Task not found»)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => '{"message":"Task not found","error":"Not Found","statusCode":404}',
      }),
    )

    await expect(obterStatusTarefaDownloadLegado(COMPANY, TASK_ID)).rejects.toThrow(/respondeu 404/)
  })

  it('retorna o status parseado quando o DATI conclui (completed)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          taskId: TASK_ID,
          status: 'completed',
          downloadUrl: 'https://s3.example/export.zip',
        }),
      }),
    )

    await expect(obterStatusTarefaDownloadLegado(COMPANY, TASK_ID)).resolves.toEqual({
      taskId: TASK_ID,
      status: 'completed',
      downloadUrl: 'https://s3.example/export.zip',
    })
  })
})
