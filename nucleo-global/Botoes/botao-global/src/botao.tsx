import React from 'react'
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
 * // Botão fantasma pequeno
 * <BotaoGlobal variante="fantasma" tamanho="pequeno" icone={<Copy size={13} />}>
 *   Copiar
 * </BotaoGlobal>
 *
 * @example
 * // Botão de perigo
 * <BotaoGlobal variante="perigo" onClick={handleExcluir}>Excluir</BotaoGlobal>
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
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) {
    const classes = [
      'gb-btn',
      `gb-btn--${variante}`,
      tamanho !== 'padrao' ? `gb-btn--${tamanho}` : '',
      blocoCompleto ? 'gb-btn--bloco' : '',
      centralizado ? 'gb-btn--centralizado' : '',
      icone ? 'gb-btn--com-icone' : '',
      icone && !children ? 'gb-btn--so-icone' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button ref={ref} type={type} className={classes} {...rest}>
        {/* Icon-only: sem badge, ícone direto centralizado no botão */}
        {icone && !children && (
          <span className="gb-btn__icon-only" aria-hidden="true">
            {icone}
          </span>
        )}
        {/* Com texto: ícone dentro de badge circular embutido */}
        {icone && children && (
          <span className="gb-btn__icon-badge" aria-hidden="true">
            {icone}
          </span>
        )}
        {children}
        {iconeDireita && (
          <span className="gb-btn__icon-direita" aria-hidden="true">
            {iconeDireita}
          </span>
        )}
      </button>
    )
  },
)
