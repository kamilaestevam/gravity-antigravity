import { describe, expect, it } from 'vitest'
import { fornecedorSchema } from '../../../servicos-global/cadastros/shared/schemas/fornecedor.schema.js'

describe('fornecedorSchema — contrato API Cadastros', () => {
  it('aceita resposta POST com email_fornecedor e contatos_fornecedor', () => {
    const raw = {
      id_fornecedor: 'BR-TEST-00001',
      id_organizacao: 'org_test',
      nome_fornecedor: 'TEST',
      cnpj_fornecedor: null,
      tin_fornecedor: null,
      pais_fornecedor: 'BR',
      estado_provincia_fornecedor: null,
      cidade_fornecedor: null,
      endereco_fornecedor: null,
      cep_zipcode_fornecedor: null,
      email_fornecedor: null,
      telefone_fornecedor: null,
      whatsapp_fornecedor: null,
      contatos_fornecedor: [],
      pode_ser_importador_fornecedor: false,
      pode_ser_exportador_fornecedor: false,
      pode_ser_fabricante_fornecedor: false,
      pode_ser_agente_fornecedor: true,
      pode_ser_despachante_fornecedor: false,
      pode_ser_armador_fornecedor: false,
      pode_ser_armazem_alfandegado_fornecedor: false,
      pode_ser_transportadora_rodoviaria_nacional_fornecedor: false,
      pode_ser_cia_aerea_fornecedor: false,
      pode_ser_transportadora_rodoviaria_internacional_fornecedor: false,
      pode_ser_seguradora_internacional_fornecedor: false,
      pode_ser_seguradora_corretora_cambio_fornecedor: false,
      pode_ser_banco_fornecedor: false,
      pode_ser_armazem_nacional_fornecedor: false,
      ativo_fornecedor: true,
      criado_em_fornecedor: '2026-06-16T11:02:17.514Z',
      atualizado_em_fornecedor: '2026-06-16T11:02:17.514Z',
    }

    expect(fornecedorSchema.safeParse(raw).success).toBe(true)
  })
})
