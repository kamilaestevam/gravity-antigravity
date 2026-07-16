/**
 * Quickly Tour — guia interativo Minha jornada (Explore aqui + Siga em frente).
 */

import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Compass, Eye, Path, X } from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import { TELAS_QUICKLY_TOUR_MINHA_JORNADA } from './dados-quickly-tour-minha-jornada'
import {
  quicklyTourMinhaJornadaSuprimido,
  reverterSuprimirQuicklyTourMinhaJornada,
  suprimirQuicklyTourMinhaJornada,
} from './persistencia-quickly-tour-minha-jornada'
import './quickly-tour-minha-jornada.css'
import './destaque-quickly-tour-minha-jornada.css'

const ATR_ALVO = 'data-uni-quickly-tour-alvo'
const CLASSE_DESTAQUE = 'uni-quickly-tour-alvo--destacado'

type Props = {
  habilitado: boolean
  onAlvoTourChange?: (idAlvo: string | null) => void
}

function limparDestaques() {
  document.querySelectorAll(`.${CLASSE_DESTAQUE}`).forEach(el => {
    el.classList.remove(CLASSE_DESTAQUE)
  })
}

function aplicarDestaque(idAlvo: string | null | undefined) {
  limparDestaques()
  if (!idAlvo) return

  const destacar = (tentativa: number) => {
    const el = document.querySelector(`[${ATR_ALVO}="${idAlvo}"]`)
    if (!el) {
      if (tentativa < 6) {
        window.setTimeout(() => destacar(tentativa + 1), 80)
      }
      return
    }
    el.classList.add(CLASSE_DESTAQUE)
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
  }

  const atraso = idAlvo.startsWith('qt-menu-') ? 100 : 0
  window.setTimeout(() => destacar(0), atraso)
}

export function QuicklyTourMinhaJornada({ habilitado, onAlvoTourChange }: Props) {
  const { t } = useTranslation()
  const [suprimido, setSuprimido] = useState(() => quicklyTourMinhaJornadaSuprimido())
  const [painelAberto, setPainelAberto] = useState(false)
  const [telaIndex, setTelaIndex] = useState(0)
  const [explorarAlvoHover, setExplorarAlvoHover] = useState<string | null>(null)
  const [cardAvancarHover, setCardAvancarHover] = useState(false)

  const telas = TELAS_QUICKLY_TOUR_MINHA_JORNADA
  const tela = telas[telaIndex]
  const ultimaTela = telaIndex >= telas.length - 1

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('quickly_tour_reset') !== '1') return
    reverterSuprimirQuicklyTourMinhaJornada()
    setSuprimido(false)
    params.delete('quickly_tour_reset')
    const qs = params.toString()
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`
    window.history.replaceState(null, '', next)
  }, [])

  const alvoDestaque =
    explorarAlvoHover
    ?? (cardAvancarHover ? tela?.avancar.idAlvo ?? null : null)
    ?? (painelAberto ? tela?.explorar[0]?.idAlvo ?? null : null)

  useEffect(() => {
    if (!habilitado || suprimido) return
    const timer = window.setTimeout(() => setPainelAberto(true), 900)
    return () => window.clearTimeout(timer)
  }, [habilitado, suprimido])

  useEffect(() => {
    if (!painelAberto || !tela) {
      onAlvoTourChange?.(null)
      limparDestaques()
      return
    }

    const alvoMenu = alvoDestaque?.startsWith('qt-menu-') ? alvoDestaque : null
    onAlvoTourChange?.(alvoMenu)
    aplicarDestaque(alvoDestaque)
    return () => limparDestaques()
  }, [painelAberto, tela, alvoDestaque, onAlvoTourChange])

  const fecharPainel = useCallback(() => {
    setPainelAberto(false)
    setExplorarAlvoHover(null)
    setCardAvancarHover(false)
    onAlvoTourChange?.(null)
    limparDestaques()
  }, [onAlvoTourChange])

  const abrirPainel = useCallback(() => {
    setTelaIndex(0)
    setPainelAberto(true)
  }, [])

  const naoMostrarNovamente = useCallback(() => {
    suprimirQuicklyTourMinhaJornada()
    setSuprimido(true)
    setPainelAberto(false)
    onAlvoTourChange?.(null)
    limparDestaques()
  }, [onAlvoTourChange])

  const seguirEmFrente = useCallback(() => {
    if (ultimaTela) {
      fecharPainel()
      return
    }
    setTelaIndex(i => Math.min(i + 1, telas.length - 1))
    setExplorarAlvoHover(null)
    setCardAvancarHover(false)
  }, [fecharPainel, telas.length, ultimaTela])

  if (!habilitado || suprimido || !tela) return null

  function vincularDestaqueItem(idAlvo?: string) {
    return {
      onMouseEnter: () => setExplorarAlvoHover(idAlvo ?? null),
      onMouseLeave: () => setExplorarAlvoHover(null),
      onFocus: () => setExplorarAlvoHover(idAlvo ?? null),
      onBlur: () => setExplorarAlvoHover(null),
    }
  }

  const conteudo = (
    <div className="uni-quickly-tour" role="complementary" aria-label={t('university.quickly_tour.aria_painel')}>
      {painelAberto ? (
        <>
          <aside className="uni-quickly-tour__painel" aria-labelledby="uni-quickly-tour-explore-titulo">
            <header className="uni-quickly-tour__cabecalho">
              <div className="uni-quickly-tour__identidade">
                <span className="uni-quickly-tour__icone-marca" aria-hidden>
                  <Path size={14} weight="duotone" />
                </span>
                <div className="uni-quickly-tour__titulos">
                  <p className="uni-quickly-tour__nome">{t('university.quickly_tour.nome')}</p>
                  <p className="uni-quickly-tour__etiqueta">{t('university.quickly_tour.etiqueta')}</p>
                </div>
              </div>
              <button
                type="button"
                className="uni-quickly-tour__fechar"
                onClick={fecharPainel}
                aria-label={t('university.quickly_tour.fechar_aria')}
              >
                <X size={14} weight="bold" />
              </button>
            </header>

            <div className="uni-quickly-tour__contexto">
              <h3>{t(tela.chaveTitulo)}</h3>
              <p className="uni-quickly-tour__resumo">{t(tela.chaveResumo)}</p>
              <div className="uni-quickly-tour__progresso-trilha-wrap">
                <div className="uni-quickly-tour__progresso-trilha" aria-hidden>
                  <div
                    className="uni-quickly-tour__progresso-preenchido"
                    style={{ width: `${((telaIndex + 1) / telas.length) * 100}%` }}
                  />
                </div>
                <span className="uni-quickly-tour__progresso-rotulo">
                  {t('university.quickly_tour.etapa', { atual: telaIndex + 1, total: telas.length })}
                </span>
              </div>
            </div>

            <div className="uni-quickly-tour__corpo">
              <section className="uni-quickly-tour__secao">
                <h4 id="uni-quickly-tour-explore-titulo" className="uni-quickly-tour__secao-titulo">
                  <Eye size={13} weight="duotone" />
                  {t('university.quickly_tour.explorar_aqui')}
                </h4>
                <ul className="uni-quickly-tour__lista">
                  {tela.explorar.map((item) => (
                    <li
                      key={item.chaveTitulo}
                      className={`uni-quickly-tour__item${item.idAlvo && explorarAlvoHover === item.idAlvo ? ' uni-quickly-tour__item--ativo' : ''}`}
                      {...vincularDestaqueItem(item.idAlvo)}
                    >
                      <span className="uni-quickly-tour__item-icone" aria-hidden>
                        <Compass size={14} weight="duotone" />
                      </span>
                      <div>
                        <strong>{t(item.chaveTitulo)}</strong>
                        <p>{t(item.chaveDescricao)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <footer className="uni-quickly-tour__rodape-painel">
              <button type="button" className="uni-quickly-tour__btn-entendi" onClick={fecharPainel}>
                {t('university.quickly_tour.entendi_explorar')}
              </button>
              <div className="uni-quickly-tour__acoes-secundarias">
                <button type="button" className="uni-quickly-tour__link" onClick={fecharPainel}>
                  {t('university.quickly_tour.fechar')}
                </button>
                <button
                  type="button"
                  className="uni-quickly-tour__link uni-quickly-tour__link--suprimir"
                  onClick={naoMostrarNovamente}
                >
                  {t('university.quickly_tour.nao_mostrar_novamente')}
                </button>
              </div>
            </footer>
          </aside>

          <aside
            className={`uni-quickly-tour__card-avancar${cardAvancarHover ? ' uni-quickly-tour__card-avancar--ativo' : ''}`}
            role="complementary"
            onMouseEnter={() => {
              setCardAvancarHover(true)
              setExplorarAlvoHover(tela.avancar.idAlvo ?? null)
            }}
            onMouseLeave={() => {
              setCardAvancarHover(false)
              setExplorarAlvoHover(null)
            }}
            onClick={seguirEmFrente}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault()
                seguirEmFrente()
              }
            }}
            tabIndex={0}
          >
            <header className="uni-quickly-tour__card-avancar-cabecalho">
              <h4 className="uni-quickly-tour__secao-titulo uni-quickly-tour__secao-titulo--avancar">
                <ArrowRight size={13} weight="bold" />
                {t('university.quickly_tour.siga_em_frente')}
                {tela.avancar.chaveAcao ? (
                  <span className="uni-quickly-tour__secao-badge">{t(tela.avancar.chaveAcao)}</span>
                ) : null}
              </h4>
            </header>
            <div className="uni-quickly-tour__avancar">
              <strong>{t(tela.avancar.chaveTitulo)}</strong>
              <p>{t(tela.avancar.chaveDescricao)}</p>
            </div>
          </aside>
        </>
      ) : null}

      <button
        type="button"
        className={`uni-quickly-tour__fab${painelAberto ? ' uni-quickly-tour__fab--ativo' : ''}`}
        onClick={() => (painelAberto ? fecharPainel() : abrirPainel())}
        aria-expanded={painelAberto}
        aria-label={t('university.quickly_tour.abrir_aria')}
        title={t('university.quickly_tour.nome')}
      >
        <Path size={22} weight="duotone" />
      </button>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(conteudo, document.body)
}
