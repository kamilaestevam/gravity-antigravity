/**
 * definir-valor-por-caminho-dados-leitura-smart-read.ts — mutação de dados_extração por caminho e chaves de campo editado.
 */

export function montarChaveCampoEditadoLeitura(
  idArquivoLocal: string,
  indiceDocumento: number,
  chave: string,
): string {
  return `${idArquivoLocal}:${indiceDocumento}:${chave}`
}

export function isCampoEditadoLeitura(
  camposEditados: ReadonlySet<string>,
  idArquivoLocal: string,
  indiceDocumento: number,
  chave: string,
): boolean {
  return camposEditados.has(montarChaveCampoEditadoLeitura(idArquivoLocal, indiceDocumento, chave))
}

const PARTE_CAMINHO = /^([^[]+)(?:\[(\d+)\])?$/

/** Grava valor em dados[caminho] (ex.: "exporter.name", "items[0].weights.net"). */
export function definirValorPorCaminho(
  raiz: Record<string, unknown>,
  caminho: string,
  valor: string,
): boolean {
  const partes = caminho.split('.')
  if (partes.length === 0 || partes.some((parte) => !PARTE_CAMINHO.test(parte))) {
    return false
  }

  let atual: Record<string, unknown> = raiz

  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i]
    const match = PARTE_CAMINHO.exec(parte)
    if (!match) return false

    const [, chave, indiceStr] = match
    const ultimo = i === partes.length - 1

    if (indiceStr !== undefined) {
      const indice = Number(indiceStr)
      if (!Array.isArray(atual[chave])) atual[chave] = []
      const arr = atual[chave] as unknown[]
      if (ultimo) {
        arr[indice] = valor
        return true
      }
      if (arr[indice] === null || typeof arr[indice] !== 'object' || Array.isArray(arr[indice])) {
        arr[indice] = {}
      }
      atual = arr[indice] as Record<string, unknown>
      continue
    }

    if (ultimo) {
      atual[chave] = valor
      return true
    }

    if (atual[chave] === null || typeof atual[chave] !== 'object' || Array.isArray(atual[chave])) {
      atual[chave] = {}
    }
    atual = atual[chave] as Record<string, unknown>
  }

  return false
}
