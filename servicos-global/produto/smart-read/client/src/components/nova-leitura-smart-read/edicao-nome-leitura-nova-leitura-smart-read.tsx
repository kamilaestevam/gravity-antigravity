/**
 * Nome da leitura — edição inline (EdicaoTextoPopoverGlobal, padrão Gravity).
 */
import { useRef, useState } from 'react'
import { PencilSimple } from '@phosphor-icons/react'
import { EdicaoTextoPopoverGlobal } from '@nucleo/tabela-virtual-global'

type Props = {
  nomeLeitura: string
  onConfirmar: (nome: string) => void | Promise<void>
  salvando?: boolean
}

export function EdicaoNomeLeituraNovaLeituraSmartRead({
  nomeLeitura,
  onConfirmar,
  salvando = false,
}: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [popoverAberto, setPopoverAberto] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)

  function abrirPopover() {
    if (salvando) return
    const el = triggerRef.current
    if (!el) return
    setAnchorRect(el.getBoundingClientRect())
    setPopoverAberto(true)
  }

  async function handleConfirmar(texto: string | null) {
    const limpo = texto?.trim()
    if (!limpo) {
      setPopoverAberto(false)
      return
    }
    await onConfirmar(limpo)
    setPopoverAberto(false)
  }

  const exibicao = nomeLeitura.trim() || 'Leitura'

  return (
    <div className="sr-wizard-lateral-nome-editor">
      <button
        ref={triggerRef}
        type="button"
        className="sr-wizard-lateral-nome-trigger"
        disabled={salvando}
        aria-label="Editar nome da leitura"
        onClick={abrirPopover}
      >
        <span className="sr-wizard-lateral-nome-texto">{exibicao}</span>
        <PencilSimple weight="bold" size={14} className="sr-wizard-lateral-nome-icone" aria-hidden />
      </button>

      {popoverAberto && anchorRect ? (
        <EdicaoTextoPopoverGlobal
          anchorRect={anchorRect}
          label="NOME DA LEITURA"
          valor={nomeLeitura}
          placeholder="Nome da leitura"
          salvando={salvando}
          onConfirmar={(texto) => void handleConfirmar(texto)}
          onCancelar={() => setPopoverAberto(false)}
        />
      ) : null}
    </div>
  )
}
