// TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147
// @vitest-environment node
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ORG_A = 'org-smtrd-a'
const WS_A = 'ws-smtrd-a'
const USUARIO = 'usr-smtrd-test'

const mockRegistrarVinculo = vi.fn(async () => undefined)
const mockCriarLeitura = vi.fn(async () => 'leitura-mock-12345678')
const mockEnviarArquivo = vi.fn(async () => 'arquivo-mock-87654321')
const mockResolverCompany = vi.fn(async () => 'company-mock')

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/cliente-legado-smart-read.js',
  () => ({
    criarLeituraLegado: (...args: unknown[]) => mockCriarLeitura(...args),
    enviarArquivoLegado: (...args: unknown[]) => mockEnviarArquivo(...args),
    obterLeituraLegado: vi.fn(),
    resolverCompanyLegado: (...args: unknown[]) => mockResolverCompany(...args),
  }),
)

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/registrar-vinculo-leitura-usuario-smart-read.js',
  () => ({
    registrarVinculoLeituraUsuarioSmartRead: (...args: unknown[]) => mockRegistrarVinculo(...args),
  }),
)

import { leiturasSmartReadRouter } from '../../../../../../../servicos-global/produto/smart-read/server/src/routes/leituras-smart-read.js'
import { leituraVinculadaAoWorkspaceSmartRead } from '../../../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.js'

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

describe('TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ETAPA 1 — POST upload (Enviar do passo 1)', () => {
    it('F01: upload multipart retorna 202 com id_leitura e id_arquivo', async () => {
      const app = criarApp()
      const res = await request(app)
        .post('/api/v1/smart-read/leituras')
        .set('x-id-organizacao', ORG_A)
        .set('x-id-usuario', USUARIO)
        .set('x-id-workspace', WS_A)
        .attach('arquivo', Buffer.from('%PDF-1.4 mock'), { filename: 'BL.pdf', contentType: 'application/pdf' })

      expect(res.status).toBe(202)
      expect(res.body.id_leitura).toBe('leitura-mock-12345678')
      expect(res.body.id_arquivo).toBe('arquivo-mock-87654321')
      expect(res.body.status_leitura).toBe('PROCESSING')
      expect(mockRegistrarVinculo).toHaveBeenCalledWith(
        expect.objectContaining({ idOrganizacao: ORG_A, idUsuario: USUARIO, idWorkspace: WS_A }),
      )
    })

    it('F02: POST sem arquivo retorna 400 ARQUIVO_AUSENTE', async () => {
      const app = criarApp()
      const res = await request(app)
        .post('/api/v1/smart-read/leituras')
        .set('x-id-organizacao', ORG_A)
        .set('x-id-usuario', USUARIO)

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('ARQUIVO_AUSENTE')
    })

    it('F03: POST sem x-id-organizacao retorna 400 ORGANIZACAO_AUSENTE', async () => {
      const app = criarApp()
      const res = await request(app)
        .post('/api/v1/smart-read/leituras')
        .set('x-id-usuario', USUARIO)
        .attach('arquivo', Buffer.from('x'), { filename: 'a.pdf' })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('ORGANIZACAO_AUSENTE')
    })
  })

  describe('ETAPA 2 — Tipos de arquivo no upload', () => {
    const tipos = [
      { nome: 'doc.pdf', mime: 'application/pdf' },
      { nome: 'foto.jpg', mime: 'image/jpeg' },
      { nome: 'foto.jpeg', mime: 'image/jpeg' },
      { nome: 'img.png', mime: 'image/png' },
      { nome: 'dados.xml', mime: 'application/xml' },
      { nome: 'planilha.csv', mime: 'text/csv' },
      { nome: 'legado.xls', mime: 'application/vnd.ms-excel' },
      { nome: 'moderno.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    ]

    it.each(tipos)('F04: aceita upload de $nome', async ({ nome, mime }) => {
      const app = criarApp()
      const res = await request(app)
        .post('/api/v1/smart-read/leituras')
        .set('x-id-organizacao', ORG_A)
        .set('x-id-usuario', USUARIO)
        .set('x-id-workspace', WS_A)
        .attach('arquivo', Buffer.from('conteudo-teste'), { filename: nome, contentType: mime })

      expect(res.status).toBe(202)
      expect(mockEnviarArquivo).toHaveBeenCalledWith(
        'company-mock',
        'leitura-mock-12345678',
        expect.objectContaining({ nome }),
      )
    })
  })
})

describe('TST-FUN-SMTRD-NOVA-LEITURA-PASSO-UM-000147 — isolamento workspace GET', () => {
  it('F05: leituraVinculadaAoWorkspaceSmartRead retorna false quando snapshot/progresso ausentes', async () => {
    const prisma = {
      snapshotLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
      progressoLeituraSmartRead: { findFirst: vi.fn().mockResolvedValue(null) },
    }
    const vinculada = await leituraVinculadaAoWorkspaceSmartRead(
      prisma as never,
      'leitura-outra-org',
      WS_A,
    )
    expect(vinculada).toBe(false)
  })
})
