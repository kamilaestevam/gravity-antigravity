import type {
  ItemListaPedidoSimulador,
  LinhaListaPedidoSimulador,
} from './dados-lista-simulador-pedido'

export type ItemSelecionadoListaSimulador = {
  item: ItemListaPedidoSimulador
  pai: LinhaListaPedidoSimulador
}

export type SelecaoListaSimuladorPedido = {
  pedidos: LinhaListaPedidoSimulador[]
  itens: ItemSelecionadoListaSimulador[]
}

export type HabilitacaoAcoesBarraListaSimulador = {
  podeTransferir: boolean
  podeEditarMassa: boolean
  podeConsolidar: boolean
  podeGerarPdf: boolean
  podeExcluir: boolean
  totalPedidosConsolidar: number
}

/** Espelha BarraAcoesPedido em Pedidos.tsx — seleção separada em pedidos e itens. */
export function resolverSelecaoListaSimulador(
  selecionados: ReadonlySet<string>,
  linhas: readonly LinhaListaPedidoSimulador[],
): SelecaoListaSimuladorPedido {
  const pedidos: LinhaListaPedidoSimulador[] = []
  const itens: ItemSelecionadoListaSimulador[] = []

  for (const linha of linhas) {
    if (selecionados.has(linha.id)) {
      pedidos.push(linha)
    }
    for (const item of linha.detalhesItens) {
      if (selecionados.has(item.id)) {
        itens.push({ item, pai: linha })
      }
    }
  }

  return { pedidos, itens }
}

/** Conta pedidos distintos para consolidar (inteiros + parciais por item avulso). */
export function contarPedidosParaConsolidar(selecao: SelecaoListaSimuladorPedido): number {
  const inteirosIds = new Set(selecao.pedidos.map((p) => p.id))
  const parciaisIds = new Set(
    selecao.itens.map((i) => i.pai.id).filter((id) => !inteirosIds.has(id)),
  )
  return inteirosIds.size + parciaisIds.size
}

/** Tipos de operação mistos impedem consolidar (espelha hasMixedTipos do Pedido real). */
export function selecaoTemTiposOperacaoIncompativeis(selecao: SelecaoListaSimuladorPedido): boolean {
  const tipos = new Set<string>()
  for (const pedido of selecao.pedidos) tipos.add(pedido.tipoOperacao)
  for (const { pai } of selecao.itens) tipos.add(pai.tipoOperacao)
  return tipos.size > 1
}

export function calcularHabilitacaoAcoesBarraListaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  podeEditarLista = true,
): HabilitacaoAcoesBarraListaSimulador {
  const temSelecao = selecao.pedidos.length > 0 || selecao.itens.length > 0
  const totalPedidosConsolidar = contarPedidosParaConsolidar(selecao)
  const tiposIncompativeis = selecaoTemTiposOperacaoIncompativeis(selecao)

  return {
    podeTransferir: podeEditarLista && temSelecao,
    podeEditarMassa: podeEditarLista && temSelecao,
    podeConsolidar: podeEditarLista && totalPedidosConsolidar >= 2 && !tiposIncompativeis,
    podeGerarPdf: temSelecao,
    podeExcluir: podeEditarLista && temSelecao,
    totalPedidosConsolidar,
  }
}

export function rotuloTransferirListaSimulador(selecao: SelecaoListaSimuladorPedido): string {
  if (selecao.pedidos.length > 0) {
    return `Transferir (${selecao.pedidos.length})`
  }
  if (selecao.itens.length > 0) {
    return `Transferir (${selecao.itens.length})`
  }
  return 'Transferir'
}

export function tooltipTransferirListaSimulador(selecao: SelecaoListaSimuladorPedido): {
  titulo: string
  descricao: string
} {
  if (selecao.pedidos.length > 0) {
    const n = selecao.pedidos.length
    return {
      titulo: `Transferir · ${n} pedido${n !== 1 ? 's' : ''}`,
      descricao: 'Transfere pedidos selecionados para outro workspace.',
    }
  }
  if (selecao.itens.length > 0) {
    const n = selecao.itens.length
    return {
      titulo: `Transferir · ${n} item${n !== 1 ? 's' : ''}`,
      descricao: 'Transfere itens selecionados para outro workspace.',
    }
  }
  return {
    titulo: 'Transferir',
    descricao: 'Selecione ao menos um pedido ou item na lista.',
  }
}

export function tooltipEditarMassaListaSimulador(selecao: SelecaoListaSimuladorPedido): {
  titulo: string
  descricao: string
} {
  if (selecao.pedidos.length > 0) {
    const n = selecao.pedidos.length
    return {
      titulo: `Editar em massa · ${n} pedido${n !== 1 ? 's' : ''}`,
      descricao: 'Altera campos em lote nos pedidos selecionados.',
    }
  }
  if (selecao.itens.length > 0) {
    const n = selecao.itens.length
    return {
      titulo: `Editar em massa · ${n} item${n !== 1 ? 's' : ''}`,
      descricao: 'Altera campos em lote nos itens selecionados.',
    }
  }
  return {
    titulo: 'Editar em massa',
    descricao: 'Selecione ao menos um pedido ou item na lista.',
  }
}

export function tooltipConsolidarListaSimulador(
  selecao: SelecaoListaSimuladorPedido,
  totalPedidos: number,
): { titulo: string; descricao: string } {
  if (selecaoTemTiposOperacaoIncompativeis(selecao)) {
    return {
      titulo: 'Consolidar',
      descricao: 'Não é possível consolidar pedidos de importação com exportação',
    }
  }
  if (totalPedidos >= 2) {
    return {
      titulo: `Consolidar · ${totalPedidos} pedidos`,
      descricao: 'Agrupa pedidos selecionados em um único pedido consolidado.',
    }
  }
  return {
    titulo: 'Consolidar',
    descricao: 'Selecione ao menos 2 pedidos (inteiros ou por itens avulsos).',
  }
}

export function tooltipGerarPdfListaSimulador(selecao: SelecaoListaSimuladorPedido): {
  titulo: string
  descricao: string
} {
  if (selecao.pedidos.length > 0 && selecao.itens.length > 0) {
    return {
      titulo: `Gerar documento · ${selecao.pedidos.length} pedido(s) + ${selecao.itens.length} item(ns)`,
      descricao: 'Gera PDF dos pedidos e itens selecionados.',
    }
  }
  if (selecao.pedidos.length > 0) {
    const n = selecao.pedidos.length
    return {
      titulo: `Gerar documento · ${n} pedido${n !== 1 ? 's' : ''}`,
      descricao: 'Gera PDF dos pedidos selecionados.',
    }
  }
  if (selecao.itens.length > 0) {
    const n = selecao.itens.length
    return {
      titulo: `Gerar documento · ${n} item${n !== 1 ? 's' : ''}`,
      descricao: 'Gera PDF dos itens selecionados.',
    }
  }
  return {
    titulo: 'Gerar documento',
    descricao: 'Selecione ao menos um pedido ou item na lista.',
  }
}

export function tooltipExcluirListaSimulador(selecao: SelecaoListaSimuladorPedido): {
  titulo: string
  descricao: string
} {
  if (selecao.pedidos.length > 0 && selecao.itens.length > 0) {
    return {
      titulo: `Excluir · ${selecao.pedidos.length} pedido(s) e ${selecao.itens.length} item(ns)`,
      descricao: 'Remove permanentemente os registros selecionados.',
    }
  }
  if (selecao.pedidos.length > 0) {
    const n = selecao.pedidos.length
    return {
      titulo: `Excluir · ${n} pedido${n !== 1 ? 's' : ''}`,
      descricao: 'Remove permanentemente os pedidos selecionados.',
    }
  }
  if (selecao.itens.length > 0) {
    const n = selecao.itens.length
    return {
      titulo: `Excluir · ${n} item${n !== 1 ? 's' : ''}`,
      descricao: 'Remove permanentemente os itens selecionados.',
    }
  }
  return {
    titulo: 'Excluir',
    descricao: 'Selecione ao menos um pedido ou item na lista.',
  }
}
