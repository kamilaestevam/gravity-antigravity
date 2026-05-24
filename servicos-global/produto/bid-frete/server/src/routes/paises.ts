/**
 * paises.ts — Lista estatica de paises para comercio exterior (publico, sem auth)
 * GET /paises?q=&limit=50
 *
 * Origem: master data estatico para selects de pais em cotacoes BID Frete.
 */

import { Router, Request, Response } from 'express'

const router = Router()

const PAISES = [
  { id_pais: 'clp_br', nome_pais_portugues: 'Brasil', codigo_pais_iso_alpha2: 'BR' },
  { id_pais: 'clp_us', nome_pais_portugues: 'Estados Unidos', codigo_pais_iso_alpha2: 'US' },
  { id_pais: 'clp_cn', nome_pais_portugues: 'China', codigo_pais_iso_alpha2: 'CN' },
  { id_pais: 'clp_de', nome_pais_portugues: 'Alemanha', codigo_pais_iso_alpha2: 'DE' },
  { id_pais: 'clp_jp', nome_pais_portugues: 'Japao', codigo_pais_iso_alpha2: 'JP' },
  { id_pais: 'clp_kr', nome_pais_portugues: 'Coreia do Sul', codigo_pais_iso_alpha2: 'KR' },
  { id_pais: 'clp_it', nome_pais_portugues: 'Italia', codigo_pais_iso_alpha2: 'IT' },
  { id_pais: 'clp_fr', nome_pais_portugues: 'Franca', codigo_pais_iso_alpha2: 'FR' },
  { id_pais: 'clp_gb', nome_pais_portugues: 'Reino Unido', codigo_pais_iso_alpha2: 'GB' },
  { id_pais: 'clp_es', nome_pais_portugues: 'Espanha', codigo_pais_iso_alpha2: 'ES' },
  { id_pais: 'clp_pt', nome_pais_portugues: 'Portugal', codigo_pais_iso_alpha2: 'PT' },
  { id_pais: 'clp_in', nome_pais_portugues: 'India', codigo_pais_iso_alpha2: 'IN' },
  { id_pais: 'clp_mx', nome_pais_portugues: 'Mexico', codigo_pais_iso_alpha2: 'MX' },
  { id_pais: 'clp_ar', nome_pais_portugues: 'Argentina', codigo_pais_iso_alpha2: 'AR' },
  { id_pais: 'clp_cl', nome_pais_portugues: 'Chile', codigo_pais_iso_alpha2: 'CL' },
  { id_pais: 'clp_co', nome_pais_portugues: 'Colombia', codigo_pais_iso_alpha2: 'CO' },
  { id_pais: 'clp_pe', nome_pais_portugues: 'Peru', codigo_pais_iso_alpha2: 'PE' },
  { id_pais: 'clp_uy', nome_pais_portugues: 'Uruguai', codigo_pais_iso_alpha2: 'UY' },
  { id_pais: 'clp_py', nome_pais_portugues: 'Paraguai', codigo_pais_iso_alpha2: 'PY' },
  { id_pais: 'clp_nl', nome_pais_portugues: 'Holanda', codigo_pais_iso_alpha2: 'NL' },
  { id_pais: 'clp_be', nome_pais_portugues: 'Belgica', codigo_pais_iso_alpha2: 'BE' },
  { id_pais: 'clp_th', nome_pais_portugues: 'Tailandia', codigo_pais_iso_alpha2: 'TH' },
  { id_pais: 'clp_vn', nome_pais_portugues: 'Vietna', codigo_pais_iso_alpha2: 'VN' },
  { id_pais: 'clp_id', nome_pais_portugues: 'Indonesia', codigo_pais_iso_alpha2: 'ID' },
  { id_pais: 'clp_my', nome_pais_portugues: 'Malasia', codigo_pais_iso_alpha2: 'MY' },
  { id_pais: 'clp_sg', nome_pais_portugues: 'Singapura', codigo_pais_iso_alpha2: 'SG' },
  { id_pais: 'clp_tw', nome_pais_portugues: 'Taiwan', codigo_pais_iso_alpha2: 'TW' },
  { id_pais: 'clp_tr', nome_pais_portugues: 'Turquia', codigo_pais_iso_alpha2: 'TR' },
  { id_pais: 'clp_ae', nome_pais_portugues: 'Emirados Arabes', codigo_pais_iso_alpha2: 'AE' },
  { id_pais: 'clp_sa', nome_pais_portugues: 'Arabia Saudita', codigo_pais_iso_alpha2: 'SA' },
  { id_pais: 'clp_ca', nome_pais_portugues: 'Canada', codigo_pais_iso_alpha2: 'CA' },
  { id_pais: 'clp_au', nome_pais_portugues: 'Australia', codigo_pais_iso_alpha2: 'AU' },
  { id_pais: 'clp_ru', nome_pais_portugues: 'Russia', codigo_pais_iso_alpha2: 'RU' },
  { id_pais: 'clp_eg', nome_pais_portugues: 'Egito', codigo_pais_iso_alpha2: 'EG' },
  { id_pais: 'clp_za', nome_pais_portugues: 'Africa do Sul', codigo_pais_iso_alpha2: 'ZA' },
  { id_pais: 'clp_ma', nome_pais_portugues: 'Marrocos', codigo_pais_iso_alpha2: 'MA' },
  { id_pais: 'clp_pa', nome_pais_portugues: 'Panama', codigo_pais_iso_alpha2: 'PA' },
  { id_pais: 'clp_ch', nome_pais_portugues: 'Suica', codigo_pais_iso_alpha2: 'CH' },
  { id_pais: 'clp_at', nome_pais_portugues: 'Austria', codigo_pais_iso_alpha2: 'AT' },
  { id_pais: 'clp_se', nome_pais_portugues: 'Suecia', codigo_pais_iso_alpha2: 'SE' },
  { id_pais: 'clp_no', nome_pais_portugues: 'Noruega', codigo_pais_iso_alpha2: 'NO' },
  { id_pais: 'clp_dk', nome_pais_portugues: 'Dinamarca', codigo_pais_iso_alpha2: 'DK' },
  { id_pais: 'clp_pl', nome_pais_portugues: 'Polonia', codigo_pais_iso_alpha2: 'PL' },
  { id_pais: 'clp_cz', nome_pais_portugues: 'Republica Tcheca', codigo_pais_iso_alpha2: 'CZ' },
]

// GET /paises?q=&limit=50
router.get('/paises', (req: Request, res: Response) => {
  const q = ((req.query.q as string) ?? '').toLowerCase()
  const limit = Math.min(Number(req.query.limit) || 50, 200)

  let resultado = PAISES

  if (q) {
    resultado = resultado.filter(
      (p) =>
        p.nome_pais_portugues.toLowerCase().includes(q) ||
        p.codigo_pais_iso_alpha2.toLowerCase().includes(q),
    )
  }

  res.json({ paises: resultado.slice(0, limit) })
})

export { router as paisesRouter }
