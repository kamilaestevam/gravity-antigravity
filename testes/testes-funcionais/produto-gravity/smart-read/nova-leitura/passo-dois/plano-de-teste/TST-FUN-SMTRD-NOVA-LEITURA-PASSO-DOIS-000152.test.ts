// TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152
// @vitest-environment node
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ORG_A = 'org-smtrd-a'
const WS_A = 'ws-smtrd-a'
const USUARIO = 'usr-smtrd-test'
const ID_LEITURA = 'leitura-passo-dois-fun-000152'

const mockObterLeitura = vi.fn()

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js',
  () => ({
    criarLeituraLegado: vi.fn(),
    enviarArquivoLegado: vi.fn(),
    obterLeituraLegado: (...args: unknown[]) => mockObterLeitura(...args),
    resolverCompanyLegado: vi.fn(async () => 'company-mock'),
  }),
)

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/registrar-vinculo-leitura-usuario-smart-read.js',
  () => ({
    registrarVinculoLeituraUsuarioSmartRead: vi.fn(async () => undefined),
  }),
)

import type { LeituraLegado } from '../../../../../../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.js'
import { leiturasSmartReadRouter } from '../../../../../../../servicos-global/produto/smart-read/server/src/routes/leituras-smart-read.js'
import * as escopoWorkspace from '../../../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.js'

function leituraLegadoProcessando(): LeituraLegado {
  return {
    _id: ID_LEITURA,
    name: 'Leitura 742',
    status: 'processing',
    totalFiles: 1,
    processedFiles: 0,
    files: [
      {
        fileReferenceId: 'arq-fun-001',
        filename: 'amostra.pdf',
        processingStatus: 'processing',
        processingResult: [{ fileType: 'Bill of Lading', data: { numero: 'BL-001' } }],
      },
    ],
  }
}

function leituraLegadoCompleta(): LeituraLegado {
  return {
    _id: ID_LEITURA,
    name: 'Leitura 742',
    status: 'completed_ai',
    totalFiles: 1,
    processedFiles: 1,
    files: [
      {
        fileReferenceId: 'arq-fun-001',
        filename: 'amostra.pdf',
        processingStatus: 'completed',
        processingTimeMs: 4200,
        processingResult: [
          { fileType: 'Bill of Lading', data: { numero: 'BL-001' } },
          { fileType: 'Commercial Invoice', data: { numero: 'INV-001' } },
        ],
      },
    ],
  }
}

function criarApp() {
  const app = express()
  app.use((req: Request & { prisma?: unknown; idOrganizacao?: string }, _res, next) => {
    req.prisma = {
      snapshotLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
      progressoLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
    }
    next()
  })
  app.use('/api/v1/smart-read/leituras', leiturasSmartReadRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'ERRO', message: err.message } })
  })
  return app
}

describe('TST-FUN-SMTRD-NOVA-LEITURA-PASSO-DOIS-000152', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockObterLeitura.mockResolvedValue(leituraLegadoProcessando())
    vi.spyOn(escopoWorkspace, 'leituraVinculadaAoWorkspaceSmartRead').mockResolvedValue(true)
  })

  describe('ETAPA 1 — GET leitura em processamento (passo 2)', () => {
    it('F01: GET retorna PROCESSING com resultado_extracao parcial', async () => {
      const app = criarApp()
      const res = await request(app)
        .get(`/api/v1/smart-read/leituras/${ID_LEITURA}`)
        .set('x-id-organizacao', ORG_A)
        .set('x-id-usuario', USUARIO)
        .set('x-id-workspace', WS_A)

      expect(res.status).toBe(200)
      expect(res.body.status_leitura).toBe('PROCESSING')
      expect(res.body.nome_leitura).toBe('Leitura 742')
      expect(res.body.arquivos[0]?.resultado_extracao).toHaveLength(1)
    })
  })

  describe('ETAPA 2 — GET leitura concluída', () => {
    it('F02: GET retorna COMPLETED com dois documentos identificados', async () => {
      mockObterLeitura.mockResolvedValue(leituraLegadoCompleta())
      const app = criarApp()
      const res = await request(app)
        .get(`/api/v1/smart-read/leituras/${ID_LEITURA}`)
        .set('x-id-organizacao', ORG_A)
        .set('x-id-usuario', USUARIO)
        .set('x-id-workspace', WS_A)

      expect(res.status).toBe(200)
      expect(res.body.status_leitura).toBe('COMPLETED')
      expect(res.body.arquivos[0]?.resultado_extracao).toHaveLength(2)
    })
  })

  describe('ETAPA 3 — Isolamento workspace', () => {
    it('F03: leituraVinculadaAoWorkspaceSmartRead false bloqueia acesso', async () => {
      vi.restoreAllMocks()
      const prisma = {
        snapshotLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
        progressoLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
      }
      const vinculada = await escopoWorkspace.leituraVinculadaAoWorkspaceSmartRead(
        prisma as never,
        ID_LEITURA,
        'ws-outro',
      )
      expect(vinculada).toBe(false)
    })
  })

  describe('ETAPA 4 — Headers obrigatórios', () => {
    it('F04: GET sem x-id-organizacao retorna 400', async () => {
      const app = criarApp()
      const res = await request(app)
        .get(`/api/v1/smart-read/leituras/${ID_LEITURA}`)
        .set('x-id-usuario', USUARIO)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('ORGANIZACAO_AUSENTE')
    })
  })
})
