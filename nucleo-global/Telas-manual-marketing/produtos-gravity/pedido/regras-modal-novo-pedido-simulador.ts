import type { RequisitoSalvar } from '../../../Feedback/banner-requisitos-global/src/tipos'

export type TipoOperacaoPedidoSimulador = 'importacao' | 'exportacao'

export type FormNovoPedidoSimulador = {
  tipo_operacao_pedido: TipoOperacaoPedidoSimulador
  numero_pedido: string
  suid_importador: string
  suid_exportador: string
  suid_fabricante: string
  incoterm_pedido: string
  condicao_pagamento_pedido: string
  numero_proforma_pedido: string
  numero_invoice_pedido: string
  referencia_importador_pedido: string
  referencia_exportador_pedido: string
  referencia_fabricante_pedido: string
  data_emissao_pedido: string
}

export type ItemNovoPedidoSimulador = {
  key: string
  part_number_item: string
  ncm_item: string
  descricao_item: string
  quantidade_inicial_item: string
  moeda_item: string
  valor_por_unidade_item: string
}

export function criarItemVazioNovoPedidoSimulador(): ItemNovoPedidoSimulador {
  return {
    key: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    part_number_item: '',
    ncm_item: '',
    descricao_item: '',
    quantidade_inicial_item: '',
    moeda_item: '',
    valor_por_unidade_item: '',
  }
}

export function formNovoPedidoSimuladorVazio(): FormNovoPedidoSimulador {
  const hoje = new Date()
  const iso = hoje.toISOString().split('T')[0]
  return {
    tipo_operacao_pedido: 'importacao',
    numero_pedido: '',
    suid_importador: '',
    suid_exportador: '',
    suid_fabricante: '',
    incoterm_pedido: '',
    condicao_pagamento_pedido: '',
    numero_proforma_pedido: '',
    numero_invoice_pedido: '',
    referencia_importador_pedido: '',
    referencia_exportador_pedido: '',
    referencia_fabricante_pedido: '',
    data_emissao_pedido: iso,
  }
}

export function montarRequisitosPasso1NovoPedidoSimulador(
  form: FormNovoPedidoSimulador,
): RequisitoSalvar[] {
  const dataValida = form.data_emissao_pedido
    ? !Number.isNaN(new Date(`${form.data_emissao_pedido}T00:00:00.000Z`).getTime())
    : false

  return [
    {
      chave: 'numero_pedido',
      ok: form.numero_pedido.trim().length > 0,
      mensagem: 'Número do Pedido',
    },
    {
      chave: 'suid_exportador',
      ok: form.tipo_operacao_pedido !== 'importacao' || !!form.suid_exportador,
      mensagem: 'Selecionar (ou cadastrar) o exportador',
    },
    {
      chave: 'suid_importador',
      ok: form.tipo_operacao_pedido !== 'exportacao' || !!form.suid_importador,
      mensagem: 'Selecionar (ou cadastrar) o importador',
    },
    {
      chave: 'data_emissao_pedido',
      ok: !!form.data_emissao_pedido && dataValida,
      mensagem: 'Data de emissão válida',
    },
  ]
}

export function podeAvancarPasso1NovoPedidoSimulador(form: FormNovoPedidoSimulador): boolean {
  return montarRequisitosPasso1NovoPedidoSimulador(form).every((r) => r.ok)
}

/** Paridade com ModalPedidoNovo — item entra no payload se tiver qualquer campo preenchido. */
export function itemTemConteudoNovoPedidoSimulador(item: ItemNovoPedidoSimulador): boolean {
  return !!(
    item.part_number_item.trim()
    || item.descricao_item.trim()
    || item.ncm_item.trim()
    || item.quantidade_inicial_item.trim()
    || item.valor_por_unidade_item.trim()
  )
}

export function filtrarItensSalvaveisNovoPedidoSimulador(
  itens: ItemNovoPedidoSimulador[],
): ItemNovoPedidoSimulador[] {
  return itens.filter(itemTemConteudoNovoPedidoSimulador)
}
