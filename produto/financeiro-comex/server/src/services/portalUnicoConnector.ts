/**
 * portalUnicoConnector.ts — Conector com o Portal Unico do Comercio Exterior
 *
 * Busca impostos da DUIMP no Portal Unico.
 * Reutiliza o mesmo padrao do NF Importacao (zero fork).
 */

import axios from 'axios'
import { AppError } from '../lib/AppError.js'

export interface ImpostoPortalUnico {
  tipo: string           // 'II', 'IPI', 'PIS', 'COFINS', 'ICMS', 'AFRMM', 'TAXA_SISCOMEX'
  descricao: string
  moeda: string
  valor: number
  taxa_cambio: number
  valor_brl: number
  icms_origem_portal: boolean
}

export interface ResultadoPortalUnico {
  duimp_numero: string
  impostos: ImpostoPortalUnico[]
  data_consulta: string
}

const PORTAL_UNICO_BASE = process.env.PORTAL_UNICO_URL ?? 'https://portalunico.siscomex.gov.br'
const PORTAL_UNICO_TOKEN = process.env.PORTAL_UNICO_TOKEN ?? ''

const MAPA_CATEGORIAS: Record<string, { codigo: string; nome: string }> = {
  II: { codigo: '001', nome: 'Imposto: I.I - Imposto de Importacao' },
  IPI: { codigo: '002', nome: 'Imposto: IPI' },
  PIS: { codigo: '003', nome: 'Imposto: PIS' },
  COFINS: { codigo: '004', nome: 'Imposto: COFINS' },
  ICMS: { codigo: '005', nome: 'Imposto: ICMS' },
  AFRMM: { codigo: '010', nome: 'Marinha Mercante (AFRMM)' },
  TAXA_SISCOMEX: { codigo: '011', nome: 'Taxa Siscomex' },
}

/**
 * Busca impostos de uma DUIMP no Portal Unico
 * NT RFB 001/2023: ICMS disponivel para estados integrados
 */
export async function buscarImpostosPortalUnico(
  duimpNumero: string
): Promise<ResultadoPortalUnico> {
  if (!duimpNumero || duimpNumero.trim().length === 0) {
    throw new AppError('Numero da DUIMP obrigatorio', 400, 'MISSING_DUIMP')
  }

  // Em modo de desenvolvimento sem token, retorna mock estruturado
  if (!PORTAL_UNICO_TOKEN || process.env.NODE_ENV === 'test') {
    return gerarMockPortalUnico(duimpNumero)
  }

  try {
    const response = await axios.get(
      `${PORTAL_UNICO_BASE}/api/ext/duimp/${duimpNumero}/tributos`,
      {
        headers: {
          Authorization: `Bearer ${PORTAL_UNICO_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    )

    const data = response.data
    const impostos: ImpostoPortalUnico[] = []

    const tributos = data.tributos ?? data.impostos ?? []
    for (const t of tributos) {
      const tipo = (t.tipo ?? t.codigo ?? '').toUpperCase()
      const mapa = MAPA_CATEGORIAS[tipo]
      if (!mapa) continue

      const valor = parseFloat(t.valor ?? t.valorDevido ?? 0)
      if (valor <= 0) continue

      const taxa = parseFloat(t.taxaCambio ?? t.taxa_cambio ?? 1.0) || 1.0
      const moeda = (t.moeda ?? 'BRL').toUpperCase()
      const valor_brl = moeda === 'BRL' ? valor : Math.round(valor * taxa * 10000) / 10000

      impostos.push({
        tipo,
        descricao: mapa.nome,
        moeda,
        valor,
        taxa_cambio: taxa,
        valor_brl,
        icms_origem_portal: tipo === 'ICMS',
      })
    }

    return {
      duimp_numero: duimpNumero,
      impostos,
      data_consulta: new Date().toISOString(),
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new AppError(
          'DUIMP nao localizada no Portal Unico. Verifique o numero ou use importacao via XML.',
          404,
          'DUIMP_NOT_FOUND'
        )
      }
      if (err.response?.status === 401 || err.response?.status === 403) {
        throw new AppError('Token do Portal Unico invalido ou expirado', 401, 'PORTAL_UNICO_AUTH')
      }
      throw new AppError(
        'Portal Unico temporariamente indisponivel. Tente via XML.',
        503,
        'PORTAL_UNICO_UNAVAILABLE'
      )
    }
    throw new AppError('Erro ao consultar Portal Unico', 500, 'PORTAL_UNICO_ERROR')
  }
}

function gerarMockPortalUnico(duimpNumero: string): ResultadoPortalUnico {
  return {
    duimp_numero: duimpNumero,
    impostos: [
      { tipo: 'II', descricao: 'Imposto: I.I - Imposto de Importacao', moeda: 'BRL', valor: 1250.00, taxa_cambio: 1.0, valor_brl: 1250.00, icms_origem_portal: false },
      { tipo: 'IPI', descricao: 'Imposto: IPI', moeda: 'BRL', valor: 375.50, taxa_cambio: 1.0, valor_brl: 375.50, icms_origem_portal: false },
      { tipo: 'PIS', descricao: 'Imposto: PIS', moeda: 'BRL', valor: 82.25, taxa_cambio: 1.0, valor_brl: 82.25, icms_origem_portal: false },
      { tipo: 'COFINS', descricao: 'Imposto: COFINS', moeda: 'BRL', valor: 379.80, taxa_cambio: 1.0, valor_brl: 379.80, icms_origem_portal: false },
      { tipo: 'ICMS', descricao: 'Imposto: ICMS', moeda: 'BRL', valor: 680.00, taxa_cambio: 1.0, valor_brl: 680.00, icms_origem_portal: true },
    ],
    data_consulta: new Date().toISOString(),
  }
}
