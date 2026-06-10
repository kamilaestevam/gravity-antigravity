import React from 'react'
import './cabecalho.css'
import type { CabecalhoProps } from './tipos.js'

/**
 * CabecalhoGlobal — Cabeçalho padrão de página do Gravity Design System.
 *
 * Renderiza uma faixa sticky no topo da área de conteúdo com:
 * - Ícone (opcional) + Título (h1) na mesma linha
 * - Subtítulo abaixo, alinhado com a borda esquerda do ícone
 * - Slot de ações à direita (ex: BotaoGlobal)
 *
 * O componente compensa automaticamente o padding do contêiner pai
 * (`ws-content`) para que o cabeçalho fique alinhado com a tabela abaixo.
 *
 * @example
 * <CabecalhoGlobal
 *   icone={<Buildings weight="duotone" size={22} />}
 *   titulo="Empresas Filhas"
 *   subtitulo="Gerencie as empresas filhas do seu tenant Gravity."
 *   acoes={<BotaoGlobal variante="primario">Nova Empresa</BotaoGlobal>}
 * />
 */
export function CabecalhoGlobal({ titulo, subtitulo, icone, acoes, viewToggle, aoVoltar }: CabecalhoProps) {
  return (
    <header className="cg-header">
      <div className="cg-header__title-block">
        {/* Linha: ícone + h1 */}
        <div className="cg-header__title-row">
          {aoVoltar && (
            <button
              type="button"
              className="cg-header__back"
              onClick={aoVoltar}
              aria-label="Voltar"
              title="Voltar"
            >
              <svg width="16" height="16" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
                <path d="M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z"/>
              </svg>
            </button>
          )}
          {icone && (
            <span className="cg-header__icon" aria-hidden="true">
              {icone}
            </span>
          )}
          <h1 className="cg-header__title">{titulo}</h1>
        </div>

        {/* Subtítulo alinhado com o ícone */}
        {subtitulo && (
          <p className="cg-header__subtitle">{subtitulo}</p>
        )}
      </div>

      {/* Slot central — view toggle (Dashboard/Lista/Kanban) */}
      {viewToggle && (
        <div className="cg-header__view-toggle">
          {viewToggle}
        </div>
      )}

      {/* Slot de ações (direita) */}
      {acoes && (
        <div className="cg-header__actions">
          {acoes}
        </div>
      )}
    </header>
  )
}
