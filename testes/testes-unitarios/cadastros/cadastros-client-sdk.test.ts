// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { criarCadastrosClient } from '../../../servicos-global/cadastros/client/src/index.js'

function fornecedorJson() {
  return {
    id_fornecedor: 'forn-sdk-001',
    id_organizacao: 'org-sdk',
    nome_fornecedor: 'Parceiro SDK',
    cnpj_fornecedor: '12.345.678/0001-99',
    tin_fornecedor: null,
    pais_fornecedor: 'BR',
    estado_provincia_fornecedor: 'SP',
    cidade_fornecedor: 'Sao Paulo',
    endereco_fornecedor: null,
    cep_zipcode_fornecedor: null,
    email_principal_fornecedor: null,
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
    criado_em_fornecedor: '2026-05-01T12:00:00.000Z',
    atualizado_em_fornecedor: '2026-05-01T12:00:00.000Z',
  }
}

describe('criarCadastrosClient — fornecedorSchema em rotas /fornecedores', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
  })

  it('empresas.obterDaOrganizacao valida resposta com empresaSchema', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          id_empresa: 'BR-ORG-001',
          id_organizacao: 'org-sdk',
          nome_empresa: 'Org SDK',
          cnpj_empresa: '12.345.678/0001-99',
          tin_empresa: null,
          pais_empresa: 'BR',
          estado_provincia_empresa: null,
          cidade_empresa: null,
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
        }),
    })

    const client = criarCadastrosClient({
      baseUrl: 'http://cadastros.test',
      internalKey: 'chave-interna',
      fetchImpl: fetchMock as typeof fetch,
    })

    const empresa = await client.empresas.obterDaOrganizacao('org-sdk')
    expect(empresa.id_empresa).toBe('BR-ORG-001')
    expect(fetchMock).toHaveBeenCalledWith(
      'http://cadastros.test/api/v1/empresas/da-organizacao',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          'x-internal-key': 'chave-interna',
          'x-organizacao-id': 'org-sdk',
        }),
      }),
    )
  })

  it('buscarPorSuid falha ruidoso se API retornar shape empresa legado', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          id_empresa: 'emp-001',
          nome_empresa: 'Legado',
          id_organizacao: 'org-sdk',
        }),
    })

    const client = criarCadastrosClient({
      baseUrl: 'http://cadastros.test',
      internalKey: 'chave-interna',
      fetchImpl: fetchMock as typeof fetch,
    })

    await expect(client.fornecedores.buscarPorSuid('emp-001', 'org-sdk')).rejects.toThrow()
  })

  it('buscarPorSuid usa encodeURIComponent no SUID', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify(fornecedorJson()),
    })

    const client = criarCadastrosClient({
      baseUrl: 'http://cadastros.test',
      internalKey: 'chave-interna',
      fetchImpl: fetchMock as typeof fetch,
    })

    await client.fornecedores.buscarPorSuid('BR/001', 'org-sdk')

    expect(fetchMock.mock.calls[0][0]).toContain('/api/v1/fornecedores/BR%2F001')
  })
})
