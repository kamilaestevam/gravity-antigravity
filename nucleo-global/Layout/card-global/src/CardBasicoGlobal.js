import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowRight } from '@phosphor-icons/react';
import './card.css';
const DEFAULT_PERIODO = '30d';
/**
 * CardBasicoGlobal — Card de métrica numérica do Gravity Design System
 *
 * Exibe título, ícone, valor em destaque, tendência com seletor de período
 * interativo (7d / 30d / 6m / 1a), subtexto e um tooltip CSS-only ao hover.
 *
 * @example
 * <CardBasicoGlobal
 *   titulo="Total de Filhas"
 *   icone={<TreeStructure weight="duotone" size={16} />}
 *   valor={30}
 *   periodos={[
 *     { periodo: '7d',  rotulo: '7 dias',   valor: '+1', direcao: 'up'      },
 *     { periodo: '30d', rotulo: '30 dias',  valor: '+5%', direcao: 'up'     },
 *     { periodo: '6m',  rotulo: '6 meses',  valor: '+12%', direcao: 'up'    },
 *     { periodo: '1a',  rotulo: '1 ano',    valor: '+30%', direcao: 'up'    },
 *   ]}
 *   tooltip={<><p className="cg-tooltip__title">Detalhe</p>...</>}
 * />
 */
export function CardBasicoGlobal({ titulo, valor, tendencia, periodos, subtexto, icone, variante = 'padrao', alinhamento = 'esquerda', className = '', tooltip, }) {
    const [periodoAtivo, setPeriodoAtivo] = useState(DEFAULT_PERIODO);
    const [showPicker, setShowPicker] = useState(false);
    // Resolve a tendência ativa: periodos tem prioridade sobre tendencia estática
    const tendenciaAtiva = periodos
        ? (periodos.find(p => p.periodo === periodoAtivo) ?? periodos[0])
        : tendencia;
    const cls = [
        'cg-card',
        variante !== 'padrao' ? `cg-card--${variante}` : '',
        `cg-card--align-${alinhamento}`,
        tooltip ? 'cg-card--has-tooltip' : '',
        className,
    ].filter(Boolean).join(' ');
    function TrendArrow({ direcao }) {
        if (direcao === 'up')
            return _jsx(ArrowUp, { size: 13, weight: "bold" });
        if (direcao === 'down')
            return _jsx(ArrowDown, { size: 13, weight: "bold" });
        return _jsx(ArrowRight, { size: 13, weight: "bold" });
    }
    return (_jsxs("div", { className: cls, children: [_jsxs("div", { className: "cg-card__header", children: [icone && _jsx("div", { className: "cg-card__icon-wrap", children: icone }), _jsx("p", { className: "cg-card__label", children: titulo })] }), _jsxs("div", { className: "cg-card__body", children: [_jsxs("div", { className: "cg-card__value-row", children: [_jsx("span", { className: "cg-card__value", children: valor }), tendenciaAtiva && (_jsxs("div", { className: `cg-card__trend-wrap${periodos ? ' cg-card__trend-wrap--interactive' : ''}`, onMouseEnter: () => periodos && setShowPicker(true), onMouseLeave: () => periodos && setShowPicker(false), children: [_jsxs("span", { className: `cg-card__trend cg-card__trend--${tendenciaAtiva.direcao}`, children: [_jsx(TrendArrow, { direcao: tendenciaAtiva.direcao }), tendenciaAtiva.valor] }), periodos && showPicker && (_jsxs("div", { className: "cg-period-picker", children: [_jsx("p", { className: "cg-period-picker__label", children: "Comparar com per\u00EDodo" }), _jsx("div", { className: "cg-period-picker__options", children: periodos.map((p) => (_jsxs("button", { className: `cg-period-picker__btn${periodoAtivo === p.periodo ? ' cg-period-picker__btn--active' : ''}`, onClick: (e) => {
                                                        e.stopPropagation();
                                                        setPeriodoAtivo(p.periodo);
                                                    }, children: [p.rotulo, _jsxs("span", { className: `cg-period-picker__val cg-period-picker__val--${p.direcao}`, children: [_jsx(TrendArrow, { direcao: p.direcao }), p.valor] })] }, p.periodo))) })] }))] }))] }), subtexto && (_jsx("div", { className: "cg-card__subtext", children: subtexto }))] }), tooltip && (_jsxs("div", { className: "cg-card__tooltip", children: [_jsxs("div", { className: "cg-tooltip__header", children: [icone && _jsx("span", { className: "cg-tooltip__header-icon", children: icone }), _jsx("p", { className: "cg-tooltip__title", children: titulo })] }), _jsx("div", { className: "cg-tooltip__divider" }), tooltip] }))] }));
}
