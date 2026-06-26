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
