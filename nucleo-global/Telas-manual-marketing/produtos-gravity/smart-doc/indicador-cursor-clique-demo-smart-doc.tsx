import { CursorClick } from '@phosphor-icons/react'
import type { EstadoCursorCliqueDemo } from './motor-animacao-card-analise-arquivo-demo-smart-doc'
import './indicador-cursor-clique-demo-smart-doc.css'

export function IndicadorCursorCliqueDemoSmartDoc({ estado }: { estado: EstadoCursorCliqueDemo }) {
  if (!estado.visivel) return null

  return (
    <div
      className={[
        'sds-cursor-clique-demo',
        estado.clicando ? 'sds-cursor-clique-demo--clicando' : '',
      ].filter(Boolean).join(' ')}
      style={{ left: estado.x, top: estado.y }}
      role="presentation"
      aria-hidden
    >
      <span className="sds-cursor-clique-demo__sombra" />
      <CursorClick size={28} weight="duotone" color="#f8fafc" />
    </div>
  )
}
