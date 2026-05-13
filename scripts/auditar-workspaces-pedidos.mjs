// scripts/auditar-workspaces-pedidos.mjs
//
// Auditoria: para cada workspace da organização, conta pedidos (não excluídos)
// e itens. Mostra quais têm dados e quais estão vazios.
//
// Cruza 2 bancos:
//   - CONFIGURADOR_DATABASE_URL (em servicos-global/configurador/.env)
//     → tabela public.workspace
//   - DATABASE_URL do produto Pedido (em servicos-global/produto/pedido/.env)
//     → tabelas public.pedido + public.pedido_item
//
// Uso:
//   node scripts/auditar-workspaces-pedidos.mjs [id_organizacao]

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import pg from 'pg'

const { Client } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadEnv(path) {
  const text = readFileSync(path, 'utf-8')
  return Object.fromEntries(
    text
      .split('\n')
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      }),
  )
}

const envCfg     = loadEnv(resolve(__dirname, '..', 'servicos-global', 'configurador', '.env'))
const envPedido  = loadEnv(resolve(__dirname, '..', 'servicos-global', 'produto', 'pedido', '.env'))

const URL_CONFIGURADOR = envCfg.CONFIGURADOR_DATABASE_URL || envCfg.DATABASE_URL
const URL_PEDIDO       = envPedido.DATABASE_URL

if (!URL_CONFIGURADOR) {
  console.error('❌ CONFIGURADOR_DATABASE_URL não encontrado em servicos-global/configurador/.env')
  process.exit(1)
}
if (!URL_PEDIDO) {
  console.error('❌ DATABASE_URL não encontrado em servicos-global/produto/pedido/.env')
  process.exit(1)
}

const idOrganizacaoFilter = process.argv[2] || null

// ─── 1) Workspaces (banco Configurador) ──────────────────────────────────────
const clientCfg = new Client({ connectionString: URL_CONFIGURADOR })
await clientCfg.connect()
const sqlWs = `
  SELECT id_organizacao, id_workspace, nome_workspace, status_workspace
  FROM public.workspace
  ${idOrganizacaoFilter ? 'WHERE id_organizacao = $1' : ''}
  ORDER BY id_organizacao, nome_workspace
`
const paramsWs = idOrganizacaoFilter ? [idOrganizacaoFilter] : []
const { rows: workspaces } = await clientCfg.query(sqlWs, paramsWs)
await clientCfg.end()

if (workspaces.length === 0) {
  console.log('Nenhum workspace encontrado.')
  process.exit(0)
}

// ─── 2) Contagem de pedidos+itens por workspace (banco do produto Pedido) ────
const clientOrg = new Client({ connectionString: URL_PEDIDO })
await clientOrg.connect()
const sqlCount = `
  SELECT
    p.id_workspace,
    p.id_organizacao,
    COUNT(DISTINCT p.id_pedido) AS qtd_pedidos,
    COUNT(i.id_item)            AS qtd_itens
  FROM public.pedido p
  LEFT JOIN public.pedido_item i ON i.id_pedido = p.id_pedido
  WHERE p.data_exclusao_pedido IS NULL
    ${idOrganizacaoFilter ? 'AND p.id_organizacao = $1' : ''}
  GROUP BY p.id_workspace, p.id_organizacao
`
const paramsCount = idOrganizacaoFilter ? [idOrganizacaoFilter] : []
const { rows: counts } = await clientOrg.query(sqlCount, paramsCount)
await clientOrg.end()

// Indexa contagens por (id_organizacao, id_workspace)
const countByKey = new Map()
for (const c of counts) {
  countByKey.set(`${c.id_organizacao}::${c.id_workspace}`, {
    pedidos: Number(c.qtd_pedidos),
    itens:   Number(c.qtd_itens),
  })
}

// ─── 3) Junta + renderiza ────────────────────────────────────────────────────
// Agrupa workspaces por organização
const porOrg = new Map()
for (const w of workspaces) {
  if (!porOrg.has(w.id_organizacao)) porOrg.set(w.id_organizacao, [])
  porOrg.get(w.id_organizacao).push(w)
}

for (const [idOrg, lista] of porOrg) {
  console.log('\n' + '═'.repeat(100))
  console.log(`ORGANIZAÇÃO: ${idOrg}`)
  console.log('═'.repeat(100))
  console.log(
    'Status'.padEnd(10) +
    'Nome do Workspace'.padEnd(35) +
    'Pedidos'.padStart(10) +
    'Itens'.padStart(10) +
    '   id_workspace',
  )
  console.log('─'.repeat(100))

  const comDados = []
  const semDados = []

  for (const w of lista) {
    const c = countByKey.get(`${w.id_organizacao}::${w.id_workspace}`) ?? { pedidos: 0, itens: 0 }
    const linha =
      (w.status_workspace || '?').padEnd(10) +
      (w.nome_workspace || '(sem nome)').padEnd(35) +
      String(c.pedidos).padStart(10) +
      String(c.itens).padStart(10) +
      '   ' + w.id_workspace
    if (c.pedidos > 0 || c.itens > 0) comDados.push({ linha, ...c })
    else semDados.push({ linha })
  }

  if (comDados.length > 0) {
    console.log('\n  COM PEDIDOS/ITENS:')
    for (const x of comDados) console.log('  ' + x.linha)
  }
  if (semDados.length > 0) {
    console.log('\n  SEM PEDIDOS/ITENS:')
    for (const x of semDados) console.log('  ' + x.linha)
  }

  const totalP = comDados.reduce((a, x) => a + x.pedidos, 0)
  const totalI = comDados.reduce((a, x) => a + x.itens, 0)
  console.log('─'.repeat(100))
  console.log(
    `  TOTAL: ${lista.length} workspace(s) · ${comDados.length} com dados · ${semDados.length} vazios · ${totalP} pedidos · ${totalI} itens`,
  )
}

console.log('')
