/**
 * corrigir-encoding-nome-arquivo-smart-read.ts — reparo de mojibake em nomes de arquivo.
 * Multer/busboy interpretam o filename multipart como Latin-1; bytes UTF-8 viram "cÃ³pia".
 */

const LIMITE_ITERACOES_CORRECAO = 3

/** Padrões típicos de UTF-8 lido como Latin-1 (ex.: Ã³, Ã§, Â°). */
function pareceMojibakeNomeArquivo(nome: string): boolean {
  return /Ã.|Â./.test(nome)
}

function contarIndiciosMojibake(nome: string): number {
  const padroes = nome.match(/Ã.|Â./g)
  return padroes?.length ?? 0
}

/** Reinterpreta cada code unit como byte Latin-1 e decodifica como UTF-8. */
function reinterpretarLatin1ComoUtf8(nome: string): string {
  const bytes = new Uint8Array(nome.length)
  for (let i = 0; i < nome.length; i++) {
    bytes[i] = nome.charCodeAt(i) & 0xff
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes)
}

/**
 * Corrige encoding de nome de arquivo corrompido no upload ou retornado pelo legado.
 * Nomes ASCII e já válidos em UTF-8 permanecem inalterados.
 */
export function corrigirEncodingNomeArquivoSmartRead(nome: string | null | undefined): string | null {
  if (nome == null) return null
  const bruto = nome.trim()
  if (!bruto) return bruto

  if (!pareceMojibakeNomeArquivo(bruto)) return nome

  let melhor = bruto
  let menorIndicio = contarIndiciosMojibake(bruto)

  for (let i = 0; i < LIMITE_ITERACOES_CORRECAO; i++) {
    const tentativa = reinterpretarLatin1ComoUtf8(melhor)
    if (tentativa === melhor || tentativa.includes('\uFFFD')) break

    const indicio = contarIndiciosMojibake(tentativa)
    if (indicio < menorIndicio || (!pareceMojibakeNomeArquivo(tentativa) && pareceMojibakeNomeArquivo(melhor))) {
      melhor = tentativa
      menorIndicio = indicio
    }

    if (!pareceMojibakeNomeArquivo(melhor)) break
  }

  return melhor
}
