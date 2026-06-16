import { describe, expect, it } from 'vitest'
import {
  resolverEmailsDisparoBidFrete,
  resolverWhatsappsDisparoBidFrete,
} from '../../../servicos-global/produto/bid-frete-internacional/server/src/services/resolver-contatos-disparo-bid-frete-internacional'

const espelhoBase = {
  id_fornecedor_bid_frete_internacional: 'BR-ACME-00001',
  email_fornecedor_bid_frete_internacional: 'espelho@bid.com',
  whatsapp_fornecedor_bid_frete_internacional: '+5511888888888',
}

describe('resolver-contatos-disparo-bid-frete-internacional', () => {
  it('prioriza todos os e-mails do Cadastros (contatos_fornecedor)', () => {
    expect(
      resolverEmailsDisparoBidFrete(espelhoBase, {
        contatos_fornecedor: [
          {
            tipo_canal_fornecedor_contato: 'EMAIL',
            valor_fornecedor_contato: 'sec@x.com',
            principal_fornecedor_contato: false,
            ordem_fornecedor_contato: 1,
          },
          {
            tipo_canal_fornecedor_contato: 'EMAIL',
            valor_fornecedor_contato: 'Pri@X.com',
            principal_fornecedor_contato: true,
            ordem_fornecedor_contato: 0,
          },
        ],
      }),
    ).toEqual(['pri@x.com', 'sec@x.com'])
  })

  it('fallback para espelho BID quando Cadastros indisponível', () => {
    expect(resolverEmailsDisparoBidFrete(espelhoBase, null)).toEqual(['espelho@bid.com'])
    expect(resolverWhatsappsDisparoBidFrete(espelhoBase, null)).toEqual(['+5511888888888'])
  })

  it('ignora placeholder interno do espelho BID', () => {
    expect(
      resolverEmailsDisparoBidFrete(
        {
          ...espelhoBase,
          email_fornecedor_bid_frete_internacional: 'cadastros+BR-ACME-00001@interno.gravity.local',
        },
        null,
      ),
    ).toEqual([])
  })

  it('lista todos os WhatsApps do Cadastros', () => {
    expect(
      resolverWhatsappsDisparoBidFrete(espelhoBase, {
        contatos_fornecedor: [
          {
            tipo_canal_fornecedor_contato: 'WHATSAPP',
            valor_fornecedor_contato: '+5511999999999',
            principal_fornecedor_contato: true,
            ordem_fornecedor_contato: 0,
          },
          {
            tipo_canal_fornecedor_contato: 'WHATSAPP',
            valor_fornecedor_contato: '+5511777777777',
            principal_fornecedor_contato: false,
            ordem_fornecedor_contato: 1,
          },
        ],
      }),
    ).toEqual(['+5511999999999', '+5511777777777'])
  })
})
