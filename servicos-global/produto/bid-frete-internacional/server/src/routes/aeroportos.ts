/**
 * aeroportos.ts — Lista estática de aeroportos (publico, sem auth)
 * GET /aeroportos?q=&pais=&limit=50
 *
 * Fonte temporária até Cadastros Aeroporto estar acessível via cross-service.
 */

import { Router, Request, Response } from 'express'

const router = Router()

const AEROPORTOS_ESTATICOS = [
  // Brasil
  { id_aeroporto: 'GRU', codigo_iata_aeroporto: 'GRU', nome_aeroporto: 'Guarulhos (São Paulo)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'VCP', codigo_iata_aeroporto: 'VCP', nome_aeroporto: 'Viracopos (Campinas)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'GIG', codigo_iata_aeroporto: 'GIG', nome_aeroporto: 'Galeão (Rio de Janeiro)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'CWB', codigo_iata_aeroporto: 'CWB', nome_aeroporto: 'Afonso Pena (Curitiba)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'POA', codigo_iata_aeroporto: 'POA', nome_aeroporto: 'Salgado Filho (Porto Alegre)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'SSA', codigo_iata_aeroporto: 'SSA', nome_aeroporto: 'Luís Eduardo Magalhães (Salvador)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'REC', codigo_iata_aeroporto: 'REC', nome_aeroporto: 'Guararapes (Recife)', codigo_pais_aeroporto: 'BR' },
  { id_aeroporto: 'MAO', codigo_iata_aeroporto: 'MAO', nome_aeroporto: 'Eduardo Gomes (Manaus)', codigo_pais_aeroporto: 'BR' },
  // EUA
  { id_aeroporto: 'JFK', codigo_iata_aeroporto: 'JFK', nome_aeroporto: 'John F. Kennedy (New York)', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'LAX', codigo_iata_aeroporto: 'LAX', nome_aeroporto: 'Los Angeles International', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'MIA', codigo_iata_aeroporto: 'MIA', nome_aeroporto: 'Miami International', codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'ORD', codigo_iata_aeroporto: 'ORD', nome_aeroporto: "O'Hare (Chicago)", codigo_pais_aeroporto: 'US' },
  { id_aeroporto: 'ATL', codigo_iata_aeroporto: 'ATL', nome_aeroporto: 'Hartsfield-Jackson (Atlanta)', codigo_pais_aeroporto: 'US' },
  // Europa
  { id_aeroporto: 'FRA', codigo_iata_aeroporto: 'FRA', nome_aeroporto: 'Frankfurt am Main', codigo_pais_aeroporto: 'DE' },
  { id_aeroporto: 'AMS', codigo_iata_aeroporto: 'AMS', nome_aeroporto: 'Schiphol (Amsterdam)', codigo_pais_aeroporto: 'NL' },
  { id_aeroporto: 'LHR', codigo_iata_aeroporto: 'LHR', nome_aeroporto: 'Heathrow (London)', codigo_pais_aeroporto: 'GB' },
  { id_aeroporto: 'CDG', codigo_iata_aeroporto: 'CDG', nome_aeroporto: 'Charles de Gaulle (Paris)', codigo_pais_aeroporto: 'FR' },
  { id_aeroporto: 'MAD', codigo_iata_aeroporto: 'MAD', nome_aeroporto: 'Barajas (Madrid)', codigo_pais_aeroporto: 'ES' },
  { id_aeroporto: 'MXP', codigo_iata_aeroporto: 'MXP', nome_aeroporto: 'Malpensa (Milan)', codigo_pais_aeroporto: 'IT' },
  // Ásia
  { id_aeroporto: 'PVG', codigo_iata_aeroporto: 'PVG', nome_aeroporto: 'Pudong (Shanghai)', codigo_pais_aeroporto: 'CN' },
  { id_aeroporto: 'HKG', codigo_iata_aeroporto: 'HKG', nome_aeroporto: 'Hong Kong International', codigo_pais_aeroporto: 'HK' },
  { id_aeroporto: 'NRT', codigo_iata_aeroporto: 'NRT', nome_aeroporto: 'Narita (Tokyo)', codigo_pais_aeroporto: 'JP' },
  { id_aeroporto: 'ICN', codigo_iata_aeroporto: 'ICN', nome_aeroporto: 'Incheon (Seoul)', codigo_pais_aeroporto: 'KR' },
  { id_aeroporto: 'SIN', codigo_iata_aeroporto: 'SIN', nome_aeroporto: 'Changi (Singapore)', codigo_pais_aeroporto: 'SG' },
  { id_aeroporto: 'BKK', codigo_iata_aeroporto: 'BKK', nome_aeroporto: 'Suvarnabhumi (Bangkok)', codigo_pais_aeroporto: 'TH' },
  // Oriente Médio
  { id_aeroporto: 'DXB', codigo_iata_aeroporto: 'DXB', nome_aeroporto: 'Dubai International', codigo_pais_aeroporto: 'AE' },
  { id_aeroporto: 'DOH', codigo_iata_aeroporto: 'DOH', nome_aeroporto: 'Hamad (Doha)', codigo_pais_aeroporto: 'QA' },
  // América do Sul
  { id_aeroporto: 'EZE', codigo_iata_aeroporto: 'EZE', nome_aeroporto: 'Ezeiza (Buenos Aires)', codigo_pais_aeroporto: 'AR' },
  { id_aeroporto: 'SCL', codigo_iata_aeroporto: 'SCL', nome_aeroporto: 'Arturo Merino Benítez (Santiago)', codigo_pais_aeroporto: 'CL' },
  { id_aeroporto: 'BOG', codigo_iata_aeroporto: 'BOG', nome_aeroporto: 'El Dorado (Bogotá)', codigo_pais_aeroporto: 'CO' },
  { id_aeroporto: 'LIM', codigo_iata_aeroporto: 'LIM', nome_aeroporto: 'Jorge Chávez (Lima)', codigo_pais_aeroporto: 'PE' },
]

router.get('/aeroportos', (req: Request, res: Response) => {
  const { q, pais, limit = '50' } = req.query as { q?: string; pais?: string; limit?: string }

  let resultado = AEROPORTOS_ESTATICOS
  if (pais) resultado = resultado.filter(a => a.codigo_pais_aeroporto === pais.toUpperCase())
  if (q) {
    const busca = q.toLowerCase()
    resultado = resultado.filter(a =>
      a.nome_aeroporto.toLowerCase().includes(busca) ||
      a.codigo_iata_aeroporto.toLowerCase().includes(busca)
    )
  }

  res.json({ aeroportos: resultado.slice(0, Number(limit)) })
})

export { router as aeroportosRouter }
