/**
 * fase4-pedidos.snapshot.test.ts — Testes de integração da Fase 4.
 *
 * Cobre o pipeline novo:
 *   (1) cadastrosClient.buscarEmpresasPorSuids: dedup + erros HTTP mapeados
 *   (2) pedidoSnapshots.montarSnapshotEmpresa: BR (CNPJ) vs estrangeira (TIN)
 *
 * Todas as chamadas de rede são mockadas via vi.stubGlobal('fetch').
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Env antes do import do módulo (lê vars em load-time) ───────────────────
vi.hoisted(() => {
  process.env.INTERNAL_SERVICE_KEY = 'test-internal-key'
  process.env.CADASTROS_SERVICE_URL = 'http://cadastros-mock.test'
})

import {
  buscarEmpresaPorSuid,
  buscarEmpresasPorSuids,
} from '../../../../../servicos-global/organizacao/processos-core/src/services/cadastrosClient.js'
import { montarSnapshotEmpresa } from '../../../../../servicos-global/organizacao/processos-core/src/services/pedidoSnapshots.js'
import { AppError } from '../../../../../servicos-global/organizacao/processos-core/src/services/saldoEngine.js'

// ── Fetch mock ──────────────────────────────────────────────────────────────

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

function empresaBR(suid: string, cnpj = '12.345.678/0001-99') {
  return {
    suid_empresa: suid,
    id_organizacao: 'org-test',
    nome_empresa: 'ACME Importadora',
    cnpj_empresa: cnpj,
    tin_empresa: null,
    pais_empresa: 'BR',
    estado_empresa: 'SP',
    cidade_empresa: 'Sao Paulo',
    endereco_empresa: 'Rua Teste, 100',
    zipcode_empresa: '01000-000',
    email_empresa: 'contato@acme.test',
    telefone_empresa: null,
    whatsapp_empresa: null,
    pode_ser_importador_empresa: true,
    pode_ser_exportador_empresa: false,
    pode_ser_fabricante_empresa: false,
    pode_ser_agente_empresa: false,
    pode_ser_despachante_empresa: false,
    pode_ser_armador_empresa: false,
    ativo_empresa: true,
    criado_em_empresa: '2026-04-22T00:00:00.000Z',
    atualizado_em_empresa: '2026-04-22T00:00:00.000Z',
  }
}

function empresaUS(suid: string) {
  return {
    ...empresaBR(suid),
    nome_empresa: 'Buyer Corp',
    cnpj_empresa: null,
    tin_empresa: 'US-EIN-123456789',
    pais_empresa: 'US',
    estado_empresa: 'NY',
    cidade_empresa: 'New York',
    zipcode_empresa: '10001',
  }
}

function jsonResp(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ctx = { id_organizacao: 'org-test', correlation_id: 'corr-123' }

// ── Suite: cadastrosClient ──────────────────────────────────────────────────

describe('buscarEmpresaPorSuid', () => {
  beforeEach(() => fetchMock.mockReset())

  it('200 → retorna Empresa parseada', async () => {
    fetchMock.mockResolvedValueOnce(jsonResp(empresaBR('BR-ACME-00001')))
    const empresa = await buscarEmpresaPorSuid('BR-ACME-00001', ctx)
    expect(empresa.suid_empresa).toBe('BR-ACME-00001')
    expect(empresa.pais_empresa).toBe('BR')

    // Headers corretos
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/empresas\/BR-ACME-00001$/)
    expect(init?.method).toBe('GET')
    const h = init?.headers as Record<string, string>
    expect(h['x-internal-key']).toBe('test-internal-key')
    expect(h['x-organizacao-id']).toBe('org-test')
    expect(h['x-correlation-id']).toBe('corr-123')
  })

  it('404 → AppError(400) "Empresa nao encontrada"', async () => {
    fetchMock.mockResolvedValueOnce(new Response('not found', { status: 404 }))
    try {
      await buscarEmpresaPorSuid('BR-XX-00099', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).message).toMatch(/Empresa nao encontrada no Cadastros/)
    }
  })

  it('500 → AppError(503)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('kaboom', { status: 500 }))
    try {
      await buscarEmpresaPorSuid('BR-ACME-00001', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(503)
    }
  })

  it('falha de rede → AppError(503)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    try {
      await buscarEmpresaPorSuid('BR-ACME-00001', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(503)
      expect((err as AppError).message).toMatch(/indisponivel|indispon/i)
    }
  })
})

describe('buscarEmpresasPorSuids', () => {
  beforeEach(() => fetchMock.mockReset())

  it('deduplica SUIDs e retorna Map', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResp(empresaBR('BR-ACME-00001')))
      .mockResolvedValueOnce(jsonResp(empresaUS('US-BUYER-00001')))

    const mapa = await buscarEmpresasPorSuids(
      ['BR-ACME-00001', 'BR-ACME-00001', 'US-BUYER-00001'],
      ctx,
    )
    expect(fetchMock).toHaveBeenCalledTimes(2) // dedup aplicado
    expect(mapa.size).toBe(2)
    expect(mapa.get('BR-ACME-00001')?.pais_empresa).toBe('BR')
    expect(mapa.get('US-BUYER-00001')?.pais_empresa).toBe('US')
  })

  it('lista vazia → Map vazio sem tocar rede', async () => {
    const mapa = await buscarEmpresasPorSuids([], ctx)
    expect(mapa.size).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('qualquer SUID com erro propaga (sem engolir)', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResp(empresaBR('BR-ACME-00001')))
      .mockResolvedValueOnce(new Response('x', { status: 404 }))

    await expect(
      buscarEmpresasPorSuids(['BR-ACME-00001', 'BR-MISSING-00001'], ctx),
    ).rejects.toThrow(/Empresa nao encontrada/)
  })
})

// ── Suite: montarSnapshotEmpresa ────────────────────────────────────────────

describe('montarSnapshotEmpresa', () => {
  it('BR → documento = CNPJ, cnpj_raiz = 8 primeiros dígitos', () => {
    const snap = montarSnapshotEmpresa(
      empresaBR('BR-ACME-00001', '12.345.678/0001-99'),
      'exportador',
      'org-test',
      'ws-test',
    )
    expect(snap.tipo_documento).toBe('CNPJ')
    expect(snap.documento_principal).toBe('12.345.678/0001-99')
    expect(snap.cnpj_raiz).toBe('12345678')
    expect(snap.papel).toBe('exportador')
    expect(snap.motivo_congelamento).toBe('emissao')
    expect(snap.id_organizacao).toBe('org-test')
    expect(snap.id_workspace).toBe('ws-test')
  })

  it('estrangeira (US) → documento = TIN, cnpj_raiz = null', () => {
    const snap = montarSnapshotEmpresa(
      empresaUS('US-BUYER-00001'),
      'importador',
      'org-test',
    )
    expect(snap.tipo_documento).toBe('TIN')
    expect(snap.documento_principal).toBe('US-EIN-123456789')
    expect(snap.cnpj_raiz).toBeNull()
    expect(snap.endereco_pais).toBe('US')
  })

  it('empresa sem documento válido → lança erro', () => {
    const semDoc = { ...empresaBR('BR-X-00001'), cnpj_empresa: null }
    expect(() => montarSnapshotEmpresa(semDoc, 'exportador', 'org')).toThrow(
      /sem documento/,
    )
  })
})
