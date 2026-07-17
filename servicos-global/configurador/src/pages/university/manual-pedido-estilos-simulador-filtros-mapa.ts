import { MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX } from './manual-tipografia'

/** SSOT visual — simulador Refinar mapa (Insights Pedido) + layout split mapa/menu.
 *  Cores de operação/trilhos: paridade `PedidosVisaoGeral.tsx` + `mapa-globo-simulador-pedido.tsx`. */
export const NC_ESTILOS_SIMULADOR_FILTROS_MAPA_PEDIDO = `
  #sim-pedido-filtros-mapa {
    --pds-mapa-cor-importacao: #f59e0b;
    --pds-mapa-cor-exportacao: #a78bfa;
    --pds-mapa-fundo-importacao: rgba(245, 158, 11, 0.08);
    --pds-mapa-fundo-exportacao: rgba(167, 139, 250, 0.08);
    --pds-mapa-borda-importacao: rgba(245, 158, 11, 0.55);
    --pds-mapa-borda-exportacao: rgba(167, 139, 250, 0.55);
    --pds-mapa-anel-importacao: 0 0 0 1px rgba(245, 158, 11, 0.35);
    --pds-mapa-anel-exportacao: 0 0 0 1px rgba(167, 139, 250, 0.35);
    --pds-mapa-filtro-selecionado: #6366f1;
    --pds-mapa-filtro-selecionado-fundo: rgba(99, 102, 241, 0.08);
    --pds-mapa-filtro-selecionado-borda: #6366f1;
    --pds-mapa-filtro-selecionado-anel: 0 0 0 1px #6366f1;
  }

  #sim-pedido-filtros-mapa .sim-modal-operacao-layout {
    display: grid;
    grid-template-columns: 1fr;
    gap: ${MANUAL_ESPACO_ENTRE_PASSOS_GUIA_PX}px;
    align-items: start;
    width: 100%;
  }

  #sim-pedido-filtros-mapa .sim-modal-operacao-layout > .sim-guia-sticky-col {
    position: static;
    max-height: min(560px, calc(100vh - 100px));
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-shell {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 255, 255, 0.06);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-shell__header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 18px 12px;
    background: rgba(15, 23, 42, 0.55);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-shell__titulo {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.35;
    letter-spacing: 0.02em;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-shell__subtitulo {
    margin: 4px 0 0;
    font-size: 0.72rem;
    color: #94a3b8;
    line-height: 1.45;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-split {
    display: grid;
    grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
    min-height: 460px;
    align-items: stretch;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel {
    border-right: 1px solid rgba(255, 255, 255, 0.06);
    background: rgba(15, 23, 42, 0.4);
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__topo {
    padding: 12px 14px 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__titulo {
    margin: 0;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: #f1f5f9;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__resumo {
    margin: 6px 0 0;
    font-size: 0.67rem;
    font-weight: 600;
    color: #94a3b8;
    line-height: 1.4;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__toolbar {
    display: flex;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__toolbar-btn,
  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__limpar {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
    color: #cbd5e1;
    border-radius: 9999px;
    padding: 5px 10px;
    font-size: 0.625rem;
    font-weight: 600;
    cursor: pointer;
    transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__toolbar-btn:hover,
  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__limpar:hover:not(:disabled) {
    color: #f1f5f9;
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.07);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-painel__limpar:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-acordeao {
    flex: 1;
    overflow: auto;
    padding: 8px 10px 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }

  #sim-pedido-filtros-mapa .pds-filtros-secao {
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.03);
  }

  #sim-pedido-filtros-mapa .pds-filtros-secao--foco {
    border-color: rgba(99, 102, 241, 0.45);
    box-shadow: var(--pds-mapa-filtro-selecionado-anel);
  }

  #sim-pedido-filtros-mapa .pds-filtros-secao__cabecalho {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border: none;
    background: transparent;
    color: #e2e8f0;
    cursor: pointer;
    text-align: left;
  }

  #sim-pedido-filtros-mapa .pds-filtros-secao__cabecalho span {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.04em;
  }

  #sim-pedido-filtros-mapa .pds-filtros-secao__corpo {
    padding: 0 10px 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  #sim-pedido-filtros-mapa .pds-filtros-operacao-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  #sim-pedido-filtros-mapa .pds-filtros-operacao-card {
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.03);
    padding: 10px 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
    color: #cbd5e1;
    font-size: 0.7rem;
    font-weight: 700;
  }

  #sim-pedido-filtros-mapa .pds-filtros-operacao-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
  }

  #sim-pedido-filtros-mapa .pds-filtros-operacao-card--importacao.is-active {
    color: #f1f5f9;
    background: var(--pds-mapa-fundo-importacao);
    border-color: var(--pds-mapa-cor-importacao);
    box-shadow: var(--pds-mapa-anel-importacao);
  }

  #sim-pedido-filtros-mapa .pds-filtros-operacao-card--exportacao.is-active {
    color: #f1f5f9;
    background: var(--pds-mapa-fundo-exportacao);
    border-color: var(--pds-mapa-cor-exportacao);
    box-shadow: var(--pds-mapa-anel-exportacao);
  }

  #sim-pedido-filtros-mapa .pds-filtros-lista {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-height: 148px;
    overflow: auto;
  }

  #sim-pedido-filtros-mapa .pds-filtros-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    padding: 7px 9px;
    cursor: pointer;
    color: #cbd5e1;
    font-size: 0.68rem;
    text-align: left;
    transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
  }

  #sim-pedido-filtros-mapa .pds-filtros-item:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.12);
    color: #f1f5f9;
  }

  #sim-pedido-filtros-mapa .pds-filtros-item.is-active {
    color: #f1f5f9;
    background: var(--pds-mapa-filtro-selecionado-fundo);
    border-color: var(--pds-mapa-filtro-selecionado-borda);
    box-shadow: var(--pds-mapa-filtro-selecionado-anel);
  }

  #sim-pedido-filtros-mapa .pds-filtros-item__esquerda {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }

  #sim-pedido-filtros-mapa .pds-filtros-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    flex-shrink: 0;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-canvas {
    min-width: 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
    background: rgba(15, 23, 42, 0.35);
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-canvas .pds-mapa-globo {
    border: none;
    border-radius: 0;
    box-shadow: none;
    flex: 1;
    min-height: 460px;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-canvas .pds-mapa-globo__header {
    padding: 10px 14px 0;
  }

  #sim-pedido-filtros-mapa .pds-filtros-mapa-canvas .pds-mapa-globo__canvas-wrap {
    min-height: 380px;
    flex: 1;
  }

  #sim-pedido-filtros-mapa .pds-filtros-affordance {
    outline: 2px solid rgba(99, 102, 241, 0.55);
    outline-offset: 2px;
    animation: pds-filtros-pulse 1.8s ease-in-out infinite;
  }

  @keyframes pds-filtros-pulse {
    0%, 100% { outline-color: rgba(99, 102, 241, 0.35); }
    50% { outline-color: rgba(99, 102, 241, 0.75); }
  }

  @media (max-width: 1040px) {
    #sim-pedido-filtros-mapa .pds-filtros-mapa-split {
      grid-template-columns: 1fr;
    }
    #sim-pedido-filtros-mapa .pds-filtros-mapa-painel {
      border-right: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      max-height: 320px;
    }
  }
`
