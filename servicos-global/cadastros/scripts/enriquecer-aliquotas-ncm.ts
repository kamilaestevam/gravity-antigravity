/**
 * enriquecer-aliquotas-ncm.ts — Popula II/IPI/PIS/COFINS na ncm_sync via TTCE.
 *
 * Pré-requisito: certificado digital Siscomex ativo (tabela certificado_digital_siscomex)
 * e CERTIFICADO_ENCRYPTION_KEY configurada.
 *
 * Percorre todos os NCMs ativos sem alíquota e consulta o TTCE em lotes,
 * respeitando o rate limit do connector (50ms/request). ~10.5k NCMs ≈ 30-60min.
 *
 * Uso (a partir de servicos-global/cadastros):
 *   npx tsx --env-file ../../.env.local --env-file .env scripts/enriquecer-aliquotas-ncm.ts
 *   npx tsx ... scripts/enriquecer-aliquotas-ncm.ts --limite 100   (teste com poucos)
 */
import { PrismaClient } from '../generated/index.js'
import { buscarAliquotasEmLote } from '../server/src/connectors/portalUnicoNcm.js'

const prisma = new PrismaClient()
const TAMANHO_LOTE = 500

function lerLimite(): number | null {
  const idx = process.argv.indexOf('--limite')
  if (idx === -1) return null
  const n = Number(process.argv[idx + 1])
  return Number.isFinite(n) && n > 0 ? n : null
}

async function main() {
  const limite = lerLimite()

  const cert = await prisma.certificadoDigitalSiscomex.findFirst({
    where: { ativo_certificado_digital_siscomex: true },
    select: { nome_certificado_digital_siscomex: true, validade_fim_certificado_digital_siscomex: true },
  })
  if (!cert) {
    console.error('ERRO: nenhum certificado digital Siscomex ativo. Envie o e-CNPJ pelo Admin do Configurador primeiro.')
    process.exit(1)
  }
  console.log(`Certificado ativo: ${cert.nome_certificado_digital_siscomex} (válido até ${cert.validade_fim_certificado_digital_siscomex.toISOString().slice(0, 10)})`)

  const pendentes = await prisma.ncmSync.findMany({
    where: { ativo_ncm_sync: true, ii_ncm_sync: null },
    select: { codigo_ncm_sync: true },
    orderBy: { codigo_ncm_sync: 'asc' },
    ...(limite ? { take: limite } : {}),
  })
  console.log(`NCMs sem alíquota: ${pendentes.length}${limite ? ` (limitado a ${limite})` : ''}`)
  if (pendentes.length === 0) return

  const inicio = Date.now()
  let atualizados = 0
  let semResposta = 0

  for (let i = 0; i < pendentes.length; i += TAMANHO_LOTE) {
    const lote = pendentes.slice(i, i + TAMANHO_LOTE).map(p => p.codigo_ncm_sync)
    const aliquotas = await buscarAliquotasEmLote(lote)

    for (const codigo of lote) {
      const vals = aliquotas.get(codigo)
      if (!vals || (vals.ii == null && vals.ipi == null)) {
        semResposta++
        continue
      }
      await prisma.ncmSync.update({
        where: { codigo_ncm_sync: codigo },
        data: {
          ii_ncm_sync:     vals.ii,
          ipi_ncm_sync:    vals.ipi,
          pis_ncm_sync:    vals.pis,
          cofins_ncm_sync: vals.cofins,
        },
      }).catch(() => { semResposta++ })
      atualizados++
    }

    const pct = Math.round(((i + lote.length) / pendentes.length) * 100)
    const minutos = ((Date.now() - inicio) / 60000).toFixed(1)
    console.log(`[${pct}%] ${i + lote.length}/${pendentes.length} processados — ${atualizados} atualizados, ${semResposta} sem resposta TTCE (${minutos}min)`)
  }

  console.log(`\nConcluído: ${atualizados} NCMs atualizados, ${semResposta} sem resposta do TTCE.`)
  await prisma.$disconnect()
}

main().catch(err => {
  console.error('Falha no enriquecimento:', err instanceof Error ? err.message : err)
  process.exit(1)
})
