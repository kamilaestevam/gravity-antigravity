#!/usr/bin/env npx tsx
/**
 * scripts/sob-demanda/seed-demo.ts
 * Seed rápido: cria produtos + tenant demo + ativa SimulaCusto.
 * Requer que o servidor Configurador esteja rodando na porta 8005.
 *
 * Uso:
 *   npx tsx scripts/sob-demanda/seed-demo.ts
 *   npx tsx scripts/sob-demanda/seed-demo.ts --port 3000
 */

const PORT = process.argv.includes('--port')
  ? process.argv[process.argv.indexOf('--port') + 1]
  : '8005'

const BASE = `http://localhost:${PORT}`
const INTERNAL_KEY = process.env.INTERNAL_SERVICE_KEY ?? 'gravity-dev-internal-key-2026'

const HEADERS = {
  'Content-Type': 'application/json',
  'x-internal-key': INTERNAL_KEY,
}

async function main() {
  console.log(`\n🚀 Seed Demo — Configurador em ${BASE}\n`)

  // 1. Health check
  try {
    const health = await fetch(`${BASE}/health`)
    if (!health.ok) throw new Error(`Status ${health.status}`)
    console.log('✓ Servidor respondendo')
  } catch {
    console.error('✗ Servidor não está rodando. Inicie com: cd servicos-global/configurador && npm run dev')
    process.exit(1)
  }

  // 2. Seed produtos
  console.log('\n── Seed do Catálogo ──')
  try {
    const res = await fetch(`${BASE}/api/v1/admin/produtos-gravity/seed`, {
      method: 'POST',
      headers: HEADERS,
    })
    const data = await res.json()
    if (data.seeded) {
      console.log(`✓ ${data.count} produtos criados: SimulaCusto, Smart Read, BID Frete`)
    } else {
      console.log(`⚠ Produtos já existem (${data.count} no catálogo)`)
    }
  } catch (err) {
    console.error('✗ Erro no seed:', err)
  }

  // 3. Listar produtos (verificação)
  try {
    const res = await fetch(`${BASE}/api/v1/catalogo/produtos-gravity`)
    const { products } = await res.json()
    console.log(`\n── Catálogo Público (${products.length} produtos) ──`)
    for (const p of products) {
      console.log(`  • ${p.name} (${p.slug}) — ${p.status} — ${p.unit_currency} ${p.unit_price}/${p.billing_type}`)
    }
  } catch {
    console.log('⚠ Não foi possível listar o catálogo público')
  }

  // 4. Criar tenant demo
  console.log('\n── Tenant Demo ──')
  let tenantId: string | null = null
  try {
    const res = await fetch(`${BASE}/api/v1/organizacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Demo Corp',
        slug: 'demo-corp',
        clerkUserId: 'user_demo_setup',
        ownerEmail: 'admin@demo.com',
        ownerName: 'Admin Demo',
      }),
    })

    if (res.ok) {
      const { tenant } = await res.json()
      tenantId = tenant.id
      console.log(`✓ Tenant criado: "${tenant.name}" (${tenant.id})`)
    } else if (res.status === 409) {
      console.log('⚠ Tenant "demo-corp" já existe')
      // Buscar o existente
      const listRes = await fetch(`${BASE}/api/v1/admin/organizacoes?search=demo-corp`, { headers: HEADERS })
      if (listRes.ok) {
        const { tenants } = await listRes.json()
        if (tenants.length > 0) {
          tenantId = tenants[0].id
          console.log(`  Usando existente: ${tenantId}`)
        }
      }
    } else {
      console.log(`✗ Erro ${res.status}: ${await res.text()}`)
    }
  } catch (err) {
    console.error('✗ Erro ao criar tenant:', err)
  }

  // 5. Ativar produtos para o tenant
  if (tenantId) {
    console.log('\n── Ativação de Produtos ──')

    const productsToActivate = ['simula-custo', 'bid-frete', 'smart-read']
    for (const productKey of productsToActivate) {
      try {
        const res = await fetch(
          `${BASE}/api/v1/admin/organizacoes/${tenantId}/produtos/${productKey}/ativar`,
          { method: 'POST', headers: HEADERS, body: '{}' }
        )
        if (res.ok) {
          console.log(`✓ ${productKey} ativado para Demo Corp`)
        } else {
          console.log(`⚠ ${productKey}: ${res.status}`)
        }
      } catch {
        console.log(`✗ Erro ao ativar ${productKey}`)
      }
    }

    // 6. Verificar
    console.log('\n── Verificação ──')
    try {
      const res = await fetch(
        `${BASE}/api/v1/internal/organizacao-produtos?tenantId=${tenantId}`,
        { headers: HEADERS }
      )
      const data = await res.json()
      console.log(`Produtos do tenant ${data.tenant_id}:`)
      for (const p of data.products) {
        const status = p.is_active ? '🟢 Ativo' : '🔴 Inativo'
        console.log(`  ${status} ${p.product_key}`)
      }
    } catch {
      console.log('⚠ Não foi possível verificar produtos do tenant')
    }
  }

  console.log('\n✅ Seed concluído!\n')
  console.log('Próximo passo: configure Clerk e acesse http://localhost:5000')
  console.log('O sidebar vai mostrar apenas os produtos ativados para o tenant do usuário.\n')
}

main().catch(console.error)
