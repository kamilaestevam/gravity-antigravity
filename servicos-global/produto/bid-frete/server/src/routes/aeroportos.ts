/**
 * aeroportos.ts — Lista estatica de aeroportos de carga (publico, sem auth)
 * GET /aeroportos?q=&pais=&limit=50
 *
 * Origem: master data estatico para selects de aeroporto em cotacoes BID Frete (modal aereo).
 */

import { Router, Request, Response } from 'express'

const router = Router()

const AEROPORTOS = [
  // Brasil
  { id_aeroporto: 'cla_gru', codigo_iata_aeroporto: 'GRU', nome_aeroporto: 'Aeroporto Internacional de Guarulhos', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'cla_vcp', codigo_iata_aeroporto: 'VCP', nome_aeroporto: 'Aeroporto Internacional de Viracopos', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'cla_gig', codigo_iata_aeroporto: 'GIG', nome_aeroporto: 'Aeroporto Internacional do Galeao', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'cla_cwb', codigo_iata_aeroporto: 'CWB', nome_aeroporto: 'Aeroporto Internacional de Curitiba', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'cla_poa', codigo_iata_aeroporto: 'POA', nome_aeroporto: 'Aeroporto Internacional de Porto Alegre', codigo_pais_aeroporto: 'BR' },
  // Estados Unidos
  { id_aeroporto: 'cla_jfk', codigo_iata_aeroporto: 'JFK', nome_aeroporto: 'John F. Kennedy International Airport', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'cla_lax', codigo_iata_aeroporto: 'LAX', nome_aeroporto: 'Los Angeles International Airport', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'cla_ord', codigo_iata_aeroporto: 'ORD', nome_aeroporto: "Chicago O'Hare International Airport", codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'cla_mia', codigo_iata_aeroporto: 'MIA', nome_aeroporto: 'Miami International Airport', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'cla_atl', codigo_iata_aeroporto: 'ATL', nome_aeroporto: 'Hartsfield-Jackson Atlanta International Airport', codigo_pais_aeroporto: 'US' },
  // China
  { id_aeroporto: 'cla_pvg', codigo_iata_aeroporto: 'PVG', nome_aeroporto: 'Shanghai Pudong International Airport', codigo_pais_aeroporto: 'CN' },
  { id_aeroporto: 'cla_pek', codigo_iata_aeroporto: 'PEK', nome_aeroporto: 'Beijing Capital International Airport', codigo_pais_aeroporto: 'CN' },
  // Hong Kong
  { id_aeroporto: 'cla_hkg', codigo_iata_aeroporto: 'HKG', nome_aeroporto: 'Hong Kong International Airport', codigo_pais_aeroporto: 'HK' },
  // Japao
  { id_aeroporto: 'cla_nrt', codigo_iata_aeroporto: 'NRT', nome_aeroporto: 'Narita International Airport', codigo_pais_aeroporto: 'JP' },
  // Coreia do Sul
  { id_aeroporto: 'cla_icn', codigo_iata_aeroporto: 'ICN', nome_aeroporto: 'Incheon International Airport', codigo_pais_aeroporto: 'KR' },
  // Singapura
  { id_aeroporto: 'cla_sin', codigo_iata_aeroporto: 'SIN', nome_aeroporto: 'Singapore Changi Airport', codigo_pais_aeroporto: 'SG' },
  // Emirados Arabes
  { id_aeroporto: 'cla_dxb', codigo_iata_aeroporto: 'DXB', nome_aeroporto: 'Dubai International Airport', codigo_pais_aeroporto: 'AE' },
  // Alemanha
  { id_aeroporto: 'cla_fra', codigo_iata_aeroporto: 'FRA', nome_aeroporto: 'Frankfurt Airport', codigo_pais_aeroporto: 'DE' },
  // Holanda
  { id_aeroporto: 'cla_ams', codigo_iata_aeroporto: 'AMS', nome_aeroporto: 'Amsterdam Airport Schiphol', codigo_pais_aeroporto: 'NL' },
  // Reino Unido
  { id_aeroporto: 'cla_lhr', codigo_iata_aeroporto: 'LHR', nome_aeroporto: 'London Heathrow Airport', codigo_pais_aeroporto: 'GB' },
  // Franca
  { id_aeroporto: 'cla_cdg', codigo_iata_aeroporto: 'CDG', nome_aeroporto: 'Paris Charles de Gaulle Airport', codigo_pais_aeroporto: 'FR' },
  // Italia
  { id_aeroporto: 'cla_mxp', codigo_iata_aeroporto: 'MXP', nome_aeroporto: 'Milan Malpensa Airport', codigo_pais_aeroporto: 'IT' },
  // Espanha
  { id_aeroporto: 'cla_mad', codigo_iata_aeroporto: 'MAD', nome_aeroporto: 'Aeropuerto Adolfo Suarez Madrid-Barajas', codigo_pais_aeroporto: 'ES' },
  // Portugal
  { id_aeroporto: 'cla_lis', codigo_iata_aeroporto: 'LIS', nome_aeroporto: 'Aeroporto Humberto Delgado Lisboa', codigo_pais_aeroporto: 'PT' },
  // Argentina
  { id_aeroporto: 'cla_eze', codigo_iata_aeroporto: 'EZE', nome_aeroporto: 'Aeropuerto Internacional Ministro Pistarini', codigo_pais_aeroporto: 'AR' },
  // Chile
  { id_aeroporto: 'cla_scl', codigo_iata_aeroporto: 'SCL', nome_aeroporto: 'Aeropuerto Internacional Arturo Merino Benitez', codigo_pais_aeroporto: 'CL' },
  // Colombia
  { id_aeroporto: 'cla_bog', codigo_iata_aeroporto: 'BOG', nome_aeroporto: 'Aeropuerto Internacional El Dorado', codigo_pais_aeroporto: 'CO' },
  // Mexico
  { id_aeroporto: 'cla_mex', codigo_iata_aeroporto: 'MEX', nome_aeroporto: 'Aeropuerto Internacional Benito Juarez', codigo_pais_aeroporto: 'MX' },
  // Panama
  { id_aeroporto: 'cla_pty', codigo_iata_aeroporto: 'PTY', nome_aeroporto: 'Aeropuerto Internacional de Tocumen', codigo_pais_aeroporto: 'PA' },
]

// GET /aeroportos?q=&pais=&limit=50
router.get('/aeroportos', (req: Request, res: Response) => {
  const q = ((req.query.q as string) ?? '').toLowerCase()
  const pais = ((req.query.pais as string) ?? '').toUpperCase()
  const limit = Math.min(Number(req.query.limit) || 50, 200)

  let resultado = AEROPORTOS

  if (pais) {
    resultado = resultado.filter((a) => a.codigo_pais_aeroporto === pais)
  }

  if (q) {
    resultado = resultado.filter(
      (a) =>
        a.nome_aeroporto.toLowerCase().includes(q) ||
        a.codigo_iata_aeroporto.toLowerCase().includes(q),
    )
  }

  res.json({ aeroportos: resultado.slice(0, limit) })
})

export { router as aeroportosRouter }
