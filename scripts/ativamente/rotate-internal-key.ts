/**
 * rotate-internal-key.ts — Rotacao de CHAVE_INTERNA_SERVICO
 *
 * Gera nova chave segura e exibe instrucoes para atualizar em todos os servicos.
 * Executar trimestralmente conforme politica de seguranca (Cap. 13.3).
 *
 * Uso: npx tsx scripts/ativamente/rotate-internal-key.ts
 */

import { randomBytes } from 'crypto'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const newKey = `gv_isk_${randomBytes(32).toString('hex')}`

console.log('='.repeat(70))
console.log('ROTACAO DE CHAVE_INTERNA_SERVICO')
console.log('='.repeat(70))
console.log()
console.log('Nova chave gerada:')
console.log()
console.log(`  ${newKey}`)
console.log()
console.log('-'.repeat(70))
console.log('INSTRUCOES DE DEPLOY:')
console.log('-'.repeat(70))
console.log()
console.log('1. Atualizar no Railway (Settings > Variables) para TODOS os servicos:')
console.log()

const services = [
  'configurador',
  'servidor-plataforma',
  'bid-frete',
  'simula-custo',
  'processo',
  'api-cockpit',
  'email',
  'whatsapp',
  'cronometro',
  'dashboard',
  'relatorios',
  'notificacoes',
  'historico-global',
  'gabi',
  'conector-erp',
  'agendamento',
  'preferencias-usuario',
]

for (const svc of services) {
  console.log(`   - ${svc}: CHAVE_INTERNA_SERVICO=${newKey}`)
}

console.log()
console.log('2. Deploy todos os servicos simultaneamente (rolling update)')
console.log('   railway up --service <nome> para cada servico')
console.log()
console.log('3. Verificar health checks apos deploy:')
console.log('   curl https://<servico>.railway.app/health')
console.log()
console.log('4. Atualizar .env.example locais (sem a chave real):')
console.log('   CHAVE_INTERNA_SERVICO=SUBSTITUA_POR_CHAVE_SEGURA')
console.log()
console.log('5. Registrar rotacao no historico:')
console.log(`   Data: ${new Date().toISOString().split('T')[0]}`)
console.log(`   Proxima rotacao: ${getNextQuarter()}`)
console.log()
console.log('='.repeat(70))
console.log('IMPORTANTE: Nunca commitar a chave real no repositorio!')
console.log('='.repeat(70))

// Registra a rotação automaticamente no rotacao-chaves.json
const rotacaoPath = resolve(__dirname, '../../servicos-global/configurador/data/rotacao-chaves.json')
if (existsSync(rotacaoPath)) {
  const rotacaoData = JSON.parse(readFileSync(rotacaoPath, 'utf-8')) as Record<string, { politica_dias: number; ultima_rotacao: string | null; descricao: string }>
  if (rotacaoData.CHAVE_INTERNA_SERVICO) {
    rotacaoData.CHAVE_INTERNA_SERVICO.ultima_rotacao = new Date().toISOString()
    writeFileSync(rotacaoPath, JSON.stringify(rotacaoData, null, 2) + '\n', 'utf-8')
    console.log()
    console.log('✅ Rotação registrada em rotacao-chaves.json')
    console.log('   O painel de Segurança será atualizado automaticamente.')
  }
} else {
  console.log()
  console.log('⚠️  rotacao-chaves.json não encontrado — registre manualmente no painel.')
}

function getNextQuarter(): string {
  const now = new Date()
  const nextQuarter = new Date(now)
  nextQuarter.setMonth(now.getMonth() + 3)
  return nextQuarter.toISOString().split('T')[0]
}
