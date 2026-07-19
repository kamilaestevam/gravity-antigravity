/**
 * Valida {{link:…}} nos manuais University — destino Academy resolvível.
 * Uso: npx tsx scripts/ativamente/validar-links-guia-gravity.ts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolverHrefManualParaAcademy } from '../../servicos-global/configurador/src/pages/university/academy-link-guia.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const UNI_DIR = path.join(ROOT, 'servicos-global/configurador/src/pages/university')

const RE_LINK = /\{\{link:([^|{}$]+)\|([^}]+)\}\}/g

function listarArquivos(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listarArquivos(full)
    if (!/\.(ts|tsx)$/.test(entry.name) || entry.name.endsWith('.d.ts')) return []
    if (entry.name === 'academy-link-guia.ts' || entry.name === 'guia-academy-link.tsx') return []
    return [full]
  })
}

interface LinkRef {
  arquivo: string
  linha: number
  href: string
  rotulo: string
}

const links: LinkRef[] = []

for (const arquivo of listarArquivos(UNI_DIR)) {
  const conteudo = fs.readFileSync(arquivo, 'utf8')
  const linhas = conteudo.split('\n')
  linhas.forEach((linha, i) => {
    RE_LINK.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = RE_LINK.exec(linha)) !== null) {
      links.push({
        arquivo: path.relative(ROOT, arquivo),
        linha: i + 1,
        href: m[1].trim(),
        rotulo: m[2].trim(),
      })
    }
  })
}

const erros: string[] = []
const avisos: string[] = []

for (const link of links) {
  const destino = resolverHrefManualParaAcademy(link.href)
  if (!destino) {
    erros.push(`${link.arquivo}:${link.linha} — "${link.rotulo}" → ${link.href} (sem destino Academy)`)
    continue
  }
  if (link.href.startsWith('/university-gravity/academy/')) {
    avisos.push(`${link.arquivo}:${link.linha} — academy direto: ${link.href}`)
  }
}

console.log(`Links encontrados: ${links.length}`)
if (avisos.length) {
  console.log(`\nAvisos (${avisos.length}) — href /academy/ direto (funcional, fora do padrão /docs):`)
  avisos.forEach(a => console.log(`  ${a}`))
}
if (erros.length) {
  console.error(`\nErros (${erros.length}):`)
  erros.forEach(e => console.error(`  ${e}`))
  process.exit(1)
}
console.log('\nTodos os links resolvem para Academy.')
