/**
 * useEdicaoListaProcesso — regras de edição inline pedido/item (paridade Pedidos.tsx, mock-first).
 */
import { useCallback, useMemo, type Dispatch, type SetStateAction } from 'react'
import type { Pedido, PedidoItem } from './pedidoTypes'
import { sequenciaPedidoNoProcesso, type FilhoLinhaLista } from './mockListaHierarquica'
import { isCampoLogisticaPedido, normalizarCodigoLogisticaPedido } from './camposLogisticaPedido'
import { isCampoGhostItemNoPedido } from './camposGhostPedidoItem'
import { isPropagavel } from './mapaPropagacaoPedidoItem'
import {
  mesclarDivergenciasPreservandoDescricaoPedido,
  sincronizarItensPedido,
} from './pedidoDivergencias'
import { CAMPOS_EDITAVEIS_PEDIDO } from './processoListaColunasConfig'
import { resolverCampoEdicaoFilho } from './processoColunaAvoFilhoMap'

export type PedidoComProcesso = Pedido & { id_processo: string }

export type PedidoItemEnriquecido = PedidoItem & {
  _p?: ReturnType<typeof montarContextoPaiItem>
}

const STATUS_SEM_ESPELHAMENTO = new Set(['transferencia', 'consolidado'])

const CAMPOS_PAI_TEXTO = new Set(['numero_proforma', 'numero_invoice'])

const CAMPOS_MOEDA_CODIGO = new Set(['moeda_pedido', 'moeda_cambio_pedido'])

const CAMPOS_PESO_PAI = new Set(['peso_liquido_total_pedido', 'peso_bruto_total_pedido'])

const CAMPOS_UNIDADE_CODIGO_PAI = new Set(['unidade_comercializada_pedido'])

const FATOR_PARA_KG_PAI: Record<string, number> = { KG: 1, G: 0.001, TON: 1000, KGBR: 1 }

export function normalizarDataISO(val: unknown): string | null {
  if (!val || typeof val !== 'string') return null
  const v = val.trim()
  if (!v) return null
  const ddmm = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (ddmm) return `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}T12:00:00.000Z`
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T12:00:00.000Z`
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v
  return null
}

export function montarContextoPaiItem(pedido: Pedido, item: PedidoItem) {
  return {
    id: pedido.id,
    id_workspace: (pedido as Record<string, unknown>).id_workspace as string | null ?? pedido.company_id ?? null,
    tipo_operacao: pedido.tipo_operacao,
    nome_exportador: item.nome_exportador ?? pedido.nome_exportador ?? null,
    nome_importador: item.nome_importador ?? pedido.nome_importador ?? null,
    nome_fabricante: pedido.nome_fabricante ?? null,
    referencia_importador: item.referencia_importador ?? pedido.referencia_importador ?? null,
    referencia_exportador: item.referencia_exportador ?? pedido.referencia_exportador ?? null,
    referencia_fabricante: item.referencia_fabricante ?? null,
    numero_proforma: pedido.numero_proforma ?? null,
    numero_invoice: pedido.numero_invoice ?? null,
    incoterm: pedido.incoterm ?? null,
    condicao_pagamento: pedido.condicao_pagamento ?? null,
    data_emissao_pedido: pedido.data_emissao_pedido ?? null,
    status: pedido.status,
    moeda_pedido: pedido.moeda_pedido ?? 'USD',
    importacao_exportador_id: pedido.importacao_exportador_id ?? null,
    exportacao_importador_id: pedido.exportacao_importador_id ?? null,
    porto_origem: (pedido as Record<string, unknown>).porto_origem as string | null ?? null,
    porto_destino: (pedido as Record<string, unknown>).porto_destino as string | null ?? null,
    local_de_origem: (pedido as Record<string, unknown>).local_de_origem as string | null ?? null,
    local_de_destino: (pedido as Record<string, unknown>).local_de_destino as string | null ?? null,
    aeroporto_origem: (pedido as Record<string, unknown>).aeroporto_origem as string | null ?? null,
    aeroporto_destino: (pedido as Record<string, unknown>).aeroporto_destino as string | null ?? null,
  }
}

export function enriquecerItemComPai(item: PedidoItem, pedido: Pedido): PedidoItemEnriquecido {
  return { ...item, _p: montarContextoPaiItem(pedido, item) }
}

export function aplicarPropagacaoPedidoNoItem(
  item: PedidoItem,
  campoPedido: string,
  valor: unknown,
): PedidoItem {
  const patched = { ...item, [campoPedido]: valor } as PedidoItem
  if (campoPedido === 'tipo_operacao' || campoPedido === 'tipo_operacao_pedido') {
    patched.tipo_operacao_item = valor as string | null | undefined
  }
  if (campoPedido === 'id_workspace') {
    patched.company_id = String(valor ?? '')
    const enr = item as PedidoItemEnriquecido
    if (enr._p) {
      (patched as PedidoItemEnriquecido)._p = { ...enr._p, id_workspace: (valor as string | null | undefined) ?? null }
    }
  }
  if (campoPedido === 'moeda_pedido') {
    patched.moeda_item = String(valor ?? '')
  }
  if (campoPedido === 'unidade_comercializada_pedido') {
    (patched as PedidoItem & { unidade_comercializada_item?: string }).unidade_comercializada_item = String(valor ?? '')
  }
  return patched
}

function normalizarValorPedidoPai(campo: string, valor: unknown): unknown {
  const isMoedaObj = valor != null && typeof valor === 'object' && 'currency' in (valor as object)
  const isUnidadePai = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)

  let bruto: unknown = isMoedaObj && CAMPOS_MOEDA_CODIGO.has(campo)
    ? (valor as { currency: string }).currency
    : isUnidadePai && CAMPOS_UNIDADE_CODIGO_PAI.has(campo)
      ? (valor as { unit: string }).unit
      : isUnidadePai
        ? (() => {
            const { unit, quantity } = valor as { unit: string; quantity: number }
            return CAMPOS_PESO_PAI.has(campo) ? quantity * (FATOR_PARA_KG_PAI[unit] ?? 1) : quantity
          })()
        : valor

  if (isCampoLogisticaPedido(campo)) return normalizarCodigoLogisticaPedido(bruto)
  if (campo.startsWith('data_')) return normalizarDataISO(bruto) ?? bruto
  return bruto
}

function recalcularAgregadosPedido(itens: PedidoItem[]): Partial<Pedido> {
  const moedasContrib = new Set(
    itens.filter(i => Number(i.valor_total_item ?? 0) > 0 && i.moeda_item).map(i => i.moeda_item as string),
  )
  const unidadesContrib = new Set(
    itens.filter(i => Number(i.quantidade_inicial_pedido ?? 0) > 0 && i.unidade_comercializada_item)
      .map(i => i.unidade_comercializada_item as string),
  )
  return {
    valor_total_pedido: moedasContrib.size > 1
      ? null
      : itens.reduce((s, i) => s + (Number(i.valor_total_item) || 0), 0),
    quantidade_total_pedido: unidadesContrib.size > 1
      ? null
      : itens.reduce((s, i) => s + (Number(i.quantidade_inicial_pedido) || 0), 0),
    quantidade_pronta_itens_pedido_total: itens.reduce(
      (s, i) => s + (Number(i.quantidade_pronta_total_item_pedido) || 0), 0,
    ),
  }
}

function parseIdFilhoLinha(idLinha: string): { camada: 'pedido' | 'item'; id: string } | null {
  if (idLinha.startsWith('ped-')) return { camada: 'pedido', id: idLinha.slice(4) }
  if (idLinha.startsWith('item-')) return { camada: 'item', id: idLinha.slice(5) }
  return null
}

export function mesclarPedidoComDivergencias(
  pedido: PedidoComProcesso,
  itens: PedidoItem[],
): PedidoComProcesso {
  const enriquecidos = itens.map(i => enriquecerItemComPai(i, pedido))
  const { divergencias } = sincronizarItensPedido(enriquecidos, pedido as Record<string, unknown>)
  return { ...pedido, ...divergencias, ...recalcularAgregadosPedido(itens) } as PedidoComProcesso
}

type SetPedidos = Dispatch<SetStateAction<PedidoComProcesso[]>>
type SetItens = Dispatch<SetStateAction<PedidoItem[]>>

function montarFilhoPedidoLista(
  pedido: PedidoComProcesso,
  pedidos: ReadonlyArray<PedidoComProcesso>,
): Extract<FilhoLinhaLista, { camada: 'pedido' }> {
  return {
    camada: 'pedido',
    pedido,
    sequencia_pedido: sequenciaPedidoNoProcesso(pedido.id, pedidos),
  }
}

export function useEdicaoListaProcesso(
  pedidos: PedidoComProcesso[],
  setPedidos: SetPedidos,
  itens: PedidoItem[],
  setItens: SetItens,
  setResetCacheFilhos: Dispatch<SetStateAction<number>>,
) {
  const pedidosExibicao = useMemo(
    () => pedidos.map(p => mesclarPedidoComDivergencias(p, itens.filter(i => i.pedido_id === p.id))),
    [pedidos, itens],
  )

  const getItensDoPedido = useCallback(
    (id_pedido: string) => itens.filter(i => i.pedido_id === id_pedido),
    [itens],
  )

  const editarLinhaPedido = useCallback(async (
    id_pedido: string,
    campo: string,
    valor: unknown,
    opts?: { replicar_em_itens?: boolean },
  ): Promise<FilhoLinhaLista> => {
    const pedido = pedidos.find(p => p.id === id_pedido)
    if (!pedido) throw new Error('Pedido não encontrado')

    if (campo === 'id_workspace' || campo === 'company_id') {
      throw new Error('Workspace é definido no pedido e aplica-se a todos os itens.')
    }

    const itensPedido = getItensDoPedido(id_pedido)

    if (campo === 'status') {
      const novoStatus = String(valor)
      const replicar = opts?.replicar_em_itens ?? false
      let pedidoAtualizado = { ...pedido, status: novoStatus as Pedido['status'] } as PedidoComProcesso
      let itensAtualizados = itensPedido

      if (replicar && !STATUS_SEM_ESPELHAMENTO.has(novoStatus)) {
        itensAtualizados = itensPedido.map(i => {
          const enr = enriquecerItemComPai(i, pedidoAtualizado)
          return { ...enr, _p: { ...enr._p!, status: novoStatus } }
        })
        setItens(prev => prev.map(i => {
          const patch = itensAtualizados.find(u => u.id === i.id)
          return patch ?? i
        }))
        setResetCacheFilhos(n => n + 1)
      }

      const { divergencias } = sincronizarItensPedido(
        itensAtualizados.map(i => enriquecerItemComPai(i, pedidoAtualizado)),
        pedidoAtualizado as Record<string, unknown>,
      )
      pedidoAtualizado = { ...pedidoAtualizado, ...divergencias } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === id_pedido ? pedidoAtualizado : p)))
      return montarFilhoPedidoLista(pedidoAtualizado, pedidos)
    }

    if (isCampoGhostItemNoPedido(campo)) {
      const valorEnviar = campo === 'data_emissao_pedido' ? normalizarDataISO(valor) : valor
      const replicar = opts?.replicar_em_itens ?? false

      if (campo === 'descricao_item' && !replicar) {
        const valorStr = String(valorEnviar ?? '')
        const pedidoComValor = {
          ...pedido,
          descricao_item: valorStr,
          descricao_item_valor_unico: valorStr,
        } as PedidoComProcesso
        const sinc = sincronizarItensPedido(itensPedido, pedidoComValor as Record<string, unknown>)
        const divergencias = mesclarDivergenciasPreservandoDescricaoPedido(
          pedidoComValor as Record<string, unknown>,
          sinc.divergencias,
        )
        const pedidoAtualizado = { ...pedidoComValor, ...divergencias } as PedidoComProcesso
        setPedidos(prev => prev.map(p => (p.id === id_pedido ? pedidoAtualizado : p)))
        return montarFilhoPedidoLista(pedidoAtualizado, pedidos)
      }

      if (itensPedido.length === 0) {
        throw new Error('Este pedido não tem itens para atualizar.')
      }

      const itensAtualizados = itensPedido.map(i => ({ ...i, [campo]: valorEnviar } as PedidoItem))
      setItens(prev => prev.map(i => {
        const patch = itensAtualizados.find(u => u.id === i.id)
        return patch ?? i
      }))
      const pedidoComValor = { ...pedido, [campo]: valorEnviar } as PedidoComProcesso
      const sinc = sincronizarItensPedido(itensAtualizados, pedidoComValor as Record<string, unknown>)
      const divergencias = mesclarDivergenciasPreservandoDescricaoPedido(
        pedidoComValor as Record<string, unknown>,
        sinc.divergencias,
      )
      const pedidoAtualizado = { ...pedidoComValor, ...divergencias } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === id_pedido ? pedidoAtualizado : p)))
      setResetCacheFilhos(n => n + 1)
      return montarFilhoPedidoLista(pedidoAtualizado, pedidos)
    }

    const valorEnviar = normalizarValorPedidoPai(campo, valor)
    const replicar = campo === 'id_workspace' ? true : (opts?.replicar_em_itens ?? false)

    let pedidoAtualizado = { ...pedido, [campo]: valorEnviar } as PedidoComProcesso
    let itensAtualizados = itensPedido

    if (replicar && isPropagavel(campo) && itensPedido.length > 0) {
      itensAtualizados = itensPedido.map(i => aplicarPropagacaoPedidoNoItem(i, campo, valorEnviar))
      setItens(prev => prev.map(i => {
        const patch = itensAtualizados.find(u => u.id === i.id)
        return patch ?? i
      }))
      setResetCacheFilhos(n => n + 1)
    }

    const sinc = sincronizarItensPedido(
      itensAtualizados.map(i => enriquecerItemComPai(i, pedidoAtualizado)),
      pedidoAtualizado as Record<string, unknown>,
    )
    pedidoAtualizado = {
      ...pedidoAtualizado,
      ...sinc.divergencias,
      ...recalcularAgregadosPedido(itensAtualizados),
    } as PedidoComProcesso
    setPedidos(prev => prev.map(p => (p.id === id_pedido ? pedidoAtualizado : p)))
    return montarFilhoPedidoLista(pedidoAtualizado, pedidos)
  }, [getItensDoPedido, pedidos, setItens, setPedidos, setResetCacheFilhos])

  const editarLinhaItem = useCallback(async (
    id_item: string,
    campo: string,
    valor: unknown,
  ): Promise<FilhoLinhaLista> => {
    const item = itens.find(i => i.id === id_item)
    if (!item) throw new Error('Item não encontrado')
    const pedido = pedidos.find(p => p.id === item.pedido_id)
    if (!pedido) throw new Error('Pedido do item não encontrado')

    if (campo === 'id_workspace' || campo === 'company_id') {
      throw new Error('Workspace é definido no pedido — altere na linha do pedido.')
    }

    if (isCampoLogisticaPedido(campo)) {
      const valorNorm = normalizarCodigoLogisticaPedido(valor)
      const pedidoAtualizado = { ...pedido, [campo]: valorNorm } as PedidoComProcesso
      const itensPedido = getItensDoPedido(pedido.id).map(i =>
        enriquecerItemComPai(i, pedidoAtualizado),
      )
      const sinc = sincronizarItensPedido(itensPedido, pedidoAtualizado as Record<string, unknown>)
      const merged = { ...pedidoAtualizado, ...sinc.divergencias } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(item, merged) }
    }

    if (campo === 'status') {
      const novoStatus = String(valor)
      const itemAtualizado = enriquecerItemComPai(item, {
        ...pedido,
        status: novoStatus as Pedido['status'],
      })
      itemAtualizado._p = { ...itemAtualizado._p!, status: novoStatus }
      setItens(prev => prev.map(i => (i.id === id_item ? itemAtualizado : i)))
      return { camada: 'item', item: itemAtualizado }
    }

    if (CAMPOS_PAI_TEXTO.has(campo) || (CAMPOS_EDITAVEIS_PEDIDO.includes(campo) && ![
      'part_number', 'ncm', 'descricao_item', 'valor_total_item', 'valor_por_unidade_item',
      'quantidade_inicial_pedido', 'quantidade_pronta_total_item_pedido', 'moeda_item',
      'unidade_comercializada_item', 'peso_liquido_unitario', 'peso_bruto_unitario', 'cubagem_unitaria',
    ].includes(campo))) {
      const pedidoAtualizado = { ...pedido, [campo]: valor } as PedidoComProcesso
      const itensPedido = getItensDoPedido(pedido.id)
      const sinc = sincronizarItensPedido(
        itensPedido.map(i => enriquecerItemComPai(i, pedidoAtualizado)),
        pedidoAtualizado as Record<string, unknown>,
      )
      const merged = { ...pedidoAtualizado, ...sinc.divergencias } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(item, merged) }
    }

    if (campo === 'valor_total_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const itemPatch = { ...item, valor_total_item: mv.amount, moeda_item: mv.currency }
      const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? itemPatch : i))
      setItens(prev => prev.map(i => (i.id === id_item ? itemPatch : i)))
      const sinc = sincronizarItensPedido(
        itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
        pedido as Record<string, unknown>,
      )
      const merged = {
        ...pedido,
        ...sinc.divergencias,
        ...recalcularAgregadosPedido(itensAtualizados),
      } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(itemPatch, merged) }
    }

    if (campo === 'moeda_pedido') {
      const moedaCodigo = String(valor)
      const itemPatch = { ...item, moeda_item: moedaCodigo }
      const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? itemPatch : i))
      setItens(prev => prev.map(i => (i.id === id_item ? itemPatch : i)))
      const sinc = sincronizarItensPedido(
        itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
        pedido as Record<string, unknown>,
      )
      const merged = { ...pedido, ...sinc.divergencias } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(itemPatch, merged) }
    }

    if (campo === 'valor_por_unidade_item' && valor != null && typeof valor === 'object' && 'currency' in (valor as object)) {
      const mv = valor as { currency: string; amount: number }
      const itemPatch = { ...item, valor_por_unidade_item: mv.amount, moeda_item: mv.currency }
      const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? itemPatch : i))
      setItens(prev => prev.map(i => (i.id === id_item ? itemPatch : i)))
      const sinc = sincronizarItensPedido(
        itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
        pedido as Record<string, unknown>,
      )
      const merged = {
        ...pedido,
        ...sinc.divergencias,
        ...recalcularAgregadosPedido(itensAtualizados),
      } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(itemPatch, merged) }
    }

    if (campo === 'quantidade_pronta_total_item_pedido') {
      const isUnidade = valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)
      const qtd = isUnidade ? (valor as { quantity: number }).quantity : Number(valor) || 0
      const novaUnidade = isUnidade ? (valor as { unit: string }).unit : undefined
      let itemPatch: PedidoItem = { ...item, quantidade_pronta_total_item_pedido: qtd }
      if (novaUnidade) {
        itemPatch = { ...itemPatch, unidade_comercializada_item: novaUnidade }
      }
      const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? itemPatch : i))
      setItens(prev => prev.map(i => (i.id === id_item ? itemPatch : i)))
      const sinc = sincronizarItensPedido(
        itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
        pedido as Record<string, unknown>,
      )
      const merged = {
        ...pedido,
        ...sinc.divergencias,
        quantidade_pronta_itens_pedido_total: itensAtualizados.reduce(
          (s, i) => s + (Number(i.quantidade_pronta_total_item_pedido) || 0), 0,
        ),
      } as PedidoComProcesso
      setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
      setResetCacheFilhos(n => n + 1)
      return { camada: 'item', item: enriquecerItemComPai(itemPatch, merged) }
    }

    // Campo genérico do item (inclui part_number via mapa campo)
    const campoItem = campo === 'numero_pedido' ? 'part_number' : campo
    let valorItem: unknown = valor
    if (valor != null && typeof valor === 'object' && 'unit' in (valor as object) && 'quantity' in (valor as object)) {
      const { unit, quantity } = valor as { unit: string; quantity: number }
      valorItem = quantity
      if (campoItem.includes('peso') || campoItem.includes('cubagem') || campoItem.includes('quantidade')) {
        const patch: PedidoItem = { ...item, [campoItem]: quantity }
        if (campoItem.includes('peso_liquido')) (patch as PedidoItem & { peso_liquido_unidade_item?: string }).peso_liquido_unidade_item = unit
        if (campoItem.includes('peso_bruto')) (patch as PedidoItem & { peso_bruto_unidade_item?: string }).peso_bruto_unidade_item = unit
        if (campoItem.includes('cubagem')) (patch as PedidoItem & { cubagem_unidade_item?: string }).cubagem_unidade_item = unit
        if (campoItem.includes('quantidade')) patch.unidade_comercializada_item = unit
        const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? patch : i))
        setItens(prev => prev.map(i => (i.id === id_item ? patch : i)))
        const sinc = sincronizarItensPedido(
          itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
          pedido as Record<string, unknown>,
        )
        const merged = { ...pedido, ...sinc.divergencias, ...recalcularAgregadosPedido(itensAtualizados) } as PedidoComProcesso
        setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
        setResetCacheFilhos(n => n + 1)
        return { camada: 'item', item: enriquecerItemComPai(patch, merged) }
      }
    }

    const itemPatch = { ...item, [campoItem]: valorItem } as PedidoItem
    const itensAtualizados = getItensDoPedido(pedido.id).map(i => (i.id === id_item ? itemPatch : i))
    setItens(prev => prev.map(i => (i.id === id_item ? itemPatch : i)))
    const sinc = sincronizarItensPedido(
      itensAtualizados.map(i => enriquecerItemComPai(i, pedido)),
      pedido as Record<string, unknown>,
    )
    const merged = {
      ...pedido,
      ...sinc.divergencias,
      ...recalcularAgregadosPedido(itensAtualizados),
    } as PedidoComProcesso
    setPedidos(prev => prev.map(p => (p.id === pedido.id ? merged : p)))
    setResetCacheFilhos(n => n + 1)
    return { camada: 'item', item: enriquecerItemComPai(itemPatch, merged) }
  }, [getItensDoPedido, itens, pedidos, setItens, setPedidos, setResetCacheFilhos])

  const handleEditarFilho = useCallback(async (
    idLinha: string,
    campo: string,
    valor: unknown,
    opts?: { replicar_em_itens?: boolean },
  ): Promise<FilhoLinhaLista> => {
    const parsed = parseIdFilhoLinha(idLinha)
    if (!parsed) throw new Error('Linha filha não reconhecida')
    const campoReal = resolverCampoEdicaoFilho(campo, parsed.camada)
    if (parsed.camada === 'pedido') {
      return editarLinhaPedido(parsed.id, campoReal, valor, opts)
    }
    return editarLinhaItem(parsed.id, campoReal, valor)
  }, [editarLinhaItem, editarLinhaPedido])

  return { handleEditarFilho, pedidosExibicao }
}
