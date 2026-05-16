import React from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import './botao.css'
import type { BotaoProps } from './tipos.js'

/**
 * BotaoGlobal — Componente de botão global do Gravity Design System.
 *
 * O ícone principal (`icone`) é exibido dentro de um **badge circular**
 * embutido no lado esquerdo do pill — padrão visual Gravity.
 *
 * @example
 * // Botão primário com ícone badge (padrão)
 * <BotaoGlobal icone={<Plus size={14} weight="bold" />}>Nova Empresa</BotaoGlobal>
 *
 * @example
 * // Botão com feedback de carregamento
 * <BotaoGlobal variante="perigo" carregando={excluindo} onClick={handleExcluir}>
 *   Excluir
 * </BotaoGlobal>
 */
export const BotaoGlobal = React.forwardRef<HTMLButtonElement, BotaoProps>(
  function BotaoGlobal(
    {
      variante = 'primario',
      tamanho = 'padrao',
      icone,
      iconeDireita,
      blocoCompleto = false,
      centralizado = false,
      carregando = false,
      textoCarregando,
      resultadoAcao = null,
      className = '',
      children,
      type = 'button',
      disabled,
      ...rest
    },
    ref,
  ) {
    const temIcone = !!(icone || carregando || resultadoAcao)

    const classes = [
      'gb-btn',
      `gb-btn--${variante}`,
      tamanho !== 'padrao' ? `gb-btn--${tamanho}` : '',
      blocoCompleto ? 'gb-btn--bloco' : '',
      centralizado ? 'gb-btn--centralizado' : '',
      temIcone ? 'gb-btn--com-icone' : '',
      temIcone && !children ? 'gb-btn--so-icone' : '',
      carregando ? 'gb-btn--carregando' : '',
      resultadoAcao === 'sucesso' ? 'gb-btn--sucesso' : '',
      resultadoAcao === 'erro' ? 'gb-btn--erro' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    const tamanhoIcone = tamanho === 'pequeno' ? 13 : tamanho === 'grande' ? 16 : 14

    const renderIconeBadge = () => {
      if (resultadoAcao === 'sucesso') {
        return <CheckCircle size={tamanhoIcone} weight="fill" />
      }
      if (resultadoAcao === 'erro') {
        return <XCircle size={tamanhoIcone} weight="fill" />
      }
      if (carregando) {
        const svgSize = tamanhoIcone
        return (
          <span className="gb-btn__orbital">
            <svg width={svgSize} height={svgSize} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.9" />
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
            </svg>
            <span className="gb-btn__orbit" />
          </span>
        )
      }
      return icone
    }

    const iconeFinal = renderIconeBadge()
    const textoVisivel = carregando && textoCarregando ? textoCarregando : children

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || carregando}
        aria-busy={carregando || undefined}
        {...rest}
      >
        {iconeFinal && !textoVisivel && (
          <span className="gb-btn__icon-only" aria-hidden="true">
            {iconeFinal}
          </span>
        )}
        {iconeFinal && textoVisivel && (
          <span className="gb-btn__icon-badge" aria-hidden="true">
            {iconeFinal}
          </span>
        )}
        {textoVisivel}
        {iconeDireita && !carregando && !resultadoAcao && (
          <span className="gb-btn__icon-direita" aria-hidden="true">
            {iconeDireita}
          </span>
        )}
      </button>
    )
  },
)
