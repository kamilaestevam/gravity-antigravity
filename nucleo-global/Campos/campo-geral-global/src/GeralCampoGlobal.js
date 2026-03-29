import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TooltipGlobal } from '@nucleo/tooltip-global';
import './campo-geral.css';
export function GeralCampoGlobal({ label, tooltipTitulo, tooltipDescricao, children, className = '', obrigatorio = false, erro, hint, }) {
    const compLabel = label ? (obrigatorio ? `${label} *` : label) : null;
    return (_jsxs("div", { className: `cg-wrapper ${erro ? 'cg-wrapper--erro' : ''} ${className}`.trim(), children: [compLabel && (_jsx("label", { className: "cg-label", children: tooltipTitulo && tooltipDescricao ? (_jsx(TooltipGlobal, { titulo: tooltipTitulo, descricao: tooltipDescricao, children: _jsx("span", { children: compLabel }) })) : (_jsx("span", { children: compLabel })) })), children, hint && !erro && (_jsx("span", { className: "cg-hint", children: hint })), erro && (_jsx("span", { className: "cg-erro", role: "alert", children: erro }))] }));
}
