/**
 * columnBehaviorConfig.ts — Fonte única de verdade para comportamento de colunas do Pedido.
 *
 * REGRA: todo comportamento de coluna (editavel, somar, alerta) é derivado do TIPO.
 * Nunca hardcode editavel/somar/alerta diretamente em colunasPai ou colunasFilho.
 *
 * Tipos disponíveis:
 *   - alfanumerico   → editável, sem soma, com alerta de divergência
 *   - calculado      → não editável, soma de itens, sem alerta
 *   - saldo          → não editável, derivado de calculados, sem alerta
 *   - somente_leitura → não editável, sem soma, sem alerta
 *
 * Exceções (mínimas): declaradas aqui via editavelFn, nunca nos componentes.
 */

import type { Pedido } from './types'
export { isPropagavel } from '../../../shared/mapaPropagacaoPedidoItem'
export { isAlertavel, getAlertavelKeys } from '../../../shared/columnAlertConfig'

// ── Tipos ────────────────────────────────────────────────────────────────────

export type TipoCampo = 'alfanumerico' | 'calculado' | 'saldo' | 'somente_leitura'

interface ColunaBehavior {
  tipo: TipoCampo
  /** Sobrescreve editavel do tipo — apenas para exceções reais */
  editavelFn?: (row: Pedido) => boolean
}

// ── Defaults por tipo ────────────────────────────────────────────────────────

const TIPO_DEFAULTS: Record<TipoCampo, { editavel: boolean; somar: boolean; alerta: boolean }> = {
  alfanumerico:    { editavel: true,  somar: false, alerta: true  },
  calculado:       { editavel: false, somar: true,  alerta: false },
  saldo:           { editavel: false, somar: true,  alerta: false },
  somente_leitura: { editavel: false, somar: false, alerta: false },
}

// ── Registro de colunas ──────────────────────────────────────────────────────

const COLUMN_CONFIG: Record<string, ColunaBehavior> = {

  // ── Alfanumérico — editável, sem soma ───────────────────────────────────────
  numero_pedido:             { tipo: 'alfanumerico' },
  tipo_operacao:             { tipo: 'alfanumerico' },
  nome_fabricante:           { tipo: 'alfanumerico' },
  referencia_importador:     { tipo: 'alfanumerico' },
  referencia_exportador:     { tipo: 'alfanumerico' },
  ncm:                       { tipo: 'alfanumerico' },
  descricao_item:            { tipo: 'alfanumerico' },
  numero_proforma:           { tipo: 'alfanumerico' },
  numero_invoice:            { tipo: 'alfanumerico' },
  incoterm:                  { tipo: 'alfanumerico' },
  porto_origem:              { tipo: 'alfanumerico' },
  porto_destino:             { tipo: 'alfanumerico' },
  local_de_origem:           { tipo: 'alfanumerico' },
  local_de_destino:          { tipo: 'alfanumerico' },
  aeroporto_origem:          { tipo: 'alfanumerico' },
  aeroporto_destino:         { tipo: 'alfanumerico' },
  data_emissao_pedido:       { tipo: 'alfanumerico' },
  referencia_fabricante:     { tipo: 'alfanumerico' },
  cobertura_cambial:              { tipo: 'alfanumerico' },
  condicao_pagamento:             { tipo: 'alfanumerico' },
  condicao_pagamento_siscomex:    { tipo: 'alfanumerico' },
  unidade_comercializada_pedido: { tipo: 'alfanumerico' },

  // ── Exceções: editavel depende do tipo de operação ──────────────────────────
  // IMP: fornecedores exportadores. EXP: lista workspaces (handler redireciona para id_workspace).
  nome_exportador: {
    tipo: 'alfanumerico',
    editavelFn: (row) => row.tipo_operacao === 'importacao' || row.tipo_operacao === 'exportacao',
  },
  // IMP: coluna lista workspaces (handler redireciona para id_workspace). EXP: fornecedores importadores.
  nome_importador: {
    tipo: 'alfanumerico',
    editavelFn: (row) => row.tipo_operacao === 'importacao' || row.tipo_operacao === 'exportacao',
  },

  // ── Calculado — soma de itens, não editável ─────────────────────────────────
  valor_total_pedido:                   { tipo: 'calculado' },
  valor_item:                           { tipo: 'calculado' },
  quantidade_total_pedido:      { tipo: 'calculado' },
  quantidade_pronta_itens_pedido_total: { tipo: 'calculado' },
  quantidade_transferida_total:         { tipo: 'calculado' },
  quantidade_cancelada_total_pedido:    { tipo: 'calculado' },
  peso_liquido_total_pedido:            { tipo: 'calculado' },
  peso_bruto_total_pedido:              { tipo: 'calculado' },
  cubagem_total_pedido:                 { tipo: 'calculado' },
  quantidade_volumes_pedido:            { tipo: 'calculado' },
  moeda_cambio_pedido:                  { tipo: 'alfanumerico' },
  taxa_cambio_estimada:                 { tipo: 'somente_leitura' },
  valor_total_cambio_pedido:            { tipo: 'calculado' },

  // ── Saldo — derivado de calculados via fórmula ──────────────────────────────
  saldo_itens_do_pedido: { tipo: 'saldo' },

  // ── Somente leitura — view, sem edição, sem soma ────────────────────────────
  status:                          { tipo: 'somente_leitura' },
  pais_exportador:                 { tipo: 'somente_leitura' },
  estado_exportador:               { tipo: 'somente_leitura' },
  cidade_exportador:               { tipo: 'somente_leitura' },
  endereco_exportador:             { tipo: 'somente_leitura' },
  zip_code_exportador:             { tipo: 'somente_leitura' },
  // ── Datas — editável, com alerta de divergência ─────────────────────────────
  // Pedido Pronto
  data_prevista_pedido_pronto:     { tipo: 'alfanumerico' },
  data_confirmada_pedido_pronto:   { tipo: 'alfanumerico' },
  data_meta_pedido_pronto:         { tipo: 'alfanumerico' },
  // Inspeção
  data_prevista_inspecao_pedido:   { tipo: 'alfanumerico' },
  data_confirmada_inspecao_pedido: { tipo: 'alfanumerico' },
  data_meta_inspecao_pedido:       { tipo: 'alfanumerico' },
  // Coleta
  data_prevista_coleta_pedido:     { tipo: 'alfanumerico' },
  data_confirmada_coleta_pedido:   { tipo: 'alfanumerico' },
  data_meta_coleta_pedido:         { tipo: 'alfanumerico' },
  // Consolidação + Transferência
  data_consolidacao_pedido:        { tipo: 'alfanumerico' },
  data_transferencia_saldo_pedido: { tipo: 'alfanumerico' },
  // Rascunho Pedido — Recebimento
  data_prevista_recebimento_rascunho_pedido:   { tipo: 'alfanumerico' },
  data_confirmada_recebimento_rascunho_pedido: { tipo: 'alfanumerico' },
  data_meta_recebimento_rascunho_pedido:       { tipo: 'alfanumerico' },
  // Rascunho Pedido — Aprovação
  data_prevista_aprovacao_rascunho_pedido:     { tipo: 'alfanumerico' },
  data_confirmada_aprovacao_rascunho_pedido:   { tipo: 'alfanumerico' },
  data_meta_aprovacao_rascunho_pedido:         { tipo: 'alfanumerico' },
  // Documento Pedido
  data_documento_pedido:                       { tipo: 'alfanumerico' },
  // Proforma — Recebimento Rascunho
  data_prevista_recebimento_rascunho_proforma:    { tipo: 'alfanumerico' },
  data_confirmada_recebimento_rascunho_proforma:  { tipo: 'alfanumerico' },
  data_meta_recebimento_rascunho_proforma:        { tipo: 'alfanumerico' },
  // Proforma — Aprovação Rascunho
  data_prevista_aprovacao_rascunho_proforma:      { tipo: 'alfanumerico' },
  data_confirmada_aprovacao_rascunho_proforma:    { tipo: 'alfanumerico' },
  data_meta_aprovacao_rascunho_proforma:          { tipo: 'alfanumerico' },
  // Proforma — Envio Original
  data_prevista_envio_original_proforma:          { tipo: 'alfanumerico' },
  data_confirmada_envio_original_proforma:        { tipo: 'alfanumerico' },
  data_meta_envio_original_proforma:              { tipo: 'alfanumerico' },
  // Proforma — Recebimento Original
  data_prevista_recebimento_original_proforma:    { tipo: 'alfanumerico' },
  data_confirmada_recebimento_original_proforma:  { tipo: 'alfanumerico' },
  data_meta_recebimento_original_proforma:        { tipo: 'alfanumerico' },
  // Documento Proforma
  data_proforma_invoice:                          { tipo: 'alfanumerico' },
  // Invoice — Recebimento Rascunho
  data_prevista_recebimento_rascunho_invoice:    { tipo: 'alfanumerico' },
  data_confirmada_recebimento_rascunho_invoice:  { tipo: 'alfanumerico' },
  data_meta_recebimento_rascunho_invoice:        { tipo: 'alfanumerico' },
  // Invoice — Aprovação Rascunho
  data_prevista_aprovacao_rascunho_invoice:      { tipo: 'alfanumerico' },
  data_confirmada_aprovacao_rascunho_invoice:    { tipo: 'alfanumerico' },
  data_meta_aprovacao_rascunho_invoice:          { tipo: 'alfanumerico' },
  // Invoice — Envio Original
  data_prevista_envio_original_invoice:          { tipo: 'alfanumerico' },
  data_confirmada_envio_original_invoice:        { tipo: 'alfanumerico' },
  data_meta_envio_original_invoice:              { tipo: 'alfanumerico' },
  // Invoice — Recebimento Original
  data_prevista_recebimento_original_invoice:    { tipo: 'alfanumerico' },
  data_confirmada_recebimento_original_invoice:  { tipo: 'alfanumerico' },
  data_meta_recebimento_original_invoice:        { tipo: 'alfanumerico' },
  // Documento Invoice
  data_invoice:                                  { tipo: 'alfanumerico' },
}

// ── Comportamento no nível ITEM (filho) ──────────────────────────────────────
//
// Regra: campos "calculado" no PEDIDO são editáveis no ITEM (cada item tem seu valor).
// Campos "saldo" e "somente_leitura" nunca são editáveis em nenhum nível.
// Exceções condicionais (nome_exportador, nome_importador) permanecem no mapa filho.

const ALERTA_OVERRIDE: Record<string, boolean> = {
  id_workspace: false, // replica automática do pedido — sem alerta de divergência
  tipo_operacao: false, // replica do pedido — sem alerta de divergência
  descricao_item: false, // ghost — várias descrições no pedido; sem alerta
  ncm: false, // ghost — vários NCMs no mesmo pedido é normal; sem alerta
  status: true, // pedido ≠ item ou item ≠ item → alerta na coluna Status
  // Logística: valor único no Pedido — itens só espelham _p (sem divergência real)
  porto_origem: false,
  porto_destino: false,
  local_de_origem: false,
  local_de_destino: false,
  aeroporto_origem: false,
  aeroporto_destino: false,
}

const TIPO_DEFAULTS_ITEM: Record<TipoCampo, boolean> = {
  alfanumerico:    true,
  calculado:       true,  // item tem valor próprio que alimenta o total do pedido
  saldo:           false, // derivado — nunca editável
  somente_leitura: false,
}

// Colunas que fogem ao padrão do tipo no nível item
const ITEM_EDITAVEL_OVERRIDE: Record<string, boolean> = {
  id_workspace:                 false, // exclusivo do pedido — replica para itens
  tipo_operacao:                false, // exclusivo do pedido — replica para itens
  status:                       true,  // item herda status mas pode ser editado
  quantidade_transferida_total: false, // só muda via operação de transferência
  quantidade_cancelada_total_pedido: false, // só muda via cancelamento
  // Logística: valor no Pedido; edição na linha item roteia para PATCH pedido (Pedidos.tsx)
  porto_origem:                 false,
  porto_destino:                false,
  local_de_origem:              false,
  local_de_destino:             false,
  aeroporto_origem:             false,
  aeroporto_destino:            false,
  // Câmbio: moeda câmbio é editável independente no item (mirror cobertura_cambial).
  // Pedido e item têm valor próprio; alerta de divergência quando diferem.
}

// ── API pública ──────────────────────────────────────────────────────────────

/** Retorna editavel para uso direto em GTColuna */
export function getEditavel(key: string): boolean | ((row: Pedido) => boolean) {
  const cfg = COLUMN_CONFIG[key]
  if (!cfg) return false
  if (cfg.editavelFn) return cfg.editavelFn
  return TIPO_DEFAULTS[cfg.tipo].editavel
}

/** True se a coluna é soma de itens (calculado ou saldo) */
export function isSomavel(key: string): boolean {
  const cfg = COLUMN_CONFIG[key]
  if (!cfg) return false
  return TIPO_DEFAULTS[cfg.tipo].somar
}

/** True se a coluna pode ter alerta de divergência entre itens */
export function hasAlerta(key: string): boolean {
  if (key in ALERTA_OVERRIDE) return ALERTA_OVERRIDE[key]
  const cfg = COLUMN_CONFIG[key]
  if (!cfg) return false
  return TIPO_DEFAULTS[cfg.tipo].alerta
}

/**
 * Retorna editavel para o nível ITEM (colunasFilho).
 * Exceções condicionais (nome_exportador, nome_importador) ficam em colunasFilho
 * pois dependem de PedidoItemEnriquecido, tipo local daquele arquivo.
 */
export function getEditavelItem(key: string): boolean {
  if (key in ITEM_EDITAVEL_OVERRIDE) return ITEM_EDITAVEL_OVERRIDE[key]
  const cfg = COLUMN_CONFIG[key]
  if (!cfg) return false
  return TIPO_DEFAULTS_ITEM[cfg.tipo]
}

/** Retorna o tipo do campo ou null se não registrado */
export function getTipoCampo(key: string): TipoCampo | null {
  return COLUMN_CONFIG[key]?.tipo ?? null
}

/**
 * Coluna não editável em nenhum nível (pedido e item).
 * Usado pela GTV para texto muted; se só o pedido bloqueia mas o item edita, retorna false.
 */
export function isColunaSomenteLeituraCompleta(key: string): boolean {
  if (getEditavelItem(key)) return false
  const cfg = COLUMN_CONFIG[key]
  if (!cfg) return false
  if (cfg.editavelFn) return false
  return !TIPO_DEFAULTS[cfg.tipo].editavel
}
