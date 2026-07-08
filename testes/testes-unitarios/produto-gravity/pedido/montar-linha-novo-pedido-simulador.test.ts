import { describe, expect, it } from 'vitest'
import { montarLinhaNovoPedidoSimulador } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/montar-linha-novo-pedido-simulador'
import { FORNECEDORES_SIMULADOR_NOVO_PEDIDO_INICIAIS } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/dados-fornecedores-simulador-novo-pedido'
import {
  criarItemVazioNovoPedidoSimulador,
  filtrarItensSalvaveisNovoPedidoSimulador,
  itemTemConteudoNovoPedidoSimulador,
} from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/regras-modal-novo-pedido-simulador'

describe('novo pedido simulador — montagem na lista', () => {
  it('considera item com NCM preenchido como salvável', () => {
    const item = criarItemVazioNovoPedidoSimulador()
    item.ncm_item = '84713012'
    expect(itemTemConteudoNovoPedidoSimulador(item)).toBe(true)
    expect(filtrarItensSalvaveisNovoPedidoSimulador([item])).toHaveLength(1)
  })

  it('monta linha pai com filhos quando item tem só NCM e quantidade', () => {
    const item = criarItemVazioNovoPedidoSimulador()
    item.ncm_item = '84713012'
    item.quantidade_inicial_item = '5'
    item.valor_por_unidade_item = '100'
    item.moeda_item = 'USD'

    const linha = montarLinhaNovoPedidoSimulador(
      {
        tipo_operacao_pedido: 'exportacao',
        numero_pedido: 'PO-DEMO-001',
        suid_importador: 'london-metals',
        suid_exportador: '',
        suid_fabricante: '',
        incoterm_pedido: 'DDP',
        condicao_pagamento_pedido: '',
        numero_proforma_pedido: '',
        numero_invoice_pedido: '',
        referencia_exportador_pedido: 'REF-EXP-01',
        referencia_importador_pedido: '',
        referencia_fabricante_pedido: '',
        data_emissao_pedido: '2026-07-08',
      },
      [item],
      FORNECEDORES_SIMULADOR_NOVO_PEDIDO_INICIAIS,
      { id: 'filial-sc-importador', nome: 'FILIAL SC', tipo: 'importador' },
    )

    expect(linha.detalhesItens).toHaveLength(1)
    expect(linha.itens).toBe(1)
    expect(linha.numeroPedido).toBe('PO-DEMO-001')
    expect(linha.detalhesItens[0].campos.ncm).toBe('8471.30.12')
    expect(linha.campos.referencia_exportador).toBe('REF-EXP-01')
    expect(linha.campos.referencia_exportador).not.toMatch(/^D-\d+$/)
  })
})
