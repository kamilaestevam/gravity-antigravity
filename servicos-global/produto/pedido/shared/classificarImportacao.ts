/**
 * classificarImportacao.ts — Roteador de pipeline do Smart Import
 *
 * Decide se o arquivo segue o caminho deterministico (heuristica/memoria/template)
 * ou se precisaria de Gemini — sem chamar LLM quando template/heuristica resolve.
 */
import { createHash } from 'node:crypto'
import {
  CAMPOS_PEDIDO_DDD_TODOS,
  normalizarNomeCampo,
  prioridadeDeCampo,
} from './campos-pedido-ddd.js'

export type PipelineImportacao =
  | 'deterministico'
  | 'gemini_mapeamento'
  | 'gemini_extracao'

/** Campos critica + principal — mesmo criterio do Modo Essencial na UI. */
export const CAMPOS_ESSENCIAIS_IMPORTACAO: ReadonlySet<string> = new Set(
  CAMPOS_PEDIDO_DDD_TODOS
    .filter((c) => prioridadeDeCampo(c) !== 'secundaria')
    .map((c) => c.campo),
)

function hashRotulos(rotulos: string[]): string {
  const str = rotulos.slice().sort().join('|').toLowerCase()
  return createHash('sha256').update(str).digest('hex').slice(0, 16)
}

/** Fingerprint dos rotulos do template oficial v3.8 (hash estavel por conjunto de colunas). */
export const HASH_TEMPLATE_ROTULOS_V38 = hashRotulos(
  CAMPOS_PEDIDO_DDD_TODOS.map((c) => c.rotulo),
)

const LIMIAR_ESSENCIAIS_DETERMINISTICO = 0.95
const LIMIAR_ESSENCIAIS_GEMINI = 0.70

function cabecalhoContem(normCabecalhos: string[], rotulo: string): boolean {
  const alvo = normalizarNomeCampo(rotulo)
  return normCabecalhos.some((c) => c === alvo || c.includes(alvo))
}

/**
 * Detecta planilha no formato Gravity (super-header + colunas do template).
 * Exige 3 de 4 sinais estruturais para evitar falso positivo.
 */
export function ehPlanilhaTemplateGravity(
  cabecalhos: string[],
  linhasCabecalho: number,
  hashColunas: string,
): boolean {
  const norm = cabecalhos.map(normalizarNomeCampo)

  const sinais = [
    linhasCabecalho === 2,
    cabecalhoContem(norm, 'Tipo Linha'),
    cabecalhoContem(norm, 'Numero do Pedido'),
    cabecalhoContem(norm, 'Part Number'),
    hashColunas === HASH_TEMPLATE_ROTULOS_V38,
  ]

  const positivos = sinais.filter(Boolean).length
  return positivos >= 3
}

export interface MapeamentoParaScore {
  campo_sistema: string | null
  confianca: number
}

/** Proporcao de campos essenciais mapeados com confianca >= 70. */
export function calcularScoreEssenciais(mapeamento: MapeamentoParaScore[]): number {
  if (CAMPOS_ESSENCIAIS_IMPORTACAO.size === 0) return 0

  const mapeados = new Set(
    mapeamento
      .filter((m) => m.campo_sistema && m.confianca >= 70)
      .map((m) => m.campo_sistema as string),
  )

  let matched = 0
  for (const campo of CAMPOS_ESSENCIAIS_IMPORTACAO) {
    if (mapeados.has(campo)) matched++
  }

  return matched / CAMPOS_ESSENCIAIS_IMPORTACAO.size
}

export function classificarPipelineImportacao(params: {
  memoriaAplicada: boolean
  templateDetectado: boolean
  scoreEssenciais: number
  extratorUsado: string
  extensaoArquivo: string
}): PipelineImportacao {
  if (params.memoriaAplicada || params.templateDetectado) {
    return 'deterministico'
  }

  if (params.scoreEssenciais >= LIMIAR_ESSENCIAIS_DETERMINISTICO) {
    return 'deterministico'
  }

  const ext = params.extensaoArquivo.toLowerCase()
  if (ext === 'pdf') {
    return params.extratorUsado === 'gemini' ? 'gemini_extracao' : 'gemini_extracao'
  }

  if (params.scoreEssenciais < LIMIAR_ESSENCIAIS_GEMINI) {
    return 'gemini_mapeamento'
  }

  return 'deterministico'
}
