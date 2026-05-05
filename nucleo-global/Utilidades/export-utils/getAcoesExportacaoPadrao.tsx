/**
 * getAcoesExportacaoPadrao — helper que monta as 6 ações padrão de exportação
 * (Excel, CSV, TXT, XML, PDF, JSON) para a `TabelaGlobal`, respeitando
 * `getValorBruto` quando definido na coluna.
 *
 * @nucleo/export-utils — promovido do Configurador em 2026-05-05.
 */

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
} from './exportUtils'

export function getAcoesExportacaoPadrao<T extends object>(
  colunas: TabelaGlobalColuna<T>[],
  nomeArquivo: string,
  titulo: string,
): TabelaExportAcao<T>[] {
  const colunasFiltradas = colunas.filter(c =>
    !!c.label
    && c.label.toLowerCase() !== 'ações'
    && c.label.toLowerCase() !== 'acoes'
    && c.key !== '',
  )
  const colunasExport: ColunasExport[] = colunasFiltradas.map(c => ({
    header: c.label,
    key: c.key as string,
  }))

  const opcoes = { nomeArquivo, titulo }

  // Achata cada item respeitando `getValorBruto` quando definido — evita
  // exportar "[object Object]" ou IDs CUID quando a coluna deriva o display
  // de um campo aninhado (ex: produto.nome_produto_gravity).
  const toExport = (dados: T[]): Record<string, unknown>[] =>
    dados.map((item) => {
      const linha: Record<string, unknown> = {}
      for (const c of colunasFiltradas) {
        linha[c.key as string] = c.getValorBruto
          ? c.getValorBruto(item)
          : (item as unknown as Record<string, unknown>)[c.key as string]
      }
      return linha
    })

  return [
    { label: 'Excel (.xlsx)', icone: <FileXls size={14} weight="bold" />, onClick: (dados) => void exportarExcel(toExport(dados), colunasExport, opcoes) },
    { label: 'CSV',           icone: <FileCsv size={14} weight="bold" />, onClick: (dados) => void exportarCSV(toExport(dados), colunasExport, opcoes) },
    { label: 'TXT',           icone: <FileText size={14} weight="bold" />, onClick: (dados) => void exportarTXT(toExport(dados), colunasExport, opcoes) },
    { label: 'XML',           icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarXML(toExport(dados), colunasExport, opcoes) },
    { label: 'PDF',           icone: <FilePdf size={14} weight="bold" />, onClick: (dados) => void exportarPDF(toExport(dados), colunasExport, opcoes) },
    { label: 'JSON',          icone: <FileCode size={14} weight="bold" />, onClick: (dados) => void exportarJSON(toExport(dados), colunasExport, opcoes) },
  ]
}
