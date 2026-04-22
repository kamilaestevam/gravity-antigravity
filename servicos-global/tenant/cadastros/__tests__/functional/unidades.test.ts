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

describe('CRUD /unidades', () => {
  it('cria, busca e desativa unidade', async () => {
    const criar = await request(app).post('/api/v1/cadastros/unidades').set(headers)
      .send({ codigo: 'ZZK', nome: 'Quilo Teste', tipo: 'peso' })
    expect(criar.status).toBe(201)

    const buscar = await request(app).get('/api/v1/cadastros/unidades/ZZK').set(headers)
    expect(buscar.body.tipo).toBe('peso')

    const desativar = await request(app).delete('/api/v1/cadastros/unidades/ZZK').set(headers)
    expect(desativar.body.ativo).toBe(false)
  })

  it('rejeita tipo fora do enum', async () => {
    const res = await request(app).post('/api/v1/cadastros/unidades').set(headers)
      .send({ codigo: 'ZZX', nome: 'X', tipo: 'temperatura' })
    expect(res.status).toBe(422)
  })
})
