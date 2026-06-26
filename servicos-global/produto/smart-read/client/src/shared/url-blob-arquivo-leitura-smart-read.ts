/**
 * url-blob-arquivo-leitura-smart-read.ts — object URL com MIME correto para preview.
 * window.open tolera blob sem type; <img>/<iframe> exigem MIME alinhado à extensão.
 */

import { resolverMimePorNomeArquivo } from '../../../shared/validar-conteudo-arquivo-leitura-smart-read'

export function criarObjectUrlArquivoLeitura(arquivo: File | Blob, nomeArquivo?: string): string {
  const nome = nomeArquivo ?? (arquivo instanceof File ? arquivo.name : 'documento')
  const mimeInformado = arquivo.type?.trim() ?? ''
  const mime =
    mimeInformado && mimeInformado !== 'application/octet-stream'
      ? mimeInformado
      : resolverMimePorNomeArquivo(nome)

  if (mimeInformado && mimeInformado !== 'application/octet-stream') {
    return URL.createObjectURL(arquivo)
  }

  return URL.createObjectURL(new Blob([arquivo], { type: mime }))
}
