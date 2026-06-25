/**
 * Helpers para criar File/Blob de teste — Passo 01 Nova Leitura Smart Read
 */
import {
  EXTENSOES_ARQUIVO_LEITURA_SMART_READ,
  type ExtensaoArquivoLeituraSmartRead,
} from '../../../../../../../servicos-global/produto/smart-read/client/src/shared/entrada-arquivo-leitura-smart-read'

const MIME_POR_EXTENSAO: Record<ExtensaoArquivoLeituraSmartRead, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  xml: 'application/xml',
  csv: 'text/csv',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export function criarArquivoFixturePassoUm(extensao: ExtensaoArquivoLeituraSmartRead, bytes = 'conteudo-teste'): File {
  const nome = `documento-teste.${extensao}`
  return new File([bytes], nome, { type: MIME_POR_EXTENSAO[extensao] })
}

export function criarTodosArquivosFixturePassoUm(): File[] {
  return EXTENSOES_ARQUIVO_LEITURA_SMART_READ.map((ext) => criarArquivoFixturePassoUm(ext))
}

export { EXTENSOES_ARQUIVO_LEITURA_SMART_READ, MIME_POR_EXTENSAO }
