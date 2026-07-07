/**
 * executar-download-exportacao-simulador-smart-doc.ts — simula polling + download ZIP na landing
 */

import type { ArquivoDemoSimulador } from './arquivos-demo-simulador-smart-doc'
import {
  dispararDownloadBlobSimulador,
  montarArquivosZipExportacaoSimulador,
  montarNomeZipExportacaoSimulador,
  montarZipExportacaoSimulador,
} from './montar-zip-exportacao-simulador-smart-doc'

export type EtapaDownloadExportacaoSimulador =
  | 'criando_tarefa'
  | 'processando'
  | 'empacotando'
  | 'concluido'

const ETAPAS: { id: EtapaDownloadExportacaoSimulador; rotulo: string; atrasoMs: number }[] = [
  { id: 'criando_tarefa', rotulo: 'Criando tarefa de exportação…', atrasoMs: 650 },
  { id: 'processando', rotulo: 'Processando documentos extraídos…', atrasoMs: 900 },
  { id: 'empacotando', rotulo: 'Empacotando arquivos no ZIP…', atrasoMs: 750 },
]

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function executarDownloadExportacaoSimuladorSmartDoc(params: {
  arquivos: ArquivoDemoSimulador[]
  rotuloLeitura: string
  aoAtualizarEtapa?: (etapa: EtapaDownloadExportacaoSimulador, rotulo: string) => void
}): Promise<{ nomeArquivo: string; quantidadeArquivos: number }> {
  const { arquivos, rotuloLeitura, aoAtualizarEtapa } = params

  if (arquivos.length === 0) {
    throw new Error('Selecione ao menos um arquivo para exportar.')
  }

  const arquivosZip = montarArquivosZipExportacaoSimulador(arquivos)
  const blob = montarZipExportacaoSimulador(arquivosZip)
  const nomeArquivo = montarNomeZipExportacaoSimulador(arquivos, rotuloLeitura)

  // Dispara no mesmo turno do clique — antes de qualquer await o navegador aceita o download.
  dispararDownloadBlobSimulador(blob, nomeArquivo)

  for (const etapa of ETAPAS) {
    aoAtualizarEtapa?.(etapa.id, etapa.rotulo)
    await aguardar(etapa.atrasoMs)
  }

  aoAtualizarEtapa?.('concluido', `Download iniciado: ${nomeArquivo}`)

  return { nomeArquivo, quantidadeArquivos: arquivos.length }
}
