/**
 * listar-campos-editados-comunicacao-smart-read.ts
 * Campos alterados na conferência para a aba Comunicação com Fornecedor.
 */

import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import { extrairDocumentosArquivoLocal } from './tipo-arquivo-nova-leitura-smart-read'
import { extrairSecoesConferenciaLeitura } from './extrair-secoes-conferencia-leitura-smart-read'
import { montarChaveCampoEditadoLeitura } from './definir-valor-por-caminho-dados-leitura-smart-read'

export type CampoEditadoComunicacaoSmartRead = {
  id: string
  chave: string
  rotulo: string
  valor_original: string | null
  valor_atual: string | null
}

function obterValorPorCaminho(
  raiz: Record<string, unknown> | null | undefined,
  caminho: string,
): unknown {
  if (!raiz || caminho.includes('[')) return undefined
  const partes = caminho.split('.')
  let atual: unknown = raiz
  for (const parte of partes) {
    if (typeof atual !== 'object' || atual === null || Array.isArray(atual)) return undefined
    atual = (atual as Record<string, unknown>)[parte]
  }
  return atual
}

function textoValor(valor: unknown): string | null {
  if (valor == null) return null
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') {
    const t = valor.trim()
    return t.length > 0 ? t : null
  }
  if (Array.isArray(valor)) return valor.map((item) => String(item)).join(', ')
  return JSON.stringify(valor)
}

export function listarCamposEditadosComunicacaoSmartRead(
  arquivo: ArquivoLocalNovaLeitura | null | undefined,
  indiceDocumento: number,
  camposEditados: ReadonlySet<string>,
): CampoEditadoComunicacaoSmartRead[] {
  if (!arquivo?.leitura || camposEditados.size === 0) return []

  const documentos = extrairDocumentosArquivoLocal(arquivo)
  const documento = documentos[indiceDocumento]
  if (!documento) return []

  const arquivoApi =
    arquivo.leitura.arquivos.find((a) => a.id_arquivo === arquivo.id_arquivo) ??
    arquivo.leitura.arquivos[0]
  const extracao = arquivoApi?.resultado_extracao?.[indiceDocumento]
  if (!extracao?.dados) return []

  const secoes = extrairSecoesConferenciaLeitura(extracao.dados)
  const rotuloPorChave = new Map<string, string>()
  for (const secao of secoes) {
    for (const campo of secao.campos) {
      rotuloPorChave.set(campo.chave, campo.rotulo)
    }
  }

  const prefixo = `${arquivo.id_arquivo_local}:${indiceDocumento}:`
  const resultado: CampoEditadoComunicacaoSmartRead[] = []

  for (const chaveCompleta of camposEditados) {
    if (!chaveCompleta.startsWith(prefixo)) continue
    const chave = chaveCompleta.slice(prefixo.length)
    if (!chave) continue

    const valorAtual = textoValor(obterValorPorCaminho(extracao.dados, chave))
    const valorOriginal = textoValor(obterValorPorCaminho(extracao.dados_original, chave))
    const rotulo = rotuloPorChave.get(chave) ?? chave

    resultado.push({
      id: montarChaveCampoEditadoLeitura(arquivo.id_arquivo_local, indiceDocumento, chave),
      chave,
      rotulo,
      valor_original: valorOriginal,
      valor_atual: valorAtual,
    })
  }

  return resultado.sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'))
}

export function formatarLinhaCampoEditadoComunicacao(
  campo: CampoEditadoComunicacaoSmartRead,
): string {
  const de = campo.valor_original?.trim() || '(vazio)'
  const para = campo.valor_atual?.trim() || '(vazio)'
  return `${campo.rotulo} editado de ${de} para ${para}`
}
