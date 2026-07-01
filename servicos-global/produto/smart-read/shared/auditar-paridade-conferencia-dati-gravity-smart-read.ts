/**
 * auditar-paridade-conferencia-dati-gravity-smart-read.ts
 * Motor de auditoria DATI × Gravity — campos preenchidos no JSON legado que não aparecem na conferência.
 */

import { textoExtracaoEhPlaceholder } from './texto-analise-riscos-leitura-smart-read.js'
import {
  mesclarDadosExtracaoLegado,
  prepararDadosConferenciaLeitura,
  valorCampoExtracaoLegadoPreenchido,
} from './mesclar-dados-extracao-legado-smart-read.js'

export type ClasseGapParidadeConferencia =
  | 'BFF_FINAL_VAZIO_IA_PREENCHIDO'
  | 'CAMINHO_NAO_RENDERIZADO'
  | 'PLACEHOLDER_LEGADO'
  | 'VALOR_PRESENTE_MAS_VAZIO_NA_UI'

export type GapParidadeConferenciaDatiGravity = {
  classe: ClasseGapParidadeConferencia
  caminho_legado: string
  valor_legado: string
  tipo_documento?: string
  detalhe?: string
}

export type RelatorioParidadeConferenciaDatiGravity = {
  total_caminhos_preenchidos: number
  total_exibidos_conferencia: number
  total_gaps: number
  gaps: GapParidadeConferenciaDatiGravity[]
  por_classe: Record<ClasseGapParidadeConferencia, number>
}

export type CampoConferenciaAuditoria = {
  chave: string
  valor: string | null
  preenchido: boolean
}

export type SecaoConferenciaAuditoria = {
  titulo: string
  campos: CampoConferenciaAuditoria[]
}

const CHAVES_IGNORADAS_AUDITORIA = new Set([
  'accuracy',
  'averageaccuracy',
  'score',
  'confidence',
  'origem',
  'sections',
  'groups',
  'categories',
  'fieldgroups',
  'fields',
  'campos',
])

function canonicalizarCaminho(caminho: string): string {
  return caminho.replace(/\[\d+\]/g, '[]')
}

function caminhosEquivalentesConferencia(esperado: string, chaveUi: string): boolean {
  if (esperado === chaveUi) return true
  if (canonicalizarCaminho(esperado) === canonicalizarCaminho(chaveUi)) return true

  const esperadoCanon = canonicalizarCaminho(esperado)
  const chaveCanon = canonicalizarCaminho(chaveUi)
  if (chaveCanon.endsWith(esperadoCanon) || esperadoCanon.endsWith(chaveCanon)) return true

  const folhaEsperada = esperado.split('.').pop()?.replace(/\[\]/g, '') ?? ''
  const folhaUi = chaveUi.split('.').pop()?.replace(/\[\d+\]/g, '') ?? ''
  return folhaEsperada.length > 0 && folhaEsperada === folhaUi
}

export function campoConferenciaExibeCaminho(
  caminho: string,
  valor: string,
  secoes: SecaoConferenciaAuditoria[],
): boolean {
  const valorNorm = valor.trim()
  for (const secao of secoes) {
    for (const campo of secao.campos) {
      if (!caminhosEquivalentesConferencia(caminho, campo.chave)) continue
      if (!campo.preenchido || !campo.valor) return false
      return campo.valor.trim() === valorNorm || campo.valor.includes(valorNorm)
    }
  }
  return false
}

function listarCaminhosPreenchidosDados(
  dados: Record<string, unknown>,
  prefixo = '',
): Array<{ caminho: string; valor: string }> {
  const saida: Array<{ caminho: string; valor: string }> = []

  for (const [chave, valor] of Object.entries(dados)) {
    if (CHAVES_IGNORADAS_AUDITORIA.has(chave.toLowerCase())) continue

    const caminho = prefixo ? `${prefixo}.${chave}` : chave

    if (Array.isArray(valor)) {
      valor.forEach((item, indice) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          saida.push(
            ...listarCaminhosPreenchidosDados(item as Record<string, unknown>, `${caminho}[${indice}]`),
          )
        } else if (valorCampoExtracaoLegadoPreenchido(item)) {
          saida.push({ caminho: `${caminho}[${indice}]`, valor: String(item) })
        }
      })
      continue
    }

    if (valor !== null && typeof valor === 'object') {
      saida.push(...listarCaminhosPreenchidosDados(valor as Record<string, unknown>, caminho))
      continue
    }

    if (valorCampoExtracaoLegadoPreenchido(valor)) {
      saida.push({ caminho, valor: String(valor) })
    }
  }

  return saida
}

export function auditarParidadeConferenciaDatiGravity(params: {
  dados_exibicao: Record<string, unknown>
  secoes_conferencia: SecaoConferenciaAuditoria[]
  dados_final?: Record<string, unknown>
  dados_ia?: Record<string, unknown>
  tipo_documento?: string
}): RelatorioParidadeConferenciaDatiGravity {
  const gaps: GapParidadeConferenciaDatiGravity[] = []
  const porClasse: Record<ClasseGapParidadeConferencia, number> = {
    BFF_FINAL_VAZIO_IA_PREENCHIDO: 0,
    CAMINHO_NAO_RENDERIZADO: 0,
    PLACEHOLDER_LEGADO: 0,
    VALOR_PRESENTE_MAS_VAZIO_NA_UI: 0,
  }

  if (params.dados_final && params.dados_ia) {
    for (const { caminho, valor } of listarCaminhosPreenchidosDados(params.dados_ia)) {
      const folha = caminho.split('.').pop()?.replace(/\[\d+\]/g, '') ?? caminho
      const brutoFinal = lerValorPorCaminho(params.dados_final, caminho)
      if (!valorCampoExtracaoLegadoPreenchido(brutoFinal)) {
        gaps.push({
          classe: 'BFF_FINAL_VAZIO_IA_PREENCHIDO',
          caminho_legado: caminho,
          valor_legado: valor,
          tipo_documento: params.tipo_documento,
          detalhe: `processingResult tem valor; finalProcessingResult vazio em ${folha}`,
        })
      }
    }
  }

  const caminhos = listarCaminhosPreenchidosDados(params.dados_exibicao)
  let exibidos = 0

  for (const { caminho, valor } of caminhos) {
    if (textoExtracaoEhPlaceholder(valor)) {
      gaps.push({
        classe: 'PLACEHOLDER_LEGADO',
        caminho_legado: caminho,
        valor_legado: valor,
        tipo_documento: params.tipo_documento,
      })
      continue
    }

    if (campoConferenciaExibeCaminho(caminho, valor, params.secoes_conferencia)) {
      exibidos++
      continue
    }

    const campoExisteVazio = params.secoes_conferencia.some((secao) =>
      secao.campos.some(
        (campo) => caminhosEquivalentesConferencia(caminho, campo.chave) && !campo.preenchido,
      ),
    )

    gaps.push({
      classe: campoExisteVazio ? 'VALOR_PRESENTE_MAS_VAZIO_NA_UI' : 'CAMINHO_NAO_RENDERIZADO',
      caminho_legado: caminho,
      valor_legado: valor,
      tipo_documento: params.tipo_documento,
      detalhe: campoExisteVazio
        ? 'Campo renderizado na UI mas sem valor (perda na normalização ou placeholder)'
        : 'Caminho com valor no JSON não encontrado nas seções da conferência',
    })
  }

  for (const gap of gaps) {
    porClasse[gap.classe]++
  }

  return {
    total_caminhos_preenchidos: caminhos.length,
    total_exibidos_conferencia: exibidos,
    total_gaps: gaps.length,
    gaps,
    por_classe: porClasse,
  }
}

export function lerValorPorCaminho(dados: Record<string, unknown>, caminho: string): unknown {
  const partes = caminho.split('.')
  let atual: unknown = dados

  for (const parte of partes) {
    const match = /^([^[]+)(?:\[(\d+)\])?$/.exec(parte)
    if (!match || atual === null || typeof atual !== 'object') return undefined

    const [, chave, indiceStr] = match
    atual = (atual as Record<string, unknown>)[chave]
    if (indiceStr !== undefined) {
      if (!Array.isArray(atual)) return undefined
      atual = atual[Number(indiceStr)]
    }
  }

  return atual
}

export function definirValorPorCaminho(
  dados: Record<string, unknown>,
  caminho: string,
  valor: unknown,
): void {
  const partes = caminho.split('.')
  let atual: Record<string, unknown> = dados

  for (let i = 0; i < partes.length; i++) {
    const parte = partes[i]
    const match = /^([^[]+)(?:\[(\d+)\])?$/.exec(parte)
    if (!match) return

    const [, chave, indiceStr] = match
    const ultimo = i === partes.length - 1

    if (indiceStr !== undefined) {
      const indice = Number(indiceStr)
      if (!Array.isArray(atual[chave])) atual[chave] = []
      const arr = atual[chave] as unknown[]
      if (ultimo) {
        arr[indice] = valor
        return
      }
      if (arr[indice] === null || typeof arr[indice] !== 'object' || Array.isArray(arr[indice])) {
        arr[indice] = {}
      }
      atual = arr[indice] as Record<string, unknown>
      continue
    }

    if (ultimo) {
      atual[chave] = valor
      return
    }

    if (atual[chave] === null || typeof atual[chave] !== 'object' || Array.isArray(atual[chave])) {
      atual[chave] = {}
    }
    atual = atual[chave] as Record<string, unknown>
  }
}

export function montarDadosMinimosCatalogo(caminhoLegado: string, valor: string): Record<string, unknown> {
  const dados: Record<string, unknown> = {}
  const caminhoIndexado = caminhoLegado.replace(/\[\]/g, '[0]')
  definirValorPorCaminho(dados, caminhoIndexado, valor)
  return dados
}

export function prepararDadosExibicaoLegado(
  dadosFinal: Record<string, unknown>,
  dadosIa?: Record<string, unknown>,
): Record<string, unknown> {
  const mesclado =
    dadosIa != null ? mesclarDadosExtracaoLegado(dadosFinal, dadosIa) : { ...dadosFinal }
  return prepararDadosConferenciaLeitura(mesclado)
}

export function calcularCoberturaParidadeConferencia(relatorio: RelatorioParidadeConferenciaDatiGravity): number {
  if (relatorio.total_caminhos_preenchidos === 0) return 100
  const perdasRenderizacao =
    relatorio.por_classe.CAMINHO_NAO_RENDERIZADO +
    relatorio.por_classe.VALOR_PRESENTE_MAS_VAZIO_NA_UI +
    relatorio.por_classe.BFF_FINAL_VAZIO_IA_PREENCHIDO
  const caminhosReais =
    relatorio.total_caminhos_preenchidos - relatorio.por_classe.PLACEHOLDER_LEGADO
  if (caminhosReais <= 0) return 100
  const cobertura = ((caminhosReais - perdasRenderizacao) / caminhosReais) * 100
  return Math.max(0, Math.min(100, Math.round(cobertura * 10) / 10))
}
