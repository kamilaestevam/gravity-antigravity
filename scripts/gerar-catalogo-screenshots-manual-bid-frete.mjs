/**
 * Gera manual-bid-frete-catalogo-screenshots.ts a partir dos PNGs copiados.
 * Uso: node scripts/gerar-catalogo-screenshots-manual-bid-frete.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const screenshotsDir = path.join(
  __dirname,
  '../servicos-global/configurador/public/university/screenshots',
)
const outFile = path.join(
  __dirname,
  '../servicos-global/configurador/src/pages/university/manual-bid-frete-catalogo-screenshots.ts',
)

const arquivos = fs
  .readdirSync(screenshotsDir)
  .filter((nome) => nome.startsWith('bid-frete-int-') && nome.endsWith('.png'))
  .sort((a, b) => a.localeCompare(b))

function sufixoDriveDeArquivoPublico(nomeArquivo) {
  return nomeArquivo
    .replace(/^bid-frete-int-/, '')
    .replace(/\.png$/, '')
    .replace(/-/g, '_')
}

function constanteDeSufixo(sufixo) {
  return (
    'SCREENSHOT_BID_FRETE_INT_' +
    sufixo
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .replace(/_+/g, '_')
      .toUpperCase()
  )
}

const linhas = [
  '/**',
  ' * SSOT: Drive `6. Produtos Gravity/3. BID Frete Int`',
  ' *   → `public/university/screenshots/bid-frete-int-*.png`',
  ' * Copiar: `powershell -ExecutionPolicy Bypass -File scripts/copiar-screenshots-manual-bid-frete.ps1`',
  ' * Regenerar exports: `node scripts/gerar-catalogo-screenshots-manual-bid-frete.mjs`',
  ' *',
  ' * Regra: `tela_bid_frete_int_{sufixo}` → `bid-frete-int-{sufixo com _ → -}.png`',
  ' */',
  '',
  "export const SCREENSHOTS_BID_FRETE_INT_BASE = '/university/screenshots'",
  '',
  'export function screenshotBidFreteInt(sufixoDrive: string): string {',
  "  const arquivo = sufixoDrive.replaceAll('_', '-')",
  '  return `${SCREENSHOTS_BID_FRETE_INT_BASE}/bid-frete-int-${arquivo}.png`',
  '}',
  '',
  '/** Todos os prints copiados — chave = sufixo Drive (sem prefixo tela_bid_frete_int_). */',
  'export const MAPA_SCREENSHOTS_BID_FRETE_INT: Record<string, string> = {',
]

for (const arquivo of arquivos) {
  const sufixo = sufixoDriveDeArquivoPublico(arquivo)
  const url = `/university/screenshots/${arquivo}`
  linhas.push(`  '${sufixo}': '${url}',`)
}

linhas.push('}', '', '// ── Atalhos nomeados (imports diretos nos conteudos) ──', '')

const usados = new Set()
for (const arquivo of arquivos) {
  const sufixo = sufixoDriveDeArquivoPublico(arquivo)
  let nome = constanteDeSufixo(sufixo)
  if (usados.has(nome)) {
    let i = 2
    while (usados.has(`${nome}_${i}`)) i++
    nome = `${nome}_${i}`
  }
  usados.add(nome)
  linhas.push(`export const ${nome} = screenshotBidFreteInt('${sufixo}')`)
}

linhas.push('')

fs.writeFileSync(outFile, linhas.join('\n'), 'utf8')
console.log(`Gerado ${outFile} (${arquivos.length} prints)`)
