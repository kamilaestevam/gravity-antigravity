/**
 * compactar-documento-prompt-llm-analise-riscos-smart-read.ts — reduz tokens enviados ao Gemini
 */

import {
  achatarCamposDadosLeitura,
  valorTextoComparacaoCampo,
  type DocumentoAnaliseRisco,
} from './analise-riscos-leitura-smart-read.js'

const LIMITE_TEXTO_CAMPO = 400

function truncar(texto: string, limite = LIMITE_TEXTO_CAMPO): string {
  return texto.length <= limite ? texto : `${texto.slice(0, limite)}…`
}

/** Documento enxuto para prompts LLM — sem metadados de extração nem JSON indentado. */
export function compactarDocumentoParaPromptLlmAnaliseRiscos(
  doc: DocumentoAnaliseRisco,
): Record<string, unknown> {
  const mapa = achatarCamposDadosLeitura(doc.dados)
  const campos: Record<string, string> = {}
  for (const [chave, valor] of mapa) {
    const texto = valorTextoComparacaoCampo(valor)
    if (texto) campos[chave] = truncar(texto)
  }
  return {
    nome_arquivo: doc.nome_arquivo,
    tipo_documento: doc.tipo_documento,
    indice: doc.indice,
    campos,
  }
}

export function serializarPayloadPromptLlm(valor: unknown): string {
  return JSON.stringify(valor)
}
