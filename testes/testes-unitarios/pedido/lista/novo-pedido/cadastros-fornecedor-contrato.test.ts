// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buscarEmpresaPorSuid } from '../../../../../servicos-global/produto/processos-core/src/services/cadastrosClient.js'

/**
 * Regressão 2026-05-26 — pedido manual falhava ao parsear fornecedor com empresaSchema.
 */

const CTX = { id_organizacao: 'org-novo-pedido', correlation_id: 'corr-test' }

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

/** Shape legado de Empresa — não passa em fornecedorSchema */
function payloadShapeEmpresaLegado() {
  return {
    id_empresa: 'emp-001',
    id_organizacao: 'org-novo-pedido',
    nome_empresa: 'ACME Importadora',
    cnpj_empresa: '12.345.678/0001-99',
    pais_empresa: 'BR',
    cep_unidade_empresa: '01000-000',
  }
}

describe('buscarEmpresaPorSuid — contrato fornecedorSchema (novo pedido manual)', () => {
  beforeEach(() => {
    vi.stubEnv('CHAVE_INTERNA_SERVICO', 'chave-teste-s2s')
    vi.stubEnv('CADASTROS_SERVICE_URL', 'http://cadastros.test')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it('U-NPM-01: resposta fornecedor válida parseia e retorna Fornecedor', async () => {
    const payload = fornecedorValido()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payload,
      }),
    )

    const resultado = await buscarEmpresaPorSuid('suid-acme', CTX)

    expect(resultado.id_fornecedor).toBe('forn-001')
    expect(resultado.pode_ser_importador_fornecedor).toBe(true)
    expect(fetch).toHaveBeenCalledWith(
      'http://cadastros.test/api/v1/fornecedores/suid-acme',
      expect.objectContaining({ method: 'GET' }),
    )
  })

  it('U-NPM-02: shape empresa legado falha no parse (ZodError)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => payloadShapeEmpresaLegado(),
      }),
    )

    await expect(buscarEmpresaPorSuid('suid-legado', CTX)).rejects.toThrow()
  })

  it('U-NPM-03: 404 Cadastros vira AppError 400', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({}),
      }),
    )

    await expect(buscarEmpresaPorSuid('suid-inexistente', CTX)).rejects.toMatchObject({
      statusCode: 400,
    })
  })
})
