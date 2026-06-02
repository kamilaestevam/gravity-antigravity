/**
 * TodosProcessosLista — visualizacao em LISTA dos processos do workspace.
 * Usa TabelaVirtualGlobal com todo o padrao do PedidosLista: stats cards,
 * abas por etapa, acoes de linha e lote, exportacao, busca, colunas
 * configuraveis.
 */

import React, { useState, useMemo } from 'react'
import {
  Briefcase, Eye, PencilSimple, Plus, Globe, Anchor,
  Copy, Archive, Trash, ArrowsLeftRight, Cube, CurrencyDollar, Scales,
  CheckCircle, Hourglass, Warning, ClockCountdown,
} from '@phosphor-icons/react'
import { PaginaGlobal } from '@nucleo/pagina-global'
import { CabecalhoGlobal } from '@nucleo/cabecalho-global'
import { BotaoGlobal } from '@nucleo/botao-global'
import {
  TabelaVirtualGlobal,
  type GTColuna, type GTAcao, type GTAcaoLote, type GTAcaoExport,
  type GTAbaTipo,
} from '@nucleo/tabela-virtual-global'
import { TodosProcessosTabs } from './TodosProcessosTabs'
import {
  MOCK_PROCESSOS, ETAPAS_LABEL, ETAPAS_COR, ORDEM_ETAPAS,
  fmtMoeda, fmtPeso, fmtData,
  type ProcessoLinha, type EtapaProcesso,
} from './_mocks'
import './TodosProcessos.css'

export default function TodosProcessosLista() {
  const [busca, setBusca] = useState('')
  const [abaAtiva, setAbaAtiva] = useState<'todos' | EtapaProcesso>('todos')
  const [sortCampo, setSortCampo] = useState<string>('numero')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  // ── Stats cards (totais consolidados) ──────────────────────────────────
  const stats = useMemo(() => {
    const total = MOCK_PROCESSOS.length
    const emAndamento = MOCK_PROCESSOS.filter(p => p.etapa_atual !== 'concluido').length
    const concluidos = MOCK_PROCESSOS.filter(p => p.etapa_atual === 'concluido').length
    // Em atraso: data_chegada no passado e ainda nao concluido (mock simples)
    const hoje = new Date()
    const emAtraso = MOCK_PROCESSOS.filter(p =>
      p.data_chegada && new Date(p.data_chegada) < hoje && p.etapa_atual !== 'concluido'
    ).length
    // Em alerta: sem data_embarque mas data_abertura > 30 dias (mock)
    const emAlerta = MOCK_PROCESSOS.filter(p => {
      if (p.data_embarque) return false
      const dias = (hoje.getTime() - new Date(p.data_abertura).getTime()) / (1000 * 60 * 60 * 24)
      return dias > 30
    }).length
    const valorFobUSD = MOCK_PROCESSOS
      .filter(p => p.moeda === 'USD')
      .reduce((s, p) => s + p.valor_fob, 0)
    const valorFobEUR = MOCK_PROCESSOS
      .filter(p => p.moeda === 'EUR')
      .reduce((s, p) => s + p.valor_fob, 0)
    const pesoBrutoTotal = MOCK_PROCESSOS.reduce((s, p) => s + p.peso_bruto, 0)
    return { total, emAndamento, concluidos, emAtraso, emAlerta, valorFobUSD, valorFobEUR, pesoBrutoTotal }
  }, [])

  // ── Contagem por etapa (pras abas) ─────────────────────────────────────
  const contagens = useMemo(() => {
    const c: Record<'todos' | EtapaProcesso, number> = {
      todos: MOCK_PROCESSOS.length,
      abertura: 0, pedido: 0, li: 0, embarque: 0,
      desembaraco: 0, entrega: 0, concluido: 0,
    }
    for (const p of MOCK_PROCESSOS) c[p.etapa_atual]++
    return c
  }, [])

  // ── Filtro: aba + busca + sort ─────────────────────────────────────────
  const buscaNorm = busca.trim().toLowerCase()
  const dados = useMemo(() => {
    let arr = MOCK_PROCESSOS
    if (abaAtiva !== 'todos') arr = arr.filter(p => p.etapa_atual === abaAtiva)
    if (buscaNorm) {
      arr = arr.filter(p =>
        p.numero.toLowerCase().includes(buscaNorm)
        || p.importador.toLowerCase().includes(buscaNorm)
        || p.exportador.toLowerCase().includes(buscaNorm)
        || p.responsavel.toLowerCase().includes(buscaNorm)
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
      return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va))
    })
    return ordenado
  }, [abaAtiva, buscaNorm, sortCampo, sortDir])

  // ── Colunas ────────────────────────────────────────────────────────────
  const colunas: GTColuna<ProcessoLinha>[] = [
    { key: 'numero', label: 'Nº Processo', sortavel: true, naoOcultavel: true,
      render: (_v, p) => <strong style={{ color: 'var(--ws-text)', fontWeight: 600 }}>{p.numero}</strong> },
    { key: 'importador', label: 'Importador', sortavel: true, filtravel: true },
    { key: 'exportador', label: 'Exportador', sortavel: true, filtravel: true },
    { key: 'pais_origem', label: 'Origem', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, p) => <span className="tp-pill-pais"><Globe weight="duotone" size={11} />{p.pais_origem}</span> },
    { key: 'pais_destino', label: 'Destino', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, p) => <span className="tp-pill-pais"><Anchor weight="duotone" size={11} />{p.pais_destino}</span> },
    { key: 'incoterm', label: 'Incoterm', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, p) => <span className="tp-pill-incoterm">{p.incoterm}</span> },
    { key: 'via_transporte', label: 'Via', sortavel: true, filtravel: true },
    { key: 'valor_fob', label: 'Valor FOB', tipo: 'moeda', align: 'right', sortavel: true,
      render: (_v, p) => <strong style={{ color: 'var(--ws-text)', fontVariantNumeric: 'tabular-nums' }}>{fmtMoeda(p.valor_fob, p.moeda)}</strong> },
    { key: 'peso_bruto', label: 'Peso Bruto', tipo: 'numero', align: 'right', sortavel: true,
      render: (_v, p) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtPeso(p.peso_bruto)}</span> },
    { key: 'data_abertura', label: 'Abertura', tipo: 'periodo', sortavel: true,
      render: (_v, p) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtData(p.data_abertura)}</span> },
    { key: 'data_embarque', label: 'Embarque', tipo: 'periodo', sortavel: true,
      render: (_v, p) => p.data_embarque
        ? <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fmtData(p.data_embarque)}</span>
        : <span style={{ opacity: 0.4 }}>—</span> },
    { key: 'etapa_atual', label: 'Etapa Atual', tipo: 'badge', align: 'center', sortavel: true, filtravel: true,
      render: (_v, p) => (
        <span className="tp-pill-etapa" style={{
          background: `${ETAPAS_COR[p.etapa_atual]}22`,
          color: ETAPAS_COR[p.etapa_atual],
        }}>
          {ETAPAS_LABEL[p.etapa_atual]}
        </span>
      ) },
    { key: 'responsavel', label: 'Responsável', sortavel: true, filtravel: true },
  ]

  // ── Abas por etapa (estilo Pedido: so label, sem contagem nem cor) ───
  const abas: GTAbaTipo[] = [
    { valor: 'todos', label: 'Todos' },
    ...ORDEM_ETAPAS.map(e => ({
      valor: e,
      label: ETAPAS_LABEL[e],
    })),
  ]

  // ── Acoes de linha ─────────────────────────────────────────────────────
  const acoes: GTAcao<ProcessoLinha>[] = [
    { id: 'ver', tooltip: 'Abrir processo', icone: <Eye size={16} weight="duotone" />,
      onClick: (p) => { window.location.href = `/acesso-processos/${p.id}/workflow` } },
    { id: 'editar', tooltip: 'Editar', icone: <PencilSimple size={16} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'duplicar', tooltip: 'Duplicar', icone: <Copy size={16} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'arquivar', tooltip: 'Arquivar', icone: <Archive size={16} weight="duotone" />,
      onClick: () => { /* TODO */ } },
  ]

  // ── Acoes de lote (aparecem ao selecionar 1+ linha) ───────────────────
  const acoesLote: GTAcaoLote<ProcessoLinha>[] = [
    { id: 'transferir',     label: 'Transferir workspace', icone: <ArrowsLeftRight size={14} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'editar_lote',    label: 'Editar em massa', icone: <PencilSimple size={14} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'duplicar_lote',  label: 'Duplicar selecionados', icone: <Copy size={14} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'arquivar_lote',  label: 'Arquivar selecionados', icone: <Archive size={14} weight="duotone" />,
      onClick: () => { /* TODO */ } },
    { id: 'excluir_lote',   label: 'Excluir selecionados', icone: <Trash size={14} weight="duotone" />, variant: 'danger',
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
          icone={<Briefcase weight="duotone" size={22} />}
          titulo="Lista"
          subtitulo="Processos do workspace em tabela virtual"
        />
      }
    >
      <TodosProcessosTabs />

      {/* ── 7 stats cards finos em linha (padrao Pedido) ───────────────── */}
      <div className="tp-stats">
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><Cube weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Total de Processos</span>
          <strong className="tp-stat-valor">{stats.total}</strong>
          <span className="tp-stat-sub">{stats.total} total de itens</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><Hourglass weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Em Andamento</span>
          <strong className="tp-stat-valor">{stats.emAndamento}</strong>
          <span className="tp-stat-sub">Processos em andamento</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><ClockCountdown weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Em Atraso</span>
          <strong className="tp-stat-valor">{stats.emAtraso}</strong>
          <span className="tp-stat-sub">Chegada vencida</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><Warning weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Em Alerta</span>
          <strong className="tp-stat-valor">{stats.emAlerta}</strong>
          <span className="tp-stat-sub">Sem embarque há 30d+</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><CheckCircle weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Concluídos</span>
          <strong className="tp-stat-valor">{stats.concluidos}</strong>
          <span className="tp-stat-sub">Encerrados / entregues</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><CurrencyDollar weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Valor FOB — USD</span>
          <strong className="tp-stat-valor">{fmtMoeda(stats.valorFobUSD, 'USD')}</strong>
          <span className="tp-stat-sub">+ {fmtMoeda(stats.valorFobEUR, 'EUR')} em EUR</span>
        </div>
        <div className="tp-stat-card">
          <span className="tp-stat-icon-inline"><Scales weight="duotone" size={12} /></span>
          <span className="tp-stat-label">Peso Bruto Total</span>
          <strong className="tp-stat-valor">{fmtPeso(stats.pesoBrutoTotal)}</strong>
          <span className="tp-stat-sub">Soma de todos</span>
        </div>
      </div>

      <div style={{ minHeight: 'calc(100vh - 460px)', display: 'flex', flexDirection: 'column' }}>
        <TabelaVirtualGlobal<ProcessoLinha>
          exibirCabecalhoQuandoVazio
          dados={dados}
          colunas={colunas}
          itemId={(p) => p.id}
          itensPorPagina={50}
          abas={abas}
          abaAtiva={abaAtiva}
          onMudarAba={(v) => setAbaAtiva(v as 'todos' | EtapaProcesso)}
          acoes={acoes}
          acoesLote={acoesLote}
          acoesExportacao={acoesExportacao}
          acoesBarra={
            <BotaoGlobal variante="primario" icone={<Plus size={16} />}>
              Novo Processo
            </BotaoGlobal>
          }
          onBuscar={setBusca}
          placeholderBusca="Buscar por número, importador, exportador, responsável…"
          onOrdenar={(campo, dir) => { setSortCampo(campo); setSortDir(dir) }}
          sortCampo={sortCampo}
          sortDir={sortDir}
          carregando={false}
          emptyIcon={<Briefcase weight="duotone" size={48} />}
          emptyTitle="Nenhum processo encontrado"
          emptyDescription="Ajuste a busca ou crie um novo processo"
          ariaLabel="Lista de processos do workspace"
        />
      </div>
    </PaginaGlobal>
  )
}
