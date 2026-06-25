/** Tipos MIME/ extensões aceitos no upload Smart Read */

export const EXTENSOES_ARQUIVO_LEITURA_SMART_READ = [
  'pdf',
  'jpg',
  'jpeg',
  'png',
  'xml',
  'csv',
  'xls',
  'xlsx',
] as const

export type ExtensaoArquivoLeituraSmartRead = (typeof EXTENSOES_ARQUIVO_LEITURA_SMART_READ)[number]

export const ACCEPT_ARQUIVO_LEITURA_SMART_READ = EXTENSOES_ARQUIVO_LEITURA_SMART_READ.map(
  (extensao) => `.${extensao}`,
).join(',')

export const LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB = 50

export type TooltipFormatoArquivoLeituraSmartRead = {
  titulo: string
  descricao: string
}

export const TOOLTIP_FORMATO_ARQUIVO_LEITURA_SMART_READ: Record<
  ExtensaoArquivoLeituraSmartRead,
  TooltipFormatoArquivoLeituraSmartRead
> = {
  pdf: {
    titulo: 'PDF',
    descricao: 'Faturas, BL, invoices e packing lists digitalizados',
  },
  jpg: {
    titulo: 'JPG',
    descricao: 'Foto ou scan de documento de importação ou exportação',
  },
  jpeg: {
    titulo: 'JPEG',
    descricao: 'Foto ou scan de documento de importação ou exportação',
  },
  png: {
    titulo: 'PNG',
    descricao: 'Imagem nítida de documentos escaneados ou capturas de tela',
  },
  xml: {
    titulo: 'XML',
    descricao: 'NF-e, DI ou outros arquivos fiscais em formato estruturado',
  },
  csv: {
    titulo: 'CSV',
    descricao: 'Dados tabulares exportados de ERP ou planilhas parceiras',
  },
  xls: {
    titulo: 'XLS',
    descricao: 'Planilha com itens, valores ou dados de embarque comerciais',
  },
  xlsx: {
    titulo: 'XLSX',
    descricao: 'Planilha com itens, valores ou dados de embarque comerciais',
  },
}

export const TOOLTIP_LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ: TooltipFormatoArquivoLeituraSmartRead = {
  titulo: 'Limite por arquivo',
  descricao: `Cada envio aceita até ${LIMITE_TAMANHO_ARQUIVO_LEITURA_SMART_READ_MB} MB; vários documentos no mesmo arquivo são separados na leitura`,
}

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
