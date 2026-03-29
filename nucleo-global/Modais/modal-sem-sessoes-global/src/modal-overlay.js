import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @nucleo/modal-sem-sessoes-global — modal-overlay
 * ModalSemSessoesGlobal: modal com header, overlay e fechamento por ESC, sem suporte a abas/sessões.
 * Estilos via CSS Variables do design system Solid Slate.
 */
import { useEffect, useRef, useId } from 'react';
import { X } from '@phosphor-icons/react';
import './modal.css';
// ─── Tamanhos ─────────────────────────────────────────────────────────────────
const LARGURA_MODAL = {
    sm: '400px',
    md: '560px',
    lg: '720px',
    xl: '960px',
    full: '100%',
};
// ─── Botão de carregamento ────────────────────────────────────────────────────
function BotaoFooter({ rotulo, variante = 'secondary', desabilitado, carregando, ao_clicar, }) {
    const classeMap = {
        primary: 'btn btn-primary',
        secondary: 'btn btn-secondary',
        ghost: 'btn btn-ghost',
        danger: 'btn mg-btn-danger',
    };
    return (_jsxs("button", { className: `${classeMap[variante]} ${carregando ? 'mg-btn-loading' : ''}`, disabled: desabilitado || carregando, onClick: ao_clicar, "aria-busy": carregando, children: [carregando ? _jsx("span", { className: "mg-spinner", "aria-hidden": "true" }) : null, rotulo] }));
}
// ─── Modal Principal ──────────────────────────────────────────────────────────
export function ModalSemSessoesGlobal({ aberto, aoFechar, titulo, subtitulo, iconeTitulo, cabecalhoPersonalizado, children, botoes, renderizarFooter, tamanho = 'md', altura, fecharAoClicarOverlay = true, fecharPorESC = true, semFechar = false, }) {
    const id = useId();
    const dialogRef = useRef(null);
    // ESC handler
    useEffect(() => {
        if (!aberto || !fecharPorESC || semFechar)
            return;
        const handler = (e) => {
            if (e.key === 'Escape')
                aoFechar();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [aberto, fecharPorESC, semFechar, aoFechar]);
    // Trava o scroll do body enquanto modal está aberto
    useEffect(() => {
        if (aberto) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [aberto]);
    // Focus trap — move foco para o modal ao abrir
    useEffect(() => {
        if (aberto && dialogRef.current) {
            const primeiroFocavel = dialogRef.current.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            primeiroFocavel?.focus();
        }
    }, [aberto]);
    if (!aberto)
        return null;
    return (_jsx("div", { className: "mg-overlay", role: "presentation", onClick: fecharAoClicarOverlay && !semFechar ? (e) => { if (e.target === e.currentTarget)
            aoFechar(); } : undefined, "aria-hidden": "false", children: _jsxs("div", { ref: dialogRef, className: "mg-dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": `${id}-titulo`, style: { maxWidth: LARGURA_MODAL[tamanho], ...(altura ? { height: altura } : {}) }, children: [cabecalhoPersonalizado ? (_jsxs("div", { style: { position: 'relative' }, children: [cabecalhoPersonalizado, !semFechar && (_jsx("button", { className: "mg-btn-fechar", onClick: aoFechar, "aria-label": "Fechar modal", style: { position: 'absolute', top: '1.25rem', right: '1.25rem', zIndex: 10 }, children: _jsx(X, { size: 20, weight: "bold" }) }))] })) : (_jsxs("div", { className: "mg-header modal-header", children: [_jsxs("div", { className: "mg-header-texto", children: [_jsx("h2", { id: `${id}-titulo`, className: "mg-titulo text-h3", children: titulo }), subtitulo && (_jsx("p", { className: "mg-subtitulo text-sm", children: subtitulo }))] }), !semFechar && (_jsx("button", { className: "mg-btn-fechar", onClick: aoFechar, "aria-label": "Fechar modal", children: _jsx(X, { size: 20, weight: "bold" }) }))] })), _jsx("div", { className: "mg-body modal-body", children: children }), (botoes || renderizarFooter) && (_jsx("div", { className: "mg-footer modal-footer", children: renderizarFooter ? (renderizarFooter()) : (botoes?.map((botao, i) => (_jsx(BotaoFooter, { ...botao }, `${botao.rotulo}-${i}`)))) }))] }) }));
}
// ─── Modal Provider (renderiza todos do stack) ────────────────────────────────
import { useModalStack } from './use-modal.js';
import { fecharModal } from './modal-manager.js';
/**
 * ModalSemSessoesProvider: renderiza todos os modais do stack global sem sessões.
 * Deve ser montado uma única vez na raiz da aplicação.
 */
export function ModalSemSessoesProvider() {
    const { stack } = useModalStack();
    return (_jsx(_Fragment, { children: stack.map((item) => (_jsx(ModalSemSessoesGlobal, { ...item.props, aberto: true, aoFechar: () => fecharModal(item.id) }, item.id))) }));
}
