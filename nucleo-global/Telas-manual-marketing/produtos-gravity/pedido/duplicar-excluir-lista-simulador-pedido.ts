import type {
  ItemListaPedidoSimulador,
  LinhaListaPedidoSimulador,
} from './dados-lista-simulador-pedido'
import type {
  ItemSelecionadoListaSimulador,
  SelecaoListaSimuladorPedido,
} from './regras-acoes-barra-lista-simulador-pedido'

export type ResumoExclusaoListaSimulador = {
  pedidosExcluidos: number
  itensExcluidos: number
}

export type ResumoDuplicacaoListaSimulador = {
  pedidosCriados: number
  itensCriados: number
}

/** Itens cujo pedido pai NÃO está na seleção de pedidos (espelha ModalPedidosDuplicar/Excluir). */
export function filtrarItensAvulsosSelecao(
  selecao: SelecaoListaSimuladorPedido,
): ItemSelecionadoListaSimulador[] {
  const idsPedidos = new Set(selecao.pedidos.map((p) => p.id))
  return selecao.itens.filter(({ pai }) => !idsPedidos.has(pai.id))
}

function resolverSufixoCopiaPedido(
  numeroBase: string,
  linhas: readonly LinhaListaPedidoSimulador[],
): string {
  const existentes = new Set(linhas.map((l) => l.numeroPedido))
  const candidato = `${numeroBase}-CÓPIA`
  if (!existentes.has(candidato)) return '-CÓPIA'
  let n = 2
  while (existentes.has(`${numeroBase}-CÓPIA-${n}`)) n += 1
  return `-CÓPIA-${n}`
}

function clonarCampos(campos: Record<string, string | null>): Record<string, string | null> {
  return { ...campos }
}

function clonarItemDePedido(
  item: ItemListaPedidoSimulador,
  pedidoId: string,
  sequencia: number,
  numeroPedido: string,
  pai: LinhaListaPedidoSimulador,
  sufixoId: string,
): ItemListaPedidoSimulador {
  const numeroItem = `${numeroPedido}-${String(sequencia).padStart(2, '0')}`
  const campos = clonarCampos(item.campos)
  campos.sequencia_item_pedido = String(sequencia)
  campos.numero_item = numeroItem
  campos.numero_pedido = numeroPedido
  return {
    id: `${pedidoId}-item-${sequencia}${sufixoId}`,
    sequencia,
    numeroItem,
    alerta: item.alerta,
    tipoOperacao: pai.tipoOperacao,
    status: pai.status,
    campos,
  }
}

function clonarPedido(
  pedido: LinhaListaPedidoSimulador,
  linhas: readonly LinhaListaPedidoSimulador[],
): LinhaListaPedidoSimulador {
  const sufixoId = `-dup-${Date.now()}`
  const novoId = `${pedido.id}${sufixoId}`
  const numeroPedido = `${pedido.numeroPedido}${resolverSufixoCopiaPedido(pedido.numeroPedido, linhas)}`
  const campos = clonarCampos(pedido.campos)
  campos.numero_pedido = numeroPedido
  const detalhesItens = pedido.detalhesItens.map((item, idx) =>
    clonarItemDePedido(item, novoId, idx + 1, numeroPedido, pedido, sufixoId),
  )
  return {
    ...pedido,
    id: novoId,
    numeroPedido,
    campos,
    detalhesItens,
    itens: detalhesItens.length,
  }
}

function clonarItemAvulso(
  item: ItemListaPedidoSimulador,
  pai: LinhaListaPedidoSimulador,
  sequencia: number,
): ItemListaPedidoSimulador {
  const sufixoId = `-dup-${Date.now()}-${sequencia}`
  const numeroItem = `${pai.numeroPedido}-${String(sequencia).padStart(2, '0')}`
  const campos = clonarCampos(item.campos)
  campos.sequencia_item_pedido = String(sequencia)
  campos.numero_item = numeroItem
  campos.numero_pedido = pai.numeroPedido
  return {
    id: `${pai.id}-item-${sequencia}${sufixoId}`,
    sequencia,
    numeroItem,
    alerta: item.alerta,
    tipoOperacao: pai.tipoOperacao,
    status: pai.status,
    campos,
  }
}

export function excluirSelecaoListaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
): { linhas: LinhaListaPedidoSimulador[]; resumo: ResumoExclusaoListaSimulador } {
  const idsPedidos = new Set(selecao.pedidos.map((p) => p.id))
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const idsItensAvulsos = new Set(itensAvulsos.map(({ item }) => item.id))

  let itensExcluidos = 0
  for (const pedido of selecao.pedidos) {
    itensExcluidos += pedido.detalhesItens.length
  }

  const linhasAtualizadas = linhas
    .filter((linha) => !idsPedidos.has(linha.id))
    .map((linha) => {
      if (idsItensAvulsos.size === 0) return linha
      const detalhesItens = linha.detalhesItens.filter((item) => !idsItensAvulsos.has(item.id))
      if (detalhesItens.length === linha.detalhesItens.length) return linha
      itensExcluidos += linha.detalhesItens.length - detalhesItens.length
      return { ...linha, detalhesItens, itens: detalhesItens.length }
    })

  return {
    linhas: linhasAtualizadas,
    resumo: {
      pedidosExcluidos: selecao.pedidos.length,
      itensExcluidos,
    },
  }
}

export function duplicarSelecaoListaSimulador(
  linhas: readonly LinhaListaPedidoSimulador[],
  selecao: SelecaoListaSimuladorPedido,
): { linhas: LinhaListaPedidoSimulador[]; resumo: ResumoDuplicacaoListaSimulador; idsNovosPedidos: string[] } {
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const copiasPedidos = selecao.pedidos.map((pedido) => clonarPedido(pedido, linhas))
  const idsNovosPedidos = copiasPedidos.map((p) => p.id)

  let itensCriados = copiasPedidos.reduce((acc, p) => acc + p.detalhesItens.length, 0)

  let linhasAtualizadas: LinhaListaPedidoSimulador[] = [...copiasPedidos, ...linhas]

  if (itensAvulsos.length > 0) {
    linhasAtualizadas = linhasAtualizadas.map((linha) => {
      const avulsosDesta = itensAvulsos.filter(({ pai }) => pai.id === linha.id)
      if (avulsosDesta.length === 0) return linha
      const detalhesItens = [...linha.detalhesItens]
      for (const { item } of avulsosDesta) {
        const sequencia = detalhesItens.length + 1
        detalhesItens.push(clonarItemAvulso(item, linha, sequencia))
        itensCriados += 1
      }
      return { ...linha, detalhesItens, itens: detalhesItens.length }
    })
  }

  return {
    linhas: linhasAtualizadas,
    idsNovosPedidos,
    resumo: {
      pedidosCriados: copiasPedidos.length,
      itensCriados,
    },
  }
}

export function montarMensagemResumoExclusao(resumo: ResumoExclusaoListaSimulador): string {
  const partes: string[] = []
  if (resumo.pedidosExcluidos > 0) {
    partes.push(`${resumo.pedidosExcluidos} pedido${resumo.pedidosExcluidos !== 1 ? 's' : ''}`)
  }
  if (resumo.itensExcluidos > 0) {
    partes.push(`${resumo.itensExcluidos} item${resumo.itensExcluidos !== 1 ? 's' : ''}`)
  }
  return partes.length > 0 ? partes.join(' e ') : 'nenhum registro'
}

export function montarMensagemResumoDuplicacao(resumo: ResumoDuplicacaoListaSimulador): string {
  if (resumo.pedidosCriados > 0 && resumo.itensCriados > 0) {
    return `${resumo.pedidosCriados} pedido${resumo.pedidosCriados !== 1 ? 's' : ''} (${resumo.itensCriados} item${resumo.itensCriados !== 1 ? 's' : ''} no total)`
  }
  if (resumo.pedidosCriados > 0) {
    return `${resumo.pedidosCriados} pedido${resumo.pedidosCriados !== 1 ? 's' : ''}`
  }
  if (resumo.itensCriados > 0) {
    return `${resumo.itensCriados} item${resumo.itensCriados !== 1 ? 's' : ''}`
  }
  return 'nenhum registro'
}
