// scripts/compose-tenant-schema.ts
// COORDENADOR — Script de composição do schema tenant-db
// Agente 0B — Banco de Dados (base inicial)
//
// Este script é executado pelo Coordenador antes de:
//   - prisma generate
//   - prisma migrate dev
//   - prisma migrate deploy
//
// Combina schema.base.prisma + todos os fragment.prisma dos serviços
// de tenant no arquivo final servicos-global/tenant/prisma/schema.prisma
//
// NUNCA editar schema.prisma manualmente — ele é sempre sobrescrito por este script.
//
// Uso:
//   npx ts-node scripts/compose-tenant-schema.ts
//   # ou via package.json:
//   npm run compose:tenant

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Configuração de caminhos
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '..')
const TENANT_DIR = path.join(ROOT_DIR, 'servicos-global', 'tenant')
const OUTPUT_SCHEMA = path.join(TENANT_DIR, 'prisma', 'schema.prisma')
const BASE_SCHEMA = path.join(TENANT_DIR, 'prisma', 'schema.base.prisma')

// ---------------------------------------------------------------------------
// Serviços de tenant que contribuem com fragments
// Ordem importa: models com dependências devem vir depois.
// Adicione novos serviços aqui quando a Onda 3 entregar os fragments.
// ---------------------------------------------------------------------------

const TENANT_SERVICES: string[] = [
  'atividades',
  'cronometro',
  'email',
  'whatsapp',
  'dashboard',
  'relatorios',
  'historico-global',
  'agendamento',
  'gabi',
  'preferencias-usuario',
]

// ---------------------------------------------------------------------------
// Leitura do fragment de um serviço
// Retorna null e exibe aviso se o fragment não existir ainda —
// o Coordenador decide se aborta ou continua sem o fragment.
// ---------------------------------------------------------------------------

function readFragment(serviceName: string): string | null {
  const fragmentPath = path.join(TENANT_DIR, serviceName, 'prisma', 'fragment.prisma')

  if (!fs.existsSync(fragmentPath)) {
    console.warn(
      `[compose-tenant-schema] AVISO: fragment.prisma não encontrado para ${serviceName} em: ${fragmentPath}`
    )
    return null
  }

  const content = fs.readFileSync(fragmentPath, 'utf8')
  return `// --- Fragment: ${serviceName} ---\n${content}`
}

// ---------------------------------------------------------------------------
// Composição do schema final
// ---------------------------------------------------------------------------

function composeTenantSchema(options: { skipMissing?: boolean } = {}): void {
  const { skipMissing = true } = options

  console.log('[compose-tenant-schema] Iniciando composição do schema tenant-db...')

  // 1. Ler o arquivo base
  if (!fs.existsSync(BASE_SCHEMA)) {
    throw new Error(
      `[compose-tenant-schema] ERRO: schema.base.prisma não encontrado em: ${BASE_SCHEMA}`
    )
  }

  const base = fs.readFileSync(BASE_SCHEMA, 'utf8')

  // 2. Coletar fragments dos serviços
  const fragments: string[] = []
  const missing: string[] = []

  for (const service of TENANT_SERVICES) {
    const fragment = readFragment(service)

    if (fragment === null) {
      missing.push(service)
      if (!skipMissing) {
        throw new Error(
          `[compose-tenant-schema] ERRO: fragment obrigatório ausente para ${service}. Abortando.`
        )
      }
    } else {
      fragments.push(fragment)
    }
  }

  // 3. Compor o schema final
  const header = [
    '// ============================================================================',
    '// schema.prisma — GERADO AUTOMATICAMENTE',
    '// NÃO EDITAR MANUALMENTE — será sobrescrito na próxima execução de compose.',
    `// Gerado em: ${new Date().toISOString()}`,
    '// Serviços incluídos: ' + TENANT_SERVICES.filter((s) => !missing.includes(s)).join(', '),
    missing.length > 0
      ? '// Serviços ausentes (fragment não encontrado): ' + missing.join(', ')
      : '// Todos os fragments encontrados.',
    '// ============================================================================',
  ].join('\n')

  const composed = [header, base, ...fragments].join('\n\n')

  // 4. Escrever o arquivo final
  fs.writeFileSync(OUTPUT_SCHEMA, composed, 'utf8')

  console.log('[compose-tenant-schema] ✅ Schema composto com sucesso em:', OUTPUT_SCHEMA)

  if (missing.length > 0) {
    console.warn(
      '[compose-tenant-schema] ⚠️  Fragments ausentes (' + missing.length + '):',
      missing.join(', ')
    )
    console.warn(
      '[compose-tenant-schema]    Os serviços listados ainda não entregaram seus fragments.'
    )
  }
}

// ---------------------------------------------------------------------------
// Execução direta do script
// ---------------------------------------------------------------------------

// Verificar flag --strict para bloquear quando fragments estão faltando
const isStrict = process.argv.includes('--strict')

composeTenantSchema({ skipMissing: !isStrict })
