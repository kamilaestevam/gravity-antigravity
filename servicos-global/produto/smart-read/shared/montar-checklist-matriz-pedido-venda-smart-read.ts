/**
 * montar-checklist-matriz-pedido-venda-smart-read.ts — checklist da matriz PV (PV1–PV9)
 */

import {
  GATES_MATRIZ_PEDIDO_VENDA,
  MATRIZ_VALIDACAO_PEDIDO_VENDA,
  ORDEM_SECOES_MATRIZ_PEDIDO_VENDA,
  ROTULO_CLASSIFICACAO_RISCO_PEDIDO_VENDA,
  classificacaoRiscoPedidoVenda,
  type ClassificacaoRiscoPedidoVenda,
  type RegraMatrizPedidoVenda,
  type SecaoMatrizPedidoVenda,
} from './matriz-validacao-pedido-venda-smart-read.js'
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
import {
  motorAguardaEnriquecimentoServidor,
  type FaseEnriquecimentoAnaliseRiscos,
} from './rotulo-aguardando-motor-checklist-smart-read.js'

export type StatusChecklistMatrizPedidoVenda = StatusChecklistMatrizInvoice

export type ItemChecklistMatrizPedidoVenda = {
  regra: RegraMatrizPedidoVenda
  status: StatusChecklistMatrizPedidoVenda
  rotulo_status: RotuloStatusChecklistInvoice
  resultado: string
  detalhe: string | null
  risco_id: string | null
  em_analise: boolean
}

export type ParametrosChecklistMatrizPedidoVenda = {
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

/** Score documental (PV9-05) + classificação por gates (PV9-06). */
export type ScoreChecklistPedidoVenda = {
  /** 0–100 sobre regras ALERTA aplicáveis; 100 quando não há base de cálculo */
  score: number
  /** Quantidade de regras ALERTA aplicáveis (base do score) */
  base_alerta: number
  /** IDs das regras PVOQ com falha (gates disparados) */
  gates_falhos: string[]
  classificacao: ClassificacaoRiscoPedidoVenda
  rotulo_classificacao: string
  /** Ainda há regra pendente — score parcial */
  pendente: boolean
}

/** Detecta Pedido de Venda (Sales Order / Order Confirmation). */
export function ehTipoPedidoVendaChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('PURCHASE') || norm.includes('COMPRA')) return false
  return (
    norm.includes('SALES ORDER') ||
    norm.includes('PEDIDO DE VENDA') ||
    norm.includes('PEDIDO_VENDA') ||
    norm.includes('ORDER CONFIRMATION') ||
    norm.includes('ORDER ACKNOWLEDGMENT') ||
    norm.includes('ORDER ACKNOWLEDGEMENT') ||
    /\bSO\b/.test(norm)
  )
}

function montarItem(
  regra: RegraMatrizPedidoVenda,
  status: StatusChecklistMatrizPedidoVenda,
  detalhe: string | null,
  risco_id: string | null,
  resultadoOverride?: string,
  emAnalise = false,
): ItemChecklistMatrizPedidoVenda {
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
): StatusChecklistMatrizPedidoVenda {
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

function itemAguardandoEnriquecimentoMotor(
  regraMatriz: RegraMatrizPedidoVenda,
  fase: FaseEnriquecimentoAnaliseRiscos | null | undefined,
  enriquecimento: boolean,
): ItemChecklistMatrizPedidoVenda | null {
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
  regra: RegraMatrizPedidoVenda,
  parciais: ItemChecklistMatrizPedidoVenda[],
  pipelineConcluido: boolean,
): ItemChecklistMatrizPedidoVenda {
  const score = calcularScoreChecklistPedidoVenda(parciais, pipelineConcluido)
  if (regra.id === 'PV9-05') {
    const status: StatusChecklistMatrizPedidoVenda = score.pendente
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
  const status: StatusChecklistMatrizPedidoVenda = score.pendente
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

export function montarChecklistMatrizPedidoVenda(
  params: ParametrosChecklistMatrizPedidoVenda,
): ItemChecklistMatrizPedidoVenda[] {
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

  const regrasAvaliaveis = MATRIZ_VALIDACAO_PEDIDO_VENDA.filter((r) => r.severidade !== null)
  const parciais: ItemChecklistMatrizPedidoVenda[] = regrasAvaliaveis.map((regraMatriz) => {
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

  const agregadores = MATRIZ_VALIDACAO_PEDIDO_VENDA.filter((r) => r.severidade === null).map(
    (regra) => itemAgregador(regra, parciais, pipelineConcluido && !carregando),
  )

  return [...parciais, ...agregadores]
}

/** Score 0–100 (PV9-05): base = ALERTA aplicáveis; verde=1, amarelo=0,5, vermelho=0. */
export function calcularScoreChecklistPedidoVenda(
  itens: ItemChecklistMatrizPedidoVenda[],
  pipelineConcluido = true,
): ScoreChecklistPedidoVenda {
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
    .filter((i) => GATES_MATRIZ_PEDIDO_VENDA.includes(i.regra.id) && i.status === 'vermelho')
    .map((i) => i.regra.id)

  const classificacao = classificacaoRiscoPedidoVenda(score, gatesFalhos)
  return {
    score,
    base_alerta: baseAlerta.length,
    gates_falhos: gatesFalhos,
    classificacao,
    rotulo_classificacao: ROTULO_CLASSIFICACAO_RISCO_PEDIDO_VENDA[classificacao],
    pendente,
  }
}

export function agruparChecklistPedidoVendaPorSecao(
  itens: ItemChecklistMatrizPedidoVenda[],
): Array<{ secao: SecaoMatrizPedidoVenda; itens: ItemChecklistMatrizPedidoVenda[] }> {
  const mapa = new Map<SecaoMatrizPedidoVenda, ItemChecklistMatrizPedidoVenda[]>()
  for (const item of itens) {
    const lista = mapa.get(item.regra.secao) ?? []
    lista.push(item)
    mapa.set(item.regra.secao, lista)
  }
  return ORDEM_SECOES_MATRIZ_PEDIDO_VENDA.filter((s) => mapa.has(s)).map((secao) => ({
    secao,
    itens: mapa.get(secao) ?? [],
  }))
}

export type PedidoVendaOpcaoChecklist = {
  rotulo: string
  nome_arquivo: string
  tipo_documento: string
  indice: number
  numero_invoice: string | null
}

export function listarPedidosVendaChecklist(documentos: DocumentoAnaliseRisco[]): PedidoVendaOpcaoChecklist[] {
  return documentos
    .filter((d) => ehTipoPedidoVendaChecklist(d.tipo_documento))
    .map((doc) => {
      const mapa = achatarCamposDadosLeitura(doc.dados)
      const referencia =
        valorTextoComparacaoCampo(mapa.get('document.salesOrderNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.orderConfirmationNumber')) ??
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

export type ResumoPedidoVendaChecklist = PedidoVendaOpcaoChecklist & {
  contagem: ContagemChecklistStatus
  percentual_conforme: number
  veredito: RotuloStatusChecklistInvoice
  score: ScoreChecklistPedidoVenda
}

/** Percentual conforme sobre regras avaliadas — N/A fica fora da base (não infla o percentual). */
export function percentualConformeChecklistPedidoVenda(contagem: ContagemChecklistStatus): number {
  const base = contagem.total - contagem.na
  if (base <= 0) return 0
  return Math.round((contagem.verde / base) * 100)
}

export function montarResumoChecklistPedidosVenda(
  params: ParametrosChecklistMatrizPedidoVenda & { documentos: DocumentoAnaliseRisco[] },
): ResumoPedidoVendaChecklist[] {
  return listarPedidosVendaChecklist(params.documentos).map((pv) => {
    const itens = montarChecklistMatrizPedidoVenda({ ...params, rotulo_documento: pv.rotulo })
    const contagem = contarChecklistPorStatus(itens)
    return {
      ...pv,
      contagem,
      percentual_conforme: percentualConformeChecklistPedidoVenda(contagem),
      veredito: vereditoDeContagemChecklist(contagem),
      score: calcularScoreChecklistPedidoVenda(itens, params.pipelineConcluido && !params.carregando),
    }
  })
}

/**
 * Agrega os resumos de PV ao resumo geral (invoices + packing lists + AWBs) para as visões
 * "Todas" (cards por documento + contagem/percentual global). `por_secao` permanece só invoice.
 */
export function combinarResumoGeralComPedidosVenda(
  resumoBase: ResumoGeralChecklistInvoices,
  resumosBl: ResumoPedidoVendaChecklist[],
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
