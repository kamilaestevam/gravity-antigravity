import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TooltipGlobal } from '@nucleo/tooltip-global';
export function SecaoFormularioGlobal({ icone, titulo, tooltip, marginBottom = '1rem', }) {
    return (_jsx("p", { className: "ws-section-title", style: { width: 'max-content', marginBottom, marginTop: 0 }, children: tooltip ? (_jsx(TooltipGlobal, { titulo: titulo, descricao: tooltip, children: _jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: '0.375rem', cursor: 'help' }, children: [_jsx("span", { style: { color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }, children: icone }), titulo] }) })) : (_jsxs("span", { style: { display: 'flex', alignItems: 'center', gap: '0.375rem' }, children: [_jsx("span", { style: { color: 'var(--ws-accent)', display: 'flex', alignItems: 'center' }, children: icone }), titulo] })) }));
}
