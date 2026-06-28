/**
 * sincronizar-conferencia-legado-smart-read.ts
 * Envia finalResult para o DATI antes do download (com ou sem edição na conferência).
 * O motor GENERATE_READING_DOWNLOAD exige finalProcessingResult — sempre fazemos PATCH.
 */

import { AppError } from './app-error.js'
import type { Leitura } from '../schemas/leitura-smart-read.js'
import type { ItemFinalResultLegadoSchema } from '../schemas/exportacao-leitura-smart-read.js'
import type { z } from 'zod'
import { obterLeituraLegado, atualizarResultadoArquivoLegado } from './cliente-legado-smart-read.js'
import { montarFinalResultArquivoParaLegado } from './montar-final-result-legado-smart-read.js'

type ItemFinalResultLegado = z.infer<typeof ItemFinalResultLegadoSchema>

type ItemExtracaoLegado = {
  id?: string | number
  fileType?: string
  data?: Record<string, unknown>
}

function montarFinalResultFallbackLegado(itensLegado: ItemExtracaoLegado[]): ItemFinalResultLegado[] {
  return itensLegado.map((item, indice) => ({
    id: item.id ?? indice + 1,
    fileType: item.fileType,
    data: item.data ?? {},
  }))
}

export async function sincronizarConferenciaLeituraNoLegado(params: {
  companyId: string
  idLeitura: string
  leitura: Leitura
  idsArquivo: string[]
}): Promise<void> {
  const { companyId, idLeitura, leitura, idsArquivo } = params
  const legado = await obterLeituraLegado(companyId, idLeitura)
  const arquivosPorId = new Map(leitura.arquivos.map((arq) => [arq.id_arquivo, arq]))

  for (const idArquivo of idsArquivo) {
    const arquivoGravity = arquivosPorId.get(idArquivo)
    if (!arquivoGravity) {
      throw new AppError(`Arquivo ${idArquivo} nao pertence a esta leitura`, 400, 'ARQUIVO_INVALIDO')
    }

    const arquivoLegado = legado.files?.find((f) => f.fileReferenceId === idArquivo)
    if (!arquivoLegado) {
      throw new AppError(
        `Arquivo ${idArquivo} nao encontrado no legado DATI`,
        404,
        'ARQUIVO_LEGADO_AUSENTE',
      )
    }

    const itensLegado =
      arquivoLegado.finalProcessingResult ??
      arquivoLegado.processingResult ??
      []

    let finalResult = montarFinalResultArquivoParaLegado({
      itensLegado,
      arquivoGravity,
    })

    if (finalResult.length === 0 && itensLegado.length > 0) {
      finalResult = montarFinalResultFallbackLegado(itensLegado)
    }

    if (finalResult.length === 0) {
      throw new AppError(
        `Arquivo ${idArquivo} sem dados de extracao para exportar no DATI`,
        400,
        'EXPORTACAO_SEM_DADOS',
      )
    }

    await atualizarResultadoArquivoLegado(companyId, idLeitura, idArquivo, finalResult)
  }
}
