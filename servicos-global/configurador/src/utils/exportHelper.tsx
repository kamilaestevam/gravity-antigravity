import React from 'react'
import { FileXls, FileCsv, FileText, FileCode, FilePdf } from '@phosphor-icons/react'
import type { TabelaExportAcao, TabelaGlobalColuna } from '@nucleo/tabela-global'
import {
  exportarExcel,
  exportarCSV,
  exportarTXT,
  exportarXML,
  exportarJSON,
  exportarPDF,
  type ColunasExport,
} from '../services/exportService'

export function getAcoesExportacaoPadrao<T extends object>(
  colunas: TabelaGlobalColuna<T>[],
  nomeArquivo: string,
  titulo: string,
): TabelaExportAcao<T>[] {
  const colunasExport: ColunasExport[] = colunas
    .filter(c => !!c.label && c.label.toLowerCase() !== 'ações' && c.label.toLowerCase() !== 'acoes' && c.key !== '')
    .map(c => ({
      header: c.label,
      key: c.key as string,
    }))

  const opcoes = { nomeArquivo, titulo }

  // exportService requer Record<string, unknown> — objetos de dados da tabela
  // satisfazem essa forma em runtime (são interfaces com chaves conhecidas).
  // O cast é necessário porque interfaces específicas não são estruturalmente
  // assinaláveis para Record<string, unknown> no TypeScript, embora sejam no JS.
  const toRecord = (dados: T[]): Record<string, unknown>[] =>
    dados as unknown as Record<string, unknown>[]

  return [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(toRecord(dados), colunasExport, opcoes) },
    { label: 'CSV',           icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(toRecord(dados), colunasExport, opcoes) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(toRecord(dados), colunasExport, opcoes) },
    { label: 'XML',           icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarXML(toRecord(dados), colunasExport, opcoes) },
    { label: 'PDF',           icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(toRecord(dados), colunasExport, opcoes) },
    { label: 'JSON',          icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarJSON(toRecord(dados), colunasExport, opcoes) },
  ]
}
