import React, { useState, useEffect } from 'react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type { TabelaGlobalColuna, TabelaGlobalAcao, TabelaExportAcao } from '@nucleo/tabela-global'
import {
  Eye, PencilSimple, Trash,
  FileCsv, FileXls, FileText, FileCode, FilePdf, DownloadSimple,
} from '@phosphor-icons/react'
import {
  exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF,
  type ColunasExport,
} from '@nucleo/export-utils'

// ── Mock ──────────────────────────────────────────────────────────────────────

type Status = 'ativo' | 'andamento' | 'concluido' | 'cancelado'

interface Item {
  id: string
  nome: string
  status: Status
  valor: number
  data: string
  responsavel: string
}

const NOMES = [
  'Projeto Alpha', 'Projeto Beta', 'Projeto Gamma', 'Projeto Delta',
  'Projeto Epsilon', 'Projeto Zeta', 'Análise Q1', 'Revisão Anual',
  'Auditoria Interna', 'Planejamento 2026', 'Relatório Final', 'Proposta Comercial',
]
const RESPONSAVEIS = ['Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha', 'Elena Vieira']
const STATUSES: Status[] = ['ativo', 'andamento', 'concluido', 'cancelado']

const DADOS: Item[] = Array.from({ length: 40 }, (_, i) => ({
  id: `item-${i + 1}`,
  nome: NOMES[i % NOMES.length] + (i >= NOMES.length ? ` #${Math.floor(i / NOMES.length) + 1}` : ''),
  status: STATUSES[i % 4],
  valor: Math.round((Math.random() * 50000 + 1000) * 100) / 100,
  data: new Date(2025, i % 12, (i % 28) + 1).toLocaleDateString('pt-BR'),
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
}))

// ── Badge ─────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<Status, { label: string; cor: string; bg: string; borda: string }> = {
  ativo:     { label: 'ATIVO',        cor: '#22c55e', bg: 'rgba(34,197,94,0.12)',    borda: 'rgba(34,197,94,0.2)'    },
  andamento: { label: 'EM ANDAMENTO', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   borda: 'rgba(245,158,11,0.2)'   },
  concluido: { label: 'CONCLUÍDO',    cor: '#818cf8', bg: 'rgba(129,140,248,0.12)',  borda: 'rgba(129,140,248,0.2)'  },
  cancelado: { label: 'CANCELADO',    cor: '#ef4444', bg: 'rgba(239,68,68,0.12)',    borda: 'rgba(239,68,68,0.2)'    },
}

function Badge({ status }: { status: Status }) {
  const c = STATUS_CFG[status]
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.2rem 0.625rem',
      borderRadius: '9999px',
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.04em',
      color: c.cor,
      background: c.bg,
      border: `1px solid ${c.borda}`,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.cor, flexShrink: 0 }} />
      {c.label}
    </span>
  )
}

// ── Colunas ───────────────────────────────────────────────────────────────────

const COLUNAS: TabelaGlobalColuna<Item>[] = [
  { key:'nome',        label:'Nome',         tipo:'texto',   naoOcultavel: true },
  { key:'status',      label:'Status',       tipo:'texto',   render: (_v, item) => <Badge status={item.status} /> },
  { key:'valor',       label:'Valor',        tipo:'numero',  align:'right', render: (_v, item) => <span style={{ fontVariantNumeric:'tabular-nums' }}>{item.valor.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}</span> },
  { key:'data',        label:'Data',         tipo:'periodo' },
  { key:'responsavel', label:'Responsável',  tipo:'texto'   },
]

// ── Ações ─────────────────────────────────────────────────────────────────────

const ACOES: TabelaGlobalAcao<Item>[] = [
  { id:'ver',    tooltip:'Ver',    icone:<Eye size={16} weight="duotone" />,          onClick:(i) => console.log('Ver', i.id) },
  { id:'editar', tooltip:'Editar', icone:<PencilSimple size={16} weight="duotone" />, onClick:(i) => console.log('Editar', i.id) },
  { id:'excluir',tooltip:'Excluir',icone:<Trash size={16} weight="duotone" />,        onClick:(i) => console.log('Excluir', i.id) },
]

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Nome',        key: 'nome'        },
  { header: 'Status',      key: 'status'      },
  { header: 'Valor',       key: 'valor'       },
  { header: 'Data',        key: 'data'        },
  { header: 'Responsável', key: 'responsavel' },
]

const OPCOES_EXPORT = { nomeArquivo: 'tabela-demo', titulo: 'TabelaGlobal Demo' }

const EXPORTACAO: TabelaExportAcao<Item>[] = [
  { label: 'Excel (.xlsx)', icone: <FileXls      size={14} weight="bold" />, onClick: (d) => void exportarExcel(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'CSV',           icone: <FileCsv      size={14} weight="bold" />, onClick: (d) =>      exportarCSV  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'TXT',           icone: <FileText     size={14} weight="bold" />, onClick: (d) =>      exportarTXT  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'XML',           icone: <FileCode     size={14} weight="bold" />, onClick: (d) =>      exportarXML  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'PDF',           icone: <FilePdf      size={14} weight="bold" />, onClick: (d) => void exportarPDF  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'JSON',          icone: <DownloadSimple size={14} weight="bold" />, onClick: (d) =>   exportarJSON (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
]

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<'dark'|'light'>('dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <div className="demo-header">
        <div>
          <h1>TabelaGlobal — Demo</h1>
          <span>nucleo-global/Tabelas/tabela-global</span>
        </div>
        <button className="demo-theme-btn" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ Light' : '☾ Dark'}
        </button>
      </div>

      <div className="demo-content">
        <TabelaGlobal<Item>
          id="demo-tabela"
          dados={DADOS}
          colunas={COLUNAS}
          acoes={ACOES}
          acoesExportacao={EXPORTACAO}
          idKey="id"
          itensPorPagina={20}
          mensagemVazio="Nenhum item encontrado."
        />
      </div>
    </>
  )
}
