/**
 * backfill-suid-empresa.ts — Fase 3 do PASSO 06 DDD
 *
 * Para Organizacoes existentes com `suid_empresa = NULL`, cria a Empresa
 * correspondente no serviço Cadastros e popula o SUID no Configurador.
 *
 * ESCOPO ESTRITO (decisão da Fase 3):
 *   - Apenas Organizacoes do banco do Configurador com suid_empresa IS NULL
 *   - NÃO toca linhas órfãs do banco monolítico legado
 *
 * IDEMPOTÊNCIA:
 *   - Se a Empresa já existe em Cadastros para a Organizacao (tentativa anterior
 *     bem-sucedida no lado Cadastros mas com falha no UPDATE local), o script
 *     reaproveita o SUID em vez de duplicar.
 *
 * MODOS:
 *   - --dry-run       : só lista o que faria, sem gravar nada
 *   - --org-id=<cuid> : processa apenas 1 Organizacao (validação piloto)
 *   - (sem flags)     : processa todas as Organizacoes pendentes
 *
 * USO:
 *   cd servicos-global/configurador && npx tsx ../../scripts/sob-demanda/backfill-suid-empresa.ts --dry-run
 *   cd servicos-global/configurador && npx tsx ../../scripts/sob-demanda/backfill-suid-empresa.ts --org-id=<cuid>
 *   cd servicos-global/configurador && npx tsx ../../scripts/sob-demanda/backfill-suid-empresa.ts
 *
 * PRÉ-REQUISITOS:
 *   - Serviço Cadastros rodando (CADASTROS_SERVICE_URL alcançável)
 *   - INTERNAL_SERVICE_KEY configurada
 *   - Configurador apontando para o banco correto (CONFIGURADOR_DATABASE_URL)
 *
 * Observação: CNPJ vem do próprio Organizacao (coluna `cnpj` legada) quando
 * existe. Para orgs sem CNPJ e país=BR, o script loga WARN e pula — não
 * adivinha dados ausentes.
 */

import { randomUUID } from 'crypto'
import { PrismaClient } from '../../configurador/generated/index.js'
import {
  criarEmpresa,
  listarEmpresasPorOrganizacao,
} from '../../servicos-global/configurador/server/services/cadastrosClient.js'

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
  org: { id: string; name: string; cnpj: string | null },
  dryRun: boolean,
  result: BackfillResult,
): Promise<void> {
  const correlationId = randomUUID()
  const ctx = { id_organizacao: org.id, correlation_id: correlationId }

  // Sem CNPJ: assume país = BR no legado. Sem CNPJ + BR = regra de Cadastros bloqueia.
  // Aqui não adivinhamos — pulamos e alertamos.
  if (!org.cnpj) {
    console.warn(
      `⚠️  [${correlationId}] ${org.id} "${org.name}" — sem CNPJ, país=BR presumido → PULADO. Preencha o CNPJ antes de rodar o backfill para esta org.`,
    )
    result.puladas += 1
    return
  }

  try {
    // 1. Verifica se Empresa já existe (idempotência)
    const existentes = await listarEmpresasPorOrganizacao(ctx)
    const matchCnpj = existentes.find((e) => e.cnpj === org.cnpj)

    let suid: string
    if (matchCnpj) {
      suid = matchCnpj.suid
      console.log(
        `♻️  [${correlationId}] ${org.id} "${org.name}" — Empresa já existe em Cadastros (SUID=${suid}) → reaproveitando`,
      )
      result.reaproveitadas += 1
    } else {
      if (dryRun) {
        console.log(
          `🔍 [DRY] [${correlationId}] ${org.id} "${org.name}" — criaria Empresa em Cadastros (cnpj=${org.cnpj})`,
        )
        result.criadas += 1
        return
      }
      const nova = await criarEmpresa(
        {
          id_organizacao: org.id,
          nome_empresa: org.name,
          cnpj: org.cnpj,
          pais: 'BR',
          pode_ser_importador: true,
          pode_ser_exportador: false,
          pode_ser_fabricante: false,
          pode_ser_agente: false,
          pode_ser_despachante: false,
          pode_ser_armador: false,
          ativo: true,
        },
        ctx,
      )
      suid = nova.suid
      console.log(
        `✅ [${correlationId}] ${org.id} "${org.name}" — Empresa criada em Cadastros (SUID=${suid})`,
      )
      result.criadas += 1
    }

    // 2. Persiste SUID no Configurador
    if (dryRun) {
      console.log(
        `🔍 [DRY] [${correlationId}] ${org.id} — atualizaria Organizacao.suid_empresa=${suid}`,
      )
      return
    }

    await prisma.organizacao.update({
      where: { id: org.id },
      data: { suid_empresa: suid },
    })
    console.log(
      `💾 [${correlationId}] ${org.id} — Organizacao.suid_empresa gravado`,
    )
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(
      `❌ [${correlationId}] ${org.id} "${org.name}" — FALHOU: ${msg}`,
    )
    result.erros += 1
  }
}

async function main(): Promise<void> {
  const { dryRun, orgId } = parseArgs()

  const dbUrl = process.env.CONFIGURADOR_DATABASE_URL
  if (!dbUrl) {
    console.error('❌ CONFIGURADOR_DATABASE_URL não definida.')
    process.exit(1)
  }
  if (!process.env.CADASTROS_SERVICE_URL) {
    console.warn('⚠️  CADASTROS_SERVICE_URL não definida — usando default http://localhost:8030')
  }
  if (!process.env.INTERNAL_SERVICE_KEY) {
    console.error('❌ INTERNAL_SERVICE_KEY não definida — Cadastros rejeitará todas as chamadas.')
    process.exit(1)
  }

  console.log('\n🔄  backfill-suid-empresa — Fase 3')
  console.log(`   Modo:       ${dryRun ? 'DRY-RUN (sem gravar)' : 'EXECUÇÃO REAL'}`)
  console.log(`   Filtro:     ${orgId ? `apenas org ${orgId}` : 'todas as pendentes'}`)
  console.log(`   Banco:      ${dbUrl.split('@')[1]?.split('/')[0] ?? dbUrl}`)
  console.log(`   Cadastros:  ${process.env.CADASTROS_SERVICE_URL ?? 'http://localhost:8030'}`)
  console.log()

  const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } },
    log: [],
  })

  try {
    const organizacoes = await prisma.organizacao.findMany({
      where: {
        suid_empresa: null,
        ...(orgId ? { id: orgId } : {}),
      },
      select: { id: true, name: true, cnpj: true },
      orderBy: { created_at: 'asc' },
    })

    if (organizacoes.length === 0) {
      console.log('✅ Nenhuma Organizacao pendente de backfill.')
      return
    }

    console.log(`📋 ${organizacoes.length} Organizacao(oes) a processar`)
    console.log()

    const result: BackfillResult = {
      total: organizacoes.length,
      criadas: 0,
      reaproveitadas: 0,
      puladas: 0,
      erros: 0,
    }

    // Sequencial (evita sobrecarregar Cadastros)
    for (const org of organizacoes) {
      await processarOrganizacao(prisma, org, dryRun, result)
    }

    console.log()
    console.log('───────────── RESUMO ─────────────')
    console.log(`  Total:         ${result.total}`)
    console.log(`  Criadas:       ${result.criadas}`)
    console.log(`  Reaproveitadas:${result.reaproveitadas}`)
    console.log(`  Puladas:       ${result.puladas}`)
    console.log(`  Erros:         ${result.erros}`)
    console.log('──────────────────────────────────')

    if (result.erros > 0) {
      process.exit(2)
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
