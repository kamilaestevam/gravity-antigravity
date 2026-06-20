/**
 * BotaoNovoListaSmartRead — dropdown "+ Novo" (padrão Pedido/BID)
 * Nova Leitura abre o wizard modal diretamente.
 */

import { useEffect, useRef, useState } from 'react'
import { CaretDown, FileMagnifyingGlass, Plus } from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'

type Props = {
  onAbrirNovaLeitura: () => void
}

export function BotaoNovoListaSmartRead({ onAbrirNovaLeitura }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!aberto) return
    function fecharFora(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setAberto(false)
      }
    }
    document.addEventListener('mousedown', fecharFora)
    return () => document.removeEventListener('mousedown', fecharFora)
  }, [aberto])

  function abrirModalNovaLeitura() {
    setAberto(false)
    onAbrirNovaLeitura()
  }

  return (
    <div ref={ref} className="sr-dropdown-novo">
      <BotaoGlobal
        variante="primario"
        tamanho="pequeno"
        icone={<Plus size={14} weight="bold" />}
        onClick={() => setAberto((prev) => !prev)}
        aria-expanded={aberto}
        aria-haspopup="menu"
      >
        Novo{' '}
        <CaretDown
          size={12}
          weight="bold"
          style={{
            marginLeft: 2,
            transition: 'transform 0.15s',
            transform: aberto ? 'rotate(180deg)' : 'none',
          }}
        />
      </BotaoGlobal>

      {aberto && (
        <div className="sr-dropdown-novo-menu" role="menu">
          <button
            type="button"
            className="sr-dropdown-novo-item"
            role="menuitem"
            onClick={abrirModalNovaLeitura}
          >
            <span className="sr-dropdown-novo-item-icone">
              <FileMagnifyingGlass size={13} weight="duotone" />
            </span>
            <span className="sr-dropdown-novo-item-texto">Nova Leitura</span>
          </button>
        </div>
      )}
    </div>
  )
}
