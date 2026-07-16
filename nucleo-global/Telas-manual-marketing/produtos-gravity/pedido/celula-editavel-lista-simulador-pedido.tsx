import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { Warning, PencilSimple } from '@phosphor-icons/react'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import type { ItemListaPedidoSimulador, LinhaListaPedidoSimulador } from './dados-lista-simulador-pedido'
import {
  celulaTemDivergencia,
  resolverEstadoCelula,
  type NivelLinhaLista,
} from './regras-celula-lista-simulador-pedido'

type Props = {
  colunaId: string
  nivel: NivelLinhaLista
  linha: LinhaListaPedidoSimulador
  item?: ItemListaPedidoSimulador
  labelColuna: string
  flashSalvo?: boolean
  flashErro?: boolean
  classeDestaqueGuia?: string
  dataTutorialAlvo?: string
  exemploEdicao?: boolean
  onIniciarEdicao: (info: {
    colunaId: string
    label: string
    anchorRect: DOMRect
    nivel: NivelLinhaLista
    linhaId: string
    itemId?: string
  }) => void
  children: ReactNode
}

export function CelulaEditavelListaSimuladorPedido({
  colunaId,
  nivel,
  linha,
  item,
  labelColuna,
  flashSalvo,
  flashErro,
  classeDestaqueGuia,
  dataTutorialAlvo,
  exemploEdicao,
  onIniciarEdicao,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const estado = resolverEstadoCelula(colunaId, nivel, linha, item)
  const divergente = celulaTemDivergencia(colunaId, linha, item)

  const classes = [
    'pds-lista-celula',
    'gtv-celula',
    classeDestaqueGuia,
    exemploEdicao ? 'pds-lista-celula--exemplo-edicao' : '',
    estado.editavel ? 'gtv-celula--editavel' : '',
    estado.bloqueada ? 'gtv-celula--bloqueada' : '',
    estado.somenteLeitura ? 'gtv-celula--somente-leitura' : '',
    flashSalvo ? 'gtv-celula--salvo' : '',
    flashErro ? 'gtv-celula--erro-salvar' : '',
  ].filter(Boolean).join(' ')

  function handleClick() {
    if (!estado.editavel || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    onIniciarEdicao({
      colunaId,
      label: labelColuna,
      anchorRect: rect,
      nivel,
      linhaId: linha.id,
      itemId: item?.id,
    })
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (!estado.editavel) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const conteudo = (
    <div
      ref={ref}
      className={classes}
      {...(dataTutorialAlvo ? { 'data-sds-tutorial-alvo': dataTutorialAlvo } : {})}
      role={estado.editavel ? 'button' : undefined}
      tabIndex={estado.editavel ? 0 : undefined}
      onClick={estado.editavel ? handleClick : undefined}
      onKeyDown={estado.editavel ? handleKeyDown : undefined}
    >
      <span className="pds-lista-celula-conteudo">{children}</span>
      {exemploEdicao ? (
        <PencilSimple
          size={11}
          weight="bold"
          className="pds-lista-celula-icone-edicao"
          aria-hidden
        />
      ) : null}
      {divergente ? (
        <Warning
          size={12}
          weight="fill"
          className="pds-lista-alerta pds-lista-alerta--divergencia"
          aria-label="Valor divergente do pedido"
        />
      ) : null}
    </div>
  )

  if (estado.bloqueada && estado.tooltipBloqueado) {
    return (
      <TooltipGlobal
        titulo="Edição bloqueada"
        descricao={estado.tooltipBloqueado}
        cursorBloqueado
      >
        {conteudo}
      </TooltipGlobal>
    )
  }

  return conteudo
}
