/**
 * tutorial-opcional-simulador-smart-doc.tsx — guia opcional da Gabi por tela
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  Compass,
  DotsSixVertical,
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

/** z-index acima de modais Pedido (explicacao 12000, excluir 10100, wizard 9999) */
export const Z_INDEX_TUTORIAL_SIMULADOR = 12100

const CHAVE_DESLOCAMENTO_TUTORIAL = 'sds-tutorial-deslocamento'
const CHAVE_DESLOCAMENTO_TUTORIAL_ESQUERDA = 'sds-tutorial-deslocamento-esquerda'
const CHAVE_DESLOCAMENTO_TUTORIAL_SUPERIOR_ESQUERDA = 'sds-tutorial-deslocamento-sup-esquerda'
const CHAVE_DESLOCAMENTO_TUTORIAL_MODAL = 'sds-tutorial-deslocamento-modal'
const LIMIAR_ARRASTE_FAB_PX = 6

export type PosicaoPreferencialTutorial =
  | 'inferior-direita'
  | 'inferior-esquerda'
  | 'superior-direita'
  | 'superior-esquerda'

type DeslocamentoTutorial = { x: number; y: number }

function chaveDeslocamentoTutorial(posicao: PosicaoPreferencialTutorial): string {
  switch (posicao) {
    case 'superior-direita':
      return CHAVE_DESLOCAMENTO_TUTORIAL_MODAL
    case 'superior-esquerda':
      return CHAVE_DESLOCAMENTO_TUTORIAL_SUPERIOR_ESQUERDA
    case 'inferior-esquerda':
      return CHAVE_DESLOCAMENTO_TUTORIAL_ESQUERDA
    default:
      return CHAVE_DESLOCAMENTO_TUTORIAL
  }
}

function lerDeslocamentoSalvo(posicao: PosicaoPreferencialTutorial): DeslocamentoTutorial {
  if (typeof window === 'undefined') return { x: 0, y: 0 }
  try {
    const raw = window.sessionStorage.getItem(chaveDeslocamentoTutorial(posicao))
    if (!raw) return { x: 0, y: 0 }
    const parsed = JSON.parse(raw) as DeslocamentoTutorial
    if (typeof parsed.x === 'number' && typeof parsed.y === 'number') return parsed
  } catch {
    /* ignora */
  }
  return { x: 0, y: 0 }
}

type Props = {
  idTela: string
  /** Registro de telas — padrão Smart Docs; Pedido passa o próprio mapa */
  telas?: Record<string, TelaTutorialOpcional>
  habilitado?: boolean
  atrasoAberturaMs?: number
  /** Usa avancarAposAnexo da tela quando definido (ex.: passo 1 após simular anexo) */
  usarAvancarAposAnexo?: boolean
  /** Portal em document.body + z-index acima de modais wizard (Pedido, transferir, etc.) */
  posicaoFixa?: boolean
  /** Ancora FAB/painéis no canto do simulador (demo marketing em placa 3D) */
  refAncoraSimulador?: RefObject<HTMLElement | null>
  /** Canto padrão — modais usam superior-direita para não cobrir botões do rodapé */
  posicaoPreferencial?: PosicaoPreferencialTutorial
  /** Só o ícone FAB visível — evita cantos superiores (ex.: tampar fechar do modal) */
  posicaoPreferencialPainelFechado?: PosicaoPreferencialTutorial
  /** Classe extra no host (ex.: wizard Nova Leitura portaled fora do overlay) */
  classeHost?: string
  /** Impede arrastar a pilha para a faixa do cabeçalho (botão fechar do modal) */
  reservarCabecalhoModal?: boolean
  onAlvoDestacadoChange?: (idAlvo: string | null) => void
}

export function TutorialOpcionalSimuladorSmartDoc({
  idTela,
  telas: telasProp,
  habilitado = true,
  atrasoAberturaMs = 900,
  usarAvancarAposAnexo = false,
  posicaoFixa = false,
  refAncoraSimulador,
  posicaoPreferencial = 'inferior-direita',
  posicaoPreferencialPainelFechado = 'inferior-direita',
  classeHost,
  reservarCabecalhoModal = false,
  onAlvoDestacadoChange,
}: Props) {
  const registroTelas = telasProp ?? TELAS_TUTORIAL_OPCIONAL
  const tela: TelaTutorialOpcional | undefined = registroTelas[idTela]
  const [painelAberto, setPainelAberto] = useState(false)
  const [explorarAlvoHover, setExplorarAlvoHover] = useState<string | null>(null)
  const [cardAvancarHover, setCardAvancarHover] = useState(false)
  const [estiloAncora, setEstiloAncora] = useState<CSSProperties>({})
  const [deslocamento, setDeslocamento] = useState<DeslocamentoTutorial>(() =>
    lerDeslocamentoSalvo(posicaoPreferencial),
  )
  const [arrastando, setArrastando] = useState(false)
  const telasVistasRef = useRef<Set<string>>(new Set())
  const usuarioFechouPainelRef = useRef(false)
  const refPainel = useRef<HTMLElement>(null)
  const refCardAvancar = useRef<HTMLElement>(null)
  const refFab = useRef<HTMLButtonElement>(null)
  const refPilha = useRef<HTMLDivElement>(null)
  const refContainerTutorial = useRef<HTMLDivElement>(null)
  const arrasteAtivoRef = useRef(false)
  const origemArrasteRef = useRef({ px: 0, py: 0, ox: 0, oy: 0 })
  const fabClicavelRef = useRef(true)

  const fecharPainel = useCallback(() => {
    usuarioFechouPainelRef.current = true
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

  const posicaoAtiva = painelAberto ? posicaoPreferencial : posicaoPreferencialPainelFechado

  const ancoradoNoSimulador = Boolean(posicaoFixa && refAncoraSimulador)
  const ancoraSuperiorDireita = posicaoAtiva === 'superior-direita'
  const ancoraSuperiorEsquerda = posicaoAtiva === 'superior-esquerda'
  const ancoraInferiorEsquerda = posicaoAtiva === 'inferior-esquerda'

  useEffect(() => {
    setDeslocamento(lerDeslocamentoSalvo(posicaoAtiva))
  }, [posicaoAtiva])

  useLayoutEffect(() => {
    if (!ancoradoNoSimulador || !refAncoraSimulador?.current) {
      setEstiloAncora({})
      return
    }

    const el = refAncoraSimulador.current

    function atualizar() {
      const rect = el.getBoundingClientRect()
      setEstiloAncora({
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        zIndex: Z_INDEX_TUTORIAL_SIMULADOR,
      })
    }

    atualizar()
    const obs = new ResizeObserver(atualizar)
    obs.observe(el)
    window.addEventListener('resize', atualizar)
    window.addEventListener('scroll', atualizar, true)
    return () => {
      obs.disconnect()
      window.removeEventListener('resize', atualizar)
      window.removeEventListener('scroll', atualizar, true)
    }
  }, [ancoradoNoSimulador, refAncoraSimulador])

  const limitarDeslocamento = useCallback((x: number, y: number): DeslocamentoTutorial => {
    const pilha = refPilha.current
    if (!pilha) return { x, y }

    const areaFonte = refAncoraSimulador?.current ?? refContainerTutorial.current
    if (!areaFonte) return { x, y }

    const area = areaFonte.getBoundingClientRect()
    const bloco = pilha.getBoundingClientRect()
    const margem = 8
    const reservaTopo = reservarCabecalhoModal ? 52 : 0

    if (ancoraSuperiorDireita) {
      const maxEsquerda = -(area.width - bloco.width - margem * 2)
      const maxBaixo = Math.max(0, area.height - bloco.height - margem * 2)
      return {
        x: Math.min(0, Math.max(maxEsquerda, x)),
        y: Math.max(0, Math.min(maxBaixo, y)),
      }
    }

    if (ancoraSuperiorEsquerda) {
      const maxDireita = Math.max(0, area.width - bloco.width - margem * 2)
      const maxBaixo = Math.max(0, area.height - bloco.height - margem * 2)
      return {
        x: Math.max(0, Math.min(maxDireita, x)),
        y: Math.max(0, Math.min(maxBaixo, y)),
      }
    }

    if (ancoraInferiorEsquerda) {
      const maxDireita = Math.max(0, area.width - bloco.width - margem * 2)
      const maxCima = -(area.height - bloco.height - margem * 2)
      return {
        x: Math.max(0, Math.min(maxDireita, x)),
        y: Math.min(0, Math.max(maxCima, y)),
      }
    }

    const maxEsquerda = -(area.width - bloco.width - margem * 2)
    const maxCima = -(area.height - bloco.height - margem * 2 - reservaTopo)

    return {
      x: Math.min(0, Math.max(maxEsquerda, x)),
      y: Math.min(0, Math.max(maxCima, y)),
    }
  }, [ancoraSuperiorDireita, ancoraSuperiorEsquerda, ancoraInferiorEsquerda, refAncoraSimulador, reservarCabecalhoModal])

  const iniciarArraste = useCallback(
    (ev: PointerEvent<HTMLElement>) => {
      if (ev.button !== 0) return
      ev.preventDefault()
      ev.currentTarget.setPointerCapture(ev.pointerId)
      arrasteAtivoRef.current = true
      fabClicavelRef.current = true
      setArrastando(true)
      origemArrasteRef.current = {
        px: ev.clientX,
        py: ev.clientY,
        ox: deslocamento.x,
        oy: deslocamento.y,
      }
    },
    [deslocamento.x, deslocamento.y],
  )

  useEffect(() => {
    function aoMover(ev: PointerEvent) {
      if (!arrasteAtivoRef.current) return
      const dx = ev.clientX - origemArrasteRef.current.px
      const dy = ev.clientY - origemArrasteRef.current.py
      if (Math.abs(dx) > LIMIAR_ARRASTE_FAB_PX || Math.abs(dy) > LIMIAR_ARRASTE_FAB_PX) {
        fabClicavelRef.current = false
      }
      setDeslocamento(
        limitarDeslocamento(origemArrasteRef.current.ox + dx, origemArrasteRef.current.oy + dy),
      )
    }

    function aoSoltar() {
      if (!arrasteAtivoRef.current) return
      arrasteAtivoRef.current = false
      setArrastando(false)
    }

    document.addEventListener('pointermove', aoMover)
    document.addEventListener('pointerup', aoSoltar)
    document.addEventListener('pointercancel', aoSoltar)
    return () => {
      document.removeEventListener('pointermove', aoMover)
      document.removeEventListener('pointerup', aoSoltar)
      document.removeEventListener('pointercancel', aoSoltar)
    }
  }, [limitarDeslocamento])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(
        chaveDeslocamentoTutorial(posicaoAtiva),
        JSON.stringify(deslocamento),
      )
    } catch {
      /* ignora */
    }
  }, [deslocamento, posicaoAtiva])

  useEffect(() => {
    setDeslocamento((atual) => limitarDeslocamento(atual.x, atual.y))
  }, [estiloAncora, painelAberto, posicaoAtiva, limitarDeslocamento])

  useEffect(() => {
    if (!habilitado || !tela) {
      setPainelAberto(false)
      return
    }

    setExplorarAlvoHover(null)

    /* Navegação (expandir pedido, abrir modal etc.): mantém painel aberto e só troca o conteúdo */
    if (painelAberto) {
      telasVistasRef.current.add(idTela)
      return
    }

    if (usuarioFechouPainelRef.current) return
    if (telasVistasRef.current.has(idTela)) return

    const timer = window.setTimeout(() => {
      setPainelAberto(true)
      telasVistasRef.current.add(idTela)
    }, atrasoAberturaMs)

    return () => window.clearTimeout(timer)
  }, [habilitado, idTela, tela, atrasoAberturaMs, painelAberto])

  useEffect(() => {
    if (!habilitado) {
      setPainelAberto(false)
      setExplorarAlvoHover(null)
    }
  }, [habilitado])

  useEffect(() => {
    onAlvoDestacadoChange?.(alvoDestaque)
  }, [alvoDestaque, onAlvoDestacadoChange])

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

  const conteudo = (
    <div
      ref={refContainerTutorial}
      className={`sds-tutorial${posicaoFixa ? ' sds-tutorial--fixo' : ''}${ancoradoNoSimulador ? ' sds-tutorial--ancorado' : ''}${ancoraSuperiorDireita ? ' sds-tutorial--superior-direita' : ''}${ancoraSuperiorEsquerda ? ' sds-tutorial--superior-esquerda' : ''}${ancoraInferiorEsquerda ? ' sds-tutorial--inferior-esquerda' : ''}${classeHost ? ` ${classeHost}` : ''}`}
      style={ancoradoNoSimulador ? estiloAncora : undefined}
      aria-label="Guia da Gabi — demonstração interativa"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div
        ref={refPilha}
        className={`sds-tutorial__pilha${arrastando ? ' sds-tutorial__pilha--arrastando' : ''}`}
        style={{ transform: `translate(${deslocamento.x}px, ${deslocamento.y}px)` }}
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
            <header
              className="sds-tutorial__cabecalho"
              onPointerDown={iniciarArraste}
            >
              <button
                type="button"
                className="sds-tutorial__arraste-grip"
                aria-label="Arrastar guia da Gabi"
                title="Arrastar"
                onPointerDown={(ev) => {
                  ev.stopPropagation()
                  iniciarArraste(ev)
                }}
              >
                <DotsSixVertical size={14} weight="bold" />
              </button>
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
                onPointerDown={(ev) => ev.stopPropagation()}
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
        title="Gabi · guia da demo (arraste para mover)"
        onPointerDown={iniciarArraste}
        onClick={(ev) => {
          if (!fabClicavelRef.current) {
            ev.preventDefault()
            ev.stopPropagation()
            return
          }
          setPainelAberto((aberto) => {
            const proximo = !aberto
            if (proximo) usuarioFechouPainelRef.current = false
            return proximo
          })
        }}
      >
        <span className="sds-tutorial__gabi-avatar" aria-hidden>
          <Sparkle size={17} weight="fill" />
        </span>
        {!painelAberto && <span className="sds-tutorial__gabi-anel" aria-hidden />}
      </button>
      </div>
    </div>
  )

  if (posicaoFixa) {
    if (typeof document === 'undefined') return null
    return createPortal(conteudo, document.body)
  }

  return conteudo
}
