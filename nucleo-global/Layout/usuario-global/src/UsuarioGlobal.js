import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { CaretDown, ShieldCheck, Gear, Buildings, CreditCard, Moon, Sun, Robot, Sparkle, SignOut, Crown } from '@phosphor-icons/react';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import './usuario-global.css';
export function UsuarioGlobal({ userName, userEmail, userInitials, userRole, isLight, onToggleTheme, onNavigateOrganizacao, onNavigateAssinaturas, onSignOut, isAdmin, isAdminPanel, onNavigateAdmin, onNavigateConfigurador, }) {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);
    // ── Inteligência de Identidade ──────────────────────────────────────────
    // Centralizamos aqui quem é Super Admin da plataforma Gravity
    const SUPER_ADMIN_EMAILS = ['dmmltda@gmail.com', 'admin@gravity.com.br'];
    const isSuperAdminUser = SUPER_ADMIN_EMAILS.includes(userEmail);
    // O papel exibido e o acesso administrativo são calculados aqui
    const displayRole = isSuperAdminUser ? 'Super Admin' : userRole;
    const hasAdminPrivileges = isSuperAdminUser || isAdmin;
    // Estilos específicos para Super Admin (Verde Platinum)
    // Caso contrário, mantemos os estilos padrão (Master/Violet/Muted)
    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    return (_jsxs("div", { className: "ws-global-user-wrap", ref: profileRef, children: [_jsx(TooltipGlobal, { titulo: "Perfil e Conta", descricao: "Gerencie prefer\u00EAncias de acesso e encerre sua sess\u00E3o", children: _jsxs("button", { className: `ws-global-user ${isSuperAdminUser ? 'ws-global-user--super-admin' : ''}`, type: "button", onClick: () => setIsProfileOpen(v => !v), "aria-expanded": isProfileOpen, children: [_jsx("div", { className: "ws-global-user__avatar", children: userInitials }), _jsxs("div", { className: "ws-global-user__info", children: [_jsx("span", { className: "ws-global-user__name", children: userName }), _jsx("span", { className: "ws-global-user__role", children: displayRole })] }), _jsx(CaretDown, { weight: "bold", size: 14, className: "ws-global-caret" })] }) }), isProfileOpen && (_jsxs("div", { className: `ws-profile-dropdown ${isSuperAdminUser ? 'ws-profile-dropdown--super-admin' : ''}`, children: [_jsxs("div", { className: "ws-profile-header", children: [_jsx("div", { className: "ws-profile-avatar-lg", children: userInitials }), _jsxs("div", { className: "ws-profile-details", children: [_jsx("span", { className: "ws-profile-name", title: userName, children: userName }), _jsx("span", { className: "ws-profile-email", title: userEmail, children: userEmail }), _jsx("span", { className: "ws-profile-badge", children: displayRole })] })] }), _jsx("div", { className: "ws-profile-separator" }), _jsxs("div", { className: "ws-profile-section", children: [_jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [_jsx(ShieldCheck, { weight: "duotone", size: 16 }), " Seguran\u00E7a e Acesso", _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })] }), _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [_jsx(Gear, { weight: "duotone", size: 16 }), " Prefer\u00EAncias", _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })] })] }), _jsx("div", { className: "ws-profile-separator" }), _jsxs("div", { className: "ws-profile-section", children: [!isAdminPanel && (_jsxs(_Fragment, { children: [displayRole !== 'Master' && !isSuperAdminUser ? (_jsx(TooltipGlobal, { titulo: "Acesso Restrito", descricao: "Apenas usu\u00E1rios Master podem gerenciar a organiza\u00E7\u00E3o.", children: _jsxs("button", { className: "ws-profile-item disabled-item", type: "button", style: { width: '100%', opacity: 0.5, cursor: 'not-allowed' }, children: [_jsx(Buildings, { weight: "duotone", size: 16 }), " Gerenciar Organiza\u00E7\u00E3o"] }) })) : (_jsxs("button", { className: "ws-profile-item", type: "button", onClick: () => {
                                            onNavigateOrganizacao();
                                            setIsProfileOpen(false);
                                        }, children: [_jsx(Buildings, { weight: "duotone", size: 16 }), " Gerenciar Organiza\u00E7\u00E3o"] })), displayRole !== 'Master' && !isSuperAdminUser ? (_jsx(TooltipGlobal, { titulo: "Acesso Restrito", descricao: "Apenas usu\u00E1rios Master podem gerenciar assinaturas.", children: _jsxs("button", { className: "ws-profile-item disabled-item", type: "button", style: { width: '100%', opacity: 0.5, cursor: 'not-allowed', marginTop: '0.125rem' }, children: [_jsx(CreditCard, { weight: "duotone", size: 16 }), " Assinaturas e Recibos"] }) })) : (_jsxs("button", { className: "ws-profile-item", type: "button", style: { marginTop: '0.125rem' }, onClick: () => {
                                            onNavigateAssinaturas();
                                            setIsProfileOpen(false);
                                        }, children: [_jsx(CreditCard, { weight: "duotone", size: 16 }), " Assinaturas e Recibos"] }))] })), hasAdminPrivileges && !isAdminPanel && (_jsxs("button", { className: "ws-profile-item ws-profile-item--admin", type: "button", style: { marginTop: '0.125rem' }, onClick: () => {
                                    if (onNavigateAdmin)
                                        onNavigateAdmin();
                                    setIsProfileOpen(false);
                                }, children: [_jsx(Crown, { weight: "duotone", size: 16 }), " Acesso ao Admin"] })), hasAdminPrivileges && isAdminPanel && (_jsxs("button", { className: "ws-profile-item ws-profile-item--configurador", type: "button", style: { marginTop: '0.125rem' }, onClick: () => {
                                    if (onNavigateConfigurador)
                                        onNavigateConfigurador();
                                    setIsProfileOpen(false);
                                }, children: [_jsx(Gear, { weight: "duotone", size: 16 }), " Acesso ao Configurador"] }))] }), _jsx("div", { className: "ws-profile-separator" }), _jsxs("div", { className: "ws-profile-section", children: [_jsxs("button", { className: "ws-profile-item", type: "button", onClick: () => {
                                    onToggleTheme();
                                    setIsProfileOpen(false);
                                }, children: [isLight ? _jsx(Moon, { weight: "duotone", size: 16 }) : _jsx(Sun, { weight: "duotone", size: 16 }), "Alternar para Tema ", isLight ? 'Escuro' : 'Claro'] }), _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [_jsx(Robot, { weight: "duotone", size: 16 }), " Central de Ajuda", _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })] }), _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [_jsx(Sparkle, { weight: "duotone", size: 16 }), " Novidades", _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })] })] }), _jsx("div", { className: "ws-profile-separator" }), _jsx("div", { className: "ws-profile-section", children: _jsxs("button", { className: "ws-profile-item ws-profile-item--danger", type: "button", onClick: onSignOut, children: [_jsx(SignOut, { weight: "duotone", size: 16 }), " Sair do Sistema"] }) })] }))] }));
}
