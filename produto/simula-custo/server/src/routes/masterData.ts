/**
 * masterData.ts — Rotas GET /api/v1/simula-custo (master data público)
 * Endpoints para busca de NCMs, Países e Unidades Federativas.
 * Skill: antigravity-criar-produto (Passo 7)
 */

import { Router, Request, Response } from 'express'
import { siscomex } from '../connectors/siscomex.js'

export const masterDataRouter = Router()

// Dados estáticos de UFs com alíquotas internas padrão de ICMS
const BRAZIL_UFS = [
  { uf: 'AC', nome: 'Acre', icms: 0.17 },
  { uf: 'AL', nome: 'Alagoas', icms: 0.17 },
  { uf: 'AM', nome: 'Amazonas', icms: 0.20 },
  { uf: 'AP', nome: 'Amapá', icms: 0.18 },
  { uf: 'BA', nome: 'Bahia', icms: 0.19 },
  { uf: 'CE', nome: 'Ceará', icms: 0.18 },
  { uf: 'DF', nome: 'Distrito Federal', icms: 0.18 },
  { uf: 'ES', nome: 'Espírito Santo', icms: 0.17 },
  { uf: 'GO', nome: 'Goiás', icms: 0.17 },
  { uf: 'MA', nome: 'Maranhão', icms: 0.22 },
  { uf: 'MG', nome: 'Minas Gerais', icms: 0.18 },
  { uf: 'MS', nome: 'Mato Grosso do Sul', icms: 0.17 },
  { uf: 'MT', nome: 'Mato Grosso', icms: 0.17 },
  { uf: 'PA', nome: 'Pará', icms: 0.19 },
  { uf: 'PB', nome: 'Paraíba', icms: 0.18 },
  { uf: 'PE', nome: 'Pernambuco', icms: 0.20 },
  { uf: 'PI', nome: 'Piauí', icms: 0.21 },
  { uf: 'PR', nome: 'Paraná', icms: 0.19 },
  { uf: 'RJ', nome: 'Rio de Janeiro', icms: 0.20 },
  { uf: 'RN', nome: 'Rio Grande do Norte', icms: 0.18 },
  { uf: 'RO', nome: 'Rondônia', icms: 0.175 },
  { uf: 'RR', nome: 'Roraima', icms: 0.17 },
  { uf: 'RS', nome: 'Rio Grande do Sul', icms: 0.17 },
  { uf: 'SC', nome: 'Santa Catarina', icms: 0.17 },
  { uf: 'SE', nome: 'Sergipe', icms: 0.18 },
  { uf: 'SP', nome: 'São Paulo', icms: 0.18 },
  { uf: 'TO', nome: 'Tocantins', icms: 0.18 },
].sort((a, b) => a.uf.localeCompare(b.uf))

// Países ISO 3166-1 alpha-2 mais usados em operações de comércio exterior
const ISO_COUNTRIES = [
  { codigo: 'AR', nome: 'Argentina' },
  { codigo: 'AU', nome: 'Austrália' },
  { codigo: 'AT', nome: 'Áustria' },
  { codigo: 'BE', nome: 'Bélgica' },
  { codigo: 'BO', nome: 'Bolívia' },
  { codigo: 'CA', nome: 'Canadá' },
  { codigo: 'CL', nome: 'Chile' },
  { codigo: 'CN', nome: 'China' },
  { codigo: 'CO', nome: 'Colômbia' },
  { codigo: 'KR', nome: 'Coreia do Sul' },
  { codigo: 'DK', nome: 'Dinamarca' },
  { codigo: 'EG', nome: 'Egito' },
  { codigo: 'ES', nome: 'Espanha' },
  { codigo: 'FR', nome: 'França' },
  { codigo: 'DE', nome: 'Alemanha' },
  { codigo: 'IN', nome: 'Índia' },
  { codigo: 'ID', nome: 'Indonésia' },
  { codigo: 'IL', nome: 'Israel' },
  { codigo: 'IT', nome: 'Itália' },
  { codigo: 'JP', nome: 'Japão' },
  { codigo: 'MX', nome: 'México' },
  { codigo: 'NL', nome: 'Países Baixos' },
  { codigo: 'NO', nome: 'Noruega' },
  { codigo: 'PY', nome: 'Paraguai' },
  { codigo: 'PE', nome: 'Peru' },
  { codigo: 'PL', nome: 'Polônia' },
  { codigo: 'PT', nome: 'Portugal' },
  { codigo: 'GB', nome: 'Reino Unido' },
  { codigo: 'RU', nome: 'Rússia' },
  { codigo: 'SE', nome: 'Suécia' },
  { codigo: 'CH', nome: 'Suíça' },
  { codigo: 'TW', nome: 'Taiwan' },
  { codigo: 'TH', nome: 'Tailândia' },
  { codigo: 'TR', nome: 'Turquia' },
  { codigo: 'UY', nome: 'Uruguai' },
  { codigo: 'US', nome: 'Estados Unidos' },
  { codigo: 'VE', nome: 'Venezuela' },
  { codigo: 'VN', nome: 'Vietnã' },
].sort((a, b) => a.nome.localeCompare(b.nome, 'pt'))

/**
 * GET /api/v1/simula-custo/ncm/buscar?q={termo}
 */
masterDataRouter.get('/ncm/buscar', async (req: Request, res: Response) => {
  const query = String(req.query.q || '')
  if (query.length < 3) return res.json([])

  try {
    if (query.startsWith('8471')) {
      return res.json([
        { codigo: '84713012', descricao: 'Microcomputadores portáteis com tela (Laptop)' },
        { codigo: '84713019', descricao: 'Outras unidades digitais de processamento' }
      ])
    }
    return res.json([])
  } catch {
    return res.status(500).json({ error: 'Erro ao buscar NCM' })
  }
})

/**
 * GET /api/v1/simula-custo/paises
 */
masterDataRouter.get('/paises', (_req, res) => {
  res.json(ISO_COUNTRIES)
})

/**
 * GET /api/v1/simula-custo/unidades-federativas
 */
masterDataRouter.get('/unidades-federativas', (_req, res) => {
  res.json(BRAZIL_UFS)
})
