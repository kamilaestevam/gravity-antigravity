import { Hand, HandGrabbing } from '@phosphor-icons/react'
import type { EstadoCursorArrastarLista } from './motor-animacao-arrastar-colunas-lista-simulador-pedido'
import './indicador-cursor-arrastar-lista-simulador-pedido.css'

export function IndicadorCursorArrastarListaSimuladorPedido({
  estado,
}: {
  estado: EstadoCursorArrastarLista
}) {
  if (!estado.visivel) return null

  const Icone = estado.arrastando ? HandGrabbing : Hand

  return (
    <div
      className={[
        'pds-cursor-arrastar-lista',
        estado.arrastando ? 'pds-cursor-arrastar-lista--grabbing' : '',
      ].filter(Boolean).join(' ')}
      style={{ left: estado.x, top: estado.y }}
      role="presentation"
      aria-hidden
    >
      <span className="pds-cursor-arrastar-lista__sombra" />
      <Icone size={30} weight="duotone" />
    </div>
  )
}
