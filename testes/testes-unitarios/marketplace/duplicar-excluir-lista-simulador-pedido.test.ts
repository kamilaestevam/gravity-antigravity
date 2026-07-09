import { describe, expect, it } from 'vitest'
import {
  duplicarSelecaoListaSimulador,
  excluirSelecaoListaSimulador,
  filtrarItensAvulsosSelecao,
} from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/duplicar-excluir-lista-simulador-pedido'
import { resolverSelecaoListaSimulador } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/regras-acoes-barra-lista-simulador-pedido'
import { listarPedidosEmpresasSimulador } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/dados-lista-simulador-pedido'

const empresas = [
  { id: 'matriz-sp-importador', nome: 'MATRIZ SP' },
  { id: 'importador-ltda', nome: 'IMPORTADOR' },
] as const

describe('duplicar-excluir-lista-simulador-pedido', () => {
  const linhas = listarPedidosEmpresasSimulador(empresas as never)

  it('exclui pedido inteiro com cascade de itens', () => {
    const pedido = linhas.find((l) => l.id === 'sp-5')!
    const selecao = resolverSelecaoListaSimulador(new Set([pedido.id]), linhas)
    const qtdItens = pedido.detalhesItens.length
    const { linhas: proximas, resumo } = excluirSelecaoListaSimulador(linhas, selecao)

    expect(proximas.some((l) => l.id === pedido.id)).toBe(false)
    expect(resumo.pedidosExcluidos).toBe(1)
    expect(resumo.itensExcluidos).toBe(qtdItens)
  })

  it('exclui somente itens avulsos quando pedido pai nao esta selecionado', () => {
    const pedido = linhas.find((l) => l.id === 'sp-5')!
    const item = pedido.detalhesItens[0]!
    const selecao = resolverSelecaoListaSimulador(new Set([item.id]), linhas)
    expect(filtrarItensAvulsosSelecao(selecao)).toHaveLength(1)

    const { linhas: proximas, resumo } = excluirSelecaoListaSimulador(linhas, selecao)
    const pedidoDepois = proximas.find((l) => l.id === pedido.id)!

    expect(pedidoDepois.detalhesItens.some((i) => i.id === item.id)).toBe(false)
    expect(resumo.pedidosExcluidos).toBe(0)
    expect(resumo.itensExcluidos).toBe(1)
  })

  it('duplica pedido inteiro com sufixo -COPIA', () => {
    const pedido = linhas.find((l) => l.id === 'sp-5')!
    const selecao = resolverSelecaoListaSimulador(new Set([pedido.id]), linhas)
    const { linhas: proximas, resumo, idsNovosPedidos } = duplicarSelecaoListaSimulador(linhas, selecao)

    expect(resumo.pedidosCriados).toBe(1)
    expect(resumo.itensCriados).toBe(pedido.detalhesItens.length)
    expect(idsNovosPedidos).toHaveLength(1)
    const copia = proximas.find((l) => l.id === idsNovosPedidos[0])!
    expect(copia.numeroPedido).toContain('-CÓPIA')
    expect(copia.detalhesItens).toHaveLength(pedido.detalhesItens.length)
  })

  it('duplica somente itens avulsos dentro do pedido pai', () => {
    const pedido = linhas.find((l) => l.id === 'sp-5')!
    const item = pedido.detalhesItens[0]!
    const qtdAntes = pedido.detalhesItens.length
    const selecao = resolverSelecaoListaSimulador(new Set([item.id]), linhas)
    const { linhas: proximas, resumo } = duplicarSelecaoListaSimulador(linhas, selecao)
    const pedidoDepois = proximas.find((l) => l.id === pedido.id)!

    expect(resumo.pedidosCriados).toBe(0)
    expect(resumo.itensCriados).toBe(1)
    expect(pedidoDepois.detalhesItens.length).toBe(qtdAntes + 1)
  })

  it('ignora itens do pedido quando o pedido inteiro tambem esta selecionado (misto)', () => {
    const pedido = linhas.find((l) => l.id === 'sp-5')!
    const item = pedido.detalhesItens[0]!
    const selecionados = new Set([pedido.id, item.id])
    const selecao = resolverSelecaoListaSimulador(selecionados, linhas)
    expect(filtrarItensAvulsosSelecao(selecao)).toHaveLength(0)

    const { resumo } = duplicarSelecaoListaSimulador(linhas, selecao)
    expect(resumo.pedidosCriados).toBe(1)
    expect(resumo.itensCriados).toBe(pedido.detalhesItens.length)
  })
})
