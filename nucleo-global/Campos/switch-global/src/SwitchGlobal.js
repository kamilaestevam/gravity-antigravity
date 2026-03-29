import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './switch.css';
export function SwitchGlobal({ label, checked, onChange, disabled = false, className = '', id }) {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;
    return (_jsxs("div", { className: `sg-container ${disabled ? 'sg-container--disabled' : ''} ${className}`, children: [label && _jsx("label", { htmlFor: switchId, className: "sg-label", children: label }), _jsx("button", { id: switchId, type: "button", role: "switch", "aria-checked": checked, disabled: disabled, onClick: () => onChange(!checked), className: `sg-root ${checked ? 'sg-root--checked' : ''}`, children: _jsx("span", { className: `sg-thumb ${checked ? 'sg-thumb--checked' : ''}` }) })] }));
}
