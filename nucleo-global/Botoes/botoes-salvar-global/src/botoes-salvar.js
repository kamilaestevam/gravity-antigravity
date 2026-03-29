import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * BotoesSalvarGlobal — Barra de ações Salvar / Cancelar
 * @nucleo/botoes-salvar-global
 *
 * Sempre visível na tela em modo persistente (opaco quando sem alterações).
 * Ativa animações e dicas visuais quando dirty=true.
 *
 * @example
 * const { dirty, resetDirty } = useDirty(dadosIniciais, dados)
 *
 * <BotoesSalvarGlobal
 *   dirty={dirty}
 *   salvando={salvando}
 *   onSalvar={async () => { await salvar(dados); resetDirty(dados) }}
 *   onCancelar={() => { setDados(dadosIniciais); resetDirty() }}
 * />
 */
import React from 'react';
import { FloppyDisk, X } from '@phosphor-icons/react';
import { BotaoGlobal } from '@nucleo/botao-global';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import './botoes-salvar.css';
// ── BotaoSalvar ────────────────────────────────────────────────────────────
export const BotaoSalvar = React.forwardRef(function BotaoSalvar({ dirty = false, carregando = false, rotulo = 'Salvar', onClick, type = 'button', tooltipDescricao }, ref) {
    return (_jsx("div", { className: dirty && !carregando ? 'bs-btn-pulse' : '', style: { display: 'inline-flex' }, children: _jsx(TooltipGlobal, { descricao: tooltipDescricao || 'Salvar alterações pendentes', children: _jsx(BotaoGlobal, { ref: ref, variante: "primario", type: type, disabled: !dirty || carregando, onClick: onClick, icone: _jsx(FloppyDisk, { size: 14, weight: "bold" }), children: carregando ? 'Salvando…' : rotulo }) }) }));
});
// ── BotaoCancelar ──────────────────────────────────────────────────────────
export const BotaoCancelar = React.forwardRef(function BotaoCancelar({ dirty = false, rotulo = 'Cancelar', onClick, type = 'button', tooltipDescricao }, ref) {
    return (_jsx(TooltipGlobal, { descricao: tooltipDescricao || 'Descartar alterações e reverter para o estado original', children: _jsx(BotaoGlobal, { ref: ref, variante: "fantasma", type: type, disabled: !dirty, onClick: onClick, icone: _jsx(X, { size: 14, weight: "bold" }), children: rotulo }) }));
});
// ── BotoesSalvarGlobal (composto) ─────────────────────────────────────────────
export function BotoesSalvarGlobal({ dirty = false, salvando = false, onSalvar, onCancelar, alinhamento = 'direita', }) {
    const isVisible = dirty || salvando;
    return (_jsxs("div", { className: [
            'bs-barra',
            `bs-barra--${alinhamento}`,
            isVisible ? 'bs-barra--dirty' : '',
        ]
            .filter(Boolean)
            .join(' '), children: [alinhamento !== 'esquerda' && (_jsxs("span", { className: "bs-hint", children: [_jsx("span", { className: "bs-hint__dot" }), "Altera\u00E7\u00F5es n\u00E3o salvas"] })), _jsx(BotaoCancelar, { dirty: dirty, onClick: onCancelar }), _jsx(BotaoSalvar, { dirty: dirty, carregando: salvando, onClick: onSalvar })] }));
}
