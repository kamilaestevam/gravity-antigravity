import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import './botao.css';
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
export const BotaoGlobal = React.forwardRef(function BotaoGlobal({ variante = 'primario', tamanho = 'padrao', icone, iconeDireita, blocoCompleto = false, centralizado = false, className = '', children, type = 'button', ...rest }, ref) {
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
        .join(' ');
    return (_jsxs("button", { ref: ref, type: type, className: classes, ...rest, children: [icone && !children && (_jsx("span", { className: "gb-btn__icon-only", "aria-hidden": "true", children: icone })), icone && children && (_jsx("span", { className: "gb-btn__icon-badge", "aria-hidden": "true", children: icone })), children, iconeDireita && (_jsx("span", { className: "gb-btn__icon-direita", "aria-hidden": "true", children: iconeDireita }))] }));
});
