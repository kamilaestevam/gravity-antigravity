/**
 * Reconstrói índice de campos editados e contadores a partir de dados × dados_original persistidos.
 */
import { compararCamposEdicaoLeituraSmartRead } from './comparar-campos-edicao-leitura-smart-read.js'
import { valorCampoExtracaoLegadoPreenchido } from './mesclar-dados-extracao-legado-smart-read.js'

export type DocumentoIndiceCamposEditadosLeituraSmartRead = {
  id_arquivo_local: string
  indice_documento: number
  dados: Record<string, unknown>
  dados_original?: Record<string, unknown>
}

export type LeituraIndiceCamposEditadosSmartRead = {
  arquivos: readonly {
    resultado_extracao?: readonly {
      dados?: Record<string, unknown>
      dados_original?: Record<string, unknown>
    }[] | null
  }[]
}

function montarChaveIndiceCampoEditadoLeituraSmartRead(
  idArquivoLocal: string,
  indiceDocumento: number,
  caminhoCampo: string,
): string {
  return `${idArquivoLocal}:${indiceDocumento}:${caminhoCampo}`
}

export function reconstruirIndiceCamposEditadosLeituraSmartRead(
  documentos: readonly DocumentoIndiceCamposEditadosLeituraSmartRead[],
): Set<string> {
  const indice = new Set<string>()
  for (const documento of documentos) {
    const comparacao = compararCamposEdicaoLeituraSmartRead(
      documento.dados_original,
      documento.dados,
    )
    for (const campo of comparacao.campos) {
      if (!campo.editado) continue
      indice.add(
        montarChaveIndiceCampoEditadoLeituraSmartRead(
          documento.id_arquivo_local,
          documento.indice_documento,
          campo.caminho_campo,
        ),
      )
    }
  }
  return indice
}

export function reconstruirIndiceCamposEditadosDeArquivosLocaisLeituraSmartRead(
  arquivos: readonly {
    id_arquivo_local: string
    leitura?: {
      arquivos: readonly {
        resultado_extracao?: readonly {
          dados?: Record<string, unknown>
          dados_original?: Record<string, unknown>
        }[] | null
      }[]
    } | null
  }[],
): Set<string> {
  const documentos: DocumentoIndiceCamposEditadosLeituraSmartRead[] = []
  for (const arquivo of arquivos) {
    const leitura = arquivo.leitura
    if (!leitura) continue
    for (const arquivoApi of leitura.arquivos) {
      const extracao = arquivoApi.resultado_extracao ?? []
      extracao.forEach((item, indiceDocumento) => {
        if (!item.dados) return
        documentos.push({
          id_arquivo_local: arquivo.id_arquivo_local,
          indice_documento: indiceDocumento,
          dados: item.dados,
          dados_original: item.dados_original,
        })
      })
    }
  }
  return reconstruirIndiceCamposEditadosLeituraSmartRead(documentos)
}

export function contarCamposEditadosLeituraSmartRead(
  leitura: LeituraIndiceCamposEditadosSmartRead | null | undefined,
): number {
  if (!leitura) return 0
  let total = 0
  for (const arquivo of leitura.arquivos) {
    for (const item of arquivo.resultado_extracao ?? []) {
      if (!item.dados) continue
      const comparacao = compararCamposEdicaoLeituraSmartRead(item.dados_original, item.dados)
      total += comparacao.errados
    }
  }
  return total
}

export function contarCamposPreenchidosAlteradosLeituraSmartRead(
  documentos: readonly DocumentoIndiceCamposEditadosLeituraSmartRead[],
): number {
  let total = 0
  for (const documento of documentos) {
    const comparacao = compararCamposEdicaoLeituraSmartRead(
      documento.dados_original,
      documento.dados,
    )
    for (const campo of comparacao.campos) {
      if (!campo.editado) continue
      const bruto = campo.valor_final
      if (bruto == null) continue
      if (!valorCampoExtracaoLegadoPreenchido(bruto)) continue
      total++
    }
  }
  return total
}
