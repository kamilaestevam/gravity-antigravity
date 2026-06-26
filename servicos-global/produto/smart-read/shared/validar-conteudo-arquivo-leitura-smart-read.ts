/**
 * validar-conteudo-arquivo-leitura-smart-read.ts — magic bytes do arquivo original.
 */

export type TipoConteudoArquivoLeitura = 'pdf' | 'jpeg' | 'png' | 'desconhecido'

export function resolverTipoConteudoPorNomeArquivo(nomeArquivo: string): TipoConteudoArquivoLeitura {
  const nome = nomeArquivo.toLowerCase()
  if (nome.endsWith('.pdf')) return 'pdf'
  if (/\.(jpe?g)$/.test(nome)) return 'jpeg'
  if (nome.endsWith('.png')) return 'png'
  return 'desconhecido'
}

export function resolverMimePorNomeArquivo(nomeArquivo: string): string {
  const tipo = resolverTipoConteudoPorNomeArquivo(nomeArquivo)
  if (tipo === 'pdf') return 'application/pdf'
  if (tipo === 'jpeg') return 'image/jpeg'
  if (tipo === 'png') return 'image/png'
  return 'application/octet-stream'
}

function pareceJson(buffer: Uint8Array): boolean {
  if (buffer.length === 0) return false
  const c = buffer[0]
  return c === 0x7b || c === 0x5b
}

function parecePdf(buffer: Uint8Array): boolean {
  return buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46
}

function pareceJpeg(buffer: Uint8Array): boolean {
  return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
}

function parecePng(buffer: Uint8Array): boolean {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
}

export function detectarTipoConteudoArquivo(buffer: Uint8Array): TipoConteudoArquivoLeitura {
  if (parecePdf(buffer)) return 'pdf'
  if (pareceJpeg(buffer)) return 'jpeg'
  if (parecePng(buffer)) return 'png'
  return 'desconhecido'
}

export function conteudoArquivoLeituraEhVisualizavel(
  buffer: Uint8Array,
  nomeArquivo: string,
): boolean {
  if (buffer.length === 0 || pareceJson(buffer)) return false
  const esperado = resolverTipoConteudoPorNomeArquivo(nomeArquivo)
  const detectado = detectarTipoConteudoArquivo(buffer)
  if (esperado === 'desconhecido') return detectado !== 'desconhecido'
  return detectado === esperado
}

export function mensagemConteudoArquivoInvalido(nomeArquivo: string): string {
  return `Não foi possível exibir ${nomeArquivo}. Tente abrir em nova aba ou reanexar o arquivo.`
}
