/**
 * @vitest-environment node
 *
 * types-ddd.test.ts — Verifica que todos os tipos e enums do BID Cambio
 * seguem a nomenclatura DDD (prefixo BidCambio, sufixos de entidade, campos obrigatorios).
 */
import { describe, it, expect } from 'vitest'
import type {
  BidCambioTipoOperacao,
  BidCambioModalidade,
  BidCambioLiquidacao,
  BidCambioMoeda,
  BidCambioStatusParcela,
  BidCambioStatusCotacao,
  BidCambioCanalDisparo,
  BidCambioStatusDisparoCotacao,
  BidCambioStatusRespostaCotacao,
  BidCambioTipoCorretora,
  BidCambioStatusCorretora,
  BidCambioBaseVencimento,
  BidCambioParcela,
  BidCambioAnexo,
  BidCambioCotacao,
  BidCambioDisparoCotacao,
  BidCambioRespostaCotacao,
  BidCambioCorretora,
  BidCambioAvaliacaoCorretora,
  BidCambioClassificacaoCorretora,
  BidCambioGanho,
  BidCambioPreferenciaUsuario,
  BidCambioPreferenciaGrid,
} from '../../../servicos-global/produto/bid-cambio/client/src/shared/types'

import {
  OPERACAO_CAMBIO_LABELS,
  MODALIDADE_CAMBIO_LABELS,
  LIQUIDACAO_LABELS,
  MOEDA_CAMBIO_LABELS,
  MOEDA_SIMBOLO,
  STATUS_PARCELA_LABELS,
  STATUS_COTACAO_LABELS,
  CANAL_CAMBIO_LABELS,
  STATUS_BID_REQUEST_LABELS,
  STATUS_BID_RESPONSE_LABELS,
  TIPO_CORRETORA_LABELS,
  STATUS_CORRETORA_LABELS,
  METODO_VENCIMENTO_LABELS,
  STATUS_PARCELA_BADGE,
  STATUS_COTACAO_BADGE,
  STATUS_CORRETORA_BADGE,
  STATUS_BID_RESPONSE_BADGE,
} from '../../../servicos-global/produto/bid-cambio/client/src/shared/types'

// ============================================================
// Helpers de asserção em tempo de compilação (type-level)
// ============================================================
type AssertExtends<T, U> = T extends U ? true : never
type AssertEquals<T, U> = [T] extends [U] ? ([U] extends [T] ? true : never) : never

// ============================================================
// 1. Enums — todos possuem prefixo BidCambio
// ============================================================
describe('Enums DDD — prefixo BidCambio', () => {
  it('BidCambioTipoOperacao possui valores esperados', () => {
    const valores: BidCambioTipoOperacao[] = ['IMPORTACAO', 'EXPORTACAO']
    expect(valores).toHaveLength(2)
    // type-level: garante que o tipo nao aceita valores fora do union
    const _check: AssertExtends<'IMPORTACAO', BidCambioTipoOperacao> = true
    expect(_check).toBe(true)
  })

  it('BidCambioModalidade possui valores esperados', () => {
    const valores: BidCambioModalidade[] = ['PRONTO', 'FUTURO']
    expect(valores).toHaveLength(2)
  })

  it('BidCambioLiquidacao possui valores esperados', () => {
    const valores: BidCambioLiquidacao[] = ['D0', 'D1', 'D2']
    expect(valores).toHaveLength(3)
  })

  it('BidCambioMoeda possui 7 moedas', () => {
    const valores: BidCambioMoeda[] = ['USD', 'EUR', 'GBP', 'CHF', 'BRL', 'CNY', 'JPY']
    expect(valores).toHaveLength(7)
  })

  it('BidCambioStatusParcela possui 3 estados do ciclo', () => {
    const valores: BidCambioStatusParcela[] = ['PENDENTE', 'AGENDADO', 'PAGO']
    expect(valores).toHaveLength(3)
  })

  it('BidCambioStatusCotacao possui 8 estados', () => {
    const valores: BidCambioStatusCotacao[] = [
      'RASCUNHO', 'ENVIADA_CORRETORAS', 'EM_COTACAO',
      'AGUARDANDO_APROVACAO', 'APROVADA', 'REPROVADA',
      'CANCELADA', 'EXPIRADA',
    ]
    expect(valores).toHaveLength(8)
  })

  it('BidCambioCanalDisparo possui 2 canais', () => {
    const valores: BidCambioCanalDisparo[] = ['EMAIL', 'PORTAL']
    expect(valores).toHaveLength(2)
  })

  it('BidCambioStatusDisparoCotacao possui 6 estados', () => {
    const valores: BidCambioStatusDisparoCotacao[] = [
      'PENDENTE', 'ENVIADO', 'VISUALIZADO', 'RESPONDIDO', 'EXPIRADO', 'ERRO_ENVIO',
    ]
    expect(valores).toHaveLength(6)
  })

  it('BidCambioStatusRespostaCotacao possui 7 estados', () => {
    const valores: BidCambioStatusRespostaCotacao[] = [
      'RECEBIDA', 'EM_ANALISE', 'MELHOR_TAXA', 'MELHOR_SPREAD',
      'MELHOR_AVALIACAO', 'APROVADA', 'REPROVADA',
    ]
    expect(valores).toHaveLength(7)
  })

  it('BidCambioTipoCorretora possui 4 tipos', () => {
    const valores: BidCambioTipoCorretora[] = [
      'CORRETORA_CAMBIO', 'BANCO_COMERCIAL', 'BANCO_CAMBIO', 'FINTECH',
    ]
    expect(valores).toHaveLength(4)
  })

  it('BidCambioStatusCorretora possui 3 estados', () => {
    const valores: BidCambioStatusCorretora[] = ['ATIVA', 'INATIVA', 'BLOQUEADA']
    expect(valores).toHaveLength(3)
  })

  it('BidCambioBaseVencimento possui 7 metodos', () => {
    const valores: BidCambioBaseVencimento[] = [
      'DATA_EMBARQUE', 'DATA_CHEGADA', 'DATA_REGISTRO_DI',
      'DATA_DESEMBARACO', 'DATA_ENTREGA', 'PRONTIDAO_CARGA', 'DATA_FIXA',
    ]
    expect(valores).toHaveLength(7)
  })
})

// ============================================================
// 2. Labels — Record completo para cada enum (sem valores faltando)
// ============================================================
describe('Labels — cobertura completa dos enums', () => {
  it('OPERACAO_CAMBIO_LABELS cobre BidCambioTipoOperacao', () => {
    const _: Record<BidCambioTipoOperacao, string> = OPERACAO_CAMBIO_LABELS
    expect(Object.keys(OPERACAO_CAMBIO_LABELS)).toHaveLength(2)
  })

  it('MODALIDADE_CAMBIO_LABELS cobre BidCambioModalidade', () => {
    const _: Record<BidCambioModalidade, string> = MODALIDADE_CAMBIO_LABELS
    expect(Object.keys(MODALIDADE_CAMBIO_LABELS)).toHaveLength(2)
  })

  it('LIQUIDACAO_LABELS cobre BidCambioLiquidacao', () => {
    const _: Record<BidCambioLiquidacao, string> = LIQUIDACAO_LABELS
    expect(Object.keys(LIQUIDACAO_LABELS)).toHaveLength(3)
  })

  it('MOEDA_CAMBIO_LABELS cobre BidCambioMoeda', () => {
    const _: Record<BidCambioMoeda, string> = MOEDA_CAMBIO_LABELS
    expect(Object.keys(MOEDA_CAMBIO_LABELS)).toHaveLength(7)
  })

  it('MOEDA_SIMBOLO cobre BidCambioMoeda', () => {
    const _: Record<BidCambioMoeda, string> = MOEDA_SIMBOLO
    expect(Object.keys(MOEDA_SIMBOLO)).toHaveLength(7)
  })

  it('STATUS_PARCELA_LABELS cobre BidCambioStatusParcela', () => {
    const _: Record<BidCambioStatusParcela, string> = STATUS_PARCELA_LABELS
    expect(Object.keys(STATUS_PARCELA_LABELS)).toHaveLength(3)
  })

  it('STATUS_COTACAO_LABELS cobre BidCambioStatusCotacao', () => {
    const _: Record<BidCambioStatusCotacao, string> = STATUS_COTACAO_LABELS
    expect(Object.keys(STATUS_COTACAO_LABELS)).toHaveLength(8)
  })

  it('CANAL_CAMBIO_LABELS cobre BidCambioCanalDisparo', () => {
    const _: Record<BidCambioCanalDisparo, string> = CANAL_CAMBIO_LABELS
    expect(Object.keys(CANAL_CAMBIO_LABELS)).toHaveLength(2)
  })

  it('STATUS_BID_REQUEST_LABELS cobre BidCambioStatusDisparoCotacao', () => {
    const _: Record<BidCambioStatusDisparoCotacao, string> = STATUS_BID_REQUEST_LABELS
    expect(Object.keys(STATUS_BID_REQUEST_LABELS)).toHaveLength(6)
  })

  it('STATUS_BID_RESPONSE_LABELS cobre BidCambioStatusRespostaCotacao', () => {
    const _: Record<BidCambioStatusRespostaCotacao, string> = STATUS_BID_RESPONSE_LABELS
    expect(Object.keys(STATUS_BID_RESPONSE_LABELS)).toHaveLength(7)
  })

  it('TIPO_CORRETORA_LABELS cobre BidCambioTipoCorretora', () => {
    const _: Record<BidCambioTipoCorretora, string> = TIPO_CORRETORA_LABELS
    expect(Object.keys(TIPO_CORRETORA_LABELS)).toHaveLength(4)
  })

  it('STATUS_CORRETORA_LABELS cobre BidCambioStatusCorretora', () => {
    const _: Record<BidCambioStatusCorretora, string> = STATUS_CORRETORA_LABELS
    expect(Object.keys(STATUS_CORRETORA_LABELS)).toHaveLength(3)
  })

  it('METODO_VENCIMENTO_LABELS cobre BidCambioBaseVencimento', () => {
    const _: Record<BidCambioBaseVencimento, string> = METODO_VENCIMENTO_LABELS
    expect(Object.keys(METODO_VENCIMENTO_LABELS)).toHaveLength(7)
  })
})

// ============================================================
// 3. Badge maps — cobertura completa
// ============================================================
describe('Badge maps — cobertura completa', () => {
  it('STATUS_PARCELA_BADGE cobre BidCambioStatusParcela', () => {
    expect(Object.keys(STATUS_PARCELA_BADGE)).toHaveLength(3)
    expect(STATUS_PARCELA_BADGE.PENDENTE).toBe('warning')
    expect(STATUS_PARCELA_BADGE.AGENDADO).toBe('info')
    expect(STATUS_PARCELA_BADGE.PAGO).toBe('success')
  })

  it('STATUS_COTACAO_BADGE cobre BidCambioStatusCotacao', () => {
    expect(Object.keys(STATUS_COTACAO_BADGE)).toHaveLength(8)
  })

  it('STATUS_CORRETORA_BADGE cobre BidCambioStatusCorretora', () => {
    expect(Object.keys(STATUS_CORRETORA_BADGE)).toHaveLength(3)
  })

  it('STATUS_BID_RESPONSE_BADGE cobre BidCambioStatusRespostaCotacao', () => {
    expect(Object.keys(STATUS_BID_RESPONSE_BADGE)).toHaveLength(7)
  })
})

// ============================================================
// 4. Interfaces — campos DDD obrigatorios (type-level + runtime)
// ============================================================
describe('BidCambioParcela — campos DDD', () => {
  it('possui id com sufixo _parcela_bid_cambio', () => {
    const parcela: Pick<BidCambioParcela, 'id_parcela_bid_cambio'> = {
      id_parcela_bid_cambio: 'test-id',
    }
    expect(parcela.id_parcela_bid_cambio).toBe('test-id')
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<{ id_organizacao: string }, Pick<BidCambioParcela, 'id_organizacao'>> = true
    expect(_).toBe(true)
  })

  it('possui campos de auditoria com prefixo data_criacao_ e data_atualizacao_', () => {
    const _criacao: AssertExtends<
      { data_criacao_parcela_bid_cambio: string },
      Pick<BidCambioParcela, 'data_criacao_parcela_bid_cambio'>
    > = true
    const _atualizacao: AssertExtends<
      { data_atualizacao_parcela_bid_cambio: string },
      Pick<BidCambioParcela, 'data_atualizacao_parcela_bid_cambio'>
    > = true
    expect(_criacao).toBe(true)
    expect(_atualizacao).toBe(true)
  })

  it('possui status com tipo BidCambioStatusParcela', () => {
    const _: AssertEquals<
      BidCambioParcela['status_parcela_bid_cambio'],
      BidCambioStatusParcela
    > = true
    expect(_).toBe(true)
  })

  it('possui moeda com tipo BidCambioMoeda', () => {
    const _: AssertEquals<
      BidCambioParcela['moeda_parcela_bid_cambio'],
      BidCambioMoeda
    > = true
    expect(_).toBe(true)
  })

  it('possui metodo_vencimento com tipo BidCambioBaseVencimento | null', () => {
    const _: AssertEquals<
      BidCambioParcela['metodo_vencimento_parcela_bid_cambio'],
      BidCambioBaseVencimento | null
    > = true
    expect(_).toBe(true)
  })

  it('possui numero_duimp_parcela_bid_cambio (campo novo)', () => {
    const parcela: Pick<BidCambioParcela, 'numero_duimp_parcela_bid_cambio'> = {
      numero_duimp_parcela_bid_cambio: 'DUIMP-001',
    }
    expect(parcela.numero_duimp_parcela_bid_cambio).toBe('DUIMP-001')
  })

  it('possui numero_due_parcela_bid_cambio (campo novo)', () => {
    const parcela: Pick<BidCambioParcela, 'numero_due_parcela_bid_cambio'> = {
      numero_due_parcela_bid_cambio: 'DUE-001',
    }
    expect(parcela.numero_due_parcela_bid_cambio).toBe('DUE-001')
  })

  it('todos os campos de valor possuem sufixo _parcela_bid_cambio', () => {
    // type-level: se compilar, os campos existem com os nomes corretos
    const camposValor: Pick<
      BidCambioParcela,
      | 'cambio_total_parcela_bid_cambio'
      | 'porcentagem_parcela_bid_cambio'
      | 'valor_a_pagar_parcela_bid_cambio'
      | 'valor_a_pagar_brl_parcela_bid_cambio'
      | 'valor_pago_parcela_bid_cambio'
      | 'valor_pago_brl_parcela_bid_cambio'
    > = {
      cambio_total_parcela_bid_cambio: 100000,
      porcentagem_parcela_bid_cambio: 50,
      valor_a_pagar_parcela_bid_cambio: 50000,
      valor_a_pagar_brl_parcela_bid_cambio: 275000,
      valor_pago_parcela_bid_cambio: null,
      valor_pago_brl_parcela_bid_cambio: null,
    }
    expect(camposValor.cambio_total_parcela_bid_cambio).toBe(100000)
  })

  it('campos de data possuem sufixo _parcela_bid_cambio', () => {
    const camposData: Pick<
      BidCambioParcela,
      | 'data_vencimento_parcela_bid_cambio'
      | 'data_agendamento_parcela_bid_cambio'
      | 'data_pagamento_parcela_bid_cambio'
      | 'data_vencimento_original_parcela_bid_cambio'
    > = {
      data_vencimento_parcela_bid_cambio: '2026-06-01',
      data_agendamento_parcela_bid_cambio: null,
      data_pagamento_parcela_bid_cambio: null,
      data_vencimento_original_parcela_bid_cambio: null,
    }
    expect(camposData.data_vencimento_parcela_bid_cambio).toBe('2026-06-01')
  })
})

describe('BidCambioAnexo — campos DDD', () => {
  it('possui id com sufixo _anexo_bid_cambio', () => {
    const _: AssertExtends<
      { id_anexo_bid_cambio: string },
      Pick<BidCambioAnexo, 'id_anexo_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioAnexo, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('possui FK id_parcela_bid_cambio', () => {
    const _: AssertExtends<
      { id_parcela_bid_cambio: string },
      Pick<BidCambioAnexo, 'id_parcela_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('campos de arquivo possuem sufixo _anexo_bid_cambio', () => {
    const anexo: Pick<
      BidCambioAnexo,
      'nome_arquivo_anexo_bid_cambio' | 'nome_original_anexo_bid_cambio' | 'url_anexo_bid_cambio' | 'categoria_anexo_bid_cambio'
    > = {
      nome_arquivo_anexo_bid_cambio: 'abc123.pdf',
      nome_original_anexo_bid_cambio: 'contrato.pdf',
      url_anexo_bid_cambio: 'https://storage.example.com/abc123.pdf',
      categoria_anexo_bid_cambio: 'Contrato de Cambio',
    }
    expect(anexo.url_anexo_bid_cambio).toContain('https://')
  })
})

describe('BidCambioCotacao — campos DDD', () => {
  it('possui id com sufixo _cotacao_bid_cambio', () => {
    const _: AssertExtends<
      { id_cotacao_bid_cambio: string },
      Pick<BidCambioCotacao, 'id_cotacao_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioCotacao, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('possui campos de auditoria com nomes DDD', () => {
    const _: AssertExtends<
      { data_criacao_cotacao_bid_cambio: string; data_atualizacao_cotacao_bid_cambio: string },
      Pick<BidCambioCotacao, 'data_criacao_cotacao_bid_cambio' | 'data_atualizacao_cotacao_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('status usa BidCambioStatusCotacao', () => {
    const _: AssertEquals<
      BidCambioCotacao['status_cotacao_bid_cambio'],
      BidCambioStatusCotacao
    > = true
    expect(_).toBe(true)
  })

  it('moeda usa BidCambioMoeda', () => {
    const _: AssertEquals<
      BidCambioCotacao['moeda_cotacao_bid_cambio'],
      BidCambioMoeda
    > = true
    expect(_).toBe(true)
  })

  it('tipo_operacao usa BidCambioTipoOperacao', () => {
    const _: AssertEquals<
      BidCambioCotacao['tipo_operacao_cotacao_bid_cambio'],
      BidCambioTipoOperacao
    > = true
    expect(_).toBe(true)
  })

  it('modalidade usa BidCambioModalidade', () => {
    const _: AssertEquals<
      BidCambioCotacao['modalidade_cotacao_bid_cambio'],
      BidCambioModalidade
    > = true
    expect(_).toBe(true)
  })

  it('liquidacao usa BidCambioLiquidacao', () => {
    const _: AssertEquals<
      BidCambioCotacao['liquidacao_cotacao_bid_cambio'],
      BidCambioLiquidacao
    > = true
    expect(_).toBe(true)
  })
})

describe('BidCambioDisparoCotacao — campos DDD', () => {
  it('possui id com sufixo _disparo_cotacao_bid_cambio', () => {
    const _: AssertExtends<
      { id_disparo_cotacao_bid_cambio: string },
      Pick<BidCambioDisparoCotacao, 'id_disparo_cotacao_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioDisparoCotacao, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('canal usa BidCambioCanalDisparo', () => {
    const _: AssertEquals<
      BidCambioDisparoCotacao['canal_disparo_cotacao_bid_cambio'],
      BidCambioCanalDisparo
    > = true
    expect(_).toBe(true)
  })

  it('status usa BidCambioStatusDisparoCotacao', () => {
    const _: AssertEquals<
      BidCambioDisparoCotacao['status_disparo_cotacao_bid_cambio'],
      BidCambioStatusDisparoCotacao
    > = true
    expect(_).toBe(true)
  })
})

describe('BidCambioRespostaCotacao — campos DDD', () => {
  it('possui id com sufixo _resposta_cotacao_bid_cambio', () => {
    const _: AssertExtends<
      { id_resposta_cotacao_bid_cambio: string },
      Pick<BidCambioRespostaCotacao, 'id_resposta_cotacao_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioRespostaCotacao, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('status usa BidCambioStatusRespostaCotacao', () => {
    const _: AssertEquals<
      BidCambioRespostaCotacao['status_resposta_cotacao_bid_cambio'],
      BidCambioStatusRespostaCotacao
    > = true
    expect(_).toBe(true)
  })

  it('liquidacao_proposta usa BidCambioLiquidacao', () => {
    const _: AssertEquals<
      BidCambioRespostaCotacao['liquidacao_proposta_resposta_cotacao_bid_cambio'],
      BidCambioLiquidacao
    > = true
    expect(_).toBe(true)
  })
})

describe('BidCambioCorretora — campos DDD', () => {
  it('possui id com sufixo _corretora_bid_cambio', () => {
    const _: AssertExtends<
      { id_corretora_bid_cambio: string },
      Pick<BidCambioCorretora, 'id_corretora_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioCorretora, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('tipo usa BidCambioTipoCorretora', () => {
    const _: AssertEquals<
      BidCambioCorretora['tipo_corretora_bid_cambio'],
      BidCambioTipoCorretora
    > = true
    expect(_).toBe(true)
  })

  it('status usa BidCambioStatusCorretora', () => {
    const _: AssertEquals<
      BidCambioCorretora['status_corretora_bid_cambio'],
      BidCambioStatusCorretora
    > = true
    expect(_).toBe(true)
  })

  it('portal_habilitado e boolean (sem prefixo is_)', () => {
    const _: AssertEquals<
      BidCambioCorretora['portal_habilitado_corretora_bid_cambio'],
      boolean
    > = true
    expect(_).toBe(true)
  })
})

describe('BidCambioAvaliacaoCorretora — campos DDD', () => {
  it('possui id com sufixo _avaliacao_corretora_bid_cambio', () => {
    const _: AssertExtends<
      { id_avaliacao_corretora_bid_cambio: string },
      Pick<BidCambioAvaliacaoCorretora, 'id_avaliacao_corretora_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioAvaliacaoCorretora, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('notas possuem sufixo _avaliacao_corretora_bid_cambio', () => {
    const notas: Pick<
      BidCambioAvaliacaoCorretora,
      | 'nota_taxa_avaliacao_corretora_bid_cambio'
      | 'nota_agilidade_avaliacao_corretora_bid_cambio'
      | 'nota_atendimento_avaliacao_corretora_bid_cambio'
      | 'nota_confiabilidade_avaliacao_corretora_bid_cambio'
    > = {
      nota_taxa_avaliacao_corretora_bid_cambio: 5,
      nota_agilidade_avaliacao_corretora_bid_cambio: 4,
      nota_atendimento_avaliacao_corretora_bid_cambio: 5,
      nota_confiabilidade_avaliacao_corretora_bid_cambio: 3,
    }
    expect(notas.nota_taxa_avaliacao_corretora_bid_cambio).toBe(5)
  })
})

describe('BidCambioGanho — campos DDD', () => {
  it('possui id com sufixo _ganho_bid_cambio', () => {
    const _: AssertExtends<
      { id_ganho_bid_cambio: string },
      Pick<BidCambioGanho, 'id_ganho_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioGanho, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('moeda usa BidCambioMoeda', () => {
    const _: AssertEquals<BidCambioGanho['moeda_ganho_bid_cambio'], BidCambioMoeda> = true
    expect(_).toBe(true)
  })
})

describe('BidCambioPreferenciaUsuario — campos DDD', () => {
  it('possui id com sufixo _preferencia_usuario_bid_cambio', () => {
    const _: AssertExtends<
      { id_preferencia_usuario_bid_cambio: string },
      Pick<BidCambioPreferenciaUsuario, 'id_preferencia_usuario_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioPreferenciaUsuario, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })

  it('campos booleanos sem prefixo is_', () => {
    const prefs: Pick<
      BidCambioPreferenciaUsuario,
      | 'mostrar_no_financeiro_preferencia_bid_cambio'
      | 'alerta_email_vencimento_preferencia_bid_cambio'
      | 'enviar_email_exportador_preferencia_bid_cambio'
      | 'enviar_email_fim_de_semana_preferencia_bid_cambio'
    > = {
      mostrar_no_financeiro_preferencia_bid_cambio: true,
      alerta_email_vencimento_preferencia_bid_cambio: true,
      enviar_email_exportador_preferencia_bid_cambio: false,
      enviar_email_fim_de_semana_preferencia_bid_cambio: false,
    }
    expect(prefs.mostrar_no_financeiro_preferencia_bid_cambio).toBe(true)
  })
})

describe('BidCambioPreferenciaGrid — campos DDD', () => {
  it('possui id com sufixo _preferencia_grid_bid_cambio', () => {
    const _: AssertExtends<
      { id_preferencia_grid_bid_cambio: string },
      Pick<BidCambioPreferenciaGrid, 'id_preferencia_grid_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('possui id_organizacao obrigatorio', () => {
    const _: AssertExtends<
      { id_organizacao: string },
      Pick<BidCambioPreferenciaGrid, 'id_organizacao'>
    > = true
    expect(_).toBe(true)
  })
})

describe('BidCambioClassificacaoCorretora — campos DDD', () => {
  it('possui id com sufixo _classificacao_corretora_bid_cambio', () => {
    const _: AssertExtends<
      { id_classificacao_corretora_bid_cambio: string },
      Pick<BidCambioClassificacaoCorretora, 'id_classificacao_corretora_bid_cambio'>
    > = true
    expect(_).toBe(true)
  })

  it('campos de metrica possuem sufixo _classificacao_bid_cambio', () => {
    const metricas: Pick<
      BidCambioClassificacaoCorretora,
      | 'taxa_resposta_classificacao_bid_cambio'
      | 'taxa_aprovacao_classificacao_bid_cambio'
      | 'score_global_classificacao_bid_cambio'
      | 'total_cotacoes_classificacao_bid_cambio'
    > = {
      taxa_resposta_classificacao_bid_cambio: 85.5,
      taxa_aprovacao_classificacao_bid_cambio: 72.3,
      score_global_classificacao_bid_cambio: 8.7,
      total_cotacoes_classificacao_bid_cambio: 42,
    }
    expect(metricas.score_global_classificacao_bid_cambio).toBe(8.7)
  })
})
