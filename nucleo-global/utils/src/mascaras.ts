/**
 * @nucleo/utils — mascaras
 * Funções puras de máscara para inputs. Sem estado, sem efeitos colaterais.
 * Uso: aplicar no evento onChange/onInput de um campo de formulário.
 */

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type MascaraTipo = 'cpf' | 'cnpj' | 'telefone' | 'cep' | 'moeda' | 'numero' | 'custom'

export interface MascaraConfig {
  /** Tipo de máscara predefinida */
  tipo?: MascaraTipo
  /** Padrão de máscara customizado. Ex: '###.###.###-##' onde # é dígito */
  padrao?: string
  /** Prefixo fixo (ex: 'R$ ') */
  prefixo?: string
  /** Sufixo fixo (ex: '%') */
  sufixo?: string
  /** Número máximo de caracteres (sem considerar símbolos da máscara) */
  maxLen?: number
}

// ─── Máscara genérica por padrão ─────────────────────────────────────────────

/**
 * Aplica uma máscara baseada em padrão, onde # representa qualquer dígito.
 * @example aplicarMascaraPadrao('12345678901', '###.###.###-##') → '123.456.789-01'
 */
export function aplicarMascaraPadrao(valor: string, padrao: string): string {
  const numeros = valor.replace(/\D/g, '')
  let resultado = ''
  let i = 0

  for (const char of padrao) {
    if (i >= numeros.length) break
    if (char === '#') {
      resultado += numeros[i]
      i++
    } else {
      resultado += char
    }
  }

  return resultado
}

// ─── Máscaras específicas ─────────────────────────────────────────────────────

/**
 * Máscara de CPF progressiva: ###.###.###-##
 */
export function mascaraCPF(valor: string): string {
  return aplicarMascaraPadrao(valor, '###.###.###-##')
}

/**
 * Máscara de CNPJ progressiva: ##.###.###/####-##
 */
export function mascaraCNPJ(valor: string): string {
  return aplicarMascaraPadrao(valor, '##.###.###/####-##')
}

/**
 * Máscara de telefone progressiva (detecta 8 ou 9 dígitos após DDD).
 * → (##) ####-#### ou (##) #####-####
 */
export function mascaraTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11)
  const padrao = numeros.length <= 10 ? '(##) ####-####' : '(##) #####-####'
  return aplicarMascaraPadrao(numeros, padrao)
}

/**
 * Máscara de CEP: #####-###
 */
export function mascaraCEP(valor: string): string {
  return aplicarMascaraPadrao(valor, '#####-###')
}

/**
 * Máscara de moeda brasileira progressiva.
 * @example mascaraMoeda('150050') → 'R$ 1.500,50'
 */
export function mascaraMoeda(valor: string): string {
  const numeros = valor.replace(/\D/g, '')
  if (!numeros || numeros === '0' || numeros === '00') return 'R$ 0,00'

  const inteiro = numeros.slice(0, -2) || '0'
  const decimal = numeros.slice(-2).padStart(2, '0')
  const inteiroFormatado = parseInt(inteiro, 10).toLocaleString('pt-BR')

  return `R$ ${inteiroFormatado},${decimal}`
}

/**
 * Máscara de número inteiro sem símbolo (apenas formatação de milhar).
 * @example mascaraNumeroInteiro('1500000') → '1.500.000'
 */
export function mascaraNumeroInteiro(valor: string): string {
  const numeros = valor.replace(/\D/g, '')
  if (!numeros) return ''
  return parseInt(numeros, 10).toLocaleString('pt-BR')
}

// ─── Remoção de máscara (unmask) ─────────────────────────────────────────────

/**
 * Remove todos os caracteres não numéricos de uma string mascarada.
 * @example unmaskNumeros('123.456.789-01') → '12345678901'
 */
export function unmaskNumeros(valor: string): string {
  return valor.replace(/\D/g, '')
}

/**
 * Extrai valor numérico de uma string de moeda formatada.
 * @example unmaskMoeda('R$ 1.500,50') → 1500.50
 */
export function unmaskMoeda(valor: string): number {
  const numeros = valor.replace(/\D/g, '')
  if (!numeros) return 0
  return parseInt(numeros, 10) / 100
}

// ─── Aplicador universal ──────────────────────────────────────────────────────

/**
 * Aplica qualquer máscara predefinida ou customizada via config.
 */
export function aplicarMascara(valor: string, config: MascaraConfig): string {
  let resultado = valor

  switch (config.tipo) {
    case 'cpf':
      resultado = mascaraCPF(valor)
      break
    case 'cnpj':
      resultado = mascaraCNPJ(valor)
      break
    case 'telefone':
      resultado = mascaraTelefone(valor)
      break
    case 'cep':
      resultado = mascaraCEP(valor)
      break
    case 'moeda':
      resultado = mascaraMoeda(valor)
      break
    case 'numero':
      resultado = mascaraNumeroInteiro(valor)
      break
    case 'custom':
      if (config.padrao) {
        resultado = aplicarMascaraPadrao(valor, config.padrao)
      }
      break
  }

  if (config.prefixo && !resultado.startsWith(config.prefixo)) {
    resultado = config.prefixo + resultado
  }
  if (config.sufixo && !resultado.endsWith(config.sufixo)) {
    resultado = resultado + config.sufixo
  }

  return resultado
}
