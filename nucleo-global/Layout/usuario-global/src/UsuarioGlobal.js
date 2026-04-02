import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { CaretDown, ShieldCheck, Gear, Sliders, Storefront, Moon, Sun, Robot, Sparkle, SignOut, Crown } from '@phosphor-icons/react';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import './usuario-global.css';

// ── Identidade Gravity ──────────────────────────────────────────────────────
const SUPER_ADMIN_EMAILS = ['dmmltda@gmail.com', 'admin@gravity.com.br'];

export function UsuarioGlobal({ userName, userEmail, userInitials, userRole, isLight, onToggleTheme, onNavigateWorkspace, onNavigateMarketPlace, onSignOut, isAdmin, isAdminPanel, onNavigateAdmin, onNavigateConfigurador, }) {
    const { t } = { t: (key, fallback) => fallback ?? key };
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    const isSuperAdminUser = SUPER_ADMIN_EMAILS.includes(userEmail);
    const displayRole = isSuperAdminUser ? 'Super Admin' : userRole;
    const hasAdminPrivileges = isSuperAdminUser || isAdmin;
    const canAccessWorkspace = userRole.toLowerCase() === 'master' || isSuperAdminUser;

    const roleSlug = {
        'admin':      'admin',
        'master':     'master',
        'standard':   'standard',
        'fornecedor': 'fornecedor',
        'supplier':   'fornecedor',
        'membro':     'standard',
        'member':     'standard',
    };
    const roleClass = isSuperAdminUser
        ? 'ws-global-user__role--super-admin'
        : `ws-global-user__role--${roleSlug[userRole.toLowerCase()] ?? 'default'}`;

    useEffect(() => {
        function handleClickOutside(event) {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return _jsxs("div", { className: "ws-global-user-wrap", ref: profileRef, children: [
        _jsx(TooltipGlobal, { titulo: "Perfil e Conta", descricao: "Gerencie prefer\u00EAncias de acesso e encerre sua sess\u00E3o", children:
            _jsxs("button", { className: `ws-global-user ${isSuperAdminUser ? 'ws-global-user--super-admin' : ''}`, type: "button", onClick: () => setIsProfileOpen(v => !v), "aria-expanded": isProfileOpen, children: [
                _jsx("div", { className: "ws-global-user__avatar", children: userInitials }),
                _jsxs("div", { className: "ws-global-user__info", children: [
                    _jsx("span", { className: "ws-global-user__name", children: userName }),
                    _jsx("span", { className: `ws-global-user__role ${roleClass}`, children: displayRole })
                ]}),
                _jsx(CaretDown, { weight: "bold", size: 14, className: "ws-global-caret" })
            ]})
        }),
        isProfileOpen && _jsxs("div", { className: `ws-profile-dropdown ${isSuperAdminUser ? 'ws-profile-dropdown--super-admin' : ''}`, children: [
            _jsxs("div", { className: "ws-profile-header", children: [
                _jsx("div", { className: "ws-profile-avatar-lg", children: userInitials }),
                _jsxs("div", { className: "ws-profile-details", children: [
                    _jsx("span", { className: "ws-profile-name", title: userName, children: userName }),
                    _jsx("span", { className: "ws-profile-email", title: userEmail, children: userEmail }),
                    _jsx("span", { className: `ws-profile-badge ${isSuperAdminUser ? 'ws-profile-badge--super-admin' : ''}`, children: displayRole })
                ]})
            ]}),
            _jsx("div", { className: "ws-profile-separator" }),
            _jsxs("div", { className: "ws-profile-section", children: [
                _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [
                    _jsx(ShieldCheck, { weight: "duotone", size: 16 }), " Seguran\u00E7a e Acesso",
                    _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })
                ]}),
                _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [
                    _jsx(Gear, { weight: "duotone", size: 16 }), " Prefer\u00EAncias",
                    _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })
                ]})
            ]}),
            _jsx("div", { className: "ws-profile-separator" }),
            _jsxs("div", { className: "ws-profile-section", children: [
                !isAdminPanel && _jsxs(_Fragment, { children: [
                    canAccessWorkspace
                        ? _jsxs("button", { className: "ws-profile-item", type: "button", onClick: () => { onNavigateWorkspace(); setIsProfileOpen(false); }, children: [
                            _jsx(Sliders, { weight: "duotone", size: 16 }), " Configurador"
                          ]})
                        : _jsx(TooltipGlobal, { titulo: "Acesso Restrito", descricao: "Apenas usu\u00E1rios Master podem gerenciar a organiza\u00E7\u00E3o.", children:
                            _jsxs("button", { className: "ws-profile-item disabled-item", type: "button", children: [
                                _jsx(Sliders, { weight: "duotone", size: 16 }), " Configurador"
                            ]})
                          }),
                    _jsxs("button", { className: "ws-profile-item", type: "button", onClick: () => { onNavigateMarketPlace(); setIsProfileOpen(false); }, children: [
                        _jsx(Storefront, { weight: "duotone", size: 16 }), " Ir para Market Place"
                    ]}),
                    hasAdminPrivileges && _jsxs("button", { className: "ws-profile-item ws-profile-item--admin", type: "button", onClick: () => { if (onNavigateAdmin) onNavigateAdmin(); setIsProfileOpen(false); }, children: [
                        _jsx(Crown, { weight: "duotone", size: 16 }), " Acesso ao Admin"
                    ]})
                ]}),
                isAdminPanel && hasAdminPrivileges && _jsxs("button", { className: "ws-profile-item ws-profile-item--configurador", type: "button", onClick: () => { if (onNavigateConfigurador) onNavigateConfigurador(); setIsProfileOpen(false); }, children: [
                    _jsx(Gear, { weight: "duotone", size: 16 }), " Acesso ao Configurador"
                ]})
            ]}),
            _jsx("div", { className: "ws-profile-separator" }),
            _jsxs("div", { className: "ws-profile-section", children: [
                _jsxs("button", { className: "ws-profile-item", type: "button", onClick: () => { onToggleTheme(); setIsProfileOpen(false); }, children: [
                    isLight ? _jsx(Moon, { weight: "duotone", size: 16 }) : _jsx(Sun, { weight: "duotone", size: 16 }),
                    "Alternar para Tema ", isLight ? 'Escuro' : 'Claro'
                ]}),
                _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [
                    _jsx(Robot, { weight: "duotone", size: 16 }), " Central de Ajuda",
                    _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })
                ]}),
                _jsxs("button", { className: "ws-profile-item", type: "button", disabled: true, children: [
                    _jsx(Sparkle, { weight: "duotone", size: 16 }), " Novidades",
                    _jsx("span", { className: "ws-profile-badge-soon", children: "Em breve" })
                ]})
            ]}),
            _jsx("div", { className: "ws-profile-separator" }),
            _jsx("div", { className: "ws-profile-section", children:
                _jsxs("button", { className: "ws-profile-item ws-profile-item--danger", type: "button", onClick: onSignOut, children: [
                    _jsx(SignOut, { weight: "duotone", size: 16 }), " Sair do Sistema"
                ]})
            })
        ]})
    ]});
}
