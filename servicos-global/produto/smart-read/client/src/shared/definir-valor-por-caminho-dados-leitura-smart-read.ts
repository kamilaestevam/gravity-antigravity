/**
 * definir-valor-por-caminho-dados-leitura-smart-read.ts — leitura/escrita de dados_extração por caminho e chaves de campo editado.
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

function ehCaminhoLeituraEstruturado(caminho: string): boolean {
  return caminho.includes('.') || /\[\d+\]/.test(caminho)
}

function aplicarValorCampoLegado(alvo: Record<string, unknown>, valor: string): void {
  alvo.value = valor
  if ('text' in alvo) alvo.text = valor
  if ('displayValue' in alvo) alvo.displayValue = valor
  if ('extractedValue' in alvo) alvo.extractedValue = valor
  if ('val' in alvo) alvo.val = valor
  if ('content' in alvo) alvo.content = valor
  if ('display_value' in alvo) alvo.display_value = valor
}

function atualizarCampoLegadoLista(campos: unknown[], caminho: string, valor: string): boolean {
  let achou = false
  for (const bruto of campos) {
    if (!bruto || typeof bruto !== 'object') continue
    const item = bruto as Record<string, unknown>
    const chave = String(item.key ?? item.name ?? item.field ?? '')
    if (chave === caminho) {
      aplicarValorCampoLegado(item, valor)
      achou = true
    }
    const aninhados = item.fields ?? item.campos ?? item.items
    if (Array.isArray(aninhados)) {
      achou = atualizarCampoLegadoLista(aninhados, caminho, valor) || achou
    }
  }
  return achou
}

/** Lê valor em dados[caminho] (ex.: "items[0].weights.gross"). */
export function lerValorPorCaminho(dados: Record<string, unknown>, caminho: string): unknown {
  const partes = caminho.split('.')
  if (partes.length === 0 || partes.some((parte) => !PARTE_CAMINHO.test(parte))) {
    return undefined
  }

  let atual: unknown = dados
  for (const parte of partes) {
    const match = PARTE_CAMINHO.exec(parte)
    if (!match || atual === null || typeof atual !== 'object') return undefined

    const [, chave, indiceStr] = match
    atual = (atual as Record<string, unknown>)[chave]
    if (indiceStr !== undefined) {
      if (!Array.isArray(atual)) return undefined
      atual = atual[Number(indiceStr)]
    }
  }

  return atual
}

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

/** Espelha valor editado nas listas legado `sections`/`fields` (snapshot DATI). */
export function sincronizarValorLegadoPorCaminho(
  dados: Record<string, unknown>,
  caminho: string,
  valor: string,
): void {
  if (!ehCaminhoLeituraEstruturado(caminho)) return

  const listasTopo = [
    dados.fields,
    dados.campos,
    dados.sections,
    dados.groups,
    dados.categories,
    dados.fieldGroups,
  ]

  for (const lista of listasTopo) {
    if (!Array.isArray(lista)) continue
    for (const bruto of lista) {
      if (!bruto || typeof bruto !== 'object') continue
      const entrada = bruto as Record<string, unknown>
      const chave = String(entrada.key ?? entrada.name ?? entrada.field ?? '')
      if (chave === caminho) aplicarValorCampoLegado(entrada, valor)
      const campos = entrada.fields ?? entrada.campos ?? entrada.items
      if (Array.isArray(campos)) atualizarCampoLegadoLista(campos, caminho, valor)
    }
  }
}

export function ehCaminhoLeituraEstruturadoConferencia(caminho: string): boolean {
  return ehCaminhoLeituraEstruturado(caminho)
}
