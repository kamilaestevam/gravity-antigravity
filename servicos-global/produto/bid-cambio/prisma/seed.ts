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
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      razao_social_corretora_bid_cambio: 'Cambio Express Corretora de Cambio Ltda',
      nome_fantasia_corretora_bid_cambio: 'Cambio Express',
      cnpj_corretora_bid_cambio: '12345678000101',
      tipo_corretora_bid_cambio: 'CORRETORA_CAMBIO',
      status_corretora_bid_cambio: 'ATIVA',
      email_corretora_bid_cambio: 'cotacoes@cambioexpress.com.br',
      telefone_corretora_bid_cambio: '(11) 3456-7890',
      contato_nome_corretora_bid_cambio: 'Carlos Silva',
      contato_cargo_corretora_bid_cambio: 'Operador de Mesa',
      portal_habilitado_corretora_bid_cambio: true,
      moedas_operadas_corretora_bid_cambio: 'USD,EUR,GBP',
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      razao_social_corretora_bid_cambio: 'Banco Internacional do Comercio S.A.',
      nome_fantasia_corretora_bid_cambio: 'BIC Bank',
      cnpj_corretora_bid_cambio: '98765432000199',
      tipo_corretora_bid_cambio: 'BANCO_COMERCIAL',
      status_corretora_bid_cambio: 'ATIVA',
      email_corretora_bid_cambio: 'cambio@bicbank.com.br',
      telefone_corretora_bid_cambio: '(11) 2345-6789',
      contato_nome_corretora_bid_cambio: 'Ana Ferreira',
      contato_cargo_corretora_bid_cambio: 'Gerente de Cambio',
      portal_habilitado_corretora_bid_cambio: true,
      moedas_operadas_corretora_bid_cambio: 'USD,EUR,GBP,CHF,JPY',
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      razao_social_corretora_bid_cambio: 'FastFX Cambio Digital Ltda',
      nome_fantasia_corretora_bid_cambio: 'FastFX',
      cnpj_corretora_bid_cambio: '55544433000122',
      tipo_corretora_bid_cambio: 'FINTECH',
      status_corretora_bid_cambio: 'ATIVA',
      email_corretora_bid_cambio: 'ops@fastfx.com.br',
      telefone_corretora_bid_cambio: '(21) 9999-8888',
      contato_nome_corretora_bid_cambio: 'Lucas Mendes',
      contato_cargo_corretora_bid_cambio: 'Head of Trading',
      portal_habilitado_corretora_bid_cambio: false,
      moedas_operadas_corretora_bid_cambio: 'USD,EUR',
    },
  ]

  const created = await prisma.bidCambioCorretora.createMany({ data: corretoras as any })
  console.log(`[seed] ${created.count} corretoras criadas`)
  return prisma.bidCambioCorretora.findMany({ where: { id_organizacao: DEMO_TENANT_ID } })
}

async function seedParcelas() {
  const hoje = new Date()
  const parcelas = [
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      referencia_processo_parcela_bid_cambio: 'IMP-2026-001',
      numero_pedido_parcela_bid_cambio: 'PO-10501',
      exportador_parcela_bid_cambio: 'Shanghai Electronics Co.',
      moeda_parcela_bid_cambio: 'USD',
      cambio_total_parcela_bid_cambio: 120000,
      porcentagem_parcela_bid_cambio: 30,
      valor_a_pagar_parcela_bid_cambio: 36000,
      valor_a_pagar_brl_parcela_bid_cambio: 187200,
      numero_parcela_bid_cambio: 1,
      total_parcelas_parcela_bid_cambio: 3,
      status_parcela_bid_cambio: 'PENDENTE',
      metodo_vencimento_parcela_bid_cambio: 'DATA_EMBARQUE',
      prazo_dias_parcela_bid_cambio: 30,
      data_vencimento_parcela_bid_cambio: new Date(hoje.getTime() + 15 * 86400000),
      data_embarque_final_parcela_bid_cambio: new Date(hoje.getTime() - 15 * 86400000),
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      referencia_processo_parcela_bid_cambio: 'IMP-2026-001',
      numero_pedido_parcela_bid_cambio: 'PO-10501',
      exportador_parcela_bid_cambio: 'Shanghai Electronics Co.',
      moeda_parcela_bid_cambio: 'USD',
      cambio_total_parcela_bid_cambio: 120000,
      porcentagem_parcela_bid_cambio: 40,
      valor_a_pagar_parcela_bid_cambio: 48000,
      valor_a_pagar_brl_parcela_bid_cambio: 249600,
      numero_parcela_bid_cambio: 2,
      total_parcelas_parcela_bid_cambio: 3,
      status_parcela_bid_cambio: 'PENDENTE',
      metodo_vencimento_parcela_bid_cambio: 'DATA_CHEGADA',
      prazo_dias_parcela_bid_cambio: 10,
      data_vencimento_parcela_bid_cambio: new Date(hoje.getTime() + 35 * 86400000),
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      referencia_processo_parcela_bid_cambio: 'IMP-2026-001',
      numero_pedido_parcela_bid_cambio: 'PO-10501',
      exportador_parcela_bid_cambio: 'Shanghai Electronics Co.',
      moeda_parcela_bid_cambio: 'USD',
      cambio_total_parcela_bid_cambio: 120000,
      porcentagem_parcela_bid_cambio: 30,
      valor_a_pagar_parcela_bid_cambio: 36000,
      valor_a_pagar_brl_parcela_bid_cambio: 187200,
      numero_parcela_bid_cambio: 3,
      total_parcelas_parcela_bid_cambio: 3,
      status_parcela_bid_cambio: 'PENDENTE',
      metodo_vencimento_parcela_bid_cambio: 'DATA_DESEMBARACO',
      prazo_dias_parcela_bid_cambio: 15,
      data_vencimento_parcela_bid_cambio: new Date(hoje.getTime() + 60 * 86400000),
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      referencia_processo_parcela_bid_cambio: 'IMP-2026-002',
      numero_pedido_parcela_bid_cambio: 'PO-10520',
      exportador_parcela_bid_cambio: 'Bayern Machinery GmbH',
      moeda_parcela_bid_cambio: 'EUR',
      cambio_total_parcela_bid_cambio: 85000,
      porcentagem_parcela_bid_cambio: 50,
      valor_a_pagar_parcela_bid_cambio: 42500,
      valor_a_pagar_brl_parcela_bid_cambio: 243950,
      numero_parcela_bid_cambio: 1,
      total_parcelas_parcela_bid_cambio: 2,
      status_parcela_bid_cambio: 'AGENDADO',
      data_vencimento_parcela_bid_cambio: new Date(hoje.getTime() + 5 * 86400000),
      data_agendamento_parcela_bid_cambio: new Date(hoje.getTime() + 5 * 86400000),
    },
    {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      id_usuario: DEMO_USER_ID,
      referencia_processo_parcela_bid_cambio: 'EXP-2026-003',
      numero_pedido_parcela_bid_cambio: 'PO-10530',
      exportador_parcela_bid_cambio: 'Destino: London Trading Ltd',
      moeda_parcela_bid_cambio: 'GBP',
      cambio_total_parcela_bid_cambio: 45000,
      porcentagem_parcela_bid_cambio: 100,
      valor_a_pagar_parcela_bid_cambio: 45000,
      valor_a_pagar_brl_parcela_bid_cambio: 292500,
      numero_parcela_bid_cambio: 1,
      total_parcelas_parcela_bid_cambio: 1,
      status_parcela_bid_cambio: 'PAGO',
      data_vencimento_parcela_bid_cambio: new Date(hoje.getTime() - 10 * 86400000),
      data_pagamento_parcela_bid_cambio: new Date(hoje.getTime() - 8 * 86400000),
      taxa_fechamento_parcela_bid_cambio: 6.5000,
      banco_corretora_parcela_bid_cambio: 'BIC Bank',
      valor_pago_parcela_bid_cambio: 45000,
      valor_pago_brl_parcela_bid_cambio: 292500,
    },
  ]

  const created = await prisma.bidCambioParcela.createMany({ data: parcelas as any })
  console.log(`[seed] ${created.count} parcelas criadas`)
}

async function seedPreferencias() {
  await prisma.bidCambioPreferenciaUsuario.upsert({
    where: { id_organizacao: DEMO_TENANT_ID },
    update: {},
    create: {
      id_organizacao: DEMO_TENANT_ID,
      id_produto_gravity: 'bid-cambio',
      mostrar_no_financeiro_preferencia_bid_cambio: true,
      alerta_email_vencimento_preferencia_bid_cambio: true,
      dias_antecedencia_alerta_preferencia_bid_cambio: 7,
      enviar_email_exportador_preferencia_bid_cambio: false,
      enviar_email_fim_de_semana_preferencia_bid_cambio: false,
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
