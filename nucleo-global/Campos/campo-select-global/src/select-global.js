import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * @nucleo/select — SelectGlobal
 * Select customizado — nunca usa <select> nativo.
 * Suporta single e multi select, busca interna, grupos e opções desabilitadas.
 * CSS Variables do design system Solid Slate.
 *
 * Dropdown renderizado via ReactDOM.createPortal (position: fixed) para
 * escapar de qualquer stacking context criado pelos containers pai.
 *
 * Usa <GeralCampoGlobal> como wrapper unificado (label, hint, erro).
 */
import { useState, useRef, useEffect, useId, useMemo, useCallback, } from 'react';
import ReactDOM from 'react-dom';
import { GeralCampoGlobal } from '@nucleo/campo-geral-global';
import './select.css';
function calcPos(trigger) {
    const rect = trigger.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const above = spaceBelow < 260 && spaceAbove > spaceBelow;
    return {
        top: above ? rect.top : rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        above,
        maxHeight: above ? Math.min(260, spaceAbove - 16) : Math.min(260, spaceBelow - 16)
    };
}
// ─── Chip (para multi-select) ─────────────────────────────────────────────────
function Chip({ opcao, aoRemover, desabilitado, }) {
    return (_jsxs("span", { className: "sg-chip", children: [opcao.rotulo, !desabilitado && (_jsx("button", { className: "sg-chip-remover", type: "button", onClick: (e) => {
                    e.stopPropagation();
                    aoRemover();
                }, "aria-label": `Remover ${opcao.rotulo}`, children: "\u2715" }))] }));
}
// ─── Item de opção ────────────────────────────────────────────────────────────
function ItemOpcao({ opcao, selecionada, multiplo, aoSelecionar, renderizarOpcao, }) {
    return (_jsxs("li", { className: `sg-opcao ${selecionada ? 'sg-opcao--selecionada' : ''} ${opcao.desabilitada ? 'sg-opcao--desabilitada' : ''}`, role: "option", "aria-selected": selecionada, "aria-disabled": opcao.desabilitada, onClick: () => !opcao.desabilitada && aoSelecionar(opcao), children: [multiplo && (_jsx("span", { className: "sg-check-box", "aria-hidden": "true", children: selecionada ? '✓' : '' })), renderizarOpcao ? (renderizarOpcao(opcao)) : (_jsxs("span", { className: "sg-opcao-conteudo", children: [_jsx("span", { className: "sg-opcao-rotulo", children: opcao.rotulo }), opcao.descricao && (_jsx("span", { className: "sg-opcao-descricao", children: opcao.descricao }))] })), !multiplo && selecionada && (_jsx("span", { className: "sg-check-mark", "aria-hidden": "true", children: "\u2713" }))] }));
}
// ─── SelectGlobal ─────────────────────────────────────────────────────────────
export function SelectGlobal({ opcoes = [], grupos = [], valor, valores = [], aoMudarValor, aoMudarValores, multiplo = false, buscavel = true, placeholder = 'Selecionar...', desabilitado = false, carregando = false, obrigatorio = false, erro, label, hint, iconeEsquerda, renderizarOpcao, renderizarValorSelecionado, id: idExterno, name, 'aria-label': ariaLabel, 'aria-describedby': ariaDescribedby, }) {
    const idGerado = useId();
    const id = idExterno ?? idGerado;
    const idLista = `${id}-lista`;
    const [aberto, setAberto] = useState(false);
    const [busca, setBusca] = useState('');
    const [pos, setPos] = useState(null);
    const containerRef = useRef(null);
    const campoRef = useRef(null);
    const buscaRef = useRef(null);
    // ─── Calcular posição do dropdown ─────────────────────────────────────────
    useEffect(() => {
        if (!aberto || !campoRef.current)
            return;
        setPos(calcPos(campoRef.current));
        // Recalcular se a janela rolar ou redimensionar enquanto aberto
        const update = () => {
            if (campoRef.current)
                setPos(calcPos(campoRef.current));
        };
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => {
            window.removeEventListener('scroll', update, true);
            window.removeEventListener('resize', update);
        };
    }, [aberto]);
    // ─── Fechar ao clicar fora ────────────────────────────────────────────────
    useEffect(() => {
        if (!aberto)
            return;
        const handler = (e) => {
            if (!containerRef.current?.contains(e.target)) {
                // também verifica se o clique não foi dentro do portal do dropdown
                const ddEl = document.getElementById(`${idLista}-portal`);
                if (ddEl && ddEl.contains(e.target))
                    return;
                setAberto(false);
                setBusca('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [aberto, idLista]);
    // ─── ESC fecha o dropdown ─────────────────────────────────────────────────
    useEffect(() => {
        if (!aberto)
            return;
        const handler = (e) => {
            if (e.key === 'Escape') {
                setAberto(false);
                setBusca('');
            }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [aberto]);
    // ─── Foco na busca ao abrir ───────────────────────────────────────────────
    useEffect(() => {
        if (aberto && buscavel) {
            setTimeout(() => buscaRef.current?.focus(), 50);
        }
    }, [aberto, buscavel]);
    // ─── Opções planas (flatten grupos) ──────────────────────────────────────
    const todasOpcoes = useMemo(() => {
        if (grupos.length > 0) {
            return grupos.flatMap((g) => g.opcoes);
        }
        return opcoes;
    }, [opcoes, grupos]);
    // ─── Filtro por busca ─────────────────────────────────────────────────────
    const opcoesFiltradas = useMemo(() => {
        // Remove opções com valor vazio (ex: { valor: '', rotulo: 'Selecione...' })
        // O placeholder prop já cobre esse caso visual
        const semVazias = todasOpcoes.filter((op) => op.valor !== '' && op.valor != null);
        if (!busca.trim())
            return semVazias;
        const termo = busca.trim().toLowerCase();
        return semVazias.filter((op) => op.rotulo.toLowerCase().includes(termo) ||
            op.descricao?.toLowerCase().includes(termo));
    }, [todasOpcoes, busca]);
    // ─── Opções filtradas por grupo ───────────────────────────────────────────
    const gruposFiltrados = useMemo(() => {
        if (grupos.length === 0)
            return [];
        return grupos
            .map((g) => ({
            ...g,
            opcoes: g.opcoes.filter((op) => {
                if (!busca.trim())
                    return true;
                const termo = busca.trim().toLowerCase();
                return op.rotulo.toLowerCase().includes(termo);
            }),
        }))
            .filter((g) => g.opcoes.length > 0);
    }, [grupos, busca]);
    // ─── Estado de seleção ────────────────────────────────────────────────────
    const valoresSelecionados = useMemo(() => {
        if (multiplo)
            return valores;
        return valor != null ? [valor] : [];
    }, [multiplo, valores, valor]);
    const opcoesSelecionadas = useMemo(() => todasOpcoes.filter((op) => valoresSelecionados.includes(op.valor)), [todasOpcoes, valoresSelecionados]);
    const isSelecionada = useCallback((op) => valoresSelecionados.includes(op.valor), [valoresSelecionados]);
    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleSelecionar = (opcao) => {
        if (multiplo) {
            const novo = isSelecionada(opcao)
                ? valoresSelecionados.filter((v) => v !== opcao.valor)
                : [...valoresSelecionados, opcao.valor];
            aoMudarValores?.(novo);
        }
        else {
            const novoValor = isSelecionada(opcao) ? null : opcao.valor;
            aoMudarValor?.(novoValor);
            setAberto(false);
            setBusca('');
        }
    };
    const handleRemoverChip = (opcao) => {
        if (multiplo) {
            aoMudarValores?.(valoresSelecionados.filter((v) => v !== opcao.valor));
        }
    };
    const handleLimpar = (e) => {
        e.stopPropagation();
        if (multiplo)
            aoMudarValores?.([]);
        else
            aoMudarValor?.(null);
    };
    const handleToggle = () => {
        if (desabilitado || carregando)
            return;
        setAberto((p) => !p);
        if (aberto)
            setBusca('');
    };
    // ─── Renderização do gatilho ──────────────────────────────────────────────
    function renderizarGatilho() {
        if (carregando) {
            return _jsx("span", { className: "sg-placeholder sg-loading", children: "Carregando..." });
        }
        if (opcoesSelecionadas.length === 0) {
            return _jsx("span", { className: "sg-placeholder", children: placeholder });
        }
        if (renderizarValorSelecionado) {
            return renderizarValorSelecionado(multiplo ? opcoesSelecionadas : opcoesSelecionadas[0]);
        }
        if (multiplo) {
            return (_jsx("div", { className: "sg-chips", children: opcoesSelecionadas.map((op) => (_jsx(Chip, { opcao: op, aoRemover: () => handleRemoverChip(op), desabilitado: desabilitado }, op.valor))) }));
        }
        return _jsx("span", { className: "sg-valor-selecionado", children: opcoesSelecionadas[0].rotulo });
    }
    // ─── Lista de opções ──────────────────────────────────────────────────────
    function renderizarLista() {
        const temGrupos = grupos.length > 0 && gruposFiltrados.length > 0;
        const listaParaRenderizar = temGrupos ? [] : opcoesFiltradas;
        if (temGrupos) {
            return gruposFiltrados.map((grupo) => (_jsxs("li", { className: "sg-grupo", role: "group", "aria-label": grupo.rotulo, children: [_jsx("span", { className: "sg-grupo-rotulo", children: grupo.rotulo }), _jsx("ul", { className: "sg-grupo-lista", role: "presentation", children: grupo.opcoes.map((op) => (_jsx(ItemOpcao, { opcao: op, selecionada: isSelecionada(op), multiplo: multiplo, aoSelecionar: handleSelecionar, renderizarOpcao: renderizarOpcao }, op.valor))) })] }, grupo.rotulo)));
        }
        if (listaParaRenderizar.length === 0) {
            return (_jsx("li", { className: "sg-vazio", children: "Nenhuma op\u00E7\u00E3o encontrada" }));
        }
        return listaParaRenderizar.map((op) => (_jsx(ItemOpcao, { opcao: op, selecionada: isSelecionada(op), multiplo: multiplo, aoSelecionar: handleSelecionar, renderizarOpcao: renderizarOpcao }, op.valor)));
    }
    // ─── Aria describedby composto ────────────────────────────────────────────
    const describedby = [
        ariaDescribedby,
    ]
        .filter(Boolean)
        .join(' ');
    // ─── Dropdown via Portal (position: fixed) ────────────────────────────────
    const dropdown = aberto && pos && ReactDOM.createPortal(_jsxs("div", { id: `${idLista}-portal`, className: `sg-dropdown sg-dropdown--portal ${pos.above ? 'sg-dropdown--acima' : ''}`, style: {
            position: 'fixed',
            top: pos.above ? undefined : pos.top,
            bottom: pos.above ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            width: pos.width,
            maxHeight: pos.maxHeight ? `${pos.maxHeight}px` : undefined,
            zIndex: 99999,
        }, onMouseDown: (e) => e.stopPropagation(), children: [buscavel && (_jsxs("div", { className: "sg-busca-wrapper", children: [_jsx("span", { className: "sg-busca-icon", "aria-hidden": "true", children: _jsxs("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "11", cy: "11", r: "7" }), _jsx("line", { x1: "16.5", y1: "16.5", x2: "22", y2: "22" })] }) }), _jsx("input", { ref: buscaRef, className: "sg-busca-input", type: "text", placeholder: "Buscar...", value: busca, onChange: (e) => setBusca(e.target.value), onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), "aria-label": "Buscar op\u00E7\u00F5es", autoComplete: "off" })] })), _jsx("ul", { id: idLista, className: "sg-lista", role: "listbox", "aria-multiselectable": multiplo, "aria-label": ariaLabel ?? label ?? 'Opções', children: renderizarLista() })] }), document.body);
    // ─── Conteúdo interno (campo gatilho + dropdown + hidden inputs) ──────────
    const conteudoInterno = (_jsxs("div", { ref: containerRef, className: "sg-wrapper-inner", children: [_jsxs("div", { id: id, ref: campoRef, className: `sg-campo ${aberto ? 'sg-campo--aberto' : ''} ${desabilitado ? 'sg-campo--desabilitado' : ''} ${carregando ? 'sg-campo--carregando' : ''} ${iconeEsquerda ? 'sg-campo--com-icone' : ''}`, role: "combobox", "aria-haspopup": "listbox", "aria-expanded": aberto, "aria-controls": idLista, "aria-label": ariaLabel ?? label, "aria-describedby": describedby || undefined, "aria-required": obrigatorio, "aria-disabled": desabilitado, tabIndex: desabilitado ? -1 : 0, onClick: handleToggle, onKeyDown: (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleToggle();
                    }
                }, children: [iconeEsquerda && (_jsx("span", { className: "sg-icone-esquerda", "aria-hidden": "true", children: iconeEsquerda })), _jsx("div", { className: "sg-valor", children: renderizarGatilho() }), _jsxs("div", { className: "sg-acoes", children: [opcoesSelecionadas.length > 0 && !desabilitado && !carregando && (_jsx("button", { type: "button", className: "sg-btn-limpar", onClick: handleLimpar, "aria-label": "Limpar sele\u00E7\u00E3o", tabIndex: -1, children: "\u2715" })), _jsx("span", { className: `sg-chevron ${aberto ? 'sg-chevron--aberto' : ''}`, "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }) })] })] }), dropdown, name && (_jsx(_Fragment, { children: multiplo
                    ? valoresSelecionados.map((v) => (_jsx("input", { type: "hidden", name: name, value: String(v) }, v)))
                    : valor != null && (_jsx("input", { type: "hidden", name: name, value: String(valor) })) }))] }));
    // ─── Se tem label/hint/erro, renderiza com GeralCampoGlobal ───────────────
    // Se não tem, renderiza só o campo (ex: select inline dentro de calendário)
    if (label || hint || erro) {
        return (_jsx(GeralCampoGlobal, { label: label, obrigatorio: obrigatorio, erro: erro, hint: hint, children: conteudoInterno }));
    }
    return conteudoInterno;
}
