/**
 * dados.ts — Moedas ISO 4217 do Siscomex
 * Fonte: Portal Único Siscomex
 * Mantido centralizado aqui para uso em qualquer produto do ecossistema Gravity.
 */

export interface MoedaSiscomex {
  codigo: number
  sigla: string
  descricao: string
  nomeCampo: string
}

export const MOEDAS_SISCOMEX: MoedaSiscomex[] = [
  { codigo: 220, sigla: 'USD', descricao: 'Dólar dos Estados Unidos', nomeCampo: 'USD — Dólar Americano' },
  { codigo: 978, sigla: 'EUR', descricao: 'Euro',                      nomeCampo: 'EUR — Euro' },
  { codigo: 986, sigla: 'BRL', descricao: 'Real Brasileiro',           nomeCampo: 'BRL — Real' },
  { codigo: 156, sigla: 'CNY', descricao: 'Yuan Renminbi',             nomeCampo: 'CNY — Yuan Chinês' },
  { codigo: 826, sigla: 'GBP', descricao: 'Libra Esterlina',           nomeCampo: 'GBP — Libra Esterlina' },
  { codigo: 392, sigla: 'JPY', descricao: 'Iene Japonês',              nomeCampo: 'JPY — Iene Japonês' },
  { codigo: 756, sigla: 'CHF', descricao: 'Franco Suíço',              nomeCampo: 'CHF — Franco Suíço' },
  { codigo: 36,  sigla: 'AUD', descricao: 'Dólar Australiano',         nomeCampo: 'AUD — Dólar Australiano' },
  { codigo: 124, sigla: 'CAD', descricao: 'Dólar Canadense',           nomeCampo: 'CAD — Dólar Canadense' },
  { codigo: 32,  sigla: 'ARS', descricao: 'Peso Argentino',            nomeCampo: 'ARS — Peso Argentino' },
  { codigo: 152, sigla: 'CLP', descricao: 'Peso Chileno',              nomeCampo: 'CLP — Peso Chileno' },
  { codigo: 170, sigla: 'COP', descricao: 'Peso Colombiano',           nomeCampo: 'COP — Peso Colombiano' },
  { codigo: 484, sigla: 'MXN', descricao: 'Peso Mexicano',             nomeCampo: 'MXN — Peso Mexicano' },
  { codigo: 604, sigla: 'PEN', descricao: 'Sol Peruano',               nomeCampo: 'PEN — Sol Peruano' },
  { codigo: 858, sigla: 'UYU', descricao: 'Peso Uruguaio',             nomeCampo: 'UYU — Peso Uruguaio' },
  { codigo: 356, sigla: 'INR', descricao: 'Rúpia Indiana',             nomeCampo: 'INR — Rúpia Indiana' },
  { codigo: 410, sigla: 'KRW', descricao: 'Won Sul-Coreano',           nomeCampo: 'KRW — Won Coreano' },
  { codigo: 702, sigla: 'SGD', descricao: 'Dólar de Singapura',        nomeCampo: 'SGD — Dólar Singapura' },
  { codigo: 344, sigla: 'HKD', descricao: 'Dólar de Hong Kong',        nomeCampo: 'HKD — Dólar Hong Kong' },
  { codigo: 554, sigla: 'NZD', descricao: 'Dólar Neozelandês',         nomeCampo: 'NZD — Dólar Nova Zelândia' },
  { codigo: 752, sigla: 'SEK', descricao: 'Coroa Sueca',               nomeCampo: 'SEK — Coroa Sueca' },
  { codigo: 578, sigla: 'NOK', descricao: 'Coroa Norueguesa',          nomeCampo: 'NOK — Coroa Norueguesa' },
  { codigo: 208, sigla: 'DKK', descricao: 'Coroa Dinamarquesa',        nomeCampo: 'DKK — Coroa Dinamarquesa' },
  { codigo: 203, sigla: 'CZK', descricao: 'Coroa Tcheca',              nomeCampo: 'CZK — Coroa Tcheca' },
  { codigo: 348, sigla: 'HUF', descricao: 'Florim Húngaro',            nomeCampo: 'HUF — Florim Húngaro' },
  { codigo: 985, sigla: 'PLN', descricao: 'Zlóti Polonês',             nomeCampo: 'PLN — Zlóti Polonês' },
  { codigo: 643, sigla: 'RUB', descricao: 'Rublo Russo',               nomeCampo: 'RUB — Rublo Russo' },
  { codigo: 949, sigla: 'TRY', descricao: 'Lira Turca',                nomeCampo: 'TRY — Lira Turca' },
  { codigo: 710, sigla: 'ZAR', descricao: 'Rand Sul-Africano',         nomeCampo: 'ZAR — Rand Sul-Africano' },
  { codigo: 764, sigla: 'THB', descricao: 'Baht Tailandês',            nomeCampo: 'THB — Baht Tailandês' },
  { codigo: 458, sigla: 'MYR', descricao: 'Ringgit Malaio',            nomeCampo: 'MYR — Ringgit Malaio' },
  { codigo: 360, sigla: 'IDR', descricao: 'Rupia Indonésia',           nomeCampo: 'IDR — Rupia Indonésia' },
  { codigo: 704, sigla: 'VND', descricao: 'Dong Vietnamita',           nomeCampo: 'VND — Dong Vietnamita' },
  { codigo: 608, sigla: 'PHP', descricao: 'Peso Filipino',             nomeCampo: 'PHP — Peso Filipino' },
  { codigo: 414, sigla: 'KWD', descricao: 'Dinar Kuwaitiano',          nomeCampo: 'KWD — Dinar Kuwaitiano' },
  { codigo: 682, sigla: 'SAR', descricao: 'Riyal Saudita',             nomeCampo: 'SAR — Riyal Saudita' },
  { codigo: 784, sigla: 'AED', descricao: 'Dirham dos EAU',            nomeCampo: 'AED — Dirham EAU' },
  { codigo: 376, sigla: 'ILS', descricao: 'Novo Shekel Israelense',    nomeCampo: 'ILS — Shekel Israelense' },
  { codigo: 818, sigla: 'EGP', descricao: 'Libra Egípcia',             nomeCampo: 'EGP — Libra Egípcia' },
  { codigo: 566, sigla: 'NGN', descricao: 'Naira Nigeriana',           nomeCampo: 'NGN — Naira Nigeriana' },
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
