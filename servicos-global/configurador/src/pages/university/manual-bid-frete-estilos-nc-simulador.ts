/** SSOT visual — shell do wizard embutido (paridade ModalPassoPassoGlobal). */
export const NC_ESTILOS_SIMULADOR_WIZARD_SHELL = `
  .sim-wizard-embutido {
    background: var(--bg-base);
    border: none;
    border-radius: var(--radius-lg, 12px);
    overflow: hidden;
    box-shadow: var(--shadow-md, 0 8px 28px rgba(0, 0, 0, 0.22));
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  }
  .sim-wizard-embutido__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 20px 12px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--bg-elevated);
  }
  .sim-wizard-embutido__header-icone {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--ws-accent, var(--color-primary, #818cf8));
  }
  .sim-wizard-embutido__titulo {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.3;
  }
  .sim-wizard-embutido__subtitulo {
    margin: 3px 0 0;
    font-size: 0.75rem;
    color: var(--text-secondary, #94a3b8);
    line-height: 1.4;
  }
  .sim-wizard-stepper-wrap {
    padding: 6px 20px 4px;
    background: var(--bg-surface);
    border-bottom: 1px solid var(--bg-elevated);
  }
  .sim-wizard-body {
    padding: 1.15rem 1.5rem 1.75rem;
    background: var(--bg-base);
    min-height: 420px;
  }
  .sim-wizard-embutido__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 14px 20px;
    background: var(--bg-surface);
    border-top: 1px solid var(--bg-elevated);
  }
  .sim-wizard-embutido__footer--acoes {
    justify-content: flex-end;
  }

  .sim-wizard-stepper-wrap [role="list"] {
    padding: 0.85rem 0 !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] {
    min-width: 68px !important;
    gap: 0.35rem !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] > div:first-child {
    width: 2.25rem !important;
    height: 2.25rem !important;
    min-width: 2.25rem !important;
    font-size: 0.72rem !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"][data-status="pendente"] > div:first-child {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1.5px solid rgba(255, 255, 255, 0.1) !important;
    color: var(--text-muted) !important;
    box-shadow: none !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"][data-status="ativo"] > div:first-child,
  .sim-wizard-stepper-wrap [role="listitem"][aria-current="step"] > div:first-child {
    background: linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1) !important;
    border: 2px solid rgba(129, 140, 248, 0.5) !important;
    color: #fff !important;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.5), 0 0 20px rgba(99, 102, 241, 0.3), 0 0 40px rgba(99, 102, 241, 0.15), inset 0 0 12px rgba(99, 102, 241, 0.1) !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"][data-status="feito"] > div:first-child {
    background: linear-gradient(135deg, #16a34a, #22c55e, #4ade80) !important;
    border: 2px solid rgba(74, 222, 128, 0.4) !important;
    color: #fff !important;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.4), 0 0 20px rgba(34, 197, 94, 0.2), 0 0 35px rgba(34, 197, 94, 0.1) !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] > span {
    font-size: 0.625rem !important;
    max-width: 72px;
    text-align: center;
    line-height: 1.2 !important;
    color: var(--text-muted, #64748b) !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"][data-status="ativo"] > span,
  .sim-wizard-stepper-wrap [role="listitem"][aria-current="step"] > span {
    color: #a5b4fc !important;
    text-shadow: 0 0 8px rgba(99, 102, 241, 0.5) !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"][data-status="feito"] > span {
    color: #86efac !important;
    text-shadow: 0 0 6px rgba(34, 197, 94, 0.3) !important;
  }
  .sim-wizard-stepper-wrap [role="list"] > div[aria-hidden="true"] {
    background: rgba(255, 255, 255, 0.06) !important;
    margin-top: 1.125rem !important;
  }
  .sim-wizard-stepper-wrap [role="list"] > div[aria-hidden="true"][data-status="feito"] {
    background: rgba(34, 197, 94, 0.45) !important;
  }

  .sim-guia-sticky-col {
    display: flex;
    flex-direction: column;
    min-height: 280px;
    max-height: min(720px, calc(100vh - 120px));
    background: linear-gradient(180deg, var(--bg-surface) 0%, color-mix(in srgb, var(--bg-base) 55%, var(--bg-surface)) 100%);
    border: 1px solid var(--bg-elevated);
    border-radius: var(--radius-lg, 12px);
    padding: 14px 10px 14px 14px;
    box-shadow: var(--shadow-md, 0 8px 24px rgba(0, 0, 0, 0.18));
    overflow: hidden;
  }
  .sim-guia-sticky-col__cabecalho {
    flex-shrink: 0;
  }
  .sim-guia-sticky-col__lista {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    overscroll-behavior: contain;
    padding-right: 4px;
    padding-bottom: 28px;
    scrollbar-width: thin;
    scrollbar-color: var(--bg-elevated, rgba(255, 255, 255, 0.12)) transparent;
  }
  .sim-guia-sticky-col__lista::-webkit-scrollbar {
    width: 5px;
  }
  .sim-guia-sticky-col__lista::-webkit-scrollbar-thumb {
    background: var(--bg-elevated, rgba(255, 255, 255, 0.12));
    border-radius: 999px;
  }
  .sim-guia-sticky-col__lista::-webkit-scrollbar-track {
    background: transparent;
  }
  .sim-guia-sticky-col__titulo {
    margin: 0;
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-muted, #64748b);
  }
  .sim-guia-sticky-col__contador {
    font-size: 0.58rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: var(--text-secondary, #94a3b8);
    background: var(--bg-elevated, rgba(255, 255, 255, 0.06));
    border: 1px solid var(--bg-elevated);
    border-radius: 999px;
    padding: 2px 8px;
    white-space: nowrap;
  }
  .sim-guia-sticky-col__contador--ativo {
    color: #a5b4fc;
  }
  .sim-guia-sticky-col__progresso-trilho {
    height: 3px;
    border-radius: 999px;
    background: var(--bg-elevated, rgba(255, 255, 255, 0.06));
    overflow: hidden;
    margin-bottom: 10px;
  }
  .sim-guia-sticky-col__progresso-barra {
    height: 100%;
    border-radius: 999px;
    background: var(--accent, #6366f1);
    transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  }
`

/** SSOT visual — subset do passo Modal e Operação (wizard Nova Cotação BID Frete). */
export const NC_ESTILOS_SIMULADOR_MODAL_OPERACAO = `
  .nc-root,
  .nc-step-wrapper,
  .nc-sucesso {
    --nc-muted: var(--ws-muted, var(--text-secondary, #94a3b8));
    --nc-option-accent: var(--color-primary, #6366f1);
    --nc-option-accent-dim: rgba(99, 102, 241, 0.08);
    --nc-option-accent-border: var(--color-primary, #6366f1);
    --nc-option-focus-ring: 0 0 0 1px var(--color-primary, #6366f1);
    --nc-accent: var(--ws-accent, var(--accent, #818cf8));
    --nc-accent-dim: var(--ws-accent-dim, rgba(129, 140, 248, 0.12));
    --nc-accent-border: var(--ws-accent-border, rgba(129, 140, 248, 0.2));
    --nc-focus-ring: 0 0 0 3px rgba(129, 140, 248, 0.25);
  }

  @keyframes nc-fade-in-up {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .nc-fade-in {
    animation: nc-fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .nc-step-content { width: 100%; }

  .nc-section-title {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--nc-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.3;
    margin-bottom: 0.7rem;
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
  .nc-section-title svg { color: #94a3b8; flex-shrink: 0; }
  .nc-section-title:first-child { margin-top: 0; }

  .nc-obrig { color: var(--color-danger, #f87171); margin-left: 0.125rem; }

  .nc-options-grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
    margin-bottom: 1.1rem;
  }
  .nc-options-grid-3 {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-bottom: 1.1rem;
  }
  @media (max-width: 720px) {
    .nc-options-grid-3 { grid-template-columns: 1fr; }
  }
  .nc-options-grid-full {
    display: grid;
    grid-template-columns: 1fr;
    gap: 7px;
    margin-bottom: 1rem;
  }

  .nc-option-btn {
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 9px 11px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    color: var(--color-text-primary, #f1f5f9);
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
    font-family: inherit;
    font-weight: 400;
    text-align: left;
    width: 100%;
    user-select: none;
  }
  .nc-option-btn:hover:not(.nc-option-btn--selected) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }
  .nc-option-btn--selected {
    background: var(--nc-option-accent-dim);
    border-color: var(--nc-option-accent-border);
    box-shadow: var(--nc-option-focus-ring);
  }
  .nc-option-btn--selected:hover {
    border-color: var(--nc-option-accent-border);
    background: rgba(99, 102, 241, 0.12);
  }

  .nc-option-checkbox {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    flex-shrink: 0;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.25);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .nc-option-btn--selected .nc-option-checkbox {
    background: color-mix(in srgb, var(--nc-option-accent) 20%, transparent);
    border-color: var(--nc-option-accent);
  }
  .nc-option-checkmark {
    color: var(--nc-option-accent);
    font-size: 11px;
    line-height: 1;
    font-weight: 700;
  }

  .nc-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border-radius: 8px;
    background: var(--color-surface-hover, #334155);
    color: var(--color-text-muted, #94a3b8);
    transition: background-color 0.15s, color 0.15s;
  }
  .nc-option-btn--selected .nc-option-icon {
    background: rgba(99, 102, 241, 0.18);
    color: var(--nc-option-accent);
  }

  .nc-option-text {
    display: flex;
    flex-direction: column;
    gap: 3px;
    line-height: 1.28;
    flex: 1;
    min-width: 0;
  }
  .nc-option-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--color-text-primary, #f1f5f9);
  }
  .nc-option-desc {
    font-size: 10.5px;
    color: var(--color-text-muted, #94a3b8);
  }

  .nc-empty-hint {
    display: flex;
    align-items: center;
    gap: 0.875rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.08);
    padding: 1.25rem 1.5rem;
    border-radius: 8px;
    color: var(--nc-muted);
    font-size: 13px;
    grid-column: span 2;
  }
  .nc-empty-hint p { margin: 0; }

  .nc-field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }
  .nc-field-label {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--nc-muted);
  }
  .nc-field-label svg { color: #94a3b8; flex-shrink: 0; }
  .nc-input {
    padding: 0.5rem 0.75rem;
    background: var(--ws-bg-body, var(--bg-body, #0f172a));
    border: 1.5px solid var(--nc-accent-border);
    border-radius: var(--radius-md, 8px);
    color: var(--text-primary, #f1f5f9);
    font-size: 0.8125rem;
    font-family: inherit;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    min-height: 2.25rem;
  }
  .nc-input:focus {
    border-color: var(--nc-accent);
    box-shadow: var(--nc-focus-ring);
  }
  .nc-field-hint {
    display: block;
    margin-top: 0.3rem;
    font-size: 0.6875rem;
    color: var(--text-muted, #64748b);
    line-height: 1.35;
  }

  .sim-wizard-stepper-wrap [role="list"] {
    padding: 0.85rem 0 !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] {
    min-width: 68px !important;
    gap: 0.35rem !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] > div:first-child {
    width: 2.25rem !important;
    height: 2.25rem !important;
    min-width: 2.25rem !important;
    font-size: 0.72rem !important;
  }
  .sim-wizard-stepper-wrap [role="listitem"] > span {
    font-size: 0.625rem !important;
    max-width: 72px;
    text-align: center;
    line-height: 1.2 !important;
  }

  .sim-modal-operacao-layout {
    display: grid;
    grid-template-columns: minmax(0, 640px) minmax(380px, 1fr);
    gap: 14px;
    align-items: start;
    width: 100%;
    max-width: none;
    margin: 0;
    justify-content: start;
  }
  .sim-modal-operacao-layout .nc-option-icon svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 1040px) {
    .sim-modal-operacao-layout {
      grid-template-columns: 1fr;
    }
    .sim-guia-sticky-col {
      position: sticky;
      top: 64px;
      z-index: 4;
      max-height: min(560px, calc(100vh - 100px));
    }
  }
  @media (min-width: 1041px) {
    .sim-guia-sticky-col {
      position: sticky;
      top: 76px;
      max-height: min(720px, calc(100vh - 120px));
    }
  }

  .sim-guia-linha:hover:not([aria-pressed="true"]) {
    border-color: rgba(148, 163, 184, 0.35) !important;
    background: rgba(255, 255, 255, 0.05) !important;
  }
  .sim-guia-linha:focus-visible {
    outline: 2px solid rgba(99, 102, 241, 0.45);
    outline-offset: 1px;
  }

  @keyframes sim-guia-card-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .sim-guia-card-ativo {
    animation: sim-guia-card-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
`

/** SSOT visual — subset do passo Origem e Destino (wizard Nova Cotação BID Frete). */
export const NC_ESTILOS_SIMULADOR_ORIGEM_DESTINO = `
  .nc-origem-destino-stack {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
  }
  .nc-location-visual-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: var(--radius-md, 10px);
    padding: 1.1rem 1.25rem;
    transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }
  .nc-location-visual-card--selected {
    background: var(--nc-option-accent-dim);
    border: 1.5px solid var(--nc-option-accent-border);
    box-shadow: var(--nc-option-focus-ring);
  }
  .nc-location-visual-header {
    display: flex;
    align-items: center;
    gap: 0.9rem;
    margin-bottom: 1.1rem;
    border-bottom: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
    padding-bottom: 0.8rem;
  }
  .nc-location-visual-circle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    flex-shrink: 0;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.25);
    color: var(--nc-muted);
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }
  .nc-location-visual-card--selected .nc-location-visual-circle {
    background: color-mix(in srgb, var(--nc-option-accent) 20%, transparent);
    border-color: var(--nc-option-accent);
    color: var(--nc-option-accent);
  }
  .nc-location-visual-text h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary, #f8fafc);
  }
  .nc-location-visual-text p {
    font-size: 0.8rem;
    color: var(--text-secondary-light, #cbd5e1);
    margin: 0.15rem 0 0;
  }
  @keyframes nc-pulse {
    0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--nc-option-accent) 40%, transparent); }
    70% { box-shadow: 0 0 0 6px transparent; }
    100% { box-shadow: 0 0 0 0 transparent; }
  }
  .nc-location-visual-card--selected .nc-pulsing-icon,
  .nc-location-visual-card--selected .nc-pulsing-icon-dest {
    border-radius: 50%;
    animation: nc-pulse 2s infinite;
  }
  .nc-location-body {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }
  .nc-location-body > .nc-field { margin-bottom: 0; }
  .nc-location-body > .nc-field > .nc-field-label,
  .nc-location-body > .nc-field > .nc-field-label svg {
    color: var(--text-primary, #f8fafc);
  }

  .nc-exibir-campos-linha { margin: 0; padding: 0; }
  .nc-exibir-campos-checkbox {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    margin: 0;
    cursor: pointer;
    user-select: none;
  }
  .nc-exibir-campos-checkbox span {
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--text-secondary, #cbd5e1);
  }
  .nc-checkbox-padrao {
    appearance: none;
    -webkit-appearance: none;
    margin-top: 0.15rem;
    flex-shrink: 0;
    width: 15px;
    height: 15px;
    border-radius: 4px;
    border: 1.5px solid var(--text-secondary, #94a3b8);
    background: transparent;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: border-color 0.12s ease, background 0.12s ease;
  }
  .nc-checkbox-padrao:hover {
    border-color: var(--nc-accent);
    background: var(--nc-accent-dim);
  }
  .nc-checkbox-padrao:checked {
    background: var(--nc-accent);
    border-color: var(--nc-accent);
  }
  .nc-checkbox-padrao:checked::after {
    content: '';
    position: absolute;
    width: 8px;
    height: 5px;
    border-left: 2px solid #fff;
    border-bottom: 2px solid #fff;
    transform: rotate(-45deg) translate(0, -1px);
  }
  .nc-checkbox-padrao:focus-visible {
    outline: none;
    box-shadow: var(--nc-focus-ring);
  }

  .nc-fields-grid--location-extras {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
    margin-top: 0.25rem;
  }
  .nc-fields-grid--location-extras .nc-field { margin-bottom: 0; }
  .nc-fields-grid--location-extras .nc-field--span-2 { grid-column: span 2; }
  @media (max-width: 600px) {
    .nc-fields-grid--location-extras { grid-template-columns: 1fr; }
    .nc-fields-grid--location-extras .nc-field--span-2 { grid-column: span 1; }
  }

  .nc-locais-adicionais-bloco { margin-top: 0.25rem; }
  .nc-locais-adicionais-bloco .nc-cargo-subsecao-hint {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--text-secondary-light, #94a3b8);
  }
  .nc-linhas-container-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  .nc-btn-adicionar-linha {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    gap: 0.3rem;
    padding: 0.35rem 0.55rem;
    border: 1px dashed var(--nc-accent-border);
    border-radius: var(--radius-md, 8px);
    background: transparent;
    color: var(--nc-accent);
    font-size: 0.65rem;
    font-weight: 600;
    font-family: inherit;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .nc-btn-adicionar-linha:hover {
    background: var(--nc-accent-dim);
    border-color: var(--nc-accent);
  }
  .nc-linha-armazem-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: end;
    margin-bottom: 0.75rem;
  }
  .nc-linha-armazem-row .nc-field { margin-bottom: 0; }
  .nc-btn-remover-linha {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 1.875rem;
    height: 2.25rem;
    padding: 0;
    border: none;
    border-radius: var(--radius-md, 8px);
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
    cursor: pointer;
    transition: background 0.15s ease;
    align-self: end;
  }
  .nc-btn-remover-linha:hover:not(:disabled) { background: rgba(239, 68, 68, 0.22); }
  .nc-btn-remover-linha:disabled { opacity: 0.35; cursor: not-allowed; }
  @media (max-width: 600px) {
    .nc-linha-armazem-row { grid-template-columns: 1fr; }
  }
`

/** Passo 3 — Carga e Incoterm (paridade visual do modal real). */
export const NC_ESTILOS_SIMULADOR_CARGA_INCOTERM = `
  .nc-cargo-stack {
    display: flex;
    flex-direction: column;
    gap: 1.75rem;
  }
  .nc-cargo-subsecao {
    background: var(--bg-base, rgba(15, 23, 42, 0.3));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.05));
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
  }
  .nc-cargo-subsecao-title {
    margin: 0 0 0.35rem;
    font-size: 0.8125rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-primary, #f8fafc);
    display: flex;
    align-items: center;
    gap: 0.4rem;
  }
  .nc-cargo-subsecao-title svg {
    color: #94a3b8;
    flex-shrink: 0;
  }
  .nc-cargo-subsecao-hint {
    margin: 0 0 1rem;
    font-size: 0.8125rem;
    line-height: 1.45;
    color: var(--text-secondary-light, #94a3b8);
  }
  .nc-cargo-subsecao-grid-identificacao {
    display: grid;
    grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
  }
  .nc-cargo-subsecao-grid-hs {
    display: grid;
    grid-template-columns: minmax(12rem, 16rem);
    gap: 1.25rem;
    margin-top: 1.25rem;
    align-items: start;
  }
  .nc-field > .nc-campo-ncm .cg-wrapper {
    gap: 0;
  }
  .nc-campo-ncm {
    min-width: 0;
  }
  .nc-campo-ncm .cg-wrapper {
    gap: 0.5rem;
  }
  .nc-campo-ncm--label-externo .cg-label {
    display: none;
  }
  .nc-campo-ncm .cg-wrapper > div:first-of-type {
    gap: 0.625rem;
  }
  .nc-campo-ncm input {
    flex: 1;
    min-width: 0;
    padding: 0.5625rem 0.875rem;
    background: var(--ws-bg-body, var(--bg-body, #0f172a));
    border: 1.5px solid var(--nc-accent-border);
    border-radius: var(--radius-md, 8px);
    color: var(--text-primary, #f1f5f9);
    font-size: 0.875rem;
    font-family: var(--font-mono, 'DM Mono', monospace);
    min-height: 2.5rem;
    box-sizing: border-box;
  }
  .nc-campo-ncm input:focus {
    border-color: var(--nc-option-accent, #818cf8);
    box-shadow: var(--nc-option-focus-ring, 0 0 0 3px rgba(129, 140, 248, 0.25));
    outline: none;
  }
  .nc-campo-ncm button[aria-label="Buscar NCM"] {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    background: var(--ws-bg-body, var(--bg-body, #0f172a));
    border: 1.5px solid var(--nc-accent-border);
    border-radius: var(--radius-md, 8px);
    color: var(--nc-option-accent, #818cf8);
  }
  .nc-campo-ncm button[aria-label="Buscar NCM"]:hover:not(:disabled) {
    background: var(--nc-option-accent-dim, rgba(129, 140, 248, 0.12));
    border-color: var(--nc-option-accent, #818cf8);
  }
  .nc-cargo-perigosa-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    align-items: start;
  }
  .nc-cargo-subsecao-grid-quantidade {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
    gap: 1.25rem;
    align-items: start;
  }
  .nc-cargo-subsecao-grid-quantidade--embalagem {
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
  .nc-cargo-subsecao-grid-peso {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.25rem;
  }
  .nc-cargo-subsecao-grid-cubagem-m3 {
    display: grid;
    grid-template-columns: minmax(0, 16rem);
  }
  .nc-cargo-cubagem-stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .nc-cargo-cubagem-detalhe-panel {
    margin-top: 0.25rem;
    padding: 1rem 1.1rem;
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(8, 12, 24, 0.35);
  }
  .nc-cargo-cubagem-dimensoes-grid {
    display: grid;
    grid-template-columns: minmax(7.5rem, 1.15fr) repeat(3, minmax(5.75rem, 1fr));
    gap: 1rem;
    align-items: start;
  }
  .nc-cargo-cubagem-dimensoes-grid .nc-input--with-suffix {
    padding-left: 0.85rem;
    padding-right: 2.75rem;
    min-width: 0;
  }
  .nc-cargo-cubagem-dimensoes-grid .nc-input-suffix {
    right: 0.65rem;
  }
  .nc-cargo-cubagem-dimensoes-grid .nc-input-group .nc-input[type="number"] {
    padding-right: 2.75rem;
    -moz-appearance: textfield;
  }
  .nc-cargo-cubagem-dimensoes-grid .nc-input-group .nc-input[type="number"]::-webkit-outer-spin-button,
  .nc-cargo-cubagem-dimensoes-grid .nc-input-group .nc-input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  .nc-linha-container-row {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr) auto;
    gap: 0.75rem;
    align-items: end;
    margin-bottom: 0.75rem;
  }
  .nc-linha-container-row .nc-field { margin-bottom: 0; }
  .nc-input-group {
    position: relative;
    display: flex;
    align-items: center;
  }
  .nc-input--with-suffix {
    padding-right: 4.25rem;
  }
  .nc-input-suffix {
    position: absolute;
    right: 1.85rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--text-secondary, #94a3b8);
    pointer-events: none;
    text-transform: uppercase;
  }
  .nc-input-group .nc-input[type="number"] {
    padding-right: 4.25rem;
  }
  .nc-textarea {
    min-height: 2.5rem;
    resize: vertical;
  }
  .nc-incoterm-stack {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .nc-incoterm-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: stretch;
    width: 100%;
  }
  .nc-incoterm-btn {
    padding: 0.5rem 0.35rem;
    min-width: 3.25rem;
    min-height: 2.5rem;
    background: var(--ws-bg-body, var(--bg-body, #0f172a));
    border: 1.5px solid var(--nc-accent-border);
    border-radius: var(--radius-md, 8px);
    color: var(--text-secondary, #94a3b8);
    font-size: 0.75rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.03em;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }
  .nc-incoterm-btn:hover {
    border-color: var(--nc-accent);
    color: var(--text-primary, #f1f5f9);
  }
  .nc-incoterm-btn--selected {
    background: var(--nc-accent-dim);
    border-color: var(--nc-accent);
    color: var(--nc-accent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--nc-accent) 35%, transparent);
  }
  .nc-incoterm-helper-card {
    background: var(--nc-accent-dim);
    border: 1px solid var(--nc-accent-border);
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
  }
  .nc-helper-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .nc-helper-header h4 {
    margin: 0;
    font-size: 0.875rem;
    color: var(--text-primary, #f8fafc);
  }
  .nc-helper-icon { color: var(--nc-accent); flex-shrink: 0; }
  .nc-helper-desc {
    margin: 0 0 0.65rem;
    font-size: 0.8125rem;
    line-height: 1.5;
    color: var(--text-secondary-light, #94a3b8);
  }
  .nc-helper-footer {
    font-size: 0.75rem;
    color: var(--text-secondary, #94a3b8);
  }
  .nc-fields-grid--summary-inputs {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 1.25rem;
  }
  @media (max-width: 900px) {
    .nc-cargo-subsecao-grid-identificacao,
    .nc-cargo-subsecao-grid-hs,
    .nc-cargo-perigosa-grid,
    .nc-cargo-cubagem-dimensoes-grid,
    .nc-linha-container-row,
    .nc-cargo-subsecao-grid-quantidade,
    .nc-fields-grid--summary-inputs {
      grid-template-columns: 1fr;
    }
  }
  .nc-input-icon-wrap {
    position: relative;
    width: 100%;
  }
  .nc-input-search-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted, #64748b);
    pointer-events: none;
    z-index: 2;
  }
  .nc-input--search {
    padding-left: 2rem !important;
  }
  .nc-prazo-data-hora {
    display: grid;
    grid-template-columns: 18.75rem 9rem;
    gap: 1rem;
    align-items: start;
  }
  .nc-prazo-data-hora .nc-field {
    display: grid;
    grid-template-rows: auto 2.5rem;
    gap: 0.5rem;
    align-content: start;
    min-width: 0;
  }
  .nc-prazo-data-hora .nc-field-label {
    min-height: 1.125rem;
    line-height: 1.125rem;
  }
  .nc-prazo-data-hora .nc-field > .cg-wrapper,
  .nc-prazo-data-hora .nc-field > .nc-input-icon-wrap {
    height: 2.5rem;
    min-height: 2.5rem;
    max-height: 2.5rem;
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }
  .nc-prazo-data-hora .nc-field > .nc-input-icon-wrap .nc-input {
    height: 2.5rem;
    min-height: 2.5rem;
    max-height: 2.5rem;
  }
  .nc-prazo-data-hora .nc-field > .cg-wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    gap: 0;
  }
  .nc-prazo-data-hora .nc-field > .cg-wrapper > div {
    flex: 1 1 auto;
    height: 2.5rem;
    min-height: 2.5rem;
    max-height: 2.5rem;
    width: 100%;
    min-width: 0;
  }
  @media (max-width: 560px) {
    .nc-prazo-data-hora {
      grid-template-columns: 1fr;
    }
  }
  .nc-visibilidade-subsecao .nc-options-grid-2 {
    gap: 0.75rem;
  }
  .nc-visibilidade-subsecao .nc-option-btn {
    align-items: flex-start;
    min-height: 5.5rem;
  }
  .nc-visibilidade-subsecao .nc-switch-row {
    background: transparent;
    border: none;
    border-top: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.06));
    border-radius: 0;
    margin-top: 1rem;
    padding: 1rem 0 0;
  }
  .nc-switch-row {
    background: var(--bg-base, rgba(15, 23, 42, 0.25));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.04));
    padding: 1rem 1.25rem;
    border-radius: 10px;
    margin-top: 1.25rem;
  }
  .nc-switch-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
    cursor: pointer;
    width: 100%;
  }
  .nc-switch-text {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }
  .nc-switch-title {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--text-primary, #f8fafc);
  }
  .nc-switch-desc {
    font-size: 0.75rem;
    line-height: 1.45;
    color: var(--text-secondary-light, #94a3b8);
  }
  .nc-switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
  }
  .nc-switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }
  .nc-switch-slider {
    position: absolute;
    cursor: pointer;
    inset: 0;
    background: rgba(148, 163, 184, 0.35);
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  .nc-switch-slider:before {
    content: '';
    position: absolute;
    height: 18px;
    width: 18px;
    left: 3px;
    top: 3px;
    background: #f8fafc;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }
  .nc-switch input:checked + .nc-switch-slider {
    background: var(--nc-option-accent, #818cf8);
  }
  .nc-switch input:checked + .nc-switch-slider:before {
    transform: translateX(20px);
  }
  .nc-disparo-canais {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.85rem 1.25rem;
    margin: 0.75rem 0 1rem;
  }
  .nc-disparo-canais-label {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-secondary-light, #94a3b8);
  }
  .nc-disparo-canal {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8125rem;
    color: var(--text-primary, #f1f5f9);
    cursor: pointer;
  }
  .nc-disparo-canal input {
    accent-color: #818cf8;
  }
  .nc-disparo-lista-wrap {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }
  .nc-disparo-selecionar-todos {
    margin-left: auto;
    background: none;
    border: none;
    color: #a78bfa;
    font-size: 0.625rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    font-family: inherit;
  }
  .nc-disparo-selecionar-todos:hover {
    text-decoration: underline;
  }
  .nc-disparo-lista {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 16rem;
    overflow: auto;
    padding-right: 0.15rem;
  }
  .nc-disparo-item {
    display: flex;
    flex-direction: column;
    gap: 0;
    padding: 0.65rem 0.85rem;
    border-radius: 8px;
    border: 1px solid rgba(148, 163, 184, 0.22);
    background: rgba(30, 41, 59, 0.85);
    color: var(--text-primary, #f1f5f9);
  }
  .nc-disparo-item--selected {
    border-color: rgba(99, 102, 241, 0.45);
    background: rgba(99, 102, 241, 0.08);
  }
  .nc-disparo-item-linha {
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    gap: 0.75rem;
    align-items: start;
  }
  .nc-disparo-item-check {
    display: flex;
    align-items: center;
    padding-top: 0.1rem;
    cursor: pointer;
  }
  .nc-disparo-item-check input {
    cursor: pointer;
    accent-color: #818cf8;
  }
  .nc-disparo-item-corpo {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    min-width: 0;
  }
  .nc-disparo-item-nome {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #f1f5f9);
  }
  .nc-disparo-item-meta {
    font-size: 0.75rem;
    color: var(--text-muted, #64748b);
    text-align: right;
    white-space: nowrap;
    padding-top: 0.15rem;
  }
  .nc-disparo-item-expandir {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    margin-top: 0.05rem;
    border-radius: 6px;
    border: 1px solid rgba(129, 140, 248, 0.3);
    background: rgba(99, 102, 241, 0.08);
    color: #a5b4fc;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;
    transition: transform 0.18s ease, background 0.18s ease;
  }
  .nc-disparo-item-expandir:hover {
    background: rgba(99, 102, 241, 0.18);
  }
  .nc-disparo-item-expandir--aberto {
    transform: rotate(180deg);
  }
  .nc-disparo-item-painel {
    margin-top: 0.65rem;
    padding-top: 0.65rem;
    border-top: 1px solid rgba(71, 85, 105, 0.45);
  }
  .nc-disparo-emails-titulo {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    margin: 0 0 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
    color: #a5b4fc;
  }
  .nc-disparo-emails-lista {
    list-style: none;
    margin: 0 0 0.65rem;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .nc-disparo-email-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.45rem 0.55rem;
    border-radius: 8px;
    background: rgba(15, 23, 42, 0.45);
    border: 1px solid rgba(71, 85, 105, 0.4);
  }
  .nc-disparo-email-endereco {
    font-size: 0.8125rem;
    color: var(--text-primary, #f1f5f9);
    word-break: break-all;
  }
  .nc-disparo-email-row-acoes {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }
  .nc-disparo-email-acao {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid transparent;
    background: transparent;
    color: #a5b4fc;
    cursor: pointer;
    padding: 0;
  }
  .nc-disparo-email-acao:hover {
    background: rgba(99, 102, 241, 0.15);
  }
  .nc-disparo-email-acao--excluir {
    color: #f87171;
  }
  .nc-disparo-email-acao--excluir:hover {
    background: rgba(239, 68, 68, 0.12);
  }
  .nc-disparo-email-edicao,
  .nc-disparo-email-novo {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }
  .nc-disparo-email-acoes-form {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
  .nc-disparo-email-link {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 0.75rem;
    cursor: pointer;
    padding: 0;
  }
  .nc-disparo-email-salvar {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    border: 1px solid rgba(129, 140, 248, 0.35);
    background: rgba(99, 102, 241, 0.15);
    color: #c7d2fe;
    border-radius: 8px;
    padding: 0.4rem 0.7rem;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    width: fit-content;
  }
  .nc-disparo-email-salvar:hover {
    background: rgba(99, 102, 241, 0.25);
  }
  .nc-disparo-email-erro {
    margin: 0.35rem 0 0;
    font-size: 0.75rem;
    color: #fca5a5;
  }
  .nc-disparo-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.6875rem;
    font-weight: 600;
    padding: 0.15rem 0.45rem;
    border-radius: 999px;
    width: fit-content;
  }
  .nc-disparo-badge--ok {
    color: #86efac;
    background: rgba(34, 197, 94, 0.12);
  }
  .nc-disparo-badge--warn {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.12);
  }
  .nc-receipt-card {
    background: var(--bg-surface, rgba(15, 23, 42, 0.45));
    border: 1px solid var(--border-subtle, rgba(255, 255, 255, 0.08));
    border-radius: 12px;
    padding: 1.75rem 2rem;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    position: relative;
    overflow: hidden;
  }
  .nc-receipt-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--nc-option-accent, #818cf8), var(--success, #10b981));
  }
  .nc-receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.75rem;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.08);
    padding-bottom: 1rem;
  }
  .nc-receipt-badge {
    background: rgba(129, 140, 248, 0.15);
    color: #a5b4fc;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 0.35rem 0.75rem;
    border-radius: 8px;
    text-transform: uppercase;
  }
  .nc-receipt-modal {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary, #94a3b8);
  }
  .nc-route-timeline {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin: 1.75rem 0 2.5rem 0;
  }
  .nc-timeline-node {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex: 1;
  }
  .nc-timeline-node:last-child {
    justify-content: flex-end;
    text-align: right;
  }
  .nc-node-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .nc-node-dot--origin {
    background: var(--nc-option-accent, #818cf8);
    box-shadow: 0 0 8px rgba(129, 140, 248, 0.55);
  }
  .nc-node-dot--destination {
    background: var(--success, #10b981);
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.45);
  }
  .nc-node-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    text-align: center;
    min-width: 0;
  }
  .nc-node-code {
    font-size: 1.0625rem;
    font-weight: 800;
    color: #fff;
    line-height: 1.2;
  }
  .nc-node-name {
    font-size: 0.8125rem;
    color: var(--text-secondary-light, #cbd5e1);
    word-break: break-word;
  }
  .nc-timeline-line {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100px;
    flex-shrink: 0;
  }
  .nc-timeline-line-fill {
    height: 2px;
    background: linear-gradient(90deg, var(--nc-option-accent, #818cf8), var(--success, #10b981));
    width: 100%;
    border-radius: 2px;
  }
  .nc-timeline-icon-wrap {
    position: absolute;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--bg-surface, #1e293b);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary, #94a3b8);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  .nc-receipt-details {
    display: flex;
    flex-direction: column;
    gap: 0.875rem;
  }
  .nc-receipt-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  }
  .nc-receipt-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .nc-receipt-label {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    color: var(--text-secondary-light, #cbd5e1);
    flex-shrink: 0;
  }
  .nc-receipt-label svg {
    color: var(--text-secondary, #94a3b8);
    flex-shrink: 0;
  }
  .nc-receipt-value {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-primary, #f8fafc);
    text-align: right;
    min-width: 0;
    word-break: break-word;
  }
  .nc-receipt-value.font-mono {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }
  .nc-receipt-value--incoterm {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 2.75rem;
    padding: 0.15rem 0.55rem;
    border-radius: 6px;
    border: 1px solid rgba(129, 140, 248, 0.45);
    color: #c7d2fe;
    background: rgba(99, 102, 241, 0.12);
  }
  .nc-receipt-value-tooltip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
  }
  .nc-receipt-value-tooltip svg {
    color: var(--text-secondary, #94a3b8);
    flex-shrink: 0;
    opacity: 0.75;
  }
  .nc-resumo-sucesso {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    min-height: 120px;
  }
  .nc-resumo-sucesso-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: color-mix(in srgb, var(--success, #22c55e) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--success, #22c55e) 35%, transparent);
    border-radius: var(--radius-md, 8px);
  }
  .nc-resumo-sucesso-banner__texto {
    margin: 0;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-primary, #f8fafc);
    line-height: 1.5;
  }
  .nc-resumo-sucesso-banner__texto strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
    font-weight: 700;
  }
  @media (max-width: 500px) {
    .nc-route-timeline {
      flex-direction: column;
      align-items: flex-start;
      gap: 1.5rem;
    }
    .nc-timeline-line {
      width: 2px;
      height: 40px;
      margin-left: 5px;
    }
    .nc-timeline-line-fill {
      width: 2px;
      height: 100%;
    }
  }
`
