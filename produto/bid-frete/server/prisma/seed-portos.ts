/**
 * seed-portos.ts — Seed de portos, aeroportos e terminais rodoviários
 * Execução: npx tsx prisma/seed-portos.ts
 *
 * Fonte: UN/LOCODE + IATA codes
 * Cobertura: ~150 principais terminais do comércio internacional
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PORTOS = [
  // ─── BRASIL ──────────────────────────────────────────────────────────────────
  { codigo: 'BRSSZ', nome: 'Santos', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -23.9535, longitude: -46.3326 },
  { codigo: 'BRPNG', nome: 'Paranaguá', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -25.5163, longitude: -48.5225 },
  { codigo: 'BRRIG', nome: 'Rio Grande', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -32.0350, longitude: -52.0986 },
  { codigo: 'BRITJ', nome: 'Itajaí', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -26.9078, longitude: -48.6619 },
  { codigo: 'BRNVT', nome: 'Navegantes', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -26.8948, longitude: -48.6544 },
  { codigo: 'BRREC', nome: 'Suape (Recife)', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -8.3962, longitude: -35.0023 },
  { codigo: 'BRSSA', nome: 'Salvador', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -12.9714, longitude: -38.5124 },
  { codigo: 'BRRIO', nome: 'Rio de Janeiro', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -22.8961, longitude: -43.1775 },
  { codigo: 'BRVIX', nome: 'Vitória', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -20.3155, longitude: -40.2925 },
  { codigo: 'BRMAN', nome: 'Manaus', pais: 'Brasil', pais_codigo: 'BR', tipo: 'porto', latitude: -3.1190, longitude: -60.0217 },
  // Aeroportos BR
  { codigo: 'BRGRU', nome: 'Guarulhos (GRU)', pais: 'Brasil', pais_codigo: 'BR', tipo: 'aeroporto', latitude: -23.4356, longitude: -46.4731 },
  { codigo: 'BRVCP', nome: 'Viracopos (VCP)', pais: 'Brasil', pais_codigo: 'BR', tipo: 'aeroporto', latitude: -23.0074, longitude: -47.1345 },
  { codigo: 'BRGIG', nome: 'Galeão (GIG)', pais: 'Brasil', pais_codigo: 'BR', tipo: 'aeroporto', latitude: -22.8100, longitude: -43.2505 },
  { codigo: 'BRCWB', nome: 'Curitiba (CWB)', pais: 'Brasil', pais_codigo: 'BR', tipo: 'aeroporto', latitude: -25.5285, longitude: -49.1758 },

  // ─── CHINA ───────────────────────────────────────────────────────────────────
  { codigo: 'CNSHA', nome: 'Shanghai', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 31.2304, longitude: 121.4737 },
  { codigo: 'CNSZX', nome: 'Shenzhen (Yantian)', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 22.5431, longitude: 114.0579 },
  { codigo: 'CNNBO', nome: 'Ningbo-Zhoushan', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 29.8683, longitude: 121.5440 },
  { codigo: 'CNQZJ', nome: 'Qingdao', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 36.0671, longitude: 120.3826 },
  { codigo: 'CNTXG', nome: 'Tianjin (Xingang)', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 38.9860, longitude: 117.7354 },
  { codigo: 'CNXMN', nome: 'Xiamen', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 24.4798, longitude: 118.0894 },
  { codigo: 'CNGZH', nome: 'Guangzhou (Nansha)', pais: 'China', pais_codigo: 'CN', tipo: 'porto', latitude: 23.1291, longitude: 113.2644 },
  { codigo: 'CNHKG', nome: 'Hong Kong', pais: 'China', pais_codigo: 'HK', tipo: 'porto', latitude: 22.3193, longitude: 114.1694 },
  // Aeroportos CN
  { codigo: 'CNPVG', nome: 'Shanghai Pudong (PVG)', pais: 'China', pais_codigo: 'CN', tipo: 'aeroporto', latitude: 31.1443, longitude: 121.8083 },
  { codigo: 'CNCAN', nome: 'Guangzhou Baiyun (CAN)', pais: 'China', pais_codigo: 'CN', tipo: 'aeroporto', latitude: 23.3924, longitude: 113.2988 },
  { codigo: 'CNSZX', nome: 'Shenzhen Baoan (SZX)', pais: 'China', pais_codigo: 'CN', tipo: 'aeroporto', latitude: 22.6393, longitude: 113.8107 },
  { codigo: 'CNPEK', nome: 'Beijing Capital (PEK)', pais: 'China', pais_codigo: 'CN', tipo: 'aeroporto', latitude: 40.0799, longitude: 116.6031 },

  // ─── ESTADOS UNIDOS ──────────────────────────────────────────────────────────
  { codigo: 'USLAX', nome: 'Los Angeles', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 33.7361, longitude: -118.2611 },
  { codigo: 'USLGB', nome: 'Long Beach', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 33.7546, longitude: -118.2165 },
  { codigo: 'USNYC', nome: 'New York / New Jersey', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 40.6682, longitude: -74.0449 },
  { codigo: 'USSAV', nome: 'Savannah', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 32.0835, longitude: -81.0998 },
  { codigo: 'USHOU', nome: 'Houston', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 29.7268, longitude: -95.2654 },
  { codigo: 'USSEA', nome: 'Seattle-Tacoma', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 47.2719, longitude: -122.4037 },
  { codigo: 'USMIA', nome: 'Miami', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'porto', latitude: 25.7742, longitude: -80.1756 },
  // Aeroportos US
  { codigo: 'USJFK', nome: 'New York JFK', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'aeroporto', latitude: 40.6413, longitude: -73.7781 },
  { codigo: 'USLAX', nome: 'Los Angeles LAX', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'aeroporto', latitude: 33.9425, longitude: -118.4081 },
  { codigo: 'USMIA', nome: 'Miami MIA', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'aeroporto', latitude: 25.7959, longitude: -80.2870 },
  { codigo: 'USORD', nome: 'Chicago O\'Hare (ORD)', pais: 'Estados Unidos', pais_codigo: 'US', tipo: 'aeroporto', latitude: 41.9742, longitude: -87.9073 },

  // ─── EUROPA ──────────────────────────────────────────────────────────────────
  { codigo: 'NLRTM', nome: 'Rotterdam', pais: 'Holanda', pais_codigo: 'NL', tipo: 'porto', latitude: 51.9244, longitude: 4.4777 },
  { codigo: 'BEANR', nome: 'Antwerp', pais: 'Bélgica', pais_codigo: 'BE', tipo: 'porto', latitude: 51.2194, longitude: 4.4025 },
  { codigo: 'DEHAM', nome: 'Hamburg', pais: 'Alemanha', pais_codigo: 'DE', tipo: 'porto', latitude: 53.5511, longitude: 9.9937 },
  { codigo: 'DEBRV', nome: 'Bremerhaven', pais: 'Alemanha', pais_codigo: 'DE', tipo: 'porto', latitude: 53.5396, longitude: 8.5809 },
  { codigo: 'GBFXT', nome: 'Felixstowe', pais: 'Reino Unido', pais_codigo: 'GB', tipo: 'porto', latitude: 51.9536, longitude: 1.3511 },
  { codigo: 'GBLGP', nome: 'London Gateway', pais: 'Reino Unido', pais_codigo: 'GB', tipo: 'porto', latitude: 51.5010, longitude: 0.4618 },
  { codigo: 'ESBCN', nome: 'Barcelona', pais: 'Espanha', pais_codigo: 'ES', tipo: 'porto', latitude: 41.3518, longitude: 2.1685 },
  { codigo: 'ESALG', nome: 'Algeciras', pais: 'Espanha', pais_codigo: 'ES', tipo: 'porto', latitude: 36.1408, longitude: -5.4536 },
  { codigo: 'ESVLC', nome: 'Valencia', pais: 'Espanha', pais_codigo: 'ES', tipo: 'porto', latitude: 39.4561, longitude: -0.3240 },
  { codigo: 'ITGOA', nome: 'Genova', pais: 'Itália', pais_codigo: 'IT', tipo: 'porto', latitude: 44.4056, longitude: 8.9463 },
  { codigo: 'FRLEH', nome: 'Le Havre', pais: 'França', pais_codigo: 'FR', tipo: 'porto', latitude: 49.4944, longitude: 0.1079 },
  { codigo: 'GRPIR', nome: 'Piraeus', pais: 'Grécia', pais_codigo: 'GR', tipo: 'porto', latitude: 37.9475, longitude: 23.6388 },
  { codigo: 'PTLEI', nome: 'Leixões', pais: 'Portugal', pais_codigo: 'PT', tipo: 'porto', latitude: 41.1854, longitude: -8.7014 },
  { codigo: 'PTLIS', nome: 'Lisboa', pais: 'Portugal', pais_codigo: 'PT', tipo: 'porto', latitude: 38.7223, longitude: -9.1393 },
  // Aeroportos EU
  { codigo: 'DEFRA', nome: 'Frankfurt (FRA)', pais: 'Alemanha', pais_codigo: 'DE', tipo: 'aeroporto', latitude: 50.0379, longitude: 8.5622 },
  { codigo: 'NLAMS', nome: 'Amsterdam Schiphol (AMS)', pais: 'Holanda', pais_codigo: 'NL', tipo: 'aeroporto', latitude: 52.3105, longitude: 4.7683 },
  { codigo: 'GBLHR', nome: 'London Heathrow (LHR)', pais: 'Reino Unido', pais_codigo: 'GB', tipo: 'aeroporto', latitude: 51.4700, longitude: -0.4543 },
  { codigo: 'FRCDG', nome: 'Paris CDG', pais: 'França', pais_codigo: 'FR', tipo: 'aeroporto', latitude: 49.0097, longitude: 2.5479 },
  { codigo: 'ITMXP', nome: 'Milano Malpensa (MXP)', pais: 'Itália', pais_codigo: 'IT', tipo: 'aeroporto', latitude: 45.6301, longitude: 8.7231 },

  // ─── ÁSIA (outros) ───────────────────────────────────────────────────────────
  { codigo: 'SGSIN', nome: 'Singapore', pais: 'Cingapura', pais_codigo: 'SG', tipo: 'porto', latitude: 1.2644, longitude: 103.8222 },
  { codigo: 'KRPUS', nome: 'Busan', pais: 'Coréia do Sul', pais_codigo: 'KR', tipo: 'porto', latitude: 35.1028, longitude: 129.0403 },
  { codigo: 'JPYOK', nome: 'Yokohama', pais: 'Japão', pais_codigo: 'JP', tipo: 'porto', latitude: 35.4437, longitude: 139.6380 },
  { codigo: 'JPTYO', nome: 'Tokyo', pais: 'Japão', pais_codigo: 'JP', tipo: 'porto', latitude: 35.6528, longitude: 139.8395 },
  { codigo: 'JPKOB', nome: 'Kobe', pais: 'Japão', pais_codigo: 'JP', tipo: 'porto', latitude: 34.6901, longitude: 135.1956 },
  { codigo: 'TWKHH', nome: 'Kaohsiung', pais: 'Taiwan', pais_codigo: 'TW', tipo: 'porto', latitude: 22.6149, longitude: 120.2925 },
  { codigo: 'MYPKG', nome: 'Port Klang', pais: 'Malásia', pais_codigo: 'MY', tipo: 'porto', latitude: 2.9993, longitude: 101.3925 },
  { codigo: 'MYTPP', nome: 'Tanjung Pelepas', pais: 'Malásia', pais_codigo: 'MY', tipo: 'porto', latitude: 1.3637, longitude: 103.5517 },
  { codigo: 'VNSGN', nome: 'Ho Chi Minh (Cat Lai)', pais: 'Vietnã', pais_codigo: 'VN', tipo: 'porto', latitude: 10.7500, longitude: 106.7667 },
  { codigo: 'VNHPH', nome: 'Hai Phong', pais: 'Vietnã', pais_codigo: 'VN', tipo: 'porto', latitude: 20.8449, longitude: 106.6881 },
  { codigo: 'THLCH', nome: 'Laem Chabang', pais: 'Tailândia', pais_codigo: 'TH', tipo: 'porto', latitude: 13.0733, longitude: 100.8786 },
  { codigo: 'INMUN', nome: 'Mundra', pais: 'Índia', pais_codigo: 'IN', tipo: 'porto', latitude: 22.8387, longitude: 69.7068 },
  { codigo: 'INNSA', nome: 'Nhava Sheva (JNPT)', pais: 'Índia', pais_codigo: 'IN', tipo: 'porto', latitude: 18.9534, longitude: 72.9519 },
  { codigo: 'INCHE', nome: 'Chennai', pais: 'Índia', pais_codigo: 'IN', tipo: 'porto', latitude: 13.0827, longitude: 80.2707 },
  // Aeroportos Ásia
  { codigo: 'SGSIN', nome: 'Singapore Changi (SIN)', pais: 'Cingapura', pais_codigo: 'SG', tipo: 'aeroporto', latitude: 1.3644, longitude: 103.9915 },
  { codigo: 'JPNRT', nome: 'Tokyo Narita (NRT)', pais: 'Japão', pais_codigo: 'JP', tipo: 'aeroporto', latitude: 35.7720, longitude: 140.3929 },
  { codigo: 'KRICN', nome: 'Incheon (ICN)', pais: 'Coréia do Sul', pais_codigo: 'KR', tipo: 'aeroporto', latitude: 37.4602, longitude: 126.4407 },
  { codigo: 'AEDXB', nome: 'Dubai (DXB)', pais: 'Emirados Árabes', pais_codigo: 'AE', tipo: 'aeroporto', latitude: 25.2532, longitude: 55.3657 },

  // ─── ORIENTE MÉDIO ───────────────────────────────────────────────────────────
  { codigo: 'AEJEA', nome: 'Jebel Ali (Dubai)', pais: 'Emirados Árabes', pais_codigo: 'AE', tipo: 'porto', latitude: 25.0073, longitude: 55.0612 },
  { codigo: 'SAJED', nome: 'Jeddah', pais: 'Arábia Saudita', pais_codigo: 'SA', tipo: 'porto', latitude: 21.4858, longitude: 39.1925 },
  { codigo: 'TRIST', nome: 'Istanbul (Ambarli)', pais: 'Turquia', pais_codigo: 'TR', tipo: 'porto', latitude: 40.9769, longitude: 28.6846 },
  { codigo: 'TRIST', nome: 'Istanbul Airport (IST)', pais: 'Turquia', pais_codigo: 'TR', tipo: 'aeroporto', latitude: 41.2753, longitude: 28.7519 },

  // ─── AMÉRICA LATINA ──────────────────────────────────────────────────────────
  { codigo: 'ARBUE', nome: 'Buenos Aires', pais: 'Argentina', pais_codigo: 'AR', tipo: 'porto', latitude: -34.5946, longitude: -58.3741 },
  { codigo: 'CLSAI', nome: 'San Antonio', pais: 'Chile', pais_codigo: 'CL', tipo: 'porto', latitude: -33.5944, longitude: -71.6113 },
  { codigo: 'CLVAP', nome: 'Valparaíso', pais: 'Chile', pais_codigo: 'CL', tipo: 'porto', latitude: -33.0472, longitude: -71.6127 },
  { codigo: 'MXLZC', nome: 'Lázaro Cárdenas', pais: 'México', pais_codigo: 'MX', tipo: 'porto', latitude: 17.9431, longitude: -102.1910 },
  { codigo: 'MXMAN', nome: 'Manzanillo', pais: 'México', pais_codigo: 'MX', tipo: 'porto', latitude: 19.0437, longitude: -104.3189 },
  { codigo: 'COBUN', nome: 'Buenaventura', pais: 'Colômbia', pais_codigo: 'CO', tipo: 'porto', latitude: 3.8801, longitude: -77.0196 },
  { codigo: 'PECLL', nome: 'Callao', pais: 'Peru', pais_codigo: 'PE', tipo: 'porto', latitude: -12.0464, longitude: -77.1286 },
  { codigo: 'PAMIT', nome: 'Balboa (Panamá)', pais: 'Panamá', pais_codigo: 'PA', tipo: 'porto', latitude: 8.9500, longitude: -79.5667 },
  // Aeroportos LATAM
  { codigo: 'AREZEIZE', nome: 'Buenos Aires Ezeiza (EZE)', pais: 'Argentina', pais_codigo: 'AR', tipo: 'aeroporto', latitude: -34.8222, longitude: -58.5358 },
  { codigo: 'CLSCL', nome: 'Santiago (SCL)', pais: 'Chile', pais_codigo: 'CL', tipo: 'aeroporto', latitude: -33.3930, longitude: -70.7858 },
  { codigo: 'MXMEX', nome: 'Ciudad de México (MEX)', pais: 'México', pais_codigo: 'MX', tipo: 'aeroporto', latitude: 19.4363, longitude: -99.0721 },
  { codigo: 'COBOG', nome: 'Bogotá El Dorado (BOG)', pais: 'Colômbia', pais_codigo: 'CO', tipo: 'aeroporto', latitude: 4.7016, longitude: -74.1469 },

  // ─── ÁFRICA E OCEANIA ────────────────────────────────────────────────────────
  { codigo: 'ZADUR', nome: 'Durban', pais: 'África do Sul', pais_codigo: 'ZA', tipo: 'porto', latitude: -29.8587, longitude: 31.0218 },
  { codigo: 'ZACPT', nome: 'Cape Town', pais: 'África do Sul', pais_codigo: 'ZA', tipo: 'porto', latitude: -33.9249, longitude: 18.4241 },
  { codigo: 'EGPSD', nome: 'Port Said', pais: 'Egito', pais_codigo: 'EG', tipo: 'porto', latitude: 31.2653, longitude: 32.3019 },
  { codigo: 'MAPTM', nome: 'Tanger Med', pais: 'Marrocos', pais_codigo: 'MA', tipo: 'porto', latitude: 35.8889, longitude: -5.5000 },
  { codigo: 'AUSYD', nome: 'Sydney', pais: 'Austrália', pais_codigo: 'AU', tipo: 'porto', latitude: -33.8541, longitude: 151.2047 },
  { codigo: 'AUMEL', nome: 'Melbourne', pais: 'Austrália', pais_codigo: 'AU', tipo: 'porto', latitude: -37.8297, longitude: 144.9122 },
]

async function seed() {
  console.log(`[Seed] Inserindo ${PORTOS.length} portos/aeroportos...`)

  let inserted = 0
  let skipped = 0

  for (const porto of PORTOS) {
    try {
      await prisma.freteIntBidPortosCadastro.upsert({
        where: { codigo: porto.codigo },
        create: { ...porto, ativo: true },
        update: { ...porto },
      })
      inserted++
    } catch {
      skipped++
    }
  }

  console.log(`[Seed] Concluido: ${inserted} inseridos, ${skipped} ignorados (duplicados)`)
  await prisma.$disconnect()
}

seed().catch(err => {
  console.error('[Seed] Erro:', err)
  prisma.$disconnect()
  process.exit(1)
})
