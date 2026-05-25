/**
 * backfill-suid-empresa.ts — popula suid_empresa_organizacao via POST /empresas
 */
import { randomUUID } from 'crypto'
import { PrismaClient } from '../../configurador/generated/index.js'
import {
  criarEmpresa,
  obterEmpresaDaOrganizacao,
} from '../../servicos-global/configurador/server/services/cadastros-client.js'

interface BackfillArgs {
  dryRun: boolean
  orgId: string | null
}

interface BackfillResult {
  total: number
  criadas: number
  reaproveitadas: number
  puladas: number
  erros: number
}

function parseArgs(): BackfillArgs {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const orgIdArg = args.find((a) => a.startsWith('--org-id='))
  const orgId = orgIdArg ? orgIdArg.split('=')[1] ?? null : null
  return { dryRun, orgId }
}

async function processarOrganizacao(
  prisma: PrismaClient,
  org: { id_organizacao: string; nome_organizacao: string; cnpj_organizacao: string | null },
  dryRun: boolean,
  result: BackfillResult,
): Promise<void> {
  const correlationId = randomUUID()
  const ctx = { id_organizacao: org.id_organizacao, correlation_id: correlationId }

  if (!org.cnpj_organizacao) {
    console.warn(`⚠️  [${correlationId}] ${org.id_organizacao} "${org.nome_organizacao}" — sem CNPJ → PULADO`)
    result.puladas += 1
    return
  }

  try {
    const existente = await obterEmpresaDaOrganizacao(ctx)
    let suid: string
    if (existente) {
      suid = existente.id_empresa
      console.log(`♻️  [${correlationId}] ${org.id_organizacao} — Empresa já existe (SUID=${suid})`)
      result.reaproveitadas += 1
    } else {
      if (dryRun) {
        console.log(`🔍 [DRY] [${correlationId}] ${org.id_organizacao} — criaria Empresa em Cadastros`)
        result.criadas += 1
        return
      }
      const nova = await criarEmpresa(
        {
          id_organizacao: org.id_organizacao,
          nome_empresa: org.nome_organizacao,
          cnpj_empresa: org.cnpj_organizacao,
          pais_empresa: 'BR',
          pode_ser_importador_empresa: true,
          ativo_empresa: true,
        },
        ctx,
      )
      suid = nova.id_empresa
      console.log(`✅ [${correlationId}] ${org.id_organizacao} — Empresa criada (SUID=${suid})`)
      result.criadas += 1
    }

    if (dryRun) return

    await prisma.organizacao.update({
      where: { id_organizacao: org.id_organizacao },
      data: { suid_empresa_organizacao: suid },
    })
    console.log(`💾 [${correlationId}] ${org.id_organizacao} — suid_empresa_organizacao gravado`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`❌ [${correlationId}] ${org.id_organizacao} — FALHOU: ${msg}`)
    result.erros += 1
  }
}

async function main(): Promise<void> {
  const { dryRun, orgId } = parseArgs()
  const dbUrl = process.env.CONFIGURADOR_DATABASE_URL
  if (!dbUrl || !process.env.CHAVE_INTERNA_SERVICO) {
    console.error('❌ CONFIGURADOR_DATABASE_URL e CHAVE_INTERNA_SERVICO são obrigatórias.')
    process.exit(1)
  }

  const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } })
  try {
    const organizacoes = await prisma.organizacao.findMany({
      where: { suid_empresa_organizacao: null, ...(orgId ? { id_organizacao: orgId } : {}) },
      select: { id_organizacao: true, nome_organizacao: true, cnpj_organizacao: true },
    })

    const result: BackfillResult = { total: organizacoes.length, criadas: 0, reaproveitadas: 0, puladas: 0, erros: 0 }
    for (const org of organizacoes) await processarOrganizacao(prisma, org, dryRun, result)

    console.log(`\nTotal: ${result.total} | Criadas: ${result.criadas} | Reaproveitadas: ${result.reaproveitadas} | Puladas: ${result.puladas} | Erros: ${result.erros}`)
    if (result.erros > 0) process.exit(2)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
