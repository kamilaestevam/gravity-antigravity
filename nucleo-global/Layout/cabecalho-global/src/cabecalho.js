import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './cabecalho.css';
/**
 * CabecalhoGlobal — Cabeçalho padrão de página do Gravity Design System.
 *
 * Renderiza uma faixa sticky no topo da área de conteúdo com:
 * - Ícone (opcional) + Título (h1) na mesma linha
 * - Subtítulo abaixo, alinhado com a borda esquerda do ícone
 * - Slot de ações à direita (ex: BotaoGlobal)
 *
 * O componente compensa automaticamente o padding do contêiner pai
 * (`ws-content`) para que o cabeçalho fique alinhado com a tabela abaixo.
 *
 * @example
 * <CabecalhoGlobal
 *   icone={<Buildings weight="duotone" size={22} />}
 *   titulo="Empresas Filhas"
 *   subtitulo="Gerencie as empresas filhas do seu tenant Gravity."
 *   acoes={<BotaoGlobal variante="primario">Nova Empresa</BotaoGlobal>}
 * />
 */
export function CabecalhoGlobal({ titulo, subtitulo, icone, acoes, viewToggle }) {
    return (_jsxs("header", { className: "cg-header", children: [_jsxs("div", { className: "cg-header__title-block", children: [_jsxs("div", { className: "cg-header__title-row", children: [icone && (_jsx("span", { className: "cg-header__icon", "aria-hidden": "true", children: icone })), _jsx("h1", { className: "cg-header__title", children: titulo })] }), subtitulo && (_jsx("p", { className: "cg-header__subtitle", children: subtitulo }))] }), viewToggle && (_jsx("div", { className: "cg-header__view-toggle", children: viewToggle })), acoes && (_jsx("div", { className: "cg-header__actions", children: acoes }))] }));
}
