/**
 * disparar-analise-riscos-background-smart-read.ts
 * Dispara análise de riscos uma única vez por chave; reutilizado no polling e no prefetch.
 */

import type { AnaliseRiscosLeituraResponse } from '../../../shared/analise-riscos-leitura-smart-read'
import type {
  ResumoUsoLlmLeituraSmartRead,
  UsoLlmChamadaLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read'
import { montarDocumentosAnaliseRiscoDeArquivosLocais } from './analisar-riscos-aduaneiros-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import { smartReadApi } from './api'
import {
  obterCacheAnaliseRiscosSessaoSmartRead,
  salvarCacheAnaliseRiscosSessaoSmartRead,
} from './cache-analise-riscos-sessao-smart-read'

const requisicoesEmVoo = new Map<string, Promise<AnaliseRiscosLeituraResponse>>()

export function montarChaveAnaliseRiscosSessaoSmartRead(
  idLeituraLegado: string | null,
  arquivos: ArquivoLocalNovaLeitura[],
): string {
  const documentos = montarDocumentosAnaliseRiscoDeArquivosLocais(
    arquivos.filter((a) => a.status_arquivo_local === 'completo'),
  )
  return `${idLeituraLegado ?? ''}|${documentos.map((d) => `${d.nome_arquivo}:${d.indice}:${d.tipo_documento}`).join('|')}`
}

type ParametrosDisparo = {
  arquivos: ArquivoLocalNovaLeitura[]
  idLeituraLegado: string | null
  onInicio?: () => void
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onConcluido?: (resposta: AnaliseRiscosLeituraResponse) => void
  onErro?: (erro: unknown) => void
}

export function dispararAnaliseRiscosBackgroundSmartRead({
  arquivos,
  idLeituraLegado,
  onInicio,
  onTokensAtualizados,
  onConcluido,
  onErro,
}: ParametrosDisparo): void {
  const documentos = montarDocumentosAnaliseRiscoDeArquivosLocais(
    arquivos.filter((a) => a.status_arquivo_local === 'completo'),
  )
  if (documentos.length === 0) return

  const chave = montarChaveAnaliseRiscosSessaoSmartRead(idLeituraLegado, arquivos)

  const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chave)
  if (emCache) {
    onTokensAtualizados?.(emCache.uso_llm_leitura, emCache.uso_llm_chamada)
    onConcluido?.(emCache)
    return
  }

  const emVoo = requisicoesEmVoo.get(chave)
  if (emVoo) {
    onInicio?.()
    void emVoo
      .then((resposta) => {
        onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
        onConcluido?.(resposta)
      })
      .catch(onErro)
    return
  }

  onInicio?.()

  const promessa = smartReadApi
    .analisarRiscosLeitura({
      documentos,
      incluir_llm: true,
      id_leitura_legado: idLeituraLegado ?? undefined,
    })
    .then((resposta) => {
      salvarCacheAnaliseRiscosSessaoSmartRead(chave, resposta)
      onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
      onConcluido?.(resposta)
      return resposta
    })
    .catch((erro) => {
      onErro?.(erro)
      throw erro
    })
    .finally(() => {
      requisicoesEmVoo.delete(chave)
    })

  requisicoesEmVoo.set(chave, promessa)
}

export function obterRequisicaoAnaliseRiscosEmVooSmartRead(
  chave: string,
): Promise<AnaliseRiscosLeituraResponse> | null {
  return requisicoesEmVoo.get(chave) ?? null
}

export function limparRequisicoesAnaliseRiscosEmVooSmartRead(): void {
  requisicoesEmVoo.clear()
}
