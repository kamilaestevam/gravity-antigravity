import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { montarAppDeTeste, CHAVE_INTERNA_TESTE } from '../helpers/app-de-teste.js'
import { prismaTeste, limparDadosDeTeste } from './setup.js'
import { setPrismaClient } from '../../server/src/lib/prisma.js'

const app = montarAppDeTeste()
const headers = { 'x-internal-key': CHAVE_INTERNA_TESTE, 'content-type': 'application/json' }

beforeAll(() => setPrismaClient(prismaTeste))
beforeEach(limparDadosDeTeste)
afterAll(async () => { await limparDadosDeTeste(); await prismaTeste.$disconnect() })

describe('CRUD /ncm', () => {
  it('cria com 8 dígitos numéricos', async () => {
    const res = await request(app).post('/api/v1/cadastros/ncm').set(headers)
      .send({ codigo: '99999999', descricao: 'NCM teste', ipi: 5, ii: 10 })
    expect(res.status).toBe(201)
    expect(res.body.codigo).toBe('99999999')
  })

  it('rejeita código com letras', async () => {
    const res = await request(app).post('/api/v1/cadastros/ncm').set(headers)
      .send({ codigo: '9999AAAA', descricao: 'X' })
    expect(res.status).toBe(422)
  })

  it('PUT atualiza apenas campos fornecidos', async () => {
    await request(app).post('/api/v1/cadastros/ncm').set(headers)
      .send({ codigo: '99999998', descricao: 'orig', ipi: 3 })
    const res = await request(app).put('/api/v1/cadastros/ncm/99999998').set(headers)
      .send({ descricao: 'novo' })
    expect(res.body.descricao).toBe('novo')
    expect(res.body.ipi).toBe(3)
  })
})
