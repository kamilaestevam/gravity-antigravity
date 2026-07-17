/**
 * ConfiguracoesSmartRead — Configurações do produto Smart Read
 *
 * Paridade de layout 1:1 com a Configurações do Pedido (modelo oficial):
 *  ├── Tabs de visualização (Insights | Lista) no topo
 *  ├── Sidebar com grupo VISUALIZAÇÕES (Card, Visão Geral, Tabelas, Colunas)
 *  └── Conteúdo exibe SOMENTE a categoria ativa, com:
 *       • Card        → período de comparação + preview + ATIVOS + DISPONÍVEIS
 *       • Visão Geral → gráficos exibidos (toggle)
 *       • Tabelas     → linhas por página, densidade, status visíveis
 *       • Colunas     → colunas exibidas + ordem (drag)
 *
 * Todas as abas persistem em localStorage com estado pending vs baseline e
 * footer Salvar / Restaurar padrão (paridade Pedido):
 *  • Card → use-preferencias-cards-smart-read
 *  • Visão Geral / Tabelas / Colunas → use-preferencias-visualizacao-smart-read
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  SquaresFour, ChartPieSlice, Table, Columns,
  Plus, Eye, EyeSlash, DotsSixVertical, X, PencilSimple, Trash,
  ChartLineUp, ChartDonut, Timer, ChartBar, ChartPie, Files, CurrencyDollar, UsersThree,
  type Icon,
} from '@phosphor-icons/react'
import { ConfiguracaoSecaoGlobal } from '@nucleo/cabecalho-secao-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import { BotaoSalvar, BotaoCancelar } from '@nucleo/botoes-salvar-global'
import { useShellStore } from '@gravity/shell'
import {
  CARDS_CATALOGO_SMART_READ,
  PREFERENCIAS_CARDS_PADRAO_SMART_READ,
  usePreferenciasCardsSmartRead,
  type CardPreferenciaSmartRead,
} from '../../shared/use-preferencias-cards-smart-read'
import {
  GRAFICOS_CATALOGO_INSIGHTS_SMART_READ,
  LINHAS_PAGINA_OPCOES_SMART_READ,
  PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ,
  gerarIdColunaPersonalizadaSmartRead,
  usePreferenciasVisualizacaoSmartRead,
  type ColunaPersonalizadaSmartRead,
  type DensidadeTabelaSmartRead,
  type LinhasPaginaSmartRead,
} from '../../shared/use-preferencias-visualizacao-smart-read'
import { SmartReadVisualizacaoTabs } from '../../components/SmartReadVisualizacaoTabs'
import '../../components/SmartReadVisualizacaoTabs.css'
import './configuracoes-smart-read.css'

type CategoriaId = 'card' | 'visao-geral' | 'tabelas' | 'colunas'

// ─── Metadados visuais dos 3 cards reais (catálogo em use-preferencias-cards) ───
const CARD_UI_META: Record<string, { icone: Icon; cor: string }> = {
  leituras_realizadas: { icone: ChartLineUp, cor: '#818cf8' },
  performance_acertos: { icone: ChartDonut, cor: '#34d399' },
  recursos_reduzidos:  { icone: Timer,      cor: '#34d399' },
}

const PERIODOS = [
  { id: '7d',   label: '7 dias' },
  { id: '30d',  label: '30 dias' },
  { id: '6m',   label: '6 meses' },
  { id: '1a',   label: '1 ano' },
  { id: 'tudo', label: 'Tudo' },
]

// ─── Metadados visuais dos gráficos do Insights (catálogo em use-preferencias) ─
const GRAFICO_UI_META: Record<string, { icone: Icon; cor: string }> = {
  evolucao_diaria:      { icone: ChartBar,       cor: '#3b82f6' },
  campos_acertos:       { icone: ChartPie,       cor: '#34d399' },
  tipos_documento:      { icone: Files,          cor: '#818cf8' },
  economia_estimada:    { icone: CurrencyDollar, cor: '#f59e0b' },
  rankings_fornecedor:  { icone: UsersThree,     cor: '#f59e0b' },
}

const DENSIDADE_OPCOES: { id: DensidadeTabelaSmartRead; label: string }[] = [
  { id: 'compacto', label: 'Compacto' },
  { id: 'confortavel', label: 'Confortável' },
]

const SIDEBAR: { id: CategoriaId; label: string; icone: Icon }[] = [
  { id: 'card',        label: 'Card',        icone: SquaresFour },
  { id: 'visao-geral', label: 'Visão Geral', icone: ChartPieSlice },
  { id: 'tabelas',     label: 'Tabelas',     icone: Table },
  { id: 'colunas',     label: 'Colunas',     icone: Columns },
]

export default function ConfiguracoesSmartRead() {
  const [categoria, setCategoria] = useState<CategoriaId>('card')
  const addNotification = useShellStore((s) => s.addNotification)

  const { prefs: prefsSalvas, persistir } = usePreferenciasCardsSmartRead()
  const [pendingCardsPrefs, setPendingCardsPrefs] = useState<CardPreferenciaSmartRead[]>(prefsSalvas.cards)
  const [pendingPeriodoCards, setPendingPeriodoCards] = useState(prefsSalvas.periodo)
  const [cardsPrefsBaseline, setCardsPrefsBaseline] = useState<CardPreferenciaSmartRead[]>(prefsSalvas.cards)
  const [periodoCardsBaseline, setPeriodoCardsBaseline] = useState(prefsSalvas.periodo)
  const [arrastandoCard, setArrastandoCard] = useState<string | null>(null)

  useEffect(() => {
    setPendingCardsPrefs(prefsSalvas.cards)
    setCardsPrefsBaseline(prefsSalvas.cards)
    setPendingPeriodoCards(prefsSalvas.periodo)
    setPeriodoCardsBaseline(prefsSalvas.periodo)
  }, [prefsSalvas])

  const cardsConfigDirty =
    JSON.stringify(pendingCardsPrefs) !== JSON.stringify(cardsPrefsBaseline)
    || pendingPeriodoCards !== periodoCardsBaseline

  const salvarCardsConfig = useCallback(() => {
    persistir({ cards: pendingCardsPrefs, periodo: pendingPeriodoCards })
    setCardsPrefsBaseline(pendingCardsPrefs)
    setPeriodoCardsBaseline(pendingPeriodoCards)
    addNotification({ type: 'success', message: 'Preferências de cards salvas.' })
  }, [pendingCardsPrefs, pendingPeriodoCards, persistir, addNotification])

  const restaurarCardsPadrao = useCallback(() => {
    setPendingCardsPrefs(PREFERENCIAS_CARDS_PADRAO_SMART_READ.cards)
    setPendingPeriodoCards(PREFERENCIAS_CARDS_PADRAO_SMART_READ.periodo)
  }, [])

  // ── Visão Geral / Tabelas / Colunas — persistidas em localStorage ───────────
  const { prefs: visualizacaoSalva, persistirParcial } = usePreferenciasVisualizacaoSmartRead()

  // Visão Geral (gráficos do Insights)
  const [pendingGraficosOcultos, setPendingGraficosOcultos] = useState<string[]>(visualizacaoSalva.graficos_ocultos)
  const [graficosOcultosBaseline, setGraficosOcultosBaseline] = useState<string[]>(visualizacaoSalva.graficos_ocultos)

  // Tabelas (lista de leituras)
  const [pendingLinhasPagina, setPendingLinhasPagina] = useState<LinhasPaginaSmartRead>(visualizacaoSalva.linhas_pagina)
  const [pendingDensidade, setPendingDensidade] = useState<DensidadeTabelaSmartRead>(visualizacaoSalva.densidade)
  const [tabelasBaseline, setTabelasBaseline] = useState({
    linhas: visualizacaoSalva.linhas_pagina,
    densidade: visualizacaoSalva.densidade,
  })

  // Colunas Personalizadas (lista de leituras)
  const [pendingColunas, setPendingColunas] = useState<ColunaPersonalizadaSmartRead[]>(visualizacaoSalva.colunas_personalizadas)
  const [colunasBaseline, setColunasBaseline] = useState<ColunaPersonalizadaSmartRead[]>(visualizacaoSalva.colunas_personalizadas)
  const [arrastandoColuna, setArrastandoColuna] = useState<string | null>(null)
  const [editandoColunaId, setEditandoColunaId] = useState<string | null>(null)

  useEffect(() => {
    setPendingGraficosOcultos(visualizacaoSalva.graficos_ocultos)
    setGraficosOcultosBaseline(visualizacaoSalva.graficos_ocultos)
    setPendingLinhasPagina(visualizacaoSalva.linhas_pagina)
    setPendingDensidade(visualizacaoSalva.densidade)
    setTabelasBaseline({ linhas: visualizacaoSalva.linhas_pagina, densidade: visualizacaoSalva.densidade })
    setPendingColunas(visualizacaoSalva.colunas_personalizadas)
    setColunasBaseline(visualizacaoSalva.colunas_personalizadas)
  }, [visualizacaoSalva])

  // Visão Geral — dirty / salvar / restaurar
  const graficosDirty =
    JSON.stringify([...pendingGraficosOcultos].sort()) !== JSON.stringify([...graficosOcultosBaseline].sort())

  const salvarVisaoGeral = useCallback(() => {
    persistirParcial({ graficos_ocultos: pendingGraficosOcultos })
    setGraficosOcultosBaseline(pendingGraficosOcultos)
    addNotification({ type: 'success', message: 'Preferências da Visão Geral salvas.' })
  }, [pendingGraficosOcultos, persistirParcial, addNotification])

  const restaurarVisaoGeralPadrao = useCallback(() => {
    setPendingGraficosOcultos(PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ.graficos_ocultos)
  }, [])

  // Tabelas — dirty / salvar / restaurar
  const tabelasDirty =
    pendingLinhasPagina !== tabelasBaseline.linhas || pendingDensidade !== tabelasBaseline.densidade

  const salvarTabelas = useCallback(() => {
    persistirParcial({ linhas_pagina: pendingLinhasPagina, densidade: pendingDensidade })
    setTabelasBaseline({ linhas: pendingLinhasPagina, densidade: pendingDensidade })
    addNotification({ type: 'success', message: 'Preferências de tabela salvas.' })
  }, [pendingLinhasPagina, pendingDensidade, persistirParcial, addNotification])

  const restaurarTabelasPadrao = useCallback(() => {
    setPendingLinhasPagina(PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ.linhas_pagina)
    setPendingDensidade(PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ.densidade)
  }, [])

  // Colunas — dirty / salvar / restaurar
  const colunasDirty = JSON.stringify(pendingColunas) !== JSON.stringify(colunasBaseline)

  const salvarColunas = useCallback(() => {
    persistirParcial({ colunas_personalizadas: pendingColunas })
    setColunasBaseline(pendingColunas)
    setEditandoColunaId(null)
    addNotification({ type: 'success', message: 'Colunas personalizadas salvas.' })
  }, [pendingColunas, persistirParcial, addNotification])

  const restaurarColunasPadrao = useCallback(() => {
    setPendingColunas(PREFERENCIAS_VISUALIZACAO_PADRAO_SMART_READ.colunas_personalizadas)
    setEditandoColunaId(null)
  }, [])

  function criarColuna() {
    const id = gerarIdColunaPersonalizadaSmartRead()
    setPendingColunas((prev) => [...prev, { id, nome: 'Nova coluna', visible: true }])
    setEditandoColunaId(id)
  }

  const periodoLabel = PERIODOS.find((p) => p.id === pendingPeriodoCards)?.label ?? pendingPeriodoCards

  const cardsDisponiveis = useMemo(
    () => CARDS_CATALOGO_SMART_READ.filter((def) => !pendingCardsPrefs.some((c) => c.id === def.id)),
    [pendingCardsPrefs],
  )

  function reordenar<T extends { id: string }>(lista: T[], arrastandoId: string, alvoId: string): T[] {
    if (arrastandoId === alvoId) return lista
    const from = lista.findIndex((c) => c.id === arrastandoId)
    const to = lista.findIndex((c) => c.id === alvoId)
    if (from < 0 || to < 0) return lista
    const next = [...lista]
    const [movido] = next.splice(from, 1)
    next.splice(to, 0, movido)
    return next
  }

  return (
    <div className="srcfg-root">
      <div className="smart-read-vis-toolbar">
        <SmartReadVisualizacaoTabs />
      </div>

      <div className="cfg-page ws-fade-up">
        {/* ── Sidebar ── */}
        <aside className="cfg-sidebar">
          <nav className="cfg-sidebar__nav">
            <span className="cfg-sidebar__titulo--grupo">Visualizações</span>
            {SIDEBAR.map((item) => {
              const Icone = item.icone
              const ativo = categoria === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`cfg-sidebar__item${ativo ? ' cfg-sidebar__item--ativo' : ''}`}
                  onClick={() => setCategoria(item.id)}
                >
                  <span className="cfg-sidebar__item-icon"><Icone weight="duotone" size={16} /></span>
                  <span className="cfg-sidebar__item-label">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* ── Conteúdo ── */}
        <main className="cfg-conteudo">

          {/* ════════════ CARD ════════════ */}
          {categoria === 'card' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Meus Cards</h2>
                    <p className="cfg-secao__desc">Cards exibidos no topo das leituras · arraste para reordenar · olho para ocultar.</p>
                  </div>
                  <div className="cfg-secao__header-actions">
                    <button
                      type="button"
                      className="cfg-add-row-btn"
                      disabled={cardsDisponiveis.length === 0}
                      onClick={() => {
                        const proximo = cardsDisponiveis[0]
                        if (proximo) setPendingCardsPrefs((prev) => [...prev, { id: proximo.id, visible: true }])
                      }}
                    >
                      <Plus size={13} weight="bold" />
                      Adicionar card
                    </button>
                  </div>
                </div>

                {/* Período de comparação */}
                <ConfiguracaoSecaoGlobal label="Período de comparação" />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {PERIODOS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className={`cfg-periodo-pill${pendingPeriodoCards === p.id ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setPendingPeriodoCards(p.id)}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {pendingCardsPrefs.length > 0 && (
                  <div className="cfg-cards-preview-wrap">
                    <p className="cfg-cards-preview-label">
                      <SquaresFour size={12} weight="fill" /> Preview — como ficará na tela
                    </p>
                    <div className="cfg-cards-preview-grid">
                      {pendingCardsPrefs.map((pref, i) => {
                        const def = CARDS_CATALOGO_SMART_READ.find((c) => c.id === pref.id)
                        const meta = def ? CARD_UI_META[def.id] : undefined
                        if (!def || !meta) return null
                        const Icone = meta.icone
                        return (
                          <div
                            key={pref.id}
                            className={`cfg-kpi-preview-card${!pref.visible ? ' cfg-kpi-preview-card--oculto' : ''}`}
                            style={{ borderTopColor: meta.cor }}
                          >
                            <span className="cfg-kpi-preview-card__pos">{i + 1}</span>
                            <span className="cfg-kpi-preview-card__icon" style={{ color: meta.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div className="cfg-kpi-preview-card__line" style={{ background: meta.cor }} />
                            <p className="cfg-kpi-preview-card__label">{def.titulo}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Ativos */}
                <ConfiguracaoSecaoGlobal label="Ativos" count={`${pendingCardsPrefs.length} cards`} />
                {pendingCardsPrefs.length === 0 ? (
                  <p className="cfg-empty">Nenhum card ativo. Adicione um card abaixo.</p>
                ) : (
                  <div className="cfg-cards-lista">
                    {pendingCardsPrefs.map((pref) => {
                      const def = CARDS_CATALOGO_SMART_READ.find((c) => c.id === pref.id)
                      const meta = def ? CARD_UI_META[def.id] : undefined
                      if (!def || !meta) return null
                      const Icone = meta.icone
                      return (
                        <div
                          key={pref.id}
                          className={`cfg-card-row${!pref.visible ? ' cfg-card-row--oculto' : ''}${arrastandoCard === pref.id ? ' cfg-card-row--arrastando' : ''}`}
                          draggable
                          onDragStart={() => setArrastandoCard(pref.id)}
                          onDragEnter={() => { if (arrastandoCard) setPendingCardsPrefs((prev) => reordenar(prev, arrastandoCard, pref.id)) }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setArrastandoCard(null)}
                        >
                          <span className="cfg-drag-handle"><DotsSixVertical size={16} weight="bold" /></span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: meta.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.titulo}</p>
                              <p className="cfg-card-row__desc">{def.descricao} · {periodoLabel}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className={`cfg-eye-btn${pref.visible ? ' cfg-eye-btn--on' : ''}`}
                            onClick={() => setPendingCardsPrefs((prev) => prev.map((c) => (c.id === pref.id ? { ...c, visible: !c.visible } : c)))}
                            aria-label={pref.visible ? 'Ocultar card' : 'Exibir card'}
                          >
                            {pref.visible ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-remove-btn"
                            onClick={() => setPendingCardsPrefs((prev) => prev.filter((c) => c.id !== pref.id))}
                            aria-label="Remover card"
                          >
                            <X size={13} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Disponíveis */}
                <ConfiguracaoSecaoGlobal label="Disponíveis" hint="Clique em + para adicionar" style={{ marginTop: '1.5rem' }} />
                {cardsDisponiveis.length === 0 ? (
                  <p className="cfg-hint" style={{ textAlign: 'center', padding: '1rem 0' }}>Todos os cards já foram adicionados.</p>
                ) : (
                  <div className="cfg-cards-lista">
                    {cardsDisponiveis.map((def) => {
                      const meta = CARD_UI_META[def.id]
                      if (!meta) return null
                      const Icone = meta.icone
                      return (
                        <div key={def.id} className="cfg-card-row cfg-card-row--disponivel">
                          <span className="cfg-drag-handle cfg-drag-handle--ghost"><DotsSixVertical size={16} weight="bold" /></span>
                          <div className="cfg-card-row__info">
                            <span className="cfg-card-row__icone" style={{ color: meta.cor }}>
                              <Icone weight="duotone" size={18} />
                            </span>
                            <div>
                              <p className="cfg-card-row__nome">{def.titulo}</p>
                              <p className="cfg-card-row__desc">{def.descricao}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="cfg-add-btn"
                            onClick={() => setPendingCardsPrefs((prev) => [...prev, { id: def.id, visible: true }])}
                            aria-label="Adicionar card"
                          >
                            <Plus size={15} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="cfg-secao__footer">
                  <BotaoCancelar
                    dirty={cardsConfigDirty}
                    rotulo="Restaurar padrão"
                    onClick={restaurarCardsPadrao}
                  />
                  <BotaoSalvar
                    dirty={cardsConfigDirty}
                    rotulo="Salvar"
                    onClick={salvarCardsConfig}
                  />
                </div>
              </section>
            </div>
          )}

          {/* ════════════ VISÃO GERAL ════════════ */}
          {categoria === 'visao-geral' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Visão Geral</h2>
                    <p className="cfg-secao__desc">Gráficos exibidos no painel de Insights · olho para ocultar.</p>
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal
                  label="Gráficos"
                  count={`${GRAFICOS_CATALOGO_INSIGHTS_SMART_READ.length - pendingGraficosOcultos.length} de ${GRAFICOS_CATALOGO_INSIGHTS_SMART_READ.length}`}
                />
                <div className="cfg-cards-lista">
                  {GRAFICOS_CATALOGO_INSIGHTS_SMART_READ.map((g) => {
                    const meta = GRAFICO_UI_META[g.id]
                    if (!meta) return null
                    const Icone = meta.icone
                    const visivel = !pendingGraficosOcultos.includes(g.id)
                    return (
                      <div key={g.id} className={`cfg-card-row${!visivel ? ' cfg-card-row--oculto' : ''}`}>
                        <div className="cfg-card-row__info">
                          <span className="cfg-card-row__icone" style={{ color: meta.cor }}>
                            <Icone weight="duotone" size={18} />
                          </span>
                          <div>
                            <p className="cfg-card-row__nome">{g.titulo}</p>
                            <p className="cfg-card-row__desc">{g.descricao}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`cfg-eye-btn${visivel ? ' cfg-eye-btn--on' : ''}`}
                          onClick={() => setPendingGraficosOcultos((prev) => (
                            prev.includes(g.id) ? prev.filter((id) => id !== g.id) : [...prev, g.id]
                          ))}
                          aria-label={visivel ? 'Ocultar gráfico' : 'Exibir gráfico'}
                        >
                          {visivel ? <Eye size={15} weight="bold" /> : <EyeSlash size={15} weight="bold" />}
                        </button>
                      </div>
                    )
                  })}
                </div>

                <div className="cfg-secao__footer">
                  <BotaoCancelar
                    dirty={graficosDirty}
                    rotulo="Restaurar padrão"
                    onClick={restaurarVisaoGeralPadrao}
                  />
                  <BotaoSalvar
                    dirty={graficosDirty}
                    rotulo="Salvar"
                    onClick={salvarVisaoGeral}
                  />
                </div>
              </section>
            </div>
          )}

          {/* ════════════ TABELAS ════════════ */}
          {categoria === 'tabelas' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Tabelas</h2>
                    <p className="cfg-secao__desc">Exibição da tabela de leituras.</p>
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal label="Linhas por página" />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {LINHAS_PAGINA_OPCOES_SMART_READ.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`cfg-periodo-pill${pendingLinhasPagina === n ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setPendingLinhasPagina(n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <ConfiguracaoSecaoGlobal label="Densidade" style={{ marginTop: '1.5rem' }} />
                <div className="cfg-periodo-row">
                  <div className="cfg-periodo-pills">
                    {DENSIDADE_OPCOES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className={`cfg-periodo-pill${pendingDensidade === d.id ? ' cfg-periodo-pill--ativo' : ''}`}
                        onClick={() => setPendingDensidade(d.id)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="cfg-secao__footer">
                  <BotaoCancelar
                    dirty={tabelasDirty}
                    rotulo="Restaurar padrão"
                    onClick={restaurarTabelasPadrao}
                  />
                  <BotaoSalvar
                    dirty={tabelasDirty}
                    rotulo="Salvar"
                    onClick={salvarTabelas}
                  />
                </div>
              </section>
            </div>
          )}

          {/* ════════════ COLUNAS ════════════ */}
          {categoria === 'colunas' && (
            <div className="cfg-cards-wrapper">
              <section className="cfg-secao">
                <div className="cfg-secao__header">
                  <div>
                    <h2 className="cfg-secao__titulo">Colunas Personalizadas</h2>
                    <p className="cfg-secao__desc">Crie colunas extras para a tabela de leituras.</p>
                  </div>
                </div>

                {/* Ativas + Criar Coluna */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <ConfiguracaoSecaoGlobal
                    label="Ativas"
                    count={pendingColunas.length}
                    hint="Arraste para reordenar · lápis para editar · olho para ocultar"
                  />
                  <BotaoGlobal variante="primario" onClick={criarColuna}>
                    <Plus size={16} weight="bold" />
                    Criar Coluna
                  </BotaoGlobal>
                </div>

                {pendingColunas.length === 0 ? (
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '0.5rem', padding: '1.5rem', textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', borderRadius: '8px',
                    border: '1px dashed rgba(255,255,255,0.08)',
                  }}>
                    <Columns size={28} weight="duotone" style={{ color: 'var(--ws-muted, #64748b)' }} />
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #94a3b8)', margin: 0 }}>
                      Nenhuma coluna criada ainda
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', margin: 0 }}>
                      Use o botão "Criar Coluna" para criar a primeira.
                    </p>
                  </div>
                ) : (
                  <div className="cfg-kanban-campo-lista">
                    {pendingColunas.map((col) => {
                      const editando = editandoColunaId === col.id
                      return (
                        <div
                          key={col.id}
                          className={`cfg-kanban-campo-row${!col.visible ? ' cfg-kanban-campo-row--oculto' : ''}${editando ? ' cfg-kanban-campo-row--editando' : ''}${arrastandoColuna === col.id ? ' cfg-kanban-campo-row--arrastando' : ''}`}
                          draggable={!editando}
                          onDragStart={() => setArrastandoColuna(col.id)}
                          onDragEnter={() => { if (arrastandoColuna) setPendingColunas((prev) => reordenar(prev, arrastandoColuna, col.id)) }}
                          onDragOver={(e) => e.preventDefault()}
                          onDragEnd={() => setArrastandoColuna(null)}
                        >
                          <span className="cfg-drag-handle"><DotsSixVertical size={15} weight="bold" /></span>
                          <div className="cfg-kanban-campo-row__info">
                            {editando ? (
                              <input
                                type="text"
                                className="cfg-coluna-nome-input"
                                value={col.nome}
                                autoFocus
                                maxLength={50}
                                onChange={(e) => setPendingColunas((prev) => prev.map((c) => (c.id === col.id ? { ...c, nome: e.target.value } : c)))}
                                onBlur={() => setEditandoColunaId(null)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setEditandoColunaId(null) }}
                              />
                            ) : (
                              <span className="cfg-kanban-campo-row__nome">{col.nome}</span>
                            )}
                            <span className="cfg-kanban-campo-row__tipo">Personalizada</span>
                          </div>
                          <button
                            type="button"
                            className={`cfg-kanban-campo-btn${editando ? ' cfg-kanban-campo-btn--ativo' : ''}`}
                            onClick={() => setEditandoColunaId(editando ? null : col.id)}
                            aria-label={`Renomear coluna ${col.nome}`}
                          >
                            <PencilSimple size={14} weight="duotone" />
                          </button>
                          <button
                            type="button"
                            className="cfg-kanban-campo-btn"
                            onClick={() => setPendingColunas((prev) => prev.map((c) => (c.id === col.id ? { ...c, visible: !c.visible } : c)))}
                            aria-label={col.visible ? `Ocultar coluna ${col.nome}` : `Exibir coluna ${col.nome}`}
                          >
                            {col.visible ? <Eye size={14} weight="duotone" /> : <EyeSlash size={14} weight="duotone" />}
                          </button>
                          <button
                            type="button"
                            className="cfg-kanban-campo-btn cfg-kanban-campo-btn--remove"
                            onClick={() => setPendingColunas((prev) => prev.filter((c) => c.id !== col.id))}
                            aria-label={`Excluir coluna ${col.nome}`}
                          >
                            <Trash size={14} weight="bold" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="cfg-secao__footer">
                  <BotaoCancelar
                    dirty={colunasDirty}
                    rotulo="Restaurar padrão"
                    onClick={restaurarColunasPadrao}
                  />
                  <BotaoSalvar
                    dirty={colunasDirty}
                    rotulo="Salvar"
                    onClick={salvarColunas}
                  />
                </div>
              </section>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
