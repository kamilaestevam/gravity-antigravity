/**
 * url-api-arquivo-leitura-smart-read.ts — helpers de URL para preview de anexo.
 */

export function urlVisualizacaoEhBlobRevogavel(url: string): boolean {
  return url.startsWith('blob:')
}
