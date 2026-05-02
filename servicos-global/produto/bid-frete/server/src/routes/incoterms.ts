/**
 * incoterms.ts — Lista estatica de incoterms (publico, sem auth)
 * GET /incoterms
 *
 * Origem: split de masterData.ts (Gamma-3).
 */

import { Router, Request, Response } from 'express'

const router = Router()

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

export { router as incotermsRouter }
