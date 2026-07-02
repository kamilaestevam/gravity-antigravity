import type { TFunction } from 'i18next'
import type {
  DashboardWidgetConfig,
  DerivedMetric,
  EnrichedCatalogField,
} from '@nucleo/dashboard'
import type { SuggestedWidget } from '@nucleo/dashboard'
import type { GabiInsightItem, DashboardKpis } from './api'
import { BUILT_IN_DERIVED } from './derivedMetrics'

function fmtUsdInsight(valor: number, locale?: string): string {
  return new Intl.NumberFormat(locale ?? 'pt-BR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(valor)
}

/** Títulos PT dos widgets built-in (operacional + fornecedor). */
const TITULO_WIDGET_PADRAO: Record<string, string> = {
  kpi_saving_total: 'Saving Total',
  kpi_valor_medio: 'Valor Médio Ganho',
  kpi_transit_time: 'Transit Time Médio',
  kpi_ganho_percentual: 'Ganho Percentual',
  gabi_insights: 'GABI AI · Insights',
  volume_mensal_chart: 'Volume Mensal de Cotações',
  section_alertas: 'Alertas e Fluxos Operacionais',
  kpi_cotacoes_andamento: 'Cotações em Andamento',
  kpi_cotacoes_passadas: 'Cotações Passadas',
  kpi_valor_aprovado: 'Valor Total Aprovado',
  status_dist_chart: 'Cotações por Status',
  kpi_pendentes_fornecedor: 'Aguardando resposta',
  kpi_propostas_enviadas_fornecedor: 'Propostas enviadas',
  kpi_taxa_resposta_fornecedor: 'Taxa de resposta',
  kpi_taxa_aprovacao_fornecedor: 'Taxa de aprovação',
  gabi_insights_fornecedor: 'GABI AI · Insights',
  volume_mensal_fornecedor: 'Volume mensal de propostas',
  section_funil_fornecedor: 'Funil e resultados',
  kpi_em_analise_fornecedor: 'Em análise',
  kpi_aprovadas_fornecedor: 'Aprovadas',
  kpi_reprovadas_fornecedor: 'Reprovadas',
  funil_dist_fornecedor: 'Funil das propostas',
}

const LABEL_CATALOGO_PADRAO: Record<string, string> = {
  saving_total: 'Saving Total (Ganho vs Meta)',
  valor_medio_ganho_bid_frete_internacional: 'Valor Médio Ganho',
  cotacoes_status: 'Cotações por Status',
  ganho_percentual_ganho_bid_frete_internacional: 'Ganho Percentual Médio',
  transit_time: 'Transit Time Médio (Dias)',
  volume_mensal: 'Volume Mensal de Cotações',
  cotacoes_andamento: 'Cotações em Andamento',
  cotacoes_passadas: 'Cotações Passadas',
  valor_andamento_usd: 'Valor Total em Andamento (USD)',
  valor_aprovado_usd: 'Valor Total Aprovado (USD)',
}

const STATUS_TOOLBAR_PADRAO: Record<string, string> = {
  rascunho: 'Rascunho',
  em_cotacao: 'Em Cotação',
  aguardando_aprovacao: 'Pendente Aprovação',
  aprovada: 'Aprovadas',
}

export function traduzirTituloWidgetDashboard(
  t: TFunction,
  widget: DashboardWidgetConfig,
): string {
  const padrao = TITULO_WIDGET_PADRAO[widget.id] ?? widget.title
  return t(`bidfrete.dashboard.widgets.${widget.id}`, { defaultValue: padrao })
}

export function traduzirWidgetDashboard(
  t: TFunction,
  widget: DashboardWidgetConfig,
): DashboardWidgetConfig {
  return { ...widget, title: traduzirTituloWidgetDashboard(t, widget) }
}

export function traduzirLabelCampoCatalogoDashboard(
  t: TFunction,
  key: string,
  padraoPt: string,
): string {
  return t(`bidfrete.dashboard.catalog.${key}`, {
    defaultValue: LABEL_CATALOGO_PADRAO[key] ?? padraoPt,
  })
}

export function traduzirCatalogoDashboard(
  t: TFunction,
  catalog: EnrichedCatalogField[],
): EnrichedCatalogField[] {
  return catalog.map(f => ({
    ...f,
    label: traduzirLabelCampoCatalogoDashboard(t, f.key, f.label),
    dimensionLabel: f.dimensionLabel
      ? t(`bidfrete.dashboard.catalog_dimensao.${f.dimension ?? 'status_cotacao'}`, {
          defaultValue: f.dimensionLabel,
        })
      : undefined,
  }))
}

export function traduzirStatusCotacaoDashboard(
  t: TFunction,
  statusKey: string,
  padraoPt: string,
): string {
  return t(`bidfrete.status_cotacao.${statusKey}`, { defaultValue: padraoPt })
}

export function traduzirMapaStatusCotacaoDashboard(
  t: TFunction,
  labels: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(labels).map(([key, label]) => [
      key,
      traduzirStatusCotacaoDashboard(t, key, label),
    ]),
  )
}

export function traduzirStatusToolbarDashboard(
  t: TFunction,
  key: string,
): string {
  return t(`bidfrete.dashboard.status_toolbar.${key}`, {
    defaultValue: STATUS_TOOLBAR_PADRAO[key] ?? key,
  })
}

export function traduzirMetricaDerivadaDashboard(
  t: TFunction,
  dm: DerivedMetric,
): DerivedMetric {
  const builtIn = BUILT_IN_DERIVED.find(b => b.id === dm.id)
  if (!builtIn) return dm
  return {
    ...dm,
    label: t(`bidfrete.dashboard.derivadas.${dm.id}.label`, { defaultValue: builtIn.label }),
    description: t(`bidfrete.dashboard.derivadas.${dm.id}.description`, {
      defaultValue: builtIn.description,
    }),
  }
}

export function traduzirSugestaoDashboard(
  t: TFunction,
  sug: SuggestedWidget,
  catalogByKey: Record<string, EnrichedCatalogField>,
): SuggestedWidget {
  const labelCampo = (key: string) => {
    const cat = catalogByKey[key]
    return cat
      ? traduzirLabelCampoCatalogoDashboard(t, key, cat.label)
      : key
  }

  let title = sug.title
  let description = sug.description

  if (sug.id.startsWith('sug_dist_')) {
    const dimKey = sug.id.replace('sug_dist_', '')
    const dimLabel = t(`bidfrete.dashboard.catalog_dimensao.${dimKey}`, {
      defaultValue: catalogByKey[sug.fields[0] ?? '']?.dimensionLabel ?? dimKey,
    })
    const fieldsJoined = sug.fields.map(labelCampo).join(', ')
    title = t('bidfrete.dashboard.sugestoes.distribuicao_titulo', {
      dimLabel,
      defaultValue: `Distribuição de ${dimLabel}`,
    })
    description = t('bidfrete.dashboard.sugestoes.distribuicao_descricao', {
      fields: fieldsJoined,
      defaultValue: `Proporção entre ${fieldsJoined}`,
    })
  } else if (sug.id.startsWith('sug_trend_count_')) {
    const fieldKey = sug.id.replace('sug_trend_count_', '')
    const label = labelCampo(fieldKey)
    title = t('bidfrete.dashboard.sugestoes.tendencia_mes_titulo', {
      label,
      defaultValue: `${label} por Mês`,
    })
    description = t('bidfrete.dashboard.sugestoes.tendencia_mes_descricao', {
      label,
      defaultValue: `Evolução do volume de ${label.toLowerCase()} nos últimos 12 meses`,
    })
  } else if (sug.id.startsWith('sug_trend_')) {
    const fieldKey = sug.id.replace('sug_trend_', '')
    const label = labelCampo(fieldKey)
    title = t('bidfrete.dashboard.sugestoes.evolucao_titulo', {
      label,
      defaultValue: `Evolução — ${label}`,
    })
    description = t('bidfrete.dashboard.sugestoes.evolucao_descricao', {
      label,
      defaultValue: `Série temporal mensal de ${label}`,
    })
  } else if (sug.id.startsWith('sug_qty_bar_')) {
    const domain = sug.id.replace('sug_qty_bar_', '')
    const domainLabel = t(`bidfrete.dashboard.catalog_dominio.${domain}`, {
      defaultValue: domain,
    })
    const vsLabels = sug.fields.map(labelCampo).join(' vs ')
    title = t('bidfrete.dashboard.sugestoes.comparativo_qty_titulo', {
      domainLabel,
      defaultValue: `Comparativo de Quantidades — ${domainLabel}`,
    })
    description = vsLabels
  } else if (sug.id.startsWith('sug_derived_')) {
    const dmId = sug.id.replace('sug_derived_', '')
    const builtIn = BUILT_IN_DERIVED.find(b => b.id === dmId)
    if (builtIn) {
      const traduzida = traduzirMetricaDerivadaDashboard(t, builtIn)
      title = traduzida.label
      description = traduzida.description
    }
  }

  return {
    ...sug,
    title,
    description,
    config: traduzirWidgetDashboard(t, { ...sug.config, title }),
  }
}

export function traduzirInsightGabiDashboard(
  t: TFunction,
  ins: GabiInsightItem,
  kpis?: DashboardKpis | null,
  prev?: DashboardKpis | null,
): GabiInsightItem {
  switch (ins.id) {
    case 'rascunhos_ativos': {
      const count = Number(kpis?.cotacoes_status?.['RASCUNHO'] ?? ins.stat?.valor ?? 0)
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.rascunhos_ativos.tag', {
          defaultValue: 'Atenção · Rascunhos Pendentes',
        }),
        texto: t('bidfrete.dashboard.insights.rascunhos_ativos.texto', {
          count,
          defaultValue:
            count === 1
              ? `${count} cotação em rascunho. Finalize e envie para negociação de frete.`
              : `${count} cotações em rascunho. Finalize e envie para negociação de frete.`,
        }),
        stat: ins.stat
          ? {
              label: t('bidfrete.dashboard.insights.rascunhos_ativos.stat_label', {
                defaultValue: 'Em rascunho',
              }),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.rascunhos_ativos.link', {
          defaultValue: 'Ver cotações',
        }),
      }
    }
    case 'cotacoes_andamento': {
      const count = Number(kpis?.cotacoes_andamento ?? 0)
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.cotacoes_andamento.tag', {
          defaultValue: 'Operacional · Em Cotação',
        }),
        texto: t('bidfrete.dashboard.insights.cotacoes_andamento.texto', {
          count,
          defaultValue:
            count === 1
              ? `${count} rodada de cotação de frete ativa no mercado.`
              : `${count} rodadas de cotação de frete ativas no mercado.`,
        }),
        stat: ins.stat
          ? {
              label: t(
                kpis && kpis.valor_andamento_usd > 0
                  ? 'bidfrete.dashboard.insights.cotacoes_andamento.stat_valor'
                  : 'bidfrete.dashboard.insights.cotacoes_andamento.stat_ativas',
                {
                  defaultValue:
                    kpis && kpis.valor_andamento_usd > 0
                      ? 'Valor em cotação'
                      : 'Cotações ativas',
                },
              ),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.cotacoes_andamento.link', {
          defaultValue: 'Acompanhar BIDs',
        }),
      }
    }
    case 'saving_total': {
      const valor = kpis ? fmtUsdInsight(kpis.saving_total) : (ins.stat?.valor ?? '')
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.saving_total.tag', {
          defaultValue: 'Financeiro · Saving Acumulado',
        }),
        texto: t('bidfrete.dashboard.insights.saving_total.texto', {
          valor,
          defaultValue: ins.texto,
        }),
        stat: ins.stat
          ? {
              label: t(
                kpis && kpis.ganho_percentual_ganho_bid_frete_internacional > 0
                  ? 'bidfrete.dashboard.insights.saving_total.stat_reducao'
                  : 'bidfrete.dashboard.insights.saving_total.stat_total',
                {
                  defaultValue:
                    kpis && kpis.ganho_percentual_ganho_bid_frete_internacional > 0
                      ? 'Redução média'
                      : 'Total economizado',
                },
              ),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.saving_total.link', {
          defaultValue: 'Ver comparativos',
        }),
      }
    case 'valor_aprovado': {
      const valor = kpis ? fmtUsdInsight(kpis.valor_aprovado_usd) : (ins.stat?.valor ?? '')
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.valor_aprovado.tag', {
          defaultValue: 'Financeiro · Adjudicado',
        }),
        texto: t('bidfrete.dashboard.insights.valor_aprovado.texto', {
          valor,
          defaultValue: ins.texto,
        }),
        stat: ins.stat
          ? {
              label: t('bidfrete.dashboard.insights.valor_aprovado.stat_ticket', {
                defaultValue: 'Ticket médio ganho',
              }),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.valor_aprovado.link', {
          defaultValue: 'Ver adjudicadas',
        }),
      }
    case 'tendencia_volume': {
      const crescendo = ins.texto.includes('cresceu')
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.tendencia_volume.tag', {
          defaultValue: 'Tendência · BIDs Fechados',
        }),
        texto: t(
          crescendo
            ? 'bidfrete.dashboard.insights.tendencia_volume.texto_cresceu'
            : 'bidfrete.dashboard.insights.tendencia_volume.texto_caiu',
          {
            pct: ins.texto.match(/[\d.]+%/)?.[0] ?? '',
            defaultValue: ins.texto,
          },
        ),
        stat: ins.stat
          ? {
              label: t('bidfrete.dashboard.insights.tendencia_volume.stat_anterior', {
                defaultValue: 'Período anterior',
              }),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.tendencia_volume.link', {
          defaultValue: 'Explorar dados',
        }),
      }
    }
    case 'status_ok':
      return {
        ...ins,
        tag: t('bidfrete.dashboard.insights.status_ok.tag', {
          defaultValue: 'Gabi AI · Tudo em dia',
        }),
        texto: t('bidfrete.dashboard.insights.status_ok.texto', {
          defaultValue:
            'Nenhuma pendência crítica ou anomalia operacional identificada no período selecionado.',
        }),
        stat: ins.stat
          ? {
              label: t('bidfrete.dashboard.insights.status_ok.stat_periodo', {
                defaultValue: 'Período',
              }),
              valor: ins.stat.valor,
            }
          : undefined,
        textoLink: t('bidfrete.dashboard.insights.status_ok.link', {
          defaultValue: 'Ver cotações',
        }),
      }
    default:
      return ins
  }
}

export function traduzirTextoVazioWidgetDashboard(
  t: TFunction,
  chartType: string,
  fieldNames: string[],
): string {
  const fieldStr =
    fieldNames.length === 0
      ? t('bidfrete.dashboard.vazio_widget.campo_generico', { defaultValue: 'este campo' })
      : fieldNames.length === 1
        ? `"${fieldNames[0]}"`
        : fieldNames
            .slice(0, 2)
            .map(f => `"${f}"`)
            .join(
              ` ${t('bidfrete.dashboard.vazio_widget.conector_e', { defaultValue: 'e' })} `,
            )

  switch (chartType) {
    case 'DISTRIBUTION':
      return t('bidfrete.dashboard.vazio_widget.distribuicao', {
        field: fieldStr,
        defaultValue: `Nenhum registro encontrado para distribuir ${fieldStr} no período selecionado. Ajuste os filtros para prosseguir.`,
      })
    case 'LINE':
    case 'AREA':
      return t('bidfrete.dashboard.vazio_widget.tendencia', {
        field: fieldStr,
        defaultValue: `Sem dados de tendência para ${fieldStr} neste intervalo. Experimente ampliar o período.`,
      })
    case 'BAR':
    case 'BAR_HORIZONTAL':
      return t('bidfrete.dashboard.vazio_widget.barras', {
        field: fieldStr,
        defaultValue: `Nenhuma movimentação registrada para comparar ${fieldStr} no período atual.`,
      })
    default:
      return t('bidfrete.dashboard.vazio_widget.generico', {
        defaultValue:
          'Não há dados disponíveis para este widget no período selecionado. Amplie o intervalo ou ajuste os campos.',
      })
  }
}
