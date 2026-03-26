/**
 * @nucleo/utils — tipos
 * Definições de tipos compartilhados para os utilitários do nucleo-global.
 */

// ─── Formatação ───────────────────────────────────────────────────────────────

export interface FormatarMoedaOptions {
  /** Locale para formatação. Padrão: 'pt-BR' */
  locale?: string
  /** Moeda ISO 4217. Padrão: 'BRL' */
  moeda?: string
  /** Número de casas decimais. Padrão: 2 */
  casasDecimais?: number
}

export interface FormatarDataOptions {
  /** Locale para formatação. Padrão: 'pt-BR' */
  locale?: string
  /** Opções nativas de Intl.DateTimeFormat */
  intlOptions?: Intl.DateTimeFormatOptions
}

// ─── Máscaras ─────────────────────────────────────────────────────────────────

export type MascaraTipo = 'cpf' | 'cnpj' | 'telefone' | 'cep' | 'moeda' | 'numero' | 'custom'

export interface MascaraConfig {
  /** Tipo de máscara predefinida */
  tipo?: MascaraTipo
  /** Padrão customizado onde # = dígito. Ex: '##/##/####' */
  padrao?: string
  /** Prefixo fixo (ex: 'R$ ') */
  prefixo?: string
  /** Sufixo fixo (ex: '%') */
  sufixo?: string
  /** Número máximo de dígitos (antes de aplicar símbolos da máscara) */
  maxLen?: number
}

// ─── Validação ────────────────────────────────────────────────────────────────

export interface ValidarSenhaResultado {
  /** Se a senha atende aos requisitos mínimos */
  valida: boolean
  /** Lista de erros de validação */
  erros: string[]
  /** Força estimada da senha */
  forca: 'fraca' | 'media' | 'forte'
}

// ─── Utilitários gerais ───────────────────────────────────────────────────────

/** Chave-valor genérico para listas de opções */
export interface OpcaoSimples {
  valor: string | number
  rotulo: string
}

/** Intervalo de datas */
export interface IntervaloData {
  inicio: Date
  fim: Date
}

/** Resultado genérico de paginação */
export interface ResultadoPaginado<T> {
  dados: T[]
  total: number
  pagina: number
  itensPorPagina: number
  totalPaginas: number
}
