/**
 * foco-conferencia-campos-nova-leitura-smart-read — navegação risco → conferência de campos
 */

import type { RiscoAduaneiroLeitura } from './analisar-riscos-aduaneiros-leitura-smart-read'
import type { SecaoConferenciaLeitura } from './extrair-secoes-conferencia-leitura-smart-read'
import {
  extrairDocumentosArquivoLocal,
  type ArquivoLocalNovaLeitura,
} from './tipo-arquivo-nova-leitura-smart-read'

export type FocoConferenciaCamposNovaLeituraSmartRead = {
  campo: string | null
  id_arquivo_local: string | null
  indice_documento: number | null
}

function rotuloDocumentoConferencia(nomeArquivo: string, tipoDocumento: string, indice: number): string {
  return `${nomeArquivo} · ${tipoDocumento.trim() || `Documento ${indice + 1}`}`
}

function normalizarRotuloEvidencia(rotulo: string): string {
  return rotulo
    .trim()
    .replace(/\s*[-–]\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

export function resolverSelecaoDocumentoDeRotuloEvidencia(
  rotuloEvidencia: string,
  arquivos: ArquivoLocalNovaLeitura[],
): { id_arquivo_local: string; indice_documento: number } | null {
  const rotuloNorm = normalizarRotuloEvidencia(rotuloEvidencia)

  for (const arquivo of arquivos) {
    const nome = arquivo.arquivo.name
    const documentos = extrairDocumentosArquivoLocal(arquivo)

    for (const doc of documentos) {
      const rotulo = rotuloDocumentoConferencia(nome, doc.tipo_documento, doc.indice)
      const rotuloDocNorm = normalizarRotuloEvidencia(rotulo)
      if (rotuloNorm === rotuloDocNorm || rotuloNorm.startsWith(normalizarRotuloEvidencia(nome))) {
        const tipoNorm = doc.tipo_documento.trim().toLowerCase()
        if (rotuloNorm.includes(tipoNorm) || rotuloNorm === rotuloDocNorm) {
          return { id_arquivo_local: arquivo.id_arquivo_local, indice_documento: doc.indice }
        }
      }
    }

    if (rotuloNorm.includes(normalizarRotuloEvidencia(nome))) {
      const tipoNoRotulo = documentos.find((doc) =>
        rotuloNorm.includes(doc.tipo_documento.trim().toLowerCase()),
      )
      return {
        id_arquivo_local: arquivo.id_arquivo_local,
        indice_documento: tipoNoRotulo?.indice ?? documentos[0]?.indice ?? 0,
      }
    }
  }

  return null
}

export function montarFocoConferenciaDeRisco(
  risco: Pick<RiscoAduaneiroLeitura, 'evidencias'>,
  arquivos: ArquivoLocalNovaLeitura[],
): FocoConferenciaCamposNovaLeituraSmartRead {
  const evidencia = risco.evidencias.find((ev) => ev.campo) ?? risco.evidencias[0]
  const campo = evidencia?.campo?.trim() ?? null
  const documento = evidencia?.documento?.trim()

  if (!documento) {
    return { campo, id_arquivo_local: null, indice_documento: null }
  }

  const selecao = resolverSelecaoDocumentoDeRotuloEvidencia(documento, arquivos)
  return {
    campo,
    id_arquivo_local: selecao?.id_arquivo_local ?? null,
    indice_documento: selecao?.indice_documento ?? null,
  }
}

export function resolverChaveCampoConferenciaLeitura(
  chaveInformada: string | null | undefined,
  secoes: SecaoConferenciaLeitura[],
): string | null {
  const norm = chaveInformada?.trim()
  if (!norm) return null

  const todas = secoes.flatMap((secao) => secao.campos)
  const exata = todas.find((campo) => campo.chave === norm)
  if (exata) return exata.chave

  const porSufixo = todas.find(
    (campo) => campo.chave.endsWith(`.${norm}`) || campo.chave === norm.replace(/^document\./, ''),
  )
  if (porSufixo) return porSufixo.chave

  const ultimoSegmento = norm.split('.').pop()
  if (ultimoSegmento) {
    const porNome = todas.find((campo) => campo.chave.split('.').pop() === ultimoSegmento)
    if (porNome) return porNome.chave
  }

  return null
}
