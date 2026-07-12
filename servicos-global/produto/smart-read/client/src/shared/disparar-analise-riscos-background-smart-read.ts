/**
 * disparar-analise-riscos-background-smart-read.ts
 * Fase rápida (≤3s: código + Receita + NCM) → fase LLM (≤7s) — teto total ≤10s.
 */

import {
  mesclarRespostaAnaliseRiscosLeitura,
  type AnaliseRiscosLeituraResponse,
} from '../../../shared/analise-riscos-leitura-smart-read'
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
import { persistirCacheAnaliseRiscosProgressoSmartRead } from './persistencia-leitura-smart-read'
import {
  marcarFaseEnriquecimentoAnaliseRiscosSmartRead,
  obterFaseEnriquecimentoAnaliseRiscosSmartRead,
} from './fase-enriquecimento-analise-riscos-smart-read'

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
  onParcial?: (resposta: AnaliseRiscosLeituraResponse) => void
  onTokensAtualizados?: (
    resumo: ResumoUsoLlmLeituraSmartRead | null | undefined,
    chamada?: UsoLlmChamadaLeituraSmartRead | null,
  ) => void
  onConcluido?: (resposta: AnaliseRiscosLeituraResponse) => void
  onErro?: (erro: unknown) => void
}

async function executarAnaliseDuasFasesSmartRead(
  documentos: ReturnType<typeof montarDocumentosAnaliseRiscoDeArquivosLocais>,
  idLeituraLegado: string | null,
  chave: string,
  onParcial?: (resposta: AnaliseRiscosLeituraResponse) => void,
): Promise<AnaliseRiscosLeituraResponse> {
  marcarFaseEnriquecimentoAnaliseRiscosSmartRead(chave, 'api')

  const faseRapida = await smartReadApi.analisarRiscosLeitura({
    documentos,
    incluir_llm: false,
    id_leitura_legado: idLeituraLegado ?? undefined,
  })

  salvarCacheAnaliseRiscosSessaoSmartRead(chave, faseRapida)
  onParcial?.(faseRapida)

  marcarFaseEnriquecimentoAnaliseRiscosSmartRead(chave, 'llm')

  const faseLlm = await smartReadApi.analisarRiscosLeitura({
    documentos,
    incluir_llm: true,
    somente_llm: true,
    contexto_v1_referencia: faseRapida.contexto_v1,
    resumo_base_sem_llm: faseRapida.resumo,
    id_leitura_legado: idLeituraLegado ?? undefined,
  })

  return mesclarRespostaAnaliseRiscosLeitura(faseRapida, faseLlm)
}

async function executarSomenteLlmSmartRead(
  documentos: ReturnType<typeof montarDocumentosAnaliseRiscoDeArquivosLocais>,
  idLeituraLegado: string | null,
  chave: string,
  base: AnaliseRiscosLeituraResponse,
  onParcial?: (resposta: AnaliseRiscosLeituraResponse) => void,
): Promise<AnaliseRiscosLeituraResponse> {
  onParcial?.(base)
  marcarFaseEnriquecimentoAnaliseRiscosSmartRead(chave, 'llm')
  const faseLlm = await smartReadApi.analisarRiscosLeitura({
    documentos,
    incluir_llm: true,
    somente_llm: true,
    contexto_v1_referencia: base.contexto_v1,
    resumo_base_sem_llm: base.resumo,
    id_leitura_legado: idLeituraLegado ?? undefined,
  })
  return mesclarRespostaAnaliseRiscosLeitura(base, faseLlm)
}

export function dispararAnaliseRiscosBackgroundSmartRead({
  arquivos,
  idLeituraLegado,
  onInicio,
  onParcial,
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
  if (emCache?.llm_ativo) {
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

  const promessa = (emCache
    ? executarSomenteLlmSmartRead(documentos, idLeituraLegado, chave, emCache, onParcial)
    : executarAnaliseDuasFasesSmartRead(documentos, idLeituraLegado, chave, onParcial)
  )
    .then((resposta) => {
      salvarCacheAnaliseRiscosSessaoSmartRead(chave, resposta)
      if (idLeituraLegado) {
        void persistirCacheAnaliseRiscosProgressoSmartRead(idLeituraLegado, chave, resposta)
      }
      onTokensAtualizados?.(resposta.uso_llm_leitura, resposta.uso_llm_chamada)
      onConcluido?.(resposta)
      return resposta
    })
    .catch((erro) => {
      onErro?.(erro)
      throw erro
    })
    .finally(() => {
      marcarFaseEnriquecimentoAnaliseRiscosSmartRead(chave, null)
      requisicoesEmVoo.delete(chave)
    })

  requisicoesEmVoo.set(chave, promessa)
}

export function obterRequisicaoAnaliseRiscosEmVooSmartRead(
  chave: string,
): Promise<AnaliseRiscosLeituraResponse> | null {
  return requisicoesEmVoo.get(chave) ?? null
}

export function obterFaseEnriquecimentoAnaliseRiscosEmVooSmartRead(
  chave: string,
): ReturnType<typeof obterFaseEnriquecimentoAnaliseRiscosSmartRead> {
  if (!requisicoesEmVoo.has(chave)) return null
  return obterFaseEnriquecimentoAnaliseRiscosSmartRead(chave)
}

export function limparRequisicoesAnaliseRiscosEmVooSmartRead(): void {
  requisicoesEmVoo.clear()
}
