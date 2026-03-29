import { jsx as _jsx } from "react/jsx-runtime";
// src/Atividades.tsx
// Componente principal do serviço de Atividades para o shell.
// Carregado via lazy loading: import('@tenant/atividades/src/Atividades')
import { Suspense, lazy } from 'react';
const AtividadesView = lazy(() => import('./views/AtividadesView.js'));
export default function Atividades() {
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "loading", children: "Carregando Atividades..." }), children: _jsx(AtividadesView, {}) }));
}
