import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useEffect } from 'react';
import { X, ArrowsCounterClockwise, CheckSquare } from '@phosphor-icons/react';
import { SwitchGlobal } from '@nucleo/switch-global';
import './visibilidade.css';
export function VisibilidadeColunasGlobal({ colunas, visibleKeys, onToggle, onReset, onShowAll, onHideAll, onFechar, triggerRef }) {
    const ref = useRef(null);
    useEffect(() => {
        function fora(e) {
            if (ref.current && !ref.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target))
                onFechar();
        }
        document.addEventListener('mousedown', fora);
        return () => document.removeEventListener('mousedown', fora);
    }, [onFechar, triggerRef]);
    return (_jsxs("div", { ref: ref, className: "vcg-popover", style: { top: 'calc(100% + 6px)', right: 0 }, onClick: e => e.stopPropagation(), children: [_jsxs("div", { className: "vcg-header", children: [_jsx("span", { className: "vcg-title", children: "Pain\u00E9is Vis\u00EDveis" }), _jsx("button", { onClick: onFechar, className: "vcg-close-btn", children: _jsx(X, { size: 14, weight: "bold" }) })] }), _jsxs("div", { className: "vcg-bulk-actions", children: [_jsxs("button", { className: "vcg-bulk-btn", onClick: onShowAll, children: [_jsx(CheckSquare, { size: 14, weight: "fill" }), " Selecionar Tudo"] }), _jsxs("button", { className: "vcg-bulk-btn vcg-bulk-btn--reset", onClick: onReset, children: [_jsx(ArrowsCounterClockwise, { size: 14, weight: "bold" }), " Restaurar Padr\u00E3o"] })] }), _jsx("div", { className: "vcg-list", children: colunas.map(col => {
                    const isVisible = visibleKeys.has(col.key);
                    return (_jsx("div", { className: "vcg-item", children: _jsx(SwitchGlobal, { label: col.label, checked: isVisible, onChange: () => !col.naoOcultavel && onToggle(col.key), disabled: col.naoOcultavel }) }, col.key));
                }) })] }));
}
