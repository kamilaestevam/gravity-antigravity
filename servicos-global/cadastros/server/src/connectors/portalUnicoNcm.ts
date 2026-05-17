/**
 * portalUnicoNcm.ts — Connector com o Portal Único Siscomex
 *
 * Dois endpoints:
 *
 * 1. Tabela completa (público, sem auth):
 *    GET https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json
 *    Retorna NCMs válidos com código + descrição. Usada pelo sync diário.
 *
 * 2. TTCE — Tratamento Tributário (requer mTLS + JWT):
 *    POST https://portalunico.siscomex.gov.br/ttce/api/ext/tratamentos-tributarios/importacao/
 *    Retorna alíquotas (II, IPI). PIS=2.1% e COFINS=9.65% são fixos por lei.
 *    Auth: certificado digital e-CNPJ → JWT via /portal/api/autenticar.
 */

import axios from 'axios'
import https from 'node:https'
import { createSecureContext } from 'node:tls'
import { AppError } from '../lib/app-error.js'
import { prisma } from '../lib/prisma.js'
import { decryptToBuffer } from '../lib/certificado-crypto.js'
import { obterTokenSiscomex } from '../services/siscomex-auth.js'

// ── Constantes ───────────────────────────────────────────────────────────────

const CLASSIF_URL =
  process.env.PORTAL_UNICO_CLASSIF_URL ??
  'https://portalunico.siscomex.gov.br/classif/api/publico/nomenclatura/download/json'

const TTCE_URL =
  process.env.SISCOMEX_TTCE_URL ??
  'https://portalunico.siscomex.gov.br/ttce/api/ext'

const DOWNLOAD_TIMEOUT_MS = 60_000
const VALIDATE_TIMEOUT_MS = 15_000

// PIS e COFINS na importação são fixos por lei (Lei 10.865/2004)
const PIS_IMPORTACAO = 2.1
const COFINS_IMPORTACAO = 9.65

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

// ── Funções públicas ────────────────────────────────────────────��─────────────

/**
 * Baixa a tabela completa de NCMs do Portal Único (endpoint público).
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
        throw new AppError('Timeout ao baixar tabela NCM do Portal Único.', 504, 'NCM_DOWNLOAD_TIMEOUT')
      }
      throw new AppError(`Erro ao acessar Portal Único: ${err.message}`, 502, 'NCM_DOWNLOAD_ERROR')
    }

    throw new AppError('Erro inesperado ao baixar tabela NCM.', 500, 'NCM_UNEXPECTED')
  }
}

/**
 * Busca alíquotas de um NCM via TTCE (requer certificado ativo).
 * Retorna detalhes se válido, null se não encontrado ou sem certificado.
 */
export async function validarNcm(codigo: string): Promise<NcmDetalhe | null> {
  if (!/^\d{8}$/.test(codigo)) return null

  if (process.env.NCM_MOCK === 'true') {
    return codigo === '84713019'
      ? { codigo, descricao: 'Unidades digitais de processamento de pequena capacidade', ii: 14, ipi: 0, pis: PIS_IMPORTACAO, cofins: COFINS_IMPORTACAO }
      : null
  }

  // Tentar via TTCE autenticado (requer certificado)
  try {
    return await buscarAliquotasTtce(codigo)
  } catch {
    // Sem certificado ou auth falhou — fallback silencioso
    return null
  }
}

/**
 * Busca alíquotas via TTCE com autenticação por certificado.
 * Lança erro se certificado não configurado ou auth falhar.
 */
export async function buscarAliquotasTtce(codigo: string): Promise<NcmDetalhe | null> {
  const token = await obterTokenSiscomex()

  // TTCE espera POST com body { codigoNcm, ... }
  const url = `${TTCE_URL}/ncm/${codigo}`

  try {
    const response = await axios.get(url, {
      timeout: VALIDATE_TIMEOUT_MS,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const data = response.data
    return {
      codigo:    String(data.codigo    ?? data.Codigo    ?? codigo),
      descricao: String(data.descricao ?? data.Descricao ?? ''),
      ii:        parseAliquota(data.IiAliquotaAd  ?? data.iiAliquotaAd  ?? data.ii ?? data.aliquotaIi),
      ipi:       parseAliquota(data.IpiAliquotaAd ?? data.ipiAliquotaAd ?? data.ipi ?? data.aliquotaIpi),
      pis:       PIS_IMPORTACAO,
      cofins:    COFINS_IMPORTACAO,
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err) && err.response?.status === 404) return null
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      throw new AppError('Token TTCE expirado ou inválido', 502, 'TTCE_AUTH_EXPIRED')
    }
    return null
  }
}

/**
 * Busca alíquotas em lote para popular ncm_sync durante sync.
 * Respeita rate limiting (50ms entre requests).
 */
export async function buscarAliquotasEmLote(
  codigos: string[],
  onProgresso?: (processados: number, total: number) => void,
): Promise<Map<string, { ii: number | null; ipi: number | null; pis: number; cofins: number }>> {
  const resultado = new Map<string, { ii: number | null; ipi: number | null; pis: number; cofins: number }>()

  let token: string
  try {
    token = await obterTokenSiscomex()
  } catch {
    return resultado
  }

  for (let i = 0; i < codigos.length; i++) {
    const codigo = codigos[i]

    try {
      const url = `${TTCE_URL}/ncm/${codigo}`
      const response = await axios.get(url, {
        timeout: VALIDATE_TIMEOUT_MS,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = response.data
      resultado.set(codigo, {
        ii:  parseAliquota(data.IiAliquotaAd  ?? data.iiAliquotaAd  ?? data.ii ?? data.aliquotaIi),
        ipi: parseAliquota(data.IpiAliquotaAd ?? data.ipiAliquotaAd ?? data.ipi ?? data.aliquotaIpi),
        pis: PIS_IMPORTACAO,
        cofins: COFINS_IMPORTACAO,
      })
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        // Token expirou no meio do batch — tentar renovar
        try {
          const { invalidarCacheToken } = await import('../services/siscomex-auth.js')
          invalidarCacheToken()
          token = await obterTokenSiscomex()
          i-- // retry este NCM
          continue
        } catch {
          break
        }
      }
      // NCM não encontrado ou outro erro — skip
    }

    if (onProgresso) onProgresso(i + 1, codigos.length)

    // Rate limiting: 50ms entre requests
    if (i < codigos.length - 1) {
      await new Promise(r => setTimeout(r, 50))
    }
  }

  return resultado
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
