/**
 * pedidoDivergencias.ts — Cálculo puro de flags de divergência pai/filho (SSOT).
 *
 * Espelha calcularDivergencias() da Lista (Pedidos.tsx).
 * Usado por contagem de alertas e pela UI após expandir itens.
 */

import { getAlertavelKeys } from './columnAlertConfig.js'

const CAMPOS_GHOST = new Set(['ncm', 'data_emissao_pedido'])

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

/** Status efetivo na linha item — `_p.status` (UI), sem coluna no PedidoItem. */
export function lerStatusEfetivoItem(item: Record<string, unknown>): string | null {
  const p = item._p as { status?: string } | undefined
  const viaP = p?.status
  if (viaP != null && String(viaP) !== '') return String(viaP)
  const direto = item.status
  if (direto != null && String(direto) !== '') return String(direto)
  return null
}

/** Pedido ≠ item ou item ≠ item → alerta na coluna Status. */
export function calcularStatusDivergente(
  itens: ReadonlyArray<Record<string, unknown>>,
  pedidoPai?: Record<string, unknown>,
): boolean {
  const statusPai = pedidoPai?.status != null && String(pedidoPai.status) !== ''
    ? String(pedidoPai.status)
    : null
  const statusItens = itens
    .map(lerStatusEfetivoItem)
    .filter((v): v is string => v != null && v !== '')
  if (statusItens.length === 0) {
    return inferirStatusDivergenteSemItensCarregados(pedidoPai)
  }
  const distintos = new Set(statusItens).size
  if (distintos > 1) return true
  if (statusPai != null) {
    return statusItens.some(s => s !== statusPai)
  }
  return false
}

/** Indica se o pedido provavelmente tem itens (list view — itens ainda não expandidos). */
export function pedidoPossuiItensNaLista(pedido?: Record<string, unknown> | null): boolean {
  if (!pedido) return false
  if ((pedido.itens as unknown[] | undefined)?.length) return true
  const qtd = Number(pedido.quantidade_total_pedido)
  if (!Number.isNaN(qtd) && qtd > 0) return true
  const saldo = Number(pedido.saldo_itens_do_pedido)
  if (!Number.isNaN(saldo) && saldo > 0) return true
  const ncms = Number(pedido.ncms_distintos_count)
  if (!Number.isNaN(ncms) && ncms > 0) return true
  return false
}

/**
 * Alerta na linha pai quando o status mudou sem replicar e os itens ainda não
 * foram carregados no state (cache vazio).
 */
export function inferirStatusDivergenteSemItensCarregados(
  pedidoPai?: Record<string, unknown> | null,
): boolean {
  if (!pedidoPai) return false
  if (pedidoPai.status_divergente === true) return true
  const snapshot = pedidoPai.status_itens_snapshot
  if (snapshot == null || String(snapshot) === '') return false
  const statusPai = pedidoPai.status != null && String(pedidoPai.status) !== ''
    ? String(pedidoPai.status)
    : null
  if (statusPai == null) return false
  return String(snapshot) !== statusPai && pedidoPossuiItensNaLista(pedidoPai)
}

/** Status efetivo do item ao expandir — preserva snapshot quando há divergência pendente. */
export function resolverStatusEfetivoItemAoCarregar(
  pedidoPai?: Record<string, unknown> | null,
): string | null {
  if (!pedidoPai) return null
  const statusPai = pedidoPai.status != null && String(pedidoPai.status) !== ''
    ? String(pedidoPai.status)
    : null
  if (inferirStatusDivergenteSemItensCarregados(pedidoPai)) {
    const snapshot = pedidoPai.status_itens_snapshot
    if (snapshot != null && String(snapshot) !== '') return String(snapshot)
  }
  return statusPai
}

/** Recalcula flags `{campo}_divergente` a partir dos itens carregados. */
export function calcularDivergenciasPedido(
  itens: ReadonlyArray<Record<string, unknown>>,
  pedidoPai?: Record<string, unknown>,
): DivergenciasPedido {
  const result: Record<string, unknown> = {}

  for (const campo of getAlertavelKeys()) {
    const valorPai = pedidoPai?.[campo]
    const valoresItens = itens
      .map(i => i[campo])
      .filter((v): v is string => v != null && v !== '')
    const distintos = new Set(valoresItens).size
    let divergente = distintos > 1

    // Pai com valor canônico: alerta se algum item preenchido difere (ex: pedido "abc", item "cde").
    if (!divergente && valorPai != null && String(valorPai) !== '') {
      const paiStr = String(valorPai)
      if (valoresItens.some(v => String(v) !== paiStr)) {
        divergente = true
      }
    }

    result[`${campo}_divergente`] = divergente
    if (CAMPOS_GHOST.has(campo)) {
      result[`${campo}_valor_unico`] = distintos === 1 ? valoresItens[0] : null
    }
  }

  {
    // Workspace: edição no pedido replica sempre — sem alerta de divergência na UI (decisão 2026-06).
    result.id_workspace_divergente = false
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

  {
    const tiposItens = itens
      .map(i => i.tipo_volume_item)
      .filter((u): u is string => u != null && u !== '')
    const tiposUnicos = new Set(tiposItens)
    const tipoPai = pedidoPai?.tipo_volume_pedido ?? null
    let tipoDivergente = tiposUnicos.size > 1
    if (!tipoDivergente && tipoPai && tiposItens.length > 0) {
      tipoDivergente = tiposItens.some(u => u !== tipoPai)
    }
    result.tipo_volume_item_divergente = tipoDivergente
  }

  const ncms = itens.map(i => i.ncm).filter((v): v is string => v != null && v !== '')
  const ncmsUnicos = new Set(ncms)
  result.ncms_distintos_count = ncmsUnicos.size
  // NCM: vários códigos no mesmo pedido é cenário normal — sem alerta âmbar na UI.
  result.ncm_divergente = false
  result.ncm_valor_unico = ncmsUnicos.size === 1 ? [...ncmsUnicos][0] : null

  // Descrição: valor único na linha pai quando todos os itens coincidem — sem alerta ⚠.
  const descricoes = itens
    .map(i => i.descricao_item)
    .filter((v): v is string => v != null && String(v).trim() !== '')
  const descricoesUnicas = new Set(descricoes.map(d => String(d)))
  result.descricao_item_valor_unico = descricoesUnicas.size === 1 ? [...descricoesUnicas][0] : null

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

  {
    const coberturasItens = itens
      .map(i => i.cobertura_cambial)
      .filter((v): v is string => v != null && String(v).trim() !== '')
    const coberturasUnicas = new Set(coberturasItens)
    const canonico = pedidoPai?.cobertura_cambial ?? pedidoPai?.cobertura_cambial_pedido
    const canonicoStr = canonico != null && String(canonico).trim() !== '' ? String(canonico) : null
    let divergente = coberturasUnicas.size > 1
    if (!divergente && canonicoStr && coberturasItens.length > 0) {
      divergente = coberturasItens.some(v => String(v) !== canonicoStr)
    }
    result.cobertura_cambial_divergente = divergente
    result.cobertura_cambial_valor_unico = canonicoStr
      ?? (coberturasUnicas.size === 1 ? [...coberturasUnicas][0] : null)
  }

  {
    const moedasItens = itens
      .map(i => i.moeda_cambio_item_pedido)
      .filter((v): v is string => v != null && String(v).trim() !== '')
    const moedasUnicas = new Set(moedasItens)
    const canonico = pedidoPai?.moeda_cambio_pedido
    const canonicoStr = canonico != null && String(canonico).trim() !== '' ? String(canonico) : null
    let divergente = moedasUnicas.size > 1
    if (!divergente && canonicoStr && moedasItens.length > 0) {
      divergente = moedasItens.some(v => String(v) !== canonicoStr)
    }
    result.moeda_cambio_pedido_divergente = divergente
    result.moeda_cambio_pedido_valor_unico = canonicoStr
      ?? (moedasUnicas.size === 1 ? [...moedasUnicas][0] : null)
  }

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

  result.status_divergente = calcularStatusDivergente(itens, pedidoPai)

  return result
}

/** Valor exibido na linha pai — canônico do pedido tem prioridade sobre NCM único dos itens. */
export function obterNcmExibicaoPedido(
  pedido?: Record<string, unknown> | null,
): string | null {
  const canonico = pedido?.ncm
  if (canonico != null && String(canonico).trim() !== '') return String(canonico)
  const agregado = pedido?.ncm_valor_unico
  if (agregado != null && String(agregado).trim() !== '') return String(agregado)
  return null
}

/** Valor exibido na linha pai — canônico do pedido tem prioridade sobre agregado dos itens. */
export function obterDescricaoExibicaoPedido(
  pedido?: Record<string, unknown> | null,
): string | null {
  const canonico = pedido?.descricao_item
  if (canonico != null && String(canonico).trim() !== '') return String(canonico)
  const agregado = pedido?.descricao_item_valor_unico
  if (agregado != null && String(agregado).trim() !== '') return String(agregado)
  return null
}

/**
 * Após recalcular divergências, mantém `descricao_item` / exibição do pedido quando o
 * usuário gravou só na linha pai (sem replicar nos itens).
 */
export function mesclarDivergenciasPreservandoDescricaoPedido(
  pedidoPai: Record<string, unknown> | undefined,
  divergencias: DivergenciasPedido,
): DivergenciasPedido {
  const canonico = obterDescricaoExibicaoPedido(pedidoPai)
  if (!canonico) return divergencias
  return {
    ...divergencias,
    descricao_item_valor_unico: canonico,
  }
}

/**
 * Após recalcular divergências, mantém `ncm` / exibição do pedido quando o
 * usuário gravou só na linha pai (sem replicar nos itens).
 */
export function mesclarDivergenciasPreservandoNcmPedido(
  pedidoPai: Record<string, unknown> | undefined,
  divergencias: DivergenciasPedido,
): DivergenciasPedido {
  const canonico = obterNcmExibicaoPedido(pedidoPai)
  if (!canonico) return divergencias
  return {
    ...divergencias,
    ncm_valor_unico: canonico,
  }
}

/** Valor exibido na linha pai — canônico do pedido tem prioridade sobre agregado dos itens. */
export function obterCoberturaExibicaoPedido(
  pedido?: Record<string, unknown> | null,
): string | null {
  const canonico = pedido?.cobertura_cambial ?? pedido?.cobertura_cambial_pedido
  if (canonico != null && String(canonico).trim() !== '') return String(canonico)
  const agregado = pedido?.cobertura_cambial_valor_unico
  if (agregado != null && String(agregado).trim() !== '') return String(agregado)
  return null
}

/** Mantém cobertura canônica do pedido após recalcular divergências dos itens. */
export function mesclarDivergenciasPreservandoCoberturaPedido(
  pedidoPai: Record<string, unknown> | undefined,
  divergencias: DivergenciasPedido,
): DivergenciasPedido {
  const canonico = obterCoberturaExibicaoPedido(pedidoPai)
  if (!canonico) return divergencias
  return {
    ...divergencias,
    cobertura_cambial_valor_unico: canonico,
  }
}

/** Valor exibido na linha pai — canônico do pedido tem prioridade sobre agregado dos itens. */
export function obterMoedaCambioExibicaoPedido(
  pedido?: Record<string, unknown> | null,
): string | null {
  const canonico = pedido?.moeda_cambio_pedido
  if (canonico != null && String(canonico).trim() !== '') return String(canonico)
  const agregado = pedido?.moeda_cambio_pedido_valor_unico
  if (agregado != null && String(agregado).trim() !== '') return String(agregado)
  return null
}

/** Mantém moeda câmbio canônica do pedido após recalcular divergências dos itens. */
export function mesclarDivergenciasPreservandoMoedaCambioPedido(
  pedidoPai: Record<string, unknown> | undefined,
  divergencias: DivergenciasPedido,
): DivergenciasPedido {
  const canonico = obterMoedaCambioExibicaoPedido(pedidoPai)
  if (!canonico) return divergencias
  return {
    ...divergencias,
    moeda_cambio_pedido_valor_unico: canonico,
  }
}
