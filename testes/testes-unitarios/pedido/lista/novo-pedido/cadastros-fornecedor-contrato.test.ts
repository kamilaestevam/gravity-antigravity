// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  buscarEmpresaCadastrosPorSuid,
  buscarFornecedorPorSuid,
  buscarIdentidadeComexPorSuid,
} from '../../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js'

const CTX = { id_organizacao: 'org-novo-pedido', correlation_id: 'corr-test' }

function empresaValida() {
  return {
    id_empresa: 'BR-ORG-00001',
    id_organizacao: 'org-novo-pedido',
    nome_empresa: 'Gravity Org',
    cnpj_empresa: '12.345.678/0001-99',
    tin_empresa: null,
    pais_empresa: 'BR',
    estado_provincia_empresa: 'SP',
    cidade_empresa: 'Sao Paulo',
    endereco_empresa: null,
    cep_zipcode_empresa: null,
    email_principal_empresa: null,
    telefone_principal_empresa: null,
    whatsapp_principal_empresa: null,
    pode_ser_importador_empresa: true,
    pode_ser_exportador_empresa: false,
    pode_ser_fabricante_empresa: false,
    pode_ser_agente_empresa: false,
    pode_ser_despachante_empresa: false,
    pode_ser_armador_empresa: false,
    pode_ser_cia_aerea_empresa: false,
    pode_ser_transportadora_rodoviaria_nacional_empresa: false,
    pode_ser_transportadora_rodoviaria_internacional_empresa: false,
    pode_ser_armazem_alfandegado_empresa: false,
    pode_ser_armazem_nacional_empresa: false,
    pode_ser_banco_empresa: false,
    pode_ser_seguradora_internacional_empresa: false,
    pode_ser_seguradora_corretora_cambio_empresa: false,
    ativo_empresa: true,
    criado_em_empresa: '2026-05-01T12:00:00.000Z',
    atualizado_em_empresa: '2026-05-01T12:00:00.000Z',
  }
}

function fornecedorValido() {
  return {
    id_fornecedor: 'forn-001',
    id_organizacao: 'org-novo-pedido',
    nome_fornecedor: 'ACME Importadora',
    cnpj_fornecedor: '12.345.678/0001-99',
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

describe('cadastrosClient — SSOT empresa vs fornecedor', () => {
  beforeEach(() => {
    vi.stubEnv('CHAVE_INTERNA_SERVICO', 'chave-teste-s2s')
    vi.stubEnv('CADASTROS_SERVICE_URL', 'http://cadastros.test')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('buscarEmpresaCadastrosPorSuid usa apenas GET /empresas', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => empresaValida(),
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await buscarEmpresaCadastrosPorSuid('BR-ORG-00001', CTX)
    expect(resultado.id_empresa).toBe('BR-ORG-00001')
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/empresas/BR-ORG-00001')
  })

  it('buscarFornecedorPorSuid usa apenas GET /fornecedores', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fornecedorValido(),
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await buscarFornecedorPorSuid('forn-001', CTX)
    expect(resultado.id_fornecedor).toBe('forn-001')
    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/fornecedores/forn-001')
  })

  it('buscarIdentidadeComexPorSuid tenta empresa antes de fornecedor', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      if (url.includes('/empresas/')) {
        return Promise.resolve({ ok: false, status: 404, json: async () => ({}) })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => fornecedorValido(),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await buscarIdentidadeComexPorSuid('forn-001', CTX)
    expect('id_fornecedor' in resultado).toBe(true)
    expect(fetchMock.mock.calls[0][0]).toContain('/empresas/')
    expect(fetchMock.mock.calls[1][0]).toContain('/fornecedores/')
  })
})
