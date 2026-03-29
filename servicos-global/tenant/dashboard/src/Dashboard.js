import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChartBar, Warehouse, Users, Target, ChartPieSlice, ArrowsClockwise, WarningCircle, Clock, Briefcase, Headset, } from '@phosphor-icons/react';
import { PaginaGlobal } from '@nucleo/pagina-global';
import { CabecalhoGlobal } from '@nucleo/cabecalho-global';
import { CardBasicoGlobal, CardGraficoGlobal } from '@nucleo/card-global';
import { BotaoGlobal } from '@nucleo/botao-global';
// ─── Componente Principal ─────────────────────────────────────────────────────
export const Dashboard = () => {
    const navigate = useNavigate();
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState(null);
    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setErro(null);
        try {
            const res = await fetch('/api/v1/dashboard/kpis?tenant_id=tenant-1');
            if (!res.ok)
                throw new Error(`Status: ${res.status}`);
            const { data } = await res.json();
            setKpis(data);
        }
        catch (err) {
            setErro(err.message || 'Erro ao carregar dados');
        }
        finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { fetchDashboard(); }, [fetchDashboard]);
    if (loading)
        return _jsx("div", { style: { padding: '2rem', color: 'var(--ws-muted)' }, children: "Carregando vis\u00E3o geral..." });
    const crm = kpis?.crm;
    const statsContent = (_jsxs(_Fragment, { children: [_jsx(CardBasicoGlobal, { titulo: "Total de Empresas", icone: _jsx(Warehouse, { weight: "duotone", size: 16 }), valor: crm?.totalEmpresas ?? 0, periodos: [{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] }), _jsx(CardBasicoGlobal, { titulo: "Clientes Ativos", icone: _jsx(Users, { weight: "duotone", size: 16 }), valor: crm?.clientesAtivos ?? 0, variante: "sucesso", periodos: [{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] }), _jsx(CardBasicoGlobal, { titulo: "Leads no Funil", icone: _jsx(Target, { weight: "duotone", size: 16 }), valor: crm?.leadsFunil ?? 0, variante: "aviso", periodos: [{ periodo: '30d', rotulo: 'Este mês', valor: '+0%', direcao: 'up' }] }), _jsx(CardBasicoGlobal, { titulo: "Novos este M\u00EAs", icone: _jsx(Briefcase, { weight: "duotone", size: 16 }), valor: crm?.novosEsteMes ?? 0, periodos: [{ periodo: '30d', rotulo: '30 dias', valor: '+0%', direcao: 'up' }] })] }));
    return (_jsxs(PaginaGlobal, { layout: "lista", cabecalho: _jsx(CabecalhoGlobal, { titulo: "Dashboard Consolidado", subtitulo: "O que precisa acontecer hoje \u2014 e quem \u00E9 o respons\u00E1vel por fazer acontecer.", icone: _jsx(ChartBar, { weight: "duotone", size: 22, color: "#818cf8" }) }), stats: statsContent, acoes: _jsx(BotaoGlobal, { variante: "fantasma", tamanho: "pequeno", icone: _jsx(ArrowsClockwise, {}), onClick: fetchDashboard, children: "Atualizar" }), children: [_jsxs("div", { className: "db-grid-container", children: [_jsxs("div", { className: "db-col db-col-main", children: [_jsxs("div", { className: "db-panel", children: [_jsx("div", { className: "db-panel-header", children: _jsxs("span", { className: "db-panel-title", children: [_jsx(Target, { weight: "duotone", size: 18 }), " Funil de Vendas"] }) }), _jsx("div", { className: "db-funnel-container", children: crm?.funil.map((item, idx) => (_jsxs("div", { className: "db-funnel-row", children: [_jsxs("div", { className: "db-funnel-label", children: [_jsx("span", { children: item.etapa }), _jsx("strong", { children: item.valor })] }), _jsx("div", { className: "db-funnel-bar-bg", children: _jsx("div", { className: "db-funnel-bar-fill", style: {
                                                            width: `${(item.valor / item.meta) * 100}%`,
                                                            opacity: 1 - (idx * 0.15)
                                                        } }) })] }, idx))) })] }), _jsxs("div", { className: "db-panel", children: [_jsx("div", { className: "db-panel-header", children: _jsxs("span", { className: "db-panel-title", children: [_jsx(Headset, { weight: "duotone", size: 18 }), " Chamados & Help Desk"] }) }), _jsxs("div", { className: "db-helpdesk-grid", children: [_jsxs("div", { className: "db-hd-card hd-danger", children: [_jsx("span", { className: "hd-value", children: crm?.helpDesk.abertos }), _jsx("span", { className: "hd-label", children: "Abertos" })] }), _jsxs("div", { className: "db-hd-card hd-warning", children: [_jsx("span", { className: "hd-value", children: crm?.helpDesk.emAndamento }), _jsx("span", { className: "hd-label", children: "Em Andamento" })] }), _jsxs("div", { className: "db-hd-card hd-info", children: [_jsx("span", { className: "hd-value", children: crm?.helpDesk.tempoMedio }), _jsx("span", { className: "hd-label", children: "Tempo M\u00E9dio" })] })] })] })] }), _jsxs("div", { className: "db-col db-col-side", children: [_jsxs("div", { className: "db-panel", children: [_jsx("div", { className: "db-panel-header", children: _jsxs("span", { className: "db-panel-title", children: [_jsx(ChartPieSlice, { weight: "duotone", size: 18 }), " Health Score"] }) }), _jsx(CardGraficoGlobal, { titulo: "Sa\u00FAde da Base", total: crm?.healthScore.total ?? 0, valorPrincipal: crm?.healthScore.saudavel ?? 0, corGauge: "#10b981", legenda: [
                                            { label: 'Saudável', valor: crm?.healthScore.saudavel ?? 0, cor: '#10b981' },
                                            { label: 'Atenção', valor: crm?.healthScore.atencao ?? 0, cor: '#fbbf24' },
                                            { label: 'Risco', valor: crm?.healthScore.risco ?? 0, cor: '#ef4444' },
                                        ] })] }), _jsxs("div", { className: "db-panel db-panel-warning", children: [_jsx("div", { className: "db-panel-header", children: _jsxs("span", { className: "db-panel-title", children: [_jsx(WarningCircle, { weight: "fill", size: 16 }), " Alertas Cr\u00EDticos"] }) }), _jsxs("div", { className: "db-warning-content", children: [_jsx("p", { children: "Nenhum chamado cr\u00EDtico aberto no momento." }), _jsxs("span", { className: "db-time", children: [_jsx(Clock, { weight: "bold" }), " Sincronizado agora"] })] })] })] })] }), _jsx("style", { children: `
        .db-grid-container { display: grid; grid-template-columns: 1fr 340px; gap: 1.5rem; margin-top: 1.5rem; padding-bottom: 2rem; }
        .db-col { display: flex; flex-direction: column; gap: 1.5rem; }
        .db-panel { background: var(--ws-surface, #1e293b); border: 1px solid var(--ws-accent-border, rgba(129,140,248,0.15)); border-radius: 16px; padding: 1.5rem; }
        .db-panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .db-panel-title { font-size: 0.875rem; font-weight: 700; color: var(--ws-text, #f1f5f9); display: flex; align-items: center; gap: 0.5rem; }
        
        .db-funnel-container { display: flex; flex-direction: column; gap: 1rem; }
        .db-funnel-row { display: flex; flex-direction: column; gap: 0.5rem; }
        .db-funnel-label { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--ws-muted); }
        .db-funnel-label strong { color: var(--ws-text); }
        .db-funnel-bar-bg { background: rgba(129, 140, 248, 0.1); height: 8px; border-radius: 4px; overflow: hidden; }
        .db-funnel-bar-fill { background: var(--ws-accent, #818cf8); height: 100%; border-radius: 4px; transition: width 0.5s ease; }

        .db-helpdesk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .db-hd-card { padding: 1rem; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(129, 140, 248, 0.05); border: 1px solid rgba(129,140,248,0.1); }
        .hd-value { font-size: 1.5rem; font-weight: 700; color: var(--ws-text); }
        .hd-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; color: var(--ws-muted); margin-top: 0.25rem; }
        .hd-danger .hd-value { color: #f87171; }
        .hd-warning .hd-value { color: #fbbf24; }
        .hd-info .hd-value { color: #60a5fa; }

        .db-panel-warning { border-left: 4px solid #f59e0b; }
        .db-warning-content p { font-size: 0.8125rem; color: var(--ws-text); line-height: 1.4; }
        .db-time { font-size: 0.7rem; color: var(--ws-muted); display: flex; align-items: center; gap: 0.3rem; margin-top: 0.5rem; }
      ` })] }));
};
export default Dashboard;
