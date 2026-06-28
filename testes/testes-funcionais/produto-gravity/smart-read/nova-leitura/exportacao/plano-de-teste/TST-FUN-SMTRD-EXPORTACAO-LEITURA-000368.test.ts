// TST-FUN-SMTRD-EXPORTACAO-LEITURA-000368
// @vitest-environment node
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ORG_A = 'org-smtrd-export-a'
const WS_A = 'ws-smtrd-export-a'
const USUARIO = 'usr-smtrd-export'
const ID_LEITURA = 'leitura-export-fun-000368'
const ID_ARQUIVO = 'arq-export-001'
const ID_TAREFA = 'task-export-001'

const mockObterLeituraLegado = vi.fn()
const mockCriarTarefaDownload = vi.fn()
const mockObterStatusTarefa = vi.fn()
const mockBaixarArquivoTarefa = vi.fn()
const mockAtualizarResultado = vi.fn()
const mockObterProgresso = vi.fn()

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js',
  () => ({
    criarLeituraLegado: vi.fn(),
    enviarArquivoLegado: vi.fn(),
    obterLeituraLegado: (...args: unknown[]) => mockObterLeituraLegado(...args),
    resolverCompanyLegado: vi.fn(async () => 'company-mock'),
    criarTarefaDownloadLeituraLegado: (...args: unknown[]) => mockCriarTarefaDownload(...args),
    obterStatusTarefaDownloadLegado: (...args: unknown[]) => mockObterStatusTarefa(...args),
    baixarArquivoTarefaExportacaoLegado: (...args: unknown[]) => mockBaixarArquivoTarefa(...args),
    atualizarResultadoArquivoLegado: (...args: unknown[]) => mockAtualizarResultado(...args),
  }),
)

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/snapshot-leitura-smart-read.js',
  () => ({
    obterLeituraDoProgresso: (...args: unknown[]) => mockObterProgresso(...args),
    obterLeituraDoSnapshot: vi.fn(async () => null),
    persistirSnapshotLeituraSmartRead: vi.fn(async () => undefined),
  }),
)

import { leiturasSmartReadRouter } from '../../../../../../../servicos-global/produto/smart-read/server/src/routes/leituras-smart-read.js'
import * as escopoWorkspace from '../../../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.js'

function leituraProgressoGravity() {
  return {
    id_leitura: ID_LEITURA,
    nome_leitura: 'Leitura export',
    status_leitura: 'COMPLETED' as const,
    total_arquivos: 1,
    arquivos_processados: 1,
    arquivos: [
      {
        id_arquivo: ID_ARQUIVO,
        nome_arquivo: 'invoice.pdf',
        status_arquivo: 'COMPLETED' as const,
        resultado_extracao: [
          {
            tipo_documento: 'INVOICE',
            dados: { exporter: { name: 'Corrigido' } },
            dados_original: { exporter: { name: 'Antigo' } },
          },
        ],
      },
    ],
  }
}

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: unknown; idOrganizacao?: string }, _res, next) => {
    req.prisma = {}
    next()
  })
  app.use('/api/v1/smart-read/leituras', leiturasSmartReadRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'ERRO', message: err.message } })
  })
  return app
}

describe('TST-FUN-SMTRD-EXPORTACAO-LEITURA-000368', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(true)
    mockObterProgresso.mockResolvedValue(leituraProgressoGravity())
    mockObterLeituraLegado.mockResolvedValue({
      _id: ID_LEITURA,
      files: [
        {
          fileReferenceId: ID_ARQUIVO,
          processingResult: [{ id: 7, fileType: 'INVOICE', data: { exporter: { name: 'Antigo' } } }],
        },
      ],
    })
    mockCriarTarefaDownload.mockResolvedValue({ id_tarefa: ID_TAREFA, status: 'CREATED' })
    mockObterStatusTarefa.mockResolvedValue({
      taskId: ID_TAREFA,
      status: 'completed',
      downloadUrl: 'https://s3.example/export.zip',
    })
    mockBaixarArquivoTarefa.mockResolvedValue({
      buffer: Buffer.from('PK\x03\x04mock-zip'),
      contentType: 'application/zip',
      nomeArquivo: 'leitura-export.zip',
    })
  })

  it('F01: POST exportacoes sincroniza conferência e cria tarefa DATI', async () => {
    const app = criarApp()
    const res = await request(app)
      .post(`/api/v1/smart-read/leituras/${ID_LEITURA}/exportacoes`)
      .set('x-id-organizacao', ORG_A)
      .set('x-id-usuario', USUARIO)
      .set('x-id-workspace', WS_A)
      .send({ ids_arquivo: [ID_ARQUIVO] })

    expect(res.status).toBe(202)
    expect(res.body.id_tarefa).toBe(ID_TAREFA)
    expect(mockAtualizarResultado).toHaveBeenCalledOnce()
    expect(mockCriarTarefaDownload).toHaveBeenCalledWith('company-mock', ID_LEITURA, [ID_ARQUIVO])
  })

  it('F02: GET status da tarefa retorna pronto quando completed', async () => {
    const app = criarApp()
    const res = await request(app)
      .get(`/api/v1/smart-read/leituras/exportacoes/tarefas/${ID_TAREFA}`)
      .set('x-id-organizacao', ORG_A)
      .set('x-id-usuario', USUARIO)

    expect(res.status).toBe(200)
    expect(res.body.pronto).toBe(true)
    expect(res.body.status_tarefa).toBe('completed')
  })

  it('F03: GET arquivo da tarefa retorna ZIP do legado', async () => {
    const app = criarApp()
    const res = await request(app)
      .get(`/api/v1/smart-read/leituras/exportacoes/tarefas/${ID_TAREFA}/arquivo`)
      .set('x-id-organizacao', ORG_A)
      .set('x-id-usuario', USUARIO)

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/zip/)
    expect(mockBaixarArquivoTarefa).toHaveBeenCalledWith('company-mock', ID_TAREFA)
  })

  it('F04: POST exportacoes sincroniza finalResult mesmo sem dados_original na conferência', async () => {
    mockObterProgresso.mockResolvedValue({
      id_leitura: ID_LEITURA,
      nome_leitura: 'Leitura sem edição',
      status_leitura: 'COMPLETED' as const,
      total_arquivos: 1,
      arquivos_processados: 1,
      arquivos: [
        {
          id_arquivo: ID_ARQUIVO,
          nome_arquivo: 'invoice.pdf',
          status_arquivo: 'COMPLETED' as const,
          resultado_extracao: [
            {
              tipo_documento: 'INVOICE',
              dados: { exporter: { name: 'Extraído IA' } },
            },
          ],
        },
      ],
    })

    const app = criarApp()
    const res = await request(app)
      .post(`/api/v1/smart-read/leituras/${ID_LEITURA}/exportacoes`)
      .set('x-id-organizacao', ORG_A)
      .set('x-id-usuario', USUARIO)
      .set('x-id-workspace', WS_A)
      .send({ ids_arquivo: [ID_ARQUIVO] })

    expect(res.status).toBe(202)
    expect(mockAtualizarResultado).toHaveBeenCalledOnce()
    expect(mockAtualizarResultado).toHaveBeenCalledWith(
      'company-mock',
      ID_LEITURA,
      ID_ARQUIVO,
      [{ id: 7, fileType: 'INVOICE', data: { exporter: { name: 'Extraído IA' } } }],
    )
  })
})
