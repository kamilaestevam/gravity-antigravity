import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './tooltip-stat-card.css';
/**
 * Tooltip nativa customizada para o contexto do StatCardGlobal.
 * Não é um componente global solto, é fortemente acoplado ao sub-ecossistema do Card.
 */
export function TooltipStatCardGlobal({ icone, titulo, children }) {
    return (_jsxs("div", { className: "scg-card__tooltip", children: [_jsxs("div", { className: "scg-tooltip__header", children: [icone && _jsx("span", { className: "scg-tooltip__header-icon", children: icone }), _jsx("p", { className: "scg-tooltip__title", children: titulo })] }), _jsx("div", { className: "scg-tooltip__divider" }), children] }));
}
