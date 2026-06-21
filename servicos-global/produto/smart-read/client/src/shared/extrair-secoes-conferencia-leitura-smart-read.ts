/**
 * extrair-secoes-conferencia-leitura-smart-read.ts
 * Normaliza resultado_extracao.dados em seções/campos com labels DDD (map legado).
 */

import { mapearRotuloCampoLegadoConferencia, ordenarSecoesConferencia } from './mapear-rotulo-campo-legado-conferencia-smart-read'

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
  if (valor === null || valor === undefined || valor === '') return false
  if (Array.isArray(valor)) return valor.length > 0
  if (typeof valor === 'object') return Object.keys(valor as Record<string, unknown>).length > 0
  return true
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

function achatarDadosConferencia(
  mapa: Map<string, CampoConferenciaLeitura[]>,
  dados: Record<string, unknown>,
  prefixo = '',
) {
  for (const [chave, valor] of Object.entries(dados)) {
    if (CHAVES_IGNORADAS.has(chave)) continue

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

function processarListaCampos(mapa: Map<string, CampoConferenciaLeitura[]>, campos: CampoLegado[]) {
  for (const item of campos) {
    const chave = String(item.key ?? item.name ?? item.field ?? item.label ?? 'campo')
    const rotulo = item.label ?? item.name ?? mapearRotuloCampoLegadoConferencia(chave).label_tela
    const secao =
      item.section ??
      item.sectionName ??
      item.group ??
      item.groupName ??
      mapearRotuloCampoLegadoConferencia(chave).secao_tela
    adicionarCampo(mapa, secao, criarCampo(chave, rotulo, item.value))
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
      processarListaCampos(mapa, camposBrutos as CampoLegado[])
      return
    }

    if (camposBrutos && typeof camposBrutos === 'object') {
      achatarDadosConferencia(mapa, camposBrutos as Record<string, unknown>, titulo)
    }
  })
}

export function extrairSecoesConferenciaLeitura(dados: Record<string, unknown> | null | undefined): SecaoConferenciaLeitura[] {
  if (!dados || typeof dados !== 'object') return []

  const mapa = new Map<string, CampoConferenciaLeitura[]>()

  const secoesLegado = dados.sections ?? dados.groups ?? dados.categories ?? dados.fieldGroups
  if (Array.isArray(secoesLegado)) {
    processarSecoesLegado(mapa, secoesLegado)
  }

  const listaCampos = dados.fields ?? dados.campos
  if (Array.isArray(listaCampos)) {
    processarListaCampos(mapa, listaCampos as CampoLegado[])
  }

  if (mapa.size === 0) {
    achatarDadosConferencia(mapa, dados)
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
