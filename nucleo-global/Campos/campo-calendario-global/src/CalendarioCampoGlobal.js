import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { GeralCampoGlobal } from '@nucleo/campo-geral-global';
import { CalendarBlank, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { BotaoGlobal } from '@nucleo/botao-global';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import { SelectGlobal } from '@nucleo/campo-select-global';
import './calendario.css';
const MESES_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
function formatarDataBR(d) {
    if (!d)
        return '';
    return d.toLocaleDateString('pt-BR');
}
export function CalendarioCampoGlobal({ placeholder, valor = { inicio: null, fim: null }, aoMudarValor, disabled = false, className, ...geralProps }) {
    const defaultPlaceholder = placeholder ?? 'Selecione o período';
    const MESES_NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const MESES_OPCOES = MESES_INDICES.map((idx) => ({
        rotulo: MESES_NOMES[idx],
        valor: idx,
    }));
    const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const [inicio, setInicio] = useState(valor.inicio);
    const [fim, setFim] = useState(valor.fim);
    const [viewMes, setViewMes] = useState(new Date().getMonth());
    const [viewAno, setViewAno] = useState(new Date().getFullYear());
    const [hoverDate, setHoverDate] = useState(null);
    const [etapa, setEtapa] = useState('inicio');
    const [panelPos, setPanelPos] = useState(null);
    useEffect(() => {
        setInicio(valor.inicio);
        setFim(valor.fim);
        if (valor.inicio) {
            setViewMes(valor.inicio.getMonth());
            setViewAno(valor.inicio.getFullYear());
        }
    }, [valor.inicio, valor.fim]);
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        // Fechar calendário ao scroll do pai (evita painel flutuante desalinhado)
        function handleScroll() { setIsOpen(false); }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);
    function handleDayClick(d) {
        if (etapa === 'inicio' || (inicio && d < inicio && (!fim || fim === inicio))) {
            setInicio(d);
            setFim(null);
            setEtapa('fim');
        }
        else {
            if (inicio && d < inicio) {
                setFim(inicio);
                setInicio(d);
            }
            else {
                setFim(d);
            }
            setEtapa('inicio');
        }
    }
    function handleDayMouseEnter(d) {
        if (etapa === 'fim' && inicio) {
            setHoverDate(d);
        }
        else {
            setHoverDate(null);
        }
    }
    function aplicarPeriodo(tipo) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        let i = new Date(hoje);
        let f = new Date(hoje);
        if (tipo === 'hoje') {
            // already set
        }
        else if (tipo === 'ontem') {
            i.setDate(i.getDate() - 1);
            f.setDate(f.getDate() - 1);
        }
        else if (tipo === '7dias') {
            i.setDate(i.getDate() - 6);
        }
        else if (tipo === '30dias') {
            i.setDate(i.getDate() - 29);
        }
        else if (tipo === 'esteMes') {
            i.setDate(1);
            f = new Date(f.getFullYear(), f.getMonth() + 1, 0);
        }
        else if (tipo === 'mesPassado') {
            i = new Date(i.getFullYear(), i.getMonth() - 1, 1);
            f = new Date(f.getFullYear(), f.getMonth(), 0);
        }
        else if (tipo === 'esteAno') {
            i = new Date(i.getFullYear(), 0, 1);
            f = new Date(f.getFullYear(), 11, 31);
        }
        else if (tipo === 'todos') {
            setInicio(null);
            setFim(null);
            setEtapa('inicio');
            return;
        }
        setInicio(i);
        setFim(f);
        setViewMes(f.getMonth());
        setViewAno(f.getFullYear());
        setEtapa('inicio');
    }
    // Calcula posição do painel relativa ao viewport (position: fixed)
    const calcularPosicao = useCallback(() => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setPanelPos({
                top: rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 380),
            });
        }
    }, []);
    function doConfirm() {
        aoMudarValor?.({ inicio, fim });
        setIsOpen(false);
    }
    const anosOptions = useMemo(() => {
        const min = new Date().getFullYear() - 10;
        const max = new Date().getFullYear() + 5;
        const opts = [];
        for (let a = min; a <= max; a++) {
            opts.push({ rotulo: String(a), valor: a });
        }
        return opts;
    }, []);
    const diasNoMes = useMemo(() => {
        const dias = [];
        const primeiroDia = new Date(viewAno, viewMes, 1).getDay();
        const qtdeDias = new Date(viewAno, viewMes + 1, 0).getDate();
        // Mes anterior
        const qtdeMesAnterior = new Date(viewAno, viewMes, 0).getDate();
        for (let i = primeiroDia - 1; i >= 0; i--) {
            dias.push({ data: new Date(viewAno, viewMes - 1, qtdeMesAnterior - i), atual: false });
        }
        // Mes atual
        for (let i = 1; i <= qtdeDias; i++) {
            dias.push({ data: new Date(viewAno, viewMes, i), atual: true });
        }
        // Proximo mes
        const faltam = 42 - dias.length;
        for (let i = 1; i <= faltam; i++) {
            dias.push({ data: new Date(viewAno, viewMes + 1, i), atual: false });
        }
        return dias;
    }, [viewAno, viewMes]);
    function mudaMes(diff) {
        let m = viewMes + diff;
        let a = viewAno;
        if (m > 11) {
            m = 0;
            a += 1;
        }
        else if (m < 0) {
            m = 11;
            a -= 1;
        }
        setViewMes(m);
        setViewAno(a);
    }
    const textoDisplay = (valor.inicio && valor.fim)
        ? `${formatarDataBR(valor.inicio)} a ${formatarDataBR(valor.fim)}`
        : valor.inicio ? formatarDataBR(valor.inicio) : '';
    return (_jsx(GeralCampoGlobal, { className: className, ...geralProps, children: _jsxs("div", { ref: containerRef, style: { position: 'relative' }, className: disabled ? 'ws-disabled' : '', children: [textoDisplay ? (_jsx(TooltipGlobal, { titulo: textoDisplay, descricao: "", children: _jsxs("div", { onClick: () => { if (!disabled) {
                            calcularPosicao();
                            setIsOpen(v => !v);
                        } }, className: `sg-campo ${isOpen ? 'sg-campo--aberto' : ''} ${disabled ? 'sg-campo--desabilitado' : ''}`, children: [_jsx("span", { className: "sg-icone-esquerda", "aria-hidden": "true", children: _jsx(CalendarBlank, { size: 16 }) }), _jsx("div", { className: "sg-valor", children: _jsx("span", { className: "sg-valor-selecionado", children: textoDisplay }) }), _jsxs("div", { className: "sg-acoes", children: [!disabled ? (_jsx("button", { title: "Limpar", className: "sg-btn-limpar", type: "button", onClick: e => {
                                            e.stopPropagation();
                                            setInicio(null);
                                            setFim(null);
                                            aoMudarValor?.({ inicio: null, fim: null });
                                        }, "aria-label": "Limpar sele\u00E7\u00E3o", tabIndex: -1, children: "\u2715" })) : null, _jsx("span", { className: `sg-chevron ${isOpen ? 'sg-chevron--aberto' : ''}`, "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }) })] })] }) })) : (_jsxs("div", { onClick: () => { if (!disabled) {
                        calcularPosicao();
                        setIsOpen(v => !v);
                    } }, className: `sg-campo ${isOpen ? 'sg-campo--aberto' : ''} ${disabled ? 'sg-campo--desabilitado' : ''}`, children: [_jsx("span", { className: "sg-icone-esquerda", "aria-hidden": "true", children: _jsx(CalendarBlank, { size: 16 }) }), _jsx("div", { className: "sg-valor", children: _jsx("span", { className: "sg-placeholder", children: defaultPlaceholder }) }), _jsx("div", { className: "sg-acoes", children: _jsx("span", { className: `sg-chevron ${isOpen ? 'sg-chevron--aberto' : ''}`, "aria-hidden": "true", children: _jsx("svg", { viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }) }) })] })), isOpen && (_jsxs("div", { className: "ws-calendario-panel", style: panelPos ? {
                        position: 'fixed',
                        top: panelPos.top,
                        left: panelPos.left,
                        zIndex: 9999,
                    } : undefined, children: [_jsxs("div", { className: "ws-calendario-sidebar", children: [_jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('hoje'), children: "Hoje" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('ontem'), children: "Ontem" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('7dias'), children: "\u00DAltimos 7 dias" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('30dias'), children: "\u00DAltimos 30 dias" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('esteMes'), children: "Este m\u00EAs" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('mesPassado'), children: "M\u00EAs passado" }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('esteAno'), children: "Este ano" }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { className: "ws-calendario-preset", onClick: () => aplicarPeriodo('todos'), style: { color: '#f87171' }, children: "Limpar per\u00EDodo" })] }), _jsxs("div", { className: "ws-calendario-body", children: [_jsxs("div", { className: "ws-calendario-header", children: [_jsx("button", { className: "ws-calendario-nav-btn", onClick: () => mudaMes(-1), children: _jsx(CaretLeft, { size: 16, weight: "bold" }) }), _jsxs("div", { className: "ws-calendario-selectors", children: [_jsx(SelectGlobal, { buscavel: false, valor: viewMes, opcoes: MESES_OPCOES, aoMudarValor: (val) => setViewMes(Number(val)) }), _jsx(SelectGlobal, { buscavel: false, valor: viewAno, opcoes: anosOptions, aoMudarValor: (val) => setViewAno(Number(val)) })] }), _jsx("button", { className: "ws-calendario-nav-btn", onClick: () => mudaMes(1), children: _jsx(CaretRight, { size: 16, weight: "bold" }) })] }), _jsxs("div", { className: "ws-calendario-grid", children: [DIAS_SEMANA.map(d => (_jsx("div", { className: "ws-calendario-day-name", children: d }, d))), diasNoMes.map((d, i) => {
                                            const dataTs = d.data.getTime();
                                            const iniTs = inicio?.getTime();
                                            const fimTs = fim?.getTime() || (hoverDate ? hoverDate.getTime() : iniTs);
                                            const isStart = iniTs === dataTs;
                                            const isEnd = fimTs === dataTs && fim !== null;
                                            let inRange = false;
                                            if (iniTs && fimTs) {
                                                const sortedIni = Math.min(iniTs, fimTs);
                                                const sortedFim = Math.max(iniTs, fimTs);
                                                if (dataTs >= sortedIni && dataTs <= sortedFim) {
                                                    inRange = true;
                                                }
                                            }
                                            let wrapperClass = 'ws-calendario-cell-wrapper';
                                            if (inRange) {
                                                if (iniTs === fimTs) {
                                                    wrapperClass += ' single-date';
                                                }
                                                else if (dataTs === Math.min(iniTs, fimTs)) {
                                                    wrapperClass += ' start-date';
                                                }
                                                else if (dataTs === Math.max(iniTs, fimTs)) {
                                                    wrapperClass += ' end-date';
                                                }
                                                else {
                                                    wrapperClass += ' in-range';
                                                }
                                            }
                                            let cellClass = 'ws-calendario-cell';
                                            if (!d.atual)
                                                cellClass += ' muted';
                                            if (isStart || isEnd)
                                                cellClass += ' active';
                                            return (_jsx("div", { className: wrapperClass, children: _jsx("button", { className: cellClass, onClick: () => handleDayClick(d.data), onMouseEnter: () => handleDayMouseEnter(d.data), children: d.data.getDate() }) }, i));
                                        })] }), _jsxs("div", { className: "ws-calendario-footer", children: [_jsx(BotaoGlobal, { variante: "fantasma", tamanho: "pequeno", onClick: () => setIsOpen(false), children: "Cancelar" }), _jsx(BotaoGlobal, { variante: "primario", tamanho: "pequeno", onClick: doConfirm, children: "Aplicar" })] })] })] }))] }) }));
}
