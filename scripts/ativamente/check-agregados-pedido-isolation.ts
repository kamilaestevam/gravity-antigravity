/**
 * check-agregados-pedido-isolation.ts — CI lint que garante que os 5 agregados
 * persistidos do Pedido (valor_total_pedido, quantidade_total_pedido,
 * peso_liquido_total_pedido, peso_bruto_total_pedido, cubagem_total_pedido)
 * só sejam ESCRITOS pelo helper canônico `recalcularAgregadosPedido`.
 *
 * Bloqueia o débito histórico que a Onda A1+A2 do refactor de agregados
 * acabou de zerar: cada endpoint que mutava itens "esquecia" de recalcular
 * os agregados do pai → divergência silenciosa, "1 item, total $289k".
 *
 * REGRA:
 *   Se um arquivo `.ts` (excluindo a allowlist) contém qualquer ocorrência
 *   dos 5 nomes seguidos de `:` num bloco `data:` ou `data = {`, falha.
 *
 * ALLOWLIST (ÚNICOS QUE PODEM ESCREVER):
 *   - servicos-global/produto/processos-core/src/services/recalcularAgregadosPedido.ts
 *   - scripts/sob-demanda/recalcular-agregados-pedidos.ts
 *
 * EXCLUSÕES (arquivos que apenas LEEM ou definem schemas — não escrevem):
 *   - schema.prisma / fragment.prisma   (definição de coluna)
 *   - arquivos *.test.ts                (testes podem mockar valores arbitrários)
 *   - documentos-tecnicos/ (.md)        (documentação)
 *   - node_modules, dist, .git, build
 *
 * USO:
 *   npx tsx scripts/ativamente/check-agregados-pedido-isolation.ts
 *
 * Sem violações → exit 0. Com violações → exit 1 (CI falha → sem deploy).
 *
 * Skill: governanca/convencao-tecnica/lint-tenant-safety/SKILL.md (linter custom)
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { resolve, relative, sep } from 'path'

const ROOT = resolve(import.meta.dirname, '../..')

const AGREGADOS = [
  'valor_total_pedido',
  'quantidade_total_pedido',
  'peso_liquido_total_pedido',
  'peso_bruto_total_pedido',
  'cubagem_total_pedido',
] as const

const ALLOWLIST_RELATIVO = new Set([
  ['servicos-global', 'produto', 'processos-core', 'src', 'services', 'recalcularAgregadosPedido.ts'].join(sep),
  ['scripts', 'sob-demanda', 'recalcular-agregados-pedidos.ts'].join(sep),
  // casas-decimais-pedido.ts: configura PRECISÃO (casas) dos campos, não escreve
  // valores agregados. Os nomes coincidem com os agregados porque são chaves
  // do dicionário de config, não dados.
  ['servicos-global', 'produto', 'pedido', 'server', 'src', 'routes', 'casas-decimais-pedido.ts'].join(sep),
])

const PASTAS_IGNORAR = new Set([
  'node_modules', 'dist', '.git', '.next', 'build', 'coverage',
  // Pasta com auditorias antigas (snapshots históricos podem mencionar agregados):
  '_meta',
])

const EXTS_VARRER = ['.ts', '.tsx']

interface Violacao {
  arquivo: string
  linha: number
  campo: string
  trecho: string
}

const violacoes: Violacao[] = []

// Regex: detecta `<campo>:` ou `<campo> :` precedido de espaço/início de linha.
// Não é AST mas captura bem o caso comum de Prisma `data: { campo: valor }`.
const padraoCampo = (campo: string) =>
  new RegExp(`(^|[\\s,{])${campo}\\s*:`, 'g')

function ehWriteTexto(arquivo: string, conteudo: string): boolean {
  // Foco em UPDATE (sobrescreve direto, contornando o helper). CREATE com
  // agregado é PERMITIDO porque pode ser placeholder antes do helper rodar
  // (POST /pedidos, duplicar, importar, consolidar — todos chamam o helper
  // logo após o create dentro da mesma $transaction).
  return /pedido\s*\.\s*(update|upsert|updateMany)\b/.test(conteudo)
}

function varrer(dir: string): void {
  let entries: string[]
  try { entries = readdirSync(dir) } catch { return }
  for (const nome of entries) {
    if (PASTAS_IGNORAR.has(nome)) continue
    const full = resolve(dir, nome)
    let stat
    try { stat = statSync(full) } catch { continue }
    if (stat.isDirectory()) {
      varrer(full)
    } else if (stat.isFile()) {
      if (!EXTS_VARRER.some((e) => nome.endsWith(e))) continue
      if (nome.endsWith('.test.ts') || nome.endsWith('.test.tsx')) continue
      if (nome.endsWith('.d.ts')) continue
      const rel = relative(ROOT, full)
      if (ALLOWLIST_RELATIVO.has(rel)) continue
      let conteudo: string
      try { conteudo = readFileSync(full, 'utf8') } catch { continue }
      if (!ehWriteTexto(full, conteudo)) continue

      const linhas = conteudo.split('\n')
      // Pré-computar índices das linhas com diretiva
      // `@lint-agregados: allow-create-placeholder` — exceção localizada usada
      // em `pedido.create({...})` quando o helper é chamado logo após dentro
      // da mesma $transaction.
      const allowMarkerLinhas = new Set<number>()
      for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].includes('@lint-agregados: allow-create-placeholder')) {
          // Marca as próximas 25 linhas como permitidas (cobre objeto data:{}
          // típico de pedido.create com vários campos antes do nested itens).
          for (let j = i; j < Math.min(i + 25, linhas.length); j++) {
            allowMarkerLinhas.add(j)
          }
        }
      }
      for (const campo of AGREGADOS) {
        const re = padraoCampo(campo)
        for (let i = 0; i < linhas.length; i++) {
          const linha = linhas[i]
          if (re.test(linha)) {
            // Excluir comentários (// ou *) e strings de tipo (interface { campo: number })
            const trim = linha.trim()
            if (trim.startsWith('//') || trim.startsWith('*')) continue
            // Excluir definições de tipo TypeScript (não envolvem write em DB)
            if (/^(type|interface|export\s+(type|interface))/.test(trim)) continue
            // Excluir linhas dentro de bloco com diretiva de exceção
            if (allowMarkerLinhas.has(i)) continue
            violacoes.push({
              arquivo: rel,
              linha: i + 1,
              campo,
              trecho: trim.slice(0, 120),
            })
          }
          re.lastIndex = 0
        }
      }
    }
  }
}

console.log('━'.repeat(72))
console.log('Lint: isolamento de escrita dos 5 agregados de Pedido')
console.log('━'.repeat(72))

varrer(resolve(ROOT, 'servicos-global'))
varrer(resolve(ROOT, 'scripts'))

if (violacoes.length === 0) {
  console.log('✅ OK — nenhuma escrita direta nos 5 agregados fora do helper canônico.')
  process.exit(0)
} else {
  console.error(`❌ ${violacoes.length} violação(ões) encontrada(s):\n`)
  for (const v of violacoes) {
    console.error(`  ${v.arquivo}:${v.linha}  →  ${v.campo}`)
    console.error(`    ${v.trecho}`)
  }
  console.error('\nRegra: os 5 agregados (valor/qty/peso_liq/peso_br/cubagem)_total_pedido')
  console.error('SÓ podem ser escritos pelo helper `recalcularAgregadosPedido` em')
  console.error('processos-core/src/services/. Use o helper em vez de gravar direto.')
  console.error('Justificativa: governanca/convencao-tecnica/lint-tenant-safety/SKILL.md')
  process.exit(1)
}
