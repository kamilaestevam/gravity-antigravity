/**
 * Execução compartilhada de sync PTAX — usada pelo worker cron e pelo botão manual.
 */

import axios from 'axios'
import { persistirCotacao, classificarBoletim, MOEDAS_SUPORTADAS } from '../routes/taxas-moeda.js'
import { registrarExecucaoAgendamentoTaxaMoeda } from './taxas-moeda-agendamento-store.js'

const TAXAS_MOEDA_URL = process.env.TAXAS_MOEDA_URL ?? 'http://localhost:8032'

export async function executarSyncPtax(motivo: string, registrarAgendamento = true): Promise<void> {
  console.log(`[TaxasMoeda] Iniciando sync — ${motivo}`)

  for (const moeda of MOEDAS_SUPORTADAS) {
    try {
      const { data } = await axios.get(`${TAXAS_MOEDA_URL}/api/v1/internal/cotacoes-bcb`, {
        params: { moeda },
        timeout: 12000,
        headers: { 'x-chave-interna-servico': process.env.CHAVE_INTERNA_SERVICO ?? '' },
      })

      if (!data.compra || !data.venda || !data.data) {
        console.warn(`[TaxasMoeda] ${moeda}: PTAX indisponível no BCB`)
        continue
      }

      const dataCotacao = new Date(data.data + 'T00:00:00Z')
      const boletim = classificarBoletim(data.hora)

      await persistirCotacao(
        moeda,
        data.compra,
        data.venda,
        dataCotacao,
        data.hora ?? null,
        boletim,
        data.fonte ?? 'BCB/PTAX',
      )

      console.log(`[TaxasMoeda] ${moeda} ${boletim} → compra ${data.compra} / venda ${data.venda}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido'
      console.warn(`[TaxasMoeda] ${moeda}: falha no sync — ${msg}`)
    }
  }

  if (registrarAgendamento) {
    await registrarExecucaoAgendamentoTaxaMoeda('ptax')
  }

  console.log('[TaxasMoeda] Sync concluído')
}
