import { useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { EdicaoTextoPopoverGlobal } from '../../../Tabelas/tabela-virtual-global/src/EdicaoTextoPopoverGlobal'

type Props = {
  nomeLeitura: string
  onConfirmar: (nome: string) => void
}

export function EdicaoNomeLeituraSimuladorSmartDoc({ nomeLeitura, onConfirmar }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverAberto, setPopoverAberto] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  function abrirPopover() {
    const el = triggerRef.current
    if (!el) return
    setAnchorRect(el.getBoundingClientRect())
    setPopoverAberto(true)
  }

  function handleConfirmar(texto: string | null) {
    const limpo = texto?.trim()
    if (!limpo) {
      setPopoverAberto(false)
      return
    }
    onConfirmar(limpo)
    setPopoverAberto(false)
  }

  const exibicao = nomeLeitura.trim() || 'Leitura'

  return (
    <div className="sds-nl-lateral-nome-editor">
      <button
        ref={triggerRef}
        type="button"
        className="sds-nl-lateral-nome-trigger"
        aria-label="Editar nome da leitura"
        onClick={abrirPopover}
      >
        <span className="sds-nl-lateral-nome-texto">{exibicao}</span>
        <PencilSimple weight="bold" size={14} className="sds-nl-lateral-nome-icone" aria-hidden />
      </button>

      {popoverAberto && anchorRect ? (
        <EdicaoTextoPopoverGlobal
          anchorRect={anchorRect}
          label="NOME DA LEITURA"
          valor={nomeLeitura}
          placeholder="Nome da leitura"
          onConfirmar={handleConfirmar}
          onCancelar={() => setPopoverAberto(false)}
        />
      ) : null}
    </div>
  )
}
