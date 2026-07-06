/**
 * Verifica portos da leva Ásia 1 (prints) contra cadastros.porto (UN/LOCODE).
 * Uso: npx tsx scripts/sob-demanda/verificar-portos-leva-asia-1-cadastros.ts
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const url = process.env.CADASTROS_DATABASE_URL
if (!url) {
  console.error('CADASTROS_DATABASE_URL ausente')
  process.exit(1)
}

const prisma = new PrismaClient({ datasources: { db: { url } } })

/** Referência dos prints — termos de busca no nome UN/LOCODE (sem "Port of"). */
const PORTOS_LEVA_ASIA_1: Array<{ pais: string; rotulo_print: string; termos_busca: string[] }> = [
  // HK
  { pais: 'HK', rotulo_print: 'Port of Hong Kong', termos_busca: ['Hong Kong'] },
  { pais: 'HK', rotulo_print: 'Kwai Tsing Container Terminals', termos_busca: ['Kwai Tsing', 'Kwai Chung'] },
  { pais: 'HK', rotulo_print: 'Tuen Mun River Trade Terminal', termos_busca: ['Tuen Mun'] },
  // TW
  { pais: 'TW', rotulo_print: 'Port of Kaohsiung', termos_busca: ['Kaohsiung'] },
  { pais: 'TW', rotulo_print: 'Port of Keelung', termos_busca: ['Keelung'] },
  { pais: 'TW', rotulo_print: 'Port of Taichung', termos_busca: ['Taichung'] },
  { pais: 'TW', rotulo_print: 'Port of Taipei', termos_busca: ['Taipei'] },
  { pais: 'TW', rotulo_print: 'Port of Hualien', termos_busca: ['Hualien', 'Hualian'] },
  { pais: 'TW', rotulo_print: 'Port of Suao', termos_busca: ['Suao', 'Su-ao'] },
  { pais: 'TW', rotulo_print: 'Port of Anping', termos_busca: ['Anping'] },
  // JP
  { pais: 'JP', rotulo_print: 'Port of Tokyo', termos_busca: ['Tokyo'] },
  { pais: 'JP', rotulo_print: 'Port of Yokohama', termos_busca: ['Yokohama'] },
  { pais: 'JP', rotulo_print: 'Port of Nagoya', termos_busca: ['Nagoya'] },
  { pais: 'JP', rotulo_print: 'Port of Kobe', termos_busca: ['Kobe'] },
  { pais: 'JP', rotulo_print: 'Port of Osaka', termos_busca: ['Osaka'] },
  { pais: 'JP', rotulo_print: 'Port of Hakata', termos_busca: ['Hakata'] },
  { pais: 'JP', rotulo_print: 'Port of Kitakyushu', termos_busca: ['Kitakyushu', 'Kitakyu'] },
  { pais: 'JP', rotulo_print: 'Port of Shimizu', termos_busca: ['Shimizu'] },
  { pais: 'JP', rotulo_print: 'Port of Kawasaki', termos_busca: ['Kawasaki'] },
  { pais: 'JP', rotulo_print: 'Port of Chiba', termos_busca: ['Chiba'] },
  { pais: 'JP', rotulo_print: 'Port of Niigata', termos_busca: ['Niigata'] },
  { pais: 'JP', rotulo_print: 'Port of Sendai', termos_busca: ['Sendai'] },
  { pais: 'JP', rotulo_print: 'Port of Tomakomai', termos_busca: ['Tomakomai'] },
  { pais: 'JP', rotulo_print: 'Port of Muroran', termos_busca: ['Muroran'] },
  { pais: 'JP', rotulo_print: 'Port of Oita', termos_busca: ['Oita'] },
  { pais: 'JP', rotulo_print: 'Port of Hiroshima', termos_busca: ['Hiroshima'] },
  { pais: 'JP', rotulo_print: 'Port of Mizushima', termos_busca: ['Mizushima'] },
  { pais: 'JP', rotulo_print: 'Port of Moji', termos_busca: ['Moji'] },
  { pais: 'JP', rotulo_print: 'Port of Sakai-Semboku', termos_busca: ['Sakai', 'Semboku'] },
  // SG
  { pais: 'SG', rotulo_print: 'Port of Singapore', termos_busca: ['Singapore'] },
  { pais: 'SG', rotulo_print: 'Tuas Port', termos_busca: ['Tuas'] },
  { pais: 'SG', rotulo_print: 'Pasir Panjang Terminal', termos_busca: ['Pasir Panjang'] },
  { pais: 'SG', rotulo_print: 'Brani Terminal', termos_busca: ['Brani'] },
  { pais: 'SG', rotulo_print: 'Jurong Port', termos_busca: ['Jurong'] },
  // KR
  { pais: 'KR', rotulo_print: 'Port of Busan', termos_busca: ['Busan', 'Pusan'] },
  { pais: 'KR', rotulo_print: 'Port of Incheon', termos_busca: ['Incheon'] },
  { pais: 'KR', rotulo_print: 'Port of Ulsan', termos_busca: ['Ulsan'] },
  { pais: 'KR', rotulo_print: 'Port of Gwangyang', termos_busca: ['Gwangyang', 'Kwangyang'] },
  { pais: 'KR', rotulo_print: 'Port of Pyeongtaek', termos_busca: ['Pyeongtaek', 'Pyongtaek'] },
  { pais: 'KR', rotulo_print: 'Port of Pohang', termos_busca: ['Pohang'] },
  { pais: 'KR', rotulo_print: 'Port of Masan', termos_busca: ['Masan'] },
  { pais: 'KR', rotulo_print: 'Port of Gunsan', termos_busca: ['Gunsan'] },
  { pais: 'KR', rotulo_print: 'Port of Mokpo', termos_busca: ['Mokpo'] },
  { pais: 'KR', rotulo_print: 'Port of Yeosu', termos_busca: ['Yeosu', 'Yosu'] },
  // VN
  { pais: 'VN', rotulo_print: 'Port of Hai Phong', termos_busca: ['Hai Phong', 'Haiphong'] },
  { pais: 'VN', rotulo_print: 'Lach Huyen Port', termos_busca: ['Lach Huyen', 'Lach Huy'] },
  { pais: 'VN', rotulo_print: 'Port of Ho Chi Minh City', termos_busca: ['Ho Chi Minh', 'Cat Lai', 'Saigon'] },
  { pais: 'VN', rotulo_print: 'Cat Lai Terminal', termos_busca: ['Cat Lai'] },
  { pais: 'VN', rotulo_print: 'Cai Mep–Thi Vai Port', termos_busca: ['Cai Mep', 'Thi Vai'] },
  { pais: 'VN', rotulo_print: 'Port of Da Nang', termos_busca: ['Da Nang', 'Danang'] },
  { pais: 'VN', rotulo_print: 'Port of Quy Nhon', termos_busca: ['Quy Nhon', 'Qui Nhon'] },
  { pais: 'VN', rotulo_print: 'Port of Nha Trang', termos_busca: ['Nha Trang'] },
  { pais: 'VN', rotulo_print: 'Port of Vung Tau', termos_busca: ['Vung Tau', 'Vungtau'] },
  // TH
  { pais: 'TH', rotulo_print: 'Port of Laem Chabang', termos_busca: ['Laem Chabang'] },
  { pais: 'TH', rotulo_print: 'Port of Bangkok', termos_busca: ['Bangkok', 'Klong Toey'] },
  { pais: 'TH', rotulo_print: 'Port of Map Ta Phut', termos_busca: ['Map Ta Phut', 'Maptaphut'] },
  { pais: 'TH', rotulo_print: 'Port of Sattahip', termos_busca: ['Sattahip'] },
  { pais: 'TH', rotulo_print: 'Port of Songkhla', termos_busca: ['Songkhla'] },
  { pais: 'TH', rotulo_print: 'Port of Phuket', termos_busca: ['Phuket'] },
  // MY
  { pais: 'MY', rotulo_print: 'Port Klang', termos_busca: ['Port Klang', 'Klang', 'Kelang'] },
  { pais: 'MY', rotulo_print: 'Port of Tanjung Pelepas', termos_busca: ['Tanjung Pelepas', 'Pelepas'] },
  { pais: 'MY', rotulo_print: 'Penang Port', termos_busca: ['Penang', 'Pinang'] },
  { pais: 'MY', rotulo_print: 'Johor Port', termos_busca: ['Johor', 'Pasir Gudang'] },
  { pais: 'MY', rotulo_print: 'Kuantan Port', termos_busca: ['Kuantan'] },
  { pais: 'MY', rotulo_print: 'Bintulu Port', termos_busca: ['Bintulu'] },
  { pais: 'MY', rotulo_print: 'Kuching Port', termos_busca: ['Kuching'] },
  { pais: 'MY', rotulo_print: 'Kota Kinabalu Port', termos_busca: ['Kota Kinabalu', 'Kinabalu'] },
  { pais: 'MY', rotulo_print: 'Lumut Port', termos_busca: ['Lumut'] },
  // ID
  { pais: 'ID', rotulo_print: 'Port of Tanjung Priok', termos_busca: ['Tanjung Priok', 'Priok'] },
  { pais: 'ID', rotulo_print: 'Tanjung Perak Port', termos_busca: ['Tanjung Perak', 'Surabaya'] },
  { pais: 'ID', rotulo_print: 'Belawan Port', termos_busca: ['Belawan', 'Medan'] },
  { pais: 'ID', rotulo_print: 'Makassar Port', termos_busca: ['Makassar', 'Ujung Pandang'] },
  { pais: 'ID', rotulo_print: 'Semarang Port', termos_busca: ['Semarang', 'Tanjung Emas'] },
  { pais: 'ID', rotulo_print: 'Dumai Port', termos_busca: ['Dumai'] },
  { pais: 'ID', rotulo_print: 'Batam Port', termos_busca: ['Batam'] },
  { pais: 'ID', rotulo_print: 'Balikpapan Port', termos_busca: ['Balikpapan'] },
  { pais: 'ID', rotulo_print: 'Banjarmasin Port', termos_busca: ['Banjarmasin'] },
  { pais: 'ID', rotulo_print: 'Bitung Port', termos_busca: ['Bitung'] },
  // PH
  { pais: 'PH', rotulo_print: 'Port of Manila', termos_busca: ['Manila'] },
  { pais: 'PH', rotulo_print: 'Manila International Container Terminal', termos_busca: ['Manila International', 'MICT'] },
  { pais: 'PH', rotulo_print: 'Cebu Port', termos_busca: ['Cebu'] },
  { pais: 'PH', rotulo_print: 'Davao Port', termos_busca: ['Davao'] },
  { pais: 'PH', rotulo_print: 'Batangas Port', termos_busca: ['Batangas'] },
  { pais: 'PH', rotulo_print: 'Subic Port', termos_busca: ['Subic'] },
  { pais: 'PH', rotulo_print: 'Cagayan de Oro Port', termos_busca: ['Cagayan de Oro', 'Cagayan'] },
  { pais: 'PH', rotulo_print: 'Iloilo Port', termos_busca: ['Iloilo'] },
  { pais: 'PH', rotulo_print: 'General Santos Port', termos_busca: ['General Santos'] },
  // IN
  { pais: 'IN', rotulo_print: 'Jawaharlal Nehru Port (Nhava Sheva)', termos_busca: ['Nhava Sheva', 'Jawaharlal', 'JNPT'] },
  { pais: 'IN', rotulo_print: 'Port of Mumbai', termos_busca: ['Mumbai', 'Bombay'] },
  { pais: 'IN', rotulo_print: 'Mundra Port', termos_busca: ['Mundra'] },
  { pais: 'IN', rotulo_print: 'Kandla Port', termos_busca: ['Kandla'] },
  { pais: 'IN', rotulo_print: 'Chennai Port', termos_busca: ['Chennai', 'Madras'] },
  { pais: 'IN', rotulo_print: 'Ennore Port', termos_busca: ['Ennore', 'Kamarajar'] },
  { pais: 'IN', rotulo_print: 'Visakhapatnam Port', termos_busca: ['Visakhapatnam', 'Vizag'] },
  { pais: 'IN', rotulo_print: 'Cochin Port', termos_busca: ['Cochin', 'Kochi'] },
  { pais: 'IN', rotulo_print: 'Tuticorin Port', termos_busca: ['Tuticorin', 'Thoothukudi'] },
  { pais: 'IN', rotulo_print: 'Kolkata Port', termos_busca: ['Kolkata', 'Calcutta', 'Haldia Dock'] },
  { pais: 'IN', rotulo_print: 'Haldia Port', termos_busca: ['Haldia'] },
  { pais: 'IN', rotulo_print: 'Paradip Port', termos_busca: ['Paradip', 'Paradipgarh'] },
  { pais: 'IN', rotulo_print: 'Mormugao Port', termos_busca: ['Mormugao', 'Marmugao'] },
  { pais: 'IN', rotulo_print: 'New Mangalore Port', termos_busca: ['Mangalore', 'New Mangalore'] },
  // LK
  { pais: 'LK', rotulo_print: 'Port of Colombo', termos_busca: ['Colombo'] },
  { pais: 'LK', rotulo_print: 'Port of Hambantota', termos_busca: ['Hambantota'] },
  { pais: 'LK', rotulo_print: 'Port of Trincomalee', termos_busca: ['Trincomalee'] },
  { pais: 'LK', rotulo_print: 'Port of Galle', termos_busca: ['Galle'] },
  // BD
  { pais: 'BD', rotulo_print: 'Port of Chittagong', termos_busca: ['Chittagong', 'Chattogram'] },
  { pais: 'BD', rotulo_print: 'Mongla Port', termos_busca: ['Mongla'] },
  { pais: 'BD', rotulo_print: 'Payra Port', termos_busca: ['Payra'] },
  // PK
  { pais: 'PK', rotulo_print: 'Port of Karachi', termos_busca: ['Karachi'] },
  { pais: 'PK', rotulo_print: 'Port Qasim', termos_busca: ['Qasim', 'Muhammad Bin Qasim'] },
  { pais: 'PK', rotulo_print: 'Gwadar Port', termos_busca: ['Gwadar'] },
  // AE
  { pais: 'AE', rotulo_print: 'Jebel Ali Port', termos_busca: ['Jebel Ali', 'Jabal Ali'] },
  { pais: 'AE', rotulo_print: 'Port Rashid', termos_busca: ['Port Rashid', 'Mina Rashid', 'Dubai'] },
  { pais: 'AE', rotulo_print: 'Khalifa Port', termos_busca: ['Khalifa', 'Abu Dhabi'] },
  { pais: 'AE', rotulo_print: 'Fujairah Port', termos_busca: ['Fujairah'] },
  { pais: 'AE', rotulo_print: 'Khor Fakkan Port', termos_busca: ['Khor Fakkan', 'Khawr Fakkan'] },
  { pais: 'AE', rotulo_print: 'Mina Zayed Port', termos_busca: ['Mina Zayed', 'Zayed'] },
  // SA
  { pais: 'SA', rotulo_print: 'Jeddah Islamic Port', termos_busca: ['Jeddah', 'Jiddah'] },
  { pais: 'SA', rotulo_print: 'King Abdulaziz Port (Dammam)', termos_busca: ['Dammam', 'Abdulaziz'] },
  { pais: 'SA', rotulo_print: 'King Abdullah Port', termos_busca: ['King Abdullah', 'Abdullah'] },
  { pais: 'SA', rotulo_print: 'Yanbu Commercial Port', termos_busca: ['Yanbu'] },
  { pais: 'SA', rotulo_print: 'Jubail Commercial Port', termos_busca: ['Jubail'] },
]

type Resultado = {
  pais: string
  rotulo_print: string
  status: 'OK' | 'INATIVO' | 'NAO_ENCONTRADO' | 'AMBIGUO'
  matches: string[]
}

async function buscarPorto(pais: string, termos: string[]) {
  for (const termo of termos) {
    const hits = await prisma.porto.findMany({
      where: {
        codigo_pais_porto: pais,
        OR: [
          { nome_porto: { contains: termo, mode: 'insensitive' } },
          { nome_ascii_porto: { contains: termo, mode: 'insensitive' } },
          { codigo_unlocode_porto: { contains: termo.toUpperCase() } },
        ],
      },
      select: {
        codigo_unlocode_porto: true,
        nome_porto: true,
        ativo_porto: true,
      },
      take: 8,
    })
    if (hits.length > 0) return hits
  }
  return []
}

async function main() {
  const resultados: Resultado[] = []

  for (const item of PORTOS_LEVA_ASIA_1) {
    const hits = await buscarPorto(item.pais, item.termos_busca)
    if (hits.length === 0) {
      resultados.push({ ...item, status: 'NAO_ENCONTRADO', matches: [] })
      continue
    }
    const linhas = hits.map(
      (h) => `${h.codigo_unlocode_porto} | ${h.nome_porto} | ativo=${h.ativo_porto}`,
    )
    const ativos = hits.filter((h) => h.ativo_porto)
    if (ativos.length === 1) {
      resultados.push({ ...item, status: 'OK', matches: linhas.slice(0, 3) })
    } else if (ativos.length === 0) {
      resultados.push({ ...item, status: 'INATIVO', matches: linhas.slice(0, 3) })
    } else {
      resultados.push({ ...item, status: 'AMBIGUO', matches: linhas.slice(0, 5) })
    }
  }

  const ok = resultados.filter((r) => r.status === 'OK')
  const amb = resultados.filter((r) => r.status === 'AMBIGUO')
  const ina = resultados.filter((r) => r.status === 'INATIVO')
  const miss = resultados.filter((r) => r.status === 'NAO_ENCONTRADO')

  console.log(`\n=== LEVA ÁSIA 1 — ${PORTOS_LEVA_ASIA_1.length} portos ===`)
  console.log(`OK: ${ok.length} | AMBÍGUO: ${amb.length} | INATIVO: ${ina.length} | FALTANDO: ${miss.length}\n`)

  if (miss.length) {
    console.log('--- NÃO ENCONTRADOS ---')
    for (const r of miss) console.log(`[${r.pais}] ${r.rotulo_print}`)
  }
  if (ina.length) {
    console.log('\n--- INATIVOS ---')
    for (const r of ina) {
      console.log(`[${r.pais}] ${r.rotulo_print}`)
      for (const m of r.matches) console.log(`  ${m}`)
    }
  }
  if (amb.length) {
    console.log('\n--- AMBÍGUOS (escolher UN/LOCODE) ---')
    for (const r of amb) {
      console.log(`[${r.pais}] ${r.rotulo_print}`)
      for (const m of r.matches) console.log(`  ${m}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
