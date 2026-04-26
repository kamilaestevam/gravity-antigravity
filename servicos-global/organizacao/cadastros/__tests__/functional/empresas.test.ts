/**
 * CRUD funcional + isolamento cross-tenant para Empresa.
 *
 * Estes testes consultam o banco `gravity-cadastros-teste` (Railway).
 * Cleanup remove tudo com SUID prefixado por `TEST-`.
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { montarAppDeTeste, CHAVE_INTERNA_TESTE, PREFIXO_SUID_TESTE } from '../helpers/app-de-teste.js'
import { prismaTeste, limparDadosDeTeste } from './setup.js'
import { setPrismaClient } from '../../server/src/lib/prisma.js'

const app = montarAppDeTeste()
const headers = {
  'x-internal-key': CHAVE_INTERNA_TESTE,
  'content-type': 'application/json',
}

const TENANT_A = 'TEST-org-A'
const TENANT_B = 'TEST-org-B'

function payloadEmpresaBR(suid_empresa?: string) {
  return {
    suid_empresa: suid_empresa ?? `${PREFIXO_SUID_TESTE}BR-${Date.now()}`,
    id_organizacao: TENANT_A,
    nome_empresa: 'Empresa Teste BR',
    cnpj_empresa: '12.345.678/0001-90',
    pais_empresa: 'BR',
    pode_ser_importador_empresa: true,
  }
}

beforeAll(() => {
  setPrismaClient(prismaTeste)
})
beforeEach(limparDadosDeTeste)
afterAll(async () => {
  await limparDadosDeTeste()
  await prismaTeste.$disconnect()
})

describe('POST /empresas', () => {
  it('cria empresa BR válida', async () => {
    const res = await request(app)
      .post('/api/v1/cadastros/empresas')
      .set(headers)
      .send(payloadEmpresaBR())
    expect(res.status).toBe(201)
    expect(res.body.suid_empresa).toMatch(/^TEST-/)
    expect(res.body.cnpj_empresa).toBe('12.345.678/0001-90')
  })

  it('rejeita 401 sem chave interna', async () => {
    const res = await request(app)
      .post('/api/v1/cadastros/empresas')
      .send(payloadEmpresaBR())
    expect(res.status).toBe(401)
  })

  it('rejeita 422 quando CNPJ ausente em pais=BR', async () => {
    const { cnpj_empresa: _drop, ...semCnpj } = payloadEmpresaBR()
    const res = await request(app)
      .post('/api/v1/cadastros/empresas')
      .set(headers)
      .send(semCnpj)
    expect(res.status).toBe(422)
  })

  it('gera SUID automaticamente quando não fornecido', async () => {
    const { suid_empresa: _drop, ...semSuid } = payloadEmpresaBR()
    const res = await request(app)
      .post('/api/v1/cadastros/empresas')
      .set(headers)
      .send({
        ...semSuid,
        // SUID gerado vai ter formato BR-EMPRESA-TESTE-BR-00001 — sem prefixo TEST
        // Para cleanup, reescrevemos id_organizacao com prefixo e depois deletamos via prefixo.
        id_organizacao: PREFIXO_SUID_TESTE + 'auto-suid',
      })
    expect(res.status).toBe(201)
    expect(res.body.suid_empresa).toMatch(/^BR-/)
    // limpa direto via prefixo de organizacao
    await prismaTeste.empresa.deleteMany({ where: { id_organizacao_empresa: PREFIXO_SUID_TESTE + 'auto-suid' } })
  })
})

describe('GET /empresas', () => {
  it('lista apenas empresas do tenant solicitante', async () => {
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(`${PREFIXO_SUID_TESTE}A1`))
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send({ ...payloadEmpresaBR(`${PREFIXO_SUID_TESTE}B1`), id_organizacao: TENANT_B })

    const res = await request(app)
      .get('/api/v1/cadastros/empresas')
      .set({ ...headers, 'x-organizacao-id': TENANT_A })
    expect(res.status).toBe(200)
    expect(res.body.itens.every((e: { id_organizacao: string }) => e.id_organizacao === TENANT_A)).toBe(true)
  })

  it('exige id_organizacao (header ou query)', async () => {
    const res = await request(app).get('/api/v1/cadastros/empresas').set(headers)
    expect(res.status).toBe(400)
  })
})

describe('GET /empresas/:suid (cross-tenant)', () => {
  it('retorna 404 quando outro tenant tenta acessar', async () => {
    const suid_empresa = `${PREFIXO_SUID_TESTE}cross1`
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(suid_empresa))

    const res = await request(app)
      .get(`/api/v1/cadastros/empresas/${suid_empresa}`)
      .set({ ...headers, 'x-organizacao-id': TENANT_B })
    expect(res.status).toBe(404)
  })

  it('retorna 200 para o tenant dono', async () => {
    const suid_empresa = `${PREFIXO_SUID_TESTE}own1`
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(suid_empresa))

    const res = await request(app)
      .get(`/api/v1/cadastros/empresas/${suid_empresa}`)
      .set({ ...headers, 'x-organizacao-id': TENANT_A })
    expect(res.status).toBe(200)
    expect(res.body.suid_empresa).toBe(suid_empresa)
  })
})

describe('PUT /empresas/:suid', () => {
  it('atualiza nome da empresa', async () => {
    const suid_empresa = `${PREFIXO_SUID_TESTE}upd1`
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(suid_empresa))

    const res = await request(app)
      .put(`/api/v1/cadastros/empresas/${suid_empresa}`)
      .set({ ...headers, 'x-organizacao-id': TENANT_A })
      .send({ nome_empresa: 'Empresa Renomeada' })
    expect(res.status).toBe(200)
    expect(res.body.nome_empresa).toBe('Empresa Renomeada')
  })

  it('404 ao tentar atualizar SUID alheio', async () => {
    const suid_empresa = `${PREFIXO_SUID_TESTE}cross-upd`
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(suid_empresa))

    const res = await request(app)
      .put(`/api/v1/cadastros/empresas/${suid_empresa}`)
      .set({ ...headers, 'x-organizacao-id': TENANT_B })
      .send({ nome_empresa: 'Hack' })
    expect(res.status).toBe(404)
  })
})

describe('DELETE /empresas/:suid', () => {
  it('aplica soft delete (ativo=false)', async () => {
    const suid_empresa = `${PREFIXO_SUID_TESTE}del1`
    await request(app).post('/api/v1/cadastros/empresas').set(headers).send(payloadEmpresaBR(suid_empresa))

    const res = await request(app)
      .delete(`/api/v1/cadastros/empresas/${suid_empresa}`)
      .set({ ...headers, 'x-organizacao-id': TENANT_A })
    expect(res.status).toBe(200)
    expect(res.body.ativo_empresa).toBe(false)

    // Registro continua existindo (não foi hard delete).
    const restante = await prismaTeste.empresa.findUnique({ where: { suid_empresa } })
    expect(restante).not.toBeNull()
  })
})
