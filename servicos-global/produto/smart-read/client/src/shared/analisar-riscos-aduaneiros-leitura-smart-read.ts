/**
 * analisar-riscos-aduaneiros-leitura-smart-read.ts — adapter cliente → shared V1
 */

import {
  executarAuditoriaV1AnaliseRiscosLeitura,
  aplicarCorrecaoSugeridaPadraoRisco,
  type ResumoRiscosAduaneirosLeitura,
  type RiscoAduaneiroLeitura,
  type SeveridadeRiscoAduaneiro,
  type CategoriaRiscoAduaneiro,
  type EvidenciaRiscoAduaneiroLeitura,
  validarCnpjBrasil,
} from '../../../shared/analise-riscos-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import { extrairDadosArquivoLocal, extrairDocumentosArquivoLocal } from './tipo-arquivo-nova-leitura-smart-read'
import type { DocumentoAnaliseRisco } from '../../../shared/analise-riscos-leitura-smart-read'

export type {
  ResumoRiscosAduaneirosLeitura,
  RiscoAduaneiroLeitura,
  SeveridadeRiscoAduaneiro,
  CategoriaRiscoAduaneiro,
  EvidenciaRiscoAduaneiroLeitura,
}

export { validarCnpjBrasil, aplicarCorrecaoSugeridaPadraoRisco }

export function montarDocumentosAnaliseRiscoDeArquivosLocais(
  arquivos: ArquivoLocalNovaLeitura[],
): DocumentoAnaliseRisco[] {
  const saida: DocumentoAnaliseRisco[] = []
  for (const arquivo of arquivos) {
    if (arquivo.status_arquivo_local !== 'completo') continue
    const documentos = extrairDocumentosArquivoLocal(arquivo)
    for (const doc of documentos) {
      const dados = extrairDadosArquivoLocal(arquivo, doc.indice)
      if (!dados) continue
      saida.push({
        nome_arquivo: arquivo.arquivo.name,
        tipo_documento: doc.tipo_documento,
        indice: doc.indice,
        dados,
      })
    }
  }
  return saida
}

export function analisarRiscosAduaneirosLeitura(
  arquivos: ArquivoLocalNovaLeitura[],
): ResumoRiscosAduaneirosLeitura {
  const documentos = montarDocumentosAnaliseRiscoDeArquivosLocais(arquivos)
  if (documentos.length === 0) {
    return { riscos: [], total: 0, criticos: 0, atencao: 0, informativos: 0 }
  }
  return executarAuditoriaV1AnaliseRiscosLeitura(documentos).resumo
}
