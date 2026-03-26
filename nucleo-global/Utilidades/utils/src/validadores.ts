/**
 * @nucleo/utils — validadores
 * Validações puras sem estado, sem API calls, sem regras de negócio específicas.
 */

// ─── CPF ──────────────────────────────────────────────────────────────────────

/**
 * Valida CPF (dígitos verificadores).
 * Aceita CPF com ou sem máscara.
 */
export function validarCPF(cpf: string): boolean {
  const numeros = cpf.replace(/\D/g, '')
  if (numeros.length !== 11) return false

  // Sequências inválidas
  if (/^(\d)\1+$/.test(numeros)) return false

  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(numeros[i]) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(numeros[9])) return false

  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(numeros[i]) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(numeros[10])
}

// ─── CNPJ ─────────────────────────────────────────────────────────────────────

/**
 * Valida CNPJ (dígitos verificadores).
 * Aceita CNPJ com ou sem máscara.
 */
export function validarCNPJ(cnpj: string): boolean {
  const numeros = cnpj.replace(/\D/g, '')
  if (numeros.length !== 14) return false
  if (/^(\d)\1+$/.test(numeros)) return false

  const calcularDigito = (base: string, pesos: number[]): number => {
    const soma = base.split('').reduce((acc, num, i) => acc + parseInt(num) * pesos[i], 0)
    const resto = soma % 11
    return resto < 2 ? 0 : 11 - resto
  }

  const pesos1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const pesos2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  const d1 = calcularDigito(numeros.slice(0, 12), pesos1)
  if (d1 !== parseInt(numeros[12])) return false

  const d2 = calcularDigito(numeros.slice(0, 13), pesos2)
  return d2 === parseInt(numeros[13])
}

// ─── Email ────────────────────────────────────────────────────────────────────

/**
 * Valida formato de email (RFC5322 simplificado).
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  return regex.test(email.trim())
}

// ─── Telefone ─────────────────────────────────────────────────────────────────

/**
 * Valida telefone brasileiro (com ou sem DDD, com ou sem máscara).
 * Aceita: (00) 0000-0000, (00) 00000-0000, 00000000000
 */
export function validarTelefone(telefone: string): boolean {
  const numeros = telefone.replace(/\D/g, '')
  return numeros.length === 10 || numeros.length === 11
}

// ─── CEP ──────────────────────────────────────────────────────────────────────

/**
 * Valida CEP brasileiro (8 dígitos, com ou sem máscara).
 */
export function validarCEP(cep: string): boolean {
  const numeros = cep.replace(/\D/g, '')
  return numeros.length === 8
}

// ─── URL ──────────────────────────────────────────────────────────────────────

/**
 * Valida URL com protocolo http ou https.
 */
export function validarURL(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

// ─── Senha ────────────────────────────────────────────────────────────────────

export interface ValidarSenhaResultado {
  valida: boolean
  erros: string[]
  forca: 'fraca' | 'media' | 'forte'
}

/**
 * Valida complexidade de senha.
 * Requisitos mínimos: 8 caracteres, maiúscula, minúscula, número.
 */
export function validarSenha(senha: string): ValidarSenhaResultado {
  const erros: string[] = []

  if (senha.length < 8) erros.push('Mínimo de 8 caracteres')
  if (!/[A-Z]/.test(senha)) erros.push('Pelo menos uma letra maiúscula')
  if (!/[a-z]/.test(senha)) erros.push('Pelo menos uma letra minúscula')
  if (!/[0-9]/.test(senha)) erros.push('Pelo menos um número')

  const valida = erros.length === 0
  const temEspecial = /[^A-Za-z0-9]/.test(senha)

  let forca: 'fraca' | 'media' | 'forte' = 'fraca'
  if (valida) {
    forca = temEspecial && senha.length >= 12 ? 'forte' : 'media'
  }

  return { valida, erros, forca }
}

// ─── Numérico ─────────────────────────────────────────────────────────────────

/**
 * Verifica se uma string representa um número válido.
 */
export function isNumero(valor: string): boolean {
  return !isNaN(Number(valor.replace(',', '.'))) && valor.trim() !== ''
}

/**
 * Verifica se um valor está dentro de um intervalo inclusivo.
 */
export function estaNoIntervalo(valor: number, min: number, max: number): boolean {
  return valor >= min && valor <= max
}

// ─── String ───────────────────────────────────────────────────────────────────

/**
 * Verifica se uma string não está vazia (ignora espaços).
 */
export function naoVazio(valor: string): boolean {
  return valor.trim().length > 0
}

/**
 * Verifica se uma string tem comprimento dentro do intervalo.
 */
export function comprimentoValido(valor: string, min: number, max: number): boolean {
  return valor.length >= min && valor.length <= max
}
