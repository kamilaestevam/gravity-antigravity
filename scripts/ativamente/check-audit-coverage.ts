/**
 * check-audit-coverage.ts — CI lint que garante que todos os produtos e o
 * Configurador aplicam auto-instrumentacao de auditoria.
 *
 * Bloqueia regressao do requisito B do dono ("toda nova aba/produto deve
 * entrar automatico no historico, sem ponto cego").
 *
 * Cobertura:
 *  1. Cada `servicos-global/produto/<produto>/server/src/index.ts` deve:
 *     - importar `createProductAuditPlugin`
 *     - chamar `app.use(<algumaInstanciaDoPlugin>)`
 *  2. `servicos-global/configurador/server/index.ts` deve:
 *     - importar `createProductAuditPlugin`
 *     - chamar `app.use(<algumaInstanciaDoPlugin>)`
 *
 * Sem essa cobertura → exit code 1 → CI falha → sem deploy.
 *
 * Uso local:
 *   npx tsx scripts/ativamente/check-audit-coverage.ts
 *
 * Skill: governanca/operacao/lint-tenant-safety/SKILL.md (linter custom)
 * Etapa 5 do Plano D (historico de auditoria).
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { resolve, relative } from 'path'

const ROOT = resolve(import.meta.dirname, '../..')

interface Verificacao {
  caminho: string  // path absoluto do index.ts
  rotulo: string   // nome amigavel para mensagens (ex: "produto/pedido")
}

const errors: string[] = []

// ─── Coleta os index.ts a inspecionar ────────────────────────────────────────

const verificacoes: Verificacao[] = []

// 1. Configurador
const configuradorIndex = resolve(ROOT, 'servicos-global/configurador/server/index.ts')
if (existsSync(configuradorIndex)) {
  verificacoes.push({ caminho: configuradorIndex, rotulo: 'configurador' })
} else {
  errors.push('FATAL: servicos-global/configurador/server/index.ts nao encontrado')
}

// 2. Cada produto sob servicos-global/produto/
const produtosRoot = resolve(ROOT, 'servicos-global/produto')
if (existsSync(produtosRoot)) {
  for (const entry of readdirSync(produtosRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const indexTs = resolve(produtosRoot, entry.name, 'server/src/index.ts')
    if (existsSync(indexTs)) {
      verificacoes.push({ caminho: indexTs, rotulo: `produto/${entry.name}` })
    }
    // Produtos sem server/src/index.ts ainda (template/scaffold zerado) sao
    // ignorados — quando criarem o servidor, o lint pega na proxima execucao.
  }
}

// ─── Inspeciona cada index.ts ────────────────────────────────────────────────

for (const { caminho, rotulo } of verificacoes) {
  let src: string
  try {
    src = readFileSync(caminho, 'utf-8')
  } catch (err) {
    errors.push(`[${rotulo}] erro ao ler ${relative(ROOT, caminho)}: ${(err as Error).message}`)
    continue
  }

  const importaPlugin =
    /import\s*\{[^}]*\bcreateProductAuditPlugin\b[^}]*\}\s*from\s*['"][^'"]*product-audit-plugin/.test(src)

  if (!importaPlugin) {
    errors.push(
      `[${rotulo}] nao importa createProductAuditPlugin de ` +
      `@gravity/historico/product-audit-plugin (ou caminho equivalente).\n` +
      `   Adicione no topo do ${relative(ROOT, caminho)}:\n` +
      `   import { createProductAuditPlugin } from '<...>/historico-global/src/product-audit-plugin.js'`
    )
    continue
  }

  // Verifica que ha pelo menos uma chamada `app.use(<algo plugin>)` ou referencia
  // a instancia do plugin sendo passada para `app.use(...)`.
  const usaPlugin =
    /\bapp\.use\([^)]*createProductAuditPlugin\(/.test(src) ||  // inline: app.use(createProductAuditPlugin({...}))
    /\bapp\.use\([^)]*[Aa]uditPlugin[^)]*\)/.test(src) ||      // variavel: app.use(auditPlugin)
    /\bapp\.use\([^)]*[Pp]lugin[^)]*\)/.test(src)              // variavel: app.use(configuradorPlugin)

  if (!usaPlugin) {
    errors.push(
      `[${rotulo}] importa createProductAuditPlugin mas nao registra com app.use(...).\n` +
      `   Em ${relative(ROOT, caminho)}, garanta:\n` +
      `   const plugin = createProductAuditPlugin({...})\n` +
      `   app.use(plugin)`
    )
  }
}

// ─── Resultado ───────────────────────────────────────────────────────────────

if (errors.length === 0) {
  console.log(`✅ check-audit-coverage: ${verificacoes.length} servidor(es) com auto-instrumentacao de audit.`)
  process.exit(0)
}

console.error('❌ check-audit-coverage falhou:\n')
for (const e of errors) console.error(`  ${e}\n`)
console.error(
  `\nRequisito B do Plano D (historico de auditoria): toda nova aba/produto\n` +
  `deve entrar automatico no historico, sem ponto cego.\n` +
  `Skill: arquitetura/observabilidade/SKILL.md secao "Audit Trail Centralizado".\n`
)
process.exit(1)
