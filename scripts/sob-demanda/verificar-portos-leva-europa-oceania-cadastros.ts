/**
 * Verifica portos da leva Europa/Oceania/Rússia (prints) contra cadastros.porto.
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

const PORTOS = [
  // AU
  { pais: 'AU', rotulo: 'Port of Melbourne', termos: ['Melbourne'] },
  { pais: 'AU', rotulo: 'Port Botany', termos: ['Botany', 'Sydney'] },
  { pais: 'AU', rotulo: 'Port of Brisbane', termos: ['Brisbane'] },
  { pais: 'AU', rotulo: 'Port of Fremantle', termos: ['Fremantle'] },
  { pais: 'AU', rotulo: 'Port of Adelaide', termos: ['Adelaide'] },
  { pais: 'AU', rotulo: 'Port of Newcastle', termos: ['Newcastle'] },
  { pais: 'AU', rotulo: 'Port Kembla', termos: ['Kembla', 'Wollongong'] },
  { pais: 'AU', rotulo: 'Port of Darwin', termos: ['Darwin'] },
  { pais: 'AU', rotulo: 'Port of Townsville', termos: ['Townsville'] },
  { pais: 'AU', rotulo: 'Port of Gladstone', termos: ['Gladstone'] },
  { pais: 'AU', rotulo: 'Port of Geelong', termos: ['Geelong'] },
  { pais: 'AU', rotulo: 'Port of Hobart', termos: ['Hobart'] },
  { pais: 'AU', rotulo: 'Port of Burnie', termos: ['Burnie'] },
  { pais: 'AU', rotulo: 'Port of Devonport', termos: ['Devonport'] },
  { pais: 'AU', rotulo: 'Port of Cairns', termos: ['Cairns'] },
  { pais: 'AU', rotulo: 'Port of Mackay', termos: ['Mackay'] },
  { pais: 'AU', rotulo: 'Port of Bundaberg', termos: ['Bundaberg'] },
  { pais: 'AU', rotulo: 'Port of Albany', termos: ['Albany'] },
  { pais: 'AU', rotulo: 'Port Hedland', termos: ['Hedland'] },
  { pais: 'AU', rotulo: 'Dampier Port', termos: ['Dampier'] },
  { pais: 'AU', rotulo: 'Geraldton Port', termos: ['Geraldton'] },
  { pais: 'AU', rotulo: 'Esperance Port', termos: ['Esperance'] },
  { pais: 'AU', rotulo: 'Port Alma', termos: ['Alma'] },
  { pais: 'AU', rotulo: 'Abbot Point Port', termos: ['Abbot Point', 'Abbot'] },
  { pais: 'AU', rotulo: 'Hay Point Port', termos: ['Hay Point', 'Haypoint'] },
  // RU
  { pais: 'RU', rotulo: 'Port of Saint Petersburg', termos: ['Saint Petersburg', 'St Petersburg', 'Leningrad'] },
  { pais: 'RU', rotulo: 'Port of Ust-Luga', termos: ['Ust-Luga', 'Ust Luga'] },
  { pais: 'RU', rotulo: 'Port of Primorsk', termos: ['Primorsk'] },
  { pais: 'RU', rotulo: 'Port of Vysotsk', termos: ['Vysotsk'] },
  { pais: 'RU', rotulo: 'Port of Kaliningrad', termos: ['Kaliningrad'] },
  { pais: 'RU', rotulo: 'Port of Novorossiysk', termos: ['Novorossiysk', 'Novorossiisk'] },
  { pais: 'RU', rotulo: 'Port of Tuapse', termos: ['Tuapse'] },
  { pais: 'RU', rotulo: 'Port of Taman', termos: ['Taman'] },
  { pais: 'RU', rotulo: 'Port of Sochi', termos: ['Sochi'] },
  { pais: 'RU', rotulo: 'Port of Rostov-on-Don', termos: ['Rostov'] },
  { pais: 'RU', rotulo: 'Port of Vladivostok', termos: ['Vladivostok'] },
  { pais: 'RU', rotulo: 'Port of Vostochny', termos: ['Vostochny', 'Vostochnyy'] },
  { pais: 'RU', rotulo: 'Port of Nakhodka', termos: ['Nakhodka'] },
  { pais: 'RU', rotulo: 'Port of Vanino', termos: ['Vanino'] },
  { pais: 'RU', rotulo: 'Port of Korsakov', termos: ['Korsakov'] },
  { pais: 'RU', rotulo: 'Port of Magadan', termos: ['Magadan'] },
  { pais: 'RU', rotulo: 'Port of Petropavlovsk-Kamchatsky', termos: ['Petropavlovsk', 'Kamchatsky'] },
  { pais: 'RU', rotulo: 'Port of Murmansk', termos: ['Murmansk'] },
  { pais: 'RU', rotulo: 'Port of Arkhangelsk', termos: ['Arkhangelsk', 'Archangel'] },
  { pais: 'RU', rotulo: 'Port of Sabetta', termos: ['Sabetta'] },
  { pais: 'RU', rotulo: 'Port of Dudinka', termos: ['Dudinka'] },
  { pais: 'RU', rotulo: 'Port of Astrakhan', termos: ['Astrakhan'] },
  { pais: 'RU', rotulo: 'Port of Olya', termos: ['Olya'] },
  { pais: 'RU', rotulo: 'Port of Makhachkala', termos: ['Makhachkala'] },
  // ES
  { pais: 'ES', rotulo: 'Port of Valencia', termos: ['Valencia'] },
  { pais: 'ES', rotulo: 'Port of Barcelona', termos: ['Barcelona'] },
  { pais: 'ES', rotulo: 'Port of Algeciras', termos: ['Algeciras'] },
  { pais: 'ES', rotulo: 'Port of Cartagena', termos: ['Cartagena'] },
  { pais: 'ES', rotulo: 'Port of Tarragona', termos: ['Tarragona'] },
  { pais: 'ES', rotulo: 'Port of Castellón', termos: ['Castellon', 'Castell'] },
  { pais: 'ES', rotulo: 'Port of Málaga', termos: ['Malaga', 'Málaga'] },
  { pais: 'ES', rotulo: 'Port of Alicante', termos: ['Alicante'] },
  { pais: 'ES', rotulo: 'Port of Bilbao', termos: ['Bilbao'] },
  { pais: 'ES', rotulo: 'Port of Vigo', termos: ['Vigo'] },
  { pais: 'ES', rotulo: 'Port of Gijón', termos: ['Gijon', 'Gijón'] },
  { pais: 'ES', rotulo: 'Port of Las Palmas', termos: ['Las Palmas', 'Palmas'] },
  { pais: 'ES', rotulo: 'Port of Santa Cruz de Tenerife', termos: ['Santa Cruz', 'Tenerife'] },
  // FR
  { pais: 'FR', rotulo: 'Port of Marseille-Fos', termos: ['Marseille', 'Fos'] },
  { pais: 'FR', rotulo: 'Port of Le Havre', termos: ['Le Havre', 'Havre'] },
  { pais: 'FR', rotulo: 'Port of Dunkirk', termos: ['Dunkirk', 'Dunkerque'] },
  { pais: 'FR', rotulo: 'Port of Nantes-Saint-Nazaire', termos: ['Saint-Nazaire', 'Nazaire', 'Nantes'] },
  { pais: 'FR', rotulo: 'Port of Rouen', termos: ['Rouen'] },
  { pais: 'FR', rotulo: 'Port of Bordeaux', termos: ['Bordeaux'] },
  { pais: 'FR', rotulo: 'Port of Toulon', termos: ['Toulon'] },
  { pais: 'FR', rotulo: 'Port of Sète', termos: ['Sete', 'Sète'] },
  { pais: 'FR', rotulo: 'Port of Nice', termos: ['Nice'] },
  { pais: 'FR', rotulo: 'Port of Bastia', termos: ['Bastia'] },
  { pais: 'FR', rotulo: 'Port of Ajaccio', termos: ['Ajaccio'] },
  // IT
  { pais: 'IT', rotulo: 'Port of Genoa', termos: ['Genoa', 'Genova'] },
  { pais: 'IT', rotulo: 'Port of Trieste', termos: ['Trieste'] },
  { pais: 'IT', rotulo: 'Port of La Spezia', termos: ['La Spezia', 'Spezia'] },
  { pais: 'IT', rotulo: 'Port of Livorno', termos: ['Livorno', 'Leghorn'] },
  { pais: 'IT', rotulo: 'Port of Naples', termos: ['Naples', 'Napoli'] },
  { pais: 'IT', rotulo: 'Port of Venice', termos: ['Venice', 'Venezia'] },
  { pais: 'IT', rotulo: 'Port of Ravenna', termos: ['Ravenna'] },
  { pais: 'IT', rotulo: 'Port of Gioia Tauro', termos: ['Gioia Tauro'] },
  { pais: 'IT', rotulo: 'Port of Cagliari', termos: ['Cagliari'] },
  { pais: 'IT', rotulo: 'Port of Taranto', termos: ['Taranto'] },
  { pais: 'IT', rotulo: 'Port of Ancona', termos: ['Ancona'] },
  { pais: 'IT', rotulo: 'Port of Bari', termos: ['Bari'] },
  { pais: 'IT', rotulo: 'Port of Palermo', termos: ['Palermo'] },
  { pais: 'IT', rotulo: 'Port of Augusta', termos: ['Augusta'] },
  // SI HR ME AL
  { pais: 'SI', rotulo: 'Port of Koper', termos: ['Koper', 'Capodistria'] },
  { pais: 'HR', rotulo: 'Port of Rijeka', termos: ['Rijeka', 'Fiume'] },
  { pais: 'HR', rotulo: 'Port of Split', termos: ['Split'] },
  { pais: 'HR', rotulo: 'Port of Ploče', termos: ['Ploce', 'Ploče'] },
  { pais: 'HR', rotulo: 'Port of Zadar', termos: ['Zadar'] },
  { pais: 'ME', rotulo: 'Port of Bar', termos: ['Bar'] },
  { pais: 'AL', rotulo: 'Port of Durrës', termos: ['Durres', 'Durrës', 'Durazzo'] },
  { pais: 'AL', rotulo: 'Port of Vlorë', termos: ['Vlore', 'Vlorë', 'Valona'] },
  // GR TR CY MT
  { pais: 'GR', rotulo: 'Port of Piraeus', termos: ['Piraeus', 'Pireaus'] },
  { pais: 'GR', rotulo: 'Port of Thessaloniki', termos: ['Thessaloniki', 'Salonica'] },
  { pais: 'GR', rotulo: 'Port of Patras', termos: ['Patras'] },
  { pais: 'GR', rotulo: 'Port of Heraklion', termos: ['Heraklion', 'Iraklion'] },
  { pais: 'GR', rotulo: 'Port of Volos', termos: ['Volos'] },
  { pais: 'TR', rotulo: 'Port of Ambarli', termos: ['Ambarli', 'Ambarlı'] },
  { pais: 'TR', rotulo: 'Port of Istanbul', termos: ['Istanbul', 'Ambarli'] },
  { pais: 'TR', rotulo: 'Port of Izmir', termos: ['Izmir', 'Ismir'] },
  { pais: 'TR', rotulo: 'Port of Mersin', termos: ['Mersin'] },
  { pais: 'TR', rotulo: 'Port of Gemlik', termos: ['Gemlik'] },
  { pais: 'TR', rotulo: 'Port of Iskenderun', termos: ['Iskenderun', 'Iskenderun'] },
  { pais: 'TR', rotulo: 'Port of Aliaga', termos: ['Aliaga', 'Aliğa'] },
  { pais: 'TR', rotulo: 'Port of Tekirdag', termos: ['Tekirdag', 'Tekirdağ'] },
  { pais: 'TR', rotulo: 'Port of Derince', termos: ['Derince'] },
  { pais: 'CY', rotulo: 'Port of Limassol', termos: ['Limassol'] },
  { pais: 'CY', rotulo: 'Port of Larnaca', termos: ['Larnaca'] },
  { pais: 'MT', rotulo: 'Port of Malta (Marsaxlokk)', termos: ['Marsaxlokk', 'Malta Freeport', 'Malta'] },
  // EG LY TN DZ MA
  { pais: 'EG', rotulo: 'Port of Alexandria', termos: ['Alexandria', 'Alexandrie'] },
  { pais: 'EG', rotulo: 'Port of Said', termos: ['Port Said', 'Said'] },
  { pais: 'EG', rotulo: 'Damietta Port', termos: ['Damietta', 'Damiet'] },
  { pais: 'EG', rotulo: 'Port of Dekheila', termos: ['Dekheila', 'Dekheila'] },
  { pais: 'EG', rotulo: 'Port of Sokhna', termos: ['Sokhna', 'Ain Sokhna'] },
  { pais: 'LY', rotulo: 'Port of Tripoli', termos: ['Tripoli'] },
  { pais: 'LY', rotulo: 'Port of Misrata', termos: ['Misrata', 'Misurata'] },
  { pais: 'LY', rotulo: 'Port of Benghazi', termos: ['Benghazi', 'Bengasi'] },
  { pais: 'TN', rotulo: 'Port of Rades', termos: ['Rades', 'Radès'] },
  { pais: 'TN', rotulo: 'Port of Sfax', termos: ['Sfax'] },
  { pais: 'TN', rotulo: 'Port of Bizerte', termos: ['Bizerte'] },
  { pais: 'TN', rotulo: 'Port of Gabès', termos: ['Gabes', 'Gabès'] },
  { pais: 'DZ', rotulo: 'Port of Algiers', termos: ['Algiers', 'Alger'] },
  { pais: 'DZ', rotulo: 'Port of Oran', termos: ['Oran'] },
  { pais: 'DZ', rotulo: 'Port of Bejaia', termos: ['Bejaia', 'Bejaïa'] },
  { pais: 'DZ', rotulo: 'Port of Skikda', termos: ['Skikda'] },
  { pais: 'DZ', rotulo: 'Port of Annaba', termos: ['Annaba'] },
  { pais: 'MA', rotulo: 'Port of Tanger Med', termos: ['Tanger Med', 'Tangier Med'] },
  { pais: 'MA', rotulo: 'Port of Casablanca', termos: ['Casablanca'] },
  { pais: 'MA', rotulo: 'Port of Agadir', termos: ['Agadir'] },
  { pais: 'MA', rotulo: 'Port of Nador', termos: ['Nador'] },
  // PT
  { pais: 'PT', rotulo: 'Port of Sines', termos: ['Sines'] },
  { pais: 'PT', rotulo: 'Port of Lisbon', termos: ['Lisbon', 'Lisboa'] },
  { pais: 'PT', rotulo: 'Port of Leixões', termos: ['Leixoes', 'Leixões'] },
  { pais: 'PT', rotulo: 'Port of Setúbal', termos: ['Setubal', 'Setúbal'] },
  { pais: 'PT', rotulo: 'Port of Aveiro', termos: ['Aveiro'] },
  { pais: 'PT', rotulo: 'Port of Figueira da Foz', termos: ['Figueira'] },
  // BE NL
  { pais: 'BE', rotulo: 'Port of Antwerp-Bruges', termos: ['Antwerp', 'Antwerpen', 'Bruges', 'Zeebrugge'] },
  { pais: 'BE', rotulo: 'Port of Ghent', termos: ['Ghent', 'Gent'] },
  { pais: 'BE', rotulo: 'Port of Zeebrugge', termos: ['Zeebrugge'] },
  { pais: 'BE', rotulo: 'Port of Ostend', termos: ['Ostend', 'Oostende'] },
  { pais: 'NL', rotulo: 'Port of Rotterdam', termos: ['Rotterdam'] },
  { pais: 'NL', rotulo: 'Port of Amsterdam', termos: ['Amsterdam'] },
  { pais: 'NL', rotulo: 'Port of Moerdijk', termos: ['Moerdijk'] },
  { pais: 'NL', rotulo: 'Port of Vlissingen', termos: ['Vlissingen', 'Flushing'] },
  { pais: 'NL', rotulo: 'Port of Groningen', termos: ['Groningen', 'Eemshaven'] },
  // DE DK NO SE
  { pais: 'DE', rotulo: 'Port of Hamburg', termos: ['Hamburg'] },
  { pais: 'DE', rotulo: 'Port of Bremerhaven', termos: ['Bremerhaven'] },
  { pais: 'DE', rotulo: 'Port of Bremen', termos: ['Bremen'] },
  { pais: 'DE', rotulo: 'Port of Wilhelmshaven', termos: ['Wilhelmshaven'] },
  { pais: 'DE', rotulo: 'Port of Rostock', termos: ['Rostock'] },
  { pais: 'DE', rotulo: 'Port of Lübeck', termos: ['Lubeck', 'Lübeck'] },
  { pais: 'DE', rotulo: 'Port of Kiel', termos: ['Kiel'] },
  { pais: 'DK', rotulo: 'Port of Aarhus', termos: ['Aarhus', 'Arhus'] },
  { pais: 'DK', rotulo: 'Port of Copenhagen', termos: ['Copenhagen', 'Kobenhavn'] },
  { pais: 'DK', rotulo: 'Port of Esbjerg', termos: ['Esbjerg'] },
  { pais: 'DK', rotulo: 'Port of Fredericia', termos: ['Fredericia'] },
  { pais: 'DK', rotulo: 'Port of Aalborg', termos: ['Aalborg', 'Alborg'] },
  { pais: 'NO', rotulo: 'Port of Oslo', termos: ['Oslo'] },
  { pais: 'NO', rotulo: 'Port of Bergen', termos: ['Bergen'] },
  { pais: 'NO', rotulo: 'Port of Stavanger', termos: ['Stavanger'] },
  { pais: 'NO', rotulo: 'Port of Kristiansand', termos: ['Kristiansand'] },
  { pais: 'NO', rotulo: 'Port of Narvik', termos: ['Narvik'] },
  { pais: 'NO', rotulo: 'Port of Trondheim', termos: ['Trondheim'] },
  { pais: 'SE', rotulo: 'Port of Gothenburg', termos: ['Gothenburg', 'Goteborg', 'Göteborg'] },
  { pais: 'SE', rotulo: 'Port of Stockholm', termos: ['Stockholm'] },
  { pais: 'SE', rotulo: 'Port of Helsingborg', termos: ['Helsingborg'] },
  { pais: 'SE', rotulo: 'Port of Malmö', termos: ['Malmo', 'Malmö'] },
  { pais: 'SE', rotulo: 'Port of Norrköping', termos: ['Norrkoping', 'Norrköping'] },
  // FI EE LV LT PL
  { pais: 'FI', rotulo: 'Port of Helsinki', termos: ['Helsinki'] },
  { pais: 'FI', rotulo: 'Port of HaminaKotka', termos: ['Hamina', 'Kotka'] },
  { pais: 'FI', rotulo: 'Port of Turku', termos: ['Turku', 'Abo'] },
  { pais: 'FI', rotulo: 'Port of Oulu', termos: ['Oulu'] },
  { pais: 'FI', rotulo: 'Port of Rauma', termos: ['Rauma'] },
  { pais: 'EE', rotulo: 'Port of Tallinn', termos: ['Tallinn'] },
  { pais: 'EE', rotulo: 'Port of Muuga', termos: ['Muuga'] },
  { pais: 'LV', rotulo: 'Port of Riga', termos: ['Riga'] },
  { pais: 'LV', rotulo: 'Port of Ventspils', termos: ['Ventspils'] },
  { pais: 'LV', rotulo: 'Port of Liepaja', termos: ['Liepaja', 'Liepāja'] },
  { pais: 'LT', rotulo: 'Port of Klaipeda', termos: ['Klaipeda', 'Klaipėda'] },
  { pais: 'PL', rotulo: 'Port of Gdansk', termos: ['Gdansk', 'Gdańsk', 'Danzig'] },
  { pais: 'PL', rotulo: 'Port of Gdynia', termos: ['Gdynia'] },
  { pais: 'PL', rotulo: 'Port of Szczecin', termos: ['Szczecin', 'Stettin'] },
  { pais: 'PL', rotulo: 'Port of Świnoujście', termos: ['Swinoujscie', 'Świnoujście'] },
  // GB IE
  { pais: 'GB', rotulo: 'Port of Felixstowe', termos: ['Felixstowe'] },
  { pais: 'GB', rotulo: 'Port of Southampton', termos: ['Southampton'] },
  { pais: 'GB', rotulo: 'Port of London', termos: ['London', 'Tilbury', 'Gateway'] },
  { pais: 'GB', rotulo: 'Port of Liverpool', termos: ['Liverpool'] },
  { pais: 'GB', rotulo: 'Port of Bristol', termos: ['Bristol', 'Avonmouth'] },
  { pais: 'GB', rotulo: 'Port of Hull', termos: ['Hull', 'Kingston upon Hull'] },
  { pais: 'GB', rotulo: 'Port of Teesport', termos: ['Teesport', 'Tees'] },
  { pais: 'GB', rotulo: 'Port of Immingham', termos: ['Immingham'] },
  { pais: 'GB', rotulo: 'Port of Belfast', termos: ['Belfast'] },
  { pais: 'IE', rotulo: 'Port of Dublin', termos: ['Dublin'] },
  { pais: 'IE', rotulo: 'Port of Cork', termos: ['Cork'] },
  { pais: 'IE', rotulo: 'Port of Shannon Foynes', termos: ['Foynes', 'Shannon'] },
  { pais: 'IE', rotulo: 'Port of Waterford', termos: ['Waterford'] },
  // RO BG UA
  { pais: 'RO', rotulo: 'Port of Constanța', termos: ['Constanta', 'Constanța'] },
  { pais: 'BG', rotulo: 'Port of Varna', termos: ['Varna'] },
  { pais: 'BG', rotulo: 'Port of Burgas', termos: ['Burgas', 'Bourgas'] },
  { pais: 'UA', rotulo: 'Port of Odesa', termos: ['Odesa', 'Odessa'] },
  { pais: 'UA', rotulo: 'Port of Chornomorsk', termos: ['Chornomorsk', 'Illichivsk'] },
  { pais: 'UA', rotulo: 'Port of Pivdennyi', termos: ['Pivdennyi', 'Yuzhny'] },
  { pais: 'UA', rotulo: 'Port of Mykolaiv', termos: ['Mykolaiv', 'Nikolaev'] },
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
    else if (ativos.length === 0 && hits.length === 0) {
      miss++
      faltando.push(`[${item.pais}] ${item.rotulo}`)
    } else {
      amb++
      ambiguos.push(
        `[${item.pais}] ${item.rotulo} → ${ativos.slice(0, 4).map((h) => h.codigo_unlocode_porto).join(', ')}`,
      )
    }
  }

  console.log(`\n=== LEVA EUROPA/OCEANIA — ${PORTOS.length} portos (deduplicados) ===`)
  console.log(`OK: ${ok} | AMBÍGUO: ${amb} | FALTANDO: ${miss}\n`)
  if (faltando.length) {
    console.log('--- FALTANDO ---')
    faltando.forEach((l) => console.log(l))
  }
  if (ambiguos.length) {
    console.log('\n--- AMBÍGUOS (amostra) ---')
    ambiguos.slice(0, 40).forEach((l) => console.log(l))
    if (ambiguos.length > 40) console.log(`... +${ambiguos.length - 40} ambíguos`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
