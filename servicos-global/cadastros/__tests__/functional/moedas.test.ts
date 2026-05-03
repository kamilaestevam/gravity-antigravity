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
      .send({ codigo_moeda: 'ZZX', nome_moeda: 'Moeda de Teste', simbolo_moeda: 'Z$' })
    expect(criar.status).toBe(201)

    const buscar = await request(app).get('/api/v1/cadastros/moedas/ZZX').set(headers)
    expect(buscar.status).toBe(200)
    expect(buscar.body.simbolo_moeda).toBe('Z$')
    expect(buscar.body.nome_moeda).toBe('Moeda de Teste')

    const atualizar = await request(app).put('/api/v1/cadastros/moedas/ZZX').set(headers)
      .send({ simbolo_moeda: 'ZZ$', ativo_moeda: true })
    expect(atualizar.status).toBe(200)
    expect(atualizar.body.simbolo_moeda).toBe('ZZ$')

    const desativar = await request(app).delete('/api/v1/cadastros/moedas/ZZX').set(headers)
    expect(desativar.status).toBe(200)
    expect(desativar.body.ativo_moeda).toBe(false)
  })

  it('rejeita codigo fora do padrão ISO 4217', async () => {
    const res = await request(app).post('/api/v1/cadastros/moedas').set(headers)
      .send({ codigo_moeda: 'zz1', nome_moeda: 'Inválida', simbolo_moeda: '$' })
    expect(res.status).toBe(422)
  })

  it('lista retorna estrutura { itens, total }', async () => {
    const res = await request(app).get('/api/v1/cadastros/moedas').set(headers)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body.itens)).toBe(true)
    expect(typeof res.body.total).toBe('number')
  })
})
