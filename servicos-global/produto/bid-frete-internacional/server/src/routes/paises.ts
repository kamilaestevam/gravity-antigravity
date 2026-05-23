/**
 * paises.ts — Lista estática de países (publico, sem auth)
 * GET /paises?q=&limit=50
 *
 * Fonte temporária até Cadastros Pais estar acessível via cross-service.
 */

import { Router, Request, Response } from 'express'

const router = Router()

const PAISES_ESTATICOS = [
  { id_pais: 'BR', nome_pais_portugues: 'Brasil', codigo_pais_iso_alpha2: 'BR' },
  { id_pais: 'US', nome_pais_portugues: 'Estados Unidos', codigo_pais_iso_alpha2: 'US' },
  { id_pais: 'CN', nome_pais_portugues: 'China', codigo_pais_iso_alpha2: 'CN' },
  { id_pais: 'DE', nome_pais_portugues: 'Alemanha', codigo_pais_iso_alpha2: 'DE' },
  { id_pais: 'JP', nome_pais_portugues: 'Japão', codigo_pais_iso_alpha2: 'JP' },
  { id_pais: 'KR', nome_pais_portugues: 'Coreia do Sul', codigo_pais_iso_alpha2: 'KR' },
  { id_pais: 'GB', nome_pais_portugues: 'Reino Unido', codigo_pais_iso_alpha2: 'GB' },
  { id_pais: 'FR', nome_pais_portugues: 'França', codigo_pais_iso_alpha2: 'FR' },
  { id_pais: 'IT', nome_pais_portugues: 'Itália', codigo_pais_iso_alpha2: 'IT' },
  { id_pais: 'ES', nome_pais_portugues: 'Espanha', codigo_pais_iso_alpha2: 'ES' },
  { id_pais: 'PT', nome_pais_portugues: 'Portugal', codigo_pais_iso_alpha2: 'PT' },
  { id_pais: 'NL', nome_pais_portugues: 'Países Baixos', codigo_pais_iso_alpha2: 'NL' },
  { id_pais: 'BE', nome_pais_portugues: 'Bélgica', codigo_pais_iso_alpha2: 'BE' },
  { id_pais: 'AR', nome_pais_portugues: 'Argentina', codigo_pais_iso_alpha2: 'AR' },
  { id_pais: 'CL', nome_pais_portugues: 'Chile', codigo_pais_iso_alpha2: 'CL' },
  { id_pais: 'CO', nome_pais_portugues: 'Colômbia', codigo_pais_iso_alpha2: 'CO' },
  { id_pais: 'PE', nome_pais_portugues: 'Peru', codigo_pais_iso_alpha2: 'PE' },
  { id_pais: 'UY', nome_pais_portugues: 'Uruguai', codigo_pais_iso_alpha2: 'UY' },
  { id_pais: 'PY', nome_pais_portugues: 'Paraguai', codigo_pais_iso_alpha2: 'PY' },
  { id_pais: 'MX', nome_pais_portugues: 'México', codigo_pais_iso_alpha2: 'MX' },
  { id_pais: 'PA', nome_pais_portugues: 'Panamá', codigo_pais_iso_alpha2: 'PA' },
  { id_pais: 'SG', nome_pais_portugues: 'Singapura', codigo_pais_iso_alpha2: 'SG' },
  { id_pais: 'HK', nome_pais_portugues: 'Hong Kong', codigo_pais_iso_alpha2: 'HK' },
  { id_pais: 'TW', nome_pais_portugues: 'Taiwan', codigo_pais_iso_alpha2: 'TW' },
  { id_pais: 'TH', nome_pais_portugues: 'Tailândia', codigo_pais_iso_alpha2: 'TH' },
  { id_pais: 'VN', nome_pais_portugues: 'Vietnã', codigo_pais_iso_alpha2: 'VN' },
  { id_pais: 'MY', nome_pais_portugues: 'Malásia', codigo_pais_iso_alpha2: 'MY' },
  { id_pais: 'ID', nome_pais_portugues: 'Indonésia', codigo_pais_iso_alpha2: 'ID' },
  { id_pais: 'IN', nome_pais_portugues: 'Índia', codigo_pais_iso_alpha2: 'IN' },
  { id_pais: 'AE', nome_pais_portugues: 'Emirados Árabes', codigo_pais_iso_alpha2: 'AE' },
  { id_pais: 'SA', nome_pais_portugues: 'Arábia Saudita', codigo_pais_iso_alpha2: 'SA' },
  { id_pais: 'ZA', nome_pais_portugues: 'África do Sul', codigo_pais_iso_alpha2: 'ZA' },
  { id_pais: 'EG', nome_pais_portugues: 'Egito', codigo_pais_iso_alpha2: 'EG' },
  { id_pais: 'MA', nome_pais_portugues: 'Marrocos', codigo_pais_iso_alpha2: 'MA' },
  { id_pais: 'AU', nome_pais_portugues: 'Austrália', codigo_pais_iso_alpha2: 'AU' },
  { id_pais: 'CA', nome_pais_portugues: 'Canadá', codigo_pais_iso_alpha2: 'CA' },
  { id_pais: 'GR', nome_pais_portugues: 'Grécia', codigo_pais_iso_alpha2: 'GR' },
  { id_pais: 'TR', nome_pais_portugues: 'Turquia', codigo_pais_iso_alpha2: 'TR' },
  { id_pais: 'PL', nome_pais_portugues: 'Polônia', codigo_pais_iso_alpha2: 'PL' },
  { id_pais: 'SE', nome_pais_portugues: 'Suécia', codigo_pais_iso_alpha2: 'SE' },
  { id_pais: 'NO', nome_pais_portugues: 'Noruega', codigo_pais_iso_alpha2: 'NO' },
  { id_pais: 'DK', nome_pais_portugues: 'Dinamarca', codigo_pais_iso_alpha2: 'DK' },
  { id_pais: 'FI', nome_pais_portugues: 'Finlândia', codigo_pais_iso_alpha2: 'FI' },
  { id_pais: 'BO', nome_pais_portugues: 'Bolívia', codigo_pais_iso_alpha2: 'BO' },
]

router.get('/paises', (req: Request, res: Response) => {
  const { q, limit = '50' } = req.query as { q?: string; limit?: string }

  let resultado = PAISES_ESTATICOS
  if (q) {
    const busca = q.toLowerCase()
    resultado = resultado.filter(p =>
      p.nome_pais_portugues.toLowerCase().includes(busca) ||
      p.codigo_pais_iso_alpha2.toLowerCase().includes(busca)
    )
  }

  res.json({ paises: resultado.slice(0, Number(limit)) })
})

export { router as paisesRouter }
