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
export function CabecalhoGlobal({ titulo, subtitulo, icone, acoes }: CabecalhoProps) {
  return (
    <header className="cg-header">
      <div className="cg-header__title-block">
        {/* Linha: ícone + h1 */}
        <div className="cg-header__title-row">
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

      {/* Slot de ações (direita) */}
      {acoes && (
        <div className="cg-header__actions">
          {acoes}
        </div>
      )}
    </header>
  )
}
