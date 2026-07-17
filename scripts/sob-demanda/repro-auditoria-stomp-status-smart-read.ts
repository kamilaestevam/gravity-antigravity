/**
 * repro-auditoria-stomp-status-smart-read.ts — evidência da auditoria 16/07.
 * Simula o GET /leituras/:id em produção (pós-#802): legado devolve COMPLETED,
 * progresso placeholder (criado pelo vínculo no POST) é mesclado sem guarda.
 * Uso: npx tsx scripts/sob-demanda/repro-auditoria-stomp-status-smart-read.ts
 */
import { mesclarLeituraComConferenciaGravity } from '../../servicos-global/produto/smart-read/server/src/lib/mesclar-leitura-conferencia-gravity-smart-read.js'
import type { Leitura } from '../../servicos-global/produto/smart-read/server/src/schemas/leitura-smart-read.js'

// O que o DATI devolve quando o OCR TERMINOU (~10s depois do upload)
const leituraLegadoCompleta: Leitura = {
  id_leitura: 'leitura-teste-123',
  nome_leitura: 'INVOICE77',
  status_leitura: 'COMPLETED',
  total_arquivos: 1,
  arquivos_processados: 1,
  arquivos: [
    {
      id_arquivo: 'file-1',
      nome_arquivo: 'INVOICE77.pdf',
      status_arquivo: 'COMPLETED',
      resultado_extracao: [
        { tipo_documento: 'INVOICE', dados: { numero_documento: 'PHI0021643' } },
      ],
    },
  ],
}

// O que registrarVinculoLeituraUsuarioSmartRead grava no POST /leituras
// (placeholder de vínculo — existe para TODA leitura nova desde 01/07)
const progressoPlaceholder: Leitura = {
  id_leitura: 'leitura-teste-123',
  nome_leitura: null,
  status_leitura: 'PROCESSING',
  total_arquivos: 0,
  arquivos_processados: 0,
  arquivos: [],
}

// Produção pós-#802: merge do progresso roda SEM a guarda leituraSemExtracaoUtil
const resultado = mesclarLeituraComConferenciaGravity(leituraLegadoCompleta, progressoPlaceholder)

console.log('status legado (real):    ', leituraLegadoCompleta.status_leitura)
console.log('status após merge (API): ', resultado.status_leitura)
console.log('extração preservada:     ', resultado.arquivos[0]?.resultado_extracao?.length ?? 0, 'documento(s)')

if (resultado.status_leitura !== 'COMPLETED') {
  console.error('\n>>> BUG CONFIRMADO: o placeholder de progresso rebaixa COMPLETED para', resultado.status_leitura)
  console.error('>>> O polling do wizard nunca vê COMPLETED — cliente fica em "Analisando..." até o timeout.')
  process.exit(1)
}
console.log('\nOK — sem regressão.')
