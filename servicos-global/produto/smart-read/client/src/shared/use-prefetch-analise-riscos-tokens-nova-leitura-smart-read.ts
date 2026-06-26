/**
 * use-prefetch-analise-riscos-tokens-nova-leitura-smart-read.ts
 * Fallback React — o disparo principal ocorre no polling ao concluir a extração.
 */

import { useEffect, useMemo } from 'react'
import type {
  ResumoUsoLlmLeituraSmartRead,
  UsoLlmChamadaLeituraSmartRead,
} from '../../../shared/uso-llm-leitura-smart-read'
import type { ArquivoLocalNovaLeitura } from './tipo-arquivo-nova-leitura-smart-read'
import {
  dispararAnaliseRiscosBackgroundSmartRead,
  montarChaveAnaliseRiscosSessaoSmartRead,
} from './disparar-analise-riscos-background-smart-read'
import {
  obterCacheAnaliseRiscosSessaoSmartRead,
} from './cache-analise-riscos-sessao-smart-read'

type Params = {
  ativo: boolean
  arquivos: ArquivoLocalNovaLeitura[]
  idLeituraLegado: string | null
  onInicioConsumoIa?: () => void
  onFimConsumoIa?: () => void
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
}

export function usePrefetchAnaliseRiscosTokensNovaLeituraSmartRead({
  ativo,
  arquivos,
  idLeituraLegado,
  onInicioConsumoIa,
  onFimConsumoIa,
  onTokensAtualizados,
}: Params): void {
  const chaveAnalise = useMemo(
    () => montarChaveAnaliseRiscosSessaoSmartRead(idLeituraLegado, arquivos),
    [arquivos, idLeituraLegado],
  )

  useEffect(() => {
    if (!ativo || arquivos.length === 0) return

    const emCache = obterCacheAnaliseRiscosSessaoSmartRead(chaveAnalise)
    if (emCache) {
      onTokensAtualizados?.(emCache.uso_llm_leitura, emCache.uso_llm_chamada)
      return
    }

    dispararAnaliseRiscosBackgroundSmartRead({
      arquivos,
      idLeituraLegado,
      onInicio: onInicioConsumoIa,
      onTokensAtualizados,
      onConcluido: () => onFimConsumoIa?.(),
      onErro: () => onFimConsumoIa?.(),
    })
  }, [
    ativo,
    arquivos,
    chaveAnalise,
    idLeituraLegado,
    onFimConsumoIa,
    onInicioConsumoIa,
    onTokensAtualizados,
  ])
}
