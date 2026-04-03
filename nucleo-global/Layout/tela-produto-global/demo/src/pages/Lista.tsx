/**
 * Lista.tsx — Demo da TabelaGlobal
 *
 * Demonstra: busca, filtros, ordenação, paginação,
 * ações de linha, exportação e seleção de colunas.
 * Dados 100% mock — sem API.
 */

import React from 'react'
import { TabelaGlobal } from '@nucleo/tabela-global'
import type {
  TabelaGlobalColuna,
  TabelaGlobalAcao,
  TabelaExportAcao,
} from '@nucleo/tabela-global'
import { Eye, PencilSimple, Trash, FileCsv, FileXls, FileText, FileCode, FilePdf, DownloadSimple } from '@phosphor-icons/react'
import {
  exportarExcel, exportarCSV, exportarTXT, exportarXML, exportarJSON, exportarPDF,
  type ColunasExport,
} from '@nucleo/export-utils'

// ── Tipos ─────────────────────────────────────────────────────────────────────

type StatusItem = 'ativo' | 'andamento' | 'concluido' | 'cancelado'

interface ItemDemo {
  id: string
  nome: string
  status: StatusItem
  valor: number
  data: string
  responsavel: string
}

// ── Mock ──────────────────────────────────────────────────────────────────────

const NOMES = [
  'Projeto Alpha', 'Projeto Beta', 'Projeto Gamma', 'Projeto Delta',
  'Projeto Epsilon', 'Projeto Zeta', 'Projeto Eta', 'Projeto Theta',
  'Projeto Iota', 'Projeto Kappa', 'Análise Q1', 'Análise Q2',
  'Revisão Anual', 'Auditoria Interna', 'Planejamento 2026',
  'Relatório Final', 'Proposta Comercial', 'Contrato Fornecedor',
  'Pedido Especial', 'Entrega Urgente',
]

const RESPONSAVEIS = [
  'Ana Silva', 'Bruno Costa', 'Carla Mendes', 'Diego Rocha',
  'Elena Vieira', 'Felipe Santos', 'Gabriela Lima',
]

const STATUSES: StatusItem[] = ['ativo', 'andamento', 'concluido', 'cancelado']

const DADOS_MOCK: ItemDemo[] = Array.from({ length: 48 }, (_, i) => ({
  id: `item-${i + 1}`,
  nome: NOMES[i % NOMES.length] + (i >= NOMES.length ? ` #${Math.floor(i / NOMES.length) + 1}` : ''),
  status: STATUSES[i % 4],
  valor: Math.round((500 + i * 1337.77) * 100) / 100,
  data: new Date(2025, i % 12, (i % 28) + 1).toLocaleDateString('pt-BR'),
  responsavel: RESPONSAVEIS[i % RESPONSAVEIS.length],
}))

// ── Badge de status ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<StatusItem, { label: string; cor: string; bg: string }> = {
  ativo:     { label: 'Ativo',        cor: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  andamento: { label: 'Em Andamento', cor: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  concluido: { label: 'Concluído',    cor: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
  cancelado: { label: 'Cancelado',    cor: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
}

function BadgeStatus({ status }: { status: StatusItem }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      fontSize: '0.75rem', fontWeight: 500,
      color: cfg.cor, background: cfg.bg, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.cor, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

// ── Colunas ───────────────────────────────────────────────────────────────────

const COLUNAS: TabelaGlobalColuna<ItemDemo>[] = [
  { key: 'nome',        label: 'Nome',         tipo: 'texto',  largura: '30%' },
  { key: 'status',      label: 'Status',       tipo: 'texto',  largura: '160px',
    render: (_v: unknown, item: ItemDemo) => <BadgeStatus status={item.status} /> },
  { key: 'valor',       label: 'Valor',        tipo: 'numero', align: 'right', largura: '140px',
    render: (_v: unknown, item: ItemDemo) => (
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>
        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </span>
    ) },
  { key: 'data',        label: 'Data',         tipo: 'periodo', largura: '120px' },
  { key: 'responsavel', label: 'Responsável',  tipo: 'texto',   largura: '180px' },
]

// ── Ações de linha ────────────────────────────────────────────────────────────

const ACOES: TabelaGlobalAcao<ItemDemo>[] = [
  {
    id: 'ver',
    tooltip: 'Ver detalhes',
    icone: <Eye size={16} weight="duotone" />,
    onClick: (item: ItemDemo) => console.log('[Demo] Ver:', item.id),
  },
  {
    id: 'editar',
    tooltip: 'Editar',
    icone: <PencilSimple size={16} weight="duotone" />,
    onClick: (item: ItemDemo) => console.log('[Demo] Editar:', item.id),
  },
  {
    id: 'excluir',
    tooltip: 'Excluir',
    icone: <Trash size={16} weight="duotone" />,
    confirmarExclusao: {
      titulo: 'Excluir item',
      descricao: 'Esta ação não pode ser desfeita.',
      nomeItem: (item: ItemDemo) => item.nome,
    },
    onClick: (item: ItemDemo) => console.log('[Demo] Excluir:', item.id),
  },
]

// ── Exportação ────────────────────────────────────────────────────────────────

const COLUNAS_EXPORT: ColunasExport[] = [
  { header: 'Nome',        key: 'nome'        },
  { header: 'Status',      key: 'status'      },
  { header: 'Valor',       key: 'valor'       },
  { header: 'Data',        key: 'data'        },
  { header: 'Responsável', key: 'responsavel' },
]

const OPCOES_EXPORT = { nomeArquivo: 'lista-demo', titulo: 'Lista — Demo' }

const ACOES_EXPORTACAO: TabelaExportAcao<ItemDemo>[] = [
  { label: 'Excel (.xlsx)', icone: <FileXls        size={14} weight="bold" />, onClick: (d) => void exportarExcel(d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'CSV',           icone: <FileCsv        size={14} weight="bold" />, onClick: (d) =>      exportarCSV  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'TXT',           icone: <FileText       size={14} weight="bold" />, onClick: (d) =>      exportarTXT  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'XML',           icone: <FileCode       size={14} weight="bold" />, onClick: (d) =>      exportarXML  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'PDF',           icone: <FilePdf        size={14} weight="bold" />, onClick: (d) => void exportarPDF  (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
  { label: 'JSON',          icone: <DownloadSimple size={14} weight="bold" />, onClick: (d) =>      exportarJSON (d as any, COLUNAS_EXPORT, OPCOES_EXPORT) },
]

// ── Componente ────────────────────────────────────────────────────────────────

export default function Lista() {
  return (
    <div style={{ padding: '1.5rem', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <TabelaGlobal<ItemDemo>
        id="demo-lista"
        dados={DADOS_MOCK}
        colunas={COLUNAS}
        acoes={ACOES}
        acoesExportacao={ACOES_EXPORTACAO}
        idKey="id"
        itensPorPagina={20}
        mensagemVazio="Nenhum item encontrado."
      />
    </div>
  )
}
