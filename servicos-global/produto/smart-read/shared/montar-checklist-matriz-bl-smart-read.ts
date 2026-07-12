/**
 * montar-checklist-matriz-bl-smart-read.ts — checklist da matriz BL (BL1–BL9)
 * com score documental (BL9-05) e classificação por gates (BL9-06).
 * Mesma estrutura do checklist do AWB/packing list — muda o tipo de documento e as regras.
 */

import {
  GATES_MATRIZ_BL,
  MATRIZ_VALIDACAO_BL,
  ORDEM_SECOES_MATRIZ_BL,
  ROTULO_CLASSIFICACAO_RISCO_BL,
  classificacaoRiscoBl,
  type ClassificacaoRiscoBl,
  type RegraMatrizBl,
  type SecaoMatrizBl,
} from './matriz-validacao-bl-smart-read.js'
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
  complementarRiscosDeAgregadoresChecklist,
  complementarRiscosDeFalhasMatriz,
  type ContagemChecklistStatus,
  type ResumoGeralChecklistInvoices,
  type RotuloStatusChecklistInvoice,
  type StatusChecklistMatrizInvoice,
} from './montar-checklist-matriz-invoice-smart-read.js'
import {
  motorAguardaEnriquecimentoServidor,
  type FaseEnriquecimentoAnaliseRiscos,
} from './rotulo-aguardando-motor-checklist-smart-read.js'

export type StatusChecklistMatrizBl = StatusChecklistMatrizInvoice

export type ItemChecklistMatrizBl = {
  regra: RegraMatrizBl
  status: StatusChecklistMatrizBl
  rotulo_status: RotuloStatusChecklistInvoice
  resultado: string
  detalhe: string | null
  risco_id: string | null
  em_analise: boolean
}

export type ParametrosChecklistMatrizBl = {
  regras: RegraAuditoriaV1[]
  riscos: RiscoAduaneiroLeitura[]
  pipelineConcluido: boolean
  llmHabilitado: boolean
  carregando: boolean
  analise_servidor_indisponivel?: boolean
  enriquecimento_ia_em_andamento?: boolean
  fase_enriquecimento_analise?: FaseEnriquecimentoAnaliseRiscos | null
  documentos?: DocumentoAnaliseRisco[]
  rotulo_documento?: string | null
}

/** Score documental (BL9-05) + classificação por gates (BL9-06). */
export type ScoreChecklistBl = {
  /** 0–100 sobre regras ALERTA aplicáveis; 100 quando não há base de cálculo */
  score: number
  /** Quantidade de regras ALERTA aplicáveis (base do score) */
  base_alerta: number
  /** IDs das regras BLOQ com falha (gates disparados) */
  gates_falhos: string[]
  classificacao: ClassificacaoRiscoBl
  rotulo_classificacao: string
  /** Ainda há regra pendente — score parcial */
  pendente: boolean
}

/** Detecta BL (Bill of Lading) — cobre 'BL', 'MBL', 'HBL', 'Bill of Lading'; não confunde com AWB. */
export function ehTipoBlChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('AWB') || norm.includes('AIR WAYBILL')) return false
  return (
    norm.includes('BILL OF LADING') ||
    norm.includes('SEA WAYBILL') ||
    /(^|[^A-Z])(BL|MBL|HBL|B\/L)([^A-Z]|$)/.test(norm)
  )
}

function montarItem(
  regra: RegraMatrizBl,
  status: StatusChecklistMatrizBl,
  detalhe: string | null,
  risco_id: string | null,
  resultadoOverride?: string,
  emAnalise = false,
): ItemChecklistMatrizBl {
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
): StatusChecklistMatrizBl {
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

function vincularRiscosAItensBl(
  itens: ItemChecklistMatrizBl[],
  riscos: RiscoAduaneiroLeitura[],
  rotuloDocumento?: string | null,
): ItemChecklistMatrizBl[] {
  return itens.map((item) => {
    if (item.risco_id) return item
    const risco = riscoDaRegraDocumento(riscos, item.regra.id, rotuloDocumento)
    return risco ? { ...item, risco_id: risco.id } : item
  })
}

/** Agregadores BL9-05/BL9-06 no resumo da aba Análise de Riscos. */
export function complementarRiscosAgregadoresBlNoResumo(
  params: ParametrosChecklistMatrizBl & { documentos: DocumentoAnaliseRisco[] },
  riscos: RiscoAduaneiroLeitura[],
): RiscoAduaneiroLeitura[] {
  let saida = riscos
  for (const bl of listarBlsChecklist(params.documentos)) {
    const itens = montarChecklistMatrizBl({
      ...params,
      riscos: saida,
      rotulo_documento: bl.rotulo,
    })
    saida = complementarRiscosDeAgregadoresChecklist(itens, bl.rotulo, saida)
  }
  return saida
}

const MOTORES_COM_IA = new Set(['llm', 'rag', 'api_llm', 'cross_doc_rag'])

function itemAguardandoEnriquecimentoMotor(
  regraMatriz: RegraMatrizBl,
  fase: FaseEnriquecimentoAnaliseRiscos | null | undefined,
  enriquecimento: boolean,
): ItemChecklistMatrizBl | null {
  if (!motorAguardaEnriquecimentoServidor(regraMatriz.motor)) return null
  if (!enriquecimento && !fase) return null

  const rotuloPrevia =
    regraMatriz.motor === 'cross_doc'
      ? 'Prévia local — cruzamento documental em segundo plano'
      : regraMatriz.motor === 'api'
        ? 'Prévia local — consulta Receita em segundo plano'
        : 'Prévia local — validação IA em segundo plano'
  return montarItem(regraMatriz, 'amarelo', rotuloPrevia, null, 'Prévia local…', true)
}

function itemAgregador(
  regra: RegraMatrizBl,
  parciais: ItemChecklistMatrizBl[],
  pipelineConcluido: boolean,
): ItemChecklistMatrizBl {
  const score = calcularScoreChecklistBl(parciais, pipelineConcluido)
  if (regra.id === 'BL9-05') {
    const status: StatusChecklistMatrizBl = score.pendente
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
  const status: StatusChecklistMatrizBl = score.pendente
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

export function montarChecklistMatrizBl(
  params: ParametrosChecklistMatrizBl,
): ItemChecklistMatrizBl[] {
  const {
    regras,
    riscos,
    pipelineConcluido,
    llmHabilitado,
    carregando,
    analise_servidor_indisponivel = false,
    enriquecimento_ia_em_andamento = false,
    fase_enriquecimento_analise = null,
    rotulo_documento,
  } = params

  const riscosEfetivos = complementarRiscosDeFalhasMatriz(regras, riscos)

  const regrasAvaliaveis = MATRIZ_VALIDACAO_BL.filter((r) => r.severidade !== null)
  const parciais: ItemChecklistMatrizBl[] = regrasAvaliaveis.map((regraMatriz) => {
    const risco = riscoDaRegraDocumento(riscosEfetivos, regraMatriz.id, rotulo_documento)
    if (risco) {
      const status = risco.status_matriz ?? severidadeParaStatus(risco.severidade)
      return montarItem(regraMatriz, status, risco.motivo, risco.id, resultadoDeRiscoChecklist(risco))
    }

    const regrasMotor = filtrarRegrasMotorDocumento(regras, regraMatriz.id, rotulo_documento)
    if (regrasMotor.length > 0) {
      const status = statusDeRegrasMotor(regrasMotor)
      const detalhe = regrasMotor.map((r) => r.detalhe).join(' · ')
      const riscoMotor = riscoDaRegraDocumento(riscosEfetivos, regraMatriz.id, rotulo_documento)
      return montarItem(regraMatriz, status, detalhe, riscoMotor?.id ?? null)
    }

    const aguardando = itemAguardandoEnriquecimentoMotor(
      regraMatriz,
      fase_enriquecimento_analise,
      enriquecimento_ia_em_andamento,
    )
    if (aguardando) return aguardando

    if (carregando && !enriquecimento_ia_em_andamento && !fase_enriquecimento_analise) {
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

  const agregadores = MATRIZ_VALIDACAO_BL.filter((r) => r.severidade === null).map(
    (regra) => itemAgregador(regra, parciais, pipelineConcluido && !carregando),
  )

  const itensBrutos = [...parciais, ...agregadores]
  const riscosCompletos = complementarRiscosDeAgregadoresChecklist(
    itensBrutos,
    rotulo_documento,
    riscosEfetivos,
  )
  return vincularRiscosAItensBl(itensBrutos, riscosCompletos, rotulo_documento)
}

/** Score 0–100 (BL9-05): base = ALERTA aplicáveis; verde=1, amarelo=0,5, vermelho=0. */
export function calcularScoreChecklistBl(
  itens: ItemChecklistMatrizBl[],
  pipelineConcluido = true,
): ScoreChecklistBl {
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
    .filter((i) => GATES_MATRIZ_BL.includes(i.regra.id) && i.status === 'vermelho')
    .map((i) => i.regra.id)

  const classificacao = classificacaoRiscoBl(score, gatesFalhos)
  return {
    score,
    base_alerta: baseAlerta.length,
    gates_falhos: gatesFalhos,
    classificacao,
    rotulo_classificacao: ROTULO_CLASSIFICACAO_RISCO_BL[classificacao],
    pendente,
  }
}

export function agruparChecklistBlPorSecao(
  itens: ItemChecklistMatrizBl[],
): Array<{ secao: SecaoMatrizBl; itens: ItemChecklistMatrizBl[] }> {
  const mapa = new Map<SecaoMatrizBl, ItemChecklistMatrizBl[]>()
  for (const item of itens) {
    const lista = mapa.get(item.regra.secao) ?? []
    lista.push(item)
    mapa.set(item.regra.secao, lista)
  }
  return ORDEM_SECOES_MATRIZ_BL.filter((s) => mapa.has(s)).map((secao) => ({
    secao,
    itens: mapa.get(secao) ?? [],
  }))
}

export type BlOpcaoChecklist = {
  rotulo: string
  nome_arquivo: string
  tipo_documento: string
  indice: number
  numero_invoice: string | null
}

export function listarBlsChecklist(documentos: DocumentoAnaliseRisco[]): BlOpcaoChecklist[] {
  return documentos
    .filter((d) => ehTipoBlChecklist(d.tipo_documento))
    .map((doc) => {
      const mapa = achatarCamposDadosLeitura(doc.dados)
      const referencia =
        valorTextoComparacaoCampo(mapa.get('document.billOfLadingNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.masterBillOfLadingNumber')) ??
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

export type ResumoBlChecklist = BlOpcaoChecklist & {
  contagem: ContagemChecklistStatus
  percentual_conforme: number
  veredito: RotuloStatusChecklistInvoice
  score: ScoreChecklistBl
}

/** Percentual conforme sobre regras avaliadas — N/A fica fora da base (não infla o percentual). */
export function percentualConformeChecklistBl(contagem: ContagemChecklistStatus): number {
  const base = contagem.total - contagem.na
  if (base <= 0) return 0
  return Math.round((contagem.verde / base) * 100)
}

export function montarResumoChecklistBls(
  params: ParametrosChecklistMatrizBl & { documentos: DocumentoAnaliseRisco[] },
): ResumoBlChecklist[] {
  return listarBlsChecklist(params.documentos).map((bl) => {
    const itens = montarChecklistMatrizBl({ ...params, rotulo_documento: bl.rotulo })
    const contagem = contarChecklistPorStatus(itens)
    return {
      ...bl,
      contagem,
      percentual_conforme: percentualConformeChecklistBl(contagem),
      veredito: vereditoDeContagemChecklist(contagem),
      score: calcularScoreChecklistBl(itens, params.pipelineConcluido && !params.carregando),
    }
  })
}

/**
 * Agrega os resumos de BL ao resumo geral (invoices + packing lists + AWBs) para as visões
 * "Todas" (cards por documento + contagem/percentual global). `por_secao` permanece só invoice.
 */
export function combinarResumoGeralComBls(
  resumoBase: ResumoGeralChecklistInvoices,
  resumosBl: ResumoBlChecklist[],
): ResumoGeralChecklistInvoices {
  if (resumosBl.length === 0) return resumoBase
  const por_invoice = [
    ...resumoBase.por_invoice,
    ...resumosBl.map(({ score: _score, ...resto }) => resto),
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
    ...resumoBase,
    total_invoices: por_invoice.length,
    por_invoice,
    contagem_global,
    percentual_global,
    veredito_global: vereditoDeContagemChecklist(contagem_global),
  }
}
