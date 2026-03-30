/**
 * seed.ts — Dados demo para BID Cambio
 * Cria corretoras, parcelas, cotacoes e preferencias de exemplo
 * Executar: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEMO_TENANT_ID = process.env.SEED_TENANT_ID ?? 'tenant-demo-001'
const DEMO_USER_ID = process.env.SEED_USER_ID ?? 'user-demo-001'

async function seedCorretoras() {
  const corretoras = [
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      razao_social: 'Cambio Express Corretora de Cambio Ltda',
      nome_fantasia: 'Cambio Express',
      cnpj: '12345678000101',
      tipo: 'CORRETORA_CAMBIO',
      status: 'ATIVA',
      email: 'cotacoes@cambioexpress.com.br',
      telefone: '(11) 3456-7890',
      contato_nome: 'Carlos Silva',
      contato_cargo: 'Operador de Mesa',
      portal_habilitado: true,
      moedas_operadas: 'USD,EUR,GBP',
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      razao_social: 'Banco Internacional do Comercio S.A.',
      nome_fantasia: 'BIC Bank',
      cnpj: '98765432000199',
      tipo: 'BANCO_COMERCIAL',
      status: 'ATIVA',
      email: 'cambio@bicbank.com.br',
      telefone: '(11) 2345-6789',
      contato_nome: 'Ana Ferreira',
      contato_cargo: 'Gerente de Cambio',
      portal_habilitado: true,
      moedas_operadas: 'USD,EUR,GBP,CHF,JPY',
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      razao_social: 'FastFX Cambio Digital Ltda',
      nome_fantasia: 'FastFX',
      cnpj: '55544433000122',
      tipo: 'FINTECH',
      status: 'ATIVA',
      email: 'ops@fastfx.com.br',
      telefone: '(21) 9999-8888',
      contato_nome: 'Lucas Mendes',
      contato_cargo: 'Head of Trading',
      portal_habilitado: false,
      moedas_operadas: 'USD,EUR',
    },
  ]

  const created = await prisma.corretora.createMany({ data: corretoras as any })
  console.log(`[seed] ${created.count} corretoras criadas`)
  return prisma.corretora.findMany({ where: { tenant_id: DEMO_TENANT_ID } })
}

async function seedParcelas() {
  const hoje = new Date()
  const parcelas = [
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      referencia_processo: 'IMP-2026-001',
      numero_pedido: 'PO-10501',
      exportador: 'Shanghai Electronics Co.',
      moeda: 'USD',
      cambio_total: 120000,
      porcentagem_parcela: 30,
      valor_a_pagar: 36000,
      valor_a_pagar_brl: 187200,
      numero_parcela: 1,
      total_parcelas: 3,
      status: 'PENDENTE',
      metodo_vencimento: 'DATA_EMBARQUE',
      prazo_dias: 30,
      data_vencimento: new Date(hoje.getTime() + 15 * 86400000),
      data_embarque_final: new Date(hoje.getTime() - 15 * 86400000),
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      referencia_processo: 'IMP-2026-001',
      numero_pedido: 'PO-10501',
      exportador: 'Shanghai Electronics Co.',
      moeda: 'USD',
      cambio_total: 120000,
      porcentagem_parcela: 40,
      valor_a_pagar: 48000,
      valor_a_pagar_brl: 249600,
      numero_parcela: 2,
      total_parcelas: 3,
      status: 'PENDENTE',
      metodo_vencimento: 'DATA_CHEGADA',
      prazo_dias: 10,
      data_vencimento: new Date(hoje.getTime() + 35 * 86400000),
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      referencia_processo: 'IMP-2026-001',
      numero_pedido: 'PO-10501',
      exportador: 'Shanghai Electronics Co.',
      moeda: 'USD',
      cambio_total: 120000,
      porcentagem_parcela: 30,
      valor_a_pagar: 36000,
      valor_a_pagar_brl: 187200,
      numero_parcela: 3,
      total_parcelas: 3,
      status: 'PENDENTE',
      metodo_vencimento: 'DATA_DESEMBARACO',
      prazo_dias: 15,
      data_vencimento: new Date(hoje.getTime() + 60 * 86400000),
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      referencia_processo: 'IMP-2026-002',
      numero_pedido: 'PO-10520',
      exportador: 'Bayern Machinery GmbH',
      moeda: 'EUR',
      cambio_total: 85000,
      porcentagem_parcela: 50,
      valor_a_pagar: 42500,
      valor_a_pagar_brl: 243950,
      numero_parcela: 1,
      total_parcelas: 2,
      status: 'AGENDADO',
      data_vencimento: new Date(hoje.getTime() + 5 * 86400000),
      data_agendamento: new Date(hoje.getTime() + 5 * 86400000),
    },
    {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      user_id: DEMO_USER_ID,
      referencia_processo: 'EXP-2026-003',
      numero_pedido: 'PO-10530',
      exportador: 'Destino: London Trading Ltd',
      moeda: 'GBP',
      cambio_total: 45000,
      porcentagem_parcela: 100,
      valor_a_pagar: 45000,
      valor_a_pagar_brl: 292500,
      numero_parcela: 1,
      total_parcelas: 1,
      status: 'PAGO',
      data_vencimento: new Date(hoje.getTime() - 10 * 86400000),
      data_pagamento: new Date(hoje.getTime() - 8 * 86400000),
      taxa_fechamento: 6.5000,
      banco_corretora: 'BIC Bank',
      valor_pago: 45000,
      valor_pago_brl: 292500,
    },
  ]

  const created = await prisma.parcelaCambio.createMany({ data: parcelas as any })
  console.log(`[seed] ${created.count} parcelas criadas`)
}

async function seedPreferencias() {
  await prisma.preferenciaCambio.upsert({
    where: { tenant_id: DEMO_TENANT_ID },
    update: {},
    create: {
      tenant_id: DEMO_TENANT_ID,
      product_id: 'bid-cambio',
      mostrar_no_financeiro: true,
      alerta_email_vencimento: true,
      dias_antecedencia_alerta: 7,
      enviar_email_exportador: false,
      enviar_email_fim_de_semana: false,
    },
  })
  console.log(`[seed] Preferencias do tenant criadas`)
}

async function main() {
  console.log(`[seed] Iniciando seed para tenant: ${DEMO_TENANT_ID}`)

  await seedCorretoras()
  await seedParcelas()
  await seedPreferencias()

  console.log(`[seed] Seed concluido com sucesso`)
}

main()
  .catch((err) => {
    console.error('[seed] Erro:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
