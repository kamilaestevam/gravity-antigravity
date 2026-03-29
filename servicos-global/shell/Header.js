import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MagnifyingGlass, Info, } from '@phosphor-icons/react';
import { useShellStore } from './store';
import { AvisoInternoGlobal } from '@nucleo/mensageria-global';
import { UsuarioGlobal } from '@nucleo/usuario-global';
const AVISOS_MOCK = [
    {
        id: '1',
        conteudo: 'Bem-vindo ao SimulaCusto! Configure seus parâmetros de custo antes de iniciar.',
        autor: { nome: 'Sistema' },
        dataHora: new Date().toLocaleString('pt-BR'),
        lido: false,
        tipo: 'sistema',
    },
    {
        id: '2',
        conteudo: 'Sua simulação #SC-042 foi concluída com sucesso e está disponível para revisão.',
        autor: { nome: 'SimulaCusto' },
        dataHora: new Date(Date.now() - 3600_000).toLocaleString('pt-BR'),
        lido: false,
        tipo: 'aviso',
    },
];
/**
 * Mapa de rota → label de breadcrumb
 * Expandir conforme novos módulos forem integrados (Onda 3+)
 */
const ROUTE_LABELS = {
    '/dashboard': 'Dashboard',
    '/relatorios': 'Relatórios',
    '/email': 'Email',
    '/whatsapp': 'WhatsApp',
    '/notificacoes': 'Notificações',
    '/atividades': 'Atividades',
    '/cronometro': 'Cronômetro',
    '/historico': 'Histórico',
    '/gabi': 'Gabi IA',
    '/helpdesk': 'Helpdesk',
    '/conector-erp': 'Conector ERP',
    '/configurador': 'Configurações',
};
function getPageLabel(pathname) {
    // Correspondência exata
    if (ROUTE_LABELS[pathname])
        return ROUTE_LABELS[pathname];
    // Correspondência por prefixo (ex: /atividades/123)
    const base = '/' + pathname.split('/')[1];
    return ROUTE_LABELS[base] ?? 'Gravity';
}
/**
 * Header — barra superior do shell.
 *
 * Exibe:
 * - Botão toggle da sidebar
 * - Breadcrumb da rota atual
 * - Botão de busca (evento, sem lógica de produto)
 * - Toggle de tema dark/light
 * - Badge de notificações pendentes
 *
 * Info de usuário/tenant exibida na sidebar (footer).
 * Nunca contém lógica de produto.
 */
export function Header() {
    const location = useLocation();
    const { toggleSidebar, toggleTheme, currentTheme, tooltipsDisabled, toggleTooltips, currentUser, clearCurrentUser, } = useShellStore();
    const [avisos, setAvisos] = useState(AVISOS_MOCK);
    const pageLabel = getPageLabel(location.pathname);
    const handleMarcarLido = (id) => {
        setAvisos(prev => prev.map(a => a.id === id ? { ...a, lido: true } : a));
    };
    const handleMarcarTodosLidos = () => {
        setAvisos(prev => prev.map(a => ({ ...a, lido: true })));
    };
    const handleCriarAviso = (texto) => {
        const novo = {
            id: `aviso-${Date.now()}`,
            conteudo: texto,
            autor: { nome: 'Você' },
            dataHora: new Date().toLocaleString('pt-BR'),
            lido: false,
            tipo: 'aviso',
        };
        setAvisos(prev => [novo, ...prev]);
    };
    const initials = currentUser.name
        ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';
    return (_jsx("header", { className: "shell-header", role: "banner", children: _jsxs("div", { className: "shell-header__right", children: [_jsx("button", { className: "shell-header__icon-btn", "aria-label": "Busca global", title: "Busca global", type: "button", onClick: () => {
                        window.dispatchEvent(new CustomEvent('shell:global-search'));
                    }, children: _jsx(MagnifyingGlass, { size: 18 }) }), _jsx("button", { className: "shell-header__icon-btn", "aria-label": tooltipsDisabled ? 'Habilitar dicas (tooltips)' : 'Desabilitar dicas (tooltips)', title: tooltipsDisabled ? 'Habilitar dicas' : 'Desabilitar dicas', type: "button", onClick: toggleTooltips, style: { color: tooltipsDisabled ? 'var(--text-muted)' : 'var(--accent)' }, children: _jsx(Info, { size: 18, weight: tooltipsDisabled ? 'regular' : 'fill' }) }), _jsx("div", { className: "shell-header__icon-btn", style: { padding: 0, background: 'none', border: 'none' }, children: _jsx(AvisoInternoGlobal, { avisos: avisos, onMarcarLido: handleMarcarLido, onMarcarTodosLidos: handleMarcarTodosLidos, onCriarAviso: handleCriarAviso }) }), _jsx("div", { style: { width: '1px', height: '24px', background: 'var(--bg-elevated)', margin: '0 0.25rem' } }), _jsx(UsuarioGlobal, { userName: currentUser.name || 'Usuário', userEmail: currentUser.email || 'usuario@gravity.com.br', userInitials: initials, userRole: "Membro", isLight: currentTheme === 'light', onToggleTheme: toggleTheme, onNavigateOrganizacao: () => console.log('Navegar para Organização'), onNavigateAssinaturas: () => console.log('Navegar para Assinaturas'), onSignOut: () => {
                        clearCurrentUser();
                        window.location.href = '/';
                    }, isAdmin: currentUser.email === 'admin@gravity.com.br', onNavigateAdmin: () => window.location.href = '/admin' })] }) }));
}
