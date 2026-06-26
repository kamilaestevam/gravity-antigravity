/**
 * Mescla leitura do legado com snapshot/progresso Gravity (conferência).
 */
import type { Leitura } from '../schemas/leitura-smart-read.js'

type ItemExtracao = NonNullable<Leitura['arquivos'][number]['resultado_extracao']>[number]

function dadosDistintos(
  esquerda: Record<string, unknown>,
  direita: Record<string, unknown>,
): boolean {
  return JSON.stringify(esquerda) !== JSON.stringify(direita)
}

function itemTemDadosOriginal(item: ItemExtracao): boolean {
  return item.dados_original != null
}

function mesclarItemExtracaoConferencia(
  itemBase: ItemExtracao | undefined,
  itemConferencia: ItemExtracao,
): ItemExtracao {
  if (itemTemDadosOriginal(itemConferencia)) {
    return itemConferencia
  }

  if (itemBase && dadosDistintos(itemBase.dados, itemConferencia.dados)) {
    return {
      ...itemConferencia,
      tipo_documento: itemConferencia.tipo_documento ?? itemBase.tipo_documento,
      dados_original: itemBase.dados,
      dados: itemConferencia.dados,
    }
  }

  return itemConferencia
}

export function leituraTemConferenciaGravity(leitura: Leitura): boolean {
  return leitura.arquivos.some((arquivo) =>
    arquivo.resultado_extracao?.some((item) => itemTemDadosOriginal(item)),
  )
}

export function mesclarLeituraComConferenciaGravity(
  base: Leitura,
  conferencia: Leitura | null | undefined,
): Leitura {
  if (!conferencia) return base

  const arquivosConferencia = new Map(conferencia.arquivos.map((arquivo) => [arquivo.id_arquivo, arquivo]))

  return {
    ...base,
    nome_leitura: conferencia.nome_leitura ?? base.nome_leitura,
    status_leitura: conferencia.status_leitura ?? base.status_leitura,
    arquivos: base.arquivos.map((arquivoBase) => {
      const arquivoConferencia = arquivosConferencia.get(arquivoBase.id_arquivo)
      if (!arquivoConferencia?.resultado_extracao?.length) {
        return arquivoBase
      }

      const extracaoBase = arquivoBase.resultado_extracao ?? []
      const extracaoConferencia = arquivoConferencia.resultado_extracao ?? []
      const tamanho = Math.max(extracaoBase.length, extracaoConferencia.length)
      const extracaoMesclada: ItemExtracao[] = []

      for (let indice = 0; indice < tamanho; indice += 1) {
        const itemConferencia = extracaoConferencia[indice]
        if (!itemConferencia) {
          const itemBase = extracaoBase[indice]
          if (itemBase) extracaoMesclada.push(itemBase)
          continue
        }
        extracaoMesclada.push(
          mesclarItemExtracaoConferencia(extracaoBase[indice], itemConferencia),
        )
      }

      return {
        ...arquivoBase,
        resultado_extracao: extracaoMesclada.length > 0 ? extracaoMesclada : arquivoBase.resultado_extracao,
      }
    }),
  }
}
