/**
 * Diagnóstico: usuário FORNECEDOR vs espelho BID + org enviada pelo shell.
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/configurador/.env') })

const email = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim() ?? 'dmmltda+testefornecedor77@gmail.com'

async function main() {
  const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
  const { listarVinculosFornecedorPorUsuario } = await import(
    '../../servicos-global/configurador/server/services/cadastros-client.js'
  )

  const u = await prisma.usuario.findFirst({
    where: { email_usuario: email },
    select: {
      id_usuario: true,
      id_organizacao: true,
      id_clerk_usuario: true,
      tipo_usuario: true,
      status_usuario: true,
      email_usuario: true,
    },
  })
  if (!u) {
    console.log('Usuario nao encontrado:', email)
    return
  }

  const org = await prisma.organizacao.findFirst({
    where: { id_organizacao: u.id_organizacao },
    select: { id_organizacao: true, nome_organizacao: true },
  })

  console.log('\n=== CONFIGURADOR ===')
  console.log(JSON.stringify({ usuario: u, org }, null, 2))

  const ctx = { id_organizacao: u.id_organizacao, correlation_id: crypto.randomUUID() }
  try {
    const vinculos = await listarVinculosFornecedorPorUsuario(u.id_usuario, ctx)
    console.log('\n=== CADASTROS VINCULOS ===')
    console.log(JSON.stringify(vinculos, null, 2))
  } catch (err) {
    console.error('Cadastros indisponivel:', err instanceof Error ? err.message : err)
  }

  const baseUrl = process.env.BID_FRETE_INTERNATIONAL_SERVICE_URL ?? 'http://127.0.0.1:8023'
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'

  for (const orgId of [u.id_organizacao]) {
    const res = await fetch(
      `${baseUrl}/api/v1/bid-frete-internacional/fornecedores?limit=5`,
      {
        headers: {
          'x-internal-key': chave,
          'x-chave-interna-servico': chave,
          'x-id-organizacao': orgId,
          'x-id-usuario': u.id_usuario,
        },
      },
    )
    const body = await res.text()
    console.log(`\n=== BID fornecedores org=${orgId} status=${res.status} ===`)
    console.log(body.slice(0, 800))
  }

  const cenarios = [
    { label: 'org+usuario corretos', org: u.id_organizacao, uid: u.id_usuario },
    { label: 'org_dev_default', org: 'org_dev_default', uid: u.id_usuario },
    { label: 'user_dev_default', org: u.id_organizacao, uid: 'user_dev_default' },
    { label: 'clerk pending como usuario', org: u.id_organizacao, uid: u.id_clerk_usuario ?? '' },
  ]

  for (const c of cenarios) {
    if (!c.uid) continue
    const resPendentes = await fetch(
      `${baseUrl}/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes`,
      {
        headers: {
          'x-internal-key': chave,
          'x-chave-interna-servico': chave,
          'x-id-organizacao': c.org,
          'x-id-usuario': c.uid,
        },
      },
    )
    const bodyPendentes = await resPendentes.text()
    console.log(`\n=== cotacoes-pendentes [${c.label}] status=${resPendentes.status} ===`)
    console.log(bodyPendentes.slice(0, 400))
  }

  const resViaConfig = await fetch(
    'http://127.0.0.1:8000/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes',
    {
      headers: {
        'x-internal-key': chave,
        'x-id-organizacao': u.id_organizacao,
        'x-id-usuario': u.id_usuario,
      },
    },
  )
  const bodyViaConfig = await resViaConfig.text()
  console.log(`\n=== via configurador :8000 status=${resViaConfig.status} ===`)
  console.log(bodyViaConfig.slice(0, 400))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
    await prisma.$disconnect()
  })
