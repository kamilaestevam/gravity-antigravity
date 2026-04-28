/**
 * scripts/sob-demanda/migrate-stripe-metadata.ts
 *
 * Migra Stripe Customer/Subscription metadata legacy -> nomenclatura DDD ubíqua.
 *
 *   metadata.tenant_id    -> metadata.id_organizacao
 *   metadata.user_id      -> metadata.id_usuario
 *   metadata.company_id   -> metadata.id_workspace
 *   metadata.product_id   -> metadata.id_produto
 *
 * Para REMOVER as chaves legadas no Stripe, definimos `metadata.<chaveLegada> = null`
 * no payload do `customers.update` / `subscriptions.update`. Esse é o contrato
 * documentado da Stripe API: enviar `null` em uma chave de metadata apaga-a.
 *
 * MODOS:
 *   --dry-run (padrão)    : não escreve nada, apenas lista o que migraria
 *   --apply               : aplica as alterações em produção
 *   --limit=<N>           : limita a leitura a N páginas de 100 itens (debug)
 *
 * USO:
 *   npx tsx scripts/sob-demanda/migrate-stripe-metadata.ts --dry-run
 *   npx tsx scripts/sob-demanda/migrate-stripe-metadata.ts --apply
 *
 * PRÉ-REQUISITOS:
 *   - STRIPE_SECRET_KEY no ambiente (export no shell ou .env carregado)
 *   - Backup recomendado antes do --apply: exportar metadata atual via
 *     `stripe customers list --limit 100` para arquivo local.
 *
 * SEGURANÇA:
 *   - Script é idempotente: rodar 2x não causa estrago (após a 1ª passada,
 *     as chaves legadas já não existem, então o item entra em "skipped").
 *   - Não toca em código runtime de billing (Fase 3 do DB-2 já cuidou disso).
 *   - Em caso de erro em um item, o script loga e segue para o próximo —
 *     não aborta a corrida toda.
 */

import Stripe from 'stripe'

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_KEY) {
  console.error('[migrate-stripe-metadata] ERRO: STRIPE_SECRET_KEY não definido no ambiente.')
  console.error('  Defina no shell antes de rodar:')
  console.error('    export STRIPE_SECRET_KEY=sk_live_...   (Linux/Mac)')
  console.error('    $env:STRIPE_SECRET_KEY="sk_live_..."   (PowerShell)')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_KEY)

const args = process.argv.slice(2)
const isApply = args.includes('--apply')
const isDryRun = !isApply
const limitArg = args.find((a) => a.startsWith('--limit='))
const PAGE_LIMIT = limitArg ? Number.parseInt(limitArg.split('=')[1], 10) : Number.POSITIVE_INFINITY

const RENAME_MAP: Record<string, string> = {
  tenant_id: 'id_organizacao',
  user_id: 'id_usuario',
  company_id: 'id_workspace',
  product_id: 'id_produto',
}

const LEGACY_KEYS = Object.keys(RENAME_MAP)

interface MigrationDecision {
  hasLegacy: boolean
  /** Payload pronto pra mandar pro `customers.update` / `subscriptions.update`. */
  metadataPatch: Record<string, string | null>
  /** Lista das chaves que serão renomeadas, pra log. */
  renamedKeys: string[]
}

function decideMigration(metadata: Stripe.Metadata | null | undefined): MigrationDecision {
  const patch: Record<string, string | null> = {}
  const renamed: string[] = []

  if (!metadata) {
    return { hasLegacy: false, metadataPatch: patch, renamedKeys: renamed }
  }

  for (const legacy of LEGACY_KEYS) {
    const legacyValue = metadata[legacy]
    if (legacyValue === undefined || legacyValue === null || legacyValue === '') continue

    const newKey = RENAME_MAP[legacy]
    const existingNewValue = metadata[newKey]

    // Se a chave nova já existe e bate com o valor legado, só apagamos a legada.
    // Se ainda não existe, criamos.
    if (!existingNewValue) {
      patch[newKey] = String(legacyValue)
    }
    // Apaga a chave legada (Stripe interpreta null como "remove this metadata key").
    patch[legacy] = null
    renamed.push(legacy)
  }

  return {
    hasLegacy: renamed.length > 0,
    metadataPatch: patch,
    renamedKeys: renamed,
  }
}

interface MigrationStats {
  scanned: number
  migrated: number
  skipped: number
  errors: number
}

function emptyStats(): MigrationStats {
  return { scanned: 0, migrated: 0, skipped: 0, errors: 0 }
}

async function migrateCustomers(): Promise<MigrationStats> {
  const stats = emptyStats()
  console.log('\n=== Migrando Stripe Customers ===')

  let pages = 0
  let cursor: string | undefined
  do {
    if (pages >= PAGE_LIMIT) {
      console.log(`[customers] Limite de ${PAGE_LIMIT} páginas atingido, parando.`)
      break
    }
    pages += 1

    const params: Stripe.CustomerListParams = { limit: 100 }
    if (cursor) params.starting_after = cursor

    const page = await stripe.customers.list(params)

    for (const customer of page.data) {
      stats.scanned += 1
      const decision = decideMigration(customer.metadata)

      if (!decision.hasLegacy) {
        stats.skipped += 1
        continue
      }

      const logPrefix = isDryRun ? '[DRY-RUN]' : '[APPLY]'
      console.log(
        `${logPrefix} customer ${customer.id} (${customer.email ?? customer.name ?? '—'}) -> renomear: ${decision.renamedKeys.join(', ')}`,
      )

      if (isDryRun) {
        stats.migrated += 1
        continue
      }

      try {
        await stripe.customers.update(customer.id, { metadata: decision.metadataPatch })
        stats.migrated += 1
      } catch (err) {
        stats.errors += 1
        console.error(
          `  ERRO ao atualizar customer ${customer.id}:`,
          err instanceof Error ? err.message : String(err),
        )
      }
    }

    cursor = page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : undefined
  } while (cursor)

  return stats
}

async function migrateSubscriptions(): Promise<MigrationStats> {
  const stats = emptyStats()
  console.log('\n=== Migrando Stripe Subscriptions ===')

  let pages = 0
  let cursor: string | undefined
  do {
    if (pages >= PAGE_LIMIT) {
      console.log(`[subscriptions] Limite de ${PAGE_LIMIT} páginas atingido, parando.`)
      break
    }
    pages += 1

    const params: Stripe.SubscriptionListParams = { limit: 100, status: 'all' }
    if (cursor) params.starting_after = cursor

    const page = await stripe.subscriptions.list(params)

    for (const subscription of page.data) {
      stats.scanned += 1
      const decision = decideMigration(subscription.metadata)

      if (!decision.hasLegacy) {
        stats.skipped += 1
        continue
      }

      const logPrefix = isDryRun ? '[DRY-RUN]' : '[APPLY]'
      console.log(
        `${logPrefix} subscription ${subscription.id} (status=${subscription.status}) -> renomear: ${decision.renamedKeys.join(', ')}`,
      )

      if (isDryRun) {
        stats.migrated += 1
        continue
      }

      try {
        await stripe.subscriptions.update(subscription.id, { metadata: decision.metadataPatch })
        stats.migrated += 1
      } catch (err) {
        stats.errors += 1
        console.error(
          `  ERRO ao atualizar subscription ${subscription.id}:`,
          err instanceof Error ? err.message : String(err),
        )
      }
    }

    cursor = page.has_more && page.data.length > 0 ? page.data[page.data.length - 1].id : undefined
  } while (cursor)

  return stats
}

function printStats(label: string, stats: MigrationStats): void {
  const verb = isDryRun ? '(would migrate)' : '(migrated)'
  console.log(`\n${label}:`)
  console.log(`  scanned:  ${stats.scanned}`)
  console.log(`  migrated: ${stats.migrated} ${verb}`)
  console.log(`  skipped:  ${stats.skipped} (no legacy keys)`)
  if (stats.errors > 0) console.log(`  errors:   ${stats.errors}`)
}

async function main(): Promise<void> {
  const mode = isDryRun ? 'DRY RUN (sem escritas)' : 'APPLY (escritas reais no Stripe)'
  console.log(`Mode: ${mode}`)
  // STRIPE_KEY já foi validado no topo do módulo (process.exit(1) se ausente).
  console.log(`Stripe key prefix: ${(STRIPE_KEY ?? '').slice(0, 7)}...`)

  const customerStats = await migrateCustomers()
  const subscriptionStats = await migrateSubscriptions()

  printStats('Customers', customerStats)
  printStats('Subscriptions', subscriptionStats)

  const totalErrors = customerStats.errors + subscriptionStats.errors
  console.log('\nDone.')

  if (totalErrors > 0) {
    console.error(`\n${totalErrors} erro(s) durante a execução. Veja os logs acima.`)
    process.exit(2)
  }
  if (isDryRun) {
    console.log('\nNenhuma alteração foi feita. Para aplicar, rode novamente com --apply.')
  }
}

main().catch((err) => {
  console.error('\n[migrate-stripe-metadata] FALHA INESPERADA:', err)
  process.exit(1)
})
