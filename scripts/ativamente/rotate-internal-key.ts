/**
 * rotate-internal-key.ts — Rotacao de CHAVE_INTERNA_SERVICO
 *
 * Gera nova chave segura e exibe instrucoes para atualizar em todos os servicos.
 * Executar trimestralmente conforme politica de seguranca (Cap. 13.3).
 *
 * Uso: npx tsx scripts/ativamente/rotate-internal-key.ts
 */

import { randomBytes } from 'crypto'

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

function getNextQuarter(): string {
  const now = new Date()
  const nextQuarter = new Date(now)
  nextQuarter.setMonth(now.getMonth() + 3)
  return nextQuarter.toISOString().split('T')[0]
}
