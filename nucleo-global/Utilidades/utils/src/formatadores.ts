/**
 * @nucleo/utils — formatadores
 * Funções puras de formatação. Sem estado, sem efeitos colaterais, sem API calls.
 */

// ─── CPF ──────────────────────────────────────────────────────────────────────

/**
 * Formata uma string numérica em CPF: 000.000.000-00
 */
export function formatarCPF(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 3) return numeros
  if (numeros.length <= 6) return `${numeros.slice(0, 3)}.${numeros.slice(3)}`
  if (numeros.length <= 9) return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6)}`
  return `${numeros.slice(0, 3)}.${numeros.slice(3, 6)}.${numeros.slice(6, 9)}-${numeros.slice(9)}`
}

// ─── CNPJ ─────────────────────────────────────────────────────────────────────

/**
 * Formata uma string numérica em CNPJ: 00.000.000/0000-00
 */
export function formatarCNPJ(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 14)
  if (numeros.length <= 2) return numeros
  if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`
  if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`
  if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`
  return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12)}`
}

// ─── Telefone ─────────────────────────────────────────────────────────────────

/**
 * Formata telefone brasileiro: (00) 00000-0000 ou (00) 0000-0000
 */
export function formatarTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  if (numeros.length <= 2) return numeros.length === 0 ? '' : `(${numeros}`
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`
  if (numeros.length <= 10) return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`
}

// ─── Moeda ────────────────────────────────────────────────────────────────────

export interface FormatarMoedaOptions {
  /** Locale para formatação. Padrão: 'pt-BR' */
  locale?: string
  /** Moeda ISO 4217. Padrão: 'BRL' */
  moeda?: string
  /** Número de casas decimais. Padrão: 2 */
  casasDecimais?: number
}

/**
 * Formata um número como moeda.
 * @example formatarMoeda(1500.5) → 'R$ 1.500,50'
 */
export function formatarMoeda(valor: number, opcoes: FormatarMoedaOptions = {}): string {
  const { locale = 'pt-BR', moeda = 'BRL', casasDecimais = 2 } = opcoes
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor)
}

/**
 * Formata número com separadores de milhar.
 * @example formatarNumero(1500000.5) → '1.500.000,50'
 */
export function formatarNumero(valor: number, casasDecimais = 2, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor)
}

/**
 * Formata percentual.
 * @example formatarPercentual(0.1550) → '15,50%'
 */
export function formatarPercentual(valor: number, casasDecimais = 2, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais,
  }).format(valor)
}

// ─── Datas ────────────────────────────────────────────────────────────────────

export interface FormatarDataOptions {
  /** Locale para formatação. Padrão: 'pt-BR' */
  locale?: string
  /** Opções de formatação Intl.DateTimeFormat */
  intlOptions?: Intl.DateTimeFormatOptions
}

/**
 * Formata uma data no padrão DD/MM/YYYY.
 * @example formatarData(new Date('2024-03-15')) → '15/03/2024'
 */
export function formatarData(data: Date | string | number, opcoes: FormatarDataOptions = {}): string {
  const { locale = 'pt-BR' } = opcoes
  const dataObj = data instanceof Date ? data : new Date(data)
  if (isNaN(dataObj.getTime())) return '—'

  const intlOptions: Intl.DateTimeFormatOptions = opcoes.intlOptions ?? {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }

  return new Intl.DateTimeFormat(locale, intlOptions).format(dataObj)
}

/**
 * Formata data e hora: DD/MM/YYYY HH:mm
 */
export function formatarDataHora(data: Date | string | number, locale = 'pt-BR'): string {
  const dataObj = data instanceof Date ? data : new Date(data)
  if (isNaN(dataObj.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dataObj)
}

/**
 * Formata apenas a hora: HH:mm
 */
export function formatarHora(data: Date | string | number, locale = 'pt-BR'): string {
  const dataObj = data instanceof Date ? data : new Date(data)
  if (isNaN(dataObj.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dataObj)
}

/**
 * Formata data como mês e ano: mar. 2024
 */
export function formatarMesAno(data: Date | string | number, locale = 'pt-BR'): string {
  const dataObj = data instanceof Date ? data : new Date(data)
  if (isNaN(dataObj.getTime())) return '—'
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    year: 'numeric',
  }).format(dataObj)
}

/**
 * Retorna tempo relativo legível: 'há 3 horas', 'há 2 dias', etc.
 * Usa Intl.RelativeTimeFormat quando disponível.
 */
export function formatarTempoRelativo(data: Date | string | number, locale = 'pt-BR'): string {
  const dataObj = data instanceof Date ? data : new Date(data)
  if (isNaN(dataObj.getTime())) return '—'

  const agora = Date.now()
  const diffMs = dataObj.getTime() - agora
  const diffSeg = Math.round(diffMs / 1000)
  const diffMin = Math.round(diffSeg / 60)
  const diffHoras = Math.round(diffMin / 60)
  const diffDias = Math.round(diffHoras / 24)
  const diffSemanas = Math.round(diffDias / 7)
  const diffMeses = Math.round(diffDias / 30)
  const diffAnos = Math.round(diffDias / 365)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (Math.abs(diffSeg) < 60) return rtf.format(diffSeg, 'second')
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  if (Math.abs(diffHoras) < 24) return rtf.format(diffHoras, 'hour')
  if (Math.abs(diffDias) < 7) return rtf.format(diffDias, 'day')
  if (Math.abs(diffSemanas) < 4) return rtf.format(diffSemanas, 'week')
  if (Math.abs(diffMeses) < 12) return rtf.format(diffMeses, 'month')
  return rtf.format(diffAnos, 'year')
}

// ─── CEP ──────────────────────────────────────────────────────────────────────

/**
 * Formata CEP: 00000-000
 */
export function formatarCEP(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 8)
  if (numeros.length <= 5) return numeros
  return `${numeros.slice(0, 5)}-${numeros.slice(5)}`
}

// ─── Bytes ────────────────────────────────────────────────────────────────────

/**
 * Formata tamanho de arquivo: 1.5 MB, 400 KB, etc.
 */
export function formatarBytes(bytes: number, casas = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const unidades = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(casas))} ${unidades[i]}`
}
