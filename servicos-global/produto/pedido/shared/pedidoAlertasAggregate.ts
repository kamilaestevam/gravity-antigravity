/**
 * pedidoAlertasAggregate.ts — Contagem agregada de alertas (pedido + item).
 *
 * Espelha os ⚠ exibidos na Lista:
 *   - divergências pai/filho (columnAlertConfig + calcularDivergenciasPedido)
 *   - Part Number duplicado no pedido (item + resumo no pai)
 *   - número de pedido duplicado no workspace (config)
 *   - agregados divergentes (valor, quantidade, peso, cubagem — config)
 *   - unidades de peso/cubagem divergentes entre itens (config)
 */

import { calcularDivergenciasPedido } from './pedidoDivergencias.js'
import { marcarPartNumbersDuplicados, pedidoTemPartNumberDuplicado } from './partNumberDuplicado.js'

export interface RegrasAlertasConfig {
  alerta_numero_duplicado: boolean
  alerta_valor_total_divergente: boolean
  alerta_quantidade_total_divergente: boolean
  alerta_quantidade_pronta_divergente: boolean
  alerta_peso_liquido_divergente: boolean
  alerta_peso_bruto_divergente: boolean
  alerta_cubagem_divergente: boolean
}

export const REGRAS_ALERTAS_DEFAULT: RegrasAlertasConfig = {
  alerta_numero_duplicado: true,
  alerta_valor_total_divergente: true,
  alerta_quantidade_total_divergente: true,
  alerta_quantidade_pronta_divergente: true,
  alerta_peso_liquido_divergente: true,
  alerta_peso_bruto_divergente: true,
  alerta_cubagem_divergente: true,
}

export interface AlertasKpis {
  alertas_total: number
  alertas_pedido: number
  alertas_item: number
}

function safeNum(v: unknown): number {
  if (v == null) return 0
  if (typeof v === 'object' && v !== null && 'valor' in (v as object)) {
    return safeNum((v as { valor: unknown }).valor)
  }
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function nearlyEqual(a: number, b: number, eps = 0.001): boolean {
  return Math.abs(a - b) <= eps
}

function contarFlagsDivergentes(divergencias: Record<string, unknown>): number {
  let count = 0
  for (const [key, val] of Object.entries(divergencias)) {
    if (key === '_colunas_usuario_divergentes' && val && typeof val === 'object') {
      count += Object.values(val as Record<string, boolean>).filter(Boolean).length
      continue
    }
    if (key.endsWith('_divergente') && val === true) count++
  }
  return count
}

function unidadesCampoDivergentes(
  itens: ReadonlyArray<Record<string, unknown>>,
  campoValor: string,
  campoUnidade: string,
  unidadePadrao: string,
): boolean {
  if (itens.length < 2) return false
  const unidadesContribuintes = new Set(
    itens
      .filter(i => safeNum(i[campoValor]) > 0)
      .map(i => String(i[campoUnidade] ?? unidadePadrao)),
  )
  const unidadesDeclaradas = new Set(
    itens
      .map(i => i[campoUnidade])
      .filter((u): u is string => u != null && u !== ''),
  )
  const unidadesEfetivas = unidadesContribuintes.size > 0
    ? unidadesContribuintes
    : unidadesDeclaradas
  return unidadesEfetivas.size > 1
}

function contarAlertasAgregadoConfig(
  pedido: Record<string, unknown>,
  itens: ReadonlyArray<Record<string, unknown>>,
  regras: RegrasAlertasConfig,
): number {
  if (itens.length === 0) return 0
  let count = 0

  if (regras.alerta_valor_total_divergente) {
    const db = safeNum(pedido.valor_total_pedido)
    const soma = itens.reduce((s, i) => s + safeNum(i.valor_total_item), 0)
    if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
  }

  if (regras.alerta_quantidade_total_divergente) {
    const db = safeNum(pedido.quantidade_total_pedido)
    const soma = itens.reduce((s, i) => s + safeNum(i.quantidade_inicial_pedido), 0)
    if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
  }

  if (regras.alerta_quantidade_pronta_divergente) {
    const db = safeNum(pedido.quantidade_pronta_itens_pedido_total)
    const soma = itens.reduce((s, i) => s + safeNum(i.quantidade_pronta_pedido), 0)
    if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
  }

  if (regras.alerta_peso_liquido_divergente) {
    if (unidadesCampoDivergentes(itens, 'peso_liquido_unitario', 'peso_liquido_unidade_item', 'KG')) {
      count++
    } else {
      const db = safeNum(pedido.peso_liquido_total_pedido)
      const soma = itens.reduce((s, i) => s + safeNum(i.peso_liquido_unitario), 0)
      if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
    }
  }

  if (regras.alerta_peso_bruto_divergente) {
    if (unidadesCampoDivergentes(itens, 'peso_bruto_unitario', 'peso_bruto_unidade_item', 'KG')) {
      count++
    } else {
      const db = safeNum(pedido.peso_bruto_total_pedido)
      const soma = itens.reduce((s, i) => s + safeNum(i.peso_bruto_unitario), 0)
      if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
    }
  }

  if (regras.alerta_cubagem_divergente) {
    if (unidadesCampoDivergentes(itens, 'cubagem_unitaria', 'cubagem_unidade_item', 'M3')) {
      count++
    } else {
      const db = safeNum(pedido.cubagem_total_pedido)
      const soma = itens.reduce((s, i) => s + safeNum(i.cubagem_unitaria), 0)
      if ((db > 0 || soma > 0) && !nearlyEqual(db, soma)) count++
    }
  }

  return count
}

/** Contagem de alertas de um pedido e seus itens (itens no contrato JSON da Lista). */
export function contarAlertasPedidoEItens(
  pedido: Record<string, unknown>,
  itens: ReadonlyArray<Record<string, unknown>>,
  regras: RegrasAlertasConfig,
  numeroPedidoDuplicado: boolean,
): { alertasPedido: number; alertasItem: number } {
  const itensMarcados = marcarPartNumbersDuplicados(
    itens.map(i => ({ ...i, part_number: i.part_number as string | null | undefined })),
  )

  const alertasItem = itensMarcados.filter(i => i.part_number_duplicado_no_pedido === true).length

  const divergencias = calcularDivergenciasPedido(itensMarcados, pedido)
  let alertasPedido = contarFlagsDivergentes(divergencias)

  if (pedidoTemPartNumberDuplicado(itensMarcados)) alertasPedido++

  if (regras.alerta_numero_duplicado && numeroPedidoDuplicado) alertasPedido++

  alertasPedido += contarAlertasAgregadoConfig(pedido, itensMarcados, regras)

  return { alertasPedido, alertasItem }
}

export function buildMapNumerosPedidoDuplicados(
  pedidos: ReadonlyArray<{ numero_pedido?: string | null }>,
): Map<string, number> {
  const map = new Map<string, number>()
  for (const p of pedidos) {
    const n = String(p.numero_pedido ?? '').trim()
    if (!n) continue
    map.set(n, (map.get(n) ?? 0) + 1)
  }
  return map
}

export function aggregateAlertasKpis(
  pedidos: ReadonlyArray<Record<string, unknown>>,
  itensByPedido: Map<string, ReadonlyArray<Record<string, unknown>>>,
  regras: RegrasAlertasConfig = REGRAS_ALERTAS_DEFAULT,
): AlertasKpis {
  const numerosMap = buildMapNumerosPedidoDuplicados(
    pedidos as Array<{ numero_pedido?: string | null }>,
  )

  let alertas_pedido = 0
  let alertas_item = 0

  for (const p of pedidos) {
    const pid = String(p.id_pedido ?? p.id ?? '')
    const itens = itensByPedido.get(pid) ?? []
    const numero = String(p.numero_pedido ?? '').trim()
    const numeroDup = numero !== '' && (numerosMap.get(numero) ?? 0) > 1

    const { alertasPedido, alertasItem } = contarAlertasPedidoEItens(
      p,
      itens,
      regras,
      numeroDup,
    )
    alertas_pedido += alertasPedido
    alertas_item += alertasItem
  }

  return {
    alertas_pedido,
    alertas_item,
    alertas_total: alertas_pedido + alertas_item,
  }
}
