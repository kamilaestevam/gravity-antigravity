import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// src/views/AtividadesView.tsx
// ============================================================================
// Minhas Atividades — Tasks Board
// Portado do Journey (js/modules/tasks-board.js) para React + TypeScript.
// Suporta: Kanban (4 colunas), Vista Lista (tabela), Filtros, Modal com tabs,
//          Cronômetro, Participantes e CRUD completo.
// ============================================================================
import { useEffect, useState, useRef, useCallback } from 'react';
import '../atividades.css';
// ─── Constantes (espelham o Journey) ─────────────────────────────────────────
const KANBAN_COLS = [
    { key: 'A Fazer', label: 'A Fazer', color: '#6366f1', icon: '▷' },
    { key: 'Em Andamento', label: 'Em Andamento', color: '#f59e0b', icon: '↻' },
    { key: 'Concluída', label: 'Concluída', color: '#10b981', icon: '✓' },
    { key: 'Cancelada', label: 'Cancelada', color: '#64748b', icon: '✕' },
];
const PRIORITY_COLORS = {
    urgente: '#ef4444', alta: '#f97316', 'média': '#f59e0b', baixa: '#64748b',
};
const TYPE_CONFIG = {
    'Comentário': { color: '#64748b' },
    'Reunião': { color: '#6366f1' },
    'Chamados HD': { color: '#f59e0b' },
    'Chamados CS': { color: '#10b981' },
    'Ação necessária': { color: '#f97316' },
    'Tarefa': { color: '#818cf8' },
    'Outros': { color: '#64748b' },
};
const TIPOS = ['Comentário', 'Reunião', 'Chamados HD', 'Chamados CS', 'Ação necessária', 'Tarefa', 'Outros'];
const PRIOS = ['baixa', 'média', 'alta', 'urgente'];
const PRIO_LABEL = { baixa: 'Baixa', 'média': 'Média', alta: 'Alta', urgente: 'Urgente' };
const STATUS_COLORS = {
    'A Fazer': '#818cf8', 'Em Andamento': '#f59e0b', 'Concluída': '#10b981', 'Cancelada': '#64748b',
};
const STATUS_BG = {
    'A Fazer': 'rgba(99,102,241,0.12)', 'Em Andamento': 'rgba(245,158,11,0.12)',
    'Concluída': 'rgba(16,185,129,0.12)', 'Cancelada': 'rgba(100,116,139,0.12)',
};
// ─── API helpers ──────────────────────────────────────────────────────────────
const API_BASE = '/api/v1/atividades';
const headers = { 'Content-Type': 'application/json' };
async function apiGet(params = {}) {
    const qs = new URLSearchParams({ assignee: 'me', limit: '200', ...params });
    const r = await fetch(`${API_BASE}?${qs}`);
    if (!r.ok)
        throw new Error('Erro ao carregar atividades');
    const body = await r.json();
    return body.data ?? [];
}
async function apiCreate(data) {
    const r = await fetch(API_BASE, { method: 'POST', headers, body: JSON.stringify(data) });
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error?.message ?? 'Erro ao criar');
    }
    return r.json();
}
async function apiUpdate(id, data) {
    const r = await fetch(`${API_BASE}/${id}`, { method: 'PATCH', headers, body: JSON.stringify(data) });
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.error?.message ?? 'Erro ao salvar');
    }
    return r.json();
}
async function apiDelete(id) {
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
}
async function apiTimer(id, sessao) {
    await fetch(`${API_BASE}/${id}/timer`, { method: 'POST', headers, body: JSON.stringify(sessao) });
}
// ─── Utils ───────────────────────────────────────────────────────────────────
function fmtDate(iso) {
    if (!iso)
        return '';
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function fmtDateShort(iso) {
    if (!iso)
        return '';
    return new Date(iso).toLocaleDateString('pt-BR');
}
function fmtMin(min) {
    if (!min)
        return '0min';
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
}
function fmtTimerHMS(sec) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}
function isOverdue(atividade) {
    if (!atividade.data_atividade)
        return false;
    if (atividade.status === 'Concluída' || atividade.status === 'Cancelada')
        return false;
    return new Date(atividade.data_atividade) < new Date();
}
function applyFilters(list, f) {
    return list.filter(t => {
        if (f.status && t.status !== f.status)
            return false;
        if (f.prioridade && t.prioridade !== f.prioridade)
            return false;
        if (f.prazo) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dt = t.data_atividade ? (() => { const d = new Date(t.data_atividade); d.setHours(0, 0, 0, 0); return d; })() : null;
            if (f.prazo === 'sem_prazo' && dt)
                return false;
            if (f.prazo !== 'sem_prazo') {
                if (!dt)
                    return false;
                if (f.prazo === 'atrasado' && dt >= today)
                    return false;
                if (f.prazo === 'hoje' && dt.getTime() !== today.getTime())
                    return false;
                if (f.prazo === 'futuro' && dt < tomorrow)
                    return false;
            }
        }
        if (f.dateFrom || f.dateTo) {
            if (!t.data_atividade)
                return false;
            const tDay = new Date(t.data_atividade);
            tDay.setHours(0, 0, 0, 0);
            if (f.dateFrom && tDay < new Date(f.dateFrom + 'T00:00:00'))
                return false;
            if (f.dateTo && tDay > new Date(f.dateTo + 'T23:59:59'))
                return false;
        }
        if (f.search) {
            const q = f.search.toLowerCase();
            const txt = [
                t.titulo, t.descricao, t.tipo, t.prioridade, t.status,
                fmtDateShort(t.data_atividade),
                ...(t.participantes ?? []).map(p => p.user_nome),
            ].filter(Boolean).join(' ').toLowerCase();
            if (!txt.includes(q))
                return false;
        }
        return true;
    });
}
// ─── Componente principal ────────────────────────────────────────────────────
export default function AtividadesView() {
    const [atividades, setAtividades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban');
    const [filters, setFilters] = useState({ search: '', status: '', prioridade: '', prazo: '', dateFrom: '', dateTo: '' });
    const [modalAtvId, setModalAtvId] = useState(null);
    const [showNewModal, setShowNewModal] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 15;
    const contentRef = useRef(null);
    const headerRef = useRef(null);
    const load = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet();
            setAtividades(data);
        }
        catch (e) {
            console.error('[Atividades]', e);
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);
    // Sticky header shadow on scroll
    useEffect(() => {
        const el = contentRef.current;
        if (!el)
            return;
        const onScroll = () => { headerRef.current?.classList.toggle('is-stuck', el.scrollTop > 4); };
        el.addEventListener('scroll', onScroll, { passive: true });
        return () => el.removeEventListener('scroll', onScroll);
    }, []);
    const filtered = applyFilters(atividades, filters);
    function clearFilters() {
        setFilters({ search: '', status: '', prioridade: '', prazo: '', dateFrom: '', dateTo: '' });
    }
    const modalAtv = atividades.find(a => a.id === modalAtvId) ?? null;
    return (_jsxs("div", { className: "ativ-page", children: [_jsxs("div", { className: "ativ-sticky-header", ref: headerRef, children: [_jsxs("div", { className: "ativ-title-row", children: [_jsxs("div", { children: [_jsxs("h1", { className: "ativ-title", children: [_jsx("span", { style: { color: '#6366f1' }, children: "\u25C8" }), " Minhas Atividades"] }), _jsx("p", { className: "ativ-subtitle", children: "Todas as atividades atribu\u00EDdas a voc\u00EA \u2014 por cria\u00E7\u00E3o ou responsabilidade." })] }), _jsx("button", { className: "ativ-btn-primary", onClick: () => setShowNewModal(true), children: "+ Nova Atividade" })] }), _jsxs("div", { className: "ativ-filters", children: [_jsxs("div", { className: "ativ-filters__left", children: [_jsxs("div", { className: "ativ-search-wrap", children: [_jsx("span", { style: { color: 'var(--text-muted)', fontSize: '0.9rem' }, children: "\uD83D\uDD0D" }), _jsx("input", { placeholder: "Localizar em atividades...", value: filters.search, onChange: e => setFilters(f => ({ ...f, search: e.target.value })) })] }), _jsxs("select", { className: "ativ-select", value: filters.status, onChange: e => setFilters(f => ({ ...f, status: e.target.value })), children: [_jsx("option", { value: "", children: "Status" }), KANBAN_COLS.map(c => _jsx("option", { value: c.key, children: c.label }, c.key))] }), _jsxs("select", { className: "ativ-select", value: filters.prazo, onChange: e => setFilters(f => ({ ...f, prazo: e.target.value })), children: [_jsx("option", { value: "", children: "Prazo" }), _jsx("option", { value: "atrasado", children: "Atrasadas" }), _jsx("option", { value: "hoje", children: "Hoje" }), _jsx("option", { value: "futuro", children: "Pr\u00F3ximos dias" }), _jsx("option", { value: "sem_prazo", children: "Sem prazo" })] }), _jsxs("select", { className: "ativ-select", value: filters.prioridade, onChange: e => setFilters(f => ({ ...f, prioridade: e.target.value })), children: [_jsx("option", { value: "", children: "Prioridade" }), PRIOS.map(p => _jsx("option", { value: p, children: PRIO_LABEL[p] }, p))] }), _jsxs("div", { className: "ativ-date-range", children: [_jsx("input", { type: "date", value: filters.dateFrom, onChange: e => setFilters(f => ({ ...f, dateFrom: e.target.value })), title: "Data inicial" }), _jsx("span", { children: "at\u00E9" }), _jsx("input", { type: "date", value: filters.dateTo, onChange: e => setFilters(f => ({ ...f, dateTo: e.target.value })), title: "Data final" })] }), _jsx("button", { className: "ativ-btn-ghost", onClick: clearFilters, children: "\u2715 Limpar" })] }), _jsxs("div", { className: "ativ-view-toggle", children: [_jsx("button", { className: `ativ-view-btn${view === 'kanban' ? ' active' : ''}`, onClick: () => setView('kanban'), children: "\u229E Kanban" }), _jsx("button", { className: `ativ-view-btn${view === 'lista' ? ' active' : ''}`, onClick: () => { setView('lista'); setPage(1); }, children: "\u2630 Lista" })] })] })] }), _jsx("div", { className: "ativ-content", ref: contentRef, children: loading ? (_jsxs("div", { className: "ativ-empty-state", children: [_jsx("span", { className: "ativ-spin", style: { fontSize: '2rem' }, children: "\u21BB" }), _jsx("p", { children: "Carregando atividades..." })] })) : view === 'kanban' ? (_jsx(KanbanBoard, { atividades: filtered, onOpen: (id) => setModalAtvId(id), onStatusChange: async (id, newStatus) => {
                        setAtividades(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
                        await apiUpdate(id, { status: newStatus });
                    } })) : (_jsx(ListaView, { atividades: filtered, page: page, pageSize: PAGE_SIZE, onPage: setPage, onOpen: (id) => setModalAtvId(id), onDelete: async (id) => {
                        await apiDelete(id);
                        setAtividades(prev => prev.filter(a => a.id !== id));
                    } })) }), modalAtv && (_jsx(AtividadeModal, { atividade: modalAtv, onClose: () => setModalAtvId(null), onSave: async (data) => {
                    const updated = await apiUpdate(modalAtv.id, data);
                    setAtividades(prev => prev.map(a => a.id === modalAtv.id ? updated : a));
                    setModalAtvId(null);
                }, onDelete: async () => {
                    await apiDelete(modalAtv.id);
                    setAtividades(prev => prev.filter(a => a.id !== modalAtv.id));
                    setModalAtvId(null);
                }, onSaveTimer: async (sessao) => {
                    await apiTimer(modalAtv.id, sessao);
                    // Recarrega para atualizar tempo acumulado
                    const data = await apiGet();
                    setAtividades(data);
                } })), showNewModal && (_jsx(AtividadeModal, { atividade: null, onClose: () => setShowNewModal(false), onSave: async (data) => {
                    const created = await apiCreate(data);
                    setAtividades(prev => [created, ...prev]);
                    setShowNewModal(false);
                }, onDelete: async () => { setShowNewModal(false); }, onSaveTimer: async () => { } }))] }));
}
function KanbanBoard({ atividades, onOpen, onStatusChange }) {
    const [draggingId, setDraggingId] = useState(null);
    const [dragOverCol, setDragOverCol] = useState(null);
    return (_jsx("div", { className: "ativ-kanban-grid", children: KANBAN_COLS.map(col => {
            const cards = atividades.filter(a => a.status === col.key);
            return (_jsxs("div", { className: "ativ-kanban-col", children: [_jsxs("div", { className: "ativ-kanban-col__header", children: [_jsxs("div", { className: "ativ-kanban-col__title", style: { color: col.color }, children: [_jsx("span", { children: col.icon }), _jsx("span", { style: { color: 'var(--text-primary)' }, children: col.label })] }), _jsx("span", { className: "ativ-kanban-col__badge", style: { background: col.color + '20', color: col.color, border: `1px solid ${col.color}44` }, children: cards.length })] }), _jsx("div", { className: `ativ-kanban-dropzone${dragOverCol === col.key ? ' drag-over' : ''}`, onDragOver: e => { e.preventDefault(); setDragOverCol(col.key); }, onDragLeave: () => setDragOverCol(null), onDrop: e => {
                            e.preventDefault();
                            setDragOverCol(null);
                            if (draggingId)
                                onStatusChange(draggingId, col.key);
                            setDraggingId(null);
                        }, children: cards.length === 0 ? (_jsxs("div", { className: "ativ-empty-col", children: [_jsx("div", { style: { fontSize: '1.4rem', marginBottom: '0.4rem' }, children: "\uD83D\uDDC3" }), "Nenhuma atividade"] })) : (cards.map(a => (_jsx(KanbanCard, { atividade: a, onOpen: onOpen, onDragStart: () => setDraggingId(a.id), onDragEnd: () => setDraggingId(null), isDragging: draggingId === a.id }, a.id)))) })] }, col.key));
        }) }));
}
function KanbanCard({ atividade: a, onOpen, onDragStart, onDragEnd, isDragging }) {
    const pc = a.prioridade ? PRIORITY_COLORS[a.prioridade] ?? '#64748b' : null;
    const tc = TYPE_CONFIG[a.tipo]?.color ?? '#64748b';
    const overdue = isOverdue(a);
    return (_jsxs("div", { className: `ativ-card${isDragging ? ' dragging' : ''}`, draggable: true, onDragStart: onDragStart, onDragEnd: onDragEnd, onClick: () => onOpen(a.id), style: pc ? { borderLeft: `3px solid ${pc}` } : undefined, children: [pc && (_jsx("span", { className: "ativ-card__priority", style: { background: pc + '20', color: pc, border: `1px solid ${pc}44` }, children: PRIO_LABEL[a.prioridade] })), _jsxs("div", { className: "ativ-card__company", children: ["\uD83C\uDFE2 ", a.processo_id ? `Processo #${a.processo_id.slice(-6)}` : 'Sem vínculo'] }), _jsx("div", { className: "ativ-card__title", children: a.titulo }), a.data_atividade && (_jsxs("div", { className: "ativ-card__date", style: { color: overdue ? '#ef4444' : 'var(--text-muted)' }, children: ["\uD83D\uDCC5 ", fmtDateShort(a.data_atividade), overdue ? ' · atrasada!' : ''] })), _jsxs("div", { className: "ativ-card__footer", children: [_jsx("span", { className: "ativ-card__type", style: { color: tc }, children: a.tipo }), _jsx("span", { className: "ativ-card__edit", children: "\u270F editar" })] })] }));
}
function ListaView({ atividades, page, pageSize, onPage, onOpen, onDelete }) {
    const total = atividades.length;
    const pages = Math.max(1, Math.ceil(total / pageSize));
    const start = (page - 1) * pageSize;
    const visible = atividades.slice(start, start + pageSize);
    return (_jsxs("div", { className: "ativ-table-wrap", children: [_jsxs("table", { className: "ativ-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Tipo" }), _jsx("th", { children: "T\u00EDtulo" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Prioridade" }), _jsx("th", { children: "Data" }), _jsx("th", { children: "Tempo" }), _jsx("th", { children: "Participantes" }), _jsx("th", { style: { textAlign: 'right' }, children: "A\u00E7\u00F5es" })] }) }), _jsx("tbody", { children: visible.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 8, children: _jsxs("div", { className: "ativ-empty-state", children: [_jsx("div", { className: "ativ-empty-state__icon", children: "\uD83D\uDCED" }), _jsx("div", { className: "ativ-empty-state__title", children: "Nenhuma atividade encontrada" }), _jsx("div", { className: "ativ-empty-state__desc", children: "Ajuste os filtros ou crie uma nova atividade." })] }) }) })) : visible.map(a => {
                            const tc = TYPE_CONFIG[a.tipo]?.color ?? '#64748b';
                            const pc = a.prioridade ? PRIORITY_COLORS[a.prioridade] : null;
                            const overdue = isOverdue(a);
                            return (_jsxs("tr", { onClick: () => onOpen(a.id), children: [_jsx("td", { children: _jsx("span", { className: "ativ-badge", style: { background: tc + '18', color: tc, borderColor: tc + '44' }, children: a.tipo }) }), _jsx("td", { style: { fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: a.titulo }), _jsx("td", { children: _jsx("span", { className: "ativ-badge", style: { background: STATUS_BG[a.status], color: STATUS_COLORS[a.status], borderColor: STATUS_COLORS[a.status] + '44' }, children: a.status }) }), _jsx("td", { children: pc && (_jsx("span", { className: "ativ-badge", style: { background: pc + '20', color: pc, borderColor: pc + '44' }, children: PRIO_LABEL[a.prioridade] })) }), _jsx("td", { style: { color: overdue ? '#ef4444' : 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }, children: fmtDateShort(a.data_atividade) }), _jsx("td", { style: { fontSize: '0.8rem' }, children: a.tempo_gasto_minutos ? (_jsxs("span", { className: "ativ-badge", style: { background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }, children: ["\u23F1 ", fmtMin(a.tempo_gasto_minutos)] })) : '-' }), _jsx("td", { style: { fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: a.participantes.map(p => p.user_nome ?? p.user_id).join(', ') || '-' }), _jsxs("td", { style: { textAlign: 'right', whiteSpace: 'nowrap' }, onClick: e => e.stopPropagation(), children: [_jsx("button", { className: "ativ-btn-secondary", style: { display: 'inline-flex', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }, onClick: () => onOpen(a.id), children: "\u270F" }), ' ', _jsx("button", { className: "ativ-btn-danger", style: { display: 'inline-flex', padding: '0.25rem 0.6rem', fontSize: '0.75rem' }, onClick: () => { if (confirm('Excluir esta atividade?'))
                                                    onDelete(a.id); }, children: "\uD83D\uDDD1" })] })] }, a.id));
                        }) })] }), pages > 1 && (_jsxs("div", { className: "ativ-pagination", children: [_jsxs("span", { children: [start + 1, "\u2013", Math.min(start + pageSize, total), " de ", total, " registros"] }), _jsxs("div", { className: "ativ-pagination-btns", children: [_jsx("button", { className: "ativ-page-btn", disabled: page <= 1, onClick: () => onPage(page - 1), children: "\u2039" }), Array.from({ length: pages }, (_, i) => i + 1).map(p => (_jsx("button", { className: `ativ-page-btn${p === page ? ' active' : ''}`, onClick: () => onPage(p), children: p }, p))), _jsx("button", { className: "ativ-page-btn", disabled: page >= pages, onClick: () => onPage(page + 1), children: "\u203A" })] })] }))] }));
}
function AtividadeModal({ atividade, onClose, onSave, onDelete, onSaveTimer }) {
    const isNew = !atividade;
    const [tab, setTab] = useState('informacoes');
    const [saving, setSaving] = useState(false);
    // Form state
    const [titulo, setTitulo] = useState(atividade?.titulo ?? '');
    const [descricao, setDescricao] = useState(atividade?.descricao ?? '');
    const [tipo, setTipo] = useState(atividade?.tipo ?? 'Tarefa');
    const [status, setStatus] = useState(atividade?.status ?? 'A Fazer');
    const [prioridade, setPrioridade] = useState(atividade?.prioridade ?? '');
    const [dataAtvStr, setDataAtvStr] = useState(atividade?.data_atividade ? new Date(atividade.data_atividade).toISOString().slice(0, 16) : '');
    const [pPassoTit, setPPassoTit] = useState(atividade?.proximo_passo_titulo ?? '');
    const [pPassoData, setPPassoData] = useState(atividade?.proximo_passo_data ? new Date(atividade.proximo_passo_data).toISOString().slice(0, 10) : '');
    const [lembreteEm, setLembreteEm] = useState(atividade?.lembrete_em ? new Date(atividade.lembrete_em).toISOString().slice(0, 16) : '');
    const [lemEmail, setLemEmail] = useState(atividade?.lembrete_email ?? false);
    const [lemWpp, setLemWpp] = useState(atividade?.lembrete_whatsapp ?? false);
    const [participantes, setParticipantes] = useState(atividade?.participantes ?? []);
    const [newPart, setNewPart] = useState('');
    // Timer
    const [timerSec, setTimerSec] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timerStart, setTimerStart] = useState(null);
    const timerRef = useRef(null);
    const [timerAssunto, setTimerAssunto] = useState('');
    function startTimer() {
        setTimerRunning(true);
        setTimerStart(new Date());
        timerRef.current = setInterval(() => setTimerSec(s => s + 1), 1000);
    }
    function pauseTimer() {
        setTimerRunning(false);
        if (timerRef.current)
            clearInterval(timerRef.current);
    }
    async function stopTimer() {
        pauseTimer();
        if (!atividade || timerSec < 60) {
            setTimerSec(0);
            return;
        }
        const durMin = Math.ceil(timerSec / 60);
        await onSaveTimer({
            iniciado_em: (timerStart ?? new Date()).toISOString(),
            duracao_min: durMin,
            assunto: timerAssunto || undefined,
        });
        setTimerSec(0);
        setTimerAssunto('');
    }
    // Cleanup timer on unmount
    useEffect(() => () => { if (timerRef.current)
        clearInterval(timerRef.current); }, []);
    // Fecha com ESC
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape')
            onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);
    function addParticipant() {
        const nome = newPart.trim();
        if (!nome)
            return;
        setParticipantes(prev => [...prev, { user_id: nome, user_nome: nome }]);
        setNewPart('');
    }
    function removeParticipant(uid) {
        setParticipantes(prev => prev.filter(p => p.user_id !== uid));
    }
    async function handleSave() {
        if (!titulo.trim()) {
            alert('Informe um título para a atividade.');
            return;
        }
        setSaving(true);
        try {
            await onSave({
                titulo,
                descricao: descricao || undefined,
                tipo,
                status,
                prioridade: prioridade || undefined,
                data_atividade: dataAtvStr ? new Date(dataAtvStr).toISOString() : undefined,
                proximo_passo_titulo: pPassoTit || undefined,
                proximo_passo_data: pPassoData ? new Date(pPassoData + 'T00:00:00').toISOString() : undefined,
                lembrete_em: lembreteEm ? new Date(lembreteEm).toISOString() : undefined,
                lembrete_email: lemEmail,
                lembrete_whatsapp: lemWpp,
                participantes,
            });
        }
        finally {
            setSaving(false);
        }
    }
    const sessoes = atividade?.sessoes_timer ?? [];
    return (_jsx("div", { className: "ativ-modal-overlay", onClick: e => { if (e.target === e.currentTarget)
            onClose(); }, children: _jsxs("div", { className: "ativ-modal", style: { position: 'relative' }, children: [_jsxs("div", { className: "ativ-modal__head", children: [_jsxs("div", { className: "ativ-modal__meta", children: [_jsxs("span", { children: ["\uD83C\uDFE2 ", atividade?.processo_id ? `Processo #${atividade.processo_id.slice(-6)}` : 'Sem vínculo'] }), _jsx("span", { children: "\u00B7" }), atividade && _jsxs("span", { children: ["Criado ", fmtDateShort(atividade.created_at)] })] }), _jsx("button", { className: "ativ-modal__close", onClick: onClose, children: "\u2715" }), _jsx("div", { className: "ativ-modal__title-text", children: isNew ? 'Nova Atividade' : atividade?.titulo }), !isNew && (_jsxs("div", { className: "ativ-modal__badges", children: [_jsx("span", { className: "ativ-badge", style: { background: STATUS_BG[atividade.status], color: STATUS_COLORS[atividade.status], borderColor: STATUS_COLORS[atividade.status] + '44' }, children: atividade.status }), atividade.prioridade && (_jsx("span", { className: "ativ-badge", style: { background: PRIORITY_COLORS[atividade.prioridade] + '20', color: PRIORITY_COLORS[atividade.prioridade], borderColor: PRIORITY_COLORS[atividade.prioridade] + '44' }, children: PRIO_LABEL[atividade.prioridade] }))] }))] }), _jsx("div", { className: "ativ-modal__tabs", children: [
                        { id: 'informacoes', label: '≡ Informações' },
                        { id: 'tempo', label: '⏱ Tempo' },
                        { id: 'proximo-passo', label: '→ Próximo Passo' },
                        { id: 'lembrete', label: '🔔 Lembrete' },
                    ].map(t => (_jsx("button", { className: `ativ-modal__tab${tab === t.id ? ' active' : ''}`, onClick: () => setTab(t.id), children: t.label }, t.id))) }), _jsxs("div", { className: "ativ-modal__body", children: [tab === 'informacoes' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "ativ-section-label", children: "\u2699 Configura\u00E7\u00F5es" }), _jsxs("div", { className: "ativ-grid-2", children: [_jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Tipo de Atividade" }), _jsx("select", { value: tipo, onChange: e => setTipo(e.target.value), children: TIPOS.map(t => _jsx("option", { value: t, children: t }, t)) })] }), _jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Fase da Atividade" }), _jsx("select", { value: status, onChange: e => setStatus(e.target.value), children: KANBAN_COLS.map(c => _jsx("option", { value: c.key, children: c.label }, c.key)) })] })] }), _jsxs("div", { className: "ativ-grid-2", children: [_jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Prioridade" }), _jsxs("select", { value: prioridade, onChange: e => setPrioridade(e.target.value), children: [_jsx("option", { value: "", children: "Sem prioridade" }), PRIOS.map(p => _jsx("option", { value: p, children: PRIO_LABEL[p] }, p))] })] }), _jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Data e Hor\u00E1rio" }), _jsx("input", { type: "datetime-local", value: dataAtvStr, onChange: e => setDataAtvStr(e.target.value) })] })] }), _jsx("p", { className: "ativ-section-label", style: { marginTop: '1rem' }, children: "\uD83D\uDCDD Conte\u00FAdo" }), _jsxs("div", { className: "ativ-field", style: { marginBottom: '0.85rem' }, children: [_jsx("label", { children: "T\u00EDtulo *" }), _jsx("input", { placeholder: "T\u00EDtulo da atividade", value: titulo, onChange: e => setTitulo(e.target.value) })] }), _jsxs("div", { className: "ativ-field", style: { marginBottom: '1rem' }, children: [_jsx("label", { children: "Descri\u00E7\u00E3o" }), _jsx("textarea", { placeholder: "Descreva a atividade...", value: descricao, onChange: e => setDescricao(e.target.value), rows: 4 })] }), _jsx("p", { className: "ativ-section-label", children: "\uD83D\uDC65 Participantes" }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }, children: [_jsx("input", { className: "ativ-field", style: { flex: 1 }, placeholder: "Nome ou e-mail do participante", value: newPart, onChange: e => setNewPart(e.target.value), onKeyDown: e => { if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addParticipant();
                                            } } }), _jsx("button", { className: "ativ-btn-secondary", onClick: addParticipant, children: "+ Adicionar" })] }), _jsx("div", { className: "ativ-chips", children: participantes.map(p => (_jsxs("span", { className: "ativ-chip", children: ["\uD83D\uDC64 ", p.user_nome ?? p.user_id, _jsx("button", { onClick: () => removeParticipant(p.user_id), children: "\u00D7" })] }, p.user_id))) })] })), tab === 'tempo' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "ativ-section-label", children: "\u23F1 Cron\u00F4metro" }), _jsxs("div", { style: { background: 'rgba(15,23,42,0.5)', border: '1px solid var(--bg-elevated)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1.25rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }, children: [_jsxs("div", { children: [_jsx("div", { style: { fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }, children: "Tempo Trabalhado" }), _jsx("div", { className: `ativ-timer-display${timerRunning ? ' ativ-timer-running' : ''}`, children: fmtTimerHMS(timerSec) })] }), _jsx("div", { style: { display: 'flex', gap: '0.5rem' }, children: !timerRunning ? (_jsx("button", { className: "ativ-btn-primary", onClick: startTimer, children: "\u25B7 Iniciar" })) : (_jsxs(_Fragment, { children: [_jsx("button", { className: "ativ-btn-secondary", onClick: pauseTimer, children: "\u23F8 Pausar" }), _jsx("button", { className: "ativ-btn-danger", onClick: stopTimer, children: "\u23F9 Finalizar" })] })) })] }), _jsxs("div", { className: "ativ-field", style: { marginTop: '0.85rem' }, children: [_jsx("label", { children: "Assunto da sess\u00E3o (opcional)" }), _jsx("input", { placeholder: "Ex: Analisei a documenta\u00E7\u00E3o...", value: timerAssunto, onChange: e => setTimerAssunto(e.target.value) })] })] }), _jsx("p", { className: "ativ-section-label", children: "Sess\u00F5es Registradas" }), atividade && (_jsxs("div", { style: { marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }, children: ["Total acumulado: ", _jsx("strong", { children: fmtMin(atividade.tempo_gasto_minutos) })] })), sessoes.length === 0 ? (_jsx("p", { style: { color: 'var(--text-muted)', fontSize: '0.82rem' }, children: "Nenhuma sess\u00E3o registrada ainda." })) : (_jsxs("table", { className: "ativ-sessoes-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Data" }), _jsx("th", { children: "Hora" }), _jsx("th", { children: "Dura\u00E7\u00E3o" }), _jsx("th", { children: "Assunto" })] }) }), _jsx("tbody", { children: sessoes.map(s => (_jsxs("tr", { children: [_jsx("td", { children: fmtDateShort(s.iniciado_em) }), _jsx("td", { children: new Date(s.iniciado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }), _jsx("td", { children: _jsxs("span", { className: "ativ-badge", style: { background: 'rgba(99,102,241,0.1)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }, children: ["\u23F1 ", fmtMin(s.duracao_min)] }) }), _jsx("td", { style: { color: 'var(--text-muted)' }, children: s.assunto ?? '—' })] }, s.id))) })] }))] })), tab === 'proximo-passo' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "ativ-section-label", children: "\u2192 Pr\u00F3ximo Passo" }), _jsxs("div", { className: "ativ-grid-2", style: { marginBottom: '0.85rem' }, children: [_jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "T\u00EDtulo do Pr\u00F3ximo Passo" }), _jsx("input", { placeholder: "O que fazer a seguir?", value: pPassoTit, onChange: e => setPPassoTit(e.target.value) })] }), _jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Data do Pr\u00F3ximo Passo" }), _jsx("input", { type: "date", value: pPassoData, onChange: e => setPPassoData(e.target.value) })] })] }), pPassoData && (_jsx("div", { className: "ativ-field", style: { marginBottom: '0.85rem' }, children: _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }, children: [_jsx("input", { type: "checkbox" }), " Lembrar por e-mail (1 dia antes)"] }) })), pPassoTit || pPassoData ? (_jsxs("div", { style: { background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', color: '#10b981' }, children: ["\u2713 Pr\u00F3ximo passo configurado:", ' ', _jsx("strong", { children: pPassoTit }), pPassoData && ` · ${fmtDateShort(pPassoData + 'T00:00:00')}`] })) : (_jsx("p", { style: { color: 'var(--text-muted)', fontSize: '0.82rem' }, children: "Nenhum pr\u00F3ximo passo definido. Adicione um t\u00EDtulo e data para ajudar na gest\u00E3o das atividades." }))] })), tab === 'lembrete' && (_jsxs(_Fragment, { children: [_jsx("p", { className: "ativ-section-label", children: "\uD83D\uDD14 Lembrete" }), _jsxs("div", { className: "ativ-grid-2", style: { marginBottom: '1rem' }, children: [_jsxs("div", { className: "ativ-field", children: [_jsx("label", { children: "Data e hora do lembrete" }), _jsx("input", { type: "datetime-local", value: lembreteEm, onChange: e => setLembreteEm(e.target.value) })] }), _jsxs("div", { className: "ativ-field", style: { justifyContent: 'flex-end', gap: '0.6rem' }, children: [_jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }, children: [_jsx("input", { type: "checkbox", checked: lemEmail, onChange: e => setLemEmail(e.target.checked) }), "Por e-mail"] }), _jsxs("label", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem' }, children: [_jsx("input", { type: "checkbox", checked: lemWpp, onChange: e => setLemWpp(e.target.checked) }), "Por WhatsApp"] })] })] }), lembreteEm ? (_jsxs("div", { style: { background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)', padding: '0.85rem', fontSize: '0.83rem', color: '#f59e0b' }, children: ["\uD83D\uDD14 Lembrete agendado para", ' ', _jsx("strong", { children: fmtDate(lembreteEm + ':00') }), lemEmail && ' · E-mail', lemWpp && ' · WhatsApp'] })) : (_jsx("p", { style: { color: 'var(--text-muted)', fontSize: '0.82rem' }, children: "Nenhum lembrete configurado. Defina uma data/hora acima para receber uma notifica\u00E7\u00E3o." }))] })), _jsxs("div", { className: "ativ-modal-actions", children: [!isNew ? (_jsx("button", { className: "ativ-btn-danger", onClick: async () => { if (confirm('Excluir esta atividade?'))
                                        await onDelete(); }, children: "\uD83D\uDDD1 Excluir" })) : _jsx("div", {}), _jsxs("div", { className: "ativ-modal-actions__right", children: [_jsx("button", { className: "ativ-btn-secondary", onClick: onClose, children: "Cancelar" }), _jsx("button", { className: "ativ-btn-primary", onClick: handleSave, disabled: saving, children: saving ? '...' : '💾 Salvar Alterações' })] })] })] })] }) }));
}
