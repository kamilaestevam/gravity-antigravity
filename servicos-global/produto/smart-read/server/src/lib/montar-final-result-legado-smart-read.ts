/**
 * montar-final-result-legado-smart-read.ts
 * Monta finalResult para PATCH DATI a partir da leitura Gravity + metadados legado.
 */

import type { Leitura } from '../schemas/leitura-smart-read.js'
import type { ItemFinalResultLegadoSchema } from '../schemas/exportacao-leitura-smart-read.js'
import type { z } from 'zod'

type ItemFinalResultLegado = z.infer<typeof ItemFinalResultLegadoSchema>

type ItemExtracaoLegado = {
  id?: string | number
  fileType?: string
  data?: Record<string, unknown>
}

function resolverItemLegadoPareado(
  originais: ItemExtracaoLegado[],
  itemFinal: ItemExtracaoLegado,
  indice: number,
): ItemExtracaoLegado | undefined {
  if (indice < originais.length && originais[indice]) return originais[indice]
  const idFinal = itemFinal.id != null ? String(itemFinal.id) : null
  if (idFinal) {
    const porId = originais.find((item) => item.id != null && String(item.id) === idFinal)
    if (porId) return porId
  }
  const tipoFinal = itemFinal.fileType?.trim()
  if (tipoFinal) {
    const porTipo = originais.find((item) => item.fileType?.trim() === tipoFinal)
    if (porTipo) return porTipo
  }
  return undefined
}

export function montarFinalResultArquivoParaLegado(params: {
  itensLegado: ItemExtracaoLegado[]
  arquivoGravity: Leitura['arquivos'][number]
}): ItemFinalResultLegado[] {
  const { itensLegado, arquivoGravity } = params
  const extracaoGravity = arquivoGravity.resultado_extracao ?? []
  if (extracaoGravity.length === 0) {
    return itensLegado.map((item, indice) => ({
      id: item.id ?? indice + 1,
      fileType: item.fileType,
      data: item.data ?? {},
    }))
  }

  const baseLegado = itensLegado.length > 0 ? itensLegado : extracaoGravity.map(() => ({}))

  return extracaoGravity.map((itemGravity, indice) => {
    const itemLegado = baseLegado[indice] ?? resolverItemLegadoPareado(baseLegado, {}, indice)
    const referencia = itemLegado ?? baseLegado[indice]
    return {
      id: referencia?.id ?? indice + 1,
      fileType: itemGravity.tipo_documento ?? referencia?.fileType ?? undefined,
      data: itemGravity.dados,
    }
  })
}

export function arquivoGravityTemConferencia(
  arquivo: Leitura['arquivos'][number],
): boolean {
  return (arquivo.resultado_extracao ?? []).some((item) => item.dados_original != null)
}
