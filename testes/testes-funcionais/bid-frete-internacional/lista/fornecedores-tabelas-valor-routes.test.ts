/// <reference types="vitest/globals" />
// @vitest-environment node

import express, { Request, Response, NextFunction } from 'express'
import request from 'supertest'

const mockFornecedorBid = {
  id_fornecedor_bid_frete_internacional: 'forn_cadastros_1',
  id_organizacao: 'org_1',
  nome_fornecedor_bid_frete_internacional: 'Fornecedor Test',
  email_fornecedor_bid_frete_internacional: 'dmmltda+testefornecedor07@gmail.com',
  id_usuario: null,
  id_clerk_usuario: null,
}

const mockPrisma = {
  fornecedorBidFreteInternacional: {
    findFirst: vi.fn(async () => mockFornecedorBid),
    update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({
      ...mockFornecedorBid,
      ...data,
    })),
  },
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
    const r = req as Request & { prisma: typeof mockPrisma; tenantId?: string }
    r.prisma = mockPrisma
    r.tenantId = (req.headers['x-id-organizacao'] as string) ?? 'org_1'
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

describe('fornecedores — vincular-usuario (S2S Configurador)', () => {
  it('PUT /:id_fornecedor/vincular-usuario grava id_usuario no espelho BID', async () => {
    const app = criarApp()
    const res = await request(app)
      .put('/api/v1/bid-frete-internacional/fornecedores/forn_cadastros_1/vincular-usuario')
      .set('x-id-organizacao', 'org_1')
      .send({ id_usuario: 'user_fornecedor_07', id_clerk_usuario: 'clerk_07' })

    expect(res.status).toBe(200)
    expect(res.body.fornecedor.id_usuario).toBe('user_fornecedor_07')
    expect(res.body.fornecedor.id_clerk_usuario).toBe('clerk_07')
    expect(mockPrisma.fornecedorBidFreteInternacional.update).toHaveBeenCalled()
  })
})

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
