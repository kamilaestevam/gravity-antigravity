/**
 * complementar-riscos-checklist-matriz-smart-read.ts — riscos sintéticos para falhas de motor
 * e agregadores (BL9-06, AW9-06, P9-06…) sem card explícito na aba Análise de Riscos.
 */

import type { RegraAuditoriaV1, RiscoAduaneiroLeitura } from './analise-riscos-leitura-smart-read.js'
import { regraMatrizPorId } from './matriz-validacao-invoice-smart-read.js'
import { regraMatrizBlPorId } from './matriz-validacao-bl-smart-read.js'
import { regraMatrizAwbPorId } from './matriz-validacao-awb-smart-read.js'
import { regraMatrizPackingListPorId } from './matriz-validacao-packing-list-smart-read.js'
import { regraMatrizCertificadoOrigemPorId } from './matriz-validacao-certificado-origem-smart-read.js'
import { regraMatrizCertificadoFitossanitarioPorId } from './matriz-validacao-certificado-fitossanitario-smart-read.js'
import { regraMatrizPedidoCompraPorId } from './matriz-validacao-pedido-compra-smart-read.js'
import { regraMatrizPedidoVendaPorId } from './matriz-validacao-pedido-venda-smart-read.js'

const RE_ID_REGRA_MATRIZ_MOTOR = /^([A-Z]{1,3}\d+-\d+[a-z]?)/
const RE_ROTULO_REGRA_MOTOR = /^[A-Z]{1,3}\d+-\d+[a-z]?-(.+)$/

type MetaRegraMatriz = {
  item: string
  tooltip_conferencia?: string
  secao?: string
  motor?: string
}

type StatusChecklistComplemento = 'verde' | 'amarelo' | 'vermelho' | 'pendente' | 'na' | 'conforme'

function detalheIndicaNa(detalhe: string | null): boolean {
  return !!detalhe && /^N\/A\s*—/i.test(detalhe.trim())
}

function detalheIndicaAviso(detalhe: string | null): boolean {
  return !!detalhe && /^Aviso\s*—/i.test(detalhe.trim())
}

function obterMetaRegraMatrizGlobal(id: string): MetaRegraMatriz | undefined {
  const regra =
    regraMatrizPorId(id) ??
    regraMatrizBlPorId(id) ??
    regraMatrizAwbPorId(id) ??
    regraMatrizPackingListPorId(id) ??
    regraMatrizCertificadoOrigemPorId(id) ??
    regraMatrizCertificadoFitossanitarioPorId(id) ??
    regraMatrizPedidoCompraPorId(id) ??
    regraMatrizPedidoVendaPorId(id)
  if (!regra) return undefined
  return {
    item: regra.item,
    tooltip_conferencia: regra.tooltip_conferencia,
    secao: regra.secao,
    motor: regra.motor,
  }
}

export function extrairIdRegraMatrizDeRegraMotor(id: string): string | null {
  const match = id.match(RE_ID_REGRA_MATRIZ_MOTOR)
  return match?.[1] ?? null
}

export function extrairRotuloDeIdRegraMotor(id: string): string | null {
  const match = id.match(RE_ROTULO_REGRA_MOTOR)
  return match?.[1] ?? null
}

export function riscoJaExisteParaRegraMotor(
  riscos: readonly RiscoAduaneiroLeitura[],
  idRegraMatriz: string,
  rotuloDocumento: string | null,
): boolean {
  return riscos.some((risco) => {
    if (risco.id_regra_matriz !== idRegraMatriz) return false
    if (!rotuloDocumento) return true
    return risco.evidencias.some((evidencia) => evidencia.documento === rotuloDocumento)
  })
}

function motorParaRisco(motor?: string): RiscoAduaneiroLeitura['motor_validacao'] {
  if (motor === 'api') return 'api'
  if (motor === 'llm' || motor === 'rag') return 'llm'
  return 'codigo'
}

/** Garante card em Riscos para toda falha do motor código/API sem risco explícito. */
export function complementarRiscosDeFalhasMatriz(
  regras: readonly RegraAuditoriaV1[],
  riscos: readonly RiscoAduaneiroLeitura[],
): RiscoAduaneiroLeitura[] {
  const saida = [...riscos]
  const idsExistentes = new Set(saida.map((risco) => risco.id))

  for (const regra of regras) {
    if (regra.passou || detalheIndicaNa(regra.detalhe) || detalheIndicaAviso(regra.detalhe)) continue
    const idRegraMatriz = extrairIdRegraMatrizDeRegraMotor(regra.id)
    if (!idRegraMatriz) continue
    const rotuloDocumento = extrairRotuloDeIdRegraMotor(regra.id)
    if (riscoJaExisteParaRegraMotor(saida, idRegraMatriz, rotuloDocumento)) continue

    const meta = obterMetaRegraMatrizGlobal(idRegraMatriz)
    const sinteticoId = `risco-matriz-${regra.id}`
    if (idsExistentes.has(sinteticoId)) continue

    saida.push({
      id: sinteticoId,
      origem: 'v1',
      severidade: 'critico',
      categoria: 'documental',
      titulo: meta?.item ?? idRegraMatriz,
      motivo: regra.detalhe,
      analise: meta?.tooltip_conferencia ?? regra.detalhe,
      evidencias: rotuloDocumento ? [{ documento: rotuloDocumento, campo: idRegraMatriz }] : [],
      secao_matriz: meta?.secao as RiscoAduaneiroLeitura['secao_matriz'],
      id_regra_matriz: idRegraMatriz,
      motor_validacao: motorParaRisco(meta?.motor),
      status_matriz: 'vermelho',
    })
    idsExistentes.add(sinteticoId)
  }

  return saida
}

export type ItemParaComplementoAgregador = {
  regra: {
    id: string
    item: string
    severidade: unknown
    tooltip_conferencia?: string
    secao?: string
    motor?: string
  }
  status: StatusChecklistComplemento
  detalhe: string | null
  resultado: string
}

function slugRotuloDocumento(rotulo: string): string {
  return rotulo.replace(/[^a-z0-9]+/gi, '-').toLowerCase()
}

/** Score/classificação agregados (ex.: BL9-06) sem regra de motor — card sintético na aba Riscos. */
export function complementarRiscosDeAgregadoresChecklist(
  itens: readonly ItemParaComplementoAgregador[],
  rotuloDocumento: string | null | undefined,
  riscos: readonly RiscoAduaneiroLeitura[],
): RiscoAduaneiroLeitura[] {
  const saida = [...riscos]
  const idsExistentes = new Set(saida.map((risco) => risco.id))
  const rotulo = rotuloDocumento ?? null

  for (const item of itens) {
    if (item.regra.severidade !== null) continue
    if (item.status !== 'vermelho' && item.status !== 'amarelo') continue
    if (riscoJaExisteParaRegraMotor(saida, item.regra.id, rotulo)) continue

    const sinteticoId = `risco-agregador-${item.regra.id}-${slugRotuloDocumento(rotulo ?? 'global')}`
    if (idsExistentes.has(sinteticoId)) continue

    saida.push({
      id: sinteticoId,
      origem: 'v1',
      severidade: item.status === 'vermelho' ? 'critico' : 'atencao',
      categoria: 'documental',
      titulo: item.regra.item,
      motivo: item.detalhe ?? item.resultado,
      analise: item.regra.tooltip_conferencia ?? item.detalhe ?? item.resultado,
      evidencias: rotulo ? [{ documento: rotulo, campo: item.regra.id }] : [],
      secao_matriz: item.regra.secao as RiscoAduaneiroLeitura['secao_matriz'],
      id_regra_matriz: item.regra.id,
      motor_validacao: 'codigo',
      status_matriz: item.status === 'vermelho' ? 'vermelho' : 'amarelo',
    })
    idsExistentes.add(sinteticoId)
  }

  return saida
}

/** Aplica complemento de riscos ao resumo exibido na aba Análise de Riscos. */
export function aplicarFalhasMatrizAoResumoRiscos(
  regras: readonly RegraAuditoriaV1[],
  resumo: {
    riscos: RiscoAduaneiroLeitura[]
    total: number
    criticos: number
    atencao: number
    informativos: number
  },
  complementarAgregadores?: (
    riscos: RiscoAduaneiroLeitura[],
  ) => RiscoAduaneiroLeitura[],
): typeof resumo {
  let riscos = complementarRiscosDeFalhasMatriz(regras, resumo.riscos)
  if (complementarAgregadores) {
    riscos = complementarAgregadores(riscos)
  }
  return {
    riscos,
    total: riscos.length,
    criticos: riscos.filter((r) => r.severidade === 'critico').length,
    atencao: riscos.filter((r) => r.severidade === 'atencao').length,
    informativos: riscos.filter((r) => r.severidade === 'informativo').length,
  }
}
