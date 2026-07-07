/**
 * indicador-clique-3d-simulador-smart-doc.tsx — cursor 3D refinado, ciclo periódico
 */

import { useEffect, useState } from 'react'
import { CursorClick } from '@phosphor-icons/react'

type Props = {
  ativo: boolean
  intervaloSegundos?: number
  duracaoAnimacaoMs?: number
  atrasoInicialMs?: number
  rotulo?: string
  variante?: 'padrao' | 'menu'
}

export function IndicadorClique3dSimulador({
  ativo,
  intervaloSegundos = 4.5,
  duracaoAnimacaoMs = 1200,
  atrasoInicialMs = 1200,
  rotulo = 'Clique aqui',
  variante = 'padrao',
}: Props) {
  const [cicloAtivo, setCicloAtivo] = useState(false)

  useEffect(() => {
    if (!ativo) {
      setCicloAtivo(false)
      return
    }

    let cancelado = false
    let timeoutId = 0

    const agendarProximo = (atrasoMs: number) => {
      timeoutId = window.setTimeout(() => {
        if (cancelado) return
        setCicloAtivo(true)
        timeoutId = window.setTimeout(() => {
          if (cancelado) return
          setCicloAtivo(false)
          agendarProximo(intervaloSegundos * 1000)
        }, duracaoAnimacaoMs)
      }, atrasoMs)
    }

    agendarProximo(atrasoInicialMs)

    return () => {
      cancelado = true
      window.clearTimeout(timeoutId)
    }
  }, [ativo, intervaloSegundos, duracaoAnimacaoMs, atrasoInicialMs])

  if (!ativo || !cicloAtivo) return null

  return (
    <div
      className={`sds-clique-3d sds-clique-3d--animando${variante === 'menu' ? ' sds-clique-3d--menu' : ''}`}
      role="presentation"
      aria-hidden
    >
      <span className="sds-clique-3d__sombra" />
      <span className="sds-clique-3d__onda" />
      <span className="sds-clique-3d__onda sds-clique-3d__onda--tardia" />
      <div className="sds-clique-3d__corpo">
        <CursorClick size={26} weight="duotone" />
      </div>
      <span className="sds-clique-3d__rotulo">{rotulo}</span>
    </div>
  )
}
