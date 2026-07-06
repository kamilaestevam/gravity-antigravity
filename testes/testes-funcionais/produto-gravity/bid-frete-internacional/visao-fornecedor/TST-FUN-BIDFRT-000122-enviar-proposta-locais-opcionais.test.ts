/// <reference types="vitest/globals" />
// @vitest-environment node
// TST-FUN-BIDFRT-000122 — enviar proposta persiste locais em observacoes quando cotação tem opcionais

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/services/integracoes-tenant.js',
  () => ({
    notificacoesIntegration: { fornecedorRespondeu: vi.fn(), aguardandoAprovacao: vi.fn() },
    historicoIntegration: { fornecedorRespondeu: vi.fn() },
    atividadesIntegration: { aguardandoAprovacao: vi.fn() },
  }),
)

vi.mock(
  '../../../../../servicos-global/produto/bid-frete-internacional/server/src/lib/sincronizar-status-cotacao-apos-resposta-fornecedor-bid-frete-internacional.js',
  () => ({
    sincronizarStatusCotacaoAposRespostaFornecedorBidFreteInternacional: vi.fn(async () => 'EM_COTACAO'),
  }),
)

import { enviarPropostaDisparoBidFreteInternacional } from '../../../../../servicos-global/produto/bid-frete-internacional/server/src/services/enviar-proposta-disparo-bid-frete-internacional.js'

const dadosPropostaBase = {
  moeda_proposta_bid_frete_internacional: 'USD',
  valor_frete_proposta_bid_frete_internacional: 1000,
  taxas_origem_proposta_bid_frete_internacional: 0,
  taxas_destino_proposta_bid_frete_internacional: 0,
  dias_transito_proposta_bid_frete_internacional: 15,
  dias_free_time_proposta_bid_frete_internacional: 7,
  dias_prazo_pagamento_proposta_bid_frete_internacional: 30,
  transbordos_proposta_bid_frete_internacional: 0,
  validade_proposta_bid_frete_internacional: '2026-12-31T23:59:59.000Z',
}

const cotacaoComOpcionais = {
  id_cotacao_bid_frete_internacional: 'cot_1',
  id_workspace: 'ws_1',
  id_bid_bid_frete_internacional: null,
  id_usuario: 'usr_1',
  numero_cotacao_bid_frete_internacional: 'COT-TEST',
  status_cotacao_bid_frete_internacional: 'ENVIADA_FORNECEDORES',
  data_limite_resposta_cotacao_bid_frete_internacional: new Date('2027-01-01'),
  modalidade_cotacao_bid_frete_internacional: 'FCL',
  incluir_armazenagem_cotacao_bid_frete_internacional: false,
  modal_cotacao_bid_frete_internacional: 'MARITIMO',
  porto_origem_cotacao_bid_frete_internacional: 'BRSSZ',
  porto_destino_cotacao_bid_frete_internacional: 'NLRTM',
  aeroporto_origem_cotacao_bid_frete_internacional: null,
  aeroporto_destino_cotacao_bid_frete_internacional: null,
  habilitar_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: true,
  codigos_opcao_porto_aeroporto_origem_cotacao_bid_frete_internacional: ['BRPNG'],
  habilitar_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: false,
  codigos_opcao_porto_aeroporto_destino_cotacao_bid_frete_internacional: null,
}

function criarMockPrisma() {
  let observacoesGravadas: string | null = null
  const prisma = {
    disparoCotacaoBidFreteInternacional: {
      findFirst: vi.fn(async () => ({
        id_disparo_cotacao_bid_frete_internacional: 'disp_1',
        id_organizacao: 'org_1',
        id_cotacao_bid_frete_internacional: 'cot_1',
        id_fornecedor_bid_frete_internacional: 'forn_1',
        status_disparo_cotacao_bid_frete_internacional: 'ENVIADO',
        proposta: null,
        cotacao: cotacaoComOpcionais,
      })),
      update: vi.fn(async () => ({})),
      count: vi.fn(async () => 1),
    },
    propostaBidFreteInternacional: {
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        observacoesGravadas = data.observacoes_proposta_bid_frete_internacional as string | null
        return {
          id_proposta_bid_frete_internacional: 'prop_1',
          ...data,
        }
      }),
      update: vi.fn(),
    },
    taxaOrigemBidFreteInternacional: { deleteMany: vi.fn() },
    taxaDestinoBidFreteInternacional: { deleteMany: vi.fn() },
    cotacaoBidFreteInternacional: { update: vi.fn(async () => ({})) },
    _observacoesGravadas: () => observacoesGravadas,
  }

  return prisma
}

describe('TST-FUN-BIDFRT-000122 enviar proposta locais opcionais', () => {
  it('rejeita proposta sem local quando cotação exige seleção', async () => {
    const prisma = criarMockPrisma()
    await expect(
      enviarPropostaDisparoBidFreteInternacional(
        prisma as never,
        'disp_1',
        { ...dadosPropostaBase, observacoes_proposta_bid_frete_internacional: 'Nota livre' },
        { via_email_proposta_bid_frete_internacional: true },
      ),
    ).rejects.toThrow(/origem utilizado/i)
  })

  it('persiste marcador de local escolhido em observacoes_proposta', async () => {
    const prisma = criarMockPrisma()
    await enviarPropostaDisparoBidFreteInternacional(
      prisma as never,
      'disp_1',
      {
        ...dadosPropostaBase,
        codigo_porto_aeroporto_origem_proposta_bid_frete_internacional: 'BRPNG',
        observacoes_proposta_bid_frete_internacional: 'Nota livre',
      },
      { via_email_proposta_bid_frete_internacional: true },
    )
    const obs = (prisma as ReturnType<typeof criarMockPrisma> & { _observacoesGravadas: () => string | null })._observacoesGravadas()
    expect(obs).toContain('__GRAVITY_BID_LOCAIS__')
    expect(obs).toContain('BRPNG')
    expect(obs).toContain('Nota livre')
  })
})
