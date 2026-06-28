/**
 * executar-download-exportacao-leitura-smart-read.ts
 * Cria tarefa DATI, faz polling e dispara download do ZIP legado via BFF.
 */

import { smartReadApi } from './api'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'

const INTERVALO_POLL_MS = 1500
const TIMEOUT_POLL_MS = 120_000

function aguardar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolverIdsArquivoExportacao(itens: ArquivoLocalNovaLeitura[]): string[] {
  const ids = itens
    .map((item) => item.id_arquivo)
    .filter((id): id is string => Boolean(id))
  return [...new Set(ids)]
}

export async function executarDownloadExportacaoLeituraSmartRead(params: {
  idLeitura: string
  arquivos: ArquivoLocalNovaLeitura[]
  nomeArquivoZip?: string
}): Promise<void> {
  const { idLeitura, arquivos, nomeArquivoZip } = params
  const ids_arquivo = resolverIdsArquivoExportacao(arquivos)
  if (ids_arquivo.length === 0) {
    throw new Error('Nenhum arquivo com referência legado para exportar')
  }

  const { id_tarefa } = await smartReadApi.criarExportacaoLeitura(idLeitura, ids_arquivo)

  const inicio = Date.now()
  while (Date.now() - inicio < TIMEOUT_POLL_MS) {
    const status = await smartReadApi.obterStatusExportacaoLeitura(id_tarefa)
    if (status.status_tarefa === 'failed') {
      throw new Error(status.mensagem_erro ?? 'Falha ao gerar exportação no legado DATI')
    }
    if (status.pronto && status.status_tarefa === 'completed') {
      await smartReadApi.baixarArquivoExportacaoLeitura(id_tarefa, nomeArquivoZip)
      return
    }
    await aguardar(INTERVALO_POLL_MS)
  }

  throw new Error('Tempo esgotado aguardando o pacote de exportação do legado DATI')
}
