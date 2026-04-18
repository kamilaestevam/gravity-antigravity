// scripts/migration/01-provision-schemas.ts
// ADR-003 — Fase 1: Provisionamento de schemas por tenant no banco de produto
//
// O que faz:
//   1. Conecta no banco do Configurador (fonte de verdade global de identidade)
//   2. Lista todos os tenants com status ACTIVE
//   3. Para cada tenant, executa CREATE SCHEMA IF NOT EXISTS "tenant_<id>"
//      no banco de produto informado via DATABASE_URL
//
// Uso:
//   CONFIGURADOR_DATABASE_URL=<url> DATABASE_URL=<url_banco_produto> \
//     npx tsx scripts/migration/01-provision-schemas.ts
//
// Segurança:
//   - CREATE SCHEMA IF NOT EXISTS é idempotente — seguro re-executar
//   - Não cria tabelas: apenas os containers físicos dos tenants.
//     A aplicação das migrations em cada schema é responsabilidade
//     de scripts/migrate-all-tenants.ts (próxima fase do ADR-003).
//
// Saída esperada em sucesso:
//   📋 Tenants ativos: 5
//     ✅ tenant_clf89abc...  (Empresa Alpha)
//     ✅ tenant_clf89def...  (Empresa Beta)
//   📊 Resultado: 5 criados, 0 erros

import { Client } from 'pg'

interface Tenant {
  id: string
  name: string
}

const CONFIGURADOR_URL = process.env.CONFIGURADOR_DATABASE_URL
const PRODUTO_URL = process.env.DATABASE_URL

if (!CONFIGURADOR_URL) {
  console.error('❌  CONFIGURADOR_DATABASE_URL não definida. Abortando.')
  process.exit(1)
}

if (!PRODUTO_URL) {
  console.error('❌  DATABASE_URL (banco do produto) não definida. Abortando.')
  process.exit(1)
}

// CUID v1: começa com 'c', 25 chars lowercase alphanumeric.
const CUID_REGEX = /^c[a-z0-9]{24}$/

// Retorna true se o ID é um CUID válido gerado pelo Prisma.
// IDs manuais legados (ex: "tenant-dev-001") são ignorados com aviso.
function isValidCuid(id: string): boolean {
  return CUID_REGEX.test(id)
}

function toSchemaName(tenantId: string): string {
  return `tenant_${tenantId}`
}

async function provisionSchemas(): Promise<void> {
  const cfgClient = new Client({ connectionString: CONFIGURADOR_URL })
  const produtoClient = new Client({ connectionString: PRODUTO_URL })

  console.log('\n🔌 Conectando aos bancos...')
  await Promise.all([cfgClient.connect(), produtoClient.connect()])
  console.log('   ✓ Configurador:', CONFIGURADOR_URL!.split('@')[1]?.split('/')[0])
  console.log('   ✓ Produto:     ', PRODUTO_URL!.split('@')[1]?.split('/')[0])

  // 1. Buscar tenants ativos no Configurador
  const { rows: tenants } = await cfgClient.query<Tenant>(
    `SELECT id, name FROM "Tenant" WHERE status = 'ACTIVE' ORDER BY created_at ASC`
  )

  console.log(`\n📋 Tenants ativos encontrados: ${tenants.length}`)

  if (tenants.length === 0) {
    console.warn('⚠️   Nenhum tenant ativo — nada a provisionar.')
    await Promise.all([cfgClient.end(), produtoClient.end()])
    return
  }

  // 2. Criar schema físico para cada tenant no banco do produto
  let criados = 0
  let erros = 0

  let ignorados = 0

  for (const tenant of tenants) {
    // Ignora IDs manuais/legados que não seguem o padrão CUID do Prisma
    if (!isValidCuid(tenant.id)) {
      console.warn(`  ⚠️   IGNORADO  id="${tenant.id}"  (${tenant.name}) — não é CUID válido (dado legado de seed)`)
      ignorados++
      continue
    }

    const schemaName = toSchemaName(tenant.id)
    try {
      await produtoClient.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
      console.log(`  ✅  ${schemaName}  (${tenant.name})`)
      criados++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`  ❌  ${schemaName}  (${tenant.name}) — ${msg}`)
      erros++
    }
  }

  console.log(`\n📊 Resultado: ${criados} criado(s), ${ignorados} ignorado(s), ${erros} erro(s)`)

  await Promise.all([cfgClient.end(), produtoClient.end()])

  if (erros > 0) {
    console.error('\n🚨 Finalizado com erros — verifique os schemas acima antes de prosseguir.')
    process.exit(1)
  }

  console.log('\n✅  Provisionamento concluído. Próximo passo: migrate-all-tenants.ts')
}

provisionSchemas().catch((err) => {
  console.error('❌  Erro fatal:', err instanceof Error ? err.message : err)
  process.exit(1)
})
