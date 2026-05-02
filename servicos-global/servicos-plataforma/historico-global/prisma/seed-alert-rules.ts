/**
 * Seed das regras de alerta padrão (globais — id_organizacao = null).
 * Executar após a migração: npx tsx prisma/seed-alert-rules.ts
 */
import { PrismaClient } from '../../generated/index.js'

const prisma = new PrismaClient()

const DEFAULT_RULES = [
  {
    nome_regra_alerta: 'Ação em massa por usuário',
    descricao_regra_alerta: 'Mesmo usuário executando muitas ações em curto período',
    tipo_ator_regra_alerta: 'USUARIO' as const,
    limiar_contagem_regra_alerta: 50,
    limiar_janela_segundos_regra_alerta: 60,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: false,
    canal_whatsapp_regra_alerta: false,
  },
  {
    nome_regra_alerta: 'IA executando ações destrutivas',
    descricao_regra_alerta: 'GABI/IA executando DELETE ou UPDATE em massa',
    tipo_ator_regra_alerta: 'IA' as const,
    acao_regra_alerta: 'DELETE',
    limiar_contagem_regra_alerta: 10,
    limiar_janela_segundos_regra_alerta: 60,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: true,
    canal_whatsapp_regra_alerta: false,
  },
  {
    nome_regra_alerta: 'Job interno falhando repetidamente',
    descricao_regra_alerta: 'Worker com falhas consecutivas no mesmo recurso',
    tipo_ator_regra_alerta: 'JOB' as const,
    acao_regra_alerta: 'JOB_FAILURE',
    limiar_contagem_regra_alerta: 5,
    limiar_janela_segundos_regra_alerta: 300,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: false,
    canal_whatsapp_regra_alerta: false,
  },
  {
    nome_regra_alerta: 'Integração com alto volume de acesso',
    descricao_regra_alerta: 'ERP ou transportadora acessando dados em volume anormal',
    tipo_ator_regra_alerta: 'INTEGRACAO' as const,
    limiar_contagem_regra_alerta: 100,
    limiar_janela_segundos_regra_alerta: 60,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: true,
    canal_whatsapp_regra_alerta: false,
  },
  {
    nome_regra_alerta: 'Múltiplas falhas de autenticação',
    descricao_regra_alerta: 'Possível ataque de força bruta',
    tipo_ator_regra_alerta: 'USUARIO' as const,
    acao_regra_alerta: 'AUTH_FAILURE',
    limiar_contagem_regra_alerta: 10,
    limiar_janela_segundos_regra_alerta: 300,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: true,
    canal_whatsapp_regra_alerta: true,
  },
  {
    nome_regra_alerta: 'API externa fora do escopo',
    descricao_regra_alerta: 'Token de API acessando módulo não autorizado',
    tipo_ator_regra_alerta: 'API' as const,
    acao_regra_alerta: 'CROSS_TENANT_ATTEMPT',
    limiar_contagem_regra_alerta: undefined,
    limiar_janela_segundos_regra_alerta: undefined,
    canal_inapp_regra_alerta: true,
    canal_email_regra_alerta: true,
    canal_whatsapp_regra_alerta: true,
  },
]

async function main() {
  console.log('Criando regras de alerta padrão...')

  for (const rule of DEFAULT_RULES) {
    const exists = await prisma.alertaRegra.findFirst({
      where: { nome_regra_alerta: rule.nome_regra_alerta, id_organizacao: null },
    })

    if (exists) {
      console.log(`  ~ ${rule.nome_regra_alerta} (já existe, pulando)`)
      continue
    }

    await prisma.alertaRegra.create({
      data: {
        id_organizacao: null,
        nome_regra_alerta: rule.nome_regra_alerta,
        descricao_regra_alerta: rule.descricao_regra_alerta,
        habilitada_regra_alerta: true,
        tipo_ator_regra_alerta: rule.tipo_ator_regra_alerta,
        acao_regra_alerta: rule.acao_regra_alerta ?? null,
        limiar_contagem_regra_alerta: rule.limiar_contagem_regra_alerta ?? null,
        limiar_janela_segundos_regra_alerta: rule.limiar_janela_segundos_regra_alerta ?? null,
        canal_inapp_regra_alerta: rule.canal_inapp_regra_alerta,
        canal_email_regra_alerta: rule.canal_email_regra_alerta,
        canal_whatsapp_regra_alerta: rule.canal_whatsapp_regra_alerta,
        destinatarios_email_regra_alerta: [],
        destinatarios_whatsapp_regra_alerta: [],
        destinatarios_usuarios_regra_alerta: [],
      },
    })
    console.log(`  ✓ ${rule.nome_regra_alerta}`)
  }

  console.log('Concluído.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
