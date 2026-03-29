import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { CheckCircle, Clock, CircleNotch, WarningCircle, CloudCheck, } from '@phosphor-icons/react';
import './status-salvar.css';
const ICON_MAP = {
    idle: _jsx(CloudCheck, { size: 14, weight: "duotone" }),
    dirty: _jsx(Clock, { size: 14, weight: "duotone" }),
    saving: _jsx(CircleNotch, { size: 14, weight: "bold" }),
    success: _jsx(CheckCircle, { size: 14, weight: "fill" }),
    error: _jsx(WarningCircle, { size: 14, weight: "fill" }),
};
export function StatusSalvarGlobal({ status: propStatus, textIdle = 'Salvo', textDirty = 'Alterações pendentes', textSaving = 'Salvando...', textSuccess = 'Salvo com sucesso', textError = 'Erro ao salvar', autoResetMs = 3000, onAutoReset, className = '', hideOnIdle = true, }) {
    const [internalStatus, setInternalStatus] = useState(propStatus);
    // Sincroniza estado interno com a propriedade externa
    useEffect(() => {
        setInternalStatus(propStatus);
    }, [propStatus]);
    // Lógica de auto-reset quando o status mudar para success ou error
    useEffect(() => {
        if (autoResetMs > 0 && (internalStatus === 'success' || internalStatus === 'error')) {
            const timer = setTimeout(() => {
                setInternalStatus('idle');
                onAutoReset?.();
            }, autoResetMs);
            return () => clearTimeout(timer);
        }
    }, [internalStatus, autoResetMs, onAutoReset]);
    const getText = () => {
        switch (internalStatus) {
            case 'idle': return textIdle;
            case 'dirty': return textDirty;
            case 'saving': return textSaving;
            case 'success': return textSuccess;
            case 'error': return textError;
            default: return '';
        }
    };
    if (hideOnIdle && internalStatus === 'idle') {
        return null;
    }
    return (_jsxs("div", { className: `status-salvar-global status-salvar-global--${internalStatus} ${className}`, "aria-live": "polite", role: "status", children: [ICON_MAP[internalStatus], _jsx("span", { children: getText() })] }));
}
