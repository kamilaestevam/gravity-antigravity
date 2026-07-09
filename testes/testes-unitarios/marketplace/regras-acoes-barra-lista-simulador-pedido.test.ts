import { describe, expect, it } from 'vitest'
import {
  calcularHabilitacaoAcoesBarraListaSimulador,
  contarPedidosParaConsolidar,
  resolverSelecaoListaSimulador,
} from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/regras-acoes-barra-lista-simulador-pedido'
import { listarPedidosEmpresasSimulador } from '../../../nucleo-global/Telas-manual-marketing/produtos-gravity/pedido/dados-lista-simulador-pedido'

const empresas = [
  { id: 'matriz-sp-importador', nome: 'MATRIZ SP' },
  { id: 'importador-ltda', nome: 'IMPORTADOR' },
] as const

describe('regras-acoes-barra-lista-simulador-pedido', () => {
  const linhas = listarPedidosEmpresasSimulador(empresas as never)

  it('habilita consolidar com 2 pedidos inteiros selecionados', () => {
    const selecionados = new Set(['sp-5', 'im-5'])
    const selecao = resolverSelecaoListaSimulador(selecionados, linhas)
    const acoes = calcularHabilitacaoAcoesBarraListaSimulador(selecao)

    expect(selecao.pedidos.map((p) => p.numeroPedido)).toEqual(['PO-9810', 'PO-7675'])
    expect(contarPedidosParaConsolidar(selecao)).toBe(2)
    expect(acoes.podeConsolidar).toBe(true)
    expect(acoes.podeTransferir).toBe(true)
  })

  it('mantém consolidar desabilitado com apenas 1 pedido', () => {
    const selecionados = new Set(['sp-5'])
    const selecao = resolverSelecaoListaSimulador(selecionados, linhas)
    const acoes = calcularHabilitacaoAcoesBarraListaSimulador(selecao)

    expect(acoes.podeConsolidar).toBe(false)
    expect(acoes.podeTransferir).toBe(true)
  })

  it('habilita consolidar com itens de 2 pedidos distintos', () => {
    const pedidoA = linhas.find((l) => l.id === 'sp-5')
    const pedidoB = linhas.find((l) => l.id === 'im-5')
    expect(pedidoA && pedidoB).toBeTruthy()

    const selecionados = new Set([
      pedidoA!.detalhesItens[0]!.id,
      pedidoB!.detalhesItens[0]!.id,
    ])
    const selecao = resolverSelecaoListaSimulador(selecionados, linhas)
    const acoes = calcularHabilitacaoAcoesBarraListaSimulador(selecao)

    expect(selecao.pedidos).toHaveLength(0)
    expect(selecao.itens).toHaveLength(2)
    expect(acoes.podeConsolidar).toBe(true)
  })
})
