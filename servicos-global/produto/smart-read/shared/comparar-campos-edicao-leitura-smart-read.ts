/**
 * Fonte única de acerto/erro: compara dados_original (IA) × dados (pós-conferência).
 * Fase 1+2: normalização trivial + equivalências de porto (ITJ ≈ Itajaí).
 */
import { valoresEquivalentesCampoConferenciaLeituraSmartRead } from './equivalencias-campo-conferencia-leitura-smart-read.js'
import { normalizarValorComparacaoCampoLeituraSmartRead } from './normalizar-valor-comparacao-campo-leitura-smart-read.js'

const CHAVES_IGNORADAS = new Set(['accuracy', 'averageaccuracy', 'score', 'confidence', 'origem', 'id', '_id'])

export type ClassificacaoCampoLeituraSmartRead = 'validado' | 'ajuste_forma' | 'correcao_real'

export type CampoEdicaoLeituraSmartRead = {
  caminho_campo: string
  valor_original: string | null
  valor_final: string | null
  editado: boolean
  classificacao: ClassificacaoCampoLeituraSmartRead
}

export type ResultadoComparacaoCamposLeituraSmartRead = {
  campos: CampoEdicaoLeituraSmartRead[]
  total: number
  corretos: number
  errados: number
  ajustes_forma: number
  taxa_acerto: number | null
}

/** @deprecated use CampoEdicaoLeituraSmartRead */
export type CampoEdicaoLeitura = CampoEdicaoLeituraSmartRead

/** @deprecated use ResultadoComparacaoCamposLeituraSmartRead */
export type ResultadoComparacaoCamposLeitura = ResultadoComparacaoCamposLeituraSmartRead

export function valorTextoComparacaoCampoLeituraSmartRead(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'boolean') return valor ? 'true' : 'false'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') return valor.trim()
  if (Array.isArray(valor)) return valor.map((item) => String(item)).join(', ')
  return JSON.stringify(valor)
}

/** @deprecated use valorTextoComparacaoCampoLeituraSmartRead */
export const valorTextoComparacaoCampo = valorTextoComparacaoCampoLeituraSmartRead

function deveIgnorarChave(chave: string): boolean {
  return CHAVES_IGNORADAS.has(chave.toLowerCase())
}

function classificarCampoEdicaoLeituraSmartRead(
  caminho: string,
  valorOriginal: string | null,
  valorFinal: string | null,
): { editado: boolean; classificacao: ClassificacaoCampoLeituraSmartRead } {
  const editado = valorOriginal !== valorFinal
  if (!editado) return { editado: false, classificacao: 'validado' }

  const originalNorm = normalizarValorComparacaoCampoLeituraSmartRead(valorOriginal)
  const finalNorm = normalizarValorComparacaoCampoLeituraSmartRead(valorFinal)
  if (originalNorm != null && originalNorm === finalNorm) {
    return { editado: true, classificacao: 'validado' }
  }

  if (valoresEquivalentesCampoConferenciaLeituraSmartRead(caminho, valorOriginal, valorFinal)) {
    return { editado: true, classificacao: 'ajuste_forma' }
  }
  return { editado: true, classificacao: 'correcao_real' }
}

export function achatarCamposDadosLeitura(
  dados: Record<string, unknown>,
  prefixo = '',
): Map<string, unknown> {
  const saida = new Map<string, unknown>()

  for (const [chave, valor] of Object.entries(dados)) {
    if (deveIgnorarChave(chave)) continue
    const caminho = prefixo ? `${prefixo}.${chave}` : chave

    if (valor !== null && typeof valor === 'object' && !Array.isArray(valor)) {
      for (const [subChave, subValor] of achatarCamposDadosLeitura(valor as Record<string, unknown>, caminho)) {
        saida.set(subChave, subValor)
      }
      continue
    }

    saida.set(caminho, valor)
  }

  return saida
}

export function compararCamposEdicaoLeituraSmartRead(
  dadosOriginal: Record<string, unknown> | null | undefined,
  dadosFinal: Record<string, unknown> | null | undefined,
): ResultadoComparacaoCamposLeituraSmartRead {
  const original = dadosOriginal ?? dadosFinal ?? {}
  const final = dadosFinal ?? dadosOriginal ?? {}

  const mapaOriginal = achatarCamposDadosLeitura(original)
  const mapaFinal = achatarCamposDadosLeitura(final)
  const caminhos = new Set([...mapaOriginal.keys(), ...mapaFinal.keys()])

  const campos: CampoEdicaoLeituraSmartRead[] = []
  let corretos = 0
  let errados = 0
  let ajustesForma = 0

  for (const caminho of caminhos) {
    const valorOriginal = valorTextoComparacaoCampoLeituraSmartRead(mapaOriginal.get(caminho))
    const valorFinal = valorTextoComparacaoCampoLeituraSmartRead(mapaFinal.get(caminho))

    if (valorOriginal === null && valorFinal === null) continue

    const { editado, classificacao } = classificarCampoEdicaoLeituraSmartRead(
      caminho,
      valorOriginal,
      valorFinal,
    )

    if (classificacao === 'correcao_real') errados += 1
    else if (classificacao === 'ajuste_forma') ajustesForma += 1
    else corretos += 1

    campos.push({
      caminho_campo: caminho,
      valor_original: valorOriginal,
      valor_final: valorFinal,
      editado,
      classificacao,
    })
  }

  const total = corretos + ajustesForma + errados
  return {
    campos,
    total,
    corretos: corretos + ajustesForma,
    errados,
    ajustes_forma: ajustesForma,
    taxa_acerto: total > 0 ? (corretos + ajustesForma) / total : null,
  }
}

/** @deprecated use compararCamposEdicaoLeituraSmartRead */
export const compararCamposEdicaoLeitura = compararCamposEdicaoLeituraSmartRead
