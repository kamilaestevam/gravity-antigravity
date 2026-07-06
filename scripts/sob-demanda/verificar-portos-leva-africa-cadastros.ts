/**
 * Verifica portos da leva África (prints) contra cadastros.porto.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '../../servicos-global/cadastros/generated/index.js'

const envPath = resolve(import.meta.dirname, '../../.env.local')
for (const linha of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const m = linha.match(/^CADASTROS_DATABASE_URL=(.*)$/)
  if (m && !process.env.CADASTROS_DATABASE_URL) process.env.CADASTROS_DATABASE_URL = m[1]
}

const prisma = new PrismaClient({ datasources: { db: { url: process.env.CADASTROS_DATABASE_URL! } } })

const PORTOS: Array<{ pais: string; rotulo: string; termos: string[] }> = [
  // MA
  { pais: 'MA', rotulo: 'Port of Tanger Med', termos: ['Tanger Med', 'Tangier Med'] },
  { pais: 'MA', rotulo: 'Port of Casablanca', termos: ['Casablanca'] },
  { pais: 'MA', rotulo: 'Port of Agadir', termos: ['Agadir'] },
  { pais: 'MA', rotulo: 'Port of Nador', termos: ['Nador'] },
  { pais: 'MA', rotulo: 'Port of Jorf Lasfar', termos: ['Jorf Lasfar', 'Lasfar'] },
  { pais: 'MA', rotulo: 'Port of Safi', termos: ['Safi'] },
  { pais: 'MA', rotulo: 'Port of Kenitra', termos: ['Kenitra'] },
  // DZ
  { pais: 'DZ', rotulo: 'Port of Algiers', termos: ['Algiers', 'Alger'] },
  { pais: 'DZ', rotulo: 'Port of Oran', termos: ['Oran'] },
  { pais: 'DZ', rotulo: 'Port of Bejaia', termos: ['Bejaia', 'Bejaïa'] },
  { pais: 'DZ', rotulo: 'Port of Skikda', termos: ['Skikda'] },
  { pais: 'DZ', rotulo: 'Port of Annaba', termos: ['Annaba'] },
  { pais: 'DZ', rotulo: 'Port of Mostaganem', termos: ['Mostaganem'] },
  { pais: 'DZ', rotulo: 'Port of Jijel', termos: ['Jijel'] },
  // TN
  { pais: 'TN', rotulo: 'Port of Rades', termos: ['Rades', 'Radès'] },
  { pais: 'TN', rotulo: 'Port of Sfax', termos: ['Sfax'] },
  { pais: 'TN', rotulo: 'Port of Bizerte', termos: ['Bizerte'] },
  { pais: 'TN', rotulo: 'Port of Gabès', termos: ['Gabes', 'Gabès'] },
  { pais: 'TN', rotulo: 'Port of Sousse', termos: ['Sousse'] },
  // LY
  { pais: 'LY', rotulo: 'Port of Tripoli', termos: ['Tripoli'] },
  { pais: 'LY', rotulo: 'Port of Misrata', termos: ['Misrata', 'Misurata'] },
  { pais: 'LY', rotulo: 'Port of Benghazi', termos: ['Benghazi'] },
  { pais: 'LY', rotulo: 'Port of Tobruk', termos: ['Tobruk'] },
  { pais: 'LY', rotulo: 'Port of Khoms', termos: ['Khoms', 'Al Khums'] },
  // EG
  { pais: 'EG', rotulo: 'Port of Alexandria', termos: ['Alexandria'] },
  { pais: 'EG', rotulo: 'Port Said', termos: ['Port Said', 'Said'] },
  { pais: 'EG', rotulo: 'Damietta Port', termos: ['Damietta'] },
  { pais: 'EG', rotulo: 'Port of Dekheila', termos: ['Dekheila'] },
  { pais: 'EG', rotulo: 'Port of Sokhna', termos: ['Sokhna', 'Ain Sokhna'] },
  { pais: 'EG', rotulo: 'Port of El Arish', termos: ['Arish'] },
  { pais: 'EG', rotulo: 'Port of Safaga', termos: ['Safaga'] },
  { pais: 'EG', rotulo: 'Port of Suez', termos: ['Suez'] },
  // MR SN GM GN SL LR
  { pais: 'MR', rotulo: 'Port of Nouakchott', termos: ['Nouakchott'] },
  { pais: 'MR', rotulo: 'Port of Nouadhibou', termos: ['Nouadhibou'] },
  { pais: 'SN', rotulo: 'Port of Dakar', termos: ['Dakar'] },
  { pais: 'GM', rotulo: 'Port of Banjul', termos: ['Banjul'] },
  { pais: 'GN', rotulo: 'Port of Conakry', termos: ['Conakry'] },
  { pais: 'GN', rotulo: 'Port of Kamsar', termos: ['Kamsar'] },
  { pais: 'SL', rotulo: 'Port of Freetown', termos: ['Freetown'] },
  { pais: 'LR', rotulo: 'Port of Monrovia', termos: ['Monrovia'] },
  { pais: 'LR', rotulo: 'Port of Buchanan', termos: ['Buchanan'] },
  // CI GH TG BJ NG CM GA CG
  { pais: 'CI', rotulo: 'Port of Abidjan', termos: ['Abidjan'] },
  { pais: 'CI', rotulo: 'Port of San Pedro', termos: ['San Pedro'] },
  { pais: 'GH', rotulo: 'Port of Tema', termos: ['Tema'] },
  { pais: 'GH', rotulo: 'Port of Takoradi', termos: ['Takoradi'] },
  { pais: 'TG', rotulo: 'Port of Lomé', termos: ['Lome', 'Lomé'] },
  { pais: 'BJ', rotulo: 'Port of Cotonou', termos: ['Cotonou'] },
  { pais: 'NG', rotulo: 'Port of Lagos', termos: ['Lagos'] },
  { pais: 'NG', rotulo: 'Apapa Port', termos: ['Apapa'] },
  { pais: 'NG', rotulo: 'Tin Can Island Port', termos: ['Tin Can'] },
  { pais: 'NG', rotulo: 'Port Harcourt', termos: ['Harcourt'] },
  { pais: 'NG', rotulo: 'Onne Port', termos: ['Onne'] },
  { pais: 'NG', rotulo: 'Calabar Port', termos: ['Calabar'] },
  { pais: 'NG', rotulo: 'Warri Port', termos: ['Warri'] },
  { pais: 'CM', rotulo: 'Port of Douala', termos: ['Douala'] },
  { pais: 'CM', rotulo: 'Port of Kribi', termos: ['Kribi'] },
  { pais: 'GA', rotulo: 'Port of Owendo', termos: ['Owendo'] },
  { pais: 'GA', rotulo: 'Port of Port-Gentil', termos: ['Port-Gentil', 'Port Gentil'] },
  { pais: 'CG', rotulo: 'Port of Pointe-Noire', termos: ['Pointe-Noire', 'Pointe Noire'] },
  // CD AO NA ZA MZ
  { pais: 'CD', rotulo: 'Port of Matadi', termos: ['Matadi'] },
  { pais: 'CD', rotulo: 'Port of Boma', termos: ['Boma'] },
  { pais: 'AO', rotulo: 'Port of Luanda', termos: ['Luanda'] },
  { pais: 'AO', rotulo: 'Port of Lobito', termos: ['Lobito'] },
  { pais: 'AO', rotulo: 'Port of Namibe', termos: ['Namibe', 'Mocamedes'] },
  { pais: 'AO', rotulo: 'Port of Cabinda', termos: ['Cabinda'] },
  { pais: 'AO', rotulo: 'Port of Soyo', termos: ['Soyo'] },
  { pais: 'NA', rotulo: 'Port of Walvis Bay', termos: ['Walvis Bay', 'Walvis'] },
  { pais: 'NA', rotulo: 'Port of Lüderitz', termos: ['Luderitz', 'Lüderitz'] },
  { pais: 'ZA', rotulo: 'Port of Durban', termos: ['Durban'] },
  { pais: 'ZA', rotulo: 'Port of Cape Town', termos: ['Cape Town'] },
  { pais: 'ZA', rotulo: 'Port of Ngqura', termos: ['Ngqura', 'Coega'] },
  { pais: 'ZA', rotulo: 'Port of Elizabeth', termos: ['Elizabeth', 'Port Elizabeth'] },
  { pais: 'ZA', rotulo: 'Port of Richards Bay', termos: ['Richards Bay'] },
  { pais: 'ZA', rotulo: 'Port of East London', termos: ['East London'] },
  { pais: 'ZA', rotulo: 'Port of Saldanha Bay', termos: ['Saldanha'] },
  { pais: 'MZ', rotulo: 'Port of Maputo', termos: ['Maputo'] },
  { pais: 'MZ', rotulo: 'Port of Beira', termos: ['Beira'] },
  { pais: 'MZ', rotulo: 'Port of Nacala', termos: ['Nacala'] },
  { pais: 'MZ', rotulo: 'Port of Pemba', termos: ['Pemba'] },
  // TZ KE SO DJ ER SD MG
  { pais: 'TZ', rotulo: 'Port of Dar es Salaam', termos: ['Dar es Salaam', 'Dar es Salam'] },
  { pais: 'TZ', rotulo: 'Port of Tanga', termos: ['Tanga'] },
  { pais: 'TZ', rotulo: 'Port of Mtwara', termos: ['Mtwara'] },
  { pais: 'TZ', rotulo: 'Port of Zanzibar', termos: ['Zanzibar'] },
  { pais: 'KE', rotulo: 'Port of Mombasa', termos: ['Mombasa'] },
  { pais: 'KE', rotulo: 'Port of Lamu', termos: ['Lamu'] },
  { pais: 'SO', rotulo: 'Port of Mogadishu', termos: ['Mogadishu'] },
  { pais: 'SO', rotulo: 'Port of Berbera', termos: ['Berbera'] },
  { pais: 'SO', rotulo: 'Port of Bosaso', termos: ['Bosaso', 'Boosaaso'] },
  { pais: 'SO', rotulo: 'Port of Kismayo', termos: ['Kismayo', 'Kismaayo'] },
  { pais: 'DJ', rotulo: 'Port of Djibouti', termos: ['Djibouti'] },
  { pais: 'DJ', rotulo: 'Doraleh Container Terminal', termos: ['Doraleh'] },
  { pais: 'ER', rotulo: 'Port of Massawa', termos: ['Massawa', 'Mitsiwa'] },
  { pais: 'ER', rotulo: 'Port of Assab', termos: ['Assab', 'Asseb'] },
  { pais: 'SD', rotulo: 'Port Sudan', termos: ['Port Sudan', 'Sudan'] },
  { pais: 'MG', rotulo: 'Port of Toamasina', termos: ['Toamasina', 'Tamatave'] },
  { pais: 'MG', rotulo: 'Port of Mahajanga', termos: ['Mahajanga', 'Majunga'] },
  { pais: 'MG', rotulo: 'Port of Antsiranana', termos: ['Antsiranana', 'Diego Suarez'] },
  // MU SC KM
  { pais: 'MU', rotulo: 'Port Louis', termos: ['Port Louis', 'Mauritius'] },
  { pais: 'SC', rotulo: 'Port Victoria', termos: ['Victoria', 'Mahe'] },
  { pais: 'KM', rotulo: 'Port of Moroni', termos: ['Moroni'] },
]

async function buscarPorto(pais: string, termos: string[]) {
  for (const termo of termos) {
    const hits = await prisma.porto.findMany({
      where: {
        codigo_pais_porto: pais,
        OR: [
          { nome_porto: { contains: termo, mode: 'insensitive' } },
          { nome_ascii_porto: { contains: termo, mode: 'insensitive' } },
        ],
      },
      select: { codigo_unlocode_porto: true, nome_porto: true, ativo_porto: true },
      take: 8,
    })
    if (hits.length > 0) return hits
  }
  return []
}

async function main() {
  let ok = 0
  let amb = 0
  let miss = 0
  const faltando: string[] = []
  const ambiguos: string[] = []

  for (const item of PORTOS) {
    const hits = await buscarPorto(item.pais, item.termos)
    const ativos = hits.filter((h) => h.ativo_porto)
    if (ativos.length === 1) ok++
    else if (hits.length === 0) {
      miss++
      faltando.push(`[${item.pais}] ${item.rotulo}`)
    } else {
      amb++
      ambiguos.push(
        `[${item.pais}] ${item.rotulo} → ${ativos.slice(0, 3).map((h) => h.codigo_unlocode_porto).join(', ')}`,
      )
    }
  }

  console.log(`\n=== LEVA ÁFRICA — ${PORTOS.length} portos ===`)
  console.log(`OK: ${ok} | AMBÍGUO: ${amb} | FALTANDO: ${miss}\n`)
  if (faltando.length) {
    console.log('--- FALTANDO ---')
    faltando.forEach((l) => console.log(l))
  }
  if (ambiguos.length) {
    console.log('\n--- AMBÍGUOS ---')
    ambiguos.forEach((l) => console.log(l))
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
