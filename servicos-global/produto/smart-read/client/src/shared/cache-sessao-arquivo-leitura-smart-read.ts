/**
 * cache-sessao-arquivo-leitura-smart-read.ts — File original na memória da aba.
 * Sobrevive ao fechar/reabrir o wizard (Lista → retomar) sem depender do IndexedDB.
 */

const porIdArquivo = new Map<string, File>()
const porNomeLeitura = new Map<string, File>()

function chaveId(idLeitura: string, idArquivo: string): string {
  return `${idLeitura}:${idArquivo}`
}

function chaveNome(idLeitura: string, nomeArquivo: string): string {
  return `${idLeitura}:${nomeArquivo.toLowerCase()}`
}

export function registrarArquivoSessaoLeituraSmartRead(
  idLeitura: string,
  arquivo: File,
  idArquivo?: string | null,
): void {
  if (!idLeitura || !arquivo.size) return
  porNomeLeitura.set(chaveNome(idLeitura, arquivo.name), arquivo)
  if (idArquivo) {
    porIdArquivo.set(chaveId(idLeitura, idArquivo), arquivo)
  }
}

export function obterArquivoSessaoLeituraSmartRead(
  idLeitura: string,
  idArquivo: string | null | undefined,
  nomeArquivo: string,
): File | null {
  if (!idLeitura) return null
  if (idArquivo) {
    const porId = porIdArquivo.get(chaveId(idLeitura, idArquivo))
    if (porId?.size) return porId
  }
  const porNome = porNomeLeitura.get(chaveNome(idLeitura, nomeArquivo))
  return porNome?.size ? porNome : null
}
