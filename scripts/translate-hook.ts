/**
 * translate-hook.ts — Hook de tradução para uso pós-edição de pt.json.
 *
 * Detecta automaticamente chaves faltantes em en.json e es.json após
 * adição de novas chaves em pt.json, e traduz apenas o necessário.
 *
 * Uso:
 *   npx tsx scripts/translate-hook.ts              # traduz faltantes
 *   npx tsx scripts/translate-hook.ts --dry-run    # lista sem traduzir
 *
 * Este script é idêntico ao translate.ts em funcionalidade, mas foi
 * projetado para ser chamado como hook pós-edição. Ele importa e
 * reutiliza o pipeline principal.
 */

import { execSync } from 'node:child_process'
import path from 'node:path'

const scriptDir = import.meta.dirname
const translateScript = path.join(scriptDir, 'translate.ts')

// Repassa todos os argumentos (ex: --dry-run)
const args = process.argv.slice(2).join(' ')

console.log('🔍 Verificando chaves faltantes em en.json e es.json...\n')

try {
  execSync(`npx tsx "${translateScript}" ${args}`, {
    stdio: 'inherit',
    cwd: path.resolve(scriptDir, '..'),
    env: { ...process.env },
  })
} catch (err) {
  process.exit(1)
}
