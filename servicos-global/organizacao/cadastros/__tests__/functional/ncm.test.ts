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
    const res = await request(app).post('/api/v1/ncm').set(headers)
      .send({ codigo_ncm: '99999999', descricao_ncm: 'NCM teste', ipi_ncm: 5, ii_ncm: 10 })
    expect(res.status).toBe(201)
    expect(res.body.codigo_ncm).toBe('99999999')
  })

  it('rejeita código com letras', async () => {
    const res = await request(app).post('/api/v1/ncm').set(headers)
      .send({ codigo_ncm: '9999AAAA', descricao_ncm: 'X' })
    expect(res.status).toBe(422)
  })

  it('PUT atualiza apenas campos fornecidos', async () => {
    await request(app).post('/api/v1/ncm').set(headers)
      .send({ codigo_ncm: '99999998', descricao_ncm: 'orig', ipi_ncm: 3 })
    const res = await request(app).put('/api/v1/ncm/99999998').set(headers)
      .send({ descricao_ncm: 'novo' })
    expect(res.body.descricao_ncm).toBe('novo')
    expect(res.body.ipi_ncm).toBe(3)
  })
})
