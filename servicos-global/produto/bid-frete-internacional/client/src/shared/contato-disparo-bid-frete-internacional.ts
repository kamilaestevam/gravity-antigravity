/**
 * Validação de contatos para preview de disparo (espelha regras do motor no servidor).
 */

export type FornecedorContatoDisparo = {
  id_fornecedor_bid_frete_internacional: string
  nome_fornecedor_bid_frete_internacional: string
  email_fornecedor_bid_frete_internacional?: string | null
  whatsapp_fornecedor_bid_frete_internacional?: string | null
}

export type CanalDisparoContato = 'EMAIL' | 'WHATSAPP'

export function emailValidoDisparoBidFrete(email: string | null | undefined): boolean {
  const normalizado = email?.trim().toLowerCase() ?? ''
  return normalizado.length > 0 && !normalizado.endsWith('@interno.gravity.local')
}

export function whatsappValidoDisparoBidFrete(whatsapp: string | null | undefined): boolean {
  const digits = whatsapp?.replace(/\D/g, '') ?? ''
  return digits.length >= 10
}

export function fornecedorTemEmailDisparo(fornecedor: FornecedorContatoDisparo): boolean {
  return emailValidoDisparoBidFrete(fornecedor.email_fornecedor_bid_frete_internacional)
}

export function fornecedorTemWhatsappDisparo(fornecedor: FornecedorContatoDisparo): boolean {
  return whatsappValidoDisparoBidFrete(fornecedor.whatsapp_fornecedor_bid_frete_internacional)
}

export function fornecedorAtendeCanalDisparo(
  fornecedor: FornecedorContatoDisparo,
  canal: CanalDisparoContato,
): boolean {
  return canal === 'EMAIL'
    ? fornecedorTemEmailDisparo(fornecedor)
    : fornecedorTemWhatsappDisparo(fornecedor)
}

export type AnaliseContatosDisparo = {
  total: number
  com_email: number
  sem_email: number
  com_whatsapp: number
  sem_whatsapp: number
  fornecedores_sem_email: FornecedorContatoDisparo[]
  fornecedores_sem_whatsapp: FornecedorContatoDisparo[]
}

/** Monta payload de e-mails por fornecedor apenas para IDs do disparo atual. */
export function montarEmailsPorFornecedorDisparoPayload(
  idsFornecedoresDisparo: string[],
  emailsPorFornecedor: Record<string, string[]>,
): Record<string, string[]> | undefined {
  const filtrado = Object.fromEntries(
    idsFornecedoresDisparo
      .map((id) => {
        const emails = (emailsPorFornecedor[id] ?? [])
          .map((email) => email.trim().toLowerCase())
          .filter(emailValidoDisparoBidFrete)
        return emails.length > 0 ? [id, [...new Set(emails)]] as const : null
      })
      .filter((entry): entry is readonly [string, string[]] => entry != null),
  )
  return Object.keys(filtrado).length > 0 ? filtrado : undefined
}

export function analisarContatosDisparoFornecedores(
  fornecedores: FornecedorContatoDisparo[],
): AnaliseContatosDisparo {
  const fornecedores_sem_email = fornecedores.filter(f => !fornecedorTemEmailDisparo(f))
  const fornecedores_sem_whatsapp = fornecedores.filter(f => !fornecedorTemWhatsappDisparo(f))
  return {
    total: fornecedores.length,
    com_email: fornecedores.length - fornecedores_sem_email.length,
    sem_email: fornecedores_sem_email.length,
    com_whatsapp: fornecedores.length - fornecedores_sem_whatsapp.length,
    sem_whatsapp: fornecedores_sem_whatsapp.length,
    fornecedores_sem_email,
    fornecedores_sem_whatsapp,
  }
}
