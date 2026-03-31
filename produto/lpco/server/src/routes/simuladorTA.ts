/**
 * simuladorTA.ts — Simulador de Tratamento Administrativo
 * NCM + operacao → orgaos anuentes + modelos obrigatorios
 */

import { Router, Request, Response, NextFunction } from 'express'
import { z } from 'zod'

const router = Router()

const SimularQuerySchema = z.object({
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 digitos'),
  operacao: z.enum(['IMPORTACAO', 'EXPORTACAO']),
})

const REGRAS_TA: Record<string, Array<{ sigla: string; modelo: string; obrigatorio: boolean; descricao: string }>> = {
  '01': [{ sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria animal' }],
  '02': [{ sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria carnes' }],
  '03': [
    { sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria pescados' },
    { sigla: 'IBAMA', modelo: 'I00012', obrigatorio: false, descricao: 'Controle CITES (se especie protegida)' },
  ],
  '04': [{ sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria laticinios' }],
  '05': [{ sigla: 'MAPA', modelo: 'I00001', obrigatorio: true, descricao: 'Licenca sanitaria subprodutos animais' }],
  '06': [{ sigla: 'MAPA', modelo: 'I00002', obrigatorio: true, descricao: 'Fitossanitario plantas vivas' }],
  '07': [{ sigla: 'MAPA', modelo: 'I00002', obrigatorio: true, descricao: 'Fitossanitario horticolas' }],
  '08': [{ sigla: 'MAPA', modelo: 'I00002', obrigatorio: true, descricao: 'Fitossanitario frutas' }],
  '27': [{ sigla: 'ANP', modelo: 'I00008', obrigatorio: true, descricao: 'Autorizacao ANP combustiveis' }],
  '28': [
    { sigla: 'DPF', modelo: 'I00015', obrigatorio: false, descricao: 'Precursores quimicos (se listado)' },
    { sigla: 'CNEN', modelo: 'I00018', obrigatorio: false, descricao: 'Material radioativo (se aplicavel)' },
  ],
  '29': [{ sigla: 'DPF', modelo: 'I00015', obrigatorio: false, descricao: 'Precursores quimicos (se listado)' }],
  '30': [{ sigla: 'ANVISA', modelo: 'I00004', obrigatorio: true, descricao: 'Registro ANVISA medicamentos' }],
  '33': [{ sigla: 'ANVISA', modelo: 'I00005', obrigatorio: true, descricao: 'Registro ANVISA cosmeticos' }],
  '38': [
    { sigla: 'MAPA', modelo: 'I00003', obrigatorio: false, descricao: 'Registro MAPA agrotoxicos (se aplicavel)' },
    { sigla: 'IBAMA', modelo: 'I00013', obrigatorio: false, descricao: 'Licenca ambiental IBAMA' },
  ],
  '84': [{ sigla: 'INMETRO', modelo: 'I00007', obrigatorio: false, descricao: 'Conformidade INMETRO (se listado)' }],
  '85': [{ sigla: 'INMETRO', modelo: 'I00007', obrigatorio: false, descricao: 'Conformidade INMETRO (se listado)' }],
  '93': [
    { sigla: 'DFPC', modelo: 'I00016', obrigatorio: true, descricao: 'Autorizacao Exercito armas/municao' },
    { sigla: 'DPF', modelo: 'I00017', obrigatorio: true, descricao: 'Autorizacao PF armas' },
  ],
}

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = SimularQuerySchema.parse(req.query)
    const capitulo = query.ncm.substring(0, 2)

    const regras = REGRAS_TA[capitulo] ?? []

    res.json({
      ncm: query.ncm,
      capitulo,
      operacao: query.operacao,
      orgaos: regras,
      total: regras.length,
      fonte: 'base_local',
    })
  } catch (err) { next(err) }
})

export { router as simuladorTARouter }
