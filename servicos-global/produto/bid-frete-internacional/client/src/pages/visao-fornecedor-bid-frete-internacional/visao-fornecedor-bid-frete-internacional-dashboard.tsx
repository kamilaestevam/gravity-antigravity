/**
 * Visão geral do fornecedor — mesmo shell bfd-dashboard da visão operacional,
 * com KPIs, alertas, funil e taxas (API; mock temporário via flag).
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CardBasicoGlobal } from '@nucleo/card-global'
import {
  ChartPieSlice,
  ClockCountdown,
  PaperPlaneTilt,
  CheckCircle,
  Percent,
  Star,
  Envelope,
  ChartBar,
} from '@phosphor-icons/react'

import { useSincronizarTituloPaginaTopo } from '../../shared/useSincronizarTituloPaginaTopo'
import {
  criarTituloCarregandoTopo,
  ConteudoCarregandoBidFreteInternacional,
} from '../../shared/pagina-carregando-bid-frete-internacional'
import {
  getVisaoFornecedorBidFreteInternacionalDashboard,
  type DashboardVisaoFornecedorBidFreteInternacional,
} from '../../shared/api'
import {
  MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP,
  USAR_MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP,
} from '../../shared/mock-dashboard-visao-fornecedor-APAGAR-ANTES-COMMIT'
import '../../shared/bid-frete-visao-geral-layout.css'
import {
  BidFreteFunilBarras,
  BidFreteAlertasFornecedor,
  BidFreteTaxaAnel,
  BidFreteClassificacaoDestaque,
  BidFreteSecaoCabecalho,
  BidFreteIconesSecao,
  BidFreteAcaoRapida,
} from '../../shared/componentes/visao-geral-bid-frete-ui'

const ROTULO_FUNIL_I18N: Record<string, string> = {
  aguardando_resposta: 'dashboard.funil_aguardando',
  em_analise: 'dashboard.funil_em_analise',
  aprovadas: 'dashboard.funil_aprovadas',
  reprovadas: 'dashboard.funil_reprovadas',
}

const ROTULO_ALERTA_I18N: Record<string, string> = {
  cotacoes_pendentes: 'dashboard.alerta_pendentes',
  propostas_em_analise: 'dashboard.alerta_em_analise',
  propostas_reprovadas: 'dashboard.alerta_reprovadas',
  propostas_aprovadas: 'dashboard.alerta_aprovadas',
}

export default function VisaoFornecedorBidFreteInternacionalDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const ns = 'bidfrete.visao_fornecedor_bid_frete_internacional'
  const [dashboard, setDashboard] = useState<DashboardVisaoFornecedorBidFreteInternacional | null>(null)
  const [carregando, setCarregando] = useState(true)
  const iconesSecao = BidFreteIconesSecao()

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      if (USAR_MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP) {
        await new Promise((resolve) => setTimeout(resolve, 350))
        setDashboard(MOCK_DASHBOARD_VISAO_FORNECEDOR_TEMP)
        return
      }
      const data = await getVisaoFornecedorBidFreteInternacionalDashboard()
      setDashboard(data)
    } catch {
      setDashboard(null)
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  useSincronizarTituloPaginaTopo(
    useMemo(() => {
      if (carregando) {
        return criarTituloCarregandoTopo(<ChartPieSlice weight="duotone" size={22} />, t)
      }
      return null
    }, [carregando, t]),
  )

  const kpis = dashboard?.kpis
  const funil = dashboard?.funil ?? []
  const alertas = dashboard?.alertas ?? []

  const segmentosResposta = useMemo(() => {
    if (!kpis) return []
    const respondidas = kpis.propostas_enviadas
    const pendentes = kpis.pendentes
    const total = respondidas + pendentes
    if (total === 0) return []
    return [
      {
        pct: (respondidas / total) * 100,
        cor: '#60a5fa',
        label: t(`${ns}.dashboard.taxa_respondidas`, { count: respondidas }),
      },
      {
        pct: (pendentes / total) * 100,
        cor: '#fbbf24',
        label: t(`${ns}.dashboard.taxa_aguardando`, { count: pendentes }),
      },
    ]
  }, [kpis, t, ns])

  const segmentosAprovacao = useMemo(() => {
    if (!kpis || kpis.propostas_enviadas === 0) return []
    const total = kpis.propostas_enviadas
    return [
      {
        pct: (kpis.propostas_aprovadas / total) * 100,
        cor: '#34d399',
        label: t(`${ns}.dashboard.taxa_aprovadas`, { count: kpis.propostas_aprovadas }),
      },
      {
        pct: (kpis.propostas_em_analise / total) * 100,
        cor: '#818cf8',
        label: t(`${ns}.dashboard.taxa_em_analise`, { count: kpis.propostas_em_analise }),
      },
      {
        pct: (kpis.propostas_reprovadas / total) * 100,
        cor: '#f87171',
        label: t(`${ns}.dashboard.taxa_reprovadas`, { count: kpis.propostas_reprovadas }),
      },
    ].filter((s) => s.pct > 0)
  }, [kpis, t, ns])

  const rotuloFunil = useCallback(
    (rotulo: string) => {
      const chave = ROTULO_FUNIL_I18N[rotulo]
      return chave ? t(`${ns}.${chave}`) : rotulo
    },
    [t, ns],
  )

  const rotuloAlerta = useCallback(
    (rotulo: string) => {
      const chave = ROTULO_ALERTA_I18N[rotulo]
      return chave ? t(`${ns}.${chave}`) : rotulo
    },
    [t, ns],
  )

  return (
    <PaginaGlobal className="bid-frete-page-shell">
      {carregando ? (
        <ConteudoCarregandoBidFreteInternacional />
      ) : (
        <div className="bfd-dashboard bfd-dashboard--fornecedor">
          <div className="bfd-kpi-grid">
            <CardBasicoGlobal
              titulo={t(`${ns}.dashboard.pendentes`)}
              icone={<ClockCountdown weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
              valor={kpis?.pendentes ?? 0}
              subtexto={t(`${ns}.dashboard.sub_pendentes`)}
              className={kpis && kpis.pendentes > 0 ? 'bfd-kpi--destacado' : ''}
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>{t(`${ns}.dashboard.tooltip_pendentes`)}</span>
                    <strong>{kpis?.pendentes ?? 0}</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo={t(`${ns}.dashboard.propostas_enviadas`)}
              icone={<PaperPlaneTilt weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
              valor={kpis?.propostas_enviadas ?? 0}
              subtexto={t(`${ns}.dashboard.sub_disparos`, {
                count: kpis?.disparos_recebidos ?? 0,
              })}
              tooltip={
                <>
                  <div className="cg-tooltip__row">
                    <span>{t(`${ns}.dashboard.disparos_recebidos`)}</span>
                    <strong>{kpis?.disparos_recebidos ?? 0}</strong>
                  </div>
                </>
              }
            />
            <CardBasicoGlobal
              titulo={t(`${ns}.dashboard.aprovadas`)}
              icone={<CheckCircle weight="duotone" size={16} style={{ color: '#34d399' }} />}
              valor={kpis?.propostas_aprovadas ?? 0}
              subtexto={t(`${ns}.dashboard.sub_taxa_aprovacao`, {
                pct: (kpis?.taxa_aprovacao ?? 0).toFixed(1),
              })}
            />
            <CardBasicoGlobal
              titulo={t(`${ns}.dashboard.taxa_resposta`)}
              icone={<Percent weight="duotone" size={16} style={{ color: '#a78bfa' }} />}
              valor={`${(kpis?.taxa_resposta ?? 0).toFixed(1)}%`}
              subtexto={t(`${ns}.dashboard.sub_taxa_resposta`)}
            />
          </div>

          <div className="bfd-insights-grid">
            <div className="bfd-card bfd-alertas bfd-card--accent-rose">
              <BidFreteSecaoCabecalho
                icone={iconesSecao.alertas}
                titulo={t(`${ns}.dashboard.secao_alertas`)}
                corIcone="#f87171"
              />
              <BidFreteAlertasFornecedor
                alertas={alertas}
                rotuloAlerta={rotuloAlerta}
                mensagemVazio={t(`${ns}.dashboard.alertas_vazio`)}
              />
            </div>

            <div className="bfd-card bfd-card--accent-indigo">
              <BidFreteSecaoCabecalho
                icone={iconesSecao.funil}
                titulo={t(`${ns}.dashboard.secao_funil`)}
                corIcone="#818cf8"
              />
              <BidFreteFunilBarras etapas={funil} rotuloEtapa={rotuloFunil} />
            </div>
          </div>

          <div className="bfd-charts-grid--fornecedor">
            <div className="bfd-card bfd-card--accent-blue">
              <BidFreteSecaoCabecalho
                icone={<Percent weight="duotone" size={16} style={{ color: '#60a5fa' }} />}
                titulo={t(`${ns}.dashboard.secao_taxa_resposta`)}
                corIcone="#60a5fa"
              />
              {segmentosResposta.length > 0 ? (
                <BidFreteTaxaAnel
                  percentualCentro={kpis?.taxa_resposta ?? 0}
                  rotuloCentro={t(`${ns}.dashboard.centro_resposta`)}
                  segmentos={segmentosResposta}
                />
              ) : (
                <p className="bfd-alertas__vazio">{t(`${ns}.dashboard.sem_dados`)}</p>
              )}
            </div>

            <div className="bfd-card bfd-card--accent-emerald">
              <BidFreteSecaoCabecalho
                icone={iconesSecao.aprovacao}
                titulo={t(`${ns}.dashboard.secao_taxa_aprovacao`)}
                corIcone="#34d399"
              />
              {segmentosAprovacao.length > 0 ? (
                <BidFreteTaxaAnel
                  percentualCentro={kpis?.taxa_aprovacao ?? 0}
                  rotuloCentro={t(`${ns}.dashboard.centro_aprovacao`)}
                  segmentos={segmentosAprovacao}
                />
              ) : (
                <p className="bfd-alertas__vazio">{t(`${ns}.dashboard.sem_propostas`)}</p>
              )}
            </div>

            <div className="bfd-card bfd-card--accent-amber">
              <BidFreteSecaoCabecalho
                icone={<Star weight="duotone" size={16} style={{ color: '#fbbf24' }} />}
                titulo={t(`${ns}.dashboard.classificacao`)}
                corIcone="#fbbf24"
              />
              <BidFreteClassificacaoDestaque
                nota={kpis?.nota_global_classificacao_bid_frete_internacional ?? 0}
                subtitulo={t(`${ns}.dashboard.sub_classificacao`)}
              />
            </div>
          </div>

          <div className="bfd-acoes-grid">
            <BidFreteAcaoRapida
              titulo={t(`${ns}.dashboard.card_pendentes_titulo`)}
              descricao={t(`${ns}.dashboard.card_pendentes_desc`)}
              icone={<Envelope weight="duotone" size={24} />}
              corIcone="#fbbf24"
              onClick={() => navigate('/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes')}
            />
            <BidFreteAcaoRapida
              titulo={t(`${ns}.dashboard.card_propostas_titulo`)}
              descricao={t(`${ns}.dashboard.card_propostas_desc`)}
              icone={<PaperPlaneTilt weight="duotone" size={24} />}
              corIcone="#60a5fa"
              onClick={() => navigate('/visao-fornecedor-bid-frete-internacional/propostas')}
            />
            <BidFreteAcaoRapida
              titulo={t(`${ns}.dashboard.card_desempenho_titulo`)}
              descricao={t(`${ns}.dashboard.card_desempenho_desc`)}
              icone={<ChartBar weight="duotone" size={24} />}
              corIcone="#34d399"
              onClick={() => navigate('/visao-fornecedor-bid-frete-internacional/desempenho')}
            />
          </div>
        </div>
      )}
    </PaginaGlobal>
  )
}
