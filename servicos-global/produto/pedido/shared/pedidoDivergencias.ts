/**
 * pedidoDivergencias.ts — Cálculo puro de flags de divergência pai/filho (SSOT).
 *
 * Espelha calcularDivergencias() da Lista (Pedidos.tsx).
 * Usado por contagem de alertas e pela UI após expandir itens.
 */

import { getAlertavelKeys } from './columnAlertConfig.js'

const CAMPOS_GHOST = new Set(['ncm', 'cobertura_cambial', 'data_emissao_pedido'])

function dateKey(v: unknown): string | null {
  if (v == null) return null
  const s = String(v)
  if (!s) return null
  const d = new Date(s)
  if (!isNaN(d.getTime())) {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const dd = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }
  return s.substring(0, 10) || null
}

export type DivergenciasPedido = Record<string, unknown>

/** Recalcula flags `{campo}_divergente` a partir dos itens carregados. */
export function calcularDivergenciasPedido(
  itens: ReadonlyArray<Record<string, unknown>>,
  pedidoPai?: Record<string, unknown>,
): DivergenciasPedido {
  const result: Record<string, unknown> = {}

  for (const campo of getAlertavelKeys()) {
    const valores = itens
      .map(i => i[campo])
      .filter((v): v is string => v != null && v !== '')
    const distintos = new Set(valores).size
    result[`${campo}_divergente`] = distintos > 1
    if (CAMPOS_GHOST.has(campo)) {
      result[`${campo}_valor_unico`] = distintos === 1 ? valores[0] : null
    }
  }

  {
    // Workspace: compara id do pai (id_workspace) com company_id do item (ACL JSON).
    const wsPai = (pedidoPai?.id_workspace ?? pedidoPai?.company_id ?? null) as string | null
    const wsItens = itens
      .map(i => (i.company_id ?? i.id_workspace) as string | null | undefined)
      .filter((v): v is string => v != null && v !== '')
    const wsUnicos = new Set(wsItens)
    let wsDivergente = wsUnicos.size > 1
    if (!wsDivergente && wsPai && wsItens.length > 0) {
      wsDivergente = wsItens.some(u => u !== wsPai)
    }
    result.id_workspace_divergente = wsDivergente
  }

  {
    const unidadesItens = itens
      .map(i => i.unidade_comercializada_item)
      .filter((u): u is string => u != null && u !== '')
    const unidadesUnicas = new Set(unidadesItens)
    const unidadePai = pedidoPai?.unidade_comercializada_pedido ?? null
    let unidadeDivergente = unidadesUnicas.size > 1
    if (!unidadeDivergente && unidadePai && unidadesItens.length > 0) {
      unidadeDivergente = unidadesItens.some(u => u !== unidadePai)
    }
    result.unidade_comercializada_item_divergente = unidadeDivergente
  }

  const ncms = itens.map(i => i.ncm).filter((v): v is string => v != null && v !== '')
  const ncmsUnicos = new Set(ncms)
  result.ncms_distintos_count = ncmsUnicos.size
  result.ncm_divergente = ncmsUnicos.size > 1
  result.ncm_valor_unico = ncmsUnicos.size === 1 ? [...ncmsUnicos][0] : null

  const datasItens = itens
    .map(i => dateKey(i.data_emissao_pedido))
    .filter((v): v is string => v != null)
  const datasUnicas = new Set(datasItens)
  const dataPai = dateKey(pedidoPai?.data_emissao_pedido)
  let dataEmissaoDivergente = datasUnicas.size > 1
  if (!dataEmissaoDivergente && dataPai && datasUnicas.size === 1) {
    const dataUnicaItens = [...datasUnicas][0]
    if (dataUnicaItens !== dataPai) dataEmissaoDivergente = true
  }
  result.data_emissao_pedido_divergente = dataEmissaoDivergente
  result.data_emissao_pedido_valor_unico = datasUnicas.size === 1 ? [...datasUnicas][0] : null

  const colIdsSet = new Set<string>()
  for (const item of itens) {
    const cu = item._colunas_usuario as Record<string, string> | undefined
    if (cu) for (const k of Object.keys(cu)) colIdsSet.add(k)
  }
  const paiCu = pedidoPai?._colunas_usuario as Record<string, string> | undefined
  const divergenciasCustom: Record<string, boolean> = {}
  for (const colId of colIdsSet) {
    const valoresItens = itens
      .map(i => (i._colunas_usuario as Record<string, string> | undefined)?.[colId])
      .filter((v): v is string => v != null && v !== '')
    const distintos = new Set(valoresItens)
    let div = distintos.size > 1
    if (!div && paiCu?.[colId] && distintos.size === 1) {
      div = [...distintos][0] !== paiCu[colId]
    }
    divergenciasCustom[colId] = div
  }
  result['_colunas_usuario_divergentes'] = divergenciasCustom

  return result
}
