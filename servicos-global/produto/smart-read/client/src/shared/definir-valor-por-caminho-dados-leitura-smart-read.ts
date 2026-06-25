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

/** Grava valor em dados[caminho] (ex.: "exporter.name"). Caminhos com array ([]) não são persistidos. */
export function definirValorPorCaminho(
  raiz: Record<string, unknown>,
  caminho: string,
  valor: string,
): boolean {
  if (caminho.includes('[')) return false
  const partes = caminho.split('.')
  let alvo: Record<string, unknown> = raiz
  for (let i = 0; i < partes.length - 1; i++) {
    const parte = partes[i]
    const atual = alvo[parte]
    if (typeof atual !== 'object' || atual === null || Array.isArray(atual)) {
      alvo[parte] = {}
    }
    alvo = alvo[parte] as Record<string, unknown>
  }
  alvo[partes[partes.length - 1]] = valor
  return true
}
