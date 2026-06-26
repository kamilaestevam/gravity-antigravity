/**
 * persistencia-blob-arquivo-leitura-smart-read.ts — cache local do arquivo original por leitura.
 * Permite visualizar após retomar da Lista no mesmo navegador.
 */

import {
  conteudoArquivoLeituraEhVisualizavel,
  resolverMimePorNomeArquivo,
} from '../../../shared/validar-conteudo-arquivo-leitura-smart-read'

const NOME_BANCO = 'smart-read-arquivos-v1'
const NOME_STORE = 'blobs'
const VERSAO = 1

function montarChave(idLeitura: string, idArquivo: string): string {
  return `${idLeitura}:${idArquivo}`
}

function abrirBanco(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME_BANCO, VERSAO)
    const timer = window.setTimeout(() => {
      reject(new Error('Timeout ao abrir cache local de arquivos'))
    }, 5_000)
    pedido.onerror = () => {
      window.clearTimeout(timer)
      reject(pedido.error ?? new Error('IndexedDB indisponível'))
    }
    pedido.onupgradeneeded = () => {
      const banco = pedido.result
      if (!banco.objectStoreNames.contains(NOME_STORE)) {
        banco.createObjectStore(NOME_STORE)
      }
    }
    pedido.onsuccess = () => {
      window.clearTimeout(timer)
      resolve(pedido.result)
    }
  })
}

export async function salvarBlobArquivoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string,
  blob: Blob,
  nomeArquivo = 'documento',
): Promise<void> {
  try {
    const bytes = new Uint8Array(await blob.arrayBuffer())
    if (!conteudoArquivoLeituraEhVisualizavel(bytes, nomeArquivo)) return
    const mime =
      blob.type && blob.type !== 'application/octet-stream'
        ? blob.type
        : resolverMimePorNomeArquivo(nomeArquivo)
    const blobValido = new Blob([bytes], { type: mime })
    const banco = await abrirBanco()
    await new Promise<void>((resolve, reject) => {
      const tx = banco.transaction(NOME_STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('Falha ao gravar blob'))
      tx.objectStore(NOME_STORE).put(blobValido, montarChave(idLeitura, idArquivo))
    })
    banco.close()
  } catch {
    /* cache opcional */
  }
}

export async function carregarBlobArquivoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string,
): Promise<Blob | null> {
  try {
    const banco = await abrirBanco()
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = banco.transaction(NOME_STORE, 'readonly')
      tx.onerror = () => reject(tx.error ?? new Error('Falha ao ler blob'))
      const pedido = tx.objectStore(NOME_STORE).get(montarChave(idLeitura, idArquivo))
      pedido.onsuccess = () => resolve((pedido.result as Blob | undefined) ?? null)
      pedido.onerror = () => reject(pedido.error ?? new Error('Falha ao ler blob'))
    })
    banco.close()
    return blob
  } catch {
    return null
  }
}

export async function removerBlobArquivoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string,
): Promise<void> {
  try {
    const banco = await abrirBanco()
    await new Promise<void>((resolve, reject) => {
      const tx = banco.transaction(NOME_STORE, 'readwrite')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error ?? new Error('Falha ao remover blob'))
      tx.objectStore(NOME_STORE).delete(montarChave(idLeitura, idArquivo))
    })
    banco.close()
  } catch {
    /* cache opcional */
  }
}

export function mensagemPreviewArquivoIndisponivel(nomeArquivo: string): string {
  return `O arquivo ${nomeArquivo} não está disponível neste navegador. Anexe-o novamente no passo 1 ou use os dados extraídos na conferência.`
}

export function mensagemErroPreviewArquivoRemoto(excecao: unknown, nomeArquivo: string): string {
  const bruto =
    excecao instanceof Error ? excecao.message.toLowerCase() : String(excecao ?? '').toLowerCase()
  if (
    bruto.includes('legado_s3') ||
    bruto.includes('storage dati') ||
    bruto.includes('nao autorizado') ||
    bruto.includes('401') ||
    bruto.includes('403')
  ) {
    return mensagemPreviewArquivoIndisponivel(nomeArquivo)
  }
  if (bruto.includes('404') || bruto.includes('nao encontrad')) {
    return `O arquivo ${nomeArquivo} não foi encontrado no servidor.`
  }
  if (bruto.includes('timeout') || bruto.includes('network') || bruto.includes('failed to fetch')) {
    return 'Não foi possível baixar o documento agora. Verifique a conexão e tente novamente.'
  }
  return mensagemPreviewArquivoIndisponivel(nomeArquivo)
}

export async function resolverArquivoOriginalLeituraSmartRead(
  idLeitura: string,
  idArquivo: string | null | undefined,
  nomeArquivo: string,
  arquivoSessao?: File | null,
): Promise<File | null> {
  if (arquivoSessao?.size) return arquivoSessao

  if (idArquivo) {
    const blob = await carregarBlobArquivoLeituraSmartRead(idLeitura, idArquivo)
    if (blob?.size) {
      const bytes = new Uint8Array(await blob.arrayBuffer())
      if (conteudoArquivoLeituraEhVisualizavel(bytes, nomeArquivo)) {
        const mime =
          blob.type && blob.type !== 'application/octet-stream'
            ? blob.type
            : resolverMimePorNomeArquivo(nomeArquivo)
        return new File([bytes], nomeArquivo, { type: mime })
      }
    }
  }

  return null
}
