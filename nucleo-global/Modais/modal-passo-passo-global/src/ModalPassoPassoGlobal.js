import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, X } from "@phosphor-icons/react";
import { BotaoGlobal } from "@nucleo/botao-global";
const LARGURA = {
  sm: "400px",
  md: "560px",
  lg: "720px",
  xl: "960px",
  "2xl": "1200px"
};
function useFocusTrap(aberto) {
  const ref = useRef(null);
  useEffect(() => {
    if (!aberto || !ref.current) return;
    const dialog = ref.current;
    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    function handleTab(e) {
      if (e.key !== "Tab") return;
      const focusable = dialog.querySelectorAll(focusableSelector);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    requestAnimationFrame(() => {
      const first = dialog.querySelector(focusableSelector);
      first?.focus();
    });
    dialog.addEventListener("keydown", handleTab);
    return () => dialog.removeEventListener("keydown", handleTab);
  }, [aberto]);
  return ref;
}
function ModalPassoPassoGlobal({
  titulo,
  tituloNode,
  icone,
  subtitulo,
  subtituloNode,
  aberto,
  passos,
  passoAtual,
  onProximo,
  onVoltar,
  onFechar,
  podeAvancar = true,
  labelBotaoFinal = "Salvar",
  labelProximo = "Proximo",
  tamanho = "md",
  altura,
  ocultarStepper = false,
  ocultarFooter = false,
  footerCustom,
  carregando = false,
  textoCarregando,
  navegacaoDireta = true,
  onIrParaPasso,
  children
}) {
  const dialogRef = useFocusTrap(aberto);
  const [direcao, setDirecao] = useState("avanco");
  const passoAnteriorRef = useRef(passoAtual);
  useEffect(() => {
    if (passoAtual > passoAnteriorRef.current) {
      setDirecao("avanco");
    } else if (passoAtual < passoAnteriorRef.current) {
      setDirecao("retorno");
    }
    passoAnteriorRef.current = passoAtual;
  }, [passoAtual]);
  useEffect(() => {
    if (!aberto) return;
    document.body.style.overflow = "hidden";
    function onKey(e) {
      if (e.key === "Escape") onFechar();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [aberto, onFechar]);
  if (!aberto) return null;
  if (typeof document === "undefined") return null;
  const isUltimoPasso = passoAtual === passos[passos.length - 1]?.id;
  const isPrimeiroPasso = passoAtual === passos[0]?.id;
  function stepStatus(passo) {
    if (passo.id < passoAtual) return "feito";
    if (passo.id === passoAtual) return "ativo";
    return "pendente";
  }
  const passoIndex = passos.findIndex((p) => p.id === passoAtual);
  const progresso = passos.length > 1 ? passoIndex / (passos.length - 1) * 100 : 100;
  const largura = LARGURA[tamanho] ?? LARGURA.md;
  function handleClickPasso(passo) {
    if (!navegacaoDireta) return;
    const status = stepStatus(passo);
    if (status !== "feito") return;
    if (onIrParaPasso) {
      onIrParaPasso(passo.id);
    }
  }
  const content = /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("style", { children: `
        @keyframes mpg-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes mpg-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mpg-content-slide-left {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mpg-content-slide-right {
          from { opacity: 0; transform: translateX(-24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes mpg-check-bounce {
          0%   { transform: scale(0) rotate(-10deg); }
          50%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes mpg-neon-pulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.15), inset 0 0 12px rgba(99,102,241,0.1);
          }
          50% {
            box-shadow: 0 0 12px rgba(99,102,241,0.7), 0 0 30px rgba(99,102,241,0.4), 0 0 60px rgba(99,102,241,0.2), inset 0 0 16px rgba(99,102,241,0.15);
          }
        }
        @keyframes mpg-nucleo-glow {
          0%, 100% { opacity: 0.4; transform: translate(-50%,-50%) scale(1); }
          50%      { opacity: 0.8; transform: translate(-50%,-50%) scale(1.3); }
        }
        /* --- Orbita 3D ao redor do circulo ativo (identidade Gravity) --- */
        @keyframes mpg-orbita-drift {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }
        @keyframes mpg-eletron-spin {
          from { transform: translate(-50%,-50%) rotate(0deg); }
          to   { transform: translate(-50%,-50%) rotate(360deg); }
        }
        .mpg-orbita-3d {
          position: absolute;
          top: 50%; left: 50%;
          width: 130%; height: 130%;
          transform: translate(-50%,-50%);
          pointer-events: none;
          perspective: 200px;
          transform-style: preserve-3d;
          z-index: 2;
        }
        .mpg-orbita-ring {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transform-style: preserve-3d;
        }
        .mpg-orbita-ring--1 {
          transform: rotateX(70deg) rotateZ(0deg);
          animation: mpg-orbita-drift 3s linear infinite;
        }
        .mpg-orbita-ring--2 {
          transform: rotateX(70deg) rotateZ(90deg);
          animation: mpg-orbita-drift 4.5s linear infinite reverse;
        }
        .mpg-orbita-anel {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          border: 1px solid rgba(129,140,248,0.2);
        }
        .mpg-orbita-ring--2 .mpg-orbita-anel {
          border-color: rgba(167,139,250,0.15);
        }
        .mpg-orbita-eletron {
          position: absolute;
          top: 50%; left: 50%;
          width: 100%; height: 100%;
          transform: translate(-50%,-50%);
          border-radius: 50%;
          pointer-events: none;
        }
        .mpg-orbita-eletron--1 {
          animation: mpg-eletron-spin 3s linear infinite;
        }
        .mpg-orbita-eletron--1::after {
          content: '';
          position: absolute;
          width: 5px; height: 5px;
          border-radius: 50%;
          top: -2.5px; left: 50%;
          transform: translateX(-50%);
          background: #818cf8;
          box-shadow: 0 0 8px 2px rgba(129,140,248,0.7), 0 0 16px 4px rgba(129,140,248,0.3);
        }
        .mpg-orbita-eletron--2 {
          animation: mpg-eletron-spin 4.5s linear infinite reverse;
        }
        .mpg-orbita-eletron--2::after {
          content: '';
          position: absolute;
          width: 4px; height: 4px;
          border-radius: 50%;
          top: -2px; left: 50%;
          transform: translateX(-50%);
          background: #a78bfa;
          box-shadow: 0 0 8px 2px rgba(167,139,250,0.7), 0 0 16px 4px rgba(167,139,250,0.3);
        }
        .mpg-btn-fechar:hover {
          color: var(--text-primary) !important;
          background: var(--bg-elevated, rgba(255,255,255,0.07)) !important;
        }
        .mpg-passo-feito {
          cursor: pointer;
        }
        .mpg-passo-feito:hover .mpg-circulo-feito {
          transform: scale(1.1);
          box-shadow: 0 0 10px rgba(34,197,94,0.5), 0 0 25px rgba(34,197,94,0.25), 0 0 50px rgba(34,197,94,0.1);
        }
        .mpg-circulo-ativo {
          animation: mpg-neon-pulse 2s ease-in-out infinite;
        }
        .mpg-circulo-pendente {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .mpg-circulo-pendente:hover {
          border-color: rgba(99,102,241,0.4) !important;
          box-shadow: 0 0 8px rgba(99,102,241,0.15);
        }
        .mpg-check-icon {
          animation: mpg-check-bounce 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .mpg-content-wrap {
          animation: mpg-content-slide-left 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .mpg-content-wrap--retorno {
          animation: mpg-content-slide-right 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .mpg-progress-bar {
          transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mpg-conector-fill {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          background: linear-gradient(90deg, #22c55e, #4ade80);
          border-radius: 1px;
          box-shadow: 0 0 6px rgba(34,197,94,0.4);
          transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @media (max-width: 640px) {
          .mpg-dialog {
            max-width: 100% !important;
            max-height: 92vh !important;
            border-radius: var(--radius-lg) var(--radius-lg) 0 0 !important;
            animation: mpg-slide-up-mobile 0.25s ease !important;
          }
          @keyframes mpg-slide-up-mobile {
            from { transform: translateY(100%); opacity: 0; }
            to   { transform: translateY(0);   opacity: 1; }
          }
          .mpg-overlay {
            padding: 0 !important;
            align-items: flex-end !important;
          }
        }
      ` }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "mpg-overlay",
        style: s.overlay,
        role: "presentation",
        onClick: (e) => {
          if (e.target === e.currentTarget) onFechar();
        },
        children: /* @__PURE__ */ jsxs(
          "div",
          {
            ref: dialogRef,
            className: "mpg-dialog",
            style: { ...s.dialog, maxWidth: largura, ...altura ? { height: altura } : {} },
            role: "dialog",
            "aria-modal": "true",
            "aria-label": titulo,
            children: [
              !ocultarStepper && /* @__PURE__ */ jsx("div", { style: s.progressWrap, "aria-hidden": "true", children: /* @__PURE__ */ jsx(
                "div",
                {
                  className: "mpg-progress-bar",
                  style: { ...s.progressBar, width: `${progresso}%` }
                }
              ) }),
              /* @__PURE__ */ jsxs("div", { style: s.header, children: [
                /* @__PURE__ */ jsxs("div", { style: s.headerTexto, children: [
                  /* @__PURE__ */ jsxs("div", { style: s.headerTituloRow, children: [
                    icone && /* @__PURE__ */ jsx("span", { style: s.headerIcone, children: icone }),
                    /* @__PURE__ */ jsx("span", { style: s.titulo, children: tituloNode ?? titulo })
                  ] }),
                  (subtitulo || subtituloNode) && /* @__PURE__ */ jsx("div", { style: s.subtitulo, children: subtituloNode ?? subtitulo })
                ] }),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "mpg-btn-fechar",
                    style: s.fechar,
                    onClick: onFechar,
                    "aria-label": "Fechar",
                    children: /* @__PURE__ */ jsx(X, { size: 18, weight: "bold" })
                  }
                )
              ] }),
              !ocultarStepper && /* @__PURE__ */ jsx("div", { style: s.stepperWrap, children: /* @__PURE__ */ jsx("div", { style: s.stepper, role: "list", "aria-label": "Passos", children: passos.map((passo, idx) => {
                const status = stepStatus(passo);
                const isClickable = navegacaoDireta && status === "feito" && !!onIrParaPasso;
                const circuloStyle = {
                  ...s.circulo,
                  ...status === "ativo" ? s.circuloAtivo : {},
                  ...status === "feito" ? s.circuloFeito : {}
                };
                const labelStyleMerge = {
                  ...s.label,
                  ...status === "ativo" ? s.labelAtivo : {},
                  ...status === "feito" ? s.labelFeito : {}
                };
                return /* @__PURE__ */ jsxs(React.Fragment, { children: [
                  /* @__PURE__ */ jsxs(
                    "div",
                    {
                      style: s.passo,
                      role: "listitem",
                      "aria-current": status === "ativo" ? "step" : void 0,
                      className: isClickable ? "mpg-passo-feito" : void 0,
                      onClick: isClickable ? () => handleClickPasso(passo) : void 0,
                      title: isClickable ? `Voltar para: ${passo.label}` : void 0,
                      children: [
                        /* @__PURE__ */ jsxs("div", { style: s.circuloWrap, children: [
                          /* @__PURE__ */ jsx(
                            "div",
                            {
                              style: circuloStyle,
                              className: status === "ativo" ? "mpg-circulo-ativo" : status === "feito" ? "mpg-circulo-feito" : "mpg-circulo-pendente",
                              children: status === "feito" ? /* @__PURE__ */ jsx("span", { className: "mpg-check-icon", children: /* @__PURE__ */ jsx(Check, { size: 16, weight: "bold" }) }) : passo.icone ?? passo.id
                            }
                          ),
                          status === "ativo" && /* @__PURE__ */ jsxs(Fragment, { children: [
                            /* @__PURE__ */ jsxs("div", { className: "mpg-orbita-3d", "aria-hidden": "true", children: [
                              /* @__PURE__ */ jsxs("div", { className: "mpg-orbita-ring mpg-orbita-ring--1", children: [
                                /* @__PURE__ */ jsx("div", { className: "mpg-orbita-anel" }),
                                /* @__PURE__ */ jsx("div", { className: "mpg-orbita-eletron mpg-orbita-eletron--1" })
                              ] }),
                              /* @__PURE__ */ jsxs("div", { className: "mpg-orbita-ring mpg-orbita-ring--2", children: [
                                /* @__PURE__ */ jsx("div", { className: "mpg-orbita-anel" }),
                                /* @__PURE__ */ jsx("div", { className: "mpg-orbita-eletron mpg-orbita-eletron--2" })
                              ] })
                            ] }),
                            /* @__PURE__ */ jsx("div", { style: s.nucleoGlow, "aria-hidden": "true" })
                          ] })
                        ] }),
                        /* @__PURE__ */ jsx("span", { style: labelStyleMerge, children: passo.label })
                      ]
                    }
                  ),
                  idx < passos.length - 1 && /* @__PURE__ */ jsx("div", { style: s.conector, "aria-hidden": "true", children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "mpg-conector-fill",
                      style: { width: status === "feito" ? "100%" : "0%" }
                    }
                  ) })
                ] }, passo.id);
              }) }) }),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `mpg-content-wrap${direcao === "retorno" ? " mpg-content-wrap--retorno" : ""}`,
                  style: s.conteudo,
                  "aria-live": "polite",
                  children
                },
                passoAtual
              ),
              footerCustom ? /* @__PURE__ */ jsx("div", { style: s.footer, children: footerCustom }) : !ocultarFooter ? /* @__PURE__ */ jsxs("div", { style: s.footer, children: [
                /* @__PURE__ */ jsx(
                  BotaoGlobal,
                  {
                    variante: "fantasma",
                    tamanho: "padrao",
                    icone: !isPrimeiroPasso ? /* @__PURE__ */ jsx(ArrowLeft, { size: 14 }) : void 0,
                    onClick: isPrimeiroPasso ? onFechar : onVoltar,
                    children: isPrimeiroPasso ? "Cancelar" : "Voltar"
                  }
                ),
                /* @__PURE__ */ jsxs("div", { style: s.footerDireita, children: [
                  /* @__PURE__ */ jsxs("span", { style: s.footerIndicador, children: [
                    passoIndex + 1,
                    " / ",
                    passos.length
                  ] }),
                  /* @__PURE__ */ jsx(
                    BotaoGlobal,
                    {
                      variante: "primario",
                      tamanho: "padrao",
                      disabled: !podeAvancar || carregando,
                      carregando,
                      iconeDireita: isUltimoPasso ? /* @__PURE__ */ jsx(Check, { size: 14 }) : /* @__PURE__ */ jsx(ArrowRight, { size: 14 }),
                      onClick: onProximo,
                      children: carregando && textoCarregando ? textoCarregando : isUltimoPasso ? labelBotaoFinal : labelProximo
                    }
                  )
                ] })
              ] }) : null
            ]
          }
        )
      }
    )
  ] });
  return createPortal(content, document.body);
}
const s = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
    animation: "mpg-fade-in 0.15s ease"
  },
  dialog: {
    position: "relative",
    width: "100%",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    background: "var(--bg-base)",
    borderRadius: "var(--radius-lg)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "calc(100vh - 2rem)",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    animation: "mpg-slide-up 0.2s ease"
  },
  progressWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "var(--bg-elevated, rgba(255,255,255,0.06))",
    zIndex: 1,
    borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
    overflow: "hidden"
  },
  progressBar: {
    height: "100%",
    background: "var(--accent, #6366f1)",
    borderRadius: "0 2px 2px 0"
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: "1.25rem 1.5rem",
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--bg-elevated)",
    flexShrink: 0,
    gap: "1rem"
  },
  headerTexto: {
    display: "flex",
    flexDirection: "column",
    gap: 0
  },
  headerTituloRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  headerIcone: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "var(--ws-accent, var(--color-primary, #818cf8))"
  },
  titulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.2
  },
  subtitulo: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.8125rem",
    color: "var(--text-secondary, #94a3b8)",
    margin: 0,
    lineHeight: 1.4
  },
  fechar: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: "var(--text-muted)",
    padding: 0,
    width: "2rem",
    height: "2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius-md)",
    flexShrink: 0,
    transition: "color 0.15s, background 0.15s"
  },
  stepperWrap: {
    padding: "1rem 1.5rem",
    background: "var(--bg-surface)",
    borderBottom: "1px solid var(--bg-elevated)",
    flexShrink: 0
  },
  stepper: {
    display: "flex",
    alignItems: "flex-start",
    gap: 0,
    overflowX: "auto"
  },
  passo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: "0.5rem",
    flexShrink: 0
  },
  circuloWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "2.75rem",
    height: "2.75rem"
  },
  nucleoGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: "3.5rem",
    height: "3.5rem",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)",
    animation: "mpg-nucleo-glow 3s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0
  },
  // Circulo — OBRIGATORIO: min-width e flex-shrink:0 (Design System § 12)
  circulo: {
    position: "relative",
    zIndex: 3,
    width: "2.75rem",
    height: "2.75rem",
    minWidth: "2.75rem",
    flexShrink: 0,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.03)",
    border: "1.5px solid rgba(255,255,255,0.1)",
    color: "var(--text-muted)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.875rem",
    fontWeight: 700,
    letterSpacing: "-0.01em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  circuloAtivo: {
    background: "linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)",
    border: "2px solid rgba(129,140,248,0.5)",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 800,
    boxShadow: "0 0 8px rgba(99,102,241,0.5), 0 0 20px rgba(99,102,241,0.3), 0 0 40px rgba(99,102,241,0.15), inset 0 0 12px rgba(99,102,241,0.1)"
  },
  circuloFeito: {
    background: "linear-gradient(135deg, #16a34a, #22c55e, #4ade80)",
    border: "2px solid rgba(74,222,128,0.4)",
    color: "#fff",
    boxShadow: "0 0 8px rgba(34,197,94,0.4), 0 0 20px rgba(34,197,94,0.2), 0 0 35px rgba(34,197,94,0.1)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease"
  },
  label: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.6875rem",
    fontWeight: 600,
    textAlign: "center",
    color: "var(--text-muted, #64748b)",
    whiteSpace: "nowrap",
    transition: "color 0.3s, text-shadow 0.3s"
  },
  labelAtivo: {
    color: "#a5b4fc",
    textShadow: "0 0 8px rgba(99,102,241,0.5)"
  },
  labelFeito: {
    color: "#86efac",
    textShadow: "0 0 6px rgba(34,197,94,0.3)"
  },
  conector: {
    position: "relative",
    flex: 1,
    height: "2px",
    background: "rgba(255,255,255,0.06)",
    minWidth: "20px",
    marginTop: "1.375rem",
    borderRadius: "1px",
    overflow: "hidden"
  },
  conteudo: {
    flex: 1,
    overflowY: "auto",
    padding: "1.5rem",
    background: "var(--bg-base)"
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "1rem 1.5rem",
    background: "var(--bg-surface)",
    borderTop: "1px solid var(--bg-elevated)",
    flexShrink: 0
  },
  footerDireita: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem"
  },
  footerIndicador: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.6875rem",
    fontWeight: 500,
    color: "var(--text-muted, #64748b)",
    letterSpacing: "0.02em"
  }
};
export {
  ModalPassoPassoGlobal
};
