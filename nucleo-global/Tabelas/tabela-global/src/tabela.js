import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from 'react';
import ReactDOM from 'react-dom';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import { Funnel, ArrowUp, ArrowDown, MagnifyingGlass, X, DownloadSimple, CheckSquare, Square, CaretDown, Columns } from '@phosphor-icons/react';
import { CalendarioCampoGlobal } from '@nucleo/campo-calendario-global';
import { useTablePersistence } from './hooks/useTablePersistence.js';
import { VisibilidadeColunasGlobal } from './componentes/VisibilidadeColunasGlobal.js';
import './tabela.css';
function PopoverFiltro({ tipo, coluna, label, filtros, ordenacao, valoresDisponiveis, valoresSelecionados, minMax, periodo, triggerRef, onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimpar, onFechar, }) {
    const ref = useRef(null);
    const [buscaLocal, setBuscaLocal] = useState('');
    const [pos, setPos] = useState(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            return {
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
            };
        }
        return { top: 0, left: 0 };
    });
    useEffect(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
            });
        }
    }, [triggerRef]);
    useEffect(() => {
        function fora(e) {
            if (ref.current && !ref.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target))
                onFechar();
        }
        document.addEventListener('mousedown', fora);
        return () => document.removeEventListener('mousedown', fora);
    }, [onFechar, triggerRef]);
    const sortAtivo = ordenacao?.coluna === coluna;
    const valoresFiltrados = useMemo(() => buscaLocal.trim()
        ? valoresDisponiveis.filter(v => v.toLowerCase().includes(buscaLocal.toLowerCase()))
        : valoresDisponiveis, [valoresDisponiveis, buscaLocal]);
    const inputStyle = {
        width: '100%', padding: '0.375rem 0.5rem 0.375rem 1.75rem',
        background: 'rgba(129,140,248,0.05)', border: '1px solid var(--ws-accent-border)',
        borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem',
        fontFamily: 'inherit', outline: 'none',
    };
    const pillStyle = (ativo) => ({
        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: '0.3rem', padding: '0.375rem 0.5rem', borderRadius: '9999px',
        background: ativo ? 'rgba(129,140,248,0.15)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${ativo ? 'rgba(129,140,248,0.35)' : 'rgba(255,255,255,0.1)'}`,
        color: ativo ? '#818cf8' : '#94a3b8',
        fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
        fontFamily: 'inherit', transition: 'all 0.12s', whiteSpace: 'nowrap'
    });
    const style = {
        position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
        background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-accent-border)',
        borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        minWidth: '220px', maxWidth: '280px', fontFamily: 'var(--font, Plus Jakarta Sans)',
    };
    return ReactDOM.createPortal(_jsxs("div", { ref: ref, style: style, onClick: e => e.stopPropagation(), children: [_jsx("div", { style: { padding: '0.4rem 0.875rem', borderBottom: '1px solid var(--ws-accent-border)' }, children: _jsx("span", { style: { fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }, children: label }) }), _jsxs("div", { style: { padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--ws-accent-border)' }, children: [_jsx("p", { style: { fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '0.375rem' }, children: "Ordenar" }), _jsx("div", { style: { display: 'flex', gap: '0.375rem' }, children: [['asc', 'Cresc.', _jsx(ArrowUp, { size: 12, weight: "bold" }, "u")], ['desc', 'Decresc.', _jsx(ArrowDown, { size: 12, weight: "bold" }, "d")]].map(([dir, rot, ico]) => {
                            const ativo = sortAtivo && ordenacao?.direcao === dir;
                            return (_jsxs("button", { type: "button", onClick: () => { onOrdenar(coluna, dir); onFechar(); }, style: pillStyle(ativo), onMouseEnter: e => { if (!ativo) {
                                    e.currentTarget.style.background = 'rgba(129,140,248,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(129,140,248,0.2)';
                                    e.currentTarget.style.color = '#f1f5f9';
                                } }, onMouseLeave: e => { if (!ativo) {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                    e.currentTarget.style.color = '#94a3b8';
                                } }, children: [ico, " ", rot] }, dir));
                        }) })] }), tipo === 'texto' && (_jsxs("div", { style: { borderBottom: '1px solid var(--ws-accent-border)' }, children: [_jsx("p", { style: { padding: '0.45rem 0.875rem 0.25rem', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }, children: "Filtrar por" }), valoresDisponiveis.length > 5 && (_jsx(TooltipGlobal, { descricao: "Pesquise na lista de valores dispon\u00EDveis", children: _jsxs("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: { position: 'absolute', left: '0.45rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b', display: 'flex', lineHeight: 0 }, children: _jsx(MagnifyingGlass, { size: 11, weight: "bold" }) }), _jsx("input", { type: "text", placeholder: "Buscar\u2026", value: buscaLocal, onChange: e => setBuscaLocal(e.target.value), style: { ...inputStyle, paddingLeft: '1.6rem', fontSize: '0.75rem' }, onFocus: e => { e.currentTarget.style.borderColor = '#818cf8'; }, onBlur: e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)'; } })] }) })), _jsx("div", { style: { maxHeight: '180px', overflowY: 'auto', padding: '0.3rem 0.5rem', scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }, children: valoresFiltrados.length === 0 ? (_jsx("p", { style: { fontSize: '0.75rem', color: '#475569', padding: '0.5rem', textAlign: 'center' }, children: "Nenhum valor" })) : valoresFiltrados.map(v => {
                            const selecionado = valoresSelecionados.has(v);
                            return (_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.375rem', cursor: 'pointer', borderRadius: '6px', transition: 'background 0.1s' }, onMouseEnter: e => { e.currentTarget.style.background = 'rgba(129,140,248,0.06)'; }, onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; }, children: [_jsx("span", { style: { color: selecionado ? '#818cf8' : '#475569', display: 'flex', lineHeight: 0, flexShrink: 0 }, children: selecionado ? _jsx(CheckSquare, { size: 15, weight: "fill" }) : _jsx(Square, { size: 15, weight: "regular" }) }), _jsx("input", { type: "checkbox", checked: selecionado, onChange: () => onToggleValor(coluna, v), style: { display: 'none' } }), _jsx("span", { style: { fontSize: '0.8125rem', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: v })] }, v));
                        }) })] })), tipo === 'numero' && (_jsxs("div", { style: { padding: '0.5rem 0.625rem', borderBottom: '1px solid var(--ws-accent-border)' }, children: [_jsx("p", { style: { fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }, children: "Intervalo" }), _jsx("div", { style: { display: 'flex', gap: '0.375rem', alignItems: 'center' }, children: ['min', 'max'].map((campo, i) => (_jsx("input", { type: "text", inputMode: "numeric", pattern: "[0-9]*", placeholder: i === 0 ? 'Mín' : 'Máx', autoComplete: "off", value: minMax[campo], onChange: e => {
                                const v = e.target.value.replace(/[^0-9]/g, '');
                                onFiltrarNumero(coluna, campo, v);
                            }, style: { flex: 1, width: 0, padding: '0.375rem 0.5rem', background: 'rgba(129,140,248,0.05)', border: '1px solid var(--ws-accent-border)', borderRadius: '6px', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', outline: 'none' }, onFocus: e => { e.currentTarget.style.borderColor = '#818cf8'; }, onBlur: e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.15)'; } }, campo))) })] })), tipo === 'periodo' && (_jsxs("div", { style: { padding: '0.625rem 0.5rem', borderBottom: '1px solid var(--ws-accent-border)' }, children: [_jsx("p", { style: { fontSize: '0.6rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }, children: "Selecione o Per\u00EDodo" }), _jsx(CalendarioCampoGlobal, { valor: periodo, aoMudarValor: (v) => { onFiltrarPeriodo(coluna, v); } })] })), _jsx("div", { style: { padding: '0.375rem 0.5rem 0.3rem' }, children: _jsxs("button", { type: "button", onClick: () => { onLimpar(); onFechar(); }, style: { display: 'flex', alignItems: 'center', gap: '0.375rem', width: '100%', padding: '0.35rem 0.5rem', borderRadius: '6px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.8125rem', fontFamily: 'inherit', transition: 'color 0.12s' }, onMouseEnter: e => { e.currentTarget.style.color = '#f87171'; }, onMouseLeave: e => { e.currentTarget.style.color = '#64748b'; }, children: [_jsx(X, { size: 12, weight: "bold" }), " Limpar filtro"] }) })] }), document.body);
}
function ThInner({ col, filtros, ordenacao, dados, onOrdenar, onToggleValor, onFiltrarNumero, onFiltrarPeriodo, onLimparColuna }) {
    const [aberto, setAberto] = useState(false);
    const handleFechar = useCallback(() => setAberto(false), []);
    const triggerRef = useRef(null);
    const coluna = col.key;
    const sortAtivo = ordenacao?.coluna === coluna;
    const valoresDisponiveis = useMemo(() => {
        const vals = dados.map(e => String(e[coluna] ?? ''));
        return [...new Set(vals)].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }, [dados, coluna]);
    const stateVal = filtros[coluna];
    const temFiltroAtivo = !stateVal ? false : col.tipo === 'texto' ? stateVal.size > 0
        : col.tipo === 'numero' ? !!(stateVal.min || stateVal.max)
            : !!(stateVal.inicio || stateVal.fim);
    const labelSpan = (_jsx("span", { style: { color: sortAtivo ? '#818cf8' : undefined, lineHeight: 1, display: 'inline-block' }, children: col.label }));
    return (_jsxs("th", { style: { width: col.largura, padding: '0.75rem 1rem', textAlign: col.align || 'left', whiteSpace: 'nowrap', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', borderBottom: '1px solid var(--ws-accent-border)', background: 'rgba(129,140,248,0.04)', position: 'relative', userSelect: 'none', verticalAlign: 'middle' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }, children: [col.tooltipDescricao
                        ? _jsx(TooltipGlobal, { titulo: col.tooltipTitulo, descricao: col.tooltipDescricao, children: labelSpan })
                        : labelSpan, _jsx("button", { ref: triggerRef, type: "button", onClick: e => { e.stopPropagation(); setAberto(v => !v); }, style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 16, height: 16, borderRadius: '4px', background: temFiltroAtivo || aberto ? 'rgba(129,140,248,0.15)' : 'transparent', border: `1px solid ${temFiltroAtivo || aberto ? 'rgba(129,140,248,0.3)' : 'transparent'}`, cursor: 'pointer', padding: 0, flexShrink: 0, color: temFiltroAtivo || aberto ? '#818cf8' : '#64748b', transition: 'all 0.12s', lineHeight: 0, verticalAlign: 'middle' }, children: _jsx(Funnel, { size: 10, weight: temFiltroAtivo ? 'fill' : 'bold' }) })] }), aberto && (_jsx(PopoverFiltro, { tipo: col.tipo, coluna: coluna, label: col.label, filtros: filtros, ordenacao: ordenacao, valoresDisponiveis: valoresDisponiveis, valoresSelecionados: col.tipo === 'texto' ? stateVal : new Set(), minMax: col.tipo === 'numero' ? stateVal : { min: '', max: '' }, periodo: col.tipo === 'periodo' ? stateVal : { inicio: null, fim: null }, triggerRef: triggerRef, onOrdenar: onOrdenar, onToggleValor: onToggleValor, onFiltrarNumero: onFiltrarNumero, onFiltrarPeriodo: onFiltrarPeriodo, onLimpar: () => onLimparColuna(coluna), onFechar: handleFechar }))] }));
}
const Th = memo(ThInner);
// ─── Componentes Internos de Camadas ───
function IconeChevron() {
    return (_jsx("svg", { width: "12", height: "12", viewBox: "0 0 12 12", fill: "none", children: _jsx("path", { d: "M4 2L8 6L4 10", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round", strokeLinejoin: "round" }) }));
}
function renderCelulaCamada(coluna, item) {
    const valor = item[coluna.key];
    if (coluna.render)
        return coluna.render(valor, item);
    return _jsx("span", { children: String(valor ?? '—') });
}
function FiltroChip({ label, onRemover }) {
    return (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.2rem 0.5rem 0.2rem 0.65rem', borderRadius: '9999px', background: 'rgba(199,210,254,0.1)', border: '1px solid rgba(199,210,254,0.25)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap' }, children: [label, _jsx("button", { type: "button", onClick: onRemover, style: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: 'rgba(199,210,254,0.2)', border: 'none', cursor: 'pointer', color: '#c7d2fe', padding: 0, flexShrink: 0 }, children: _jsx(X, { size: 9, weight: "bold" }) })] }));
}
function ExportMenuItem({ label, icon, onClick, tooltip }) {
    const content = (_jsxs("button", { type: "button", onClick: onClick, style: { display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.45rem 0.875rem', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s, color 0.1s' }, onMouseEnter: e => { e.currentTarget.style.background = 'rgba(129,140,248,0.07)'; e.currentTarget.style.color = '#f1f5f9'; }, onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }, children: [_jsx("span", { style: { color: '#818cf8', display: 'flex', flexShrink: 0 }, children: icon }), label] }));
    if (tooltip)
        return _jsx(TooltipGlobal, { descricao: tooltip, children: content });
    return content;
}
export function TabelaGlobal(props) {
    const { dados, colunas, acoes, acoesExportacao, idKey = 'id', mensagemVazio, mensagemSemFiltro, renderExpandido, tooltipExpandir, tooltipRecolher, tooltipBusca, filhos, colunasFilhas, acoesFilhas, expandidosPadrao = [], itensPorPagina = 10, id: tableId } = props;
    // ─── Visibilidade de Colunas (Persistência) ───
    const colunasConfig = useMemo(() => colunas.map(c => ({
        key: c.key,
        label: c.label,
        naoOcultavel: c.naoOcultavel
    })), [colunas]);
    const { visibleKeys, isVisible, toggleVisibility, resetToDefault, setAllVisible, clearAllVisible } = useTablePersistence({
        tableId: tableId || 'default',
        initialKeys: colunas.map(c => c.key),
        defaultHiddenKeys: colunas.filter(c => c.oculta).map(c => c.key)
    });
    const colunasVisiveis = useMemo(() => tableId ? colunas.filter(c => isVisible(c.key)) : colunas, [colunas, tableId, isVisible]);
    const [visibilidadeAberta, setVisibilidadeAberta] = useState(false);
    const visibilidadeBtnRef = useRef(null);
    const defaultMensagemVazio = mensagemVazio ?? 'Nenhum resultado.';
    const defaultMensagemSemFiltro = mensagemSemFiltro ?? 'Nenhum registro cadastrado.';
    const [busca, setBusca] = useState('');
    const [ordenacao, setOrdenacao] = useState(null);
    const initialFiltros = {};
    colunas.forEach(c => {
        if (c.tipo === 'texto')
            initialFiltros[c.key] = new Set();
        if (c.tipo === 'numero')
            initialFiltros[c.key] = { min: '', max: '' };
        if (c.tipo === 'periodo')
            initialFiltros[c.key] = { inicio: null, fim: null };
    });
    const [filtros, setFiltros] = useState(initialFiltros);
    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPagina] = useState(itensPorPagina);
    const [selecionados, setSelecionados] = useState(new Set());
    const [expandidos, setExpandidos] = useState(new Set(expandidosPadrao));
    const toggleExpandido = useCallback((id) => {
        setExpandidos(prev => {
            const s = new Set(prev);
            s.has(id) ? s.delete(id) : s.add(id);
            return s;
        });
    }, []);
    const onToggleValor = useCallback((col, v) => {
        setFiltros(prev => {
            const copia = { ...prev };
            const set = new Set(prev[col]);
            set.has(v) ? set.delete(v) : set.add(v);
            copia[col] = set;
            return copia;
        });
        setPagina(1);
    }, []);
    const onFiltrarNumero = useCallback((col, tipo, v) => {
        setFiltros(prev => {
            const copia = { ...prev };
            copia[col] = { ...prev[col], [tipo]: v };
            return copia;
        });
        setPagina(1);
    }, []);
    const onFiltrarPeriodo = useCallback((col, val) => {
        setFiltros(prev => ({ ...prev, [col]: val }));
        setPagina(1);
    }, []);
    const onOrdenar = useCallback((col, dir) => setOrdenacao({ coluna: col, direcao: dir }), []);
    const onLimparColuna = useCallback((col) => {
        setFiltros(prev => {
            const n = { ...prev };
            if (colunas.find(x => x.key === col)?.tipo === 'periodo')
                n[col] = { inicio: null, fim: null };
            else if (n[col] instanceof Set)
                n[col] = new Set();
            else
                n[col] = { min: '', max: '' };
            return n;
        });
        if (ordenacao?.coluna === col)
            setOrdenacao(null);
        setPagina(1);
    }, [ordenacao, colunas]);
    const limparTudo = useCallback(() => {
        setBusca('');
        setFiltros(initialFiltros);
        setOrdenacao(null);
        setPagina(1);
    }, [initialFiltros]);
    const resultado = useMemo(() => {
        let r = [...dados];
        if (busca.trim()) {
            const q = busca.toLowerCase();
            r = r.filter(e => colunasVisiveis.some(c => String(e[c.key]).toLowerCase().includes(q)));
        }
        colunasVisiveis.forEach(c => {
            const st = filtros[c.key];
            if (c.tipo === 'texto') {
                const s = st;
                if (s.size > 0)
                    r = r.filter(e => s.has(String(e[c.key])));
            }
            else if (c.tipo === 'numero') {
                const num = st;
                if (num.min !== '')
                    r = r.filter(e => Number(e[c.key]) >= Number(num.min));
                if (num.max !== '')
                    r = r.filter(e => Number(e[c.key]) <= Number(num.max));
            }
            else if (c.tipo === 'periodo') {
                const p = st;
                if (p.inicio || p.fim) {
                    r = r.filter(e => {
                        const val = e[c.key];
                        if (!val)
                            return false;
                        const d = new Date(val);
                        if (isNaN(d.getTime()))
                            return true; // ignora filtragem real se o campo n for data
                        if (p.inicio) {
                            const ini = new Date(p.inicio);
                            ini.setHours(0, 0, 0, 0);
                            if (d < ini)
                                return false;
                        }
                        if (p.fim) {
                            const fim = new Date(p.fim);
                            fim.setHours(23, 59, 59, 999);
                            if (d > fim)
                                return false;
                        }
                        return true;
                    });
                }
            }
        });
        if (ordenacao) {
            r.sort((a, b) => {
                const va = a[ordenacao.coluna], vb = b[ordenacao.coluna];
                if (typeof va === 'number' && typeof vb === 'number')
                    return ordenacao.direcao === 'asc' ? va - vb : vb - va;
                return String(va).toLowerCase().localeCompare(String(vb).toLowerCase(), 'pt-BR') * (ordenacao.direcao === 'asc' ? 1 : -1);
            });
        }
        return r;
    }, [dados, busca, filtros, ordenacao, colunasVisiveis]);
    const chips = useMemo(() => {
        const list = [];
        if (busca.trim())
            list.push({ key: 'busca', label: `"${busca}"`, onRemover: () => setBusca('') });
        colunasVisiveis.forEach(c => {
            const st = filtros[c.key];
            if (c.tipo === 'texto') {
                const s = st;
                s.forEach(v => list.push({ key: `${c.key}-${v}`, label: `${c.label}: ${v}`, onRemover: () => onToggleValor(c.key, v) }));
            }
            else if (c.tipo === 'numero') {
                const num = st;
                if (num.min !== '' || num.max !== '') {
                    list.push({ key: c.key, label: `${c.label}: ${num.min || '0'}–${num.max || '∞'}`, onRemover: () => onLimparColuna(c.key) });
                }
            }
            else if (c.tipo === 'periodo') {
                const p = st;
                if (p.inicio || p.fim) {
                    const iniStr = p.inicio ? p.inicio.toLocaleDateString('pt-BR') : '...';
                    const fimStr = p.fim ? p.fim.toLocaleDateString('pt-BR') : '...';
                    list.push({ key: c.key, label: `${c.label}: ${iniStr} - ${fimStr}`, onRemover: () => onLimparColuna(c.key) });
                }
            }
        });
        return list;
    }, [busca, colunasVisiveis, filtros, onToggleValor, onLimparColuna]);
    const totalPags = Math.max(1, Math.ceil(resultado.length / porPagina));
    const pagSafe = Math.min(pagina, totalPags);
    const paginado = useMemo(() => resultado.slice((pagSafe - 1) * porPagina, pagSafe * porPagina), [resultado, pagSafe, porPagina]);
    const todosSelec = paginado.length > 0 && paginado.every(e => selecionados.has(String(e[idKey])));
    const toggleSel = (id) => setSelecionados(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
    const toggleTodos = (checked) => setSelecionados(checked ? new Set(paginado.map(e => String(e[idKey]))) : new Set());
    const [exportMenuAberto, setExportMenuAberto] = useState(false);
    const exportBtnRef = useRef(null);
    const exportMenuRef = useRef(null);
    useEffect(() => {
        function fora(e) {
            if (exportMenuRef.current && !exportMenuRef.current.contains(e.target) &&
                exportBtnRef.current && !exportBtnRef.current.contains(e.target))
                setExportMenuAberto(false);
        }
        document.addEventListener('mousedown', fora);
        return () => document.removeEventListener('mousedown', fora);
    }, []);
    return (_jsxs("div", { className: `tg-container ${expandidos.size > 0 ? 'tg-container--focado' : ''}`, style: { background: 'var(--ws-surface, #1e293b)', border: '1px solid var(--ws-accent-border)', borderRadius: '12px', overflow: 'hidden', fontFamily: 'var(--font, Plus Jakarta Sans)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.875rem 1.25rem', borderBottom: chips.length > 0 ? 'none' : '1px solid var(--ws-accent-border)' }, children: [_jsx("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' }, children: _jsx(TooltipGlobal, { descricao: tooltipBusca || 'Pesquise por qualquer termo visível na tabela', children: _jsxs("div", { style: { position: 'relative', display: 'flex', alignItems: 'center' }, children: [_jsx("span", { style: { position: 'absolute', left: '0.75rem', color: '#818cf8', display: 'flex', lineHeight: 0, opacity: 0.7 }, children: _jsx(MagnifyingGlass, { size: 14, weight: "bold" }) }), _jsx("input", { type: "search", placeholder: "Localizar", value: busca, onChange: e => { setBusca(e.target.value); setPagina(1); }, style: { background: 'var(--ws-bg-body, #0f172a)', border: '1px solid var(--ws-accent-border)', borderRadius: '9999px', padding: '0.4375rem 1rem 0.4375rem 2.25rem', color: 'var(--ws-text, #f1f5f9)', fontSize: '0.875rem', fontFamily: 'var(--font, Plus Jakarta Sans)', fontWeight: 400, minWidth: '240px', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s' }, onFocus: e => { e.currentTarget.style.borderColor = '#818cf8'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(129,140,248,0.14)'; }, onBlur: e => { e.currentTarget.style.borderColor = 'rgba(129,140,248,0.18)'; e.currentTarget.style.boxShadow = 'none'; } })] }) }) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.375rem' }, children: [chips.length > 0 && (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.65rem', borderRadius: '9999px', background: 'rgba(199,210,254,0.1)', border: '1px solid rgba(199,210,254,0.25)', color: '#c7d2fe', fontSize: '0.75rem', fontWeight: 700 }, children: [_jsx(Funnel, { size: 11, weight: "fill" }), chips.length === 1 ? `${chips.length} filtro ativo` : `${chips.length} filtros ativos`] })), selecionados.size > 0 && (_jsx("span", { style: { fontSize: '0.8125rem', fontWeight: 600, color: '#c7d2fe', padding: '0.25rem 0.75rem', background: 'rgba(199,210,254,0.15)', borderRadius: '9999px' }, children: selecionados.size === 1 ? `${selecionados.size} selecionado` : `${selecionados.size} selecionados` })), tableId && (_jsxs("div", { style: { position: 'relative' }, children: [_jsx(TooltipGlobal, { descricao: "Gerenciar colunas vis\u00EDveis", children: _jsx("button", { ref: visibilidadeBtnRef, type: "button", onClick: () => setVisibilidadeAberta(v => !v), style: { display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', borderRadius: '9999px', background: visibilidadeAberta ? 'rgba(129,140,248,0.1)' : 'transparent', border: `1px solid ${visibilidadeAberta ? '#818cf8' : 'rgba(129,140,248,0.12)'}`, color: visibilidadeAberta ? '#818cf8' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }, onMouseEnter: e => { if (!visibilidadeAberta) {
                                                e.currentTarget.style.borderColor = '#818cf8';
                                                e.currentTarget.style.color = '#818cf8';
                                            } }, onMouseLeave: e => { if (!visibilidadeAberta) {
                                                e.currentTarget.style.borderColor = 'rgba(129,140,248,0.12)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            } }, children: _jsx(Columns, { size: 13, weight: "bold" }) }) }), visibilidadeAberta && (_jsx(VisibilidadeColunasGlobal, { colunas: colunasConfig, visibleKeys: visibleKeys, onToggle: toggleVisibility, onReset: resetToDefault, onShowAll: setAllVisible, onHideAll: clearAllVisible, onFechar: () => setVisibilidadeAberta(false), triggerRef: visibilidadeBtnRef }))] })), (acoesExportacao && acoesExportacao.length > 0) && (_jsxs("div", { style: { position: 'relative' }, children: [_jsx(TooltipGlobal, { descricao: "Baixe os resultados atuais da tabela", children: _jsxs("button", { ref: exportBtnRef, type: "button", onClick: () => setExportMenuAberto(v => !v), style: { display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.4375rem 0.875rem', borderRadius: '9999px', background: exportMenuAberto ? 'rgba(129,140,248,0.1)' : 'transparent', border: `1px solid ${exportMenuAberto ? '#818cf8' : 'rgba(129,140,248,0.12)'}`, color: exportMenuAberto ? '#818cf8' : '#94a3b8', fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }, onMouseEnter: e => { if (!exportMenuAberto) {
                                                e.currentTarget.style.borderColor = '#818cf8';
                                                e.currentTarget.style.color = '#818cf8';
                                            } }, onMouseLeave: e => { if (!exportMenuAberto) {
                                                e.currentTarget.style.borderColor = 'rgba(129,140,248,0.12)';
                                                e.currentTarget.style.color = '#94a3b8';
                                            } }, children: [_jsx(DownloadSimple, { size: 13, weight: "bold" }), " Exportar ", _jsx(CaretDown, { size: 11, weight: "bold", style: { marginLeft: 1, transition: 'transform 0.15s', transform: exportMenuAberto ? 'rotate(180deg)' : 'rotate(0deg)' } })] }) }), exportMenuAberto && (_jsx("div", { ref: exportMenuRef, style: { position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 9999, background: '#1e293b', border: '1px solid var(--ws-accent-border)', borderRadius: '10px', boxShadow: '0 12px 32px rgba(0,0,0,0.55)', minWidth: '200px', fontFamily: 'inherit', overflow: 'hidden' }, onClick: e => e.stopPropagation(), children: acoesExportacao.map(a => (_jsx(ExportMenuItem, { label: a.label, icon: a.icone, tooltip: a.tooltipDescricao, onClick: () => { a.onClick(resultado); setExportMenuAberto(false); } }, a.label))) }))] }))] })] }), chips.length > 0 && (_jsxs("div", { style: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.375rem', padding: '0.625rem 1.25rem', borderBottom: '1px solid var(--ws-accent-border)', background: 'rgba(129,140,248,0.02)' }, children: [chips.map(c => _jsx(FiltroChip, { label: c.label, onRemover: c.onRemover }, c.key)), _jsxs("button", { type: "button", onClick: limparTudo, style: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginLeft: 'auto', padding: '0.2rem 0.65rem', borderRadius: '9999px', background: 'transparent', border: '1px solid rgba(239,68,68,0.25)', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }, onMouseEnter: e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }, onMouseLeave: e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.25)'; }, children: [_jsx(X, { size: 11, weight: "bold" }), " Limpar"] })] })), _jsx("div", { style: { overflowX: 'auto' }, children: _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', color: '#f1f5f9' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { padding: '0.75rem 1rem', width: 1, background: '#1e293b', borderBottom: '2px solid rgba(129,140,248,0.3)', color: 'white', fontSize: '0.7rem' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", checked: todosSelec, onChange: e => toggleTodos(e.target.checked), style: { accentColor: '#818cf8', width: 14, height: 14, cursor: 'pointer' } }), _jsx("span", { style: { opacity: 0.5 }, children: "#" })] }) }), colunasVisiveis.map(col => {
                                        const sortAtivo = ordenacao?.coluna === col.key;
                                        return (_jsx("th", { style: {
                                                width: col.largura,
                                                padding: '0.875rem 1rem',
                                                textAlign: col.align || 'left',
                                                whiteSpace: 'nowrap',
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.08em',
                                                color: '#ffffff',
                                                borderBottom: '2px solid rgba(129,140,248,0.2)',
                                                background: '#1e293b',
                                                cursor: 'pointer'
                                            }, onClick: () => onOrdenar(col.key, ordenacao?.direcao === 'asc' ? 'desc' : 'asc'), children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.375rem', justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }, children: [_jsx("span", { style: { color: sortAtivo ? '#818cf8' : undefined }, children: col.label }), sortAtivo && (ordenacao.direcao === 'asc' ? _jsx(ArrowUp, { size: 10, weight: "bold" }) : _jsx(ArrowDown, { size: 10, weight: "bold" })), _jsx(Funnel, { size: 10, color: "#475569", weight: "bold", style: { opacity: 0.5 } })] }) }, col.key));
                                    }), acoes && acoes.length > 0 && (_jsx("th", { style: { padding: '0.75rem 1rem', width: 1, background: 'rgba(129,140,248,0.04)', borderBottom: '1px solid var(--ws-accent-border)', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b', textAlign: 'center' }, children: _jsx(TooltipGlobal, { titulo: "A\u00E7\u00F5es", descricao: "Comandos r\u00E1pidos dispon\u00EDveis para este registro", children: _jsx("span", { children: "A\u00E7\u00F5es" }) }) })), renderExpandido && (_jsx("th", { style: { padding: '0.75rem 1rem', width: 1, background: 'rgba(129,140,248,0.04)', borderBottom: '1px solid var(--ws-accent-border)' } }))] }) }), _jsx("tbody", { children: paginado.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: colunas.length + (acoes?.length ? 1 : 0) + (renderExpandido ? 1 : 0) + 1, style: { textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }, children: chips.length > 0 || busca
                                        ? _jsxs("span", { children: [defaultMensagemVazio, " ", _jsx("button", { type: "button", onClick: limparTudo, style: { background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit', fontSize: 'inherit' }, children: "Limpar filtros" })] })
                                        : defaultMensagemSemFiltro }) })) : paginado.map((item, i) => {
                                const id = String(item[idKey]);
                                const isExpanded = expandidos.has(id);
                                const filhosItem = filhos ? filhos(item) : [];
                                const temFilhos = filhosItem.length > 0;
                                const ehUltimoDoPagina = i === paginado.length - 1;
                                return (_jsxs(React.Fragment, { children: [_jsxs("tr", { className: `tg-tr ${isExpanded ? (filhos ? 'tg-tr--pai-expandida' : 'tg-tr--expandida') : ''}`, onClick: (renderExpandido || temFilhos) ? () => toggleExpandido(id) : undefined, style: {
                                                cursor: (renderExpandido || temFilhos) ? 'pointer' : 'default',
                                                borderBottom: (isExpanded || !ehUltimoDoPagina) ? '1px solid var(--ws-accent-border)' : 'none',
                                                background: selecionados.has(id) ? 'var(--tg-bg-selected)' : 'transparent'
                                            }, children: [_jsx("td", { className: "tg-td tg-td--checkbox", onClick: ev => ev.stopPropagation(), children: filhos ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [_jsx("input", { type: "checkbox", className: "tg-checkbox", checked: selecionados.has(id), onChange: () => toggleSel(id) }), temFilhos && (_jsx(TooltipGlobal, { descricao: isExpanded
                                                                    ? (typeof tooltipRecolher === 'function' ? tooltipRecolher(item) : tooltipRecolher || 'Recolher visualização detalhada')
                                                                    : (typeof tooltipExpandir === 'function' ? tooltipExpandir(item) : tooltipExpandir || 'Expandir para visualizar mais detalhes e informações complementares'), children: _jsx("button", { type: "button", className: "tg-chevron-btn", onClick: e => { e.stopPropagation(); toggleExpandido(id); }, children: _jsx("span", { className: `tg-chevron-icon ${isExpanded ? 'tg-chevron-icon--aberto' : ''}`, children: _jsx(IconeChevron, {}) }) }) }))] })) : (_jsx("input", { type: "checkbox", className: "tg-checkbox", checked: selecionados.has(id), onChange: () => toggleSel(id) })) }), colunasVisiveis.map((col, cIdx) => (_jsx("td", { className: "tg-td", style: { textAlign: col.align || 'left' }, children: cIdx === 0 && temFilhos ? (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '4px' }, children: [col.render ? col.render(item[col.key], item) : String(item[col.key] ?? ''), _jsx("span", { className: "tg-badge-filhos", children: filhosItem.length })] })) : (col.render ? col.render(item[col.key], item) : String(item[col.key] ?? '')) }, col.key))), acoes && acoes.length > 0 && (_jsx("td", { className: "tg-td tg-td--acoes", children: _jsx("div", { className: "tg-acoes-grupo", children: acoes.map(acao => {
                                                            const tooltipDesc = typeof acao.tooltip === 'function' ? acao.tooltip(item) : acao.tooltip;
                                                            if (acao.renderCustom) {
                                                                const customNode = acao.renderCustom(item);
                                                                return tooltipDesc ? (_jsx(TooltipGlobal, { descricao: tooltipDesc, children: customNode }, acao.id)) : _jsx(React.Fragment, { children: customNode }, acao.id);
                                                            }
                                                            const isDis = acao.disabled ? acao.disabled(item) : false;
                                                            const customStyle = acao.onRenderStyle ? acao.onRenderStyle(item) : {};
                                                            return (_jsx(TooltipGlobal, { descricao: tooltipDesc, children: _jsx("button", { type: "button", className: "tg-acao-btn", onClick: () => !isDis && acao.onClick(item), disabled: isDis, style: { ...customStyle, opacity: isDis ? 0.3 : 1 }, children: acao.icone }) }, acao.id));
                                                        }) }) })), renderExpandido && !filhos && (_jsx("td", { className: "tg-td tg-td--expand", children: _jsx(TooltipGlobal, { descricao: isExpanded
                                                            ? (typeof tooltipRecolher === 'function' ? tooltipRecolher(item) : tooltipRecolher || 'Recolher visualização detalhada')
                                                            : (typeof tooltipExpandir === 'function' ? tooltipExpandir(item) : tooltipExpandir || 'Expandir para visualizar mais detalhes e informações complementares'), children: _jsx("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' }, children: _jsx(CaretDown, { size: 14, weight: "bold", style: { transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', color: '#64748b' } }) }) }) }))] }), isExpanded && temFilhos && colunasFilhas && filhosItem.map((filho, fi) => {
                                            const isUltimoFilho = fi === filhosItem.length - 1;
                                            return (_jsxs("tr", { className: `tg-tr-filho tg-tr-filho--visivel ${isUltimoFilho ? 'tg-tr-filho--ultimo' : ''}`, children: [_jsx("td", { className: "tg-td--filho-expand", children: _jsx("span", { className: "tg-conector", children: isUltimoFilho ? '└' : '├' }) }), colunasFilhas.map((cf, cfIdx) => (_jsx("td", { className: `tg-td ${cfIdx === 0 ? 'tg-td--filho-first' : ''}`, style: { textAlign: cf.align || 'left' }, children: renderCelulaCamada(cf, filho) }, cf.key))), acoesFilhas ? (_jsx("td", { className: "tg-td tg-td--acoes", children: _jsx("div", { className: "tg-acoes-grupo", children: acoesFilhas.map(af => (_jsx(TooltipGlobal, { descricao: af.tooltip, children: _jsx("button", { type: "button", className: "tg-acao-btn", onClick: () => af.onClick?.(filho), children: af.icone }) }, af.id))) }) })) : (acoes && acoes.length > 0 && _jsx("td", { className: "tg-td tg-td--acoes" })), renderExpandido && !filhos && _jsx("td", { className: "tg-td" })] }, filho.id ?? fi));
                                        }), isExpanded && renderExpandido && !filhos && (_jsx("tr", { className: "tg-tr-expandida-conteudo", children: _jsx("td", { colSpan: colunas.length + (acoes?.length ? 1 : 0) + 2, style: { padding: 0 }, children: renderExpandido(item) }) }))] }, id));
                            }) })] }) }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem 1.25rem', borderTop: '1px solid var(--ws-accent-border)', background: 'rgba(129,140,248,0.02)' }, children: [_jsx("span", { style: { fontSize: '0.8125rem', color: '#64748b' }, children: resultado.length === 0 ? 'Nenhum registro' : `${(pagSafe - 1) * porPagina + 1}–${Math.min(pagSafe * porPagina, resultado.length)} de ${resultado.length}` }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' }, children: [_jsx("button", { type: "button", onClick: () => setPagina(1), disabled: pagSafe === 1, style: { padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }, children: "\u00AB" }), _jsx("button", { type: "button", onClick: () => setPagina(p => Math.max(1, p - 1)), disabled: pagSafe === 1, style: { padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === 1 ? 0.3 : 1 }, children: "\u2039" }), _jsxs("span", { style: { fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', minWidth: '56px', textAlign: 'center' }, children: [pagSafe, " / ", totalPags] }), _jsx("button", { type: "button", onClick: () => setPagina(p => Math.min(totalPags, p + 1)), disabled: pagSafe === totalPags, style: { padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }, children: "\u203A" }), _jsx("button", { type: "button", onClick: () => setPagina(totalPags), disabled: pagSafe === totalPags, style: { padding: '0.3rem 0.5rem', minWidth: '2rem', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer', background: 'transparent', border: '1px solid transparent', color: '#94a3b8', fontFamily: 'inherit', opacity: pagSafe === totalPags ? 0.3 : 1 }, children: "\u00BB" })] }), _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#64748b' }, children: ["Por p\u00E1gina:", _jsx("select", { value: porPagina, onChange: e => { setPorPagina(Number(e.target.value)); setPagina(1); }, style: { background: 'var(--ws-bg-body, #0f172a)', border: '1px solid var(--ws-accent-border)', borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#f1f5f9', fontSize: '0.8125rem', fontFamily: 'inherit', cursor: 'pointer' }, children: [10, 20, 50].map(n => _jsx("option", { value: n, children: n }, n)) })] })] })] }));
}
