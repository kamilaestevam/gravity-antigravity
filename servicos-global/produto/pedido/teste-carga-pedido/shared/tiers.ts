/**
 * Define quais campos cada tier preenche.
 *
 * Tier 100 = TODOS os campos opcionais preenchidos (alem do nucleo obrigatorio)
 * Tier 70  = Nucleo + maioria dos opcionais; deixa de fora ~25% das datas e refs secundarias
 * Tier 50  = Nucleo + opcionais essenciais; deixa de fora ~50% dos campos opcionais
 *
 * Schema base: pedido (85 colunas), pedido_itens (48 colunas)
 */

// ────────────────────────────────────────────────────────────────────────────
// PEDIDO — 85 colunas
// ────────────────────────────────────────────────────────────────────────────

/** Sempre preenchidos — nao depende do tier */
export const PEDIDO_NUCLEO = new Set<string>([
  // Identidade e isolamento
  'id_pedido', 'id_organizacao', 'id_workspace',
  // Dados basicos sempre obrigatorios ou com default
  'tipo_operacao_pedido', 'numero_pedido', 'status_pedido', 'moeda_pedido',
  'casas_decimais_valor_pedido', 'casas_decimais_quantidade_pedido',
  'casas_decimais_peso_pedido', 'casas_decimais_cubagem_pedido',
  'data_emissao_pedido', 'data_criacao_pedido', 'data_atualizacao_pedido',
])

/** Opcionais "essenciais" — preenchidos em todos os tiers (50, 70, 100) */
export const PEDIDO_OPCIONAIS_ESSENCIAIS = new Set<string>([
  'valor_total_pedido', 'quantidade_total_pedido', 'unidade_comercializada_pedido',
  'incoterm_pedido', 'condicao_pagamento_pedido',
  'peso_liquido_total_pedido', 'peso_bruto_total_pedido', 'cubagem_total_pedido',
  'data_prevista_pedido_pronto', 'data_prevista_coleta_pedido',
  'cnpj_importador_pedido',
])

/** Opcionais "medianos" — preenchidos em tier 70 e 100 (nao em 50) */
export const PEDIDO_OPCIONAIS_MEDIANOS = new Set<string>([
  'numero_proforma_pedido', 'numero_invoice_pedido',
  'referencia_importador_pedido',
  'cobertura_cambial_pedido', 'quantidade_volumes_pedido',
  'data_documento_pedido',
  'data_confirmada_pedido_pronto', 'data_meta_pedido_pronto',
  'data_prevista_inspecao_pedido', 'data_meta_inspecao_pedido',
  'data_confirmada_coleta_pedido', 'data_meta_coleta_pedido',
  'data_previsao_recebimento_draft_pedido', 'data_meta_recebimento_draft_pedido',
  'data_previsao_aprovacao_draft_pedido',  'data_meta_aprovacao_draft_pedido',
  'detalhes_operacionais_pedido',
])

/** Opcionais "completos" — preenchidos APENAS em tier 100 */
export const PEDIDO_OPCIONAIS_COMPLETOS = new Set<string>([
  'referencia_exportador_pedido', 'referencia_fabricante_pedido',
  'valor_total_cambio_pedido', 'moeda_cambio_pedido', 'taxa_cambio_estimada_pedido',
  'contrato_cambio_id_pedido',
  'dados_extras_importacao_pedido', 'ids_origem_consolidacao_pedido',
  'data_documento_proforma_pedido', 'data_documento_invoice_pedido',
  'data_confirmada_inspecao_pedido',
  'data_confirmacao_recebimento_draft_pedido', 'data_confirmacao_aprovacao_draft_pedido',
  'data_previsao_recebimento_draft_proforma_pedido',
  'data_confirmacao_recebimento_draft_proforma_pedido',
  'data_meta_recebimento_draft_proforma_pedido',
  'data_previsao_aprovacao_draft_proforma_pedido',
  'data_confirmacao_aprovacao_draft_proforma_pedido',
  'data_meta_aprovacao_draft_proforma_pedido',
  'data_previsao_envio_original_proforma_pedido',
  'data_confirmacao_envio_original_proforma_pedido',
  'data_meta_envio_original_proforma_pedido',
  'data_previsao_recebimento_original_proforma_pedido',
  'data_confirmacao_recebimento_original_proforma_pedido',
  'data_meta_recebimento_original_proforma_pedido',
  'data_previsao_recebimento_draft_invoice_pedido',
  'data_confirmacao_recebimento_draft_invoice_pedido',
  'data_meta_recebimento_draft_invoice_pedido',
  'data_previsao_aprovacao_draft_invoice_pedido',
  'data_confirmacao_aprovacao_draft_invoice_pedido',
  'data_meta_aprovacao_draft_invoice_pedido',
  'data_previsao_envio_original_invoice_pedido',
  'data_confirmacao_envio_original_invoice_pedido',
  'data_meta_envio_original_invoice_pedido',
  'data_previsao_recebimento_original_invoice_pedido',
  'data_confirmacao_recebimento_original_invoice_pedido',
  'data_meta_recebimento_original_invoice_pedido',
])

/** Resolvedor: dado um tier, retorna conjunto total de campos a preencher */
export function camposPedidoPorTier(tier: 50 | 70 | 100): Set<string> {
  if (tier === 50)  return new Set([...PEDIDO_NUCLEO, ...PEDIDO_OPCIONAIS_ESSENCIAIS])
  if (tier === 70)  return new Set([...PEDIDO_NUCLEO, ...PEDIDO_OPCIONAIS_ESSENCIAIS, ...PEDIDO_OPCIONAIS_MEDIANOS])
  return new Set([...PEDIDO_NUCLEO, ...PEDIDO_OPCIONAIS_ESSENCIAIS, ...PEDIDO_OPCIONAIS_MEDIANOS, ...PEDIDO_OPCIONAIS_COMPLETOS])
}

// ────────────────────────────────────────────────────────────────────────────
// PEDIDO_ITEM — 48 colunas
// ────────────────────────────────────────────────────────────────────────────

export const ITEM_NUCLEO = new Set<string>([
  'id_item', 'id_organizacao', 'id_workspace', 'id_pedido',
  'sequencia_item_pedido', 'part_number_item', 'ncm_item', 'descricao_item',
  'quantidade_inicial_item', 'quantidade_atual_item',
  'quantidade_pronta_item', 'quantidade_transferida_item', 'quantidade_cancelada_item',
  'casas_decimais_quantidade_item', 'moeda_item', 'casas_decimais_valor_item',
  'cobertura_cambial_item',
  'casas_decimais_peso_item', 'casas_decimais_cubagem_item',
  'data_criacao_item', 'data_atualizacao_item',
])

export const ITEM_OPCIONAIS_ESSENCIAIS = new Set<string>([
  'unidade_comercializada_item', 'valor_total_item', 'valor_por_unidade_item',
  'incoterm_item', 'data_emissao_item',
  'peso_liquido_unitario_item', 'peso_bruto_unitario_item', 'cubagem_unitaria_item',
])

export const ITEM_OPCIONAIS_MEDIANOS = new Set<string>([
  'nome_exportador_item', 'nome_importador_item', 'nome_fabricante_item',
  'referencia_importador_item', 'condicao_pagamento_item',
  'data_prevista_item_pronto', 'data_meta_item_pronto',
  'data_prevista_coleta_item', 'data_meta_coleta_item',
])

export const ITEM_OPCIONAIS_COMPLETOS = new Set<string>([
  'referencia_exportador_item', 'referencia_fabricante_item',
  'dados_extras_importacao_item',
  'data_consolidacao_item',
  'data_confirmada_item_pronto',
  'data_prevista_inspecao_item', 'data_confirmada_inspecao_item', 'data_meta_inspecao_item',
  'data_confirmada_coleta_item',
])

export function camposItemPorTier(tier: 50 | 70 | 100): Set<string> {
  if (tier === 50)  return new Set([...ITEM_NUCLEO, ...ITEM_OPCIONAIS_ESSENCIAIS])
  if (tier === 70)  return new Set([...ITEM_NUCLEO, ...ITEM_OPCIONAIS_ESSENCIAIS, ...ITEM_OPCIONAIS_MEDIANOS])
  return new Set([...ITEM_NUCLEO, ...ITEM_OPCIONAIS_ESSENCIAIS, ...ITEM_OPCIONAIS_MEDIANOS, ...ITEM_OPCIONAIS_COMPLETOS])
}

/** Distribui N pedidos em 30/40/30 entre tiers 100/70/50 */
export function distribuirTiers(total: number): Array<50 | 70 | 100> {
  const n100 = Math.round(total * 0.30)
  const n70  = Math.round(total * 0.40)
  const n50  = total - n100 - n70
  const arr: Array<50 | 70 | 100> = []
  for (let i = 0; i < n100; i++) arr.push(100)
  for (let i = 0; i < n70;  i++) arr.push(70)
  for (let i = 0; i < n50;  i++) arr.push(50)
  // Embaralha para distribuir tiers entre os indices
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
