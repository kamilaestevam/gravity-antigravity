/**
 * constants.ts — Enums e constantes compartilhadas do módulo processos-core
 *
 * Fonte única de verdade para os valores aceitos em campos de string
 * que representam domínios fechados (status, tipo_operacao, moeda, etc.).
 *
 * Usado em:
 *   - Schemas Zod (validação de entrada)
 *   - Lógica de negócio (comparações de string type-safe)
 *   - OpenAPI spec (gerada via zod-to-openapi)
 */

import { z } from 'zod'

// ── Pedido ─────────────────────────────────────────────────────────────────────

export const TIPO_OPERACAO = ['importacao', 'exportacao'] as const
export type TipoOperacao = (typeof TIPO_OPERACAO)[number]
export const TipoOperacaoSchema = z.enum(TIPO_OPERACAO)

export const STATUS_PEDIDO = ['aberto', 'transferencia', 'consolidado', 'cancelado'] as const
export type StatusPedido = (typeof STATUS_PEDIDO)[number]
export const StatusPedidoSchema = z.enum(STATUS_PEDIDO)

export const COBERTURA_CAMBIAL = ['com_cobertura', 'sem_cobertura'] as const
export type CoberturaCambial = (typeof COBERTURA_CAMBIAL)[number]
export const CoberturaCambialSchema = z.enum(COBERTURA_CAMBIAL)

// ── Moedas ISO 4217 (subconjunto mais usado em COMEX) ─────────────────────────

export const MOEDAS_COMEX = [
  'USD', // Dólar americano
  'EUR', // Euro
  'BRL', // Real brasileiro
  'CNY', // Yuan chinês
  'JPY', // Iene japonês
  'GBP', // Libra esterlina
  'CHF', // Franco suíço
  'ARS', // Peso argentino
  'MXN', // Peso mexicano
  'CLP', // Peso chileno
  'COP', // Peso colombiano
  'PEN', // Sol peruano
  'UYU', // Peso uruguaio
] as const
export type MoedaComex = (typeof MOEDAS_COMEX)[number]
export const MoedaComexSchema = z.enum(MOEDAS_COMEX)

// ── Unidades de medida ─────────────────────────────────────────────────────────

export const UNIDADES_MEDIDA = [
  'UN',  // Unidade
  'KG',  // Quilograma
  'G',   // Grama
  'TON', // Tonelada métrica
  'LB',  // Libra
  'M2',  // Metro quadrado
  'M3',  // Metro cúbico
  'L',   // Litro
  'CX',  // Caixa
  'PC',  // Peça
  'PAR', // Par
  'SET', // Conjunto
] as const
export type UnidadeMedida = (typeof UNIDADES_MEDIDA)[number]
export const UnidadeMedidaSchema = z.enum(UNIDADES_MEDIDA)

// ── Incoterms 2020 ─────────────────────────────────────────────────────────────

export const INCOTERMS = [
  'EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', // Qualquer modal
  'FAS', 'FOB', 'CFR', 'CIF',                         // Marítimo/fluvial
] as const
export type Incoterm = (typeof INCOTERMS)[number]
export const IncotermSchema = z.enum(INCOTERMS)

// ── Status de embarque (Processo) ──────────────────────────────────────────────

export const STATUS_EMBARQUE = [
  'aberto',
  'em_andamento',
  'aguardando_embarque',
  'embarcado',
  'em_transito',
  'chegou_destino',
  'em_despacho',
  'liberado',
  'entregue',
  'cancelado',
] as const
export type StatusEmbarque = (typeof STATUS_EMBARQUE)[number]
export const StatusEmbarqueSchema = z.enum(STATUS_EMBARQUE)
