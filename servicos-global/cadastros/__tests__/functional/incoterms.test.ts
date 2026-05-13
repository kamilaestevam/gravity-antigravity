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

describe('CRUD /incoterms', () => {
  it('cria, lista, busca e desativa incoterm', async () => {
    const criar = await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({
        codigo_incoterm: 'XXX',
        nome_incoterm: 'Teste',
        descricao_incoterm: 'Termo de teste',
        modal_transporte: 'qualquer',
        versao_incoterm: '2020',
        ativo_incoterm: true,
      })
    expect(criar.status).toBe(201)
    expect(criar.body.codigo_incoterm).toBe('XXX')

    const lista = await request(app).get('/api/v1/cadastros/incoterms').set(headers)
    expect(lista.status).toBe(200)
    expect(lista.body.itens.length).toBeGreaterThan(0)
    expect(typeof lista.body.total).toBe('number')

    const buscar = await request(app).get('/api/v1/cadastros/incoterms/XXX').set(headers)
    expect(buscar.status).toBe(200)
    expect(buscar.body.modal_transporte).toBe('qualquer')

    const desativar = await request(app).delete('/api/v1/cadastros/incoterms/XXX').set(headers)
    expect(desativar.status).toBe(200)
    expect(desativar.body.ativo_incoterm).toBe(false)
  })

  it('rejeita modal_transporte fora do enum', async () => {
    const res = await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({
        codigo_incoterm: 'XYZ',
        nome_incoterm: 'Test',
        modal_transporte: 'aereo',  // não está no enum
        versao_incoterm: '2020',
        ativo_incoterm: true,
      })
    expect(res.status).toBe(422)
  })

  it('rejeita duplicidade (409)', async () => {
    await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({ codigo_incoterm: 'YYY', nome_incoterm: 'Y', modal_transporte: 'maritimo', versao_incoterm: '2020', ativo_incoterm: true })
    const dup = await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({ codigo_incoterm: 'YYY', nome_incoterm: 'Y2', modal_transporte: 'maritimo', versao_incoterm: '2020', ativo_incoterm: true })
    expect(dup.status).toBe(409)
  })

  it('filtra por modal_transporte=maritimo', async () => {
    await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({ codigo_incoterm: 'AAA', nome_incoterm: 'A', modal_transporte: 'maritimo', versao_incoterm: '2020', ativo_incoterm: true })
    await request(app).post('/api/v1/cadastros/incoterms').set(headers)
      .send({ codigo_incoterm: 'BBB', nome_incoterm: 'B', modal_transporte: 'qualquer', versao_incoterm: '2020', ativo_incoterm: true })

    const res = await request(app).get('/api/v1/cadastros/incoterms?modal_transporte=maritimo').set(headers)
    const siglas = res.body.itens.map((i: { codigo_incoterm: string }) => i.codigo_incoterm)
    expect(siglas).toContain('AAA')
    expect(siglas).not.toContain('BBB')
  })
})
