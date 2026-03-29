import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './pagina-global.css';
export function PaginaGlobal({ cabecalho, stats, acoes, toolbar, layout = 'lista', children, className = '' }) {
    const customLayoutClass = `pg-layout-${layout}`;
    const hasMiddleLayer = !!stats || !!acoes;
    return (_jsxs("div", { className: `pg-container ${className}`, children: [_jsx("div", { className: "pg-cabecalho-wrapper", children: cabecalho }), hasMiddleLayer && (_jsxs("div", { className: `pg-contexto-row ${stats ? 'pg-has-stats' : 'pg-no-stats'}`, children: [_jsx("div", { className: "pg-stats-area", children: stats }), _jsx("div", { className: "pg-acoes-area", children: acoes })] })), toolbar && (_jsx("div", { className: "pg-toolbar-wrapper", children: toolbar })), _jsx("main", { className: `pg-conteudo-area ${customLayoutClass}`, children: children })] }));
}
