/**
 * portos.ts — Lista estática de portos marítimos (publico, sem auth)
 * GET /portos?q=&pais=&limit=50
 *
 * Fonte temporária até Cadastros Porto estar seedeado.
 * Quando o seed UN/LOCODE estiver pronto, trocar para
 * fetch cross-service ao Cadastros (porta 8031).
 */

import { Router, Request, Response } from 'express'

const router = Router()

const PORTOS_ESTATICOS = [
  // Brasil
  { codigo: 'BRSSZ', nome: 'Santos', pais: 'BR' },
  { codigo: 'BRPNG', nome: 'Paranaguá', pais: 'BR' },
  { codigo: 'BRITJ', nome: 'Itajaí', pais: 'BR' },
  { codigo: 'BRRIG', nome: 'Rio Grande', pais: 'BR' },
  { codigo: 'BRSFS', nome: 'São Francisco do Sul', pais: 'BR' },
  { codigo: 'BRVIX', nome: 'Vitória', pais: 'BR' },
  { codigo: 'BRRIO', nome: 'Rio de Janeiro', pais: 'BR' },
  { codigo: 'BRSSA', nome: 'Salvador', pais: 'BR' },
  { codigo: 'BRMAO', nome: 'Manaus', pais: 'BR' },
  { codigo: 'BRREC', nome: 'Recife', pais: 'BR' },
  { codigo: 'BRFOR', nome: 'Fortaleza', pais: 'BR' },
  { codigo: 'BRBEL', nome: 'Belém', pais: 'BR' },
  // EUA
  { codigo: 'USNYC', nome: 'New York / New Jersey', pais: 'US' },
  { codigo: 'USLAX', nome: 'Los Angeles', pais: 'US' },
  { codigo: 'USLGB', nome: 'Long Beach', pais: 'US' },
  { codigo: 'USSAV', nome: 'Savannah', pais: 'US' },
  { codigo: 'USHOU', nome: 'Houston', pais: 'US' },
  { codigo: 'USSEA', nome: 'Seattle / Tacoma', pais: 'US' },
  { codigo: 'USMIA', nome: 'Miami', pais: 'US' },
  { codigo: 'USBAL', nome: 'Baltimore', pais: 'US' },
  // China
  { codigo: 'CNSHA', nome: 'Shanghai', pais: 'CN' },
  { codigo: 'CNNBO', nome: 'Ningbo-Zhoushan', pais: 'CN' },
  { codigo: 'CNSZX', nome: 'Shenzhen', pais: 'CN' },
  { codigo: 'CNQIN', nome: 'Qingdao', pais: 'CN' },
  { codigo: 'CNTXG', nome: 'Tianjin', pais: 'CN' },
  { codigo: 'CNGUA', nome: 'Guangzhou', pais: 'CN' },
  { codigo: 'CNXMN', nome: 'Xiamen', pais: 'CN' },
  // Europa
  { codigo: 'NLRTM', nome: 'Rotterdam', pais: 'NL' },
  { codigo: 'DEHAM', nome: 'Hamburg', pais: 'DE' },
  { codigo: 'BEANR', nome: 'Antwerp', pais: 'BE' },
  { codigo: 'ESVLC', nome: 'Valencia', pais: 'ES' },
  { codigo: 'ESALG', nome: 'Algeciras', pais: 'ES' },
  { codigo: 'ITGOA', nome: 'Genova', pais: 'IT' },
  { codigo: 'GBFXT', nome: 'Felixstowe', pais: 'GB' },
  { codigo: 'GBLGP', nome: 'London Gateway', pais: 'GB' },
  { codigo: 'FRLEH', nome: 'Le Havre', pais: 'FR' },
  { codigo: 'GRPIR', nome: 'Piraeus', pais: 'GR' },
  { codigo: 'PTLIS', nome: 'Lisboa', pais: 'PT' },
  { codigo: 'PTSIN', nome: 'Sines', pais: 'PT' },
  // Ásia (outros)
  { codigo: 'SGSIN', nome: 'Singapore', pais: 'SG' },
  { codigo: 'KRPUS', nome: 'Busan', pais: 'KR' },
  { codigo: 'JPYOK', nome: 'Yokohama', pais: 'JP' },
  { codigo: 'JPTYO', nome: 'Tokyo', pais: 'JP' },
  { codigo: 'JPKOB', nome: 'Kobe', pais: 'JP' },
  { codigo: 'HKHKG', nome: 'Hong Kong', pais: 'HK' },
  { codigo: 'TWTXG', nome: 'Taichung', pais: 'TW' },
  { codigo: 'TWKHH', nome: 'Kaohsiung', pais: 'TW' },
  { codigo: 'VNSGN', nome: 'Ho Chi Minh City', pais: 'VN' },
  { codigo: 'VNHPH', nome: 'Hai Phong', pais: 'VN' },
  { codigo: 'THBKK', nome: 'Bangkok (Laem Chabang)', pais: 'TH' },
  { codigo: 'MYPKG', nome: 'Port Klang', pais: 'MY' },
  { codigo: 'IDJKT', nome: 'Jakarta (Tanjung Priok)', pais: 'ID' },
  { codigo: 'INBOM', nome: 'Mumbai (Nhava Sheva)', pais: 'IN' },
  // Oriente Médio
  { codigo: 'AEJEA', nome: 'Jebel Ali (Dubai)', pais: 'AE' },
  { codigo: 'SAJED', nome: 'Jeddah', pais: 'SA' },
  // América do Sul (outros)
  { codigo: 'ARBUE', nome: 'Buenos Aires', pais: 'AR' },
  { codigo: 'CLSAI', nome: 'San Antonio', pais: 'CL' },
  { codigo: 'CLVAP', nome: 'Valparaíso', pais: 'CL' },
  { codigo: 'COBUN', nome: 'Buenaventura', pais: 'CO' },
  { codigo: 'PECLL', nome: 'Callao', pais: 'PE' },
  { codigo: 'UYMVD', nome: 'Montevideo', pais: 'UY' },
  { codigo: 'PYASU', nome: 'Asunción', pais: 'PY' },
  // América Central
  { codigo: 'PAMIT', nome: 'Manzanillo (Panamá)', pais: 'PA' },
  { codigo: 'MXZLO', nome: 'Manzanillo (México)', pais: 'MX' },
  { codigo: 'MXVER', nome: 'Veracruz', pais: 'MX' },
  // África
  { codigo: 'ZADUR', nome: 'Durban', pais: 'ZA' },
  { codigo: 'EGPSD', nome: 'Port Said', pais: 'EG' },
  { codigo: 'MATNG', nome: 'Tanger Med', pais: 'MA' },
  // Oceania
  { codigo: 'AUMEL', nome: 'Melbourne', pais: 'AU' },
  { codigo: 'AUSYD', nome: 'Sydney', pais: 'AU' },
]

// GET /portos?q=&pais=&limit=50
router.get('/portos', (req: Request, res: Response) => {
  const { q, pais, limit = '50' } = req.query as { q?: string; pais?: string; limit?: string }

  let resultado = PORTOS_ESTATICOS
  if (pais) resultado = resultado.filter(p => p.pais === pais.toUpperCase())
  if (q) {
    const busca = q.toLowerCase()
    resultado = resultado.filter(p =>
      p.nome.toLowerCase().includes(busca) ||
      p.codigo.toLowerCase().includes(busca)
    )
  }

  res.json({ portos: resultado.slice(0, Number(limit)) })
})

export { router as portosRouter }
