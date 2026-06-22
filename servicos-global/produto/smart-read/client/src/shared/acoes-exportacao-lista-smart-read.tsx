/**
 * acoes-exportacao-lista-smart-read.tsx
 * Exportação da lista do Smart Read (6 formatos — paridade Pedido/BID Frete).
 */
import { DownloadSimple, FilePdf } from '@phosphor-icons/react'
import type { GTAcaoExport, GTPreferencias } from '@nucleo/tabela-virtual-global'
import {
  exportarCSV,
  exportarExcel,
  exportarJSON,
  exportarPDF,
  exportarTXT,
  exportarXML,
  type ColunasExport,
} from '@nucleo/export-utils'

export interface MontarAcoesExportacaoListaSmartReadParams<T> {
  colunas: Array<{ key?: string; label: string }>
  preferencias?: GTPreferencias
  colunasPadrao: string[]
  dados: T[]
  formatValorExport: (key: string, row: T) => string
  nomeArquivo: string
  titulo: string
}

function resolverColunasExportVisiveis(
  colunas: Array<{ key?: string; label: string }>,
  preferencias: GTPreferencias | undefined,
  colunasPadrao: string[],
): ColunasExport[] {
  return colunas
    .filter((c) => {
      if (!c.key) return false
      const key = String(c.key)
      if (preferencias?.colunas_visiveis?.length) {
        return preferencias.colunas_visiveis.includes(key)
      }
      return colunasPadrao.includes(key)
    })
    .map((c) => ({ header: c.label, key: String(c.key) }))
}

function montarDadosExport<T>(
  dados: T[],
  colunasExport: ColunasExport[],
  formatValorExport: (key: string, row: T) => string,
): Record<string, unknown>[] {
  return dados.map((row) => {
    const linha: Record<string, unknown> = {}
    for (const col of colunasExport) linha[col.key] = formatValorExport(col.key, row)
    return linha
  })
}

export function montarAcoesExportacaoListaSmartRead<T>(
  params: MontarAcoesExportacaoListaSmartReadParams<T>,
): GTAcaoExport[] {
  const { colunas, preferencias, colunasPadrao, dados, formatValorExport, nomeArquivo, titulo } = params

  const build = () => {
    const colunasExport = resolverColunasExportVisiveis(colunas, preferencias, colunasPadrao)
    const linhas = montarDadosExport(dados, colunasExport, formatValorExport)
    return { colunasExport, linhas }
  }

  const opcoes = { nomeArquivo, titulo }

  return [
    {
      label: 'Excel (.xlsx)',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        void exportarExcel(linhas, colunasExport, opcoes)
      },
    },
    {
      label: 'CSV',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        exportarCSV(linhas, colunasExport, opcoes)
      },
    },
    {
      label: 'TXT',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        exportarTXT(linhas, colunasExport, opcoes)
      },
    },
    {
      label: 'XML',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        exportarXML(linhas, colunasExport, opcoes)
      },
    },
    {
      label: 'JSON',
      icone: <DownloadSimple size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        exportarJSON(linhas, colunasExport, opcoes)
      },
    },
    {
      label: 'PDF',
      icone: <FilePdf size={15} weight="duotone" />,
      onClick: () => {
        const { colunasExport, linhas } = build()
        void exportarPDF(linhas, colunasExport, opcoes)
      },
    },
  ]
}
