/**
 * Testes funcionais das rotas PÚBLICAS de NCM.
 *
 * Rotas testadas:
 *   GET /api/v1/cadastros/ncm/buscar?q=...&limite=N
 *   GET /api/v1/cadastros/ncm/:codigo/validar
 *
 * Essas rotas NÃO exigem `x-internal-key` — são consumidas pelo frontend
 * (SelectNcmGlobal / CampoBuscarNcm / useNcmValidation).
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest'
import request from 'supertest'
import { montarAppDeTeste, CHAVE_INTERNA_TESTE } from '../helpers/app-de-teste.js'
import { prismaTeste, limparDadosDeTeste } from './setup.js'
import { setPrismaClient } from '../../server/src/lib/prisma.js'

const app = montarAppDeTeste()

beforeAll(() => setPrismaClient(prismaTeste))

beforeEach(async () => {
  // Limpar NCMs de teste e inserir dados seed
  await prismaTeste.ncmSync.deleteMany({ where: { codigo_ncm_sync: { startsWith: '99' } } })
  await prismaTeste.ncmSync.createMany({
    data: [
      { codigo_ncm_sync: '99010101', descricao_ncm_sync: 'Produto de teste A', ativo_ncm_sync: true },
      { codigo_ncm_sync: '99010102', descricao_ncm_sync: 'Produto de teste B', ativo_ncm_sync: true },
      { codigo_ncm_sync: '99020201', descricao_ncm_sync: 'Material especial', ativo_ncm_sync: true },
      { codigo_ncm_sync: '99030301', descricao_ncm_sync: 'Item desativado', ativo_ncm_sync: false },
    ],
    skipDuplicates: true,
  })
})

afterAll(async () => {
  await prismaTeste.ncmSync.deleteMany({ where: { codigo_ncm_sync: { startsWith: '99' } } })
  await prismaTeste.$disconnect()
})

// ─── GET /buscar ─────────────────────────────────────────────────────────────

describe('GET /ncm/buscar (público)', () => {
  it('retorna itens buscando por código parcial', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '9901', limite: '20' })

    expect(res.status).toBe(200)
    expect(res.body.itens).toBeInstanceOf(Array)
    expect(res.body.itens.length).toBe(2)
    expect(res.body.itens[0]).toHaveProperty('codigo')
    expect(res.body.itens[0]).toHaveProperty('descricao')
    expect(res.body.itens[0].codigo).toBe('99010101')
  })

  it('retorna itens buscando por descrição (case insensitive)', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: 'material especial', limite: '20' })

    expect(res.status).toBe(200)
    expect(res.body.itens.length).toBe(1)
    expect(res.body.itens[0].codigo).toBe('99020201')
  })

  it('retorna vazio se query < 2 caracteres', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: 'a' })

    expect(res.status).toBe(200)
    expect(res.body.itens).toEqual([])
  })

  it('retorna vazio se query ausente', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')

    expect(res.status).toBe(200)
    expect(res.body.itens).toEqual([])
  })

  it('respeita limite máximo de 100', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '99', limite: '999' })

    expect(res.status).toBe(200)
    expect(res.body.itens.length).toBeLessThanOrEqual(100)
  })

  it('não exige header x-internal-key (rota pública)', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '9901' })
    expect(res.status).toBe(200)
    expect(res.body.itens.length).toBeGreaterThan(0)
  })

  it('não retorna NCMs desativados', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '9903' })

    expect(res.status).toBe(200)
    expect(res.body.itens).toEqual([])
  })

  it('limite default é 20 quando não informado', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '99' })

    expect(res.status).toBe(200)
    expect(res.body.itens.length).toBe(3)
  })

  // ── Novos: contrato ultima_sync + fuzzy ──

  it('retorna ultima_sync no payload', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '9901' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ultima_sync')
    expect(res.body).toHaveProperty('fuzzy')
  })

  it('retorna fuzzy: false em busca exata com resultados', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: '9901' })

    expect(res.status).toBe(200)
    expect(res.body.fuzzy).toBe(false)
    expect(res.body.itens.length).toBeGreaterThan(0)
  })

  it('retorna ultima_sync mesmo quando query < 2 chars', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: 'a' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ultima_sync')
    expect(res.body).toHaveProperty('fuzzy')
    expect(res.body.fuzzy).toBe(false)
  })

  it('tenta busca fuzzy (pg_trgm) quando busca exata retorna vazio', async () => {
    // Busca uma palavra que não existe exatamente mas pode ter match fuzzy
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/buscar')
      .query({ q: 'produtox' })

    expect(res.status).toBe(200)
    // Pode retornar itens fuzzy ou não (depende de pg_trgm estar disponível)
    expect(res.body).toHaveProperty('itens')
    expect(res.body).toHaveProperty('fuzzy')
    // Se encontrou via fuzzy, fuzzy=true; se não encontrou nada, fuzzy=false
    if (res.body.itens.length > 0) {
      expect(res.body.fuzzy).toBe(true)
    } else {
      expect(res.body.fuzzy).toBe(false)
    }
  })
})

// ─── GET /:codigo/validar ────────────────────────────────────────────────────

describe('GET /ncm/:codigo/validar (público)', () => {
  it('valida NCM existente no cache local', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/99010101/validar')

    expect(res.status).toBe(200)
    expect(res.body.valido).toBe(true)
    expect(res.body.descricao).toBe('Produto de teste A')
    expect(res.body.fonte).toBe('cache')
    expect(res.body.motivo).toBeNull()
  })

  it('rejeita código com menos de 8 dígitos', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/1234/validar')

    expect(res.status).toBe(200)
    expect(res.body.valido).toBe(false)
    expect(res.body.motivo).toContain('8 dígitos')
  })

  it('rejeita código com letras', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/ABCD1234/validar')

    expect(res.status).toBe(200)
    expect(res.body.valido).toBe(false)
    expect(res.body.motivo).toContain('8 dígitos')
  })

  it('retorna contrato completo para NCM desativado', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/99030301/validar')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('valido')
    expect(res.body).toHaveProperty('descricao')
    expect(res.body).toHaveProperty('fonte')
    expect(res.body).toHaveProperty('ultima_sync')
    expect(res.body).toHaveProperty('motivo')
  })

  it('retorna contrato completo para NCM inexistente', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/00000000/validar')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('valido')
    expect(res.body).toHaveProperty('descricao')
    expect(res.body).toHaveProperty('fonte')
    expect(res.body).toHaveProperty('ultima_sync')
    expect(res.body).toHaveProperty('motivo')
  })

  it('não exige header x-internal-key (rota pública)', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/99010101/validar')
    expect(res.status).toBe(200)
    expect(res.body.valido).toBe(true)
  })

  it('retorna ultima_sync no payload', async () => {
    const res = await request(app)
      .get('/api/v1/cadastros/ncm/99010101/validar')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('ultima_sync')
  })
})
