import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './seletor-visualizacao.css';
import { Rows, Kanban, ChartBar, } from '@phosphor-icons/react';
// ─── Configuração padrão das views ───────────────────────────────────────────
const ALL_VIEWS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: _jsx(ChartBar, { weight: "duotone", size: 15 }),
    },
    {
        id: 'lista',
        label: 'Lista',
        icon: _jsx(Rows, { weight: "duotone", size: 15 }),
    },
    {
        id: 'kanban',
        label: 'Kanban',
        icon: _jsx(Kanban, { weight: "duotone", size: 15 }),
    },
];
// ─── Componente ──────────────────────────────────────────────────────────────
export function SeletorVisualizacao({ view, onChange, views = ['dashboard', 'lista', 'kanban'], tamanho = 'medio', }) {
    const visibles = ALL_VIEWS.filter(v => views.includes(v.id));
    return (_jsxs("nav", { className: `sv-root sv-root--${tamanho}`, "aria-label": "Selecionar visualiza\u00E7\u00E3o", role: "tablist", children: [_jsx("div", { className: "sv-track" }), visibles.map(opt => {
                const isActive = opt.id === view;
                return (_jsxs("button", { role: "tab", "aria-selected": isActive, "aria-label": `Visualização: ${opt.label}`, id: `sv-btn-${opt.id}`, className: `sv-btn ${isActive ? 'sv-btn--active' : ''}`, onClick: () => onChange(opt.id), type: "button", children: [_jsx("span", { className: "sv-btn__icon", children: opt.icon }), _jsx("span", { className: "sv-btn__label", children: opt.label })] }, opt.id));
            })] }));
}
