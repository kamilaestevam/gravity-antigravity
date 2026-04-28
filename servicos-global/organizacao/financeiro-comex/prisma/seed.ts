/**
 * seed.ts — Seed do catálogo padrão de categorias (Financeiro Comex)
 * Fonte: planilha oficial fornecida pelo dono do produto (2026-03-31)
 *
 * Uso: npm run db:seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tenant/company de seed (para dev local)
const SEED_TENANT = process.env.SEED_TENANT_ID || 'seed-tenant'
const SEED_COMPANY = process.env.SEED_COMPANY_ID || 'seed-company'

interface CategoriaInput {
  codigo: string
  nome: string
  grupo_custo: 'IMPOSTOS_FEDERAIS' | 'CUSTO_OPERACIONAL'
  tipo_operacao?: 'IMPORTACAO' | 'EXPORTACAO' | null
}

const CATEGORIAS: CategoriaInput[] = [
  // Grupo 1 — Impostos Federais (apenas IMPORTACAO)
  { codigo: '001', nome: 'Imposto: I.I - Imposto de Importacao', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '002', nome: 'Imposto: IPI', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '003', nome: 'Imposto: PIS', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '004', nome: 'Imposto: COFINS', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '005', nome: 'Imposto: ICMS', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '006', nome: 'Apuracao de IPI', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '007', nome: 'Apuracao de PIS', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '008', nome: 'Apuracao de Cofins', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '009', nome: 'Apuracao de ICMS', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '010', nome: 'Marinha Mercante (AFRMM)', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },
  { codigo: '011', nome: 'Taxa Siscomex', grupo_custo: 'IMPOSTOS_FEDERAIS', tipo_operacao: 'IMPORTACAO' },

  // Custos de Valor Aduaneiro (ambas)
  { codigo: '100', nome: 'Ad valorem', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '101', nome: 'Ad valorem - Transporte rodoviario', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '102', nome: 'Ad valorem - DTA', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Armazenagem (ambas)
  { codigo: '200', nome: 'Armazenagem', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '201', nome: 'Armazenagem na zona primaria', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '202', nome: 'Armazenagem na zona secundaria', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '203', nome: 'Armazenagem - DTA', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '204', nome: 'Armazenagem Infraero', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Frete e Transporte (ambas)
  { codigo: '300', nome: 'Frete Internacional', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '301', nome: 'Frete Rodoviario', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '302', nome: 'Frete Aereo Interno', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '303', nome: 'BAF (Bunker Adjustment Factor)', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '304', nome: 'Bunker', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Taxas Portuarias e Aeroportuarias (ambas)
  { codigo: '400', nome: 'THC (Terminal Handling Charge)', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '401', nome: 'Liberacao de HAWB / HBL', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '402', nome: 'Desconsolidacao', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '403', nome: 'Collect Fee', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '404', nome: 'Gate-in / Gate-out', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Container (ambas)
  { codigo: '500', nome: 'Carregamento de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '501', nome: 'Carregamento de container cheio', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '502', nome: 'Carregamento de container vazio', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '503', nome: 'Fumigacao de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '504', nome: 'Conserto de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '505', nome: 'Lavagem de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '506', nome: 'Levante container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '507', nome: 'Devolucao de container no porto', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '508', nome: 'Lacre', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '509', nome: 'Chapas', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '510', nome: 'Material para carregamento de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '511', nome: 'Material para descarregamento de container', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '512', nome: 'Empilhadeira', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Servicos e Taxas Diversas (ambas)
  { codigo: '600', nome: 'Taxa Administrativa', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '601', nome: 'Despacho Aduaneiro', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '602', nome: 'Pesagem', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '603', nome: 'Capatazia', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '604', nome: 'Auditoria', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '605', nome: 'Seguro Internacional', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '606', nome: 'Atestado', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '607', nome: 'Atestado Fiesc', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '608', nome: 'Atestado Fiesc - Imobilizado', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '609', nome: 'Certificado', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '610', nome: 'Certificado de origem', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Cambio (ambas)
  { codigo: '700', nome: 'Cambio', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '701', nome: 'Parcela do cambio', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },
  { codigo: '702', nome: 'Taxas do CE (Collect)', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: null },

  // Exportacao only
  { codigo: '800', nome: 'Frete de Exportacao', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: 'EXPORTACAO' },
  { codigo: '801', nome: 'Seguro de Exportacao', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: 'EXPORTACAO' },
  { codigo: '802', nome: 'Despesa Bancaria (Exportacao)', grupo_custo: 'CUSTO_OPERACIONAL', tipo_operacao: 'EXPORTACAO' },
]

async function main() {
  console.log('Seeding categorias padrao do Financeiro Comex...')

  let criadas = 0
  let ignoradas = 0

  for (const cat of CATEGORIAS) {
    const existing = await prisma.financeiroCategorias.findFirst({
      where: {
        tenant_id: SEED_TENANT,
        company_id: SEED_COMPANY,
        codigo: cat.codigo,
      },
    })

    if (existing) {
      ignoradas++
      continue
    }

    await prisma.financeiroCategorias.create({
      data: {
        tenant_id: SEED_TENANT,
        company_id: SEED_COMPANY,
        codigo: cat.codigo,
        nome: cat.nome,
        grupo_custo: cat.grupo_custo,
        tipo_operacao: cat.tipo_operacao ?? null,
        ativo: true,
      },
    })
    criadas++
  }

  console.log(`Seed concluido: ${criadas} criadas, ${ignoradas} ja existiam`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
