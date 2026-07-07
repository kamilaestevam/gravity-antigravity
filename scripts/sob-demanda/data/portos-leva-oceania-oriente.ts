/**
 * Portos leva Oceania / Oriente Médio / territórios (última leva).
 * Verificação contra cadastros.porto (UN/LOCODE).
 */
export type PortoVerificacao = { pais: string; rotulo: string; termos: string[] }

export const PORTOS_LEVA_OCEANIA_ORIENTE: PortoVerificacao[] = [
  // ─── NOVA ZELÂNDIA ─────────────────────────────────────────────────────────
  { pais: 'NZ', rotulo: 'Port of Auckland', termos: ['Auckland'] },
  { pais: 'NZ', rotulo: 'Port of Tauranga', termos: ['Tauranga'] },
  { pais: 'NZ', rotulo: 'Port of Lyttelton', termos: ['Lyttelton'] },
  { pais: 'NZ', rotulo: 'Port of Wellington', termos: ['Wellington'] },
  { pais: 'NZ', rotulo: 'Port of Napier', termos: ['Napier'] },
  { pais: 'NZ', rotulo: 'Port of Timaru', termos: ['Timaru'] },
  { pais: 'NZ', rotulo: 'Port of Nelson', termos: ['Nelson'] },
  { pais: 'NZ', rotulo: 'Port of New Plymouth', termos: ['New Plymouth', 'Plymouth'] },
  { pais: 'NZ', rotulo: 'Port of Bluff', termos: ['Bluff'] },
  { pais: 'NZ', rotulo: 'Port of Marsden Point', termos: ['Marsden Point', 'Marsden'] },
  { pais: 'NZ', rotulo: 'Port Chalmers', termos: ['Port Chalmers', 'Chalmers'] },
  { pais: 'NZ', rotulo: 'Port of Gisborne', termos: ['Gisborne'] },
  // ─── OMÃ ───────────────────────────────────────────────────────────────────
  { pais: 'OM', rotulo: 'Port of Sohar', termos: ['Sohar'] },
  { pais: 'OM', rotulo: 'Port of Salalah', termos: ['Salalah'] },
  { pais: 'OM', rotulo: 'Port Sultan Qaboos', termos: ['Sultan Qaboos', 'Qaboos', 'Muscat'] },
  { pais: 'OM', rotulo: 'Port of Duqm', termos: ['Duqm'] },
  { pais: 'OM', rotulo: 'Port of Khasab', termos: ['Khasab'] },
  // ─── CATAR ─────────────────────────────────────────────────────────────────
  { pais: 'QA', rotulo: 'Port of Hamad', termos: ['Hamad'] },
  { pais: 'QA', rotulo: 'Port of Doha', termos: ['Doha'] },
  { pais: 'QA', rotulo: 'Port of Mesaieed', termos: ['Mesaieed', 'Umm Sa'] },
  { pais: 'QA', rotulo: 'Port of Ras Laffan', termos: ['Ras Laffan', 'Laffan'] },
  // ─── KUWAIT ────────────────────────────────────────────────────────────────
  { pais: 'KW', rotulo: 'Port of Shuwaikh', termos: ['Shuwaikh', 'Shuaikh'] },
  { pais: 'KW', rotulo: 'Port of Shuaiba', termos: ['Shuaiba'] },
  { pais: 'KW', rotulo: 'Port of Mina Al Ahmadi', termos: ['Ahmadi', 'Al Ahmadi'] },
  { pais: 'KW', rotulo: 'Port of Mina Abdullah', termos: ['Abdullah'] },
  // ─── BAHREIN ───────────────────────────────────────────────────────────────
  { pais: 'BH', rotulo: 'Khalifa Bin Salman Port', termos: ['Khalifa', 'Hidd'] },
  { pais: 'BH', rotulo: 'Mina Salman Port', termos: ['Salman', 'Manama'] },
  { pais: 'BH', rotulo: 'Sitra Port', termos: ['Sitra'] },
  // ─── IRAQUE ────────────────────────────────────────────────────────────────
  { pais: 'IQ', rotulo: 'Port of Umm Qasr', termos: ['Umm Qasr', 'Qasr'] },
  { pais: 'IQ', rotulo: 'Port of Khor Al Zubair', termos: ['Zubair', 'Zubayr'] },
  { pais: 'IQ', rotulo: 'Port of Basra', termos: ['Basra'] },
  { pais: 'IQ', rotulo: 'Port of Abu Flus', termos: ['Abu Flus', 'Flus'] },
  // ─── IÊMEN ─────────────────────────────────────────────────────────────────
  { pais: 'YE', rotulo: 'Port of Aden', termos: ['Aden'] },
  { pais: 'YE', rotulo: 'Port of Hodeidah', termos: ['Hodeidah', 'Hodeida', 'Hudaydah'] },
  { pais: 'YE', rotulo: 'Port of Mukalla', termos: ['Mukalla', 'Mukalla'] },
  { pais: 'YE', rotulo: 'Port of Mocha', termos: ['Mocha', 'Mukha'] },
  // ─── ISRAEL ────────────────────────────────────────────────────────────────
  { pais: 'IL', rotulo: 'Port of Haifa', termos: ['Haifa'] },
  { pais: 'IL', rotulo: 'Port of Ashdod', termos: ['Ashdod'] },
  { pais: 'IL', rotulo: 'Port of Eilat', termos: ['Eilat', 'Elat'] },
  { pais: 'IL', rotulo: 'Port of Hadera', termos: ['Hadera'] },
  // ─── LÍBANO ────────────────────────────────────────────────────────────────
  { pais: 'LB', rotulo: 'Port of Beirut', termos: ['Beirut'] },
  { pais: 'LB', rotulo: 'Port of Tripoli', termos: ['Tripoli'] },
  // ─── JORDÂNIA ──────────────────────────────────────────────────────────────
  { pais: 'JO', rotulo: 'Port of Aqaba', termos: ['Aqaba', 'Akaba'] },
  // ─── SÍRIA ─────────────────────────────────────────────────────────────────
  { pais: 'SY', rotulo: 'Port of Latakia', termos: ['Latakia', 'Lattakia'] },
  { pais: 'SY', rotulo: 'Port of Tartus', termos: ['Tartus', 'Tartous'] },
  // ─── PAPUA-NOVA GUINÉ ──────────────────────────────────────────────────────
  { pais: 'PG', rotulo: 'Port Moresby', termos: ['Moresby'] },
  { pais: 'PG', rotulo: 'Port of Lae', termos: ['Lae'] },
  { pais: 'PG', rotulo: 'Port of Madang', termos: ['Madang'] },
  { pais: 'PG', rotulo: 'Port of Rabaul', termos: ['Rabaul'] },
  // ─── FIJI ──────────────────────────────────────────────────────────────────
  { pais: 'FJ', rotulo: 'Port of Suva', termos: ['Suva'] },
  { pais: 'FJ', rotulo: 'Port of Lautoka', termos: ['Lautoka'] },
  // ─── SAMOA ─────────────────────────────────────────────────────────────────
  { pais: 'WS', rotulo: 'Port of Apia', termos: ['Apia'] },
  // ─── TONGA ─────────────────────────────────────────────────────────────────
  { pais: 'TO', rotulo: "Port of Nuku'alofa", termos: ["Nuku'alofa", 'Nukualofa'] },
  // ─── VANUATU ───────────────────────────────────────────────────────────────
  { pais: 'VU', rotulo: 'Port Vila', termos: ['Port Vila', 'Vila'] },
  { pais: 'VU', rotulo: 'Port of Luganville', termos: ['Luganville', 'Santo'] },
  // ─── NOVA CALEDÔNIA ────────────────────────────────────────────────────────
  { pais: 'NC', rotulo: 'Port of Nouméa', termos: ['Noumea', 'Nouméa'] },
  // ─── GUAM ──────────────────────────────────────────────────────────────────
  { pais: 'GU', rotulo: 'Port of Guam (Apra Harbor)', termos: ['Apra', 'Guam'] },
  // ─── POLINÉSIA FRANCESA ────────────────────────────────────────────────────
  { pais: 'PF', rotulo: 'Port of Papeete', termos: ['Papeete'] },
  // ─── MACAU ─────────────────────────────────────────────────────────────────
  { pais: 'MO', rotulo: 'Port of Macau', termos: ['Macau', 'Macao'] },
  // ─── GIBRALTAR ─────────────────────────────────────────────────────────────
  { pais: 'GI', rotulo: 'Port of Gibraltar', termos: ['Gibraltar'] },
  // ─── BERMUDAS ──────────────────────────────────────────────────────────────
  { pais: 'BM', rotulo: 'Port of Hamilton', termos: ['Hamilton'] },
  // ─── ILHAS CAYMAN ──────────────────────────────────────────────────────────
  { pais: 'KY', rotulo: 'Port George Town', termos: ['George Town', 'Georgetown'] },
  // ─── ILHAS VIRGENS AMERICANAS ──────────────────────────────────────────────
  { pais: 'VI', rotulo: 'Port of Charlotte Amalie', termos: ['Charlotte Amalie', 'Amalie'] },
  { pais: 'VI', rotulo: 'Port of Christiansted', termos: ['Christiansted'] },
  // ─── PORTO RICO ────────────────────────────────────────────────────────────
  { pais: 'PR', rotulo: 'Port of San Juan', termos: ['San Juan'] },
  { pais: 'PR', rotulo: 'Port of Ponce', termos: ['Ponce'] },
  { pais: 'PR', rotulo: 'Port of Mayagüez', termos: ['Mayaguez', 'Mayagüez'] },
  // ─── JERSEY ────────────────────────────────────────────────────────────────
  { pais: 'JE', rotulo: 'Port of St Helier', termos: ['Helier', 'St Helier'] },
  // ─── GUERNSEY ──────────────────────────────────────────────────────────────
  { pais: 'GG', rotulo: 'Port of St Peter Port', termos: ['Peter Port', 'St Peter'] },
  // ─── ILHAS FAROÉ ───────────────────────────────────────────────────────────
  { pais: 'FO', rotulo: 'Port of Tórshavn', termos: ['Torshavn', 'Tórshavn'] },
  // ─── ISLÂNDIA ──────────────────────────────────────────────────────────────
  { pais: 'IS', rotulo: 'Port of Reykjavik', termos: ['Reykjavik', 'Reykjavík'] },
  { pais: 'IS', rotulo: 'Port of Grundartangi', termos: ['Grundartangi'] },
  { pais: 'IS', rotulo: 'Port of Akureyri', termos: ['Akureyri'] },
  { pais: 'IS', rotulo: 'Port of Ísafjörður', termos: ['Isafjordur', 'Ísafjörður'] },
  { pais: 'IS', rotulo: 'Port of Seyðisfjörður', termos: ['Seydisfjordur', 'Seyðisfjörður'] },
  // ─── GROENLÂNDIA ───────────────────────────────────────────────────────────
  { pais: 'GL', rotulo: 'Port of Nuuk', termos: ['Nuuk', 'Godthaab'] },
  { pais: 'GL', rotulo: 'Port of Sisimiut', termos: ['Sisimiut', 'Holsteinsborg'] },
  { pais: 'GL', rotulo: 'Port of Ilulissat', termos: ['Ilulissat', 'Jakobshavn'] },
  // ─── SVALBARD ──────────────────────────────────────────────────────────────
  { pais: 'SJ', rotulo: 'Port of Longyearbyen', termos: ['Longyearbyen'] },
]
