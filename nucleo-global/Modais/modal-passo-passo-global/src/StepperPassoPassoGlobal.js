import { jsx, jsxs } from "react/jsx-runtime";
import React from "react";
import { Check } from "@phosphor-icons/react";
function StepperPassoPassoGlobal({ passos, passoAtual }) {
  return /* @__PURE__ */ jsx("div", { style: s.stepper, role: "list", "aria-label": "Passos", children: passos.map((passo, idx) => {
    const status = passo.id < passoAtual ? "feito" : passo.id === passoAtual ? "ativo" : "pendente";
    const circuloStyle = {
      ...s.circulo,
      ...status === "ativo" ? s.circuloAtivo : {},
      ...status === "feito" ? s.circuloFeito : {}
    };
    const labelStyle = {
      ...s.label,
      ...status === "ativo" ? s.labelAtivo : {},
      ...status === "feito" ? s.labelFeito : {}
    };
    return /* @__PURE__ */ jsxs(React.Fragment, { children: [
      /* @__PURE__ */ jsxs("div", { style: s.passo, role: "listitem", "aria-current": status === "ativo" ? "step" : void 0, children: [
        /* @__PURE__ */ jsx("div", { style: circuloStyle, children: status === "feito" ? /* @__PURE__ */ jsx(Check, { size: 14, weight: "bold" }) : passo.icone ?? passo.id }),
        /* @__PURE__ */ jsx("span", { style: labelStyle, children: passo.label })
      ] }),
      idx < passos.length - 1 && /* @__PURE__ */ jsx(
        "div",
        {
          style: { ...s.conector, ...status === "feito" ? s.conectorFeito : {} },
          "aria-hidden": "true"
        }
      )
    ] }, passo.id);
  }) });
}
const s = {
  stepper: {
    display: "flex",
    alignItems: "center",
    gap: 0,
    padding: "1.5rem 0",
    overflowX: "auto",
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
  },
  passo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    minWidth: "80px",
    flexShrink: 0
  },
  circulo: {
    width: "36px",
    height: "36px",
    minWidth: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    background: "var(--bg-surface, #334155)",
    border: "2px solid var(--bg-elevated, #475569)",
    color: "var(--text-muted, #64748b)",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "13px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
  },
  circuloAtivo: {
    background: "var(--accent, #6366f1)",
    border: "2px solid var(--accent, #6366f1)",
    color: "#fff",
    boxShadow: "0 0 0 4px rgba(99,102,241,0.2)"
  },
  circuloFeito: {
    background: "var(--success, #22c55e)",
    border: "2px solid var(--success, #22c55e)",
    color: "#fff"
  },
  label: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontSize: "0.6875rem",
    fontWeight: 600,
    textAlign: "center",
    color: "var(--text-muted, #64748b)",
    whiteSpace: "nowrap"
  },
  labelAtivo: { color: "var(--accent, #6366f1)" },
  labelFeito: { color: "var(--success, #22c55e)" },
  conector: {
    flex: 1,
    height: "2px",
    background: "var(--bg-elevated, #475569)",
    minWidth: "20px",
    marginTop: "-1.25rem"
  },
  conectorFeito: {
    background: "var(--success, #22c55e)"
  }
};
export {
  StepperPassoPassoGlobal
};
