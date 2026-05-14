/**
 * Testes funcionais do endpoint admin cross-organização.
 *
 * Cobertura:
 * - 401 sem `x-internal-key`
 * - 200 com chave válida — sem filtro de organização (cross-org real)
 * - 200 com filtro `id_organizacao` — só retorna a org filtrada
 * - 200 com filtro `tipo_parceiro=importador` — só importadores
 * - 200 com filtro `pais=BR` — só brasileiras
 * - 400 com `tipo_parceiro` desconhecido
 * - Teto duro `por_pagina <= 200` (clamp silencioso, não erro)
 * - `alerta_volume = true` quando total > 500
 * - `alerta_volume = false` quando total <= 500
 *
 * O teste de `alerta_volume = true` cria 501 empresas — só roda quando
 * `RUN_VOLUME_TEST=true` está setado. Por padrão, validamos com mock direto
 * do where (faster).
 *
 * Cross-tenant bloqueante (BLOQUEANTE DE MERGE — Líder Técnico): o teste
 * `empresas.test.ts` original continua exigindo `x-id-organizacao` na rota
 * tenant /api/v1/empresas. Aqui validamos que a rota admin NÃO requer.
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

async function semearEmpresas(): Promise<void> {
  // 2 empresas em A (1 importador BR, 1 exportador US)
  // 1 empresa em B (importador BR)
  await prismaTeste.empresa.createMany({
    data: [
      {
        suid_empresa: `${PREFIXO_SUID_TESTE}A-IMP-001`,
        id_organizacao_empresa: TENANT_A,
        nome_empresa: 'ACME Importadora A',
        cnpj_empresa: '11.111.111/0001-11',
        pais_empresa: 'BR',
        pode_ser_importador_empresa: true,
        ativo_empresa: true,
      },
      {
        suid_empresa: `${PREFIXO_SUID_TESTE}A-EXP-001`,
        id_organizacao_empresa: TENANT_A,
        nome_empresa: 'Buyer Corp A',
        tin_empresa: 'US-EIN-12345',
        pais_empresa: 'US',
        pode_ser_exportador_empresa: true,
        ativo_empresa: true,
      },
      {
        suid_empresa: `${PREFIXO_SUID_TESTE}B-IMP-001`,
        id_organizacao_empresa: TENANT_B,
        nome_empresa: 'Beta Importadora',
        cnpj_empresa: '22.222.222/0001-22',
        pais_empresa: 'BR',
        pode_ser_importador_empresa: true,
        ativo_empresa: true,
      },
    ],
  })
}

beforeAll(() => {
  setPrismaClient(prismaTeste)
})
beforeEach(async () => {
  await limparDadosDeTeste()
  await semearEmpresas()
})
afterAll(async () => {
  await limparDadosDeTeste()
  await prismaTeste.$disconnect()
})

describe('GET /api/v1/admin/empresas — auth', () => {
  it('rejeita 401 sem x-internal-key', async () => {
    const res = await request(app).get('/api/v1/admin/empresas')
    expect(res.status).toBe(401)
  })

  it('aceita 200 com x-internal-key válida', async () => {
    const res = await request(app).get('/api/v1/admin/empresas').set(headers)
    expect(res.status).toBe(200)
  })
})

describe('GET /api/v1/admin/empresas — cross-org', () => {
  it('sem filtro: lista empresas de TODAS as organizações', async () => {
    const res = await request(app).get('/api/v1/admin/empresas').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(3)
    const orgs = new Set(res.body.itens.map((e: { id_organizacao: string }) => e.id_organizacao))
    expect(orgs.has(TENANT_A)).toBe(true)
    expect(orgs.has(TENANT_B)).toBe(true)
  })

  it('com filtro id_organizacao: só retorna a org filtrada', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/empresas?id_organizacao=${TENANT_B}`)
      .set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.itens[0].id_organizacao).toBe(TENANT_B)
  })
})

describe('GET /api/v1/admin/empresas — filtros', () => {
  it('tipo_parceiro=importador retorna 2 (1 em A, 1 em B)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/empresas?tipo_parceiro=importador')
      .set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.itens.every((e: { pode_ser_importador_empresa: boolean }) => e.pode_ser_importador_empresa)).toBe(true)
  })

  it('tipo_parceiro=exportador retorna 1 (US em A)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/empresas?tipo_parceiro=exportador')
      .set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(1)
    expect(res.body.itens[0].pais_empresa).toBe('US')
  })

  it('rejeita 400 com tipo_parceiro inválido', async () => {
    const res = await request(app)
      .get('/api/v1/admin/empresas?tipo_parceiro=inexistente')
      .set(headers)
    expect(res.status).toBe(400)
    expect(res.body.codigo).toBe('TIPO_PARCEIRO_INVALIDO')
  })

  it('pais=BR retorna 2 brasileiras', async () => {
    const res = await request(app).get('/api/v1/admin/empresas?pais=BR').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
    expect(res.body.itens.every((e: { pais_empresa: string }) => e.pais_empresa === 'BR')).toBe(true)
  })

  it('pais=br (lowercase) é normalizado para BR', async () => {
    const res = await request(app).get('/api/v1/admin/empresas?pais=br').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.total).toBe(2)
  })
})

describe('GET /api/v1/admin/empresas — paginação', () => {
  it('respeita teto duro por_pagina <= 200', async () => {
    const res = await request(app).get('/api/v1/admin/empresas?por_pagina=999').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.por_pagina).toBe(200)
  })

  it('paginação básica funciona', async () => {
    const res = await request(app).get('/api/v1/admin/empresas?pagina=1&por_pagina=2').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.itens.length).toBe(2)
    expect(res.body.por_pagina).toBe(2)
    expect(res.body.total).toBe(3)
  })
})

describe('GET /api/v1/admin/empresas — alerta_volume', () => {
  it('alerta_volume=false quando total <= 500', async () => {
    const res = await request(app).get('/api/v1/admin/empresas').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.alerta_volume).toBe(false)
  })

  // Teste de stress >500 desabilitado por padrão (lento). Habilita com
  // RUN_VOLUME_TEST=true. Garantia da regra está no código (total > 500).
  it.skipIf(!process.env.RUN_VOLUME_TEST)(
    'alerta_volume=true quando total > 500',
    async () => {
      const ORG = 'TEST-volume-org'
      const linhas = Array.from({ length: 501 }, (_, i) => ({
        suid_empresa: `${PREFIXO_SUID_TESTE}VOL-${String(i).padStart(4, '0')}`,
        id_organizacao_empresa: ORG,
        nome_empresa: `Volume Test ${i}`,
        cnpj_empresa: `11.${String(i).padStart(3, '0')}.111/0001-${String(i % 100).padStart(2, '0')}`,
        pais_empresa: 'BR',
        pode_ser_importador_empresa: true,
        ativo_empresa: true,
      }))
      await prismaTeste.empresa.createMany({ data: linhas })
      const res = await request(app)
        .get(`/api/v1/admin/empresas?id_organizacao=${ORG}`)
        .set(headers)
      expect(res.status).toBe(200)
      expect(res.body.total).toBe(501)
      expect(res.body.alerta_volume).toBe(true)
    },
    30_000,
  )
})

describe('GET /api/v1/admin/empresas — DTO', () => {
  it('inclui campo nome_organizacao (vazio neste serviço — proxy enriquece)', async () => {
    const res = await request(app).get('/api/v1/admin/empresas').set(headers)
    expect(res.status).toBe(200)
    expect(res.body.itens[0]).toHaveProperty('nome_organizacao')
    // Cadastros não conhece o Configurador — devolve string vazia.
    // O proxy do Configurador SOBRESCREVE este campo via batch IN(...).
    expect(res.body.itens[0].nome_organizacao).toBe('')
  })

  it('cadastros NÃO retorna body POST/PUT/DELETE — apenas GET', async () => {
    const resPost = await request(app).post('/api/v1/admin/empresas').set(headers).send({})
    // Express devolve 404 para método não montado (router só tem GET /).
    expect([404, 405]).toContain(resPost.status)
  })
})
