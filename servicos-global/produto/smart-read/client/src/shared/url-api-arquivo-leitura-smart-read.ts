/**
 * url-api-arquivo-leitura-smart-read.ts — URL estável do BFF para visualizar anexo (paridade DATI/S3).
 * Mesma origem + cookies de sessão; evita blob: revogado ou inválido em nova aba.
 */

export function montarUrlApiArquivoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string,
): string {
  return `/api/v1/smart-read/leituras/${encodeURIComponent(idLeitura)}/arquivos/${encodeURIComponent(idArquivo)}`
}

export function urlVisualizacaoEhBlobRevogavel(url: string): boolean {
  return url.startsWith('blob:')
}
