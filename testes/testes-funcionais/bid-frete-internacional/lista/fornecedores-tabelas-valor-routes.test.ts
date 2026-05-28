/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const mockPrisma = {
  tabelaBidFreteInternacional: {
    create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id_tabela_bid_frete_internacional: 'tab_admin_1',
      ...data,
    })),
    findMany: vi.fn(async () => []),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      id_tabela_bid_frete_internacional: 'tab_admin_1',
      ...data,
    })),
    delete: vi.fn(async () => ({})),
  },
}

vi.mock(
  '../../../../servicos-global/produto/bid-frete-internacional/server/src/services/sincronizar-fornecedores-cadastros.js',
  () => ({
    listarParceirosFreteCadastros: vi.fn(),
    mapCadastrosParaBidFornecedor: vi.fn(),
    obterParceiroFreteCadastros: vi.fn(),
    sincronizarFornecedorCadastros: vi.fn(),
    sincronizarFornecedoresCadastros: vi.fn(),
  }),
)

import { fornecedoresRouter } from '../../../../servicos-global/produto/bid-frete-internacional/server/src/routes/fornecedores'

function criarApp() {
  const app = express()
  app.use(express.json())
  app.use((req: Request, _res: Response, next: NextFunction) => {
    ;(req as Request & { prisma: typeof mockPrisma }).prisma = mockPrisma
    next()
  })
  app.use('/api/v1/bid-frete-internacional/fornecedores', fornecedoresRouter)
  return app
}

const payloadTabela = {
  origem_codigo_tabela_bid_frete_internacional: 'BRSSZ',
  origem_nome_tabela_bid_frete_internacional: 'Santos',
  destino_codigo_tabela_bid_frete_internacional: 'CNSHA',
  destino_nome_tabela_bid_frete_internacional: 'Shanghai',
  modal_tabela_bid_frete_internacional: 'MARITIMO',
  modalidade_tabela_bid_frete_internacional: 'FCL',
  moeda_tabela_bid_frete_internacional: 'USD',
  valor_frete_tabela_bid_frete_internacional: 1200,
  taxas_origem_tabela_bid_frete_internacional: 100,
  taxas_destino_tabela_bid_frete_internacional: 50,
  valor_total_tabela_bid_frete_internacional: 1350,
  dias_transito_tabela_bid_frete_internacional: 28,
  validade_inicio_tabela_bid_frete_internacional: '2026-01-01T00:00:00.000Z',
  validade_fim_tabela_bid_frete_internacional: '2026-12-31T23:59:59.999Z',
}

describe('fornecedores — tabelas-valor (campos tabela_bid_frete_internacional_*)', () => {
  it('POST /:id_fornecedor/tabelas-valor aceita schema DDD', async () => {
    const app = criarApp()
    const res = await request(app)
      .post('/api/v1/bid-frete-internacional/fornecedores/forn_1/tabelas-valor')
      .set('x-id-usuario', 'user_admin')
      .send(payloadTabela)

    expect(res.status).toBe(201)
    expect(res.body.tabela.origem_codigo_tabela_bid_frete_internacional).toBe('BRSSZ')
    expect(mockPrisma.tabelaBidFreteInternacional.create).toHaveBeenCalled()
  })
})
