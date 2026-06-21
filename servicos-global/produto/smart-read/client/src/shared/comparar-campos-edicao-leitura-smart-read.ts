/**
 * comparar-campos-edicao-leitura-smart-read.ts
 * Fonte única de acerto/erro: campo editado pelo usuário = erro; inalterado = acerto.
 * Compara dados_original (IA) × dados (pós-conferência / finalProcessingResult).
 */

const CHAVES_IGNORADAS = new Set(['accuracy', 'averageaccuracy', 'score', 'confidence', 'origem', 'id', '_id'])

export type CampoEdicaoLeitura = {
  caminho_campo: string
  valor_original: string | null
  valor_final: string | null
  editado: boolean
}

export type ResultadoComparacaoCamposLeitura = {
  campos: CampoEdicaoLeitura[]
  total: number
  corretos: number
  errados: number
  taxa_acerto: number | null
}

export function valorTextoComparacaoCampo(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'boolean') return valor ? 'true' : 'false'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') return valor.trim()
  if (Array.isArray(valor)) return valor.map((item) => String(item)).join(', ')
  return JSON.stringify(valor)
}

function deveIgnorarChave(chave: string): boolean {
  return CHAVES_IGNORADAS.has(chave.toLowerCase())
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

export function compararCamposEdicaoLeitura(
  dadosOriginal: Record<string, unknown> | null | undefined,
  dadosFinal: Record<string, unknown> | null | undefined,
): ResultadoComparacaoCamposLeitura {
  const original = dadosOriginal ?? dadosFinal ?? {}
  const final = dadosFinal ?? dadosOriginal ?? {}

  const mapaOriginal = achatarCamposDadosLeitura(original)
  const mapaFinal = achatarCamposDadosLeitura(final)
  const caminhos = new Set([...mapaOriginal.keys(), ...mapaFinal.keys()])

  const campos: CampoEdicaoLeitura[] = []
  let corretos = 0
  let errados = 0

  for (const caminho of caminhos) {
    const valorOriginal = valorTextoComparacaoCampo(mapaOriginal.get(caminho))
    const valorFinal = valorTextoComparacaoCampo(mapaFinal.get(caminho))

    if (valorOriginal === null && valorFinal === null) continue

    const editado = valorOriginal !== valorFinal
    if (editado) errados += 1
    else corretos += 1

    campos.push({
      caminho_campo: caminho,
      valor_original: valorOriginal,
      valor_final: valorFinal,
      editado,
    })
  }

  const total = corretos + errados
  return {
    campos,
    total,
    corretos,
    errados,
    taxa_acerto: total > 0 ? corretos / total : null,
  }
}
