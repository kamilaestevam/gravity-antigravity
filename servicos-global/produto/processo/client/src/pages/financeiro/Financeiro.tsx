/**
 * Financeiro.tsx — Financeiro do processo (mesma estetica de Dados do Processo)
 *
 * Espelha os dados do produto FINANCEIRO-COMEX consolidados pra este processo.
 * Schema fonte:
 *   servicos-global/produto/financeiro-comex/prisma/fragment.prisma
 *   - FinanceiroProcesso (totais por moeda + status)
 *   - FinanceiroLancamento (cada movimentacao)
 *   - FinanceiroNumerario (adiantamentos ao despachante)
 *   - FinanceiroRateio (arquivos XLSX)
 *
 * NOTA: mock por enquanto. Quando o back/banco estiver pronto, trocar
 * MOCK_* por chamadas reais filtradas por processo_id.
 */

import React, { useState, useMemo, useEffect } from 'react'
import {
  CurrencyDollar, Receipt, FileXls, MagnifyingGlass, X,
  CaretDown, SidebarSimple, CheckCircle, Circle, Warning,
  CalendarBlank, Buildings, Plus, ArrowsClockwise, ClockCounterClockwise,
  FileArrowDown,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { TooltipGlobal } from '@nucleo/tooltip-global'
import '../dados-tecnicos/DadosTecnicos.css'  // reaproveita base do layout
import './Financeiro.css'                     // estilos especificos

// ── Tipos espelhando o schema financeiro-comex ─────────────────────────────

type Moeda = 'BRL' | 'USD' | 'EUR'
type StatusPagamento = 'pendente' | 'agendado' | 'pago' | 'cancelado'

interface Lancamento {
  id: string
  data: string                  // ISO date
  descricao: string             // "4 - Frete Internacional"
  fornecedor: string            // "ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA."
  moeda: Moeda
  taxa: number                  // taxa_cambio
  valor: number                 // valor original na moeda
  valor_brl: number             // sempre em BRL
  condicao?: string             // "30 dias", "à vista", etc
  data_pagamento?: string       // ISO date
  data_vencimento?: string      // ISO date
  status: StatusPagamento
  observacao?: string
}

interface Numerario {
  id: string
  descricao: string
  is_principal: boolean
  data: string                  // ISO
  valor_total: number           // BRL
}

interface Rateio {
  id: string
  nome: string                  // "Rateio"
  data: string                  // ISO datetime
}

// ── Mocks (5 lancamentos, 1 numerario principal, 2 rateios) ────────────────

const MOCK_LANCAMENTOS: Lancamento[] = [
  { id: 'l1', data: '2025-12-29T12:01:58Z', descricao: '4 - Frete Internacional',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'USD', taxa: 5.5413, valor: 800, valor_brl: 4433.04,
    data_vencimento: '2026-01-15', status: 'pendente' },
  { id: 'l2', data: '2025-12-29T12:01:58Z', descricao: '56 - Taxas do CE (Collect)',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'BRL', taxa: 1, valor: 404.55, valor_brl: 404.55,
    data_vencimento: '2026-01-10', status: 'pendente' },
  { id: 'l3', data: '2025-12-29T12:01:58Z', descricao: '8 - THC',
    fornecedor: 'ASIA SHIPPING TRANSPORTES INTERNACIONAIS LTDA.',
    moeda: 'BRL', taxa: 1, valor: 600, valor_brl: 600,
    data_pagamento: '2025-12-30', status: 'pago' },
  { id: 'l4', data: '2025-12-29T12:01:58Z', descricao: '9 - Marinha Mercante (AFRMM)',
    fornecedor: 'MARINHA MERCANTE', moeda: 'BRL', taxa: 1, valor: 450.77, valor_brl: 450.77,
    data_pagamento: '2025-12-30', status: 'pago' },
  { id: 'l5', data: '2025-12-29T12:05:47Z', descricao: '18 - Seguro',
    fornecedor: 'AXA SEGUROS S.A', moeda: 'USD', taxa: 5.5413, valor: 1.02914, valor_brl: 5.70,
    data_vencimento: '2026-02-01', status: 'agendado' },
]

const MOCK_NUMERARIOS: Numerario[] = [
  { id: 'n1', descricao: 'Numerário principal', is_principal: true,
    data: '2025-12-28', valor_total: 0 },
]

const MOCK_RATEIOS: Rateio[] = [
  { id: 'r1', nome: 'Rateio', data: '2025-12-29T12:24:00Z' },
  { id: 'r2', nome: 'Rateio', data: '2025-12-29T12:28:00Z' },
]

// ── Utils ──────────────────────────────────────────────────────────────────

const fmtMoeda = (v: number, m: Moeda) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: m })

const fmtData = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

const fmtDataHora = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABEL: Record<StatusPagamento, string> = {
  pendente:  'Pendente',
  agendado:  'Agendado',
  pago:      'Pago',
  cancelado: 'Cancelado',
}

// ── Secoes do TOC ──────────────────────────────────────────────────────────

const SECOES = [
  { id: 'movimentacao', titulo: 'Movimentação', icone: <Receipt weight="duotone" size={18} /> },
  { id: 'numerario',    titulo: 'Numerário',    icone: <CurrencyDollar weight="duotone" size={18} /> },
  { id: 'rateio',       titulo: 'Rateio',       icone: <FileXls weight="duotone" size={18} /> },
] as const

type SecaoId = typeof SECOES[number]['id']

// ── Componente principal ───────────────────────────────────────────────────

export default function Financeiro() {
  const [secaoAtiva, setSecaoAtiva] = useState<SecaoId>('movimentacao')
  const [tocColapsada, setTocColapsada] = useState(true)
  const [busca, setBusca] = useState('')
  const [moedaAtiva, setMoedaAtiva] = useState<Moeda>('BRL')
  // Default: todas as secoes COLAPSADAS
  const [secoesColapsadas, setSecoesColapsadas] = useState<Set<string>>(
    () => new Set(SECOES.map(s => s.id))
  )

  function toggleSecao(id: string) {
    setSecoesColapsadas(prev => {
      const novo = new Set(prev)
      if (novo.has(id)) novo.delete(id); else novo.add(id)
      return novo
    })
  }
  function expandirSecao(id: string) {
    setSecoesColapsadas(prev => {
      if (!prev.has(id)) return prev
      const novo = new Set(prev)
      novo.delete(id)
      return novo
    })
  }
  const todasColapsadas = secoesColapsadas.size === SECOES.length
  function toggleTodas() {
    setSecoesColapsadas(prev =>
      prev.size === SECOES.length ? new Set() : new Set(SECOES.map(s => s.id))
    )
  }

  // ── Totais consolidados (do FinanceiroProcesso) ────────────────────────
  const totais = useMemo(() => {
    const acc = {
      BRL: { aberto: 0, pago: 0, agendado: 0, total: 0 },
      USD: { aberto: 0, pago: 0, agendado: 0, total: 0 },
      EUR: { aberto: 0, pago: 0, agendado: 0, total: 0 },
    } as Record<Moeda, { aberto: number; pago: number; agendado: number; total: number }>
    for (const l of MOCK_LANCAMENTOS) {
      if (l.status === 'cancelado') continue
      acc[l.moeda].total += l.valor
      if (l.status === 'pendente')  acc[l.moeda].aberto   += l.valor
      if (l.status === 'agendado')  acc[l.moeda].agendado += l.valor
      if (l.status === 'pago')      acc[l.moeda].pago     += l.valor
    }
    return acc
  }, [])

  // Conta por secao (pra pill do TOC)
  const contagens: Record<SecaoId, number> = {
    movimentacao: MOCK_LANCAMENTOS.length,
    numerario:    MOCK_NUMERARIOS.length,
    rateio:       MOCK_RATEIOS.length,
  }

  // Filtro de busca (so afeta movimentacao por enquanto)
  const buscaNorm = busca.trim().toLowerCase()
  const filtroAtivo = buscaNorm !== ''
  const lancamentosFiltrados = useMemo(() => {
    if (!filtroAtivo) return MOCK_LANCAMENTOS
    return MOCK_LANCAMENTOS.filter(l =>
      l.descricao.toLowerCase().includes(buscaNorm)
      || l.fornecedor.toLowerCase().includes(buscaNorm)
    )
  }, [buscaNorm, filtroAtivo])

  // Scroll-spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visiveis = entries.filter(e => e.isIntersecting)
        if (visiveis.length > 0) {
          const top = visiveis.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          )
          setSecaoAtiva(top.target.id as SecaoId)
        }
      },
      { rootMargin: '-100px 0px -60% 0px' }
    )
    SECOES.forEach(s => {
      const el = document.getElementById(s.id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  function irParaSecao(id: string) {
    expandirSecao(id)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const el = document.getElementById(id)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    })
  }

  // ── Donut: % preenchido do "total aberto" relativo ao total geral ──────
  const totaisMoeda = totais[moedaAtiva]
  const totalGeral = totaisMoeda.total
  const pctAberto = totalGeral > 0 ? Math.round((totaisMoeda.aberto / totalGeral) * 100) : 0
  const corDonut = pctAberto > 0 ? '#fbbf24' : '#34d399'  // ambar se ha aberto, verde se zerado

  return (
    <PaginaGlobal
      className="ws-fade-up"
      layout="lista"
      cabecalho={
        <CabecalhoGlobal
          icone={<CurrencyDollar weight="duotone" size={22} />}
          titulo="Financeiro"
          subtitulo="Movimentações, numerário e rateios consolidados do processo"
        />
      }
    >
      <div className={`dt-layout ${tocColapsada ? 'dt-layout--toc-colapsada' : ''}`}>
        {/* ── Sidebar: TOC + stats card ──────────────────────────────────── */}
        <div className="dt-sidebar">
          {/* TOC */}
          <aside className={`dt-toc ${tocColapsada ? 'dt-toc--colapsada' : ''}`} aria-label="Navegação Financeiro">
            <div className="dt-toc-topo">
              {!tocColapsada && (
                <div className="dt-toc-busca">
                  <MagnifyingGlass weight="duotone" size={14} className="dt-toc-busca-icon" />
                  <input
                    type="text"
                    className="dt-toc-busca-input"
                    placeholder="Buscar lançamento…"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                  />
                  {busca && (
                    <button type="button" className="dt-toc-busca-limpar" onClick={() => setBusca('')} title="Limpar">
                      <X size={12} weight="bold" />
                    </button>
                  )}
                </div>
              )}
              <button
                type="button"
                className="dt-toc-toggle"
                onClick={() => setTocColapsada(p => !p)}
                title={tocColapsada ? 'Expandir menu' : 'Recolher menu'}
              >
                <SidebarSimple weight="duotone" size={16} />
              </button>
            </div>

            {SECOES.map(sec => {
              const ativa = secaoAtiva === sec.id
              const total = contagens[sec.id]
              const botao = (
                <button
                  type="button"
                  className={`dt-toc-item ${ativa ? 'dt-toc-item--ativa' : ''}`}
                  onClick={() => irParaSecao(sec.id)}
                >
                  <span className="dt-toc-icon">{sec.icone}</span>
                  <span className="dt-toc-label">{sec.titulo}</span>
                  <span className="dt-toc-pill">
                    <Circle weight="duotone" size={12} />
                    {total}
                  </span>
                  {tocColapsada && (
                    <span className="dt-toc-dot" aria-hidden="true" />
                  )}
                </button>
              )
              return (
                <React.Fragment key={sec.id}>
                  {tocColapsada
                    ? <TooltipGlobal titulo={sec.titulo} descricao={`${total} ${total === 1 ? 'item' : 'itens'}`}>{botao}</TooltipGlobal>
                    : botao}
                </React.Fragment>
              )
            })}
          </aside>

          {/* Card de stats: total aberto por moeda + toggle BRL/USD/EUR */}
          <div className={`dt-stats fn-stats ${tocColapsada ? 'dt-stats--colapsada' : ''}`}>
            {!tocColapsada && (
              <div className="dt-stats-toggle">
                {(['BRL', 'USD', 'EUR'] as Moeda[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    className={`dt-stats-toggle-btn ${moedaAtiva === m ? 'dt-stats-toggle-btn--ativa' : ''}`}
                    onClick={() => setMoedaAtiva(m)}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}

            <div
              className="dt-stats-donut"
              style={{
                background: `conic-gradient(${corDonut} 0% ${pctAberto}%, rgba(148,163,184,0.18) ${pctAberto}% 100%)`,
              }}
            >
              <div className="dt-stats-donut-inner">
                <span className="dt-stats-donut-pct">{pctAberto}%</span>
              </div>
            </div>

            {!tocColapsada && (
              <div className="dt-stats-body">
                <div className="dt-stats-linha dt-stats-linha--hero">
                  <strong>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</strong>
                </div>
                <div className="fn-stats-rotulo">Total em aberto</div>

                <div className="fn-stats-detalhes">
                  <div className="fn-stats-detalhe">
                    <CheckCircle weight="fill" size={11} color="#34d399" />
                    <span>{fmtMoeda(totaisMoeda.pago, moedaAtiva)}</span>
                    <span className="fn-stats-detalhe-rotulo">pagos</span>
                  </div>
                  <div className="fn-stats-detalhe">
                    <CalendarBlank weight="duotone" size={11} color="#a78bfa" />
                    <span>{fmtMoeda(totaisMoeda.agendado, moedaAtiva)}</span>
                    <span className="fn-stats-detalhe-rotulo">agendados</span>
                  </div>
                  <div className="fn-stats-detalhe">
                    <Warning weight="fill" size={11} color="#fbbf24" />
                    <span>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</span>
                    <span className="fn-stats-detalhe-rotulo">pendentes</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Main: secoes empilhadas ──────────────────────────────────── */}
        <main className="dt-main">
          {/* Toolbar global */}
          <div className="dt-main-toolbar">
            <button type="button" className="dt-main-toolbar-btn" onClick={toggleTodas}>
              <CaretDown weight="bold" size={12}
                className={`dt-caret ${todasColapsadas ? 'dt-caret--colapsado' : ''}`} />
              {todasColapsadas ? 'Expandir todas' : 'Recolher todas'}
            </button>
          </div>

          {/* ── Secao: Movimentacao ─────────────────────────────────────── */}
          <section id="movimentacao" className={`dt-secao ${secoesColapsadas.has('movimentacao') && !filtroAtivo ? 'dt-secao--colapsada' : ''}`}>
            <button
              type="button"
              className="dt-secao-header"
              onClick={() => toggleSecao('movimentacao')}
              aria-expanded={!secoesColapsadas.has('movimentacao')}
            >
              <div className="dt-secao-title">
                <CaretDown weight="bold" size={14}
                  className={`dt-caret ${secoesColapsadas.has('movimentacao') && !filtroAtivo ? 'dt-caret--colapsado' : ''}`} />
                <span className="dt-secao-icon"><Receipt weight="duotone" size={18} /></span>
                <h2>Movimentação</h2>
              </div>
              <div className="dt-secao-completude">
                <span className="dt-secao-pill">{lancamentosFiltrados.length} {lancamentosFiltrados.length === 1 ? 'lançamento' : 'lançamentos'}</span>
              </div>
            </button>

            {(!secoesColapsadas.has('movimentacao') || filtroAtivo) && (
              <>
                <div className="fn-acoes">
                  <button type="button" className="fn-btn fn-btn--primario">
                    <Plus size={14} weight="bold" /> Novo Lançamento
                  </button>
                  <button type="button" className="fn-btn">
                    <CheckCircle size={14} weight="duotone" /> Solicitar Aprovação
                  </button>
                  <button type="button" className="fn-btn">
                    <ClockCounterClockwise size={14} weight="duotone" /> Histórico
                  </button>
                </div>

                <div className="fn-lista">
                  {lancamentosFiltrados.length === 0 ? (
                    <div className="dt-empty">
                      <MagnifyingGlass weight="duotone" size={32} />
                      <h3>Nenhum lançamento encontrado</h3>
                      <p>Nenhum lançamento cuja descrição ou fornecedor contenha “{busca}”.</p>
                    </div>
                  ) : (
                    lancamentosFiltrados.map(l => (
                      <article key={l.id} className={`fn-lancamento fn-lancamento--${l.status}`}>
                        <div className="fn-lancamento-status" aria-hidden />
                        <div className="fn-lancamento-corpo">
                          <header className="fn-lancamento-head">
                            <div className="fn-lancamento-titulo">
                              <strong>{l.descricao}</strong>
                              <span className={`fn-status fn-status--${l.status}`}>{STATUS_LABEL[l.status]}</span>
                            </div>
                            <div className="fn-lancamento-valor">
                              <strong>{fmtMoeda(l.valor, l.moeda)}</strong>
                              {l.moeda !== 'BRL' && (
                                <small>{fmtMoeda(l.valor_brl, 'BRL')}</small>
                              )}
                            </div>
                          </header>
                          <div className="fn-lancamento-meta">
                            <span className="fn-meta">
                              <Buildings weight="duotone" size={12} /> {l.fornecedor}
                            </span>
                            {l.data_vencimento && (
                              <span className="fn-meta">
                                <CalendarBlank weight="duotone" size={12} /> Vence em {fmtData(l.data_vencimento)}
                              </span>
                            )}
                            {l.data_pagamento && (
                              <span className="fn-meta fn-meta--ok">
                                <CheckCircle weight="fill" size={12} /> Pago em {fmtData(l.data_pagamento)}
                              </span>
                            )}
                            {l.moeda !== 'BRL' && (
                              <span className="fn-meta">Taxa {l.taxa.toFixed(4)}</span>
                            )}
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </>
            )}
          </section>

          {/* ── Secao: Numerario ───────────────────────────────────────── */}
          <section id="numerario" className={`dt-secao ${secoesColapsadas.has('numerario') ? 'dt-secao--colapsada' : ''}`}>
            <button
              type="button"
              className="dt-secao-header"
              onClick={() => toggleSecao('numerario')}
              aria-expanded={!secoesColapsadas.has('numerario')}
            >
              <div className="dt-secao-title">
                <CaretDown weight="bold" size={14}
                  className={`dt-caret ${secoesColapsadas.has('numerario') ? 'dt-caret--colapsado' : ''}`} />
                <span className="dt-secao-icon"><CurrencyDollar weight="duotone" size={18} /></span>
                <h2>Numerário</h2>
              </div>
              <div className="dt-secao-completude">
                <span className="dt-secao-pill">{MOCK_NUMERARIOS.length} {MOCK_NUMERARIOS.length === 1 ? 'item' : 'itens'}</span>
              </div>
            </button>

            {!secoesColapsadas.has('numerario') && (
              <>
                <div className="fn-acoes">
                  <button type="button" className="fn-btn fn-btn--primario">
                    <Plus size={14} weight="bold" /> Numerário Complementar
                  </button>
                  <button type="button" className="fn-btn">
                    <ArrowsClockwise size={14} weight="duotone" /> Recriar solicitação
                  </button>
                  <button type="button" className="fn-btn">
                    <ClockCounterClockwise size={14} weight="duotone" /> Histórico
                  </button>
                </div>

                <div className="fn-lista">
                  {MOCK_NUMERARIOS.map(n => (
                    <article key={n.id} className="fn-numerario">
                      <div className="fn-numerario-corpo">
                        <div className="fn-numerario-head">
                          <strong>{n.descricao}</strong>
                          {n.is_principal && <span className="fn-tag">Principal</span>}
                        </div>
                        <div className="fn-numerario-valor">
                          <strong>{fmtMoeda(n.valor_total, 'BRL')}</strong>
                          <span>solicitado em {fmtData(n.data)}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* ── Secao: Rateio ──────────────────────────────────────────── */}
          <section id="rateio" className={`dt-secao ${secoesColapsadas.has('rateio') ? 'dt-secao--colapsada' : ''}`}>
            <button
              type="button"
              className="dt-secao-header"
              onClick={() => toggleSecao('rateio')}
              aria-expanded={!secoesColapsadas.has('rateio')}
            >
              <div className="dt-secao-title">
                <CaretDown weight="bold" size={14}
                  className={`dt-caret ${secoesColapsadas.has('rateio') ? 'dt-caret--colapsado' : ''}`} />
                <span className="dt-secao-icon"><FileXls weight="duotone" size={18} /></span>
                <h2>Rateio</h2>
              </div>
              <div className="dt-secao-completude">
                <span className="dt-secao-pill">{MOCK_RATEIOS.length} {MOCK_RATEIOS.length === 1 ? 'arquivo' : 'arquivos'}</span>
              </div>
            </button>

            {!secoesColapsadas.has('rateio') && (
              <>
                <div className="fn-acoes">
                  <button type="button" className="fn-btn fn-btn--primario">
                    <Plus size={14} weight="bold" /> Gerar Novo Rateio
                  </button>
                </div>

                <div className="fn-lista">
                  {MOCK_RATEIOS.map(r => (
                    <article key={r.id} className="fn-rateio">
                      <span className="fn-rateio-icone"><FileXls weight="duotone" size={22} /></span>
                      <div className="fn-rateio-corpo">
                        <strong>{r.nome}</strong>
                        <span>{fmtDataHora(r.data)}</span>
                      </div>
                      <button type="button" className="fn-btn fn-btn--ghost" title="Baixar">
                        <FileArrowDown size={14} weight="duotone" />
                      </button>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </main>
      </div>
    </PaginaGlobal>
  )
}
