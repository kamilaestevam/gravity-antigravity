import React from 'react'
import type { SecaoProps } from './tipos.js'
import './secao.css'

const FADE_CLASSES = ['', 'ws-fade-up-d1', 'ws-fade-up-d2', 'ws-fade-up-d3'] as const

/**
 * SecaoGlobal — Agrupa conteúdo com título, subtítulo e ações opcionais.
 *
 * Segue o padrão visual do Configurador:
 * - card=true → `.em-section` (background surface, border accent, radius 12px, padding 1.5rem)
 * - titulo → `.ws-section-title` (uppercase, 0.75rem, com ícone accent)
 * - fadeIndex → animação cascading `ws-fade-up`
 *
 * @example
 * <SecaoGlobal titulo="Dados Gerais" icone={<Buildings weight="duotone" size={14} />} card>
 *   <GridGlobal colunas={2} gap={5}>
 *     <CampoGeralGlobal label="Nome" ... />
 *     <CampoGeralGlobal label="CNPJ" ... />
 *   </GridGlobal>
 * </SecaoGlobal>
 */
export function SecaoGlobal({
  titulo,
  subtitulo,
  icone,
  acoes,
  children,
  card = false,
  fadeIndex,
  className = '',
  style,
}: SecaoProps) {
  const temCabecalho = titulo || subtitulo || acoes
  const fadeClass = fadeIndex !== undefined
    ? `ws-fade-up ${FADE_CLASSES[fadeIndex] || ''}`
    : ''

  return (
    <section
      className={[
        'gb-secao',
        card ? 'gb-secao--card' : '',
        fadeClass,
        className,
      ].filter(Boolean).join(' ')}
      style={style}
    >
      {temCabecalho && (
        <div className="gb-secao__header">
          <div className="gb-secao__header-text">
            {titulo && (
              <p className="gb-secao__titulo">
                {icone && (
                  <span className="gb-secao__titulo-icone" aria-hidden="true">
                    {icone}
                  </span>
                )}
                {titulo}
              </p>
            )}
            {subtitulo && <p className="gb-secao__subtitulo">{subtitulo}</p>}
          </div>
          {acoes && (
            <div className="gb-secao__acoes">{acoes}</div>
          )}
        </div>
      )}
      <div className="gb-secao__conteudo">
        {children}
      </div>
    </section>
  )
}
