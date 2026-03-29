import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
/**
 * Carregamento lazy por módulo.
 *
 * Cada rota aponta para o client do serviço de tenant ou produto correspondente.
 * Os paths dos imports serão ajustados pelo Coordenador quando os módulos
 * da Onda 3 forem integrados.
 *
 * REGRA: nunca importar código de produto aqui — apenas wrappers lazy.
 * Produto integra via react-router-dom e seu próprio entry point.
 */
// Placeholder enquanto módulos da Onda 3 não estão disponíveis
function ModulePlaceholder({ name }) {
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '1rem',
            color: 'var(--text-muted)',
        }, children: [_jsx("div", { style: {
                    width: 48,
                    height: 48,
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-surface)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                }, "aria-hidden": "true", children: "\uD83E\uDDE9" }), _jsxs("p", { style: { fontSize: '0.875rem' }, children: ["M\u00F3dulo ", _jsx("strong", { style: { color: 'var(--text-secondary)' }, children: name }), " \u2014 Onda 3"] })] }));
}
// Onda 3 — Serviços de tenant (stubs lazy)
const DashboardModule = lazy(() => import('@tenant/dashboard/src/Dashboard'));
const RelatoriosModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Relat\u00F3rios" }) }));
const EmailModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Email" }) }));
const WhatsAppModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "WhatsApp" }) }));
const NotificacoesModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Notifica\u00E7\u00F5es" }) }));
const AtividadesModule = lazy(() => import('@tenant/atividades/src/Atividades'));
const CronometroModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Cron\u00F4metro" }) }));
const HistoricoModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Hist\u00F3rico" }) }));
// Onda 3 — Serviços de produto (stubs lazy)
const GabiModule = lazy(() => import('@tenant/gabi/src/Gabi'));
const HelpdeskModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Helpdesk" }) }));
const ConectorErpModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Conector ERP" }) }));
// Configurador — Onda 2
const ConfiguradorModule = lazy(() => Promise.resolve({ default: () => _jsx(ModulePlaceholder, { name: "Configura\u00E7\u00F5es" }) }));
function LoadingFallback() {
    const { t } = useTranslation();
    return (_jsx("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
        }, children: t('shell.carregando_modulo') }));
}
function NotFoundPage() {
    const { t } = useTranslation();
    return (_jsxs("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            gap: '0.75rem',
            color: 'var(--text-muted)',
        }, children: [_jsx("p", { style: { fontSize: '2rem', fontWeight: 700 }, children: "404" }), _jsx("p", { style: { fontSize: '0.875rem' }, children: t('shell.pagina_nao_encontrada') })] }));
}
/**
 * Navigation — define todas as rotas lazy do app.
 *
 * Este componente é renderizado dentro do <main> do Layout.
 * O BrowserRouter deve ser montado no entry point raiz da aplicação.
 */
export function Navigation() {
    return (_jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsx(Route, { path: "/dashboard/*", element: _jsx(DashboardModule, {}) }), _jsx(Route, { path: "/relatorios/*", element: _jsx(RelatoriosModule, {}) }), _jsx(Route, { path: "/email/*", element: _jsx(EmailModule, {}) }), _jsx(Route, { path: "/whatsapp/*", element: _jsx(WhatsAppModule, {}) }), _jsx(Route, { path: "/notificacoes/*", element: _jsx(NotificacoesModule, {}) }), _jsx(Route, { path: "/atividades/*", element: _jsx(AtividadesModule, {}) }), _jsx(Route, { path: "/cronometro/*", element: _jsx(CronometroModule, {}) }), _jsx(Route, { path: "/historico/*", element: _jsx(HistoricoModule, {}) }), _jsx(Route, { path: "/gabi/*", element: _jsx(GabiModule, {}) }), _jsx(Route, { path: "/helpdesk/*", element: _jsx(HelpdeskModule, {}) }), _jsx(Route, { path: "/conector-erp/*", element: _jsx(ConectorErpModule, {}) }), _jsx(Route, { path: "/configurador/*", element: _jsx(ConfiguradorModule, {}) }), _jsx(Route, { path: "/store/*", element: _jsx(ConfiguradorModule, {}) }), _jsx(Route, { path: "*", element: _jsx(NotFoundPage, {}) })] }) }));
}
