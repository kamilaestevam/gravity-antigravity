import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CursorClick, Sparkle } from '@phosphor-icons/react'

/** Resolve o próximo item não explorado, na ordem do guia. */
export function resolverProximoCampoAffordance<Id extends string>(
  ordem: readonly Id[],
  interagiu: Partial<Record<Id, boolean>>,
): Id | null {
  return ordem.find((id) => !interagiu[id]) ?? null
}

type FaixaDemoInterativaProps = {
  mensagem: string
  visivel?: boolean
  /** Cursor viaja até a faixa e clica a cada N segundos — convite inicial da demo. */
  convitePeriodico?: boolean
  intervaloConviteSegundos?: number
}

const DURACAO_VIAGEM_CURSOR_MS = 850
const DURACAO_CLIQUE_CURSOR_MS = 1150

function IndicadorCursorConviteFaixaPeriodico({
  ativo,
  alvoRef,
  intervaloSegundos = 5,
}: {
  ativo: boolean
  alvoRef: React.RefObject<HTMLElement | null>
  intervaloSegundos?: number
}) {
  const [cicloVisivel, setCicloVisivel] = useState(false)
  const [clicando, setClicando] = useState(false)
  const [coords, setCoords] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (!ativo) {
      setCicloVisivel(false)
      setClicando(false)
      return undefined
    }

    let cancelado = false
    let timeoutId = 0

    const medirAlvo = () => {
      const el = alvoRef.current
      if (el == null) return null
      const rect = el.getBoundingClientRect()
      return {
        origemX: rect.left + rect.width * 0.72 + 96,
        origemY: rect.top + rect.height * 0.35 + 42,
        destinoX: rect.left + rect.width * 0.52,
        destinoY: rect.top + rect.height * 0.52,
      }
    }

    const executarCiclo = () => {
      if (cancelado) return
      const medidas = medirAlvo()
      if (medidas == null) {
        timeoutId = window.setTimeout(executarCiclo, 600)
        return
      }

      setClicando(false)
      setCoords({ x: medidas.origemX, y: medidas.origemY })
      setCicloVisivel(true)

      timeoutId = window.setTimeout(() => {
        if (cancelado) return
        setCoords({ x: medidas.destinoX, y: medidas.destinoY })

        timeoutId = window.setTimeout(() => {
          if (cancelado) return
          setClicando(true)

          timeoutId = window.setTimeout(() => {
            if (cancelado) return
            setClicando(false)
            setCicloVisivel(false)
            timeoutId = window.setTimeout(executarCiclo, intervaloSegundos * 1000)
          }, DURACAO_CLIQUE_CURSOR_MS)
        }, DURACAO_VIAGEM_CURSOR_MS)
      }, 40)
    }

    timeoutId = window.setTimeout(executarCiclo, 900)

    return () => {
      cancelado = true
      window.clearTimeout(timeoutId)
    }
  }, [ativo, alvoRef, intervaloSegundos])

  if (!ativo || !cicloVisivel || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={[
        'sim-cursor-convite-faixa-flutuante',
        clicando ? 'sim-cursor-convite-faixa-flutuante--clicando' : '',
      ].filter(Boolean).join(' ')}
      style={{ left: coords.x, top: coords.y }}
      role="presentation"
      aria-hidden
    >
      <span className="sim-cursor-convite-faixa-flutuante__sombra" />
      <span className="sim-cursor-convite-faixa-flutuante__onda" />
      <span className="sim-cursor-convite-faixa-flutuante__corpo">
        <CursorClick size={24} weight="duotone" />
      </span>
    </div>,
    document.body,
  )
}

/** Faixa animada — deixa explícito que a área é uma demo clicável. */
export function FaixaDemoInterativaBidFrete({
  mensagem,
  visivel = true,
  convitePeriodico = false,
  intervaloConviteSegundos = 5,
}: FaixaDemoInterativaProps) {
  const faixaRef = useRef<HTMLDivElement>(null)

  if (!visivel) return null

  return (
    <>
      <div
        ref={faixaRef}
        className="sim-affordance-faixa"
        role="note"
        aria-label="Demonstração interativa"
      >
        <span className="sim-affordance-faixa__icone" aria-hidden>
          <Sparkle size={14} weight="fill" />
        </span>
        <span className="sim-affordance-faixa__texto">{mensagem}</span>
        <span className="sim-affordance-faixa__pulso" aria-hidden />
      </div>
      <IndicadorCursorConviteFaixaPeriodico
        ativo={convitePeriodico}
        alvoRef={faixaRef}
        intervaloSegundos={intervaloConviteSegundos}
      />
    </>
  )
}

type IndicadorClique3dProps = {
  ativo: boolean
  rotulo?: string
  variante?: 'padrao' | 'compacto'
  intervaloSegundos?: number
}

/** Cursor 3D com ciclo periódico — aponta o próximo clique sugerido. */
export function IndicadorClique3dBidFrete({
  ativo,
  rotulo = 'Clique aqui',
  variante = 'padrao',
  intervaloSegundos = 4,
}: IndicadorClique3dProps) {
  const [cicloAtivo, setCicloAtivo] = useState(false)

  useEffect(() => {
    if (!ativo) {
      setCicloAtivo(false)
      return undefined
    }

    let cancelado = false
    let timeoutId = 0
    const duracaoMs = 1150

    const agendar = (atrasoMs: number) => {
      timeoutId = window.setTimeout(() => {
        if (cancelado) return
        setCicloAtivo(true)
        timeoutId = window.setTimeout(() => {
          if (cancelado) return
          setCicloAtivo(false)
          agendar(intervaloSegundos * 1000)
        }, duracaoMs)
      }, atrasoMs)
    }

    agendar(900)

    return () => {
      cancelado = true
      window.clearTimeout(timeoutId)
    }
  }, [ativo, intervaloSegundos])

  if (!ativo || !cicloAtivo) return null

  return (
    <div
      className={[
        'sim-affordance-clique-3d',
        'sim-affordance-clique-3d--animando',
        variante === 'compacto' ? 'sim-affordance-clique-3d--compacto' : '',
      ].filter(Boolean).join(' ')}
      role="presentation"
      aria-hidden
    >
      <span className="sim-affordance-clique-3d__sombra" />
      <span className="sim-affordance-clique-3d__onda" />
      <span className="sim-affordance-clique-3d__onda sim-affordance-clique-3d__onda--tardia" />
      <div className="sim-affordance-clique-3d__corpo">
        <CursorClick size={variante === 'compacto' ? 20 : 26} weight="duotone" />
      </div>
      {variante === 'padrao' ? (
        <span className="sim-affordance-clique-3d__rotulo">{rotulo}</span>
      ) : null}
    </div>
  )
}

type WrapperAlvoAffordanceProps = {
  destacado: boolean
  children: React.ReactNode
  className?: string
  rotuloClique?: string
  varianteCursor?: 'padrao' | 'compacto'
  as?: 'div' | 'span' | 'article'
  /** Posição do cursor 3D — usado com CSS data-attribute no card Melhor proposta. */
  cursorAlvo?: string
}

/** Envolve um alvo clicável com anel pulsante + cursor 3D quando é o próximo passo sugerido. */
export function WrapperAlvoAffordanceBidFrete({
  destacado,
  children,
  className = '',
  rotuloClique = 'Clique aqui',
  varianteCursor = 'padrao',
  as: Tag = 'div',
  cursorAlvo,
}: WrapperAlvoAffordanceProps) {
  return (
    <Tag
      className={[
        'sim-affordance-alvo',
        destacado ? 'sim-affordance-alvo--destacado' : '',
        className,
      ].filter(Boolean).join(' ')}
      {...(cursorAlvo != null ? { 'data-cursor-alvo': cursorAlvo } : {})}
    >
      {children}
      <IndicadorClique3dBidFrete
        ativo={destacado}
        rotulo={rotuloClique}
        variante={varianteCursor}
      />
    </Tag>
  )
}
