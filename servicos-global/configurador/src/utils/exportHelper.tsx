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
  type ColunasExport
} from '../services/exportService'

export function getAcoesExportacaoPadrao<T extends Record<string, any>>(
  colunas: TabelaGlobalColuna<T>[],
  nomeArquivo: string,
  titulo: string
): TabelaExportAcao<T>[] {
  const colunasExport: ColunasExport[] = colunas
    .filter(c => !!c.label && c.label.toLowerCase() !== 'ações' && c.label.toLowerCase() !== 'acoes' && c.key !== '')
    .map(c => ({
      header: c.label,
      key: c.key as string,
    }))

  const opcoes = { nomeArquivo, titulo }

  return [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(dados as any, colunasExport, opcoes) },
    { label: 'CSV', icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(dados as any, colunasExport, opcoes) },
    { label: 'TXT', icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(dados as any, colunasExport, opcoes) },
    { label: 'XML', icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarXML(dados as any, colunasExport, opcoes) },
    { label: 'PDF', icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(dados as any, colunasExport, opcoes) },
    { label: 'JSON', icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarJSON(dados as any, colunasExport, opcoes) },
  ]
}
