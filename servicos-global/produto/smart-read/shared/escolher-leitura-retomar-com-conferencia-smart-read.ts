/**
 * Merge ao retomar: prioriza conferência do usuário (dados_original) sobre legado com mesma riqueza.
 */
import { mesclarLeiturasRetomarSmartRead, type LeituraRetomarSmartRead } from './escolher-leitura-efetiva-retomar-smart-read.js'

type ItemExtracaoConferencia = {
  dados?: Record<string, unknown>
  dados_original?: Record<string, unknown>
}

type LeituraConferenciaRetomar = LeituraRetomarSmartRead & {
  tempo_processo_total_ms?: number | null
  arquivos: readonly {
    resultado_extracao?: readonly ItemExtracaoConferencia[] | null
  }[]
}

function itemTemConferenciaUsuario(item: ItemExtracaoConferencia): boolean {
  if (item.dados_original != null) return true
  return false
}

export function leituraTemConferenciaUsuarioSmartRead(
  leitura: LeituraConferenciaRetomar | null | undefined,
): boolean {
  if (!leitura) return false
  return leitura.arquivos.some((arquivo) =>
    arquivo.resultado_extracao?.some((item) => itemTemConferenciaUsuario(item)),
  )
}

function mesclarItemExtracaoConferenciaRetomar(
  itemBase: ItemExtracaoConferencia | undefined,
  itemConferencia: ItemExtracaoConferencia,
): ItemExtracaoConferencia {
  if (itemTemConferenciaUsuario(itemConferencia)) return itemConferencia
  if (!itemBase) return itemConferencia
  return itemBase
}

function mesclarArquivosComConferenciaRetomar<T extends LeituraConferenciaRetomar>(
  base: T,
  conferencia: T,
): T {
  const arquivosConferencia = new Map(
    conferencia.arquivos.map((arquivo, indice) => [indice, arquivo]),
  )

  const arquivosMesclados = base.arquivos.map((arquivoBase, indice) => {
    const arquivoConferencia = arquivosConferencia.get(indice)
    if (!arquivoConferencia?.resultado_extracao?.length) return arquivoBase

    const extracaoBase = arquivoBase.resultado_extracao ?? []
    const extracaoConferencia = arquivoConferencia.resultado_extracao ?? []
    const tamanho = Math.max(extracaoBase.length, extracaoConferencia.length)
    const extracaoMesclada: ItemExtracaoConferencia[] = []

    for (let i = 0; i < tamanho; i += 1) {
      const itemConferencia = extracaoConferencia[i]
      if (!itemConferencia) {
        const itemBase = extracaoBase[i]
        if (itemBase) extracaoMesclada.push(itemBase)
        continue
      }
      extracaoMesclada.push(mesclarItemExtracaoConferenciaRetomar(extracaoBase[i], itemConferencia))
    }

    return {
      ...arquivoBase,
      resultado_extracao: extracaoMesclada.length > 0 ? extracaoMesclada : arquivoBase.resultado_extracao,
    }
  })

  const tempoProcessoTotalMs =
    conferencia.tempo_processo_total_ms != null && conferencia.tempo_processo_total_ms > 0
      ? conferencia.tempo_processo_total_ms
      : base.tempo_processo_total_ms

  return {
    ...base,
    nome_leitura: conferencia.nome_leitura ?? base.nome_leitura,
    tempo_processo_total_ms: tempoProcessoTotalMs ?? null,
    arquivos: arquivosMesclados,
  } as T
}

export function escolherLeituraRetomarComConferenciaSmartRead<T extends LeituraConferenciaRetomar>(
  leituraApi: T | null | undefined,
  leituraSalva: T | null | undefined,
): T | null {
  if (!leituraApi && !leituraSalva) return null
  if (!leituraApi) return leituraSalva ?? null
  if (!leituraSalva) return leituraApi

  const salvaTemConferencia = leituraTemConferenciaUsuarioSmartRead(leituraSalva)
  const apiTemConferencia = leituraTemConferenciaUsuarioSmartRead(leituraApi)

  if (salvaTemConferencia) {
    return mesclarArquivosComConferenciaRetomar(
      mesclarLeiturasRetomarSmartRead(leituraApi, leituraSalva),
      leituraSalva,
    )
  }

  if (apiTemConferencia) {
    const tempoProcessoTotalMs =
      leituraSalva.tempo_processo_total_ms != null && leituraSalva.tempo_processo_total_ms > 0
        ? leituraSalva.tempo_processo_total_ms
        : leituraApi.tempo_processo_total_ms
    return {
      ...leituraApi,
      tempo_processo_total_ms: tempoProcessoTotalMs ?? null,
    } as T
  }

  const mesclada = mesclarLeiturasRetomarSmartRead(leituraApi, leituraSalva)
  const tempoProcessoTotalMs =
    leituraSalva.tempo_processo_total_ms != null && leituraSalva.tempo_processo_total_ms > 0
      ? leituraSalva.tempo_processo_total_ms
      : mesclada.tempo_processo_total_ms

  return {
    ...mesclada,
    tempo_processo_total_ms: tempoProcessoTotalMs ?? null,
  } as T
}
