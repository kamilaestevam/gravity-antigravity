/**
 * SSOT editorial — substitui travessões em strings dos manuais University.
 * Uso: node scripts/ativamente/normalizar-travessoes-guia-gravity.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const UNI_DIR = path.join(ROOT, 'servicos-global/configurador/src/pages/university')

function listarManuais(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listarManuais(full)
    if (!/^manual-.*\.(ts|tsx)$/.test(entry.name)) return []
    return [full]
  })
}

function processarLinha(linha) {
  const trimmed = linha.trimStart()
  if (
    trimmed.startsWith('//')
    || trimmed.startsWith('*')
    || trimmed.startsWith('/**')
    || trimmed.startsWith('import ')
    || trimmed.startsWith('export type')
    || trimmed.startsWith('export interface')
  ) {
    return linha
  }
  return linha
    .replace(/\s—\s/g, ': ')
    .replace(/\s–\s/g, ': ')
    .replace(/\*\*—\*\*/g, '*(vazio)*')
}

let totalSubstituicoes = 0
let arquivosAlterados = 0

for (const arquivo of listarManuais(UNI_DIR)) {
  const original = fs.readFileSync(arquivo, 'utf8')
  const atualizado = original
    .split('\n')
    .map(processarLinha)
    .join('\n')
  if (atualizado !== original) {
    const antes = (original.match(/[—–]/g) ?? []).length
    const depois = (atualizado.match(/[—–]/g) ?? []).length
    totalSubstituicoes += antes - depois
    fs.writeFileSync(arquivo, atualizado, 'utf8')
    arquivosAlterados += 1
    console.log(`${path.relative(ROOT, arquivo)}: ${antes - depois} travessões`)
  }
}

console.log(`\n${arquivosAlterados} arquivo(s), ~${totalSubstituicoes} substituição(ões).`)
