/**
 * Provisiona Cadastros + BID para FORNECEDOR sem vínculo (reparo manual).
 *
 * Uso:
 *   npx tsx scripts/ativamente/provisionar-fornecedor-completo.ts --email=dmmltda+testefornecedor77@gmail.com --id-fornecedor=BR-ABC-00001
 */
import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '../..')
config({ path: resolve(ROOT, '.env.local') })
config({ path: resolve(ROOT, 'servicos-global/configurador/.env') })

const email = process.argv.find((a) => a.startsWith('--email='))?.split('=')[1]?.trim()
const idFornecedor = process.argv.find((a) => a.startsWith('--id-fornecedor='))?.split('=')[1]?.trim()

async function main() {
  if (!email) {
    console.error('Informe --email=')
    process.exit(1)
  }

  const { prisma } = await import('../../servicos-global/configurador/server/lib/prisma.js')
  const {
    provisionarPrestadorFornecedor,
    sincronizarUsuarioBidFreteFornecedor,
    exigirVinculosCadastrosFornecedorAtivos,
  } = await import('../../servicos-global/configurador/server/services/prestador-fornecedor-vinculo-service.js')
  const { listarVinculosFornecedorPorUsuario } = await import(
    '../../servicos-global/configurador/server/services/cadastros-client.js'
  )

  const u = await prisma.usuario.findFirst({
    where: { email_usuario: email },
    select: {
      id_usuario: true,
      email_usuario: true,
      nome_usuario: true,
      id_organizacao: true,
      id_clerk_usuario: true,
      tipo_usuario: true,
      status_usuario: true,
    },
  })

  if (!u) {
    console.error('Usuário não encontrado:', email)
    process.exit(1)
  }
  if (u.tipo_usuario !== 'FORNECEDOR') {
    console.error('Usuário não é FORNECEDOR:', u.tipo_usuario)
    process.exit(1)
  }

  console.log('Usuario:', u)

  const ctx = { id_organizacao: u.id_organizacao, correlation_id: crypto.randomUUID() }
  const vinculosAntes = await listarVinculosFornecedorPorUsuario(u.id_usuario, ctx)
  console.log('Vinculos Cadastros antes:', vinculosAntes)

  if (vinculosAntes.length === 0) {
    if (!idFornecedor) {
      console.error('Sem vínculo Cadastros. Informe --id-fornecedor=BR-XXX-00001')
      process.exit(1)
    }
    const result = await provisionarPrestadorFornecedor({
      id_usuario: u.id_usuario,
      email_usuario: u.email_usuario,
      nome_usuario: u.nome_usuario ?? u.email_usuario,
      tipo_fornecedor_organizacao: 'AGENTE_CARGA',
      id_organizacao_cliente: u.id_organizacao,
      id_fornecedor: idFornecedor,
      id_clerk_usuario: u.id_clerk_usuario,
      correlation_id: ctx.correlation_id,
    })
    console.log('Provisionado:', result)
  } else {
    for (const v of vinculosAntes) {
      await sincronizarUsuarioBidFreteFornecedor({
        id_organizacao_cliente: v.id_organizacao,
        id_fornecedor: v.id_fornecedor,
        id_usuario: u.id_usuario,
        id_clerk_usuario: u.id_clerk_usuario,
        obrigatorio: true,
      })
      console.log('BID sync OK:', v.id_fornecedor)
    }
  }

  const vinculos = await exigirVinculosCadastrosFornecedorAtivos({
    id_usuario: u.id_usuario,
    id_organizacao: u.id_organizacao,
    correlation_id: ctx.correlation_id,
  })
  console.log('Vinculos ativos:', vinculos)

  const baseUrl = process.env.BID_FRETE_INTERNATIONAL_SERVICE_URL ?? 'http://127.0.0.1:8023'
  const chave = process.env.CHAVE_INTERNA_SERVICO ?? 'gravity-dev-internal-key-2026'
  const res = await fetch(
    `${baseUrl}/api/v1/bid-frete-internacional/visao-fornecedor-bid-frete-internacional/cotacoes-pendentes`,
    {
      headers: {
        'x-internal-key': chave,
        'x-id-organizacao': u.id_organizacao,
        'x-id-usuario': u.id_usuario,
      },
    },
  )
  console.log('cotacoes-pendentes status:', res.status)
  console.log((await res.text()).slice(0, 200))
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
