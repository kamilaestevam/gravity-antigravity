import { Bell, CaretLeft, CaretRight, ChatText, CheckCircle, Clock } from '@phosphor-icons/react'
import {
  TooltipGraficoInsightsSimulador,
  useTooltipFixoInsightsSimulador,
} from '../smart-doc/tooltip-grafico-insights-simulador'
import type { AlertaPedidoSimulador } from './dados-insights-simulador-pedido'
import './alertas-painel-simulador-pedido.css'

type Props = {
  alertas: AlertaPedidoSimulador[]
}

function resolverEstiloAlerta(cor: AlertaPedidoSimulador['cor']) {
  if (cor === 'yellow') {
    return {
      icon: <ChatText size={13} weight="duotone" />,
      border: '#fbbf24',
      bg: 'rgba(251, 191, 36, 0.04)',
      glow: 'rgba(251, 191, 36, 0.15)',
    }
  }
  if (cor === 'green') {
    return {
      icon: <Bell size={13} weight="duotone" />,
      border: '#34d399',
      bg: 'rgba(52, 211, 153, 0.04)',
      glow: 'rgba(52, 211, 153, 0.15)',
    }
  }
  if (cor === 'orange') {
    return {
      icon: <CheckCircle size={13} weight="duotone" />,
      border: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.04)',
      glow: 'rgba(245, 158, 11, 0.15)',
    }
  }
  return {
    icon: <Clock size={13} weight="duotone" />,
    border: '#f87171',
    bg: 'rgba(248, 113, 113, 0.04)',
    glow: 'rgba(248, 113, 113, 0.15)',
  }
}

export function AlertasPainelSimuladorPedido({ alertas }: Props) {
  const alertaTooltip = useTooltipFixoInsightsSimulador<AlertaPedidoSimulador>()

  return (
    <section className="pds-alertas-painel pds-insights-card pds-insights-card--com-tooltip" aria-label="Alertas" data-sds-tutorial-alvo="pedido-insights-alertas">
      <div className="pds-alertas-painel__header">
        <div className="pds-alertas-painel__titulo-wrap">
          <span className="pds-alertas-painel__icone" aria-hidden>
            <Bell size={14} weight="duotone" style={{ color: '#f87171' }} />
          </span>
          <h3 className="pds-alertas-painel__titulo">Alertas</h3>
        </div>
        <div className="pds-alertas-painel__data-nav" aria-label="Período dos alertas">
          <button type="button" aria-label="Dia anterior">
            <CaretLeft size={11} weight="bold" />
          </button>
          <span>Hoje</span>
          <button type="button" aria-label="Próximo dia">
            <CaretRight size={11} weight="bold" />
          </button>
        </div>
      </div>

      <div className="sr-insights-tt-host" ref={alertaTooltip.containerRef}>
        <div
          className="pds-alertas-painel__grid"
          data-sds-tutorial-alvo="pedido-insights-alertas-observacoes"
        >
          {alertas.map((alerta) => {
            const estilo = resolverEstiloAlerta(alerta.cor)
            return (
              <button
                key={alerta.rotulo}
                type="button"
                className="pds-alertas-painel__card"
                style={{
                  background: estilo.bg,
                  borderLeftColor: estilo.border,
                }}
                onClick={(e) => alertaTooltip.aoClicar(e, alerta)}
              >
                <div className="pds-alertas-painel__card-topo">
                  <span style={{ color: estilo.border }}>{estilo.icon}</span>
                  <strong>{alerta.valor.toLocaleString('pt-BR')}</strong>
                </div>
                <span className="pds-alertas-painel__card-rotulo">{alerta.rotulo}</span>
              </button>
            )
          })}
        </div>

        {alertaTooltip.estado && (
          <TooltipGraficoInsightsSimulador
            ancora={alertaTooltip.estado.ancora}
            containerRef={alertaTooltip.containerRef}
            onFechar={alertaTooltip.fechar}
            conteudo={{
              titulo: alertaTooltip.estado.dados.rotulo,
              total: alertaTooltip.estado.dados.valor,
              totalRotulo: 'pedidos',
              linhas: [{ cor: '#f87171', rotulo: 'Descrição', valor: alertaTooltip.estado.dados.descricao }],
            }}
          />
        )}
      </div>
    </section>
  )
}
