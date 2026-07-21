/**
 * resultado-simula-custo.tsx — Dashboard pós-simulação (paridade mockup Simula de Custo.dc.html)
 */
import React, { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Calculator,
  CaretRight,
  Check,
  CheckCircle,
  CurrencyCircleDollar,
  ArrowsLeftRight,
  ChartLineUp,
  ChartLine,
  Sparkle,
  CalendarBlank,
  Target,
  Info,
  FileArrowDown,
  FileXls,
  EnvelopeSimple,
  FloppyDisk,
  ArrowClockwise,
} from '@phosphor-icons/react'
import { BotaoGlobal } from '@nucleo/botao-global'
import { useShellStore } from '@gravity/shell'
import type { EntradaSimulaCusto, ResultadoSimulacaoSimulaCusto } from '../shared/schemas-simula-custo'
import {
  formatarBrlSimulaCusto,
  formatarPctSimulaCusto,
  formatarPtaxSimulaCusto,
  formatarFatorImportacaoSimulaCusto,
  formatarMoedaEstrangeiraSimulaCusto,
} from '../shared/formatacao-moeda-simula-custo'
import {
  derivarFluxoCaixaSimulaCusto,
  derivarFatorImportacaoSimulaCusto,
  derivarInsightGabiSimulaCusto,
  serieDolarFuturoSimulaCusto,
} from '../shared/derivar-dados-resultado-simula-custo'
import {
  GraficoFluxoCaixaSimulaCusto,
  GraficoDolarFuturoSimulaCusto,
  GraficoFatorImportacaoSimulaCusto,
} from '../shared/graficos-resultado-simula-custo'
import './resultado-simula-custo.css'

const TRIBUTOS_ORDEM = ['ii', 'ipi', 'pis', 'cofins', 'icms'] as const

export interface ResultadoSimulaCustoProps {
  resultado: ResultadoSimulacaoSimulaCusto
  form: EntradaSimulaCusto
  onVoltar: () => void
  onSalvar: () => void
  salvando: boolean
  error: string | null
  isEdicao?: boolean
}

export function ResultadoSimulaCusto({
  resultado,
  form,
  onVoltar,
  onSalvar,
  salvando,
  error,
}: ResultadoSimulaCustoProps) {
  const { t } = useTranslation()
  const nomeUsuario = useShellStore((s) => s.currentUser.name || s.currentUser.email || 'você')
  const [mostrarBaseCalculo, setMostrarBaseCalculo] = useState(false)
  const [emailEnvio, setEmailEnvio] = useState('')

  const res = resultado.resultado
  const ptax = resultado.ptax_utilizada_simula_custo
  const pctVa =
    res.custo_nacionalizado_brl > 0
      ? (res.valor_aduaneiro_brl / res.custo_nacionalizado_brl) * 100
      : 0
  const pctTrib = 100 - pctVa

  const fluxo = useMemo(() => derivarFluxoCaixaSimulaCusto(form), [form])
  const fator = useMemo(
    () => derivarFatorImportacaoSimulaCusto(form, resultado),
    [form, resultado],
  )
  const gabi = useMemo(
    () => derivarInsightGabiSimulaCusto(form, resultado, nomeUsuario),
    [form, resultado, nomeUsuario],
  )
  const serieDolar = useMemo(() => serieDolarFuturoSimulaCusto(ptax), [ptax])
  const ptaxIdeal = serieDolar.find((s) => s.mes === 'Ago')?.valor ?? gabi.ptaxIdeal

  const engineLabel =
    resultado.fonte_calculo_simula_custo === 'siscomex'
      ? t('simulacusto.formulario.portal_unico', 'Portal Único')
      : t('simulacusto.formulario.engine', 'GRAVITY ENGINE')

  const qtdTributos = TRIBUTOS_ORDEM.length

  return (
    <div className="ecc-page">
      <div className="ecc-inner">
        {/* Header */}
        <header className="ecc-header">
          <div className="ecc-header-esq">
            <button
              type="button"
              className="ecc-btn-voltar"
              onClick={onVoltar}
              aria-label={t('comum.voltar', 'Voltar')}
            >
              <ArrowLeft size={17} />
            </button>
            <div className="ecc-icone-titulo">
              <Calculator weight="duotone" size={22} />
            </div>
            <div>
              <div className="ecc-breadcrumb">
                <span>{t('simulacusto.nav.simulas', 'Simulas')}</span>
                <CaretRight size={12} color="#4c5869" />
                <span className="ecc-breadcrumb-atual">{t('simulacusto.formulario.nova', 'Nova')}</span>
              </div>
              <h1 className="ecc-titulo-pagina">
                {t('simulacusto.formulario.titulo_resultado', 'Simula de Custo')}
              </h1>
            </div>
          </div>
          <div className="ecc-header-dir">
            <div className="ecc-badge-engine">
              <span className="ecc-badge-engine-dot" />
              {engineLabel}
            </div>
            <div className="ecc-badge-ptax">
              <ArrowClockwise size={12} color="#7d8aa0" />
              <span>
                PTAX{' '}
                <span className="ecc-badge-ptax-valor ecc-tnum">
                  R$ {formatarPtaxSimulaCusto(ptax)}
                </span>
              </span>
            </div>
            <button type="button" className="ecc-btn-secundario" disabled title={t('simulacusto.resultado.exportar_em_breve', 'Em breve')}>
              <FileArrowDown size={15} />
              {t('simulacusto.resultado.exportar', 'Exportar')}
            </button>
            <BotaoGlobal variante="primario" tamanho="padrao" onClick={onSalvar} disabled={salvando}>
              <FloppyDisk weight="duotone" size={16} />
              {salvando
                ? t('botoes.salvando', 'Salvando…')
                : t('simulacusto.formulario.salvar_simula', 'Salvar Simula')}
            </BotaoGlobal>
          </div>
        </header>

        {error ? <div className="ecc-erro">{error}</div> : null}

        {/* Hero */}
        <section className="ecc-card ecc-hero">
          <div className="ecc-hero-grid">
            <div>
              <div className="ecc-status">
                <div className="ecc-status-icone">
                  <CheckCircle weight="duotone" size={32} />
                </div>
                <div>
                  <div className="ecc-status-titulo">
                    {t('simulacusto.resultado.calculo_concluido', 'Cálculo concluído')}
                  </div>
                  <div className="ecc-status-sub">
                    {t('simulacusto.resultado.processado_agora', 'Processado agora')} ·{' '}
                    {t('simulacusto.resultado.tributos_aplicados', '{{qtd}} tributos aplicados', {
                      qtd: qtdTributos,
                    })}
                  </div>
                </div>
              </div>
              <div className="ecc-label-hero">
                {t('simulacusto.formulario.custo_nacionalizado', 'CUSTO NACIONALIZADO')}
              </div>
              <div className="ecc-valor-hero ecc-tnum">
                {formatarBrlSimulaCusto(res.custo_nacionalizado_brl)}
              </div>
              <div className="ecc-barra-composicao">
                <div className="ecc-barra-track">
                  <div className="ecc-barra-va" style={{ width: `${pctVa}%` }} />
                  <div className="ecc-barra-trib" style={{ width: `${pctTrib}%` }} />
                </div>
                <div className="ecc-barra-legenda">
                  <div className="ecc-legenda-item">
                    <span className="ecc-legenda-cor" style={{ background: '#6ea0ff' }} />
                    <span>
                      {t('simulacusto.formulario.valor_aduaneiro', 'Valor Aduaneiro')}{' '}
                      <b className="ecc-tnum">{Math.round(pctVa)}%</b>
                    </span>
                  </div>
                  <div className="ecc-legenda-item">
                    <span className="ecc-legenda-cor" style={{ background: '#f6b28a' }} />
                    <span>
                      {t('simulacusto.resultado.tributos', 'Tributos')}{' '}
                      <b className="ecc-tnum">{Math.round(pctTrib)}%</b>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="ecc-kpi-grid">
              <div className="ecc-kpi ecc-kpi--va">
                <div className="ecc-kpi-label">
                  {t('simulacusto.formulario.valor_aduaneiro', 'Valor Aduaneiro (VA)')}
                </div>
                <div className="ecc-kpi-valor ecc-tnum">
                  {formatarBrlSimulaCusto(res.valor_aduaneiro_brl)}
                </div>
              </div>
              <div className="ecc-kpi ecc-kpi--trib">
                <div className="ecc-kpi-label">
                  {t('simulacusto.formulario.total_tributos', 'Total de Tributos')}
                </div>
                <div className="ecc-kpi-valor ecc-kpi-valor--trib ecc-tnum">
                  {formatarBrlSimulaCusto(res.total_tributos_brl)}
                </div>
              </div>
              <div className="ecc-kpi ecc-kpi--neutro">
                <div className="ecc-kpi-label">
                  {t('simulacusto.resultado.fator_importacao', 'Fator de importação')}
                </div>
                <div className="ecc-kpi-valor ecc-kpi-valor--trib ecc-tnum">
                  {formatarFatorImportacaoSimulaCusto(fator.fatorAtual)}{' '}
                  <span className="ecc-kpi-sufixo">{t('simulacusto.resultado.atual', 'atual')}</span>
                </div>
              </div>
              <div className="ecc-kpi ecc-kpi--neutro">
                <div className="ecc-kpi-label">
                  {t('simulacusto.resultado.proximo_pagamento', 'Próximo pagamento')}
                </div>
                <div className="ecc-kpi-valor ecc-kpi-valor--azul ecc-tnum">
                  {fluxo.proximoPagamentoFormatado}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* GABI */}
        <section className="ecc-gabi-wrap">
          <div className="ecc-gabi-inner">
            <div className="ecc-gabi-header">
              <div className="ecc-gabi-icone">
                <Sparkle weight="fill" size={17} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="ecc-gabi-marca">GABI</span>
                <span className="ecc-gabi-sub">
                  · {t('simulacusto.resultado.analise_simula', 'ANÁLISE DA SIMULA')}
                </span>
              </div>
            </div>
            <p className="ecc-gabi-texto">
              {t(
                'simulacusto.resultado.gabi_intro',
                'Analisei esta importação, {{nome}}. Encontrei duas oportunidades claras de economia:',
                { nome: gabi.nomeUsuario },
              )}
            </p>
            <div className="ecc-gabi-cards">
              <div className="ecc-gabi-card ecc-gabi-card--cambio">
                <div className="ecc-gabi-card-tag ecc-gabi-card-tag--cambio">
                  <CalendarBlank size={14} />
                  {t('simulacusto.resultado.dia_ideal_cambio', 'DIA IDEAL — CÂMBIO')}
                </div>
                <div className="ecc-gabi-card-texto">
                  {t(
                    'simulacusto.resultado.gabi_cambio',
                    'Remeta o câmbio em {{data}}, travando o dólar a R$ {{ptax}}. É o fundo da curva de futuros — economiza R$ {{economia}} vs. o PTAX de hoje.',
                    {
                      data: gabi.dataIdealCambio,
                      ptax: formatarPtaxSimulaCusto(ptaxIdeal),
                      economia: gabi.economiaCambioBrl.toLocaleString('pt-BR'),
                    },
                  )}
                </div>
              </div>
              <div className="ecc-gabi-card ecc-gabi-card--fator">
                <div className="ecc-gabi-card-tag ecc-gabi-card-tag--fator">
                  <Target size={14} />
                  {t('simulacusto.resultado.ponto_ideal_fator', 'PONTO IDEAL — FATOR')}
                </div>
                <div className="ecc-gabi-card-texto">
                  {t(
                    'simulacusto.resultado.gabi_fator',
                    'Seu fator está em {{atual}}. Completando o container com Valor FOB de {{fob}} ele cai para o ideal de {{ideal}} — o custo fixo se dilui melhor.',
                    {
                      atual: formatarFatorImportacaoSimulaCusto(gabi.fatorAtual),
                      fob: formatarMoedaEstrangeiraSimulaCusto(
                        gabi.valorFobIdealUsd,
                        form.moeda_produto_simula_custo,
                      ),
                      ideal: formatarFatorImportacaoSimulaCusto(gabi.fatorIdeal),
                    },
                  )}
                </div>
              </div>
            </div>
            <div className="ecc-gabi-rodape">
              <Info size={13} color="#8b7de0" />
              <span>
                {t(
                  'simulacusto.resultado.gabi_rodape',
                  'Recomendações geradas pelo GRAVITY ENGINE sobre PTAX e curva de dólar futuro em tempo real.',
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Tributos + Fluxo */}
        <div className="ecc-grid-2">
          <section className="ecc-card ecc-secao-card">
            <div className="ecc-secao-header">
              <div className="ecc-secao-icone ecc-secao-icone--trib">
                <CurrencyCircleDollar weight="duotone" size={17} />
              </div>
              <div>
                <div className="ecc-secao-titulo">
                  {t('simulacusto.resultado.detalhamento_tributos', 'Detalhamento dos tributos')}
                </div>
                <div className="ecc-secao-sub ecc-tnum">
                  {t('simulacusto.resultado.base_va', 'Base VA')} ·{' '}
                  {formatarBrlSimulaCusto(res.valor_aduaneiro_brl)}
                </div>
              </div>
            </div>
            <div className="ecc-tabela-trib">
              <div className="ecc-tabela-trib-cab">
                <span className="ecc-tabela-trib-cab-label">
                  {t('simulacusto.resultado.tributo_aliquota', 'TRIBUTO / ALÍQUOTA')}
                </span>
                <button
                  type="button"
                  className="ecc-btn-toggle-base"
                  onClick={() => setMostrarBaseCalculo((v) => !v)}
                >
                  {mostrarBaseCalculo
                    ? t('simulacusto.resultado.ocultar_base', 'Ocultar base')
                    : t('simulacusto.resultado.ver_base', 'Ver base de cálculo')}
                </button>
              </div>
              {TRIBUTOS_ORDEM.map((tipo) => {
                const trib = res.tributos[tipo]
                return (
                  <div key={tipo} className="ecc-trib-linha">
                    <div className="ecc-trib-row">
                      <div className="ecc-trib-nome">
                        <span className="ecc-trib-sigla">{tipo.toUpperCase()}</span>
                        <span className="ecc-trib-aliquota ecc-tnum">
                          {formatarPctSimulaCusto(trib.aliquota)}
                        </span>
                      </div>
                      <span className="ecc-trib-valor ecc-tnum">{formatarBrlSimulaCusto(trib.valor)}</span>
                    </div>
                    {mostrarBaseCalculo ? (
                      <div className="ecc-trib-base">
                        <span>{t('simulacusto.resultado.base_calculo', 'Base de cálculo')}</span>
                        <span className="ecc-tnum">{formatarBrlSimulaCusto(trib.base_calculo)}</span>
                      </div>
                    ) : null}
                  </div>
                )
              })}
              <div className="ecc-trib-total">
                <span className="ecc-trib-total-label">
                  {t('simulacusto.formulario.total_tributos', 'Total de Tributos')}
                </span>
                <span className="ecc-trib-total-valor ecc-tnum">
                  {formatarBrlSimulaCusto(res.total_tributos_brl)}
                </span>
              </div>
            </div>
          </section>

          <section className="ecc-card ecc-secao-card">
            <div className="ecc-fluxo-topo">
              <div className="ecc-secao-header" style={{ marginBottom: 0 }}>
                <div className="ecc-secao-icone ecc-secao-icone--fluxo">
                  <ArrowsLeftRight weight="duotone" size={17} />
                </div>
                <div>
                  <div className="ecc-secao-titulo">
                    {t('simulacusto.resultado.fluxo_caixa', 'Fluxo de caixa')}{' '}
                    <span className="ecc-pill" style={{ marginLeft: 4 }}>
                      {fluxo.moeda}
                    </span>
                  </div>
                  <div className="ecc-secao-sub">
                    {t(
                      'simulacusto.resultado.fluxo_sub',
                      'Pagamentos da mercadoria conforme condição acordada',
                    )}
                  </div>
                </div>
              </div>
              {fluxo.pills.length > 0 ? (
                <div className="ecc-pills">
                  {fluxo.pills.map((pill, i) => (
                    <span key={i} className="ecc-pill">
                      {pill}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <GraficoFluxoCaixaSimulaCusto nos={fluxo.nos} />
            <div className="ecc-fluxo-metricas">
              <div>
                <div className="ecc-metrica-label">
                  {t('simulacusto.resultado.total_mercadoria', 'Total mercadoria')}
                </div>
                <div className="ecc-metrica-valor ecc-tnum">{fluxo.totalMercadoriaFormatado}</div>
              </div>
              <div>
                <div className="ecc-metrica-label">
                  {t('simulacusto.resultado.proximo_pagamento', 'Próximo pagamento')}
                </div>
                <div className="ecc-metrica-valor ecc-tnum" style={{ color: '#6ea0ff' }}>
                  {fluxo.proximoPagamentoFormatado}
                </div>
              </div>
              <div>
                <div className="ecc-metrica-label">
                  {t('simulacusto.resultado.prazo_medio', 'Prazo médio')}
                </div>
                <div className="ecc-metrica-valor ecc-tnum">
                  {fluxo.prazoMedioDias != null
                    ? t('simulacusto.resultado.dias', '{{n}} dias', { n: fluxo.prazoMedioDias })
                    : '—'}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Dólar + Fator */}
        <div className="ecc-grid-2 ecc-grid-2--igual">
          <section className="ecc-card ecc-secao-card">
            <div className="ecc-secao-header">
              <div className="ecc-secao-icone ecc-secao-icone--dolar">
                <ChartLineUp weight="duotone" size={17} />
              </div>
              <div>
                <div className="ecc-secao-titulo">
                  {t('simulacusto.resultado.dolar_futuro', 'Dólar futuro')}
                </div>
                <div className="ecc-secao-sub">
                  {t('simulacusto.resultado.dolar_sub', 'Melhor janela para remeter câmbio')}
                </div>
              </div>
            </div>
            <GraficoDolarFuturoSimulaCusto serie={serieDolar} mesDestaque="Ago" />
            <div className="ecc-banner-verde">
              <div className="ecc-banner-verde-icone">
                <Check weight="bold" size={17} />
              </div>
              <div className="ecc-banner-verde-texto">
                {t('simulacusto.resultado.remeter_em', 'Remeter em')}{' '}
                <b>{gabi.dataIdealCambio}</b> {t('simulacusto.resultado.a', 'a')}{' '}
                <span className="ecc-tnum">R$ {formatarPtaxSimulaCusto(ptaxIdeal)}</span>
                <div style={{ color: '#7d8aa0', marginTop: 2 }}>
                  {t('simulacusto.resultado.economia_vs_ptax', 'Economia estimada vs. PTAX de hoje')}
                </div>
              </div>
              <div className="ecc-banner-verde-ganho ecc-tnum">
                +{formatarBrlSimulaCusto(gabi.economiaCambioBrl)}
              </div>
            </div>
          </section>

          <section className="ecc-card ecc-secao-card">
            <div className="ecc-secao-header">
              <div className="ecc-secao-icone ecc-secao-icone--fator">
                <ChartLine weight="duotone" size={17} />
              </div>
              <div>
                <div className="ecc-secao-titulo">
                  {t('simulacusto.resultado.fator_importacao', 'Fator de importação')}
                </div>
                <div className="ecc-secao-sub">
                  {t('simulacusto.resultado.fator_sub', 'Modal marítimo · custo fixo por container')}
                </div>
              </div>
            </div>
            <div className="ecc-fator-metricas">
              <div>
                <div className="ecc-kpi-label">
                  {t('simulacusto.resultado.fator_atual', 'Fator atual')} · FOB{' '}
                  {formatarMoedaEstrangeiraSimulaCusto(fator.valorFobAtual, fator.moeda)}/cont.
                </div>
                <div className="ecc-fator-atual ecc-tnum">
                  {formatarFatorImportacaoSimulaCusto(fator.fatorAtual)}
                </div>
              </div>
              <div>
                <div className="ecc-kpi-label">
                  {t('simulacusto.resultado.fator_ideal_meta', 'Fator ideal (meta)')}
                </div>
                <div className="ecc-fator-ideal ecc-tnum">
                  {formatarFatorImportacaoSimulaCusto(fator.fatorIdeal)}
                </div>
              </div>
            </div>
            <GraficoFatorImportacaoSimulaCusto
              fatorAtual={fator.fatorAtual}
              fatorIdeal={fator.fatorIdeal}
              valorFobAtual={fator.valorFobAtual}
              valorFobIdeal={fator.valorFobIdeal}
            />
            <div className="ecc-fator-dica">
              <Target size={16} color="#34d399" style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <b style={{ color: '#bff0dc' }}>{t('simulacusto.resultado.ponto_ideal', 'Ponto ideal')}</b>
                {' — '}
                {t(
                  'simulacusto.resultado.fator_dica',
                  'o fator incide sobre o Valor FOB e o custo fixo do container é o mesmo em qualquer carga. Meta: Valor FOB de {{fob}}/container → fator {{fator}}.',
                  {
                    fob: formatarMoedaEstrangeiraSimulaCusto(fator.valorFobIdeal, fator.moeda),
                    fator: formatarFatorImportacaoSimulaCusto(fator.fatorIdeal),
                  },
                )}
              </div>
            </div>
            <div className="ecc-custos-fixos">
              <div className="ecc-custos-fixos-titulo">
                {t('simulacusto.resultado.custo_fixo_container', 'CUSTO FIXO POR CONTAINER (BASE DO FATOR)')}
              </div>
              {fator.custosFixos.map((c) => (
                <div key={c.nome} className="ecc-custo-linha">
                  <div className="ecc-custo-nome">
                    <span className="ecc-custo-cor" style={{ background: c.cor }} />
                    {c.nome}
                  </div>
                  <span className="ecc-custo-valor ecc-tnum">
                    {formatarBrlSimulaCusto(c.valorBrl)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Exportar */}
        <section className="ecc-card ecc-secao-card">
          <div className="ecc-export-grid">
            <div>
              <div className="ecc-secao-header">
                <div className="ecc-secao-icone" style={{ background: 'rgba(124,92,246,0.14)', border: '1px solid rgba(124,92,246,0.26)', color: '#a78bfa' }}>
                  <FileArrowDown weight="duotone" size={17} />
                </div>
                <div>
                  <div className="ecc-secao-titulo">
                    {t('simulacusto.resultado.exportar_enviar', 'Exportar e enviar')}
                  </div>
                  <div className="ecc-secao-sub">
                    {t('simulacusto.resultado.exportar_sub', 'Gere o relatório e receba no seu e-mail')}
                  </div>
                </div>
              </div>
              <div className="ecc-export-botoes">
                <button type="button" className="ecc-export-btn ecc-export-btn--pdf" disabled>
                  <div className="ecc-export-btn-icone ecc-export-btn-icone--pdf">
                    <FileArrowDown size={18} />
                  </div>
                  <div>
                    <div className="ecc-export-btn-titulo">
                      {t('simulacusto.resultado.baixar_pdf', 'Baixar PDF')}
                    </div>
                    <div className="ecc-export-btn-sub">
                      {t('simulacusto.resultado.relatorio_paginas', 'Relatório · 3 pág.')}
                    </div>
                  </div>
                </button>
                <button type="button" className="ecc-export-btn ecc-export-btn--excel" disabled>
                  <div className="ecc-export-btn-icone ecc-export-btn-icone--excel">
                    <FileXls size={18} />
                  </div>
                  <div>
                    <div className="ecc-export-btn-titulo">
                      {t('simulacusto.resultado.exportar_excel', 'Exportar Excel')}
                    </div>
                    <div className="ecc-export-btn-sub">
                      {t('simulacusto.resultado.planilha_xlsx', 'Planilha .xlsx')}
                    </div>
                  </div>
                </button>
              </div>
            </div>
            <div>
              <label className="ecc-email-label" htmlFor="ecc-email-envio">
                {t('simulacusto.resultado.enviar_email', 'Enviar cópia para o e-mail')}
              </label>
              <div className="ecc-email-row">
                <div className="ecc-email-input-wrap">
                  <EnvelopeSimple size={15} className="ecc-email-icone" />
                  <input
                    id="ecc-email-envio"
                    type="email"
                    className="ecc-email-input"
                    placeholder="seu@email.com"
                    value={emailEnvio}
                    onChange={(e) => setEmailEnvio(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <BotaoGlobal variante="primario" tamanho="padrao" disabled>
                  {t('simulacusto.resultado.enviar', 'Enviar')}
                </BotaoGlobal>
              </div>
              <div className="ecc-email-hint">
                {t(
                  'simulacusto.resultado.anexos_email',
                  'PDF e Excel serão anexados automaticamente ao e-mail.',
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default ResultadoSimulaCusto
