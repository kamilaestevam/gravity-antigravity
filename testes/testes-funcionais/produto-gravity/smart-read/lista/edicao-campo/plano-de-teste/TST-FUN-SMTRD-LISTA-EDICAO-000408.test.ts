// TST-FUN-SMTRD-LISTA-EDICAO-000408
// @vitest-environment node
import express, { type Request, type Response, type NextFunction } from 'express'
import request from 'supertest'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const ORG = 'org-smtrd-lista-edicao'
const WS = 'ws-smtrd-lista-edicao'
const USUARIO = 'usr-smtrd-lista-edicao'
const ID_LEITURA = 'leitura-lista-edicao-408'
const ID_ARQUIVO = 'arq-lista-001'

const mockEditarCampo = vi.fn()

vi.mock(
  '../../../../../../../servicos-global/produto/smart-read/server/src/lib/editar-campo-documento-lista-smart-read.js',
  () => ({
    editarCampoDocumentoListaSmartRead: (...args: unknown[]) => mockEditarCampo(...args),
  }),
)

import { leiturasSmartReadRouter } from '../../../../../../../servicos-global/produto/smart-read/server/src/routes/leituras-smart-read.js'
import * as escopoWorkspace from '../../../../../../../servicos-global/produto/smart-read/server/src/lib/escopo-workspace-leitura-smart-read.js'

function documentoAtualizado() {
  return {
    id_documento_leitura: `${ID_LEITURA}:${ID_ARQUIVO}:0`,
    id_leitura: ID_LEITURA,
    id_arquivo: ID_ARQUIVO,
    nome_documento: 'INVOICE A',
    status_documento: 'COMPLETED',
    tipo_documento: 'INVOICE',
    numero_documento: '999',
    valores_colunas: { numero_documento: '999' },
  }
}

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request & { prisma?: unknown; idOrganizacao?: string }, _res, next) => {
    req.prisma = {}
    req.idOrganizacao = ORG
    next()
  })
  app.use('/api/v1/smart-read/leituras', leiturasSmartReadRouter)
  app.use((err: Error & { statusCode?: number; code?: string }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.statusCode ?? 500).json({ error: { code: err.code ?? 'ERRO', message: err.message } })
  })
  return app
}

describe('TST-FUN-SMTRD-LISTA-EDICAO-000408 — PATCH campo-documento', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(escopoWorkspace, 'resolverIdWorkspaceLeituraSmartRead').mockReturnValue(WS)
    mockEditarCampo.mockResolvedValue({
      leitura: { id_leitura: ID_LEITURA },
      documentos_atualizados: [documentoAtualizado()],
    })
  })

  it('PATCH campo-documento retorna documentos_atualizados e chama serviço', async () => {
    const app = criarApp()
    const resposta = await request(app)
      .patch(`/api/v1/smart-read/leituras/${ID_LEITURA}/campo-documento`)
      .set('x-id-organizacao', ORG)
      .set('x-id-usuario', USUARIO)
      .set('x-id-workspace', WS)
      .send({
        id_arquivo: ID_ARQUIVO,
        indice_documento: 0,
        campo_coluna: 'numeros_documento',
        valor: '999',
      })

    expect(resposta.status).toBe(200)
    expect(resposta.body.documentos_atualizados).toHaveLength(1)
    expect(resposta.body.documentos_atualizados[0].numero_documento).toBe('999')
    expect(mockEditarCampo).toHaveBeenCalledWith(
      expect.objectContaining({
        idLeitura: ID_LEITURA,
        idArquivo: ID_ARQUIVO,
        indiceDocumento: 0,
        campoColuna: 'numeros_documento',
        valor: '999',
      }),
    )
  })

  it('rejeita campo_coluna fora da allowlist antes do serviço', async () => {
    const app = criarApp()
    const resposta = await request(app)
      .patch(`/api/v1/smart-read/leituras/${ID_LEITURA}/campo-documento`)
      .set('x-id-organizacao', ORG)
      .set('x-id-usuario', USUARIO)
      .set('x-id-workspace', WS)
      .send({
        id_arquivo: ID_ARQUIVO,
        indice_documento: 0,
        campo_coluna: 'campo_inventado',
        valor: 'x',
      })

    expect(resposta.status).toBe(400)
    expect(mockEditarCampo).not.toHaveBeenCalled()
  })
})
