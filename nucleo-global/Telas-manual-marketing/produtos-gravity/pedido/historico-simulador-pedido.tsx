/**
 * Histórico do simulador Pedido — paridade visual com HistoricoOrganizacao (Configurador).
 * Dados mock filtrados ao produto Pedido; sem chamada de API.
 */

import { useMemo } from 'react'
import {
  CalendarBlank,
  ChartPieSlice,
  FileCode,
  FileCsv,
  FilePdf,
  FileText,
  FileXls,
  Code,
  ListBullets,
} from '@phosphor-icons/react'
import { CardBasicoGlobal, CardGraficoGlobal, type PeriodoTendencia } from '@nucleo/card-global'
import { TabelaGlobal, type TabelaGlobalColuna, type TabelaExportAcao } from '@nucleo/tabela-global'
import { caminhoParaLocalString } from '@nucleo/audit-locais'
import {
  exportarCSV,
  exportarExcel,
  exportarJSON,
  exportarPDF,
  exportarTXT,
  exportarXML,
  type ColunasExport,
} from '@nucleo/export-utils'
import {
  LOGS_HISTORICO_SIMULADOR_PEDIDO,
  formatarDataHistoricoSimuladorPedido,
  rotuloAcaoHistoricoSimuladorPedido,
  type HistoricoLogSimuladorPedido,
} from './dados-historico-simulador-pedido'
import './historico-simulador-pedido.css'

const PERIODOS_NEUTROS: PeriodoTendencia[] = [
  { periodo: '7d', rotulo: '7 dias', valor: '—', direcao: 'neutral', descricao: 'vs semana anterior' },
  { periodo: '30d', rotulo: '30 dias', valor: '—', direcao: 'neutral', descricao: 'vs mês anterior' },
  { periodo: '6m', rotulo: '6 meses', valor: '—', direcao: 'neutral', descricao: 'vs semestre anterior' },
  { periodo: '1a', rotulo: '1 ano', valor: '—', direcao: 'neutral', descricao: 'vs ano anterior' },
]

const COLUNAS: TabelaGlobalColuna<HistoricoLogSimuladorPedido>[] = [
  {
    key: 'data_criacao_historico_log',
    label: 'Data/Hora',
    tipo: 'periodo',
    largura: '160px',
    render: (v) => formatarDataHistoricoSimuladorPedido(String(v)),
  },
  {
    key: 'acao_historico_log',
    label: 'Ação',
    tipo: 'texto',
    largura: '160px',
    render: (v) => rotuloAcaoHistoricoSimuladorPedido(v as string),
    renderFiltroLabel: (v) => rotuloAcaoHistoricoSimuladorPedido(v),
  },
  {
    key: 'modulo_historico_log',
    label: 'Local',
    tipo: 'texto',
    largura: '220px',
    render: (_v, item) =>
      caminhoParaLocalString(
        item.metadata_ator_historico_log?.endpoint,
        item.modulo_historico_log,
        item.tipo_recurso_historico_log,
      ),
    getValorBruto: (item) =>
      caminhoParaLocalString(
        item.metadata_ator_historico_log?.endpoint,
        item.modulo_historico_log,
        item.tipo_recurso_historico_log,
      ),
  },
  {
    key: 'nome_ator_historico_log',
    label: 'Usuário',
    tipo: 'texto',
    largura: '220px',
    render: (_v, item) => {
      const nome = item.nome_ator_historico_log ?? item.tipo_ator_historico_log ?? '—'
      const email = item.email_ator_historico_log
      if (!email) return nome
      return (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span>{nome}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', opacity: 0.85 }}>
            {email}
          </span>
        </div>
      )
    },
  },
  {
    key: 'detalhe_acao_historico_log',
    label: 'Detalhes',
    tipo: 'texto',
    render: (v) => (v as string | null) ?? '—',
  },
]

export function HistoricoSimuladorPedido() {
  const logs = LOGS_HISTORICO_SIMULADOR_PEDIDO

  const inicioUltimaSem = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d
  }, [])

  const totalEventos = logs.length
  const eventosSemana = useMemo(
    () => logs.filter((l) => new Date(l.data_criacao_historico_log) >= inicioUltimaSem).length,
    [logs, inicioUltimaSem],
  )
  const eventosSucesso = useMemo(
    () => logs.filter((l) => l.status_historico_log === 'SUCESSO').length,
    [logs],
  )
  const eventosFalha = useMemo(
    () => logs.filter((l) => l.status_historico_log === 'FALHA').length,
    [logs],
  )
  const eventosParcial = useMemo(
    () => logs.filter((l) => l.status_historico_log === 'PARCIAL').length,
    [logs],
  )

  const colunasExport: ColunasExport[] = useMemo(
    () => [
      { header: 'Data/Hora', key: 'data_criacao_historico_log' },
      { header: 'Ação', key: 'acao_historico_log' },
      { header: 'Local', key: 'local' },
      { header: 'Recurso', key: 'tipo_recurso_historico_log' },
      { header: 'ID Recurso', key: 'id_recurso_historico_log' },
      { header: 'Usuário', key: 'nome_ator_historico_log' },
      { header: 'Email', key: 'email_ator_historico_log' },
      { header: 'Detalhes', key: 'detalhe_acao_historico_log' },
      { header: 'Status', key: 'status_historico_log' },
    ],
    [],
  )

  const dadosExport: Record<string, unknown>[] = useMemo(
    () =>
      logs.map((log) => ({
        data_criacao_historico_log: formatarDataHistoricoSimuladorPedido(log.data_criacao_historico_log),
        acao_historico_log: rotuloAcaoHistoricoSimuladorPedido(log.acao_historico_log),
        local: caminhoParaLocalString(
          log.metadata_ator_historico_log?.endpoint,
          log.modulo_historico_log,
          log.tipo_recurso_historico_log,
        ),
        tipo_recurso_historico_log: log.tipo_recurso_historico_log ?? '',
        id_recurso_historico_log: log.id_recurso_historico_log ?? '',
        nome_ator_historico_log: log.nome_ator_historico_log ?? '',
        email_ator_historico_log: log.email_ator_historico_log ?? '',
        detalhe_acao_historico_log: log.detalhe_acao_historico_log ?? '',
        status_historico_log: log.status_historico_log ?? '',
      })),
    [logs],
  )

  const opcoesExport = { nomeArquivo: 'historico-pedido', titulo: 'Histórico — Pedido' }

  const acoesExportacao: TabelaExportAcao<HistoricoLogSimuladorPedido>[] = useMemo(
    () => [
      {
        label: 'Excel (.xlsx)',
        icone: <FileXls size={14} weight="duotone" />,
        onClick: () => void exportarExcel(dadosExport, colunasExport, opcoesExport),
      },
      {
        label: 'CSV',
        icone: <FileCsv size={14} weight="duotone" />,
        onClick: () => void exportarCSV(dadosExport, colunasExport, opcoesExport),
      },
      {
        label: 'TXT',
        icone: <FileText size={14} weight="duotone" />,
        onClick: () => void exportarTXT(dadosExport, colunasExport, opcoesExport),
      },
      {
        label: 'XML',
        icone: <FileCode size={14} weight="duotone" />,
        onClick: () => void exportarXML(dadosExport, colunasExport, opcoesExport),
      },
      {
        label: 'PDF',
        icone: <FilePdf size={14} weight="duotone" />,
        onClick: () => void exportarPDF(dadosExport, colunasExport, opcoesExport),
      },
      {
        label: 'JSON',
        icone: <Code size={14} weight="duotone" />,
        onClick: () => void exportarJSON(dadosExport, colunasExport, opcoesExport),
      },
    ],
    [dadosExport, colunasExport],
  )

  return (
    <div className="pds-historico" data-sds-tutorial-alvo="pedido-historico-conteudo">
      <div className="pds-historico-banner" data-sds-tutorial-alvo="pedido-historico-banner">
        Histórico filtrado pelo produto <strong>Pedido</strong> · últimos 30 dias (simulação).
        {' '}
        Para continuar a demo, use as abas <strong>Lista</strong>, Insights, Dashboard ou Kanban acima. Os botões do topo
        (Hub, busca, etc.) estão desativados nesta demonstração — Configurações fica no menu lateral.
      </div>

      <div className="pds-historico-kpis" data-sds-tutorial-alvo="pedido-historico-kpis">
        <CardBasicoGlobal
          titulo="Total de eventos"
          icone={<ListBullets weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
          valor={totalEventos}
          periodos={PERIODOS_NEUTROS}
          tooltip={
            <>
              <p className="cg-tooltip__title">Visão geral</p>
              <div className="cg-tooltip__row">
                <span>Registros exibidos</span>
                <strong>{totalEventos}</strong>
              </div>
            </>
          }
        />
        <CardBasicoGlobal
          titulo="Últimos 7 dias"
          icone={<CalendarBlank weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={eventosSemana}
          variante="sucesso"
          periodos={PERIODOS_NEUTROS}
          tooltip={
            <>
              <p className="cg-tooltip__title">Atividade recente</p>
              <div className="cg-tooltip__row">
                <span>Eventos nos últimos 7 dias</span>
                <strong style={{ color: '#34d399' }}>{eventosSemana}</strong>
              </div>
            </>
          }
        />
        <CardGraficoGlobal
          titulo="Status dos eventos"
          icone={<ChartPieSlice weight="duotone" size={16} style={{ color: '#818cf8' }} />}
          total={totalEventos}
          valorPrincipal={eventosSucesso}
          corGauge="#34d399"
          legenda={[
            { label: 'Sucesso', valor: eventosSucesso, cor: 'green' },
            { label: 'Falha', valor: eventosFalha, cor: 'red' },
            { label: 'Parcial', valor: eventosParcial, cor: 'yellow' },
          ]}
        />
      </div>

      <div className="pds-historico-tabela" data-sds-tutorial-alvo="pedido-historico-tabela">
        <TabelaGlobal<HistoricoLogSimuladorPedido>
          colunas={COLUNAS}
          dados={logs}
          idKey="id_historico_log"
          id="pds-historico-tabela"
          acoesExportacao={acoesExportacao}
          mensagemSemFiltro="Nenhum registro de histórico encontrado"
          tooltipBusca="Buscar por ação, usuário ou detalhe"
        />
      </div>
    </div>
  )
}
