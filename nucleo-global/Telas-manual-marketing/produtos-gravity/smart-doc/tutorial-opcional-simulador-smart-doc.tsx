/**
 * tutorial-opcional-simulador-smart-doc.tsx — guia opcional da Gabi por tela
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  Compass,
  Eye,
  Sparkle,
  X,
} from '@phosphor-icons/react'
import {
  TELAS_TUTORIAL_OPCIONAL,
  type AvancarTutorialOpcional,
  type TelaTutorialOpcional,
} from './dados-tutorial-opcional-simulador-smart-doc'
import './tutorial-opcional-simulador-smart-doc.css'
import './destaque-tutorial-simulador-smart-doc.css'

type Props = {
  idTela: string
  habilitado?: boolean
  atrasoAberturaMs?: number
  /** Usa avancarAposAnexo da tela quando definido (ex.: passo 1 após simular anexo) */
  usarAvancarAposAnexo?: boolean
  onAlvoDestacadoChange?: (idAlvo: string | null) => void
}

export function TutorialOpcionalSimuladorSmartDoc({
  idTela,
  habilitado = true,
  atrasoAberturaMs = 900,
  usarAvancarAposAnexo = false,
  onAlvoDestacadoChange,
}: Props) {
  const tela: TelaTutorialOpcional | undefined = TELAS_TUTORIAL_OPCIONAL[idTela]
  const [painelAberto, setPainelAberto] = useState(false)
  const [explorarAlvoHover, setExplorarAlvoHover] = useState<string | null>(null)
  const [cardAvancarHover, setCardAvancarHover] = useState(false)
  const telasVistasRef = useRef<Set<string>>(new Set())
  const refPainel = useRef<HTMLElement>(null)
  const refCardAvancar = useRef<HTMLElement>(null)
  const refFab = useRef<HTMLButtonElement>(null)

  const fecharPainel = useCallback(() => {
    setPainelAberto(false)
    setExplorarAlvoHover(null)
    setCardAvancarHover(false)
  }, [])

  const avancarEfetivo: AvancarTutorialOpcional | undefined = useMemo(() => {
    if (!tela) return undefined
    if (usarAvancarAposAnexo && tela.avancarAposAnexo) return tela.avancarAposAnexo
    return tela.avancar
  }, [tela, usarAvancarAposAnexo])

  const alvoDestaque =
    explorarAlvoHover ?? (painelAberto ? (avancarEfetivo?.idAlvo ?? null) : null)

  useEffect(() => {
    if (!habilitado || !tela) {
      setPainelAberto(false)
      return
    }

    setPainelAberto(false)
    setExplorarAlvoHover(null)

    if (telasVistasRef.current.has(idTela)) return

    const timer = window.setTimeout(() => {
      setPainelAberto(true)
      telasVistasRef.current.add(idTela)
    }, atrasoAberturaMs)

    return () => window.clearTimeout(timer)
  }, [habilitado, idTela, tela, atrasoAberturaMs])

  useEffect(() => {
    if (!habilitado) {
      setPainelAberto(false)
      setExplorarAlvoHover(null)
    }
  }, [habilitado])

  useEffect(() => {
    onAlvoDestacadoChange?.(alvoDestaque)
  }, [alvoDestaque, onAlvoDestacadoChange])

  useEffect(() => {
    if (!painelAberto || !habilitado) return

    function aoPointerFora(ev: MouseEvent) {
      const alvo = ev.target
      if (!(alvo instanceof Node)) return
      if (refPainel.current?.contains(alvo)) return
      if (refCardAvancar.current?.contains(alvo)) return
      if (refFab.current?.contains(alvo)) return
      fecharPainel()
    }

    document.addEventListener('mousedown', aoPointerFora, true)
    return () => document.removeEventListener('mousedown', aoPointerFora, true)
  }, [painelAberto, habilitado, fecharPainel])

  if (!habilitado || !tela || !avancarEfetivo) return null

  function vincularDestaqueItem(idAlvo?: string) {
    return {
      onMouseEnter: () => setExplorarAlvoHover(idAlvo ?? null),
      onMouseLeave: () => setExplorarAlvoHover(null),
      onFocus: () => setExplorarAlvoHover(idAlvo ?? null),
      onBlur: () => setExplorarAlvoHover(null),
      onMouseDown: () => setExplorarAlvoHover(idAlvo ?? null),
    }
  }

  function vincularDestaqueCardAvancar(idAlvo?: string) {
    return {
      onMouseEnter: () => {
        setCardAvancarHover(true)
        setExplorarAlvoHover(idAlvo ?? null)
      },
      onMouseLeave: () => {
        setCardAvancarHover(false)
        setExplorarAlvoHover(null)
      },
      onFocus: () => {
        setCardAvancarHover(true)
        setExplorarAlvoHover(idAlvo ?? null)
      },
      onBlur: () => {
        setCardAvancarHover(false)
        setExplorarAlvoHover(null)
      },
    }
  }

  return (
    <div
      className="sds-tutorial"
      aria-label="Guia da Gabi — demonstração interativa"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {painelAberto && (
        <>
          <aside
            ref={refPainel}
            id="sds-tutorial-painel"
            className="sds-tutorial__painel"
            role="complementary"
            aria-labelledby="sds-tutorial-explore-titulo"
          >
            <header className="sds-tutorial__cabecalho">
              <div className="sds-tutorial__gabi-identidade">
                <span className="sds-tutorial__gabi-avatar sds-tutorial__gabi-avatar--cabecalho" aria-hidden>
                  <Sparkle size={13} weight="fill" />
                </span>
                <div>
                  <p className="sds-tutorial__gabi-nome">Gabi</p>
                  <p className="sds-tutorial__etiqueta">Guia da demonstração</p>
                </div>
              </div>
              <button
                type="button"
                className="sds-tutorial__fechar"
                aria-label="Fechar guia"
                onClick={fecharPainel}
              >
                <X size={14} />
              </button>
            </header>

            <div className="sds-tutorial__corpo">
              <section className="sds-tutorial__secao">
                <h4 id="sds-tutorial-explore-titulo" className="sds-tutorial__secao-titulo">
                  <Eye size={13} weight="duotone" />
                  Explore aqui
                </h4>
                <ul className="sds-tutorial__lista">
                  {tela.explorar.map((item) => (
                    <li
                      key={item.titulo}
                      className={`sds-tutorial__item${item.idAlvo && explorarAlvoHover === item.idAlvo ? ' sds-tutorial__item--ativo' : ''}`}
                      {...vincularDestaqueItem(item.idAlvo)}
                    >
                      <span className="sds-tutorial__item-icone sds-tutorial__item-icone--explorar" aria-hidden>
                        <Compass size={14} weight="duotone" />
                      </span>
                      <div>
                        <strong>{item.titulo}</strong>
                        <p>{item.descricao}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <footer className="sds-tutorial__rodape">
              <button type="button" className="sds-tutorial__btn-fechar" onClick={fecharPainel}>
                Entendi — explorar sozinho
              </button>
            </footer>
          </aside>

          <aside
            ref={refCardAvancar}
            key={avancarEfetivo.titulo}
            className={`sds-tutorial__card-avancar${cardAvancarHover ? ' sds-tutorial__card-avancar--ativo' : ''}`}
            role="complementary"
            aria-labelledby="sds-tutorial-avancar-titulo"
            {...vincularDestaqueCardAvancar(avancarEfetivo.idAlvo)}
          >
            <header className="sds-tutorial__card-avancar-cabecalho">
              <h4 className="sds-tutorial__secao-titulo sds-tutorial__secao-titulo--avancar">
                <ArrowRight size={13} weight="bold" />
                Siga em frente
                {avancarEfetivo.acao && (
                  <span className="sds-tutorial__secao-badge">{avancarEfetivo.acao}</span>
                )}
              </h4>
            </header>
            <div className="sds-tutorial__avancar">
              <strong id="sds-tutorial-avancar-titulo">{avancarEfetivo.titulo}</strong>
              <p>{avancarEfetivo.descricao}</p>
            </div>
          </aside>
        </>
      )}

      <button
        ref={refFab}
        type="button"
        className={`sds-tutorial__gabi-fab${painelAberto ? ' sds-tutorial__gabi-fab--ativo' : ''}`}
        aria-expanded={painelAberto}
        aria-controls="sds-tutorial-painel"
        aria-label={painelAberto ? 'Fechar guia da Gabi' : 'Abrir guia da Gabi'}
        title="Gabi · guia da demo"
        onClick={() => setPainelAberto((aberto) => !aberto)}
      >
        <span className="sds-tutorial__gabi-avatar" aria-hidden>
          <Sparkle size={17} weight="fill" />
        </span>
        {!painelAberto && <span className="sds-tutorial__gabi-anel" aria-hidden />}
      </button>
    </div>
  )
}
