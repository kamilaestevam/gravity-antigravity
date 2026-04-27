/**
 * masterData.ts — Dados Mestres (publicos, sem auth)
 * GET /portos          Buscar portos/aeroportos
 * GET /incoterms       Lista de incoterms
 * GET /modais          Lista de modais
 * GET /moedas          Lista de moedas
 * GET /paises          Lista de paises
 * GET /containers      Tipos de container
 */

import { Router, Request, Response } from 'express'
import { prisma } from '../middleware/tenantIsolation.js'

const router = Router()

// GET /portos?q=&tipo=&pais=
router.get('/portos', async (req: Request, res: Response) => {
  try {
    const { q, tipo, pais, limit = '50' } = req.query as { q?: string; tipo?: string; pais?: string; limit?: string }

    const where: Record<string, unknown> = { ativo: true }
    if (tipo) where.tipo = tipo
    if (pais) where.pais_codigo = pais
    if (q) {
      where.OR = [
        { nome: { contains: q, mode: 'insensitive' } },
        { codigo: { contains: q.toUpperCase() } },
      ]
    }

    const portos = await (prisma as any).freteIntBidPortosCadastro.findMany({
      where,
      take: Number(limit),
      orderBy: { nome: 'asc' },
    })

    res.json({ portos })
  } catch {
    res.json({ portos: [] })
  }
})

// GET /incoterms
router.get('/incoterms', (_req: Request, res: Response) => {
  res.json({
    incoterms: [
      { codigo: 'EXW', nome: 'Ex Works', grupo: 'E', descricao: 'O vendedor disponibiliza a mercadoria em seu estabelecimento' },
      { codigo: 'FCA', nome: 'Free Carrier', grupo: 'F', descricao: 'Vendedor entrega a mercadoria ao transportador indicado pelo comprador' },
      { codigo: 'FAS', nome: 'Free Alongside Ship', grupo: 'F', descricao: 'Vendedor entrega a mercadoria ao lado do navio' },
      { codigo: 'FOB', nome: 'Free On Board', grupo: 'F', descricao: 'Vendedor entrega a mercadoria a bordo do navio' },
      { codigo: 'CFR', nome: 'Cost and Freight', grupo: 'C', descricao: 'Vendedor paga frete ate o porto de destino' },
      { codigo: 'CIF', nome: 'Cost, Insurance and Freight', grupo: 'C', descricao: 'Vendedor paga frete e seguro ate o destino' },
      { codigo: 'CPT', nome: 'Carriage Paid To', grupo: 'C', descricao: 'Vendedor paga transporte ate local designado' },
      { codigo: 'CIP', nome: 'Carriage and Insurance Paid To', grupo: 'C', descricao: 'Vendedor paga transporte e seguro ate destino' },
      { codigo: 'DAP', nome: 'Delivered at Place', grupo: 'D', descricao: 'Vendedor entrega no local designado, sem descarregar' },
      { codigo: 'DPU', nome: 'Delivered at Place Unloaded', grupo: 'D', descricao: 'Vendedor entrega e descarrega no local designado' },
      { codigo: 'DDP', nome: 'Delivered Duty Paid', grupo: 'D', descricao: 'Vendedor entrega desembaracada no destino' },
    ],
  })
})

// GET /modais
router.get('/modais', (_req: Request, res: Response) => {
  res.json({
    modais: [
      { codigo: 'MARITIMO', nome: 'Maritimo', modalidades: [
        { codigo: 'FCL', nome: 'Full Container Load' },
        { codigo: 'LCL', nome: 'Less than Container Load' },
      ]},
      { codigo: 'AEREO', nome: 'Aereo', modalidades: [
        { codigo: 'AEREO_GERAL', nome: 'Carga Geral' },
      ]},
      { codigo: 'RODOVIARIO', nome: 'Rodoviario', modalidades: [
        { codigo: 'RODOVIARIO_FTL', nome: 'Full Truck Load' },
        { codigo: 'RODOVIARIO_LTL', nome: 'Less than Truck Load' },
      ]},
    ],
  })
})

// GET /moedas
router.get('/moedas', (_req: Request, res: Response) => {
  res.json({
    moedas: [
      { codigo: 'USD', nome: 'Dolar Americano', simbolo: '$' },
      { codigo: 'BRL', nome: 'Real Brasileiro', simbolo: 'R$' },
      { codigo: 'EUR', nome: 'Euro', simbolo: '\u20ac' },
      { codigo: 'CNY', nome: 'Yuan Chines', simbolo: '\u00a5' },
      { codigo: 'GBP', nome: 'Libra Esterlina', simbolo: '\u00a3' },
      { codigo: 'JPY', nome: 'Iene Japones', simbolo: '\u00a5' },
    ],
  })
})

// GET /paises
router.get('/paises', (_req: Request, res: Response) => {
  res.json({
    paises: [
      { codigo: 'BR', nome: 'Brasil' }, { codigo: 'CN', nome: 'China' },
      { codigo: 'US', nome: 'Estados Unidos' }, { codigo: 'DE', nome: 'Alemanha' },
      { codigo: 'JP', nome: 'Japao' }, { codigo: 'KR', nome: 'Coreia do Sul' },
      { codigo: 'IN', nome: 'India' }, { codigo: 'IT', nome: 'Italia' },
      { codigo: 'FR', nome: 'Franca' }, { codigo: 'GB', nome: 'Reino Unido' },
      { codigo: 'ES', nome: 'Espanha' }, { codigo: 'NL', nome: 'Holanda' },
      { codigo: 'BE', nome: 'Belgica' }, { codigo: 'AR', nome: 'Argentina' },
      { codigo: 'CL', nome: 'Chile' }, { codigo: 'MX', nome: 'Mexico' },
      { codigo: 'CO', nome: 'Colombia' }, { codigo: 'PE', nome: 'Peru' },
      { codigo: 'TW', nome: 'Taiwan' }, { codigo: 'TH', nome: 'Tailandia' },
      { codigo: 'VN', nome: 'Vietna' }, { codigo: 'MY', nome: 'Malasia' },
      { codigo: 'SG', nome: 'Cingapura' }, { codigo: 'AE', nome: 'Emirados Arabes' },
      { codigo: 'TR', nome: 'Turquia' }, { codigo: 'ZA', nome: 'Africa do Sul' },
      { codigo: 'AU', nome: 'Australia' }, { codigo: 'CA', nome: 'Canada' },
      { codigo: 'PT', nome: 'Portugal' }, { codigo: 'PY', nome: 'Paraguai' },
    ],
  })
})

// GET /containers
router.get('/containers', (_req: Request, res: Response) => {
  res.json({
    containers: [
      { codigo: '20DRY', nome: "20' Dry Standard", teus: 1 },
      { codigo: '40DRY', nome: "40' Dry Standard", teus: 2 },
      { codigo: '40HC', nome: "40' High Cube", teus: 2 },
      { codigo: '20RF', nome: "20' Reefer", teus: 1 },
      { codigo: '40RF', nome: "40' Reefer", teus: 2 },
      { codigo: '20OT', nome: "20' Open Top", teus: 1 },
      { codigo: '40OT', nome: "40' Open Top", teus: 2 },
      { codigo: '20FR', nome: "20' Flat Rack", teus: 1 },
      { codigo: '40FR', nome: "40' Flat Rack", teus: 2 },
      { codigo: '20TK', nome: "20' Tank", teus: 1 },
    ],
  })
})

export { router as masterDataRouter }
