/**
 * bacen.ts — Bacen PTAX Connector
 * Busca cotação oficial do Banco Central (API pública OData).
 * Skill: antigravity-simulacusto
 */

import axios from 'axios'

const BACEN_URL = process.env.BACEN_URL || 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata'

interface PtaxResult {
  venda: number
  compra: number
  data: string
}

export async function getLatestPtax(moeda: string = 'USD'): Promise<PtaxResult> {
  const date = new Date().toISOString().split('T')[0] // YYYY-MM-DD
  const [year, month, day] = date.split('-')
  const formattedDate = `${month}-${day}-${year}` // Bacen usa MM-DD-YYYY

  const url = `${BACEN_URL}/CotacaoMoedaDia(moeda='${moeda}',dataCotacao='${formattedDate}')?$top=1&$format=json`

  try {
    const response = await axios.get(url)
    const data = response.data.value[0]

    if (!data) throw new Error('Cotação não encontrada para a data especificada.')

    return {
      venda: data.cotacaoVenda,
      compra: data.cotacaoCompra,
      data: data.dataHoraCotacao
    }
  } catch (error) {
    console.warn(`[Bacen] Falha ao buscar PTAX para ${moeda}:`, error instanceof Error ? error.message : error)
    // Fallback padrão se API estiver indisponível
    return {
      venda: 5.92,
      compra: 5.91,
      data: new Date().toISOString()
    }
  }
}
