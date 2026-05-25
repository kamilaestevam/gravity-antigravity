/**
 * backfill-empresa-tabela-cadastros.ts
 *
 * Copia espelhos legados de `fornecedor` → tabela `empresa` (Cadastros §4.1).
 * NÃO altera nem remove registros em `fornecedor` (parceiros permanecem intactos).
 *
 * Para cada Organizacao no Configurador com `suid_empresa_organizacao`:
 *   1. Se já existe linha em `empresa` para `id_organizacao` → pula (idempotente)
 *   2. Se existe `fornecedor` com id = suid → copia campos para `empresa`
 *   3. Se não existe fornecedor espelho → log WARN (requer criação manual ou novo onboarding)
 *
 * USO:
 *   cd servicos-global/cadastros
 *   npx tsx ../../scripts/sob-demanda/backfill-empresa-tabela-cadastros.ts --dry-run
 *   npx tsx ../../scripts/sob-demanda/backfill-empresa-tabela-cadastros.ts --org-id=<cuid>
 *
 * PRÉ-REQUISITOS:
 *   - Migration `20260528140000_add_empresa_table_cadastros` aplicada
 *   - CADASTROS_DATABASE_URL e CONFIGURADOR_DATABASE_URL configuradas
 *   - CHAVE_INTERNA_SERVICO (opcional — script usa Prisma direto)
 */

import { PrismaClient as PrismaCadastros } from '../../servicos-global/cadastros/generated/index.js'
import { PrismaClient as PrismaConfigurador } from '../../configurador/generated/index.js'

interface Args {
  dryRun: boolean
  orgId: string | null
}

interface Resumo {
  total: number
  criadas: number
  jaExistiam: number
  semEspelho: number
  erros: number
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  return {
    dryRun: args.includes('--dry-run'),
    orgId: args.find((a) => a.startsWith('--org-id='))?.split('=')[1] ?? null,
  }
}

async function main(): Promise<void> {
  const { dryRun, orgId } = parseArgs()

  const cadastrosUrl = process.env.CADASTROS_DATABASE_URL
  const configuradorUrl = process.env.CONFIGURADOR_DATABASE_URL
  if (!cadastrosUrl || !configuradorUrl) {
    console.error('❌ CADASTROS_DATABASE_URL e CONFIGURADOR_DATABASE_URL são obrigatórias.')
    process.exit(1)
  }

  console.log('\n🔄 backfill-empresa-tabela-cadastros')
  console.log(`   Modo: ${dryRun ? 'DRY-RUN' : 'EXECUÇÃO REAL'}`)
  console.log(`   Filtro org: ${orgId ?? 'todas com suid'}`)
  console.log()

  const prismaCad = new PrismaCadastros({ datasources: { db: { url: cadastrosUrl } } })
  const prismaConf = new PrismaConfigurador({ datasources: { db: { url: configuradorUrl } } })

  const resumo: Resumo = {
    total: 0,
    criadas: 0,
    jaExistiam: 0,
    semEspelho: 0,
    erros: 0,
  }

  try {
    const orgs = await prismaConf.organizacao.findMany({
      where: {
        suid_empresa_organizacao: { not: null },
        ...(orgId ? { id_organizacao: orgId } : {}),
      },
      select: {
        id_organizacao: true,
        nome_organizacao: true,
        suid_empresa_organizacao: true,
      },
    })

    resumo.total = orgs.length
    if (orgs.length === 0) {
      console.log('✅ Nenhuma organização com suid_empresa_organizacao.')
      return
    }

    for (const org of orgs) {
      const suid = org.suid_empresa_organizacao!
      try {
        const existente = await prismaCad.empresa.findUnique({
          where: { id_organizacao_empresa: org.id_organizacao },
        })
        if (existente) {
          console.log(`♻️  ${org.id_organizacao} "${org.nome_organizacao}" — empresa já existe (${existente.id_empresa})`)
          resumo.jaExistiam += 1
          continue
        }

        const espelho = await prismaCad.fornecedor.findFirst({
          where: {
            id_fornecedor: suid,
            id_organizacao_cadastro_fornecedor: org.id_organizacao,
          },
        })

        if (!espelho) {
          console.warn(
            `⚠️  ${org.id_organizacao} "${org.nome_organizacao}" — suid=${suid} sem fornecedor espelho → PULADO`,
          )
          resumo.semEspelho += 1
          continue
        }

        if (dryRun) {
          console.log(
            `🔍 [DRY] ${org.id_organizacao} "${org.nome_organizacao}" — criaria empresa id=${suid} a partir de fornecedor espelho`,
          )
          resumo.criadas += 1
          continue
        }

        await prismaCad.empresa.create({
          data: {
            id_empresa: suid,
            id_organizacao_empresa: org.id_organizacao,
            nome_empresa: espelho.nome_fornecedor,
            cnpj_empresa: espelho.cnpj_fornecedor,
            tin_empresa: espelho.tin_fornecedor,
            pais_empresa: espelho.pais_fornecedor,
            estado_provincia_empresa: espelho.estado_provincia_fornecedor,
            cidade_empresa: espelho.cidade_fornecedor,
            endereco_empresa: espelho.endereco_fornecedor,
            cep_zipcode_empresa: espelho.cep_zipcode_fornecedor,
            email_principal_empresa: espelho.email_principal_fornecedor,
            telefone_principal_empresa: espelho.telefone_principal_fornecedor,
            whatsapp_principal_empresa: espelho.whatsapp_principal_fornecedor,
            pode_ser_importador_empresa: espelho.pode_ser_importador_fornecedor,
            pode_ser_exportador_empresa: espelho.pode_ser_exportador_fornecedor,
            pode_ser_fabricante_empresa: espelho.pode_ser_fabricante_fornecedor,
            pode_ser_agente_empresa: espelho.pode_ser_agente_fornecedor,
            pode_ser_despachante_empresa: espelho.pode_ser_despachante_fornecedor,
            pode_ser_armador_empresa: espelho.pode_ser_armador_fornecedor,
            pode_ser_cia_aerea_empresa: espelho.pode_ser_cia_aerea_fornecedor,
            pode_ser_transportadora_rodoviaria_nacional_empresa:
              espelho.pode_ser_transportadora_rodoviaria_nacional_fornecedor,
            pode_ser_transportadora_rodoviaria_internacional_empresa:
              espelho.pode_ser_transportadora_rodoviaria_internacional_fornecedor,
            pode_ser_armazem_alfandegado_empresa: espelho.pode_ser_armazem_alfandegado_fornecedor,
            pode_ser_armazem_nacional_empresa: espelho.pode_ser_armazem_nacional_fornecedor,
            pode_ser_banco_empresa: espelho.pode_ser_banco_fornecedor,
            pode_ser_seguradora_internacional_empresa: espelho.pode_ser_seguradora_internacional_fornecedor,
            pode_ser_seguradora_corretora_cambio_empresa:
              espelho.pode_ser_seguradora_corretora_cambio_fornecedor,
            ativo_empresa: espelho.ativo_fornecedor,
            criado_em_empresa: espelho.criado_em_fornecedor,
            atualizado_em_empresa: espelho.atualizado_em_fornecedor,
          },
        })

        console.log(`✅ ${org.id_organizacao} "${org.nome_organizacao}" — empresa criada (${suid})`)
        resumo.criadas += 1
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        console.error(`❌ ${org.id_organizacao} — FALHOU: ${msg}`)
        resumo.erros += 1
      }
    }

    console.log('\n──────── RESUMO ────────')
    console.log(`  Total orgs:     ${resumo.total}`)
    console.log(`  Criadas:        ${resumo.criadas}`)
    console.log(`  Já existiam:    ${resumo.jaExistiam}`)
    console.log(`  Sem espelho:    ${resumo.semEspelho}`)
    console.log(`  Erros:          ${resumo.erros}`)
    console.log('────────────────────────')

    if (resumo.erros > 0) process.exit(2)
  } finally {
    await prismaCad.$disconnect()
    await prismaConf.$disconnect()
  }
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err)
  process.exit(1)
})
