// scripts/ativamente/compose-plataforma-schema.ts
// COORDENADOR — Script de composição do schema organizacao-db
// Agente 0B — Banco de Dados (base inicial)
//
// Este script é executado pelo Coordenador antes de:
//   - prisma generate
//   - prisma migrate dev
//   - prisma migrate deploy
//
// Combina schema.base.prisma + todos os fragment.prisma dos serviços
// de organização no arquivo final servicos-global/servicos-plataforma/prisma/schema.prisma
//
// NUNCA editar schema.prisma manualmente — ele é sempre sobrescrito por este script.
//
// Uso:
//   npx ts-node scripts/ativamente/compose-plataforma-schema.ts
//   # ou via package.json:
//   npm run compose:organizacao

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// ---------------------------------------------------------------------------
// Configuração de caminhos
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_DIR = path.resolve(__dirname, '../..')
const ORGANIZACAO_DIR = path.join(ROOT_DIR, 'servicos-global', 'servicos-plataforma')
const OUTPUT_SCHEMA = path.join(ORGANIZACAO_DIR, 'prisma', 'schema.prisma')
const BASE_SCHEMA = path.join(ORGANIZACAO_DIR, 'prisma', 'schema.base.prisma')

// ---------------------------------------------------------------------------
// Serviços de organização que contribuem com fragments
// Ordem importa: models com dependências devem vir depois.
// Adicione novos serviços aqui quando a Onda 3 entregar os fragments.
// ---------------------------------------------------------------------------

const SERVICOS_ORGANIZACAO: string[] = [
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
  'processos-core',  // Pedido, PedidoItem, Processo, PedidoStatus, PedidoColuna, PedidoPreferencias
  'ncm-sync',        // NcmItem, NcmSyncLog — tabela NCM Portal Único Siscomex
  'notificacoes',    // Notification, NotificationPreferences — sininho do header
  'api-cockpit',     // ApiToken, WebhookConfiguracao, WebhookLog, LogConsumo, ApiIntegracaoErp
]

// ---------------------------------------------------------------------------
// Leitura do fragment de um serviço
// Retorna null e exibe aviso se o fragment não existir ainda —
// o Coordenador decide se aborta ou continua sem o fragment.
// ---------------------------------------------------------------------------

function readFragment(serviceName: string): string | null {
  const fragmentPath = path.join(ORGANIZACAO_DIR, serviceName, 'prisma', 'fragment.prisma')

  if (!fs.existsSync(fragmentPath)) {
    console.warn(
      `[compose-plataforma-schema] AVISO: fragment.prisma não encontrado para ${serviceName} em: ${fragmentPath}`
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

  console.log('[compose-plataforma-schema] Iniciando composição do schema organizacao-db...')

  // 1. Ler o arquivo base
  if (!fs.existsSync(BASE_SCHEMA)) {
    throw new Error(
      `[compose-plataforma-schema] ERRO: schema.base.prisma não encontrado em: ${BASE_SCHEMA}`
    )
  }

  const base = fs.readFileSync(BASE_SCHEMA, 'utf8')

  // 2. Coletar fragments dos serviços
  const fragments: string[] = []
  const missing: string[] = []

  for (const service of SERVICOS_ORGANIZACAO) {
    const fragment = readFragment(service)

    if (fragment === null) {
      missing.push(service)
      if (!skipMissing) {
        throw new Error(
          `[compose-plataforma-schema] ERRO: fragment obrigatório ausente para ${service}. Abortando.`
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
    '// Serviços incluídos: ' + SERVICOS_ORGANIZACAO.filter((s) => !missing.includes(s)).join(', '),
    missing.length > 0
      ? '// Serviços ausentes (fragment não encontrado): ' + missing.join(', ')
      : '// Todos os fragments encontrados.',
    '// ============================================================================',
  ].join('\n')

  const composed = [header, base, ...fragments].join('\n\n')

  // 4. Escrever o arquivo final
  fs.writeFileSync(OUTPUT_SCHEMA, composed, 'utf8')

  console.log('[compose-plataforma-schema] ✅ Schema composto com sucesso em:', OUTPUT_SCHEMA)

  if (missing.length > 0) {
    console.warn(
      '[compose-plataforma-schema] ⚠️  Fragments ausentes (' + missing.length + '):',
      missing.join(', ')
    )
    console.warn(
      '[compose-plataforma-schema]    Os serviços listados ainda não entregaram seus fragments.'
    )
  }
}

// ---------------------------------------------------------------------------
// Execução direta do script
// ---------------------------------------------------------------------------

// Verificar flag --strict para bloquear quando fragments estão faltando
const isStrict = process.argv.includes('--strict')

composeTenantSchema({ skipMissing: !isStrict })
