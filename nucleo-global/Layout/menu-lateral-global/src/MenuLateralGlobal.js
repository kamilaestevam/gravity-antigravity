import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { SidebarSimple, CaretDown, Lock } from '@phosphor-icons/react';
import { LogoGlobal } from '@nucleo/logo-global';
import { TooltipGlobal } from '@nucleo/tooltip-global';
import './menu-lateral.css';
export function MenuLateralGlobal({ tenantName, tenantPlan, navItems, moduleName = 'Configurador', moduleColor = '#818cf8', defaultCollapsed = false, isCollapsed: controlledIsCollapsed, onToggleCollapse }) {
    const [internalCollapsed, setInternalCollapsed] = useState(defaultCollapsed);
    const [expandedItems, setExpandedItems] = useState({});
    const location = useLocation();
    const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : internalCollapsed;
    const toggleCollapse = () => {
        if (onToggleCollapse) {
            onToggleCollapse();
        }
        else {
            setInternalCollapsed((prev) => !prev);
        }
    };
    const toggleSubmenu = (label, currentExpandedState) => {
        setExpandedItems(prev => ({
            ...prev,
            [label]: !currentExpandedState
        }));
    };
    const cssVars = {
        '--mlg-accent': moduleColor,
        '--mlg-accent-dim': `${moduleColor}1f`,
        '--mlg-accent-border': `${moduleColor}33`,
    };
    const renderNavItem = (item, isSubmenu = false) => {
        // ── Divisor de seção ──
        if (item.sectionDivider) {
            if (isCollapsed)
                return _jsx("div", { className: "mlg-nav-spacer" }, item.label);
            return _jsx("p", { className: "mlg-nav-label mlg-nav-section-label", children: item.label }, item.label);
        }
        const hasChildren = item.children && item.children.length > 0;
        const initiallyExpanded = hasChildren && item.children?.some(child => location.pathname === child.to);
        const isExpanded = expandedItems[item.label] !== undefined ? expandedItems[item.label] : initiallyExpanded;
        // Se for um item com submenus
        if (hasChildren) {
            return (_jsxs("div", { className: `mlg-nav-group ${isExpanded ? 'active' : ''}`, children: [_jsxs("button", { className: `mlg-nav-item mlg-nav-parent ${isExpanded ? 'expanded' : ''}`, onClick: () => toggleSubmenu(item.label, isExpanded), children: [_jsx("div", { className: "mlg-nav-icon", children: item.icon }), !isCollapsed && (_jsxs(_Fragment, { children: [_jsx("span", { className: "mlg-nav-text", children: item.label }), _jsx(CaretDown, { className: `mlg-nav-chevron ${isExpanded ? 'open' : ''}`, size: 14, weight: "bold" })] }))] }), !isCollapsed && (_jsx("div", { className: `mlg-submenu ${isExpanded ? 'open' : ''}`, children: item.children?.map(child => renderNavItem(child, true)) }))] }, item.label));
        }

        // Conteúdo de texto (nome + badge opcional em coluna)
        const textContent = !isCollapsed ? (
            item.badge ? (
                _jsxs("div", { className: "mlg-nav-content", children: [
                    _jsx("span", { className: "mlg-nav-text", children: item.label }),
                    _jsx("span", { className: `mlg-nav-badge ${item.badgeVariant === 'accent' ? 'mlg-nav-badge--accent' : 'mlg-nav-badge--muted'}`, children: item.badge })
                ]})
            ) : (
                _jsx("span", { className: "mlg-nav-text", children: item.label })
            )
        ) : null;

        // Item normal (link)
        const navLink = item.disabled ? (
            _jsxs("div", { className: `mlg-nav-item mlg-disabled ${isSubmenu ? 'mlg-submenu-item' : ''}`, children: [
                _jsx("div", { className: "mlg-nav-icon", children: item.icon }),
                textContent
            ]})
        ) : (
            _jsxs(NavLink, { to: item.to || '#', className: ({ isActive }) => `mlg-nav-item ${isSubmenu ? 'mlg-submenu-item' : ''} ${isActive ? 'active' : ''}`, children: [
                _jsx("div", { className: "mlg-nav-icon", children: item.icon }),
                textContent
            ]}, item.to || item.label)
        );

        if (isCollapsed && !isSubmenu) {
            return (_jsx(TooltipGlobal, { descricao: item.label, children: navLink }, item.label));
        }
        return navLink;
    };
    return (_jsxs("aside", { className: `mlg-sidebar ${isCollapsed ? 'collapsed' : ''}`, style: cssVars, children: [_jsx(TooltipGlobal, { descricao: isCollapsed ? 'Expandir menu' : 'Recolher menu', children: _jsx("button", { className: "mlg-toggle-btn", onClick: toggleCollapse, children: _jsx(SidebarSimple, { weight: isCollapsed ? 'duotone' : 'regular', size: 16 }) }) }), _jsxs("div", { className: "mlg-logo-area", children: [_jsx(LogoGlobal, { iconSize: 28, iconColor: moduleColor, hideText: isCollapsed }), !isCollapsed && (_jsxs("div", { className: "mlg-module-chip", children: [_jsx("span", { className: "mlg-module-chip__dot", style: { backgroundColor: moduleColor, boxShadow: `0 0 8px ${moduleColor}, 0 0 3px ${moduleColor}cc` } }), _jsx("span", { className: "mlg-module-chip__label", style: { color: moduleColor }, children: moduleName })] }))] }), _jsx("div", { className: "mlg-tenant-wrapper", children: isCollapsed ? (_jsx(TooltipGlobal, { descricao: `${tenantName} · ${tenantPlan}`, children: _jsx("div", { className: "mlg-tenant", children: _jsx("div", { className: "mlg-tenant-avatar", style: { color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }, children: tenantName.charAt(0) }) }) })) : (_jsxs("div", { className: "mlg-tenant", children: [_jsx("div", { className: "mlg-tenant-avatar", style: { color: moduleColor, borderColor: `${moduleColor}40`, backgroundColor: `${moduleColor}2e` }, children: tenantName.charAt(0) }), _jsxs("div", { className: "mlg-tenant-info", children: [_jsx("span", { className: "mlg-tenant-name", children: tenantName }), _jsx("span", { className: "mlg-tenant-plan", style: { color: moduleColor }, children: tenantPlan })] })] })) }), _jsxs("nav", { className: "mlg-nav", children: [isCollapsed && _jsx("div", { className: "mlg-nav-spacer" }), navItems.map(item => renderNavItem(item))] })] }));
}
