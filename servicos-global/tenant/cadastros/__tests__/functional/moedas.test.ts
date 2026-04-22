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

describe('CRUD /moedas (catálogo global)', () => {
  it('cria, busca, atualiza e desativa moeda', async () => {
    const criar = await request(app).post('/api/v1/cadastros/moedas').set(headers)
      .send({ codigo: 'ZZX', nome: 'Moeda Teste', simbolo: 'Z$' })
    expect(criar.status).toBe(201)

    const buscar = await request(app).get('/api/v1/cadastros/moedas/ZZX').set(headers)
    expect(buscar.status).toBe(200)
    expect(buscar.body.nome).toBe('Moeda Teste')

    const atualizar = await request(app).put('/api/v1/cadastros/moedas/ZZX').set(headers)
      .send({ nome: 'Renomeada', simbolo: 'Z$', ativo: true })
    expect(atualizar.status).toBe(200)
    expect(atualizar.body.nome).toBe('Renomeada')

    const desativar = await request(app).delete('/api/v1/cadastros/moedas/ZZX').set(headers)
    expect(desativar.status).toBe(200)
    expect(desativar.body.ativo).toBe(false)
  })

  it('rejeita codigo fora do padrão ISO 4217', async () => {
    const res = await request(app).post('/api/v1/cadastros/moedas').set(headers)
      .send({ codigo: 'zz1', nome: 'X', simbolo: '$' })
    expect(res.status).toBe(422)
  })

  it('lista retorna estrutura { itens, total }', async () => {
    const res = await request(app).get('/api/v1/cadastros/moedas').set(headers)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.itens)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })
})
