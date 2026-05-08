/**
 * Gerador de pedidos sinteticos para teste de carga.
 *
 * Saida: objetos com chaves DDD prontas para INSERT no banco.
 * Sem dependencia externa (sem faker.js) — pools embutidos em pools.ts.
 */

import {
  NCMS_REAIS,
  FORNECEDORES_INT,
  COMPRADORES_EXP,
  INCOTERMS,
  MOEDAS_PESO,
  STATUS_PESO,
  TIPO_OP_PESO,
  UNIDADES,
  COBERTURAS,
  CONDICOES_PAGAMENTO,
} from './pools.js'
import {
  camposPedidoPorTier,
  camposItemPorTier,
} from './tiers.js'

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

function rnd<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function rndPeso<T extends { peso: number }>(arr: T[]): T {
  const total = arr.reduce((s, x) => s + x.peso, 0)
  let r = Math.random() * total
  for (const item of arr) {
    if ((r -= item.peso) <= 0) return item
  }
  return arr[arr.length - 1]!
}

function rndInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function rndFloat(min: number, max: number, casas = 2): number {
  const v = Math.random() * (max - min) + min
  const f = Math.pow(10, casas)
  return Math.round(v * f) / f
}

function rndDataNos90Dias(): Date {
  const agora = Date.now()
  const t = agora - rndInt(0, 90) * 24 * 60 * 60 * 1000
  return new Date(t)
}

function addDias(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 24 * 60 * 60 * 1000)
}

function gerarCnpjFake(): string {
  const a = rndInt(10000000, 99999999)
  const b = rndInt(1000, 9999)
  const c = rndInt(10, 99)
  const aStr = String(a).padStart(8, '0')
  return `${aStr.slice(0,2)}.${aStr.slice(2,5)}.${aStr.slice(5,8)}/${b}-${c}`
}

function gerarCuid(prefixo: string, idx: number, seq?: number): string {
  // Pseudo-CUID determinístico para teste — formato c + 24 chars
  // Usamos timestamp resumido + indice para garantir unicidade
  const ts = Date.now().toString(36).slice(-8)
  const r = Math.random().toString(36).slice(2, 10)
  const seqStr = seq !== undefined ? String(seq).padStart(2, '0') : ''
  const idxStr = String(idx).padStart(5, '0')
  return `c${ts}${r}${idxStr}${seqStr}`.padEnd(25, '0').slice(0, 25)
}

// ────────────────────────────────────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────────────────────────────────────

export interface PedidoGerado {
  // Identidade
  id_pedido: string
  id_organizacao: string
  id_workspace: string
  // Basicos
  tipo_operacao_pedido: 'importacao' | 'exportacao'
  numero_pedido: string
  status_pedido: string
  id_status_pedido: string | null
  id_importacao_exportador_pedido: string | null
  id_exportacao_importador_pedido: string | null
  id_fabricante_pedido: string | null
  incoterm_pedido: string | null
  moeda_pedido: string
  valor_total_pedido: string | null
  casas_decimais_valor_pedido: number
  quantidade_total_pedido: string | null
  casas_decimais_quantidade_pedido: number
  unidade_comercializada_pedido: string | null
  condicao_pagamento_pedido: string | null
  numero_proforma_pedido: string | null
  numero_invoice_pedido: string | null
  referencia_importador_pedido: string | null
  referencia_exportador_pedido: string | null
  referencia_fabricante_pedido: string | null
  valor_total_cambio_pedido: string | null
  moeda_cambio_pedido: string | null
  taxa_cambio_estimada_pedido: string | null
  contrato_cambio_id_pedido: string | null
  data_emissao_pedido: Date
  detalhes_operacionais_pedido: object | null
  dados_extras_importacao_pedido: object | null
  ids_origem_consolidacao_pedido: object | null
  cnpj_importador_pedido: string | null
  data_consolidacao_pedido: Date | null
  data_exclusao_pedido: Date | null
  peso_liquido_total_pedido: string | null
  peso_bruto_total_pedido: string | null
  cubagem_total_pedido: string | null
  casas_decimais_peso_pedido: number
  casas_decimais_cubagem_pedido: number
  data_criacao_pedido: Date
  data_atualizacao_pedido: Date
  cobertura_cambial_pedido: string | null
  quantidade_volumes_pedido: number | null
  // Datas
  data_documento_pedido: Date | null
  data_documento_proforma_pedido: Date | null
  data_documento_invoice_pedido: Date | null
  data_prevista_pedido_pronto: Date | null
  data_confirmada_pedido_pronto: Date | null
  data_meta_pedido_pronto: Date | null
  data_prevista_inspecao_pedido: Date | null
  data_confirmada_inspecao_pedido: Date | null
  data_meta_inspecao_pedido: Date | null
  data_prevista_coleta_pedido: Date | null
  data_confirmada_coleta_pedido: Date | null
  data_meta_coleta_pedido: Date | null
  data_previsao_recebimento_draft_pedido: Date | null
  data_confirmacao_recebimento_draft_pedido: Date | null
  data_meta_recebimento_draft_pedido: Date | null
  data_previsao_aprovacao_draft_pedido: Date | null
  data_confirmacao_aprovacao_draft_pedido: Date | null
  data_meta_aprovacao_draft_pedido: Date | null
  data_previsao_recebimento_draft_proforma_pedido: Date | null
  data_confirmacao_recebimento_draft_proforma_pedido: Date | null
  data_meta_recebimento_draft_proforma_pedido: Date | null
  data_previsao_aprovacao_draft_proforma_pedido: Date | null
  data_confirmacao_aprovacao_draft_proforma_pedido: Date | null
  data_meta_aprovacao_draft_proforma_pedido: Date | null
  data_previsao_envio_original_proforma_pedido: Date | null
  data_confirmacao_envio_original_proforma_pedido: Date | null
  data_meta_envio_original_proforma_pedido: Date | null
  data_previsao_recebimento_original_proforma_pedido: Date | null
  data_confirmacao_recebimento_original_proforma_pedido: Date | null
  data_meta_recebimento_original_proforma_pedido: Date | null
  data_previsao_recebimento_draft_invoice_pedido: Date | null
  data_confirmacao_recebimento_draft_invoice_pedido: Date | null
  data_meta_recebimento_draft_invoice_pedido: Date | null
  data_previsao_aprovacao_draft_invoice_pedido: Date | null
  data_confirmacao_aprovacao_draft_invoice_pedido: Date | null
  data_meta_aprovacao_draft_invoice_pedido: Date | null
  data_previsao_envio_original_invoice_pedido: Date | null
  data_confirmacao_envio_original_invoice_pedido: Date | null
  data_meta_envio_original_invoice_pedido: Date | null
  data_previsao_recebimento_original_invoice_pedido: Date | null
  data_confirmacao_recebimento_original_invoice_pedido: Date | null
  data_meta_recebimento_original_invoice_pedido: Date | null
  // Metadados (nao vai pro INSERT — info pra CSV/log)
  _tier: 50 | 70 | 100
}

export interface ItemGerado {
  id_item: string
  id_organizacao: string
  id_workspace: string
  id_pedido: string
  sequencia_item_pedido: number | null
  part_number_item: string
  ncm_item: string
  descricao_item: string
  unidade_comercializada_item: string | null
  quantidade_inicial_item: string
  quantidade_atual_item: string
  quantidade_pronta_item: string
  quantidade_transferida_item: string
  quantidade_cancelada_item: string
  casas_decimais_quantidade_item: number
  moeda_item: string
  valor_total_item: string | null
  valor_por_unidade_item: string | null
  casas_decimais_valor_item: number
  cobertura_cambial_item: string
  nome_exportador_item: string | null
  nome_importador_item: string | null
  nome_fabricante_item: string | null
  referencia_importador_item: string | null
  referencia_exportador_item: string | null
  referencia_fabricante_item: string | null
  incoterm_item: string | null
  condicao_pagamento_item: string | null
  data_emissao_item: Date | null
  peso_liquido_unitario_item: string | null
  peso_bruto_unitario_item: string | null
  cubagem_unitaria_item: string | null
  casas_decimais_peso_item: number
  casas_decimais_cubagem_item: number
  dados_extras_importacao_item: object | null
  data_criacao_item: Date
  data_atualizacao_item: Date
  data_consolidacao_item: Date | null
  data_exclusao_item: Date | null
  data_prevista_item_pronto: Date | null
  data_confirmada_item_pronto: Date | null
  data_meta_item_pronto: Date | null
  data_prevista_inspecao_item: Date | null
  data_confirmada_inspecao_item: Date | null
  data_meta_inspecao_item: Date | null
  data_prevista_coleta_item: Date | null
  data_confirmada_coleta_item: Date | null
  data_meta_coleta_item: Date | null
}

// ────────────────────────────────────────────────────────────────────────────
// Geracao
// ────────────────────────────────────────────────────────────────────────────

export interface ContextoGeracao {
  id_organizacao: string
  id_workspace: string
}

export function gerarPedido(
  idx: number,
  tier: 50 | 70 | 100,
  ctx: ContextoGeracao,
): { pedido: PedidoGerado; tier: 50 | 70 | 100 } {
  const dataEmissao = rndDataNos90Dias()
  const dataCriacao = dataEmissao
  const dataAtualizacao = addDias(dataEmissao, rndInt(1, 30))
  const tipoOp = rndPeso(TIPO_OP_PESO).valor
  const status = rndPeso(STATUS_PESO).valor
  const moedaInfo = rndPeso(MOEDAS_PESO)
  const moeda = moedaInfo.codigo
  const taxaCamb = moedaInfo.taxaBrl
  const cobertura = rnd(COBERTURAS)
  const incoterm = rnd(INCOTERMS)
  const condicao = rnd(CONDICOES_PAGAMENTO)
  const unidade = rnd(UNIDADES)
  const numVolumes = rndInt(10, 2000)

  const fornecedor = rnd(FORNECEDORES_INT)
  const comprador = rnd(COMPRADORES_EXP)

  const numeroPedido = `CARGA-2026-${String(idx).padStart(4, '0')}`

  const idPedido = gerarCuid('pedi', idx)

  // Datas em sequencia logica baseada em data_emissao
  const dDocPed = addDias(dataEmissao, 2)
  const dDocProf = addDias(dataEmissao, 4)
  const dDocInv = addDias(dataEmissao, 18)
  const dPrevPronto = addDias(dataEmissao, 20)
  const dConfPronto = addDias(dataEmissao, 22)
  const dMetaPronto = addDias(dataEmissao, 18)
  const dPrevInsp = addDias(dataEmissao, 22)
  const dConfInsp = addDias(dataEmissao, 24)
  const dMetaInsp = addDias(dataEmissao, 20)
  const dPrevCol = addDias(dataEmissao, 26)
  const dConfCol = addDias(dataEmissao, 28)
  const dMetaCol = addDias(dataEmissao, 24)
  const dConsolidacao = status === 'consolidado' ? addDias(dataEmissao, 35) : null

  const camposIncluidos = camposPedidoPorTier(tier)

  function inc<T>(campo: string, valor: T): T | null {
    return camposIncluidos.has(campo) ? valor : null
  }

  const pedido: PedidoGerado = {
    // Nucleo (sempre)
    id_pedido: idPedido,
    id_organizacao: ctx.id_organizacao,
    id_workspace: ctx.id_workspace,
    tipo_operacao_pedido: tipoOp,
    numero_pedido: numeroPedido,
    status_pedido: status,
    moeda_pedido: moeda,
    casas_decimais_valor_pedido: 2,
    casas_decimais_quantidade_pedido: 0,
    casas_decimais_peso_pedido: 3,
    casas_decimais_cubagem_pedido: 4,
    data_emissao_pedido: dataEmissao,
    data_criacao_pedido: dataCriacao,
    data_atualizacao_pedido: dataAtualizacao,
    // Snapshots/FK opcionais — sempre NULL (snapshots pulados)
    id_status_pedido: null,
    id_importacao_exportador_pedido: null,
    id_exportacao_importador_pedido: null,
    id_fabricante_pedido: null,
    data_exclusao_pedido: null,
    // Opcionais — dependem do tier
    valor_total_pedido: inc('valor_total_pedido', rndFloat(1000, 500000, 2).toFixed(2)),
    quantidade_total_pedido: inc('quantidade_total_pedido', rndInt(10, 5000).toFixed(0)),
    unidade_comercializada_pedido: inc('unidade_comercializada_pedido', unidade),
    incoterm_pedido: inc('incoterm_pedido', incoterm),
    condicao_pagamento_pedido: inc('condicao_pagamento_pedido', condicao),
    peso_liquido_total_pedido: inc('peso_liquido_total_pedido', rndFloat(50, 50000, 3).toFixed(3)),
    peso_bruto_total_pedido: inc('peso_bruto_total_pedido', rndFloat(60, 60000, 3).toFixed(3)),
    cubagem_total_pedido: inc('cubagem_total_pedido', rndFloat(0.5, 200, 4).toFixed(4)),
    data_prevista_pedido_pronto: inc('data_prevista_pedido_pronto', dPrevPronto),
    data_prevista_coleta_pedido: inc('data_prevista_coleta_pedido', dPrevCol),
    cnpj_importador_pedido: inc('cnpj_importador_pedido', gerarCnpjFake()),
    // Tier 70+
    numero_proforma_pedido: inc('numero_proforma_pedido', `PI-${numeroPedido}`),
    numero_invoice_pedido: inc('numero_invoice_pedido', `CI-${numeroPedido}`),
    referencia_importador_pedido: inc('referencia_importador_pedido', `REF-IMP-${idx.toString().padStart(4,'0')}`),
    cobertura_cambial_pedido: inc('cobertura_cambial_pedido', cobertura),
    quantidade_volumes_pedido: inc('quantidade_volumes_pedido', numVolumes),
    data_documento_pedido: inc('data_documento_pedido', dDocPed),
    data_confirmada_pedido_pronto: inc('data_confirmada_pedido_pronto', dConfPronto),
    data_meta_pedido_pronto: inc('data_meta_pedido_pronto', dMetaPronto),
    data_prevista_inspecao_pedido: inc('data_prevista_inspecao_pedido', dPrevInsp),
    data_meta_inspecao_pedido: inc('data_meta_inspecao_pedido', dMetaInsp),
    data_confirmada_coleta_pedido: inc('data_confirmada_coleta_pedido', dConfCol),
    data_meta_coleta_pedido: inc('data_meta_coleta_pedido', dMetaCol),
    data_previsao_recebimento_draft_pedido: inc('data_previsao_recebimento_draft_pedido', addDias(dataEmissao, 3)),
    data_meta_recebimento_draft_pedido: inc('data_meta_recebimento_draft_pedido', addDias(dataEmissao, 2)),
    data_previsao_aprovacao_draft_pedido: inc('data_previsao_aprovacao_draft_pedido', addDias(dataEmissao, 5)),
    data_meta_aprovacao_draft_pedido: inc('data_meta_aprovacao_draft_pedido', addDias(dataEmissao, 4)),
    detalhes_operacionais_pedido: inc('detalhes_operacionais_pedido', {
      nome_exportador: tipoOp === 'importacao' ? fornecedor.nome : 'Gravity Comercio Exportacao Ltda',
      nome_importador: tipoOp === 'importacao' ? 'Gravity Comercio Importacao Ltda' : comprador.nome,
      nome_fabricante: fornecedor.nome,
      pais_origem: tipoOp === 'importacao' ? fornecedor.pais : 'BR',
      via: rnd(['maritima', 'aerea', 'rodoviaria']),
    }),
    // Tier 100
    referencia_exportador_pedido: inc('referencia_exportador_pedido', `REF-EXP-${idx.toString().padStart(4,'0')}`),
    referencia_fabricante_pedido: inc('referencia_fabricante_pedido', `REF-FAB-${idx.toString().padStart(4,'0')}`),
    valor_total_cambio_pedido: inc('valor_total_cambio_pedido', null), // calculado depois
    moeda_cambio_pedido: inc('moeda_cambio_pedido', 'BRL'),
    taxa_cambio_estimada_pedido: inc('taxa_cambio_estimada_pedido', taxaCamb.toFixed(4)),
    contrato_cambio_id_pedido: inc('contrato_cambio_id_pedido', cobertura === 'com_cobertura' ? gerarCuid('cccm', idx) : null),
    dados_extras_importacao_pedido: inc('dados_extras_importacao_pedido', { observacao: 'Gerado por teste-carga-pedido', tier }),
    ids_origem_consolidacao_pedido: inc('ids_origem_consolidacao_pedido', []),
    data_consolidacao_pedido: dConsolidacao,
    data_documento_proforma_pedido: inc('data_documento_proforma_pedido', dDocProf),
    data_documento_invoice_pedido: inc('data_documento_invoice_pedido', dDocInv),
    data_confirmada_inspecao_pedido: inc('data_confirmada_inspecao_pedido', dConfInsp),
    data_confirmacao_recebimento_draft_pedido: inc('data_confirmacao_recebimento_draft_pedido', addDias(dataEmissao, 4)),
    data_confirmacao_aprovacao_draft_pedido: inc('data_confirmacao_aprovacao_draft_pedido', addDias(dataEmissao, 6)),
    // Datas proforma
    data_previsao_recebimento_draft_proforma_pedido: inc('data_previsao_recebimento_draft_proforma_pedido', addDias(dataEmissao, 7)),
    data_confirmacao_recebimento_draft_proforma_pedido: inc('data_confirmacao_recebimento_draft_proforma_pedido', addDias(dataEmissao, 8)),
    data_meta_recebimento_draft_proforma_pedido: inc('data_meta_recebimento_draft_proforma_pedido', addDias(dataEmissao, 6)),
    data_previsao_aprovacao_draft_proforma_pedido: inc('data_previsao_aprovacao_draft_proforma_pedido', addDias(dataEmissao, 9)),
    data_confirmacao_aprovacao_draft_proforma_pedido: inc('data_confirmacao_aprovacao_draft_proforma_pedido', addDias(dataEmissao, 10)),
    data_meta_aprovacao_draft_proforma_pedido: inc('data_meta_aprovacao_draft_proforma_pedido', addDias(dataEmissao, 8)),
    data_previsao_envio_original_proforma_pedido: inc('data_previsao_envio_original_proforma_pedido', addDias(dataEmissao, 11)),
    data_confirmacao_envio_original_proforma_pedido: inc('data_confirmacao_envio_original_proforma_pedido', addDias(dataEmissao, 12)),
    data_meta_envio_original_proforma_pedido: inc('data_meta_envio_original_proforma_pedido', addDias(dataEmissao, 10)),
    data_previsao_recebimento_original_proforma_pedido: inc('data_previsao_recebimento_original_proforma_pedido', addDias(dataEmissao, 14)),
    data_confirmacao_recebimento_original_proforma_pedido: inc('data_confirmacao_recebimento_original_proforma_pedido', addDias(dataEmissao, 15)),
    data_meta_recebimento_original_proforma_pedido: inc('data_meta_recebimento_original_proforma_pedido', addDias(dataEmissao, 12)),
    // Datas invoice
    data_previsao_recebimento_draft_invoice_pedido: inc('data_previsao_recebimento_draft_invoice_pedido', addDias(dataEmissao, 18)),
    data_confirmacao_recebimento_draft_invoice_pedido: inc('data_confirmacao_recebimento_draft_invoice_pedido', addDias(dataEmissao, 19)),
    data_meta_recebimento_draft_invoice_pedido: inc('data_meta_recebimento_draft_invoice_pedido', addDias(dataEmissao, 16)),
    data_previsao_aprovacao_draft_invoice_pedido: inc('data_previsao_aprovacao_draft_invoice_pedido', addDias(dataEmissao, 20)),
    data_confirmacao_aprovacao_draft_invoice_pedido: inc('data_confirmacao_aprovacao_draft_invoice_pedido', addDias(dataEmissao, 21)),
    data_meta_aprovacao_draft_invoice_pedido: inc('data_meta_aprovacao_draft_invoice_pedido', addDias(dataEmissao, 18)),
    data_previsao_envio_original_invoice_pedido: inc('data_previsao_envio_original_invoice_pedido', addDias(dataEmissao, 22)),
    data_confirmacao_envio_original_invoice_pedido: inc('data_confirmacao_envio_original_invoice_pedido', addDias(dataEmissao, 23)),
    data_meta_envio_original_invoice_pedido: inc('data_meta_envio_original_invoice_pedido', addDias(dataEmissao, 20)),
    data_previsao_recebimento_original_invoice_pedido: inc('data_previsao_recebimento_original_invoice_pedido', addDias(dataEmissao, 25)),
    data_confirmacao_recebimento_original_invoice_pedido: inc('data_confirmacao_recebimento_original_invoice_pedido', addDias(dataEmissao, 26)),
    data_meta_recebimento_original_invoice_pedido: inc('data_meta_recebimento_original_invoice_pedido', addDias(dataEmissao, 22)),
    _tier: tier,
  }

  // Calcula valor_total_cambio se aplicavel
  if (pedido.valor_total_pedido && pedido.taxa_cambio_estimada_pedido) {
    const v = parseFloat(pedido.valor_total_pedido) * parseFloat(pedido.taxa_cambio_estimada_pedido)
    pedido.valor_total_cambio_pedido = v.toFixed(2)
  }

  return { pedido, tier }
}

export function gerarItensDoPedido(
  pedido: PedidoGerado,
  qtdItens: number,
  tier: 50 | 70 | 100,
  idxPedido: number,
): ItemGerado[] {
  const camposIncluidos = camposItemPorTier(tier)
  const itens: ItemGerado[] = []

  function inc<T>(campo: string, valor: T): T | null {
    return camposIncluidos.has(campo) ? valor : null
  }

  for (let seq = 1; seq <= qtdItens; seq++) {
    const ncm = rnd(NCMS_REAIS)
    const qty = rndInt(10, 1000)
    const valorUnit = rndFloat(0.5, 500, 2)
    const valorTotal = (qty * valorUnit).toFixed(2)
    const pesoLiq = rndFloat(0.05, 50, 3)
    const pesoBru = pesoLiq * 1.2
    const cubagem = rndFloat(0.0001, 0.5, 4)
    const unidade = rnd(UNIDADES)

    const fornecedor = rnd(FORNECEDORES_INT)
    const comprador = rnd(COMPRADORES_EXP)

    const item: ItemGerado = {
      id_item: gerarCuid('pite', idxPedido, seq),
      id_organizacao: pedido.id_organizacao,
      id_workspace: pedido.id_workspace,
      id_pedido: pedido.id_pedido,
      sequencia_item_pedido: seq,
      part_number_item: `${ncm.codigo.replace(/\./g, '')}-${seq.toString().padStart(3, '0')}`,
      ncm_item: ncm.codigo,
      descricao_item: ncm.desc,
      quantidade_inicial_item: qty.toFixed(0),
      quantidade_atual_item: qty.toFixed(0),
      quantidade_pronta_item: '0',
      quantidade_transferida_item: '0',
      quantidade_cancelada_item: '0',
      casas_decimais_quantidade_item: 0,
      moeda_item: pedido.moeda_pedido,
      casas_decimais_valor_item: 2,
      cobertura_cambial_item: pedido.cobertura_cambial_pedido ?? 'com_cobertura',
      casas_decimais_peso_item: 3,
      casas_decimais_cubagem_item: 4,
      data_criacao_item: pedido.data_criacao_pedido,
      data_atualizacao_item: pedido.data_atualizacao_pedido,
      data_exclusao_item: null,
      // Opcionais por tier
      unidade_comercializada_item: inc('unidade_comercializada_item', unidade),
      valor_total_item: inc('valor_total_item', valorTotal),
      valor_por_unidade_item: inc('valor_por_unidade_item', valorUnit.toFixed(2)),
      incoterm_item: inc('incoterm_item', pedido.incoterm_pedido),
      data_emissao_item: inc('data_emissao_item', pedido.data_emissao_pedido),
      peso_liquido_unitario_item: inc('peso_liquido_unitario_item', pesoLiq.toFixed(3)),
      peso_bruto_unitario_item: inc('peso_bruto_unitario_item', pesoBru.toFixed(3)),
      cubagem_unitaria_item: inc('cubagem_unitaria_item', cubagem.toFixed(4)),
      // Tier 70+
      nome_exportador_item: inc('nome_exportador_item', pedido.tipo_operacao_pedido === 'importacao' ? fornecedor.nome : 'Gravity Comercio Exportacao Ltda'),
      nome_importador_item: inc('nome_importador_item', pedido.tipo_operacao_pedido === 'importacao' ? 'Gravity Comercio Importacao Ltda' : comprador.nome),
      nome_fabricante_item: inc('nome_fabricante_item', fornecedor.nome),
      referencia_importador_item: inc('referencia_importador_item', `REF-IMP-${idxPedido.toString().padStart(4,'0')}-${seq.toString().padStart(2,'0')}`),
      condicao_pagamento_item: inc('condicao_pagamento_item', pedido.condicao_pagamento_pedido),
      data_prevista_item_pronto: inc('data_prevista_item_pronto', pedido.data_prevista_pedido_pronto),
      data_meta_item_pronto: inc('data_meta_item_pronto', pedido.data_meta_pedido_pronto),
      data_prevista_coleta_item: inc('data_prevista_coleta_item', pedido.data_prevista_coleta_pedido),
      data_meta_coleta_item: inc('data_meta_coleta_item', pedido.data_meta_coleta_pedido),
      // Tier 100
      referencia_exportador_item: inc('referencia_exportador_item', `REF-EXP-${idxPedido.toString().padStart(4,'0')}-${seq.toString().padStart(2,'0')}`),
      referencia_fabricante_item: inc('referencia_fabricante_item', `REF-FAB-${idxPedido.toString().padStart(4,'0')}-${seq.toString().padStart(2,'0')}`),
      dados_extras_importacao_item: inc('dados_extras_importacao_item', { observacao: `Item gerado tier ${tier}`, ncm_descricao: ncm.desc }),
      data_consolidacao_item: pedido.data_consolidacao_pedido,
      data_confirmada_item_pronto: inc('data_confirmada_item_pronto', pedido.data_confirmada_pedido_pronto),
      data_prevista_inspecao_item: inc('data_prevista_inspecao_item', pedido.data_prevista_inspecao_pedido),
      data_confirmada_inspecao_item: inc('data_confirmada_inspecao_item', pedido.data_confirmada_inspecao_pedido),
      data_meta_inspecao_item: inc('data_meta_inspecao_item', pedido.data_meta_inspecao_pedido),
      data_confirmada_coleta_item: inc('data_confirmada_coleta_item', pedido.data_confirmada_coleta_pedido),
    }

    itens.push(item)
  }

  return itens
}

/** Distribuicao triangular: media 5, min 1, max 15 */
export function rndQtdItens(): number {
  const r = Math.random()
  if (r < 0.3) return rndInt(1, 3)
  if (r < 0.7) return rndInt(3, 7)
  if (r < 0.92) return rndInt(7, 11)
  return rndInt(11, 15)
}
