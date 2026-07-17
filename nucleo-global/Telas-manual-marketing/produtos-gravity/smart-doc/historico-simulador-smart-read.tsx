/**
 * Histórico do simulador Smart Docs — paridade visual com HistoricoOrganizacao (Configurador).
 * Dados mock filtrados ao produto Smart Docs; sem chamada de API.
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
  LOGS_HISTORICO_SIMULADOR_SMART_READ,
  formatarDataHistoricoSimuladorSmartRead,
  rotuloAcaoHistoricoSimuladorSmartRead,
  type HistoricoLogSimuladorSmartRead,
} from './dados-historico-simulador-smart-read'
import '../pedido/historico-simulador-pedido.css'

const PERIODOS_NEUTROS: PeriodoTendencia[] = [
  { periodo: '7d', rotulo: '7 dias', valor: '—', direcao: 'neutral', descricao: 'vs semana anterior' },
  { periodo: '30d', rotulo: '30 dias', valor: '—', direcao: 'neutral', descricao: 'vs mês anterior' },
  { periodo: '6m', rotulo: '6 meses', valor: '—', direcao: 'neutral', descricao: 'vs semestre anterior' },
  { periodo: '1a', rotulo: '1 ano', valor: '—', direcao: 'neutral', descricao: 'vs ano anterior' },
]

const COLUNAS: TabelaGlobalColuna<HistoricoLogSimuladorSmartRead>[] = [
  {
    key: 'data_criacao_historico_log',
    label: 'Data/Hora',
    tipo: 'periodo',
    largura: '160px',
    render: (v) => formatarDataHistoricoSimuladorSmartRead(String(v)),
  },
  {
    key: 'acao_historico_log',
    label: 'Ação',
    tipo: 'texto',
    largura: '160px',
    render: (v) => rotuloAcaoHistoricoSimuladorSmartRead(v as string),
    renderFiltroLabel: (v) => rotuloAcaoHistoricoSimuladorSmartRead(v),
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

export function HistoricoSimuladorSmartRead() {
  const logs = LOGS_HISTORICO_SIMULADOR_SMART_READ

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
      logs.map((logItem) => ({
        data_criacao_historico_log: formatarDataHistoricoSimuladorSmartRead(logItem.data_criacao_historico_log),
        acao_historico_log: rotuloAcaoHistoricoSimuladorSmartRead(logItem.acao_historico_log),
        local: caminhoParaLocalString(
          logItem.metadata_ator_historico_log?.endpoint,
          logItem.modulo_historico_log,
          logItem.tipo_recurso_historico_log,
        ),
        tipo_recurso_historico_log: logItem.tipo_recurso_historico_log ?? '',
        id_recurso_historico_log: logItem.id_recurso_historico_log ?? '',
        nome_ator_historico_log: logItem.nome_ator_historico_log ?? '',
        email_ator_historico_log: logItem.email_ator_historico_log ?? '',
        detalhe_acao_historico_log: logItem.detalhe_acao_historico_log ?? '',
        status_historico_log: logItem.status_historico_log ?? '',
      })),
    [logs],
  )

  const opcoesExport = { nomeArquivo: 'historico-smart-read', titulo: 'Histórico — Smart Docs' }

  const acoesExportacao: TabelaExportAcao<HistoricoLogSimuladorSmartRead>[] = useMemo(
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
    <div className="pds-historico" data-sds-tutorial-alvo="smart-read-historico-conteudo">
      <div className="pds-historico-banner" data-sds-tutorial-alvo="smart-read-historico-banner">
        Histórico filtrado pelo produto <strong>Smart Docs</strong> · últimos 30 dias (simulação).
      </div>

      <div className="pds-historico-kpis" data-sds-tutorial-alvo="smart-read-historico-kpis">
        <CardBasicoGlobal
          titulo="Total de eventos"
          icone={<ListBullets weight="duotone" size={16} style={{ color: 'var(--ws-accent)' }} />}
          valor={totalEventos}
          periodos={PERIODOS_NEUTROS}
        />
        <CardBasicoGlobal
          titulo="Últimos 7 dias"
          icone={<CalendarBlank weight="duotone" size={16} style={{ color: '#34d399' }} />}
          valor={eventosSemana}
          variante="sucesso"
          periodos={PERIODOS_NEUTROS}
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

      <div className="pds-historico-tabela" data-sds-tutorial-alvo="smart-read-historico-tabela">
        <TabelaGlobal<HistoricoLogSimuladorSmartRead>
          colunas={COLUNAS}
          dados={logs}
          idKey="id_historico_log"
          id="sds-historico-tabela"
          acoesExportacao={acoesExportacao}
          mensagemSemFiltro="Nenhum registro de histórico encontrado"
          tooltipBusca="Buscar por ação, usuário ou detalhe"
        />
      </div>
    </div>
  )
}
