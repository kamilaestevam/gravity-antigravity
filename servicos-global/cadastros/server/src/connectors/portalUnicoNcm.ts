/**
 * portalUnicoNcm.ts — Connector com o Portal Único Siscomex
 *
 * Endpoint público (sem auth):
 *   GET https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json?perfil=PUBLICO
 *
 * Retorna a tabela completa de NCMs válidos, atualizada toda meia-noite.
 * Cada item tem: Codigo (8 dígitos) + Descricao + DataInicio + DataFim
 *
 * Endpoint de validação pontual (também público):
 *   GET https://api-externa.portalunico.siscomex.gov.br/ttce/api/ext/ncm/{codigo}
 */

import axios from 'axios'
import { AppError } from '../lib/app-error.js'

// ── Constantes ───────────────────────────────────────────────────────────────

const CLASSIF_URL =
  process.env.PORTAL_UNICO_CLASSIF_URL ??
  'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json'

const TTCE_URL =
  process.env.SISCOMEX_BASE_URL ??
  'https://api-externa.portalunico.siscomex.gov.br/ttce/api/ext'

const DOWNLOAD_TIMEOUT_MS = 60_000  // tabela completa pode ser grande
const VALIDATE_TIMEOUT_MS = 10_000

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface NcmItemRaw {
  codigo:     string
  descricao:  string
  dataInicio: string | null
  dataFim:    string | null
}

export interface NcmDetalhe {
  codigo:    string
  descricao: string
  ii:        number | null
  ipi:       number | null
  pis:       number | null
  cofins:    number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizarItem(raw: Record<string, unknown>): NcmItemRaw {
  // A API retorna chaves em PascalCase dentro de um array "Nomenclaturas"
  const codigo    = String(raw['Codigo']    ?? raw['codigo']    ?? '').replace(/\D/g, '')
  const descricao = String(raw['Descricao'] ?? raw['descricao'] ?? '').trim()
  const inicio    = (raw['DataInicio'] ?? raw['dataInicio'] ?? null) as string | null
  const fim       = (raw['DataFim']    ?? raw['dataFim']    ?? null) as string | null

  return { codigo, descricao, dataInicio: inicio, dataFim: fim }
}

function parseAliquota(val: unknown): number | null {
  if (val == null) return null
  const n = typeof val === 'number' ? val : parseFloat(String(val))
  return Number.isFinite(n) ? n : null
}

// ── Funções públicas ──────────────────────────────────────────────────────────

/**
 * Baixa a tabela completa de NCMs do Portal Único.
 * Retorna apenas itens com código de 8 dígitos (NCM folha).
 */
export async function baixarTabelaNcm(): Promise<NcmItemRaw[]> {
  if (process.env.NCM_MOCK === 'true') {
    return gerarMockTabela()
  }

  try {
    const response = await axios.get(CLASSIF_URL, {
      params:  { perfil: 'PUBLICO' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    })

    const body = response.data
    // O endpoint retorna { Nomenclaturas: [...] } ou diretamente um array
    const lista: unknown[] = Array.isArray(body)
      ? body
      : (body?.Nomenclaturas ?? body?.nomenclaturas ?? [])

    const itens = (lista as Record<string, unknown>[])
      .map(normalizarItem)
      .filter(i => /^\d{8}$/.test(i.codigo) && i.descricao.length > 0)

    if (itens.length === 0) {
      throw new AppError(
        'Portal Único retornou tabela NCM vazia — verifique a URL ou tente novamente.',
        502,
        'NCM_EMPTY_RESPONSE'
      )
    }

    return itens
  } catch (err: unknown) {
    if (err instanceof AppError) throw err

    if (axios.isAxiosError(err)) {
      if (err.code === 'ECONNABORTED') {
        throw new AppError(
          'Timeout ao baixar tabela NCM do Portal Único.',
          504,
          'NCM_DOWNLOAD_TIMEOUT'
        )
      }
      throw new AppError(
        `Erro ao acessar Portal Único: ${err.message}`,
        502,
        'NCM_DOWNLOAD_ERROR'
      )
    }

    throw new AppError('Erro inesperado ao baixar tabela NCM.', 500, 'NCM_UNEXPECTED')
  }
}

/**
 * Valida um NCM pontual via endpoint TTCE.
 * Retorna os detalhes se válido, null se não encontrado.
 */
export async function validarNcm(codigo: string): Promise<NcmDetalhe | null> {
  if (!/^\d{8}$/.test(codigo)) return null

  if (process.env.NCM_MOCK === 'true') {
    return codigo === '84713019'
      ? { codigo, descricao: 'Unidades digitais de processamento de pequena capacidade', ii: 14, ipi: 0, pis: 2.1, cofins: 9.65 }
      : null
  }

  try {
    const response = await axios.get(`${TTCE_URL}/ncm/${codigo}`, {
      timeout: VALIDATE_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    })
    const data = response.data
    return {
      codigo:    String(data.codigo    ?? data.Codigo    ?? codigo),
      descricao: String(data.descricao ?? data.Descricao ?? ''),
      ii:        parseAliquota(data.IiAliquotaAd  ?? data.iiAliquotaAd  ?? data.ii),
      ipi:       parseAliquota(data.IpiAliquotaAd ?? data.ipiAliquotaAd ?? data.ipi),
      pis:       parseAliquota(data.PisAliquota   ?? data.pisAliquota   ?? data.pis),
      cofins:    parseAliquota(data.CofinsAliquota ?? data.cofinsAliquota ?? data.cofins),
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null
    // Outros erros: logar mas não explodir — o caller decide
    return null
  }
}

// ── Mock para testes ──────────────────────────────────────────────────────────

function gerarMockTabela(): NcmItemRaw[] {
  return [
    { codigo: '84713019', descricao: 'Unidades digitais de processamento', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '84715010', descricao: 'Unidades de processamento, exceto as das subposições 8471.41 e 8471.49', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '30049099', descricao: 'Outros medicamentos', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '72142000', descricao: 'Barras de ferro ou aço', dataInicio: '2022-01-01', dataFim: null },
    { codigo: '85171210', descricao: 'Telefones para redes celulares', dataInicio: '2022-01-01', dataFim: null },
  ]
}
