/**
 * moedas-canonicas.ts — Lista canônica de moedas ISO 4217 / Siscomex.
 *
 * Fonte de dados pro `seed-moedas.ts` E pra qualquer teste que precise
 * validar a integridade da lista. Importável (módulo), diferentemente do
 * `seed-moedas.ts` que é um script com `process.exit`.
 *
 * Mapeamento aplicado pelo seed:
 *   - codigo_moeda  ← sigla     (alpha-3 ISO, ex: USD)
 *   - nome_moeda    ← descricao (ex: "Dólar dos Estados Unidos")
 *   - simbolo_moeda ← sigla     (símbolo = sigla pra todas)
 *   - ativo_moeda   ← true
 */

export interface MoedaCanonica {
  sigla: string
  descricao: string
}

export const MOEDAS_CANONICAS: MoedaCanonica[] = [
  // Ásia — Leste
  { sigla: 'USD', descricao: 'Dólar dos Estados Unidos' },
  { sigla: 'EUR', descricao: 'Euro' },
  { sigla: 'BRL', descricao: 'Real Brasileiro' },
  { sigla: 'CNY', descricao: 'Yuan Renminbi' },
  { sigla: 'CNH', descricao: 'Yuan Offshore (Hong Kong)' },
  { sigla: 'GBP', descricao: 'Libra Esterlina' },
  { sigla: 'JPY', descricao: 'Iene Japonês' },
  { sigla: 'CHF', descricao: 'Franco Suíço' },
  { sigla: 'AUD', descricao: 'Dólar Australiano' },
  { sigla: 'CAD', descricao: 'Dólar Canadense' },
  { sigla: 'KRW', descricao: 'Won Sul-Coreano' },
  { sigla: 'TWD', descricao: 'Novo Dólar de Taiwan' },
  { sigla: 'SGD', descricao: 'Dólar de Singapura' },
  { sigla: 'HKD', descricao: 'Dólar de Hong Kong' },
  { sigla: 'NZD', descricao: 'Dólar Neozelandês' },
  // Ásia — Sul e Sudeste
  { sigla: 'INR', descricao: 'Rúpia Indiana' },
  { sigla: 'PKR', descricao: 'Rúpia Paquistanesa' },
  { sigla: 'BDT', descricao: 'Taka de Bangladesh' },
  { sigla: 'LKR', descricao: 'Rúpia do Sri Lanka' },
  { sigla: 'NPR', descricao: 'Rúpia Nepalesa' },
  { sigla: 'MYR', descricao: 'Ringgit Malaio' },
  { sigla: 'IDR', descricao: 'Rúpia Indonésia' },
  { sigla: 'THB', descricao: 'Baht Tailandês' },
  { sigla: 'VND', descricao: 'Dong Vietnamita' },
  { sigla: 'PHP', descricao: 'Peso Filipino' },
  { sigla: 'KHR', descricao: 'Riel Cambojano' },
  { sigla: 'LAK', descricao: 'Kip Laosiano' },
  { sigla: 'MMK', descricao: 'Kyat de Mianmar' },
  { sigla: 'BND', descricao: 'Dólar de Brunei' },
  { sigla: 'MOP', descricao: 'Pataca de Macau' },
  // Ásia — Central
  { sigla: 'KZT', descricao: 'Tenge do Cazaquistão' },
  { sigla: 'UZS', descricao: 'Som do Uzbequistão' },
  { sigla: 'TJS', descricao: 'Somoni do Tajiquistão' },
  { sigla: 'TMT', descricao: 'Novo Manat do Turcomenistão' },
  { sigla: 'MNT', descricao: 'Tugrik Mongol' },
  { sigla: 'AFN', descricao: 'Afegane' },
  // Médio Oriente
  { sigla: 'SAR', descricao: 'Riyal Saudita' },
  { sigla: 'AED', descricao: 'Dirham dos Emirados Árabes' },
  { sigla: 'QAR', descricao: 'Riyal Catariano' },
  { sigla: 'OMR', descricao: 'Riyal de Omã' },
  { sigla: 'KWD', descricao: 'Dinar Kuwaitiano' },
  { sigla: 'BHD', descricao: 'Dinar do Bahrein' },
  { sigla: 'JOD', descricao: 'Dinar Jordaniano' },
  { sigla: 'IQD', descricao: 'Dinar Iraquiano' },
  { sigla: 'IRR', descricao: 'Rial Iraniano' },
  { sigla: 'YER', descricao: 'Rial Iemenita' },
  { sigla: 'ILS', descricao: 'Novo Shekel Israelense' },
  { sigla: 'LBP', descricao: 'Libra Libanesa' },
  { sigla: 'SYP', descricao: 'Libra Síria' },
  // Europa
  { sigla: 'SEK', descricao: 'Coroa Sueca' },
  { sigla: 'NOK', descricao: 'Coroa Norueguesa' },
  { sigla: 'DKK', descricao: 'Coroa Dinamarquesa' },
  { sigla: 'ISK', descricao: 'Coroa Islandesa' },
  { sigla: 'CZK', descricao: 'Coroa Tcheca' },
  { sigla: 'HUF', descricao: 'Florim Húngaro' },
  { sigla: 'PLN', descricao: 'Zlóti Polonês' },
  { sigla: 'RON', descricao: 'Leu Romeno' },
  { sigla: 'BGN', descricao: 'Lev Búlgaro' },
  { sigla: 'RSD', descricao: 'Dinar Sérvio' },
  { sigla: 'MKD', descricao: 'Dinar da Macedônia do Norte' },
  { sigla: 'ALL', descricao: 'Lek Albanês' },
  { sigla: 'MDL', descricao: 'Leu Moldavo' },
  { sigla: 'ANG', descricao: 'Florim das Antilhas Holandesas' },
  { sigla: 'UAH', descricao: 'Hryvnia Ucraniana' },
  { sigla: 'RUB', descricao: 'Rublo Russo' },
  { sigla: 'BYN', descricao: 'Rublo Bielorrusso' },
  { sigla: 'TRY', descricao: 'Lira Turca' },
  { sigla: 'GEL', descricao: 'Lari Georgiano' },
  { sigla: 'AMD', descricao: 'Dram Armênio' },
  // América do Sul
  { sigla: 'ARS', descricao: 'Peso Argentino' },
  { sigla: 'CLP', descricao: 'Peso Chileno' },
  { sigla: 'COP', descricao: 'Peso Colombiano' },
  { sigla: 'PEN', descricao: 'Sol Peruano' },
  { sigla: 'UYU', descricao: 'Peso Uruguaio' },
  { sigla: 'PYG', descricao: 'Guarani Paraguaio' },
  { sigla: 'BOB', descricao: 'Boliviano' },
  { sigla: 'VES', descricao: 'Bolívar Soberano Venezuelano' },
  { sigla: 'GYD', descricao: 'Dólar da Guiana' },
  { sigla: 'SRD', descricao: 'Dólar do Suriname' },
  // América Central e Caribe
  { sigla: 'MXN', descricao: 'Peso Mexicano' },
  { sigla: 'CRC', descricao: 'Colón Costarriquenho' },
  { sigla: 'DOP', descricao: 'Peso Dominicano' },
  { sigla: 'GTQ', descricao: 'Quetzal Guatemalteco' },
  { sigla: 'HNL', descricao: 'Lempira Hondurenha' },
  { sigla: 'HTG', descricao: 'Gourde Haitiano' },
  { sigla: 'TTD', descricao: 'Dólar de Trinidad e Tobago' },
  { sigla: 'JMD', descricao: 'Dólar Jamaicano' },
  { sigla: 'BSD', descricao: 'Dólar das Bahamas' },
  { sigla: 'BBD', descricao: 'Dólar de Barbados' },
  { sigla: 'KYD', descricao: 'Dólar das Ilhas Cayman' },
  { sigla: 'XCD', descricao: 'Dólar do Caribe Oriental' },
  { sigla: 'AWG', descricao: 'Florim de Aruba' },
  // África do Norte
  { sigla: 'EGP', descricao: 'Libra Egípcia' },
  { sigla: 'MAD', descricao: 'Dirham Marroquino' },
  { sigla: 'TND', descricao: 'Dinar Tunisiano' },
  { sigla: 'DZD', descricao: 'Dinar Argelino' },
  { sigla: 'LYD', descricao: 'Dinar Líbio' },
  { sigla: 'SSP', descricao: 'Libra Sul-Sudanesa' },
  // África Subsaariana
  { sigla: 'ZAR', descricao: 'Rand Sul-Africano' },
  { sigla: 'NGN', descricao: 'Naira Nigeriana' },
  { sigla: 'GHS', descricao: 'Cedi Ganense' },
  { sigla: 'KES', descricao: 'Xelim Queniano' },
  { sigla: 'UGX', descricao: 'Xelim Ugandense' },
  { sigla: 'SOS', descricao: 'Xelim Somali' },
  { sigla: 'AOA', descricao: 'Kwanza Angolano' },
  { sigla: 'MZN', descricao: 'Metical Moçambicano' },
  { sigla: 'BWP', descricao: 'Pula do Botsuana' },
  { sigla: 'ZMW', descricao: 'Kwacha Zambiano' },
  { sigla: 'MWK', descricao: 'Kwacha Malauiano' },
  { sigla: 'ERN', descricao: 'Nakfa Eritreu' },
  { sigla: 'ETB', descricao: 'Birr Etíope' },
  { sigla: 'SZL', descricao: 'Lilangeni da Essuatíni' },
  { sigla: 'LSL', descricao: 'Loti do Lesoto' },
  { sigla: 'NAD', descricao: 'Dólar da Namíbia' },
  { sigla: 'MUR', descricao: 'Rúpia Mauriciana' },
  { sigla: 'SCR', descricao: 'Rúpia das Seicheles' },
  { sigla: 'MGA', descricao: 'Ariary Malgaxe' },
  { sigla: 'CVE', descricao: 'Escudo Cabo-Verdiano' },
  { sigla: 'SLL', descricao: 'Leone Serra-Leonês' },
  { sigla: 'GMD', descricao: 'Dalasi Gambiano' },
  { sigla: 'BIF', descricao: 'Franco do Burundi' },
  { sigla: 'RWF', descricao: 'Franco Ruandês' },
  { sigla: 'CDF', descricao: 'Franco Congolês' },
  { sigla: 'KMF', descricao: 'Franco das Comores' },
  { sigla: 'DJF', descricao: 'Franco do Djibuti' },
  { sigla: 'GNF', descricao: 'Franco Guineense' },
  { sigla: 'STN', descricao: 'Dobra de São Tomé e Príncipe' },
  // África — Zona Franco CFA
  { sigla: 'XAF', descricao: 'Franco CFA da África Central' },
  { sigla: 'XOF', descricao: 'Franco CFA da África Ocidental' },
  // Oceania
  { sigla: 'PGK', descricao: 'Kina da Papua Nova Guiné' },
  { sigla: 'FJD', descricao: 'Dólar de Fiji' },
  { sigla: 'TOP', descricao: 'Paʻanga de Tonga' },
  { sigla: 'XPF', descricao: 'Franco CFP (Pacífico)' },
  // Especiais
  { sigla: 'XDR', descricao: 'Direito Especial de Saque (FMI)' },
]
