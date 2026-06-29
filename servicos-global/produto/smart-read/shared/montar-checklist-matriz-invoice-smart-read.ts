/**
 * montar-checklist-matriz-invoice-smart-read.ts — checklist Passo 4 (todas as regras da matriz)
 */

import {
  MATRIZ_VALIDACAO_INVOICE,
  type RegraMatrizInvoice,
  type SecaoMatrizInvoice,
  type StatusMatrizInvoice,
} from './matriz-validacao-invoice-smart-read.js'
import type {
  DocumentoAnaliseRisco,
  RegraAuditoriaV1,
  RiscoAduaneiroLeitura,
} from './analise-riscos-leitura-smart-read.js'
import { achatarCamposDadosLeitura, valorTextoComparacaoCampo } from './analise-riscos-leitura-smart-read.js'
import {
  extrairDetalheDadosRegraMatrizInvoice,
  regraMatrizTemDadoExtraido,
} from './extrair-detalhe-dados-regra-matriz-invoice-smart-read.js'

export type StatusChecklistMatrizInvoice = StatusMatrizInvoice | 'pendente' | 'na'

/** Rótulo padronizado estilo checklist de aviação (CONFORME / ATENÇÃO / FALHA / PENDENTE). */
export type RotuloStatusChecklistInvoice = 'CONFORME' | 'ATENÇÃO' | 'FALHA' | 'PENDENTE' | 'N/A'

export type ItemChecklistMatrizInvoice = {
  regra: RegraMatrizInvoice
  status: StatusChecklistMatrizInvoice
  rotulo_status: RotuloStatusChecklistInvoice
  /** Leitura encontrada no documento ou resposta da validação (coluna Resultado). */
  resultado: string
  /** Contexto adicional para tooltip / acessibilidade. */
  detalhe: string | null
  risco_id: string | null
}

export const ROTULO_STATUS_CHECKLIST_INVOICE: Record<
  StatusChecklistMatrizInvoice,
  RotuloStatusChecklistInvoice
> = {
  verde: 'CONFORME',
  amarelo: 'ATENÇÃO',
  vermelho: 'FALHA',
  pendente: 'PENDENTE',
  na: 'N/A',
}

function rotuloStatusDeStatus(status: StatusChecklistMatrizInvoice): RotuloStatusChecklistInvoice {
  return ROTULO_STATUS_CHECKLIST_INVOICE[status]
}

function truncarTexto(texto: string, max = 120): string {
  const t = texto.trim()
  if (t.length <= max) return t
  return `${t.slice(0, max - 1)}…`
}

/** Normaliza detalhe técnico em «resultado» legível (valor lido no documento). */
export function normalizarResultadoChecklist(
  detalhe: string | null,
  status: StatusChecklistMatrizInvoice,
): string {
  if (!detalhe) {
    if (status === 'pendente') return '—'
    if (status === 'na') return 'Não aplicável'
    if (status === 'verde') return 'Conforme critério'
    return '—'
  }

  const prefixos = [
    /^Número:\s*/i,
    /^Data futura:\s*/i,
    /^Data antiga \(\d+ dias\):\s*/i,
    /^Moeda:\s*/i,
    /^Incoterm:\s*/i,
  ]
  let saida = detalhe
  for (const rx of prefixos) {
    saida = saida.replace(rx, '')
  }

  if (status === 'verde' && /^(conforme|ok|sem diverg)/i.test(saida)) {
    return truncarTexto(saida)
  }

  return truncarTexto(saida)
}

function resultadoDeRisco(risco: RiscoAduaneiroLeitura): string {
  const ev = risco.evidencias.find((e) => e.valor?.trim())
  if (ev?.valor) return truncarTexto(ev.valor)
  return truncarTexto(risco.motivo, 100)
}

function detalheIndicaNa(detalhe: string | null): boolean {
  return !!detalhe && /^N\/A\s*—/i.test(detalhe.trim())
}

function detalheEhPlaceholderSemDado(detalhe: string | null): boolean {
  if (!detalhe) return true
  return /não extraíd|não identificad|sem linhas|ausente no documento/i.test(detalhe)
}

function statusDeRegrasMotor(regrasMotor: RegraAuditoriaV1[]): StatusChecklistMatrizInvoice {
  const detalhe = regrasMotor.map((r) => r.detalhe).join(' · ')
  if (detalheIndicaNa(detalhe)) return 'na'
  if (!regrasMotor.every((r) => r.passou)) return 'vermelho'
  return 'verde'
}

function montarItemChecklist(
  regra: RegraMatrizInvoice,
  status: StatusChecklistMatrizInvoice,
  detalhe: string | null,
  risco_id: string | null,
  resultadoOverride?: string,
): ItemChecklistMatrizInvoice {
  return {
    regra,
    status,
    rotulo_status: rotuloStatusDeStatus(status),
    resultado: resultadoOverride ?? normalizarResultadoChecklist(detalhe, status),
    detalhe,
    risco_id,
  }
}

function severidadeParaStatus(severidade: RiscoAduaneiroLeitura['severidade']): StatusMatrizInvoice {
  if (severidade === 'critico') return 'vermelho'
  if (severidade === 'atencao') return 'amarelo'
  return 'verde'
}

export type ParametrosChecklistMatrizInvoice = {
  regras: RegraAuditoriaV1[]
  riscos: RiscoAduaneiroLeitura[]
  pipelineConcluido: boolean
  llmHabilitado: boolean
  carregando: boolean
  documentos?: DocumentoAnaliseRisco[]
  rotulo_documento?: string | null
}

export type InvoiceOpcaoChecklist = {
  rotulo: string
  nome_arquivo: string
  tipo_documento: string
  indice: number
  numero_invoice: string | null
}

export type ContagemChecklistStatus = ReturnType<typeof contarChecklistPorStatus>

export type ResumoInvoiceChecklist = InvoiceOpcaoChecklist & {
  contagem: ContagemChecklistStatus
  percentual_conforme: number
  veredito: RotuloStatusChecklistInvoice
}

export type ResumoSecaoChecklistGeral = {
  secao: SecaoMatrizInvoice
  verde: number
  amarelo: number
  vermelho: number
  pendente: number
  na: number
  total: number
  veredito: RotuloStatusChecklistInvoice
}

export type ResumoGeralChecklistInvoices = {
  total_invoices: number
  contagem_global: ContagemChecklistStatus
  percentual_global: number
  veredito_global: RotuloStatusChecklistInvoice
  por_invoice: ResumoInvoiceChecklist[]
  por_secao: ResumoSecaoChecklistGeral[]
}

/** Valor sentinela do SelectGlobal na visão geral — agrega todas as invoices. */
export const VALOR_TODAS_INVOICES_CHECKLIST = '__todas__' as const

export function rotuloDocumentoChecklistInvoice(
  nomeArquivo: string,
  tipoDocumento: string,
  indice: number,
): string {
  return `${nomeArquivo} · ${tipoDocumento.trim() || `Documento ${indice + 1}`}`
}

export function listarInvoicesChecklist(documentos: DocumentoAnaliseRisco[]): InvoiceOpcaoChecklist[] {
  return documentos
    .filter((d) => d.tipo_documento.toUpperCase().includes('INVOICE'))
    .map((doc) => {
      const mapa = achatarCamposDadosLeitura(doc.dados)
      const numero =
        valorTextoComparacaoCampo(mapa.get('document.invoiceNumber')) ??
        valorTextoComparacaoCampo(mapa.get('invoiceNumber')) ??
        valorTextoComparacaoCampo(mapa.get('document.number'))
      return {
        rotulo: rotuloDocumentoChecklistInvoice(doc.nome_arquivo, doc.tipo_documento, doc.indice),
        nome_arquivo: doc.nome_arquivo,
        tipo_documento: doc.tipo_documento,
        indice: doc.indice,
        numero_invoice: numero,
      }
    })
}

function filtrarRegrasMatrizDocumento(
  regras: RegraAuditoriaV1[],
  idRegraMatriz: string,
  rotuloDocumento?: string | null,
): RegraAuditoriaV1[] {
  const prefixo = `${idRegraMatriz}-`
  const candidatas = regras.filter((r) => r.id.startsWith(prefixo))
  if (!rotuloDocumento) return candidatas
  const idExato = `${idRegraMatriz}-${rotuloDocumento}`
  const exata = candidatas.filter((r) => r.id === idExato)
  if (exata.length > 0) return exata
  return candidatas.filter((r) => r.id.endsWith(rotuloDocumento))
}

function riscoDaMatrizDocumento(
  riscos: RiscoAduaneiroLeitura[],
  idRegraMatriz: string,
  rotuloDocumento?: string | null,
): RiscoAduaneiroLeitura | undefined {
  const candidatos = riscos.filter((r) => r.id_regra_matriz === idRegraMatriz)
  if (!rotuloDocumento) return candidatos[0]
  return candidatos.find((r) => r.evidencias.some((e) => e.documento === rotuloDocumento))
}

export function vereditoDeContagemChecklist(
  contagem: ContagemChecklistStatus,
): RotuloStatusChecklistInvoice {
  if (contagem.vermelho > 0) return 'FALHA'
  if (contagem.amarelo > 0) return 'ATENÇÃO'
  if (contagem.pendente > 0) return 'PENDENTE'
  if (contagem.total === 0) return 'N/A'
  return 'CONFORME'
}

export function montarChecklistMatrizInvoice(
  params: ParametrosChecklistMatrizInvoice,
): ItemChecklistMatrizInvoice[] {
  const {
    regras,
    riscos,
    pipelineConcluido,
    llmHabilitado,
    carregando,
    rotulo_documento,
    documentos,
  } = params

  return MATRIZ_VALIDACAO_INVOICE.map((regraMatriz) => {
    const detalheExtraido =
      documentos && documentos.length > 0
        ? extrairDetalheDadosRegraMatrizInvoice(regraMatriz.id, documentos, rotulo_documento)
        : null

    const risco = riscoDaMatrizDocumento(riscos, regraMatriz.id, rotulo_documento)
    if (risco) {
      const status = risco.status_matriz ?? severidadeParaStatus(risco.severidade)
      return montarItemChecklist(
        regraMatriz,
        status,
        risco.motivo,
        risco.id,
        resultadoDeRisco(risco),
      )
    }

    const regrasMotor = filtrarRegrasMatrizDocumento(regras, regraMatriz.id, rotulo_documento)
    if (regrasMotor.length > 0) {
      const status = statusDeRegrasMotor(regrasMotor)
      const detalhe = regrasMotor.map((r) => r.detalhe).join(' · ')
      return montarItemChecklist(regraMatriz, status, detalhe, null)
    }

    const motorPrecisaIa = regraMatriz.motor === 'llm' || regraMatriz.motor === 'rag'
    if (motorPrecisaIa) {
      const temDado =
        documentos != null &&
        documentos.length > 0 &&
        regraMatrizTemDadoExtraido(regraMatriz.id, documentos, rotulo_documento)
      const resultadoLido = detalheExtraido ?? '—'

      if (!temDado && pipelineConcluido) {
        return montarItemChecklist(
          regraMatriz,
          'na',
          'N/A — sem dado na extração para esta regra',
          null,
          'Não aplicável',
        )
      }

      if (carregando || !pipelineConcluido) {
        return montarItemChecklist(
          regraMatriz,
          'pendente',
          carregando ? 'Aguardando Passo 3 (Analista IA)…' : 'Aguardando pipeline completo…',
          null,
          temDado ? resultadoLido : 'Aguardando IA',
        )
      }
      if (!llmHabilitado) {
        return montarItemChecklist(
          regraMatriz,
          temDado ? 'pendente' : 'na',
          temDado ? 'Requer Analista IA (GEMINI_API_KEY)' : 'N/A — IA indisponível e sem dado',
          null,
          temDado ? resultadoLido : 'Não aplicável',
        )
      }
      return montarItemChecklist(
        regraMatriz,
        'na',
        'Revisão manual — IA sem apontamento nesta regra',
        null,
        temDado ? resultadoLido : 'Sem dado extraído',
      )
    }

    if (regraMatriz.motor === 'api') {
      if (carregando || !pipelineConcluido) {
        return montarItemChecklist(
          regraMatriz,
          'pendente',
          'Aguardando Passo 2 (consulta CNPJ)…',
          null,
          detalheExtraido ?? 'Aguardando API',
        )
      }
      if (!detalheExtraido || detalheEhPlaceholderSemDado(detalheExtraido)) {
        return montarItemChecklist(
          regraMatriz,
          'na',
          'N/A — sem dado para consulta API',
          null,
          'Não aplicável',
        )
      }
      return montarItemChecklist(
        regraMatriz,
        'pendente',
        'API sem regra registrada',
        null,
        detalheExtraido,
      )
    }

    if (detalheExtraido && !detalheEhPlaceholderSemDado(detalheExtraido)) {
      return montarItemChecklist(
        regraMatriz,
        'pendente',
        pipelineConcluido
          ? 'Dado extraído — aguardando validação do motor'
          : 'Aguardando Passo 1 (código)…',
        null,
        detalheExtraido,
      )
    }

    return montarItemChecklist(
      regraMatriz,
      pipelineConcluido ? 'na' : 'pendente',
      pipelineConcluido ? 'N/A — sem dado na extração' : 'Aguardando Passo 1 (código)…',
      null,
      pipelineConcluido ? 'Não aplicável' : '—',
    )
  })
}

export function agruparChecklistPorSecao(
  itens: ItemChecklistMatrizInvoice[],
): Array<{ secao: SecaoMatrizInvoice; itens: ItemChecklistMatrizInvoice[] }> {
  const ordem: SecaoMatrizInvoice[] = [
    'identificacao',
    'cadastral',
    'logistica',
    'itens_fiscais',
    'financeiro',
    'bancario',
    'pesos_embalagens',
    'legitimidade',
  ]
  const mapa = new Map<SecaoMatrizInvoice, ItemChecklistMatrizInvoice[]>()
  for (const item of itens) {
    const lista = mapa.get(item.regra.secao) ?? []
    lista.push(item)
    mapa.set(item.regra.secao, lista)
  }
  return ordem
    .filter((s) => mapa.has(s))
    .map((secao) => ({ secao, itens: mapa.get(secao) ?? [] }))
}

export function contarChecklistPorStatus(itens: ItemChecklistMatrizInvoice[]) {
  return {
    verde: itens.filter((i) => i.status === 'verde').length,
    amarelo: itens.filter((i) => i.status === 'amarelo').length,
    vermelho: itens.filter((i) => i.status === 'vermelho').length,
    pendente: itens.filter((i) => i.status === 'pendente').length,
    na: itens.filter((i) => i.status === 'na').length,
    total: itens.length,
  }
}

/** Veredito da seção — pior status prevalece (estilo checklist de voo). */
export function vereditoSecaoChecklist(
  itens: ItemChecklistMatrizInvoice[],
): RotuloStatusChecklistInvoice {
  if (itens.some((i) => i.status === 'vermelho')) return 'FALHA'
  if (itens.some((i) => i.status === 'amarelo')) return 'ATENÇÃO'
  if (itens.some((i) => i.status === 'pendente')) return 'PENDENTE'
  if (itens.length === 0) return 'N/A'
  return 'CONFORME'
}

/** Resumo agregado para visão geral (infográfico) — uma avaliação por invoice × regra. */
export function montarResumoGeralChecklistInvoices(
  params: ParametrosChecklistMatrizInvoice & { documentos: DocumentoAnaliseRisco[] },
): ResumoGeralChecklistInvoices {
  const invoices = listarInvoicesChecklist(params.documentos)
  const por_invoice: ResumoInvoiceChecklist[] = invoices.map((inv) => {
    const itens = montarChecklistMatrizInvoice({ ...params, rotulo_documento: inv.rotulo })
    const contagem = contarChecklistPorStatus(itens)
    const percentual_conforme =
      contagem.total === 0
        ? 0
        : Math.round(((contagem.verde + contagem.na) / contagem.total) * 100)
    return {
      ...inv,
      contagem,
      percentual_conforme,
      veredito: vereditoDeContagemChecklist(contagem),
    }
  })

  const contagem_global = por_invoice.reduce(
    (acc, inv) => ({
      verde: acc.verde + inv.contagem.verde,
      amarelo: acc.amarelo + inv.contagem.amarelo,
      vermelho: acc.vermelho + inv.contagem.vermelho,
      pendente: acc.pendente + inv.contagem.pendente,
      na: acc.na + inv.contagem.na,
      total: acc.total + inv.contagem.total,
    }),
    { verde: 0, amarelo: 0, vermelho: 0, pendente: 0, na: 0, total: 0 },
  )

  const percentual_global =
    contagem_global.total === 0
      ? 0
      : Math.round(((contagem_global.verde + contagem_global.na) / contagem_global.total) * 100)

  const ordemSecao: SecaoMatrizInvoice[] = [
    'identificacao',
    'cadastral',
    'logistica',
    'itens_fiscais',
    'financeiro',
    'bancario',
    'pesos_embalagens',
    'legitimidade',
  ]

  const por_secao: ResumoSecaoChecklistGeral[] = ordemSecao.map((secao) => {
    let verde = 0
    let amarelo = 0
    let vermelho = 0
    let pendente = 0
    let na = 0
    for (const inv of invoices) {
      const itens = montarChecklistMatrizInvoice({ ...params, rotulo_documento: inv.rotulo })
      for (const item of itens.filter((i) => i.regra.secao === secao)) {
        if (item.status === 'verde') verde += 1
        else if (item.status === 'amarelo') amarelo += 1
        else if (item.status === 'vermelho') vermelho += 1
        else if (item.status === 'na') na += 1
        else pendente += 1
      }
    }
    const total = verde + amarelo + vermelho + pendente + na
    return {
      secao,
      verde,
      amarelo,
      vermelho,
      pendente,
      na,
      total,
      veredito: vereditoDeContagemChecklist({ verde, amarelo, vermelho, pendente, na, total }),
    }
  })

  return {
    total_invoices: invoices.length,
    contagem_global,
    percentual_global,
    veredito_global: vereditoDeContagemChecklist(contagem_global),
    por_invoice,
    por_secao,
  }
}
