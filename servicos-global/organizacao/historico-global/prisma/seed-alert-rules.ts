/**
 * Seed das regras de alerta padrão (globais — tenant_id = null).
 * Executar após a migração: npx tsx prisma/seed-alert-rules.ts
 */
import { PrismaClient } from '../../generated/index.js'

const prisma = new PrismaClient()

const DEFAULT_RULES = [
  {
    name: 'Ação em massa por usuário',
    description: 'Mesmo usuário executando muitas ações em curto período',
    actor_type: 'USER' as const,
    threshold_count: 50,
    threshold_window_seconds: 60,
    channel_inapp: true,
    channel_email: false,
    channel_whatsapp: false,
  },
  {
    name: 'IA executando ações destrutivas',
    description: 'GABI/IA executando DELETE ou UPDATE em massa',
    actor_type: 'AI' as const,
    action: 'DELETE',
    threshold_count: 10,
    threshold_window_seconds: 60,
    channel_inapp: true,
    channel_email: true,
    channel_whatsapp: false,
  },
  {
    name: 'Job interno falhando repetidamente',
    description: 'Worker com falhas consecutivas no mesmo recurso',
    actor_type: 'JOB' as const,
    action: 'JOB_FAILURE',
    threshold_count: 5,
    threshold_window_seconds: 300,
    channel_inapp: true,
    channel_email: false,
    channel_whatsapp: false,
  },
  {
    name: 'Integração com alto volume de acesso',
    description: 'ERP ou transportadora acessando dados em volume anormal',
    actor_type: 'INTEGRATION' as const,
    threshold_count: 100,
    threshold_window_seconds: 60,
    channel_inapp: true,
    channel_email: true,
    channel_whatsapp: false,
  },
  {
    name: 'Múltiplas falhas de autenticação',
    description: 'Possível ataque de força bruta',
    actor_type: 'USER' as const,
    action: 'AUTH_FAILURE',
    threshold_count: 10,
    threshold_window_seconds: 300,
    channel_inapp: true,
    channel_email: true,
    channel_whatsapp: true,
  },
  {
    name: 'API externa fora do escopo',
    description: 'Token de API acessando módulo não autorizado',
    actor_type: 'API' as const,
    action: 'CROSS_TENANT_ATTEMPT',
    threshold_count: undefined,
    threshold_window_seconds: undefined,
    channel_inapp: true,
    channel_email: true,
    channel_whatsapp: true,
  },
]

async function main() {
  console.log('Criando regras de alerta padrão...')

  for (const rule of DEFAULT_RULES) {
    const exists = await prisma.regraAlerta.findFirst({
      where: { name: rule.name, tenant_id: null },
    })

    if (exists) {
      console.log(`  ~ ${rule.name} (já existe, pulando)`)
      continue
    }

    await prisma.regraAlerta.create({
      data: {
        tenant_id: null,
        name: rule.name,
        description: rule.description,
        enabled: true,
        actor_type: rule.actor_type,
        action: rule.action ?? null,
        threshold_count: rule.threshold_count ?? null,
        threshold_window_seconds: rule.threshold_window_seconds ?? null,
        channel_inapp: rule.channel_inapp,
        channel_email: rule.channel_email,
        channel_whatsapp: rule.channel_whatsapp,
        recipients_email: [],
        recipients_whatsapp: [],
        recipients_user_ids: [],
      },
    })
    console.log(`  ✓ ${rule.name}`)
  }

  console.log('Concluído.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
