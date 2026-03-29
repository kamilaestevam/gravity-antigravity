import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ArrowUp, ArrowDown, ArrowRight } from '@phosphor-icons/react';
import './stat-card.css';
/**
 * StatCardGlobal — Mini Dashboard Card do Gravity Design System
 *
 * Card flexível para exibição de métricas rápidas.
 * Suporta título, ícone, grande valor numérico, indicador de tendência e subtexto.
 */
import { TooltipStatCardGlobal } from '../sub-componentes/tooltip-stat-card-global/src/tooltip-stat-card';
export function StatCardGlobal({ titulo, valor, tendencia, subtexto, icone, variante = 'padrao', alinhamento = 'esquerda', className = '', tooltip, }) {
    const baseClass = [
        'scg-card',
        `scg-card--${variante}`,
        `scg-card--align-${alinhamento}`,
        tooltip ? 'scg-card--has-tooltip' : '',
        className
    ].filter(Boolean).join(' ');
    return (_jsxs("div", { className: baseClass, children: [_jsxs("div", { className: "scg-card__header", children: [icone && _jsx("div", { className: "scg-card__icon-wrap", children: icone }), _jsx("p", { className: "scg-card__label", children: titulo })] }), _jsxs("div", { className: "scg-card__body", children: [_jsxs("div", { className: "scg-card__value-row", children: [_jsx("span", { className: "scg-card__value", children: valor }), tendencia && (_jsxs("span", { className: `scg-card__trend scg-card__trend--${tendencia.direcao}`, children: [tendencia.direcao === 'up' && _jsx(ArrowUp, { size: 12, weight: "bold" }), tendencia.direcao === 'down' && _jsx(ArrowDown, { size: 12, weight: "bold" }), tendencia.direcao === 'neutral' && _jsx(ArrowRight, { size: 12, weight: "bold" }), tendencia.valor] }))] }), subtexto && (_jsx("div", { className: "scg-card__subtext", children: subtexto }))] }), tooltip && (_jsx(TooltipStatCardGlobal, { icone: icone, titulo: titulo, children: tooltip }))] }));
}
