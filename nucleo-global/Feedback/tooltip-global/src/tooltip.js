import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @nucleo/tooltip-global — tooltip.tsx
 * Tooltip unificada: renderiza card minimalista com título descritivo via portal.
 * Use position:fixed calculada no onMouseEnter = zero flash.
 *
 * ⚠️  ANTES DE ESCREVER QUALQUER titulo OU descricao:
 *     Leia obrigatoriamente a skill de escrita de tooltips:
 *     skills/ux/tooltip/SKILL.md
 *
 *     Regras principais:
 *     - Sem ponto final na descricao
 *     - Linguagem do usuário — nunca mencione implementação técnica
 *     - Máximo ~90 caracteres na descricao
 *     - descricao responde: "o que esse campo faz pela minha empresa?"
 */
import { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import './tooltip.css';
export function TooltipGlobal({ titulo, descricao, children }) {
    const [show, setShow] = useState(false);
    const [pos, setPos] = useState({ top: 0, bottom: 0, left: 0, usaBottom: false });
    const ref = useRef(null);
    const mostra = () => {
        // Se estiver desabilitado globalmente via body class, não abre.
        if (document.body.classList.contains('tooltips-disabled'))
            return;
        if (ref.current) {
            const r = ref.current.getBoundingClientRect();
            // Tentamos posicionar o card ACIMA do elemento.
            // E usamos `bottom` (do viewport) como âncora para o card crescer para cima,
            // a menos que não caiba, aí usamos `top` (abaixo do elemento).
            const espacoAcima = r.top;
            const usaBottom = espacoAcima > 80; // Se tiver mais que 80px acima, aparece em cima.
            const pxLeft = Math.max(138, Math.min(r.left + r.width / 2, window.innerWidth - 138));
            setPos({
                usaBottom,
                bottom: usaBottom ? window.innerHeight - r.top + 8 : 0,
                top: usaBottom ? 0 : r.bottom + 8,
                left: pxLeft,
            });
        }
        setShow(true);
    };
    return (_jsxs(_Fragment, { children: [_jsx("span", { ref: ref, onMouseEnter: mostra, onMouseLeave: () => setShow(false), className: "tg-trigger", "data-tg-mute": !descricao, children: children }), show && ReactDOM.createPortal(_jsxs("div", { className: "tg-card", "data-start": pos.usaBottom ? 'bottom' : 'top', style: {
                    bottom: pos.usaBottom ? pos.bottom : 'auto',
                    top: pos.usaBottom ? 'auto' : pos.top,
                    left: pos.left,
                }, children: [titulo && _jsx("p", { className: "tg-titulo", children: titulo }), _jsx("div", { className: "tg-descricao", children: descricao })] }), document.body)] }));
}
