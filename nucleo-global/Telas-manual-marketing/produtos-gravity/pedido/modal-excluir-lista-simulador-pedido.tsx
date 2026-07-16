import { useMemo } from 'react'
import { ModalConfirmarExcluirGlobal } from '@nucleo/modal-confirmar-excluir-global'
import {
  filtrarItensAvulsosSelecao,
  montarMensagemResumoExclusao,
  type ResumoExclusaoListaSimulador,
} from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'

type Props = {
  aberto: boolean
  selecao: SelecaoListaSimuladorPedido
  onFechar: () => void
  onConfirmar: () => void | Promise<void>
}

function montarDescricaoExclusao(selecao: SelecaoListaSimuladorPedido): string {
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const partes: string[] = []

  if (selecao.pedidos.length > 0) {
    const nums = selecao.pedidos.map((p) => p.numeroPedido).join(', ')
    partes.push(
      `${selecao.pedidos.length} pedido${selecao.pedidos.length !== 1 ? 's' : ''} (${nums}) com todos os itens`,
    )
  }
  if (itensAvulsos.length > 0) {
    partes.push(
      `${itensAvulsos.length} item${itensAvulsos.length !== 1 ? 's' : ''} avulso${itensAvulsos.length !== 1 ? 's' : ''} nos pedidos pai`,
    )
  }

  return partes.length > 0
    ? `Serão removidos permanentemente: ${partes.join(' e ')}. Esta ação não pode ser desfeita.`
    : 'Nenhum registro selecionado.'
}

export function ModalExcluirListaSimuladorPedido({ aberto, selecao, onFechar, onConfirmar }: Props) {
  const titulo = useMemo(() => {
    const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
    if (selecao.pedidos.length > 0 && itensAvulsos.length > 0) {
      return `Excluir ${selecao.pedidos.length} pedido(s) e ${itensAvulsos.length} item(ns)?`
    }
    if (selecao.pedidos.length > 0) {
      return `Excluir ${selecao.pedidos.length} pedido${selecao.pedidos.length !== 1 ? 's' : ''}?`
    }
    if (itensAvulsos.length > 0) {
      return `Excluir ${itensAvulsos.length} item${itensAvulsos.length !== 1 ? 's' : ''}?`
    }
    return 'Excluir seleção?'
  }, [selecao])

  const descricao = useMemo(() => montarDescricaoExclusao(selecao), [selecao])

  return (
    <ModalConfirmarExcluirGlobal
      aberto={aberto}
      titulo={titulo}
      descricao={descricao}
      aoConfirmar={onConfirmar}
      aoCancelar={onFechar}
      dataTutorialAlvoResumo="pedido-excluir-resumo"
      dataTutorialAlvoAviso="pedido-excluir-aviso"
      dataTutorialAlvoConfirmar="pedido-excluir-confirmar"
    />
  )
}

export function mensagemToastExclusao(resumo: ResumoExclusaoListaSimulador): string {
  return `${montarMensagemResumoExclusao(resumo)} removido(s) da lista (simulação).`
}
