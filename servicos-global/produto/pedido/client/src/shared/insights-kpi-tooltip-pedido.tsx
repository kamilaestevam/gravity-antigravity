/**
 * Tooltip dos KPIs fixos do topo da Visão Geral Insights (padrão CardBasicoGlobal + BID Frete).
 */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fmtMoeda, type Pedido } from './types'

export const LIMITE_PEDIDOS_TOOLTIP_KPI_INSIGHTS = 8

function somaValorPedidos(lista: Pedido[]): number {
  return lista.reduce((s, p) => {
    const v = Number(p.valor_total_pedido)
    return s + (Number.isFinite(v) ? v : 0)
  }, 0)
}

function contarPorOperacao(pedidos: Pedido[]): { importacao: number; exportacao: number } {
  let importacao = 0
  let exportacao = 0
  for (const pedido of pedidos) {
    if (pedido.tipo_operacao === 'exportacao') exportacao += 1
    else importacao += 1
  }
  return { importacao, exportacao }
}

function ordenarPedidosTooltip(pedidos: Pedido[]): Pedido[] {
  return [...pedidos].sort((a, b) => {
    const va = Number(a.valor_total_pedido)
    const vb = Number(b.valor_total_pedido)
    const na = Number.isFinite(va) ? va : 0
    const nb = Number.isFinite(vb) ? vb : 0
    if (nb !== na) return nb - na
    return a.numero_pedido.localeCompare(b.numero_pedido)
  })
}

function moedaPedido(pedido: Pedido): string {
  return (pedido.moeda_pedido || 'BRL').toUpperCase()
}

function formatarVolumeTotalTooltip(pedidos: Pedido[], multiplasMoedasLabel: string): string {
  if (pedidos.length === 0) return '—'
  const moedas = new Set(pedidos.map(moedaPedido))
  if (moedas.size > 1) return multiplasMoedasLabel
  const total = somaValorPedidos(pedidos)
  if (total <= 0) return '—'
  return fmtMoeda(total, [...moedas][0] ?? 'BRL')
}

type InsightsKpiTooltipPedidoProps = {
  tituloContagem: string
  pedidos: Pedido[]
}

export function InsightsKpiTooltipPedido({ tituloContagem, pedidos }: InsightsKpiTooltipPedidoProps) {
  const { t } = useTranslation()
  const volumeFmt = formatarVolumeTotalTooltip(
    pedidos,
    t('pedido.visao_geral.kpi.tooltip_volume_multiplas_moedas', { defaultValue: 'Múltiplas moedas' }),
  )
  const { importacao, exportacao } = contarPorOperacao(pedidos)
  const ordenados = ordenarPedidosTooltip(pedidos)
  const exibidos = ordenados.slice(0, LIMITE_PEDIDOS_TOOLTIP_KPI_INSIGHTS)
  const restantes = pedidos.length - exibidos.length

  return (
    <div className="bfd-kpi-tooltip-insights">
      <div className="cg-tooltip__row">
        <span>{t('pedido.visao_geral.kpi.tooltip_volume', { defaultValue: 'Volume total' })}</span>
        <strong>{volumeFmt}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>{tituloContagem}</span>
        <strong>{pedidos.length}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>{t('pedido.visao_geral.kpi.tooltip_importacao', { defaultValue: 'Importação' })}</span>
        <strong style={{ color: '#f59e0b' }}>{importacao}</strong>
      </div>
      <div className="cg-tooltip__row">
        <span>{t('pedido.visao_geral.kpi.tooltip_exportacao', { defaultValue: 'Exportação' })}</span>
        <strong style={{ color: '#a78bfa' }}>{exportacao}</strong>
      </div>

      {exibidos.length > 0 && (
        <>
          <div className="cg-tooltip__divider" style={{ margin: '0.65rem 0 0.45rem' }} />
          <div className="bfd-kpi-tooltip-insights__head bfd-kpi-tooltip-insights__head--duas-colunas">
            <span>{t('pedido.visao_geral.kpi.tooltip_coluna_pedido', { defaultValue: 'Pedido' })}</span>
            <span className="bfd-kpi-tooltip-insights__valor-cabecalho">
              {t('pedido.visao_geral.kpi.tooltip_coluna_valor', { defaultValue: 'Valor' })}
            </span>
          </div>
          <div className="bfd-kpi-tooltip-insights__lista">
            {exibidos.map((pedido) => {
              const valor = Number(pedido.valor_total_pedido)
              const valorFmt =
                Number.isFinite(valor) && valor > 0 ? fmtMoeda(valor, moedaPedido(pedido)) : '—'
              return (
                <div
                  key={pedido.id}
                  className="bfd-kpi-tooltip-insights__row bfd-kpi-tooltip-insights__row--duas-colunas"
                >
                  <Link
                    to="/pedido/pedidos/lista"
                    state={{
                      openPedidoId: pedido.id,
                      expandirItens: true,
                      numeroPedido: pedido.numero_pedido,
                    }}
                    className="bfd-kpi-tooltip-insights__link"
                  >
                    {pedido.numero_pedido}
                  </Link>
                  <span className="bfd-kpi-tooltip-insights__valor">{valorFmt}</span>
                </div>
              )
            })}
          </div>
          {restantes > 0 && (
            <p className="bfd-kpi-tooltip-insights__mais">
              {t('pedido.visao_geral.kpi.tooltip_mais_pedidos', {
                count: restantes,
                defaultValue: `+${restantes} pedido(s) não exibido(s)`,
              })}
            </p>
          )}
        </>
      )}
    </div>
  )
}
