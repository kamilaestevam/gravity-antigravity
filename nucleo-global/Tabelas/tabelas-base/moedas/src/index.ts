/**
 * @nucleo/tabelas-base-moedas
 * Moedas ISO 4217 do Siscomex — fonte única de verdade para todo o ecossistema Gravity.
 * Fonte: Portal Único Siscomex / BACEN (~110 moedas ativas)
 */

export interface MoedaSiscomex {
  codigo: number
  sigla: string
  descricao: string
  nomeCampo: string
}

export const MOEDAS_SISCOMEX: MoedaSiscomex[] = [
  // ── Ásia — Leste ────────────────────────────────────────────────────────────
  { codigo: 220, sigla: 'USD', descricao: 'Dólar dos Estados Unidos',    nomeCampo: 'USD — Dólar Americano' },
  { codigo: 978, sigla: 'EUR', descricao: 'Euro',                        nomeCampo: 'EUR — Euro' },
  { codigo: 790, sigla: 'BRL', descricao: 'Real Brasileiro',             nomeCampo: 'BRL — Real' },
  { codigo: 795, sigla: 'CNY', descricao: 'Yuan Renminbi',               nomeCampo: 'CNY — Yuan Chinês' },
  { codigo: 796, sigla: 'CNH', descricao: 'Yuan Offshore (Hong Kong)',   nomeCampo: 'CNH — Yuan Offshore' },
  { codigo: 540, sigla: 'GBP', descricao: 'Libra Esterlina',             nomeCampo: 'GBP — Libra Esterlina' },
  { codigo: 470, sigla: 'JPY', descricao: 'Iene Japonês',                nomeCampo: 'JPY — Iene Japonês' },
  { codigo: 425, sigla: 'CHF', descricao: 'Franco Suíço',                nomeCampo: 'CHF — Franco Suíço' },
  { codigo: 150, sigla: 'AUD', descricao: 'Dólar Australiano',           nomeCampo: 'AUD — Dólar Australiano' },
  { codigo: 165, sigla: 'CAD', descricao: 'Dólar Canadense',             nomeCampo: 'CAD — Dólar Canadense' },
  { codigo: 930, sigla: 'KRW', descricao: 'Won Sul-Coreano',             nomeCampo: 'KRW — Won Coreano' },
  { codigo: 640, sigla: 'TWD', descricao: 'Novo Dólar de Taiwan',        nomeCampo: 'TWD — Dólar Taiwan' },
  { codigo: 195, sigla: 'SGD', descricao: 'Dólar de Singapura',          nomeCampo: 'SGD — Dólar Singapura' },
  { codigo: 205, sigla: 'HKD', descricao: 'Dólar de Hong Kong',          nomeCampo: 'HKD — Dólar Hong Kong' },
  { codigo: 245, sigla: 'NZD', descricao: 'Dólar Neozelandês',           nomeCampo: 'NZD — Dólar Nova Zelândia' },
  // ── Ásia — Sul e Sudeste ────────────────────────────────────────────────────
  { codigo: 860, sigla: 'INR', descricao: 'Rúpia Indiana',               nomeCampo: 'INR — Rúpia Indiana' },
  { codigo: 875, sigla: 'PKR', descricao: 'Rúpia Paquistanesa',          nomeCampo: 'PKR — Rúpia Paquistanesa' },
  { codigo: 905, sigla: 'BDT', descricao: 'Taka de Bangladesh',          nomeCampo: 'BDT — Taka Bangladesh' },
  { codigo: 855, sigla: 'LKR', descricao: 'Rúpia do Sri Lanka',          nomeCampo: 'LKR — Rúpia Sri Lanka' },
  { codigo: 845, sigla: 'NPR', descricao: 'Rúpia Nepalesa',              nomeCampo: 'NPR — Rúpia Nepal' },
  { codigo: 828, sigla: 'MYR', descricao: 'Ringgit Malaio',              nomeCampo: 'MYR — Ringgit Malaio' },
  { codigo: 865, sigla: 'IDR', descricao: 'Rúpia Indonésia',             nomeCampo: 'IDR — Rúpia Indonésia' },
  { codigo: 15,  sigla: 'THB', descricao: 'Baht Tailandês',              nomeCampo: 'THB — Baht Tailandês' },
  { codigo: 260, sigla: 'VND', descricao: 'Dong Vietnamita',             nomeCampo: 'VND — Dong Vietnamita' },
  { codigo: 735, sigla: 'PHP', descricao: 'Peso Filipino',               nomeCampo: 'PHP — Peso Filipino' },
  { codigo: 825, sigla: 'KHR', descricao: 'Riel Cambojano',              nomeCampo: 'KHR — Riel Camboja' },
  { codigo: 780, sigla: 'LAK', descricao: 'Kip Laosiano',                nomeCampo: 'LAK — Kip Laos' },
  { codigo: 775, sigla: 'MMK', descricao: 'Kyat de Mianmar',             nomeCampo: 'MMK — Kyat Mianmar' },
  { codigo: 185, sigla: 'BND', descricao: 'Dólar de Brunei',             nomeCampo: 'BND — Dólar Brunei' },
  { codigo: 685, sigla: 'MOP', descricao: 'Pataca de Macau',             nomeCampo: 'MOP — Pataca Macau' },
  // ── Ásia — Central ─────────────────────────────────────────────────────────
  { codigo: 913, sigla: 'KZT', descricao: 'Tenge do Cazaquistão',        nomeCampo: 'KZT — Tenge Cazaquistão' },
  { codigo: 893, sigla: 'UZS', descricao: 'Som do Uzbequistão',          nomeCampo: 'UZS — Som Uzbequistão' },
  { codigo: 835, sigla: 'TJS', descricao: 'Somoni do Tajiquistão',       nomeCampo: 'TJS — Somoni Tajiquistão' },
  { codigo: 608, sigla: 'TMT', descricao: 'Novo Manat do Turcomenistão', nomeCampo: 'TMT — Manat Turcomenistão' },
  { codigo: 915, sigla: 'MNT', descricao: 'Tugrik Mongol',               nomeCampo: 'MNT — Tugrik Mongólia' },
  { codigo: 5,   sigla: 'AFN', descricao: 'Afegane',                     nomeCampo: 'AFN — Afegane Afeganistão' },
  // ── Médio Oriente ───────────────────────────────────────────────────────────
  { codigo: 820, sigla: 'SAR', descricao: 'Riyal Saudita',               nomeCampo: 'SAR — Riyal Saudita' },
  { codigo: 145, sigla: 'AED', descricao: 'Dirham dos Emirados Árabes',  nomeCampo: 'AED — Dirham EAU' },
  { codigo: 800, sigla: 'QAR', descricao: 'Riyal Catariano',             nomeCampo: 'QAR — Riyal Catar' },
  { codigo: 805, sigla: 'OMR', descricao: 'Riyal de Omã',                nomeCampo: 'OMR — Riyal Omã' },
  { codigo: 100, sigla: 'KWD', descricao: 'Dinar Kuwaitiano',            nomeCampo: 'KWD — Dinar Kuwaitiano' },
  { codigo: 105, sigla: 'BHD', descricao: 'Dinar do Bahrein',            nomeCampo: 'BHD — Dinar Bahrein' },
  { codigo: 125, sigla: 'JOD', descricao: 'Dinar Jordaniano',            nomeCampo: 'JOD — Dinar Jordânia' },
  { codigo: 115, sigla: 'IQD', descricao: 'Dinar Iraquiano',             nomeCampo: 'IQD — Dinar Iraque' },
  { codigo: 815, sigla: 'IRR', descricao: 'Rial Iraniano',               nomeCampo: 'IRR — Rial Irã' },
  { codigo: 810, sigla: 'YER', descricao: 'Rial Iemenita',               nomeCampo: 'YER — Rial Iêmen' },
  { codigo: 880, sigla: 'ILS', descricao: 'Novo Shekel Israelense',      nomeCampo: 'ILS — Shekel Israel' },
  { codigo: 560, sigla: 'LBP', descricao: 'Libra Libanesa',              nomeCampo: 'LBP — Libra Libanesa' },
  { codigo: 575, sigla: 'SYP', descricao: 'Libra Síria',                 nomeCampo: 'SYP — Libra Síria' },
  // ── Europa ──────────────────────────────────────────────────────────────────
  { codigo: 70,  sigla: 'SEK', descricao: 'Coroa Sueca',                 nomeCampo: 'SEK — Coroa Sueca' },
  { codigo: 65,  sigla: 'NOK', descricao: 'Coroa Norueguesa',            nomeCampo: 'NOK — Coroa Norueguesa' },
  { codigo: 55,  sigla: 'DKK', descricao: 'Coroa Dinamarquesa',          nomeCampo: 'DKK — Coroa Dinamarquesa' },
  { codigo: 60,  sigla: 'ISK', descricao: 'Coroa Islandesa',             nomeCampo: 'ISK — Coroa Islandesa' },
  { codigo: 75,  sigla: 'CZK', descricao: 'Coroa Tcheca',                nomeCampo: 'CZK — Coroa Tcheca' },
  { codigo: 345, sigla: 'HUF', descricao: 'Florim Húngaro',              nomeCampo: 'HUF — Florim Húngaro' },
  { codigo: 975, sigla: 'PLN', descricao: 'Zlóti Polonês',               nomeCampo: 'PLN — Zlóti Polonês' },
  { codigo: 506, sigla: 'RON', descricao: 'Leu Romeno',                  nomeCampo: 'RON — Leu Romênia' },
  { codigo: 510, sigla: 'BGN', descricao: 'Lev Búlgaro',                 nomeCampo: 'BGN — Lev Bulgária' },
  { codigo: 133, sigla: 'RSD', descricao: 'Dinar Sérvio',                nomeCampo: 'RSD — Dinar Sérvia' },
  { codigo: 132, sigla: 'MKD', descricao: 'Dinar da Macedônia do Norte', nomeCampo: 'MKD — Dinar Macedônia' },
  { codigo: 490, sigla: 'ALL', descricao: 'Lek Albanês',                 nomeCampo: 'ALL — Lek Albânia' },
  { codigo: 503, sigla: 'MDL', descricao: 'Leu Moldavo',                 nomeCampo: 'MDL — Leu Moldávia' },
  { codigo: 325, sigla: 'ANG', descricao: 'Florim das Antilhas Holandesas', nomeCampo: 'ANG — Florim Antilhas' },
  { codigo: 460, sigla: 'UAH', descricao: 'Hryvnia Ucraniana',           nomeCampo: 'UAH — Hryvnia Ucrânia' },
  { codigo: 830, sigla: 'RUB', descricao: 'Rublo Russo',                 nomeCampo: 'RUB — Rublo Rússia' },
  { codigo: 829, sigla: 'BYN', descricao: 'Rublo Bielorrusso',           nomeCampo: 'BYN — Rublo Belarus' },
  { codigo: 642, sigla: 'TRY', descricao: 'Lira Turca',                  nomeCampo: 'TRY — Lira Turca' },
  { codigo: 482, sigla: 'GEL', descricao: 'Lari Georgiano',              nomeCampo: 'GEL — Lari Geórgia' },
  { codigo: 275, sigla: 'AMD', descricao: 'Dram Armênio',                nomeCampo: 'AMD — Dram Armênia' },
  // ── América do Sul ──────────────────────────────────────────────────────────
  { codigo: 706, sigla: 'ARS', descricao: 'Peso Argentino',              nomeCampo: 'ARS — Peso Argentino' },
  { codigo: 715, sigla: 'CLP', descricao: 'Peso Chileno',                nomeCampo: 'CLP — Peso Chileno' },
  { codigo: 720, sigla: 'COP', descricao: 'Peso Colombiano',             nomeCampo: 'COP — Peso Colombiano' },
  { codigo: 660, sigla: 'PEN', descricao: 'Sol Peruano',                 nomeCampo: 'PEN — Sol Peruano' },
  { codigo: 745, sigla: 'UYU', descricao: 'Peso Uruguaio',               nomeCampo: 'UYU — Peso Uruguaio' },
  { codigo: 450, sigla: 'PYG', descricao: 'Guarani Paraguaio',           nomeCampo: 'PYG — Guarani Paraguai' },
  { codigo: 30,  sigla: 'BOB', descricao: 'Boliviano',                   nomeCampo: 'BOB — Boliviano Bolívia' },
  { codigo: 27,  sigla: 'VES', descricao: 'Bolívar Soberano Venezuelano', nomeCampo: 'VES — Bolívar Venezuela' },
  { codigo: 170, sigla: 'GYD', descricao: 'Dólar da Guiana',             nomeCampo: 'GYD — Dólar Guiana' },
  { codigo: 255, sigla: 'SRD', descricao: 'Dólar do Suriname',           nomeCampo: 'SRD — Dólar Suriname' },
  // ── América Central e Caribe ────────────────────────────────────────────────
  { codigo: 741, sigla: 'MXN', descricao: 'Peso Mexicano',               nomeCampo: 'MXN — Peso Mexicano' },
  { codigo: 40,  sigla: 'CRC', descricao: 'Colón Costarriquenho',        nomeCampo: 'CRC — Colón Costa Rica' },
  { codigo: 730, sigla: 'DOP', descricao: 'Peso Dominicano',             nomeCampo: 'DOP — Peso Rep. Dominicana' },
  { codigo: 770, sigla: 'GTQ', descricao: 'Quetzal Guatemalteco',        nomeCampo: 'GTQ — Quetzal Guatemala' },
  { codigo: 495, sigla: 'HNL', descricao: 'Lempira Hondurenha',          nomeCampo: 'HNL — Lempira Honduras' },
  { codigo: 440, sigla: 'HTG', descricao: 'Gourde Haitiano',             nomeCampo: 'HTG — Gourde Haiti' },
  { codigo: 210, sigla: 'TTD', descricao: 'Dólar de Trinidad e Tobago',  nomeCampo: 'TTD — Dólar Trinidad' },
  { codigo: 230, sigla: 'JMD', descricao: 'Dólar Jamaicano',             nomeCampo: 'JMD — Dólar Jamaica' },
  { codigo: 155, sigla: 'BSD', descricao: 'Dólar das Bahamas',           nomeCampo: 'BSD — Dólar Bahamas' },
  { codigo: 175, sigla: 'BBD', descricao: 'Dólar de Barbados',           nomeCampo: 'BBD — Dólar Barbados' },
  { codigo: 190, sigla: 'KYD', descricao: 'Dólar das Ilhas Cayman',      nomeCampo: 'KYD — Dólar Cayman' },
  { codigo: 215, sigla: 'XCD', descricao: 'Dólar do Caribe Oriental',    nomeCampo: 'XCD — Dólar Caribe Oriental' },
  { codigo: 328, sigla: 'AWG', descricao: 'Florim de Aruba',             nomeCampo: 'AWG — Florim Aruba' },
  // ── África do Norte ─────────────────────────────────────────────────────────
  { codigo: 535, sigla: 'EGP', descricao: 'Libra Egípcia',               nomeCampo: 'EGP — Libra Egípcia' },
  { codigo: 139, sigla: 'MAD', descricao: 'Dirham Marroquino',           nomeCampo: 'MAD — Dirham Marrocos' },
  { codigo: 135, sigla: 'TND', descricao: 'Dinar Tunisiano',             nomeCampo: 'TND — Dinar Tunísia' },
  { codigo: 95,  sigla: 'DZD', descricao: 'Dinar Argelino',              nomeCampo: 'DZD — Dinar Argélia' },
  { codigo: 130, sigla: 'LYD', descricao: 'Dinar Líbio',                 nomeCampo: 'LYD — Dinar Líbia' },
  { codigo: 136, sigla: 'SSP', descricao: 'Libra Sul-Sudanesa',          nomeCampo: 'SSP — Libra Sudão do Sul' },
  // ── África Subsaariana ──────────────────────────────────────────────────────
  { codigo: 785, sigla: 'ZAR', descricao: 'Rand Sul-Africano',           nomeCampo: 'ZAR — Rand Sul-Africano' },
  { codigo: 630, sigla: 'NGN', descricao: 'Naira Nigeriana',             nomeCampo: 'NGN — Naira Nigéria' },
  { codigo: 35,  sigla: 'GHS', descricao: 'Cedi Ganense',                nomeCampo: 'GHS — Cedi Gana' },
  { codigo: 950, sigla: 'KES', descricao: 'Xelim Queniano',              nomeCampo: 'KES — Xelim Quênia' },
  { codigo: 955, sigla: 'UGX', descricao: 'Xelim Ugandense',             nomeCampo: 'UGX — Xelim Uganda' },
  { codigo: 960, sigla: 'SOS', descricao: 'Xelim Somali',                nomeCampo: 'SOS — Xelim Somália' },
  { codigo: 635, sigla: 'AOA', descricao: 'Kwanza Angolano',             nomeCampo: 'AOA — Kwanza Angola' },
  { codigo: 622, sigla: 'MZN', descricao: 'Metical Moçambicano',         nomeCampo: 'MZN — Metical Moçambique' },
  { codigo: 755, sigla: 'BWP', descricao: 'Pula do Botsuana',            nomeCampo: 'BWP — Pula Botsuana' },
  { codigo: 766, sigla: 'ZMW', descricao: 'Kwacha Zambiano',             nomeCampo: 'ZMW — Kwacha Zâmbia' },
  { codigo: 760, sigla: 'MWK', descricao: 'Kwacha Malauiano',            nomeCampo: 'MWK — Kwacha Malaui' },
  { codigo: 625, sigla: 'ERN', descricao: 'Nakfa Eritreu',               nomeCampo: 'ERN — Nakfa Eritreia' },
  { codigo: 9,   sigla: 'ETB', descricao: 'Birr Etíope',                 nomeCampo: 'ETB — Birr Etiópia' },
  { codigo: 585, sigla: 'SZL', descricao: 'Lilangeni da Essuatíni',      nomeCampo: 'SZL — Lilangeni Essuatíni' },
  { codigo: 603, sigla: 'LSL', descricao: 'Loti do Lesoto',              nomeCampo: 'LSL — Loti Lesoto' },
  { codigo: 173, sigla: 'NAD', descricao: 'Dólar da Namíbia',            nomeCampo: 'NAD — Dólar Namíbia' },
  { codigo: 840, sigla: 'MUR', descricao: 'Rúpia Mauriciana',            nomeCampo: 'MUR — Rúpia Maurício' },
  { codigo: 850, sigla: 'SCR', descricao: 'Rúpia das Seicheles',         nomeCampo: 'SCR — Rúpia Seicheles' },
  { codigo: 406, sigla: 'MGA', descricao: 'Ariary Malgaxe',              nomeCampo: 'MGA — Ariary Madagascar' },
  { codigo: 295, sigla: 'CVE', descricao: 'Escudo Cabo-Verdiano',        nomeCampo: 'CVE — Escudo Cabo Verde' },
  { codigo: 500, sigla: 'SLL', descricao: 'Leone Serra-Leonês',          nomeCampo: 'SLL — Leone Serra Leoa' },
  { codigo: 90,  sigla: 'GMD', descricao: 'Dalasi Gambiano',             nomeCampo: 'GMD — Dalasi Gâmbia' },
  { codigo: 365, sigla: 'BIF', descricao: 'Franco do Burundi',           nomeCampo: 'BIF — Franco Burundi' },
  { codigo: 420, sigla: 'RWF', descricao: 'Franco Ruandês',              nomeCampo: 'RWF — Franco Ruanda' },
  { codigo: 363, sigla: 'CDF', descricao: 'Franco Congolês',             nomeCampo: 'CDF — Franco Congo' },
  { codigo: 368, sigla: 'KMF', descricao: 'Franco das Comores',          nomeCampo: 'KMF — Franco Comores' },
  { codigo: 390, sigla: 'DJF', descricao: 'Franco do Djibuti',           nomeCampo: 'DJF — Franco Djibuti' },
  { codigo: 398, sigla: 'GNF', descricao: 'Franco Guineense',            nomeCampo: 'GNF — Franco Guiné' },
  { codigo: 148, sigla: 'STN', descricao: 'Dobra de São Tomé e Príncipe', nomeCampo: 'STN — Dobra São Tomé' },
  // ── África — Zona Franco CFA ────────────────────────────────────────────────
  { codigo: 370, sigla: 'XAF', descricao: 'Franco CFA da África Central', nomeCampo: 'XAF — Franco CFA Central' },
  { codigo: 372, sigla: 'XOF', descricao: 'Franco CFA da África Ocidental', nomeCampo: 'XOF — Franco CFA Ocidental' },
  // ── Oceania ─────────────────────────────────────────────────────────────────
  { codigo: 778, sigla: 'PGK', descricao: 'Kina da Papua Nova Guiné',    nomeCampo: 'PGK — Kina Papua' },
  { codigo: 200, sigla: 'FJD', descricao: 'Dólar de Fiji',               nomeCampo: 'FJD — Dólar Fiji' },
  { codigo: 680, sigla: 'TOP', descricao: 'Paʻanga de Tonga',            nomeCampo: 'TOP — Paʻanga Tonga' },
  { codigo: 380, sigla: 'XPF', descricao: 'Franco CFP (Pacífico)',       nomeCampo: 'XPF — Franco CFP Pacífico' },
  // ── Especiais ───────────────────────────────────────────────────────────────
  { codigo: 138, sigla: 'XDR', descricao: 'Direito Especial de Saque (FMI)', nomeCampo: 'XDR — DES FMI' },
]

/** Para uso em SelectGlobal — rotulo = sigla (compacto no gatilho), descricao = nome completo (visível na lista) */
export const OPCOES_MOEDA = MOEDAS_SISCOMEX.map(m => ({
  valor: m.sigla,
  rotulo: m.sigla,
  descricao: m.descricao,
}))

/** Subconjunto de moedas mais usadas em COMEX */
export const MOEDAS_PRINCIPAIS = MOEDAS_SISCOMEX.filter(m =>
  ['USD', 'EUR', 'BRL', 'CNY', 'GBP', 'JPY'].includes(m.sigla)
)
