/**
 * Mescla leitura do legado com snapshot/progresso Gravity (conferência).
 */
import type { Leitura } from '../schemas/leitura-smart-read.js'
import {
  leituraSemExtracaoUtilRetomarSmartRead,
  leituraTemExtracaoUtilRetomarSmartRead,
} from '../../../shared/leitura-sem-extracao-retomar-smart-read.js'

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

function statusLeituraTerminal(status: Leitura['status_leitura'] | null | undefined): boolean {
  return status === 'COMPLETED' || status === 'FAILED'
}

/**
 * Status nunca regride no merge: o snapshot é gravado durante a análise
 * (PATCH do passo 2 com motivo 'conferencia_usuario') com PROCESSING
 * congelado — quando o DATI conclui, esse status velho não pode rebaixar o
 * COMPLETED/FAILED fresco do legado, senão o polling do wizard nunca vê a
 * análise terminar (leitura de 8s "durando" minutos até o timeout). Cobre o
 * caminho do snapshot que o guard do placeholder (#808) não alcança: snapshot
 * com nome de leitura e/ou extração parcial.
 */
export function mesclarStatusLeituraSmartRead(
  statusBase: Leitura['status_leitura'],
  statusConferencia: Leitura['status_leitura'] | null | undefined,
): Leitura['status_leitura'] {
  if (!statusConferencia) return statusBase
  if (statusLeituraTerminal(statusBase) && !statusLeituraTerminal(statusConferencia)) {
    return statusBase
  }
  return statusConferencia
}

export function mesclarLeituraComConferenciaGravity(
  base: Leitura,
  conferencia: Leitura | null | undefined,
): Leitura {
  if (!conferencia) return base

  // Placeholder de vínculo (registrarVinculoLeituraUsuarioSmartRead no POST):
  // sem extração e sem nome não há conferência a preservar — mesclar rebaixaria
  // status_leitura COMPLETED do legado para o PROCESSING congelado do placeholder
  // e o polling do passo 2 nunca veria a análise concluir (regressão 16/07).
  if (leituraSemExtracaoUtilRetomarSmartRead(conferencia) && !conferencia.nome_leitura) {
    return base
  }

  if (
    leituraTemExtracaoUtilRetomarSmartRead(conferencia) &&
    (base.arquivos.length === 0 || leituraSemExtracaoUtilRetomarSmartRead(base))
  ) {
    return {
      ...conferencia,
      id_leitura: base.id_leitura || conferencia.id_leitura,
      nome_leitura: conferencia.nome_leitura ?? base.nome_leitura,
      status_leitura: mesclarStatusLeituraSmartRead(base.status_leitura, conferencia.status_leitura),
      // Motivo de falha: o legado (base) é a fonte fresca; snapshot só complementa.
      mensagem_erro: base.mensagem_erro ?? conferencia.mensagem_erro ?? null,
      tempo_processo_total_ms:
        conferencia.tempo_processo_total_ms != null && conferencia.tempo_processo_total_ms > 0
          ? conferencia.tempo_processo_total_ms
          : base.tempo_processo_total_ms ?? null,
      total_arquivos: Math.max(base.total_arquivos, conferencia.total_arquivos, conferencia.arquivos.length),
      arquivos_processados: Math.max(
        base.arquivos_processados,
        conferencia.arquivos_processados,
        conferencia.arquivos.length,
      ),
    }
  }

  const arquivosConferencia = new Map(conferencia.arquivos.map((arquivo) => [arquivo.id_arquivo, arquivo]))

  return {
    ...base,
    nome_leitura: conferencia.nome_leitura ?? base.nome_leitura,
    status_leitura: mesclarStatusLeituraSmartRead(base.status_leitura, conferencia.status_leitura),
    mensagem_erro: base.mensagem_erro ?? conferencia.mensagem_erro ?? null,
    tempo_processo_total_ms:
      conferencia.tempo_processo_total_ms != null && conferencia.tempo_processo_total_ms > 0
        ? conferencia.tempo_processo_total_ms
        : base.tempo_processo_total_ms ?? null,
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
