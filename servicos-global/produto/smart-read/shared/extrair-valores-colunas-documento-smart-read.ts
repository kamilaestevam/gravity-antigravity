/**
 * extrair-valores-colunas-documento-smart-read.ts — SSOT server/client
 */
import {
  CATALOGO_COLUNAS_DOCUMENTO_SMART_READ,
  type ColunaDocumentoCatalogoSmartRead,
} from './catalogo-colunas-documento-smart-read.js'

const CHAVES_IGNORADAS = new Set(['accuracy', 'origem', 'averageAccuracy', 'score', 'confidence'])

function valorTexto(valor: unknown): string | null {
  if (valor === null || valor === undefined || valor === '') return null
  if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não'
  if (typeof valor === 'number') return String(valor)
  if (typeof valor === 'string') return valor.trim() || null
  return null
}

function achatarPorCaminhoCanonico(
  mapa: Map<string, string[]>,
  dados: Record<string, unknown>,
  prefixo = '',
): void {
  for (const [chave, valor] of Object.entries(dados)) {
    if (!prefixo && CHAVES_IGNORADAS.has(chave)) continue
    const caminho = prefixo ? `${prefixo}.${chave}` : chave
    const canonico = caminho.replace(/\[\d+\]/g, '[]')

    if (Array.isArray(valor)) {
      valor.forEach((item, i) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          achatarPorCaminhoCanonico(mapa, item as Record<string, unknown>, `${caminho}[${i}]`)
        } else {
          const texto = valorTexto(item)
          if (texto !== null) adicionar(mapa, canonico, texto)
        }
      })
      continue
    }

    if (valor !== null && typeof valor === 'object') {
      achatarPorCaminhoCanonico(mapa, valor as Record<string, unknown>, caminho)
      continue
    }

    const texto = valorTexto(valor)
    if (texto !== null) adicionar(mapa, canonico, texto)
  }
}

function adicionar(mapa: Map<string, string[]>, caminho: string, texto: string): void {
  const lista = mapa.get(caminho) ?? []
  if (!lista.includes(texto)) lista.push(texto)
  mapa.set(caminho, lista)
}

const indiceCaminhoColuna: Map<string, ColunaDocumentoCatalogoSmartRead[]> = (() => {
  const idx = new Map<string, ColunaDocumentoCatalogoSmartRead[]>()
  for (const col of CATALOGO_COLUNAS_DOCUMENTO_SMART_READ) {
    for (const caminho of col.caminhos) {
      const lista = idx.get(caminho) ?? []
      lista.push(col)
      idx.set(caminho, lista)
    }
  }
  return idx
})()

export function extrairValoresColunasDocumento(
  dados: Record<string, unknown> | null | undefined,
): Record<string, string> {
  if (!dados || typeof dados !== 'object') return {}

  const porCaminho = new Map<string, string[]>()
  achatarPorCaminhoCanonico(porCaminho, dados)

  const valores: Record<string, string> = {}
  for (const [caminho, textos] of porCaminho) {
    const colunas = indiceCaminhoColuna.get(caminho)
    if (!colunas) continue
    const texto = textos.join(', ')
    for (const col of colunas) {
      if (!(col.key in valores)) valores[col.key] = texto
    }
  }
  return valores
}
