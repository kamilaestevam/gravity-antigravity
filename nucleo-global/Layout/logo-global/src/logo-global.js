import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Hexagon } from '@phosphor-icons/react';
import './logo-global.css';
export function LogoGlobal({ className = '', iconOnly = false, iconSize = 26, iconColor = '#818cf8', hideText = false }) {
    return (_jsxs("div", { className: `logo-global ${className}`.trim(), children: [_jsx("div", { className: "logo-global__mark", "aria-hidden": "true", children: _jsx(Hexagon, { size: iconSize, weight: "duotone", color: iconColor }) }), !iconOnly && (_jsx("span", { className: `logo-global__text ${hideText ? 'logo-global__text--hidden' : ''}`, children: "Gravity" }))] }));
}
