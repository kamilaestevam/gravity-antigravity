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
  process.env.CHAVE_INTERNA_SERVICO = 'test-internal-key'
  process.env.CADASTROS_SERVICE_URL = 'http://cadastros-mock.test'
})

import {
  buscarIdentidadeComexPorSuid,
  buscarIdentidadesComexPorSuids,
} from '../../../../processos-core/src/services/cadastrosClient.js'
import { montarSnapshotIdentidadeComex } from '../../../../processos-core/src/services/pedidoSnapshots.js'
import { AppError } from '../../../../processos-core/src/services/saldo-pedido.js'

// ── Fetch mock ──────────────────────────────────────────────────────────────

const fetchMock = vi.fn()
vi.stubGlobal('fetch', fetchMock)

function empresaBR(suid: string, cnpj = '12.345.678/0001-99') {
  return {
    id_fornecedor: suid,
    id_organizacao: 'org-test',
    nome_fornecedor: 'ACME Importadora',
    cnpj_fornecedor: cnpj,
    tin_fornecedor: null,
    pais_fornecedor: 'BR',
    estado_provincia_fornecedor: 'SP',
    cidade_fornecedor: 'Sao Paulo',
    endereco_fornecedor: 'Rua Teste, 100',
    cep_zipcode_fornecedor: '01000-000',
    email_principal_fornecedor: 'contato@acme.test',
    telefone_principal_fornecedor: null,
    whatsapp_principal_fornecedor: null,
    pode_ser_importador_fornecedor: true,
    pode_ser_exportador_fornecedor: false,
    pode_ser_fabricante_fornecedor: false,
    pode_ser_agente_fornecedor: false,
    pode_ser_despachante_fornecedor: false,
    pode_ser_armador_fornecedor: false,
    pode_ser_cia_aerea_fornecedor: false,
    pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
    pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
    pode_ser_armazem_alfandegado_fornecedor: false,
    pode_ser_armazem_nacional_fornecedor: false,
    pode_ser_banco_fornecedor: false,
    pode_ser_seguradora_internacional_fornecedor: false,
    pode_ser_seguradora_corretora_cambio_fornecedor: false,
    ativo_fornecedor: true,
    criado_em_fornecedor: '2026-04-22T00:00:00.000Z',
    atualizado_em_fornecedor: '2026-04-22T00:00:00.000Z',
  }
}

function empresaUS(suid: string) {
  return {
    ...empresaBR(suid),
    nome_fornecedor: 'Buyer Corp',
    cnpj_fornecedor: null,
    tin_fornecedor: 'US-EIN-123456789',
    pais_fornecedor: 'US',
    estado_provincia_fornecedor: 'NY',
    cidade_fornecedor: 'New York',
    cep_zipcode_fornecedor: '10001',
  }
}

/** Shape GET /empresas/:suid (empresaSchema) a partir do fixture fornecedor. */
function empresaCadastrosFromFornecedor(f: ReturnType<typeof empresaBR>) {
  return {
    id_empresa: f.id_fornecedor,
    id_organizacao: f.id_organizacao,
    nome_empresa: f.nome_fornecedor,
    cnpj_empresa: f.cnpj_fornecedor,
    tin_empresa: f.tin_fornecedor,
    pais_empresa: f.pais_fornecedor,
    estado_provincia_empresa: f.estado_provincia_fornecedor,
    cidade_empresa: f.cidade_fornecedor,
    endereco_empresa: f.endereco_fornecedor,
    cep_zipcode_empresa: f.cep_zipcode_fornecedor,
    email_principal_empresa: f.email_principal_fornecedor,
    telefone_principal_empresa: f.telefone_principal_fornecedor,
    whatsapp_principal_empresa: f.whatsapp_principal_fornecedor,
    pode_ser_importador_empresa: f.pode_ser_importador_fornecedor,
    pode_ser_exportador_empresa: f.pode_ser_exportador_fornecedor,
    pode_ser_fabricante_empresa: f.pode_ser_fabricante_fornecedor,
    pode_ser_agente_empresa: f.pode_ser_agente_fornecedor,
    pode_ser_despachante_empresa: f.pode_ser_despachante_fornecedor,
    pode_ser_armador_empresa: f.pode_ser_armador_fornecedor,
    pode_ser_cia_aerea_empresa: f.pode_ser_cia_aerea_fornecedor,
    pode_ser_transportadora_rodoviaria_nacional_empresa: f.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
    pode_ser_transportadora_rodoviaria_internacional_empresa: f.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
    pode_ser_armazem_alfandegado_empresa: f.pode_ser_armazem_alfandegado_fornecedor,
    pode_ser_armazem_nacional_empresa: f.pode_ser_armazem_nacional_fornecedor,
    pode_ser_banco_empresa: f.pode_ser_banco_fornecedor,
    pode_ser_seguradora_internacional_empresa: f.pode_ser_seguradora_internacional_fornecedor,
    pode_ser_seguradora_corretora_cambio_empresa: f.pode_ser_seguradora_corretora_cambio_fornecedor,
    ativo_empresa: f.ativo_fornecedor,
    criado_em_empresa: f.criado_em_fornecedor,
    atualizado_em_empresa: f.atualizado_em_fornecedor,
  }
}

function mockFetchPorSuid(suidsEmpresa: Record<string, ReturnType<typeof empresaBR>>) {
  fetchMock.mockImplementation((url: string) => {
    const u = String(url)
    if (u.includes('/api/v1/empresas/')) {
      const suid = decodeURIComponent(u.split('/api/v1/empresas/')[1] ?? '')
      const fixture = suidsEmpresa[suid]
      if (fixture) return Promise.resolve(jsonResp(empresaCadastrosFromFornecedor(fixture)))
      return Promise.resolve(new Response('not found', { status: 404 }))
    }
    if (u.includes('/api/v1/fornecedores/')) {
      const suid = decodeURIComponent(u.split('/api/v1/fornecedores/')[1] ?? '')
      const fixture = suidsEmpresa[suid]
      if (fixture) return Promise.resolve(jsonResp(fixture))
      return Promise.resolve(new Response('not found', { status: 404 }))
    }
    return Promise.resolve(new Response('not found', { status: 404 }))
  })
}

function jsonResp(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

const ctx = { id_organizacao: 'org-test', correlation_id: 'corr-123' }

// ── Suite: cadastrosClient ──────────────────────────────────────────────────

describe('buscarIdentidadeComexPorSuid', () => {
  beforeEach(() => fetchMock.mockReset())

  it('200 → retorna Empresa parseada via GET /empresas', async () => {
    mockFetchPorSuid({ 'BR-ACME-00001': empresaBR('BR-ACME-00001') })
    const identidade = await buscarIdentidadeComexPorSuid('BR-ACME-00001', ctx)
    expect('id_empresa' in identidade && identidade.id_empresa).toBe('BR-ACME-00001')
    expect('pais_empresa' in identidade && identidade.pais_empresa).toBe('BR')

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toMatch(/\/empresas\/BR-ACME-00001$/)
    expect(init?.method).toBe('GET')
    const h = init?.headers as Record<string, string>
    expect(h['x-internal-key']).toBe('test-internal-key')
    expect(h['x-organizacao-id']).toBe('org-test')
    expect(h['x-correlation-id']).toBe('corr-123')
  })

  it('404 → AppError(400) "Empresa nao encontrada"', async () => {
    fetchMock.mockResolvedValue(new Response('not found', { status: 404 }))
    try {
      await buscarIdentidadeComexPorSuid('BR-XX-00099', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect(err).toBeInstanceOf(AppError)
      expect((err as AppError).statusCode).toBe(400)
      expect((err as AppError).message).toMatch(/Identidade COMEX nao encontrada no Cadastros/)
    }
  })

  it('500 → AppError(503)', async () => {
    fetchMock.mockResolvedValueOnce(new Response('kaboom', { status: 500 }))
    try {
      await buscarIdentidadeComexPorSuid('BR-ACME-00001', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(503)
    }
  })

  it('falha de rede → AppError(503)', async () => {
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED'))
    try {
      await buscarIdentidadeComexPorSuid('BR-ACME-00001', ctx)
      expect.fail('deveria ter lançado')
    } catch (err) {
      expect((err as AppError).statusCode).toBe(503)
      expect((err as AppError).message).toMatch(/indisponivel|indispon/i)
    }
  })
})

describe('buscarIdentidadesComexPorSuids', () => {
  beforeEach(() => fetchMock.mockReset())

  it('deduplica SUIDs e retorna Map', async () => {
    mockFetchPorSuid({
      'BR-ACME-00001': empresaBR('BR-ACME-00001'),
      'US-BUYER-00001': empresaUS('US-BUYER-00001'),
    })

    const mapa = await buscarIdentidadesComexPorSuids(
      ['BR-ACME-00001', 'BR-ACME-00001', 'US-BUYER-00001'],
      ctx,
    )
    expect(fetchMock).toHaveBeenCalledTimes(2) // dedup aplicado
    expect(mapa.size).toBe(2)
    const br = mapa.get('BR-ACME-00001')
    const us = mapa.get('US-BUYER-00001')
    expect(br && 'pais_empresa' in br ? br.pais_empresa : (br as { pais_fornecedor: string }).pais_fornecedor).toBe('BR')
    expect(us && 'pais_fornecedor' in us ? us.pais_fornecedor : (us as { pais_empresa: string }).pais_empresa).toBe('US')
  })

  it('lista vazia → Map vazio sem tocar rede', async () => {
    const mapa = await buscarIdentidadesComexPorSuids([], ctx)
    expect(mapa.size).toBe(0)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('qualquer SUID com erro propaga (sem engolir)', async () => {
    mockFetchPorSuid({ 'BR-ACME-00001': empresaBR('BR-ACME-00001') })

    await expect(
      buscarIdentidadesComexPorSuids(['BR-ACME-00001', 'BR-MISSING-00001'], ctx),
    ).rejects.toThrow(/Identidade COMEX nao encontrada/)
  })
})

// ── Suite: montarSnapshotEmpresa ────────────────────────────────────────────

describe('montarSnapshotIdentidadeComex', () => {
  it('BR → documento = CNPJ, cnpj_raiz = 8 primeiros dígitos', () => {
    const snap = montarSnapshotIdentidadeComex(
      empresaCadastrosFromFornecedor(empresaBR('BR-ACME-00001', '12.345.678/0001-99')),
      'exportador',
      'org-test',
      'ws-test',
    )
    expect(snap.suid_empresa).toBe('BR-ACME-00001')
    expect(snap.nome_empresa).toBe('ACME Importadora')
    expect(snap.tipo_documento).toBe('CNPJ')
    expect(snap.documento_principal).toBe('12.345.678/0001-99')
    expect(snap.cnpj_raiz).toBe('12345678')
    expect(snap.papel).toBe('exportador')
    expect(snap.motivo_congelamento).toBe('emissao')
    expect(snap.id_organizacao).toBe('org-test')
    expect(snap.id_workspace).toBe('ws-test')
  })

  it('estrangeira (US) → documento = TIN, cnpj_raiz = null', () => {
    const snap = montarSnapshotIdentidadeComex(
      empresaCadastrosFromFornecedor(empresaUS('US-BUYER-00001')),
      'importador',
      'org-test',
    )
    expect(snap.tipo_documento).toBe('TIN')
    expect(snap.documento_principal).toBe('US-EIN-123456789')
    expect(snap.cnpj_raiz).toBeNull()
    expect(snap.endereco_pais).toBe('US')
  })

  it('fornecedor sem documento válido → snapshot com identidade, documento null', () => {
    const semDoc = { ...empresaBR('BR-X-00001'), cnpj_fornecedor: null }
    const snap = montarSnapshotIdentidadeComex(
      empresaCadastrosFromFornecedor(semDoc),
      'exportador',
      'org',
    )
    expect(snap.suid_empresa).toBe('BR-X-00001')
    expect(snap.nome_empresa).toBe('ACME Importadora')
    expect(snap.documento_principal).toBeNull()
    expect(snap.tipo_documento).toBeNull()
    expect(snap.cnpj_raiz).toBeNull()
  })

  it('empresa sem id_empresa → lança erro', () => {
    const semId = { ...empresaCadastrosFromFornecedor(empresaBR('BR-X-00001')), id_empresa: '' }
    expect(() => montarSnapshotIdentidadeComex(semId, 'exportador', 'org')).toThrow(
      /Empresa incompleto para snapshot/,
    )
  })
})
