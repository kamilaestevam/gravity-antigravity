// scripts/ativamente/compose-cadastros-schema.ts
// COORDENADOR — Script de composição do schema do banco cadastros (4º banco)
//
// Este script é executado pelo Coordenador antes de:
//   - prisma generate (cadastros)
//   - prisma migrate dev (cadastros)
//   - prisma migrate deploy (cadastros)
//
// Combina schema.base.prisma + fragment.prisma do serviço cadastros no arquivo final
// servicos-global/cadastros/prisma/schema.prisma
//
// Banco-alvo: gravity-cadastros-* (Railway), conectado via env CADASTROS_DATABASE_URL
// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md
//
// NUNCA editar schema.prisma manualmente — sempre sobrescrito por este script.
//
// Uso:
//   npx tsx scripts/ativamente/compose-cadastros-schema.ts
//   npx tsx scripts/ativamente/compose-cadastros-schema.ts --strict   (aborta se fragment faltar)

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Configuração de caminhos
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const CADASTROS_DIR = path.join(ROOT_DIR, 'servicos-global', 'cadastros')
const OUTPUT_SCHEMA = path.join(CADASTROS_DIR, 'prisma', 'schema.prisma')
const BASE_SCHEMA = path.join(CADASTROS_DIR, 'prisma', 'schema.base.prisma')
const FRAGMENT_PATH = path.join(CADASTROS_DIR, 'prisma', 'fragment.prisma')

// ---------------------------------------------------------------------------
// Composição
// ---------------------------------------------------------------------------

function composeCadastrosSchema(options: { strict?: boolean } = {}): void {
  const { strict = false } = options

  console.log('[compose-cadastros-schema] Iniciando composição do schema cadastros...')

  // 1. Validar base
  if (!fs.existsSync(BASE_SCHEMA)) {
    throw new Error(
      `[compose-cadastros-schema] ERRO: schema.base.prisma não encontrado em: ${BASE_SCHEMA}`
    )
  }
  const base = fs.readFileSync(BASE_SCHEMA, 'utf8')

  // 2. Validar fragment
  if (!fs.existsSync(FRAGMENT_PATH)) {
    const msg = `[compose-cadastros-schema] ERRO: fragment.prisma não encontrado em: ${FRAGMENT_PATH}`
    if (strict) {
      throw new Error(msg)
    } else {
      console.warn(msg)
      console.warn('[compose-cadastros-schema] Composição abortada — sem fragment não há schema.')
      process.exit(1)
    }
  }
  const fragment = fs.readFileSync(FRAGMENT_PATH, 'utf8')

  // 3. Compor schema final
  const header = [
    '// ============================================================================',
    '// schema.prisma — GERADO AUTOMATICAMENTE',
    '// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.',
    `// Gerado em: ${new Date().toISOString()}`,
    '// Banco: gravity-cadastros-* (Railway)',
    '// Serviço: @gravity/cadastros',
    '// Documento técnico: documentos-tecnicos/banco-dados/cadastros-arquitetura.md',
    '// ============================================================================',
  ].join('\n')

  const composed = [
    header,
    base,
    `// --- Fragment: cadastros ---`,
    fragment,
  ].join('\n\n')

  // 4. Escrever schema final
  fs.writeFileSync(OUTPUT_SCHEMA, composed, 'utf8')

  console.log('[compose-cadastros-schema] ✅ Schema composto com sucesso em:', OUTPUT_SCHEMA)
}

// ---------------------------------------------------------------------------
// Execução direta
// ---------------------------------------------------------------------------

const isStrict = process.argv.includes('--strict')
composeCadastrosSchema({ strict: isStrict })
