import { useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Copy, X } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  filtrarItensAvulsosSelecao,
  montarMensagemResumoDuplicacao,
  type ResumoDuplicacaoListaSimulador,
} from './duplicar-excluir-lista-simulador-pedido'
import type { SelecaoListaSimuladorPedido } from './regras-acoes-barra-lista-simulador-pedido'
import './modal-novo-pedido-simulador.css'

type Props = {
  aberto: boolean
  selecao: SelecaoListaSimuladorPedido
  onFechar: () => void
  onConfirmar: () => void
}

function montarDescricaoDuplicacao(selecao: SelecaoListaSimuladorPedido): string {
  const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
  const partes: string[] = []

  if (selecao.pedidos.length > 0) {
    const nums = selecao.pedidos.map((p) => p.numeroPedido).join(', ')
    partes.push(
      `${selecao.pedidos.length} pedido${selecao.pedidos.length !== 1 ? 's' : ''} inteiro${selecao.pedidos.length !== 1 ? 's' : ''} (${nums}) com todos os itens`,
    )
  }
  if (itensAvulsos.length > 0) {
    partes.push(
      `${itensAvulsos.length} item${itensAvulsos.length !== 1 ? 's' : ''} avulso${itensAvulsos.length !== 1 ? 's' : ''} dentro do pedido pai`,
    )
  }

  return partes.length > 0
    ? `Serão criadas cópias de: ${partes.join(' e ')}.`
    : 'Nenhum registro selecionado.'
}

export function ModalDuplicarListaSimuladorPedido({ aberto, selecao, onFechar, onConfirmar }: Props) {
  const titulo = useMemo(() => {
    const itensAvulsos = filtrarItensAvulsosSelecao(selecao)
    if (selecao.pedidos.length > 0 && itensAvulsos.length > 0) {
      return `Duplicar ${selecao.pedidos.length} pedido(s) + ${itensAvulsos.length} item(ns)?`
    }
    if (selecao.pedidos.length > 0) {
      return `Duplicar ${selecao.pedidos.length} pedido${selecao.pedidos.length !== 1 ? 's' : ''}?`
    }
    if (itensAvulsos.length > 0) {
      return `Duplicar ${itensAvulsos.length} item${itensAvulsos.length !== 1 ? 's' : ''}?`
    }
    return 'Duplicar seleção?'
  }, [selecao])

  const descricao = useMemo(() => montarDescricaoDuplicacao(selecao), [selecao])

  const fechar = useCallback(() => onFechar(), [onFechar])

  if (!aberto) return null

  return createPortal(
    <div className="pds-mnp-cadastro-overlay" onClick={fechar}>
      <div
        className="pds-mnp-cadastro-dialog"
        style={{ width: 'min(460px, 100%)' }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="pds-duplicar-titulo"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <h3 id="pds-duplicar-titulo" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
            <Copy size={16} weight="duotone" style={{ color: '#818cf8' }} aria-hidden />
            {titulo}
          </h3>
          <button type="button" className="pds-mnp-item-remover" style={{ position: 'static' }} onClick={fechar} aria-label="Fechar">
            <X size={14} weight="bold" aria-hidden />
          </button>
        </div>
        <p
          style={{ margin: '0 0 1rem', fontSize: '0.875rem', color: 'var(--text-secondary, #94a3b8)', lineHeight: 1.5 }}
          data-sds-tutorial-alvo="pedido-duplicar-resumo"
        >
          {descricao}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <BotaoGlobal variante="secundario" tamanho="pequeno" onClick={fechar}>
            Cancelar
          </BotaoGlobal>
          <span data-sds-tutorial-alvo="pedido-duplicar-confirmar" style={{ display: 'inline-flex' }}>
          <BotaoGlobal variante="primario" tamanho="pequeno" icone={<Copy size={14} weight="duotone" />} onClick={onConfirmar}>
            Duplicar
          </BotaoGlobal>
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function mensagemToastDuplicacao(resumo: ResumoDuplicacaoListaSimulador): string {
  return `${montarMensagemResumoDuplicacao(resumo)} criado(s) na lista (simulação).`
}
