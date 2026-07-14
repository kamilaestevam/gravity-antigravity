/**
 * montar-checklist-matriz-pedido-compra-smart-read.ts — checklist da matriz PC (PC1–PC9)
 */

import {
  GATES_MATRIZ_PEDIDO_COMPRA,
  MATRIZ_VALIDACAO_PEDIDO_COMPRA,
  ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA,
  ROTULO_CLASSIFICACAO_RISCO_PEDIDO_COMPRA,
  classificacaoRiscoPedidoCompra,
  type ClassificacaoRiscoPedidoCompra,
  type RegraMatrizPedidoCompra,
  type SecaoMatrizPedidoCompra,
} from './matriz-validacao-pedido-compra-smart-read.js'
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

export type StatusChecklistMatrizPedidoCompra = StatusChecklistMatrizInvoice

export type ItemChecklistMatrizPedidoCompra = {
  regra: RegraMatrizPedidoCompra
  status: StatusChecklistMatrizPedidoCompra
  rotulo_status: RotuloStatusChecklistInvoice
  resultado: string
  detalhe: string | null
  risco_id: string | null
  em_analise: boolean
}

export type ParametrosChecklistMatrizPedidoCompra = {
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

/** Score documental (PC9-05) + classificação por gates (PC9-06). */
export type ScoreChecklistPedidoCompra = {
  /** 0–100 sobre regras ALERTA aplicáveis; 100 quando não há base de cálculo */
  score: number
  /** Quantidade de regras ALERTA aplicáveis (base do score) */
  base_alerta: number
  /** IDs das regras PCOQ com falha (gates disparados) */
  gates_falhos: string[]
  classificacao: ClassificacaoRiscoPedidoCompra
  rotulo_classificacao: string
  /** Ainda há regra pendente — score parcial */
  pendente: boolean
}

/** Detecta Pedido de Compra (Purchase Order / PO). */
export function ehTipoPedidoCompraChecklist(tipo: string): boolean {
  const norm = tipo.toUpperCase()
  if (norm.includes('SALES') || norm.includes('VENDA') || norm.includes('ORDER CONFIRMATION')) return false
  return (
    norm.includes('PURCHASE ORDER') ||
    norm.includes('PEDIDO DE COMPRA') ||
    norm.includes('PEDIDO_COMPRA') ||
    (/\bPO\b/.test(norm) && !norm.includes('PROFORMA'))
  )
}

function montarItem(
  regra: RegraMatrizPedidoCompra,
  status: StatusChecklistMatrizPedidoCompra,
  detalhe: string | null,
  risco_id: string | null,
  resultadoOverride?: string,
  emAnalise = false,
): ItemChecklistMatrizPedidoCompra {
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
): StatusChecklistMatrizPedidoCompra {
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
  regraMatriz: RegraMatrizPedidoCompra,
  fase: FaseEnriquecimentoAnaliseRiscos | null | undefined,
  enriquecimento: boolean,
): ItemChecklistMatrizPedidoCompra | null {
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
  regra: RegraMatrizPedidoCompra,
  parciais: ItemChecklistMatrizPedidoCompra[],
  pipelineConcluido: boolean,
): ItemChecklistMatrizPedidoCompra {
  const score = calcularScoreChecklistPedidoCompra(parciais, pipelineConcluido)
  if (regra.id === 'PC9-05') {
    const status: StatusChecklistMatrizPedidoCompra = score.pendente
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
  const status: StatusChecklistMatrizPedidoCompra = score.pendente
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

export function montarChecklistMatrizPedidoCompra(
  params: ParametrosChecklistMatrizPedidoCompra,
): ItemChecklistMatrizPedidoCompra[] {
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

  const regrasAvaliaveis = MATRIZ_VALIDACAO_PEDIDO_COMPRA.filter((r) => r.severidade !== null)
  const parciais: ItemChecklistMatrizPedidoCompra[] = regrasAvaliaveis.map((regraMatriz) => {
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

  const agregadores = MATRIZ_VALIDACAO_PEDIDO_COMPRA.filter((r) => r.severidade === null).map(
    (regra) => itemAgregador(regra, parciais, pipelineConcluido && !carregando),
  )

  return [...parciais, ...agregadores]
}

/** Score 0–100 (PC9-05): base = ALERTA aplicáveis; verde=1, amarelo=0,5, vermelho=0. */
export function calcularScoreChecklistPedidoCompra(
  itens: ItemChecklistMatrizPedidoCompra[],
  pipelineConcluido = true,
): ScoreChecklistPedidoCompra {
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
    .filter((i) => GATES_MATRIZ_PEDIDO_COMPRA.includes(i.regra.id) && i.status === 'vermelho')
    .map((i) => i.regra.id)

  const classificacao = classificacaoRiscoPedidoCompra(score, gatesFalhos)
  return {
    score,
    base_alerta: baseAlerta.length,
    gates_falhos: gatesFalhos,
    classificacao,
    rotulo_classificacao: ROTULO_CLASSIFICACAO_RISCO_PEDIDO_COMPRA[classificacao],
    pendente,
  }
}

export function agruparChecklistPedidoCompraPorSecao(
  itens: ItemChecklistMatrizPedidoCompra[],
): Array<{ secao: SecaoMatrizPedidoCompra; itens: ItemChecklistMatrizPedidoCompra[] }> {
  const mapa = new Map<SecaoMatrizPedidoCompra, ItemChecklistMatrizPedidoCompra[]>()
  for (const item of itens) {
    const lista = mapa.get(item.regra.secao) ?? []
    lista.push(item)
    mapa.set(item.regra.secao, lista)
  }
  return ORDEM_SECOES_MATRIZ_PEDIDO_COMPRA.filter((s) => mapa.has(s)).map((secao) => ({
    secao,
    itens: mapa.get(secao) ?? [],
  }))
}

export type PedidoCompraOpcaoChecklist = {
  rotulo: string
  nome_arquivo: string
  tipo_documento: string
  indice: number
  numero_invoice: string | null
}

export function listarPedidosCompraChecklist(documentos: DocumentoAnaliseRisco[]): PedidoCompraOpcaoChecklist[] {
  return documentos
    .filter((d) => ehTipoPedidoCompraChecklist(d.tipo_documento))
    .map((doc) => {
      const mapa = achatarCamposDadosLeitura(doc.dados)
      const referencia =
        valorTextoComparacaoCampo(mapa.get('document.purchaseOrderNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.orderNumber')) ??
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

export type ResumoPedidoCompraChecklist = PedidoCompraOpcaoChecklist & {
  contagem: ContagemChecklistStatus
  percentual_conforme: number
  veredito: RotuloStatusChecklistInvoice
  score: ScoreChecklistPedidoCompra
}

/** Percentual conforme sobre regras avaliadas — N/A fica fora da base (não infla o percentual). */
export function percentualConformeChecklistPedidoCompra(contagem: ContagemChecklistStatus): number {
  const base = contagem.total - contagem.na
  if (base <= 0) return 0
  return Math.round((contagem.verde / base) * 100)
}

export function montarResumoChecklistPedidosCompra(
  params: ParametrosChecklistMatrizPedidoCompra & { documentos: DocumentoAnaliseRisco[] },
): ResumoPedidoCompraChecklist[] {
  return listarPedidosCompraChecklist(params.documentos).map((pc) => {
    const itens = montarChecklistMatrizPedidoCompra({ ...params, rotulo_documento: pc.rotulo })
    const contagem = contarChecklistPorStatus(itens)
    return {
      ...pc,
      contagem,
      percentual_conforme: percentualConformeChecklistPedidoCompra(contagem),
      veredito: vereditoDeContagemChecklist(contagem),
      score: calcularScoreChecklistPedidoCompra(itens, params.pipelineConcluido && !params.carregando),
    }
  })
}

/**
 * Agrega os resumos de PC ao resumo geral (invoices + packing lists + AWBs) para as visões
 * "Todas" (cards por documento + contagem/percentual global). `por_secao` permanece só invoice.
 */
export function combinarResumoGeralComPedidosCompra(
  resumoBase: ResumoGeralChecklistInvoices,
  resumosBl: ResumoPedidoCompraChecklist[],
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
