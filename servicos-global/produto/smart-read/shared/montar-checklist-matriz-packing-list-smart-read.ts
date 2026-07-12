/**
 * montar-checklist-matriz-packing-list-smart-read.ts — checklist da matriz PL (P1–P9)
 * com score documental (P9-05) e classificação por gates (P9-06).
 */

import {
  GATES_MATRIZ_PACKING_LIST,
  MATRIZ_VALIDACAO_PACKING_LIST,
  ORDEM_SECOES_MATRIZ_PACKING_LIST,
  ROTULO_CLASSIFICACAO_RISCO_PACKING_LIST,
  classificacaoRiscoPackingList,
  type ClassificacaoRiscoPackingList,
  type RegraMatrizPackingList,
  type SecaoMatrizPackingList,
} from './matriz-validacao-packing-list-smart-read.js'
import type {
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import { achatarCamposDadosLeitura, valorTextoComparacaoCampo } from './analise-riscos-leitura-smart-read.js'
import {
  ROTULO_STATUS_CHECKLIST_INVOICE,
  contarChecklistPorStatus,
  normalizarResultadoChecklist,
  resultadoDeRiscoChecklist,
  statusDeRegrasMotor,
  vereditoDeContagemChecklist,
  type ContagemChecklistStatus,
  type ResumoGeralChecklistInvoices,
  type RotuloStatusChecklistInvoice,
  type StatusChecklistMatrizInvoice,
} from './montar-checklist-matriz-invoice-smart-read.js'

export type StatusChecklistMatrizPackingList = StatusChecklistMatrizInvoice

export type ItemChecklistMatrizPackingList = {
  regra: RegraMatrizPackingList
  status: StatusChecklistMatrizPackingList
  rotulo_status: RotuloStatusChecklistInvoice
  resultado: string
  detalhe: string | null
  risco_id: string | null
  em_analise: boolean
}

export type ParametrosChecklistMatrizPackingList = {
  regras: RegraAuditoriaV1[]
  riscos: RiscoAduaneiroLeitura[]
  pipelineConcluido: boolean
  llmHabilitado: boolean
  carregando: boolean
  analise_servidor_indisponivel?: boolean
  enriquecimento_ia_em_andamento?: boolean
  documentos?: DocumentoAnaliseRisco[]
  rotulo_documento?: string | null
}

/** Score documental (P9-05) + classificação por gates (P9-06). */
export type ScoreChecklistPackingList = {
  /** 0–100 sobre regras ALERTA aplicáveis; 100 quando não há base de cálculo */
  score: number
  /** Quantidade de regras ALERTA aplicáveis (base do score) */
  base_alerta: number
  /** IDs das regras BLOQ com falha (gates disparados) */
  gates_falhos: string[]
  classificacao: ClassificacaoRiscoPackingList
  rotulo_classificacao: string
  /** Ainda há regra pendente — score parcial */
  pendente: boolean
}

function ehTipoPackingList(tipo: string): boolean {
  return tipo.toUpperCase().includes('PACKING')
}

function montarItem(
  regra: RegraMatrizPackingList,
  status: StatusChecklistMatrizPackingList,
  detalhe: string | null,
  risco_id: string | null,
  resultadoOverride?: string,
  emAnalise = false,
): ItemChecklistMatrizPackingList {
  return {
    regra,
    status,
    rotulo_status: ROTULO_STATUS_CHECKLIST_INVOICE[status],
    resultado: resultadoOverride ?? normalizarResultadoChecklist(detalhe, status),
    detalhe,
    risco_id,
    em_analise: emAnalise,
  }
}

function severidadeParaStatus(
  severidade: RiscoAduaneiroLeitura['severidade'],
): StatusChecklistMatrizPackingList {
  if (severidade === 'critico') return 'vermelho'
  if (severidade === 'atencao') return 'amarelo'
  return 'verde'
}

function filtrarRegrasMotorDocumento(
  regras: RegraAuditoriaV1[],
  idRegraMatriz: string,
  rotuloDocumento?: string | null,
): RegraAuditoriaV1[] {
  const prefixo = `${idRegraMatriz}-`
  const candidatas = regras.filter((r) => r.id.startsWith(prefixo))
  if (!rotuloDocumento) return candidatas
  const exata = candidatas.filter((r) => r.id === `${idRegraMatriz}-${rotuloDocumento}`)
  if (exata.length > 0) return exata
  return candidatas.filter((r) => r.id.endsWith(rotuloDocumento))
}

function riscoDaRegraDocumento(
  riscos: RiscoAduaneiroLeitura[],
  idRegraMatriz: string,
  rotuloDocumento?: string | null,
): RiscoAduaneiroLeitura | undefined {
  const candidatos = riscos.filter((r) => r.id_regra_matriz === idRegraMatriz)
  if (!rotuloDocumento) return candidatos[0]
  return candidatos.find((r) => r.evidencias.some((e) => e.documento === rotuloDocumento))
}

const MOTORES_COM_IA = new Set(['llm', 'rag', 'api_llm', 'cross_doc_rag'])
/** Motores que aguardam o POST /analise-riscos — prévia amarela sem spinner na Fase A. */
const MOTORES_ENRIQUECIMENTO_SERVIDOR = new Set([
  ...MOTORES_COM_IA,
  'cross_doc',
  'api',
])

function itemAgregador(
  regra: RegraMatrizPackingList,
  parciais: ItemChecklistMatrizPackingList[],
  pipelineConcluido: boolean,
): ItemChecklistMatrizPackingList {
  const score = calcularScoreChecklistPackingList(parciais, pipelineConcluido)
  if (regra.id === 'P9-05') {
    const status: StatusChecklistMatrizPackingList = score.pendente
      ? 'pendente'
      : score.score >= 95
        ? 'verde'
        : score.score >= 80
          ? 'amarelo'
          : 'vermelho'
    return montarItem(
      regra,
      status,
      `Score sobre ${score.base_alerta} regra(s) ALERTA aplicável(is)`,
      null,
      score.pendente ? 'Calculando…' : `${score.score}/100`,
      score.pendente,
    )
  }
  const status: StatusChecklistMatrizPackingList = score.pendente
    ? 'pendente'
    : score.classificacao === 'baixo_risco'
      ? 'verde'
      : score.classificacao === 'atencao'
        ? 'amarelo'
        : 'vermelho'
  const detalheGates =
    score.gates_falhos.length > 0
      ? `Gate(s) disparado(s): ${score.gates_falhos.join(', ')}`
      : 'Nenhum gate disparado'
  return montarItem(
    regra,
    status,
    detalheGates,
    null,
    score.pendente ? 'Calculando…' : score.rotulo_classificacao,
    score.pendente,
  )
}

export function montarChecklistMatrizPackingList(
  params: ParametrosChecklistMatrizPackingList,
): ItemChecklistMatrizPackingList[] {
  const {
    regras,
    riscos,
    pipelineConcluido,
    llmHabilitado,
    carregando,
    analise_servidor_indisponivel = false,
    enriquecimento_ia_em_andamento = false,
    rotulo_documento,
  } = params

  const regrasAvaliaveis = MATRIZ_VALIDACAO_PACKING_LIST.filter((r) => r.severidade !== null)
  const parciais: ItemChecklistMatrizPackingList[] = regrasAvaliaveis.map((regraMatriz) => {
    const risco = riscoDaRegraDocumento(riscos, regraMatriz.id, rotulo_documento)
    if (risco) {
      const status = risco.status_matriz ?? severidadeParaStatus(risco.severidade)
      return montarItem(regraMatriz, status, risco.motivo, risco.id, resultadoDeRiscoChecklist(risco))
    }

    const regrasMotor = filtrarRegrasMotorDocumento(regras, regraMatriz.id, rotulo_documento)
    if (regrasMotor.length > 0) {
      const status = statusDeRegrasMotor(regrasMotor)
      const detalhe = regrasMotor.map((r) => r.detalhe).join(' · ')
      return montarItem(regraMatriz, status, detalhe, null)
    }

    if (enriquecimento_ia_em_andamento && MOTORES_ENRIQUECIMENTO_SERVIDOR.has(regraMatriz.motor)) {
      const rotuloPrevia =
        regraMatriz.motor === 'cross_doc'
          ? 'Prévia local — cruzamento documental em segundo plano'
          : 'Prévia local — validação IA em segundo plano'
      return montarItem(regraMatriz, 'amarelo', rotuloPrevia, null, 'Prévia local…')
    }

    if (carregando && !enriquecimento_ia_em_andamento) {
      return montarItem(
        regraMatriz,
        'pendente',
        'Análise em execução — aguarde a conclusão',
        null,
        'Analisando…',
        true,
      )
    }
    if (!pipelineConcluido) {
      return montarItem(
        regraMatriz,
        'pendente',
        'Análise da leitura ainda não concluída',
        null,
        '—',
        false,
      )
    }

    if (MOTORES_COM_IA.has(regraMatriz.motor)) {
      if (analise_servidor_indisponivel) {
        return montarItem(
          regraMatriz,
          'amarelo',
          'Aviso — Analista IA indisponível nesta sessão — reprocesse a análise',
          null,
          '—',
        )
      }
      if (!llmHabilitado) {
        return montarItem(
          regraMatriz,
          'pendente',
          'Analista IA desligado — ative a IA para validar esta regra',
          null,
          '—',
        )
      }
      if (regraMatriz.severidade === 'cond') {
        return montarItem(
          regraMatriz,
          'na',
          'N/A — gatilho da regra não identificado neste documento',
          null,
          'Não aplicável',
        )
      }
      return montarItem(
        regraMatriz,
        'verde',
        'IA conferiu sem apontamento nesta regra',
        null,
        'Conforme critério',
      )
    }

    if (regraMatriz.severidade === 'cond') {
      return montarItem(
        regraMatriz,
        'na',
        'N/A — gatilho da regra não presente no documento',
        null,
        'Não aplicável',
      )
    }

    return montarItem(regraMatriz, 'na', 'N/A — sem dado na extração para esta regra', null, 'Não aplicável')
  })

  const agregadores = MATRIZ_VALIDACAO_PACKING_LIST.filter((r) => r.severidade === null).map(
    (regra) => itemAgregador(regra, parciais, pipelineConcluido && !carregando),
  )

  return [...parciais, ...agregadores]
}

/** Score 0–100 (P9-05): base = ALERTA aplicáveis; verde=1, amarelo=0,5, vermelho=0. */
export function calcularScoreChecklistPackingList(
  itens: ItemChecklistMatrizPackingList[],
  pipelineConcluido = true,
): ScoreChecklistPackingList {
  const avaliaveis = itens.filter((i) => i.regra.severidade !== null)
  const pendente = !pipelineConcluido || avaliaveis.some((i) => i.status === 'pendente')

  const baseAlerta = avaliaveis.filter(
    (i) => i.regra.severidade === 'alerta' && i.status !== 'na' && i.status !== 'pendente',
  )
  let pontos = 0
  for (const item of baseAlerta) {
    if (item.status === 'verde') pontos += 1
    else if (item.status === 'amarelo') pontos += 0.5
  }
  const score = baseAlerta.length === 0 ? 100 : Math.round((pontos / baseAlerta.length) * 100)

  const gatesFalhos = avaliaveis
    .filter((i) => GATES_MATRIZ_PACKING_LIST.includes(i.regra.id) && i.status === 'vermelho')
    .map((i) => i.regra.id)

  const classificacao = classificacaoRiscoPackingList(score, gatesFalhos)
  return {
    score,
    base_alerta: baseAlerta.length,
    gates_falhos: gatesFalhos,
    classificacao,
    rotulo_classificacao: ROTULO_CLASSIFICACAO_RISCO_PACKING_LIST[classificacao],
    pendente,
  }
}

export function agruparChecklistPackingListPorSecao(
  itens: ItemChecklistMatrizPackingList[],
): Array<{ secao: SecaoMatrizPackingList; itens: ItemChecklistMatrizPackingList[] }> {
  const mapa = new Map<SecaoMatrizPackingList, ItemChecklistMatrizPackingList[]>()
  for (const item of itens) {
    const lista = mapa.get(item.regra.secao) ?? []
    lista.push(item)
    mapa.set(item.regra.secao, lista)
  }
  return ORDEM_SECOES_MATRIZ_PACKING_LIST.filter((s) => mapa.has(s)).map((secao) => ({
    secao,
    itens: mapa.get(secao) ?? [],
  }))
}

export type PackingListOpcaoChecklist = {
  rotulo: string
  nome_arquivo: string
  tipo_documento: string
  indice: number
  numero_invoice: string | null
}

export function listarPackingListsChecklist(
  documentos: DocumentoAnaliseRisco[],
): PackingListOpcaoChecklist[] {
  return documentos
    .filter((d) => ehTipoPackingList(d.tipo_documento))
    .map((doc) => {
      const mapa = achatarCamposDadosLeitura(doc.dados)
      const referencia =
        valorTextoComparacaoCampo(mapa.get('document.invoiceNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.documentNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.number'))
      return {
        rotulo: `${doc.nome_arquivo} · ${doc.tipo_documento.trim() || `Documento ${doc.indice + 1}`}`,
        nome_arquivo: doc.nome_arquivo,
        tipo_documento: doc.tipo_documento,
        indice: doc.indice,
        numero_invoice: referencia,
      }
    })
}

export type ResumoPackingListChecklist = PackingListOpcaoChecklist & {
  contagem: ContagemChecklistStatus
  percentual_conforme: number
  veredito: RotuloStatusChecklistInvoice
  score: ScoreChecklistPackingList
}

/** Percentual conforme sobre regras avaliadas — N/A fica fora da base (não infla o percentual). */
export function percentualConformeChecklistPackingList(contagem: ContagemChecklistStatus): number {
  const base = contagem.total - contagem.na
  if (base <= 0) return 0
  return Math.round((contagem.verde / base) * 100)
}

export function montarResumoChecklistPackingLists(
  params: ParametrosChecklistMatrizPackingList & { documentos: DocumentoAnaliseRisco[] },
): ResumoPackingListChecklist[] {
  return listarPackingListsChecklist(params.documentos).map((pl) => {
    const itens = montarChecklistMatrizPackingList({ ...params, rotulo_documento: pl.rotulo })
    const contagem = contarChecklistPorStatus(itens)
    return {
      ...pl,
      contagem,
      percentual_conforme: percentualConformeChecklistPackingList(contagem),
      veredito: vereditoDeContagemChecklist(contagem),
      score: calcularScoreChecklistPackingList(itens, params.pipelineConcluido && !params.carregando),
    }
  })
}

/**
 * Agrega os resumos de packing list ao resumo geral de invoices para as visões "Todas"
 * (cards por documento + contagem/percentual global). `por_secao` permanece só invoice.
 */
export function combinarResumoGeralComPackingLists(
  resumoInvoices: ResumoGeralChecklistInvoices,
  resumosPackingList: ResumoPackingListChecklist[],
): ResumoGeralChecklistInvoices {
  if (resumosPackingList.length === 0) return resumoInvoices
  const por_invoice = [
    ...resumoInvoices.por_invoice,
    ...resumosPackingList.map(({ score: _score, ...resto }) => resto),
  ]
  const contagem_global = por_invoice.reduce(
    (acc, doc) => ({
      verde: acc.verde + doc.contagem.verde,
      amarelo: acc.amarelo + doc.contagem.amarelo,
      vermelho: acc.vermelho + doc.contagem.vermelho,
      pendente: acc.pendente + doc.contagem.pendente,
      na: acc.na + doc.contagem.na,
      total: acc.total + doc.contagem.total,
    }),
    { verde: 0, amarelo: 0, vermelho: 0, pendente: 0, na: 0, total: 0 },
  )
  const percentual_global =
    contagem_global.total === 0
      ? 0
      : Math.round(((contagem_global.verde + contagem_global.na) / contagem_global.total) * 100)
  return {
    ...resumoInvoices,
    total_invoices: por_invoice.length,
    por_invoice,
    contagem_global,
    percentual_global,
    veredito_global: vereditoDeContagemChecklist(contagem_global),
  }
}