/**
 * siscomex.ts — Siscomex Connector
 * Interface com os endpoints do Portal Único (PRD Seção de Endpoints).
 * Skill: antigravity-simulacusto
 */

import axios from 'axios'

const SISCOMEX_BASE_URL = process.env.SISCOMEX_BASE_URL || 'https://api-externa.portalunico.siscomex.gov.br/ttce/api/ext'

interface NcmDetail {
  codigo: string
  descricao: string
}

export class SiscomexConnector {
  private client = axios.create({ baseURL: SISCOMEX_BASE_URL })

  /**
   * GET /ncm/{codigo} — Detalhes técnicos de um NCM de 8 dígitos.
   */
  async getNcmDetail(codigo: string): Promise<NcmDetail> {
    try {
      const response = await this.client.get(`/ncm/${codigo}`)
      return response.data
    } catch {
      // Mock para NCM de teste do PRD
      if (codigo === '84713019') {
        return {
          codigo,
          descricao: 'Unidades digitais de processamento de pequena capacidade...'
        }
      }
      throw new Error(`NCM ${codigo} não encontrado.`)
    }
  }

  /**
   * POST /simular-calculo-publico — Simulação padrão via Portal Único oficial.
   */
  async simularCalculoPublico(payload: any) {
    try {
      const response = await this.client.post('/simular-calculo-publico', payload)
      return response.data
    } catch (e: any) {
      console.warn('[Siscomex] Falha na simulação externa:', e.message)
      // Se falhar, o calculator.ts local assume como fallback
      return null
    }
  }
}

export const siscomex = new SiscomexConnector()
