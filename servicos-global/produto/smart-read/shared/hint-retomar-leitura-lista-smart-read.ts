/**
 * Metadados da linha da Lista para retomar leitura quando GET legado/progresso vem sem `arquivos`.
 */
export type HintRetomarLeituraListaSmartRead = {
  nome_arquivo?: string | null
  total_arquivos?: number | null
}
