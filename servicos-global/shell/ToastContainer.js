import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, XCircle, Warning, Info, X, } from '@phosphor-icons/react';
import { useShellStore } from './store';
const ICON_MAP = {
    success: _jsx(CheckCircle, { weight: "fill", size: 18 }),
    error: _jsx(XCircle, { weight: "fill", size: 18 }),
    warning: _jsx(Warning, { weight: "fill", size: 18 }),
    info: _jsx(Info, { weight: "fill", size: 18 }),
};
/**
 * ToastContainer — renderiza as notificações do ShellState.
 *
 * REGRA: nunca criar elementos de toast manualmente fora deste componente.
 * Todo toast entra via useShellStore().addNotification().
 */
export function ToastContainer() {
    const { notifications, removeNotification } = useShellStore();
    if (notifications.length === 0)
        return null;
    return (_jsx("div", { className: "shell-toast-container", role: "region", "aria-label": "Notifica\u00E7\u00F5es", "aria-live": "polite", "aria-atomic": "false", children: notifications.map((notif) => (_jsxs("div", { className: `shell-toast shell-toast--${notif.type}`, role: "alert", "aria-label": notif.message, children: [_jsx("span", { className: `shell-toast__icon shell-toast__icon--${notif.type}`, "aria-hidden": "true", children: ICON_MAP[notif.type] }), _jsx("p", { className: "shell-toast__message", children: notif.message }), _jsx("button", { className: "shell-toast__close", onClick: () => removeNotification(notif.id), "aria-label": "Fechar notifica\u00E7\u00E3o", type: "button", children: _jsx(X, { size: 14, weight: "bold" }) })] }, notif.id))) }));
}
