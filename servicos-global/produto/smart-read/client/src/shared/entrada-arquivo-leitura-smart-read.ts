/** Tipos MIME/ extensões aceitos no upload Smart Read */
export const ACCEPT_ARQUIVO_LEITURA_SMART_READ =
  '.pdf,.jpg,.jpeg,.png,.xml,.csv,.xls,.xlsx'

export type EstadoNavegacaoNovaLeituraSmartRead = {
  arquivo_inicial_leitura?: File
  arquivos_iniciais_leitura?: File[]
}

export function lerArquivoInicialNovaLeitura(state: unknown): File | null {
  const arquivos = lerArquivosIniciaisNovaLeitura(state)
  return arquivos[0] ?? null
}

export function lerArquivosIniciaisNovaLeitura(state: unknown): File[] {
  if (!state || typeof state !== 'object') return []
  const entrada = state as EstadoNavegacaoNovaLeituraSmartRead
  if (Array.isArray(entrada.arquivos_iniciais_leitura)) {
    return entrada.arquivos_iniciais_leitura.filter((item): item is File => item instanceof File)
  }
  if (entrada.arquivo_inicial_leitura instanceof File) {
    return [entrada.arquivo_inicial_leitura]
  }
  return []
}
