/**
 * seed-fornecedores.ts — Seed de fornecedores para demo
 * Execução: npx tsx prisma/seed-fornecedores.ts
 * Requer tenant_id como argumento: npx tsx prisma/seed-fornecedores.ts <tenant_id>
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const FORNECEDORES = [
  // ─── ARMADORES ───────────────────────────────────────────────────────────────
  { nome: 'MSC - Mediterranean Shipping Company', nome_fantasia: 'MSC', tipo: 'ARMADOR', email: 'quotes@msc.com', pais: 'Suíça', cidade: 'Genebra', website: 'https://www.msc.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Maersk Line', nome_fantasia: 'Maersk', tipo: 'ARMADOR', email: 'spot@maersk.com', pais: 'Dinamarca', cidade: 'Copenhague', website: 'https://www.maersk.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'CMA CGM Group', nome_fantasia: 'CMA CGM', tipo: 'ARMADOR', email: 'quotes@cma-cgm.com', pais: 'França', cidade: 'Marselha', website: 'https://www.cma-cgm.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Hapag-Lloyd AG', nome_fantasia: 'Hapag-Lloyd', tipo: 'ARMADOR', email: 'booking@hapag-lloyd.com', pais: 'Alemanha', cidade: 'Hamburgo', website: 'https://www.hapag-lloyd.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'ONE - Ocean Network Express', nome_fantasia: 'ONE', tipo: 'ARMADOR', email: 'quotes@one-line.com', pais: 'Japão', cidade: 'Tóquio', website: 'https://www.one-line.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Evergreen Marine Corporation', nome_fantasia: 'Evergreen', tipo: 'ARMADOR', email: 'quotes@evergreen-marine.com', pais: 'Taiwan', cidade: 'Taipei', website: 'https://www.evergreen-marine.com', aceita_cotacao_aberta: false, cotacao_automatica: false },
  { nome: 'COSCO Shipping Lines', nome_fantasia: 'COSCO', tipo: 'ARMADOR', email: 'quotes@cosco.com', pais: 'China', cidade: 'Shanghai', website: 'https://www.cosco.com', aceita_cotacao_aberta: true, cotacao_automatica: false },

  // ─── AGENTES DE CARGA ────────────────────────────────────────────────────────
  { nome: 'Asia Shipping Transportes Internacionais', nome_fantasia: 'Asia Shipping', tipo: 'AGENTE_CARGA', email: 'cotacao@asiashipping.com.br', telefone: '+551130032000', whatsapp: '+5511999001234', pais: 'Brasil', cidade: 'São Paulo', website: 'https://www.asiashipping.com.br', aceita_cotacao_aberta: true, cotacao_automatica: true },
  { nome: 'DHL Global Forwarding', nome_fantasia: 'DHL', tipo: 'AGENTE_CARGA', email: 'quotes.br@dhl.com', telefone: '+551140041234', pais: 'Alemanha', cidade: 'Bonn', website: 'https://www.dhl.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Kuehne + Nagel', nome_fantasia: 'K+N', tipo: 'AGENTE_CARGA', email: 'quotes.sao@kuehne-nagel.com', pais: 'Suíça', cidade: 'Schindellegi', website: 'https://www.kuehne-nagel.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'DB Schenker', nome_fantasia: 'Schenker', tipo: 'AGENTE_CARGA', email: 'ocean.br@dbschenker.com', pais: 'Alemanha', cidade: 'Essen', website: 'https://www.dbschenker.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Expeditors International', nome_fantasia: 'Expeditors', tipo: 'AGENTE_CARGA', email: 'quotes.sao@expeditors.com', pais: 'Estados Unidos', cidade: 'Seattle', website: 'https://www.expeditors.com', aceita_cotacao_aberta: false, cotacao_automatica: false },
  { nome: 'Panalpina (DSV)', nome_fantasia: 'DSV Panalpina', tipo: 'AGENTE_CARGA', email: 'airfreight.br@dsv.com', pais: 'Dinamarca', cidade: 'Hedehusene', website: 'https://www.dsv.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Hellmann Worldwide Logistics', nome_fantasia: 'Hellmann', tipo: 'AGENTE_CARGA', email: 'brasil@hellmann.com', telefone: '+551132325000', whatsapp: '+5511998887777', pais: 'Alemanha', cidade: 'Osnabrück', website: 'https://www.hellmann.com', aceita_cotacao_aberta: true, cotacao_automatica: true },

  // ─── COMPANHIAS AÉREAS (CARGO) ───────────────────────────────────────────────
  { nome: 'LATAM Cargo', nome_fantasia: 'LATAM Cargo', tipo: 'CIA_AEREA', email: 'cargo.quotes@latam.com', pais: 'Chile', cidade: 'Santiago', website: 'https://www.latamcargo.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Lufthansa Cargo', nome_fantasia: 'LH Cargo', tipo: 'CIA_AEREA', email: 'ecargo@lufthansa-cargo.com', pais: 'Alemanha', cidade: 'Frankfurt', website: 'https://www.lufthansa-cargo.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Emirates SkyCargo', nome_fantasia: 'Emirates Cargo', tipo: 'CIA_AEREA', email: 'skycargo@emirates.com', pais: 'Emirados Árabes', cidade: 'Dubai', website: 'https://www.skycargo.com', aceita_cotacao_aberta: true, cotacao_automatica: false },
  { nome: 'Turkish Cargo', nome_fantasia: 'Turkish Cargo', tipo: 'CIA_AEREA', email: 'cargo@thy.com', pais: 'Turquia', cidade: 'Istambul', website: 'https://www.turkishcargo.com', aceita_cotacao_aberta: true, cotacao_automatica: false },

  // ─── TRANSPORTADORAS RODOVIÁRIAS ─────────────────────────────────────────────
  { nome: 'Andreani Logística', nome_fantasia: 'Andreani', tipo: 'TRANSPORTADORA', email: 'comercial@andreani.com', pais: 'Argentina', cidade: 'Buenos Aires', website: 'https://www.andreani.com', aceita_cotacao_aberta: false, cotacao_automatica: false },
  { nome: 'Jamef Transportes', nome_fantasia: 'Jamef', tipo: 'TRANSPORTADORA', email: 'comercial@jamef.com.br', telefone: '+553140208888', pais: 'Brasil', cidade: 'Contagem', website: 'https://www.jamef.com.br', aceita_cotacao_aberta: true, cotacao_automatica: false },
]

async function seed() {
  const tenantId = process.argv[2]
  if (!tenantId) {
    console.error('Uso: npx tsx prisma/seed-fornecedores.ts <tenant_id>')
    process.exit(1)
  }

  console.log(`[Seed] Inserindo ${FORNECEDORES.length} fornecedores para tenant ${tenantId}...`)

  let inserted = 0
  for (const forn of FORNECEDORES) {
    try {
      await prisma.fornecedor.create({
        data: {
          ...forn,
          tenant_id: tenantId,
          product_id: 'bid-frete',
          status: 'ATIVO',
        } as any,
      } as any)
      inserted++
    } catch (err: any) {
      if (err.code === 'P2002') {
        console.log(`  → Já existe: ${forn.nome_fantasia ?? forn.nome}`)
      } else {
        console.warn(`  → Erro: ${forn.nome}: ${err.message}`)
      }
    }
  }

  console.log(`[Seed] Concluído: ${inserted} fornecedores inseridos`)
  await prisma.$disconnect()
}

seed().catch(err => {
  console.error('[Seed] Erro:', err)
  prisma.$disconnect()
  process.exit(1)
})
