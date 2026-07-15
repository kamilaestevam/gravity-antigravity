/**
 * DashboardPainelEditarModal — Edição rápida de widget (título, gráfico, período)
 *
 * Layout alinhado ao wizard Novo Widget (ModalPassoPassoGlobal + .dq-secao + CampoGeralGlobal).
 */

import React, { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChartLine,
  ChartBar,
  ChartBarHorizontal,
  ChartDonut,
  NumberSquareOne,
  Funnel,
  ChartPieSlice,
  Gauge,
  Table,
} from '@phosphor-icons/react'
import { ModalPassoPassoGlobal } from '@nucleo/modal-passo-passo-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { CampoGeralGlobal } from '@nucleo/campo-geral-global'
import { buildDefaultPeriodOptions } from '../DashboardBarraFerramentas/DashboardBarraFerramentas.js'
import { PeriodoCampoFormulario } from '../periodoCampoFormulario.js'
import '../DashboardConstrutorConsulta/dashboard-construtor-consulta.css'
import type { DashboardWidgetConfig, ChartType } from '../tipos.js'

export interface ChartOptionMeta {
  type: ChartType
  label: string
  icone: React.ReactNode
}

function buildDefaultChartOptions(t: (k: string) => string): ChartOptionMeta[] {
  return [
    { type: 'KPI_CARD',       label: t('nucleo.dashboard.chart.kpi'),          icone: <NumberSquareOne size={22} /> },
    { type: 'LINE',           label: t('nucleo.dashboard.chart.linha'),        icone: <ChartLine size={22} /> },
    { type: 'AREA',           label: t('nucleo.dashboard.chart.area'),         icone: <ChartLine size={22} weight="fill" /> },
    { type: 'BAR',            label: t('nucleo.dashboard.chart.barras'),       icone: <ChartBar size={22} /> },
    { type: 'BAR_HORIZONTAL', label: t('nucleo.dashboard.chart.barras_h'),     icone: <ChartBarHorizontal size={22} /> },
    { type: 'DISTRIBUTION',   label: t('nucleo.dashboard.chart.distribuicao'), icone: <ChartPieSlice size={22} /> },
    { type: 'DONUT',          label: t('nucleo.dashboard.chart.donut'),        icone: <ChartDonut size={22} /> },
    { type: 'TABLE',          label: t('nucleo.dashboard.chart.tabela'),       icone: <Table size={22} /> },
    { type: 'FUNNEL',         label: t('nucleo.dashboard.chart.funil'),        icone: <Funnel size={22} /> },
    { type: 'GAUGE',          label: t('nucleo.dashboard.chart.gauge'),        icone: <Gauge size={22} /> },
  ]
}

export interface PeriodOptionEdit {
  value: string
  label: string
}

export interface ModalEditarWidgetProps {
  widget: DashboardWidgetConfig | null
  aberto: boolean
  onFechar: () => void
  onSalvar: (patch: Partial<DashboardWidgetConfig>) => void
  /** Labels legíveis por chave de campo. Ex: { total_pedidos: 'Total de Pedidos' } */
  fieldLabels?: Record<string, string>
  /** Tipos de gráfico disponíveis para seleção. Padrão: catálogo completo do núcleo. */
  chartOptions?: ChartOptionMeta[]
  /** Opções de período disponíveis. */
  periodOptions?: PeriodOptionEdit[]
}

const PASSO_UNICO = [{ id: 1, label: '' }]

export function DashboardPainelEditarModal({
  widget,
  aberto,
  onFechar,
  onSalvar,
  fieldLabels = {},
  chartOptions: chartOptionsProp,
  periodOptions: periodOptionsProp,
}: ModalEditarWidgetProps) {
  const { t } = useTranslation()
  const chartOptions = useMemo(() => chartOptionsProp ?? buildDefaultChartOptions(t), [chartOptionsProp, t])
  const periodOptions = useMemo(
    () => periodOptionsProp ?? buildDefaultPeriodOptions(t),
    [periodOptionsProp, t],
  )
  const [title, setTitle] = useState('')
  const [chartType, setChartType] = useState<ChartType>('LINE')
  const [period, setPeriod] = useState('30d')
  const [initial, setInitial] = useState({ title: '', chartType: 'LINE' as ChartType, period: '30d' })

  useEffect(() => {
    if (aberto && widget) {
      const init = {
        title: widget.title,
        chartType: widget.chart_type,
        period: widget.query_spec.filters.period ?? '30d',
      }
      setInitial(init)
      setTitle(init.title)
      setChartType(init.chartType)
      setPeriod(init.period)
    }
  }, [aberto, widget])

  if (!widget) return null

  const dirty =
    title !== initial.title ||
    chartType !== initial.chartType ||
    period !== initial.period
  const podeSalvar = dirty && title.trim().length > 0

  function handleSalvar() {
    if (!podeSalvar) return
    onSalvar({
      title: title.trim(),
      chart_type: chartType,
      query_spec: { ...widget.query_spec, filters: { period } },
    })
    onFechar()
  }

  return (
    <ModalPassoPassoGlobal
      titulo={t('nucleo.dashboard.modal_editar.titulo')}
      icone={<Gauge size={20} weight="duotone" />}
      subtitulo={widget.title}
      aberto={aberto}
      passos={PASSO_UNICO}
      passoAtual={1}
      ocultarStepper
      ocultarFooter
      onProximo={handleSalvar}
      onVoltar={onFechar}
      onFechar={onFechar}
      tamanho="md"
      altura="auto"
      footerCustom={
        <div className="dq-editar-widget__footer">
          <BotaoGlobal variante="fantasma" tamanho="padrao" onClick={onFechar}>
            {t('nucleo.dashboard.modal_editar.cancelar')}
          </BotaoGlobal>
          <BotaoGlobal
            variante="primario"
            tamanho="padrao"
            onClick={handleSalvar}
            disabled={!podeSalvar}
            data-sds-tutorial-alvo="pedido-dashboard-editar-salvar"
          >
            {t('nucleo.dashboard.modal_editar.salvar')}
          </BotaoGlobal>
        </div>
      }
    >
      <div className="dq-construtor dq-construtor--editar">
        <div className="dq-construtor__corpo">
          <div className="dq-secao">
            <span className="dq-secao-titulo">
              {t('nucleo.dashboard.construtor.secao_configuracao', { defaultValue: 'Configuração' })}
            </span>
            <div className="dq-form__stack">
              <div data-sds-tutorial-alvo="pedido-dashboard-editar-titulo">
              <CampoGeralGlobal
                label={t('nucleo.dashboard.modal_editar.label_titulo')}
                htmlFor="widget-edit-title"
                obrigatorio
                vazio={!title.trim()}
              >
                <input
                  id="widget-edit-title"
                  type="text"
                  placeholder={t('nucleo.dashboard.construtor.titulo_widget_placeholder')}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={80}
                  autoComplete="off"
                  autoFocus
                />
              </CampoGeralGlobal>
              </div>

              <div data-sds-tutorial-alvo="pedido-dashboard-editar-grafico">
              <CampoGeralGlobal label={t('nucleo.dashboard.modal_editar.tipo_grafico')}>
                <div className="dq-chart__grid dq-chart__grid--editar">
                  {chartOptions.map(opt => {
                    const isSelected = chartType === opt.type
                    const cardClass = [
                      'dq-chart__card',
                      isSelected ? 'dq-chart__card--selecionado' : '',
                    ].filter(Boolean).join(' ')
                    return (
                      <button
                        key={opt.type}
                        type="button"
                        className={cardClass}
                        onClick={() => setChartType(opt.type)}
                        aria-pressed={isSelected}
                        title={opt.label}
                      >
                        <span className="dq-chart__card-inner">
                          <span
                            className="dq-chart__icone"
                            style={{
                              color: isSelected ? 'var(--accent)' : 'var(--text-secondary)',
                            }}
                          >
                            {opt.icone}
                          </span>
                          <span className="dq-chart__rotulo">{opt.label}</span>
                        </span>
                      </button>
                    )
                  })}
                </div>
              </CampoGeralGlobal>
              </div>

              <div data-sds-tutorial-alvo="pedido-dashboard-editar-periodo">
              <CampoGeralGlobal label={t('nucleo.dashboard.modal_editar.periodo')}>
                <PeriodoCampoFormulario
                  value={period}
                  options={periodOptions}
                  onChange={setPeriod}
                />
              </CampoGeralGlobal>
              </div>
            </div>
          </div>

          <div className="dq-secao dq-secao--indicador" data-sds-tutorial-alvo="pedido-dashboard-editar-indicador">
            <span className="dq-secao-titulo">
              {t('nucleo.dashboard.modal_editar.secao_indicador', { defaultValue: 'Indicador' })}
            </span>
            <div className="dq-op__lista">
              {widget.query_spec.fields.map(fqs => (
                <div key={fqs.key} className="dq-op__linha dq-op__linha--somente-leitura">
                  <span className="dq-op__campo">
                    <span>{fieldLabels[fqs.key] ?? fqs.key}</span>
                  </span>
                  <span className="dq-op__fixa">{fqs.operation}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ModalPassoPassoGlobal>
  )
}
