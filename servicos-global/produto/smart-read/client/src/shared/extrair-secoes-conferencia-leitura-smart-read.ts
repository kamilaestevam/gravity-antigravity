/**
 * extrair-secoes-conferencia-leitura-smart-read.ts
 * Normaliza resultado_extracao.dados em seções/campos com labels DDD (map legado).
 */

import { mapearRotuloCampoLegadoConferencia, ordenarSecoesConferencia } from './mapear-rotulo-campo-legado-conferencia-smart-read'
import {
  prepararDadosConferenciaLeitura,
  valorCampoExtracaoLegadoPreenchido,
} from '../../../shared/mesclar-dados-extracao-legado-smart-read'

export type CampoConferenciaLeitura = {
  chave: string
  rotulo: string
  valor: string | null
  preenchido: boolean
}

export type SecaoConferenciaLeitura = {
  id: string
  titulo: string
  campos: CampoConferenciaLeitura[]
}

export type EstatisticasConferenciaLeitura = {
  total: number
  preenchidos: number
  vazios: number
  percentual: number
}

type CampoLegado = {
  key?: string
  name?: string
  label?: string
  field?: string
  value?: unknown
  text?: unknown
  displayValue?: unknown
  extractedValue?: unknown
  val?: unknown
  section?: string
  group?: string
  sectionName?: string
  groupName?: string
}

const CHAVES_IGNORADAS = new Set(['accuracy', 'origem', 'averageAccuracy', 'score', 'confidence'])

function slugSecao(titulo: string, indice: number): string {
  const base = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return base ? `${base}-${indice}` : `secao-${indice}`
}

export function valorPreenchidoConferencia(valor: unknown): boolean {
  return valorCampoExtracaoLegadoPreenchido(valor)
}

export function valorTextoConferencia(valor: unknown): string | null {
  if (!valorPreenchidoConferencia(valor)) return null
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') return valor
  if (Array.isArray(valor)) return valor.map((item) => String(item)).join(', ')
  return JSON.stringify(valor)
}

function criarCampo(caminho: string, rotulo: string, valor: unknown): CampoConferenciaLeitura {
  const preenchido = valorPreenchidoConferencia(valor)
  return {
    chave: caminho,
    rotulo: rotulo || mapearRotuloCampoLegadoConferencia(caminho).label_tela,
    valor: preenchido ? valorTextoConferencia(valor) : null,
    preenchido,
  }
}

function adicionarCampo(mapa: Map<string, CampoConferenciaLeitura[]>, secao: string, campo: CampoConferenciaLeitura) {
  const titulo = secao.trim() || 'Dados gerais'
  const lista = mapa.get(titulo) ?? []
  if (!lista.some((c) => c.chave === campo.chave)) lista.push(campo)
  mapa.set(titulo, lista)
}

function mapaJaTemSecoesItem(mapa: Map<string, CampoConferenciaLeitura[]>): boolean {
  return [...mapa.keys()].some((titulo) => /^Item \d+$/i.test(titulo.trim()))
}

function tituloSecaoItem(indice: number): string {
  return `Item ${indice + 1}`
}

/** Achata um item de invoice em seção própria (paridade DATI — Item 1, Item 2…). */
function achatarLinhaItemConferencia(
  mapa: Map<string, CampoConferenciaLeitura[]>,
  item: Record<string, unknown>,
  indiceItem: number,
  prefixoItems: string,
) {
  const tituloSecao = tituloSecaoItem(indiceItem)
  const prefixo = `${prefixoItems}[${indiceItem}]`

  const percorrer = (obj: Record<string, unknown>, pref: string) => {
    for (const [chave, valor] of Object.entries(obj)) {
      if (CHAVES_IGNORADAS.has(chave)) continue

      const caminho = `${pref}.${chave}`
      const caminhoCanonico = caminho.replace(/\[\d+\]/g, '[]')

      if (Array.isArray(valor)) {
        valor.forEach((sub, j) => {
          if (sub !== null && typeof sub === 'object' && !Array.isArray(sub)) {
            percorrer(sub as Record<string, unknown>, `${caminho}[${j}]`)
          } else {
            const { label_tela } = mapearRotuloCampoLegadoConferencia(caminhoCanonico)
            adicionarCampo(mapa, tituloSecao, criarCampo(caminho, label_tela, sub))
          }
        })
        continue
      }

      if (valor !== null && typeof valor === 'object') {
        percorrer(valor as Record<string, unknown>, caminho)
        continue
      }

      const { label_tela } = mapearRotuloCampoLegadoConferencia(caminhoCanonico)
      adicionarCampo(mapa, tituloSecao, criarCampo(caminho, label_tela, valor))
    }
  }

  percorrer(item, prefixo)
}

function processarArrayItemsInvoice(
  mapa: Map<string, CampoConferenciaLeitura[]>,
  items: unknown[],
  prefixoItems = 'items',
) {
  if (mapaJaTemSecoesItem(mapa)) return

  items.forEach((bruto, indice) => {
    if (bruto !== null && typeof bruto === 'object' && !Array.isArray(bruto)) {
      achatarLinhaItemConferencia(mapa, bruto as Record<string, unknown>, indice, prefixoItems)
    }
  })
}

function achatarDadosConferencia(
  mapa: Map<string, CampoConferenciaLeitura[]>,
  dados: Record<string, unknown>,
  prefixo = '',
) {
  for (const [chave, valor] of Object.entries(dados)) {
    if (CHAVES_IGNORADAS.has(chave)) continue
    if (!prefixo && chave === 'items') continue

    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    const caminhoCanonico = caminho.replace(/\[\d+\]/g, '[]')

    if (Array.isArray(valor)) {
      valor.forEach((item, i) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          achatarDadosConferencia(mapa, item as Record<string, unknown>, `${caminho}[${i}]`)
        } else {
          const { label_tela, secao_tela } = mapearRotuloCampoLegadoConferencia(caminhoCanonico)
          adicionarCampo(mapa, secao_tela, criarCampo(caminhoCanonico, label_tela, item))
        }
      })
      continue
    }

    if (valor !== null && typeof valor === 'object') {
      achatarDadosConferencia(mapa, valor as Record<string, unknown>, caminho)
      continue
    }

    const { label_tela, secao_tela } = mapearRotuloCampoLegadoConferencia(caminhoCanonico)
    adicionarCampo(mapa, secao_tela, criarCampo(caminhoCanonico, label_tela, valor))
  }
}

function resolverValorCampoLegado(item: CampoLegado): unknown {
  const bruto = item as Record<string, unknown>
  return (
    item.value ??
    item.text ??
    item.displayValue ??
    item.extractedValue ??
    item.val ??
    bruto.content ??
    bruto.display_value
  )
}

function processarListaCampos(
  mapa: Map<string, CampoConferenciaLeitura[]>,
  campos: CampoLegado[],
  secaoPadrao?: string,
) {
  for (const item of campos) {
    const chave = String(item.key ?? item.name ?? item.field ?? item.label ?? 'campo')
    const rotulo = item.label ?? item.name ?? mapearRotuloCampoLegadoConferencia(chave).label_tela
    const secao =
      item.section ??
      item.sectionName ??
      item.group ??
      item.groupName ??
      secaoPadrao ??
      mapearRotuloCampoLegadoConferencia(chave).secao_tela
    adicionarCampo(mapa, secao, criarCampo(chave, rotulo, resolverValorCampoLegado(item)))
  }
}

function processarSecoesLegado(mapa: Map<string, CampoConferenciaLeitura[]>, secoes: unknown[]) {
  secoes.forEach((bruto, indice) => {
    if (!bruto || typeof bruto !== 'object') return
    const sec = bruto as Record<string, unknown>
    const titulo =
      (typeof sec.title === 'string' && sec.title) ||
      (typeof sec.name === 'string' && sec.name) ||
      (typeof sec.label === 'string' && sec.label) ||
      `Seção ${indice + 1}`

    const camposBrutos = sec.fields ?? sec.campos ?? sec.items
    if (Array.isArray(camposBrutos)) {
      processarListaCampos(mapa, camposBrutos as CampoLegado[], titulo)
      return
    }

    if (camposBrutos && typeof camposBrutos === 'object') {
      achatarDadosConferencia(mapa, camposBrutos as Record<string, unknown>, titulo)
    }
  })
}

export function extrairSecoesConferenciaLeitura(dados: Record<string, unknown> | null | undefined): SecaoConferenciaLeitura[] {
  const dadosPreparados = prepararDadosConferenciaLeitura(dados)
  if (!dadosPreparados || typeof dadosPreparados !== 'object') return []

  const mapa = new Map<string, CampoConferenciaLeitura[]>()

  const secoesLegado =
    dadosPreparados.sections ??
    dadosPreparados.groups ??
    dadosPreparados.categories ??
    dadosPreparados.fieldGroups
  if (Array.isArray(secoesLegado)) {
    processarSecoesLegado(mapa, secoesLegado)
  }

  const listaCampos = dadosPreparados.fields ?? dadosPreparados.campos
  if (Array.isArray(listaCampos)) {
    processarListaCampos(mapa, listaCampos as CampoLegado[])
  }

  if (mapa.size === 0) {
    const { items, ...restante } = dadosPreparados
    achatarDadosConferencia(mapa, restante)
    if (Array.isArray(items)) {
      processarArrayItemsInvoice(mapa, items)
    }
  } else if (Array.isArray(dadosPreparados.items)) {
    processarArrayItemsInvoice(mapa, dadosPreparados.items)
  }

  return ordenarSecoesConferencia(
    Array.from(mapa.entries()).map(([titulo, campos], indice) => ({
      id: slugSecao(titulo, indice),
      titulo,
      campos,
    })),
  )
}

export function calcularEstatisticasConferencia(secoes: SecaoConferenciaLeitura[]): EstatisticasConferenciaLeitura {
  let total = 0
  let preenchidos = 0
  for (const secao of secoes) {
    for (const campo of secao.campos) {
      total++
      if (campo.preenchido) preenchidos++
    }
  }
  const vazios = total - preenchidos
  const percentual = total > 0 ? Math.round((preenchidos / total) * 100) : 0
  return { total, preenchidos, vazios, percentual }
}
