import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './card.css';
// Mapa de cores para classes CSS e cores de stroke do SVG
const COR_STROKE = {
    green: '#34d399',
    yellow: '#fbbf24',
    red: '#f87171',
};
function dotClass(cor) {
    if (cor === 'green' || cor === 'yellow' || cor === 'red') {
        return `cg-dot cg-dot--${cor}`;
    }
    return 'cg-dot';
}
/**
 * CardGraficoGlobal — Card com gauge circular + legenda do Gravity Design System
 *
 * Exibe um anel SVG proporcional ao valor principal / total,
 * uma legenda com pontos coloridos e um tooltip CSS-only ao hover.
 *
 * @example
 * <CardGraficoGlobal
 *   titulo="Status das Filhas"
 *   icone={<ChartPieSlice weight="duotone" size={16} />}
 *   total={30}
 *   valorPrincipal={23}
 *   corGauge="#34d399"
 *   legenda={[
 *     { label: 'Ativas',    valor: 23, cor: 'green'  },
 *     { label: 'Suspensas', valor:  7, cor: 'yellow' },
 *   ]}
 *   tooltip={...}
 * />
 */
export function CardGraficoGlobal({ titulo, icone, variante = 'padrao', className = '', total, valorPrincipal, corGauge = '#34d399', legenda, tooltip, }) {
    const pct = total > 0 ? Math.round((valorPrincipal / total) * 100) : 0;
    const dashArray = `${pct}, 100`;
    const cls = [
        'cg-card',
        variante !== 'padrao' ? `cg-card--${variante}` : '',
        tooltip ? 'cg-card--has-tooltip' : '',
        className,
    ].filter(Boolean).join(' ');
    const strokeColor = COR_STROKE[corGauge] ?? corGauge;
    return (_jsxs("div", { className: cls, children: [_jsxs("div", { className: "cg-card__header", children: [icone && _jsx("div", { className: "cg-card__icon-wrap", children: icone }), _jsx("p", { className: "cg-card__label", children: titulo })] }), _jsxs("div", { className: "cg-card__chart-body", children: [_jsxs("div", { className: "cg-gauge", style: { width: 48, height: 48 }, children: [_jsxs("svg", { viewBox: "0 0 36 36", width: 48, height: 48, children: [_jsx("path", { d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831", fill: "none", stroke: "rgba(129, 140, 248, 0.12)", strokeWidth: "3.5" }), _jsx("path", { d: "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831", fill: "none", stroke: strokeColor, strokeWidth: "3.5", strokeDasharray: dashArray, strokeLinecap: "round" })] }), _jsxs("div", { className: "cg-gauge__val", children: [_jsx("span", { className: "cg-gauge__num", children: pct }), _jsx("span", { className: "cg-gauge__pct", children: "%" })] })] }), _jsx("ul", { className: "cg-legend", style: { listStyle: 'none', margin: 0, padding: 0 }, children: legenda.map((item, i) => (_jsxs("li", { className: "cg-legend__item", children: [_jsx("span", { className: dotClass(item.cor), style: item.cor !== 'green' && item.cor !== 'yellow' && item.cor !== 'red'
                                        ? { background: item.cor }
                                        : undefined }), item.label, " (", item.valor, ")"] }, i))) })] }), tooltip && (_jsxs("div", { className: "cg-card__tooltip", children: [_jsxs("div", { className: "cg-tooltip__header", children: [icone && _jsx("span", { className: "cg-tooltip__header-icon", children: icone }), _jsx("p", { className: "cg-tooltip__title", children: titulo })] }), _jsx("div", { className: "cg-tooltip__divider" }), tooltip] }))] }));
}
