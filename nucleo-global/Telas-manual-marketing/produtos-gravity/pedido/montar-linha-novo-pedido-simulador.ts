import type { PerfilEmpresaSimulador } from '../smart-doc/dados-cliente-maduro-simulador-smart-doc'
import type { ItemListaPedidoSimulador, LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import {
  EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO,
  type FornecedorSimuladorNovoPedido,
} from './dados-fornecedores-simulador-novo-pedido'
import {
  filtrarItensSalvaveisNovoPedidoSimulador,
  type FormNovoPedidoSimulador,
  type ItemNovoPedidoSimulador,
} from './regras-modal-novo-pedido-simulador'
import {
  popularCamposItemListaSimulador,
  popularCamposPedidoListaSimulador,
} from './popular-campos-lista-simulador-pedido'

const WORKSPACE_POR_EMPRESA: Record<string, string> = {
  'filial-sc-importador': 'FILIAL SC',
  'matriz-sp-importador': 'MATRIZ SP',
  'filial-pr-exportador': 'FILIAL PR',
  'importador-ltda': 'IMPORTADOR LTDA',
  'exportador-ltda': 'EXPORTADOR LTDA',
}

function formatarDataAberturaLista(iso: string): string {
  if (!iso) return ''
  const d = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatarNcmLista(raw: string): string | null {
  const d = raw.replace(/\D/g, '')
  if (!d) return null
  if (d.length <= 4) return d
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}`
}

function formatarValorLista(valor: number): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function resolverNomeImportador(
  form: FormNovoPedidoSimulador,
  fornecedores: FornecedorSimuladorNovoPedido[],
): string {
  if (form.tipo_operacao_pedido === 'importacao') {
    return EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.nome_empresa
  }
  const imp = fornecedores.find((f) => f.id_fornecedor === form.suid_importador)
  return imp?.nome_fornecedor ?? ''
}

function aplicarCamposFormularioPedido(
  campos: Record<string, string | null>,
  form: FormNovoPedidoSimulador,
  extras: {
    importador: string
    fabricante: string | null
    portoOrigem: string
    dataAbertura: string
    valorFob: number
    moeda: string
    qtdItens: number
  },
): Record<string, string | null> {
  const next: Record<string, string | null> = { ...campos }

  next.numero_pedido = form.numero_pedido
  next.incoterm = form.incoterm_pedido || null
  next.porto_origem = extras.portoOrigem === '—' ? null : extras.portoOrigem
  next.referencia_exportador = form.referencia_exportador_pedido.trim() || null
  next.referencia_importador = form.referencia_importador_pedido.trim() || null
  next.referencia_fabricante = form.referencia_fabricante_pedido.trim() || null
  next.condicao_pagamento = form.condicao_pagamento_pedido.trim() || null
  next.numero_proforma = form.numero_proforma_pedido.trim() || null
  next.numero_invoice = form.numero_invoice_pedido.trim() || null
  next.nome_importador = extras.importador || null
  next.nome_fabricante = extras.fabricante
  next.data_emissao_pedido = extras.dataAbertura || null

  if (extras.valorFob > 0) {
    next.valor_total_pedido = `${extras.moeda} ${formatarValorLista(extras.valorFob)}`
  }

  next.quantidade_total_pedido = String(Math.max(extras.qtdItens, 1) * 10)
  next.moeda_pedido = extras.moeda

  return next
}

function montarCamposItem(
  item: ItemNovoPedidoSimulador,
  idx: number,
  ctxPai: Parameters<typeof popularCamposPedidoListaSimulador>[0],
  numeroPedido: string,
  moedaPadrao: string,
): ItemListaPedidoSimulador['campos'] {
  const sequencia = idx + 1
  const numeroItem = `${numeroPedido}-${String(sequencia).padStart(2, '0')}`
  const moeda = item.moeda_item || moedaPadrao
  const qtd = Number(item.quantidade_inicial_item) || 0
  const unit = Number(item.valor_por_unidade_item) || 0

  const campos = popularCamposItemListaSimulador({
    ...ctxPai,
    sequencia,
    numeroItem,
  })

  if (item.part_number_item.trim()) {
    campos.part_number_item = item.part_number_item.trim()
  }
  if (item.descricao_item.trim()) {
    campos.descricao_item = item.descricao_item.trim()
  }
  const ncm = formatarNcmLista(item.ncm_item)
  if (ncm) campos.ncm = ncm
  if (unit > 0) {
    campos.valor_por_unidade_item = `${moeda} ${formatarValorLista(unit)}`
  }
  if (qtd > 0) {
    campos.quantidade_total_pedido = String(qtd)
    campos.saldo_itens_do_pedido = String(qtd)
  }
  campos.moeda_pedido = moeda

  return campos
}

export function montarLinhaNovoPedidoSimulador(
  form: FormNovoPedidoSimulador,
  itens: ItemNovoPedidoSimulador[],
  fornecedores: FornecedorSimuladorNovoPedido[],
  empresaAtiva: PerfilEmpresaSimulador | undefined,
): LinhaListaPedidoSimulador {
  const exportadorFornecedor = fornecedores.find((f) => f.id_fornecedor === form.suid_exportador)
  const fabricanteFornecedor = fornecedores.find((f) => f.id_fornecedor === form.suid_fabricante)
  const nomeExportador = form.tipo_operacao_pedido === 'exportacao'
    ? EMPRESA_ORG_SIMULADOR_NOVO_PEDIDO.nome_empresa
    : (exportadorFornecedor?.nome_fornecedor ?? '')
  const vincularExportador = form.tipo_operacao_pedido === 'exportacao'
    ? false
    : !exportadorFornecedor
  const portoOrigem = form.tipo_operacao_pedido === 'exportacao'
    ? 'SANTOS'
    : (exportadorFornecedor?.pais_fornecedor === 'GB' ? 'LONDON' : '—')
  const tipoOperacao = form.tipo_operacao_pedido === 'importacao' ? 'IMPORTAÇÃO' : 'EXPORTAÇÃO'
  const idEmpresa = empresaAtiva?.id ?? 'matriz-sp-importador'
  const workspace = WORKSPACE_POR_EMPRESA[idEmpresa] ?? empresaAtiva?.nome ?? 'MATRIZ SP'
  const id = `novo-${Date.now()}`
  const dataAbertura = formatarDataAberturaLista(form.data_emissao_pedido)
  const itensSalvaveis = filtrarItensSalvaveisNovoPedidoSimulador(itens)
  const moedaPadrao = itensSalvaveis.find((i) => i.moeda_item)?.moeda_item ?? 'USD'

  const valorFob = itensSalvaveis.reduce((sum, item) => {
    const qtd = Number(item.quantidade_inicial_item) || 0
    const unit = Number(item.valor_por_unidade_item) || 0
    return sum + qtd * unit
  }, 0)

  const ctxPai = {
    id,
    numeroPedido: form.numero_pedido,
    tipoOperacao,
    status: 'RASCUNHO' as const,
    workspace,
    exportador: nomeExportador,
    vincularExportador,
    incoterm: form.incoterm_pedido || '—',
    alertaIncoterm: !form.incoterm_pedido,
    portoOrigem,
    valorFob,
    moeda: moedaPadrao,
    dataAbertura,
    qtdItens: itensSalvaveis.length,
  }

  const detalhesItens: ItemListaPedidoSimulador[] = itensSalvaveis.map((item, idx) => {
    const sequencia = idx + 1
    const numeroItem = `${form.numero_pedido}-${String(sequencia).padStart(2, '0')}`
    const campos = montarCamposItem(item, idx, ctxPai, form.numero_pedido, moedaPadrao)

    return {
      id: `${id}-item-${sequencia}`,
      sequencia,
      numeroItem,
      alerta: false,
      tipoOperacao,
      status: 'RASCUNHO',
      campos,
    }
  })

  const camposBase = popularCamposPedidoListaSimulador(ctxPai)
  const campos = aplicarCamposFormularioPedido(camposBase, form, {
    importador: resolverNomeImportador(form, fornecedores),
    fabricante: fabricanteFornecedor?.nome_fornecedor ?? null,
    portoOrigem,
    dataAbertura,
    valorFob,
    moeda: moedaPadrao,
    qtdItens: detalhesItens.length,
  })

  return {
    id,
    numeroPedido: form.numero_pedido,
    tipoOperacao,
    status: 'RASCUNHO',
    idEmpresa,
    workspace,
    exportador: nomeExportador,
    vincularExportador,
    incoterm: form.incoterm_pedido || '—',
    alertaIncoterm: !form.incoterm_pedido,
    portoOrigem,
    valorFob,
    moeda: moedaPadrao,
    dataAbertura,
    itens: detalhesItens.length,
    detalhesItens,
    campos,
  }
}
