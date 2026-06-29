/**
 * montar-classificacao-produto-checklist-smart-read.ts — análise NCM por linha no checklist
 */

import type { DocumentoAnaliseRisco, RiscoAduaneiroLeitura } from './analise-riscos-leitura-smart-read.js'
import {
  montarAnaliseTecnicaClassificacaoFiscal,
  montarItensParaClassificacaoFiscal,
  type SituacaoCodigoFiscal,
} from './analise-riscos-leitura-smart-read.js'
import { ehRiscoClassificacaoFiscal } from './texto-analise-riscos-leitura-smart-read.js'

export type VereditoClassificacaoProdutoChecklist =
  | 'conforme'
  | 'atencao'
  | 'falha'
  | 'pendente'
  | 'na'

export type ComparacaoNcmDeclaradoSugerido =
  | 'bate'
  | 'diverge'
  | 'sem_declarado'
  | 'aguardando_sugerido'

export type LinhaClassificacaoProdutoChecklist = {
  indice: number
  descricao: string | null
  ncm_declarado: string | null
  ncm_sugerido: string | null
  hs_lido: string | null
  situacao_ncm: SituacaoCodigoFiscal
  comparacao_ncm: ComparacaoNcmDeclaradoSugerido | null
  rotulo_comparacao_ncm: string | null
  justificativa_tecnica: string | null
  descricao_ncm_oficial: string | null
  veredito: VereditoClassificacaoProdutoChecklist
  rotulo_veredito: string
  risco_id: string | null
}

const ROTULO_VEREDITO: Record<VereditoClassificacaoProdutoChecklist, string> = {
  conforme: 'CONFORME',
  atencao: 'ATENÇÃO',
  falha: 'FALHA',
  pendente: 'PENDENTE',
  na: 'N/A',
}

function extrairIndiceCampoItem(campo: string | undefined): number | null {
  if (!campo) return null
  const match = campo.match(/items\[(\d+)\]/i)
  return match ? Number.parseInt(match[1], 10) : null
}

function riscosDaLinha(
  riscos: RiscoAduaneiroLeitura[],
  documento: string,
  indice: number,
): RiscoAduaneiroLeitura[] {
  return riscos.filter((risco) =>
    risco.evidencias.some((ev) => {
      if (ev.documento !== documento) return false
      const idx = extrairIndiceCampoItem(ev.campo)
      return idx === indice
    }),
  )
}

function extrairCodigoSugeridoDeRisco(risco: RiscoAduaneiroLeitura): string | null {
  const corr = risco.correcao_sugerida ?? ''
  const matchPara = corr.match(/\bpara\s+(\d{6,10})\b/i)
  if (matchPara) return matchPara[1]
  const matchSug = risco.motivo.match(/sugestão\s+(\d{6,10})/i)
  return matchSug?.[1] ?? null
}

function descricaoNcmOficialDeRisco(risco: RiscoAduaneiroLeitura): string | null {
  const cit = risco.citacoes_normativas?.find((c) => c.tipo === 'ncm_oficial')
  return cit?.trecho?.trim() ?? null
}

function normalizarDigitosNcm(valor: string | null | undefined): string | null {
  if (!valor?.trim()) return null
  const digitos = valor.replace(/\D/g, '')
  return digitos.length >= 6 ? digitos : null
}

function compararNcmDeclaradoSugerido(
  ncm_declarado: string | null,
  ncm_sugerido: string | null,
  situacao_ncm: SituacaoCodigoFiscal,
): { comparacao: ComparacaoNcmDeclaradoSugerido | null; rotulo: string | null } {
  if (!ncm_sugerido) {
    return { comparacao: 'aguardando_sugerido', rotulo: 'Aguardando sugestão da IA' }
  }
  const declarado = normalizarDigitosNcm(ncm_declarado)
  if (!declarado || situacao_ncm === 'ausente') {
    return { comparacao: 'sem_declarado', rotulo: 'Sem NCM declarado no documento' }
  }
  const sugerido = normalizarDigitosNcm(ncm_sugerido)
  if (!sugerido) {
    return { comparacao: null, rotulo: null }
  }
  if (declarado === sugerido) {
    return { comparacao: 'bate', rotulo: 'Bate com o NCM declarado' }
  }
  return { comparacao: 'diverge', rotulo: 'Não bate com o NCM declarado' }
}

function resolverVereditoLinha(params: {
  situacao_ncm: SituacaoCodigoFiscal
  descricao: string | null
  ncm_sugerido: string | null
  ncm_lido: string | null
  risco_llm: RiscoAduaneiroLeitura | null
  pipelineConcluido: boolean
  carregando: boolean
}): VereditoClassificacaoProdutoChecklist {
  if (!params.descricao?.trim()) return 'na'

  if (params.carregando && !params.pipelineConcluido) return 'pendente'

  if (params.situacao_ncm === 'ausente') {
    if (params.ncm_sugerido) return 'atencao'
    return params.pipelineConcluido ? 'falha' : 'pendente'
  }

  if (params.situacao_ncm === 'parcial' || params.situacao_ncm === 'formato_invalido') {
    return params.ncm_sugerido ? 'atencao' : 'falha'
  }

  if (params.ncm_sugerido && params.ncm_lido) {
    const lido = params.ncm_lido.replace(/\D/g, '')
    const sug = params.ncm_sugerido.replace(/\D/g, '')
    if (sug && lido && sug !== lido) return 'atencao'
  }

  if (params.risco_llm && params.risco_llm.severidade !== 'informativo') return 'atencao'

  return 'conforme'
}

export function montarClassificacaoProdutoChecklist(params: {
  documentos: DocumentoAnaliseRisco[]
  riscos: RiscoAduaneiroLeitura[]
  rotulo_documento?: string | null
  pipelineConcluido: boolean
  carregando: boolean
}): LinhaClassificacaoProdutoChecklist[] {
  const { documentos, riscos, rotulo_documento, pipelineConcluido, carregando } = params
  const itens = montarItensParaClassificacaoFiscal(documentos).filter((item) =>
    rotulo_documento ? item.documento === rotulo_documento : true,
  )

  return itens.map((item) => {
    const riscosLinha = riscosDaLinha(riscos, item.documento, item.indice)
    const riscoLlm =
      riscosLinha.find((r) => r.origem === 'llm' && ehRiscoClassificacaoFiscal(r.titulo, r.categoria)) ??
      riscosLinha.find((r) => ehRiscoClassificacaoFiscal(r.titulo, r.categoria)) ??
      null

    const ncm_sugerido = riscoLlm ? extrairCodigoSugeridoDeRisco(riscoLlm) : null
    const descricao_ncm_oficial = riscoLlm ? descricaoNcmOficialDeRisco(riscoLlm) : null

    let justificativa_tecnica =
      riscoLlm?.analise?.trim() ??
      riscosLinha.find((r) => r.analise?.trim())?.analise?.trim() ??
      null

    if (!justificativa_tecnica && item.descricao) {
      justificativa_tecnica = montarAnaliseTecnicaClassificacaoFiscal({
        tipo: 'ncm',
        situacao: item.situacao_ncm,
        codigoLido: item.ncm_lido,
        descricao: item.descricao,
      })
    }

    const veredito = resolverVereditoLinha({
      situacao_ncm: item.situacao_ncm,
      descricao: item.descricao,
      ncm_sugerido,
      ncm_lido: item.ncm_lido,
      risco_llm: riscoLlm,
      pipelineConcluido,
      carregando,
    })

    const { comparacao, rotulo } = compararNcmDeclaradoSugerido(
      item.ncm_lido,
      ncm_sugerido,
      item.situacao_ncm,
    )

    return {
      indice: item.indice,
      descricao: item.descricao,
      ncm_declarado: item.ncm_lido,
      hs_lido: item.hs_lido,
      situacao_ncm: item.situacao_ncm,
      ncm_sugerido,
      comparacao_ncm: comparacao,
      rotulo_comparacao_ncm: rotulo,
      justificativa_tecnica,
      descricao_ncm_oficial,
      veredito,
      rotulo_veredito: ROTULO_VEREDITO[veredito],
      risco_id: riscoLlm?.id ?? riscosLinha[0]?.id ?? null,
    }
  })
}

/** S4-02/S4-03 (LLM): descrição do item basta para análise semântica. */
export function regraMatrizTemDescricaoParaClassificacao(
  documentos: DocumentoAnaliseRisco[],
  rotuloFiltro?: string | null,
): boolean {
  return montarItensParaClassificacaoFiscal(documentos)
    .filter((item) => (rotuloFiltro ? item.documento === rotuloFiltro : true))
    .some((item) => Boolean(item.descricao?.trim()))
}
