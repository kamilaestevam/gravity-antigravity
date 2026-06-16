import { describe, expect, it } from 'vitest'
import {
  contatosFornecedorParaListas,
  montarContatosFornecedorPayload,
  resolverEmailPrincipalFornecedor,
} from '../../../servicos-global/cadastros/shared/schemas/fornecedor-contato.schema.js'

describe('fornecedor-contato.schema', () => {
  it('monta contatos com principal no primeiro de cada canal', () => {
    const contatos = montarContatosFornecedorPayload({
      emails: ['a@b.com', 'b@c.com'],
      telefones: ['(11) 1111-1111'],
      whatsapps: ['+5511999999999'],
    })
    expect(contatos).toHaveLength(4)
    expect(contatos.filter((c) => c.tipo_canal_fornecedor_contato === 'EMAIL')).toEqual([
      expect.objectContaining({ valor_fornecedor_contato: 'a@b.com', principal_fornecedor_contato: true, ordem_fornecedor_contato: 0 }),
      expect.objectContaining({ valor_fornecedor_contato: 'b@c.com', principal_fornecedor_contato: false, ordem_fornecedor_contato: 1 }),
    ])
  })

  it('converte contatos da API para listas do formulário', () => {
    const listas = contatosFornecedorParaListas(
      [
        {
          tipo_canal_fornecedor_contato: 'EMAIL',
          valor_fornecedor_contato: 'sec@x.com',
          principal_fornecedor_contato: false,
          ordem_fornecedor_contato: 1,
        },
        {
          tipo_canal_fornecedor_contato: 'EMAIL',
          valor_fornecedor_contato: 'pri@x.com',
          principal_fornecedor_contato: true,
          ordem_fornecedor_contato: 0,
        },
      ],
      {},
    )
    expect(listas.emails).toEqual(['pri@x.com', 'sec@x.com'])
  })

  it('usa fallback escalar quando contatos ausentes', () => {
    const listas = contatosFornecedorParaListas(undefined, {
      email_fornecedor: ' leg@x.com ',
      telefone_fornecedor: null,
      whatsapp_fornecedor: '+5511888888888',
    })
    expect(listas.emails).toEqual(['leg@x.com'])
    expect(listas.telefones).toEqual([])
    expect(listas.whatsapps).toEqual(['+5511888888888'])
  })

  it('resolve e-mail principal para espelho BID', () => {
    expect(
      resolverEmailPrincipalFornecedor(
        [
          {
            tipo_canal_fornecedor_contato: 'EMAIL',
            valor_fornecedor_contato: 'sec@x.com',
            principal_fornecedor_contato: false,
            ordem_fornecedor_contato: 1,
          },
          {
            tipo_canal_fornecedor_contato: 'EMAIL',
            valor_fornecedor_contato: 'pri@x.com',
            principal_fornecedor_contato: true,
            ordem_fornecedor_contato: 0,
          },
        ],
        null,
      ),
    ).toBe('pri@x.com')
  })
})
