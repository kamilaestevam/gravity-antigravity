/**
 * FinanceiroMovimentacao — aba de lancamentos financeiros do processo.
 * Usa TabelaVirtualGlobal (lista padrao do sistema, igual PedidosLista).
 *
 * Schema fonte: FinanceiroLancamento (financeiro-comex/prisma/fragment.prisma).
 */

import React, { useState, useMemo } from 'react'
import {
  CurrencyDollar, Plus, ClockCounterClockwise, CheckCircle, Warning,
  CalendarBlank, PencilSimple, Eye, X as XIcon, Copy,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  TabelaVirtualGlobal,
  type GTColuna, type GTAcao, type GTAcaoLote, type GTAcaoExport,
} from '@nucleo/tabela-virtual-global'
import { FinanceiroTabs } from './FinanceiroTabs'
import {
  MOCK_LANCAMENTOS, fmtMoeda, fmtData, calcularTotais,
  STATUS_LABEL, type Moeda, type Lancamento,
} from './_mocks'
import './Financeiro.css'

export default function FinanceiroMovimentacao() {
  const [moedaAtiva, setMoedaAtiva] = useState<Moeda>('BRL')
  const [busca, setBusca] = useState('')
  const [sortCampo, setSortCampo] = useState<string>('data')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Totais consolidados (painel de insights) ───────────────────────────
  const totais = useMemo(() => calcularTotais(MOCK_LANCAMENTOS), [])
  const totaisMoeda = totais[moedaAtiva]
  const totalGeral = totaisMoeda.total
  const pctAberto = totalGeral > 0 ? Math.round((totaisMoeda.aberto / totalGeral) * 100) : 0
  const corDonut = pctAberto > 0 ? '#fbbf24' : '#34d399'

  // ── Filtro: busca + ordenacao (status removido, filtragem agora via
  //    funil do header da coluna Status) ────────────────────────────────
  const buscaNorm = busca.trim().toLowerCase()
  const lancamentosFiltrados = useMemo(() => {
    let arr = MOCK_LANCAMENTOS
    if (buscaNorm) {
      arr = arr.filter(l =>
        l.descricao.toLowerCase().includes(buscaNorm)
        || l.fornecedor.toLowerCase().includes(buscaNorm)
      )
    }
    const ordenado = [...arr].sort((a, b) => {
      const va = (a as unknown as Record<string, unknown>)[sortCampo]
      const vb = (b as unknown as Record<string, unknown>)[sortCampo]
      if (va == null) return 1
      if (vb == null) return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return sortDir === 'asc' ? va - vb : vb - va
      }
      const sa = String(va), sb = String(vb)
      return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
    return ordenado
  }, [buscaNorm, sortCampo, sortDir])

  // ── Colunas ─────────────────────────────────────────────────────────────
  const colunas: GTColuna<Lancamento>[] = [
    { key: 'data', label: 'Data', tipo: 'periodo', sortavel: true,
      render: (_v, l) => <span>{fmtData(l.data)}</span> },
    { key: 'descricao', label: 'Descrição', sortavel: true, naoOcultavel: true,
      render: (_v, l) => <strong style={{ color: 'var(--ws-text)', fontWeight: 600 }}>{l.descricao}</strong> },
    { key: 'fornecedor', label: 'Fornecedor', sortavel: true, filtravel: true,
      render: (_v, l) => <span>{l.fornecedor}</span> },
    { key: 'moeda', label: 'Moeda', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, l) => <span className="fn-pill-moeda">{l.moeda}</span> },
    { key: 'taxa', label: 'Taxa', tipo: 'numero', align: 'right', sortavel: true,
      render: (_v, l) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{l.taxa.toFixed(4)}</span> },
    { key: 'valor', label: 'Valor', tipo: 'moeda', align: 'right', sortavel: true,
      render: (_v, l) => <strong style={{ color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoeda(l.valor, l.moeda)}</strong> },
    { key: 'valor_brl', label: 'Valor R$', tipo: 'moeda', align: 'right', sortavel: true,
      render: (_v, l) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtMoeda(l.valor_brl, 'BRL')}</span> },
    { key: 'data_vencimento', label: 'Vencimento', tipo: 'periodo', sortavel: true,
      render: (_v, l) => l.data_vencimento
        ? <span><CalendarBlank weight="duotone" size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />{fmtData(l.data_vencimento)}</span>
        : <span style={{ opacity: 0.4 }}>—</span> },
    { key: 'data_pagamento', label: 'Pagamento', tipo: 'periodo', sortavel: true,
      render: (_v, l) => l.data_pagamento
        ? <span style={{ color: '#34d399' }}><CheckCircle weight="fill" size={12} style={{ marginRight: 4, verticalAlign: '-2px' }} />{fmtData(l.data_pagamento)}</span>
        : <span style={{ opacity: 0.4 }}>—</span> },
    { key: 'status', label: 'Status', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, l) => <span className={`fn-status fn-status--${l.status}`}>{STATUS_LABEL[l.status]}</span> },
  ]

  // ── Acoes ───────────────────────────────────────────────────────────────
  const acoes: GTAcao<Lancamento>[] = [
    { id: 'ver',       tooltip: 'Ver detalhes', icone: <Eye          size={16} weight="duotone" />,
      onClick: () => { /* TODO abrir detalhe */ } },
    { id: 'editar',    tooltip: 'Editar',       icone: <PencilSimple size={16} weight="duotone" />,
      onClick: () => { /* TODO edicao */ } },
    { id: 'duplicar',  tooltip: 'Duplicar',     icone: <Copy         size={16} weight="duotone" />,
      onClick: () => { /* TODO duplicar */ } },
    { id: 'cancelar',  tooltip: 'Cancelar',     icone: <XIcon        size={16} weight="duotone" />,
      variant: 'danger',
      visivel: (l) => l.status !== 'cancelado' && l.status !== 'pago',
      onClick: () => { /* TODO confirmar */ } },
  ]

  const acoesLote: GTAcaoLote<Lancamento>[] = [
    { id: 'solicitar_aprovacao', label: 'Solicitar Aprovação',
      onClick: () => { /* TODO */ } },
    { id: 'cancelar_lote', label: 'Cancelar selecionados', variant: 'danger',
      onClick: () => { /* TODO */ } },
  ]

  const acoesExportacao: GTAcaoExport[] = [
    { label: 'CSV',   onClick: () => { /* TODO */ } },
    { label: 'Excel', onClick: () => { /* TODO */ } },
  ]

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
      <FinanceiroTabs />

      {/* Painel: total aberto + breakdown por status (toggle de moeda
          movido pra cima da tabela, alinhado a direita). */}
      <div className="fn-insights">
        <div className="fn-insights-corpo">
          <div className="fn-insights-cards">
            <div className="fn-insights-card fn-insights-card--hero">
              <div
                className="fn-insights-donut"
                style={{
                  background: `conic-gradient(${corDonut} 0% ${pctAberto}%, rgba(148,163,184,0.18) ${pctAberto}% 100%)`,
                }}
              >
                <div className="fn-insights-donut-inner">
                  <span>{pctAberto}%</span>
                </div>
              </div>
              <div className="fn-insights-card-corpo">
                <span className="fn-insights-rotulo">Total em aberto</span>
                <strong>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</strong>
              </div>
            </div>

            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><CheckCircle weight="fill" size={12} color="#34d399" /> Pagos</span>
              <strong>{fmtMoeda(totaisMoeda.pago, moedaAtiva)}</strong>
            </div>
            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><CalendarBlank weight="duotone" size={12} color="#a78bfa" /> Agendados</span>
              <strong>{fmtMoeda(totaisMoeda.agendado, moedaAtiva)}</strong>
            </div>
            <div className="fn-insights-card">
              <span className="fn-insights-rotulo"><Warning weight="fill" size={12} color="#fbbf24" /> Pendentes</span>
              <strong>{fmtMoeda(totaisMoeda.aberto, moedaAtiva)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle de moeda — alinhado a direita, acima da tabela.
          Afeta apenas os cards de insights (totais consolidados). */}
      <div className="fn-moeda-row">
        <div className="fn-insights-toggle">
          {(['BRL', 'USD', 'EUR'] as Moeda[]).map(m => (
            <button
              key={m}
              type="button"
              className={`fn-insights-toggle-btn ${moedaAtiva === m ? 'fn-insights-toggle-btn--ativa' : ''}`}
              onClick={() => setMoedaAtiva(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela padrao do sistema. min-height pq pg-conteudo-area nao usa flex. */}
      <div style={{ minHeight: 'calc(100vh - 460px)', display: 'flex', flexDirection: 'column' }}>
        <TabelaVirtualGlobal<Lancamento>
          exibirCabecalhoQuandoVazio
          dados={lancamentosFiltrados}
          colunas={colunas}
          itemId={(l) => l.id}
          itensPorPagina={50}
          acoes={acoes}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          acoesBarra={
            <>
              <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
                Novo Lançamento
              </BotaoGlobal>
              <BotaoGlobal variante="secundario" icone={<CheckCircle size={16} />}>
                Solicitar Aprovação
              </BotaoGlobal>
              <BotaoGlobal variante="secundario" icone={<ClockCounterClockwise size={16} />}>
                Histórico
              </BotaoGlobal>
            </>
          }
          onBuscar={setBusca}
          placeholderBusca="Buscar lançamento por descrição ou fornecedor…"
          onOrdenar={(campo, dir) => { setSortCampo(campo); setSortDir(dir) }}
          sortCampo={sortCampo}
          sortDir={sortDir}
          carregando={false}
          emptyIcon={<CurrencyDollar weight="duotone" size={48} />}
          emptyTitle="Nenhum lançamento encontrado"
          emptyDescription="Ajuste os filtros ou crie um novo lançamento"
          ariaLabel="Tabela de lançamentos financeiros"
        />
      </div>
    </PaginaGlobal>
  )
}
